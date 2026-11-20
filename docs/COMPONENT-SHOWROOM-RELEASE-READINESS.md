# Boomer Automation showroom — release-readiness gates

_Last implementation checkpoint: 20 November 2026. Development branch: `feature/component-showroom`. This is an implementation-complete, **NOT production-approved** project._

## Catalogue implementation

- **157/157 core component examples** exist with their own `components/previews/<ID>/index.html`, `styles.css`, and `script.js`, plus explicit responsive design and `in-review` catalogue metadata.
- **44/44 optional mobile alternatives** and **20/20 integrated animation patterns** remain implemented.
- **0 components are `live`**. No merge to `main` and no public release has been authorized.
- Final ten: `POST-01..04`, `EVENT-01..04`, and `CONTACT-03..04`. Their interaction regression scenarios are added to `components/scripts/browser-smoke.mjs`.
- Source-only audit in the GitHub connector found all 30 final files parseable, with no dangling local links, duplicate IDs, missing image alt attributes or unbalanced CSS delimiters. **This does not establish passing build, browser behavior, accessibility or design review.**

## Hard release gates

| Gate | Required evidence | Current state |
|---|---|---|
| Build and source checks | Node 22 install, `npm run build` succeeds with `validate`, `check-previews`, `check-media`, review-contract, Vite and built-output checks | **Unverified execution** in this run |
| Full Chromium browser suite | `npm run check:browser` exits 0, responsive review evidence produced, all interactions pass, no uncaught errors | **Tests authored, passing run unverified** |
| Desktop and phone visual checks | Review thumbnails, 320/390/768/1280+ breakpoints, overflow, clipped copy, font sizes, image crop, native dialogs, art direction, independent mobile alternatives | **Not approved** |
| Accessibility | Keyboard-only navigation, visible focus, names/roles/states, dialogs, tablists, semantic reading order, screen-reader announcements, contrast, reduced-motion, forms and error messages; independent audit | **Not approved** |
| Source media and rights | For every asset, verify exact creator/source/license, property or likeness constraints, use/crop in redistributed demo, optimize local derivatives, confirm relevant context | **16/16 registered stock records require review; 0 approved** |
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

The established CI definition is `.github/workflows/component-showroom-qa.yml`. It runs the source/build checks and Playwright Chromium suite on review-branch component changes, PRs and manual dispatch, then uploads `components/component-browser-evidence/` as `showroom-browser-evidence`. Inspect the actual run outcome, downloadable screenshots and `results.json`; an empty legacy commit-status list **does not mean CI passed**. The browser runner also expects a system `google-chrome` or `chromium` executable; confirm its path in CI if it fails at launch.

For manual QA, open the build through HTTP rather than `file://`; check both the showroom review surface and the isolated specimens. Confirm the 44 independent mobile choices remain selectable for their intended components, not just responsive CSS in each core preview.

## Honesty and source restrictions

Sample brands, customer testimonials, staff portraits, fictional prices, menus, events, facilities and venues are **not proof of real services or endorsement**. Media in `stock-manifest.json` remains review-only. No speculative review may be presented as a real customer's words. Example reservation or contact controls must never claim a live booking, lead submission or enrollment unless a real provider confirms it. The sample contact mailto uses the reserved `example.com` domain and cannot be treated as a receiving inbox. All review UIs should retain visible sample-content limitations.

## Publication decision

Do not merge, mark entries `live`, publish client-facing claims, or remove sample notices solely because catalogue development has reached 157/157. First pass the gates above, repair discovered defects, obtain media and stakeholder approval, then separately authorize a controlled release. This document records **remaining work rather than asserting completion of QA**.
