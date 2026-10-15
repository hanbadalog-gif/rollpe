// 이미지 다운로드 — TRD §4 "document.fonts.ready 대기 후 export" (NFR1)
import { toPng } from "html-to-image";

export async function downloadCanvasAsImage(canvasEl: HTMLElement, fileName: string) {
  await document.fonts.ready;
  // 수정/9번 피드백 — html-to-image는 캔버스를 SVG(foreignObject)로 직렬화한 뒤 별도
  // <img>로 그려서 캡처하는데, 이 SVG는 페이지 스타일시트에 접근할 수 없어 @font-face를
  // SVG 안에 직접 인라인해야만 커스텀 폰트가 적용된다. skipFonts:true로 인라인을 건너뛰면
  // 다운로드 이미지에서 기본 폰트로 떨어져 보이던 게 원인 — layout.tsx에 Google Fonts
  // 스타일시트 crossOrigin="anonymous"를 추가해 cssRules를 읽을 수 있게 하고 임베딩을 켬.
  const dataUrl = await toPng(canvasEl, { pixelRatio: 2, cacheBust: true });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  a.click();
}
