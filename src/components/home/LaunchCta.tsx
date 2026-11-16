"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type MouseEvent } from "react";
import s from "./launchCta.module.css";

type Props = {
  href: string;
  label: string;
  /** "up-right" (↗) for the archive, "right" (→) for the studio. */
  arrow?: "up-right" | "right";
};

/**
 * The homepage's way into a chapter of the site. On a plain click the light
 * opens out from the button to fill the screen and then carries the visitor
 * to `href` (both destinations open from black). Modified clicks and
 * reduced motion navigate normally.
 *
 * The light is a plain DOM node owned by this component's effect rather
 * than React state: Next.js keeps a visited route mounted (hidden) for when
 * the visitor returns, so state would bring the screen-filling light back
 * with the homepage. Effect cleanup — which also runs when the route is
 * hidden — removes it, and cancels a launch still in flight.
 */
export default function LaunchCta({ href, label, arrow = "up-right" }: Props) {
  const router = useRouter();
  const ref = useRef<HTMLAnchorElement>(null);
  const light = useRef<HTMLDivElement | null>(null);
  const timer = useRef(0);
  const glyph = arrow === "right" ? "→" : "↗";

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      light.current?.remove();
      light.current = null;
      ref.current?.removeAttribute("data-launching");
    },
    [],
  );

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const plain = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const button = ref.current;
    if (!plain || reduce || !button || light.current) return;
    e.preventDefault();
    const r = button.getBoundingClientRect();
    // Place the light at the button, then open it on the next frame.
    const el = document.createElement("div");
    el.className = s.launch;
    el.setAttribute("aria-hidden", "true");
    el.style.setProperty("--x", `${r.left + r.width / 2}px`);
    el.style.setProperty("--y", `${r.top + r.height / 2}px`);
    const ring = document.createElement("span");
    ring.className = s.launchRing;
    el.append(ring);
    document.body.append(el);
    light.current = el;
    button.setAttribute("data-launching", "");
    requestAnimationFrame(() => requestAnimationFrame(() => el.setAttribute("data-active", "")));
    // navigate once the light has filled the screen (its CSS transition)
    timer.current = window.setTimeout(() => router.push(href), 820);
  };

  return (
    <>
      <Link
        ref={ref}
        href={href}
        className={s.cta}
        onClick={onClick}
        data-arrow={arrow}
      >
        <span className={s.ctaEdge} aria-hidden="true" />
        <span className={s.ctaSweep} aria-hidden="true" />
        <span className={s.ctaCorners} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className={s.ctaText}>
          <span className={s.ctaLabel}>{label}</span>
          <span className={s.ctaLabelAlt} aria-hidden="true">
            {label}
          </span>
        </span>
        <span className={s.ctaArrow} aria-hidden="true">
          <span>{glyph}</span>
          <span>{glyph}</span>
        </span>
      </Link>
    </>
  );
}
