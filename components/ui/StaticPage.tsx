import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/** Shell for prose pages (about, privacy): header → H1 → copy → footer. */
export function StaticPage({
  h1,
  children,
}: {
  h1: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16">
        <h1 className="py-8 font-display text-h1-mobile font-bold tracking-tight sm:py-10 sm:text-h1">
          {h1}
        </h1>
        <div className="max-w-prose space-y-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

/** Section heading + body, so both prose pages stay visually identical. */
export function StaticSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 font-display text-h3 font-semibold">{heading}</h2>
      <div className="space-y-3 text-body text-text-muted">{children}</div>
    </section>
  );
}
