import type { Metadata } from "next";
import { ToastHost } from "@/components/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROLLPE by GLIMORY",
  description: "마음을 모은 감동 선물 — 온라인 롤링페이퍼",
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
        <link rel="stylesheet" href={FONT_HREF} />
        {/* 저장된 라이트/다크 선택을 페인트 전에 적용 — ThemeToggle과 짝, 깜빡임 방지 */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('rollpe_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}",
          }}
        />
      </head>
      <body>
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
