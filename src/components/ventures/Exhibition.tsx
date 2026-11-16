import Link from "next/link";
import s from "./ventures.module.css";
import { ventures } from "./data";
import VentureVisual from "./VentureVisual";

/**
 * The horizontal venture exhibition. Markup works on its own as a native
 * horizontal, snap-scrolling track (touch screens, reduced motion, no JS);
 * on large screens ExhibitionMotion pins it and drives it with the scroll.
 */
export default function Exhibition() {
  const total = String(ventures.length).padStart(2, "0");
  return (
    <section className={s.exhibition} aria-label="The venture collection" data-exhibition>
      <div className={s.viewport} data-viewport>
        <ol className={s.track} data-track>
          {ventures.map((v, i) => (
            <li
              key={v.slug}
              id={`venture-${v.slug}`}
              className={`${s.panel} ${i % 2 ? s.panelFlip : ""} ${s[`tone_${v.tone}`]}`}
              data-panel
              aria-label={`${v.index} of ${total}: ${v.name}`}
            >
              <div className={s.panelText} data-panel-text>
                <p className={s.panelIndex} data-rise>
                  <span>{v.index}</span>
                  <span className={s.panelIndexOf}>/ {total}</span>
                  <span className={s.panelCategory}>{v.category}</span>
                </p>
                <h2 className={s.ventureName}>
                  {v.nameLines.map((line) => (
                    <span key={line} className={s.lineMask}>
                      <span className={`sw-tiles ${s.nameLine}`} data-line>
                        {line}
                      </span>
                    </span>
                  ))}
                </h2>
                <p className={s.panelDesc} data-rise>
                  {v.description}
                </p>
                <div className={s.panelActions} data-rise>
                  {v.status === "in-development" ? (
                    <span className={s.statusPill}>In development</span>
                  ) : (
                    <span className={`${s.statusPill} ${s.statusLive}`}>Live</span>
                  )}
                  <Link href={`/ventures/${v.slug}`} className={s.explore}>
                    Explore project <span aria-hidden="true">↗</span>
                    <span className="sr-only">: {v.name}</span>
                  </Link>
                </div>
              </div>

              <Link
                href={`/ventures/${v.slug}`}
                className={s.panelVisual}
                tabIndex={-1}
                aria-hidden="true"
                data-panel-visual
              >
                <VentureVisual
                  venture={v}
                  sizes={{ primary: "(max-width: 899px) 86vw, 46vw", secondary: "(max-width: 899px) 50vw, 26vw" }}
                  preload={i === 0}
                />
              </Link>
            </li>
          ))}
        </ol>
      </div>

      {/* Position in the collection; each mark jumps to its venture. */}
      <nav className={s.progress} aria-label="Ventures in the collection" data-progress>
        <span className={s.progressTrack} aria-hidden="true">
          <span className={s.progressFill} data-progress-fill />
        </span>
        <ol>
          {ventures.map((v, i) => (
            <li key={v.slug}>
              <a
                href={`#venture-${v.slug}`}
                className={s.progressMark}
                data-progress-mark={i}
                data-active={i === 0 || undefined}
              >
                <span className={s.progressNo}>{v.index}</span>
                <span className={s.progressName}>{v.name}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}
