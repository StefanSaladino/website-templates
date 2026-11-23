# YARD — fictional training club and athlete-photo integrity audit

_22 November 2026 · feature/component-showroom · visual screening only, no photo/likeness rights cleared._

## Evidence

- [Private 2-photo candidate workflow](https://github.com/StefanSaladino/website-templates/actions/runs/45054560428) captured both sample JPEGs, all desktop/phone crops and the source byte fingerprints, without error. Preview crops are a short-lived private QA artifact, not commercial-media approval.
- Images include identifiable gym users with visible clothing/fitness equipment branding. User/person releases, original creator/source, permissions for a fictional fitness business context, trademarks and redistribution derivatives are all **not verified**.

## Photograph findings

| ID | Preview size | Visual content and concerns |
| --- | --- | --- |
| **TM-018** | 1800×1202 | Rear view of a person with hair tied up, white athletic top and dark leggings, gripping a loaded barbell at head/overhead level inside a black metal squat/press rack against a grey brick wall. ROGUE logo visible on rack; clothing also has visible insignia. Not evidence of YARD facility, staff, equipment sponsorship or membership. 16:9 wide crop retains subject and bar but clips more of torso/equipment ends; narrow 3:5 phone crop may trim the plate/bar ends and centralize person. |
| **TM-068** | 1800×2700 | Indoor gym with a muscular adult with dark tied-back hair, a navy/black graphic tank and dark shorts leaning forward with both hands resting on/gripping the handles of two large kettlebells on the floor. Not walking or carrying the weights, despite original alt text. Gym equipment and a wall-mounted heater or unit are visible behind. Landscape 16:9 crop cuts off athlete's head and lower kettlebell detail. Neither athlete nor location is verified as YARD staff/client. |

## Captured transformed JPEG SHA-256

| ID | SHA-256 |
| --- | --- |
| TM-018 | `f4a9da3866226cb6195d8479ae4ac884cc20c538c54c9b657197a216479bfaa5` |
| TM-068 | `45f2bdcc843595381b3f30c727b5c0858bfb50f5182a258b0cc9240fdf6f3c71` |

## Corrections implemented

- Visible site-wide label identifies YARD as a fictional training-club template. No validated Toronto facility, active coaching, staff or classes; photography is unrelated to YARD.
- Hero TM-018 now has descriptive alt text identifying the back-facing lifter, loaded barbell and visible ROGUE rack instead of hiding a meaningful image. An on-photo stock label prevents false sponsorship or member identity. The wide landscape crop includes the lifter and bar but mobile crops truncate parts of the plates; inspect before eventual replacement.
- TM-068 originally said the person was carrying kettlebells; revised alt and captions identify a kettlebell setup with the athlete leaning over two bells. Desktop wide crop cuts off the person's head; preserve full face/head composition or replace with release-cleared alternative.
- Six-to-one small-group visual, training plan and weekly class times are explicitly sample content rather than current services. Existing interactive `ANIM-15` replay remains functional and visually distinct.
- First-session call to action and email form now explicitly preview-only. Its `role=status` tells visitors no class was reserved and no data was sent or stored.
- Added browser regressions for photo descriptions, invented studio/coaching claims, sample timetable and non-submitting signup.

## Remaining blockers

1. Verify exact source pages, creators, photo license terms, identifiable participants' consent for this fitness promotion, prominent equipment/clothing brand rights and whether the depicted gym allowed commercial context.
2. Replace image assets if source/consent cannot be established; avoid implying these people are members, coaches or affiliated with YARD.
3. Inspect real browser hero and body crops at 320, 390, 768, 1280, 1440px. The landscape crop of TM-068 cuts the person's head off; phone formats trim TM-018's barbell ends.
4. An actual gym implementation must verify real addresses, trainers' qualifications, class hours/capacity, safety policies, payment and booking mechanisms before removing preview notices.
5. All original-template media stay `needs-review`; no merge to `main`, and no approval until documented rights and QA.

**Next media family:** tattoo-studio (2 images).

## Publisher-sourced replacement of untraced athlete — 23 November 2026
The preliminary visual notes and SHA-256 for **TM-068 above describe a retired Unsplash athlete photo**, not the current YARD photograph. The secondary strength-story photograph now uses **TM-137**, [Jonathan Borba, Pexels 27810155](https://www.pexels.com/photo/a-kettlebell-and-a-barbell-on-a-gym-floor-27810155/). Its official publisher page names the photographer, says Free, lists **5088 × 3392**, and links to the exact original publisher JPEG. The scene is a real gym-equipment still life with three worn dark kettlebells and a foreground kettlebell at right. It is not evidence of a YARD venue or club equipment, but it avoids an additional unverified identifiable participant and conspicuous branded clothing from TM-068.
The full template's image band now has truthful alt, responsive `srcset`/`sizes`, native dimensions, lazy loading, focal position weighted toward the large foreground kettlebell, and a visible Pexels creator / fictional studio disclaimer. Original gallery still uses **TM-018**, the independently attributed John Arano action-lifter image, while adding an explicit fictional-club location label. **TM-018 remains high-priority for model, clothing and branded ROGUE-equipment rights; neither photo is rights approved.** Both source records complete the full-original-template attribution backlog at **74/74**; the 25 separate isolated component-stock entries, 157 component reviews, Step 18/19, physical-device/assistive-technology and downstream commercial-template photo rights all remain open. Current-commit loaded-image crops at 320/390/768/1440 and full browser QA must be checked before design acceptance.

## Original hero image replaced for brand/model-risk mitigation — 23 November 2026
The retired **TM-018** visual evidence, photo SHA-256, original author identity and ROGUE-labelled rack above describe *historical media only*; the current YARD page and root gallery no longer use that identifiable athlete or brand. **TM-138**, original [Pexels monochrome barbell photo 6389074](https://www.pexels.com/photo/monochrome-shot-of-a-barbell-6389074/) credited to Tima Miroshnichenko, 5622×3748, shows a heavily loaded stationary barbell on worn gym flooring beneath diffuse light. The publisher original image and Free label were inspected. The barbell's multiple black plates read clearly in the source, no visible athlete identity or ROGUE mark. The page uses sharp responsive variants (at least 1600px on phones), an accurate equipment alt, a visible source credit, cinematic high-contrast treatment and intentionally different desktop vs phone focal positions; original gallery uses the same photo. Other distinct YARD photo TM-137 Jonathan Borba kettlebells stays present and accurately credited. This avoids the model and branded-rack problems without treating third-party equipment as a real YARD gym. **Actual 320/390/768/1440 loaded screenshots and current SHA Chromium and gallery QA must be run** to accept the mobile barbell plate framing. Venue/photographer/source product-commercial redistribution still pending and neither photo licensed/released by reviewer. High-priority YARD athlete issue is retired, not legal-cleared. Step 18/19 remain pending.
