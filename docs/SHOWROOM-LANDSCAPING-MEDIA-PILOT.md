# BED & BORDER — garden/stonework photo integrity audit

_22 November 2026 · `feature/component-showroom` · preliminary visual review, 0 media approvals._

## Evidence

- [Candidate photo capture workflow](https://github.com/StefanSaladino/website-templates/actions/runs/45042149437) downloaded **all three** Unsplash-transformed 1,800px-wide JPEG preview samples, seven alternative desktop/phone crops each, and a temporary private evidence bundle. **Zero download errors.**
- Actual photograph authorship, original source-page matching, license/derivative distribution permission, property owner consent and photographer restrictions remain outstanding. Candidate byte hashes are not hashes of licensed originals.
- The BED & BORDER landscaping firm, its projects and named West Burlington design brief are fictional. Source photographs do not document any construction by this studio, and multiple photos do not prove one worksite or timeline.

## Visual findings

| ID | Candidate size | Observed content and concern |
| --- | --- | --- |
| **TM-035** | 1800×2700 | Portrait garden scene with broad vivid green foliage in foreground, low pink/white flowers, stone paving and steps, a dark raised horizontal railing or structure and dense trees beyond. Does not identify a constructed patio or BED & BORDER property. 16:9 stress crop cuts most stone steps and flower beds in favour of big foreground leaves; narrow phone crop preserves tall garden but not complete site. |
| **TM-050** | 1800×2700 | Autumn scene showing leafless tree in front of a raised grey stone-paved terrace with short broad angular steps, a backdrop of dark hedge, yellow and orange foliage, and low shrubs. Photo is not evidence of mature maple retention, improved drainage, new materials, construction design, a precise Ontario address, or a finished project by BED & BORDER. Wide crop loses most terrace steps and ground plane; tall crop preserves tree and overall terrace context. |
| **TM-051** | 1800×1200 | Close-up of a stacked rectangular pale grey masonry retaining/garden wall with coping stones. A few small plants at its base and soft blurred flowers or shrubs behind. Not evidence it is the detailed stonework of TM-050's terrace or a BED & BORDER installation. Tall crop discards much of the left/right stone coursing and wall context. |

## Transformed image SHA-256

| ID | SHA-256 |
| --- | --- |
| TM-035 | `ce04357f4e7d167ab5396b1822132befa04e9a9126f6dcab143291f2231a1b70` |
| TM-050 | `acf1c659e382c29ba275a8e6fd4ef24bbea7ebfb0f14ac7eabc8d976a29f9af2` |
| TM-051 | `81c5ecdd81d765b31a74cea047aa26a99371e77c3eb3f79f6bd278c5c807722a` |

## Changes implemented

- Added a visible fictional-service banner ahead of the hero. Changed misleading 'recent garden', implied hired-crew and 'book a site walk' CTAs to clear design-study and demo-inquiry language.
- TM-035: corrected the hero image alt to foreground large foliage, low flowers, paving/steps and dark railing; removed invented `GARDEN 024` attribution and kept existing bounded `ANIM-04` motion.
- TM-050: described a raised paved terrace, short steps, leafless tree and autumn hedge. Replaced `AFTER` with `TERRACE REFERENCE / STOCK`, and stated that maple retention, drainage works, actual planting and West Burlington site are **hypothetical**, not witnessed.
- TM-051: described an actual masonry retaining wall with coping and some plants, not dense layers of planting. Explicitly labeled as a separate stock reference; no claimed continuity with the TM-050 terrace or a single project.
- Reframed project facts and fake quote as an illustrative design study. The inquiry form never sends/stores a message, books a site walk or claims a real company receives it; added accessible confirmation state.
- Browser smoke assertions test fictional disclosures, photo descriptions, the sample case-study, demo-form non-submission and the existing `ANIM-11` manual zoom interaction.

## Remaining blockers

1. Verify original Unsplash image pages and photographer IDs from credited candidate links (not automatically proven by the footer), source license, release/property permissions and redistributed derivative use.
2. Replace stock photos with property- and project-cleared genuine source work if turning the template into a landscaper's actual portfolio; photograph evidence cannot validate species, drainage, installation quality or project locations.
3. Load real images and inspect 320/390/768/1280/1440 responsive layouts; wide hero crop hides most stone steps/low flowers, wide terrace crop hides the ground-plane transition, tall masonry crop cuts blocks on both sides.
4. Verify the current commit's GitHub Pages, CI and Chromium browser QA before acceptance; preserve `ANIM-04` desktop parallax pause and reduced-motion fallback and `ANIM-11` keyboard-friendly zoom.
5. All three original photos remain `needs-review`. Do not merge to `main` or approve commercial use without the above evidence.

**Next batch:** `restaurant`, three photographs.
