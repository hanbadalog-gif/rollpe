import Link from "next/link";
import styles from "./landing.module.css";
import { PointSection } from "@/features/landing/components/PointSection";
import { UseCases } from "@/features/landing/components/UseCases";
import { BottomCTA } from "@/features/landing/components/BottomCTA";

// Epic 1 — 메인 랜딩 (Story 1.1 히어로 + 1.2 포인트/사용처 + 1.3 하단 CTA)
export default function HomePage() {
  return (
    <>
      <main className={styles.hero}>
        <div className={styles.eyebrow}>Rollpe by Glimory</div>
        <h1 className={styles.title}>
          <span className={styles.highlight}>마음을 모은</span>
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
      <PointSection />
      <UseCases />
      <BottomCTA />
    </>
  );
}
