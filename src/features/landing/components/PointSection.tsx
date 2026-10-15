import type { CSSProperties } from "react";
import styles from "./point-section.module.css";

const SAMPLE_NOTES = [
  { from: "강미나", text: "항상 응원할게요! 앞으로도 지금처럼 멋지게 나아가요." },
  { from: "박지훈", text: "그동안 고생 많았어요. 다음에도 함께해요 :)" },
  { from: "이수연", text: "축하해요! 오늘 하루도 행복한 일만 가득하길." },
];

/** Epic 1 Story 1.2 — 포인트 1·2 (롤링/0.JPG 레퍼런스 — 라벤더 박스 + 카드 미리보기) */
export function PointSection() {
  return (
    <section className={styles.section}>
      <div className={styles.pointBlock}>
        <div className={styles.pointText}>
          <span className={styles.badge}>POINT 1</span>
          <h2>누구나 손쉽게, 온라인 롤링 페이퍼를 만들 수 있어요</h2>
          <p>로그인 없이 자유롭게 만들어요.</p>
        </div>
        <div className={styles.cardStack}>
          {SAMPLE_NOTES.map((note, i) => (
            <div key={note.from} className={styles.card} style={{ "--i": i } as CSSProperties}>
              <div className={styles.cardFrom}>From. {note.from}</div>
              <p className={styles.cardText}>{note.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.pointBlock} ${styles.pointBlockReverse}`}>
        <div className={styles.pointText}>
          <span className={styles.badge}>POINT 2</span>
          <h2>롤링페이퍼로만 끝내기 아쉽다구요?</h2>
          <p>모아진 메시지를 커스텀 무드등으로 제작할 수 있어요.</p>
        </div>
        <div className={styles.lampPreview}>
          <span className={styles.lampGlow} />
          <span className={styles.lampIcon}>🕯️</span>
          <span className={styles.lampLabel}>나만의 무드등</span>
        </div>
      </div>
    </section>
  );
}
