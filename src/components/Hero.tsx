"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { afterLoader } from "@/components/loader/ready";
import { getArrival } from "@/lib/arrival";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SRC = "/images/sodworks-hero.jpg";
const SIZES = "(max-aspect-ratio: 1/1) 188vw, 100vw";
const ALT =
  "A Renaissance-style painting of three scholars gathered around a modern laptop, surrounded by an armillary sphere, antique books, sealed manuscripts and a book of planetary charts.";

/** Reveal order of the painting's regions (each has a prepared mask). */
const REGIONS = ["central", "laptop", "left", "right", "room"] as const;
type Region = (typeof REGIONS)[number];

/**
 * Where the warm key light sits while each region emerges, as offsets of
 * the light layer (which is 120% of the frame, centred at 47% / 42%).
 */
const LIGHT_ON: Record<Region, { xPercent: number; yPercent: number; scale: number }> = {
  central: { xPercent: 8, yPercent: -7, scale: 0.9 },
  laptop: { xPercent: -8, yPercent: 19, scale: 0.85 },
  left: { xPercent: -10, yPercent: 0, scale: 0.95 },
  right: { xPercent: 18, yPercent: 9, scale: 1 },
  room: { xPercent: 0, yPercent: 0, scale: 1.3 },
};

/**
 * Entrance — seconds from the moment the painting and font are ready.
 *
 *  01 Brand first      0.0 – 3.2   black → SodWorks_ fades in, centred, and holds
 *  02 Region reveal    3.2 – 7.9   central scholar → laptop → left → right → room,
 *                                  a warm key light travelling between them;
 *                                  the untouched original resolves them into one
 *  03 Reposition       7.4 – 10.0  the wordmark rises into the painting and settles
 *                                  behind the central scholar's head
 *  04 Hold             8.6 →       slow camera push + ambient warmth; scrolling unlocks
 *  05 Scroll exit      (scrubbed)  dolly in toward the laptop, title lifts away,
 *                                  darkness closes — fully reversible
 */
const T = {
  brand: 0.6,
  regions: { central: 3.2, laptop: 3.95, left: 4.65, right: 5.3, room: 5.9 } satisfies Record<
    Region,
    number
  >,
  vignette: 4.8,
  full: 6.3,
  settled: 7.9,
  move: 7.4,
  push: 8.6,
  ambient: 9.8,
  unlock: 10.0,
} as const;

/** Never hold the visitor in darkness waiting for a slow network. */
const READY_TIMEOUT_MS = 3500;

function whenReady(img: HTMLImageElement | null): Promise<void> {
  const imageReady = new Promise<void>((resolve) => {
    if (!img) return resolve();
    const decode = () =>
      img
        .decode()
        .catch(() => undefined)
        .then(() => resolve());
    if (img.complete && img.naturalWidth > 0) decode();
    else {
      img.addEventListener("load", decode, { once: true });
      img.addEventListener("error", () => resolve(), { once: true });
    }
  });
  const fontsReady = document.fonts?.ready.then(() => undefined) ?? Promise.resolve();
  const timeout = new Promise<void>((r) => setTimeout(r, READY_TIMEOUT_MS));
  return Promise.race([Promise.all([imageReady, fontsReady]).then(() => undefined), timeout]);
}

function Plate({
  variant,
  imgRef,
}: {
  variant: Region | "full" | "head";
  imgRef?: React.Ref<HTMLImageElement>;
}) {
  const isFull = variant === "full";
  const isRegion = variant !== "full" && variant !== "head";
  return (
    <div
      className={`hero-plate hero-plate--${variant}${isRegion ? " hero-plate--region" : ""}`}
      aria-hidden={isFull ? undefined : true}
    >
      <Image
        ref={imgRef}
        src={SRC}
        alt={isFull ? ALT : ""}
        fill
        preload={isFull}
        quality={90}
        sizes={SIZES}
        draggable={false}
      />
    </div>
  );
}

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let cancelled = false;
        const html = document.documentElement;
        const q = gsap.utils.selector(root);
        const el = {
          section: q(".hero")[0] as HTMLElement,
          regions: Object.fromEntries(
            REGIONS.map((r) => [r, q(`.hero-plate--${r}`)]),
          ) as unknown as Record<Region, Element[]>,
          full: q(".hero-plate--full"),
          head: q(".hero-plate--head"),
          light: q(".hero-light"),
          drift: q(".hero-drift"),
          vignette: q(".hero-vignette"),
          camera: q(".hero-camera"),
          dolly: q(".hero-dolly"),
          anchor: q(".hero-title-anchor")[0] as HTMLElement,
          move: q(".hero-title-move"),
          exitTitle: q(".hero-title-exit"),
          title: q(".hero-title"),
          exitShade: q(".hero-exit"),
        };

        // A history step back to the homepage returns to the page as it was
        // left: the hero settles at once and the restored position is kept.
        // Every other arrival starts the film at the top, with scrolling held.
        const returning = getArrival() === "pop";
        if (!returning) {
          if ("scrollRestoration" in history) history.scrollRestoration = "manual";
          window.scrollTo(0, 0);
          html.classList.add("hero-intro-lock");
        }

        /** Offset that places the wordmark at the centre of the screen. */
        const centreTitle = () => {
          gsap.set(el.move, { clearProps: "transform" });
          const a = el.anchor.getBoundingClientRect();
          const s = el.section.getBoundingClientRect();
          const em = parseFloat(getComputedStyle(el.anchor).fontSize);
          // Centre the *ink* (8.8em wide, caps 0.875em tall), not the layout
          // box, which carries trailing tracking and a full underscore cell.
          const inkW = 8.8 * em;
          const inkCx = a.left + inkW / 2;
          const inkCy = a.top + (0.875 * em) / 2;
          const scale = Math.min(1.15, (s.width * 0.86) / inkW);
          gsap.set(el.move, {
            transformOrigin: `${inkW / 2}px ${(0.875 * em) / 2}px`,
            x: s.left + s.width / 2 - inkCx,
            y: s.top + s.height / 2 - inkCy,
            scale,
          });
        };

        let tl: gsap.core.Timeline | undefined;
        const onResize = () => {
          if (tl && tl.time() < T.move) centreTitle();
        };

        const start = contextSafe!(() => {
          if (cancelled) return;

          // Explicit start state (mirrors the CSS "pending" state) so the
          // timeline owns every value it touches.
          gsap.set(Object.values(el.regions), { autoAlpha: 0 });
          gsap.set([el.full, el.head, el.title, el.drift], { opacity: 0 });
          gsap.set(el.light, { opacity: 0, xPercent: 0, yPercent: 0, scale: 1 });
          gsap.set(el.vignette, { opacity: 1, scale: 1, yPercent: 0 });
          gsap.set([el.camera, el.dolly], { scale: 1, yPercent: 0 });
          gsap.set(el.exitTitle, { opacity: 1, yPercent: 0 });
          gsap.set(el.exitShade, { opacity: 0 });
          centreTitle();
          window.addEventListener("resize", onResize);

          // Scene 04 ambient loops — unrelated periods so nothing reads as a pulse.
          const ambient = [
            gsap.to(el.light, { opacity: 0.34, duration: 7.5, ease: "sine.inOut", repeat: -1, yoyo: true, paused: true }),
            gsap.to(el.light, { xPercent: 3, yPercent: -1.5, duration: 13, ease: "sine.inOut", repeat: -1, yoyo: true, paused: true }),
            gsap.to(el.drift, { xPercent: 4, duration: 17, ease: "sine.inOut", repeat: -1, yoyo: true, paused: true }),
          ];

          // played 1.2× faster than authored (T above is the authored timing)
          const timeline = gsap.timeline().timeScale(1.2);
          tl = timeline;

          // ── 01 · Brand first. Black, then the wordmark alone, held.
          timeline.to(el.title, { opacity: 1, duration: 1.8, ease: "sine.inOut" }, T.brand);

          // ── 02 · The painting emerges region by region. Each mask is
          // feathered and shaped by the painting's own light, and a warm key
          // travels between subjects so the regions read as one lit scene.
          timeline.to(el.light, { opacity: 0.7, duration: 1.4, ease: "sine.inOut" }, T.regions.central - 0.4);
          REGIONS.forEach((r, i) => {
            const at = T.regions[r];
            const dur = r === "room" ? 2.4 : 1.9;
            timeline.to(el.regions[r], { autoAlpha: 1, duration: dur, ease: "sine.inOut" }, at);
            timeline.to(
              el.light,
              { ...LIGHT_ON[r], duration: i === 0 ? 0.01 : 1.4, ease: "sine.inOut" },
              i === 0 ? at - 0.4 : at - 0.35,
            );
          });
          // The surrounding darkness draws back and thins to a vignette…
          timeline.to(el.vignette, { scale: 1.45, yPercent: -3, opacity: 0.2, duration: 3.5, ease: "power2.inOut" }, T.vignette)
            // …and the untouched original resolves exposure and contrast,
            // fusing the regions into one painting.
            .to(el.full, { opacity: 1, duration: 1.6, ease: "power1.inOut" }, T.full)
            .to(el.light, { opacity: 0.26, xPercent: 0, yPercent: 0, scale: 1, duration: 2.4, ease: "sine.inOut" }, T.full)
            // The head cut-out joins only once it is pixel-identical to the
            // plate beneath it — invisible until the title passes behind it.
            .set(el.head, { opacity: 1 }, T.settled)
            .set(Object.values(el.regions), { autoAlpha: 0 }, T.settled);

          // ── 03 · The wordmark rises into its place above the scholars.
          timeline.to(el.move, { x: 0, y: 0, scale: 1, duration: 2.6, ease: "power3.inOut" }, T.move);

          // ── 04 · Hold: a long, slow push and barely-there warmth.
          timeline.to(el.camera, { scale: 1.045, yPercent: -0.5, duration: 22, ease: "sine.inOut" }, T.push)
            .to(el.drift, { opacity: 0.1, duration: 4, ease: "sine.inOut" }, T.ambient)
            .call(() => ambient.forEach((t) => t.play()), [], T.ambient)
            .call(() => enableScroll(), [], T.unlock);

          // A link straight to a later chapter (e.g. /#what-we-build) skips
          // the film: the hero settles at once and the page goes there.
          const id = decodeURIComponent(location.hash.slice(1));
          const target = id ? document.getElementById(id) : null;
          if (target && !root.current?.contains(target)) {
            timeline.progress(1);
            requestAnimationFrame(() => target.scrollIntoView());
          } else if (returning) {
            timeline.progress(1);
          }
        });

        // ── 05 · Scroll exit. Built only once the composition has settled,
        // scrubbed (so fully reversible), on its own transform layers.
        const enableScroll = contextSafe!(() => {
          if (cancelled) return;
          window.removeEventListener("resize", onResize);
          html.classList.remove("hero-intro-lock");
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.2,
                invalidateOnRefresh: true,
              },
            })
            .to(el.dolly, { scale: 1.38, yPercent: -2, duration: 1, ease: "power1.in" }, 0)
            .to(el.exitTitle, { opacity: 0, yPercent: -70, duration: 0.4, ease: "power1.in" }, 0)
            // Darkness closes in from the edges around the laptop…
            .to(el.vignette, { opacity: 1, scale: 1.05, yPercent: 0, duration: 0.7, ease: "power1.inOut" }, 0.25)
            // …then the last light goes out.
            .to(el.exitShade, { opacity: 1, duration: 0.35, ease: "power2.in" }, 0.65);
          ScrollTrigger.refresh();
        });

        // after the first-visit loader has lifted, with the painting and font ready
        Promise.all([whenReady(imgRef.current), afterLoader()]).then(start);

        return () => {
          cancelled = true;
          window.removeEventListener("resize", onResize);
          html.classList.remove("hero-intro-lock");
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <>
      <div ref={root} className="hero-scroll" data-intro="pending">
        <noscript>
          <style>{`.hero-scroll{height:auto!important}.hero :is(.hero-plate--full,.hero-plate--head,.hero-title,.hero-light,.hero-drift){opacity:1!important}.hero .hero-vignette{opacity:.2!important;transform:scale(1.45)!important}`}</style>
        </noscript>

        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-frame">
            <div className="hero-dolly">
              <div className="hero-camera">
                {REGIONS.map((r) => (
                  <Plate key={r} variant={r} />
                ))}
                <Plate variant="full" imgRef={imgRef} />

                <div className="hero-title-anchor">
                  <div className="hero-title-move">
                    <div className="hero-title-exit">
                      <h1 id="hero-title" className="hero-title">
                        <span className="sr-only">SODWORKS — an independent technology and product-building studio in India</span>
                        <span aria-hidden="true">
                          SodWorks<span className="hero-cursor">_</span>
                        </span>
                      </h1>
                    </div>
                  </div>
                </div>

                <Plate variant="head" />
              </div>
            </div>

            <div className="hero-drift" aria-hidden="true" />
            <div className="hero-light" aria-hidden="true" />
            <div className="hero-vignette" aria-hidden="true" />
          </div>

          <div className="hero-exit" aria-hidden="true" />
        </section>
      </div>
    </>
  );
}
