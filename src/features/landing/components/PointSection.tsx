import styles from "./point-section.module.css";

/** Epic 1 Story 1.2 — 포인트 1·2 (PRD §4-1 2·3번) */
export function PointSection() {
  return (
    <section className={styles.section}>
      <div className={`${styles.point} ${styles.tiltLeft}`}>
        <span className={styles.badge}>POINT 1</span>
        <h2>누구나 쉽게 온라인 롤링 페이퍼를 만들 수 있어요</h2>
        <p>로그인 없이, 자유롭게, 무료로.</p>
      </div>
      <div className={`${styles.point} ${styles.tiltRight}`}>
        <span className={styles.badge}>POINT 2</span>
        <h2>롤링페이퍼로만 끝내기 아쉽다구요?</h2>
        <p>모아진 메시지를 커스텀 무드등으로 제작할 수 있어요.</p>
      </div>
    </section>
  );
}
