# Original-template media clearance queue

_22 November 2026 · `feature/component-showroom` · current JSON-derived working snapshot, **not a license or release approval**_

## Release-blocking inventory

- **74 active external media identities:** 73 still/poster images and 1 opt-in 4K video
- **45 without verified/recorded source-page links** and **45 without recorded creator credits**. Every recorded original photo page requires its own exact-link verification date; source identity verification still does not establish rights approval.
- **0 rights-approved assets.** All 74 remain `needs-review`
- **25 first-priority review records** with people, branding, replacement or video-related flags; 49 follow-on records
- MORA's TM-034/TM-038/TM-067 third-party branded photos and other retired IDs are **not active candidates**. Do not resurrect them

The canonical record and enforceable usage scanner are `components/data/template-media-inventory.json` and `components/scripts/check-template-media.mjs`. Attribution is not legal approval. Unsplash's broad copyright license does not automatically grant rights to recognizable people, brands, artwork, or private property, and stock packs used in products/templates require contextual review.

## High-priority queue — 25 active records

| Asset | Original template usage | Current provenance | Recorded issue clues |
| --- | --- | --- | --- |
| TM-001 | creative-agency | Recorded source page; cottonbro studio | depicted-person, visible-studio-tracking-markers, phone-hero-crop-needs-browser-acceptance (+2 more in JSON) |
| TM-002 | frame-portfolio | Recorded source page; Clark Street Mercantile | visible-brand, property-rights-unverified, model-context-unverified |
| TM-004 | frame-portfolio | Source page missing; Creator missing | depicted-person, model-rights-unverified, attention-phone-crop-poor |
| TM-009 | frame-portfolio | Source page missing; Creator missing | depicted-person, model-rights-unverified, mobile-crop-loses-context |
| TM-012 | frame-portfolio | Source page missing; Creator missing | depicted-person, wide-crop-cuts-face, model-rights-unverified |
| TM-013 | frame-portfolio | Source page missing; Creator missing | depicted-person, wide-crop-loses-subject, model-rights-unverified |
| TM-014 | frame-portfolio | Source page missing; Creator missing | depicted-person, alt-text-corrected, wide-crop-cuts-face (+1 more in JSON) |
| TM-015 | frame-portfolio | Source page missing; Creator missing | depicted-person, alt-text-corrected, visible-lettering (+2 more in JSON) |
| TM-016 | frame-portfolio | Source page missing; Creator missing | depicted-person, alt-text-corrected, phone-attention-crop-poor (+1 more in JSON) |
| TM-017 | frame-portfolio | Source page missing; Creator missing | depicted-person, alt-text-corrected, multiple-placements (+1 more in JSON) |
| TM-018 | fitness-launch | Recorded source page; John Arano | recognizable-person-likeness-uncleared, visible-ROGUE-equipment-brand, clothing-brand-mark (+2 more in JSON) |
| TM-028 | editorial-commerce | Source page missing; Creator missing | depicted-person, hero-caption-corrected, hero-mobile-crop-needs-css-review |
| TM-032 | editorial-commerce | Source page missing; Creator missing | depicted-person, fictional-product-mismatch, model-rights-unverified |
| TM-049 | event-launch | Source page missing; Creator missing | branded-signage-visible, performer-endorsement-unverified, hero-crop-risk (+1 more in JSON) |
| TM-052 | event-launch | Source page missing; Creator missing | arena-not-small-venue, fake-photo-timestamp, pyrotechnics-event-misrepresentation (+1 more in JSON) |
| TM-053 | contractor | Source page missing; Creator missing | fictional-Toronto-job-site, visible-worker-model-rights-open, source-photographer-unverified (+1 more in JSON) |
| TM-054 | woodworker | Source page missing; Creator missing | unsupported-white-oak-caption, wood-species-and-size-unverified, depicted-person (+2 more in JSON) |
| TM-056 | event-launch | Source page missing; Creator missing | outdoor-event-not-side-room, fake-photo-timestamp, branding-visible (+1 more in JSON) |
| TM-068 | fitness-launch | Source page missing; Creator missing | recognizable-person-likeness-uncleared, misleading-carrying-alt, wide-crop-cuts-head (+2 more in JSON) |
| TM-071 (film) | creative-agency | Recorded source page; cottonbro studio | No subject-specific review flags recorded |
| TM-072 | real-estate | Pexels publisher page; Peter Xie | Unrelated photographed home; private-property and listing-affiliation review still open |
| TM-073 | real-estate | Pexels publisher page; Max Vakhtbovych | Unrelated photographed lake-facing interior; property context and redistribution review open |
| TM-074 | muskoka-retreat | Pexels publisher page; ilayda 0700 | Independent cabin/lake photograph, not a bookable property; property/location review open |
| TM-075 | muskoka-retreat | Pexels publisher page; Matheus Bertelli | Unrelated cabin bedroom, not a Morrow House suite; property/affiliation review open |
| TM-076 | muskoka-retreat | Pexels publisher page; Courtney RA | Winter lakeside cabin photo, not an actual Morrow House property; attribution/crop release open |

## Follow-on queue — 49 active records

| Asset | Original template usage | Current provenance | Recorded issue clues |
| --- | --- | --- | --- |
| TM-003 | frame-portfolio | Source page missing; Creator missing | phone-cover-crops-subject, full-frame-candidate-only |
| TM-007 | frame-portfolio | Source page missing; Creator missing | alt-text-corrected, phone-focus-needs-review |
| TM-008 | editorial-commerce | Source page missing; Creator missing | fictional-product-mismatch, source-rights-unverified |
| TM-010 | law-firm | Recorded source page; Nastuh Abootalebi | unrelated-office-stock, fictional-firm-and-lawyer-attribution, phone-crop-removes-office-context (+1 more in JSON) |
| TM-022 | monolith-architecture | Source page missing; Creator missing | studio-attribution-unverified, geography-unverified, mobile-crop-cuts-sofa |
| TM-023 | monolith-architecture | Source page missing; Creator missing | false-interior-alt, project-attribution-unverified, mobile-crop-truncates-building |
| TM-024 | monolith-architecture | Source page missing; Creator missing | image-description-corrected, attribution-unverified, mobile-crop-truncates-exterior |
| TM-025 | monolith-architecture | Source page missing; Creator missing | location-unverified, design-credit-unverified, pool-crop-context-review |
| TM-026 | editorial-commerce | Source page missing; Creator missing | fictional-product-mismatch, phone-crop-needs-css-review |
| TM-027 | editorial-commerce | Source page missing; Creator missing | product-identity-unverified, phone-crop-needs-css-review |
| TM-035 | landscaping | Recorded source page; Naoki Suzuki | studio-project-attribution-unverified, stone-patio-not-established, wide-crop-hides-steps-and-flowers (+1 more in JSON) |
| TM-036 | muskoka-retreat | Source page missing; Creator missing | interior-property-unverified, photo-not-actual-accommodation, mobile-crop-review-needed |
| TM-037 | custom-bakes | Source page missing; Creator missing | product-authorship-unverified, order-pricing-unsupported, wide-crop-truncates-cookies |
| TM-039 | editorial-commerce | Source page missing; Creator missing | wide-crop-clips-object, product-identity-unverified |
| TM-041 | real-estate | Source page missing; Creator missing | property-location-unverified, fake-hero-listing-association, phone-cover-clips-building (+1 more in JSON) |
| TM-042 | architecture | Source page missing; Creator missing | false-Georgian-Bay-project-credit, residential-property-location-unverified, architect-designer-attribution-unverified (+2 more in JSON) |
| TM-043 | woodworker | Source page missing; Creator missing | species-unverified, single-planter-alt-wrong, not-a-studio-commission (+1 more in JSON) |
| TM-045 | event-launch | Source page missing; Creator missing | no-band-performance-proven, unrelated-venue-photo, phone-crop-loses-stage-context |
| TM-046 | contractor | Source page missing; Creator missing | fictional-Vaughan-job-claim, unverified-structural-work-and-timeline, not-a-before-after (+1 more in JSON) |
| TM-047 | restaurant | Source page missing; Creator missing | other-venue-identity-unverified, wine-type-unverified, venue-layout-claims-unverified (+1 more in JSON) |
| TM-050 | landscaping | Recorded source page; Sergej ***** (@skstrannik) | fictitious-before-after-attribution, plant-species-unverified, drainage-work-unverified (+2 more in JSON) |
| TM-051 | landscaping | Recorded source page; Sergej ***** (@skstrannik) | separate-property-not-ruled-out, wall-not-garden-planting-feature, false-project-continuity-risk (+1 more in JSON) |
| TM-055 | woodworker | Source page missing; Creator missing | wood-species-unverified, fictional-product-not-verified, wide-crop-loses-upper-shelf (+1 more in JSON) |
| TM-057 | real-estate | Source page missing; Creator missing | property-location-unverified, fictitious-listing-details, mobile-room-framing-review |
| TM-058 | architecture | Source page missing; Creator missing | unverified-Toronto-project-history, program-area-completion-unverified, oak-linen-courtyard-inventions (+2 more in JSON) |
| TM-059 | restaurant | Source page missing; Creator missing | other-venue-photo, restaurant-attribution-unverified, wide-crop-removes-distinctive-arch (+1 more in JSON) |
| TM-060 | custom-bakes | Source page missing; Creator missing | unsupported-cake-flavour-and-ingredients, whole-product-not-shown, extreme-macro-phone-crop (+1 more in JSON) |
| TM-061 | muskoka-retreat | Source page missing; Creator missing | alt-description-corrected, interior-property-unverified, photo-not-actual-accommodation |
| TM-063 | restaurant | Source page missing; Creator missing | hero-alt-underdescribes-visible-interior, unrelated-dining-venue, seat-count-and-kitchen-not-shown (+1 more in JSON) |
| TM-064 | pools | Source page missing; Creator missing | fictional-project-claim, actual-Oakville-location-unverified, pool-engineering-materials-unverified (+2 more in JSON) |
| TM-066 | pools | Source page missing; Creator missing | unrelated-tropical-setting, not-GTA-construction-evidence, overflow-system-not-visible (+2 more in JSON) |
| TM-069 | pools | Source page missing; Creator missing | fictional-studio-attribution, pool-depth-and-dimensions-unverified, materials-and-equipment-not-proven (+1 more in JSON) |
| TM-070 | muskoka-retreat | Source page missing; Creator missing | geographic-location-unverified, hero-text-over-image-qa-needed, phone-art-direction-needs-css-review |
| TM-077 | editorial-commerce | Pexels original; Jonathan Cooper | footwear is not fictional Ridge Boot, unrelated item, final brand/trade review open |
| TM-078 | editorial-commerce | Pexels original; Nataliya Vaitkevich | map and compass not manufactured Route Kit, map copyright/context review pending |
| TM-079 | editorial-commerce | Pexels original; Maxi Gagliano | sewing tools not actual Field Repair Roll, independent stock only |
| TM-080 | woodworker | Pexels original; Anna Shvets | unrelated hand-plane workbench, not verified workshop work |
| TM-081 | storefront | Pexels original; Angela Roma | Generic pump bottles are a product-styling reference, not actual MORA inventory |
| TM-082 | storefront | Pexels original; Max Vakhtbovych | Unrelated bathroom photo, incidental items/brands not MORA products |
| TM-083 | storefront | Pexels original; Polina | Independent serum/jar flatlay, not actual MORA packages or real brand claims |
| TM-084 | custom-bakes | Pexels official page; Jonathan Borba | White cake photograph, not this fictional studio's work, brand and final rights still require review |
| TM-085 | custom-bakes | Pexels official page; Gustavo Fring | Cake decorator/venue unrelated to fictional bakery, model/endorsement and final rights review open |
| TM-086 | tattoo-studio | Pexels official page; Moisés Fonseca | Actual Mexico City workspace; may not imply a BLACKLINE location or studio safety claim |
| TM-087 | tattoo-studio | Pexels official page; Antoni Shkraba | Gloved hand preparing machine, separate studio; no real client or completed work depicted |
| TM-088 | tattoo-studio | Pexels official page; Vitor Diniz | Ink caps/tools; independent stock, visible equipment labeling/crop review remains open |
| TM-089 | garage-detailing | Pexels source; Khunkorn Laowisit | Hands polishing white bonnet; work is not a GARAGE job, person/vehicle permission unapproved |
| TM-090 | garage-detailing | Pexels source; Tima Miroshnichenko | Foamy headlight detail scene; not a verified client vehicle, crop/brands unapproved |
| TM-091 | garage-detailing | Pexels source; WAVYVISUALS | Polishing pad with product; equipment manufacturer/trademark context needs review |
| TM-092 | garage-detailing | Pexels source; Melih Can | Hand polishing silver vehicle door; unrelated work and property/worker context pending |

## Recorded origin pages (not rights approval)

- **TM-001** — cottonbro studio: [source record](https://www.pexels.com/video/woman-in-a-studio-posing-at-the-camera-9489382/) · exact-origin verification 2026-11-22. **Still `needs-review`.**
- **TM-002** — Clark Street Mercantile: [source record](https://unsplash.com/photos/clothes-store-interior-P3pI6xzovu0) · exact-origin verification 2026-11-22. **Still `needs-review`.**
- **TM-010** — Nastuh Abootalebi: [source record](https://unsplash.com/photos/hallway-between-glass-panel-doors-yWwob8kwOCk) · historical source entry, date of exact-origin recheck not recorded. **Still `needs-review`.**
- **TM-018** — John Arano: [source record](https://unsplash.com/photos/woman-doing-weight-lifting-h4i9G-de7Po) · exact-origin verification 2026-11-22. **Still `needs-review`.**
- **TM-071** — cottonbro studio: [source record](https://www.pexels.com/video/woman-in-a-studio-posing-at-the-camera-9489382/) · exact-origin verification 2026-11-22. **Still `needs-review`.**

The 22 November source match for **TM-002** identifies Clark Street Mercantile's Montréal shop photograph; exact image match and contributor attribution do not authorize use of the store's branding or depicted customers. **TM-018** is John Arano's barbell-training photo at CrossFit 1855 in Ottawa; subject likeness and ROGUE/training-facility depiction remain potential clearance issues. See `docs/TEMPLATE-MEDIA-SOURCE-VERIFICATION-PASS1.md` for the URLs, matching method and remaining questions.

## Further exact-origin matches (landscaping)

- **TM-035** — Naoki Suzuki: [verified Unsplash photo page](https://unsplash.com/photos/a-stone-patio-with-steps-and-plants-in-the-foreground-V99f_PhYzmM) · image identity `https://images.unsplash.com/photo-1722103155234-5e83b3effe03` · **still needs review**.
- **TM-050** — Sergej ***** (@skstrannik): [verified Unsplash photo page](https://unsplash.com/photos/curved-stone-steps-lead-to-a-paved-patio-area-AqCTAOMJUVk) · image identity `https://images.unsplash.com/photo-1761637823276-7d714eb45cb1` · **still needs review**.
- **TM-051** — Sergej ***** (@skstrannik): [verified Unsplash photo page](https://unsplash.com/photos/stone-wall-with-plants-in-the-foreground-f7poIvVWtfg) · image identity `https://images.unsplash.com/photo-1761637823941-0ffae96ec487` · **still needs review**.

These links were already visible in the BED & BORDER template footer. Each was independently cross-checked against the photo-page image URL; the photos are **unrelated stock** and do not establish completed works, client properties, contractor identities, locations or property releases. No asset was approved.

## Required closure procedure for every asset

1. Match the exact CDN image identity against the **original platform photo page**, using that page's image link when possible. A third-party site's bare photographer credit or a vaguely similar photo is insufficient.
2. Record creator and original page, check if the file is standard free Unsplash rather than Unsplash+, and review relevant license/terms for template publication or sale. **Unsplash+ expressly restricts digital-template use.**
3. Confirm depicted people, artwork, trademarks, logos, locations/private property and endorsements are permitted in the actual proposed context. Obtain required independent permission or replace with owned original material.
4. For an approved source, make appropriately licensed/local optimized versions and retest actual gallery and full-page crops, text contrast and device layout. Keep original unapproved media records until the migration/decommission is complete; source metadata alone never flips `reviewStatus`.
5. Re-run media manifest checks, loaded-photo and thumbnail browser suites, responsive and keyboard tests, document QA, and obtain explicit design and release approval.

**OFFCUT exception:** TM-071 remains optional reference video with `preload=none` and user opt-in. Do not download it automatically. Video content, duration, bitrate/codec, model permission and efficient local replacement are still open.

## Other unresolved release gates

Native Safari/VoiceOver, Android/TalkBack, NVDA, genuine browser zoom/text-only zoom, loaded-photo contrast, all 44 alternate mobile treatments' human review, all 20 animation patterns' human motion review, tagged-PDF independent assessment, and stakeholder design acceptance remain open. No promotion to `live` or merge to `main`.

## Northline original source recheck — 22 November 2026

**TM-010** was already credited to Nastuh Abootalebi. Following the [original Unsplash photo page](https://unsplash.com/photos/hallway-between-glass-panel-doors-yWwob8kwOCk) again and comparing its linked CDN image `photo-1497366754035-f200968a6e72` confirmed the existing source relationship and added the missing verification stamp. The original photo location is identified as the Sunday Digital office in **Munich, Germany**—not NORTHLINE's fictional legal premises. Property rights, endorsement, brand context and publication approval remain open. The image remains `needs-review`.

## CURRENT original artwork conversion (22 November 2026)

The geographically inaccurate coastal-surf **TM-011** and alpine-mountain **TM-062** images were retired from the CURRENT real-estate original template and replaced in **both** their main home spreads and the horizontal story rail with locally-authored, brand-specific architectural SVG drawings (`drift-house-concept.svg` and `glass-point-concept.svg`). They are **illustrations of invented buildings**, not photos, verified properties, real listings or approved design plans.

At the earlier illustration checkpoint the template queue was **60 total**, **8 source/creator-verified**, **52 untraced**, **0 legally approved**. A follow-on component pass also retired STOCK-022/STOCK-023 from isolated `ANIM-13`; the third illustrated-story stock identity STOCK-024 remains unapproved, as do the other 22 active isolated component stock records. See `SHOWROOM-REAL-ESTATE-ILLUSTRATION-REMEDIATION.md` for exact changes.

## Standalone component reconciliation

ANIM-13 now reuses the two original CURRENT SVG assets rather than separately showing the retired coastal and mountain photography. The isolated component stock manifest is **23 active remote identities, zero approved**; the original full-template queue remains **60 active identities, eight attributed, 52 untraced and zero approved**. The two different distribution surfaces have separate inventories: do not add the 23 and 60 counts as if they were disjoint unique photos.


## Latest source photo restoration — 22 November 2026

CURRENT and the isolated ANIM-13 no longer use the two generated SVG images. TM-072 / STOCK-027 is a photo by Peter Xie (https://www.pexels.com/photo/modern-house-by-tranquil-lake-surrounded-by-trees-37981442/) and TM-073 / STOCK-028 is by Max Vakhtbovych (https://www.pexels.com/photo/cozy-apartament-on-water-with-floor-to-ceiling-windows-6580232/). Original publisher pages identify creators, actual image links, camera metadata and Free/Pexels License. The license (https://www.pexels.com/license/) permits website template use, but that is NOT a final property/context/redistribution release approval. Both photos are clearly described as unrelated illustrative references, not CURRENT listings.

At the earlier CURRENT-only checkpoint: **62 original-template identities (10 sourced, 52 untraced)**. These counts were superseded by the following retreat pass. Crops, performance, subject/property rights and stakeholder acceptance remain outstanding.


## Photo-only Morrow House restoration — 22 November 2026

Replaced the three earlier generated illustration stand-ins (lakeside house, pictured suite and winter cabin scene) with direct Pexels publisher-identified photographs by ilayda 0700 (TM-074), Matheus Bertelli (TM-075), and Courtney RA (TM-076). The source is real published stock photography, but the real places are not the fictional accommodation, and photos do not establish any booking, room configuration or location claim. Source pages and licenses have been logged in the manifest. All three remain needs-review pending actual mobile crop, rights/affiliation acceptance, and optimization. The guide map is a functional conceptual diagram and was intentionally retained, not substituted for a photograph.

Current full-template remote media: **65 entries, 13 with photographer and source page, 52 with missing provenance, zero final approvals**. Component stock remains **25 entries, zero final approvals**. All steps and claims must continue to be checked against actual browser/rendered media and user acceptance.


## Further photographic stand-in replacement: RANGE/FOUND and GRAIN & GABLE

Three RANGE/FOUND product illustrations were removed and replaced with authentic photography from Jonathan Cooper (TM-077 / Pexels 8868319), Nataliya Vaitkevich (TM-078 / 7235808), and Maxi Gagliano (TM-079 / 4610582). The GRAIN & GABLE workshop stand-in was replaced by a real photographed hand-plane workbench from Anna Shvets (TM-080 / 5711903). Authentic photographer/Free Pexels source records are stored in the canonical manifest. All product names/prices remain fictional, stock images never claim genuine brand merchandise, and GRAIN & GABLE's separate functional ANIM-20 illustration remains a diagram, not a photo substitute. Current full-template media count **69 (17 with publisher attribution, 52 not yet traced, 0 final rights approvals)**; component stock still **25** unapproved. Final loaded photo, property/brand/context and stakeholder review pending.


## MORA original photostudies reinstated — 22 November 2026

The three previously synthesized MORA still-life / sink / materials scene illustrations were replaced with independent real photographs under Pexels' Free license: Angela Roma (TM-081, photo 7318850), Max Vakhtbovych (TM-082, 7031908), and Polina (TM-083, 8101513). No Pexels scene is actual MORA merchandise or a true operating storefront. Four remaining product-type prototypes use plain CSS to demonstrate finish-swapping interactions; they are not photos, commercial inventory or AI-generated pictorial images. Current **72 active original-template media identities, 20 with original publisher provenance and creator, 52 remaining untraced, 0 final rights approvals**. Component asset stock remains 25, all in review; native-device, photo-loaded cropping, property/brand and legal distribution approval pending.


## DOT + CRUMB branded-photo retirement — 22 November 2026

TM-029 (Unsplash dessert image with a visible Nutella jar) was removed from both the wedding-cake and bakery-story scenes because it mismatched the fictional wedding concept and visually associated an unrelated food brand with the sample business. It was replaced by *two separate, real, publisher-sourced Pexels photographs*: TM-084, [Jonathan Borba's white celebration cake](https://www.pexels.com/photo/elegant-white-layer-cake-with-intricate-frosting-37181428/), and TM-085, [Gustavo Fring's pastry decorating a pink cake](https://www.pexels.com/photo/crop-faceless-female-pastry-cook-decorating-cake-with-chocolate-in-kitchen-3983576/). Both exact Pexels download links, Free license notices and displayed creators were checked. They are **not work by DOT + CRUMB**, and model, property/venue and downstream license/release contexts remain `needs-review`. Neither image is an AI-generated replacement. Tests explicitly forbid the retired Unsplash ID from returning.

Current original-template count: **73 active identities, 22 sourced/attributed, 51 still untraced, 0 finally approved**. The separately inventoried component stock count remains 25 and all entries are in review. Full browser, crop and human release checks remain outstanding.


## BLACKLINE tattoo-session photography retirement — 22 November 2026

Two original Unsplash identities TM-030 and TM-040 displayed identifiable artists, client skin and tattoo artwork without author, studio, model-consent or existing artwork-rights records. These identities were retired from all original-template usages, and a source-level regression forbids reintroduction. Four placements now reuse three independently attributable Pexels reference photographs instead: TM-086 [Moisés Fonseca's Mexico City tattoo workstation](https://www.pexels.com/photo/tattoo-studio-workspace-with-supplies-35658361/), TM-087 [Antoni Shkraba's gloved-hand machine preparation](https://www.pexels.com/photo/a-person-wearing-gloves-holding-tattoo-machine-7005800/) and TM-088 [Vitor Diniz's ink caps and tools](https://www.pexels.com/photo/tattoo-equipment-with-ink-and-needles-29217591/). Each official page credits photographer and shows Free-license status, with the original image file URL matching the photo ID. They do **not** show BLACKLINE clients, staff, procedures, studios or completed work, and associated copy now says so. The illustrated flash-sheet remains a fictional UI treatment, not a real copyrighted tattoo used as advertising. Existing venue/product branding, contextual permissions, crop, optimization and final public template rights remain `needs-review`.

Current original-template media: **74 identities (25 with source page and creator, 49 untraced, zero rights-cleared)**. Separate 25-entry component stock inventory still requires independent review. All 157 components and full templates remain in review; no approval or branch merge.


## BLACKLINE gallery thumbnail correction

The original library's BLACKLINE preview card now references TM-086 instead of retired TM-040. A new gallery-integrity hard gate prevents the retired wedding-dessert/tattoo-person images from appearing in the gallery. No media totals change; this is another placement of the same traceable but not-yet-release-approved photo.


## GARAGE detailing source-first photography — 22 November 2026

All four active original garage-detailing image identities TM-006, TM-019, TM-020 and TM-033 were retired: they showed branded performance vehicles, unrelated scenery or an unverified employee. Five full-template image placements and the root thumbnail now use four traceable real detailing photographs: TM-089 [Khunkorn Laowisit — white vehicle rotary polishing](https://www.pexels.com/photo/a-person-polishing-the-white-car-5233279/), TM-090 [Tima Miroshnichenko — washed headlight](https://www.pexels.com/photo/a-close-up-shot-of-the-headlight-of-a-car-while-being-washed-6872149/), TM-091 [WAVYVISUALS — polisher pad with cream](https://www.pexels.com/photo/polish-cream-on-polisher-foam-20042053/) and TM-092 [Melih Can — hand wiping silver car door](https://www.pexels.com/photo/close-up-of-hand-polishing-car-surface-35149476/). Matching publisher-hosted original download identities, credits and Free labels were checked. The actual source photos are not endorsements, GARAGE employees, verified jobs or equipment ownership. The white vehicle, tool markings, worker model/property context and phone crops remain pending independent permission and approval. The fictional enquiry form and brand disclaimers remain unchanged.

This changes original-template provenance from 25/74 to **29/74 sourced and attributed**, leaving **45/74 unknown**, **0 finally cleared**. All component stock assets remain independently in review; no `live` promotion or merge to `main`.
