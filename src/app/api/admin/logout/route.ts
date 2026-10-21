// POST /api/admin/logout — 관리자 쿠키를 지우고 /admin 로그인 화면으로 돌려보낸다
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin", request.url), 303);
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
