"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

const MIN_SCALE = 0.3; // 글씨까지 같이 줄어드는 최소 배율 — 8장을 넣으려고 많이 줄여도 계속 줄어들게
const MAX_SCALE = 2.2;
const PX_PER_SCALE_STEP = 120; // 대각선 120px 드래그 = scale 1.0 변화

interface Options {
  scale: number;
  onResize: (scale: number) => void;
  onResizeEnd: (scale: number) => void;
  disabled?: boolean;
}

function clampScale(v: number) {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, v));
}

/** 메모 카드 네 꼭짓점 핸들 — 바깥쪽 대각선으로 끌면 커지고 안쪽으로 끌면 작아진다(우하단 기준을 모든 모서리에 동일 적용) */
export function useResizableNote({ scale, onResize, onResizeEnd, disabled }: Options) {
  // sx/sy: 모서리 방향 부호 — 우하단(1,1), 우상단(1,-1), 좌하단(-1,1), 좌상단(-1,-1)
  const dragState = useRef<{ startX: number; startY: number; baseScale: number; sx: number; sy: number } | null>(null);

  function onPointerDown(e: ReactPointerEvent<HTMLElement>, sx = 1, sy = 1) {
    if (disabled) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, baseScale: scale, sx, sy };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLElement>) {
    const st = dragState.current;
    if (!st) return;
    e.stopPropagation();
    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;
    const delta = (st.sx * dx + st.sy * dy) / 2; // 모서리 방향 기준 대각선 평균
    onResize(clampScale(st.baseScale + delta / PX_PER_SCALE_STEP));
  }

  function onPointerUp(e: ReactPointerEvent<HTMLElement>) {
    const st = dragState.current;
    if (!st) return;
    e.stopPropagation();
    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;
    const delta = (st.sx * dx + st.sy * dy) / 2;
    onResizeEnd(clampScale(st.baseScale + delta / PX_PER_SCALE_STEP));
    dragState.current = null;
  }

  return { onPointerDown, onPointerMove, onPointerUp };
}
