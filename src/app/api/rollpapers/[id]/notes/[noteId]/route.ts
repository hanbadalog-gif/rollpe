// PATCH /api/rollpapers/:id/notes/:noteId — 메모 수정 (edit_token 필요)
// DELETE /api/rollpapers/:id/notes/:noteId — 메모 삭제 (edit_token 또는 owner_token)
// TRD §3, epics.md Story 3.4 / 3.5
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { rollpapers, notes } from "@/db/schema";

async function loadNoteAndRollpaper(rollpaperId: string, noteId: string) {
  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.rollpaperId, rollpaperId)));
  if (!note) return null;
  const [rollpaper] = await db
    .select()
    .from(rollpapers)
    .where(eq(rollpapers.id, rollpaperId));
  return { note, rollpaper };
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/rollpapers/[id]/notes/[noteId]">,
) {
  const { id, noteId } = await ctx.params;
  const editToken = request.headers.get("x-edit-token");

  const found = await loadNoteAndRollpaper(id, noteId);
  if (!found) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "메모를 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  if (!editToken || editToken !== found.note.editToken) {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "이 글은 작성한 기기에서만 수정할 수 있어요." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const allowed = [
    "content",
    "font",
    "fontSize",
    "bold",
    "textColor",
    "bgColor",
    "borderColor",
  ] as const;
  const data: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const [updated] = await db
    .update(notes)
    .set(data)
    .where(eq(notes.id, noteId))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/rollpapers/[id]/notes/[noteId]">,
) {
  const { id, noteId } = await ctx.params;
  const editToken = request.headers.get("x-edit-token");
  const ownerToken = request.headers.get("x-owner-token");

  const found = await loadNoteAndRollpaper(id, noteId);
  if (!found) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "메모를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const isAuthor = editToken && editToken === found.note.editToken;
  const isOwner = ownerToken && found.rollpaper && ownerToken === found.rollpaper.ownerToken;

  if (!isAuthor && !isOwner) {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "삭제 권한이 없습니다." },
      { status: 403 },
    );
  }

  await db.delete(notes).where(eq(notes.id, noteId));
  return new NextResponse(null, { status: 204 });
}
