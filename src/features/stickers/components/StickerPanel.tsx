"use client";

import { useRef, useState } from "react";
import styles from "./sticker-panel.module.css";
import { STICKER_CATEGORIES } from "../data/stickerSet";
import type { CreateNoteInput } from "@/features/canvas/types";
import { showToast } from "@/components/Toast";
import { shrinkToDataUrl } from "@/lib/imageResize";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 올릴 때 512px로 줄여 저장하므로 원본이 커도 서버 부담 없음

interface Props {
  onSubmit: (input: CreateNoteInput) => Promise<unknown>;
}

/** 스티커 패널 — Epic 5 (Story 5.1). 모드2에서는 상위에서 아예 렌더링하지 않음(§4-5) */
export function StickerPanel({ onSubmit }: Props) {
  // 수정/5번 피드백 — "스티커 선택 시 한 번에 3개씩 뜸". 모바일에서 빠른 연타/중복
  // 터치 이벤트로 onSubmit이 겹쳐 호출될 가능성을 막기 위한 방어적 가드 —
  // 이전 호출이 끝나기 전까지는 같은 클릭을 무시한다.
  const busyRef = useRef(false);
  const [tab, setTab] = useState(0);

  async function handlePick(src: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      await onSubmit({ type: "sticker", photoUrl: src });
      showToast("스티커를 추가했어요");
      setTimeout(() => showToast("친구들한테도 공유해서 꽉 채워봐요 🔗"), 2400);
    } catch {
      showToast("추가하지 못했어요");
    } finally {
      busyRef.current = false;
    }
  }

  // 내 이미지를 스티커로 — PNG/JPG, 20MB 이하. 투명 PNG는 투명 배경 그대로 붙는다
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일을 다시 골라도 반응하도록
    if (!file || busyRef.current) return;
    if (!/^image\/(png|jpe?g)$/.test(file.type) || file.size > MAX_UPLOAD_BYTES) {
      showToast("20MB 이하 PNG·JPG 이미지만 올릴 수 있어요");
      return;
    }
    busyRef.current = true;
    try {
      const photoUrl = await shrinkToDataUrl(file, { max: 512, keepAlpha: true });
      await onSubmit({ type: "sticker", photoUrl });
      showToast("내 스티커를 추가했어요");
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
      <label className={styles.upload}>
        + 내 이미지 올리기
        <small>PNG·JPG · 20MB 이하 · 투명 배경 PNG 추천</small>
        <input type="file" accept="image/png,image/jpeg" onChange={handleUpload} />
      </label>
      <div className={styles.tabs} role="tablist">
        {STICKER_CATEGORIES.map((c, i) => (
          <button key={c.label} type="button" role="tab" aria-selected={i === tab} className={i === tab ? styles.tabOn : ""} onClick={() => setTab(i)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className={styles.grid}>
        {STICKER_CATEGORIES[tab].stickers.map((src) => (
          <button key={src} type="button" onClick={() => handlePick(src)}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 스티커 PNG */}
            <img src={src} alt="" draggable={false} />
          </button>
        ))}
      </div>
    </div>
  );
}
