"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./canvas.module.css";
import { Note } from "./Note";
import { MODE_CONFIG, type RollpaperMode, type Zone } from "@/lib/theme";
import { parseZoneStyle } from "@/lib/fonts";
import { UndoIcon, RedoIcon } from "@/components/icons";
import { getEditToken, getOwnerToken } from "@/lib/editToken";
import { showToast } from "@/components/Toast";
import type { RollpaperDTO } from "../types";
import type { PaperSize } from "./PaperSizePanel";

interface Props {
  rollpaperId: string;
  rollpaper: RollpaperDTO;
  updateNote: (noteId: string, patch: { z?: number; width?: number; height?: number }) => Promise<void>;
  moveNote: (noteId: string, posX: number, posY: number, rotation?: number) => Promise<void>;
  resizeNote: (noteId: string, scale: number) => Promise<void>;
  deleteNote: (noteId: string, ownerToken?: string | null) => Promise<void>;
  /** 메모 수정창을 여는 쪽(페이지)이 정한다 — 수정이 끝나도 선택은 그대로 유지된다 */
  onEditNote: (noteId: string) => void;
  /** 이미지 다운로드(Epic 7 Story 7.2)가 캔버스 DOM을 export할 수 있도록 노출 */
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  /** 수신자 전용 화면(Epic 2 Story 2.2) — 전체를 읽기 전용으로 표시 */
  readOnly?: boolean;
  /** 용지 크기 미리보기(실물 인화/액자 비율) — 로컬 뷰 전용, 서버에 저장하지 않음 */
  paperSize?: PaperSize;
  /** 무드등 고정 칸(사진/제목/문구)을 방장이 눌러 입력할 수 있는지 */
  editableZones?: boolean;
  onEditZone?: (key: Zone["key"]) => void;
  /** 되돌리기 / 다시 실행 — 선택한 메모의 크기 조절 테두리 바로 아래에 보여준다 */
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const PAPER_CLASS: Record<PaperSize, string> = {
  free: "",
  a4p: "canvasA4p",
  a4l: "canvasA4l",
  a3p: "canvasA3p",
  a3l: "canvasA3l",
};

// 투명 아크릴(유형 B)은 7_1.jpg 배경 이미지, 드로잉 액자(유형 A)는 흰 종이(8인치 정사각 / A4 비율)
const CANVAS_CLASS: Partial<Record<RollpaperMode, string>> = {
  mood_a: styles.canvasLamp,
  mood_b_8: `${styles.canvasPaper} ${styles.canvasPaperSquare}`,
  mood_b_a4: `${styles.canvasPaper} ${styles.canvasPaperA4}`,
};

// 이벤트 처리기에서만 호출한다(렌더 중 호출 아님)
const nowMs = () => Date.now();

function zoneTextStyle(raw: string | undefined): React.CSSProperties {
  const st = parseZoneStyle(raw);
  return { fontFamily: st.font === "inherit" ? "var(--font-sans, 'Noto Sans KR', sans-serif)" : st.font, fontSize: `${st.size}cqw`, fontWeight: st.bold ? 700 : 400 };
}

type Reorder = "front" | "forward" | "backward" | "back";

/**
 * 캔버스 코어 엔진 — Epic 3 (Story 3.1~3.5).
 * 상태(useCanvasNotes)는 page에서 끌어올려 write-panel/stickers/share와 공유한다.
 *
 * 메모를 누르면 "선택"만 된다(이동·회전·크기 핸들 + 하단 작은 동작 막대). 글 수정은 막대의 '수정' 버튼이나
 * 이미 선택된 메모를 한 번 더 누르면 열리는 창에서 한다 — 메모 근처에 창이 뜨지 않아 위치 조정을 가리지 않는다.
 */
export function CanvasBoard({
  rollpaperId,
  rollpaper,
  updateNote,
  moveNote,
  resizeNote,
  deleteNote,
  onEditNote,
  canvasRef: externalRef,
  readOnly,
  paperSize = "free",
  editableZones,
  onEditZone,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: Props) {
  const ownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [barPos, setBarPos] = useState<{ left: number; top: number } | null>(null);
  const canvasRef = externalRef ?? ownRef;
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const cfg = MODE_CONFIG[rollpaper.mode as RollpaperMode];
  // 겹침 순서 — z가 작을수록 뒤. 화면에서는 DOM 순서가 곧 쌓임 순서라 정렬해서 그린다
  const ordered = [...rollpaper.notes].sort((a, b) => a.z - b.z);
  const selectedNote = readOnly ? null : (rollpaper.notes.find((n) => n.id === selectedNoteId) ?? null);
  // 되돌리기·다시 실행 알약을 선택한 메모 테두리(크기 조절 핸들) 바로 아래에 붙인다 — 끌기·크기·회전·스크롤 중에도 따라가도록 매 프레임 위치를 읽는다.
  // 아래 공간이 모자라면 메모 위로 올린다.
  const selId = selectedNote?.id ?? null;
  useEffect(() => {
    if (!selId) return;
    let raf = 0;
    const tick = () => {
      const sc = scrollRef.current;
      const el = canvasRef.current?.querySelector(`[data-note-id="${selId}"]`);
      const bar = barRef.current;
      if (sc && el && bar) {
        const s = sc.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        const bw = bar.offsetWidth;
        const bh = bar.offsetHeight;
        const left = Math.max(bw / 2 + 8, Math.min(sc.clientWidth - bw / 2 - 8, r.left + r.width / 2 - s.left)) + sc.scrollLeft;
        let top = r.bottom - s.top + sc.scrollTop + 18; // 모서리 핸들(반지름 8px) 아래
        if (top + bh > sc.scrollTop + sc.clientHeight - 6) top = r.top - s.top + sc.scrollTop - bh - 44; // 회전 핸들 위로
        setBarPos((prev) => (prev && Math.abs(prev.left - left) < 0.5 && Math.abs(prev.top - top) < 0.5 ? prev : { left, top }));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selId, canvasRef]);

  const mine = selectedNote ? !!getEditToken(rollpaperId, selectedNote.id) : false; // 글 내용 수정 가능(쓴 사람)
  const isOwner = !!getOwnerToken(rollpaperId); // 방장은 모두의 메모 배치를 바꿀 수 있다
  const canArrange = mine || isOwner;

  // 같은 메모를 짧은 시간 안에 두 번 누르면(더블클릭 / 더블 탭) 수정창 — 마우스와 터치 모두 같은 방식
  const lastTap = useRef<{ id: string; t: number } | null>(null);
  function handleTap(noteId: string) {
    if (readOnly) return;
    const note = rollpaper.notes.find((n) => n.id === noteId);
    if (!note) return;
    const now = nowMs();
    const last = lastTap.current;
    if (last && last.id === noteId && now - last.t < 450 && note.type !== "sticker" && getEditToken(rollpaperId, noteId)) {
      lastTap.current = null;
      onEditNote(noteId);
      return;
    }
    lastTap.current = { id: noteId, t: now };
    setSelectedNoteId(noteId);
  }

  function handleReorder(noteId: string, to: Reorder) {
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
    updateNote(noteId, { z }).catch(() => showToast("내가 쓴 메모만 바꿀 수 있어요"));
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
  const customBg = cfg.locked ? undefined : rollpaper.bgColor ?? (cfg.bgColor === "var(--surface)" ? undefined : cfg.bgColor);

  const atFront = selectedNote ? ordered[ordered.length - 1].id === selectedNote.id : false;
  const atBack = selectedNote ? ordered[0].id === selectedNote.id : false;

  return (
    <div className={styles.canvasScroll} ref={scrollRef}>
      <div
        ref={canvasRef}
        className={`${styles.canvas} ${cfg.locked ? `${styles.canvasLocked} ${CANVAS_CLASS[rollpaper.mode as RollpaperMode] ?? ""}` : ""} ${PAPER_CLASS[paperSize] ? styles[PAPER_CLASS[paperSize]] : ""}`}
        style={customBg ? { background: customBg } : undefined}
        // 빈 곳을 누르면 선택 해제
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setSelectedNoteId(null);
        }}
      >
        {cfg.zones?.map((z) => {
          const value = rollpaper.fixedFields?.[z.key] ?? z.defaultText;
          if (!value && !editableZones) return null;
          const style: React.CSSProperties = {
            left: `${z.x}%`,
            top: `${z.y}%`,
            width: `${z.w}%`,
            height: `${z.h}%`,
            color: cfg.fixedTextColor,
            transform: z.rotate ? `rotate(${z.rotate}deg)` : undefined,
            // 글이 길면 칸 밖으로 넘치되 자르지 않는다 — 화살표가 있는 반대 방향으로 늘어남
            ...(z.kind === "text" ? { overflow: "visible", alignItems: z.grow === "up" ? "flex-end" : z.grow === "down" ? "flex-start" : "center" } : {}),
            // 방장이 고른 글씨체·크기·굵기 (없으면 기본 손글씨 굵게)
            ...(z.kind === "text" ? zoneTextStyle(rollpaper.fixedFields?.[`${z.key}Style` as keyof typeof rollpaper.fixedFields]) : {}),
          };
          const body = !value ? (
            <span data-no-export="1" className={styles.zonePlaceholder}>
              {z.placeholder}
            </span>
          ) : z.kind === "photo" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className={styles.zonePhoto} draggable={false} />
          ) : (
            <span className={styles.zoneText}>{value}</span>
          );
          return editableZones ? (
            <button key={z.key} type="button" className={`${styles.zone} ${styles.zoneEditable}`} style={style} onClick={() => onEditZone?.(z.key)} aria-label={z.placeholder}>
              {body}
            </button>
          ) : (
            <div key={z.key} className={styles.zone} style={style}>
              {body}
            </div>
          );
        })}
        {rollpaper.notes.length === 0 && (
          <div className={styles.hint} data-no-export="1">+ 빈 공간을 눌러 마음을 더해보세요</div>
        )}
        {ordered.map((note) => (
          <Note
            key={note.id}
            note={note}
            canvasRef={canvasRef}
            // 수정 권한(작성한 기기의 토큰)이 있는 메모만 끌 수 있다 — 없는 메모는 끌어도 저장이 거부돼 제자리로 돌아가므로 아예 못 끌게 한다
            editable={!note.id.startsWith("tmp-") && (!!getEditToken(rollpaperId, note.id) || isOwner)}
            readOnly={readOnly}
            flat={cfg.locked}
            bounds={cfg.bounds}
            selected={note.id === selectedNote?.id}
            onMoveEnd={(posX, posY) => moveNote(note.id, posX, posY, note.rotation)}
            onResizeEnd={(scale) => resizeNote(note.id, scale)}
            onRotateEnd={(rotation) => moveNote(note.id, note.posX, note.posY, rotation)}
            onTap={() => handleTap(note.id)}
            onDelete={() => handleDelete(note.id)}
          />
        ))}
      </div>

      {selectedNote && (
        <div className={styles.actionBar} role="toolbar" aria-label="선택한 메모">
          {canArrange ? (
            <>
              <button type="button" className={styles.actionPill} disabled={atFront} onClick={() => handleReorder(selectedNote.id, "front")}>
                맨 앞
              </button>
              <button type="button" className={styles.actionPill} disabled={atFront} onClick={() => handleReorder(selectedNote.id, "forward")}>
                앞으로
              </button>
              <button type="button" className={styles.actionPill} disabled={atBack} onClick={() => handleReorder(selectedNote.id, "backward")}>
                뒤로
              </button>
              <button type="button" className={styles.actionPill} disabled={atBack} onClick={() => handleReorder(selectedNote.id, "back")}>
                맨 뒤
              </button>
            </>
          ) : (
            <span className={styles.actionHint}>다른 사람이 쓴 메모예요</span>
          )}
          <button type="button" className={styles.actionPill} onClick={() => setSelectedNoteId(null)} aria-label="선택 해제">
            ✕
          </button>
        </div>
      )}

      {selectedNote && (
        // 선택한 메모의 크기 조절 테두리 바로 아래 — 되돌리기 / 다시 실행
        <div
          className={styles.undoPill}
          ref={barRef}
          role="toolbar"
          aria-label="되돌리기"
          style={barPos ? { left: barPos.left, top: barPos.top } : { left: 0, top: 0, visibility: "hidden" }}
        >
          <button type="button" className={`${styles.actionPill} ${styles.actionIcon}`} disabled={!canUndo} onClick={onUndo} aria-label="되돌리기" title="되돌리기 (Ctrl+Z)">
            <UndoIcon size={16} />
          </button>
          <button type="button" className={`${styles.actionPill} ${styles.actionIcon}`} disabled={!canRedo} onClick={onRedo} aria-label="다시 실행" title="다시 실행 (Ctrl+Shift+Z)">
            <RedoIcon size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
