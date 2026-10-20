// GET /api/admin/rollpapers/:id/export — 대표 전용 JSON 내보내기(문구+사진 포함, 외부 AI 입력용)
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rollpapers, notes } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";
import { withFontInfo } from "@/lib/orderExport";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/rollpapers/[id]/export">,
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ code: "FORBIDDEN", message: "접근 권한이 없습니다." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const [rollpaper] = await db.select().from(rollpapers).where(eq(rollpapers.id, id));
  if (!rollpaper) {
    return NextResponse.json({ code: "NOT_FOUND", message: "롤링페이퍼를 찾을 수 없습니다." }, { status: 404 });
  }
  const noteRows = await db.select().from(notes).where(eq(notes.rollpaperId, id));

  const payload = {
    rollpaperId: rollpaper.id,
    toName: rollpaper.toName,
    mode: rollpaper.mode,
    fixedFields: rollpaper.fixedFields,
    createdAt: rollpaper.createdAt,
    noteCount: noteRows.length,
    notes: noteRows.map(({ editToken: _t, userId: _u, rollpaperId: _r, ...n }) =>
      withFontInfo(n), // 문구 + 글씨체(fontName/fontFamily) + 글자 크기·색·위치·회전·크기 — 사진은 데이터 URL(base64)
    ),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="rollpe-${id}.json"`,
    },
  });
}
