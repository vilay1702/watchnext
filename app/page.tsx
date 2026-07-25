import {
  META_DESCRIPTION,
  SITE_URL,
  TOOL_DESCRIPTION,
  TOOL_H1,
  TOOL_NAME,
} from "@/lib/brand";
import { copy } from "@/lib/copy";
import { ToolShell } from "@/components/ui/ToolShell";
import { WatchNextApp } from "@/components/WatchNextApp";

// schema.org WebApplication — lands in the static HTML that crawlers fetch.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: TOOL_NAME,
  url: `${SITE_URL}/`,
  description: META_DESCRIPTION,
  applicationCategory: "EntertainmentApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const HOW_IT_WORKS = [
  "Tap your vibe, your time, and who’s watching — three taps, no typing, no scrolling.",
  "Your answers become honest filters on TMDB’s community-rated catalog: right genres, right runtime, right certification. Only titles above a quality floor make the shortlist.",
  "Not feeling the pick? “Show me another” never repeats itself. Mark “Seen it” and a title is never suggested again.",
];

export default function Home() {
  return (
    <ToolShell
      h1={TOOL_H1}
      description={TOOL_DESCRIPTION}
      privacyLine={copy.privacy}
      howItWorks={HOW_IT_WORKS}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <WatchNextApp />
    </ToolShell>
  );
}
