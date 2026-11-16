"use client";

import { useEffect, useRef, useState } from "react";
import s from "./loader.module.css";
import { markLoaded } from "./ready";

/** The SODWORKS mark, traced from the supplied logo: two interlocking halves of an S. */
const UPPER =
  "M512 286H962L850 398H540Q514 398 497 415L410 502Q402 510 410 518L502 610Q524 632 554 632H705L813 740H510Q469 740 440 711L290 561Q238 510 290 458L427 321Q462 286 512 286Z";
const LOWER =
  "M504 480H795Q838 480 868 510L1005 647Q1063 705 1005 763L870 898Q840 928 800 928H290L403 815H760Q788 815 808 795L890 713Q898 705 890 697L790 596Q782 588 766 588H612Z";

/** Let the mark finish drawing before the curtain lifts (ms since navigation start). */
const MIN_MS = 2000;
const MIN_MS_REDUCED = 500;
/** Never hold a visitor behind the loader for a slow asset. */
const MAX_MS = 6000;
/** How long the lift takes before the loader is removed from the page. */
const EXIT_MS = 1500;

/**
 * The first-visit loader.
 *
 * Server-rendered and animated in pure CSS, so it is the very first frame a
 * visitor sees — before any script runs. The two halves of the S slide
 * together and trace themselves in light, fill with their colours, and a
 * sheen passes across the mark while the page's fonts and lead images
 * arrive. Then the mark settles and the curtain rises on a lit edge,
 * handing over to the page's own opening (see ./ready).
 *
 * It appears once per visit: client-side navigation keeps the layout, so
 * the loader never returns until a full reload.
 */
export default function SiteLoader() {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const at = (ms: number) => new Promise<void>((r) => setTimeout(r, Math.max(0, ms - performance.now())));
    const pageLoaded = new Promise<void>((r) => {
      if (document.readyState === "complete") r();
      else window.addEventListener("load", () => r(), { once: true });
    });
    const fonts = document.fonts?.ready.then(() => undefined) ?? Promise.resolve();

    let cancelled = false;
    let timer = 0;
    Promise.race([Promise.all([pageLoaded, fonts, at(reduced ? MIN_MS_REDUCED : MIN_MS)]), at(MAX_MS)]).then(() => {
      if (cancelled) return;
      el.setAttribute("data-state", "out");
      markLoaded();
      timer = window.setTimeout(() => setGone(true), reduced ? 500 : EXIT_MS);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={ref} className={s.loader} data-sw-loader aria-hidden="true">
      <noscript>
        <style>{`[data-sw-loader]{display:none!important}`}</style>
      </noscript>
      <div className={s.glow} />
      <div className={s.center}>
        <svg className={s.mark} viewBox="226 274 850 666" fill="none">
          <defs>
            <clipPath id="sw-loader-shape">
              <path d={UPPER} />
              <path d={LOWER} />
            </clipPath>
            <linearGradient id="sw-loader-sheen" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className={s.upper}>
            <path className={s.fill} d={UPPER} />
            <path className={s.stroke} d={UPPER} pathLength={1} />
          </g>
          <g className={s.lower}>
            <path className={s.fill} d={LOWER} />
            <path className={s.stroke} d={LOWER} pathLength={1} />
          </g>
          <g clipPath="url(#sw-loader-shape)">
            <rect className={s.sheen} x="-60" y="240" width="240" height="740" fill="url(#sw-loader-sheen)" />
          </g>
        </svg>
        <p className={s.word}>SODWORKS</p>
        <div className={s.bar}>
          <span />
        </div>
      </div>
    </div>
  );
}
