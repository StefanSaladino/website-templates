# Loaded-image crop triage — observed defects and acceptance boundaries

_22 November 2026 · `feature/component-showroom` · review evidence, not design/license approval_

## Evidence

- Initial extended seven-batch loaded-still run: [45082643331](https://github.com/StefanSaladino/website-templates/actions/runs/45082643331).
- Initial scan covered 19 external-image/template identities (76 viewport cases) and flagged **30 image-by-width occurrences** across 19 source images. These counts include two MORA hero occurrences that were later removed with all three unrelated branded photographs.
- The current source inventory has **18 templates using external media**, since MORA uses original illustrated hero, bathroom and material scenes instead.
- Object-fit source-visibility fraction describes image crop severity, **not** visual acceptability, photo licensing, subject suitability or contrast.

## Confirmed issues corrected in source

| Template | Evidence | Finding | Correction | Regression gate |
| --- | --- | --- | --- | --- |
| MORROW architecture | `professional/architecture-320-hero.png` | Fictional-practice disclosure at 320px overlaps the small hero-index line. Main H1 remains legible. | Move the index and photo-attribution label below the disclosure for widths up to 350px, leaving disclosures present. | Loaded-image Chromium checks disclosure bottom before hero-index and index before source note with at least 8px separation. |
| GRAIN & GABLE woodworker | `portfolio/woodworker-1440-pieces.png` | The portrait planter is squeezed into a 641×360 crop (37.5% of source area visible) and reads primarily as timber/wall, rather than a planter. | Taller desktop portrait display at 981px and above; no stretching or misleading replacement photo. | Loaded-image Chromium checks the planter at 1440px shows at least 50% of the source by measured cover geometry. |

## Flagged compositions sampled without automatic changes

The tall, vertically constrained hero images in RANGE/FOUND, YARD, BLACKLINE, TIDEFORM and Morrow House retain recognizable context and readable major copy in the sampled captures. The AFTER DARK 1440px concert scene is intentionally dark behind a large typographic overlay. Several MONOLITH portrait project crops still show architecture and their active project labels, though the original property/creator rights remain unverified. These observations do **not** grant final visual approval; verify full 320/390/768/1280/1440 viewport sets, text readability, reduced motion and real-device interaction.

MORA's prior 320/390 crop flags are **retired sources**, not a crop adjustment: its ENDLESS PURE, NORDIC and unrelated sink stock photographs were removed entirely. Preserve the forbidden-media regression IDs.

## Next acceptance actions

Review the latest still-image artifacts after these source changes, including the resulting MORROW and GRAIN section screenshots. Reinspect remaining flagged source identities individually with actual subject/framing and text contrast. Consult the media-provenance ledger for photographer, license, property/model rights and replacement needs; **zero external assets are rights-approved**. Native Safari/VoiceOver, Chrome/TalkBack, NVDA and other human checks remain open. This triage does not change any `in-review` catalogue status or authorize release.
