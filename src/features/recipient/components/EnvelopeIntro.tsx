"use client";

import styles from "./envelope-intro.module.css";

// 페이지/6.jpg 레퍼런스 — 봉투 일러스트 대신 로고+문구+"열어보기" 버튼
export function EnvelopeIntro({ toName, onDone }: { toName: string; onDone: () => void }) {
  return (
    <div className={styles.overlay}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 브랜드 로고, 단순 정적 이미지 */}
      <img src="/brand/mark.png" alt="" className={styles.mark} aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo.png" alt="Rollpe" className={styles.logo} />
      <p className={styles.text}>
        사랑하는 {toName}님에게
        <br />
        온 마음을 담은 감동의 롤링페이퍼
      </p>
      <button className={styles.openBtn} onClick={onDone}>
        열어보기
      </button>
    </div>
  );
}
