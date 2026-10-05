"use client";

import { useRef, useState } from "react";
import styles from "./canvas.module.css";
import { Note } from "./Note";
import { NoteEditPopover } from "./NoteEditPopover";
import { MODE_CONFIG, type RollpaperMode } from "@/lib/theme";
import { getOwnerToken } from "@/lib/editToken";
import { showToast } from "@/components/Toast";
import type { RollpaperDTO } from "../types";

interface Props {
  rollpaperId: string;
  rollpaper: RollpaperDTO;
  updateNote: (noteId: string, patch: { font?: string; fontSize?: number }) => Promise<void>;
  moveNote: (noteId: string, posX: number, posY: number, rotation?: number) => Promise<void>;
  deleteNote: (noteId: string, ownerToken?: string | null) => Promise<void>;
  /** 이미지 다운로드(Epic 7 Story 7.2)가 캔버스 DOM을 export할 수 있도록 노출 */
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  /** 수신자 전용 화면(Epic 2 Story 2.2) — 전체를 읽기 전용으로 표시 */
  readOnly?: boolean;
}

/**
 * 캔버스 코어 엔진 — Epic 3 (Story 3.1~3.5).
 * 상태(useCanvasNotes)는 page에서 끌어올려 write-panel/stickers/share와 공유한다.
 */
export function CanvasBoard({ rollpaperId, rollpaper, updateNote, moveNote, deleteNote, canvasRef: externalRef, readOnly }: Props) {
  const ownRef = useRef<HTMLDivElement>(null);
  const canvasRef = externalRef ?? ownRef;
  const noteRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  const cfg = MODE_CONFIG[rollpaper.mode as RollpaperMode];
  const selectedNote = rollpaper.notes.find((n) => n.id === selectedNoteId) ?? null;

  function openPopoverFor(noteId: string) {
    const el = noteRefs.current[noteId];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left;
    const maxLeft = window.innerWidth - 236;
    if (left > maxLeft) left = maxLeft;
    if (left < 10) left = 10;
    if (top > window.innerHeight - 170) top = rect.top - 168;
    setSelectedNoteId(noteId);
    setPopoverPos({ top, left });
  }

  async function handleDelete(noteId: string) {
    try {
      await deleteNote(noteId, getOwnerToken(rollpaperId));
      showToast("삭제했어요");
    } catch {
      showToast("삭제 권한이 없어요");
    }
  }

  return (
    <div className={styles.canvasScroll}>
      <div
        ref={canvasRef}
        className={`${styles.canvas} ${cfg.locked ? styles.canvasLocked : ""}`}
        style={{ background: rollpaper.bgColor ?? cfg.bgColor }}
      >
        {cfg.locked && <div className={styles.safeArea} aria-hidden />}
        {rollpaper.notes.length === 0 && (
          <div className={styles.hint}>+ 빈 공간을 눌러 마음을 더해보세요</div>
        )}
        {rollpaper.notes.map((note) => (
          <Note
            key={note.id}
            note={note}
            canvasRef={canvasRef}
            editable
            readOnly={readOnly}
            selected={note.id === selectedNoteId}
            setRef={(el) => {
              noteRefs.current[note.id] = el;
            }}
            onMoveEnd={(posX, posY) => moveNote(note.id, posX, posY, note.rotation)}
            onTap={() => !readOnly && openPopoverFor(note.id)}
            onDelete={() => handleDelete(note.id)}
          />
        ))}
      </div>

      {selectedNote && popoverPos && (
        <NoteEditPopover
          position={popoverPos}
          font={selectedNote.font ?? "'Gaegu',cursive"}
          size={selectedNote.fontSize ?? 14}
          onChangeFont={(font) => updateNote(selectedNote.id, { font })}
          onChangeSize={(fontSize) => updateNote(selectedNote.id, { fontSize })}
          onClose={() => {
            setSelectedNoteId(null);
            setPopoverPos(null);
          }}
        />
      )}
    </div>
  );
}
