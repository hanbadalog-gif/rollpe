// GET /api/admin/orders/:id — 제작 요청 1건 JSON (요청자 정보 + 고정된 snapshot)
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/admin/orders/[id]">) {
  if (!(await isAdmin())) {
    return NextResponse.json({ code: "FORBIDDEN", message: "접근 권한이 없습니다." }, { status: 403 });
  }
  const { id } = await ctx.params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) {
    return NextResponse.json({ code: "NOT_FOUND", message: "요청을 찾을 수 없습니다." }, { status: 404 });
  }
  return new NextResponse(JSON.stringify(order, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="rollpe-order-${id}.json"`,
    },
  });
}
