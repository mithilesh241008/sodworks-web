# SODWORKS — GlowCursor & Final Launch Report

Date: 15 November 2026 · Stack: Next.js 16.4.5 (App Router, Cache Components), React 19.3, GSAP
Tests ran against a local production build (`next build` + `next start`, `NEXT_PUBLIC_SITE_URL=https://www.sodworks.in`) in headless Chrome on Apple M5 (ANGLE Metal, real GPU). Earlier launch work is in [LAUNCH-REPORT.md](LAUNCH-REPORT.md).

Legend: **PASS** · **WARNING** · **FAIL** · **NOT TESTED** — every PASS below was measured, not assumed.

---

## L. Deployment status — NOT DEPLOYED (blocked)

Every pre-deployment condition passed, but deployment could not run. Missing:

1. **Vercel CLI is not signed in.** `vercel` 50+ is installed, but there is no auth token; `vercel whoami` waits for an interactive login.
2. **No established deployment workflow exists in the project.**
   - The folder is not linked to a Vercel project (no `.vercel/`).
   - It is not a Git repository (no remote, no CI).
   - There is no `vercel.json`, Netlify or Docker config.

   Linking or creating a hosting project is an account decision, so I did not make it.
3. **The domain isn't pointed at a deployment.** `https://www.sodworks.in` currently serves a registrar parking redirect (`/lander`). Pointing it at a deployment is a DNS change, which you said not to make.

**M. Live production URL:** none yet. There is no commit identifier, because the project has no Git repository.

**To unblock:**
1. Run `vercel login` in a terminal.
2. Tell me which Vercel project (existing or new) should host the site.

Then I can run `vercel link` and `vercel --prod`, and verify the deployment URL. Attaching `www.sodworks.in` at the registrar or in Vercel's Domains settings stays with you.

---

## A. GlowCursor implementation

| Item | Result |
| --- | --- |
| Source | Official React Bits GlowCursor, `davidhdev/react-bits@cf28010` (`ts-default`), downloaded from GitHub. The brief referred to a source "supplied in the conversation", but none was attached. The licence header (MIT + Commons Clause, use in a website permitted) is kept in the file. |
| The real WebGL2 fluid simulation is kept (advection, MacCormack, pressure solve, bloom); no CSS imitation | PASS |
| One global instance in the root layout (`<SiteGlowCursor/>`); persists across client navigation (same canvas before and after a nav click; 1 instance) | PASS |
| Fixed viewport overlay (`position: fixed; inset: 0`), not a full-document canvas | PASS |
| `pointer-events: none`, `user-select: none`, `aria-hidden`, nothing focusable | PASS |
| Stacking: z-index 45, above the page but under the site index (50), contact opening (60), launch transition (100) and loader (200) | PASS |
| Blending: `mix-blend-mode: screen` on the fixed layer. A fixed, z-indexed element isolates its children, so a blend on the canvas alone would never reach the page; it only ever adds light. | PASS |
| Settings used: exactly the brief's starting values. Reviewed on What We Build, Ventures, Studio and Contact, where it reads as restrained warm amber with a small white-hot tip and a natural fade; no tuning was needed. | PASS (visual judgement) |

**Hardening** (marked `SODWORKS:` in the source; the visual behaviour is unchanged):
- A failed set-up is reported through `onUnavailable` instead of returning silently. If any of the 11 shader programs fails, the ones already built and the vertex shader are deleted.
- WebGL context loss stops the loop (`preventDefault`), cleanup skips resources that are already gone, and a restored context re-initialises through a fresh effect run.
- The overlay rect is cached on resize, so pointer moves never force a layout read during the GSAP animations.
- Prop-to-ref copies moved from render into a layout effect (React rules).
- The internal helper `use()` was renamed `bindPass()`, a mechanical rename that fixes a lint false positive.

**Gating**, in `SiteGlowCursor.tsx`:
- The component loads only if `(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`, and reacts live to changes.
- It is loaded with `next/dynamic` (`ssr: false`), so touch devices never download it (7.3 KB gzipped chunk).
- It mounts after the loader lifts, in idle time.
- It unmounts if WebGL2 or `EXT_color_buffer_float` is unavailable.

**Kept from the original:**
- The loop stops when the pointer rests (no frames while idle).
- It pauses when the tab is hidden or the overlay is out of view.
- DPR is capped (1.5) and quality is `medium`.
- All listeners, observers, programs, textures, framebuffers, the buffer and the VAO are released on unmount.

## B. Files created and modified

- **Created:**
  - `src/components/cursor/GlowCursor.tsx`
  - `src/components/cursor/GlowCursor.css`
  - `src/components/cursor/SiteGlowCursor.tsx`
  - `docs/GLOWCURSOR-LAUNCH-REPORT.md`
- **Modified:**
  - `src/app/layout.tsx`: one import and `<SiteGlowCursor />`.
  - `README.md`: a "Cursor light" section.
- **Temporary:** a local production-server entry in `.claude/launch.json` was added for testing and removed.
- **Unchanged:** the homepage, hero, Studio imagery, founders image, ventures, contact and all other components and styles.
- **No new npm dependencies.**
- The project has no Git repository, so there is no Git diff. The list above was checked against file modification times.

## C. Visual QA

| Check | Result |
| --- | --- |
| Trail colour, glow and hotspot on dark pages (What We Build, Dope Culture, Studio) | PASS: warm amber, no neon, no blue, no particles |
| Trail fades to nothing (screenshot 2.6 s after stopping) | PASS |
| Hidden under the loader and the contact opening; never over the nav | PASS |
| No change to page composition, colour or type | PASS (66-load sweep identical) |

## D. Desktop QA (1440 × 900, production build)

| Journey | Result |
| --- | --- |
| Real mouse click on a nav link through the overlay → navigated to `/studio` | PASS |
| Click and type in the contact form through the overlay | PASS |
| Text selection by mouse drag (cursor on vs off, same text selected) | PASS |
| Hit-testing: the element under the cursor is the page element, never the overlay | PASS |
| Keyboard / screen reader: overlay `aria-hidden`, 0 focusable elements | PASS |
| WebGL disabled (`--disable-webgl --disable-webgl2`): overlay removed, site fully functional, 0 errors | PASS |
| Reduced motion: no overlay. Turning motion back on live mounts it without a reload. | PASS |
| Earlier journeys (form validation and mailto, mobile menu, links) | PASS (rerun in the sweep; see LAUNCH-REPORT) |

## E. Mobile QA

| Check | Result |
| --- | --- |
| Touch-only emulation (coarse pointer, no hover): no overlay, and the cursor chunk is **never requested** | PASS |
| Responsive sweep: 11 routes × 6 viewports = 66 loads, 0 overflow, 0 broken images, 0 console errors, 0 failed requests | PASS |
| Real iOS / Android devices | NOT TESTED (emulation only) |

**Browsers**
- Chrome: PASS.
- Safari: NOT TESTED. It's installed, but automation requires enabling "Allow Remote Automation", a browser security setting I did not change. Safari 15+ supports WebGL2 and `EXT_color_buffer_float`; if not, the effect simply doesn't mount. This is an assumption, not a test.
- Firefox: NOT TESTED (not installed).

## F. SEO audit (rerun on the final build)

| Check | Result |
| --- | --- |
| 10 indexable routes: 200, unique titles and descriptions, absolute canonical `https://www.sodworks.in/...`, OG and Twitter cards, `index, follow`, one H1, 0 images without alt | PASS |
| `/nope`, `/ventures/nope`, `/.env` → 404 | PASS |
| `robots.txt`, `sitemap.xml` (10 canonical URLs), `llms.txt` | PASS |
| JSON-LD: 824 properties, 0 schema.org vocabulary errors, 0 conflicting `@id`s | PASS |
| Lighthouse SEO / Accessibility / Best Practices: 100 on every page, mobile and desktop | PASS |
| Indexed by Google or Bing | NOT TESTED (not deployed) |

## G. GEO audit

| Check | Result |
| --- | --- |
| One identity sentence everywhere (metadata, JSON-LD, `llms.txt`, FAQ): a technology and product-building studio in India building custom websites, ecommerce platforms, software products and AI-powered applications | PASS |
| Geographic focus: Chennai, Madurai, Tamil Nadu; no invented address, branch, testimonials, awards or statistics | PASS |
| Explicitly not a digital-marketing, SEO or advertising agency | PASS |

## H. Security audit

| Check | Result |
| --- | --- |
| Secret scan (bundles, `public/`, `src/`) | PASS — none |
| Environment variables: `NEXT_PUBLIC_SITE_URL`, `NODE_ENV`, `VERCEL_ENV` only; none secret | PASS |
| Source maps in `.next/static` | PASS — 0 |
| Headers: HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP (7/7) | PASS |
| CSP compatible with WebGL (no violations, 0 console errors) | PASS |
| Cursor: no network access, no `eval`, no HTML injection, no third-party code at runtime | PASS |
| XSS, injection, open redirects, external links (`noopener noreferrer`), no API endpoints | PASS (unchanged since LAUNCH-REPORT) |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm audit` (dev tooling): 7 moderate (`minimatch` via ESLint) | WARNING — not shipped |
| HTTPS / TLS on the live domain | NOT TESTED — not deployed |

## I. Performance measurements

**Cursor cost, measured directly in real Chrome (M5 GPU):**
- **Main-thread JS of the cursor during a 3 s continuous mouse sweep: ~12 ms total** (~0.07 ms per frame, CPU profile attributed to its chunk).
- **Idle:** 0 frames. The loop stops once the trail fades.
- **Mount:** no long task (long tasks identical with the cursor on and off: Home `[50 ms, 68 ms]` vs `[55 ms, 58 ms]`).
- Frame pacing on Ventures during the sweep: p50 16.7 ms, p95 16.8 ms (60 fps), the same as with the cursor off.
- On What We Build (which runs its own particle animation), p95 frame time varied between runs, 16.7–33 ms with the cursor on vs 16.7 ms off. The profile attributes the variable time to the page's own particle code (~570 ms per 3 s), not to the cursor.
- **Download:** 0 KB on touch devices; 7.3 KB gzipped on desktop, fetched about 2.1 s after navigation (after the loader).

**Lighthouse 12.8.2, before → after the cursor** (same build otherwise; the machine was busy, so expect ±10 points of noise on mobile):

| Page | Mobile before → after | Desktop before → after |
| --- | --- | --- |
| Home | 72–86 → 85 (LCP 4.1 s, TBT 150 ms) | 100 → 99 (LCP 0.8 s, TBT 0–10 ms) |
| What we build | 98 → 91–92 (LCP 3.0 s) | 100 → 100 |
| Studio | 95 → 98 (LCP 2.1 s) | 100 → 100 |
| Venture | 93 → 92 (LCP 3.2 s) | 100 → 100 |
| Contact | 98 → 89–91 (LCP 2.1–2.8 s) | 100 → 100 |

- CLS stays at 0.002 everywhere (target ≤ 0.1): **PASS**.
- Desktop LCP ≤ 0.9 s everywhere: **PASS**.
- Mobile LCP ≤ 2.5 s: **WARNING**. Home (the approved cinematic intro, kept by your decision) and some pages under simulated throttling exceed it. Since mobile never downloads the cursor, the mobile differences above are run-to-run noise, not the cursor.
- INP: **NOT TESTED** (needs field data). The cursor's pointer handler only stores coordinates, with no layout reads.

## J. Build and test results

| Check | Result |
| --- | --- |
| `next build` (production) | PASS: 19 static pages, proxy compiled, no warnings |
| `tsc --noEmit` | PASS: 0 errors |
| ESLint | PASS: 0 errors, 0 warnings |
| Automated unit / e2e suite | NOT TESTED: the project has none. Coverage came from the scripted headless-Chrome QA above. |

## K. Remaining warnings

1. **Deployment is blocked** (section L): Vercel login, project choice, and pointing the domain.
2. Home mobile LCP 4.1 s (approved intro); other mobile LCPs of 2.1–3.2 s under throttling.
3. Safari and Firefox not tested; real devices not tested.
4. Dev-only `minimatch` advisory; patch updates for next 16.4.6 and react 19.3.1 not applied.
5. Inputs still open from the previous report: the keyword bank, per-project technologies, and "Dope Store" vs "Dope Culture".
