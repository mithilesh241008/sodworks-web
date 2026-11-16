import type { MetadataRoute } from "next";
import { absolute, indexable, routes } from "@/lib/site";
import { ventures } from "@/components/ventures/data";

/**
 * sitemap.xml — canonical, indexable URLs only (no fragments, no 404s).
 * Empty unless this is a production build with a real public domain.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexable) return [];
  return [
    ...routes.map((p) => ({ url: absolute(p.path), images: [absolute(p.image.url)] })),
    ...ventures.map((v) => ({
      url: absolute(`/ventures/${v.slug}`),
      ...(v.images ? { images: v.images.map((img) => absolute(img.src)) } : {}),
    })),
  ];
}
