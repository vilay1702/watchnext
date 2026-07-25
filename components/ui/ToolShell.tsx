import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

interface ToolShellProps {
  h1: string;
  description: string;
  privacyLine: string;
  howItWorks: string[];
  /** The tool workspace — the only part each tool supplies. */
  children: ReactNode;
}

/**
 * The shared page shell: header → H1 → workspace → privacy line →
 * how it works → footer. Every tool renders in it.
 */
export function ToolShell({
  h1,
  description,
  privacyLine,
  howItWorks,
  children,
}: ToolShellProps) {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 pb-16">
        <div className="py-8 sm:py-10">
          <h1 className="font-display text-h1-mobile sm:text-h1 font-bold tracking-tight">
            {h1}
          </h1>
          <p className="mt-2 max-w-prose text-body text-text-muted">
            {description}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-6">
          {children}
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-small text-text-muted">
          <span aria-hidden="true" className="text-success">
            ✓
          </span>
          {privacyLine}
        </p>

        <section aria-labelledby="how-heading" className="mt-16">
          <h2
            id="how-heading"
            className="font-display text-h2 font-semibold mb-4"
          >
            How it works
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {howItWorks.map((step, i) => (
              <li
                key={step}
                className="rounded-md border border-border bg-surface p-4 shadow-card"
              >
                <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft font-display text-small font-bold text-accent">
                  {i + 1}
                </span>
                <p className="text-small text-text-muted">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
