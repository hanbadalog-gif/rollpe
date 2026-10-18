// POST /api/rollpapers/:id/notes — 메모 추가 (정원 체크 포함, TRD §3 / PRD §5-2)
import { NextRequest, NextResponse } from "next/server";
import { eq, count, max } from "drizzle-orm";
import { db } from "@/db";
import { rollpapers, notes } from "@/db/schema";
import { generateToken } from "@/lib/tokens";
import { gridPosition } from "@/lib/gridPosition";
import { finishedResponse } from "@/lib/finished";
import { MODE_CONFIG, type RollpaperMode } from "@/lib/theme";
import type { CreateNoteInput } from "@/features/canvas/types";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/rollpapers/[id]/notes">,
) {
  const { id } = await ctx.params;

  const [rollpaper] = await db.select().from(rollpapers).where(eq(rollpapers.id, id));
  if (!rollpaper) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "롤링페이퍼를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  if (rollpaper.finishedAt) return finishedResponse();

  const [{ value: noteCount }] = await db
    .select({ value: count() })
    .from(notes)
    .where(eq(notes.rollpaperId, id));

  const cfg = MODE_CONFIG[rollpaper.mode as RollpaperMode];
  if (noteCount >= cfg.capacity) {
    return NextResponse.json(
      { code: "CAPACITY_FULL", message: "정원이 다 찼어요." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as CreateNoteInput | null;
  if (!body?.type) {
    return NextResponse.json(
      { code: "INVALID_BODY", message: "type은 필수입니다." },
      { status: 400 },
    );
  }

  // 새 메모는 항상 맨 위 — 기존 최대 z + 1 (서로 다른 값이어야 "앞으로/뒤로" 중간 삽입이 가능)
  const [{ top }] = await db.select({ top: max(notes.z) }).from(notes).where(eq(notes.rollpaperId, id));
  const editToken = generateToken();
  const auto = gridPosition(noteCount);

  const [note] = await db
    .insert(notes)
    .values({
      rollpaperId: id,
      type: body.type,
      fromName: body.fromName,
      content: body.content,
      font: body.font,
      fontSize: body.fontSize,
      bold: body.bold ?? false,
      textColor: body.textColor,
      bgColor: body.bgColor,
      borderColor: body.borderColor,
      photoUrl: body.photoUrl,
      posX: body.posX ?? auto.posX,
      posY: body.posY ?? auto.posY,
      rotation: body.rotation ?? auto.rotation,
      scale: body.scale,
      z: (top ?? 0) + 1,
      editToken,
    })
    .returning();

  return NextResponse.json({ ...note, editToken }, { status: 201 });
}
