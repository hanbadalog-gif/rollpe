import styles from "./use-cases.module.css";

// PRD §9 "사용처(메인 노출 문구)" 11종 그대로
const CASES = [
  { icon: "🎂", label: "생일" },
  { icon: "👋", label: "퇴사·송별" },
  { icon: "🎓", label: "졸업" },
  { icon: "🌸", label: "스승의 날" },
  { icon: "🎁", label: "부모님 생신" },
  { icon: "💍", label: "결혼 축하" },
  { icon: "🏅", label: "정년퇴임·은퇴" },
  { icon: "📚", label: "수능 응원" },
  { icon: "💑", label: "연인 기념일" },
  { icon: "🎉", label: "환영·첫 출근" },
  { icon: "🎊", label: "새해·연말 덕담" },
];

/** Epic 1 Story 1.2 — "이럴 때 사용해요" 아이콘 카드 */
export function UseCases() {
  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>이럴 때 사용해요</h3>
      <div className={styles.grid}>
        {CASES.map((c) => (
          <div key={c.label} className={styles.card}>
            <span className={styles.icon}>{c.icon}</span>
            <span className={styles.label}>{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
