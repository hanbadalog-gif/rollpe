"use client";

import { useState } from "react";
import styles from "./mode-select.module.css";
import { ToInputForm } from "./ToInputForm";
import type { RollpaperMode } from "@/lib/theme";

const OPTIONS: { mode: RollpaperMode; title: string; desc: string; capacity: string }[] = [
  { mode: "mood_a", title: "A. 투명 아크릴 무드등", desc: "어두운 배경 · 흰 글씨 고정 · 8인치 라운드 사각", capacity: "7~8명" },
  { mode: "mood_b_8", title: "B. 드로잉 액자 무드등 (8인치)", desc: "흰 배경 · 검정 글씨 권장", capacity: "6~8명" },
  { mode: "mood_b_a4", title: "B. 드로잉 액자 무드등 (A4)", desc: "흰 배경 · 검정 글씨 권장", capacity: "최대 20명" },
];

/** Epic 6 Story 6.1/6.2 — 유형·사이즈 선택 화면 (PRD §5-1/§5-2) */
export function ModeSelect() {
  const [selected, setSelected] = useState<RollpaperMode | null>(null);

  if (selected) {
    return <ToInputForm mode={selected} />;
  }

  return (
    <div className={styles.grid}>
      {OPTIONS.map((opt) => (
        <button key={opt.mode} type="button" className={styles.card} onClick={() => setSelected(opt.mode)}>
          <strong>{opt.title}</strong>
          <p>{opt.desc}</p>
          <span className={styles.capacity}>참여 인원 {opt.capacity}</span>
        </button>
      ))}
      <p className={styles.note}>
        캔버스를 실제 제품 비율에 맞게 고정해서 보여드려요. 완성 후 글리모리에서 제작 주문을 도와드립니다.
      </p>
    </div>
  );
}
