"use client";

import { useEffect, useRef } from "react";

// the shared overlay layer (.glow-cursor, .sw-cursor) — phones never load
// GlowCursor itself, so the layer's styles must come with this component too
import "./GlowCursor.css";

type Props = {
  /** Colour of the freshly drawn light (as GlowCursor's `color`). */
  color: string;
  /** Colour the light cools to (as GlowCursor's `secondaryColor`). */
  secondaryColor: string;
  /** Seconds the trail stays before it has faded. */
  linger?: number;
  className?: string;
};

type Point = { x: number; y: number; t: number };
type Bloom = { x: number; y: number; t: number };

/** Below-native resolution keeps the light soft and the fill rate low. */
const RESOLUTION = 0.5;
const MAX_DPR = 1.5;
const MAX_POINTS = 48;

const rgb = (hex: string) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? [...h].map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};

/**
 * TouchGlow — the touch-screen counterpart of the site's GlowCursor.
 *
 * The same warm light, drawn for a finger instead of a pointer: a short
 * trail that follows a moving touch and cools as it fades, with a small
 * white-hot tip, and a soft bloom where a finger lands. It is a plain 2D
 * canvas at reduced resolution, not the WebGL fluid simulation, so it costs
 * almost nothing: it draws only while a touch is moving or a trail is still
 * fading, and the loop stops entirely once the screen is dark again.
 *
 * Touch listeners are passive and the layer never receives pointer events,
 * so scrolling, taps and gestures are untouched.
 */
export default function TouchGlow({ color, secondaryColor, linger = 0.6, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const [r1, g1, b1] = rgb(color);
    const [r2, g2, b2] = rgb(secondaryColor);
    const points: Point[] = [];
    const blooms: Bloom[] = [];
    let scale = 1;
    let raf = 0;

    const resize = () => {
      scale = Math.min(window.devicePixelRatio || 1, MAX_DPR) * RESOLUTION;
      canvas.width = Math.max(1, Math.round(window.innerWidth * scale));
      canvas.height = Math.max(1, Math.round(window.innerHeight * scale));
    };

    const frame = () => {
      raf = 0;
      const now = performance.now() / 1000;
      while (points.length && now - points[0].t > linger) points.shift();
      while (blooms.length && now - blooms[0].t > linger) blooms.shift();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!points.length && !blooms.length) return; // dark again: the loop stops

      ctx.save();
      ctx.scale(scale, scale);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // the trail: a soft halo, then a bright core, cooling and thinning with age
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const life = 1 - (now - b.t) / linger;
        if (life <= 0) continue;
        const fresh = life * life;
        const r = Math.round(r2 + (r1 - r2) * fresh);
        const g = Math.round(g2 + (g1 - g2) * fresh);
        const bl = Math.round(b2 + (b1 - b2) * fresh);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${bl}, ${0.22 * fresh})`;
        ctx.lineWidth = 20 * (0.5 + life * 0.5);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${r1}, ${g1}, ${b1}, ${0.9 * fresh})`;
        ctx.lineWidth = 3.4 * (0.4 + life * 0.6);
        ctx.stroke();
      }

      // the tip: warm glow with a small white-hot centre
      const head = points[points.length - 1];
      if (head) {
        const life = 1 - (now - head.t) / linger;
        if (life > 0) {
          const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 34);
          glow.addColorStop(0, `rgba(255, 236, 214, ${0.55 * life})`);
          glow.addColorStop(0.18, `rgba(${r1}, ${g1}, ${b1}, ${0.32 * life})`);
          glow.addColorStop(1, `rgba(${r2}, ${g2}, ${b2}, 0)`);
          ctx.fillStyle = glow;
          ctx.fillRect(head.x - 34, head.y - 34, 68, 68);
        }
      }

      // where a finger lands: a soft bloom that opens and fades
      for (const bloom of blooms) {
        const p = (now - bloom.t) / linger;
        const radius = 14 + p * 46;
        const alpha = 0.3 * (1 - p) * (1 - p);
        const g = ctx.createRadialGradient(bloom.x, bloom.y, 0, bloom.x, bloom.y, radius);
        g.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, ${alpha})`);
        g.addColorStop(1, `rgba(${r2}, ${g2}, ${b2}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(bloom.x - radius, bloom.y - radius, radius * 2, radius * 2);
      }

      ctx.restore();
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const now = performance.now() / 1000;
      points.length = 0;
      points.push({ x: t.clientX, y: t.clientY, t: now });
      blooms.push({ x: t.clientX, y: t.clientY, t: now });
      wake();
    };
    const onMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const last = points[points.length - 1];
      if (last && Math.hypot(t.clientX - last.x, t.clientY - last.y) < 3) return;
      points.push({ x: t.clientX, y: t.clientY, t: performance.now() / 1000 });
      if (points.length > MAX_POINTS) points.shift();
      wake();
    };
    const onVisibility = () => {
      if (!document.hidden) return;
      cancelAnimationFrame(raf);
      raf = 0;
      points.length = 0;
      blooms.length = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [color, secondaryColor, linger]);

  return (
    <div className={`glow-cursor ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="glow-cursor__canvas" />
    </div>
  );
}
