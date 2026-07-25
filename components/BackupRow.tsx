"use client";

import type { Title } from "@/lib/types";
import { copy } from "@/lib/copy";
import { PosterImage } from "@/components/PosterImage";

/** The three runner-up cards. Tapping one promotes it to the hero slot. */
export function BackupRow({
  backups,
  onPromote,
}: {
  backups: Title[];
  onPromote: (title: Title) => void;
}) {
  if (backups.length === 0) return null;
  return (
    <section aria-label={copy.backupsHeading} className="mt-8">
      <h3 className="mb-3 font-display text-h3 font-semibold">
        {copy.backupsHeading}
      </h3>
      <ul className="grid grid-cols-3 gap-3">
        {backups.map((t) => (
          <li key={t.key} className="min-w-0">
            <button
              type="button"
              onClick={() => onPromote(t)}
              className="group w-full rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <PosterImage
                path={t.posterPath}
                name={t.name}
                className="w-full transition group-hover:opacity-85"
              />
              <p className="mt-1.5 truncate text-small font-semibold group-hover:text-accent">
                {t.name}
              </p>
              <p className="text-small text-text-muted">
                {t.year ? `${t.year} · ` : ""}★ {t.voteAverage.toFixed(1)}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
