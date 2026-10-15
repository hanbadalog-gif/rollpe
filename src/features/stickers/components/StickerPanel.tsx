"use client";

import { useRef } from "react";
import styles from "./sticker-panel.module.css";
import { DEFAULT_STICKERS } from "../data/stickerSet";
import type { CreateNoteInput } from "@/features/canvas/types";
import { showToast } from "@/components/Toast";

interface Props {
  onSubmit: (input: CreateNoteInput) => Promise<unknown>;
}

/** 스티커 패널 — Epic 5 (Story 5.1). 모드2에서는 상위에서 아예 렌더링하지 않음(§4-5) */
export function StickerPanel({ onSubmit }: Props) {
  // 수정/5번 피드백 — "스티커 선택 시 한 번에 3개씩 뜸". 모바일에서 빠른 연타/중복
  // 터치 이벤트로 onSubmit이 겹쳐 호출될 가능성을 막기 위한 방어적 가드 —
  // 이전 호출이 끝나기 전까지는 같은 클릭을 무시한다.
  const busyRef = useRef(false);

  async function handlePick(emoji: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      await onSubmit({ type: "sticker", content: emoji });
      showToast("스티커를 추가했어요");
      setTimeout(() => showToast("친구들한테도 공유해서 꽉 채워봐요 🔗"), 2400);
    } catch {
      showToast("추가하지 못했어요");
    } finally {
      busyRef.current = false;
    }
  }

  return (
    <div className={styles.panel}>
      <h4 className={styles.heading}>스티커</h4>
      <p className={styles.desc}>눌러서 캔버스에 바로 붙여보세요.</p>
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
