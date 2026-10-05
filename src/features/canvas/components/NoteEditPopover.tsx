"use client";

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
  onClose: () => void;
}

/** Story 3.4 — 캔버스에 배치된 메모를 탭하면 뜨는 간이 스타일 편집 팝오버 */
export function NoteEditPopover({ position, font, size, onChangeFont, onChangeSize, onClose }: Props) {
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
