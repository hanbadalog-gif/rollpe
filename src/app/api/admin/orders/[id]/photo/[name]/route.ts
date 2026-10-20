// GET /api/admin/orders/:id/photo/:name — 첨부 사진 1장 원본 파일 (예: center-photo.jpg, note-01.jpg)
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";
import { collectAttachments, decodeDataUrl } from "@/lib/orderFiles";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/admin/orders/[id]/photo/[name]">) {
  if (!(await isAdmin())) {
    return NextResponse.json({ code: "FORBIDDEN", message: "접근 권한이 없습니다." }, { status: 403 });
  }
  const { id, name } = await ctx.params;
  const [order] = await db.select({ snapshot: orders.snapshot }).from(orders).where(eq(orders.id, id));
  const att = order && collectAttachments(order.snapshot).find((a) => a.file.split("/").pop() === name);
  if (!att) return NextResponse.json({ code: "NOT_FOUND", message: "사진을 찾을 수 없어요." }, { status: 404 });
  const { mime, data } = decodeDataUrl(att.dataUrl);
  return new NextResponse(new Uint8Array(data), {
    headers: { "Content-Type": mime, "Content-Disposition": `attachment; filename="${name}"` },
  });
}
