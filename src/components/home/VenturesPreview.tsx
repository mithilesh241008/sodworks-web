import Image from "next/image";
import s from "./venturesPreview.module.css";
import { ventures } from "@/components/ventures/data";
import PreviewMotion from "./PreviewMotion";
import LaunchCta from "./LaunchCta";

const FEATURED = ["akram-perfumes", "dope-culture", "beast-muscle"];

/**
 * Homepage — OUR VENTURES. A short, composed preview: three of the ventures
 * hung like works on an exhibition wall, and the way into the archive.
 */
export default function VenturesPreview() {
  const featured = FEATURED.map((slug) => ventures.find((v) => v.slug === slug)!).filter((v) => v.images);
  return (
    <PreviewMotion className={s.section}>
      <section id="our-ventures" aria-labelledby="home-ventures-title">
        <div className={s.lamp} aria-hidden="true" />
        <div className={s.wrap}>
          <div className={s.copy}>
            <p className={s.identifier} data-pv-rise>
              <span className={s.rule} aria-hidden="true" />
              03 / Our ventures
            </p>
            <h2 id="home-ventures-title" className={s.title}>
              <span className={s.lineMask}>
                <span className={`sw-tiles ${s.titleLine}`} data-pv-line>
                  Our
                </span>
              </span>
              <span className={s.lineMask}>
                <span className={`sw-tiles ${s.titleLine}`} data-pv-line>
                  Ventures.
                </span>
              </span>
            </h2>
            <p className={s.statement} data-pv-rise>
              Different industries. Different ambitions. Connected by the way we build.
            </p>
            <div className={s.ctaSlot} data-pv-rise>
              <LaunchCta href="/ventures" label="Enter the venture archive" />
            </div>
          </div>

          <div className={s.wall} aria-label="Featured ventures">
            {featured.map((v, i) => {
              const img = v.images![0];
              return (
                <figure key={v.slug} className={`${s.work} ${s[`work${i}`]}`} data-pv-work data-speed={[-40, 30, -18][i]}>
                  <div className={s.frame} data-pv-mask>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 899px) 60vw, 26vw"
                      className={`${s.img} ${s[`grade_${v.tone}`]}`}
                    />
                    {v.tone !== "editorial" && <span className={s.shade} aria-hidden="true" />}
                  </div>
                  <figcaption className={s.label}>
                    <span className={s.labelNo}>{v.index}</span>
                    <span className={s.labelName}>{v.name}</span>
                    <span className={s.labelCat}>{v.category}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>
    </PreviewMotion>
  );
}
