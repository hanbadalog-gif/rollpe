// 새 메모 기본 배치 — 서버(저장)와 클라이언트(낙관적 표시)가 같은 규칙을 쓰도록 공용
// 페이지/6_1.jpg 레퍼런스 — 메모지를 완전 랜덤이 아니라 "위 3장 / 중간 2장 / 아래 3장"
// 구조로 쌓이게 배치. 메모지 폭이 최대 캔버스의 30%(canvas.module.css .note)라
// 3칸 줄은 3개가 살짝씩 겹치며 꽉 차고, 2칸 줄은 그 사이(벽돌쌓기)에 걸치도록 함.
// 8장(ROW_PATTERN 한 바퀴)을 넘어가면 다음 "페이지"로 같은 패턴을 아래에 반복.
const ROW_PATTERN: { y: number; xs: number[] }[] = [
  { y: 4, xs: [2, 35, 68] },
  { y: 33, xs: [18, 51] },
  { y: 62, xs: [2, 35, 68] },
];
const SLOTS_PER_PAGE = ROW_PATTERN.reduce((sum, row) => sum + row.xs.length, 0);
const PAGE_HEIGHT = 92;

export function gridPosition(index: number) {
  const page = Math.floor(index / SLOTS_PER_PAGE);
  let within = index % SLOTS_PER_PAGE;
  for (const row of ROW_PATTERN) {
    if (within < row.xs.length) {
      const jitterX = Math.random() * 6 - 3;
      const jitterY = Math.random() * 6 - 3;
      return {
        posX: Math.round(row.xs[within] + jitterX),
        posY: Math.round(row.y + page * PAGE_HEIGHT + jitterY),
        rotation: Math.round(Math.random() * 24 - 12),
      };
    }
    within -= row.xs.length;
  }
  // 이론상 도달 안 함(SLOTS_PER_PAGE로 나눈 나머지라) — 타입 안전을 위한 폴백
  return { posX: 10, posY: 10 + page * PAGE_HEIGHT, rotation: 0 };
}
