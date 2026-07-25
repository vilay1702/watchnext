import Link from "next/link";
import { ENDORSEMENT, TOOL_NAME } from "@/lib/brand";
import { Mark } from "./Mark";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Shared chrome: tool wordmark (the hero) + endorsement lockup (§2) on the
 * left, header actions (theme toggle) on the right.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
        <Link href="/" className="flex items-baseline gap-2.5">
          <Mark className="self-center" />
          <span className="font-display text-body font-bold tracking-[-0.02em]">
            {TOOL_NAME}
          </span>
          {/* Endorsement lockup (§2): UI font, 500, muted — never louder
              than the tool name. Appears once the parent brand is decided. */}
          {ENDORSEMENT && (
            <span className="text-small font-medium text-text-muted">
              {ENDORSEMENT}
            </span>
          )}
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
