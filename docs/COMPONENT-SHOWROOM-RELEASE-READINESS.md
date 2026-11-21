# Boomer Automation showroom — release-readiness gates

_Implementation and QA checkpoint: 20–21 November 2026. Development branch: `feature/component-showroom`. This is an implementation-complete, **NOT production-approved** project._

## Catalogue implementation

- **157/157 core component examples** exist with their own `components/previews/<ID>/index.html`, `styles.css`, and `script.js`, plus explicit responsive design and `in-review` catalogue metadata.
- **44/44 optional mobile alternatives** and **20/20 integrated animation patterns** remain implemented.
- **0 components are `live`**. No merge to `main` and no public release has been authorized.
- Final ten: `POST-01..04`, `EVENT-01..04`, and `CONTACT-03..04`. Their interaction regression scenarios are added to `components/scripts/browser-smoke.mjs`.
- Both automated CI workflows **passed** at baseline commit `be7ebb3` ([component CI](https://github.com/StefanSaladino/website-templates/actions/runs/44845459455), [review QA](https://github.com/StefanSaladino/website-templates/actions/runs/44845459592)). Subsequent responsive and media-inventory improvements have new build/browser regressions under execution; passing an earlier SHA does not sign off later changes. This does **not** establish accessibility, media or design approval.

## Hard release gates

| Gate | Required evidence | Current state |
|---|---|---|
| Build and source checks | Node 22 install, `npm run build` succeeds with `validate`, `check-previews`, `check-media`, `check-template-media`, review-contract, Vite and built-output checks | **Verified green through `6ec13c1`** for build and Chromium review; new candidate-preview tool has separate offline regression still pending |
| Full Chromium browser suite | `npm run check:browser` exits 0, responsive review evidence produced, all interactions pass, no uncaught errors | **Passed through `6ec13c1`** (CI and Chromium review QA green); newest image-candidate review tooling has additional offline checks pending |
| Desktop and phone visual checks | Review thumbnails, 320/390/768/1280+ breakpoints, overflow, clipped copy, font sizes, image crop, native dialogs, art direction, independent mobile alternatives | **In progress:** mobile treatment screenshots reviewed; native 1440/1280 desktop capture now part of browser QA; loaded-media and physical-device acceptance still pending |
| Accessibility | Keyboard-only navigation, visible focus, names/roles/states, dialogs, tablists, semantic reading order, screen-reader announcements, contrast, reduced-motion, forms and error messages; independent audit | **Not approved** |
| Source media and rights | For every asset, verify exact creator/source/license, property or likeness constraints, use/crop in redistributed demo, optimize local derivatives, confirm relevant context | **26/26 component images and 71/71 original-template media identities remain in review; 0 approved.** Separate original-template inventory and source-usage build gate in place; local-only crop generator added; all 11 frame-portfolio plus nine editorial-commerce candidates downloaded and preliminarily inspected, with crop, branding and fictional-product mismatches recorded; **0 media approvals**. 57 template identities have no matching component stock record |
| Accurate external actions | Real email/form delivery, user consent, booking or RSVP provider, product checkout, event schedules, service addresses and permissions must actually exist before corresponding claims appear | **Demonstrations intentionally local-only or fictional** |
| Sample documents | Render and inspect MENU-04 PDF and its HTML equivalent for content, print layout, filename, characters and accessibility | **PDF generator structure sanity-checked only; PDF untagged** |
| Animation | Verify all 20 animation patterns appear as intended in full templates, offer reduced-motion alternatives, and never disrupt keyboard access or reading | **Integrated, full visual acceptance pending** |
| Stakeholder signoff | Per-family design review, approved image/media inventory, written acceptance, explicit promotion decisions and release authorization | **Pending** |

## Repeatable QA commands

From a fresh clone of this **review branch**:

```bash
cd components
npm install --no-audit --no-fund
npm run build
npx playwright install --with-deps chromium
npm run check:browser
```

The two established CI definitions are `.github/workflows/component-showroom-qa.yml` and `.github/workflows/component-showroom-ci.yml`. It runs the source/build checks and Playwright Chromium suite on review-branch component changes, PRs and manual dispatch, then uploads `components/component-browser-evidence/` as `showroom-browser-evidence`. Inspect the actual run outcome, downloadable screenshots and `results.json`; an empty legacy commit-status list **does not mean CI passed**. System Chromium launch was confirmed by the successful November 21 baseline runs; continue verifying all subsequent executions.

Supporting QA reports: [Pass 2 visual audit](./SHOWROOM-VISUAL-QA-PASS2.md), [Pass 3 media and native-desktop audit](./SHOWROOM-MEDIA-QA-PASS3.md), [Pass 4 accessibility audit](./SHOWROOM-ACCESSIBILITY-QA-PASS4.md), and [original-template media inventory](./SHOWROOM-TEMPLATE-MEDIA-INVENTORY.md). For manual QA, open the build through HTTP rather than `file://`; check both the showroom review surface and the isolated specimens. Confirm the 44 independent mobile choices remain selectable for their intended components, not just responsive CSS in each core preview.

## Local media candidate review (not approval)

Run `npm run review:template-media -- --templates=editorial-commerce --limit=9` inside `components/` to produce an ignored, local `stock-candidates/template-review/index.html` review sheet, original candidate bytes, 16:9 / 5:4 / 3:4 desktop and 3:4 / 3:5 phone comparisons, and a JSON file recording actual dimensions and hashes. The CI build runs a deterministic **offline-only** generator test, not a remote-download test. Never treat candidate images or generated previews as licensed redistribution assets; full visual, licensing and release reviews remain open. See [candidate review instructions](./SHOWROOM-TEMPLATE-MEDIA-INVENTORY.md#candidate-image-qa-workflow-local-only-tooling).

## Honesty and source restrictions

Sample brands, customer testimonials, staff portraits, fictional prices, menus, events, facilities and venues are **not proof of real services or endorsement**. Media in `stock-manifest.json` remains review-only. No speculative review may be presented as a real customer's words. Example reservation or contact controls must never claim a live booking, lead submission or enrollment unless a real provider confirms it. The sample contact mailto uses the reserved `example.com` domain and cannot be treated as a receiving inbox. All review UIs should retain visible sample-content limitations.

## Publication decision

Do not merge, mark entries `live`, publish client-facing claims, or remove sample notices solely because catalogue development has reached 157/157. First pass the gates above, repair discovered defects, obtain media and stakeholder approval, then separately authorize a controlled release. This document records **remaining work rather than asserting completion of QA**.
