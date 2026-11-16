import type { NextConfig } from "next";
import { indexable } from "./src/lib/site";

const isProd = process.env.NODE_ENV === "production";

/**
 * Content Security Policy. The site is fully static (prerendered), so a
 * per-request nonce is not available; Next's inline bootstrap scripts need
 * 'unsafe-inline'. Everything else is locked to this origin. Development
 * additionally needs 'unsafe-eval' for React's debugging, so the policy is
 * only sent in production.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' mailto:",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isProd ? [{ key: "Content-Security-Policy", value: csp }] : []),
  // Builds that aren't the real production site (local, preview, or no public
  // domain configured) must never be indexed — enforced at the header level
  // too, so it also covers images, text files and anything without HTML.
  ...(indexable ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // no Next.js badge over the site in development (errors are still shown)
  devIndicators: false,
  // never ship source maps to browsers
  productionBrowserSourceMaps: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // AVIF first, WebP fallback. The painting is a single, critical asset,
    // so we allow a higher quality step to keep brushwork and dark gradients clean.
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
  },
  turbopack: {
    rules: {
      // Tailwind only processes the global stylesheet. A "*.css" glob would
      // also catch CSS Modules and re-emit them as plain CSS, stripping
      // their scoping.
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
