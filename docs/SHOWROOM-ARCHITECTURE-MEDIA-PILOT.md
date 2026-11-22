# MORROW — architectural photo provenance and fictional portfolio integrity

_22 November 2026 · feature/component-showroom · preliminary photograph inspection only; 0 rights approvals._

## Private preview evidence

- [Architecture candidate workflow](https://github.com/StefanSaladino/website-templates/actions/runs/45056106454) generated 2/2 1800px-wide source previews, desktop 16:9 and portrait alternatives, and phone crops; no download failures. One earlier run failed because an offline-test variable was redeclared; the test was corrected before the successful run. Candidate files and crop artifact are private seven-day QA evidence, not redistributable product photos.
- Neither candidate is verified as a MORROW design, the advertised site, or a completed project. Exact Unsplash source-page match, photographer, architectural property permissions, designer credit and commercially redistributed rights remain open.

## Per-image findings

| Image ID | Preview dimensions | Visible content and material risks |
| --- | --- | --- |
| **TM-042** | 1800×1198 | Sunset photo of a large multi-wing white residential building with mixed stone-clad lower sections, grey roofs and tower-like upper sections; sweeping wet-looking broad light-grey concrete driveway, low stone wall and planted bed in foreground. No evidence the home is in Georgian Bay, dates to 2026, is called Field House, or was designed by MORROW. Narrow phone crop cuts off house wings and changes building scale. Landscape crop retains wider front and more of the driveway. |
| **TM-058** | 1800×2700 | Monumental upward-looking black-and-white architectural photo from a tall rough concrete space/void; several heavy geometric rectangular beams interrupt an intensely bright angular ceiling aperture and light enters from above. No furniture, oak, linen, planted courtyard, residential rooms or identifiable skylight glazing shown. Cannot infer Toronto address, 3400 sq ft, 2025 completion, residential program or affiliation with MORROW. Wide crop omits bright opening, making the space read as abstract concrete rather than an architectural shaft; tall crop preserves aperture context. |

## SHA-256 of captured transformed JPEG samples

| ID | SHA-256 |
| --- | --- |
| TM-042 | `8e210e1b646ebcd83f0beb9deab6c1dc42bec549effbb67cb6d4a17982c2eb65` |
| TM-058 | `02ea72a08ff5ac9359783e2a36309db2d9875153a7734f5e7cd04c8000ef37e3` |

## Corrected template claims

- Header/hero now states that **MORROW is a fictional, non-operating architecture practice**, and visibly identifies both photographs as unrelated architectural stock examples. The hero alt matches a large suburban white/stone residence, landscaping and driveway, rather than implying a 'Field House' in Georgian Bay.
- Removed fabricated `Field House · Georgian Bay · 2026`, `House 17 · Toronto`, 3,400-sq-ft area, 2025 completion, board-formed concrete structural claims, oak/linen interior and planted courtyard construction claims. The concrete photograph remains an illustrative study of dramatic overhead light, not an attributed residential commission.
- Removed unverified offices in Toronto/Copenhagen and claimed new commissions beginning Spring 2027. Services are now conceptual examples, not representations of professional practice, availability or licensure.
- Former `mailto:studio@example.com` CTA is now a button providing an accessible **no-request-sent** preview message; no form data, project requests or appointment bookings are made.
- Retains visual editorial layout, existing parallax, responsive behavior and `ANIM-03` photo-mask replay, with browser smoke tests for new truthfulness and contact behavior. Visible photo-use labels do not claim rights or source approval.

## Release blockers

1. Verify exact photographer and source pages, reproduction/commercial rights, architectural design/property rights and any trademark/representation restrictions for both samples.
2. Actual architecture work requires verifiable design attribution, project and client authorization, city, area, completion history and responsible licensed practice; do not substitute fictional cases as completed work.
3. Inspect published 320/390/768/1280/1440 crops. Tall TM-042 phone crop removes building wings; wide TM-058 severely crops the roof aperture/daylight context. Consider redesigning crop strategy before using as editorial references.
4. Confirm current-commit CI, Pages, Playwright Chromium and reduced-motion tests. All photo rights remain unreviewed; do not publish as approved work.

**Next family:** `contractor` (2 images), then `law-firm` (1 image).
