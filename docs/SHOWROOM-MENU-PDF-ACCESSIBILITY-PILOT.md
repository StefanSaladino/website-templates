# MENU-04 — tagged example PDF pilot

_Development-branch functionality; not an accessibility compliance certificate or a current restaurant menu._

## The previous problem

The original MENU-04 button downloaded a selectable ASCII text PDF without a structure tree, reading order tags or an explicit document language. Its page copy described this as accessible, which was too broad. The matching HTML page was already available, but the download alone remained a hard accessibility release blocker.

## Improvements

The browser-only PDF generator now embeds a structural document tree with H1/H2/P tagged reading order, MCIDs, a ParentTree, a declared \`en-CA\` language, a document title and a \`ToUnicode\` font mapping. Background graphics are marked as artifacts rather than reading content. The menu is still one page, generated locally, and contains no images or third-party resources.

The download status and interface now say **tagged, text-based sample**, not PDF/UA- or WCAG-certified. The exact menu remains readable as semantic HTML, with sample-only pricing and no verified allergens, kitchen or menu availability.

## Verification workflow

[Tagged sample PDF QA](../.github/workflows/menu-pdf-accessibility-qa.yml) opens the built MENU-04 page in Chromium, activates the actual PDF download, validates key structure markers, extracts text using Poppler, checks all three dishes and the disclaimer, and renders the first page to PNG. The sample PDF, render and machine-readable result ledger are retained as short-lived private Actions artifacts. The general \`browser-smoke.mjs\` suite also checks that the real download has the expected tags.

This is **not** complete PDF/UA validation. A tagged file can still contain other PDF accessibility errors. Before any real client rollout: check with PAC or an equivalent professional PDF checker, test the generated document's heading navigation and reading order with a supported PDF screen reader, audit colour contrast and text sizing, confirm real ingredients/allergens, and obtain written release approval. No component has been promoted to \`live\`.


## Verified result — tagged sample actually renders (22 November 2026)

The dedicated GitHub Actions PDF pilot **passed**: [run 45071727277](https://github.com/StefanSaladino/website-templates/actions/runs/45071727277), including Chromium download, tag-marker inspection, `pdfinfo`, `pdftotext -layout`, and one-page PNG rendering. The 5,108-byte browser-generated PDF declares PDF 1.7, a one-page US Letter document, tagged status `yes`, a proper document title and language `en-CA`. Poppler extracts all three dish names, price examples, sample-only disclosure and ingredient/allergen warning. A manual inspection of the generated 140-DPI PNG showed no clipped text, colliding lines, unreadable characters or missing disclaimer.

The short-lived `menu-04-pdf-review-evidence` workflow artifact contains the PDF itself, a rendered PNG and a JSON pass ledger. **This confirms structural tagging and ordinary rendering only**, not independent PDF/UA certification or screen-reader support.
