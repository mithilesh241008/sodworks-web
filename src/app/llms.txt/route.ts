import { absolute, brand, faq, founders, pages, services, siteUrl } from "@/lib/site";
import { ventures } from "@/components/ventures/data";

/**
 * /llms.txt — a plain-text summary of SODWORKS for language-model tools,
 * following the llms.txt proposal (https://llmstxt.org). It is a courtesy
 * index, not a standard search engines rely on: it does not guarantee
 * indexing or citation. Generated from the same identity data as the site.
 */
export function GET() {
  const live = ventures.filter((v) => v.status === "live");
  const building = ventures.filter((v) => v.status !== "live");
  const venture = (v: (typeof ventures)[number]) =>
    `- [${v.name}](${absolute(`/ventures/${v.slug}`)}): ${v.description}${v.location ? ` (${v.location})` : ""}${
      v.website ? ` Website: ${v.website}` : ""
    }`;

  const body = `# ${brand.name}

> ${brand.description}

${brand.name} is an ${brand.category.toLowerCase()} founded on ${brand.foundingDateDisplay} by ${founders
    .map((f) => f.name)
    .join(", ")
    .replace(/, ([^,]*)$/, " and $1")}. It is not a digital marketing, SEO or advertising agency.

- Website: ${siteUrl}
- Based in: ${brand.basedIn}
- Geographic focus: ${brand.areaServed.join(", ")}

## What SODWORKS builds

${services.map((s) => `- ${s.name}: ${s.description}`).join("\n")}

## Founders

${founders.map((f) => `- [${f.name}](${absolute(`/studio#${f.id}`)}): ${f.role}`).join("\n")}

## Ventures (live)

${live.map(venture).join("\n")}

## Ventures (in development)

${building.map(venture).join("\n")}

## Contact

- Email: ${brand.email}
- Phone: ${brand.officialPhone.display} (also ${brand.phones
    .filter((p) => p.tel !== brand.officialPhone.tel)
    .map((p) => p.display)
    .join(", ")})
- Contact page: ${absolute(pages.contact.path)}

## Common questions

${faq.map((q) => `- ${q.question} ${q.answer}`).join("\n")}

## Pages

- [Home](${absolute("/")}): ${pages.home.description}
- [What we build](${absolute(pages.build.path)}): ${pages.build.description}
- [Our ventures](${absolute(pages.ventures.path)}): ${pages.ventures.description}
- [The studio](${absolute(pages.studio.path)}): ${pages.studio.description}
- [Contact](${absolute(pages.contact.path)}): ${pages.contact.description}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
