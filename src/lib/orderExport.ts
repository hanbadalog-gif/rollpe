// 글리모리에 전달하는 JSON — 이미지는 "글자 배치", JSON은 "이미지로 보이지 않는 정보(글씨체·글자 크기·색·정확한 문구)" 확인용.
// DB에 저장된 값(font는 CSS 문자열)을 사람이 읽을 수 있는 이름으로 풀어서 함께 내려준다.
import { MODE_CONFIG, type RollpaperMode } from "@/lib/theme";

const FONT_NAMES: Record<string, { name: string; family: string }> = {
  "'Gaegu',cursive": { name: "손글씨체", family: "Gaegu" },
  "'Gowun Batang',serif": { name: "세리프체", family: "Gowun Batang" },
  inherit: { name: "고딕체", family: "Noto Sans KR" },
};

export function describeFont(css: string | null | undefined) {
  if (!css) return { name: "고딕체", family: "Noto Sans KR" };
  return FONT_NAMES[css] ?? { name: "기타", family: css };
}

type NoteLike = Record<string, unknown> & { font?: string | null; fontSize?: number | null };

/** 메모 한 건에 읽기 쉬운 글씨체 정보를 덧붙인다 (원래 값은 그대로 유지) */
export function withFontInfo<T extends NoteLike>(n: T) {
  const f = describeFont(n.font);
  return { ...n, fontName: f.name, fontFamily: f.family };
}

/** snapshot 전체를 글리모리용으로 보강 — 메모별 글씨체 + 고정 칸 글씨 정보 + 단위 설명 */
export function enrichSnapshot(snapshot: unknown) {
  const s = (snapshot ?? {}) as { mode?: string; notes?: NoteLike[]; fixedFields?: Record<string, string> | null };
  const cfg = s.mode ? MODE_CONFIG[s.mode as RollpaperMode] : undefined;
  return {
    ...s,
    notes: (s.notes ?? []).map(withFontInfo),
    fixedTextStyle: cfg?.zones ? { fontFamily: "Gaegu", fontWeight: "bold (700)", color: cfg.fixedTextColor ?? null } : undefined,
    guide: {
      image: "orders의 이미지(PNG)가 완성된 글자 배치입니다 (가로 2400px 이상, 300dpi).",
      fontSize: "fontSize는 캔버스 폭 360px 기준 px입니다. 무드등 캔버스는 폭에 비례해 확대되므로 이미지 기준으로 환산하세요.",
      position: "posX/posY는 캔버스 폭·높이 대비 %, width/height는 메모 폭·최소 높이(캔버스 대비 %), rotation은 도(°), scale은 확대 배율입니다.",
    },
  };
}
