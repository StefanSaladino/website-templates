# GRAIN & GABLE — woodworker stock, safety and content integrity audit

_22 November 2026 · `feature/component-showroom` · preliminary review only. No photo, depicted person or redistribution rights approved._

## Private evidence and method

- [GitHub Actions woodworker four-photo capture](https://github.com/StefanSaladino/website-templates/actions/runs/44989325684) downloaded 4/4 Unsplash transformed JPEG candidates without errors and generated 16:9 wide, 3:4 portrait, 5:4 landscape and four 3:4/3:5 phone crop stress tests for each.
- Downloaded samples are preserved in a seven-day private `original-template-media-candidates` workflow artifact. These are candidate samples, not licensed production originals or real responsive browser renders.
- All four original media identities remain `needs-review`. Each matches an unapproved component-stock item. Per-asset photographer/source-page evidence, person/property permissions, actual workshop provenance and commercial redistribution are unresolved.

## Photo findings

| ID | Candidate dimensions | Observed subject and material discrepancy |
| --- | --- | --- |
| **TM-043** | 1800 × 2700 | Tiered stained-wood planter troughs with dry vegetation against a masonry wall, not a verified cedar porch box with a hidden liner. 16:9 wide crop cuts away most tiers. |
| **TM-048** | 1800 × 1200 | Person barefoot while operating a powered circular saw near exposed feet. **Urgent replacement**, including reused component STOCK-013. Portrait crop further isolates operator and saw. |
| **TM-054** | 1800 × 2700 | Person in broad hat using a hand tool on timber at a bench. No evidence of a 36-inch white-oak wall shelf, workshop ownership or wood species. Wide crop cuts worker/body context. |
| **TM-055** | 1800 × 2700 | Two narrow white wall-mounted display ledges holding framed art and wooden cutting boards. Not a verified oak/maple rail-shelf commission. Wide crop loses upper shelving. |

## Exact downloaded candidate byte fingerprints

| ID | SHA-256 of captured JPEG (not licensed source original) |
| --- | --- |
| TM-043 | `6b24a8160ca78add5cc06d54fae4ee2a3c3542fc8b7bfefbe548d3e301d1dd23` |
| TM-048 | `b43abfde8668b5fd631e0c5dd9547d9366e2737b716c21f0a7206ab4c0428dd0` |
| TM-054 | `ee7f6819036c7c09bf2b3a693565a0b328c41cca99f80d84f072eb0e10d2a9d4` |
| TM-055 | `200834c400ee54f7ff317b591f7524d6213223853186faf13e6dc936e105ab89` |

## Corrections committed on review branch

- Replaced the unsupported Southern Ontario workshop claim and 36-inch white-oak product caption with explicit fictional / illustrative wording.
- Distinguished proposed cedar planter design from the **different tiered planter in the stock photograph**; updated alt text, shelf-photo descriptions and sample pricing language, without asserting real commissions.
- Added a visible portfolio-stock disclosure before the items and a warning in both workshop and carousel for TM-048. The image's unsafe footwear near powered equipment is **not acceptable professional practice**; the warning is only a temporary development safeguard and does not constitute approval.
- Updated original-image and shared `STOCK-013` metadata to flag the saw photo for urgent replacement; attribution, person releases and commercial permissions are still unverified.
- Made the HTML request form explicitly demo-only with a visible confirmation that no request was sent or saved. `ANIM-20` finite carousel remains usable, with accurate captions and button labels.
- Added Chromium smoke checks for the truthful planter alt, stock and unsafe-saw warnings, non-submitting request form and existing carousel navigation.

## Release blockers

1. **Replace TM-048 and STOCK-013** in the original template and any component previews before any commercial or production publication. Retire the unsafe stock photograph rather than using a warning as a substitute for safe imagery.
2. Verify exact Unsplash photo-page provenance, photographer, permission for reuse/derivatives, third-party person/property restrictions and commercially usable local responsive crops for all remaining images.
3. Check loaded photo framing and text on 320/390/768/1440px browsers and physical devices. Wide crops cut the tiered planter, the product ledges and much of the workshop scene.
4. Obtain stakeholder approval for fictional products/prices and replace them with verified offers on any real business site; ensure contact delivery and consent are configured before launch.
5. Leave all assets marked `needs-review` and do not promote components or merge `main` before the release gates are met.

**Next batch:** `event-launch`, the four identity records TM-045, TM-049, TM-052 and TM-056, to review performer imagery, event attribution and ticketing claims.

## Follow-up remediation — unsafe photo retired (22 November 2026)

**TM-048** and the linked **STOCK-013** have been retired from active source and media registers. Their original SHA-256 fingerprint and safety observations remain above as historical evidence, not an approval or an active media asset.

The original GRAIN & GABLE template no longer displays the barefoot powered-saw operator in its workshop section or its ANIM-20 carousel. Those two placements now use separate original CSS joinery drawings. The ABOUT-02 and isolated ANIM-20 previews also replace that unsafe photograph with original image-free illustrations. The three-step carousel remains interactive, keyboard-operable and subject to reduced-motion preferences. The remaining external woodworker photographs are still review-only.

**Active register after remediation:** 25 component stock records (formerly 26) and 70 original-template remote identities (formerly 71: 69 still image/poster references plus one Pexels video). Rights approvals remain **zero**. Media validators now explicitly reject the retired URL identity or reintroduction of either obsolete asset ID. Browser regression checks assert the new illustrated positions.

The source-pilot table above intentionally documents four originally screened photographs, including the retired fourth image. Do not use its historical counts as the current live-URL inventory. Any future real business deployment needs verified work, appropriate safety context and authorized imagery, not just a replacement illustration.

## Publisher-attributed component and template photography — 23 November 2026

The original Unsplash photo entries TM-043, TM-054 and TM-055 (including the historical thumbnails and crop hashes above) have now been retired from active source. Their replacements are **real photographs** with publisher-verified photographer names, exact Pexels original download IDs and Free-license listing:

- **TM-120 / STOCK-012:** [Daniel Reche, hand-planing timber (photo 7109999)](https://www.pexels.com/photo/a-person-using-a-wood-planer-7109999/). Replaces the untraced woodworker hero, catalogue thumbnail and ABOUT-02 / INTRO-03 component images; the identifiable craftsperson is unrelated to the fictional studio.
- **TM-121 / STOCK-025:** [Fallgregg, tiered outdoor wooden planters with roses (photo 8850241)](https://www.pexels.com/photo/garden-flowers-on-wooden-planters-8850241/). Replaces the sample Porch Planter photo and ANIM-20's first image. The real tiers and flowers are not the proposed single cedar box or proof of product materials.
- **TM-122 / STOCK-026:** [Manish Jangid, three wooden display shelves against brick (photo 31922898)](https://www.pexels.com/photo/rustic-brick-interior-with-wooden-shelves-and-decor-31922898/). Replaces the Rail Shelf sample and ANIM-20 second image; the real display is unrelated to a specific front-rail custom order.

The three shared stock IDs remain **STOCK-012/025/026**, so component relations and their review routes do not break. The canonical media inventory uses new TM IDs with creator/publisher verification dates; component manifests provide matching source pages and independent-stock disclaimers. Synchronized the full template's five source uses, original catalogue thumb, ABOUT-02 and INTRO-03 photo-led source, finite ANIM-20 photo slides and carousel descriptions, source/retirement tests, and review batch. No fake shop employee, fictitious wood species, commissioned image or unsupported 36-inch white-oak shelf claim remains on the gallery image. The previous unsafe powered-saw photograph remains retired.

The loaded photo workflow now captures **.workshop** in addition to .hero, .pieces and .craft-showcase at 320/390/768/1440. Current original template source identity ledger: **74 total; 59 with official publisher/creator; 15 untraced; 0 rights-approved**. Component stock: **25, all review-only**. Photographer/source attribution and a Free-labelled Pexels page are not full commercial redistribution approval or consent from depicted workers/property owners; review cropping, screen readers, mobile devices, licensing and client suitability independently. Do not merge `main`, promote components to live or close steps 18/19 on this evidence alone.

## Verified crop remediation — 23 November 2026

The first live loaded-image evidence on the source-replacement revision [workflow run 45179704970](https://github.com/StefanSaladino/website-templates/actions/runs/45179704970) confirmed all six remote woodworker images decoded at the tested widths but **correctly failed the 1440px planter crop gate**: the 1120×680 panoramic carousel frame exposed only 40.3% of the portrait photo, cutting away much of the stepped planter construction. The first carousel slide still had historical alt text describing dry plants and stained troughs even though the new image depicts blooming roses; corrected it. The desktop/tablet carousel now uses a 900px maximum width and a 550–750px tall image stage, producing a more balanced ratio for portrait photography while preserving the 430px phone-specific stage. The responsive source width hints for both carousel images have been updated. The existing crop gate remains at a minimum visible fraction of 0.5 and now identifies the currently active publisher photo ID and slide rather than matching outdated descriptive words. This is a real source-photo art-direction fix, not a weakening of the checker. The corrected revision still requires an actual new screenshot and test pass before closure; property/model/copyright approvals remain blocked.

## Isolated ANIM-20 art-direction parity — 23 November 2026

The isolated review component initially retained a 1120×680 wide photographic stage even after the original GRAIN & GABLE page's planter-crop correction. Updated the standalone `components/previews/ANIM-20` to the same 900px-wide, 550–750px desktop portrait-friendly frame, preserving the original mobile 430px stage and finite controls. Both independent photo slides now have intrinsic dimensions, asynchronous decoding and appropriate responsive `srcset`/`sizes`. Browser smoke additionally tests wide-stage aspect ratio, two responsive images, and publisher-photo identity on the isolated preview. Full-template and isolated source references remain synchronized without promoting stock to release-approved.
