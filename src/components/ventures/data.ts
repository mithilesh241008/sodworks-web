/**
 * The venture collection — the single source for the /ventures exhibition,
 * the project pages and the homepage preview.
 *
 * Only supplied facts live here. Nothing below invents metrics, results,
 * technologies or URLs: fields that aren't known yet are simply absent, and
 * the pages render a section only when its content exists.
 */

export type VentureImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

/** Visual personality of each venture's stage. */
export type VentureTone = "luxe" | "editorial" | "power" | "blueprint" | "weave";

export type Venture = {
  slug: string;
  index: string;
  name: string;
  /** Name split for display lines (the pixel face is wide). */
  nameLines: string[];
  category: string;
  status: "live" | "in-development";
  description: string;
  tone: VentureTone;
  /** Supplied photography; absent for ventures still in development. */
  images?: [VentureImage, VentureImage];
  /** Further photographs, shown only in the project page's gallery. */
  gallery?: VentureImage[];
  /** The venture's own logo, shown in place of photography while it is in development. */
  logo?: VentureImage;
  /** Official website, only where verified. */
  website?: string;
  /** Where the venture is based — only where its own materials state it. */
  location?: string;
  /** What the project sets out to do — taken directly from the brief. */
  objectives: string[];
  /** What SODWORKS built / is building — restated from the brief only. */
  scope: string;
  /**
   * The search snippet (≤ 160 characters): what the venture is and what
   * SODWORKS contributed, restating the facts above — nothing new.
   */
  summary: string;
};

export const ventures: Venture[] = [
  {
    slug: "akram-perfumes",
    index: "01",
    name: "Akram Perfumes",
    website: "https://www.akramperfumes.in",
    nameLines: ["Akram", "Perfumes"],
    category: "Luxury fragrance / E-commerce",
    status: "live",
    tone: "luxe",
    description:
      "A premium digital commerce experience built for a fragrance brand, combining elegant product presentation, fragrance discovery and a seamless shopping experience.",
    images: [
      {
        src: "/images/ventures/akram-perfumes-counter.jpg",
        width: 1200,
        height: 1600,
        alt: "The Akram Perfumes store counter, lined with fragrance bottles, with a laptop open on the counter.",
      },
      {
        src: "/images/ventures/akram-perfumes-team.jpg",
        width: 1600,
        height: 900,
        alt: "Three people working on laptops outdoors beside a swimming pool.",
      },
    ],
    objectives: [
      "Present the fragrance range with elegance.",
      "Help customers discover fragrances.",
      "Make shopping seamless, from browsing to checkout.",
    ],
    scope: "A premium digital commerce experience for the brand.",
    summary:
      "SODWORKS built Akram Perfumes a premium digital commerce experience — elegant product presentation, fragrance discovery and seamless shopping.",
  },
  {
    slug: "dope-culture",
    index: "02",
    name: "Dope Culture",
    nameLines: ["Dope", "Culture"],
    category: "Fashion / E-commerce / Retail technology",
    status: "live",
    tone: "editorial",
    description:
      "A modern streetwear commerce and retail platform bringing online shopping and in-store operations together.",
    images: [
      {
        src: "/images/ventures/dope-culture-store.jpg",
        width: 1600,
        height: 900,
        alt: "Inside the Dope Culture boutique: racks of streetwear under track lighting.",
      },
      {
        src: "/images/ventures/dope-culture-team.jpg",
        width: 1600,
        height: 900,
        alt: "Four people standing in front of the Dope Culture sign.",
      },
    ],
    website: "https://www.dopeculture.in",
    location: "Madurai, Tamil Nadu",
    objectives: [
      "Sell the streetwear range online.",
      "Bring online shopping and in-store operations together.",
    ],
    scope: "A modern streetwear commerce and retail platform.",
    summary:
      "SODWORKS built Dope Culture's streetwear commerce and retail platform in Madurai, bringing online shopping and in-store operations together.",
  },
  {
    slug: "beast-muscle",
    index: "03",
    name: "Beast Muscle",
    nameLines: ["Beast", "Muscle"],
    category: "Sports nutrition / E-commerce",
    status: "live",
    tone: "power",
    description: "A digital commerce experience developed for a sports nutrition and supplement brand.",
    images: [
      {
        src: "/images/ventures/beast-muscle-store.jpg",
        width: 1600,
        height: 900,
        alt: "The Beast Muscle store: shelves stacked with supplement tubs.",
      },
      {
        src: "/images/ventures/beast-muscle-onsite.jpg",
        width: 900,
        height: 1600,
        alt: "Working on a laptop inside the Beast Muscle store, shelves of supplements behind.",
      },
    ],
    gallery: [
      {
        src: "/images/ventures/beast-muscle-team.jpg",
        width: 720,
        height: 1280,
        alt: "Five people standing together inside the Beast Muscle store, in front of shelves and tubs of supplements.",
      },
    ],
    website: "https://thebeastmuscle.in",
    location: "Chennai, Tamil Nadu",
    objectives: ["Bring the supplement range online as a digital commerce experience."],
    scope: "A digital commerce experience for the brand.",
    summary:
      "SODWORKS developed the digital commerce experience for Beast Muscle, a sports nutrition and supplement brand based in Chennai.",
  },
  {
    slug: "sr-constructions",
    index: "04",
    name: "SR Constructions",
    nameLines: ["SR", "Constructions"],
    category: "Architecture / Civil engineering",
    status: "in-development",
    location: "Madurai, Tamil Nadu",
    tone: "blueprint",
    logo: {
      src: "/images/ventures/sr-constructions-logo.jpg",
      width: 1024,
      height: 1024,
      alt: "The SR Constructions logo: interlocking navy and gold S and R letterforms rising like a building over architectural drawings, marked “Est. 1991”.",
    },
    description:
      "Expert civil engineering consultancy by Ar. Aravind K — delivering precision design, structural integrity, and construction excellence for every project in Madurai and beyond.",
    objectives: [
      "Present the consultancy's civil engineering practice.",
      "Communicate its focus on precision design, structural integrity and construction excellence.",
    ],
    scope: "A website for the consultancy — currently in development.",
    summary:
      "SODWORKS is building the website for SR Constructions, the civil engineering consultancy of Ar. Aravind K in Madurai. In development.",
  },
  {
    slug: "sri-sowdambika",
    index: "05",
    name: "Sri Sowdambika Cutpiece Centre",
    nameLines: ["Sri", "Sowdambika"],
    category: "Textiles / Retail",
    status: "in-development",
    tone: "weave",
    description:
      "With 27 years of trust and tradition, Sri Sowdambika Cutpiece Centre has been a familiar name in textiles at Vilakuthoon, Madurai. Built on quality, reliability and lasting customer relationships, it continues to serve generations of customers with dedication and care.",
    objectives: [
      "Carry 27 years of trust and tradition online.",
      "Serve the store's long-standing customers with the same care.",
    ],
    scope: "A digital presence for the store — currently in development.",
    summary:
      "SODWORKS is building a digital presence for Sri Sowdambika Cutpiece Centre, a textile store of 27 years in Vilakuthoon, Madurai. In development.",
  },
];

export const getVenture = (slug: string) => ventures.find((v) => v.slug === slug);
