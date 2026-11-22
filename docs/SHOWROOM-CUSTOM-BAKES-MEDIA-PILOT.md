# DOT + CRUMB — bakery imagery and sample-order integrity

_22 November 2026 · `feature/component-showroom` · visual screening only, no photo or business licensing approval._

## Evidence boundary

- [Private candidate workflow](https://github.com/StefanSaladino/website-templates/actions/runs/45040133495) successfully obtained all three Unsplash 1,800px-wide JPEG samples with zero errors, a comparison HTML sheet and seven crop stress tests per image.
- The downloaded JPEG hashes describe transformed CDN candidates only. No original photographer page, named license, image/model/property/trademark rights or commercial redistribution permission has been substantiated.
- This is a **fictional Burlington-inspired bakery**. Nothing establishes the business exists, accepts orders, fulfills cakes/cookies, maintains a pickup address/calendar, or charges the listed example prices. No ingredients, allergens, flavours or serving sizes are verified by stock photos.

## Image findings

| ID | Preview size | Observed content and open risks |
| --- | --- | --- |
| **TM-029** | 1800×2250 | A hand pours glossy dark chocolate sauce over a small round pale dessert on a clear glass cake stand. A plainly visible Nutella-branded jar stands in the background; this is not a one- or two-tier wedding cake, nor demonstrated bakery work. Wide 16:9 crop cuts tabletop/stand context; phone tall preserves the jar and pouring hand, but risks implied endorsement of Nutella. |
| **TM-037** | 1800×2700 | Pastel sugar cookies shaped as white unicorn heads, pink number fours and round initial-L medallions displayed on a white cake stand. Generic cookie offering is visually aligned but no evidence this bakery made them or that pricing/minimum order matches. Wide 16:9 crop loses the outer stand and some cookies; tall crop preserves most examples. |
| **TM-060** | 1800×1200 | An extreme macro of pale yellow-to-cream frosting or whipped topping in piped swirls with orange-coloured bits/shavings. Does not show an entire cake or verify a vanilla bean raspberry layer, cake dimension, buttercream recipe, edible ingredients or wedding/celebration inventory. Wide crop still macro; tall crop limits context further. |

## Temporary source JPEG SHA-256

| ID | Hash |
| --- | --- |
| TM-029 | `2b300481f51c778cde46082cbecdc53387c729bee81f04424565000bd335007e` |
| TM-037 | `6a81bfd0586ea5a32381d152f18a65041e6e0390c11da530ac82544a7d1f44a8` |
| TM-060 | `2ec0d4ed7dd20624510452a85d16bbd5d7d6087cb0f89be5b239030e1b72c38f` |

## Changes to the example site

- Added a prominent fictional-business banner with no booking/ordering status; replaced unverified Burlington 'made here' and lead-time availability claims with a conceptual location and no bookings.
- **TM-060:** corrected the hero and product alt text to piped-frosting macro, and removed unsupported 'vanilla bean + raspberry' flavour assertions. Illustrative detail is not proof of cake ingredients or a finished product.
- **TM-037:** named the visible pastel unicorns, number fours and initial-L cookie shapes instead of attributing generic cookie orders to the nonexistent studio.
- **TM-029:** accurately described the small chocolate-topped dessert, hand and Nutella-branded background jar. Marked it conspicuously **not a wedding cake**. Prioritize replacement before any commercial use due to wrong product category, visible unrelated brand and potential implied endorsement.
- Kept fictional three-item menu but identified all photos, flavour/size information and prices as unverified illustrative examples. Removed unsubstantiated pickup/Instagram contact details; the order form explicitly confirms that no inquiry, deposit or booking was sent or saved.
- Existing mobile date-field sizing, page compositions, and browser motion and interaction tests remain. New browser regression checks cover photo truths, explanatory sample banner and no-submit form feedback.

## Other QA regression addressed

- [Prior AFTER DARK QA run](https://github.com/StefanSaladino/website-templates/actions/runs/45034098943) failed after hundreds of checks on `locator.check({force:true})` for a visually hidden 1px `fit` radio following keyboard panning. The `bc4dbaf` candidate commit updates both zoom transitions to click their visible labels and explicitly verify the checked state. No underlying browser behaviour is considered verified until the new Chromium suite succeeds.

## Still unresolved

1. Replace TM-029 with an accurately categorized, rights-cleared wedding cake photo (or revise the sample category to match a genuine product) and establish trademark/endorsement handling if retaining branded imagery.
2. Verify image creator/license/source pages and consent for all photos, including possible recognizable hands or branded products. Do not publish or redistribute unapproved samples as finalized customer work.
3. Test real loaded photos at 320, 390, 768, 1280 and 1440 widths; extreme frosting macro crops lack product context, and cookie/cake-cover crops cut parts of the scene.
4. Resolve the browser QA failure with a green current-SHA run before signoff; validate real ordering, food safety and nutrition/allergen disclosures only if a real bakery is ever deployed.
5. Maintain all three `needs-review`, **0 approvals**, and no promotion to `main`.

**Next family:** `storefront`, three original template photographs.
