// POST /api/rollpapers/:id/notes/:noteId/position — 드래그 위치 갱신 (경량 엔드포인트, TRD §3)
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/rollpapers/[id]/notes/[noteId]/position">,
) {
  const { id, noteId } = await ctx.params;
  const editToken = request.headers.get("x-edit-token");

  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.rollpaperId, id)));
  if (!note) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "메모를 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  if (!editToken || editToken !== note.editToken) {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "이 글은 작성한 기기에서만 수정할 수 있어요." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    posX?: number;
    posY?: number;
    rotation?: number;
  };

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const [updated] = await db
    .update(notes)
    .set({
      posX: body.posX != null ? clamp(body.posX) : undefined,
      posY: body.posY != null ? clamp(body.posY) : undefined,
      rotation: body.rotation,
      updatedAt: new Date(),
    })
    .where(eq(notes.id, noteId))
    .returning();

  return NextResponse.json(updated);
}
