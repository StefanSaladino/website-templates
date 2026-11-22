# BLACKLINE SOCIAL CLUB — image identity and fictional studio integrity

_22 November 2026 · feature/component-showroom · preliminary image screening; 0 rights approvals._

## Evidence and context

- [Two-image private capture workflow](https://github.com/StefanSaladino/website-templates/actions/runs/45055138295) fetched 2/2 transformed Unsplash source previews, alternative desktop/phone crops and an unapproved 7-day QA artifact, without errors.
- The artist/client identities, photographer(s), provenance, photographer's license, personal likeness rights, photographed tattoo artwork rights, machinery branding, event/location and any privacy implications remain unverified.
- BLACKLINE, its founding date, precise operating location, staff artist profiles, tattoo portfolio, finished tattoos, deposit policy, available flash pieces and booking process are fictional. These stock photos do not show authorized BLACKLINE work or staff.

## Per-photo visual review

| ID | Candidate size | Observation and risk |
| --- | --- | --- |
| **TM-030** | 1800×3198 | Close, over-the-shoulder view of a black-clad tattoo artist with dark hair wearing black gloves and using a dark wrapped tattoo machine against a client's already tattooed skin; some purple stencil marks visible at the right edge. The precise anatomical location cannot be determined from the photograph; original alt 'client's arm' unsupported. The device carries small visible product markings. The image cannot substantiate any BLACKLINE artwork, studio, equipment standards, identity or working relationship. Wide crop isolates machine, gloved hands and ink; tall phone crop retains some artist silhouette. |
| **TM-040** | 1800×2700 | A visibly tattooed bearded adult wearing glasses and a backwards grey cap tattoos the arm of a seated person with extensive existing ink. Black gloves, green-wrapped tattoo machine, a bright circular lamp, partial orange lettering and several background people are visible. Scene resembles a busy public tattoo setting but precise event/location and artist identity are unverified. Wide crop cuts upper lamp and parts of seated client's body; phone crops preserve artist and client's arm but cannot establish ownership of the tattoo artwork. |

## Transformed sample SHA-256

| ID | SHA-256 |
| --- | --- |
| TM-030 | `a26e8dd802ced6762be098f2d3a774139135e570adf2420fd259e83a978ed9aa` |
| TM-040 | `ee207750480b7c2d67cdcdd21517e40aa8264f0479e75fb7124b2adc829ec457` |

## Corrections made

- Added a visible **fictional studio** disclaimer above the full-screen hero. Removed fabricated 2019 founding date, numeric Toronto coordinates, implied active appointment policy and all invented contact-booking promises.
- TM-040 hero and gallery captions now describe a recognizable tattooed adult artist in glasses and a backwards cap, a seated client, and ring-light environment, without asserting a confirmed tattoo convention or artist identity. The image is explicitly labelled stock and unrelated.
- TM-030 gallery and feature-image alt describe visible gloved tattoo machine work against existing ink, without falsely claiming that an arm is depicted. Photo and art are not a BLACKLINE portfolio example or healing-outcome evidence.
- Three named artists are clearly marked **invented** with non-bookable profile links. SVG flash sheet is **illustrative** and not available as a real commission.
- Booking journey is a demonstration only: sample artists, consultation, deposits, tattoo sizing and aftercare are not live studio services. Form submission updates an accessible `role=status` message that no appointment, deposit or data transfer occurred.
- Removed decorative arrow glyphs from links and CTA text, preserving hero parallax, gallery layout, `ANIM-18` rhythm replay and responsive menu.
- Browser smoke assertions cover image truthfulness, artist/flash fiction, and no-submission form behaviour before replaying animation.

## Outstanding requirements before any release

1. Verify source pages, photographers, licensing and use of visible third-party tattoo designs. Obtain/review commercial promotional likeness and tattoo-artwork rights for identifiable artist, client and bystanders; avoid implying their endorsement or relationship with BLACKLINE.
2. Confirm actual studio identity, artist identities, portfolios, consent procedures, aftercare claims and any operating location before substituting factual claims or enabling booking. Do not publish unverified safety/medical claims.
3. Review browser-loaded crops at 320/390/768/1280/1440; wide TM-030 crop loses body/context and TM-040 wide crop cuts overhead lamp and portions of seated client. Avoid cropping identifiable art in ways that falsify an artist's work.
4. Full current-commit Chromium regression and Pages validation must pass; preserve gallery rhythm reduced-motion support.
5. Both identities remain `needs-review`, original 71 media approvals remain zero, no merge to main.

**Next family:** `architecture` (2 photos), followed by `contractor` (2), `law-firm` (1).
