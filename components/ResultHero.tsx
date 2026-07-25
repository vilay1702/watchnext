"use client";

import type { RegionProviders, Title, TitleDetails } from "@/lib/types";
import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/Button";
import { PosterImage } from "@/components/PosterImage";
import { ProviderBadges } from "@/components/ProviderBadges";
import { RegionPicker } from "@/components/RegionPicker";

function MetaRow({
  title,
  details,
}: {
  title: Title;
  details: TitleDetails | undefined;
}) {
  const parts: string[] = [];
  if (title.year) parts.push(String(title.year));
  parts.push(
    `★ ${copy.ratingOutOfTen(title.voteAverage)} (${title.voteCount.toLocaleString()} votes)`,
  );
  if (title.mediaType === "movie") {
    if (details?.runtime) parts.push(copy.runtime(details.runtime));
  } else if (details?.seasons) {
    parts.push(
      `${copy.seasons(details.seasons)}${
        details.episodes ? ` · ${copy.episodes(details.episodes)}` : ""
      }`,
    );
  }
  return (
    <p className="text-small text-text-muted">
      <span className="mr-2 inline-block rounded-sm bg-accent-soft px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
        {title.mediaType === "movie" ? "Movie" : "Series"}
      </span>
      {parts.join(" · ")}
    </p>
  );
}

export function ResultHero({
  title,
  details,
  providers,
  region,
  onRegionChange,
  onShowAnother,
  onSeen,
  onDismiss,
}: {
  title: Title;
  details: TitleDetails | undefined;
  providers: RegionProviders | null | undefined;
  region: string;
  onRegionChange: (region: string) => void;
  onShowAnother: () => void;
  onSeen: () => void;
  onDismiss: () => void;
}) {
  return (
    <article
      key={title.key}
      className="animate-pop-in grid gap-5 sm:grid-cols-[minmax(0,180px)_1fr]"
    >
      <div className="mx-auto w-40 sm:w-full">
        <PosterImage path={title.posterPath} name={title.name} size="w500" />
      </div>

      <div className="min-w-0 space-y-3">
        <p className="font-display text-small font-bold uppercase tracking-wide text-accent">
          {copy.heroKicker}
        </p>
        <h2 className="font-display text-h2 font-bold">{title.name}</h2>
        <MetaRow title={title} details={details} />
        <p className="max-w-prose text-body text-text-muted">
          {title.overview}
        </p>

        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-small font-semibold">{copy.whereToWatch}</h3>
            <RegionPicker value={region} onChange={onRegionChange} />
          </div>
          <ProviderBadges providers={providers} region={region} />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="primary" onClick={onShowAnother}>
            {copy.showAnother}
          </Button>
          <Button variant="secondary" onClick={onSeen}>
            {copy.seenIt}
          </Button>
          <Button variant="ghost" onClick={onDismiss}>
            {copy.notInterested}
          </Button>
        </div>
      </div>
    </article>
  );
}
