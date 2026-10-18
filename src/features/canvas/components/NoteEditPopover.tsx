"use client";

import { useState } from "react";
import styles from "./canvas.module.css";

const FONTS = [
  { label: "손글씨체", value: "'Gaegu',cursive" },
  { label: "세리프체", value: "'Gowun Batang',serif" },
  { label: "고딕체", value: "inherit" },
];
const SIZES = [14, 16, 20]; // WritePanel의 작게/보통/크게와 같은 값

// WritePanel.tsx와 동일한 팔레트 — 작성 시 고를 수 있던 색을 작성 후에도 그대로 고를 수 있게
const TEXT_COLORS = ["#3A3D4D", "#6C7FB7", "#E88CA6", "#E8A449"];
const BG_COLORS = ["#FFF7E0", "#EAF3FF", "#FDE9EF", "#EEF0FA"];

interface Props {
  position: { top: number; left: number };
  font: string;
  size: number;
  textColor: string;
  bgColor: string | null;
  content: string | null;
  bgPickerEnabled: boolean;
  textColorLocked: boolean;
  onChangeContent: (content: string) => void;
  onChangeFont: (font: string) => void;
  onChangeSize: (size: number) => void;
  onChangeTextColor: (color: string) => void;
  onChangeBgColor: (color: string) => void;
  /** 겹침 순서 — 이미 끝이면 해당 버튼 비활성 */
  canMoveForward: boolean;
  canMoveBackward: boolean;
  onReorder: (to: "front" | "forward" | "backward" | "back") => void;
  onClose: () => void;
}

/** 수정/1번 피드백 — 작성 후에도 글자색/메모지 배경색을 고칠 수 있게 스와치 추가 */
function ColorSwatchRow({
  colors,
  value,
  onPick,
}: {
  colors: string[];
  value: string;
  onPick: (c: string) => void;
}) {
  return (
    <div className={styles.pillRow}>
      {colors.map((c) => (
        <span
          key={c}
          onClick={() => onPick(c)}
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: c,
            cursor: "pointer",
            boxShadow: value === c ? "0 0 0 2px #fff, 0 0 0 4px var(--accent)" : "0 0 0 1px rgba(0,0,0,.08)",
          }}
          aria-label={c}
        />
      ))}
    </div>
  );
}

/** 메모를 누르면 바로 열리는 꾸미기 창 — 글씨체/크기/글자색/배경색 + 삭제 (중간 단계 없음) */
export function NoteEditPopover({
  position,
  font,
  size,
  textColor,
  bgColor,
  content,
  bgPickerEnabled,
  textColorLocked,
  onChangeContent,
  onChangeFont,
  onChangeSize,
  onChangeTextColor,
  onChangeBgColor,
  canMoveForward,
  canMoveBackward,
  onReorder,
  onClose,
}: Props) {
  // 입력 중에는 서버 호출 없이 로컬 값만 바꾸고, 입력칸을 벗어날 때 한 번만 저장
  const [draft, setDraft] = useState(content ?? "");

  return (
    <div className={styles.popover} style={{ top: position.top, left: position.left }}>
      <div className={styles.popoverHead}>
        <b>메모 수정</b>
        <span className={styles.popoverClose} onClick={onClose}>
          ✕
        </span>
      </div>
      <span className={styles.miniLabel}>내용</span>
      <textarea
        className={styles.contentInput}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft.trim() && draft !== (content ?? "") && onChangeContent(draft)}
        onPointerDown={(e) => e.stopPropagation()}
      />
      <span className={styles.miniLabel}>글씨체</span>
      <div className={styles.pillRow}>
        {FONTS.map((f) => (
          <span
            key={f.value}
            className={`${styles.pill} ${font === f.value ? styles.pillSelected : ""}`}
            onClick={() => onChangeFont(f.value)}
          >
            {f.label}
          </span>
        ))}
      </div>
      <span className={styles.miniLabel} style={{ marginTop: 9 }}>
        글씨 크기
      </span>
      <div className={styles.pillRow}>
        {SIZES.map((s) => (
          <span
            key={s}
            className={`${styles.pill} ${size === s ? styles.pillSelected : ""}`}
            onClick={() => onChangeSize(s)}
          >
            {s === 14 ? "S" : s === 16 ? "M" : "L"}
          </span>
        ))}
      </div>

      {!textColorLocked && (
        <>
          <span className={styles.miniLabel} style={{ marginTop: 9 }}>
            글자색
          </span>
          <ColorSwatchRow colors={TEXT_COLORS} value={textColor} onPick={onChangeTextColor} />
        </>
      )}

      {bgPickerEnabled && (
        <>
          <span className={styles.miniLabel} style={{ marginTop: 9 }}>
            메모지 배경
          </span>
          <ColorSwatchRow colors={BG_COLORS} value={bgColor ?? BG_COLORS[0]} onPick={onChangeBgColor} />
        </>
      )}

      <span className={styles.miniLabel} style={{ marginTop: 9 }}>
        순서
      </span>
      <div className={`${styles.pillRow} ${styles.pillRowTight}`}>
        <button type="button" className={styles.pill} disabled={!canMoveForward} onClick={() => onReorder("front")}>
          맨 앞
        </button>
        <button type="button" className={styles.pill} disabled={!canMoveForward} onClick={() => onReorder("forward")}>
          앞으로
        </button>
        <button type="button" className={styles.pill} disabled={!canMoveBackward} onClick={() => onReorder("backward")}>
          뒤로
        </button>
        <button type="button" className={styles.pill} disabled={!canMoveBackward} onClick={() => onReorder("back")}>
          맨 뒤
        </button>
      </div>
    </div>
  );
}
