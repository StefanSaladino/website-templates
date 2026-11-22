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
| Build and source checks | Node 22 install, `npm run build` succeeds with `validate`, `check-previews`, `check-media`, `check-template-media`, review-contract, Vite and built-output checks | **Verified green at `e4e6c96`** for both full CI and Chromium review; after the forced-click zoom-control regression in AFTER DARK, later browser review QA passed at `bc4dbaf`, `e832d1a` and `23e6e31`; MORA at `dab4552` and landscaping at `7336107` passed GitHub Pages, full CI and Chromium review; current SERA corrective commit requires fresh checks |
| Full Chromium browser suite | `npm run check:browser` exits 0, responsive review evidence produced, all interactions pass, no uncaught errors | **Passed through `6ec13c1`** (CI and Chromium review QA green); newest image-candidate review tooling has additional offline checks pending |
| Desktop and phone visual checks | Review thumbnails, 320/390/768/1280+ breakpoints, overflow, clipped copy, font sizes, image crop, native dialogs, art direction, independent mobile alternatives | **In progress:** mobile treatment screenshots reviewed; native 1440/1280 desktop capture now part of browser QA; loaded-media and physical-device acceptance still pending |
| Accessibility | Keyboard-only navigation, visible focus, names/roles/states, dialogs, tablists, semantic reading order, screen-reader announcements, contrast, reduced-motion, forms and error messages; independent audit | **Not approved** |
| Source media and rights | For every asset, verify exact creator/source/license, property or likeness constraints, use/crop in redistributed demo, optimize local derivatives, confirm relevant context | **26/26 component images and 71/71 original-template media identities remain in review; 0 approved.** Separate original-template inventory and source-usage build gate in place; local-only crop generator added; all 11 FRAME, nine editorial-commerce, five Muskoka, one OFFCUT poster, four GARAGE, four CURRENT real-estate, four MONOLITH architecture and four GRAIN & GABLE woodworker and four AFTER DARK event-launch and three DOT + CRUMB bakery and three MORA storefront and three BED & BORDER landscaping and three SERA restaurant and three TIDEFORM pool and two YARD training and two BLACKLINE tattoo and two MORROW architecture images visually reviewed (67 image identities at prior checkpoint, now supplemented by contractor 2/2 and law-firm 1/1; all 70 still/poster identities have preliminary image review). Woodworker TM-048 shows a barefoot person operating a circular saw and must be replaced before release; linked component STOCK-013 carries an urgent-replacement safety flag. The OFFCUT MP4 was HEAD-probed only; endpoint size, duration, codec and film composition remain unverified. Its 4K playback is now explicit opt-in with no autoplay/preload. All creator and redistribution rights remain unresolved; **0 media approvals**. 57 template identities have no matching component stock record |
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

Run `npm run review:template-media -- --templates=architecture --limit=2` inside `components/` to produce an ignored, local `stock-candidates/template-review/index.html` review sheet, original candidate bytes, 16:9 / 5:4 / 3:4 desktop and 3:4 / 3:5 phone comparisons, and a JSON ledger recording the candidate image dimensions and SHA-256 fingerprints. For OFFCUT's separate video, the technical probe obtains headers only and cannot infer duration, visual composition, or rights. The CI build runs a deterministic **offline-only** generator test, not a remote-download test. Never treat candidate images or generated previews as licensed redistribution assets; full visual, licensing and release reviews remain open. See [candidate review instructions](./SHOWROOM-TEMPLATE-MEDIA-INVENTORY.md#candidate-image-qa-workflow-local-only-tooling).

## Honesty and source restrictions

Sample brands, customer testimonials, staff portraits, fictional prices, menus, events, facilities and venues are **not proof of real services or endorsement**. Media in `stock-manifest.json` remains review-only. No speculative review may be presented as a real customer's words. Example reservation or contact controls must never claim a live booking, lead submission or enrollment unless a real provider confirms it. The sample contact mailto uses the reserved `example.com` domain and cannot be treated as a receiving inbox. All review UIs should retain visible sample-content limitations.

## Publication decision

Do not merge, mark entries `live`, publish client-facing claims, or remove sample notices solely because catalogue development has reached 157/157. First pass the gates above, repair discovered defects, obtain media and stakeholder approval, then separately authorize a controlled release. This document records **remaining work rather than asserting completion of QA**.

## November 22 follow-up — final original-template still-image screening

The `contractor` and `law-firm` candidate workflow inspected the three remaining original-template still identities (`TM-010`, `TM-046`, `TM-053`) at 1800px source-preview widths with 16:9, portrait and phone crops. **70/70 still/poster identities now have preliminary visual observations; the OFFCUT video remains unviewed apart from headers.** The audit corrects fictional project attributions, nonexistent lawyer profiles and no-submit form claims without marking media as licensed. See the dedicated contractor and law-firm pilots. The GitHub candidate evidence run passed: https://github.com/StefanSaladino/website-templates/actions/runs/45066123356 . This is candidate capture, not a successful release QA or rights clearance; current implementation-commit CI must be verified separately.

## Woodworker remediation checkpoint — source work complete, release still blocked

An unsuitable stock image showing a barefoot circular-saw operator has been retired as **TM-048 / STOCK-013**, and all three source appearances have been replaced by original joinery illustrations. The original photo evidence remains in `SHOWROOM-WOODWORKER-MEDIA-PILOT.md`. The active inventories now list **70** original-template remote media identities (69 stills/posters and the undownloaded OFFCUT video) and **25** component stock records. **Zero media records are rights-approved.** The completed still-image visual screening now covers all 69 currently active still/poster identities.

The `main` branch remains unchanged. These editorial design fixes do not establish external-image rights, loaded-photo crop quality, real-device usability, accessibility certification or client approval. Both Chromium workflows for the remediation commit must pass before this source-level milestone is considered regression-verified.

## Editorial-commerce product-reference retirement (22 November 2026)

Branded/mismatched sample photos TM-005, TM-044 and TM-065 were replaced with original SVG product studies. Eight product cards and integrated ANIM-09 remain functional at source level. **Active original-template media now 67** (66 still/poster, one film), **active component stock 25** (unchanged), none approved for redistribution. Source/build and current browser QA must still pass; real-device, loaded-image and accessibility review remain unsatisfied.

## Muskoka accommodation imagery remediation — 22 November 2026

Two unsuitable stock photographs **TM-031** (alpine cabin) and **TM-021** (winter hut misrepresented as suite) are now retired from Morrow House; an original fictional setting illustration, suite floor-plan study and winter scene replace the three prior placements. Booking/date CTAs are explicitly non-operational. **Active original-template media: 65 identities (64 still/poster and one video), all unapproved; active component stock: 25, all unapproved.** The remaining three Morrow House stock sources are not evidence of actual accommodation. Full Chromium QA, rendered-device crop checks, media licences, accessible product/booking feedback and stakeholder review remain required before release.
