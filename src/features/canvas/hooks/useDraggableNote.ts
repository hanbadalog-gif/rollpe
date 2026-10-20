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
  /** 메모가 머물 수 있는 영역(캔버스 대비 %) — 있으면 메모 전체가 이 안에 있도록 제한 (무드등 검정 판 안쪽) */
  bounds?: { right: number; bottom: number };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
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
  bounds,
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
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } | null>(null);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (disabled) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    // 회전·확대로 커진 실제 외곽(bbox)이 영역을 넘지 않도록, 현재 left/top 기준 여유폭을 계산
    let minX = 0, maxX = 100, minY = 0, maxY = 100;
    if (bounds) {
      const box = e.currentTarget.getBoundingClientRect();
      const offX = ((box.left - rect.left) / rect.width) * 100 - posX;
      const offY = ((box.top - rect.top) / rect.height) * 100 - posY;
      minX = -offX;
      minY = -offY;
      maxX = bounds.right - offX - (box.width / rect.width) * 100;
      maxY = bounds.bottom - offY - (box.height / rect.height) * 100;
    }
    dragState.current = {
      minX, maxX: Math.max(minX, maxX), minY, maxY: Math.max(minY, maxY),
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
    const nextX = clamp(st.baseX + (dx / st.rectW) * 100, st.minX, st.maxX);
    const nextY = clamp(st.baseY + (dy / st.rectH) * 100, st.minY, st.maxY);
    onMove(nextX, nextY);
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const st = dragState.current;
    if (!st?.dragging) return;
    st.dragging = false;
    if (st.moved) {
      const dx = e.clientX - st.startX;
      const dy = e.clientY - st.startY;
      const nextX = clamp(st.baseX + (dx / st.rectW) * 100, st.minX, st.maxX);
      const nextY = clamp(st.baseY + (dy / st.rectH) * 100, st.minY, st.maxY);
      onMoveEnd(nextX, nextY);
    } else if (!disabled) {
      onTap();
    }
  }

  return { onPointerDown, onPointerMove, onPointerUp };
}
