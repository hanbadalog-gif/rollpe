"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

interface Options {
  rotation: number;
  /** 회전 중심점(뷰포트 좌표) — 보통 메모 엘리먼트의 bounding rect 중심 */
  getCenter: () => { x: number; y: number } | null;
  onRotate: (rotation: number) => void;
  onRotateEnd: (rotation: number) => void;
  disabled?: boolean;
}

// 포인터가 중심 바로 위(up)일 때 0deg가 되도록 — atan2(dx, -dy)
function angleFromCenter(center: { x: number; y: number }, px: number, py: number) {
  return Math.atan2(px - center.x, -(py - center.y)) * (180 / Math.PI);
}

/** 메모 상단 중앙 회전 핸들 — 중심점 기준 포인터 각도 변화만큼 rotation 조절 */
export function useRotatableNote({ rotation, getCenter, onRotate, onRotateEnd, disabled }: Options) {
  const dragState = useRef<{ startAngle: number; baseRotation: number } | null>(null);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (disabled) return;
    e.stopPropagation();
    const center = getCenter();
    if (!center) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startAngle: angleFromCenter(center, e.clientX, e.clientY), baseRotation: rotation };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const st = dragState.current;
    const center = getCenter();
    if (!st || !center) return;
    e.stopPropagation();
    const angle = angleFromCenter(center, e.clientX, e.clientY);
    onRotate(st.baseRotation + (angle - st.startAngle));
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const st = dragState.current;
    const center = getCenter();
    if (!st) return;
    e.stopPropagation();
    if (center) {
      const angle = angleFromCenter(center, e.clientX, e.clientY);
      onRotateEnd(st.baseRotation + (angle - st.startAngle));
    }
    dragState.current = null;
  }

  return { onPointerDown, onPointerMove, onPointerUp };
}
