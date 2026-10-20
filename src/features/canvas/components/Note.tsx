"use client";

import { useRef, useState } from "react";
import styles from "./canvas.module.css";
import { useDraggableNote } from "../hooks/useDraggableNote";
import { useResizableNote } from "../hooks/useResizableNote";
import { useRotatableNote } from "../hooks/useRotatableNote";
import type { NoteDTO } from "../types";

interface Props {
  note: NoteDTO;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  editable: boolean;
  selected: boolean;
  onMoveEnd: (posX: number, posY: number) => void;
  onResizeEnd: (scale: number) => void;
  /** 옆(폭) / 위·아래(최소 높이)로 늘린 결과 — 캔버스 대비 % */
  onBoxEnd: (box: { width?: number; height?: number }) => void;
  onRotateEnd: (rotation: number) => void;
  onTap: () => void;
  onDelete: () => void;
  setRef?: (el: HTMLDivElement | null) => void;
  /** 수신자 전용 화면(Epic 2 Story 2.2) — 드래그/삭제/재편집 전부 비활성 */
  readOnly?: boolean;
  /** 무드등 모드(수정/0번 피드백) — 메모지 그림자를 없애 실물 인화/아크릴 느낌에 가깝게 */
  flat?: boolean;
  /** 메모가 머물 수 있는 영역 — useDraggableNote 참고 */
  bounds?: { right: number; bottom: number };
}

export function Note({ note, canvasRef, editable, selected, onMoveEnd, onResizeEnd, onBoxEnd, onRotateEnd, onTap, onDelete, setRef, readOnly, flat, bounds }: Props) {
  // 드래그 중에는 서버 왕복 없이 로컬 좌표만 바꿔 즉시 반응하게 한다 (실시간 이동 체감용)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragScale, setDragScale] = useState<number | null>(null);
  const [dragRotation, setDragRotation] = useState<number | null>(null);
  const [dragBox, setDragBox] = useState<{ w?: number; h?: number } | null>(null);
  const boxDrag = useRef<{ axis: "w" | "h"; sx: number; sy: number; base: number; cw: number; ch: number; cos: number; sin: number; sc: number } | null>(null);
  const elRef = useRef<HTMLDivElement | null>(null);

  const disabled = readOnly || !editable;

  const drag = useDraggableNote({
    posX: note.posX,
    posY: note.posY,
    canvasRef,
    onMove: (x, y) => setDragPos({ x, y }),
    onMoveEnd: (x, y) => {
      setDragPos(null);
      onMoveEnd(x, y);
    },
    onTap,
    disabled,
    bounds,
  });

  const resize = useResizableNote({
    scale: note.scale ?? 1,
    onResize: setDragScale,
    onResizeEnd: (scale) => {
      setDragScale(null);
      onResizeEnd(scale);
    },
    disabled,
  });

  const rotate = useRotatableNote({
    rotation: note.rotation,
    getCenter: () => {
      const rect = elRef.current?.getBoundingClientRect();
      return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
    },
    onRotate: setDragRotation,
    onRotateEnd: (rotation) => {
      setDragRotation(null);
      onRotateEnd(rotation);
    },
    disabled,
  });

  const posX = dragPos?.x ?? note.posX;
  const posY = dragPos?.y ?? note.posY;
  const scale = dragScale ?? note.scale ?? 1;
  const rotation = dragRotation ?? note.rotation;
  const boxW = dragBox?.w ?? note.width;
  const boxH = dragBox?.h ?? note.height;
  const style: React.CSSProperties = {
    left: `${posX}%`,
    top: `${posY}%`,
    transform: `rotate(${rotation}deg) scale(${scale})`,
    // 핸들·삭제 버튼은 메모가 작아져도 같은 크기로 보이게 역배율을 CSS에서 쓴다
    ["--ns" as string]: scale,
    width: boxW ? `${boxW}%` : undefined,
    minHeight: boxH ? `${boxH}%` : undefined,
  };

  // 오른쪽 가운데 핸들 = 폭(옆으로), 아래쪽 가운데 핸들 = 최소 높이(위·아래로). 회전·확대 상태에서도 메모 기준 방향으로 계산
  function boxDown(e: React.PointerEvent<HTMLElement>, axis: "w" | "h") {
    e.stopPropagation();
    const c = canvasRef.current?.getBoundingClientRect();
    const el = elRef.current;
    if (!c || !el) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = (rotation * Math.PI) / 180;
    boxDrag.current = {
      axis,
      sx: e.clientX,
      sy: e.clientY,
      base: axis === "w" ? (el.offsetWidth / c.width) * 100 : (el.offsetHeight / c.height) * 100,
      cw: c.width,
      ch: c.height,
      cos: Math.cos(r),
      sin: Math.sin(r),
      sc: scale,
    };
  }
  function boxValue(e: React.PointerEvent<HTMLElement>) {
    const d = boxDrag.current!;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (d.axis === "w") return Math.max(18, Math.min(95, d.base + (((dx * d.cos + dy * d.sin) / d.sc) / d.cw) * 100));
    return Math.max(8, Math.min(95, d.base + (((-dx * d.sin + dy * d.cos) / d.sc) / d.ch) * 100));
  }
  function boxMove(e: React.PointerEvent<HTMLElement>) {
    if (!boxDrag.current) return;
    e.stopPropagation();
    const v = boxValue(e);
    setDragBox((prev) => ({ ...prev, [boxDrag.current!.axis]: v }));
  }
  function boxUp(e: React.PointerEvent<HTMLElement>) {
    if (!boxDrag.current) return;
    e.stopPropagation();
    const v = boxValue(e);
    onBoxEnd(boxDrag.current.axis === "w" ? { width: v } : { height: v });
    boxDrag.current = null;
    setDragBox(null);
  }

  function setRefs(el: HTMLDivElement | null) {
    elRef.current = el;
    setRef?.(el);
  }

  // 페이지/메모지 회전기능.JPG 레퍼런스 — 선택 시 4모서리 리사이즈 점 + 상단 회전 핸들
  const handles = !disabled && selected && (
    <>
      <span className={`${styles.cornerHandle} ${styles.cornerTL}`} onPointerDown={(e) => resize.onPointerDown(e, -1, -1)} onPointerMove={resize.onPointerMove} onPointerUp={resize.onPointerUp} onClick={(e) => e.stopPropagation()} />
      <span className={`${styles.cornerHandle} ${styles.cornerTR}`} onPointerDown={(e) => resize.onPointerDown(e, 1, -1)} onPointerMove={resize.onPointerMove} onPointerUp={resize.onPointerUp} onClick={(e) => e.stopPropagation()} />
      <span className={`${styles.cornerHandle} ${styles.cornerBL}`} onPointerDown={(e) => resize.onPointerDown(e, -1, 1)} onPointerMove={resize.onPointerMove} onPointerUp={resize.onPointerUp} onClick={(e) => e.stopPropagation()} />
      <span className={`${styles.cornerHandle} ${styles.cornerBR}`} onPointerDown={(e) => resize.onPointerDown(e, 1, 1)} onPointerMove={resize.onPointerMove} onPointerUp={resize.onPointerUp} onClick={(e) => e.stopPropagation()} />
      {note.type === "text" && (
        <>
          <span className={`${styles.edgeHandle} ${styles.edgeR}`} onPointerDown={(e) => boxDown(e, "w")} onPointerMove={boxMove} onPointerUp={boxUp} onClick={(e) => e.stopPropagation()} />
          <span className={`${styles.edgeHandle} ${styles.edgeB}`} onPointerDown={(e) => boxDown(e, "h")} onPointerMove={boxMove} onPointerUp={boxUp} onClick={(e) => e.stopPropagation()} />
        </>
      )}
      <span className={styles.rotateHandle} onPointerDown={rotate.onPointerDown} onPointerMove={rotate.onPointerMove} onPointerUp={rotate.onPointerUp} onClick={(e) => e.stopPropagation()}>
        ⟳
      </span>
    </>
  );

  if (note.type === "sticker") {
    return (
      <div
        className={`${styles.note} ${styles.noteSticker} ${selected ? styles.noteSelected : ""}`}
        style={style}
        ref={setRefs}
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
      >
        {note.content}
        {!readOnly && (
          <span className={styles.deleteBtn} onClick={onDelete}>
            ✕
          </span>
        )}
        {handles}
      </div>
    );
  }

  if (note.type === "photo" && !note.content) {
    return (
      <div
        className={`${styles.note} ${styles.notePhotoOnly} ${selected ? styles.noteSelected : ""}`}
        style={style}
        ref={setRefs}
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
      >
        {/* next/image는 스토리지 벤더 확정(TRD §1 미결정) 후 remotePatterns 설정과 함께 전환 */}
        {/* draggable=false — 브라우저 기본 이미지 드래그(다운로드 고스트)가 커스텀 포인터 드래그를 가로채던 버그 수정 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {note.photoUrl && <img src={note.photoUrl} alt="" draggable={false} />}
        {!readOnly && (
          <span className={styles.deleteBtn} onClick={onDelete}>
            ✕
          </span>
        )}
        {handles}
      </div>
    );
  }

  return (
    <div
      className={`${styles.note} ${selected ? styles.noteSelected : ""} ${flat ? styles.noteFlat : ""}`}
      ref={setRefs}
      style={{
        ...style,
        background: note.bgColor ?? undefined,
        color: note.textColor ?? undefined,
        fontFamily: note.font ?? undefined,
        // 무드등(flat)은 캔버스 폭(기준 360px)에 비례해 글씨도 함께 줄고 늘어, 기기마다 메모 크기가 달라 보이지 않게 한다
        fontSize: note.fontSize ? (flat ? `${note.fontSize / 3.6}cqw` : `${note.fontSize}px`) : undefined,
        fontWeight: note.bold ? 700 : undefined,
        border: note.borderColor ? `2px solid ${note.borderColor}` : undefined,
      }}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {note.photoUrl && <img className={styles.notePhoto} src={note.photoUrl} alt="" draggable={false} />}
      {note.content}
      {/* 메인페이지 메모지와 동일 — 본문 아래에 "From 이름"(이름 밑줄) */}
      <span className={styles.noteFrom}>
        From <span className={styles.noteFromName}>{note.fromName}</span>
      </span>
      {!readOnly && (
        <span className={styles.deleteBtn} onClick={onDelete}>
          ✕
        </span>
      )}
      {handles}
    </div>
  );
}
