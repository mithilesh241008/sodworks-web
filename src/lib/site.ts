/**
 * SODWORKS — the single source of truth for the studio's public identity.
 *
 * Page metadata, structured data (JSON-LD), the sitemap, robots.txt and
 * llms.txt all read from here, so the brand name, description, founders,
 * founding date and contact details can never drift apart between them.
 * Only verified facts belong in this file.
 */

/* ------------------------------------------------------------- domain */

const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const vercelEnv = process.env.VERCEL_ENV; // "production" | "preview" | "development" on Vercel

const isLocal = (url: string) => /\/\/(localhost|127\.0\.0\.1|\[::1\]|[^/]+\.local)(:|\/|$)/i.test(url);

/** The studio's canonical public origin. */
export const productionUrl = "https://www.sodworks.in";

/**
 * The public origin of the site: NEXT_PUBLIC_SITE_URL when set (no trailing
 * slash), otherwise the canonical domain for production builds and
 * localhost in development. A preview deployment therefore still points its
 * canonical URLs and social images at www.sodworks.in, never at itself.
 */
export const siteUrl = (
  explicitUrl || (process.env.NODE_ENV === "production" ? productionUrl : "http://localhost:3000")
).replace(/\/+$/, "");

/**
 * Whether this build may be indexed: a production build on Vercel's
 * production environment, or one given NEXT_PUBLIC_SITE_URL explicitly on
 * any other host. Local builds, builds without either and Vercel preview
 * deployments are served with noindex, a robots.txt that
 * disallows everything, an empty sitemap and no canonical URLs — so a
 * development or staging URL can never be indexed or exposed as canonical.
 */
export const indexable =
  process.env.NODE_ENV === "production" &&
  !isLocal(siteUrl) &&
  (vercelEnv ? vercelEnv === "production" : Boolean(explicitUrl));

/** Absolute URL for a site path. */
export const absolute = (path: string) => `${siteUrl}${path === "/" ? "" : path}`;

/* ------------------------------------------------------------ identity */

export const brand = {
  name: "SODWORKS",
  category: "Independent Technology & Product-Building Studio",
  /** One sentence used everywhere the studio is described. */
  description:
    "SODWORKS is an independent technology and product-building studio based in India, developing custom digital experiences, ecommerce systems, software products and AI-powered applications.",
  /** The short line under the footer wordmark. */
  tagline: "An independent technology studio building digital experiences and business systems.",
  foundingDate: "2026-07-01",
  foundingDateDisplay: "July 1, 2026",
  email: "sodworksagency@gmail.com",
  /** The studio's numbers, in this order everywhere they appear. */
  phones: [
    { display: "+91 82480 63265", tel: "+918248063265" },
    { display: "+91 93619 35572", tel: "+919361935572" },
    { display: "+91 93456 49253", tel: "+919345649253" },
  ],
  /** The official public number — the one given in structured data and directory listings. */
  officialPhone: { display: "+91 82480 63265", tel: "+918248063265" },
  logo: "/brand/sodworks-logo.png",
  /** The country the studio is based in. No street address is claimed. */
  basedIn: "India",
  /**
   * The studio's geographic focus. Its ventures are based in Chennai and
   * Madurai (Tamil Nadu). No office or branch address is claimed.
   */
  areaServed: ["Chennai", "Madurai", "Tamil Nadu", "India"],
} as const;

export type Founder = { id: string; name: string; slot: string; role: string };

/** The co-founders, left to right as they appear in the studio photograph. */
export const founders: Founder[] = [
  { id: "sarvesh-kumar", name: "Sarvesh Kumar", slot: "P1", role: "Co-Founder of SODWORKS" },
  { id: "raghav", name: "Raghav", slot: "P2", role: "Co-Founder of SODWORKS" },
  { id: "mithileshwaran", name: "Mithileshwaran", slot: "P3", role: "Co-Founder of SODWORKS" },
];

export type Service = { id: string; name: string; description: string };

/** What SODWORKS builds. Descriptions restate the studio's own work only. */
export const services: Service[] = [
  {
    id: "digital-experience-development",
    name: "Digital Experience Development",
    description: "Immersive web experiences, designed and engineered end to end as a single piece of work.",
  },
  {
    id: "website-development",
    name: "Website Development",
    description:
      "Fast, accessible, search-ready websites and custom web applications, built on modern frameworks such as Next.js and React.",
  },
  {
    id: "ecommerce-development",
    name: "E-commerce Development",
    description: "Online stores and commerce platforms — from product presentation and discovery to checkout.",
  },
  {
    id: "custom-software-development",
    name: "Custom Software Development",
    description: "Software shaped around the way a business actually works, rather than the other way round.",
  },
  {
    id: "business-systems",
    name: "Business Systems",
    description: "POS, inventory and business management software that connects day-to-day operations.",
  },
  {
    id: "ai-integration",
    name: "AI-Powered Applications",
    description: "AI-powered applications, assistants and features, built into products and everyday operations.",
  },
  {
    id: "workflow-automation",
    name: "Workflow Automation",
    description: "Automations that remove repetitive work and connect the tools a business already uses.",
  },
  {
    id: "digital-product-development",
    name: "Digital Product Development",
    description: "Taking a product idea from concept to a working, shippable product.",
  },
];

export type FaqItem = { question: string; answer: string };

/**
 * Direct answers to the questions prospective clients ask most — shown on
 * /what-we-build and given as FAQPage structured data. Facts only.
 */
export const faq: FaqItem[] = [
  {
    question: "What does SODWORKS build?",
    answer:
      "Websites and custom web applications, e-commerce platforms, custom software, business systems such as POS and inventory software, AI-powered applications and workflow automation — designed and engineered in-house.",
  },
  {
    question: "Is SODWORKS a digital marketing agency?",
    answer:
      "No. SODWORKS is a technology and product-building studio. It engineers websites, software and digital products; it does not offer advertising, SEO services or social media management.",
  },
  {
    question: "Where does SODWORKS work?",
    answer:
      "SODWORKS is based in India and works with businesses in Chennai, Madurai and across Tamil Nadu. Its ventures include Beast Muscle in Chennai and Dope Culture in Madurai.",
  },
  {
    question: "What has SODWORKS built?",
    answer:
      "Live e-commerce experiences for Akram Perfumes, Dope Culture and Beast Muscle, with websites for SR Constructions and Sri Sowdambika Cutpiece Centre in development.",
  },
  {
    question: "How do I start a project with SODWORKS?",
    answer:
      "Send a short description of what you want to build through the contact page, by email to sodworksagency@gmail.com or by phone on +91 82480 63265.",
  },
];

/* ----------------------------------------------------------- the pages */

export type PageSeo = { path: string; title: string; description: string; image: OgImage };
export type OgImage = { url: string; width: number; height: number; alt: string };

const og = (file: string, alt: string): OgImage => ({ url: `/og/${file}`, width: 1200, height: 630, alt });

export const pages = {
  home: {
    path: "/",
    title: "SODWORKS | Web Development & Technology Studio in Chennai, India",
    description:
      "SODWORKS is a technology and product-building studio in India, engineering custom websites, ecommerce platforms, software products and AI-powered solutions for ambitious businesses.",
    image: og("home.jpg", "SODWORKS — the studio's wordmark over a candlelit painting of scholars gathered around a laptop."),
  },
  build: {
    path: "/what-we-build",
    title: "Web, E-commerce, Software & AI Development | SODWORKS",
    description:
      "Websites, web apps, e-commerce platforms, custom software and AI-powered applications, engineered by SODWORKS for businesses in Chennai, Madurai and India.",
    image: og("what-we-build.jpg", "A hand holding a luminous object, rebuilt from particles of dust — What we build at SODWORKS."),
  },
  ventures: {
    path: "/ventures",
    title: "Products & Projects Built by SODWORKS",
    description:
      "Ecommerce platforms SODWORKS built for Akram Perfumes, Dope Culture and Beast Muscle — brands in Madurai and Chennai — and the projects in development now.",
    image: og("ventures.jpg", "Akram Perfumes, Dope Culture and Beast Muscle — ventures built by SODWORKS."),
  },
  studio: {
    path: "/studio",
    title: "The People Behind SODWORKS — Our Story",
    description:
      "Founded on July 1, 2026 by Sarvesh Kumar, Raghav and Mithileshwaran, SODWORKS is an independent technology studio in India. Meet the founders and our story.",
    image: og("studio.jpg", "The three SODWORKS co-founders — Sarvesh Kumar, Raghav and Mithileshwaran — around their table."),
  },
  contact: {
    path: "/contact",
    title: "Build Something With SODWORKS — Get in Touch",
    description:
      "Planning a website, ecommerce platform, custom software or AI-powered product? Tell SODWORKS about your project by email or phone — Chennai, Madurai and India.",
    image: og("contact.jpg", "A chrome robotic hand and a human hand reaching for each other — get in touch with SODWORKS."),
  },
} satisfies Record<string, PageSeo>;

/** The routes in the sitemap (venture pages are added from the venture data). */
export const routes = [pages.home, pages.build, pages.ventures, pages.studio, pages.contact];

/** Per-page metadata: title, description, canonical, robots and social cards. */
export function pageMetadata({ path, title, description, image }: PageSeo) {
  return {
    title,
    description,
    alternates: indexable ? { canonical: path } : undefined,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: path,
      siteName: brand.name,
      type: "website" as const,
      locale: "en_IN",
      images: [image],
    },
    twitter: { card: "summary_large_image" as const, title, description, images: [{ url: image.url, alt: image.alt }] },
  };
}

/* ------------------------------------------------------------ crawlers */

/**
 * Crawler policy for robots.txt (tokens as documented by each operator).
 *
 * Search and AI-search crawlers are explicitly welcome: they are how the
 * studio is found and cited. Training crawlers are a business decision —
 * set `allowAiTraining` to false to opt the site's content out of model
 * training while staying visible in search and AI answers.
 */
export const crawlers = {
  allowAiTraining: true,
  search: ["Googlebot", "Bingbot", "Applebot", "DuckDuckBot"],
  aiSearch: ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"],
  userTriggered: ["ChatGPT-User", "Claude-User", "Perplexity-User"],
  aiTraining: ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot"],
};
