/**
 * FounderDust — the three founders, disintegrating into their own dust.
 *
 * The photograph's background is pure black, so every non-black pixel
 * belongs to the founders (with the laptops and chairs they hold and sit on;
 * the chairs are largely hidden behind them and could not stand on their
 * own). Those pixels — in 2×2 blocks, each with its true colour — are the
 * particles. Nothing is drawn from a preset: the dust is the photograph.
 *
 * Motion is a closed-form function of each grain's age, so a frame is pure
 * arithmetic over typed arrays plus one pixel-buffer upload. Before release a
 * grain shimmers as it loosens; after release wind carries it up and to the
 * right with turbulence, it thins to a single pixel and fades.
 *
 * Phases (driven from outside):
 *   showPhoto()      the intact photograph (a single drawImage)
 *   dissolve(sec)    seconds since the disintegration began
 *   gather(p, t)     0 → 1: loose dust drifts into a thin horizontal line
 *                    (t: seconds, for the idle drift before it gathers)
 */

const RELEASE = 2.6; // seconds over which the founders let go
const THRESHOLD = 14; // luminance below this is the black ground

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth value noise in [0,1], three octaves, from a hashed lattice. */
function makeNoise(seed: number) {
  const hash = (x: number, y: number) => {
    let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const value = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = smooth(x - xi);
    const yf = smooth(y - yi);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
  return (x: number, y: number) => (value(x, y) * 0.55 + value(x * 2.1, y * 2.1) * 0.3 + value(x * 4.3, y * 4.3) * 0.15);
}

export default class FounderDust {
  private ctx: CanvasRenderingContext2D;
  private img: HTMLImageElement;
  readonly W: number;
  readonly H: number;
  private scale: number;

  // particles
  private n = 0;
  private hx!: Float32Array;
  private hy!: Float32Array;
  private col!: Uint32Array; // packed RGB (alpha set at draw time)
  private tr!: Float32Array; // release time, seconds
  private life!: Float32Array;
  private vx!: Float32Array;
  private vy!: Float32Array;
  private amp!: Float32Array;
  private w1!: Float32Array;
  private ph!: Float32Array;

  // gather dust
  private gN = 0;
  private gsx!: Float32Array;
  private gsy!: Float32Array;
  private gtx!: Float32Array;
  private gd!: Float32Array;
  private gph!: Float32Array;

  private out: ImageData;
  private out32: Uint32Array;

  constructor(canvas: HTMLCanvasElement, img: HTMLImageElement, opts: { scale: number }) {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Canvas 2D unavailable");
    this.ctx = ctx;
    this.img = img;
    this.scale = opts.scale;
    this.W = Math.round(img.naturalWidth * opts.scale);
    this.H = Math.round(img.naturalHeight * opts.scale);
    canvas.width = this.W;
    canvas.height = this.H;
    this.out = ctx.createImageData(this.W, this.H);
    this.out32 = new Uint32Array(this.out.data.buffer);
    this.sample();
    this.prepareGather();
  }

  /** Read the photograph; one particle per lit 2×2 block. */
  private sample() {
    const { W, H } = this;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const cx = c.getContext("2d", { willReadFrequently: true })!;
    cx.drawImage(this.img, 0, 0, W, H);
    const d = cx.getImageData(0, 0, W, H).data;

    const xs: number[] = [];
    const ys: number[] = [];
    const cs: number[] = [];
    for (let y = 0; y < H - 1; y += 2) {
      for (let x = 0; x < W - 1; x += 2) {
        let r = 0;
        let g = 0;
        let b = 0;
        for (let k = 0; k < 4; k++) {
          const i = ((y + (k >> 1)) * W + x + (k & 1)) * 4;
          r += d[i];
          g += d[i + 1];
          b += d[i + 2];
        }
        r >>= 2;
        g >>= 2;
        b >>= 2;
        if ((r + g + b) / 3 > THRESHOLD) {
          xs.push(x);
          ys.push(y);
          cs.push((b << 16) | (g << 8) | r);
        }
      }
    }
    const n = (this.n = xs.length);
    const rand = mulberry32(20260701); // the founding day
    const noise = makeNoise(7);
    const s = this.scale;

    this.hx = Float32Array.from(xs);
    this.hy = Float32Array.from(ys);
    this.col = Uint32Array.from(cs);
    this.tr = new Float32Array(n);
    this.life = new Float32Array(n);
    this.vx = new Float32Array(n);
    this.vy = new Float32Array(n);
    this.amp = new Float32Array(n);
    this.w1 = new Float32Array(n);
    this.ph = new Float32Array(n);

    let lo = Infinity;
    let hi = -Infinity;
    const order = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const u = xs[i] / W;
      const v = ys[i] / H;
      // heads first, down the body; noise breaks the front; founders
      // staggered slightly left to right
      const person = u < 0.36 ? 0 : u < 0.64 ? 1 : 2;
      const o = 0.5 * noise(xs[i] / (36 * s), ys[i] / (36 * s)) + 0.5 * v + person * 0.07;
      order[i] = o;
      if (o < lo) lo = o;
      if (o > hi) hi = o;
      this.life[i] = 1.0 + rand() * 1.0;
      this.vx[i] = (10 + rand() * 34) * s;
      this.vy[i] = (-26 + rand() * 34) * s;
      this.amp[i] = (5 + rand() * 14) * s;
      this.w1[i] = 2 + rand() * 3.5;
      this.ph[i] = rand() * Math.PI * 2;
    }
    for (let i = 0; i < n; i++) this.tr[i] = ((order[i] - lo) / (hi - lo)) * RELEASE;
  }

  /** Loose dust that will gather into the beam. */
  private prepareGather() {
    const N = (this.gN = Math.round(1400 * this.scale + 400));
    const rand = mulberry32(11);
    this.gsx = new Float32Array(N);
    this.gsy = new Float32Array(N);
    this.gtx = new Float32Array(N);
    this.gd = new Float32Array(N);
    this.gph = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      this.gsx[i] = rand() * this.W;
      this.gsy[i] = rand() * this.H;
      // a narrow line, densest at the centre
      const u = (rand() + rand() + rand()) / 3;
      this.gtx[i] = this.W * (0.08 + 0.84 * u);
      this.gd[i] = rand() * 0.35;
      this.gph[i] = rand() * Math.PI * 2;
    }
  }

  /** Total length of the disintegration, in seconds. */
  get duration() {
    return RELEASE + 2.0;
  }

  showPhoto() {
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.ctx.drawImage(this.img, 0, 0, this.W, this.H);
  }

  /** Render the disintegration `t` seconds after it began. */
  dissolve(t: number) {
    const { W, H, out32 } = this;
    out32.fill(0);
    const n = this.n;
    const ax = 70 * this.scale;
    const ay = -34 * this.scale;
    for (let i = 0; i < n; i++) {
      const age = t - this.tr[i];
      const life = this.life[i];
      if (age >= life) continue;
      let x = this.hx[i];
      let y = this.hy[i];
      let a = 1;
      let block = true;
      if (age < 0) {
        // loosening: a faint shimmer just before the grain lets go
        if (age > -0.22) {
          const j = (age + 0.22) * 4.5;
          x += Math.sin(this.ph[i] + t * 40) * j;
          y += Math.cos(this.ph[i] + t * 37) * j * 0.6;
        }
      } else {
        const turb = this.amp[i] * age;
        x += this.vx[i] * age + 0.5 * ax * age * age + Math.sin(age * this.w1[i] + this.ph[i]) * turb;
        y += this.vy[i] * age + 0.5 * ay * age * age + Math.cos(age * this.w1[i] * 0.8 + this.ph[i]) * turb * 0.7;
        a = age < 0.12 ? 1 : 1 - (age - 0.12) / (life - 0.12);
        a = a * a * (3 - 2 * a);
        block = age < 0.25;
      }
      const xi = x | 0;
      const yi = y | 0;
      if (xi < 0 || yi < 0 || xi >= W - 1 || yi >= H - 1) continue;
      const px = ((a * 255) << 24) | this.col[i];
      const idx = yi * W + xi;
      out32[idx] = px;
      if (block) {
        out32[idx + 1] = px;
        out32[idx + W] = px;
        out32[idx + W + 1] = px;
      }
    }
    this.ctx.putImageData(this.out, 0, 0);
  }

  /** Loose dust gathering into a thin horizontal line through the centre. */
  gather(p: number, t: number) {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    const cy = H / 2;
    const levels = 6;
    const sz = this.scale < 1 ? 1 : 1.5;
    const drift = 7 * this.scale;
    ctx.globalAlpha = Math.min(1, t * 0.8);
    for (let l = 1; l <= levels; l++) {
      ctx.fillStyle = `rgba(255, 214, 168, ${0.12 + (l / levels) * (0.25 + 0.6 * p)})`;
      ctx.beginPath();
      for (let i = l - 1; i < this.gN; i += levels) {
        const q = Math.min(1, Math.max(0, (p - this.gd[i]) / (1 - this.gd[i])));
        const e = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
        const ph = this.gph[i];
        const sx = this.gsx[i] + Math.sin(t * 0.5 + ph) * drift;
        const sy = this.gsy[i] + Math.cos(t * 0.4 + ph * 1.3) * drift - t * 4 * this.scale;
        ctx.rect(sx + (this.gtx[i] - sx) * e, sy + (cy - sy) * e, sz, sz);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
