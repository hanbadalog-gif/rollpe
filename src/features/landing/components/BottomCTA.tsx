import Link from "next/link";
import styles from "./bottom-cta.module.css";

/** Epic 1 Story 1.3 — 하단 버튼 반복 */
export function BottomCTA() {
  return (
    <section className={styles.section}>
      <p className={styles.lead}>지금 바로 시작해보세요</p>
      <div className={styles.row}>
        <Link href="/new" className={styles.btnAccent}>
          롤링페이퍼 만들기
        </Link>
        <Link href="/gift" className={styles.btnOutline}>
          롤링페이퍼 무드등 선물하기
        </Link>
      </div>
    </section>
  );
}
