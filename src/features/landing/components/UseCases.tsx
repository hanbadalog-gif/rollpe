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

/** Epic 1 Story 1.2 — "이럴 때 사용해요" 포토 카드 (dh2labs.kr "Real result" 참고) */
export function UseCases() {
  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>이럴 때 사용해요</h3>
      <div className={styles.grid}>
        {CASES.map((c) => (
          <div key={c.label} className={styles.card}>
            <div className={styles.photoWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 고정 11장 정적 에셋, next/image 설정 부담 대비 단순 img로 충분 */}
              <img
                src={`/images/usecases/${c.photo}.jpg`}
                alt={c.label}
                className={styles.photo}
                loading="lazy"
              />
            </div>
            <span className={styles.label}>{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
