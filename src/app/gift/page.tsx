import Link from "next/link";
import { ModeSelect } from "@/features/rollpaper-create/components/ModeSelect";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function GiftPage() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "13px 16px",
          background: "var(--accent)",
        }}
      >
        <Link href="/" style={{ fontSize: 16, color: "var(--accent-ink)" }}>
          ←
        </Link>
        <h3
          style={{ fontSize: 13.5, margin: 0, fontWeight: 700, color: "var(--accent-ink)", flex: 1 }}
        >
          롤링페이퍼 무드등 선물하기
        </h3>
        <ThemeToggle />
      </div>
      <ModeSelect />
    </div>
  );
}
