import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";

// Required for `output: "export"` — generated at build time as /sitemap.xml.
export const dynamic = "force-static";

// URLs use the trailing-slash form to match `trailingSlash: true` — the
// non-slash variant is a redirect on GitHub Pages, which wastes crawl budget.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about/`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy/`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
