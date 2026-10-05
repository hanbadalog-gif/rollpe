import type { ButtonHTMLAttributes } from "react";

type Variant = "accent" | "ghost";

export function Button({
  variant = "accent",
  block = false,
  className = "",
  style,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; block?: boolean }) {
  const base: React.CSSProperties = {
    fontWeight: 700,
    fontSize: 13,
    borderRadius: 11,
    border: "none",
    padding: "12px 16px",
    cursor: "pointer",
    textAlign: "center",
    width: block ? "100%" : undefined,
    background: variant === "accent" ? "var(--accent)" : "var(--surface-2)",
    color: variant === "accent" ? "var(--accent-ink)" : "var(--ink-soft)",
  };

  return <button className={className} style={{ ...base, ...style }} {...rest} />;
}
