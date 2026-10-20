// 긴 변 max(기본 800)px 이하로 줄여서 저장 — 요청 크기 제한(서버리스 4.5MB)과 저장 용량 때문.
// 기본은 JPEG, keepAlpha(스티커)는 투명 배경을 살리려고 PNG (너무 크면 JPEG로 대체)
export function shrinkToDataUrl(file: File, opts: { max?: number; keepAlpha?: boolean } = {}): Promise<string> {
  const { max = 800, keepAlpha = false } = opts;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      if (keepAlpha) {
        const png = c.toDataURL("image/png");
        if (png.length < 1_500_000) return resolve(png);
      }
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
