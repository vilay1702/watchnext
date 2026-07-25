import Link from "next/link";
import { ENDORSEMENT, MAKER_CREDIT, TOOL_NAME } from "@/lib/brand";
import { Mark } from "./Mark";

/**
 * Footer per brand doc §6: [tool name] · from [Parent] · about · privacy,
 * closing with the maker credit on its own line.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-8 text-small text-text-muted">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span className="flex items-center gap-2">
            <Mark size={20} />
            <span className="font-medium text-text">{TOOL_NAME}</span>
          </span>
          {ENDORSEMENT && (
            <>
              <span aria-hidden="true">·</span>
              <Link href="/" className="transition hover:text-accent">
                {ENDORSEMENT}
              </Link>
            </>
          )}
          <span aria-hidden="true">·</span>
          <Link href="/about" className="transition hover:text-accent">
            About
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/privacy" className="transition hover:text-accent">
            Privacy
          </Link>
        </div>
        <p>{MAKER_CREDIT}</p>
      </div>
    </footer>
  );
}
