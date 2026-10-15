"use client";

import { useState } from "react";
import styles from "./mode-select.module.css";
import { ToInputForm } from "./ToInputForm";
import type { RollpaperMode } from "@/lib/theme";

// 수정 피드백 — "무드등 롤링페이퍼 1종만 활성화" 요청. 어떤 유형을 남길지 명시가 없어
// 우선 A(투명 아크릴)만 노출하고 B 8인치/A4는 숨김(코드는 유지 — 다른 유형을 남기기로
// 하면 이 배열에 다시 추가하기만 하면 됨). 꼭 A가 맞는지는 확인 필요.
const OPTIONS: { mode: RollpaperMode; title: string; desc: string; capacity: string }[] = [
  { mode: "mood_a", title: "투명 아크릴 무드등", desc: "어두운 배경 · 흰 글씨 고정 · 8인치 라운드 사각", capacity: "7~8명" },
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
