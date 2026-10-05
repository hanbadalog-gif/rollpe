"use client";

import styles from "./bg-color-panel.module.css";
import { showToast } from "@/components/Toast";

// 참고 프로토타입(구현 참고 플로우) BG_COLORS와 동일 — 라이트/다크 뷰어 모두에게 같은 색으로 저장
const SWATCHES = ["#ffffff", "#f4f1fb", "#fff6d8", "#ffe3ea", "#dcf3ff", "#e4ffe0", "#1c1630", "#2a2240"];

interface Props {
  current: string | null;
  onPick: (bgColor: string) => Promise<void>;
}

/** 캔버스 전체 배경색 — 메모지 배경색(WritePanel)과 다른, 보드 자체의 배경(owner_token 필요) */
export function BgColorPanel({ current, onPick }: Props) {
  async function handlePick(color: string) {
    try {
      await onPick(color);
    } catch {
      showToast("방장만 캔버스 배경을 바꿀 수 있어요");
    }
  }

  return (
    <div className={styles.panel}>
      <h4 className={styles.heading}>캔버스 배경색</h4>
      <div className={styles.grid}>
        {SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            className={`${styles.swatch} ${current === c ? styles.selected : ""}`}
            style={{ background: c }}
            onClick={() => handlePick(c)}
            aria-label={c}
          />
        ))}
      </div>
    </div>
  );
}
