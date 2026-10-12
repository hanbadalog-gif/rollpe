"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./share-menu.module.css";
import { showToast } from "@/components/Toast";
import { LinkIcon } from "@/components/icons";
import type { RollpaperMode } from "@/lib/theme";

interface Props {
  mode: RollpaperMode;
  onOpenShare: () => void; // Story 7.3 — 공유 버튼 처음 누른 시점을 상위에 알림(배너 트리거)
  /** "rail" — 1.png 원본 기획대로 좌측 세로 툴바 안 아이콘+라벨 버튼으로(기본은 appbar용 그라데이션 pill) */
  variant?: "rail";
}

/** Epic 7 Story 7.1 — 공유 메뉴 */
export function ShareMenu({ mode, onOpenShare, variant }: Props) {
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

  async function copyRecipientLink() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("view", "recipient");
      await navigator.clipboard.writeText(url.toString());
      showToast("주인공에게 전달할 링크를 복사했어요");
    } catch {
      showToast("복사에 실패했어요");
    }
    setOpen(false);
  }

  return (
    <div className={styles.wrap}>
      {variant === "rail" ? (
        <button className={styles.railBtn} onClick={toggle} aria-label="공유">
          <span className={styles.railIc}>
            <LinkIcon size={15} />
          </span>
          공유
        </button>
      ) : (
        <button className={styles.iconBtn} onClick={toggle} aria-label="공유">
          <LinkIcon size={13} />
          링크 공유하기
        </button>
      )}
      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={`${styles.menu} ${variant === "rail" ? styles.menuRail : ""}`}>
            <button className={styles.item} onClick={copyLink}>
              🔗 링크 복사
            </button>
            <button className={styles.item} onClick={copyRecipientLink}>
              💌 주인공에게 전달하기
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
