import Link from "next/link";
import styles from "./landing.module.css";

/* 수정/12.png 피드백 — 세 카드의 흰 배경 크기가 서로 다르게 보이던 문제. 레퍼런스처럼
   콘텐츠량 차이로 자연스럽게 다르게 두는 대신, 글씨량을 가운데 카드와 비슷하게 맞춰서
   카드 크기 자체를 균일하게 만듦(아래 .heroCard 폭도 다시 균일하게 조정). */
const HERO_NOTES = [
  { from: "지훈", text: "생일 정말 축하해!\n올 한 해도 네가\n하는 모든 일들이\n다 잘 풀리길 바라고\n항상 건강하고\n행복하길 바랄게 :)" },
  { from: "현정이", text: "교수님\n스승의 날 너무 축하드립니다~\n교수님과 함께 했던 시간들은\n정말 즐거웠어요. 깊고 가득한\n강의 늘 감사했습니다\n교수님 존경합니다 :)" },
  { from: "수연", text: "그동안 정말\n고생 많았어요!\n새로운 시작도\n늘 응원할게요.\n자주 연락하고\n지내요 우리 :)" },
];

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
        {/* 페이지/1.jpg 재확인 — 헤드라인은 흰 배경 위, 파란 패널은 메모지 구역에만 적용 */}
        <div className={styles.heroText}>
          <h1 className={styles.title}>
            롤링페이퍼로
            <br />
            <span className={styles.highlight}>감동을 선물</span>하세요
          </h1>
        </div>

        <div className={styles.heroPanel}>
          <div className={styles.heroCards}>
            {HERO_NOTES.map((note) => (
              <div key={note.from} className={styles.heroCard}>
                <p className={styles.heroCardText}>{note.text}</p>
                <span className={styles.heroCardFrom}>
                  From <span className={styles.heroCardName}>{note.from}</span>
                </span>
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
    </div>
  );
}
