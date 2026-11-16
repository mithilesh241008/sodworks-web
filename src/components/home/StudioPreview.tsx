import Image from "next/image";
import shared from "./venturesPreview.module.css";
import s from "./studioPreview.module.css";
import PreviewMotion from "./PreviewMotion";
import LaunchCta from "./LaunchCta";
import { studio } from "@/components/studio/content";

/**
 * Homepage — a glimpse of the studio, after OUR VENTURES: the founders at
 * their table, a line about them, and the way into /studio. The studio page
 * itself tells the full story; this only introduces it.
 */
export default function StudioPreview() {
  const art = studio.illustration;
  return (
    <PreviewMotion className={`${shared.section} ${s.root}`}>
      <section id="the-studio" className={s.section} aria-labelledby="home-studio-title">
        <div className={s.lamp} aria-hidden="true" />
        <div className={s.wrap}>
          <figure className={s.art} data-pv-work data-speed="-16">
            <div className={s.frame} data-pv-mask>
              <Image
                src={art.src}
                alt={art.alt}
                fill
                sizes="(max-width: 899px) 100vw, 54vw"
                className={s.img}
              />
            </div>
          </figure>

          <div className={s.copy}>
            <p className={shared.identifier} data-pv-rise>
              <span className={shared.rule} aria-hidden="true" />
              04 / The studio
            </p>
            <h2 id="home-studio-title" className={shared.title}>
              <span className={shared.lineMask}>
                <span className={`sw-tiles ${s.titleLine}`} data-pv-line>
                  Behind the
                </span>
              </span>
              <span className={shared.lineMask}>
                <span className={`sw-tiles ${s.titleLine} ${s.titleWarm}`} data-pv-line>
                  build.
                </span>
              </span>
            </h2>
            <p className={shared.statement} data-pv-rise>
              Three co-founders. One shared ambition. Discover the people and story behind SODWORKS.
            </p>
            <div className={shared.ctaSlot} data-pv-rise>
              <LaunchCta href="/studio" label="Enter our studio" arrow="right" />
            </div>
          </div>
        </div>
      </section>
    </PreviewMotion>
  );
}
