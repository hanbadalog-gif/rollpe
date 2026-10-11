import { cookies } from "next/headers";

export const ADMIN_COOKIE = "rollpe_admin";

/** 서버 컴포넌트/라우트 핸들러에서 호출 — GLIMORY 대표 전용 접근 확인 */
export async function isAdmin() {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === process.env.ADMIN_SECRET;
}
