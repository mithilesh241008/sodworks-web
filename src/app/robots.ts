import type { MetadataRoute } from "next";
import { absolute, crawlers, indexable } from "@/lib/site";

/**
 * robots.txt. A non-production build (local, preview, or no public domain
 * configured) disallows everything. Production allows the whole site — it
 * has no private areas, and blocking /_next/ would stop search engines from
 * rendering pages — with explicit groups for search, AI search and
 * user-triggered fetchers, and a deliberate choice for AI training crawlers.
 */
export default function robots(): MetadataRoute.Robots {
  if (!indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: [
      { userAgent: [...crawlers.search, ...crawlers.aiSearch, ...crawlers.userTriggered], allow: "/" },
      crawlers.allowAiTraining
        ? { userAgent: crawlers.aiTraining, allow: "/" }
        : { userAgent: crawlers.aiTraining, disallow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: absolute("/sitemap.xml"),
  };
}
