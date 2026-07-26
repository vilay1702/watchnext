import type {
  MediaType,
  Provider,
  RegionProviders,
  Title,
  TitleDetails,
  WatchProviderOption,
} from "./types";

/**
 * Thin TMDB v3 client. Auth is a v4 read access token baked into the bundle
 * at build time (NEXT_PUBLIC_TMDB_TOKEN) — a deliberate, accepted exposure:
 * it's a read-only public-data token and this site has no server.
 */
// api.tmdb.org (not api.themoviedb.org): same official API, but the
// themoviedb.org domain is blocked by some ISPs (notably in India).
const API_BASE = "https://api.tmdb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

const TOKEN = process.env.NEXT_PUBLIC_TMDB_TOKEN;

/** v4 read tokens are JWTs (dotted, long); v3 API keys are 32-char hex.
    Accept both: v4 goes in the Authorization header, v3 as ?api_key=. */
const IS_V4_TOKEN = Boolean(TOKEN?.includes("."));

export type TmdbErrorKind = "no-token" | "bad-key" | "rate-limited" | "network";

export class TmdbError extends Error {
  kind: TmdbErrorKind;
  constructor(kind: TmdbErrorKind, message: string) {
    super(message);
    this.name = "TmdbError";
    this.kind = kind;
  }
}

export function hasToken(): boolean {
  return Boolean(TOKEN);
}

export type Params = Record<string, string | number | boolean | undefined>;

async function tmdbFetch<T>(path: string, params: Params = {}): Promise<T> {
  if (!TOKEN) throw new TmdbError("no-token", "NEXT_PUBLIC_TMDB_TOKEN is not set");

  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  if (!IS_V4_TOKEN) url.searchParams.set("api_key", TOKEN);

  const attempt = () =>
    fetch(url, {
      headers: {
        ...(IS_V4_TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
        Accept: "application/json",
      },
      // A hung network must resolve to the error state, not an endless spinner.
      signal: AbortSignal.timeout(12_000),
    });

  let res: Response;
  try {
    res = await attempt();
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1000));
      res = await attempt();
    }
  } catch {
    // one retry on network failure
    try {
      await new Promise((r) => setTimeout(r, 1000));
      res = await attempt();
    } catch {
      throw new TmdbError("network", "Could not reach TMDB");
    }
  }

  if (res.status === 401 || res.status === 403)
    throw new TmdbError("bad-key", "TMDB rejected the API token");
  if (res.status === 429)
    throw new TmdbError("rate-limited", "TMDB rate limit hit");
  if (!res.ok) throw new TmdbError("network", `TMDB responded ${res.status}`);

  return (await res.json()) as T;
}

/* ---------- discover ---------- */

interface RawMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

interface RawTv {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

interface DiscoverResponse<R> {
  results: R[];
  total_pages: number;
}

function yearOf(date: string | undefined): number | null {
  const y = date ? Number(date.slice(0, 4)) : NaN;
  return Number.isFinite(y) && y > 1880 ? y : null;
}

export async function discover(
  media: MediaType,
  params: Params,
  poolBonus = 0,
): Promise<Title[]> {
  if (media === "movie") {
    const data = await tmdbFetch<DiscoverResponse<RawMovie>>(
      "/discover/movie",
      params,
    );
    return data.results.map((r) => ({
      key: `m${r.id}`,
      id: r.id,
      mediaType: "movie" as const,
      name: r.title,
      overview: r.overview,
      posterPath: r.poster_path,
      backdropPath: r.backdrop_path,
      year: yearOf(r.release_date),
      voteAverage: r.vote_average,
      voteCount: r.vote_count,
      genreIds: r.genre_ids ?? [],
      poolBonus,
      score: 0,
    }));
  }
  const data = await tmdbFetch<DiscoverResponse<RawTv>>("/discover/tv", params);
  return data.results.map((r) => ({
    key: `t${r.id}`,
    id: r.id,
    mediaType: "tv" as const,
    name: r.name,
    overview: r.overview,
    posterPath: r.poster_path,
    backdropPath: r.backdrop_path,
    year: yearOf(r.first_air_date),
    voteAverage: r.vote_average,
    voteCount: r.vote_count,
    genreIds: r.genre_ids ?? [],
    poolBonus,
    score: 0,
  }));
}

/* ---------- lazy per-title details ---------- */

export async function getDetails(title: {
  mediaType: MediaType;
  id: number;
}): Promise<TitleDetails> {
  if (title.mediaType === "movie") {
    const d = await tmdbFetch<{ runtime: number | null }>(
      `/movie/${title.id}`,
    );
    return { runtime: d.runtime ?? null, seasons: null, episodes: null, tvRating: null };
  }
  const d = await tmdbFetch<{
    number_of_seasons: number | null;
    number_of_episodes: number | null;
  }>(`/tv/${title.id}`);
  return {
    runtime: null,
    seasons: d.number_of_seasons ?? null,
    episodes: d.number_of_episodes ?? null,
    tvRating: null,
  };
}

/** US rating string ("TV-MA", "TV-14", …) or null if unrated. */
export async function getTvUsRating(id: number): Promise<string | null> {
  const d = await tmdbFetch<{
    results: { iso_3166_1: string; rating: string }[];
  }>(`/tv/${id}/content_ratings`);
  return d.results.find((r) => r.iso_3166_1 === "US")?.rating || null;
}

/* ---------- watch providers ---------- */

interface RawProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

interface RawRegionProviders {
  link?: string;
  flatrate?: RawProvider[];
  rent?: RawProvider[];
  buy?: RawProvider[];
}

function mapProviders(list: RawProvider[] | undefined): Provider[] {
  return (list ?? []).map((p) => ({
    id: p.provider_id,
    name: p.provider_name,
    logoPath: p.logo_path,
  }));
}

/** One call returns all regions; pick the caller's region client-side. */
export async function getWatchProviders(
  title: { mediaType: MediaType; id: number },
  region: string,
): Promise<RegionProviders | null> {
  const d = await tmdbFetch<{
    results: Record<string, RawRegionProviders>;
  }>(`/${title.mediaType}/${title.id}/watch/providers`);
  const r = d.results[region];
  if (!r) return null;
  return {
    link: r.link ?? null,
    flatrate: mapProviders(r.flatrate),
    rent: mapProviders(r.rent),
    buy: mapProviders(r.buy),
  };
}

/**
 * Streaming services available in a region, for the preferences picker.
 * The movie provider list is a superset that covers TV fine; top entries
 * by TMDB's per-region display priority.
 */
export async function getRegionProviderOptions(
  region: string,
  limit = 16,
): Promise<WatchProviderOption[]> {
  const d = await tmdbFetch<{
    results: (RawProvider & {
      display_priorities?: Record<string, number>;
      display_priority?: number;
    })[];
  }>("/watch/providers/movie", { language: "en-US", watch_region: region });
  return d.results
    .map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logoPath: p.logo_path,
      priority: p.display_priorities?.[region] ?? p.display_priority ?? 999,
    }))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, limit)
    .map(({ id, name, logoPath }) => ({ id, name, logoPath }));
}

/* ---------- images ---------- */

export function posterUrl(
  path: string | null,
  size: "w342" | "w500" = "w342",
): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

export function providerLogoUrl(path: string | null): string | null {
  return path ? `${IMAGE_BASE}/w45${path}` : null;
}
