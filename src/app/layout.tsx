import type { Metadata, Viewport } from "next";
import { Inter, Pixelify_Sans, Press_Start_2P } from "next/font/google";
import SiteIndex from "@/components/nav/SiteIndex";
import RouteArrival from "@/components/nav/RouteArrival";
import SignatureFooter from "@/components/footer/SignatureFooter";
import { brand, pageMetadata, pages, siteUrl } from "@/lib/site";
import StructuredData from "@/components/seo/StructuredData";
import SiteLoader from "@/components/loader/SiteLoader";
import SiteGlowCursor from "@/components/cursor/SiteGlowCursor";
import "./globals.css";

// The hero's wordmark is set in Press Start 2P: a 7-unit pixel grid with
// 2-unit strokes and a true lowercase x-height.
const pixel = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// The typographic voice of PAGE 02 — a proportional pixel sans (single-storey
// a and g, stepped rounds, 1-px strokes). Variable 400–700, so one family
// carries the whole hierarchy. next/font self-hosts it and generates a
// metric-matched fallback, so swapping in causes no layout shift.
const pixelSans = Pixelify_Sans({
  variable: "--font-pixel-sans",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

// Practical information (addresses, numbers, form entries) is set in a plain
// sans for legibility; the pixel faces stay with headings and the identity.
const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: brand.name,
  ...pageMetadata(pages.home),
  creator: brand.name,
  publisher: brand.name,
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${pixel.variable} ${pixelSans.variable} ${sans.variable} antialiased`}
    >
      <body>
        <SiteLoader />
        <StructuredData />
        {/* before the page: records how each route is entered (lib/arrival) */}
        <RouteArrival />
        <SiteIndex />
        {children}
        <SignatureFooter />
        <SiteGlowCursor />
      </body>
    </html>
  );
}
