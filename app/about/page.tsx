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
          There’s no AI here, and no engagement algorithm. Your three answers
          turn into plain filters on TMDB’s catalog: comedies if you want to
          laugh, something under two hours if that’s all you’ve got, kid-safe
          certificates on family night. Tell it which streaming services you
          pay for and it only suggests things you can actually press play on.
        </p>
        <p>
          Anything with shaky ratings gets thrown out. The rest is ranked,
          and your pick comes from the top shelf — so “Show me another”
          stays good instead of getting desperate.
        </p>
        <p>
          Titles you mark “Seen it” or “Not interested” stay in your
          browser’s memory and never come back.
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
