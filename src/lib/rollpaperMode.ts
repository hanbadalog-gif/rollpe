import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rollpapers } from "@/db/schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 롤링페이퍼의 모드 — 없는 id/잘못된 id면 null (온라인 / 무드등 캔버스를 서로 다른 주소로 나누는 데 사용) */
export async function getRollpaperMode(id: string) {
  if (!UUID.test(id)) return null;
  const [row] = await db.select({ mode: rollpapers.mode }).from(rollpapers).where(eq(rollpapers.id, id));
  return row?.mode ?? null;
}
