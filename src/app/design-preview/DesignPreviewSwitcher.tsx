"use client";

import { useState } from "react";
import styles from "./design-preview.module.css";

const OPTIONS = [
  { key: "washi", label: "워시테이프", icon: "🌞", src: "/design-preview/polaroid-washi.html" },
  { key: "glow", label: "미드나잇 글로우", icon: "🌙", src: "/design-preview/midnight-glow.html" },
] as const;

/** 고객 선택용 — 워시테이프 기본, 라이트/다크 모드처럼 토글로 전환 */
export function DesignPreviewSwitcher() {
  const [active, setActive] = useState<(typeof OPTIONS)[number]["key"]>("washi");
  const current = OPTIONS.find((o) => o.key === active)!;

  return (
    <div className={styles.wrap}>
      <div className={styles.switchBar}>
        <span className={styles.switchLabel}>캔버스 디자인</span>
        <div className={styles.switchToggle} role="tablist">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              role="tab"
              aria-selected={active === o.key}
              className={`${styles.switchBtn} ${active === o.key ? styles.switchBtnOn : ""}`}
              onClick={() => setActive(o.key)}
            >
              {o.icon} {o.label}
            </button>
          ))}
        </div>
      </div>
      <iframe key={current.key} src={current.src} className={styles.frame} title={current.label} />
    </div>
  );
}
