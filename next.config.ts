import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages: `next build` writes plain HTML/CSS/JS
  // to ./out. No server features (API routes, ISR) — this app uses none.
  output: "export",
  // GitHub Pages has no rewrites: /about only resolves as about/index.html.
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // NOTE: custom HTTP headers can't be set with a static export (and GitHub
  // Pages can't send them anyway). If this ever moves to a Node/Vercel host,
  // restore the security headers via an async headers() block here.
};

export default nextConfig;
