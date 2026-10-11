"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

const MIN_SCALE = 0.6;
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

/** 메모 카드 우하단 꼭짓점 핸들 — 대각선 드래그 거리로 scale 조절 */
export function useResizableNote({ scale, onResize, onResizeEnd, disabled }: Options) {
  const dragState = useRef<{ startX: number; startY: number; baseScale: number } | null>(null);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (disabled) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, baseScale: scale };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const st = dragState.current;
    if (!st) return;
    e.stopPropagation();
    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;
    const delta = (dx + dy) / 2; // 대각선(우하단) 방향 평균
    onResize(clampScale(st.baseScale + delta / PX_PER_SCALE_STEP));
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const st = dragState.current;
    if (!st) return;
    e.stopPropagation();
    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;
    const delta = (dx + dy) / 2;
    onResizeEnd(clampScale(st.baseScale + delta / PX_PER_SCALE_STEP));
    dragState.current = null;
  }

  return { onPointerDown, onPointerMove, onPointerUp };
}
