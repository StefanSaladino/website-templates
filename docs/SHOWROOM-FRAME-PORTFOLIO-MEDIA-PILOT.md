# Frame portfolio — first five original-template photo candidates

_21 November 2026 · `feature/component-showroom` · **visual observations only; all five remain needs-review**_

## Evidence boundary

Run [the five-image candidate workflow](https://github.com/StefanSaladino/website-templates/actions/runs/44913698047) to see its private, 7-day artifact containing five downloaded candidate samples, a JSON source-hash report and generated review crops. Those candidate bytes were requested from an Unsplash CDN at a maximum width of 1,800 pixels, **not** independently traced to a named photographer or a rights-cleared original. All five CDN identities still need authentic Unsplash source-page matching, model/property/brand review and formal photo acceptance.

The review compared the original candidate samples, 16:9 desktop crop and first automatic 3:4 phone crop. A second local center-versus-attention comparison reproduced the phone framing issues. **No photograph has been approved, replaced in production or redistributed to customers.**

| Inventory ID | Candidate dimensions | JPEG candidate SHA-256 | Visual findings and next action |
| --- | --- | --- | --- |
| **TM-002** | 1800 × 1201 | `ddf549cc4270e474cc57449929d89b4e3c51a0e04706e9bae5ca5c5835fc4810` | Clothing/footwear retail interior. Legible **U.S. Navy** branding appears in the scene. Center and attention phone crops retain displays, but brand/property rights and misleading endorsement must be checked; no assumption that this is a client store |
| **TM-003** | 1800 × 1113 | `6b0fd3c58afb5256f7d8aa60c84bc3bc4e46922e0443ca9a48cbe5e8c2c9beb4` | Banana still-life on pink. Both center and attention 3:4 *cover* crops clip the banana; a **full-frame contain treatment** with matching neutral/pink fill preserves it. Needs explicit crop choice, not auto-approval |
| **TM-004** | 1800 × 1200 | `83926a85328b45a66c6f2d2f4605dbaf45261b95fd525b0f4d718b0e26126da1` | Sunglasses-and-shopping-bags fashion scene. Automatic attention crop puts bags in frame but nearly excludes the person, a material failure. **Center crop is more appropriate** pending actual device composition and any person/brand release |
| **TM-007** | 1800 × 1205 | `0743a0bad33e0f936b1f2b4c260d8770dff2a650dc53c8ecc9e6be6a21a80f0d` | Lamp against green wall, not the desk-items scene described by old alt text. The attention crop retains the fixture better than center. Alt corrected; composition and owner rights still pending |
| **TM-009** | 1800 × 1197 | `e4146862c25bcdb92c8b7f8500e1817f38ef27e1faec8194195842fb11607e3f` | Person in a floral dress near the coast. Narrow crops emphasize parts of the garment and lose the wider scene. Center is less aggressive, but if this slot requires a true **face-forward fashion portrait**, this source image may need replacement |

## Changes informed by actual photographs

- Updated the **original frame-portfolio template's six inaccurate/over-generic alt phrases** (including repeated instances) to match the actual images rather than inventing a client project or scene content.
- Identified that `sharp`'s `position: 'attention'` is not dependable as the only phone-crop option for a model, retail interior or asymmetrical still life.
- Extended the local-only candidate generator to offer **three separate phone crop previews** — centered cover, attention cover and full-frame contain — alongside a centered 16:9 desktop preview. The reviewer chooses a composition based on the actual usage; none is a production crop.
- The output filenames and hashes are evidence for this *specific CDN-transformed download*. If the source or requested width/format changes, repeat the hash and visual comparison.
- Copyright, third-party likeness, product-brand, location and commercial template redistribution questions remain **unresolved**. A source provider's general license is not, by itself, model, property or trademark permission.

## Remaining follow-up

Inspect additional `frame-portfolio` photos, then `editorial-commerce` (nine identities), `muskoka-retreat` (five identities), and the `creative-agency` Pexels video. Before production, link each approved image to its authentic source/creator and rights evidence, validate the actual CSS image-fit and desktop/phone breakpoints, and use optimized locally hosted derivatives only when explicitly approved.

## Second FRAME visual pilot — six remaining identities (21 November 2026)

[The successful six-image review workflow](https://github.com/StefanSaladino/website-templates/actions/runs/44943057000) produced six actual JPEG candidate downloads, their measured dimensions and SHA-256 fingerprints, a 16:9 wide stress-test crop, and three 3:4 phone comparisons (center, attention, full-frame). The private 7-day artifact is named `original-template-media-candidates`.

| ID | Candidate dimensions | Finding and next action |
| --- | --- | --- |
| **TM-012** | 1800 × 2700 | Dark-sweater portrait; 16:9 cuts face; vertical framing better. |
| **TM-013** | 1800 × 2492 | Yellow outfit and basketball court; 16:9 loses person's head and legs. |
| **TM-014** | 1800 × 2700 | Charcoal studio portrait; corrected misleading natural-light alt; opening-left 3:4 / 3:5 crop pending. |
| **TM-015** | 1800 × 2700 | Sunglasses, red lettered shirt under sky; wide crops cut face; garment lettering and 5:4 / 3:4 crop review pending. |
| **TM-016** | 1800 × 2700 | Patterned jacket and white collar; attention phone crop shifts face toward edge; corrected alt. |
| **TM-017** | 1800 × 2251 | Blue-lit lilac-background portrait; corrected two alts; feature and gallery need separate fit checks. |

The 16:9 crop is an **illustrative stress test**, not the actual template placement. Several of these portraits are visibly damaged in that aspect ratio. Inspect real loaded-image rendering at the exact gallery/hero ratios, 320/390/768px and wide desktop; do not pick one crop formula for all photography.

All six depict recognizable people; source photo pages, named creators, licensing, commercial redistribution, likeness/model releases, trademarks and genuine design context are **unverified**. Downloaded-candidate hashes (not hashes of rights-cleared originals) and flags are saved per item in `components/data/template-media-inventory.json`. Candidate downloads were **not** moved to production.

**Combined FRAME outcome:** 11/11 candidates have preliminary visual observations; 0/11 have media approval. Corrected five inaccurate/overly generic alt text phrases in the original template, including both occurrences for TM-017. Continue with truthful source-page/rights review and loaded CSS crops; then audit `editorial-commerce` (9 identities), `muskoka-retreat` (5), and the `creative-agency` video.



## FRAME source-attributed photography replacements — 23 November 2026

Retired four untraced original FRAME media IDs TM-014, TM-015, TM-012 and TM-013 (including all associated responsive source-set URLs). Their placements now use independent Pexels originals with exact photo download identities and publisher-listed photographer credits: TM-093 [Brayan Chul black-hoodie purple studio portrait](https://www.pexels.com/photo/beautiful-woman-in-black-hoodie-12919049/), TM-094 [Aliyu jooney red-background fashion portrait](https://www.pexels.com/photo/elegant-woman-posing-in-stylish-skirt-on-red-background-32174987/), TM-095 [Sandro Tavares dark male portrait](https://www.pexels.com/photo/portrait-of-a-man-on-a-black-background-17594379/), and TM-096 [Linneas Boland-Godbey yellow-fence fashion portrait](https://www.pexels.com/photo/a-woman-in-yellow-shirt-and-denim-shorts-9591740/). These are authentic stock photographs, **not AI-generated imagery**, and no person/photographer/photographic portfolio is genuinely affiliated with the invented FRAME studio. A visible, accessible notice and footer provenance caveat establish that. Model releases, fashion/text artwork, downstream redistribution rights, actual zoom/crops and stakeholder visual acceptance remain **unapproved**. Original 24-template manifest remains **74 media identities; 33 with source page and creator, 41 unsourced; zero final approvals**. Six more original FRAME IDs need follow-on work (TM-003, TM-004, TM-007, TM-009, TM-016, TM-017), with shared isolated ANIM-12 stock requiring coordination.
