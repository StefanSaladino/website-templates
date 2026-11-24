# AFTER DARK — fictional event media and ticketing integrity audit

_22 November 2026 · `feature/component-showroom` · image preview only; 0 rights approvals._

## Evidence

- [Isolated four-photo capture](https://github.com/StefanSaladino/website-templates/actions/runs/45033830833) downloaded 4/4 transformed Unsplash 1,800px JPEGs with zero errors. Temporary private seven-day review artifact includes seven candidate crops per photo.
- The comparison images are geometric stress-test crops, not screenshots of actual loaded desktop/phone layout. Photographer identity, source-page rights, model/event/venue permissions, branded signage and redistribution scope remain unknown.
- **October 17, 2026 is in the past** on the review date; there is no verified AFTER DARK performance, booked Hamilton venue, artist appearances, admission policy, public street address or ticketing inventory.

## Per-photo findings

| ID | Temporary sample dimensions | Observed content and risk |
| --- | --- | --- |
| **TM-045** | 1800×1200 | Black-and-white music venue view across audience silhouettes toward an unoccupied-looking stage with drum kit, microphones and spotlights; no performing band clearly visible. Hero/venue usage would falsely locate it at fictional harbour warehouse. Portrait phone crops lose some stage equipment and crowd context. |
| **TM-049** | 1800×2700 | Vertical crowd-and-stage photograph with saturated red lights, a lit stage backdrop and illuminated script-like signage near the top. Branding/location and depicted performance are not linked to the fictitious AFTER DARK lineup. Wide crop cuts much of venue crowd/vertical setting; phone crop resembles full portrait but excludes surrounding stage edges. |
| **TM-052** | 1800×1016 | Wide-angle photograph of enormous indoor arena concert with extended runway, pyro flame jets, smoke and audience throughout large stands; a clear mismatch to small two-room harbour warehouse and the invented MAIN ROOM 00:42 caption. Tall phone stress crop cuts grandstand scale and side stage. |
| **TM-056** | 1800×1201 | Elevated view of enormous dense outdoor music crowd toward brightly lit stage and advertising signage. Not a SIDE ROOM 01:17 shot or proof of this event; vertical crops discard much of crowd width. Venue and identity/trademark evidence unverified. |

## Candidate JPEG SHA-256 (not licensed originals)

| ID | SHA-256 |
| --- | --- |
| TM-045 | `f5ab0f3f23641cbb1da517190c344d78bfbc33bb1fee58a0cef6120bf503bd34` |
| TM-049 | `76bb59b143d70d7a540191431fa7fa96ebf0d3115268d329d8517c6fd6e50e65` |
| TM-052 | `4f524ca63298f707e67d90125727e22c4e5dc773fe8947bb0e0abd78746942fe` |
| TM-056 | `d8ac63bd47fa165d4f42180492b49267dcccaaa1ea09481a6cf1a8fad98ce4b6` |

## Template and QA changes

- Clearly labels the whole page as a fictional template and the past October 17, 2026 date as an example, visible before the poster. Eight invented artist names, running order, room plan and ticket tiers are placeholders.
- Renamed all 'Get tickets' prompts to sample-ticket navigation and disabled any implication of real admission or checkout. Ticket status text is `Sample only`, and the demo button explicitly reports that no tickets are sold or bookings made.
- Removed fictional exact street-address and unsupported twelve-minute transit claims; explains the harbour venue is an unbooked design concept, with entry-time and 19+ labels only examples.
- Replaced TM-052's fabricated main-room timestamp and TM-056's side-room timestamp with unrelated arena/outdoor stock references. Revised alt text to truthfully describe the visuals, including the black-and-white drum stage of TM-045.
- Added visible near-photo disclaimers and regression checks verifying the top-page note, fictional artists, truthful arena alt text, non-booked venue, missing fake street address and demonstrator-only ticket behavior.
- Preserved 8-artist poster typography, responsive layout, and `ANIM-08` replayable headline; do not interpret design as a real event announcement.

## Remaining blockers

1. For all four exact identities, locate original Unsplash page/creator and document license, commercial distribution/derivatives, identifiable persons, logos, stage/show identifiers and event endorsement restrictions.
2. Replace unrelated recognizable concert/arena photos with approved conceptual visuals or explicitly cleared event materials before production; do not imply another artist performed here.
3. Test 320/390/768/1440px loaded-photo rendering in Chromium and on real devices. Arena crowd/context is lost in tall phone crops, and TM-049's wide hero crop discards much of the vertical scene. Check notice/venue caption contrast and mobile menu.
4. Keep all four original photos `needs-review`, with zero media/venue/schedule approvals. No commercial ticket link, false sales scarcity or announcement until genuine event documentation and stakeholder release authorization.

**Next batch:** `custom-bakes` — three photos and likely product/food claim accuracy.

## AFTER DARK official photographer-source replacement — 23 November 2026 (supersedes earlier candidate URLs)

Four historical Unsplash candidates TM-045/049/052/056 were removed from active template use. The current photographic set consists of original, identifiable **real Pexels photos**, not AI-generated art:

- **TM-113 / hero:** [Felipe Balduino, Pexels photo 17718206](https://www.pexels.com/photo/crowd-at-concert-17718206/) — Concertgoers holding phones in a crowd lit by intense red lighting at an unrelated live performance. Former identity TM-049 retired.
- **TM-114 / poster-left:** [Big Bag Films, Pexels photo 8512413](https://www.pexels.com/photo/band-playing-on-small-stage-8512413/) — Independent small indoor band performing under magenta lights with keyboard, saxophone, guitar and drums. Former identity TM-052 retired.
- **TM-115 / poster-right:** [Jeremy Li, Pexels photo 30215324](https://www.pexels.com/photo/vibrant-indoor-concert-with-dynamic-lights-30215324/) — Independent crowded indoor concert with raised hands, bright stage lighting and plumes of show haze. Former identity TM-056 retired.
- **TM-116 / venue:** [Sašo Vukadinović, Pexels photo 33094348](https://www.pexels.com/photo/dimly-lit-concert-stage-with-drums-and-amplifiers-33094348/) — Unoccupied dim indoor stage with drum kit, speakers, microphone stands and blue-green lighting. Former identity TM-045 retired.

The full demo source, original gallery thumb, alt descriptions, captions, near-photograph visible rights disclaimer, manifest, queue and regression tests now use these independent real photographs. Existing ANIM-08, mobile menu, fictional artist lineup, date, sample tickets, sample venue and no-checkout behavior are unchanged. **Source records identified: 53/74, still missing: 21, all 74 remain `needs-review`.** Follow-up: actual loaded-photo captures at 320/390/768/1280/1440 widths, image crops and legibility, stage/gear and crowd likeness or brand permissions, regional commercial template reuse and stakeholder signoff. Pexels Free source labelling is not consent from performers or permission to imply affiliation. No remote photo was considered an approved local derivative; no merge or `live` release.

## Responsive image delivery — 23 November 2026

All four independent Pexels photos now retain explicit 3:2 intrinsic dimensions and asynchronous decoding, with responsive `srcset` candidates of 480/800/1200/1600 and 2200/2400 where their slots need the extra resolution. The full-width red-crowd hero declares `sizes=100vw`, `fetchpriority=high`, and eager loading. The two poster images and stage reference declare phone/desktop display widths and remain lazy, preventing full 1600–2400px download for every phone regardless of screen/device pixel density. The source inventory still matches unchanged canonical CDN paths, and gallery preview remains a separate conservative derivative. Browser smoke now asserts these contracts. Actual network savings, per-device sharpness, CSS crops and human photography acceptance must be checked in regenerated browser artifacts; stock redistribution rights remain unapproved.

## Poster-break screenshot coverage — 23 November 2026

The automatic loaded-photo campaign review previously decoded all four AFTER DARK stock photos but captured only `.hero`, `.lineup` and `.venue` screenshots; the two portrait-cropped poster photographs were **not** visually captured. The campaign's review batch now includes `.poster-break` at 320, 390, 768 and 1440 CSS pixels, and its offline fixture enforces the new coverage. Existing downloadable evidence for the hero/venue confirms successful image decoding, no root overflow, and zero attempted film requests, but poster visual approval remains pending review of the fresh screenshots. The source/creator ledger remains 53/74, with zero approved media rights.

## Poster typography overlap correction — 23 November 2026

The new four-width loaded-photo screenshot workflow (passed [GitHub Actions 45173992489](https://github.com/StefanSaladino/website-templates/actions/runs/45173992489)) revealed a real **1440px** poster layout issue: the right independent concert photo painted over the rotated `LOUD ENOUGH` headline, concealing most of the final letters. At 320/390px the unrotated editorial title remained readable. A desktop-only stacking layer now keeps the typography above the adjacent photo, with dark contrast shadow for the bright image area; mobile remains unchanged. Added desktop browser assertion. Human review of the new corrected screenshot and rights/model approval remain open; the previous artifact proves the defect, not its closure.

## AFTER DARK person-association mitigation — 23 November 2026
Replaced the three recognizable audience/performer references TM-113/114/115 with [TM-141, Yan Krukau](https://www.pexels.com/photo/a-stage-set-up-ready-for-a-live-performance-9001997/); [TM-142, Isabella Mendes](https://www.pexels.com/photo/red-lights-on-a-stage-5389623/); [TM-143, Filipe Braggio](https://www.pexels.com/photo/lights-on-a-stage-in-the-dark-10809871/). Publisher pages and their exact CDN link identities, dimensions and Free labels were checked; actual image bytes were not independently inspected in this pass. The empty-stage reference TM-116 remains. Responsive photo slots, gallery, accurate descriptions and source guards are synchronized. The fictional event, ANIM-08 and no-sales behavior remain intact. New loaded-photo visual checks, property/equipment marks and commercial redistribution signoff are still required; zero approved media.
