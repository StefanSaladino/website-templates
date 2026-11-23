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
| Accessibility | Keyboard-only navigation, visible focus, names/roles/states, dialogs, tablists, semantic reading order, screen-reader announcements, contrast, reduced-motion, forms and error messages; independent audit | **Targeted Chromium keyboard regression 78/78 passed across all 24 full templates** in [run 45077876064](https://github.com/StefanSaladino/website-templates/actions/runs/45077876064); **not accessibility-approved**. Real screen readers, visual contrast and human audit remain pending. |
| Source media and rights | For each active photo, poster and video verify creator/source, license and redistribution limits, depicted-person/property constraints, accurate descriptions and local optimization | **Current active inventory: 25 component stock records and 62 full-template identities (61 still/posters, one OFFCUT video); 0 rights approvals.** The formerly unsafe barefoot-saw image and misleading branded/product references were retired and replaced with original illustrations. Active still/poster sources have preliminary visual screening only, with no redistribution approval or loaded-photo/device acceptance. OFFCUT film source/page was identified, but exact content, MP4 characteristics and lightweight rendition remain unverified. |
| Accurate external actions | Real email/form delivery, user consent, booking or RSVP provider, product checkout, event schedules, service addresses and permissions must actually exist before corresponding claims appear | **Demonstrations intentionally local-only or fictional** |
| Sample documents | Render and inspect MENU-04 PDF and its HTML equivalent for content, print layout, filename, characters and accessibility | **Tagged one-page PDF sample generated, rendered and text-extracted successfully** in [PDF QA run 45071727277](https://github.com/StefanSaladino/website-templates/actions/runs/45071727277); structure and selectable text verified. **Not PDF/UA or assistive-technology certified**. |
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

## OFFCUT film source verification and bandwidth controls — 22 November 2026

Pexels video 9489382 now has a verified public page identifying **cottonbro studio**, with the Pexels public license permitting website/template use subject to limitations. **TM-001, TM-071 and STOCK-011 remain unapproved** pending exact depicted-person/endorsement review, full MP4 visual inspection, lower-resolution local rendition, actual size/duration/codec and handset testing. The OFFCUT player now uses two-step confirm-before-stream, an unknown-size warning, Save-Data block and source detach on stop/offscreen/tab hiding; the rest of its portfolio and example contact destination are explicitly fictional. The original-template media inventory remains **65** (64 still/poster and one video), and component stock remains **25**. Source-level checks and CI are not authorization to publish.


## Keyboard and sample-PDF accessibility checkpoint — 22 November 2026

- OFFCUT, RANGE/FOUND and Morrow House now offer visible skip links, 3px focus indicators and keyboard-safe mobile navigation. The first breakpoint handoff implementation revealed a timing issue; corrected run [45071383861](https://github.com/StefanSaladino/website-templates/actions/runs/45071383861) passed all **9/9** focused keyboard cases. This is not a full screen-reader/contrast assessment or acceptance of the other 21 templates.
- MENU-04 previously generated an **untagged** PDF. Its new local browser generator emits a PDF 1.7 structural tree, H1/H2/P reading tags, `en-CA` language, Unicode mapping and artifacts for decorative geometry. [Actual PDF render/text QA run 45071727277](https://github.com/StefanSaladino/website-templates/actions/runs/45071727277) passed; Poppler reports **Tagged: yes**, one Letter page, and extracted all required sample text. The matching semantic HTML remains available. This does **not** establish PDF/UA certification, professional PDF accessibility approval or verified real menu content.
- Full showroom browser CI, remaining media rights and physical-device QA are separate outstanding release gates. No component was marked live and `main` is unchanged.

## Expanded full-template keyboard QA: seven of twenty-four sites (22 November 2026)

The mobile-menu keyboard and focus handoff work is now implemented for **OFFCUT, RANGE/FOUND, Morrow House, LINE + LEVEL, GRAIN & GABLE, SERA and NORTHLINE LAW**, including skip links, destination focus after closing, Escape return, breakpoint focus and focus contrast enhancements. NORTHLINE's animated overlay additionally prevents focus escaping into its page and becomes inert while closing.

[Dedicated keyboard QA run 45072657451](https://github.com/StefanSaladino/website-templates/actions/runs/45072657451) **passed 18 standard plus 4 NORTHLINE tests (22/22)**. This is a scoped Chromium keyboard result, not screen-reader or physical-device certification. No media rights were approved. The other 17 full templates remain outside this specific test and must not be described as accepted. The full showroom Chromium suites, independent mobile screenshot acceptance and WCAG testing remain separate release gates.

## Four further full-template accessibility improvements — 22 November 2026

- **DOT + CRUMB, BED & BORDER, TIDEFORM:** skip-to-main, keyboard focus, mobile-menu destination handoff, Escape return and desktop resize focus fixes.
- **MORA:** mobile menu fixes plus a labelled and inert demo shopping-bag dialog with focus containment, background inertness, close/escape restoration, keyboard-safe item removal and no-payment safeguards.
- The completed [dedicated keyboard QA run 45075392398](https://github.com/StefanSaladino/website-templates/actions/runs/45075392398) passed **38/38 tests**: 30 standard browser cases (10 templates), four NORTHLINE animated drawer cases and four MORA bag cases. In total, **11/24** full templates have scoped keyboard test coverage; 13 do not.
- A malformed intermediate MORA JavaScript edit was caught by the dedicated browser suite and corrected from a known-good script. `npm run check` now begins with a syntax parser for every original template script to prevent future syntactically broken pages reaching deployment unnoticed. Follow-up build and full Chromium outcomes are assessed per current commit.
- This remains an **in-review** branch. The remaining 13 templates, real-device/screen-reader QA, complete WCAG contrast and accessible-document audits, rights clearance and media optimization, and stakeholder approval remain open. No merge to `main` is authorized.

## Further keyboard accessibility milestone — 22 November 2026

- **YARD, BLACKLINE SOCIAL CLUB, CURRENT:** added skip links and focusable main landmarks, repaired mobile menu link-to-section focus, Escape return, desktop breakpoint focus recovery and visible focus outlines.
- **AFTER DARK:** preserved its distinctive 390ms slide-out animation while preventing keyboard focus in a closing drawer; isolated the page with `inert` when the menu is expanded, contained Tab/Shift+Tab, restored focus on Escape and at desktop breakpoints, and respected reduced-motion preferences.
- [Focused browser run 45076502960](https://github.com/StefanSaladino/website-templates/actions/runs/45076502960) passed **51/51** tests: 39 across 13 full-site standard menus, 4 NORTHLINE animated legal drawer tests, 4 MORA demo-cart tests and 4 AFTER DARK animated event drawer tests. The deployment build for that tested commit passed; the broader showroom browser smoke/review pipelines are independently tracked.
- Keyboard coverage is **15 of 24** full templates; **9** templates remain. Third-party media source/rights and 4K film validation, photo contrast/crops, screen readers, real iOS/Android, document accessibility and final stakeholder sign-off remain release blockers. Everything remains `in-review`; no merge to `main`.

## Consolidated keyboard and source-integrity milestone — 22 November 2026

The original-template keyboard rollout has reached **24 of 24 designs**. [Full-template keyboard QA run 45077876064](https://github.com/StefanSaladino/website-templates/actions/runs/45077876064) passed **78/78** isolated viewport/interaction cases. The new `components/scripts/check-template-a11y.mjs` checks all 24 original HTML documents for duplicate IDs, missing main/skip landmarks, invalid static `aria-labelledby`/`aria-describedby`/`aria-controls` and `for` references, and broken in-page fragment links. These static checks were preflighted with no violations and added to `npm run check`; the Pages build for [source `cae93b8`](https://github.com/StefanSaladino/website-templates/commit/cae93b8dd404d7374eba6158f7e222e93023dfed) passed.

CI workflow definitions for full showroom CI, review QA and full-template keyboard regression now use per-branch **concurrency cancellation** for newer commits. Older pre-existing runs may still be queued or running and must not be counted as evidence for the current branch tip.

**This is not production approval.** A native iOS Safari/VoiceOver + Android Chrome/TalkBack + desktop NVDA/VoiceOver manual matrix, loaded-photography readability, 320/390/768/1280/1440 layout and touch-target checks, exact source/license verification for third-party assets, OFFCUT film, independent tagged-PDF review and stakeholder acceptance are all still open. No sample brand or fictitious payment/booking/registration is live. See `docs/SHOWROOM-MANUAL-RELEASE-ACCEPTANCE.md` for signoff procedure.

## Browser image and responsive evidence — 22 November 2026 (new)

- **Image samples:** the [three-batch live still-image CI](https://github.com/StefanSaladino/website-templates/actions/runs/45080095721) passed 36/36 viewport samples, saving 104 screenshots for creative agency (OFFCUT poster), editorial-commerce, Muskoka retreat, woodworker, GARAGE, FRAME, SERA, CURRENT and DOT + CRUMB. 14 object-fit/crop flags require visual judgement. The OFFCUT 4K film was not requested.
- **Responsive geometry:** [full-template touch geometry CI](https://github.com/StefanSaladino/website-templates/actions/runs/45080948999) passed 120/120 screenshot/measurement runs across 24 designs and five widths (320/390/768/1280/1440). It generated 24 viewport captures and 105 potential issue entries, most concerning 24px hitboxes/inline-link spacing. Do not call those definite accessibility failures or claim real-device touch acceptance.
- **Real CSS repairs:** the automated viewport gate found intrinsic text-width overflow in YARD's image/copy and method headings and a mispositioned KERN tablet release number. The fixes have a dedicated regression requiring no page-level overflow at all five widths in either design, verified green at `db21c25`.
- **Existing keyboard behaviour:** focused [keyboard QA](https://github.com/StefanSaladino/website-templates/actions/runs/45080948995) remains green on the repaired code. Pages build deployed successfully; wider showroom browser workflows are separately tracked.
- **Still pending:** the remaining third-party photo templates require actual loaded-asset capture and human cropping/contrast approval; the exact creator/license/likeness consent for all active stock assets, OFFCUT film technical review and locally optimized version, real Safari/Android, VoiceOver/TalkBack/NVDA, and explicit design signoff. All 157 components stay `in-review`.

## MORA media retirement and review inventory reduction — 22 November 2026

After the expanded image QA surfaced the unrelated ENDLESS PURE hero brand again, the MORA source, its storefront stock image and NORDIC-branded story image were all replaced with distinct original CSS art. Active original-template external-media identities decrease from **65 to 62**, and the image-dependent template count from **19 to 18**. The media manifest, offline review-test expectations, loaded-photo batches, browser smoke assertions and forbidden retirement IDs have been updated together. Historical candidate evidence remains in `SHOWROOM-STOREFRONT-MEDIA-PILOT.md`.

No component is promoted to `live`, remaining media rights approvals are still zero, and visual/device/accessibility approval remains pending. Treat automated runs from before this change as historical, not as certification of the current code.

## Integrated reduced-motion audit — 22 November 2026

A dedicated GitHub Actions workflow `integrated-reduced-motion-qa.yml` and isolated browser runner `components/scripts/audit-reduced-motion.mjs` now check **all 20 ANIM patterns in their actual full-page source templates**, not standalone proxy previews, at 390px and 1440px. It emulates `prefers-reduced-motion: reduce`, scrolls to each real pattern, checks visible headings/sections and target anchors, detects long-running Web Animations in the affected subtree, verifies no root overflow or unexpected film request, and captures **40 actual source screenshots**. This new check requires a successful run on the latest source SHA and manual visual/assistive-technology acceptance; it cannot certify motion sensitivity or screen reader outcomes. Keep Step 19 open.

## Independent mobile alternate-layout QA — 22 November 2026

The 44 optional mobile treatments now have a separate, review-only Chromium browser workflow (`mobile-alternatives-qa.yml`, `audit-mobile-alternatives.mjs`). It loads their real `?mobile=M-...` routes at **320 and 390 CSS px** with touch input and reduced motion, verifies actual selected treatment, viable main/headings, link/control presence, root horizontal overflow and JavaScript/video errors, and saves up to **88 phone screenshots**. Small target hits are **review candidates**, not automatic WCAG failures.

For repeatability this new capture **blocks third-party image/video/font requests**. The resulting frames are evidence of layout and real variant selection only, **not loaded-photo crop or licensing approval**. Native iOS Safari/VoiceOver, Android/TalkBack, font/zoom reflow and final full-media visual acceptance remain independently pending. Await the latest branch workflow; do not mark 44 variants live or close Step 19 from the script alone.

## Automated animation and alternate-phone acceptance checkpoint — 22 November 2026

**20 integrated animations / reduced motion:** [GitHub Actions 45086256288](https://github.com/StefanSaladino/website-templates/actions/runs/45086256288) passed **40/40** Chromium cases (390 and 1440px), created 40 screenshots, detected **zero long-running animated effects**, no root overflow, missing headings or attempted OFFCUT film transfer, and successfully exercised both TIDE day panels with reduced-motion preference. The first run [45086129262](https://github.com/StefanSaladino/website-templates/actions/runs/45086129262) had a **test false positive** for TIDE's intentionally hidden inactive panel; the corrected test and rerun passed. This is automated preference QA, **not** screen-reader/real-device or medical motion-tolerance certification.

**44 independent mobile choices:** [GitHub Actions 45086665595](https://github.com/StefanSaladino/website-templates/actions/runs/45086665595) passed **88/88** 320/390px Chromium touch-emulated cases and saved 88 screenshots, validating all `M-...` treatment selections with zero missing content, JavaScript exceptions, film requests or page-wide overflow. Five standalone 12px-high `Review ...` footer links were enlarged to 36px hitboxes and added to the hard browser regression: CONTACT-01, FORM-02, NAV-02, SRV-01 and PRJ-03. The earlier first pass had 83 small-target flag **occurrences**; the corrected source's audit now reports **78 warning occurrences**. These are **not 78 confirmed WCAG violations** and may repeat inline text links between screen widths or shared variants.

**Media and remaining gates:** visual screenshot capture blocked third-party stock images for deterministic mobile layout checks. Exact source-photo crops/rights, native iOS/Android interactions, 200–400% zoom, VoiceOver/TalkBack/NVDA, individual text/focus contrast, MENU-04 PDF certification and final stakeholder acceptance remain open. All 157 component previews, 44 alternates and 20 patterns retain `in-review` status. **Do not mark Step 19 complete, promote to `live` or merge to `main` on automated evidence alone.**

## Shared ANIM-13 component clean-up (22 November 2026)

After the original CURRENT template retired its geographically incorrect TM-011/TM-062 stock photographs, **ANIM-13's standalone component preview** still used the same two images under component stock IDs **STOCK-022** and **STOCK-023**. They have now also been replaced there by the same two original SVG architectural studies. The preview uses actual relative paths to the full-template assets, preserving the isolated production review build, responsive scroll-snap rail and keyboard/previous/next behavior. Its alternative text and captions explicitly distinguish the two invented drawings from the remaining unrelated photograph.

Both obsolete STOCK records have been retired from the 25-asset isolated component stock manifest, leaving **23** active original component stock identities, **all needs-review**. **STOCK-024 / TM-057** remains an unrelated, unapproved image in both the full-template and isolated preview. The media source scan forbids reintroduction of STOCK-022/STOCK-023 to active component metadata and forbids the retired CDN URLs in ANIM-13. The full Chromium smoke runner checks both illustration assets actually decode in the isolated preview. The number of components remains **157**, mobile alternatives **44**, and integrated animation patterns **20**; all statuses remain in-review. Human device, contrast, rights and stakeholder signoff still required.


## User-requested reversal of synthetic photo stand-ins — 22 November 2026

Removed the two generated CURRENT property SVG files and their use in the 24-template catalogue and ANIM-13 animation preview. Replaced with independent real Pexels photos credited to Peter Xie (37981442) and Max Vakhtbovych (6580232). Source URLs, creator, camera metadata and Pexels' template-eligible copyright license are documented as TM-072/073 and STOCK-027/028. The photos are unrelated to the invented Drift House and Glass Point listings; original labels and alt text now say so. Final property/context review, loaded-photo crops, performance, assistive technology and stakeholder approval remain open. This policy supersedes earlier illustration substitutions; no release or merge authorization is implied.


## DOT + CRUMB branded-photo retirement — 22 November 2026

TM-029 (Unsplash dessert image with a visible Nutella jar) was removed from both the wedding-cake and bakery-story scenes because it mismatched the fictional wedding concept and visually associated an unrelated food brand with the sample business. It was replaced by *two separate, real, publisher-sourced Pexels photographs*: TM-084, [Jonathan Borba's white celebration cake](https://www.pexels.com/photo/elegant-white-layer-cake-with-intricate-frosting-37181428/), and TM-085, [Gustavo Fring's pastry decorating a pink cake](https://www.pexels.com/photo/crop-faceless-female-pastry-cook-decorating-cake-with-chocolate-in-kitchen-3983576/). Both exact Pexels download links, Free license notices and displayed creators were checked. They are **not work by DOT + CRUMB**, and model, property/venue and downstream license/release contexts remain `needs-review`. Neither image is an AI-generated replacement. Tests explicitly forbid the retired Unsplash ID from returning.

Current original-template count: **73 active identities, 22 sourced/attributed, 51 still untraced, 0 finally approved**. The separately inventoried component stock count remains 25 and all entries are in review. Full browser, crop and human release checks remain outstanding.


## GARAGE detailing source-first photography — 22 November 2026

All four active original garage-detailing image identities TM-006, TM-019, TM-020 and TM-033 were retired: they showed branded performance vehicles, unrelated scenery or an unverified employee. Five full-template image placements and the root thumbnail now use four traceable real detailing photographs: TM-089 [Khunkorn Laowisit — white vehicle rotary polishing](https://www.pexels.com/photo/a-person-polishing-the-white-car-5233279/), TM-090 [Tima Miroshnichenko — washed headlight](https://www.pexels.com/photo/a-close-up-shot-of-the-headlight-of-a-car-while-being-washed-6872149/), TM-091 [WAVYVISUALS — polisher pad with cream](https://www.pexels.com/photo/polish-cream-on-polisher-foam-20042053/) and TM-092 [Melih Can — hand wiping silver car door](https://www.pexels.com/photo/close-up-of-hand-polishing-car-surface-35149476/). Matching publisher-hosted original download identities, credits and Free labels were checked. The actual source photos are not endorsements, GARAGE employees, verified jobs or equipment ownership. The white vehicle, tool markings, worker model/property context and phone crops remain pending independent permission and approval. The fictional enquiry form and brand disclaimers remain unchanged.

This changes original-template provenance from 25/74 to **29/74 sourced and attributed**, leaving **45/74 unknown**, **0 finally cleared**. All component stock assets remain independently in review; no `live` promotion or merge to `main`.


## FRAME source-attributed photography replacements — 23 November 2026

Retired four untraced original FRAME media IDs TM-014, TM-015, TM-012 and TM-013 (including all associated responsive source-set URLs). Their placements now use independent Pexels originals with exact photo download identities and publisher-listed photographer credits: TM-093 [Brayan Chul black-hoodie purple studio portrait](https://www.pexels.com/photo/beautiful-woman-in-black-hoodie-12919049/), TM-094 [Aliyu jooney red-background fashion portrait](https://www.pexels.com/photo/elegant-woman-posing-in-stylish-skirt-on-red-background-32174987/), TM-095 [Sandro Tavares dark male portrait](https://www.pexels.com/photo/portrait-of-a-man-on-a-black-background-17594379/), and TM-096 [Linneas Boland-Godbey yellow-fence fashion portrait](https://www.pexels.com/photo/a-woman-in-yellow-shirt-and-denim-shorts-9591740/). These are authentic stock photographs, **not AI-generated imagery**, and no person/photographer/photographic portfolio is genuinely affiliated with the invented FRAME studio. A visible, accessible notice and footer provenance caveat establish that. Model releases, fashion/text artwork, downstream redistribution rights, actual zoom/crops and stakeholder visual acceptance remain **unapproved**. Original 24-template manifest remains **74 media identities; 33 with source page and creator, 41 unsourced; zero final approvals**. Six more original FRAME IDs need follow-on work (TM-003, TM-004, TM-007, TM-009, TM-016, TM-017), with shared isolated ANIM-12 stock requiring coordination.


## FRAME 11/11 photographer attribution and ANIM-12 synchronization — 23 November 2026

Committed at `83e8932682336871ae748cd80dd0546e37bdfb64`: six further FRAME original-template Unsplash stock references were replaced with authentic photos verified through the Pexels original publisher and real image-download pages: Deon Black (5750431, banana), Gustavo Fring (4127628, editorial shopping bags), Emre Kocdemir (15500246, wall lamp), Connor Scott McManus (12182965, floral dress at beach), Gin (22816074, patterned jacket), and Jimmy Elizarraras (30231500, studio portrait). All `src`, `srcset` and alt descriptions are updated, as is the catalogue thumbnail; the preview and full template remain separately reviewed. STOCK-019/020/021 were retired and replaced with STOCK-029/030/031 in ANIM-12, explicitly linked to full-template media identities TM-102/098/097. Animation selection, no-photo fallback and reduced-motion must continue to work. No synthetic photo stand-ins were introduced. FRAME's 11 photo identities now all have publisher/creator records, including prior verified Unsplash TM-002. Full-template catalogue: **74 total, 39 sourced, 35 without publisher/creator, 0 finally rights-cleared**. Component stock remains **25, all in review**.

Next higher-yield clearance areas: RANGE/FOUND editorial commerce (6 untraced), MONOLITH architecture (4), event launch (4), and Morrow House, woodworker, restaurant and pools (3 each). Existing studio/project/product copy must never imply stock photographers' work belongs to a fictional company. Official copyright licence eligibility does not certify model, trademark, property or artwork permissions, downstream commercial template delivery, visual crop, localization or stakeholder acceptance. Continue Step 18/19 review, no `live` promotion or merge.

## MONOLITH source photography update — 23 November 2026

All four untraced MONOLITH Unsplash photo identities are retired and replaced with real Pexels publisher-attributed originals TM-109..112. All hero/project figure references and root gallery images are synchronized with new captions, alt text and provenance disclaimers. Original-template media source coverage rises to **49/74**, leaving **25 source identities unresolved**, with **0 rights-approved**. The 25 isolated component stock records remain review-only. Loaded-image crop acceptance, legal rights, native-device QA and human approval remain outstanding. Next high-yield work: AFTER DARK's four untraced media. Keep Steps 18 and 19 unchecked and `main` unchanged.

## AFTER DARK real concert photography source follow-up — 23 November 2026

AFTER DARK's four remaining CDN-only Unsplash images were retired for publisher-attributed real Pexels photographs TM-113..116 (Felipe Balduino, Big Bag Films, Jeremy Li and Sašo Vukadinović). The original template and root gallery thumbnail are synchronized, photos are visibly marked as unrelated independent concert images, and the ANIM-08 demo/live-ticket restrictions remain unchanged. The original media inventory now contains **74 total, 53 source/creator-identified, 21 untraced, zero final rights approvals**. The 25 isolated component-stock entries are unchanged and remain in review. Next: actual still-photo screenshots, media/legal review, then the remaining smaller three-image original-template families. Roadmap Steps 18/19 and manual production release approval remain open; `main` unchanged.
