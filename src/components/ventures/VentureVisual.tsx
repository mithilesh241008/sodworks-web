import Image from "next/image";
import s from "./ventures.module.css";
import type { Venture } from "./data";
import Blueprint from "./art/Blueprint";
import Weave from "./art/Weave";

/**
 * A venture's visual stage. Photographed ventures compose their two supplied
 * images according to their personality; ventures in development show their
 * own logo where supplied, otherwise an original study artwork. Motion hooks (data-*) are animated by the page
 * that hosts the stage; without motion the composition is complete as is.
 */
export default function VentureVisual({
  venture,
  sizes,
  preload = false,
}: {
  venture: Venture;
  sizes: { primary: string; secondary: string };
  preload?: boolean;
}) {
  const v = venture;
  if (!v.images && v.logo) {
    return (
      <div className={`${s.visual} ${s[`tone_${v.tone}`]}`} data-visual>
        <figure className={`${s.artFrame} ${s.logoFrame}`} data-reveal>
          <div className={s.logoCard}>
            <Image
              src={v.logo.src}
              alt={v.logo.alt}
              fill
              sizes="(max-width: 899px) 70vw, 42vw"
              preload={preload}
              quality={90}
              className={s.img}
            />
          </div>
        </figure>
        <span className={s.statusTag}>In development · {v.name} logo</span>
      </div>
    );
  }
  if (!v.images) {
    return (
      <div className={`${s.visual} ${s[`tone_${v.tone}`]}`} data-visual>
        <div className={s.artFrame} data-reveal>
          {v.tone === "blueprint" ? <Blueprint /> : <Weave />}
        </div>
        <span className={s.statusTag}>In development · concept study</span>
      </div>
    );
  }
  const [a, b] = v.images;
  return (
    <div className={`${s.visual} ${s[`tone_${v.tone}`]}`} data-visual>
      <figure className={`${s.photo} ${s.primary}`} data-reveal>
        <div className={s.photoInner} data-drift>
          <Image src={a.src} alt={a.alt} fill sizes={sizes.primary} preload={preload} className={s.img} />
        </div>
        <span className={s.photoShade} aria-hidden="true" />
      </figure>
      <figure className={`${s.photo} ${s.secondary}`} data-reveal data-reveal-delay="0.18">
        <div className={s.photoInner} data-drift>
          <Image src={b.src} alt={b.alt} fill sizes={sizes.secondary} className={s.img} />
        </div>
        <span className={s.photoShade} aria-hidden="true" />
      </figure>
      {v.tone === "luxe" && <span className={s.archLine} aria-hidden="true" />}
      <span className={s.figNote} aria-hidden="true">
        Fig. {v.index}a · {v.index}b
      </span>
    </div>
  );
}
