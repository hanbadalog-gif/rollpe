import Link from "next/link";
import styles from "./landing.module.css";

// Epic 1 — 메인 랜딩. 지금은 히어로+CTA만 구현(Story 1.1 핵심 부분), 사용처 카드(1.2)·
// 하단 CTA(1.3)는 다음 세션에서 features/landing/components로 분리해 추가 예정.
export default function HomePage() {
  return (
    <main className={styles.hero}>
      <div className={styles.eyebrow}>Rollpe by Glimory</div>
      <h1 className={styles.title}>
        마음을 모은
        <br />
        감동 선물
      </h1>
      <p className={styles.subtitle}>
        로그인 없이 무료로 만드는 온라인 롤링페이퍼
        <br />
        모은 마음은 커스텀 무드등으로도 남겨보세요
      </p>
      <div className={styles.ctaRow}>
        <Link href="/new" className={styles.btnAccent}>
          롤링페이퍼 만들기
        </Link>
        <Link href="/gift" className={styles.btnGhost}>
          롤링페이퍼 무드등 선물하기
        </Link>
      </div>
    </main>
  );
}
