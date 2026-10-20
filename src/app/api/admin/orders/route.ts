// GET /api/admin/orders — 전체 제작 요청 JSON (대표 전용, 자동화/AI 입력용)
import { NextResponse } from "next/server";
import { desc, getTableColumns, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";
import { slimEnrichedSnapshot } from "@/lib/orderFiles";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ code: "FORBIDDEN", message: "접근 권한이 없습니다." }, { status: 403 });
  }
  const { image, ...cols } = getTableColumns(orders);
  void image; // 이미지(base64)는 전체 JSON에 싣지 않는다 — 건별 /image 로 받는다
  const rows = (await db.select({ ...cols, hasImage: sql<boolean>`${orders.image} is not null` }).from(orders).orderBy(desc(orders.createdAt))).map((r) => ({
    ...r,
    snapshot: slimEnrichedSnapshot(r.snapshot),
  }));
  return new NextResponse(JSON.stringify(rows, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="rollpe-orders.json"`,
    },
  });
}
