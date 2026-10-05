// 이미지 다운로드 — TRD §4 "document.fonts.ready 대기 후 export" (NFR1)
import { toPng } from "html-to-image";

export async function downloadCanvasAsImage(canvasEl: HTMLElement, fileName: string) {
  await document.fonts.ready;
  // skipFonts: true — 구글 폰트 CDN은 CORS 미허용이라 cssRules 인라인 추출이 실패함(SecurityError).
  // document.fonts.ready로 이미 로드된 폰트는 브라우저가 캔버스 렌더링에 그대로 쓰므로 인라인 임베딩 불필요.
  const dataUrl = await toPng(canvasEl, { pixelRatio: 2, cacheBust: true, skipFonts: true });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  a.click();
}
