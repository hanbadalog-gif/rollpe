"use client";

import { useState } from "react";
import styles from "@/features/write-panel/components/write-panel.module.css";
import { showToast } from "@/components/Toast";
import { shrinkToDataUrl } from "@/lib/imageResize";
import { ApiError } from "@/lib/api-client";
import type { CreateNoteInput } from "@/features/canvas/types";

interface Props {
  onSubmit: (input: CreateNoteInput) => Promise<unknown>;
  onDone: () => void;
}

/** 사진만 따로 올리기 — 글 없이 사진 한 장이 메모처럼 캔버스에 올라간다(이동/회전/크기 조절 가능) */
export function PhotoPanel({ onSubmit, onDone }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || busy) return;
    setBusy(true);
    try {
      await onSubmit({ type: "photo", photoUrl: await shrinkToDataUrl(file) });
      showToast("사진을 추가했어요");
      onDone();
    } catch (err) {
      showToast(err instanceof ApiError && err.code === "CAPACITY_FULL" ? "정원이 다 찼어요" : "추가하지 못했어요. 잠시 후 다시 시도해주세요.");
      setBusy(false);
    }
  }

  return (
    <div className={styles.panel}>
      <h4 className={styles.heading}>사진 추가</h4>
      <label className={styles.uploadBox}>
        {busy ? "올리는 중…" : "눌러서 사진추가"}
        <input type="file" accept="image/*" onChange={handleFile} disabled={busy} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
      </label>
    </div>
  );
}
