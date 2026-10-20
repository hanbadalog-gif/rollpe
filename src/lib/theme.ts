// 전역 breakpoint / 모드별 상수
// 출처: ROLLPE_TRD.md §4 (반응형), §2 데이터 모델, PRD §5-1/§5-2

export const BREAKPOINT_MOBILE = 760;

export type RollpaperMode = "online" | "mood_a" | "mood_b_8" | "mood_b_a4";

/** 무드등 고정 레이아웃 칸 — 위치/크기는 캔버스 대비 %. 방장이 눌러서 직접 입력한다 (참고: 7_0.jpg 파란 선 부분) */
export interface Zone {
  key: "title" | "photo" | "caption" | "label";
  kind: "text" | "photo";
  x: number;
  y: number;
  w: number;
  h: number;
  placeholder: string;
  /** 비어 있을 때 보여줄 기본 문구 */
  defaultText?: string;
  rotate?: number;
}

/** 새 메모가 차례로 들어가는 자리 — 고정 칸을 피해서 행 단위로 채운다 */
export type SlotRows = { y: number; xs: number[] }[];

export interface ModeConfig {
  label: string;
  /** 정원. 온라인 모드는 무제한 */
  capacity: number;
  bgColor: string; // CSS 변수 참조 문자열
  /** 모드2 고정 비율 캔버스 여부 (TRD §1 모드전환=새세션 확정, PRD §3-1) */
  locked: boolean;
  stickerEnabled: boolean;
  bgPickerEnabled: boolean;
  /** 고정 글자색 (예: 유형A는 흰색 고정) */
  fixedTextColor?: string;
  zones?: Zone[];
  slots?: SlotRows;
  /** 메모가 머물 수 있는 영역(캔버스 대비 %) — 무드등만 */
  bounds?: { right: number; bottom: number };
}

// 유형 A — 7_1.jpg 배경(검정 판 + 가운데 흰 칸)
const ZONES_A: Zone[] = [
  { key: "title", kind: "text", x: 3, y: 27, w: 27, h: 12, placeholder: "소속·직함" },
  { key: "photo", kind: "photo", x: 31.6, y: 25.4, w: 38.8, h: 37, placeholder: "+ 사진" },
  { key: "caption", kind: "text", x: 27, y: 63.5, w: 46, h: 7, placeholder: "사진 아래 문구" },
  { key: "label", kind: "text", x: 70.5, y: 50.5, w: 26, h: 7, placeholder: "라벨", defaultText: "오늘의 주인공", rotate: -6 },
];
const SLOTS_A: SlotRows = [
  { y: 2, xs: [2, 35, 68] },
  { y: 21, xs: [69] },
  { y: 48, xs: [1] },
  { y: 72, xs: [2, 35, 68] },
];

// 유형 B — 드로잉 액자: 가운데 일러스트 사진 + 이름 문구, 나머지는 글로 채움 (참고: B제품 예시.png)
const ZONES_B8: Zone[] = [
  { key: "photo", kind: "photo", x: 31, y: 34, w: 38, h: 25, placeholder: "+ 사진" },
  { key: "caption", kind: "text", x: 20, y: 60.5, w: 60, h: 6, placeholder: "사진 아래 문구 (예: 이름)" },
];
const SLOTS_B8: SlotRows = [
  { y: 1, xs: [2, 35, 68] },
  { y: 35, xs: [1, 69] },
  { y: 71, xs: [2, 35, 68] },
];
const ZONES_BA4: Zone[] = [
  { key: "photo", kind: "photo", x: 31, y: 36, w: 38, h: 22, placeholder: "+ 사진" },
  { key: "caption", kind: "text", x: 20, y: 59, w: 60, h: 5, placeholder: "사진 아래 문구 (예: 이름)" },
];
const SLOTS_BA4: SlotRows = [
  { y: 1, xs: [2, 35, 68] },
  { y: 13, xs: [2, 35, 68] },
  { y: 25, xs: [2, 35, 68] },
  { y: 38, xs: [1, 69] },
  { y: 50, xs: [1, 69] },
  { y: 66, xs: [2, 35, 68] },
  { y: 78, xs: [2, 35, 68] },
];

export const MODE_CONFIG: Record<RollpaperMode, ModeConfig> = {
  online: {
    label: "온라인",
    capacity: Infinity,
    bgColor: "var(--surface)",
    locked: false,
    stickerEnabled: true,
    bgPickerEnabled: true,
  },
  mood_a: {
    label: "무드등 A (아크릴)",
    capacity: 8,
    bgColor: "var(--mood-dark)",
    locked: true,
    stickerEnabled: false,
    bgPickerEnabled: false,
    fixedTextColor: "#ffffff",
    zones: ZONES_A,
    slots: SLOTS_A,
    bounds: { right: 100, bottom: 93 }, // 아래 받침(이미지 하단 7%)은 제외
  },
  mood_b_8: {
    label: "무드등 B (8인치)",
    capacity: 8,
    bgColor: "#ffffff",
    locked: true,
    stickerEnabled: false,
    bgPickerEnabled: false,
    fixedTextColor: "#222222", // 흰 배경이라 검정 계열 고정 (기획서: 검정 권장)
    zones: ZONES_B8,
    slots: SLOTS_B8,
    bounds: { right: 100, bottom: 100 },
  },
  mood_b_a4: {
    label: "무드등 B (A4)",
    capacity: 20,
    bgColor: "#ffffff",
    locked: true,
    stickerEnabled: false,
    bgPickerEnabled: false,
    fixedTextColor: "#222222",
    zones: ZONES_BA4,
    slots: SLOTS_BA4,
    bounds: { right: 100, bottom: 100 },
  },
};
