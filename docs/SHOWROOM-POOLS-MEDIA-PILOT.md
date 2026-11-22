# TIDEFORM — pool image integrity, depth claims and fictional work

_22 November 2026 · `feature/component-showroom` · visual screening only, not construction, safety or rights approval._

## Private preview evidence

- [Candidate crop workflow](https://github.com/StefanSaladino/website-templates/actions/runs/45053619147) successfully captured all **three** 1,800px-wide transformed Unsplash previews and seven desktop/phone crop alternatives each with zero download errors. Artifact retained privately for seven days; images are **not authorized for redistribution** by this audit.
- Stock-photo author, actual source page, redistribution license, site ownership, location/property consent and any architecture/brand-use rights remain unverified. SHA-256 values below describe the transformed candidate bytes, not separately licensed originals.
- Neither photography nor graphics proves that TIDEFORM operates, builds concrete pools, has completed Oakville work, installed hydraulic systems, offers any depth or has obtained safety/building approvals.

## Findings by identity

| ID | Preview size | Observed photo and misleading-usage risks |
| --- | --- | --- |
| **TM-064** | 1800×2700 | Architectural pool or water feature beside a long tan-panelled modern building, a vertical dark line along the wall, metal handrails at the far edge, and dark trees. The water occupies the foreground and is bordered by pale coping. Not recognizably a residential Oakville pool; cannot confirm pool dimensions, structure, concrete, limestone, flush coping, dark tile, shallow steps, construction firm or occupancy. Landscape wide crop reduces the height of tan wall and water-plane, phone tall preserves perspective. |
| **TM-066** | 1800×2700 | Blue water occupies foreground, visually meeting a distant view near a low horizon; palm trees, lush tropical vegetation and modern white buildings under broad blue sky. Appears visually consistent with vanishing-edge effect, but overflow channels, catch basin, pool engineering, property rights, exact locale and connection to TIDEFORM are not shown. Wide crop discards much sky and top framing; phone tall preserves horizon and landscaping. |
| **TM-069** | 1800×1200 | Small rectangular outdoor courtyard swimming pool with dark blue water bordered by pale paving and bright green lawn, between white modern buildings with large glazed openings and flat projecting roofline. This is the hero background, not proof of the proposed custom concrete pool, any 3 ft 6 in to 7 ft depth, construction permit, installed equipment, pool safety or client site. Phone tall crops much of the wings and lawn; wide crop retains full architecture. |

## Sample source SHA-256

| ID | SHA-256 |
| --- | --- |
| TM-064 | `b08c041db467f36658b15ea808966264571d92ceecd1917d07ab5e599c7f12f6` |
| TM-066 | `2f22ca9132a97ee6cc8b8bb838fbdcfb24e18925c30ed0d718578073458721aa` |
| TM-069 | `3e5c968bffdadde834b707b208ae852f6ee1955def32759905f2d092846cb9f0` |

## Corrective UI and copy

- Added an explicit **fictional pool studio** banner above the hero and an on-image notice for TM-069: courtyard pool, **not built by TIDEFORM**. Replaced hero alt with visible architecture, water and lawn.
- TM-066 now has a visible **unrelated tropical stock photo** notice, more accurate alt, and a neutral statement about site-specific infinity-edge design; no catch basin, spillway, structural performance, geography or ownership is inferred from the photograph.
- TM-064 now displays **architectural stock reference** rather than a fabricated **Oakville recent build**. Replaced unverified pool dimensions, full-width steps, limestone and tile specifications with clearly marked hypothetical options; photo alt describes long water plane, tan facade and handrail.
- Depth markers 3′6″/5′0″/7′0″ and footprints 10 × 16′ / 14 × 28′ / 10 × 36′ explicitly marked examples. Added cross-section note: **not engineered or suitable for construction; not a diving-safety recommendation**. Actual pool dimensions, access, barriers, local permits and engineering require site-specific qualified review.
- No form submissions, stored information, site visits or estimates exist. Added a `role=status` confirmation after the sample inquiry, and a browser smoke test for non-submission.
- Retained responsive layouts, caustics/ripple behavior, hero parallax and waterline/reflection concepts. This is a truthfulness and release-safety audit, not a visual redesign.

## Still blocked

1. Verify photographer identity, precise source pages and commercial license and any property/architecture rights for each image; replace with documented approved photos before any customer deployment.
2. Validate real finished TIDEFORM pool work, locations, site photographs, structure, equipment, waterline materials, true measurements, permit/engineering documents and any pool safety claims before presenting them as factual.
3. Inspect real rendered responsive crops at 320/390/768/1280/1440 widths. TM-064 wide crop truncates the tall facade and the water plane, TM-066 wide crop drops much sky context, TM-069 tall mobile crop removes much of the wings and surrounding lawn.
4. Re-run source CI and Chromium responsive reviews on the new commit and audit labels at desktop/phone viewports.
5. Keep all three assets `needs-review`, **zero rights approvals**, no `main` merge.

**Next batch:** `fitness-launch` (2 photos), then `tattoo-studio` (2), `architecture` (2), `contractor` (2), `law-firm` (1).
