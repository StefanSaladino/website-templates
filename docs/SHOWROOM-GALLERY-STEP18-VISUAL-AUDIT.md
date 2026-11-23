# Step 18 — original 24-template gallery: evidence-based visual audit

_23 November 2026 · feature/component-showroom · latest independently reviewed source commit `1356c20` · **preliminary screenshot review, not a final Step 18 signoff**_

## What actually passed

The [original gallery screenshot workflow 45281510063](https://github.com/StefanSaladino/website-templates/actions/runs/45281510063) ran against commit `1356c20530b13a97aae4dc5d3c38901e0445b86d`. The artifact `original-gallery-thumbnail-evidence` (artifact ID `14870695659`) contains **96 real Chromium screenshot files**, one per **24 unique original templates × 320, 390, 768, 1440 CSS pixel viewports**, plus `results.json`.

The captured JSON reports **zero hard errors**, exactly **24 valid gallery routes and visible thumbnail geometries per width**, **24 Preview labels per width**, all **22 external photo placements decoded per width**, **no unexpected film requests**, no JavaScript page errors and no document-level horizontal overflow. Thumbnail widths remained in bounds (320px: 288px; 390px: 358px). Screenshot pixel evidence for all 96 captures was visually compared at a consistent readable montage scale. No obvious cut-off thumbnail headline, missing brand panel, broken hero-image area or displaced Preview chip was observed in these review captures; legibility and photography are *preliminarily acceptable*, not client-accepted.

The browser audit now records a physical `badgeBounds` measurement for each card and fails when a Preview chip disappears, is clipped outside the thumbnail, becomes fully transparent or shrinks below 30×12 CSS px. These are necessary geometry checks, **not measured WCAG contrast or a substitute for subjective art direction**. The source-provenance gate is also tightened: all 74 original-template external media identities must continue to have dated original-publisher and creator records. Neither enhancement records approval of release rights.

## 24-card visual audit ledger

In each row, the first four widths passed **loaded screenshot, route, geometry and badge** review. Every row remains **manual signoff pending**; the fourth column identifies a specific later acceptance focus rather than a newly discovered defect.

| Original template | 320 / 390 / 768 / 1440 | Manual signoff | Additional review before real client use |
| --- | --- | --- | --- |
| Creative Agency / OFFCUT | pass / pass / pass / pass | pending | Model, brand, original film/poster and commercial-use context |
| Real Estate / CURRENT | pass / pass / pass / pass | pending | Private waterfront property, non-listing claims and architectural photo permissions |
| Restaurant / SERA | pass / pass / pass / pass | pending | Actual restaurant/interior copyright, unrelated venue and potential venue identity |
| Quiet SaaS | pass / pass / pass / pass | pending | Small device-preview text, 200% zoom, CTA contrast and real product copy |
| Dark Tech / KERN | pass / pass / pass / pass | pending | Dark-on-dark microtext and reduced-motion controls at native display sizes |
| Architecture / MORROW | pass / pass / pass / pass | pending | Architectural author / private home rights, illustrative no-client disclaimers |
| Fitness Launch / YARD | pass / pass / pass / pass | pending | New cinematic unbranded barbell hero needs phone crop/contrast acceptance; no YARD affiliation or gym ownership |
| Contractor / LINE + LEVEL | pass / pass / pass / pass | pending | Depicted worker/property releases and unverified original building works |
| Custom Bakes / DOT + CRUMB | pass / pass / pass / pass | pending | Unrelated cakes/cookies, edible-product authorship, photo redistribution |
| App Launch / Tide | pass / pass / pass / pass | pending | Small app mockup lettering / real PWA usability at 320px |
| Waitlist / STILL | pass / pass / pass / pass | pending | Preview-only service/product claims and form submission semantics |
| Editorial Commerce / RANGE/FOUND | pass / pass / pass / pass | pending | Real hikers, product-branded items and no fictional brand endorsement |
| Event Launch / AFTER DARK | pass / pass / pass / pass | pending | Actual performers, concert visitors and ticket-sale/venue implications |
| Law Firm / NORTHLINE | pass / pass / pass / pass | pending | Imaginary legal practice vs a legally identified, licensed firm |
| Storefront / MORA | pass / pass / pass / pass | pending | Editorial product packaging, branded real goods and shop/cart preview semantics |
| Interactive Playground | pass / pass / pass / pass | pending | Touch/keyboard access, motion and colour differences on real devices |
| Morrow House Retreat | pass / pass / pass / pass | pending | Real cottage/private property photo permissions and fictional bookability |
| Woodworker / GRAIN & GABLE | pass / pass / pass / pass | pending | Real maker/worker rights, photo attribution and not-for-sale product samples |
| Landscaping | pass / pass / pass / pass | pending | Actual garden/property work attribution, phone/desktop visual contrast |
| Pools / TIDEFORM | pass / pass / pass / pass | pending | Architectural/property use, strong mobile hero crop, no construction promises |
| Tattoo Studio / BLACKLINE | pass / pass / pass / pass | pending | Tattoo artist and customer likeness/artwork; no actual bookings |
| Monolith Architecture | pass / pass / pass / pass | pending | Architectural design attribution, private property rights, decorative crop |
| Frame Portfolio | pass / pass / pass / pass | pending | Recognizable models, stylized portrait use / apparent photographer affiliation |
| Garage Detailing | pass / pass / pass / pass | pending | Worker/vehicle identification, trademark and implied past work |

**Result:** 24/24 original gallery concepts have a visually coherent **preliminary** thumbnail at four tested widths. **0/24 are released or signed off**. The 24 entries are not the same as the 157 isolated component gallery previews or 44 optional alternate mobile layouts.

## Rights interpretation reviewed against actual official publisher rules

- [Pexels official license](https://www.pexels.com/license/) explicitly permits use in a *template you sell*; it prohibits redistribution as a stock/wallpaper library, unaltered standalone resale and implying that identifiable people/brands endorse the product. [Pexels commercial-use guidance](https://help.pexels.com/hc/en-us/articles/360042295214-Can-I-use-the-photos-and-videos-for-a-commercial-project) confirms that depicted trademarks, artwork or people can require separate permissions. **Do not treat every Pexels image as disallowed in website templates, or as automatically approved for every use.**
- [Unsplash license](https://unsplash.com/license) is broad for commercial photo use, but [Unsplash's Releases and Trademarks guidance](https://help.unsplash.com/en/articles/2612329-releases-and-trademarks) warns that recognizable models, private properties, copyrighted objects and third-party trademarks are distinct rights not guaranteed by a photographer attribution. [Unsplash product resale guidance](https://help.unsplash.com/en/articles/2612317-can-i-use-unsplash-images-as-part-of-a-product-to-sell) distinguishes website use from selling standalone photo products. Evaluate actual client/template packaging before authorizing redistribution.
- Source identity is **74/74 originals**, but documented **rights approvals are 0/74**. **15 active high-priority original-template identities** deserve manual person/trademark/asset-specific work first; the remaining 58 require normal source/crop/use-context review. The independent 25 component-stock identities and 1 opt-in video have their own clearance paths. No general legal opinion or model/property release is being asserted.

## Remaining Step 18 and Step 19 gates

1. **Step 18 — human art-direction and client acceptance:** Review original-resolution individual screenshots, especially at 320px, on actual iPhone/Android and desktop Safari/Chrome. Check headline sizing, readable overlays, iconography, brand distinction and product/story integrity; record per-template reviewer, decision and date. A passing screenshot workflow alone does not close Step 18.
2. **Step 19 — full release:** Check full responsive templates beyond thumbnail cards, 200–400% zoom/reflow, keyboard-only journeys, real screen readers (VoiceOver/TalkBack), colour contrast, reduced motion, no-JS fallbacks, photo rights including person/property/trademark, load budgets and stakeholder approval. Do not infer these from Chromium screenshot captures.
3. **Risk-first rights review:** After retiring high-risk YARD lifter `TM-018`, start with `TM-001` and `TM-071` (OFFCUT person/film), `TM-002` (FRAME brand/person), and `TM-113/114/115` (real concert people/performers) to determine replace/retain-with-release. Continue the other currently high-priority entries; no unsigned release of real client sites.
4. **Branch protection by workflow convention:** Preserve gallery `Preview` badges, `in-review` component metadata and zero release-approved external media until independent evidence is documented. Do not merge `main` or label the templates production-ready from Step 18 geometry checks.

**Evidence classification:** Completed automated capture and manual montage inspection; original-source attribution complete; legal rights, native-device accessibility, individual visual signoff and production deployment **NOT approved**.

## YARD hero risk retirement — 23 November 2026
The previous 96-screenshot visual observations about the *old* YARD thumbnail remain valid historical evidence for commit `1356c20`, not a signoff on the new image. A later source modification retired TM-018 (recognizable lifter and ROGUE-branded rack) and introduced TM-138 (Tima Miroshnichenko, original Pexels 6389074, stationary loaded barbell) for both YARD hero and gallery. This removes the highlighted model/trademark photo risk without claiming image rights approved. The new screenshot set at 320/390/768/1440, publisher use context and all human art-direction approvals must be reviewed before closing gallery Step 18. Existing 24-gallery Preview badges remain review-only.

## OFFCUT hero/gallery photographic change — 23 November 2026
The original 96 captures at commit `1356c20` are historical green model imagery for OFFCUT and do **not** represent the new design. Its person/model/4K film identities have been replaced with real publisher-attributed people-free textile motion (Mikhail Nilov, Pexels 7677235, publisher's 18-second 1080p default). The featured original gallery shows a red silk poster and SAMPLE / 00:18; there is no invented real Toronto office or client. Fresh 320/390/768/1440 real-image thumbnail crops and original hero headline contrast require inspection before any Step 18 visual acceptance. The shared component previews are migrated separately but do not count as original gallery signoff. 74 source identities remain traced, 13 high-priority, 0 rights-approved.
