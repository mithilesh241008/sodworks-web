import type { Metadata } from "next";
import { pageMetadata, pages } from "@/lib/site";
import JsonLd from "@/components/seo/JsonLd";
import { contactGraph } from "@/lib/schema";
import s from "@/components/contact/contact.module.css";
import ContactMotion from "@/components/contact/ContactMotion";
import ContactForm from "@/components/contact/ContactForm";
import { contact } from "@/components/contact/content";

export const metadata: Metadata = pageMetadata(pages.contact);

export default function ContactPage() {
  return (
    <ContactMotion className={s.page}>
      <main id="main">
        <JsonLd data={contactGraph(pages.contact)} />
        {/* Scenes 01–03: the connection */}
        <div className={s.opening} data-opening>
          <canvas className={s.hands} data-hands aria-hidden="true" />
          <div className={s.dawn} data-dawn aria-hidden="true" />
          <button type="button" className={s.skip} data-skip>
            Skip intro
          </button>
        </div>

        {/* Scene 04: the page */}
        <section className={s.contact} aria-labelledby="contact-title">
          <div className={s.lamp} aria-hidden="true" />
          <div className={s.wrap}>
            <div className={s.grid}>
              <div className={s.intro}>
                <p className={s.identifier} data-rise>
                  <span className={s.rule} aria-hidden="true" />
                  {contact.identifier}
                </p>
                <h1 id="contact-title" className={s.headline}>
                  {contact.headline.map((line) => (
                    <span key={line} className={`sw-tiles ${s.headLine}`} data-rise>
                      {line}
                    </span>
                  ))}
                </h1>
                <p className={s.supporting} data-rise>
                  {contact.supporting}
                </p>

                <dl className={s.direct} data-rise>
                  <div>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${contact.email}`} className={s.directLink}>
                        {contact.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd className={s.phones}>
                      {contact.phones.map((p) => (
                        <a key={p.tel} href={`tel:${p.tel}`} className={s.directLink}>
                          {p.display}
                        </a>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className={s.formCol} data-rise>
                <h2 className={s.formTitle}>Start a project</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <noscript>
        <style>{`[data-opening]{display:none!important}`}</style>
      </noscript>
    </ContactMotion>
  );
}
