import type { Metadata } from "next";
import { TOOL_NAME } from "@/lib/brand";
import { StaticPage, StaticSection } from "@/components/ui/StaticPage";

export const metadata: Metadata = {
  title: `Privacy · ${TOOL_NAME}`,
  description: `How ${TOOL_NAME} handles your data: everything stays in your browser.`,
  alternates: { canonical: "/privacy/" },
  openGraph: {
    title: `Privacy · ${TOOL_NAME}`,
    description: `How ${TOOL_NAME} handles your data: everything stays in your browser.`,
    url: "/privacy/",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <StaticPage h1="Privacy">
      <StaticSection heading="The short version">
        <p>
          Everything runs in your browser. Your answers, your “Seen it” list,
          and your settings are never uploaded — we couldn’t read them if we
          wanted to.
        </p>
      </StaticSection>

      <StaticSection heading="What's stored, and where">
        <p>
          {TOOL_NAME} saves a few things in your browser’s local storage:
          titles you’ve marked “Seen it” or “Not interested” (so they’re never
          suggested again), your recent picks (so you can find that movie
          from last week), your last answers (for the one-tap repeat), your
          streaming region, your chosen streaming services and language
          preference, and your light-or-dark theme choice.
        </p>
        <p>
          That data lives only on your device. It’s not sent to a server, and
          it isn’t shared between your devices or browsers.
        </p>
      </StaticSection>

      <StaticSection heading="What leaves your browser">
        <p>
          To fetch titles, posters, and streaming availability, your browser
          talks directly to TMDB’s public API — the same way it fetches images
          on any website. Those requests carry the filters you chose (genres,
          runtime, region), never your identity, and TMDB’s handling of them
          is covered by TMDB’s own privacy policy.
        </p>
      </StaticSection>

      <StaticSection heading="No accounts, no trackers">
        <p>
          There’s nothing to sign up for, and we don’t use analytics trackers,
          advertising pixels, or cookies.
        </p>
      </StaticSection>

      <StaticSection heading="Clearing your data">
        <p>
          Use “Clear history” to empty your recent picks, or clear this
          site’s data in your browser settings to remove everything at once.
          Gone means gone — there’s no copy anywhere else.
        </p>
      </StaticSection>
    </StaticPage>
  );
}
