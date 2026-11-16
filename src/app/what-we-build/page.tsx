import type { Metadata } from "next";
import Link from "next/link";
import WhatWeBuild from "@/components/what-we-build/WhatWeBuild";
import s from "@/components/what-we-build/services.module.css";
import JsonLd from "@/components/seo/JsonLd";
import { buildGraph } from "@/lib/schema";
import { brand, faq, pageMetadata, pages, services } from "@/lib/site";

export const metadata: Metadata = pageMetadata(pages.build);

/**
 * What we build — the homepage's "Born from dust" chapters as a page of their
 * own, followed by the full list of what the studio builds and direct
 * answers to the questions clients ask most.
 */
export default function WhatWeBuildPage() {
  return (
    <main id="main">
      <JsonLd data={buildGraph(pages.build, faq)} />
      <WhatWeBuild headingLevel="h1" />

      <section className={s.services} aria-labelledby="services-title">
        <div className={s.lamp} aria-hidden="true" />
        <div className={s.wrap}>
          <header className={s.head}>
            <p className={s.identifier}>
              <span className={s.rule} aria-hidden="true" />
              Capabilities
            </p>
            <h2 id="services-title" className={`sw-tiles ${s.title}`}>
              Everything we build
            </h2>
            <p className={s.lede}>{brand.description}</p>
          </header>

          <ol className={s.list}>
            {services.map((sv, i) => (
              <li key={sv.id} id={sv.id} className={s.item}>
                <span className={s.no}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={s.name}>{sv.name}</h3>
                <p className={s.desc}>{sv.description}</p>
              </li>
            ))}
          </ol>

          <section className={s.faq} aria-labelledby="faq-title">
            <h2 id="faq-title" className={s.identifier}>
              <span className={s.rule} aria-hidden="true" />
              Questions, answered
            </h2>
            <dl className={s.faqList}>
              {faq.map((q) => (
                <div key={q.question} className={s.faqItem}>
                  <dt className={s.name}>{q.question}</dt>
                  <dd className={s.desc}>{q.answer}</dd>
                </div>
              ))}
            </dl>
          </section>

          <nav className={s.next} aria-label="Continue">
            <Link href="/ventures" className={s.nextLink}>
              <span className={s.nextNo}>03</span> See the ventures we’ve built <span aria-hidden="true">→</span>
            </Link>
            <Link href="/contact" className={s.nextLink}>
              <span className={s.nextNo}>05</span> Start a project <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </div>
      </section>
    </main>
  );
}
