"use client";

import { useState } from "react";
import styles from "./canvas.module.css";
import { useDraggableNote } from "../hooks/useDraggableNote";
import type { NoteDTO } from "../types";

interface Props {
  note: NoteDTO;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  editable: boolean;
  selected: boolean;
  onMoveEnd: (posX: number, posY: number) => void;
  onTap: () => void;
  onDelete: () => void;
  setRef?: (el: HTMLDivElement | null) => void;
  /** 수신자 전용 화면(Epic 2 Story 2.2) — 드래그/삭제/재편집 전부 비활성 */
  readOnly?: boolean;
}

export function Note({ note, canvasRef, editable, selected, onMoveEnd, onTap, onDelete, setRef, readOnly }: Props) {
  // 드래그 중에는 서버 왕복 없이 로컬 좌표만 바꿔 즉시 반응하게 한다 (실시간 이동 체감용)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

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
    disabled: readOnly || (!editable && note.type !== "sticker"),
  });

  const posX = dragPos?.x ?? note.posX;
  const posY = dragPos?.y ?? note.posY;
  const style: React.CSSProperties = {
    left: `${posX}%`,
    top: `${posY}%`,
    transform: `rotate(${note.rotation}deg)`,
  };

  if (note.type === "sticker") {
    return (
      <div
        className={`${styles.note} ${styles.noteSticker}`}
        style={style}
        ref={setRef}
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
      </div>
    );
  }

  if (note.type === "photo" && !note.content) {
    return (
      <div
        className={`${styles.note} ${styles.notePhotoOnly}`}
        style={style}
        ref={setRef}
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
      >
        {/* next/image는 스토리지 벤더 확정(TRD §1 미결정) 후 remotePatterns 설정과 함께 전환 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {note.photoUrl && <img src={note.photoUrl} alt="" />}
        {!readOnly && (
          <span className={styles.deleteBtn} onClick={onDelete}>
            ✕
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${styles.note} ${selected ? styles.noteSelected : ""}`}
      ref={setRef}
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
      {note.photoUrl && <img className={styles.notePhoto} src={note.photoUrl} alt="" />}
      {note.content}
      <span className={styles.noteFrom}>- {note.fromName}</span>
      {!readOnly && (
        <span className={styles.deleteBtn} onClick={onDelete}>
          ✕
        </span>
      )}
    </div>
  );
}
