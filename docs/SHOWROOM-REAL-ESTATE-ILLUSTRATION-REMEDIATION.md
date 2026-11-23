# CURRENT property-study illustration remediation

_22 November 2026 · feature/component-showroom · original artwork, review-only_

## Visual truth and scope

Two existing CURRENT photos were geographically contradictory or unverified for the fictional Georgian Bay homes:

- **TM-011** — elevated seaside homes, sand and visible surf, used twice for fictional Thornbury-inspired Drift House
- **TM-062** — concrete room facing mountains across a valley/water view, used twice for fictional Meaford-inspired Glass Point

Both are **retired from the full real-estate template**, and replaced in-place with original local SVG editorial architectural studies. Each has a distinct design treatment (freshwater, granite, pines and a low cedar/glass house; and a large-panel interior facing still water and treeline). Their image accessible names and source sections describe **invented concepts**, not photographs, available properties or verified buildings. Native `<img>` markup and existing parallax, rail, reduced-motion and keyboard functionality are preserved.

## Active original-template media count

| Before | After |
| --- | --- |
| 62 third-party media identities | **60** third-party identities |
| 54 without exact original source/creator | **52** without exact original source/creator |
| 8 traced, 0 approved | **8 traced, 0 approved** |
| Four CURRENT remote identities (7 placements) | **Two CURRENT remote identities (3 placements)** plus four original SVG image placements |

Both retired original-template records are no longer in `components/data/template-media-inventory.json`. The isolated animation **ANIM-13** still uses the old photos as STOCK-022 and STOCK-023 and those component asset records remain `needs-review`; this full-template remediation **does not** clear them. A full cross-surface cleanup can follow independently.

## QA gates

1. Both local SVG files must be valid XML, contain no external resources or scripts, retain semantic alt text and decode in all still-image screenshot viewport cases.
2. Confirm both live home spreads and corresponding ANIM-13 horizontal story rail panels use their matching local illustration.
3. The original-template scanner hard-fails if either retired CDN identity or TM-011/TM-062 reappears in any original full-page template.
4. The offline media-selection regression now selects only TM-041 and TM-057 for CURRENT (both still unapproved).
5. Verify loaded-media capture, keyboard, reduced-motion, text-spacing and full showroom browser QA on the final source SHA; source code alone is not proof of visual quality.

Illustrations are fictional original concept art, **not** geographic evidence, construction documentation, an architect's credited work or property photography. Native phone, screen-reader, model/property/brand rights for remaining stock, and stakeholder design acceptance are not signed off. Steps 18 and 19 remain open.

## Offline and browser regression reconciliation

The loaded-media batch expects **three remote still-image elements** in CURRENT and four local SVG image placements (seven total), preserving the full image-decoding and screenshot scope rather than treating local illustrations as third-party stock. The gallery integrity check uses only its separately tracked gallery photos. The full browser-smoke suite now asserts both concept SVGs decode and appear in two positions each, their alternate text identifies original concept drawings, the old remote photographic identities are absent, and the sample listings remain explicitly fictional.

## Shared ANIM-13 component clean-up (22 November 2026)

After the original CURRENT template retired its geographically incorrect TM-011/TM-062 stock photographs, **ANIM-13's standalone component preview** still used the same two images under component stock IDs **STOCK-022** and **STOCK-023**. They have now also been replaced there by the same two original SVG architectural studies. The preview uses actual relative paths to the full-template assets, preserving the isolated production review build, responsive scroll-snap rail and keyboard/previous/next behavior. Its alternative text and captions explicitly distinguish the two invented drawings from the remaining unrelated photograph.

Both obsolete STOCK records have been retired from the 25-asset isolated component stock manifest, leaving **23** active original component stock identities, **all needs-review**. **STOCK-024 / TM-057** remains an unrelated, unapproved image in both the full-template and isolated preview. The media source scan forbids reintroduction of STOCK-022/STOCK-023 to active component metadata and forbids the retired CDN URLs in ANIM-13. The full Chromium smoke runner checks both illustration assets actually decode in the isolated preview. The number of components remains **157**, mobile alternatives **44**, and integrated animation patterns **20**; all statuses remain in-review. Human device, contrast, rights and stakeholder signoff still required.


## User-requested reversal of synthetic photo stand-ins — 22 November 2026

Removed the two generated CURRENT property SVG files and their use in the 24-template catalogue and ANIM-13 animation preview. Replaced with independent real Pexels photos credited to Peter Xie (37981442) and Max Vakhtbovych (6580232). Source URLs, creator, camera metadata and Pexels' template-eligible copyright license are documented as TM-072/073 and STOCK-027/028. The photos are unrelated to the invented Drift House and Glass Point listings; original labels and alt text now say so. Final property/context review, loaded-photo crops, performance, assistive technology and stakeholder approval remain open. This policy supersedes earlier illustration substitutions; no release or merge authorization is implied.
