# 🎬 WatchNext

“What should we watch tonight?” — answered in three taps.

Pick your **vibe** (laugh, thrill, feel, think, escape, scare), your **time**
(a quick movie, a proper movie, or a series to binge), and **who’s watching**
(solo, date night, friends over, the whole family). WatchNext hands you a pick worth
watching — poster, rating, synopsis, and where it’s streaming in your region.

No signup. No app to install. No endless scrolling.

## How it picks

No AI and no engagement algorithm — just honest, deterministic filters over
[TMDB](https://www.themoviedb.org/)’s community-rated catalog:

- Your mood maps to the right genres (and rules out the wrong ones).
- Your time maps to runtime bounds, or switches to series.
- Family night filters to PG-13 certifications and drops TV-MA shows.
- Everything below a quality floor of ratings and vote counts is discarded;
  the rest is ranked with an IMDb-style weighted score, and your pick is
  drawn from the top shelf — so “Show me another” stays good.

Titles you mark **Seen it** or **Not interested** are remembered in your
browser and never suggested again. If the filters run dry, they relax one
honest step at a time — and if you’ve truly been through the whole
shortlist, WatchNext says so instead of repeating itself silently.

## Privacy

Everything runs in your browser. Your answers, your seen-list, and your
recent picks are stored locally and never uploaded. Your browser talks directly to TMDB’s public API
to fetch titles — those requests carry your chosen filters, never your
identity. No accounts, no trackers, no cookies.

This product uses the TMDB API but is not endorsed or certified by TMDB.
Streaming availability data by JustWatch (via TMDB).

---

## Development

```bash
npm ci
cp .env.example .env.local   # add your TMDB v4 read access token
npm run dev
```

Get a free token at themoviedb.org → Settings → API (the long “API Read
Access Token”). The token is baked into the client bundle at build time
(`NEXT_PUBLIC_TMDB_TOKEN`) — it is a read-only public-data token; this site
has no server. Deploys read it from the `NEXT_PUBLIC_TMDB_TOKEN` GitHub
Actions secret.

Static export (`next build` → `out/`), deployed to GitHub Pages at
[watchnext.vilaybende.com](https://watchnext.vilaybende.com).

Made with ♥ by Vilay
