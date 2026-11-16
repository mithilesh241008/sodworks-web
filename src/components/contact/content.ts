/** Copy and facts for /contact and the site footer. */
import { brand } from "@/lib/site";

export const contact = {
  email: brand.email,
  phones: brand.phones,
  identifier: "05 / Contact",
  headline: ["Let’s build", "something."],
  supporting: "Have an idea, a challenge, or something worth building? We’d like to hear about it.",
  subject: "New Project Inquiry — SODWORKS",
  hands: {
    src: "/images/contact/hands.jpg",
    width: 1600,
    height: 900,
  },
  buildOptions: [
    "Website / Digital Experience",
    "E-commerce",
    "Business Systems",
    "AI / Automation",
    "Custom Software",
    "Something Else",
  ],
} as const;
