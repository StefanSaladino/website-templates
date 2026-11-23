# Source verification pass 2 — BED & BORDER's existing original photo links

_22 November 2026 · `feature/component-showroom` · exact publisher photo identity checks only_

Three original Unsplash URLs were present in the BED & BORDER (landscaping) website template's photo attribution footer, but **their source and creator fields were blank in the authoritative asset inventory**.

| Active asset | Official creator | Original page | Normalized linked image |
| --- | --- | --- | --- |
| TM-035 | Naoki Suzuki | https://unsplash.com/photos/a-stone-patio-with-steps-and-plants-in-the-foreground-V99f_PhYzmM | `photo-1722103155234-5e83b3effe03` |
| TM-050 | Sergej ***** (@skstrannik) | https://unsplash.com/photos/curved-stone-steps-lead-to-a-paved-patio-area-AqCTAOMJUVk | `photo-1761637823276-7d714eb45cb1` |
| TM-051 | Sergej ***** (@skstrannik) | https://unsplash.com/photos/stone-wall-with-plants-in-the-foreground-f7poIvVWtfg | `photo-1761637823941-0ffae96ec487` |

For each asset the official Unsplash page itself displayed the credited creator and an **Image** hyperlink matching the exact `images.unsplash.com/photo-…` identity in the source JSON. No third-party attributions or filename guesses were relied on.

These photographs are **not confirmed to be BED & BORDER project photos**, nor do their source pages establish a license covering all possible redistribution, brand and property contexts. The old pilot photo observations (including potential false project continuity, unverified construction claims and crops) remain unresolved.

The current inventory remains **62 active original-template third-party media identities: 8 with recorded source page and creator, 54 without**, and 0 approved. This document and source QA intentionally leave every `reviewStatus` as `needs-review`.

### Next steps

Trace remaining high-priority people/property/brand images to exact source pages, obtain any required releases and verify license scope for website templates. If rights or provenance remain unclear, use owned-original replacement artwork/photography rather than asserting permission. Retest all affected browser and accessible-media workflows after source changes.

## Cross-catalogue shared-image provenance — 22 November 2026

The new publisher match for original-template image **TM-035** also applies to **STOCK-017**, the same remote image used by independent `ANIM-04` preview. The previously anonymous component stock entry now credits **Naoki Suzuki** and the [exact Unsplash source page](https://unsplash.com/photos/a-stone-patio-with-steps-and-plants-in-the-foreground-V99f_PhYzmM). It retains `needs-review`, no approved local derivative and unapproved property/redistribution usage. Old claims that the source and creator were unknown were removed only from this record.

The component-source check now compares original-template and component provenance on shared image identities. It detects mismatched source/creator and forbids a shared remote reference being marked approved. Existing Pexels OFFCUT STOCK-011 overlaps remain subject to this same gate. No component or template was published.

## Previously recorded photo reverified — NORTHLINE TM-010

The public [Nastuh Abootalebi Unsplash photo page](https://unsplash.com/photos/hallway-between-glass-panel-doors-yWwob8kwOCk) was revisited on 22 November 2026. Its image hyperlink matched the existing `photo-1497366754035-f200968a6e72` identity. The page identifies **Sunday Digital in Munich, Germany** as the pictured office, further confirming it is unrelated to NORTHLINE's invented legal practice. `sourcePageVerifiedAt` was added and the exact source pinned in the checker. Rights and false affiliation remain unapproved. Counts remain **8/62** recorded exact source/creator, **54/62** missing, 0 approved.
