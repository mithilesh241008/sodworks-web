/**
 * Schema.org structured data for SODWORKS, as JSON-LD @graph nodes.
 *
 * The Organization, WebSite and the three founders (Person) are emitted once
 * per page from the root layout and given stable @ids; every page-specific
 * node references them by @id instead of repeating them. Only verified facts
 * are used — no ratings, reviews, addresses or credentials.
 */
import { absolute, brand, founders, services, siteUrl, type FaqItem, type PageSeo } from "./site";
import type { Venture } from "@/components/ventures/data";

export const ids = {
  organization: `${siteUrl}/#organization`,
  website: `${siteUrl}/#website`,
  logo: `${siteUrl}/#logo`,
  person: (id: string) => `${siteUrl}/studio#${id}`,
  page: (path: string) => `${absolute(path)}#webpage`,
};

const graph = (nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });

/** Organization + WebSite + founders — the studio as an entity. */
export function siteGraph() {
  return graph([
    {
      "@type": "Organization",
      "@id": ids.organization,
      name: brand.name,
      alternateName: "SODWORKS Studio",
      url: absolute("/"),
      logo: { "@type": "ImageObject", "@id": ids.logo, url: absolute(brand.logo), width: 512, height: 512, caption: brand.name },
      image: { "@id": ids.logo },
      description: brand.description,
      email: brand.email,
      telephone: brand.officialPhone.tel,
      foundingDate: brand.foundingDate,
      founder: founders.map((f) => ({ "@id": ids.person(f.id) })),
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "project inquiries",
        email: brand.email,
        telephone: brand.officialPhone.tel,
        url: absolute("/contact"),
        areaServed: "IN",
        availableLanguage: ["en"],
      },
      areaServed: brand.areaServed.map((name) => ({ "@type": "Place", name })),
      slogan: brand.tagline,
      knowsAbout: services.map((s) => s.name),
    },
    {
      "@type": "WebSite",
      "@id": ids.website,
      name: brand.name,
      url: absolute("/"),
      description: brand.description,
      inLanguage: "en-IN",
      publisher: { "@id": ids.organization },
    },
    ...founders.map((f) => ({
      "@type": "Person",
      "@id": ids.person(f.id),
      name: f.name,
      jobTitle: "Co-Founder",
      url: absolute(`/studio#${f.id}`),
      worksFor: { "@id": ids.organization },
      memberOf: { "@id": ids.organization },
    })),
  ]);
}

/** A WebPage node of the right subtype, tied to the site and the studio. */
function webPage(type: string, p: PageSeo, extra: object = {}) {
  return {
    "@type": type,
    "@id": ids.page(p.path),
    url: absolute(p.path),
    name: p.title,
    description: p.description,
    inLanguage: "en-IN",
    isPartOf: { "@id": ids.website },
    about: { "@id": ids.organization },
    primaryImageOfPage: { "@type": "ImageObject", url: absolute(p.image.url), width: p.image.width, height: p.image.height },
    ...extra,
  };
}

export const homeGraph = (p: PageSeo) => graph([webPage("WebPage", p)]);

/** The services, each provided by the studio, and the page's visible FAQ. */
export const buildGraph = (p: PageSeo, faq: FaqItem[]) =>
  graph([
    webPage("WebPage", p, { mainEntity: { "@id": `${absolute(p.path)}#services` } }),
    {
      "@type": "FAQPage",
      "@id": `${absolute(p.path)}#faq`,
      isPartOf: { "@id": ids.page(p.path) },
      mainEntity: faq.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.answer },
      })),
    },
    {
      "@type": "ItemList",
      "@id": `${absolute(p.path)}#services`,
      name: "What SODWORKS builds",
      itemListElement: services.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          "@id": `${absolute(p.path)}#${s.id}`,
          name: s.name,
          serviceType: s.name,
          description: s.description,
          provider: { "@id": ids.organization },
          areaServed: brand.areaServed.map((name) => ({ "@type": "Place", name })),
          url: absolute(`${p.path}#${s.id}`),
        },
      })),
    },
  ]);

export const studioGraph = (p: PageSeo) =>
  graph([
    webPage("AboutPage", p, {
      mainEntity: { "@id": ids.organization },
      mentions: founders.map((f) => ({ "@id": ids.person(f.id) })),
    }),
  ]);

export const contactGraph = (p: PageSeo) => graph([webPage("ContactPage", p, { mainEntity: { "@id": ids.organization } })]);

/** A venture as a CreativeWork made by the studio. */
function creativeWork(v: Venture) {
  return {
    "@type": "CreativeWork",
    "@id": `${absolute(`/ventures/${v.slug}`)}#work`,
    name: v.name,
    description: v.description,
    abstract: v.scope,
    genre: v.category,
    creativeWorkStatus: v.status === "live" ? "Live" : "In development",
    creator: { "@id": ids.organization },
    mainEntityOfPage: { "@id": ids.page(`/ventures/${v.slug}`) },
    ...(v.website ? { url: v.website, sameAs: v.website } : { url: absolute(`/ventures/${v.slug}`) }),
    ...(v.images ? { image: [...v.images, ...(v.gallery ?? [])].map((img) => absolute(img.src)) } : {}),
    ...(v.logo ? { image: absolute(v.logo.src) } : {}),
    ...(v.location ? { spatialCoverage: { "@type": "Place", name: v.location } } : {}),
  };
}

export const venturesGraph = (p: PageSeo, list: Venture[]) =>
  graph([
    webPage("CollectionPage", p, { mainEntity: { "@id": `${absolute(p.path)}#collection` } }),
    {
      "@type": "ItemList",
      "@id": `${absolute(p.path)}#collection`,
      name: "The SODWORKS venture collection",
      itemListElement: list.map((v, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/ventures/${v.slug}`), name: v.name })),
    },
  ]);

export const ventureGraph = (p: PageSeo, v: Venture) =>
  graph([
    webPage("WebPage", p, { mainEntity: { "@id": `${absolute(p.path)}#work` } }),
    creativeWork(v),
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absolute("/") },
        { "@type": "ListItem", position: 2, name: "Our Ventures", item: absolute("/ventures") },
        { "@type": "ListItem", position: 3, name: v.name, item: absolute(p.path) },
      ],
    },
  ]);
