"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import s from "./contact.module.css";
import { contact } from "./content";
import { LIMITS, composeBody, mailtoHref, validate, type Inquiry, type InquiryErrors } from "./inquiry";

const EMPTY: Inquiry = { name: "", email: "", phone: "", build: "", budget: "", details: "" };

/**
 * The inquiry form. Nothing is sent from the site: on a valid submit the
 * visitor's own email app opens with the message drafted (mailto). The
 * feedback says exactly that — it never claims the message was sent.
 */
export default function ContactForm() {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [v, setV] = useState<Inquiry>(EMPTY);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<"idle" | "opening">("idle");
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof Inquiry>(k: K, value: Inquiry[K]) => {
    const next = { ...v, [k]: value };
    setV(next);
    setStatus("idle");
    setCopied(false);
    if (tried) setErrors(validate(next));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    const errs = validate(v);
    setErrors(errs);
    const first = (Object.keys(errs) as (keyof Inquiry)[])[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      setStatus("idle");
      return;
    }
    setStatus("opening");
    window.location.href = mailtoHref(v);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${contact.email}\nSubject: ${contact.subject}\n\n${composeBody(v)}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const err = (k: keyof Inquiry) =>
    errors[k] ? (
      <span id={`${id}-${k}-err`} className={s.error}>
        {errors[k]}
      </span>
    ) : null;
  const a11y = (k: keyof Inquiry) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${id}-${k}-err` : undefined,
    "data-field": k,
  });

  return (
    <form ref={formRef} className={s.form} onSubmit={onSubmit} noValidate aria-label="Project inquiry">
      <div className={s.row2}>
        <label className={s.field}>
          <span className={s.label}>
            Full name <i aria-hidden="true">*</i>
          </span>
          <input
            className={s.input}
            name="name"
            autoComplete="name"
            required
            maxLength={LIMITS.name}
            value={v.name}
            onChange={(e) => set("name", e.target.value)}
            {...a11y("name")}
          />
          {err("name")}
        </label>
        <label className={s.field}>
          <span className={s.label}>
            Email address <i aria-hidden="true">*</i>
          </span>
          <input
            className={s.input}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={LIMITS.email}
            value={v.email}
            onChange={(e) => set("email", e.target.value)}
            {...a11y("email")}
          />
          {err("email")}
        </label>
      </div>

      <div className={s.row2}>
        <label className={s.field}>
          <span className={s.label}>
            Phone number <em>Optional</em>
          </span>
          <input
            className={s.input}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={LIMITS.phone}
            value={v.phone}
            onChange={(e) => set("phone", e.target.value)}
            {...a11y("phone")}
          />
          {err("phone")}
        </label>
        <label className={s.field}>
          <span className={s.label}>
            Estimated budget <em>Optional</em>
          </span>
          <input
            className={s.input}
            name="budget"
            maxLength={LIMITS.budget}
            placeholder="A rough range is fine"
            value={v.budget}
            onChange={(e) => set("budget", e.target.value)}
            {...a11y("budget")}
          />
        </label>
      </div>

      <fieldset className={s.choices} aria-describedby={errors.build ? `${id}-build-err` : undefined}>
        <legend className={s.label}>
          What are you looking to build? <i aria-hidden="true">*</i>
        </legend>
        <div className={s.chips} data-invalid={errors.build ? "" : undefined}>
          {contact.buildOptions.map((o, i) => (
            <label key={o} className={s.chip}>
              <input
                type="radio"
                name="build"
                value={o}
                checked={v.build === o}
                onChange={() => set("build", o)}
                data-field={i === 0 ? "build" : undefined}
              />
              <span>{o}</span>
            </label>
          ))}
        </div>
        {err("build")}
      </fieldset>

      <label className={s.field}>
        <span className={s.label}>
          Tell us about your project <i aria-hidden="true">*</i>
        </span>
        <textarea
          className={`${s.input} ${s.textarea}`}
          name="details"
          rows={5}
          required
          maxLength={LIMITS.details}
          value={v.details}
          onChange={(e) => set("details", e.target.value)}
          {...a11y("details")}
        />
        <span className={s.count} aria-hidden="true">
          {v.details.length} / {LIMITS.details}
        </span>
        {err("details")}
      </label>

      <div className={s.submitRow}>
        <button type="submit" className={s.submit}>
          <span>Draft the email</span>
          <span className={s.submitArrow} aria-hidden="true">
            ↗
          </span>
        </button>
        <p className={s.note}>
          Opens your email app with everything filled in. Nothing is sent until you press send there.
        </p>
      </div>

      <div className={s.status} role="status" aria-live="polite">
        {status === "opening" && (
          <>
            <p>
              <strong>Opening your email app…</strong> Your inquiry is drafted to {contact.email} — review it and press
              send there to reach us.
            </p>
            <p>
              Nothing opened? Write to{" "}
              <a href={`mailto:${contact.email}`} className={s.inline}>
                {contact.email}
              </a>{" "}
              or{" "}
              <button type="button" className={s.inlineBtn} onClick={copy}>
                {copied ? "copied — paste it into any email" : "copy your message"}
              </button>
              .
            </p>
          </>
        )}
      </div>
    </form>
  );
}
