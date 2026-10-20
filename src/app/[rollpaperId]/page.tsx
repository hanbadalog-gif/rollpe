import { redirect } from "next/navigation";
import { CanvasPageClient } from "./CanvasPageClient";
import { getRollpaperMode } from "@/lib/rollpaperMode";

// 온라인 롤링페이퍼 캔버스 — 무드등 선물하기 캔버스는 /gift/[id]로 완전히 분리
export default async function RollpaperPage({
  params,
  searchParams,
}: {
  params: Promise<{ rollpaperId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { rollpaperId } = await params;
  const { view } = await searchParams;
  const mode = await getRollpaperMode(rollpaperId);
  if (mode && mode !== "online") redirect(`/gift/${rollpaperId}`);
  return <CanvasPageClient rollpaperId={rollpaperId} recipientView={view === "recipient"} />;
}
