import type { Metadata } from "next";
import { brand, pageMetadata, pages } from "@/lib/site";
import JsonLd from "@/components/seo/JsonLd";
import { studioGraph } from "@/lib/schema";
import Image from "next/image";
import s from "@/components/studio/studio.module.css";
import StudioMotion from "@/components/studio/StudioMotion";
import { studio } from "@/components/studio/content";

export const metadata: Metadata = pageMetadata(pages.studio);

/** A paragraph with the founding date picked out. */
function withAccent(text: string, accent: string) {
  const at = text.indexOf(accent);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className={s.accent}>{accent}</span>
      {text.slice(at + accent.length)}
    </>
  );
}

export default function StudioPage() {
  const { photo, workstation, story, founders } = studio;
  return (
    <StudioMotion className={s.page}>
      <main id="main">
        <JsonLd data={studioGraph(pages.studio)} />
        {/* Scenes 01–04: the founders, their dust, the title, the beam */}
        <div className={s.opening} data-opening>
          <div className={s.stage} data-stage aria-hidden="true">
            <canvas className={s.canvas} data-canvas />
            <div className={s.warm} data-warm />
          </div>
          <div className={s.veil} data-veil aria-hidden="true" />
          <div className={s.titleWrap}>
            <p className={s.titleId} data-title-id>
              {studio.identifier}
            </p>
            <h1 className={s.title} data-title>
              {studio.title}
            </h1>
          </div>
        </div>
        <div className={s.beam} data-beam aria-hidden="true" />

        {/* The founding story */}
        <section className={s.story} data-story aria-label="Our story">
          <div className={s.storyLamp} aria-hidden="true" />
          <div className={s.wrap}>
            <div className={s.storyGrid}>
              <figure className={s.art} data-story-art>
                <Image
                  src={workstation.src}
                  alt={workstation.alt}
                  width={workstation.width}
                  height={workstation.height}
                  sizes="(max-width: 899px) 100vw, 54vw"
                  quality={90}
                  preload
                  className={s.artImg}
                />
              </figure>
              <div className={s.storyCopy}>
                <h2 className={s.lead}>
                  {story.lead.map((line, i) => (
                    <span key={line} className={`sw-tiles ${s.leadLine} ${i ? s.leadLineWarm : ""}`} data-story-line>
                      {line}
                    </span>
                  ))}
                </h2>
                <div className={s.storyText}>
                  {story.paragraphs.map((p) => (
                    <p key={p} data-story-line>
                      {withAccent(p, story.accent)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The founders, left to right */}
        <section className={s.crewSection} aria-labelledby="founders-label">
          <div className={s.wrap}>
            <h2 id="founders-label" className={s.identifier}>
              <span className={s.rule} aria-hidden="true" />
              The founders
            </h2>
            <p className={s.crewIntro}>
              {brand.name} was founded on <span className={s.accent}>{brand.foundingDateDisplay}</span> by three
              co-founders.
            </p>
          </div>
          <figure className={s.crew} data-crew>
            <div className={s.crewFrame}>
              <div className={s.crewPhoto}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 899px) 100vw, min(1280px, 88vw)"
                  quality={90}
                  className={s.crewImg}
                />
              </div>
              {/* the name plates over the photograph (the roster below carries the same names for assistive tech) */}
              <ol className={s.tags} aria-hidden="true">
                {founders.map((f, i) => (
                  <li
                    key={f.name}
                    className={s.tag}
                    style={{ left: `${f.head.x * 100}%`, top: `${f.head.y * 100}%`, ["--i" as string]: i }}
                  >
                    <span className={s.plate}>
                      <span className={s.slot} aria-hidden="true">
                        {f.slot}
                      </span>
                      <span className={s.name}>{f.name}</span>
                    </span>
                    <span className={s.stem} aria-hidden="true" />
                  </li>
                ))}
              </ol>
            </div>
          </figure>

          {/* each founder's identity — linkable as /studio#<founder> */}
          <ul className={s.roster}>
            {founders.map((f) => (
              <li key={f.id} id={f.id} className={s.member}>
                <span className={s.memberSlot} aria-hidden="true">
                  {f.slot}
                </span>
                <h3 className={s.memberName}>{f.name}</h3>
                <p className={s.memberRole}>
                  {f.role}
                  <span className={s.memberKind}>Technology Studio</span>
                </p>
              </li>
            ))}
          </ul>
        </section>

      </main>
      <noscript>
        <style>{`[data-opening],[data-beam]{display:none!important}[data-story]{clip-path:none!important}`}</style>
      </noscript>
    </StudioMotion>
  );
}
