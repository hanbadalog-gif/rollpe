"use client";

import { useState, type FormEvent } from "react";
import styles from "./order-panel.module.css";
import { api, ApiError } from "@/lib/api-client";
import { getOwnerToken } from "@/lib/editToken";
import { showToast } from "@/components/Toast";
import { renderCanvasPng, PRINT_WIDTH_PX } from "@/features/share/lib/canvasExport";

const MAX_IMAGE_CHARS = 4_300_000; // 서버 허용(4.4M자)보다 조금 작게

interface Props {
  rollpaperId: string;
  onDone: () => void;
  /** 요청 시점의 캔버스 크기/용지 — 별도 시스템이 %좌표를 같은 비율로 복원하는 데 필요 */
  getCanvas?: () => { width: number; height: number; paperSize: string } | null;
  /** 완성 이미지를 만들 캔버스 요소와 가로 픽셀 — 이미지 다운로드와 같은 고화질 이미지를 글리모리에 함께 전달 */
  getCanvasEl?: () => HTMLElement | null;
  imageWidthPx?: number;
}

/** 무드등 제작 요청 — 방장이 연락처를 남기면 요청 시점의 문구/배치가 서버에 고정(snapshot)된다 */
export function OrderPanel({ rollpaperId, onDone, getCanvas, getCanvasEl, imageWidthPx }: Props) {
  const [contactName, setContactName] = useState("");
  const [contact, setContact] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getOwnerToken(rollpaperId);
    if (!token || submitting) return;
    setSubmitting(true);
    try {
      // 글자 배치용 고화질 이미지(다운로드와 동일) — 만들지 못해도 JSON만으로 접수는 된다
      let image: string | undefined;
      const el = getCanvasEl?.();
      if (el) {
        try {
          image = await renderCanvasPng(el, imageWidthPx);
        } catch {
          showToast("이미지를 만들지 못해 문구 정보만 보냈어요");
        }
      }
      // 사진까지 한 요청에 담으면 서버리스 4.5MB 제한을 넘기 쉬워서, 접수와 이미지 전송을 나눈다
      await api.post(`/api/rollpapers/${rollpaperId}/order`, { contactName, contact, memo, canvas: getCanvas?.() ?? undefined }, { "x-owner-token": token });
      if (image && el) {
        try {
          // 4.4MB를 넘으면 해상도를 25%씩 낮춰 다시 만든다(최소 1200px). 그래도 안 되면 이미지 없이 접수 상태로 둔다
          let width = imageWidthPx ?? PRINT_WIDTH_PX;
          while (image.length >= MAX_IMAGE_CHARS && width > 1200) {
            width = Math.max(1200, Math.round(width * 0.75));
            image = await renderCanvasPng(el, width);
          }
          if (image.length >= MAX_IMAGE_CHARS) throw new Error("too large");
          await api.put(`/api/rollpapers/${rollpaperId}/order`, { image }, { "x-owner-token": token });
        } catch {
          showToast("접수는 됐지만 이미지는 보내지 못했어요. 글리모리가 문구 정보로 제작해요");
        }
      }
      showToast("제작 요청을 보냈어요. 연락드릴게요!");
      onDone();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "요청에 실패했어요. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.panel} onSubmit={handleSubmit}>
      <h4 className={styles.heading}>무드등 제작 요청</h4>
      <p className={styles.hint}>요청한 시점의 문구와 배치로 제작돼요. 연락처로 안내드릴게요.</p>
      <input className={styles.input} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="이름" required />
      <input className={styles.input} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="연락처 (전화/카톡ID/이메일)" required />
      <input className={styles.input} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="요청사항 (선택)" />
      <button className={styles.submit} disabled={submitting}>
        {submitting ? "이미지 만들어 보내는 중…" : "제작 요청하기"}
      </button>
    </form>
  );
}
