"use client";

import { useEffect, useState } from "react";
import styles from "./envelope-intro.module.css";

/** Epic 2 Story 2.2 — 수신자 전용 화면 진입 연출 (PRD §4-8 "봉투가 열리는 애니메이션") */
export function EnvelopeIntro({ toName, onDone }: { toName: string; onDone: () => void }) {
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const openTimer = setTimeout(() => setOpening(true), 400);
    const doneTimer = setTimeout(onDone, 1900);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className={styles.overlay}>
      <div className={`${styles.envelope} ${opening ? styles.open : ""}`}>
        <div className={styles.flap} />
        <div className={styles.body}>
          <span className={styles.to}>To. {toName}</span>
        </div>
      </div>
    </div>
  );
}
