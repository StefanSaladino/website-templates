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

Use `review.html?id=NAV-03` (substitute another ID) to compare full desktop/tablet/phone previews, switch between default and alternate phone layouts where offered, and save internal reference pairs to a browser-local shortlist. The `?planning=1` catalogue lists in-review demos; the public catalogue only shows `live` entries.

**Stock photo gate remains open:** images currently hotlink to Unsplash as temporary development candidates, tracked in `data/stock-manifest.json` and still marked `needs-review`. Verify individual sources, obtain local licensed assets, optimize crops/derivatives, capture real photography-loaded previews and complete manual iOS/Android checks before marking anything live. See `../docs/COMPONENT-PHASE2-PROGRESS.md`.
