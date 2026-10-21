import { cookies } from "next/headers";

export const ADMIN_COOKIE = "rollpe_admin_session"; // 이름을 바꾸면 이전에 발급된(30일짜리) 쿠키는 즉시 무효가 된다

/** 서버 컴포넌트/라우트 핸들러에서 호출 — GLIMORY 대표 전용 접근 확인 */
export async function isAdmin() {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === process.env.ADMIN_SECRET;
}
