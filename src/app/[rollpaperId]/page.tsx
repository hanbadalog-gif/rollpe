import { CanvasPageClient } from "./CanvasPageClient";

export default async function RollpaperPage({
  params,
  searchParams,
}: {
  params: Promise<{ rollpaperId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { rollpaperId } = await params;
  const { view } = await searchParams;
  return <CanvasPageClient rollpaperId={rollpaperId} recipientView={view === "recipient"} />;
}
