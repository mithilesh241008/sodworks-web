import Hero from "@/components/Hero";
import WhatWeBuild from "@/components/what-we-build/WhatWeBuild";
import VenturesPreview from "@/components/home/VenturesPreview";
import StudioPreview from "@/components/home/StudioPreview";
import JsonLd from "@/components/seo/JsonLd";
import { homeGraph } from "@/lib/schema";
import { pages } from "@/lib/site";

// Metadata for "/" comes from the root layout (pages.home).
export default function Home() {
  return (
    <main id="main">
      <JsonLd data={homeGraph(pages.home)} />
      <Hero />
      <WhatWeBuild />
      <VenturesPreview />
      <StudioPreview />
    </main>
  );
}
