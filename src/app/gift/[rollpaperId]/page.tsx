import { redirect } from "next/navigation";
import { CanvasPageClient } from "../../[rollpaperId]/CanvasPageClient";
import { getRollpaperMode } from "@/lib/rollpaperMode";

// 무드등 선물하기 캔버스 — 온라인 롤링페이퍼(/[id])와 주소가 다른 독립된 흐름
export default async function GiftCanvasPage({ params }: { params: Promise<{ rollpaperId: string }> }) {
  const { rollpaperId } = await params;
  const mode = await getRollpaperMode(rollpaperId);
  if (mode === "online") redirect(`/${rollpaperId}`);
  return <CanvasPageClient rollpaperId={rollpaperId} />;
}
