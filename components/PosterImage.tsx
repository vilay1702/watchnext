"use client";

import { useState } from "react";
import { posterUrl } from "@/lib/tmdb";

/**
 * Poster <img> with a graceful fallback: TMDB CDN when a path exists and
 * loads, otherwise a tinted placeholder with the title's initial.
 * Plain <img> — the family avoids next/image (static export).
 */
export function PosterImage({
  path,
  name,
  size = "w342",
  className = "",
}: {
  path: string | null;
  name: string;
  size?: "w342" | "w500";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = posterUrl(path, size);

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className={`flex aspect-[2/3] items-center justify-center rounded-md bg-accent-soft ${className}`}
      >
        <span className="font-display text-4xl font-bold text-accent">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Poster for ${name}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`aspect-[2/3] rounded-md object-cover shadow-card ${className}`}
    />
  );
}
