# Boomer Automation showroom — Pass 2 responsive visual QA

_Review performed on `feature/component-showroom` during 20–21 November 2026. This is an in-progress design/visual audit, **not release approval**._

## Baseline and evidence reviewed

- The implementation baseline `be7ebb3` passed both **Component showroom CI** and **Component showroom review QA**. Its Chromium runner reported **368 responsive preview/highlight scenarios, 6,269 automated checks, zero uncaught errors**, with downloadable screenshot and `results.json` artifacts.
- Inspected screenshot contact sheets sampled across the 157 core examples, separately reviewed **all 44 optional mobile-treatment captures**, and reviewed the **20 integrated full-template phone/motion captures**. Inspected individual enlarged captures for the specific issues below.
- The collected screenshots are **review-mode spotlight captures**, not a complete approval of images, animations, or full-page typography. Chromium tests deliberately block remote Unsplash images, so remote image loading/crops and licensing **cannot** be signed off from these screenshots.
- Baseline evidence: [Component CI](https://github.com/StefanSaladino/website-templates/actions/runs/44845459455) and [review QA](https://github.com/StefanSaladino/website-templates/actions/runs/44845459592).

## Defects found and changes made

### SRV-06 — B2B comparison on phones

**Observed:** At a 390px phone width, `Show all` initially rendered a 630px-wide internal table. The remaining audience columns existed but were cut off in the visible phone viewport, making the first view difficult to understand.

**Change:** On screens up to 840px wide, initialize the actual selected-audience two-column view with **Founders**, leaving the other audience buttons and explicit `Show all` comparison operative. On desktop, keep the complete three-audience matrix as the default. Respect explicit user selection while resizing.

**Regression:** Chromium now checks the mobile default, live filter behavior, `Show all`, and desktop default in `components/scripts/browser-smoke.mjs`.

### TEST-01 / M-STORY-02 — pale-on-pale testimonial text

**Observed:** The optional light-background testimonial treatment inherited pale headline, body, metadata, and attribution colours from the dark core treatment. The text was difficult to read in its phone screenshot.

**Change:** Apply dark ink to the light mobile surface, provide clearly distinguishable accent and supporting colours, and keep the original dark core layout unchanged.

**Regression:** Added runtime computed-colour luminance/contrast checks for eight text roles, requiring at least **4.5:1** in the 390px mobile treatment. The selected foreground/background values also pass a static contrast calculation; the completed browser result is the authoritative runtime gate.

## Still required before release

1. Confirm both GitHub Actions workflows **pass on the latest visual-fix commit** and inspect refreshed screenshot artifacts. Previous successful runs predate these two specific changes.
2. Review representative **unscaled** desktop screenshots and actual loaded-media crops. CI's desktop preview image is scaled into a phone-width review host; that is insufficient for desktop design acceptance.
3. Test **320px and 390px** screen widths, tablet breakpoints, iOS Safari, Android Chrome, tap targets, focus, scrolling, contrast and reduced motion on actual devices, not only headless Chromium.
4. Independently approve the **16 stock registry records** and any appropriate redistribution rights; avoid presenting unrelated photos as fictional-client work.
5. Finish independent accessibility, stakeholder, and sample-PDF reviews. None of the **157 core components** is approved as `live` yet.

**Branch/release protection:** Do not mark specimens `live`, remove sample disclosures, merge to `main`, or publish as client-ready based solely on an automated or screenshot QA pass.
