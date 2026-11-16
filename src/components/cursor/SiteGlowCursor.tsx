"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { afterLoader } from "@/components/loader/ready";

// Each light is fetched only on the devices that use it, and never rendered
// on the server.
const GlowCursor = dynamic(() => import("./GlowCursor"), { ssr: false });
const TouchGlow = dynamic(() => import("./TouchGlow"), { ssr: false });

/** A mouse or trackpad: the WebGL fluid light follows the pointer. */
const POINTER = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
/** A touch screen: the lighter 2D light follows the finger. */
const TOUCH = "(hover: none) and (pointer: coarse) and (prefers-reduced-motion: no-preference)";

const COLOR = "#F29A55";
const SECONDARY = "#B96536";

type Mode = "pointer" | "touch" | null;

/**
 * The site-wide light — one instance for the whole site, mounted once at the
 * root so it persists across client-side navigation. With a mouse or
 * trackpad it is React Bits' GlowCursor (a WebGL fluid simulation); on touch
 * screens it is TouchGlow, a light 2D trail in the same colours that draws
 * only while a finger moves.
 *
 * It is a fixed, viewport-sized overlay that never takes pointer events,
 * is hidden from assistive technology, and sits under the site index, the
 * contact opening, the launch transition and the loader (see .sw-cursor in
 * GlowCursor.css). It screens onto the page, so it only ever adds warm light.
 *
 * Nothing is mounted — or even downloaded — with reduced motion, and the
 * WebGL light is removed again without WebGL2 + float render targets: the
 * site is complete without it. It is mounted only after the
 * first-visit loader has lifted, in idle time, so it never competes with the
 * page's own loading.
 */
export default function SiteGlowCursor() {
  const [mode, setMode] = useState<Mode>(null);
  const [settled, setSettled] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const pointer = window.matchMedia(POINTER);
    const touch = window.matchMedia(TOUCH);
    const update = () => setMode(pointer.matches ? "pointer" : touch.matches ? "touch" : null);
    update();
    pointer.addEventListener("change", update);
    touch.addEventListener("change", update);
    return () => {
      pointer.removeEventListener("change", update);
      touch.removeEventListener("change", update);
    };
  }, []);

  // after the loader, when the browser is idle
  useEffect(() => {
    let cancelled = false;
    let idle = 0;
    let timer = 0;
    const idleSupported = typeof window.requestIdleCallback === "function";
    afterLoader().then(() => {
      if (cancelled) return;
      const ready = () => !cancelled && setSettled(true);
      if (idleSupported) idle = window.requestIdleCallback(ready, { timeout: 1500 });
      else timer = window.setTimeout(ready, 300);
    });
    return () => {
      cancelled = true;
      if (idleSupported && idle) window.cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  }, []);

  if (!mode || !settled) return null;

  if (mode === "touch") return <TouchGlow className="sw-cursor" color={COLOR} secondaryColor={SECONDARY} />;

  if (failed) return null;

  return (
    <GlowCursor
      className="sw-cursor"
      aria-hidden="true"
      color={COLOR}
      secondaryColor={SECONDARY}
      intensity={0.75}
      trailWidth={1.8}
      linger={0.85}
      glow={0.7}
      hotspot={0.4}
      followSpeed={0.75}
      grain={0}
      clickBurst={false}
      quality="medium"
      theme="dark"
      blendMode="normal"
      maxDevicePixelRatio={1.5}
      onUnavailable={(reason) => {
        if (process.env.NODE_ENV !== "production") console.info(`[GlowCursor] disabled: ${reason}`);
        setFailed(true);
      }}
    />
  );
}
