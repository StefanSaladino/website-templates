# CURRENT — property photo and fictional listing audit

_21 November 2026 · `feature/component-showroom` · four-photo visual screen only, zero rights approvals._

## Evidence

- [Four-photo private review run](https://github.com/StefanSaladino/website-templates/actions/runs/44946822298) acquired 4/4 transformed Unsplash JPEG candidates with 0 errors.
- Seven comparative crops per photo (desktop 16:9, 3:4, 5:4 and phone center/attention/contain 3:4 plus tall 3:5) are included in the seven-day `original-template-media-candidates` artifact. Crops are stress tests rather than real browser CSS previews.
- Source locations and ownership, addresses, agent/brokerage representation, genuine listing availability, asking prices, bedrooms, frontage, photographer identity and commercial redistribution permissions are **not verified**. All property names and details are fictional.

## Media review

| ID | CDN sample dimensions | Finding |
| --- | --- | --- |
| **TM-011** | 1800 × 2397 | Beachfront homes on supports above a sandy coastal shore with visible surf, not a verified Georgian Bay waterfront residence and not the photo used for the 'Drift House' hero. Narrow phone crops focus on the elevated decks; 16:9 stress crop loses much of the upper architecture. |
| **TM-041** | 1800 × 1350 | Modern waterfront house with orange roof/trim accents, timber/stone cladding, landscaping and a small dock visible. The photo is not known to show the fictional Drift House or Thornbury. The landscape original is reasonably framed in 16:9; narrow phone crops remove some shore and building facade. |
| **TM-057** | 1800 × 1200 | Dark living area silhouettes furniture in front of large windows overlooking water and vivid sunset clouds. This supports a lake-view interior photo description, but not the fictional Tiny Township listing, bed count or shoreline footage. Portrait crop keeps the central water view and loses side furnishings. |
| **TM-062** | 1800 × 1350 | Unfurnished concrete room with full-height glazing overlooking a valley, broad water and prominent mountain peaks. Mountain scenery contradicts the implied Georgian Bay setting; should be replaced with appropriate setting before commercial use. Centered 3:5 phone crop preserves most glazing but loses outer edges and adjacent context. |

## Sample JPEG byte fingerprints (not licensed original file hashes)

| ID | SHA-256 |
| --- | --- |
| TM-011 | `07cea211f714d7516bf5093544fef42a7839eb2ce2a82d52477293554b64e64f` |
| TM-041 | `bf472c6416de6db5da1bc455c915e1044e570aa168ef0e4e50f4f9c0d60db71a` |
| TM-057 | `09cfcc656ceda5ec3f7c6fc87cdd0ce43ed0403c54597afe0f523086f93cc8b2` |
| TM-062 | `7919dcf7c03bf58edbd792add411b59651e06de395786be223434923fd61dc56` |

## Development-template changes

- **Hero TM-041:** removed the false association between the unsourced house photo and a Thornbury-priced 'Drift House' property. The photo label now says `Stock photo study · Waterside architecture · Not a listing`.
- **TM-011:** corrected the original Georgian Bay waterfront description to the observed buildings above coastal beach/surf and flagged it for replacement before publication as a Georgian Bay sample. Narrow phone crops obscure the larger architecture.
- **TM-062:** corrected minimal interior descriptions to disclose a mountain/water outlook, not a confirmed Meaford property; flagged for replacement. Real wide/phone layout must still be reviewed.
- **TM-057:** described the visible dark living room and calm lake under pink sunset clouds without asserting a genuine Georgian Bay listing.
- All three real-estate narratives, map/regional associations, prices, bedrooms and shoreline dimensions are explicitly labeled fictional examples in a visible notice immediately before the homes, with example price metrics. The interactive `ANIM-13` rail now says its story photos are illustrative; the existing keyboard-accessible finite navigation remains.
- Removed unsupported individual photographer attribution. The footer identifies Unsplash examples with rights and creator still under review.
- The sample contact form displays an on-page status that **no brief was sent or stored**. Submission is suppressed, with a browser test verifying that claim and the listing disclosures.

## Remaining release blockers

1. Replace misleading coastal/mountain imagery with appropriate original Georgian Bay-style images where permitted; do not claim the replacement depicts any actual property until source and permissions are documented.
2. Verify the exact creator photo pages, copyright/license, third-party property/brand, ownership and consent implications of redistribution or implied agency representation.
3. Validate actual loaded templates at 320px, 390px, 768px and desktop. In particular test the hero overlay and photo-tag, coastal house 3:5 crop, mountain interior pan, carousel rail and responsiveness with photos loaded.
4. Preserve `needs-review` for all four images. No fake prices or listing representations should be promoted to public sales material. User approval and accessibility/device QA are pending.

**Next batch candidate:** `monolith-architecture` — four photographs, design attribution and completed-project misrepresentation risk.

## Original publisher identity and current gallery corrections — 23 November 2026
The earlier TM-041/TM-057 Unsplash visual observations and hash evidence above are **retired historical images**, not current template imagery. Replaced them in the original site and initial gallery:
- **TM-135 / hero:** [Sujan Shan, Pexels photo 15533042](https://www.pexels.com/photo/house-at-the-lake-15533042/). Pexels states Meaford, Ontario, 4000×2250, Free. Original photograph is an aerial view of a white lakefront house, stone shoreline, wooden dock, trees and a figure on the dock. Although truly Meaford, it is *not* a CURRENT property listing or affiliated property. Model/property and commercial template redistribution rights remain pending.
- **TM-136 / third example home and ANIM-13 third rail:** [April Choitz, Pexels photo 34701790](https://www.pexels.com/photo/cozy-interior-of-cabin-overlooking-lake-at-dusk-34701790/). Pexels credits the named photographer, 3815×2861, location Pennsylvania, USA, Free. The image depicts a warmly lit timber cabin interior and wooded lake at dusk. It does **not** show a Tiny Township or Georgian Bay property. North Window concept copy describes the actual pictured design only as an unrelated reference and retains the invented example metrics disclosure.
Both official publisher free-download JPEGs were inspected visually, and complete originals remain external CDN photo URLs with responsive `srcset`/`sizes` and intrinsic image dimensions. Removed a duplicated journal fiction warning, synchronized the initial gallery photo, and updated metadata, tests and retired-identity guards. **Real 320/390/768/1440 image-load and crop reviews must follow this commit**, plus native browser/assistive testing and media release approval. Existing source-paired TM-072/TM-073 remain separate. No real estate listings may be inferred from these images.

## Native 320–1440 photograph review — 23 November 2026
Real loaded-image screenshot evidence for commit `911bc90` ([loaded still-photo run 45279348399](https://github.com/StefanSaladino/website-templates/actions/runs/45279348399)) was inspected at 320, 390, 768 and 1440 pixels: all seven remote photo placements decoded at each size, zero overflow, zero errors. Two automatic crop flags concern existing unrelated asset placements (320px homes; 768px rail), not a failed image download. New TM-135 waterfront residence remains identifiable and TM-136 cabin lounge is recognizable in all sampled viewport captures. The 320/390 hero credit was visually cramped in a two-column photo-tag layout; a phone-specific one-column CSS rule now stacks the photo title and non-listing message below the frame. A Chromium geometry regression is included; rerun screenshot and browser QA at the new SHA before accepting. Final rights, personal/property release, designer, crop composition, mobile hardware, accessibility and stakeholder approvals are still required.
