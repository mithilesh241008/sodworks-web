/** Copy for PAGE 02 — WHAT WE BUILD. Two chapters, nothing more. */

export const page = {
  label: "What we build",
  image: {
    src: "/images/wwb-born-from-dust.webp",
    width: 736,
    height: 496,
    alt: "A hand holding a luminous object, drawn in black-and-white halftone dots and rebuilt from particles of dust.",
    /** The region that holds the image (source px); outside it is pure black. */
    crop: { x: 110, y: 46, w: 626, h: 450 },
    /** Centre of the luminous object within the crop (measured at 452, 253). */
    orb: { x: 0.546, y: 0.46 },
  },
};

export type ChapterId = "products" | "systems";

export type Chapter = {
  id: ChapterId;
  category: string;
  /** Heading split into lines; each line rises out of its own mask. */
  headingLines: string[];
  description: string;
  capabilities: string[];
};

export const chapters: Chapter[] = [
  {
    id: "products",
    category: "01 / DIGITAL PRODUCTS",
    headingLines: ["We turn ideas", "into digital", "experiences."],
    description:
      "From premium websites and e-commerce platforms to custom software products, we design and engineer digital experiences that bring ideas to life.",
    capabilities: ["Website Engineering", "E-commerce Platforms", "Custom Software", "Digital Product Development"],
  },
  {
    id: "systems",
    category: "02 / INTELLIGENT SYSTEMS",
    headingLines: ["We engineer", "the systems", "behind", "businesses."],
    description:
      "We build connected business infrastructure, intelligent workflows and automation systems that simplify operations and help businesses work smarter.",
    capabilities: ["POS & Inventory Systems", "Business Management Software", "AI-Powered Assistants", "Workflow Automation"],
  },
];
