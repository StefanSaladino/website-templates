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

