import Link from "next/link";
import styles from "./landing.module.css";

// 페이지/1.jpg 레퍼런스 — 로고+악센트마크 헤더, 보라 패널 위 메모 콜라주, 하단 2버튼.
// 1.jpg는 스크롤 없는 단일 화면이라 그 아래 다른 섹션(Point/사용처/하단CTA)은 두지 않는다.
export default function HomePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 브랜드 로고, 단순 정적 이미지 */}
        <img src="/brand/logo.png" alt="Rollpe" className={styles.logoImg} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mark.png" alt="" className={styles.markImg} aria-hidden />
      </header>

      <main className={styles.main}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>
            롤링페이퍼로
            <br />
            <span className={styles.highlight}>감동을 선물</span>하세요
          </h1>
        </div>

        <div className={styles.heroPanel}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 레퍼런스(수정/11.png) 콜라주를 그대로 사용 */}
          <img src="/brand/hero-cards.png" alt="" className={styles.heroCardsImg} aria-hidden />
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
    </div>
  );
}
