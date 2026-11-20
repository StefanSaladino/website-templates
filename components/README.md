# Component Showroom — foundation (Phase 1)
This folder is a **client-facing visual selection showroom**, not a component package or website builder.

## Local development
From `components/`:
```bash
npm install
npm run check
npm run dev
npm run build
```
Vite is isolated to this folder. Production output is `../dist/components/` and uses **relative paths**, so it can be hosted at `/website-templates/components/` without changing the existing 24 template routes. The source `components/index.html` also works when served as static files from the repository root. Do not open the page using a `file://` URL; use a local HTTP server.

## Data, publication, and IDs
- `data/categories.json`: 29 category definitions, planned counts and stable prefixes.
- `data/components.json`: 137 draft variants from the approved planning baseline. Every ID is permanent.
- `data/stock-manifest.json`: rights registry; currently deliberately empty.
- `?planning=1`: optional *internal* catalogue view showing draft descriptions without pretending they are live.
- Default public view: only status `live`; no dummy/demo entries marketed as completed components.
- When the first previews are implemented, use `previews/<ID>/index.html`, and set each component's `previewRoute` to `./previews/<ID>/`.
- Thumbnail routes use `./assets/thumbnails/<ID>.webp`. No thumbnails are invented before the corresponding screenshot exists.

## Assets
Register stock photographs manually with source, photographer, exact URL, current license URL, rights review, and consent/trademark concerns **before use**. Acquire approved originals from the licensed provider or photographer (no scraping). Once originals are in your local environment:
```bash
npm run optimize:stock -- STOCK-001 /path/to/approved-photo.jpg
```
This writes responsive WebP widths and SHA-256 provenance. Do not commit raw source photos without explicit permission. Do not set `reviewStatus=approved` unless license and context have been reviewed.

## Preview isolation
Each example is an individual HTML document; namespace CSS with its component ID, and use local tokens. Never globally apply one component's styles across the showroom. For demo-only forms and booking controls, label limitations clearly. Keep the public catalogue fast by loading previews only on demand.

## Roadmap
See `../docs/COMPONENT-SHOWROOM-ROADMAP.md`. Phase 2 delivers six real licensed/photo-verified previews, mobile/desktop controls, and the first shortlist proof. The existing templates gallery is intentionally unchanged in Phase 1.


## Mobile design track (roadmap v1.1)
The catalogue has **137 core component variants** with mandatory mobile layouts and an **additional 44 optional mobile treatments** across 10 groups. These are design choices rather than automatically generated 137 × 44 combinations. Example pairing: `HERO-01` (desktop structure) plus `M-HERO-02` (photo-first vertical phone composition). All mobile treatment options are **planning only**, not available or approved yet.

When implemented, mobile treatment metadata must list compatible core IDs, a live narrow-screen preview route, phone thumbnail, asset/crop and QA evidence, and a status separate from the parent component. Public previews should let clients switch Phone / Desktop and compare compatible Default / Alternate phone compositions. See Section 6 of `../docs/COMPONENT-SHOWROOM-ROADMAP.md`. The six-preview implementation remains paused while this is a planning amendment; no GitHub Pages merge is requested.

## Phase 2 — six in-review development examples (Nov 2026)
NAV-03, HERO-01, GAL-02, SRV-03, CTA-02, FORM-01 have standalone HTML/CSS/JS under `previews/<ID>/`.
Open `/components/index.html?planning=1` **on a server serving this branch** to browse development previews. Regular visitors still see only `live` components (currently none). These are *not yet public-ready*: all photo assets still use temporary externally hosted Unsplash URLs, with per-image source/photographer and license-review caveats in `data/stock-manifest.json`. Download/optimize originals via licensed source, verify releases, finish image/mobile browser QA, generate genuine screenshots and then approve each component.
The FORM-01 example validates fields and prepares a local copyable draft; it explicitly does not submit information.

## Phase 2 — previews and mobile alternatives (in review)
The showroom currently includes working prototypes for **NAV-03, HERO-01, GAL-02, SRV-03, CTA-02 and FORM-01**, plus four alternate mobile treatments: **M-NAV-04, M-HERO-02, M-GAL-02, M-SRV-03**. These are **in review**, not client-selectable.

Use `review.html?id=NAV-03` (substitute another ID) to compare full desktop/tablet/phone previews, switch between default and alternate phone layouts where offered, without a shortlist or save controls. The `?planning=1` catalogue lists in-review demos; the public catalogue only shows `live` entries.

**Stock photo gate remains open:** images currently hotlink to Unsplash as temporary development candidates, tracked in `data/stock-manifest.json` and still marked `needs-review`. Verify individual sources, obtain local licensed assets, optimize crops/derivatives, capture real photography-loaded previews and complete manual iOS/Android checks before marking anything live. See `../docs/COMPONENT-PHASE2-PROGRESS.md`.

## Current review policy
The client will perform final visual review once all showroom examples have been built. Continue implementing and code-testing now. Remote Unsplash and Pexels URLs are acceptable with recorded source, creator, license and appropriate commercial/third-party rights; local image copies are optional. Do not mark an item `live` until rights approval, functioning image URLs and eventual client visual acceptance. Added in Phase 3: NAV-01, HERO-02, GAL-01 and CTA-01, all `in-review`.

## Client-friendly viewer (November 2026)
The review page intentionally has no working shortlist or local browser storage. Visitors choose Computer, Tablet or Phone and can see the Whole design or Look closer. All preview examples still use controlled iframe widths independent of the visitor's actual device. A Save button will be designed later as part of a client portal, not within this public showroom.

## New motion catalogue (Nov 20, 2026)
Twenty animation patterns, ANIM-01–ANIM-20, expand the catalogue to **30 families and 157 core choices**, with 44 separately planned mobile alternatives. ANIM-01 starts the in-review interactive previews; other motion variants are built in progressive QA-checked batches. See the roadmap amendment for motion/accessibility/preview requirements. Do not auto-apply motion effects to existing templates.

## Phase 3 status (November 20, 2026)
All 36 individually enumerated first-release core IDs now have in-review preview implementations, plus four in-review motion examples. This is **40 working prototypes**, not 40 production-approved components. The other 16 planned motion patterns are draft entries. Licensed imagery approval, genuine preview thumbnails, final mobile/accessible QA and client sign-off remain outstanding; main is unchanged. Note that the original roadmap incorrectly calls its 36-item Phase 3 ID list "35". See docs/COMPONENT-PHASE3-PROGRESS.md for the newest checkpoint.

## See motion in full-page templates
Six in-review animation patterns have actual integrations into six original templates. The relevant animation cards and review pages contain a “See on a full website” link that opens the corresponding working page/section. To test on this development branch, serve the repository root over HTTP, or build from `components/` and serve `dist/` (the build now includes `dist/templates/`). The matching HTML, CSS and JS reside in the original `templates/` directories, not in screenshots. No animation is globally injected into other designs, and no publication to `main` has been requested.

## Motion design integrations — second batch

Six additional animation examples, ANIM-08/10/11/14/15/18, now have both isolated previews and actual effects within the matching full-page site templates. The total is 12 integrated motion patterns, 8 drafts. New build validation rejects a motion item if it lacks a working full-template reference. None is automatically applied to unrelated templates.

## Animation continuation — four further full-template patterns

ANIM-09, ANIM-12, ANIM-17 and ANIM-20 now have functional isolated previews and matching full-page treatments. The motion inventory has **16 working in-review demos** and **4 drafts**. The original complete templates keep their distinct identities, and motion stays opt-in or scroll-driven with static fallbacks. The built-template gate checks for a genuine `data-motion-pattern` element in the linked site.

## Finished motion inventory — 20 working patterns

All 20 planned ANIM IDs now have isolated specimens and real full-page website integrations. The final four use BED & BORDER (ANIM-04), Waterline (ANIM-13), KERN (ANIM-16) and Tide (ANIM-19). Each remains in review. Any future proposed motion must solve a real design need and satisfy the same accessibility, reduced-motion, progressive-enhancement and full-template integration criteria; the next backlog phase is mobile alternatives and visual release review.

## Mobile treatments — first expanded batch

Six additional actual phone compositions are selectable as mobile alternatives on NAV-01, HERO-03, GAL-03, SRV-02, FORM-02 and CTA-01. Use review page → Phone → Alternate to compare the distinct layout with its parent. Validation now requires both the parent component and mobile-treatment record to refer to each other. Total active mobile variations: **10 / 44**; 34 remain drafts. No approval or main-branch merge implied.

## Mobile expansion — interaction-focused set

New selectable phone modes: M-NAV-05 on NAV-02, M-NAV-06 on NAV-04, M-GAL-05 on GAL-06, M-FRM-04 on FORM-01, M-UTIL-03 on COMP-01, and M-UTIL-04 on GAL-05. They reuse genuine original content and interactions rather than standalone screenshots. Current mobile alternatives: **16 in review / 44 planned**. Review each by opening its parent component, selecting Phone and then Alternate. No change to main and no production approval implied.

## Commerce + mobile storytelling expansion

New live-working but **not production-approved** core previews: PROD-01 (CSS product illustrations), PRICE-01 (fictional pricing), MENU-01 (illustrative restaurant menu), BOOK-01 (local appointment preferences, no actual booking). They add mobile alternatives M-COM-01, M-COM-04, M-COM-03, M-FRM-03 respectively. TEST-01 gains M-STORY-02 manual fictional quote navigation, and PROC-01 gains M-STORY-03 connected vertical timeline. **22/44 mobile alternatives**, **60/157 core examples** and **20/20 animations** built, all under review. Review each parent via Phone → Alternate; `main` remains untouched.

## Multiple phone layout options for one component

The showroom now allows Style 1 (the existing responsive default) and Style 2, Style 3, etc. for any component with several built phone variants. New in-review treatments: M-NAV-02, M-GAL-04, M-COM-02, M-HERO-05, M-STORY-01. NAV-04, GAL-02 and PROD-01 each have at least two mobile alternatives. Review selector shows all available named options on the same phone preview. Total **27 / 44** mobile layouts in review; **17 remain drafts**. CTA-03's main CTA no longer uses an arrow glyph. No main merge or production approval is implied.
 
## Seven more mobile designs (November 20, 2026)

Built and selectable on their real parents: M-HERO-01 (HERO-01), M-GAL-01 (GAL-03), M-SRV-01 (SRV-03), M-CTA-02 (CTA-02), M-CTA-04 (FOOT-02), M-UTIL-01 (GAL-05) and M-UTIL-05 (PRJ-03). These provide genuinely different phone compositions and preserve real anchors, filter controls and native disclosure behavior. Phone style options now total **34/44 in review** (10 drafts). **60/157** core examples and **20/20** integrated animation examples remain in review. The browser regression suite includes explicit alternate-specific assertions; image rights, final imagery/crops, mobile-device QA and release acceptance are still incomplete. `main` is unchanged.
 
## Mobile-alternative track complete (November 20, 2026)

The remaining ten mobile styles (M-NAV-03, M-HERO-04, M-SRV-04, M-FRM-01, M-STORY-04, M-CTA-03, M-UTIL-02 and M-MEDIA-01/02/03) are now wired to the exact original parent previews. Two new core review-only specimens, TRUST-02 and MEDIA-01, demonstrate fictional credentials and actual video loading rather than pretending empty parent components have mobile layouts. All **44 of 44** optional phone styles are **in review**, with **62 of 157** core specimens and **20/20** animation patterns built. The review page supports Style 1 plus as many real alternate phone layouts as the parent owns.

**Important:** MEDIA-01 reuses an existing Pexels-hosted video and poster as an unapproved development source, not redistribution-cleared stock. Its source attribution, creator, rights, optimized encode, media-loaded screenshots and device playback remain open. The complete 44/44 count is an implementation checkpoint, **not a release or client-ready claim**. Continue core backlog and QA on `feature/component-showroom` only; do not merge to `main`.
 
## Seven new core examples (November 20, 2026)

TEAM-01 and TEAM-02 add two wholly different people-focused compositions, TRUST-01 and TRUST-03 add a fictional typographic client mark row and a disclosure-driven sample press ledger, ABOUT-02 shows a photo-led workshop narrative, CONTACT-02 combines landscape imagery with an explicitly non-geographic arrival sketch, and MEDIA-02 provides real user-enabled muted video with pause/reduced-motion fallback. These are working HTML/CSS/JS reviews rather than metadata-only placeholders.

**69 / 157** core examples in review, **44 / 44** alternate mobile designs in review, **20 / 20** animation patterns implemented. Existing stock records were reciprocally updated, and new workshop photo references STOCK-012/013 are **unverified and not approved**. None of the fictional people, sample logos, example publications, lodges or sample contact methods can be represented as actual customers or staff. Latest browser/source QA assertions are committed but the final production build, true loaded-photo/device accessibility tests, license signoff and client visual approval remain open. Work stays in `feature/component-showroom`; no merge to `main`.
 
## Four core families filled (November 20, 2026)

The seven newly built, actually selectable previews are TEAM-03, TEAM-04, TRUST-04, ABOUT-03, ABOUT-04, MEDIA-03, and MEDIA-04. They complete **teams, trust, about, and media at 4/4 each**. All **76/157** core examples and **44/44** optional mobile treatments are source-complete and **in review**; **20/20** animation patterns retain isolated and integrated full-template implementations. The showroom viewer exposes each via the normal `review.html?id=...` route. Responsive desktop/phone compositions are not the same layout merely scaled down.

The new tattoo-artist card selection, agency role filtering, KPI period controls, native video dialog and photo-caption story controls are real functional examples, with non-sending enquiry drafts and candid fictional sample data. MEDIA-03 uses the existing unapproved Pexels source STOCK-011 for **three selectable chapters of a single film**, not independent clips; no new client footage or artist rights are claimed. Source-level contracts and augmented browser test syntax checked; **fresh browser/CI/device execution and photography rights are outstanding**. Keep `main` unchanged. Focus the next pass on underrepresented core families instead of these completed four.
 
## Eight conversion and information examples (November 20, 2026)

The branch now contains working LOC-01, LOC-02, CAREER-01, CAREER-03, NEWS-01, NEWS-02, UI-01 and FORM-03 isolated components. Real choices, consent gates, role/FAQ filters, staged form validation, Back buttons and non-sending local summaries replace static mock controls. Example addresses, businesses, roles, sample budgets, operating hours and service-area diagrams are explicitly fictional; no external directions, job application, mailing list registration or quote generation is implied. NEWS-02 imagery uses the unapproved registered STOCK-007 source.

**84/157 core** examples and **44/44 optional mobile treatments** remain in review; **20/20** animations are already integrated into real full-page templates. All eight new preview scripts parse, source anchors/element IDs/alt text are checked and metadata and stock reciprocity are consistent. New browser smoke assertions cover their behavior at normal and 320px phone widths. **Actual Chromium/CI, physical-device visual QA, image rights and client signoff are still outstanding.** No change to `main`.
