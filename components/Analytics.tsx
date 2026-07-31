"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageview } from "@/lib/track";

/**
 * Counts a pageview on load and on every App Router route change,
 * deduping consecutive identical paths. Renders nothing.
 */
export function Analytics() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && pathname !== last.current) {
      last.current = pathname;
      trackPageview(pathname);
    }
  }, [pathname]);

  return null;
}
