import type { Answers, MediaType, Mood } from "./types";
import type { Params } from "./tmdb";

/**
 * The "no AI" recommendation core: a deterministic mapping from the three
 * answers to TMDB /discover queries. Tables mirror the plan; genre IDs are
 * TMDB's (movie and TV use different ID sets).
 *
 * Discover semantics: `|` in with_genres = OR, `,` = AND;
 * without_genres is a comma list, all excluded.
 */

// Movie genres
const M = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  fantasy: 14,
  horror: 27,
  mystery: 9648,
  romance: 10749,
  scifi: 878,
  thriller: 53,
  family: 10751,
  war: 10752,
} as const;

// TV genres (different IDs; no horror/romance)
const T = {
  actionAdventure: 10759,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  kids: 10762,
  mystery: 9648,
  scifiFantasy: 10765,
  warPolitics: 10768,
} as const;

/** Never suggest non-bingeable TV formats: news, reality, soap, talk. */
const TV_NEVER = "10763,10764,10766,10767";

interface MoodRow {
  withGenres: string;
  withoutGenres: string;
  voteCount: number;
  voteAvg: number;
  /** Genre AND-ed with romance for the date-night blend call (movies). */
  primaryGenre: number;
}

const MOVIE_MOODS: Record<Mood, MoodRow> = {
  laugh: {
    withGenres: `${M.comedy}`,
    withoutGenres: `${M.horror},${M.thriller},${M.war}`,
    voteCount: 300,
    voteAvg: 6.3,
    primaryGenre: M.comedy,
  },
  thrill: {
    withGenres: `${M.thriller}|${M.mystery}|${M.crime}`,
    withoutGenres: `${M.horror},${M.family},${M.romance}`,
    voteCount: 300,
    voteAvg: 6.5,
    primaryGenre: M.thriller,
  },
  feel: {
    withGenres: `${M.drama}|${M.romance}`,
    withoutGenres: `${M.horror},${M.scifi},${M.action}`,
    voteCount: 300,
    voteAvg: 6.8,
    primaryGenre: M.drama,
  },
  think: {
    withGenres: `${M.scifi}|${M.mystery}|${M.documentary}`,
    withoutGenres: `${M.horror},${M.family}`,
    voteCount: 300,
    voteAvg: 7.0,
    primaryGenre: M.scifi,
  },
  escape: {
    withGenres: `${M.adventure}|${M.fantasy}|${M.scifi}`,
    withoutGenres: `${M.horror},${M.documentary}`,
    voteCount: 400,
    voteAvg: 6.5,
    primaryGenre: M.adventure,
  },
  scare: {
    withGenres: `${M.horror}`,
    withoutGenres: `${M.animation},${M.family}`,
    voteCount: 300,
    voteAvg: 6.0, // horror ratings skew low
    primaryGenre: M.horror,
  },
};

const TV_MOODS: Record<Mood, Omit<MoodRow, "primaryGenre">> = {
  laugh: {
    withGenres: `${T.comedy}`,
    withoutGenres: TV_NEVER,
    voteCount: 150,
    voteAvg: 6.5,
  },
  thrill: {
    withGenres: `${T.crime}|${T.mystery}|${T.actionAdventure}`,
    withoutGenres: `${TV_NEVER},${T.kids}`,
    voteCount: 150,
    voteAvg: 6.8,
  },
  feel: {
    withGenres: `${T.drama}`,
    withoutGenres: `${TV_NEVER},${T.crime},${T.warPolitics}`,
    voteCount: 150,
    voteAvg: 7.0,
  },
  think: {
    withGenres: `${T.scifiFantasy}|${T.mystery}|${T.documentary}`,
    withoutGenres: `${TV_NEVER},${T.kids}`,
    voteCount: 150,
    voteAvg: 7.0,
  },
  escape: {
    withGenres: `${T.scifiFantasy}|${T.actionAdventure}`,
    withoutGenres: `${TV_NEVER},${T.documentary}`,
    voteCount: 150,
    voteAvg: 6.8,
  },
  // TV has no horror genre — mystery + sci-fi&fantasy is the closest net
  // (Hill House, Stranger Things et al.), minus comedy/kids/animation.
  scare: {
    withGenres: `${T.mystery}|${T.scifiFantasy}`,
    withoutGenres: `${TV_NEVER},${T.kids},${T.comedy},${T.animation}`,
    voteCount: 100,
    voteAvg: 6.5,
  },
};

export interface CompiledQuery {
  params: Params;
  fromDateBlend: boolean;
}

export interface CompiledPlan {
  media: MediaType;
  queries: CompiledQuery[];
}

export const MAX_RELAX_LEVEL = 3;

function appendGenres(list: string, extra: string): string {
  const merged = new Set(
    [...list.split(","), ...extra.split(",")].filter(Boolean),
  );
  return [...merged].join(",");
}

/**
 * Answers → discover queries, at a relaxation level (0 = strict).
 * Relaxation is cumulative:
 *   1: quality floors lowered (avg −0.5, count halved)
 *   2: + runtime bounds widened ±20 min (movie modes)
 *   3: + floors lowered again and deeper popularity pages fetched
 */
export function compileQueries(answers: Answers, relax = 0): CompiledPlan {
  const media: MediaType = answers.time === "series" ? "tv" : "movie";
  const row = media === "movie" ? MOVIE_MOODS[answers.mood] : TV_MOODS[answers.mood];

  let withGenres = row.withGenres;
  let withoutGenres = row.withoutGenres;
  let voteCount = row.voteCount;
  let voteAvg = row.voteAvg;

  if (relax >= 1) {
    voteAvg -= 0.5;
    voteCount = Math.floor(voteCount / 2);
  }
  if (relax >= 3) {
    voteAvg -= 0.5;
    voteCount = Math.floor(voteCount / 2);
  }

  const base: Params = {
    include_adult: false,
    language: "en-US",
    "vote_count.gte": voteCount,
    "vote_average.gte": Math.max(0, voteAvg),
  };

  // Time → runtime bounds (movies only; discover/tv's runtime filter is
  // per-episode and not useful — series length is shown, not filtered).
  if (media === "movie") {
    const widen = relax >= 2 ? 20 : 0;
    if (answers.time === "quick") {
      base["with_runtime.gte"] = Math.max(40, 60 - widen);
      base["with_runtime.lte"] = 105 + widen;
    } else {
      base["with_runtime.gte"] = 110 - widen;
    }
  }

  // Company → certification / exclusions
  if (answers.company === "family") {
    if (media === "movie") {
      base.certification_country = "US";
      base["certification.lte"] = "PG-13";
      if (answers.mood === "scare") {
        // "Spooky, not scarring": PG-13 horror/mystery instead of banning it
        withGenres = `${M.horror}|${M.mystery}`;
      } else {
        withoutGenres = appendGenres(withoutGenres, `${M.horror}`);
      }
    }
    // Discover/tv ignores certification params — the TV-MA gate happens
    // client-side (content_ratings) for displayed picks in the engine.
  }
  if (answers.company === "date" && media === "movie") {
    withoutGenres = appendGenres(withoutGenres, `${M.animation},${M.family}`);
  }
  if (answers.company === "friends") {
    // Group watching wants crowd-pleasers: double the vote floor so picks
    // are titles everyone's heard of, and skip romance/documentaries.
    base["vote_count.gte"] = voteCount * 2;
    withoutGenres = appendGenres(
      withoutGenres,
      media === "movie"
        ? `${M.romance},${M.documentary}`
        : `${T.kids},${T.documentary}`,
    );
  }

  const withParams = (extra: Params): Params => ({
    ...base,
    with_genres: withGenres,
    without_genres: withoutGenres,
    ...extra,
  });

  const queries: CompiledQuery[] = [
    { params: withParams({ sort_by: "popularity.desc", page: 1 }), fromDateBlend: false },
    { params: withParams({ sort_by: "popularity.desc", page: 2 }), fromDateBlend: false },
    {
      // Acclaimed-classics injection: rating sort needs a high vote floor
      // or 10-vote obscurities dominate.
      params: withParams({
        sort_by: "vote_average.desc",
        page: 1,
        "vote_count.gte": media === "movie" ? 1000 : 500,
      }),
      fromDateBlend: false,
    },
  ];

  if (relax >= 3) {
    queries.push(
      { params: withParams({ sort_by: "popularity.desc", page: 3 }), fromDateBlend: false },
      { params: withParams({ sort_by: "popularity.desc", page: 4 }), fromDateBlend: false },
    );
  }

  // Date-night blend: mood genre AND romance, merged in with a score bonus.
  if (answers.company === "date" && media === "movie" && answers.mood !== "feel") {
    queries.push({
      params: withParams({
        with_genres: `${MOVIE_MOODS[answers.mood].primaryGenre},${M.romance}`,
        sort_by: "popularity.desc",
        page: 1,
      }),
      fromDateBlend: true,
    });
  }

  return { media, queries };
}
