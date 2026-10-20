"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import newStyles from "@/app/new/new.module.css";
import styles from "./gift-flow.module.css";
import { createRollpaper } from "../api";
import { showToast } from "@/components/Toast";
import type { RollpaperMode } from "@/lib/theme";

// 무드등 선물하기 — 유형 선택(예시 사진, 유형 A=드로잉 액자 / 유형 B=투명 아크릴) → [투명 아크릴(유형 B)만: 고정 레이아웃 안내(7_0.jpg)] → To 입력 → 캔버스(/gift/[id])
type Step = "type" | "intro" | "to";

export function GiftFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("type");
  const [mode, setMode] = useState<RollpaperMode>("mood_a");
  const [toName, setToName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function pick(next: RollpaperMode) {
    setMode(next);
    setStep(next === "mood_a" ? "intro" : "to");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!toName.trim()) return;
    setSubmitting(true);
    try {
      const { id } = await createRollpaper(toName.trim(), mode);
      router.push(`/gift/${id}`);
    } catch {
      showToast("생성하지 못했어요. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  if (step === "type") {
    return (
      <div className={styles.types}>
        <h1 className={styles.title}>어떤 무드등을 만들까요?</h1>
        <div className={styles.typeCard}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/type-b.jpg" alt="드로잉 액자 무드등 예시" className={styles.typeImg} />
          <strong>유형 A · 드로잉 액자 무드등</strong>
          <p>흰 배경 고정 · 가운데 사진 + 글</p>
          <div className={styles.sizeRow}>
            <button type="button" className={newStyles.submit} onClick={() => pick("mood_b_8")}>
              8인치 · 6~8명
            </button>
            <button type="button" className={newStyles.submit} onClick={() => pick("mood_b_a4")}>
              A4 · 최대 20명
            </button>
          </div>
        </div>
        <div className={styles.typeCard}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 예시 사진 */}
          <img src="/brand/type-a.jpg" alt="투명 아크릴 무드등 예시" className={styles.typeImg} />
          <strong>유형 B · 투명 아크릴 무드등</strong>
          <p>어두운 배경에 흰 글씨 · 최대 8명</p>
          <button type="button" className={newStyles.submit} onClick={() => pick("mood_a")}>
            유형 B로 만들기
          </button>
        </div>
        <Link href="/gift/my" className={newStyles.myLink}>
          이전에 만든 무드등 찾기
        </Link>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div className={styles.intro}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 안내용 정적 이미지 */}
        <img src="/brand/gift-2.jpg" alt="" className={styles.img} />
        <button type="button" className={newStyles.submit} onClick={() => setStep("to")}>
          무드등 만들기 시작
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
        <Link href="/gift/my" className={newStyles.myLink}>
          이전에 만든 무드등 찾기
        </Link>
      </form>
    </div>
  );
}
