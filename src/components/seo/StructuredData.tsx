import JsonLd from "./JsonLd";
import { siteGraph } from "@/lib/schema";

/** The studio's entity graph (Organization, WebSite, founders) on every page. */
export default function StructuredData() {
  return <JsonLd data={siteGraph()} />;
}
