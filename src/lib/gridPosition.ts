// 새 메모 기본 배치 — 서버(저장)와 클라이언트(낙관적 표시)가 같은 규칙을 쓰도록 공용
// 페이지/6_1.jpg 레퍼런스 — 메모지를 완전 랜덤이 아니라 "위 3장 / 중간 2장 / 아래 3장"
// 구조로 쌓이게 배치. 메모지 폭이 최대 캔버스의 30%(canvas.module.css .note)라
// 3칸 줄은 3개가 살짝씩 겹치며 꽉 차고, 2칸 줄은 그 사이(벽돌쌓기)에 걸치도록 함.
// 8장(한 바퀴)을 넘어가면 처음 자리로 돌아가 겹쳐 쌓는다 — 캔버스는 한 화면 크기라 아래로 이어 붙이면 화면 밖에 놓여 "추가가 안 된다"로 보였다.
const ROW_PATTERN: { y: number; xs: number[] }[] = [
  { y: 4, xs: [2, 35, 68] },
  { y: 33, xs: [18, 51] },
  { y: 62, xs: [2, 35, 68] },
];

/** 정해진 자리를 차례로 쓰고, 한 바퀴 돌면 처음 자리로 돌아온다(항상 캔버스 안) */
export function gridPosition(index: number, slots?: { y: number; xs: number[] }[]) {
  const pattern = slots ?? ROW_PATTERN;
  const perPage = pattern.reduce((sum, row) => sum + row.xs.length, 0);
  let within = index % perPage;
  for (const row of pattern) {
    if (within < row.xs.length) {
      const jitterX = Math.random() * 6 - 3;
      const jitterY = Math.random() * 6 - 3;
      return {
        posX: Math.max(0, Math.round(row.xs[within] + jitterX)), // 흔들림으로 캔버스 밖(음수)에 놓이지 않게
        posY: Math.max(0, Math.round(row.y + jitterY)),
        rotation: Math.round(Math.random() * 24 - 12),
      };
    }
    within -= row.xs.length;
  }
  // 이론상 도달 안 함(SLOTS_PER_PAGE로 나눈 나머지라) — 타입 안전을 위한 폴백
  return { posX: 10, posY: 10, rotation: 0 };
}
