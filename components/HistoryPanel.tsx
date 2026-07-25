"use client";

import type { HistoryRecord } from "@/lib/types";
import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/Button";
import { PosterImage } from "@/components/PosterImage";

function when(at: number): string {
  const days = Math.floor((Date.now() - at) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return new Date(at).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

/** Persisted list of heroes the user has been shown, newest first. */
export function HistoryPanel({
  history,
  onClear,
}: {
  history: HistoryRecord[];
  onClear: () => void;
}) {
  if (history.length === 0) return null;
  return (
    <section aria-labelledby="history-heading">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3
          id="history-heading"
          className="font-display text-h3 font-semibold"
        >
          {copy.historyTitle}
        </h3>
        <Button variant="ghost" onClick={onClear}>
          {copy.clearHistory}
        </Button>
      </div>
      <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {history.map((r) => (
          <li key={r.key} className="flex min-w-0 items-center gap-3">
            <PosterImage
              path={r.posterPath}
              name={r.name}
              className="w-9 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-small font-semibold">{r.name}</p>
              <p className="text-small text-text-muted">
                {r.mediaType === "movie" ? "Movie" : "Series"}
                {r.year ? ` · ${r.year}` : ""}
              </p>
            </div>
            <span className="shrink-0 text-small text-text-muted">
              {when(r.at)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
