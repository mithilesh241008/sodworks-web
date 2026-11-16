import { indexable } from "@/lib/site";

/**
 * Renders a JSON-LD block. The data is static and built from src/lib/site.ts;
 * "<" is escaped so no value can ever close the script element. Builds that
 * may not be indexed (local, preview, no domain) emit no structured data, so
 * a development URL never appears as an entity identifier.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  if (!indexable) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
