// GET /api/admin/orders/:id/package — 글리모리 대표가 한 번에 받는 ZIP: 전체 이미지(layout.png) + JSON + 첨부 사진 원본
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";
import { collectAttachments, decodeDataUrl, slimEnrichedSnapshot } from "@/lib/orderFiles";
import { createZip } from "@/lib/zip";

const README = [
  "ROLLPE by GLIMORY 제작 요청 자료",
  "",
  "layout.png  : 완성된 글자 배치 이미지 (고화질, 300dpi). 글자 위치를 확인하는 용도",
  "order.json  : 문구 원문, 글씨체/크기/굵기/색, 위치·회전·크기, 고정 칸 내용. 이미지로 보이지 않는 정보 확인용",
  "photos/     : 가운데 사진(center-photo)과 메모에 넣은 사진 원본",
  "stickers/   : 사용자가 직접 올린 스티커 이미지",
  "",
  "order.json 의 attachments 목록에서 각 사진 파일의 용도와 작성자를 확인할 수 있습니다.",
].join("\r\n");

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/admin/orders/[id]/package">) {
  if (!(await isAdmin())) {
    return NextResponse.json({ code: "FORBIDDEN", message: "접근 권한이 없습니다." }, { status: 403 });
  }
  const { id } = await ctx.params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return NextResponse.json({ code: "NOT_FOUND", message: "요청을 찾을 수 없습니다." }, { status: 404 });

  const { image, snapshot, ...info } = order;
  const json = JSON.stringify({ ...info, imageFile: image ? "layout.png" : null, snapshot: slimEnrichedSnapshot(snapshot) }, null, 2);
  const files = [
    ...(image ? [{ name: "layout.png", data: decodeDataUrl(image).data }] : []),
    { name: "order.json", data: Buffer.from(json, "utf8") },
    ...collectAttachments(snapshot).map((a) => ({ name: a.file, data: decodeDataUrl(a.dataUrl).data })),
    { name: "README.txt", data: Buffer.from("﻿" + README, "utf8") },
  ];
  return new NextResponse(new Uint8Array(createZip(files)), {
    headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="rollpe-order-${id}.zip"` },
  });
}
