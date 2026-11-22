# Morrow House — Muskoka retreat stock-photo visual audit

_21 November 2026 · `feature/component-showroom` · visual QA only; zero production approvals._

## Evidence boundary

[Five-photo candidate capture](https://github.com/StefanSaladino/website-templates/actions/runs/44944503040) obtained **five of five** transformed Unsplash JPEG preview files at up to 1,800 pixels (zero download failures), with seven crop comparisons per file. The private, seven-day artifact `original-template-media-candidates` has the sample files, a review HTML sheet and hashes/dimensions in `results.json`. These are candidate-CDN hashes, **not** hashes of cleared, source-original photography.

No actual location, accommodation, model/property release, photographer identity or commercial redistribution rights have been verified. A crop sheet is not a screenshot of the loaded Morrow House page at native screen sizes.

## Evidence and findings

| Identity | Candidate dimensions | Visual observation and required work | Disposition |
| --- | --- | --- | --- |
| **TM-021** | 1800 × 1350 | Small white hut on a snow-covered frozen lake in bright low winter light; not a photograph of the advertised Lake Suite or verifiably a Muskoka rental. Wide crop retains hut; narrow 3:4 crops cut some shoreline but remain readable. Replace suite image before publication. | Replace before release |
| **TM-031** | 1800 × 2700 | Small cabin on vivid turquoise lake with steep pine-covered mountains behind; an alpine scene that does not credibly depict the claimed Lake Rosseau/Muskoka house. Wide crop loses mountain context, portrait retains it. Replace as featured property photograph. | Replace before release |
| **TM-036** | 1800 × 1199 | Interior bedroom with exposed timber beams and stone fireplace; broad visual description matches. 3:4 portrait cover trims the bed and fireplace edge; need real CSS room-card crop check. No evidence the depicted room exists at a fictional retreat. | Review in actual layout |
| **TM-061** | 1800 × 1185 | Wood-paneled room with bed and orange freestanding wood stove, not a masonry fireplace; corrected inaccurate alt text. Portrait crop keeps stove and partial bed. Forest-view and property identity remain unverified. | Review in actual layout |
| **TM-070** | 1800 × 1350 | Warm sunset over a calm lake, low dock extending from one shore, foreground leaves at left. Crop options retain sunset and dock with different foreground balance; real text-over-image contrast and exact phone hero focal point require browser QA. Lake/location not verified as Rosseau. | Review in actual layout |

## Candidate SHA-256 fingerprints (for reproducibility only)

| Identity | SHA-256 of transformed JPEG |
| --- | --- |
| TM-021 | `2cfac688e65f186ba2e15881536fe2219704b45fca28d15b663c12fba4a10908` |
| TM-031 | `88e691ebe5e4791dc1cedbca1aafbc1b649d2043122cec17020509a51837debd` |
| TM-036 | `417e6b0e652f926f4da96479a1424930603a23135c612afd5afd19304bf9d86b` |
| TM-061 | `8a1f03f8eb2d41c4c682b28490782d47650abe3ddab9c186e96959c70fe67398` |
| TM-070 | `e738a35efa6cbbc9368b777c4b366fe15d6ca73b0b9364c8dcf4d747ae61b6a1` |

## Template safety and descriptive corrections

- **TM-031:** the existing stock photograph depicts a mountainous alpine lake. Changed its misleading generic cabin alt text to describe the actual setting, and added an on-photo `ILLUSTRATIVE CABIN` notice. Changed the adjacent label from "THE ORIGINAL HOUSE" to an illustrative study. It must be replaced before asserting a Muskoka property.
- **TM-021:** the source depicts a small hut on a frozen lake, not a room or lakeside suite. Corrected its alt and added `WINTER ATMOSPHERE · NOT A SUITE PHOTO` directly to the room's photographic frame. The separate decorative winter scene reuses the same photo.
- **TM-036 and TM-061:** differentiated a stone fireplace from a freestanding orange wood stove in accurate text. Stock room photos do not demonstrate genuine rooms, beds, facilities, or views of a real retreat.
- **TM-070:** sunset lake image and dock are visible; whether the lake is Rosseau is unknown. Do not infer specific longitude/latitude or original photo location. Replaced pseudo-exact hero coordinates and misleading specific place-language with clearly fictional site descriptors; hero/text overlay art direction remains to be tested in actual browser.
- Made the availability note clearly say **no property or dates are available to book**, and that accommodation photographs are illustrative. Marked the SVG area map as fictional and not usable for navigation.

None of the five sources was replaced, migrated to a local public derivative, sold, or approved.

## Release gate

1. Source **accurate and properly licensed** architecture/retreat photographs for TM-031 and TM-021; prioritize a believable Muskoka lakeside house and a genuine bedroom/suite context (without implying the fictional venue is real).
2. Verify that candidate origins, rights, third-party property and branding restrictions, exact attribution, and intended redistribution are recorded separately before migration to local files.
3. Inspect actual loaded imagery at 320, 390, 768 and 1440 px for the hero, house spread, room cards and seasonal section. Review overlaid text contrast and photo captions, and avoid losing fireplaces, stoves or docks in responsive crops.
4. Validate reduced-motion/keyboard/accessibility flows and complete mobile Safari / Android Chrome tests independently. Current automated candidate review does **not** cover these.

**Next:** `creative-agency` has a separate Pexels poster plus 4K video requiring creator, playback, data-saver and licensing review. The original-component inventory remains `needs-review`; `main` remains outside this audit.

## Remediation — inaccurate property and suite photographs retired (22 November 2026)

The five original candidate photos, identities and hashes above remain historical audit evidence. Two mismatch assets have now been **removed from active original-template HTML and media inventory**:

- **TM-031** — the alpine cabin and turquoise mountain lake did not depict a credible Muskoka property. Its full-width house composition now uses an original inline SVG lakeside architecture illustration clearly labelled as a fictional setting.
- **TM-021** — the white winter hut did not depict an actual lake suite. The suite card now uses an original illustrative floor plan, and its second reuse in the winter seasonal panel has been replaced by a separate original, stylized snow-and-lake drawing.

Morrow House remains a fictional, non-operating accommodation concept. Copy now emphasizes proposed rooms, hypothetical features and no verified physical address. Date controls are explicitly non-booking; form submission is prevented in script and no-JavaScript fallback, with accessible feedback saying no reservation or information was sent. The existing chapter navigation and mobile templates remain in place.

**Current Morrow House remote media: 3 (TM-036, TM-061, TM-070), all `needs-review`.** No new stock images or unverified property photos were introduced, and no rights approval was granted. Browser regression and asset-scan checks reject the retired identities; real-device visual, accessibility and remaining photo licensing remain release blockers.
