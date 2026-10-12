/** 24.png / 28.png 레퍼런스 — 얇은 라인 아이콘(이모지 대신) */

export function WriteIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function StickerIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.9L12 16.9l-5.25 2.8 1-5.9L3.5 9.7l5.9-.9Z" />
    </svg>
  );
}

export function DrawIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75Z" />
      <path d="M14.3 5.9 17 3.2a1.5 1.5 0 0 1 2.12 0l1.68 1.68a1.5 1.5 0 0 1 0 2.12L18.1 9.68" />
    </svg>
  );
}

export function PaletteIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.65 1.6-1.4 0-.37-.15-.7-.4-.95a1.3 1.3 0 0 1-.4-.95c0-.75.6-1.3 1.35-1.3H15.5A4.5 4.5 0 0 0 20 12a9 9 0 0 0-8-9Z" />
      <circle cx="7.3" cy="11" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9.8" cy="7.2" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7.2" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FrameIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="11" height="15" rx="1" />
      <path d="M9 21h11V8" />
    </svg>
  );
}

export function DownloadIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function LinkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 17H7a5 5 0 0 1 0-10h2" />
      <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
