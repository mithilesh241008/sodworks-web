/** Copy and facts for /studio. The story is reproduced exactly as supplied. */
import { founders as people } from "@/lib/site";

/** Top of each founder's head in the photograph, left to right (measured). */
const heads = [
  { x: 0.222, y: 0.085 },
  { x: 0.5, y: 0.075 },
  { x: 0.79, y: 0.095 },
];

export const studio = {
  identifier: "04 / The studio",
  title: "The Studio",
  photo: {
    src: "/images/studio/founders-crew.jpg",
    width: 1280,
    height: 720,
    alt: "The three founders of SODWORKS — Sarvesh Kumar, Raghav and Mithileshwaran, left to right — seated on chairs with laptops against a black background.",
  },
  /** The founders around their table — the story's visual anchor. */
  illustration: {
    src: "/images/studio/founders-table.jpg",
    width: 1250,
    height: 777,
    alt: "Illustration of the three SODWORKS founders around a glass table with laptops: Sarvesh Kumar in yellow on the left, Raghav in blue in the centre and Mithileshwaran in a white shirt and red cap on the right.",
  },
  /** The three developers at their shared workstation — the story's visual on /studio only. */
  workstation: {
    src: "/images/studio/studio-workstation.jpg",
    width: 1536,
    height: 864,
    alt: "Pixel-art illustration of three developers seen from behind at a shared workstation, working on laptops and a wide monitor in a dark studio.",
  },
  story: {
    /** Lines of the opening statement (rendered as display type). */
    lead: ["Three friends.", "One shared ambition."],
    /** Paragraphs, verbatim. */
    paragraphs: [
      "On July 1, 2026, we decided to build something of our own. What began as curiosity slowly turned into a shared passion for engineering, creativity and technology.",
      "We’re still learning, still experimenting, and still building. SODWORKS is where that journey takes shape.",
    ],
    /** Phrase given a warm accent (must appear verbatim in the paragraphs). */
    accent: "July 1, 2026",
  },
  /**
   * The founders, LEFT to RIGHT as seated in the photograph. Positions are
   * the top of each head in normalised photo coordinates (measured).
   */
  founders: people.map((f, i) => ({ ...f, head: heads[i] })),
};
