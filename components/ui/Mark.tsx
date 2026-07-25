import { BRAND_COLORS } from "@/lib/brand";

/**
 * The family mark (logo/README.md): two rounded bars on a 45° diagonal,
 * each with a darker chisel-fold tip on its outer end. Bar A is the parent
 * indigo; Bar B is this tool's accent. Same artwork as app/icon.svg —
 * keep in sync; never touch the geometry.
 */
export function Mark({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <clipPath id="mark-bar-a">
          <rect x="30" y="50" width="114" height="38" rx="11" />
        </clipPath>
        <clipPath id="mark-bar-b">
          <rect x="56" y="112" width="114" height="38" rx="11" />
        </clipPath>
      </defs>
      <rect width="200" height="200" rx="40" fill={BRAND_COLORS.markCanvas} />
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
          clipPath="url(#mark-bar-a)"
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
          clipPath="url(#mark-bar-b)"
          fill={BRAND_COLORS.markAccentFold}
        />
      </g>
    </svg>
  );
}
