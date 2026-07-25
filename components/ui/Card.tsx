import type { HTMLAttributes } from "react";

/**
 * Surface card. `tone="tinted"` for cards sitting on a surface panel
 * (e.g. side panels inside the tool workspace).
 */
export function Card({
  tone = "surface",
  className = "",
  ...rest
}: HTMLAttributes<HTMLElement> & { tone?: "surface" | "tinted" }) {
  const bg =
    tone === "surface" ? "bg-surface shadow-card" : "bg-bg";
  return (
    <section
      className={`rounded-lg border border-border p-5 ${bg} ${className}`}
      {...rest}
    />
  );
}
