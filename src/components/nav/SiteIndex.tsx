"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import s from "./siteIndex.module.css";

type EntryId = "home" | "build" | "ventures" | "studio" | "contact";
type Item = { no: string; label: string; href: string; id: EntryId };

const ITEMS: Item[] = [
  { no: "01", label: "Home", href: "/", id: "home" },
  { no: "02", label: "What we build", href: "/#what-we-build", id: "build" },
  { no: "03", label: "Our ventures", href: "/ventures", id: "ventures" },
  { no: "04", label: "Studio", href: "/studio", id: "studio" },
  { no: "05", label: "Contact", href: "/contact", id: "contact" },
];

/** Routes and the entry they light up (the homepage is handled by chapter). */
const ROUTE_ENTRIES: [prefix: string, id: EntryId][] = [
  ["/contact", "contact"],
  ["/studio", "studio"],
  ["/ventures", "ventures"],
  ["/what-we-build", "build"],
];

/**
 * Homepage chapters (section ids) and the entry each lights up, in page
 * order. If two overlap the middle of the screen (the pinned What We Build
 * stage can), the later chapter wins.
 */
const HOME_CHAPTERS: Record<string, EntryId> = {
  "what-we-build": "build",
  "our-ventures": "ventures",
  "the-studio": "studio",
};

/**
 * The SODWORKS Index — the site's navigation, set like an architectural
 * index: wordmark left, numbered entries right, hairline separators and a
 * bronze rule under the active entry. Collapses to a dedicated full-screen
 * index on small screens.
 */
export default function SiteIndex() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [homeChapter, setHomeChapter] = useState<EntryId | null>(null);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Background appears only once the page has moved.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On the homepage, the active entry follows the reader through its chapters.
  useEffect(() => {
    if (pathname !== "/") return;
    // A section counts as current while it crosses the middle of the screen.
    const crossing = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) crossing.add(e.target.id);
          else crossing.delete(e.target.id);
        }
        const latest = Object.keys(HOME_CHAPTERS).reverse().find((id) => crossing.has(id));
        setHomeChapter(latest ? HOME_CHAPTERS[latest] : null);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const id of Object.keys(HOME_CHAPTERS)) {
      const section = document.getElementById(id);
      if (section) io.observe(section);
    }
    return () => io.disconnect();
  }, [pathname]);

  // Mobile index: lock the page, focus the first entry, close on Escape.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const toggle = toggleRef.current;
    html.classList.add("index-open");
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      html.classList.remove("index-open");
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const active: EntryId =
    pathname === "/"
      ? (homeChapter ?? "home")
      : (ROUTE_ENTRIES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "home");

  const entry = (it: Item, big = false) => (
    <Link
      href={it.href}
      className={`${s.entry} ${big ? s.entryBig : ""}`}
      aria-current={active === it.id ? "page" : undefined}
      data-active={active === it.id || undefined}
      onClick={() => setOpen(false)}
    >
      <span className={s.no}>{it.no}</span>
      <span className={s.label}>{it.label}</span>
    </Link>
  );

  return (
    <header className={s.bar} data-scrolled={scrolled || undefined}>
      <a href="#main" className={s.skip}>
        Skip to content
      </a>
      <Link href="/" className={s.mark} aria-label="SODWORKS — home">
        SodWorks<span className={s.cursor}>_</span>
      </Link>

      <nav aria-label="Site index" className={s.desktop}>
        <ol>
          {ITEMS.map((it) => (
            <li key={it.id}>{entry(it)}</li>
          ))}
        </ol>
      </nav>

      <button
        ref={toggleRef}
        type="button"
        className={s.toggle}
        aria-expanded={open}
        aria-controls="site-index-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={s.toggleLabel}>{open ? "Close" : "Index"}</span>
        <span className={s.toggleBars} data-open={open || undefined} aria-hidden="true">
          <i />
          <i />
        </span>
      </button>

      <div
        ref={panelRef}
        id="site-index-panel"
        className={s.panel}
        data-open={open || undefined}
        role="dialog"
        aria-modal="true"
        aria-label="Site index"
        hidden={!open}
      >
        <p className={s.panelLabel}>Index</p>
        <ol>
          {ITEMS.map((it) => (
            <li key={it.id}>{entry(it, true)}</li>
          ))}
        </ol>
      </div>
    </header>
  );
}
