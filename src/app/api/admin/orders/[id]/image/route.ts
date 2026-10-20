// GET /api/admin/orders/:id/image — 요청 시점의 완성 이미지(PNG, 인쇄 해상도). 글자 배치 확인용
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/admin/orders/[id]/image">) {
  if (!(await isAdmin())) {
    return NextResponse.json({ code: "FORBIDDEN", message: "접근 권한이 없습니다." }, { status: 403 });
  }
  const { id } = await ctx.params;
  const [order] = await db.select({ image: orders.image }).from(orders).where(eq(orders.id, id));
  if (!order?.image) {
    return NextResponse.json({ code: "NOT_FOUND", message: "이 요청에는 저장된 이미지가 없어요." }, { status: 404 });
  }
  const png = Buffer.from(order.image.split(",")[1], "base64");
  return new NextResponse(png, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="rollpe-order-${id}.png"`,
    },
  });
}
