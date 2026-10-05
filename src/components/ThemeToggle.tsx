"use client";

import { useEffect, useState } from "react";
import styles from "./theme-toggle.module.css";

const KEY = "rollpe_theme";

function readStored(): "light" | "dark" | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

/** 라이트/다크 수동 전환 — 선택 없으면 OS 설정(prefers-color-scheme) 따름 (TRD §4-1) */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    // 마운트 시 1회 초기값 읽기(localStorage/OS 설정) — useCanvasNotes.ts와 동일한 패턴
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(readStored() ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // 무시 — 프라이빗 모드 등에서는 새로고침 시 OS 설정으로 돌아감
    }
  }

  if (theme === null) return null; // 하이드레이션 전 깜빡임 방지(초기 OS 값은 head 인라인 스크립트가 처리)

  return (
    <button
      className={`${styles.btn} ${className ?? ""}`}
      onClick={toggle}
      aria-label="라이트/다크 모드 전환"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
