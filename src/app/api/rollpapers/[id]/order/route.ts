// POST /api/rollpapers/:id/order — 무드등 제작 요청 (방장 전용, 요청 시점 snapshot 고정)
import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { rollpapers, notes, orders } from "@/db/schema";

export async function POST(request: NextRequest, ctx: RouteContext<"/api/rollpapers/[id]/order">) {
  const { id } = await ctx.params;
  const ownerToken = request.headers.get("x-owner-token");

  const [rollpaper] = await db.select().from(rollpapers).where(eq(rollpapers.id, id));
  if (!rollpaper) {
    return NextResponse.json({ code: "NOT_FOUND", message: "롤링페이퍼를 찾을 수 없습니다." }, { status: 404 });
  }
  if (!ownerToken || ownerToken !== rollpaper.ownerToken) {
    return NextResponse.json({ code: "FORBIDDEN", message: "방장만 제작을 요청할 수 있습니다." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    contactName?: string;
    contact?: string;
    memo?: string;
    canvas?: { width?: number; height?: number; paperSize?: string };
  } | null;
  const contactName = body?.contactName?.trim();
  const contact = body?.contact?.trim();
  if (!contactName || !contact) {
    return NextResponse.json({ code: "INVALID_BODY", message: "이름과 연락처는 필수입니다." }, { status: 400 });
  }

  const [existing] = await db.select().from(orders).where(eq(orders.rollpaperId, id));
  if (existing && existing.status !== "requested") {
    return NextResponse.json({ code: "ALREADY_IN_PROGRESS", message: "이미 제작이 진행 중이에요." }, { status: 409 });
  }

  const noteRows = await db.select().from(notes).where(eq(notes.rollpaperId, id)).orderBy(asc(notes.createdAt));
  const snapshot = {
    toName: rollpaper.toName,
    mode: rollpaper.mode,
    bgColor: rollpaper.bgColor,
    fixedFields: rollpaper.fixedFields, // 무드등 고정 칸(제목/사진/문구/라벨)
    // 위치(posX/posY)는 캔버스 폭·높이에 대한 % — 같은 비율로 복원하려면 요청 시점 크기가 필요
    canvas:
      typeof body?.canvas?.width === "number" && typeof body.canvas.height === "number"
        ? { width: Math.round(body.canvas.width), height: Math.round(body.canvas.height), paperSize: String(body.canvas.paperSize ?? "free") }
        : null,
    notes: noteRows.map(({ editToken: _t, userId: _u, rollpaperId: _r, ...n }) => n), // 토큰류는 제외
  };

  const values = { rollpaperId: id, contactName, contact, memo: body?.memo?.trim() || null, snapshot };
  const [order] = await db
    .insert(orders)
    .values(values)
    .onConflictDoUpdate({ target: orders.rollpaperId, set: { ...values, createdAt: new Date() } })
    .returning({ id: orders.id });

  return NextResponse.json({ id: order.id }, { status: 201 });
}
