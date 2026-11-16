import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found — SODWORKS",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <main id="main" className="sw-404-page">
      <div className="sw-404-lamp" aria-hidden="true" />
      <p className="sw-404-code">Error 404</p>
      <h1 className="sw-tiles sw-404-title">Lost frame.</h1>
      <p className="sw-404-text">This page doesn’t exist — or it hasn’t been built yet.</p>
      <Link href="/" className="sw-404-link">
        Return to the beginning <span aria-hidden="true">→</span>
      </Link>
    </main>
  );
}
