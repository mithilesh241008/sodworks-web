import s from "../ventures.module.css";

/**
 * SR Constructions — an original blueprint study, not a project drawing.
 * Structural grid with lettered/numbered gridlines, a three-bay frame
 * elevation with footings, a stair and a roof truss, dimension lines and a
 * title block. A survey line passes slowly across the sheet.
 */

const W = 800;
const H = 600;
const COLS = [150, 300, 450, 600]; // gridline x
const LEVELS = [470, 360, 250, 140]; // slab y: ground → roof
const LABELS = ["A", "B", "C", "D"];

export default function Blueprint({ className = "" }: { className?: string }) {
  const frame: string[] = [];
  // columns
  for (const x of COLS) frame.push(`M${x - 6} ${LEVELS[0]}V${LEVELS[3]}M${x + 6} ${LEVELS[0]}V${LEVELS[3]}`);
  // slabs and beams
  for (const y of LEVELS.slice(1)) frame.push(`M${COLS[0] - 30} ${y}H${COLS[3] + 30}M${COLS[0] - 30} ${y + 10}H${COLS[3] + 30}`);
  // ground line and footings
  frame.push(`M60 ${LEVELS[0]}H740`);
  for (const x of COLS) frame.push(`M${x - 26} ${LEVELS[0] + 18}h52v22h-52ZM${x - 6} ${LEVELS[0]}v18M${x + 6} ${LEVELS[0]}v18`);
  // stair in the first bay
  let st = `M${COLS[0] + 12} ${LEVELS[0]}`;
  for (let i = 0; i < 8; i++) st += `h${16}v${-13.75}`;
  frame.push(st);
  // roof truss
  const top = LEVELS[3];
  frame.push(`M${COLS[0] - 30} ${top}L375 ${top - 70}L${COLS[3] + 30} ${top}`);
  for (const x of [190, 240, 290, 340, 410, 460, 510, 560]) {
    const yTop = top - 70 * (1 - Math.abs(x - 375) / (375 - (COLS[0] - 30)));
    frame.push(`M${x} ${top}L${x} ${yTop.toFixed(1)}`);
  }
  // bracing in the middle bay
  frame.push(`M${COLS[1] + 6} ${LEVELS[1]}L${COLS[2] - 6} ${LEVELS[2] + 10}M${COLS[2] - 6} ${LEVELS[1]}L${COLS[1] + 6} ${LEVELS[2] + 10}`);

  return (
    <svg
      className={`${s.art} ${s.blueprint} ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="An original blueprint-style study: a structural grid, a three-bay frame elevation with footings, a stair and a roof truss, with dimension lines. A concept illustration, not a project drawing."
    >
      <defs>
        <pattern id="bp-minor" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" className={s.gridMinor} />
        </pattern>
        <pattern id="bp-major" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#bp-minor)" />
          <path d="M100 0H0V100" className={s.gridMajor} />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#bp-major)" />

      {/* gridlines with bubbles */}
      {COLS.map((x, i) => (
        <g key={x}>
          <path className={s.dash} d={`M${x} 46V560`} />
          <circle className={s.bubble} cx={x} cy={34} r={12} />
          <text className={s.bubbleText} x={x} y={38.5} textAnchor="middle">
            {LABELS[i]}
          </text>
        </g>
      ))}
      {LEVELS.map((y, i) => (
        <g key={y}>
          <path className={s.dash} d={`M${COLS[3] + 40} ${y}H748`} />
          <text className={s.anno} x={752} y={y + 4}>
            L{i}
          </text>
        </g>
      ))}

      {/* the frame */}
      {frame.map((d, i) => (
        <path key={i} className={`${s.line} ${s.draw}`} pathLength={1} d={d} />
      ))}

      {/* dimension lines */}
      <path
        className={s.dim}
        d={`M${COLS[0]} 528H${COLS[1]}M${COLS[1]} 528H${COLS[2]}M${COLS[2]} 528H${COLS[3]}M${COLS[0]} 520v16M${COLS[1]} 520v16M${COLS[2]} 520v16M${COLS[3]} 520v16`}
      />
      {[0, 1, 2].map((i) => (
        <text key={i} className={s.anno} x={(COLS[i] + COLS[i + 1]) / 2} y={548} textAnchor="middle">
          BAY {i + 1}
        </text>
      ))}
      <path className={s.dim} d={`M96 ${LEVELS[0]}V${LEVELS[3]}M88 ${LEVELS[0]}h16M88 ${LEVELS[3]}h16`} />
      <text className={s.anno} x={84} y={310} textAnchor="end">
        H
      </text>

      {/* title block */}
      <g className={s.titleBlock}>
        <path className={s.dim} d="M500 552H780V592H500ZM700 552V592" />
        <text className={s.anno} x={510} y={568}>
          SR CONSTRUCTIONS
        </text>
        <text className={s.annoFaint} x={510} y={584}>
          CONCEPT · NOT TO SCALE
        </text>
        <text className={s.anno} x={712} y={576}>
          IN DEV.
        </text>
      </g>

      {/* the survey line */}
      <g className={s.sweep}>
        <path className={s.sweepLine} d={`M0 20V580`} />
      </g>
    </svg>
  );
}
