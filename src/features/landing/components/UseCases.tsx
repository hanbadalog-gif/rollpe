import styles from "./use-cases.module.css";

// PRD §9 "사용처(메인 노출 문구)" 11종 그대로. 사진은 AI 생성(인물 없음, 오브제/무드 중심)
const CASES = [
  { photo: "birthday", label: "생일" },
  { photo: "farewell", label: "퇴사·송별" },
  { photo: "graduation", label: "졸업" },
  { photo: "teachersday", label: "스승의 날" },
  { photo: "parentsbday", label: "부모님 생신" },
  { photo: "wedding", label: "결혼 축하" },
  { photo: "retirement", label: "정년퇴임·은퇴" },
  { photo: "exam", label: "수능 응원" },
  { photo: "anniversary", label: "연인 기념일" },
  { photo: "welcome", label: "환영·첫 출근" },
  { photo: "newyear", label: "새해·연말 덕담" },
];

function Card({ c }: { c: (typeof CASES)[number] }) {
  return (
    <div className={styles.card}>
      <div className={styles.photoWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 고정 정적 에셋, next/image 설정 부담 대비 단순 img로 충분 */}
        <img src={`/images/usecases/${c.photo}.jpg`} alt={c.label} className={styles.photo} loading="lazy" />
      </div>
      <span className={styles.label}>{c.label}</span>
    </div>
  );
}

/** Epic 1 Story 1.2 — "이럴 때 사용해요" 좌→우 무한 마퀴 (youandus.co.kr "Materials" 참고) */
export function UseCases() {
  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>이럴 때 사용해요</h3>
      <div className={styles.marqueeViewport}>
        <div className={styles.marqueeTrack}>
          {CASES.map((c) => (
            <Card key={`a-${c.label}`} c={c} />
          ))}
          {/* 끊김 없이 이어지도록 동일 목록을 한 번 더 — aria-hidden으로 스크린리더 중복 방지 */}
          <div className={styles.marqueeDup} aria-hidden="true">
            {CASES.map((c) => (
              <Card key={`b-${c.label}`} c={c} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
