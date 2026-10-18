"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/** 관리자 비밀번호 입력 — 맞으면 쿠키가 저장되고 같은 주소에서 요청 목록이 열린다 */
export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: password }),
      });
      if (!res.ok) {
        setError(res.status === 429 ? "시도가 너무 많아요. 10분 뒤에 다시 시도해주세요." : "비밀번호가 올바르지 않아요.");
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("연결하지 못했어요. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: "80px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 17, marginBottom: 6 }}>관리자 로그인</h1>
      <p style={{ fontSize: 12.5, color: "#767676", marginBottom: 16, lineHeight: 1.6 }}>
        무드등 제작 요청을 확인하려면 관리자 비밀번호를 입력해 주세요.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="관리자 비밀번호"
          autoComplete="current-password"
          aria-label="관리자 비밀번호"
          style={{ flex: 1, minWidth: 0, padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e5e5", fontSize: 13 }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#6c7fb7", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: submitting ? 0.6 : 1 }}
        >
          입장
        </button>
      </form>
      {error && (
        <p role="alert" style={{ marginTop: 10, fontSize: 12.5, color: "#c0392b" }}>
          {error}
        </p>
      )}
    </div>
  );
}
