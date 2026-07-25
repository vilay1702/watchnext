export type Mood = "laugh" | "thrill" | "feel" | "think" | "escape" | "scare";
export type TimeChoice = "quick" | "long" | "series";
export type Company = "solo" | "date" | "family";

export interface Answers {
  mood: Mood;
  time: TimeChoice;
  company: Company;
}

export type MediaType = "movie" | "tv";

/** A normalized movie-or-series candidate. `key` namespaces the numeric
    TMDB id across media types ("m550" / "t1399"). */
export interface Title {
  key: string;
  id: number;
  mediaType: MediaType;
  name: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  year: number | null;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  /** Came from the date-night blend query — gets a scoring bonus. */
  fromDateBlend: boolean;
  score: number;
}

/** Lazily fetched per displayed title (discover omits these). */
export interface TitleDetails {
  runtime: number | null;
  seasons: number | null;
  episodes: number | null;
  /** US content rating for the family gate (tv only). */
  tvRating: string | null;
}

export interface Provider {
  id: number;
  name: string;
  logoPath: string | null;
}

export interface RegionProviders {
  /** TMDB watch page for this title+region — the JustWatch-attributed link. */
  link: string | null;
  flatrate: Provider[];
  rent: Provider[];
  buy: Provider[];
}

/** Persisted under wn:excluded:v1 — titles never to suggest again. */
export interface Excluded {
  seen: string[];
  dismissed: string[];
}
