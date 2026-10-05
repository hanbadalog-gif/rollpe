import Link from "next/link";
import { ToInputForm } from "@/features/rollpaper-create/components/ToInputForm";

export default function NewRollpaperPage() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "13px 16px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <Link href="/" style={{ fontSize: 16, color: "var(--ink-soft)" }}>
          ←
        </Link>
        <h3 style={{ fontSize: 13.5, margin: 0, fontWeight: 700 }}>롤링페이퍼 만들기</h3>
      </div>
      <ToInputForm />
    </div>
  );
}
