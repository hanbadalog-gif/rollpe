// 수정 권한 토큰 관리 (localStorage)
// 출처: ROLLPE_TRD.md §5 인증/보안 — "다른 기기 접속 시 토큰이 없으므로 수정 버튼 비활성화"
// 2순위 로그인 연동 시 이 토큰들을 /api/auth/claim 으로 전송해 계정에 귀속 (TRD §5-1)

const STORAGE_KEY = "rollpe_edit_tokens";

type TokenMap = Record<string, Record<string, string>>; // rollpaperId -> { noteId: editToken }

function readAll(): TokenMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TokenMap) : {};
  } catch {
    return {};
  }
}

function writeAll(map: TokenMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // localStorage 접근 불가(프라이빗 모드 등) — 조용히 무시, 수정 권한은 그냥 못 받는 것으로 처리
  }
}

export function saveEditToken(rollpaperId: string, noteId: string, token: string) {
  const all = readAll();
  all[rollpaperId] = { ...(all[rollpaperId] ?? {}), [noteId]: token };
  writeAll(all);
}

export function getEditToken(rollpaperId: string, noteId: string): string | null {
  const all = readAll();
  return all[rollpaperId]?.[noteId] ?? null;
}

export function removeEditToken(rollpaperId: string, noteId: string) {
  const all = readAll();
  if (all[rollpaperId]) {
    delete all[rollpaperId][noteId];
    writeAll(all);
  }
}

/** 로그인 연동(2순위) 대비 — 전체 토큰 목록을 claim API로 보낼 때 사용 */
export function getAllEditTokens(): TokenMap {
  return readAll();
}

const OWNER_STORAGE_KEY = "rollpe_owner_tokens";

export function saveOwnerToken(rollpaperId: string, token: string) {
  try {
    const raw = window.localStorage.getItem(OWNER_STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[rollpaperId] = token;
    window.localStorage.setItem(OWNER_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // 무시
  }
}

export function getOwnerToken(rollpaperId: string): string | null {
  try {
    const raw = window.localStorage.getItem(OWNER_STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return map[rollpaperId] ?? null;
  } catch {
    return null;
  }
}

// 수정/8번 피드백 — 링크 복사 전에 뒤로가기/튕김으로 생성 직후 페이지를 나가면 되돌아올 방법이
// 없던 문제. 만든 롤링페이퍼 목록을 로컬에 남겨서 /my 에서 다시 찾을 수 있게 함
const MY_ROLLPAPERS_KEY = "rollpe_my_rollpapers";

export interface MyRollpaper {
  id: string;
  toName: string;
  mode: string;
  createdAt: number;
}

export function saveMyRollpaper(id: string, toName: string, mode: string) {
  try {
    const raw = window.localStorage.getItem(MY_ROLLPAPERS_KEY);
    const list = raw ? (JSON.parse(raw) as MyRollpaper[]) : [];
    const next = [{ id, toName, mode, createdAt: Date.now() }, ...list.filter((r) => r.id !== id)];
    window.localStorage.setItem(MY_ROLLPAPERS_KEY, JSON.stringify(next));
  } catch {
    // 무시
  }
}

export function getMyRollpapers(): MyRollpaper[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MY_ROLLPAPERS_KEY);
    return raw ? (JSON.parse(raw) as MyRollpaper[]) : [];
  } catch {
    return [];
  }
}
