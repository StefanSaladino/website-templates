# MONOLITH — image and architectural attribution audit

_21 November 2026 · review branch · preliminary only; no creator/licensing/design credit approval._

[Candidate workflow](https://github.com/StefanSaladino/website-templates/actions/runs/44947701344) captured four of four transformed Unsplash JPEGs at requested 1800px width, with seven crop alternatives each and zero download failures. Candidate images are held in a private seven-day artifact; crops are **not** final rendered CSS layouts and source pages, design ownership and rights are unknown.

| Media ID | Candidate dimensions | Observations |
| --- | --- | --- |
| **TM-022** | 1800×1350 | Sunlit contemporary living room with upholstered armchairs, leather sofa, indoor plants, tall windows and grid of framed art. Tall phone crop cuts edge of sofa, but keeps wall gallery. No verified studio commission or location. |
| **TM-023** | 1800×1200 | Geometric contemporary house EXTERIOR from driveway, clad in timber and pale stone/concrete surfaces. Original alt falsely described an interior. Narrow 3:5 phone crop removes building wings. |
| **TM-024** | 1800×1200 | Dusk view of broad glazed angular residence with glowing interior behind a large foreground tree. Original hero alt underdescribed low-light setting. Tall mobile crop loses parts of building facade. |
| **TM-025** | 1800×1200 | White two-storey geometric modern house beside clear blue pool with broad glazing, wood soffit and midday sky. Ontario project location and designer unknown; phone crop loses the right-hand structure. |

## Candidate JPEG SHA-256 (not licensed original hashes)

| ID | SHA-256 |
| --- | --- |
| TM-022 | `7fa8a6c7ca559fbaa5685bc46869f27068d49c4744b1bac1fa6fe05e6a0a5925` |
| TM-023 | `7daf520b793f4123c510588807c40a1d09bbdb81d4dbad1845f4c8f4ff49e708` |
| TM-024 | `23806d8ff2bcc2de30fc91671cabf59cee7162c67dcc55d9ee2a629c736ac518` |
| TM-025 | `d436e06eb60569465b2fb93c540d1dd8dc53ea5fdd3eda00db0cab0fe9207b90` |

## Corrections committed

- TM-023: fixed the false 'stone interior' alternative text and project type: image actually depicts a modern geometric house **exterior**.
- TM-024: updated alt text to describe a house at dusk behind a large tree; TM-022 indoor seating and TM-025 white pool house descriptions also made specific.
- Added a visible attribution notice before the project images: named properties, Toronto/Ontario places and design commissions are **fictional**, while pictures are unrelated stock.
- Replaced the claimed project-year period and location assertions with fictional-example or unverified-language. Footer explicitly flags Unsplash creator/licensing review.
- Kept portfolio image layout and ANIM-17 sticky chapters intact. Added Chromium assertions for the disclosure, exterior alt and project caption.

## Still required

1. Verify each exact Unsplash source and named photographer, copyright/license scope, model/property permissions if necessary, trade dress and project attribution before any commercial release.
2. Replace misleading stock portfolios with verified client project imagery or explicit architectural references. Do not imply authorship of recognizable buildings.
3. Check loaded images in browser at 320, 390, 768 and 1440 pixels. Tall crops can cut the interior sofa, the exterior facade and pool. Review accessible mobile captions and typography.
4. Keep all four images `needs-review`; stakeholder/media acceptance and physical-device QA are incomplete. No merge to `main` or component promotion.

**Next batch:** `woodworker` — four photographs, with similar false-crafted-work/portfolio attribution risk.

## New real photographer-attributed images — 23 November 2026

The historical Unsplash candidate observations above are no longer active. Four verified official Pexels original photo pages now support the full MONOLITH layout:

- **TM-109:** [Lisa Anna — photo 19836798](https://www.pexels.com/photo/interior-of-a-modern-minimalist-living-room-19836798/), replacing TM-022; photographed a grey sofa, botanical framed art, and a tall window in a living room.
- **TM-110:** [Erik Mclean — photo 4744622](https://www.pexels.com/photo/modern-house-on-grass-in-daytime-4744622/), replacing TM-023; photographed a dark timber-clad geometric contemporary residence on a grassy slope.
- **TM-111:** [Dom Sch-veg-man — photo 14645272](https://www.pexels.com/photo/photo-of-a-seaside-house-with-a-sunset-reflecting-in-the-glass-14645272/), replacing TM-024; photographed a modern glass-walled seaside structure reflecting sunset and trees.
- **TM-112:** [Sara Brahollari — photo 25934928](https://www.pexels.com/photo/swimming-pool-outside-a-modern-wooden-house-25934928/), replacing TM-025; photographed a timber-clad contemporary house beside an outdoor swimming pool.

The real photographs are unrelated independent references, not MONOLITH project evidence. Main hero contact sheet, all four example studies, root catalogue thumbnail, responsive `src`/`srcset`, alternative descriptions and footer attribution have been synchronized. ANIM-17 integration is unchanged. Manual follow-up: confirm the actual crop positions at 320/390/768/1280/1440, contrast and legibility, real-device/screen-reader navigation, release rights for displayed properties/artwork and final commercial redistribution; source verification is not rights approval. No local derivative approved. Current original image ledger **74 total, 49 source-identified, 25 unsourced, 0 approved**.
