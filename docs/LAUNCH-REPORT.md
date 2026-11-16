# SODWORKS — Production Launch Engineering Report

Date: 15 November 2026 · Target: https://www.sodworks.in · Stack: Next.js 16.4.5 (App Router, Cache Components, Turbopack), React 19.3, GSAP

All results below come from tests actually run against a local **production build** (`next build` + `next start`) configured with `NEXT_PUBLIC_SITE_URL=https://www.sodworks.in`. Nothing was deployed and no domain or DNS setting was changed.

Legend: **PASS** · **WARNING** · **FAIL** · **NOT TESTED**

---

## Launch readiness verdict

**Ready to launch, with warnings.** There are no FAIL items in code, build, security or SEO. The open warnings are:
- Homepage mobile LCP, which is caused by the approved cinematic intro.
- Two content inputs needed from you.
- One deployment setting to confirm.

Before going live:
1. Deploy to Vercel production (indexable automatically), or set `NEXT_PUBLIC_SITE_URL=https://www.sodworks.in` on any other host.
2. Point the domain at the deployment. `www.sodworks.in` currently serves a registrar parking page (`/lander`).
3. Redirect `sodworks.in` to `www.sodworks.in` in the host's domain settings.

---

## 1. SEO improvements implemented

| Item | Status |
| --- | --- |
| Canonical domain `https://www.sodworks.in` built in (`src/lib/site.ts → productionUrl`). Previews and staging still get noindex. | PASS |
| Homepage title and description updated to the suggested copy | PASS |
| What We Build title and description now target web, ecommerce, software and AI development plus location | PASS |
| Ventures, Studio and Contact descriptions now carry India, Chennai and Madurai relevance (titles unchanged) | PASS |
| Unique title and description on all 10 indexable routes (0 duplicates) | PASS |
| Canonical, Open Graph (title, description, image) and Twitter `summary_large_image` on every route | PASS |
| `robots: index, follow` on every indexable route | PASS |
| **Fixed:** unknown venture URLs (e.g. `/ventures/anything`) returned **HTTP 200** (a soft 404). They now return a real **404** via `src/proxy.ts`. | PASS |
| One H1 per page; logical H2/H3 order; semantic `header`, `main`, `section`, `nav` and `footer` | PASS |
| Every `<img>` has alt text; decorative layers are `alt=""` / `aria-hidden` | PASS |
| Every link has descriptive text; the skip link reaches `#main` | PASS |
| **Fixed:** the Beast Muscle website link (`https://www.thebeastmuscle.in`) failed with a TLS certificate mismatch. It now points to `https://thebeastmuscle.in`, which serves "The Beast Muscle". | PASS |
| The homepage's visually hidden H1 now reads "an independent technology and product-building studio in India" | PASS |

**Internal linking.** The nav and footer link every section on every page with descriptive text.
- The homepage links to Ventures ("Enter the venture archive") and the Studio ("Enter our studio").
- What We Build links to Ventures and Contact.
- Each venture page links back to the collection and to the next venture.
- No links were added to the approved compositions.

**Image SEO**
- Images are served via `next/image` as AVIF/WebP at responsive sizes.
- The hero painting is preloaded and never lazy-loaded.
- Below-the-fold images are lazy.
- Filenames are descriptive (e.g. `sr-constructions-logo.jpg`, `studio-workstation.jpg`).

## 2. GEO improvements implemented

- **One identity sentence everywhere** (metadata, JSON-LD, `llms.txt`, services page): "SODWORKS is an independent technology and product-building studio based in India, developing custom digital experiences, ecommerce systems, software products and AI-powered applications."
- **Services clarified:**
  - "AI Integration" is now named **AI-Powered Applications**.
  - Website Development now covers custom web applications built on Next.js and React (true of this site).
- **Direct answers:** a new "Questions, answered" block on `/what-we-build`, also marked up as `FAQPage`:
  - What does SODWORKS build?
  - Is SODWORKS a digital marketing agency? (No.)
  - Where does SODWORKS work?
  - What has it built?
  - How do I start a project?

  It uses the page's existing type and colour tokens.
- **`/llms.txt`** now includes:
  - The website, "based in India" and the geographic focus.
  - Services, founders and ventures with links.
  - The official contact details, the FAQ and important routes.
  - An explicit "not a digital marketing, SEO or advertising agency" line.

  It makes no claims about guaranteed indexing.
- **robots.txt** explicitly welcomes search crawlers, AI-search crawlers (OAI-SearchBot, Claude-SearchBot, PerplexityBot) and user-triggered fetchers. Nothing useful is blocked.

## 3. Keyword mapping

| Page | Primary intent / clusters (used naturally, not stuffed) |
| --- | --- |
| `/` Home | Brand (SODWORKS, SODWORKS India / Chennai / technology studio); web development & technology studio Chennai; product development studio India |
| `/what-we-build` | Website / web development company Chennai & Tamil Nadu; custom software development India; ecommerce website development; custom web application development; AI-powered application development; Next.js development; SaaS / product development |
| `/ventures` + venture pages | Ecommerce development (proof: Akram Perfumes, Dope Culture, Beast Muscle); Madurai and Chennai relevance from real project locations |
| `/studio` | Brand + "technology studio in India", founders (entity signals) |
| `/contact` | "Start a project" intent: website, ecommerce, custom software, AI product; Chennai, Madurai, India |

No location landing pages were created; that would produce thin, duplicated pages. **Note:** the brief's "100-phrase research bank" was a placeholder (`[Insert the 100 keyword phrases…]`), so no phrases were supplied. Share the list and I'll map it against these pages.

## 4. Structured data implemented

- **Site-wide:**
  - `Organization`: name, url, logo, description, email, **official phone only** (+91 82480 63265), foundingDate, founders, contactPoint, areaServed (Chennai, Madurai, Tamil Nadu, India), slogan, knowsAbout.
  - `WebSite`.
  - `Person` ×3 (co-founders).
- **Per page:**
  - Home: `WebPage`.
  - What We Build: `ItemList` of `Service`, plus `FAQPage`.
  - Ventures: `CollectionPage` + `ItemList`.
  - Studio: `AboutPage`.
  - Contact: `ContactPage`.
  - Each venture: `WebPage` + `CreativeWork` + `BreadcrumbList`.
- **Validation:** a check against the official schema.org vocabulary found 824 properties, **0 errors** and **0 conflicting `@id` definitions**. **PASS**
- **Deliberately not added**, because no verified data exists:
  - `ProfessionalService` / `LocalBusiness` (Google expects a street address).
  - Address, geo coordinates, opening hours, ratings and reviews.
  - `sameAs` social profiles (none in the project).

  The site still shows all three phone numbers, as you previously requested; structured data lists only the official one.

## 5. Indexing configuration

| Check | Result |
| --- | --- |
| `robots.txt` → `Allow: /` + `Sitemap: https://www.sodworks.in/sitemap.xml` | PASS |
| `sitemap.xml`: exactly 10 canonical, indexable 200 URLs; no 404s, redirects, API or error pages | PASS |
| Canonicals are absolute `https://www.sodworks.in/...`; no localhost anywhere | PASS |
| Preview, staging and local builds: noindex meta + `X-Robots-Tag: noindex, nofollow` + `Disallow: /` + empty sitemap | PASS (unchanged safeguard) |
| HTTP codes: pages 200; `/nope`, `/ventures/nope`, `/.env`, `/.git/config`, `/api/x` → 404; `/ventures/` → 308 | PASS |
| Public assets reachable: icons, OG images, logo | PASS |
| Actually indexed by Google or Bing | **NOT TESTED** (not deployed). After launch, submit the sitemap in Search Console and Bing Webmaster Tools. |

## 6. Performance results (Lighthouse 12.8.2, production build, local)

| Page | Mobile perf | LCP | TBT | CLS | Desktop perf |
| --- | --- | --- | --- | --- | --- |
| Home | 85–86 (3 runs; one outlier at 72) | 4.2 s | 70–150 ms | 0.002 | 100 (LCP 0.8 s) |
| What we build | 98 | 2.3 s | 40 ms | 0.002 | 100 |
| Studio | 95 | 3.0 s | 60 ms | 0.002 | 100 |
| Venture (Dope Culture) | 93 | 3.2 s | 30 ms | 0.002 | 100 |
| Contact | 98 | 2.1 s | 150 ms | 0.002 | 100 |

Accessibility, Best Practices and SEO scored **100** on every page, mobile and desktop.

- **CLS ≤ 0.1:** PASS everywhere.
- **TBT:** PASS (stable runs ≤ 150 ms).
- **INP:** NOT TESTED. It needs real-user field data; TBT is the lab proxy.
- **Mobile LCP ≤ 2.5 s:** WARNING on Home (4.2 s), Studio (3.0 s) and Venture (3.2 s).
  - **Home:** the LCP element is the hero painting. It is revealed on purpose after the brand-first intro and the first-visit loader. In a real Chrome measurement it paints at about 4.7 s whether or not the loader is present, so the delay is the cinematic intro itself, not slow loading. Lowering it means changing the approved intro: starting the painting's reveal earlier, or shortening the loader.
  - **Studio and Venture:** unthrottled Chrome records the LCP text at 80–150 ms. The 3 s comes from Lighthouse's simulated throttling of the hydration JavaScript. Field data after launch will show which number reflects users.
- **Payload:** home is about 592 KB total (images 287 KB, JS 205 KB, fonts 66 KB, CSS 14 KB). There are no third-party scripts and no source maps.

## 7. Security findings

| Check | Result |
| --- | --- |
| Secret scan (client bundles, `public/`, `src/`): AWS, Google, Stripe, GitHub and Slack tokens, private keys, API-key assignments | PASS — none found |
| Environment variables used: `NEXT_PUBLIC_SITE_URL`, `NODE_ENV`, `VERCEL_ENV` (none secret); only `.env.example` exists | PASS |
| Source maps shipped to browsers | PASS — 0 (`productionBrowserSourceMaps: false`) |
| Headers: HSTS (2 y, includeSubDomains), CSP, `X-Frame-Options: DENY`, nosniff, Referrer-Policy, Permissions-Policy, COOP; `X-Powered-By` removed | PASS |
| CSP breaks nothing (66 page loads, 0 console errors or violations) | PASS |
| XSS: only `dangerouslySetInnerHTML` is JSON-LD with `<` escaped; React escapes everything else | PASS |
| Contact form: client validation and length limits; builds an encoded `mailto:`. No server endpoint, so no SQL injection, CSRF or rate-limit surface. | PASS |
| Open redirects: navigation only to fixed internal paths | PASS |
| External links: all `target="_blank"` links carry `rel="noopener noreferrer"` | PASS |
| Unnecessary endpoints: `.env`, `.git`, `/api/*` → 404 | PASS |
| `npm audit --omit=dev` (production dependencies) | PASS — 0 vulnerabilities |
| `npm audit` (dev tooling) | WARNING — 7 moderate (`minimatch` via ESLint tooling), not shipped to browsers; no non-breaking fix available |
| Available patch updates: next 16.4.6, react / react-dom 19.3.1 | WARNING — not applied (no automatic upgrades); recommended in a separate change with a re-test |
| HTTPS / TLS on the live domain | NOT TESTED — site not deployed yet |

## 8. Vulnerabilities and defects resolved in this pass

1. Soft 404 on unknown venture URLs (HTTP 200 with conflicting robots tags) → real 404.
2. Broken outbound link to Beast Muscle (TLS host mismatch) → working URL.

No security vulnerabilities were found in application code.

## 9. QA test results

| Area | Result |
| --- | --- |
| Responsive sweep: 11 routes × 6 viewports (1440, 1280, 1024, 768, 390, 375) = 66 loads | PASS — 0 horizontal overflow, 0 broken images, 0 console errors, 0 failed requests |
| Internal links (16 unique) crawled → all 200 | PASS |
| External links: dopeculture.in 200, thebeastmuscle.in 200 | PASS |
| `tel:` (3) and `mailto:` on every page | PASS |
| Contact form: empty submit flags name, email, project type and details and focuses the first field; a valid submit drafts the correct encoded email; script text stays inert | PASS |
| Mobile menu opens and navigates (`/ventures` → `/studio`) | PASS |
| Intros: loader → home, studio and contact openings start after it; scroll lock releases | PASS |
| New FAQ block: desktop and mobile layout | PASS |
| TypeScript (`tsc --noEmit`), ESLint | PASS — 0 errors, 0 warnings |
| Automated unit / e2e test suite | NOT TESTED — the project has none |

## 10. Remaining issues and recommendations

1. **WARNING:** home mobile LCP (the cinematic intro). This is a design decision for you.
2. **Input needed:** the 100-phrase keyword bank was not included in the brief.
3. **Input needed:** the technologies used on each venture project. Case studies show what SODWORKS built but not the stack, because none was supplied, and no technologies were invented.
4. **Name check:** the brief says "Dope Store"; the site uses "Dope Culture", the brand's own name as supplied earlier.
5. **Deployment:** confirm the host (Vercel → automatic; otherwise set `NEXT_PUBLIC_SITE_URL`), point the domain, and redirect the apex to `www`.
6. **Google Business Profile:** prepare it as a service-area business. GBP requires a verifiable address, which hidden service-area listings still need for verification; no address was invented for the site. Use these details in GBP and every directory:
   - Name: SODWORKS
   - Category: software company / website designer
   - Phone: +91 82480 63265
   - Website: https://www.sodworks.in
   - Email: sodworksagency@gmail.com
   - Service areas: Chennai, Madurai, Tamil Nadu
   - Description: the identity sentence above

   Create one listing only.
7. **Optional:** apply the next / react patch releases; add social profile URLs (`sameAs`) once the profiles exist.

## 11. Files modified

- `src/lib/site.ts`: production domain, identity sentence, official phone, geographic focus, services, page metadata, FAQ
- `src/lib/schema.ts`: official phone, contactPoint, slogan, FAQPage
- `src/app/llms.txt/route.ts`: website, location, official contact, FAQ
- `src/app/what-we-build/page.tsx`, `src/components/what-we-build/services.module.css`: FAQ block
- `src/components/Hero.tsx`: visually hidden H1 wording only
- `src/components/ventures/data.ts`: Beast Muscle URL
- `src/proxy.ts` (new): 404 for unknown venture slugs
- `.env.example`, `README.md`: domain and indexing documentation
- `docs/LAUNCH-REPORT.md` (this report)

The project is not a Git repository, so this list comes from file modification times. `next-env.d.ts` is regenerated by Next itself. A temporary local server entry in `.claude/launch.json` was added for testing and removed.

## 12. Production build status

`next build` **succeeded**: 19 static pages, the proxy compiled, 0 TypeScript errors, 0 lint errors or warnings.

---

*No rankings or AI-search visibility are promised. A sitemap and structured data make the site eligible and easy to understand; indexing and ranking are decided by each search engine after launch.*
