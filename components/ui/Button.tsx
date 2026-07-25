import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  // Exactly one primary (accent) button visible per workspace state.
  primary:
    "bg-accent text-white hover:bg-accent-hover active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-accent",
  secondary:
    "border border-border bg-surface text-text hover:bg-accent-soft hover:border-accent/40 active:scale-[0.98] disabled:opacity-40",
  ghost:
    "text-text-muted hover:text-text hover:bg-border/40 disabled:opacity-40",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "secondary",
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-md px-4 py-2.5 text-small font-semibold transition ${styles[variant]} ${className}`}
      {...rest}
    />
  );
}
