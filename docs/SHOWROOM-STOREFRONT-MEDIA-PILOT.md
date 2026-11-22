# MORA — fictional storefront and third-party brand integrity audit

_22 November 2026 · `feature/component-showroom` · media screening, **not licensing or production approval**._

## Evidence and scope

- [Three-photo capture workflow](https://github.com/StefanSaladino/website-templates/actions/runs/45040680200) downloaded 3/3 CDN-transformed Unsplash JPEGs (1800px wide), all seven crop alternatives each, zero failures. Artifact is a private seven-day source review, **not** a licensed local distribution package.
- The sample source pages, creators, trademark/model rights, relevant consent and commercial derivatives remain unverified. Branded third-party imagery cannot substantiate MORA product inventory, affiliation or any performance claim.
- The photos should remain `needs-review`. All prices, shipping terms, product/ingredient specs, refill systems, actual availability, and testimonials are fictional demo content.

## Specific image findings

| ID | Sample size | Observed subject and release issue |
| --- | --- | --- |
| **TM-034** | 1800×1200 | Bright white sink, steel faucet, round wall mirror, three transparent cotton/accessory containers on a wooden tray and a black pump bottle with visible other-brand lettering. Not a MORA bathroom install or verified MORA Sink Set. Portrait crop cuts right-hand black bottle and part of mirror; bath props should not imply a real kit for sale. |
| **TM-038** | 1800×1200 | Three pale skincare products on a stone plinth amid dried plants; the bottle labels visibly read ENDLESS PURE and include small printed product claims. MORA's hero presents a separate imaginary four-piece Daily Set with sample pricing; the photo is neither that kit nor MORA-branded. Tall crop captures all three containers but trims floral/stone context. |
| **TM-067** | 1800×1800 | Square warm interior photo: three red/burgundy skincare containers with legible branding staged on a white plinth bearing NORDIC in uppercase, above dark brown tiled display; overhead hanging pendant lamp and a plant. Clearly not MORA products and not evidence of its refills, sustainable packaging or manufacturing. Desktop wide crop loses much pendant lamp while retaining brand display; tall crop trims lateral plant context. |

## Temporary transformed JPEG SHA-256

| ID | Hash |
| --- | --- |
| TM-034 | `556012e416f65f1aef52fc4575e54a2fc236bd001687a1524868fdcd3b742a1f` |
| TM-038 | `e34ba4129ae17ed8f7ffad3d78609e8cde1ccf0e982c5f0f54b201f16b3a3d85` |
| TM-067 | `720511ab913866aa27472e4d9166542c3f1215e6e9970ab62e0703e0c0c3b799` |

## Template corrections

- TM-038: accurate alt text and a visible **ENDLESS PURE / not MORA** stock-photo label. The separate demo Daily Set and sample price are explicitly **not pictured**; add still operates in the local demo bag.
- TM-034: alt identifies third-party pump bottle and bathroom scene; photo tile now explicitly says **unrelated bathroom stock**, not a MORA product demonstration.
- TM-067: alt identifies NORDIC-labeled red products, and an overlay identifies them as unrelated to the MORA material story. Fictional refill, ingredients, textiles and sustainability claims no longer asserted as proven facts.
- Added a visible fictional-storefront disclosure above the hero and sample-catalogue note before the product grid. Removed unsupported real Canadian shipping offer, 'now live' collection, brand manufacturing assertions and fake named Toronto customer testimonial.
- Replaced inert checkout button with a **demo confirmation** action; no order/payment/backend exists. Demo newsletter says no email was sent, stored or subscribed. Preserve the interactive cart and ANIM-05 swatches.
- Added Chromium regression checks for the branded third-party photos, fictional attribution, non-submitting checkout/newsletter and working add-to-bag behaviour.

## Unresolved

1. Replace all three third-party branded photos with rights-cleared MORA-specific assets or explicitly nonbranded conceptual images before any commercial release; resolve photographer/source and potential visible labels and brand-endorsement concerns.
2. Separate actual product cards, prices and ingredient/material data from design placeholders if ever used as a real store; confirm shipping/returns, payment/security, real reviews and product-safety compliance.
3. Check image loading and crops in real Chromium page layout at 320, 390, 768 and 1440px. Wide crop of TM-067 truncates lamp; tall crop of TM-034 can cut brand bottle; determine if that crop masks, rather than solves, the attribution issue.
4. Keep media licensing and property/model releases unresolved. Candidate photos have not been approved for redistribution; don't promote to `main` or production-ready.

**Next three-photo family:** `landscaping`.

## Remediation: all three branded stock photos retired (22 November 2026)

MORA now uses **three original CSS-rendered concept illustrations** rather than TM-034 (other-brand bathroom products), TM-038 (ENDLESS PURE hero) or TM-067 (NORDIC material display). The new hero arrangement, sink/still-life study and material study have descriptive `role="img"` labels. The fictional local bag, newsletter/checkout safeguards and ANIM-05 colour selections remain. The historical findings above remain as the reason for removal, **not as active media**.

The three retired IDs have been removed from the active original-template media inventory and added to the forbidden-retirement regression list. The loaded-image browser batch no longer expects external MORA `<img>` tags, and the offline review test checks all three images remain absent. The page and demo controls still require real-browser, phone and screen-reader/visual acceptance; these source changes are **not** a claim of licensing approval for any other media.
