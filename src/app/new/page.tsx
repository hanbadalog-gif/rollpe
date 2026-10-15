"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./new.module.css";
import { createRollpaper } from "@/features/rollpaper-create/api";
import { showToast } from "@/components/Toast";

// 페이지/2.jpg 레퍼런스 — 로고 헤더 + 심플한 "To." 카드, 핀 장식/질문형 문구 없음
export default function NewRollpaperPage() {
  const router = useRouter();
  const [toName, setToName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!toName.trim()) return;
    setSubmitting(true);
    try {
      const { id } = await createRollpaper(toName.trim(), "online");
      router.push(`/${id}`);
    } catch {
      showToast("생성하지 못했어요. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 브랜드 로고, 단순 정적 이미지 */}
        <img src="/brand/logo.png" alt="Rollpe" className={styles.logoImg} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mark.png" alt="" className={styles.markImg} aria-hidden />
      </header>

      <div className={styles.body}>
        <form className={styles.card} onSubmit={handleSubmit}>
          <span className={styles.label}>To.</span>
          <input
            className={styles.input}
            type="text"
            value={toName}
            onChange={(e) => setToName(e.target.value)}
            placeholder="받는 사람을 입력해 주세요."
            required
          />
          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? "생성 중…" : "생성하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
