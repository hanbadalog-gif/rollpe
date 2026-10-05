"use client";

import styles from "./sticker-panel.module.css";
import { DEFAULT_STICKERS } from "../data/stickerSet";
import type { CreateNoteInput } from "@/features/canvas/types";
import { showToast } from "@/components/Toast";

interface Props {
  onSubmit: (input: CreateNoteInput) => Promise<unknown>;
}

/** 스티커 패널 — Epic 5 (Story 5.1). 모드2에서는 상위에서 아예 렌더링하지 않음(§4-5) */
export function StickerPanel({ onSubmit }: Props) {
  async function handlePick(emoji: string) {
    try {
      await onSubmit({ type: "sticker", content: emoji });
      showToast("스티커를 추가했어요");
    } catch {
      showToast("추가하지 못했어요");
    }
  }

  return (
    <div className={styles.panel}>
      <h4 className={styles.heading}>스티커</h4>
      <div className={styles.grid}>
        {DEFAULT_STICKERS.map((emoji, i) => (
          <button key={i} type="button" onClick={() => handlePick(emoji)}>
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
