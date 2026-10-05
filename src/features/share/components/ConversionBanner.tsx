"use client";

import Link from "next/link";
import styles from "./conversion-banner.module.css";

/** Epic 7 Story 7.3 — 공유 직후 안내 배너 (PRD §4-7) */
export function ConversionBanner({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.banner}>
      <div className={styles.text}>
        <strong>모은 마음, 무드등으로 간직해 볼까요?</strong>
        <p>지금까지 모인 메시지를 커스텀 무드등으로 만들어 선물할 수 있어요.</p>
      </div>
      <div className={styles.actions}>
        <Link href="/gift" className={styles.cta}>
          무드등으로 만들기
        </Link>
        <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </div>
    </div>
  );
}
