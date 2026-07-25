import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";

// Required for `output: "export"` — generated at build time as /robots.txt.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
