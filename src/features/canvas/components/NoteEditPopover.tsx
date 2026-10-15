"use client";

import { useState } from "react";
import styles from "./canvas.module.css";

const FONTS = [
  { label: "손글씨체", value: "'Gaegu',cursive" },
  { label: "세리프체", value: "'Gowun Batang',serif" },
  { label: "고딕체", value: "inherit" },
];
const SIZES = [11, 14, 18];

interface Props {
  position: { top: number; left: number };
  font: string;
  size: number;
  onChangeFont: (font: string) => void;
  onChangeSize: (size: number) => void;
  onDelete: () => void;
  onClose: () => void;
}

/** 페이지/수정,삭제기능.JPG 레퍼런스 — 메모 탭 시 "꾸미기"(글씨 스타일)·"삭제" 액션 */
export function NoteEditPopover({ position, font, size, onChangeFont, onChangeSize, onDelete, onClose }: Props) {
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
    </div>
  );
}
