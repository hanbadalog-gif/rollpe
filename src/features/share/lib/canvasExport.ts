// 이미지 다운로드 — TRD §4 "document.fonts.ready 대기 후 export" (NFR1)
import { toPng } from "html-to-image";

/** 인쇄용 기본 가로 픽셀 — 8인치 × 300dpi = 2400px (A4는 2480px). 글씨는 벡터라 크게 뽑아도 선명하다 */
export const PRINT_WIDTH_PX = 2400;
export const PRINT_WIDTH_A4_PX = 2480;
const DPI = 300;

// 브라우저 캔버스 한계(특히 iOS 약 16.7M 픽셀) 안에서만 키운다
const MAX_PIXELS = 16_000_000;

// PNG에 "300dpi"라는 물리 해상도(pHYs 청크)를 적어 넣는다 — 인쇄소/편집 프로그램이 실제 크기로 인식
const CRC_TABLE = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes: Uint8Array) {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function withDpi(dataUrl: string, dpi: number): string {
  const bin = atob(dataUrl.split(",")[1]);
  const png = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  const ppm = Math.round(dpi / 0.0254); // 픽셀/미터
  const chunk = new Uint8Array(21); // 길이(4) + 'pHYs'(4) + 데이터(9) + CRC(4)
  const dv = new DataView(chunk.buffer);
  dv.setUint32(0, 9);
  chunk.set([0x70, 0x48, 0x59, 0x73], 4);
  dv.setUint32(8, ppm);
  dv.setUint32(12, ppm);
  chunk[16] = 1; // 단위: 미터
  dv.setUint32(17, crc32(chunk.subarray(4, 17)));
  const at = 33; // 시그니처(8) + IHDR 청크(25) 바로 뒤
  const out = new Uint8Array(png.length + chunk.length);
  out.set(png.subarray(0, at), 0);
  out.set(chunk, at);
  out.set(png.subarray(at), at + chunk.length);
  let s = "";
  for (let i = 0; i < out.length; i += 0x8000) s += String.fromCharCode(...out.subarray(i, i + 0x8000));
  return "data:image/png;base64," + btoa(s);
}

/** 캔버스를 인쇄 해상도 PNG(300dpi 정보 포함) 데이터 URL로 만든다 — 다운로드와 글리모리 전달이 같은 결과를 쓴다 */
export async function renderCanvasPng(canvasEl: HTMLElement, targetWidthPx = PRINT_WIDTH_PX): Promise<string> {
  await document.fonts.ready;
  const w = canvasEl.offsetWidth;
  const h = canvasEl.offsetHeight;
  // 목표 가로 픽셀에 맞춰 배율을 정하되, 화면 크기(2배)보다 작아지지 않고 브라우저 한계를 넘지 않게
  const ratio = Math.max(2, Math.min(targetWidthPx / w, Math.sqrt(MAX_PIXELS / (w * h))));
  // 수정/9번 피드백 — html-to-image는 캔버스를 SVG(foreignObject)로 직렬화한 뒤 별도
  // <img>로 그려서 캡처하는데, 이 SVG는 페이지 스타일시트에 접근할 수 없어 @font-face를
  // SVG 안에 직접 인라인해야만 커스텀 폰트가 적용된다. skipFonts:true로 인라인을 건너뛰면
  // 다운로드 이미지에서 기본 폰트로 떨어져 보이던 게 원인 — layout.tsx에 Google Fonts
  // 스타일시트 crossOrigin="anonymous"를 추가해 cssRules를 읽을 수 있게 하고 임베딩을 켬.
  const dataUrl = await toPng(canvasEl, {
    pixelRatio: ratio,
    cacheBust: true,
    // 무드등 캔버스는 margin:auto로 화면 가운데에 놓는다. 이 계산된 여백이 복제본에 그대로 따라가면 그림이 오른쪽·아래로 밀려 잘리므로 뺀다
    style: { margin: "0" },
    // 입력 안내(점선 칸/placeholder/등록 중 표시)는 저장 이미지에서 뺀다
    filter: (node) => !(node instanceof HTMLElement && node.dataset.noExport),
  });
  return withDpi(dataUrl, DPI);
}

export async function downloadCanvasAsImage(canvasEl: HTMLElement, fileName: string, targetWidthPx = PRINT_WIDTH_PX) {
  const a = document.createElement("a");
  a.href = await renderCanvasPng(canvasEl, targetWidthPx);
  a.download = fileName;
  a.click();
}
