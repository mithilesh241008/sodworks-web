/**
 * HandsScene — the chrome hand and the human hand, reaching for each other.
 *
 * The reference is one still photograph on a black ground, so it can be
 * taken apart cleanly: everything left of the empty column between the two
 * fingertips is the robotic hand, everything right of it the human hand.
 * The last two segments of each index finger are cut out at their joint
 * (with a feathered seam on the knuckle side) so each finger can flex on its
 * own about that joint. Each arm swings about a shoulder that lies beyond
 * the frame, so the hands travel on arcs rather than sliding.
 *
 * All layers are composited additively ("lighter"): the ground is black, so
 * black adds nothing and the layers can never show a seam or a box. A
 * low-resolution light map multiplied over the frame lets the hands be
 * revealed by light rather than by fading.
 *
 * Coordinates below are in source-image pixels (1600 × 900).
 */

export type HandPose = {
  /** 0 → 1, the reach from apart to touching */
  reach: number;
  /** arm rotation about the shoulder, radians */
  arm: number;
  /** index-finger flex about its joint, radians */
  finger: number;
};

export type SceneState = {
  robot: HandPose;
  human: HandPose;
  /** 0 → 1, light on the hands (1 = the photograph as lit) */
  light: number;
  /** 0 → 1, camera push-in */
  push: number;
  /** warm light at the point of contact (0 → 1+) */
  glow: number;
  /** seconds, for the hands' faint unsteadiness while they travel */
  time: number;
};

const IMG_W = 1600;
const IMG_H = 900;
const SPLIT = 836; // the empty column between the fingertips

type Hand = {
  base: HTMLCanvasElement;
  baseBox: [number, number, number, number]; // the lit part of the body
  tip: HTMLCanvasElement;
  tipBox: [number, number, number, number]; // x, y, w, h
  shoulder: [number, number];
  joint: [number, number];
  fingertip: [number, number];
  /** where the hand starts, relative to its touching position */
  apart: [number, number];
};

// the fingertips meet here, a hair apart
const CONTACT: [number, number] = [838, 433];
const GAP = 1.2;

function rot([x, y]: [number, number], [cx, cy]: [number, number], a: number): [number, number] {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const dx = x - cx;
  const dy = y - cy;
  return [cx + dx * c - dy * s, cy + dx * s + dy * c];
}

export default class HandsScene {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private robot: Hand;
  private human: Hand;
  private lightMap: HTMLCanvasElement;
  private lctx: CanvasRenderingContext2D;
  private vw = 1;
  private vh = 1;
  private dpr = 1;

  constructor(canvas: HTMLCanvasElement, img: HTMLImageElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D unavailable");
    this.ctx = ctx;

    // one clean copy of the photograph with the near-black ground set to 0
    const src = document.createElement("canvas");
    src.width = IMG_W;
    src.height = IMG_H;
    const sctx = src.getContext("2d", { willReadFrequently: true })!;
    sctx.drawImage(img, 0, 0, IMG_W, IMG_H);
    const data = sctx.getImageData(0, 0, IMG_W, IMG_H);
    const d = data.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] + d[i + 1] + d[i + 2] < 12) d[i] = d[i + 1] = d[i + 2] = 0;
    }
    sctx.putImageData(data, 0, 0);

    this.robot = this.cut(src, {
      side: "left",
      // last two segments of the index finger, cut at the middle joint
      tipPoly: [
        [713, 386],
        [748, 381],
        [786, 440],
        [784, 466],
        [757, 470],
        [721, 430],
        [709, 408],
      ],
      joint: [726, 403],
      fingertip: [772, 452],
      shoulder: [-520, 560],
      apart: [-150, 30],
    });
    this.human = this.cut(src, {
      side: "right",
      tipPoly: [
        [884, 368],
        [1032, 368],
        [1032, 438],
        [884, 438],
      ],
      joint: [1030, 404],
      fingertip: [901, 414],
      shoulder: [2150, 360],
      apart: [170, -14],
    });

    this.lightMap = document.createElement("canvas");
    this.lightMap.width = 160;
    this.lightMap.height = 90;
    this.lctx = this.lightMap.getContext("2d")!;
  }

  /** Separate one hand into its body and its index fingertip. */
  private cut(
    src: HTMLCanvasElement,
    o: {
      side: "left" | "right";
      tipPoly: [number, number][];
      joint: [number, number];
      fingertip: [number, number];
      shoulder: [number, number];
      apart: [number, number];
    },
  ): Hand {
    const xs = o.tipPoly.map((p) => p[0]);
    const ys = o.tipPoly.map((p) => p[1]);
    const pad = 4;
    const bx = Math.min(...xs) - pad;
    const by = Math.min(...ys) - pad;
    const bw = Math.max(...xs) - bx + pad;
    const bh = Math.max(...ys) - by + pad;

    // the fingertip mask, feathered so the seam at the joint is invisible
    const mask = document.createElement("canvas");
    mask.width = IMG_W;
    mask.height = IMG_H;
    const m = mask.getContext("2d")!;
    m.filter = "blur(2px)";
    m.fillStyle = "#fff";
    m.beginPath();
    o.tipPoly.forEach(([x, y], i) => (i ? m.lineTo(x, y) : m.moveTo(x, y)));
    m.closePath();
    m.fill();
    m.filter = "none";

    // body: this side of the frame, minus the fingertip, with the arm
    // fading out where the photograph's edge would otherwise show
    const base = document.createElement("canvas");
    base.width = IMG_W;
    base.height = IMG_H;
    const b = base.getContext("2d")!;
    b.drawImage(src, 0, 0);
    b.globalCompositeOperation = "destination-in";
    const g =
      o.side === "left"
        ? b.createLinearGradient(0, 0, SPLIT, 0)
        : b.createLinearGradient(IMG_W, 0, SPLIT, 0);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.07, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,1)");
    b.fillStyle = g;
    if (o.side === "left") b.fillRect(0, 0, SPLIT, IMG_H);
    else b.fillRect(SPLIT, 0, IMG_W - SPLIT, IMG_H);
    b.globalCompositeOperation = "destination-out";
    b.drawImage(mask, 0, 0);

    // only the lit part of the body is drawn each frame
    const bd = b.getImageData(0, 0, IMG_W, IMG_H).data;
    let x0 = IMG_W, y0 = IMG_H, x1 = 0, y1 = 0;
    for (let y = 0; y < IMG_H; y += 2) {
      for (let x = 0; x < IMG_W; x += 2) {
        if (bd[(y * IMG_W + x) * 4 + 3] > 0 && bd[(y * IMG_W + x) * 4] + bd[(y * IMG_W + x) * 4 + 1] > 0) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    x0 = Math.max(0, x0 - 4);
    y0 = Math.max(0, y0 - 4);
    const baseBox: [number, number, number, number] = [x0, y0, Math.min(IMG_W, x1 + 6) - x0, Math.min(IMG_H, y1 + 6) - y0];

    const tip = document.createElement("canvas");
    tip.width = bw;
    tip.height = bh;
    const t = tip.getContext("2d")!;
    t.drawImage(src, bx, by, bw, bh, 0, 0, bw, bh);
    t.globalCompositeOperation = "destination-in";
    t.drawImage(mask, bx, by, bw, bh, 0, 0, bw, bh);

    return {
      base,
      baseBox,
      tip,
      tipBox: [bx, by, bw, bh],
      shoulder: o.shoulder,
      joint: o.joint,
      fingertip: o.fingertip,
      apart: o.apart,
    };
  }

  /** Where the hand's body must sit for its flexed fingertip to touch. */
  private touchOffset(h: Hand, pose: HandPose, toward: number): [number, number] {
    const tipFlexed = rot(h.fingertip, h.joint, pose.finger);
    const tipArmed = rot(tipFlexed, h.shoulder, pose.arm);
    return [CONTACT[0] + toward * GAP - tipArmed[0], CONTACT[1] - tipArmed[1]];
  }

  /** Size the backing store to the element; returns the device-pixel ratio used. */
  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.vw = Math.max(1, r.width);
    this.vh = Math.max(1, r.height);
    // never more pixels than the photograph can fill
    this.dpr = Math.min(window.devicePixelRatio || 1, this.vw < 900 ? 1.5 : 2, (IMG_W * 1.4) / this.vw);
    this.canvas.width = Math.round(this.vw * this.dpr);
    this.canvas.height = Math.round(this.vh * this.dpr);
  }

  /**
   * The framing: the whole photograph on wide screens, cropped about the
   * point of contact on tall ones (720 source pixels across), so on a phone
   * the hands enter from the edges at a readable size.
   */
  private view(push: number) {
    const cover = Math.max(this.vw / IMG_W, this.vh / IMG_H);
    const base = Math.min(cover, this.vw / 720);
    const s = base * (1 + 0.06 * push);
    // centre between the photograph's centre and the contact point
    const fx = IMG_W / 2 + (CONTACT[0] - IMG_W / 2) * (0.6 + 0.4 * push);
    const fy = IMG_H / 2 + (CONTACT[1] - IMG_H / 2) * (0.6 + 0.4 * push);
    return { s, ox: this.vw / 2 - fx * s, oy: this.vh / 2 - fy * s };
  }

  /** The contact point in CSS pixels, for page elements that pick up the light. */
  contactOnScreen(push: number): [number, number] {
    const v = this.view(push);
    return [v.ox + CONTACT[0] * v.s, v.oy + CONTACT[1] * v.s];
  }

  render(st: SceneState) {
    const { ctx, dpr } = this;
    const v = this.view(st.push);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.setTransform(dpr * v.s, 0, 0, dpr * v.s, dpr * v.ox, dpr * v.oy);
    ctx.globalCompositeOperation = "lighter";
    ctx.imageSmoothingQuality = "high";
    this.drawHand(this.robot, st.robot, -1, st.time, 0);
    this.drawHand(this.human, st.human, 1, st.time, 1.7);

    // light: the photograph is revealed by light, not by fading
    if (st.light < 1) {
      const l = this.lctx;
      const k = st.light;
      l.globalCompositeOperation = "source-over";
      l.fillStyle = `rgb(${Math.round(255 * Math.max(0, k * 1.6 - 0.6))} ${Math.round(255 * Math.max(0, k * 1.6 - 0.6))} ${Math.round(255 * Math.max(0, k * 1.6 - 0.6))})`;
      l.fillRect(0, 0, 160, 90);
      l.globalCompositeOperation = "lighter";
      const spot = (x: number, y: number, r: number, a: number) => {
        const g = l.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(255,255,255,${a})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        l.fillStyle = g;
        l.fillRect(0, 0, 160, 90);
      };
      // one light from above-left on the chrome, one from above-right on the skin
      spot(46 + 14 * k, 30, 20 + 60 * k, Math.min(1, k * 1.5));
      spot(118 - 10 * k, 38, 18 + 58 * k, Math.min(1, k * 1.5 - 0.15));
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(this.lightMap, 0, 0, IMG_W, IMG_H);
    }

    // the touch: a small warm light where the fingertips meet
    if (st.glow > 0) {
      ctx.globalCompositeOperation = "lighter";
      const [cx, cy] = CONTACT;
      const gl = st.glow;
      const r = 10 + 160 * gl;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(255, 228, 192, ${Math.min(0.9, gl * 1.2)})`);
      g.addColorStop(0.1, `rgba(255, 196, 136, ${Math.min(0.4, gl * 0.55)})`);
      g.addColorStop(0.4, `rgba(224, 140, 80, ${Math.min(0.12, gl * 0.16)})`);
      g.addColorStop(1, "rgba(203, 120, 60, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  private drawHand(h: Hand, pose: HandPose, toward: number, time: number, phase: number) {
    const { ctx } = this;
    const touch = this.touchOffset(h, pose, toward);
    const away = 1 - pose.reach;
    // a living hand is never perfectly still while it moves; settles at contact
    const tremor = away * away;
    const dx = touch[0] + h.apart[0] * away + Math.sin(time * 0.9 + phase) * 2.2 * tremor;
    const dy = touch[1] + h.apart[1] * away + Math.sin(time * 0.7 + phase * 1.3) * 3 * tremor;

    ctx.save();
    ctx.translate(dx, dy);
    ctx.translate(h.shoulder[0], h.shoulder[1]);
    ctx.rotate(pose.arm);
    ctx.translate(-h.shoulder[0], -h.shoulder[1]);
    const [x, y, w, hh] = h.baseBox;
    ctx.drawImage(h.base, x, y, w, hh, x, y, w, hh);
    ctx.translate(h.joint[0], h.joint[1]);
    ctx.rotate(pose.finger);
    ctx.translate(-h.joint[0], -h.joint[1]);
    const [bx, by] = h.tipBox;
    ctx.drawImage(h.tip, bx, by);
    ctx.restore();
  }
}
