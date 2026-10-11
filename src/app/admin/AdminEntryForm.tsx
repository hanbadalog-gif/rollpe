"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function AdminEntryForm() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const match = value.match(UUID_RE);
    if (!match) return;
    router.push(`/admin/${match[0]}`);
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 16, marginBottom: 6 }}>롤링페이퍼 문구 내보내기</h1>
      <p style={{ fontSize: 12, color: "#767676", marginBottom: 16, lineHeight: 1.6 }}>
        롤링페이퍼 URL이나 ID를 붙여넣으세요.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://rollpe-app.vercel.app/xxxxxxxx-..."
          style={{ flex: 1, padding: "9px 11px", borderRadius: 8, border: "1px solid #e5e5e5", fontSize: 13 }}
        />
        <button
          type="submit"
          style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "#6c7fb7", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          열기
        </button>
      </form>
    </div>
  );
}
