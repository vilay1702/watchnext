/**
 * Brand constants — code mirror of "Branded Web Tools.md" v2 (repo root).
 * That file is the source of truth; change values there first, then here.
 *
 * v2 model: one parent brand, many products. The tool is the hero (its own
 * name, own accent, own personality); the parent is the endorser, appearing
 * only as "from [Parent]". This tool's claimed accent is Violet — the family
 * palette row for "Images & media".
 */

/**
 * TODO in the brand doc (§1). Once decided, set the name here and the
 * endorsement lockup, footer, OG image, and "More tools" heading pick it up.
 */
export const PARENT_BRAND: string | null = null;

/** Endorsement line (§1) — exactly this phrasing, never "Powered by". */
export const ENDORSEMENT = PARENT_BRAND ? `from ${PARENT_BRAND}` : null;

/** Maker credit (§1/§6) — footer of every tool, muted small text, own line. */
export const MAKER_CREDIT = "Made with ♥ by Vilay";

/** Parent tagline (§1). */
export const TAGLINE = "Free, fast tools that run in your browser.";

export const TOOL_NAME = "WatchNext";

/**
 * localStorage key for the light/dark choice ("light" | "dark", raw string —
 * absent means "follow the system"). Read pre-paint by the no-flash script
 * in app/layout.tsx and written by ThemeToggle. Adapt the prefix per tool.
 */
export const THEME_STORAGE_KEY = "wn:theme:v1";

/** Canonical origin — must match public/CNAME. Used for metadataBase, sitemap, robots, JSON-LD. */
export const SITE_URL = "https://watchnext.vilaybende.com";

/** <title> — keyword-targeted ("what to watch" / "movie picker"), brand last. */
export const PAGE_TITLE =
  "What to Watch Tonight — Free Movie & Series Picker | WatchNext";

/**
 * Meta/OG/JSON-LD description — keyword-targeted for search snippets.
 * The visible on-page tagline stays TOOL_DESCRIPTION.
 */
export const META_DESCRIPTION =
  "Can't decide what to watch? Tap your mood, your time, and who's watching — get a great movie or web series pick with where to stream it. No signup, no endless scrolling.";

/** Exactly one H1 per page — the tool's keyword-targeted description (§4). */
export const TOOL_H1 = "Movie & web series picker";
export const TOOL_DESCRIPTION =
  "Three taps — vibe, time, company — and get a pick worth watching, with where to stream it. No signup, no scrolling.";

/**
 * Raw palette values for surfaces CSS variables can't reach
 * (OG images, SVG). Everything else consumes the tokens in globals.css.
 *
 * Accent = Violet, this tool's ONE claimed accent (§3).
 */
export const BRAND_COLORS = {
  accent: "#7C3AED",
  /** Family-mark colors (logo/README.md): Bar A is always parent indigo;
      Bar B is this tool's accent; folds are the ~800 shade of each hue. */
  markCanvas: "#FAFAF9",
  markParent: "#4F46E5",
  markParentFold: "#3730A3",
  markAccentFold: "#5B21B6",
  accentHover: "#6D28D9",
  accentSoft: "#F5F3FF",
  bg: "#FAFAF9",
  surface: "#FFFFFF",
  border: "#E7E5E4",
  text: "#1C1917",
  textMuted: "#78716C",
} as const;
