"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

const DRAG_THRESHOLD_PX = 4;

interface Options {
  posX: number;
  posY: number;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onMove: (posX: number, posY: number) => void;
  onMoveEnd: (posX: number, posY: number) => void;
  onTap: () => void;
  disabled?: boolean;
}

function clampPct(v: number) {
  return Math.max(0, Math.min(100, v));
}

/** 포인터 드래그 + 탭(클릭) 구분 — 이동 거리가 미미하면 탭으로 처리(재편집 팝오버 트리거) */
export function useDraggableNote({
  posX,
  posY,
  canvasRef,
  onMove,
  onMoveEnd,
  onTap,
  disabled,
}: Options) {
  const dragState = useRef<{
    dragging: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    rectW: number;
    rectH: number;
  } | null>(null);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (disabled) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = {
      dragging: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      baseX: posX,
      baseY: posY,
      rectW: rect.width,
      rectH: rect.height,
    };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const st = dragState.current;
    if (!st?.dragging) return;
    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) {
      st.moved = true;
    }
    const nextX = clampPct(st.baseX + (dx / st.rectW) * 100);
    const nextY = clampPct(st.baseY + (dy / st.rectH) * 100);
    onMove(nextX, nextY);
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const st = dragState.current;
    if (!st?.dragging) return;
    st.dragging = false;
    if (st.moved) {
      const dx = e.clientX - st.startX;
      const dy = e.clientY - st.startY;
      const nextX = clampPct(st.baseX + (dx / st.rectW) * 100);
      const nextY = clampPct(st.baseY + (dy / st.rectH) * 100);
      onMoveEnd(nextX, nextY);
    } else if (!disabled) {
      onTap();
    }
  }

  return { onPointerDown, onPointerMove, onPointerUp };
}
