"use client";

import { useState } from "react";
import type {
  Answers,
  RegionProviders,
  Title,
  TitleDetails,
} from "@/lib/types";
import { backdropUrl, trailerUrl } from "@/lib/tmdb";
import { genreNames } from "@/lib/genres";
import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/Button";
import { PosterImage } from "@/components/PosterImage";
import { ProviderBadges } from "@/components/ProviderBadges";
import { RegionPicker } from "@/components/RegionPicker";

function metaParts(title: Title, details: TitleDetails | undefined): string[] {
  const parts: string[] = [];
  if (title.year) parts.push(String(title.year));
  if (title.mediaType === "movie") {
    if (details?.runtime) parts.push(copy.runtime(details.runtime));
  } else if (details?.seasons) {
    parts.push(
      `${copy.seasons(details.seasons)}${
        details.episodes ? ` · ${copy.episodes(details.episodes)}` : ""
      }`,
    );
  }
  return parts;
}

/** One honest line on why the engine chose this — the no-AI receipt. */
function whyLine(title: Title, answers: Answers): string {
  return [
    `${copy.moods[answers.mood].emoji} ${copy.moods[answers.mood].label}`,
    copy.times[answers.time].hint ?? copy.times[answers.time].label,
    `★ ${title.voteAverage.toFixed(1)} · ${copy.ratingsCount(title.voteCount)}`,
  ].join("  ·  ");
}

export function ResultHero({
  title,
  answers,
  details,
  providers,
  region,
  onRegionChange,
  onShowAnother,
  onSeen,
  onDismiss,
}: {
  title: Title;
  answers: Answers;
  details: TitleDetails | undefined;
  providers: RegionProviders | null | undefined;
  region: string;
  onRegionChange: (region: string) => void;
  onShowAnother: () => void;
  onSeen: () => void;
  onDismiss: () => void;
}) {
  const [plotOpen, setPlotOpen] = useState(false);
  const backdrop = backdropUrl(title.backdropPath);
  const genres = genreNames(title.mediaType, title.genreIds);
  const longPlot = title.overview.length > 260;

  return (
    <article key={title.key} className="animate-pop-in">
      {/* Cinematic banner: dimmed backdrop under a surface-tinted gradient,
          so text stays legible in both themes (tokens flip, image doesn't). */}
      <div className="relative overflow-hidden rounded-lg border border-border">
        {backdrop && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backdrop}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div
          className={`absolute inset-0 ${
            backdrop
              ? "bg-gradient-to-r from-surface via-surface/90 to-surface/55"
              : "bg-surface"
          }`}
        />

        <div className="relative grid gap-5 p-4 sm:grid-cols-[minmax(0,180px)_1fr] sm:p-6">
          <div className="mx-auto w-40 sm:w-full">
            <PosterImage path={title.posterPath} name={title.name} size="w500" />
          </div>

          <div className="min-w-0 space-y-3">
            <div>
              <p className="font-display text-small font-bold uppercase tracking-wide text-accent">
                {copy.heroKicker}
              </p>
              <h2 className="mt-1 font-display text-h2 font-bold">
                {title.name}
              </h2>
              <p className="mt-1 text-small text-text-muted">
                {copy.matchedTo}: {whyLine(title, answers)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-small text-text-muted">
              <span className="rounded-sm bg-accent-soft px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
                {title.mediaType === "movie" ? "Movie" : "Series"}
              </span>
              {genres.map((g) => (
                <span
                  key={g}
                  className="rounded-sm border border-border bg-surface/70 px-1.5 py-0.5 text-[11px] font-semibold"
                >
                  {g}
                </span>
              ))}
              {metaParts(title, details).length > 0 && (
                <span className="ml-1">
                  {metaParts(title, details).join(" · ")}
                </span>
              )}
            </div>

            <div className="max-w-prose text-body text-text-muted">
              <p className={plotOpen ? "" : "line-clamp-3"}>{title.overview}</p>
              {longPlot && (
                <button
                  type="button"
                  onClick={() => setPlotOpen((o) => !o)}
                  className="mt-0.5 text-small font-semibold text-accent hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {plotOpen ? copy.plotLess : copy.plotMore}
                </button>
              )}
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-small font-semibold">
                  {copy.whereToWatch}
                </h3>
                <RegionPicker value={region} onChange={onRegionChange} />
              </div>
              <ProviderBadges providers={providers} region={region} />
            </div>

            <div className="pt-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  variant="primary"
                  onClick={onShowAnother}
                  className="w-full sm:w-auto"
                >
                  {copy.showAnother}
                </Button>
                {details?.trailerKey && (
                  <a
                    href={trailerUrl(details.trailerKey)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-center text-small font-semibold transition hover:border-accent/40 hover:bg-accent-soft active:scale-[0.98] sm:w-auto"
                  >
                    {copy.watchTrailer} ↗
                  </a>
                )}
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={onSeen} className="flex-1 sm:flex-none">
                    {copy.seenIt}
                  </Button>
                  <Button variant="ghost" onClick={onDismiss} className="flex-1 sm:flex-none">
                    {copy.notInterested}
                  </Button>
                </div>
              </div>
              <p className="mt-1.5 text-[11px] leading-4 text-text-muted">
                {copy.exclusionHint}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
