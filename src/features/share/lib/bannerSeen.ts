// Epic 7 Story 7.3 — 전환 배너는 롤링페이퍼당 1회만 노출
const KEY = "rollpe_banner_seen";

export function hasBannerBeenSeen(rollpaperId: string): boolean {
  try {
    const raw = window.localStorage.getItem(KEY);
    const seen: string[] = raw ? JSON.parse(raw) : [];
    return seen.includes(rollpaperId);
  } catch {
    return false;
  }
}

export function markBannerSeen(rollpaperId: string) {
  try {
    const raw = window.localStorage.getItem(KEY);
    const seen: string[] = raw ? JSON.parse(raw) : [];
    if (!seen.includes(rollpaperId)) window.localStorage.setItem(KEY, JSON.stringify([...seen, rollpaperId]));
  } catch {
    // 무시 — 프라이빗 모드 등에서는 매번 다시 뜨는 정도로 허용
  }
}
