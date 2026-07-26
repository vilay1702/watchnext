import type { MediaType } from "./types";

/** TMDB genre id → display name (movie and TV use different ID sets). */
const MOVIE_GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const TV_GENRES: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

export function genreNames(
  mediaType: MediaType,
  ids: number[],
  limit = 3,
): string[] {
  const map = mediaType === "movie" ? MOVIE_GENRES : TV_GENRES;
  return ids
    .map((id) => map[id])
    .filter(Boolean)
    .slice(0, limit);
}

/** The genre that best distinguishes this title from a reference set —
    used to label backups with why they're a different direction. */
export function distinctiveGenre(
  mediaType: MediaType,
  ids: number[],
  referenceIds: number[],
): string | null {
  const map = mediaType === "movie" ? MOVIE_GENRES : TV_GENRES;
  const ref = new Set(referenceIds);
  const fresh = ids.find((id) => !ref.has(id) && map[id]);
  return map[fresh ?? ids.find((id) => map[id]) ?? -1] ?? null;
}
