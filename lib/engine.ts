import type { Answers, Title } from "./types";
import { discover } from "./tmdb";
import { compileQueries, MAX_RELAX_LEVEL } from "./moods";
import { scoreTitle } from "./scoring";

/**
 * Pool building + selection. Deterministic rules, random only within a
 * pre-vetted top slice — "Show me another" feels fresh but stays good.
 */

/** Enough selectable titles to not bother relaxing further. */
const POOL_TARGET = 8;
/** The pre-vetted slice picks are drawn from. */
const TOP_SLICE = 12;
/** The hero comes from the very top of that slice. */
const HERO_SLICE = 5;
const BACKUP_COUNT = 3;

export interface BuiltPool {
  titles: Title[];
  relaxLevel: number;
}

/**
 * Fetch, dedupe, and score the candidate pool for a set of answers,
 * walking the relaxation ladder until enough selectable titles exist.
 */
export async function buildPool(
  answers: Answers,
  excluded: Set<string>,
): Promise<BuiltPool> {
  const currentYear = new Date().getFullYear();
  const byKey = new Map<string, Title>();

  let relax = 0;
  for (;;) {
    const plan = compileQueries(answers, relax);
    let firstError: unknown = null;
    const batches = await Promise.all(
      plan.queries.map((q) =>
        discover(plan.media, q.params, q.fromDateBlend).catch((e) => {
          firstError ??= e;
          return [] as Title[];
        }),
      ),
    );
    // Individual query failures are tolerable; all of them failing with an
    // empty pool means TMDB is unreachable — surface the real error.
    if (firstError && batches.every((b) => b.length === 0) && byKey.size === 0)
      throw firstError;
    for (const batch of batches) {
      for (const t of batch) {
        const existing = byKey.get(t.key);
        // A date-blend duplicate upgrades the stored copy (keeps the bonus).
        if (!existing || (t.fromDateBlend && !existing.fromDateBlend)) {
          byKey.set(t.key, t);
        }
      }
    }

    const selectable = [...byKey.values()].filter(
      (t) => !excluded.has(t.key) && t.overview && t.posterPath,
    );
    if (selectable.length >= POOL_TARGET || relax >= MAX_RELAX_LEVEL) {
      const titles = selectable
        .map((t) => ({ ...t, score: scoreTitle(t, currentYear) }))
        .sort((a, b) => b.score - a.score);
      return { titles, relaxLevel: relax };
    }
    relax += 1;
  }
}

export interface Picks {
  hero: Title;
  backups: Title[];
}

function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/**
 * Draw a hero + backups from the pool: hero at random from the top
 * HERO_SLICE of the not-yet-shown top slice, backups from the rest.
 * Returns null when the pool is exhausted for this session.
 */
export function pickTitles(
  pool: Title[],
  blocked: Set<string>,
  shown: Set<string>,
): Picks | null {
  const candidates = pool.filter(
    (t) => !blocked.has(t.key) && !shown.has(t.key),
  );
  if (candidates.length === 0) return null;

  const slice = candidates.slice(0, TOP_SLICE);
  const [hero] = sample(slice.slice(0, HERO_SLICE), 1);
  const backups = sample(
    slice.filter((t) => t.key !== hero.key),
    BACKUP_COUNT,
  );
  return { hero, backups };
}
