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
