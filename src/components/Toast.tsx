"use client";

import { useEffect, useState } from "react";

// 전역 토스트 — 작은 기능이라 Context 없이 모듈 레벨 pub-sub으로 처리
type Listener = (message: string) => void;
const listeners = new Set<Listener>();

export function showToast(message: string) {
  listeners.forEach((l) => l(message));
}

export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const listener: Listener = (msg) => {
      setMessage(msg);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 2200);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 28,
        translate: "-50% 0",
        background: "var(--ink)",
        color: "var(--bg)",
        fontSize: 13,
        padding: "11px 18px",
        borderRadius: 999,
        zIndex: 60,
        opacity: message ? 1 : 0,
        pointerEvents: "none",
        transition: "opacity .2s ease, transform .2s ease",
        transform: message ? "translateY(0)" : "translateY(8px)",
        whiteSpace: "nowrap",
      }}
    >
      {message}
    </div>
  );
}
