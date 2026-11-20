# Phase 2 image and release gate — 2026-11-19

The six prototypes and four mobile alternatives remain **in review**.

## Why the photography is still blocked
All nine current photos are registered in `components/data/stock-manifest.json` as **needs-review**. Exact Unsplash source pages identify their creators and free photo license, but a platform copyright license does not independently certify model releases, property/trademark issues, suitable commercial implication, or individual crops. The original image binaries have **not** yet been retrieved and safely embedded into this branch. Do not treat any on-screen image placeholder as QA.

## How to finish a photograph
1. Open the individual `sourceUrl` and inspect the current license and image, confirming the photo still belongs to that source/creator.
2. Download its original from the official stock provider, preserving the acquisition metadata and attribution.
3. Review trademark, property and recognizable person context, especially the four portraits and three renovation images. Replace a risky scene instead of implying a model is a real client or the kitchen is a builder's own project.
4. Update the asset's `rightsNotes`, `licenseReviewedAt` and `reviewStatus` to `approved` **only after the review**.
5. Run `npm run optimize:stock -- STOCK-001 /path/to/official-file.jpg`, committing generated local image variants. Edit every linked preview's `img` to use local image derivatives, `srcset` and deliberate mobile focal crops.
6. Capture loaded desktop/phone screenshots and produce their final thumbnail files. Record physical-device QA before changing any component status to `live`.

## Checks added
- `npm run check` now covers schema, six previews, and stock integrity. It intentionally warns for nine unapproved photos without failing development builds.
- Any `live` preview with third-party external media, no actual thumbnail or unapproved linked imagery **fails** this check.
- `npm run build` builds the catalogue and review page, copies isolated preview files and media metadata and checks the resulting `dist/components/` route structure.
- `.github/workflows/component-showroom-ci.yml` runs these checks only when branch component files change; it **does not deploy or merge to main**.

## Remaining manual gates
Working photos/crops, useful thumbnails, actual iOS Safari and Android Chrome interaction/focus testing, accessibility contrast, and performance. Existing work is not production-approved.
