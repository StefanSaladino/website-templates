# Phase 2 — Six Example Implementation Status
Branch: `feature/component-showroom`. The current release state is **in review**, not live.

## Built
- NAV-03: transparent photographic hotel header, sticky scroll treatment, mobile full-screen navigation, Escape/Tab handling and focus isolation.
- HERO-01: full-bleed photograph hero with functional page anchor.
- GAL-02: fashion-editorial asymmetric gallery, category filtering, keyboard-operable lightbox, focus restoration.
- SRV-03: alternating renovation photography with native expandable service details.
- CTA-02: sunset-image CTA linked to a real on-page destination; no fake booking confirmation.
- FORM-01: required fields, validation, local-only generated inquiry draft and copy control; no backend and no pretended submission.

## Checks completed
- Source-level JavaScript parsing with `node --check` for each preview script.
- All local anchor destinations exist in their HTML examples.
- Source-page research verified these images are presented as free-to-use under the Unsplash License; details recorded in stock manifest.
- Remote image URLs are *temporary development references*. Stock files are not yet hosted locally.

## Release blockers
1. Acquire licensed original files and review model/property/trademark rights, especially portraits and interior images.
2. Generate local responsive WebP/AVIF variants; replace remote URLs; confirm image dimensions, alt text and meaningful crops.
3. Capture finished screenshot thumbnails from **loaded real photos**; update each metadata thumbnail path.
4. Real browser navigation was **blocked by the container's browser environment** on this pass, so visual/mobile test results and keyboard interaction runtime cannot be claimed. Re-run all viewport checks and interaction tests on a functional browser, including Safari.
5. Validate full production Vite build, Lighthouse/accessibility scan, and any available build/deployment preview.
6. Only then promote status from `in-review` to `live` and expose publicly.

Do not merge or publish this branch as a production-ready component collection yet.
