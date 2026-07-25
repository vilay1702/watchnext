import type { Title } from "./types";

/**
 * IMDb-style weighted rating: pulls titles with few votes toward the global
 * mean C, so a 9.2 with 60 votes can't outrank an 8.6 with 20,000.
 *   score = (v/(v+m))·R + (m/(v+m))·C
 */
const GLOBAL_MEAN = 6.9;
const MIN_VOTES = { movie: 500, tv: 250 } as const;

const DATE_BLEND_BONUS = 0.3;
const RECENCY_BONUS = 0.2;
const RECENCY_WINDOW_YEARS = 3;

export function scoreTitle(title: Title, currentYear: number): number {
  const v = title.voteCount;
  const m = MIN_VOTES[title.mediaType];
  const R = title.voteAverage;
  let score = (v / (v + m)) * R + (m / (v + m)) * GLOBAL_MEAN;
  if (title.fromDateBlend) score += DATE_BLEND_BONUS;
  if (title.year && title.year >= currentYear - RECENCY_WINDOW_YEARS)
    score += RECENCY_BONUS;
  return score;
}
