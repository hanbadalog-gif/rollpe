"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import newStyles from "@/app/new/new.module.css";
import styles from "./gift-flow.module.css";
import { createRollpaper } from "../api";
import { showToast } from "@/components/Toast";

// 무드등 선물하기 진입 순서 — 7.jpg(완성 예시) → 7_0.jpg(고정 디자인 안내) → 7_01.jpg(To 입력) → 캔버스(7_1.jpg)
const INTRO = ["/brand/gift-1.jpg", "/brand/gift-2.jpg"];

export function GiftFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [toName, setToName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!toName.trim()) return;
    setSubmitting(true);
    try {
      const { id } = await createRollpaper(toName.trim(), "mood_a");
      router.push(`/gift/${id}`);
    } catch {
      showToast("생성하지 못했어요. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  if (step < INTRO.length) {
    return (
      <div className={styles.intro}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 안내용 정적 이미지 */}
        <img src={INTRO[step]} alt="" className={styles.img} />
        <button type="button" className={newStyles.submit} onClick={() => setStep(step + 1)}>
          {step === 0 ? "다음" : "무드등 만들기 시작"}
        </button>
      </div>
    );
  }

  return (
    <div className={newStyles.body}>
      <form className={newStyles.card} onSubmit={handleSubmit}>
        <span className={newStyles.label}>To.</span>
        <input
          className={newStyles.input}
          type="text"
          value={toName}
          onChange={(e) => setToName(e.target.value)}
          placeholder="받는 사람을 입력해 주세요."
          required
        />
        <button type="submit" className={newStyles.submit} disabled={submitting}>
          {submitting ? "생성 중…" : "생성하기"}
        </button>
      </form>
    </div>
  );
}
