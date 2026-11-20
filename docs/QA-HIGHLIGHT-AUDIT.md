# Component Showroom — highlight targeting QA

**Verified:** 2026-11-20  
**Branch:** `feature/component-showroom`  
**Full behavioral / screenshot test commit:** `22977d7`  
**GitHub Actions run:** https://github.com/StefanSaladino/website-templates/actions/runs/44671724773  
**Evidence:** https://github.com/StefanSaladino/website-templates/actions/runs/44671724773/artifacts/14600281956

## Result

**PASS** for all **10 currently built core examples** and the **four alternate mobile treatments**. A real headless Chromium run successfully executed **34 responsive highlight scenarios and 381 checks**, with **24 focused preview screenshots** archived. I inspected the focused screenshots for desktop and phone by arranging them into side-by-side grids; the highlighted region visibly belongs to the intended component, not the entire fictional sample site.

| Example | Spotlight target | Intended focus | Phone | Desktop |
|---|---|---|---|---|
| NAV-01 | `header#top` | Minimal sticky header | Pass | Pass |
| NAV-03 | `header#head` | Transparent image-overlay header | Pass | Pass |
| HERO-01 | `section#hero-showcase` | Full-bleed photographic hero | Pass | Pass |
| HERO-02 | `section#hero-showcase` | Side-by-side text and photograph hero | Pass | Pass |
| GAL-01 | `section#gallery` | Uniform photo grid | Pass | Pass |
| GAL-02 | `section#gallery` | Asymmetric masonry gallery | Pass | Pass |
| SRV-03 | `section#services` | Alternating service rows | Pass | Pass |
| CTA-01 | `section#invitation` | Compact consultation band | Pass | Pass |
| CTA-02 | `section#scene` | Image-backed call to action | Pass | Pass |
| FORM-01 | `section#form` | Contact section and its input form | Pass | Pass |

**Alternate phone layouts also pass**: NAV-03 + M-NAV-04, HERO-01 + M-HERO-02, GAL-02 + M-GAL-02, SRV-03 + M-SRV-03. Five sampled tablet layouts and five phone layouts viewed from a desktop-sized host were also verified.

## Exact checks performed
- The expected component exists by stable ID, and the target's HTML element type matches its purpose (`header` for navigation; `section` for heroes, galleries, services, CTAs and forms).
- The highlight starts within the visible area of the **selected** preview viewport, at real 390px phone, 768px tablet or 1440px desktop CSS width.
- The highlighted element receives the temporary animation after the first interaction and again after the **Highlight this section** button is pressed.
- The active outline and inset shadow are painted, and the screenshot pixels change visibly between idle and active states. Changes were measured over the common visible screenshot rectangle, avoiding false failures caused by responsive scrollbar changes.
- The animated pulse doesn't block interaction; screenshot evidence shows the yellow highlight around the intended content.
- The outer review page does not jump while the highlight plays; the catalogue's ten preview URLs contain no fragment identifiers, and the catalogue remains steady as the preview cards initialize.
- Zero uncaught browser script errors on the tested paths.

## Issues found and corrected
1. **HERO-01** previously highlighted the outer page wrapper. It now highlights `section#hero-showcase`.
2. **HERO-02** previously highlighted the header. It now highlights `section#hero-showcase`.
3. Test screenshots initially emphasized the top of the review page rather than the highlight. The test now captures the preview region and compares before/active pixel changes.
4. Responsive screenshot dimensions may shift slightly as nested scrollbars settle; tests now compare the overlapping pixel area.
5. Temporary CI test-harness issues (a malformed regex and unsupported Chromium installation on an Ubuntu runner) were repaired. The latest complete test run **passes**.

## Limits and next release gate
- Automated checks used Chromium with external Unsplash image requests deliberately blocked to isolate markup, layout and highlight rendering. They do **not** certify that every remote photograph loads, that final crops look good or that its rights have been fully reviewed.
- Real-device testing on iOS Safari and Android Chrome, particularly focus/scroll/gesture behavior, remains outstanding.
- Several showcased components (galleries, service sections and forms) extend below one screen; the pulse outlines the **entire component section**. The top and side edges are visible while its bottom edge may require scrolling.
- All examples remain `in-review`; this report is a highlight-targeting QA pass, not a final client release authorization.
