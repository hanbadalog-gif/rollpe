// GET /api/admin/enter?token=...&next=/admin/xxx — 토큰 검증 후 httpOnly 쿠키 세팅, URL에서 토큰 제거
// POST /api/admin/enter {token} — /admin 화면의 비밀번호 입력창용(주소에 토큰이 남지 않음)
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminAuth";

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

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const next = searchParams.get("next") || "/admin";

  const ip = clientIp(request);
  if (isLocked(ip)) return LOCKED();
  if (!token || token !== process.env.ADMIN_SECRET) {
    recordFail(ip);
    return NextResponse.json({ code: "FORBIDDEN", message: "토큰이 올바르지 않습니다." }, { status: 403 });
  }

  const res = NextResponse.redirect(new URL(next, origin));
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30일
    path: "/",
  });
  return res;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  const token = body?.token?.trim();

  const ip = clientIp(request);
  if (isLocked(ip)) return LOCKED();
  if (!token || token !== process.env.ADMIN_SECRET) {
    recordFail(ip);
    return NextResponse.json({ code: "FORBIDDEN", message: "비밀번호가 올바르지 않습니다." }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
