"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./to-input-form.module.css";
import { createRollpaper } from "../api";
import { showToast } from "@/components/Toast";
import type { RollpaperMode } from "@/lib/theme";

/** Epic 2 Story 2.1 / Epic 6 Story 6.1 — mode는 /new(온라인)·/gift(무드등) 공용 */
export function ToInputForm({ mode = "online" }: { mode?: RollpaperMode }) {
  const router = useRouter();
  const [toName, setToName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!toName.trim()) return;
    setSubmitting(true);
    try {
      const { id } = await createRollpaper(toName.trim(), mode);
      router.push(`/${id}`);
    } catch {
      showToast("생성하지 못했어요. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="toName">To, 누구에게 보내는 롤링페이퍼인가요?</label>
        <input
          id="toName"
          type="text"
          value={toName}
          onChange={(e) => setToName(e.target.value)}
          placeholder="예: 사랑하는 민지에게"
          required
        />
        <p className={styles.hint}>생성하면 고유한 주소(URL)가 만들어져요. 가입은 필요 없어요.</p>
      </div>
      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? "생성 중…" : "생성하기"}
      </button>
    </form>
  );
}
