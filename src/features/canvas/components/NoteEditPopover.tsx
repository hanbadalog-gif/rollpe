"use client";

import { useState } from "react";
import styles from "./canvas.module.css";

const FONTS = [
  { label: "손글씨체", value: "'Gaegu',cursive" },
  { label: "세리프체", value: "'Gowun Batang',serif" },
  { label: "고딕체", value: "inherit" },
];
const SIZES = [11, 14, 18];

// WritePanel.tsx와 동일한 팔레트 — 작성 시 고를 수 있던 색을 작성 후에도 그대로 고를 수 있게
const TEXT_COLORS = ["#3A3D4D", "#6C7FB7", "#E88CA6", "#E8A449"];
const BG_COLORS = ["#FFF7E0", "#EAF3FF", "#FDE9EF", "#EEF0FA"];

interface Props {
  position: { top: number; left: number };
  font: string;
  size: number;
  textColor: string;
  bgColor: string | null;
  bgPickerEnabled: boolean;
  textColorLocked: boolean;
  onChangeFont: (font: string) => void;
  onChangeSize: (size: number) => void;
  onChangeTextColor: (color: string) => void;
  onChangeBgColor: (color: string) => void;
  onDelete: () => void;
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

/** 페이지/수정,삭제기능.JPG 레퍼런스 — 메모 탭 시 "꾸미기"(글씨 스타일)·"삭제" 액션 */
export function NoteEditPopover({
  position,
  font,
  size,
  textColor,
  bgColor,
  bgPickerEnabled,
  textColorLocked,
  onChangeFont,
  onChangeSize,
  onChangeTextColor,
  onChangeBgColor,
  onDelete,
  onClose,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <div className={styles.popover} style={{ top: position.top, left: position.left }}>
        <div className={styles.popoverHead}>
          <b>메모</b>
          <span className={styles.popoverClose} onClick={onClose}>
            ✕
          </span>
        </div>
        <div className={styles.actionRow}>
          <button type="button" className={styles.actionBtn} onClick={() => setExpanded(true)}>
            꾸미기
          </button>
          <button type="button" className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={onDelete}>
            삭제
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.popover} style={{ top: position.top, left: position.left }}>
      <div className={styles.popoverHead}>
        <b>글씨 스타일</b>
        <span className={styles.popoverClose} onClick={onClose}>
          ✕
        </span>
      </div>
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
            {s === 11 ? "S" : s === 14 ? "M" : "L"}
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
    </div>
  );
}
