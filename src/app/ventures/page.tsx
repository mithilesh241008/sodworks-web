import type { Metadata } from "next";
import { pageMetadata, pages } from "@/lib/site";
import JsonLd from "@/components/seo/JsonLd";
import { venturesGraph } from "@/lib/schema";
import { ventures } from "@/components/ventures/data";
import s from "@/components/ventures/ventures.module.css";
import Exhibition from "@/components/ventures/Exhibition";
import ExhibitionMotion from "@/components/ventures/ExhibitionMotion";

export const metadata: Metadata = pageMetadata(pages.ventures);

export default function VenturesPage() {
  return (
    <ExhibitionMotion className={s.page}>
      <main id="main">
        <JsonLd data={venturesGraph(pages.ventures, ventures)} />
        <section className={s.intro} aria-labelledby="ventures-title">
          <div className={s.introLamp} aria-hidden="true" />
          <div className={s.wrap}>
            <p className={s.identifier} data-intro-id>
              <span className={s.identifierRule} aria-hidden="true" />
              03 / The venture collection
            </p>
            <h1 id="ventures-title" className={s.introTitle}>
              <span className={s.lineMask}>
                <span className={`sw-tiles ${s.introLine}`} data-intro-line>
                  Our
                </span>
              </span>
              <span className={s.lineMask}>
                <span className={`sw-tiles ${s.introLine}`} data-intro-line>
                  Ventures
                </span>
              </span>
            </h1>
            <p className={s.introStatement} data-intro-fade>
              Different industries. Different ambitions. One engineering studio.
            </p>
            <p className={s.introCue} data-intro-fade aria-hidden="true">
              <span className={s.cueLine} />
              Scroll to enter the exhibition
            </p>
          </div>
        </section>

        <Exhibition />

      </main>
    </ExhibitionMotion>
  );
}
