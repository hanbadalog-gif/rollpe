"use client";

import styles from "./paper-size-panel.module.css";

export type PaperSize = "free" | "a4p" | "a4l" | "a3p" | "a3l";

const OPTIONS: { value: PaperSize; label: string; sub: string; w: number; h: number }[] = [
  { value: "free", label: "자유", sub: "스크롤", w: 20, h: 20 },
  { value: "a4p", label: "A4 세로", sub: "210:297", w: 16, h: 22 },
  { value: "a4l", label: "A4 가로", sub: "297:210", w: 22, h: 16 },
  { value: "a3p", label: "A3 세로", sub: "297:420", w: 15, h: 24 },
  { value: "a3l", label: "A3 가로", sub: "420:297", w: 24, h: 15 },
];

interface Props {
  value: PaperSize;
  onPick: (v: PaperSize) => void;
}

/** 캔버스 용지 크기 — 실물 인화/액자 주문 시 비율 미리보기 (로컬 뷰 전용) */
export function PaperSizePanel({ value, onPick }: Props) {
  return (
    <div className={styles.panel}>
      <h4 className={styles.heading}>용지 크기</h4>
      <p className={styles.desc}>완성 후 실물 인화·액자 주문 시 이 비율대로 제작돼요.</p>
      <div className={styles.grid}>
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`${styles.opt} ${value === o.value ? styles.optSel : ""}`}
            onClick={() => onPick(o.value)}
          >
            <span className={styles.swatch} style={{ width: o.w, height: o.h }} />
            <span className={styles.optLabel}>{o.label}</span>
            <span className={styles.optSub}>{o.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
