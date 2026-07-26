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
  "Tap your vibe, how much time you’ve got, and who’s watching. That’s the whole form — no typing.",
  "Your taps become plain filters on TMDB’s catalog. Anything with shaky ratings gets thrown out, and what’s left is ranked. No algorithm guessing what keeps you hooked.",
  "Not feeling it? Ask for another — you won’t see the same pick twice in a night. Mark something “Seen it” and it’s gone for good.",
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
