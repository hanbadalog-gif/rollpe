"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./share-menu.module.css";
import { showToast } from "@/components/Toast";
import type { RollpaperMode } from "@/lib/theme";

interface Props {
  mode: RollpaperMode;
  onOpenShare: () => void; // Story 7.3 — 공유 버튼 처음 누른 시점을 상위에 알림(배너 트리거)
}

/** Epic 7 Story 7.1 — 공유 메뉴 */
export function ShareMenu({ mode, onOpenShare }: Props) {
  const [open, setOpen] = useState(false);

  function toggle() {
    if (!open) onOpenShare();
    setOpen((v) => !v);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("링크를 복사했어요");
    } catch {
      showToast("복사에 실패했어요");
    }
    setOpen(false);
  }

  return (
    <div className={styles.wrap}>
      <button className={styles.iconBtn} onClick={toggle} aria-label="공유">
        ⇪
      </button>
      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.menu}>
            <button className={styles.item} onClick={copyLink}>
              🔗 링크 복사
            </button>
            {mode === "online" && (
              <Link href="/gift" className={styles.item} onClick={() => setOpen(false)}>
                🕯️ 무드등으로 만들기
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
