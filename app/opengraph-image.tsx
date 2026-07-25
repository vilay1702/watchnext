import { ImageResponse } from "next/og";
import {
  BRAND_COLORS,
  ENDORSEMENT,
  TAGLINE,
  TOOL_H1,
  TOOL_NAME,
} from "@/lib/brand";

// Required for `output: "export"` — the image is generated at build time.
export const dynamic = "force-static";

export const alt = TOOL_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Brand OG template ("Branded Web Tools.md" §8): brand bg, tool name + icon
 * in the tool's own accent, `from [Parent]` bottom-left in muted text.
 * One template for all tools — only name/icon/accent vary.
 * (Until the parent brand is decided, the tagline holds the bottom-left slot.)
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: BRAND_COLORS.bg,
          color: BRAND_COLORS.text,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* The family mark — same artwork as app/icon.svg */}
          <svg
            width={96}
            height={96}
            viewBox="0 0 200 200"
            style={{ marginBottom: 44 }}
          >
            <defs>
              <clipPath id="og-bar-a">
                <rect x="30" y="50" width="114" height="38" rx="11" />
              </clipPath>
              <clipPath id="og-bar-b">
                <rect x="56" y="112" width="114" height="38" rx="11" />
              </clipPath>
            </defs>
            <rect
              width="200"
              height="200"
              rx="40"
              fill={BRAND_COLORS.markCanvas}
            />
            <g transform="rotate(-45 100 100)">
              <rect
                x="30"
                y="50"
                width="114"
                height="38"
                rx="11"
                fill={BRAND_COLORS.markParent}
              />
              <polygon
                points="118,50 144,50 144,88 128,88"
                clipPath="url(#og-bar-a)"
                fill={BRAND_COLORS.markParentFold}
              />
              <rect
                x="56"
                y="112"
                width="114"
                height="38"
                rx="11"
                fill={BRAND_COLORS.accent}
              />
              <polygon
                points="82,150 56,150 56,112 72,112"
                clipPath="url(#og-bar-b)"
                fill={BRAND_COLORS.markAccentFold}
              />
            </g>
          </svg>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: -2,
              color: BRAND_COLORS.accent,
            }}
          >
            {TOOL_NAME}
          </div>
          <div
            style={{
              fontSize: 34,
              marginTop: 18,
              color: BRAND_COLORS.textMuted,
            }}
          >
            {`${TOOL_H1[0].toUpperCase() + TOOL_H1.slice(1)} — free, in your browser`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 30,
            color: BRAND_COLORS.textMuted,
          }}
        >
          {ENDORSEMENT ?? TAGLINE}
        </div>
      </div>
    ),
    size,
  );
}
