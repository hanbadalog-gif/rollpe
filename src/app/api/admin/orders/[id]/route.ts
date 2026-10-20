// GET /api/admin/orders/:id — 제작 요청 1건 JSON (요청자 정보 + 고정된 snapshot, 글씨체 정보 보강). 이미지는 /image 로 따로 받는다
import { NextRequest, NextResponse } from "next/server";
import { eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";
import { enrichSnapshot } from "@/lib/orderExport";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/admin/orders/[id]">) {
  if (!(await isAdmin())) {
    return NextResponse.json({ code: "FORBIDDEN", message: "접근 권한이 없습니다." }, { status: 403 });
  }
  const { id } = await ctx.params;
  const { image, ...cols } = getTableColumns(orders);
  void image; // 이미지(base64)는 JSON에 싣지 않는다
  const [order] = await db
    .select({ ...cols, hasImage: sql<boolean>`${orders.image} is not null` })
    .from(orders)
    .where(eq(orders.id, id));
  if (!order) {
    return NextResponse.json({ code: "NOT_FOUND", message: "요청을 찾을 수 없습니다." }, { status: 404 });
  }
  return new NextResponse(JSON.stringify({ ...order, imageFile: order.hasImage ? `rollpe-order-${id}.png (같이 받은 PNG)` : null, snapshot: enrichSnapshot(order.snapshot) }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="rollpe-order-${id}.json"`,
    },
  });
}
