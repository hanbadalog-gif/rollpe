// POST /api/admin/enter {id, password} — /admin 로그인. 맞으면 httpOnly 쿠키를 세팅한다 (주소에 비밀값이 남는 방식은 쓰지 않는다)
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminAuth";
import { verifyAdmin } from "@/lib/adminCredentials";

// 비밀번호가 짧아도 무차별 대입이 어렵도록 IP당 10분에 5번까지만 실패 허용.
// 서버리스 인스턴스별 메모리라 인스턴스가 바뀌면 초기화됨 — 완전한 방어는 아니고 속도를 늦추는 용도
const FAIL_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const fails = new Map<string, number[]>();

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}
function isLocked(ip: string) {
  const recent = (fails.get(ip) ?? []).filter((t) => Date.now() - t < WINDOW_MS);
  fails.set(ip, recent);
  return recent.length >= FAIL_LIMIT;
}
function recordFail(ip: string) {
  fails.set(ip, [...(fails.get(ip) ?? []), Date.now()]);
}
const LOCKED = () =>
  NextResponse.json({ code: "TOO_MANY", message: "시도가 너무 많아요. 10분 뒤에 다시 시도해주세요." }, { status: 429 });

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { id?: string; password?: string } | null;
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const ip = clientIp(request);
  if (isLocked(ip)) return LOCKED();
  // 아이디·비밀번호 어느 쪽이 틀렸는지 알려주지 않는다. 입력값은 기록하지 않는다
  if (!id || !password || password.length > 200 || !verifyAdmin(id, password) || !process.env.ADMIN_SECRET) {
    recordFail(ip);
    return NextResponse.json({ code: "FORBIDDEN", message: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 403 });
  }

  // 로그인 성공 시 세션 쿠키 — 비밀번호 자체는 쿠키에 넣지 않는다
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, process.env.ADMIN_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
