import Link from "next/link";
import styles from "./landing.module.css";
import { PointSection } from "@/features/landing/components/PointSection";
import { UseCases } from "@/features/landing/components/UseCases";
import { BottomCTA } from "@/features/landing/components/BottomCTA";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FloatingNotes } from "@/features/landing/components/FloatingNotes";

// 롤링/0.JPG 레퍼런스 — 배경영상 히어로 대신 라이트 헤더 바 + Point 섹션이 첫 화면
export default function HomePage() {
  return (
    <>
      <header className={styles.header}>
        <span className={styles.logo}>
          Roll<span className={styles.logoAccent}>pe</span>
        </span>
        <div className={styles.headerActions}>
          <ThemeToggle variant="light" />
          <Link href="/new" className={styles.headerCta}>
            롤링페이퍼 만들기
          </Link>
        </div>
      </header>
      <div className={styles.corkboard}>
        <FloatingNotes />
        <PointSection />
        <UseCases />
        <BottomCTA />
      </div>
    </>
  );
}
