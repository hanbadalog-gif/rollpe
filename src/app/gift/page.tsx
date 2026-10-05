import Link from "next/link";
import { ModeSelect } from "@/features/rollpaper-create/components/ModeSelect";

export default function GiftPage() {
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
        <h3 style={{ fontSize: 13.5, margin: 0, fontWeight: 700 }}>롤링페이퍼 무드등 선물하기</h3>
      </div>
      <ModeSelect />
    </div>
  );
}
