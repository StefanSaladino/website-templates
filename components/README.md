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
