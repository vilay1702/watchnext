"use client";

import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/Button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-5xl">🎬💥</div>
      <h1 className="font-display text-h2 font-bold">{copy.errorTitle}</h1>
      <p className="text-small text-text-muted max-w-sm">{copy.errorBody}</p>
      <Button variant="primary" onClick={reset} className="px-5">
        {copy.tryAgain}
      </Button>
    </main>
  );
}
