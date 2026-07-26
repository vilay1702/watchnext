"use client";

import type { Title } from "@/lib/types";
import { distinctiveGenre } from "@/lib/genres";
import { copy } from "@/lib/copy";
import { PosterImage } from "@/components/PosterImage";

/**
 * The runner-up cards. Backups are deliberately picked to differ from the
 * hero — each is tagged with the genre that makes it a different direction.
 * Tapping one promotes it to the hero slot.
 */
export function BackupRow({
  backups,
  heroGenreIds,
  onPromote,
}: {
  backups: Title[];
  heroGenreIds: number[];
  onPromote: (title: Title) => void;
}) {
  if (backups.length === 0) return null;
  return (
    <section aria-label={copy.backupsHeading} className="mt-8">
      <h3 className="mb-3 font-display text-h3 font-semibold">
        {copy.backupsHeading}
      </h3>
      <ul className="grid grid-cols-3 gap-3">
        {backups.map((t) => {
          const tag = distinctiveGenre(t.mediaType, t.genreIds, heroGenreIds);
          return (
            <li key={t.key} className="min-w-0">
              <button
                type="button"
                onClick={() => onPromote(t)}
                className="group w-full rounded-md p-1 text-left transition hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <PosterImage
                  path={t.posterPath}
                  name={t.name}
                  className="w-full transition group-hover:opacity-85"
                />
                {tag && (
                  <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
                    {tag}
                  </p>
                )}
                <p className="mt-0.5 truncate text-small font-semibold group-hover:text-accent">
                  {t.name}
                </p>
                <p className="text-small text-text-muted">
                  {t.year ? `${t.year} · ` : ""}★ {t.voteAverage.toFixed(1)}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
