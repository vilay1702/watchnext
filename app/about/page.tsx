import type { Metadata } from "next";
import { ENDORSEMENT, MAKER_CREDIT, TAGLINE, TOOL_NAME } from "@/lib/brand";
import { StaticPage, StaticSection } from "@/components/ui/StaticPage";

export const metadata: Metadata = {
  title: `About · ${TOOL_NAME}`,
  description: `What ${TOOL_NAME} is, how it picks, and who makes it.`,
  alternates: { canonical: "/about/" },
  openGraph: {
    title: `About · ${TOOL_NAME}`,
    description: `What ${TOOL_NAME} is, how it picks, and who makes it.`,
    url: "/about/",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <StaticPage h1={`About ${TOOL_NAME}`}>
      <StaticSection heading="What it is">
        <p>
          {TOOL_NAME} answers one question — “what should we watch tonight?” —
          in three taps. Pick your vibe, how much time you have, and who’s on
          the couch, and it hands you a movie or web series worth watching,
          with where to stream it.
        </p>
        <p>
          There’s no signup and nothing to install. It runs entirely in your
          browser, and nothing about you is ever uploaded.
        </p>
      </StaticSection>

      <StaticSection heading="How it picks">
        <p>
          No AI, no engagement algorithm — just honest filters. Your three
          answers become a query against TMDB’s community-rated catalog: the
          right genres and keywords for your mood, the right runtime for your
          evening, age-appropriate certifications for family nights, and —
          if you tell it your streaming services — only titles you can
          actually watch. Everything below a
          quality floor of ratings and vote counts is thrown out, the rest is
          ranked, and your pick is drawn from the top shelf — so “Show me
          another” stays good instead of getting desperate.
        </p>
        <p>
          Titles you mark “Seen it” or “Not interested” are remembered in your
          browser and never suggested again.
        </p>
      </StaticSection>

      <StaticSection heading="Where the data comes from">
        <p>
          Titles, posters, and ratings come from{" "}
          <a
            href="https://www.themoviedb.org/"
            className="text-accent underline underline-offset-2 hover:text-accent-hover"
          >
            TMDB
          </a>
          . This product uses the TMDB API but is not endorsed or certified by
          TMDB. Streaming availability data comes from JustWatch via TMDB.
        </p>
      </StaticSection>

      <StaticSection heading="Who makes it">
        <p>
          {/* Family positioning (§1) — the endorsement line joins once the
              parent brand is decided. */}
          {TOOL_NAME}
          {ENDORSEMENT ? ` is ${ENDORSEMENT} —` : " is part of"} a family of
          free single-purpose web tools. {TAGLINE} No clutter, no accounts, no
          uploads.
        </p>
        <p>{MAKER_CREDIT}</p>
      </StaticSection>
    </StaticPage>
  );
}
