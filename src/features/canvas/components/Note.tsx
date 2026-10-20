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

export function Note({ note, canvasRef, editable, selected, onMoveEnd, onResizeEnd, onRotateEnd, onTap, onDelete, setRef, readOnly, flat, bounds }: Props) {
  // 드래그 중에는 서버 왕복 없이 로컬 좌표만 바꿔 즉시 반응하게 한다 (실시간 이동 체감용)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragScale, setDragScale] = useState<number | null>(null);
  const [dragRotation, setDragRotation] = useState<number | null>(null);
  const elRef = useRef<HTMLDivElement | null>(null);

  const disabled = readOnly || (!editable && note.type !== "sticker");

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
  const style: React.CSSProperties = {
    left: `${posX}%`,
    top: `${posY}%`,
    transform: `rotate(${rotation}deg) scale(${scale})`,
  };

  function setRefs(el: HTMLDivElement | null) {
    elRef.current = el;
    setRef?.(el);
  }

  // 페이지/메모지 회전기능.JPG 레퍼런스 — 선택 시 4모서리 리사이즈 점 + 상단 회전 핸들
  const handles = !disabled && selected && (
    <>
      <span className={`${styles.cornerHandle} ${styles.cornerTL}`} onPointerDown={resize.onPointerDown} onPointerMove={resize.onPointerMove} onPointerUp={resize.onPointerUp} onClick={(e) => e.stopPropagation()} />
      <span className={`${styles.cornerHandle} ${styles.cornerTR}`} onPointerDown={resize.onPointerDown} onPointerMove={resize.onPointerMove} onPointerUp={resize.onPointerUp} onClick={(e) => e.stopPropagation()} />
      <span className={`${styles.cornerHandle} ${styles.cornerBL}`} onPointerDown={resize.onPointerDown} onPointerMove={resize.onPointerMove} onPointerUp={resize.onPointerUp} onClick={(e) => e.stopPropagation()} />
      <span className={`${styles.cornerHandle} ${styles.cornerBR}`} onPointerDown={resize.onPointerDown} onPointerMove={resize.onPointerMove} onPointerUp={resize.onPointerUp} onClick={(e) => e.stopPropagation()} />
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
        fontSize: note.fontSize ? `${note.fontSize}px` : undefined,
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
