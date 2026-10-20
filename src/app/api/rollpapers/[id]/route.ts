// GET /api/rollpapers/:id — 캔버스 조회 (메모 목록 포함)
// PATCH /api/rollpapers/:id — 캔버스 설정 수정 (배경색 등, owner_token 필요)
// TRD §3 API 설계
import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { rollpapers, notes } from "@/db/schema";
import { finishedResponse } from "@/lib/finished";
import { MODE_CONFIG, type RollpaperMode } from "@/lib/theme";

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

  const body = (await request.json().catch(() => ({}))) as {
    bgColor?: string;
    finished?: boolean;
    fixedFields?: Record<string, unknown>;
  };

  // 무드등 고정 칸 — 모드가 가진 칸(zones)의 키만, 문구는 짧게, 사진은 이미지 데이터 URL만 받는다. 빈 문자열이면 비움
  let fixedFields: Record<string, string> | undefined;
  if (body.fixedFields) {
    if (rollpaper.finishedAt) return finishedResponse();
    const zones = MODE_CONFIG[rollpaper.mode as RollpaperMode].zones ?? [];
    fixedFields = { ...((rollpaper.fixedFields as Record<string, string> | null) ?? {}) };
    for (const z of zones) {
      const v = body.fixedFields[z.key];
      if (typeof v !== "string") continue;
      const ok = z.kind === "photo" ? v.startsWith("data:image/") && v.length < 2_000_000 : v.length <= 60;
      if (v === "") delete fixedFields[z.key];
      else if (ok) fixedFields[z.key] = v;
    }
  }

  const [updated] = await db
    .update(rollpapers)
    .set({
      bgColor: body.bgColor,
      fixedFields,
      // 완성 = 시각 기록, 다시 열기 = null. 완성 중에는 방장만 이 값을 바꿀 수 있음(위에서 방장 확인)
      finishedAt: body.finished === true ? new Date() : body.finished === false ? null : undefined,
    })
    .where(eq(rollpapers.id, id))
    .returning();

  return NextResponse.json(updated);
}
