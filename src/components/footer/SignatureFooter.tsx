"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import s from "./footer.module.css";
import { contact } from "@/components/contact/content";
import { brand } from "@/lib/site";

const NAV = [
  { no: "01", label: "Home", href: "/" },
  { no: "02", label: "What we build", href: "/what-we-build" },
  { no: "03", label: "Our ventures", href: "/ventures" },
  { no: "04", label: "Studio", href: "/studio" },
  { no: "05", label: "Contact", href: "/contact" },
];

/**
 * The signature footer — the last frame.
 *
 * An asymmetric composition: the SodWorks_ wordmark grounds the lower left
 * under a low warm light; the practical column on the right holds the ways
 * to reach the studio (set in a plain sans for legibility) and the index.
 * The studio's signature sits quietly beside the copyright at the very
 * bottom. On arrival the columns settle in and the wordmark builds itself
 * one pixel row at a time; a warm light follows the pointer across it.
 */
export default function SignatureFooter() {
  const ref = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    const mark = markRef.current;
    if (!el || !mark) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.setAttribute("data-in", "");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);

    // the light under the pointer (fine pointers only; one write per frame)
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => io.disconnect();
    let raf = 0;
    let x = 0;
    let y = 0;
    const move = (e: PointerEvent) => {
      const r = mark.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          mark.style.setProperty("--mx", `${x}px`);
          mark.style.setProperty("--my", `${y}px`);
        });
    };
    const enter = () => mark.setAttribute("data-lit", "");
    const leave = () => mark.removeAttribute("data-lit");
    mark.addEventListener("pointermove", move);
    mark.addEventListener("pointerenter", enter);
    mark.addEventListener("pointerleave", leave);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      mark.removeEventListener("pointermove", move);
      mark.removeEventListener("pointerenter", enter);
      mark.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <footer ref={ref} className={s.footer}>
      <div className={s.lamp} aria-hidden="true" />

      <div className={s.main}>
        <div className={s.brand}>
          <p className={s.tagline}>{brand.tagline}</p>
          <Link ref={markRef} href="/" className={s.mark} aria-label="SODWORKS — home">
            <span className={`sw-tiles ${s.markText}`}>
              SodWorks<span className={s.cursor}>_</span>
            </span>
          </Link>
        </div>

        <div className={s.side}>
          <div className={s.block}>
            <p className={s.label}>Contact</p>
            <ul className={s.reach}>
              <li>
                <span className={s.reachKind}>Email</span>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <span className={s.reachKind}>Phone</span>
                <span className={s.numbers}>
                  {contact.phones.map((p) => (
                    <a key={p.tel} href={`tel:${p.tel}`}>
                      {p.display}
                    </a>
                  ))}
                </span>
              </li>
            </ul>
          </div>

          <nav className={s.block} aria-label="Footer">
            <p className={s.label}>Index</p>
            <ol className={s.index}>
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className={s.navLink}>
                    <span className={s.navNo}>{n.no}</span>
                    <span className={s.navLabel}>{n.label}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      <div className={s.base}>
        <p className={s.copy}>© 2026 SODWORKS. All rights reserved.</p>
        <p className={s.signature}>Designed and developed by SODWORKS</p>
      </div>
    </footer>
  );
}
