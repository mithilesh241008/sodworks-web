/**
 * The inquiry: validation and the mailto: it becomes. Pure functions, so the
 * encoding can be checked on its own.
 */
import { contact } from "./content";

export type Inquiry = {
  name: string;
  email: string;
  phone: string;
  build: string;
  budget: string;
  details: string;
};

export type InquiryErrors = Partial<Record<keyof Inquiry, string>>;

export const LIMITS = { name: 80, email: 120, phone: 24, budget: 60, details: 1500 } as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ()-]{7,20}$/;

export function validate(v: Inquiry): InquiryErrors {
  const e: InquiryErrors = {};
  if (v.name.trim().length < 2) e.name = "Please tell us your name.";
  if (!v.email.trim()) e.email = "We’ll need an email address to reply to.";
  else if (!EMAIL.test(v.email.trim())) e.email = "That email address doesn’t look complete.";
  if (v.phone.trim() && (!PHONE.test(v.phone.trim()) || v.phone.replace(/\D/g, "").length < 7))
    e.phone = "Use digits only, with an optional + and country code.";
  if (!v.build) e.build = "Choose what you’re looking to build.";
  if (v.details.trim().length < 10) e.details = "A sentence or two about the project, please.";
  return e;
}

export function composeBody(v: Inquiry): string {
  const line = (label: string, value: string) => `${label}: ${value.trim() || "Not provided"}`;
  return [
    "New project inquiry — SODWORKS",
    "",
    line("Name", v.name),
    line("Email", v.email),
    line("Phone", v.phone),
    line("Looking to build", v.build),
    line("Estimated budget", v.budget),
    "",
    "About the project:",
    v.details.trim(),
    "",
    "—",
    "Sent from the contact form on the SODWORKS website.",
  ].join("\n");
}

/** RFC 6068: CRLF line breaks, every field percent-encoded. */
export function mailtoHref(v: Inquiry): string {
  const enc = (s: string) => encodeURIComponent(s.replace(/\r?\n/g, "\r\n"));
  return `mailto:${contact.email}?subject=${enc(contact.subject)}&body=${enc(composeBody(v))}`;
}
