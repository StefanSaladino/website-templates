# SERA — fictional restaurant photography, venue and booking integrity audit

_22 November 2026 · `feature/component-showroom` · image screening only; zero media licensing approvals._

## Evidence and limits

- [Three-photo private capture workflow](https://github.com/StefanSaladino/website-templates/actions/runs/45052316409) retrieved **3/3** unapproved original-template Unsplash JPEG samples with zero errors, seven desktop/phone crop alternatives each and a seven-day private evidence artifact.
- Photographs show unrelated hospitality venues and do not prove that SERA operates, has real staff, seats or kitchen, or serves any menu. The source-page/photographer identities, commercial display/derivative terms and identifiable location/property consent remain unverified.
- The historical page included the invented Toronto address 1187 Queen Street West, mock opening hours, 38 seats, a 21-day reservation promise and a non-submitting booking form; none can be treated as real-world booking details.

## Per-image findings

| ID | Preview dimensions | Observed photo and misleading-use risks |
| --- | --- | --- |
| **TM-047** | 1800×2733 | Dark plum and black paneled wall with a tall thin shaded lamp; a corner of a set table, drinking glass and folded linen appear near the lower edge. Existing lamp/table description is broadly consistent, though visible glass is not confirmed as wine. Stock photo cannot document SERA or its claimed seat count, layout or location. Wide crop reduces the already-limited lower table context; tall phone retains wall and lamp. |
| **TM-059** | 1800×2701 | Dim furnished dining interior with wood-topped round tables laid with cutlery, glassware and napkins, dark chairs, and a large semicircular arched window in the background. Description of an arched-window restaurant is supported; fictional SERA ownership, service, neighborhood and room dimensions are not. Wide crop mostly shows foreground table setting and loses the arch; tall crop keeps window/table relationship. |
| **TM-063** | 1800×2700 | Opulent interior with many bright golden orb/pendant lights, curved tan upholstered banquette or booth seating, round set tables and lush center greenery. Existing hero alt incorrectly emphasized dark wood tables rather than the bright golden pendants and upholstery. Photo is not evidence of SERA's imaginary open kitchen, 38 seats or Queen West setting; wide crop removes portions of room ceiling and floor. |

## Sample CDN JPEG SHA-256

| ID | SHA-256 |
| --- | --- |
| TM-047 | `063864bad53e82cc7817efef46302e90db21737250bc655a8ca157f99d2f6016` |
| TM-059 | `343f6a4ff7a55eec0b3c853e23abc4e1ebddfb296e412bf69e2fa44b8b4b3343` |
| TM-063 | `651154e2c7537c87c907b610a96ffa23921b84e550992bde4415333b3ed370af` |

## Corrections in original SERA site

- Added an unmistakable above-hero **fictional restaurant** notice and on-photo labels identifying unrelated third-party restaurant interiors.
- Corrected TM-063's hero alt to gold pendant fixtures, upholstered curved seating and dining tables; kept TM-059's arched-window context and described TM-047's wall-mounted lamp, drinking glass and small portion of the table without inventing wine.
- The five-line menu explicitly comprises invented dishes and prices, with no food prepared or ingredient/allergen claims verified.
- Removed unsupported 38-seat and 10-bar-seat operational claims by converting them into examples, along with invented open-kitchen, Toronto location, address, opening hours, 21-day booking window and nightly walk-ins.
- The date/party-size/email form remains an interactive **demo only** with an accessible submission status: no table booked, availability queried, personal data transmitted or payment made. The site does not send users to a fabricated restaurant.
- Browser smoke tests verify attribution, truthful alt text, fictional menu and venue, removed fake street address and explicit demonstration-only reservation behaviour.
- Photo credits in the original footer were unverified and did not account for all three identities. They were replaced with an explicit attribution/rights-pending notice without falsely claiming that the photographer or image rights have been established.

## Open release blockers

1. Verify exact creator, Unsplash source page, license details and brand/location/property implications for all three photos; do not distribute copies of the review artifacts as commercial assets.
2. If this becomes an operating restaurant site, replace reference photos with property-cleared actual SERA photography and substantiate hours, address, seat capacity, allergen policies, menu prices, and payment/reservation integration.
3. Inspect actual loaded images at desktop and mobile widths. The wide TM-059 crop removes much of its distinctive arched window and TM-047 reduces the small table context; TM-063 cropped too closely can misrepresent room scale.
4. Continue full current-SHA CI and Chromium QA; maintain accessibility and responsive behaviour of navigation, visual overlays and form feedback.
5. Preserve all 3 inventory entries in `needs-review`, rights approvals **0**, and leave `main` unchanged.

**Next photo family:** `pools`, three images.
