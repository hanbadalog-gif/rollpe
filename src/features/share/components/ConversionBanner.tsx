"use client";

import styles from "./conversion-banner.module.css";

/** 공유(이미지 저장·링크 복사·주인공 전달) 직후 가운데에 뜨는 무드등 제안 모달 — 버튼은 유형 A/B 선택 화면으로 연결된다 */
export function ConversionBanner({ onClose, onOrder }: { onClose: () => void; onOrder: () => void }) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.banner} role="dialog" aria-modal="true" aria-label="무드등 제작 안내" onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
          ✕
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element -- 예시 사진 (참고자료/A제품 에시.jpg) */}
        <img src="/brand/type-a.jpg" alt="롤링페이퍼 무드등 예시" className={styles.hero} />
        <div className={styles.text}>
          <strong>모은 마음, 무드등으로 간직해 볼까요?</strong>
          <p>마음에 드는 유형을 골라 무드등으로 만들어 보세요.</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.cta} onClick={onOrder}>
            무드등으로 만들기
          </button>
          <button className={styles.laterBtn} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
