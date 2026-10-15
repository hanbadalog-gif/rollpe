import Link from "next/link";
import type { CSSProperties } from "react";
import styles from "./landing.module.css";
import { PointSection } from "@/features/landing/components/PointSection";
import { UseCases } from "@/features/landing/components/UseCases";
import { BottomCTA } from "@/features/landing/components/BottomCTA";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FloatingNotes } from "@/features/landing/components/FloatingNotes";

const HERO_NOTES = [
  { from: "채린", text: "졸업을 축하드립니다!\n나가서도 늘 응원할게요.\n힘들 때 언제든 연락줘요!" },
  { from: "현정이", text: "교수님\n스승의 날 너무 축하드립니다~\n교수님과 함께 했던 시간들은\n정말 즐거웠어요. 깊고 가득한\n강의 늘 감사했습니다\n교수님 존경합니다 :)" },
  { from: "쑥쑥", text: "선생님 너무 감사했어요\n우리 별처럼 빛나게\n해주셔서 오랫동안\n이렇게 와주셔서 보고싶을 거예요" },
];

// 페이지/1.jpg 레퍼런스 — 로고+악센트마크 헤더, 보라 패널 위 메모 콜라주, 하단 2버튼
export default function HomePage() {
  return (
    <>
      <header className={styles.header}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 브랜드 로고, 단순 정적 이미지 */}
        <img src="/brand/logo.png" alt="Rollpe" className={styles.logoImg} />
        <div className={styles.headerActions}>
          <ThemeToggle variant="light" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mark.png" alt="" className={styles.markImg} aria-hidden />
        </div>
      </header>

      <main>
        <div className={styles.heroText}>
          <h1 className={styles.title}>
            롤링페이퍼로
            <br />
            <span className={styles.highlight}>감동을 선물</span>하세요
          </h1>
        </div>

        <div className={styles.heroPanel}>
          <div className={styles.heroCards}>
            {HERO_NOTES.map((note, i) => (
              <div key={note.from} className={styles.heroCard} style={{ "--i": i } as CSSProperties}>
                <p className={styles.heroCardText}>{note.text}</p>
                <span className={styles.heroCardFrom}>From {note.from}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.heroCtaRow}>
          <Link href="/new" className={styles.btnAccent}>
            무료 롤링페이퍼 방 만들기
          </Link>
          <Link href="/gift" className={styles.btnGhost}>
            롤링페이퍼 무드등 선물하기
          </Link>
        </div>
      </main>

      <div className={styles.corkboard}>
        <FloatingNotes />
        <PointSection />
        <UseCases />
        <BottomCTA />
      </div>
    </>
  );
}
