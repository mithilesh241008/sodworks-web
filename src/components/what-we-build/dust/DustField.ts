/**
 * DustField — the halftone image of PAGE 02, rebuilt from particles.
 *
 * Every particle comes from the supplied image itself: the source is read
 * pixel by pixel on a stride, and each lit sample becomes one particle whose
 * home position and brightness are that pixel's. Several particles therefore
 * rebuild each halftone dot, which keeps the original dot character.
 *
 * The engine is framework-free Canvas 2D. All per-particle data lives in typed
 * arrays; each frame is pure arithmetic plus one batched fill per brightness
 * level (not one draw call per particle). Motion is driven by a handful of
 * scalar parameters that GSAP animates from outside:
 *
 *   assemble  0 → 1   dust gathers into the image, luminous object first
 *   wave      0 → 1   a wave of dust travels out from the object and settles
 *   energy    0 → 1   ambient drift (chapter 02 is slightly livelier)
 *   pulse     0 → 1   the object's illumination breathes
 *   dissolve  0 → 1   the image lets go into the dark, hand first, object last
 */

export type DustParams = {
  assemble: number;
  wave: number;
  energy: number;
  pulse: number;
  dissolve: number;
};

type Options = {
  /** Element whose box is the image's display rectangle. */
  imageBox: HTMLElement;
  /** Optional element for the object's illumination (opacity is driven). */
  glow?: HTMLElement | null;
  /** Luminous object centre, in normalised coordinates of the crop. */
  orb: { x: number; y: number };
  /** Region of the source shown in the image box (source px). The rest is
   *  pure black ground, so cropping it changes nothing visible. */
  crop?: { x: number; y: number; w: number; h: number };
  /** Desired on-screen spacing between particles, in CSS px. */
  pitch?: number;
  /** Hard ceiling for the particle count (device budget). */
  maxParticles?: number;
};

const LEVELS = 24; // brightness buckets → one fill per bucket per frame
const THRESHOLD = 24; // source luminance below this is the black ground

/** Small deterministic PRNG so the dust is identical on every visit. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => v * v * (3 - 2 * v);
const easeOut = (v: number) => 1 - (1 - v) * (1 - v) * (1 - v);

export default class DustField {
  readonly params: DustParams = { assemble: 0, wave: 0, energy: 0, pulse: 0, dissolve: 0 };

  private ctx: CanvasRenderingContext2D;
  private source: ImageData;
  private opts: Required<Omit<Options, "glow">> & { glow: HTMLElement | null };

  // particle data (normalised image coordinates; offsets in image widths)
  private n = 0;
  private hx = new Float32Array(0);
  private hy = new Float32Array(0);
  private lum = new Float32Array(0);
  private dist = new Float32Array(0); // distance from the object, 0..1
  private delay = new Float32Array(0); // assembly order
  private sx = new Float32Array(0); // assembly start offset
  private sy = new Float32Array(0);
  private r1 = new Float32Array(0);
  private r2 = new Float32Array(0);
  private r3 = new Float32Array(0);
  private freeDust = new Uint8Array(0); // the few motes that keep wandering

  // frame scratch
  private px = new Float32Array(0);
  private py = new Float32Array(0);
  private lv = new Uint8Array(0);
  private order = new Int32Array(0);
  private counts = new Int32Array(LEVELS + 1);
  private starts = new Int32Array(LEVELS + 1);
  private cursor = new Int32Array(LEVELS + 1);
  private fills: string[] = [];

  // layout (device px)
  private dpr = 1;
  private imgX = 0;
  private imgY = 0;
  private imgW = 1;
  private imgH = 1;
  private size = 1;
  private stride = 2;

  private running = false;
  private degrades = 0;
  private raf = 0;
  private velocity = 0; // smoothed scroll velocity, px/s
  private velocityTarget = 0;
  private resizeObserver: ResizeObserver;

  constructor(
    private canvas: HTMLCanvasElement,
    source: ImageData,
    options: Options,
  ) {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Canvas 2D unavailable");
    this.ctx = ctx;
    this.source = source;
    this.opts = {
      pitch: 2,
      maxParticles: 14000,
      glow: null,
      crop: { x: 0, y: 0, w: source.width, h: source.height },
      ...options,
    } as typeof this.opts;
    for (let i = 0; i <= LEVELS; i++) {
      // Monochrome, a whisper warm — the image stays black & white.
      this.fills.push(`rgba(238,234,228,${(i / LEVELS).toFixed(3)})`);
    }
    this.resizeObserver = new ResizeObserver(() => this.layout());
    this.resizeObserver.observe(canvas);
    this.resizeObserver.observe(options.imageBox);
    this.layout();
  }

  /** Re-measure; re-sample only if the on-screen scale needs another density. */
  layout() {
    const c = this.canvas.getBoundingClientRect();
    const b = this.opts.imageBox.getBoundingClientRect();
    if (c.width < 2 || b.width < 2) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(c.width * this.dpr);
    this.canvas.height = Math.round(c.height * this.dpr);
    this.imgX = (b.left - c.left) * this.dpr;
    this.imgY = (b.top - c.top) * this.dpr;
    this.imgW = b.width * this.dpr;
    this.imgH = b.height * this.dpr;

    const scale = b.width / this.opts.crop.w; // CSS px per source px
    let stride = Math.max(2, Math.round(this.opts.pitch / scale));
    // Respect the device budget: widen the stride until we fit.
    while (this.estimate(stride) > this.opts.maxParticles) stride++;
    if (stride !== this.stride || this.n === 0) {
      this.stride = stride;
      this.sample();
    }
    // Each particle fills its whole cell: at rest the particles are exactly
    // the source's own pixels, so the halftone dots read as the original.
    this.size = Math.max(1, stride * scale * this.dpr);
    if (!this.running) this.draw(performance.now() / 1000);
  }

  private estimate(stride: number) {
    const { data, width } = this.source;
    const c = this.opts.crop;
    let n = 0;
    for (let y = c.y; y < c.y + c.h; y += stride * 2)
      for (let x = c.x; x < c.x + c.w; x += stride * 2) if (data[(y * width + x) * 4] > THRESHOLD) n++;
    return n * 4;
  }

  /** Read the image: one particle per lit sample. */
  private sample() {
    const { data, width } = this.source;
    const c = this.opts.crop;
    const s = this.stride;
    const xs: number[] = [];
    const ys: number[] = [];
    const ls: number[] = [];
    for (let y = c.y; y < c.y + c.h; y += s) {
      for (let x = c.x; x < c.x + c.w; x += s) {
        // Tone = the cell's average (dots keep their shape); presence = its
        // brightest pixel, so isolated specks of dust still survive, faintly.
        let sum = 0;
        let max = 0;
        let cnt = 0;
        for (let yy = y; yy < Math.min(y + s, c.y + c.h); yy++)
          for (let xx = x; xx < Math.min(x + s, c.x + c.w); xx++) {
            const v = data[(yy * width + xx) * 4];
            sum += v;
            cnt++;
            if (v > max) max = v;
          }
        if (max > THRESHOLD) {
          const tone = Math.max(sum / cnt, max * 0.45) / 255;
          xs.push((x - c.x + s / 2) / c.w);
          ys.push((y - c.y + s / 2) / c.h);
          // a slight lift so sub-pixel particles keep the source's luminosity
          ls.push(Math.pow(tone, 0.85));
        }
      }
    }
    const n = (this.n = xs.length);
    const rand = mulberry32(20261110);
    const aspect = c.h / c.w;
    const { x: ox, y: oy } = this.opts.orb;
    // farthest particle from the object, for normalising distance
    let dMax = 0;
    for (let i = 0; i < n; i++) dMax = Math.max(dMax, Math.hypot(xs[i] - ox, (ys[i] - oy) * aspect));

    this.hx = Float32Array.from(xs);
    this.hy = Float32Array.from(ys);
    this.lum = Float32Array.from(ls);
    this.dist = new Float32Array(n);
    this.delay = new Float32Array(n);
    this.sx = new Float32Array(n);
    this.sy = new Float32Array(n);
    this.r1 = new Float32Array(n);
    this.r2 = new Float32Array(n);
    this.r3 = new Float32Array(n);
    this.freeDust = new Uint8Array(n);
    this.px = new Float32Array(n);
    this.py = new Float32Array(n);
    this.lv = new Uint8Array(n);
    this.order = new Int32Array(n);

    for (let i = 0; i < n; i++) {
      const d = Math.hypot(xs[i] - ox, (ys[i] - oy) * aspect) / dMax;
      const a = rand();
      const b = rand();
      const c = rand();
      this.dist[i] = d;
      this.r1[i] = a;
      this.r2[i] = b;
      this.r3[i] = c;
      // Object first, then the hand around it, then the outermost dust.
      this.delay[i] = Math.pow(d, 0.85) * 0.72 + a * 0.16 - ls[i] * 0.06;
      // Each grain starts adrift in the dark nearby and gathers to its place.
      const ang = b * Math.PI * 2;
      const far = 0.05 + c * c * 0.32;
      this.sx[i] = Math.cos(ang) * far;
      this.sy[i] = Math.sin(ang) * far * 0.8;
      this.freeDust[i] = a < 0.018 && d > 0.12 ? 1 : 0;
    }
  }

  setVelocity(v: number) {
    this.velocityTarget = Math.max(-4000, Math.min(4000, v));
  }

  start() {
    if (this.running) return;
    this.running = true;
    let last = 0;
    let slow = 0;
    const loop = (ms: number) => {
      if (!this.running) return;
      // Adaptive density: if frames stay slow for ~2 s, thin the dust
      // (at most twice). Long gaps (tab hidden) are ignored.
      const dt = last ? ms - last : 16;
      last = ms;
      if (dt > 26 && dt < 250) slow++;
      else if (slow > 0) slow--;
      if (slow > 120 && this.degrades < 2 && this.n > 3000) {
        this.degrades++;
        slow = 0;
        this.opts.maxParticles = Math.floor(this.n * 0.65);
        this.n = 0;
        this.layout();
      }
      this.draw(ms / 1000);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Render one frame for time t (seconds). */
  draw(t: number) {
    const { ctx, n, imgX, imgY, imgW, imgH, dpr } = this;
    const P = this.params;
    const W = this.canvas.width;
    const H = this.canvas.height;

    // scroll velocity eases in and decays, so displacement is soft
    this.velocity += (this.velocityTarget - this.velocity) * 0.08;
    this.velocityTarget *= 0.9;
    const vel = this.velocity;

    const A = P.assemble;
    const wave = P.wave;
    const waveEnv = Math.sin(Math.PI * wave); // zero at both ends: always settles
    const front = wave * 1.3 - 0.05; // wave front radius, in object-distance units
    const D = P.dissolve;
    const amb = (0.35 + 0.65 * P.energy) * dpr; // ambient drift amplitude
    const pulse = P.pulse * (0.5 + 0.5 * Math.sin(t * 1.6));
    const iw = imgW; // offsets are expressed in image widths

    const counts = this.counts;
    counts.fill(0);

    for (let i = 0; i < n; i++) {
      // ── assembly
      const ta = clamp01((A * 1.18 - this.delay[i]) / 0.3);
      if (ta <= 0) {
        this.lv[i] = 0;
        continue;
      }
      const ea = easeOut(ta);
      let ox = this.sx[i] * (1 - ea);
      let oy = this.sy[i] * (1 - ea);
      // a gentle curl while gathering
      const curl = Math.sin(Math.PI * ea) * 0.02 * (this.r2[i] - 0.5);
      ox += -oy * curl * 8;
      oy += ox * curl * 8;

      // ── ambient drift (tiny for most; the free motes wander)
      const r1 = this.r1[i];
      const r2 = this.r2[i];
      let dx = Math.sin(t * (0.35 + r1 * 0.5) + r2 * 6.28) * amb;
      let dy = Math.cos(t * (0.3 + r2 * 0.45) + r1 * 6.28) * amb;
      if (this.freeDust[i]) {
        dx += Math.sin(t * 0.17 + r1 * 9) * 9 * dpr * (0.6 + P.energy);
        dy += Math.cos(t * 0.13 + r2 * 9) * 6 * dpr * (0.6 + P.energy);
      }
      // restrained breathing around the object
      const d = this.dist[i];
      if (d < 0.22) {
        const br = Math.sin(t * 0.9) * (0.22 - d) * 2.4 * dpr * (1 + P.energy);
        dx += (this.hx[i] - this.opts.orb.x) * br * 3;
        dy += (this.hy[i] - this.opts.orb.y) * br * 3;
      }
      // scroll: dust lags a touch behind the reader
      dy += -vel * 0.0035 * (0.4 + r1) * dpr;

      // ── the chapter wave: travels out from the object, then settles
      if (waveEnv > 0) {
        const k = (d - front) / 0.17;
        const I = Math.exp(-k * k) * waveEnv;
        if (I > 0.002) {
          const ux = this.hx[i] - this.opts.orb.x;
          const uy = this.hy[i] - this.opts.orb.y;
          const len = Math.hypot(ux, uy) || 1;
          const out = 0.022 * I * (0.5 + r2);
          const swirl = 0.014 * I * (r1 - 0.5) * 2;
          ox += (ux / len) * out - (uy / len) * swirl;
          oy += (uy / len) * out + (ux / len) * swirl - 0.008 * I * r2;
        }
      }

      // ── final dissolution: hand first, object last; drifting, not flying
      let alpha = this.lum[i] * Math.min(1, ta * 1.6);
      if (D > 0) {
        const td = clamp01((D * 1.55 - (1 - d) * 0.42 - this.r3[i] * 0.16) / 0.55);
        if (td > 0) {
          const e = smooth(td);
          const ux = this.hx[i] - this.opts.orb.x;
          const uy = this.hy[i] - this.opts.orb.y;
          ox += ux * 0.55 * e * (0.4 + r1) + Math.sin(r2 * 12 + t * 0.4) * 0.04 * e;
          oy += uy * 0.45 * e * (0.4 + r2) - 0.12 * e * (0.3 + r1);
          alpha *= Math.pow(1 - td, 1.6);
        }
      }

      // the object's light breathes
      if (pulse > 0 && d < 0.3) alpha = Math.min(1, alpha * (1 + pulse * 0.22 * (1 - d / 0.3)));

      this.px[i] = imgX + (this.hx[i] + ox) * iw + dx;
      this.py[i] = imgY + this.hy[i] * imgH + oy * iw + dy;
      const level = Math.round(alpha * LEVELS);
      this.lv[i] = level;
      counts[level]++;
    }

    // counting sort by level, so each level is one fill
    let acc = 0;
    const start = this.starts;
    const cursor = this.cursor;
    for (let l = 0; l <= LEVELS; l++) {
      start[l] = acc;
      cursor[l] = acc;
      acc += counts[l];
    }
    for (let i = 0; i < n; i++) {
      const l = this.lv[i];
      if (l > 0) this.order[cursor[l]++] = i;
    }

    ctx.clearRect(0, 0, W, H);
    const s = this.size;
    const h = s / 2;
    for (let l = 1; l <= LEVELS; l++) {
      const from = start[l];
      const to = start[l] + counts[l];
      if (to <= from) continue;
      ctx.fillStyle = this.fills[l];
      ctx.beginPath();
      for (let j = from; j < to; j++) {
        const i = this.order[j];
        ctx.rect(this.px[i] - h, this.py[i] - h, s, s);
      }
      ctx.fill();
    }

    // illumination follows the object: forms first, breathes, lets go last
    const glow = this.opts.glow;
    if (glow) {
      const formed = smooth(clamp01(A * 2.2));
      const gone = 1 - smooth(clamp01((D - 0.55) / 0.4));
      glow.style.opacity = (formed * gone * (0.75 + 0.25 * pulse + 0.1 * waveEnv)).toFixed(3);
    }
  }

  destroy() {
    this.stop();
    this.resizeObserver.disconnect();
    this.n = 0;
  }
}
