// 전역 breakpoint / 모드별 상수
// 출처: ROLLPE_TRD.md §4 (반응형), §2 데이터 모델, PRD §5-1/§5-2

export const BREAKPOINT_MOBILE = 760;

export type RollpaperMode = "online" | "mood_a" | "mood_b_8" | "mood_b_a4";

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
}

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
  },
  mood_b_8: {
    label: "무드등 B (8인치)",
    capacity: 8,
    bgColor: "#ffffff",
    locked: true,
    stickerEnabled: false,
    bgPickerEnabled: false,
  },
  mood_b_a4: {
    label: "무드등 B (A4)",
    capacity: 20,
    bgColor: "#ffffff",
    locked: true,
    stickerEnabled: false,
    bgPickerEnabled: false,
  },
};
