// GET /api/rollpapers/:id — 캔버스 조회 (메모 목록 포함)
// PATCH /api/rollpapers/:id — 캔버스 설정 수정 (배경색 등, owner_token 필요)
// TRD §3 API 설계
import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { rollpapers, notes } from "@/db/schema";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/rollpapers/[id]">,
) {
  const { id } = await ctx.params;

  const [rollpaper] = await db.select().from(rollpapers).where(eq(rollpapers.id, id));
  if (!rollpaper) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "롤링페이퍼를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const rollpaperNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.rollpaperId, id))
    .orderBy(asc(notes.createdAt));

  return NextResponse.json({ ...rollpaper, notes: rollpaperNotes });
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/rollpapers/[id]">,
) {
  const { id } = await ctx.params;
  const ownerToken = request.headers.get("x-owner-token");

  const [rollpaper] = await db.select().from(rollpapers).where(eq(rollpapers.id, id));
  if (!rollpaper) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "롤링페이퍼를 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  if (!ownerToken || ownerToken !== rollpaper.ownerToken) {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "방장만 캔버스 설정을 변경할 수 있습니다." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { bgColor?: string };

  const [updated] = await db
    .update(rollpapers)
    .set({ bgColor: body.bgColor })
    .where(eq(rollpapers.id, id))
    .returning();

  return NextResponse.json(updated);
}
