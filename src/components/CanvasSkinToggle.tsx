"use client";

import { useEffect, useState } from "react";
import styles from "./canvas-skin-toggle.module.css";

const KEY = "rollpe_canvas_skin";

function readStored(): "washi" | "glow" {
  try {
    return localStorage.getItem(KEY) === "glow" ? "glow" : "washi";
  } catch {
    return "washi";
  }
}

/** 캔버스 디자인 스킨 전환(워시테이프 기본 / 미드나잇 글로우) — ThemeToggle과 동일한 localStorage+DOM attribute 패턴 */
export function CanvasSkinToggle() {
  const [skin, setSkin] = useState<"washi" | "glow" | null>(null);

  useEffect(() => {
    const initial = readStored();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSkin(initial);
    document.documentElement.setAttribute("data-skin", initial);
  }, []);

  function pick(next: "washi" | "glow") {
    setSkin(next);
    document.documentElement.setAttribute("data-skin", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // 무시 — 프라이빗 모드 등에서는 새로고침 시 기본값(워시테이프)으로 돌아감
    }
  }

  if (skin === null) return null;

  return (
    <div className={styles.toggle} role="tablist" aria-label="캔버스 디자인 전환">
      <button
        type="button"
        role="tab"
        aria-selected={skin === "washi"}
        className={`${styles.btn} ${skin === "washi" ? styles.btnOn : ""}`}
        onClick={() => pick("washi")}
        title="워시테이프"
      >
        🌞
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={skin === "glow"}
        className={`${styles.btn} ${skin === "glow" ? styles.btnOn : ""}`}
        onClick={() => pick("glow")}
        title="미드나잇 글로우"
      >
        🌙
      </button>
    </div>
  );
}
