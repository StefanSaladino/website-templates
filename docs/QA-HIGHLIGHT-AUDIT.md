# Visibility re-test — 16-component showroom (November 20, 2026)

**Result: PASS — 46 browser scenarios, 697 assertions, with screenshot evidence.** This supersedes the previous 10-component visibility sign-off below.

**Relevant code:** `30af33ce` (new overlay and strict QA); **passing run:** https://github.com/StefanSaladino/website-templates/actions/runs/44677167662  
**Screenshot artifact:** https://github.com/StefanSaladino/website-templates/actions/runs/44677167662/artifacts/14603260137

### User-reported defect and repair

The old highlight painted an outline **on the component itself**. Tall components could extend beyond the visible frame, and 1440px desktop designs viewed on a phone scaled the outline down so far that it became difficult to notice. Source/behavior checks passed even when the highlight was not prominent enough for a client.

The viewer now draws a **high-contrast frame in its own screen pixels, outside the scaled iframe**, labeled **THIS IS THE SECTION**. The frame is clipped to the component's visible intersection with the preview so all four sides are apparent. Small navigation headers place the label just below their thin frame. Its animation lasts approximately 2.4 seconds, can be replayed with **Highlight this section**, and honors reduced-motion preferences. The overlay does not intercept clicks.

### Test scope

All 16 in-review core components: NAV-01, NAV-03, NAV-04, HERO-01, HERO-02, HERO-07, GAL-01, GAL-02, SRV-03, PROC-01, TEST-01, INTRO-01, CTA-01, CTA-02, FORM-01, FOOT-02. All four available alternative mobile layouts also tested: M-NAV-04, M-HERO-02, M-GAL-02, M-SRV-03.

- Actual child iframe CSS width checks for Phone (390px), Tablet (768px) and Computer (1440px), including desktop rendered on a phone
- Verified target element ID and semantic region (header, hero, gallery, services, process, testimonial, intro, CTA, form, footer)
- Verified new **outer** highlight overlay is not hidden, draws a frame with visible area, stays inside preview bounds, and has the clear label and 6px border
- Verified initial click and explicit replay activate the correct highlighted element
- Verified screenshot pixel changes, successful fade, no outer-page jumps, no fragment-navigation for catalogue thumbnails, and no uncaught browser errors
- Reviewed a 32-image desktop/phone screenshot contact sheet in addition to the automated checks; new frame is visible around intended regions

**Not part of this sign-off:** Real iOS Safari / Android browser testing and final Unsplash photo loading/crop review. Those remain deferred per the project plan. All components remain **in review**, and main is not merged.

---

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
