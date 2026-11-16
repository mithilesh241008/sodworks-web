import Image from "next/image";
import s from "./whatWeBuild.module.css";
import DustMotion from "./DustMotion";
import { chapters, page, type Chapter } from "./content";

/**
 * PAGE 02 — WHAT WE BUILD · "Born from dust".
 * One halftone image, rebuilt from particles sampled from the image itself,
 * held on the left while two chapters pass on the right. Between chapters a
 * wave of dust moves through the image and settles; at the end the image
 * lets go into the dark.
 */
export default function WhatWeBuild({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" } = {}) {
  const { image } = page;
  const Heading = headingLevel;
  return (
    <DustMotion className={s.page}>
      <section id="what-we-build" className={s.chapters} aria-labelledby="wwb-label" data-chapters>
        <div className={s.stage}>
          <div className={s.wrap}>
            <header className={s.stageHead} data-stage-head>
              <Heading id="wwb-label" className={s.identifier}>
                {page.label.toUpperCase()}
                <span className={s.cursor} aria-hidden="true">
                  _
                </span>
              </Heading>
              <div className={s.progress} aria-hidden="true">
                <span data-count="products">01</span>
                <span className={s.track}>
                  <span className={s.trackFill} data-progress />
                </span>
                <span data-count="systems">02</span>
              </div>
            </header>

            <div className={s.grid}>
              <figure className={s.visual} data-visual>
                <div
                  className={s.imageBox}
                  data-image-box
                  style={{ aspectRatio: `${image.crop.w} / ${image.crop.h}` }}
                >
                  {/* Shown only when the particles cannot run: the original
                      image, framed to the same crop. */}
                  <Image
                    className={s.fallback}
                    src={image.src}
                    alt=""
                    width={image.width}
                    height={image.height}
                    sizes="(max-width: 1023px) 120vw, 62vw"
                    preload={headingLevel === "h1"}
                    aria-hidden="true"
                    style={{
                      width: `${(image.width / image.crop.w) * 100}%`,
                      left: `${(-image.crop.x / image.crop.w) * 100}%`,
                      top: `${(-image.crop.y / image.crop.h) * 100}%`,
                    }}
                  />
                  <span
                    className={s.glow}
                    data-glow
                    aria-hidden="true"
                    style={{ left: `${image.orb.x * 100}%`, top: `${image.orb.y * 100}%` }}
                  />
                </div>
                <canvas className={s.canvas} data-canvas role="img" aria-label={image.alt} />
              </figure>

              <div className={s.texts}>
                {chapters.map((ch) => (
                  <ChapterText key={ch.id} ch={ch} level={headingLevel === "h1" ? "h2" : "h3"} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </DustMotion>
  );
}

function ChapterText({ ch, level: Level }: { ch: Chapter; level: "h2" | "h3" }) {
  const headingId = `wwb-${ch.id}`;
  return (
    <article className={s.textCell} data-text={ch.id} aria-labelledby={headingId}>
      <p className={s.category} data-fade>
        <span className={s.categoryRule} aria-hidden="true" />
        {ch.category}
      </p>
      <Level id={headingId} className={s.heading}>
        {ch.headingLines.map((line) => (
          <span key={line} className={s.mask}>
            <span data-line>{line}</span>
          </span>
        ))}
      </Level>
      <p className={s.desc} data-fade>
        {ch.description}
      </p>
      <ul className={s.caps} data-fade aria-label={`${ch.category.split("/ ")[1]} capabilities`}>
        {ch.capabilities.map((c, i) => (
          <li key={c}>
            <span className={s.capKey}>{String.fromCharCode(97 + i)}.</span>
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
