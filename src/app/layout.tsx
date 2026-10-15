import type { Metadata } from "next";
import { ToastHost } from "@/components/Toast";
import "./globals.css";

const SITE_URL = "https://rollpe-app.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ROLLPE by GLIMORY",
  description: "마음을 모은 감동 선물 — 온라인 롤링페이퍼",
  openGraph: {
    title: "ROLLPE by GLIMORY",
    description: "마음을 모은 감동 선물 — 온라인 롤링페이퍼",
    url: SITE_URL,
    siteName: "ROLLPE by GLIMORY",
    images: [{ url: "/og-image.png", width: 1203, height: 632 }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ROLLPE by GLIMORY",
    description: "마음을 모은 감동 선물 — 온라인 롤링페이퍼",
    images: ["/og-image.png"],
  },
};

// 노트별 폰트 10종(TRD §4-4-1)은 각 메모마다 임의의 CSS font-family 문자열로
// 동적으로 적용돼야 해서 next/font 대신 표준 Google Fonts 링크를 사용한다.
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Noto+Sans+KR:wght@400;500;700&family=Gaegu:wght@400;700&family=Roboto:wght@400;700&family=Playfair+Display:wght@400;700&family=Montserrat:wght@400;700&family=Lato:wght@400;700&family=Oswald:wght@400;600&family=Raleway:wght@400;700&family=Merriweather:wght@400;700&family=Lobster&display=swap";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* 수정/9번 피드백 — crossOrigin 없이 로드되면 html-to-image가 다운로드 시
            styleSheet.cssRules를 읽다 CORS SecurityError로 실패해 폰트 임베딩이
            안 되고(스킵 처리) 다른 글씨체로 바뀌어 보였음. anonymous로 CORS 허용 */}
        <link rel="stylesheet" href={FONT_HREF} crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
