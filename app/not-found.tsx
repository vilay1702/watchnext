import Link from "next/link";
import type { Metadata } from "next";
import { copy } from "@/lib/copy";
import { TOOL_NAME } from "@/lib/brand";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";

export const metadata: Metadata = {
  title: `Page not found · ${TOOL_NAME}`,
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div aria-hidden="true" className="text-5xl">
          🎬
        </div>
        <h1 className="font-display text-h2 font-bold">
          {copy.notFoundTitle}
        </h1>
        <p className="max-w-sm text-small text-text-muted">
          {copy.notFoundBody}
        </p>
        <Link
          href="/"
          className="rounded-md bg-accent px-5 py-2.5 text-small font-semibold text-white transition hover:bg-accent-hover active:scale-[0.98]"
        >
          {copy.backToPicker}
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
