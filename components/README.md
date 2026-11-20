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
