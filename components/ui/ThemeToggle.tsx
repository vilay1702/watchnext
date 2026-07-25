"use client";

import { THEME_STORAGE_KEY } from "@/lib/brand";
import { copy } from "@/lib/copy";

/**
 * Header action: switches light/dark by toggling the `dark` class on <html>.
 * The class is applied pre-paint by the no-flash script in app/layout.tsx.
 * Both icons are always in the DOM and CSS shows the right one, so the
 * server markup matches the client and there's no hydration mismatch.
 */
export function ThemeToggle() {
  const toggle = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      // storage unavailable — the theme still flips for this visit
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={copy.themeToggle}
      title={copy.themeToggle}
      className="rounded-md p-2 text-text-muted transition hover:bg-border/40 hover:text-text"
    >
      {/* Moon — shown in light mode (tap to go dark) */}
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 dark:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      {/* Sun — shown in dark mode (tap to go light) */}
      <svg
        viewBox="0 0 24 24"
        className="hidden h-5 w-5 dark:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </button>
  );
}
