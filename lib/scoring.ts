import type { Mood, Title } from "./types";

/**
 * IMDb-style weighted rating: pulls titles with few votes toward the global
 * mean C, so a 9.2 with 60 votes can't outrank an 8.6 with 20,000.
 *   score = (v/(v+m))·R + (m/(v+m))·C
 */
const GLOBAL_MEAN = 6.9;
const MIN_VOTES = { movie: 500, tv: 250 } as const;

/** How much being new is worth depends on the mood: escapism and comedy
    date fast; the best mind-benders are decades old. */
const RECENCY_BONUS: Record<Mood, number> = {
  laugh: 0.2,
  thrill: 0.1,
  feel: 0.05,
  think: 0,
  escape: 0.2,
  scare: 0.15,
};
const RECENCY_WINDOW_YEARS = 3;

export interface ScoreContext {
  currentYear: number;
  mood: Mood;
}

export function scoreTitle(title: Title, ctx: ScoreContext): number {
  const v = title.voteCount;
  const m = MIN_VOTES[title.mediaType];
  const R = title.voteAverage;
  let score = (v / (v + m)) * R + (m / (v + m)) * GLOBAL_MEAN;
  score += title.poolBonus;
  if (title.year && title.year >= ctx.currentYear - RECENCY_WINDOW_YEARS)
    score += RECENCY_BONUS[ctx.mood];
  return score;
}
