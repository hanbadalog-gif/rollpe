"use client";

import { useRef, useState } from "react";
import styles from "./canvas.module.css";
import { Note } from "./Note";
import { NoteEditPopover } from "./NoteEditPopover";
import { MODE_CONFIG, type RollpaperMode } from "@/lib/theme";
import { getOwnerToken } from "@/lib/editToken";
import { showToast } from "@/components/Toast";
import type { RollpaperDTO } from "../types";
import type { PaperSize } from "./PaperSizePanel";

interface Props {
  rollpaperId: string;
  rollpaper: RollpaperDTO;
  updateNote: (
    noteId: string,
    patch: { z?: number; content?: string; font?: string; fontSize?: number; textColor?: string; bgColor?: string },
  ) => Promise<void>;
  moveNote: (noteId: string, posX: number, posY: number, rotation?: number) => Promise<void>;
  resizeNote: (noteId: string, scale: number) => Promise<void>;
  deleteNote: (noteId: string, ownerToken?: string | null) => Promise<void>;
  /** 이미지 다운로드(Epic 7 Story 7.2)가 캔버스 DOM을 export할 수 있도록 노출 */
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  /** 수신자 전용 화면(Epic 2 Story 2.2) — 전체를 읽기 전용으로 표시 */
  readOnly?: boolean;
  /** 용지 크기 미리보기(실물 인화/액자 비율) — 로컬 뷰 전용, 서버에 저장하지 않음 */
  paperSize?: PaperSize;
}

const PAPER_CLASS: Record<PaperSize, string> = {
  free: "",
  a4p: "canvasA4p",
  a4l: "canvasA4l",
  a3p: "canvasA3p",
  a3l: "canvasA3l",
};

/**
 * 캔버스 코어 엔진 — Epic 3 (Story 3.1~3.5).
 * 상태(useCanvasNotes)는 page에서 끌어올려 write-panel/stickers/share와 공유한다.
 */
export function CanvasBoard({
  rollpaperId,
  rollpaper,
  updateNote,
  moveNote,
  resizeNote,
  deleteNote,
  canvasRef: externalRef,
  readOnly,
  paperSize = "free",
}: Props) {
  const ownRef = useRef<HTMLDivElement>(null);
  const canvasRef = externalRef ?? ownRef;
  const noteRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  const cfg = MODE_CONFIG[rollpaper.mode as RollpaperMode];
  // 겹침 순서 — z가 작을수록 뒤. 화면에서는 DOM 순서가 곧 쌓임 순서라 정렬해서 그린다
  const ordered = [...rollpaper.notes].sort((a, b) => a.z - b.z);
  const selectedNote = rollpaper.notes.find((n) => n.id === selectedNoteId) ?? null;

  function openPopoverFor(noteId: string) {
    const el = noteRefs.current[noteId];
    if (!el) return;
    // 스티커는 수정창 없이 선택(크기/회전/삭제 핸들)만 — 글씨 설정이 의미 없음
    if (rollpaper.notes.find((n) => n.id === noteId)?.type === "sticker") {
      setSelectedNoteId(noteId);
      setPopoverPos(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left;
    const maxLeft = window.innerWidth - 236;
    if (left > maxLeft) left = maxLeft;
    if (left < 10) left = 10;
    if (top > window.innerHeight - 410) top = Math.max(10, rect.top - 408); // 수정 창 높이 약 400px
    setSelectedNoteId(noteId);
    setPopoverPos({ top, left });
  }

  // 남이 쓴 메모는 수정 토큰이 없어 서버 호출 전에 실패 — 안내만 하고 조용히 넘어감
  async function handleUpdate(noteId: string, patch: Parameters<Props["updateNote"]>[1]) {
    try {
      await updateNote(noteId, patch);
    } catch {
      showToast("내가 쓴 메모만 수정할 수 있어요");
    }
  }

  function handleReorder(noteId: string, to: "front" | "forward" | "backward" | "back") {
    const i = ordered.findIndex((n) => n.id === noteId);
    if (i < 0) return;
    // 내 메모의 z만 바꿔서 이웃 사이(또는 끝)에 끼워 넣는다 — 남의 메모는 건드리지 않음
    let z: number;
    if (to === "front") z = ordered[ordered.length - 1].z + 1;
    else if (to === "back") z = ordered[0].z - 1;
    else if (to === "forward") {
      const next = ordered[i + 1];
      const after = ordered[i + 2];
      z = after ? (next.z + after.z) / 2 : next.z + 1;
    } else {
      const prev = ordered[i - 1];
      const before = ordered[i - 2];
      z = before ? (prev.z + before.z) / 2 : prev.z - 1;
    }
    handleUpdate(noteId, { z });
  }

  async function handleDelete(noteId: string) {
    try {
      await deleteNote(noteId, getOwnerToken(rollpaperId));
      showToast("삭제했어요");
    } catch {
      showToast("삭제 권한이 없어요");
    }
  }

  // 기본값(var(--surface))일 땐 inline background를 비워서 canvas.module.css의
  // 은은한 그라데이션이 보이게 하고, 사용자가 배경색을 직접 고르거나(bgColor)
  // 모드 자체가 고정 배경(무드등 미리보기 등)일 때만 단색으로 덮어쓴다.
  const customBg = rollpaper.bgColor ?? (cfg.bgColor === "var(--surface)" ? undefined : cfg.bgColor);

  return (
    <div className={styles.canvasScroll}>
      <div
        ref={canvasRef}
        className={`${styles.canvas} ${cfg.locked ? styles.canvasLocked : ""} ${PAPER_CLASS[paperSize] ? styles[PAPER_CLASS[paperSize]] : ""}`}
        style={customBg ? { background: customBg } : undefined}
      >
        {cfg.locked && <div className={styles.safeArea} aria-hidden />}
        {rollpaper.notes.length === 0 && (
          <div className={styles.hint}>+ 빈 공간을 눌러 마음을 더해보세요</div>
        )}
        {ordered.map((note) => (
          <Note
            key={note.id}
            note={note}
            canvasRef={canvasRef}
            editable
            readOnly={readOnly}
            flat={cfg.locked}
            selected={note.id === selectedNoteId}
            setRef={(el) => {
              noteRefs.current[note.id] = el;
            }}
            onMoveEnd={(posX, posY) => moveNote(note.id, posX, posY, note.rotation)}
            onResizeEnd={(scale) => resizeNote(note.id, scale)}
            onRotateEnd={(rotation) => moveNote(note.id, note.posX, note.posY, rotation)}
            onTap={() => !readOnly && openPopoverFor(note.id)}
            onDelete={() => handleDelete(note.id)}
          />
        ))}
      </div>

      {selectedNote && popoverPos && (
        <NoteEditPopover
          key={selectedNote.id}
          position={popoverPos}
          font={selectedNote.font ?? "'Gaegu',cursive"}
          size={selectedNote.fontSize ?? 14}
          textColor={cfg.fixedTextColor ?? selectedNote.textColor ?? "#3A3D4D"}
          bgColor={selectedNote.bgColor}
          content={selectedNote.content}
          bgPickerEnabled={cfg.bgPickerEnabled}
          textColorLocked={!!cfg.fixedTextColor}
          onChangeContent={(content) => handleUpdate(selectedNote.id, { content })}
          onChangeFont={(font) => handleUpdate(selectedNote.id, { font })}
          onChangeSize={(fontSize) => handleUpdate(selectedNote.id, { fontSize })}
          onChangeTextColor={(textColor) => handleUpdate(selectedNote.id, { textColor })}
          onChangeBgColor={(bgColor) => handleUpdate(selectedNote.id, { bgColor })}
          canMoveForward={ordered[ordered.length - 1].id !== selectedNote.id}
          canMoveBackward={ordered[0].id !== selectedNote.id}
          onReorder={(to) => handleReorder(selectedNote.id, to)}
          onClose={() => {
            setSelectedNoteId(null);
            setPopoverPos(null);
          }}
        />
      )}
    </div>
  );
}
