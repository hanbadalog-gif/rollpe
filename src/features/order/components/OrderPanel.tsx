"use client";

import { useState, type FormEvent } from "react";
import styles from "./order-panel.module.css";
import { api, ApiError } from "@/lib/api-client";
import { getOwnerToken } from "@/lib/editToken";
import { showToast } from "@/components/Toast";

interface Props {
  rollpaperId: string;
  onDone: () => void;
}

/** 무드등 제작 요청 — 방장이 연락처를 남기면 요청 시점의 문구/배치가 서버에 고정(snapshot)된다 */
export function OrderPanel({ rollpaperId, onDone }: Props) {
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
      await api.post(`/api/rollpapers/${rollpaperId}/order`, { contactName, contact, memo }, { "x-owner-token": token });
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
        {submitting ? "보내는 중…" : "제작 요청하기"}
      </button>
    </form>
  );
}
