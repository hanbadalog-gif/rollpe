// 수정 권한 토큰 관리 (localStorage)
// 출처: ROLLPE_TRD.md §5 인증/보안 — "다른 기기 접속 시 토큰이 없으므로 수정 버튼 비활성화"
// 2순위 로그인 연동 시 이 토큰들을 /api/auth/claim 으로 전송해 계정에 귀속 (TRD §5-1)

import { showToast } from "@/components/Toast";

const STORAGE_KEY = "rollpe_edit_tokens";

// 저장 실패(용량 초과·프라이빗 모드 등)를 조용히 삼키면 수정/삭제 권한·/my 목록을 잃는 걸 모른다
function notifySaveFailed() {
  showToast("이 기기에 저장하지 못했어요. 링크를 꼭 따로 복사해두세요.");
}

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
    notifySaveFailed(); // 수정 권한은 못 받는 것으로 처리
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
    notifySaveFailed();
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
    notifySaveFailed();
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
