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

// 고객 피드백(롤페작업/0.jpg) — 메모지 위에 스티커를 얹는다. 스티커는 메모지 안에 두어 메모지와 함께 움직이고,
// PC와 모바일에서 같은 자리에 붙는다(화면 폭이 달라도 스티커만 따로 밀려나지 않음).
const HERO_STICKERS: Record<number, { src: string; cls: string }[]> = {
  0: [
    { src: "clip", cls: "stClip" },
    { src: "heart", cls: "stHeart" },
    { src: "star", cls: "stStar" },
  ],
  1: [
    { src: "balloon", cls: "stBalloon" },
    { src: "heart2", cls: "stHearts" },
  ],
  2: [
    { src: "thankyou", cls: "stThanks" },
    { src: "flower", cls: "stFlower" },
  ],
};

// 페이지/1.jpg 레퍼런스 — 로고+악센트마크 헤더, 보라 패널 위 메모 콜라주, 하단 2버튼.
// 1.jpg는 스크롤 없는 단일 화면이라 그 아래 다른 섹션(Point/사용처/하단CTA)은 두지 않는다.
export default function HomePage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.shell}>
          <header className={styles.header}>
            <Link href="/" aria-label="Rollpe 메인으로">
              {/* eslint-disable-next-line @next/next/no-img-element -- 브랜드 로고, 단순 정적 이미지 */}
              <img src="/brand/logo.png" alt="Rollpe" className={styles.logoImg} />
            </Link>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark.png" alt="" className={styles.markImg} aria-hidden />
          </header>

          {/* 페이지/1.jpg 재확인 — 헤드라인은 흰 배경 위, 파란 패널은 메모지 구역에만 적용 */}
          <div className={styles.heroText}>
            <h1 className={styles.title}>
              롤링페이퍼로
              <br />
              <span className={styles.highlight}>감동을 선물</span>하세요
            </h1>
          </div>
        </div>

        {/* 와이드뷰 피드백 — 파란 패널만 .shell 밖에 둬서 화면 폭 전체를 채움 */}
        <div className={styles.heroPanel}>
          <div className={styles.heroCards}>
            {HERO_NOTES.map((note, i) => (
              <div key={note.from} className={styles.heroCard}>
                {HERO_STICKERS[i].map((st) => (
                  // eslint-disable-next-line @next/next/no-img-element -- 정적 스티커 PNG
                  <img key={st.src} src={`/stickers/${st.src}.png`} alt="" className={`${styles.heroSticker} ${styles[st.cls]}`} draggable={false} />
                ))}
                <p className={styles.heroCardText}>{note.text}</p>
                <span className={styles.heroCardFrom}>
                  From <span className={styles.heroCardName}>{note.from}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.shell}>
          <div className={styles.heroCtaRow}>
            <Link href="/new" className={styles.btnAccent}>
              무료 롤링페이퍼 방 만들기
            </Link>
            <Link href="/gift" className={styles.btnGhost}>
              롤링페이퍼 무드등 <span className={styles.btnGhostBlack}>선물하기</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
