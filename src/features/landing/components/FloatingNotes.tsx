import styles from "./floating-notes.module.css";

// 히어로 우측 장식용 — 실제 캔버스 메모 톤(--paper-*, Gaegu)을 그대로 재사용한 예시 메시지
const NOTES = [
  { from: "민지", text: "항상 웃는 오늘 간직하고\n행복만 가득하길", paper: "a", className: "n1" },
  { from: "재인", text: "사랑하는 친구야\n결혼 축하해 Love forever ♡", paper: "b", className: "n2" },
  { from: "성현", text: "새로운 시작을 응원해.\n어디서든 잘 해낼 거야, 늘 네 편이야.", paper: "c", className: "n3" },
  { from: "모두가", text: "오늘의 주인공\n꽃길만 걸어요", paper: "d", className: "n4" },
];

/** 히어로 영상 아래 코르크보드 상단 장식 (수정\8.png 피드백 — 영상 위에 겹쳐있던 걸 아래로 이동) */
export function FloatingNotes() {
  return (
    <div className={styles.wrap} aria-hidden>
      {NOTES.map((n) => (
        <div key={n.from} className={`${styles.note} ${styles[n.className]} ${styles[`paper${n.paper}`]}`}>
          <p>{n.text}</p>
          <span>— {n.from}</span>
        </div>
      ))}
    </div>
  );
}
