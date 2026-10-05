import { CanvasPageClient } from "./CanvasPageClient";

export default async function RollpaperPage({
  params,
}: {
  params: Promise<{ rollpaperId: string }>;
}) {
  const { rollpaperId } = await params;
  return <CanvasPageClient rollpaperId={rollpaperId} />;
}
