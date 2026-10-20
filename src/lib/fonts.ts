// 글씨체 — 메모 글쓰기 패널과 무드등 고정 칸 입력이 같은 목록을 쓴다 (페이지/4.JPG: 손글씨체/세리프체/고딕체)
export const FONTS = [
  { label: "손글씨체", value: "'Gaegu',cursive" },
  { label: "세리프체", value: "'Gowun Batang',serif" },
  { label: "고딕체", value: "inherit" },
];

// 고정 칸 글자 크기 — 캔버스 폭 대비 cqw (기본은 기존 칸 크기 4.6)
export const ZONE_SIZES = [
  { label: "작게", value: 3.4 },
  { label: "보통", value: 4.6 },
  { label: "크게", value: 6.2 },
];

export interface ZoneStyle {
  font: string;
  size: number;
  bold: boolean;
}

export const DEFAULT_ZONE_STYLE: ZoneStyle = { font: FONTS[0].value, size: 4.6, bold: true };

/** 저장된 JSON 문자열 → 스타일 (없거나 이상하면 기본값). 서버·클라이언트 공용 */
export function parseZoneStyle(raw: string | null | undefined): ZoneStyle {
  if (!raw) return DEFAULT_ZONE_STYLE;
  try {
    const o = JSON.parse(raw) as Partial<ZoneStyle>;
    const font = FONTS.some((f) => f.value === o.font) ? (o.font as string) : DEFAULT_ZONE_STYLE.font;
    const size = typeof o.size === "number" && o.size >= 2 && o.size <= 10 ? o.size : DEFAULT_ZONE_STYLE.size;
    return { font, size, bold: typeof o.bold === "boolean" ? o.bold : DEFAULT_ZONE_STYLE.bold };
  } catch {
    return DEFAULT_ZONE_STYLE;
  }
}
