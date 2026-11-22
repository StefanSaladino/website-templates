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
