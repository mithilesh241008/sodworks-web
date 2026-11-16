import s from "../ventures.module.css";

/**
 * Sri Sowdambika — an original textile study, not a photograph.
 * A true plain weave (each thread passes over, then under, its neighbours),
 * a zig-zag selvedge, and a lozenge motif woven into the centre. Warm light
 * moves across it slowly, like cloth turned under a lamp.
 */

const W = 800;
const H = 600;
const PITCH = 20;
const X0 = 70;
const Y0 = 60;
const NX = 34; // warp threads
const NY = 25; // weft threads

/** Is this crossing part of the central lozenge motif? */
function inMotif(i: number, j: number) {
  const cx = (NX - 1) / 2;
  const cy = (NY - 1) / 2;
  const d = Math.abs(i - cx) + Math.abs(j - cy) * 1.15;
  return (d > 5.5 && d < 7.5) || (d > 10.5 && d < 11.8) || d < 1.6;
}

export default function Weave({ className = "" }: { className?: string }) {
  const warp: string[] = [];
  const weft: string[] = [];
  const motif: string[] = [];
  // Draw each thread as short segments between crossings, leaving a gap
  // where the crossing thread passes over it.
  for (let i = 0; i < NX; i++) {
    const x = X0 + i * PITCH;
    for (let j = 0; j < NY - 1; j++) {
      const y = Y0 + j * PITCH;
      const warpOver = (i + j) % 2 === 0;
      const seg = warpOver ? `M${x} ${y - 3}V${y + PITCH - 3}` : `M${x} ${y + 4}V${y + PITCH - 4}`;
      (inMotif(i, j) ? motif : warp).push(seg);
    }
  }
  for (let j = 0; j < NY; j++) {
    const y = Y0 + j * PITCH;
    for (let i = 0; i < NX - 1; i++) {
      const x = X0 + i * PITCH;
      const weftOver = (i + j) % 2 === 1;
      const seg = weftOver ? `M${x - 3} ${y}H${x + PITCH - 3}` : `M${x + 4} ${y}H${x + PITCH - 4}`;
      (inMotif(i, j) ? motif : weft).push(seg);
    }
  }
  // zig-zag selvedge, top and bottom
  let zz = "";
  for (const yy of [Y0 - 26, Y0 + (NY - 1) * PITCH + 26]) {
    zz += `M${X0 - 10} ${yy}`;
    for (let k = 0; k < NX; k++) zz += `l10 ${k % 2 ? 7 : -7}l10 ${k % 2 ? -7 : 7}`;
  }

  return (
    <svg
      className={`${s.art} ${s.weave} ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="An original textile study: a plain weave of warp and weft threads with a woven lozenge motif and zig-zag selvedge. A concept illustration, not a photograph."
    >
      <defs>
        <radialGradient id="weave-lamp" cx="50%" cy="48%" r="60%">
          <stop offset="0%" stopColor="rgb(255 190 120)" stopOpacity="0.16" />
          <stop offset="60%" stopColor="rgb(255 170 100)" stopOpacity="0.04" />
          <stop offset="100%" stopColor="rgb(255 170 100)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="weave-sheen" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="rgb(255 210 160)" stopOpacity="0" />
          <stop offset="0.5" stopColor="rgb(255 210 160)" stopOpacity="0.14" />
          <stop offset="1" stopColor="rgb(255 210 160)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#weave-lamp)" />
      <path className={s.thread} d={warp.join("")} />
      <path className={s.threadWeft} d={weft.join("")} />
      <path className={s.threadMotif} d={motif.join("")} />
      <path className={s.selvedge} d={zz} />
      <text className={s.anno} x={X0 - 10} y={H - 14}>
        WARP · WEFT · PLAIN WEAVE
      </text>
      <text className={s.anno} x={W - 60} y={H - 14} textAnchor="end">
        CONCEPT · IN DEVELOPMENT
      </text>
      <rect className={s.sheen} x={-300} y={0} width={300} height={H} fill="url(#weave-sheen)" />
    </svg>
  );
}
