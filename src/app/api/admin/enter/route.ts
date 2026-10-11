// GET /api/admin/enter?token=...&next=/admin/xxx — 토큰 검증 후 httpOnly 쿠키 세팅, URL에서 토큰 제거
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const next = searchParams.get("next") || "/admin";

  if (!token || token !== process.env.ADMIN_SECRET) {
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
