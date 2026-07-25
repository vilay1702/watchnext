/**
 * Canonical microcopy — part of the brand ("Branded Web Tools.md" §7).
 * Tone: friendly-direct. Sentence case. Verb-first button labels.
 * Reuse these strings; don't write ad-hoc empty/error states in components.
 */
export const copy = {
  // Privacy line (shown under every tool workspace)
  privacy:
    "Runs in your browser — nothing about you is uploaded. Titles come straight from TMDB.",

  // Mood picker steps
  stepVibe: "What’s the vibe tonight?",
  stepTime: "How much time have you got?",
  stepCompany: "Who’s watching?",
  back: "Go back",
  startOver: "Start over",

  moods: {
    laugh: { emoji: "😂", label: "Make me laugh" },
    thrill: { emoji: "😱", label: "Keep me on edge" },
    feel: { emoji: "🥹", label: "Make me feel" },
    think: { emoji: "🤯", label: "Make me think" },
    escape: { emoji: "🚀", label: "Take me away" },
    scare: { emoji: "👻", label: "Scare me" },
  },
  times: {
    quick: { emoji: "⏱️", label: "A quick movie", hint: "~90 minutes" },
    long: { emoji: "🍿", label: "A proper movie", hint: "2 hours or more" },
    series: { emoji: "📺", label: "Binge a series", hint: "episodes for days" },
  },
  companies: {
    solo: { emoji: "🛋️", label: "Just me" },
    date: { emoji: "💜", label: "Date night" },
    family: { emoji: "👨‍👩‍👧", label: "The whole family" },
  },

  // Results
  heroKicker: "Tonight’s pick",
  backupsHeading: "Or maybe…",
  showAnother: "Show me another",
  seenIt: "Seen it",
  notInterested: "Not interested",
  pickAgain: "Pick again",
  seasons: (n: number) => (n === 1 ? "1 season" : `${n} seasons`),
  episodes: (n: number) => `${n} episodes`,
  runtime: (mins: number) =>
    mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ""}`.trim() : `${mins}m`,
  ratingOutOfTen: (r: number) => `${r.toFixed(1)} / 10`,

  // Where to watch
  whereToWatch: "Where to watch",
  rentOrBuy: "Rent or buy",
  noProviders: (region: string) =>
    `No streaming info for ${region} — try another region:`,
  providersLoading: "Checking where it’s streaming…",
  justWatchAttribution: "Streaming availability data by JustWatch",
  tmdbAttribution:
    "This product uses the TMDB API but is not endorsed or certified by TMDB.",
  regionLabel: "Streaming region",

  // Loading
  loadingLines: [
    "Rolling the projector…",
    "Skipping the trailers…",
    "Finding you something good…",
  ],

  // Exhausted pool (terminal relaxation state)
  exhaustedTitle: "You’ve seen our whole shortlist for this mood",
  exhaustedBody:
    "Here are the best of them again — or start over and try a different vibe.",

  // Header actions
  themeToggle: "Switch between light and dark",

  // Errors
  noTokenTitle: "This build is missing its movie-database key",
  noTokenBody:
    "WatchNext needs a TMDB API token at build time. If you’re the developer: set NEXT_PUBLIC_TMDB_TOKEN and rebuild.",
  errorTitle: "The reel snapped",
  errorBody:
    "Something went wrong talking to the movie database. Your picks and history are safe in this browser.",
  tryAgain: "Try again",

  // 404
  notFoundTitle: "This page didn’t make the cut",
  notFoundBody:
    "The address may be mistyped, or the page moved. Your picker is right where you left it.",
  backToPicker: "Back to the picker",
} as const;
