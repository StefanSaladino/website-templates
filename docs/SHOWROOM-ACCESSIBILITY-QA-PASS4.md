# Boomer Automation — Pass 4 accessibility audit

_Development branch `feature/component-showroom` · 20–21 November 2026 · **implementation in review, not accessibility certification**_

## Scope: first interactive navigation pass

This pass examines the primary **component catalogue** and the **responsive review viewer**, the shared interfaces used to choose and inspect all 157 examples. These changes apply to the entire browse/review workflow without modifying unrelated component designs.

### Confirmed issues and corrections

1. **Lost keyboard focus when filtering the catalogue.** The category click handler rebuilt every category button, including the activated button. Keyboard users lost their focused target after pressing Enter or Space. Fixed by rendering category buttons once, then updating `aria-pressed` on the existing buttons while filtering results.
2. **Excessive live announcements when searching.** The entire 157-item grid had `aria-live="polite"`, so updating search could enqueue the complete regenerated card content for screen readers. Removed the live region from the grid. Added a small `role="status" aria-live="polite" aria-atomic="true"` count so updates communicate the number of matching designs without reading every card.
3. **Ambiguous phone-layout change announcements.** The responsive review viewer announced only "Showing the phone version", even when switching between the standard design and an independent phone layout. The viewer's status text and embedded preview title now include the selected Style number and name when a mobile option exists.
4. **Unnecessary keyboard stop and no explicit panning affordance.** The preview viewport was always tabbable, even when fitted at its full visible width. It is now tabbable only for `Look closer` mode where horizontal scrolling is actually required. When it needs panning, keyboard users can press Left/Right arrows or Home/End; Move left/right buttons remain available.

### Automated evidence

Added Chromium regressions to `components/scripts/browser-smoke.mjs` for: category Enter and Space focus retention, pressed-state correctness, concise live-result region, zero results, resetting all 157 examples, selected mobile-style announcement, keyboard panning, and conditional viewport tab stop.

These new tests are **pending final CI verification**. The previous production-build and responsive browser baseline passed ([CI](https://github.com/StefanSaladino/website-templates/actions/runs/44859525421), [review QA](https://github.com/StefanSaladino/website-templates/actions/runs/44859525399)) but does not prove this new pass or cover screen-reader experience.

### Static ARIA and ID integrity

The component preview source check now rejects repeated DOM IDs and invalid static `aria-labelledby`, `aria-describedby` or `aria-controls` references for every non-draft component. A local scan of the existing 157 built preview files found no duplicates, invalid ARIA references, unlabelled inputs or unnamed buttons in that snapshot; the new CI gate specifically enforces duplicate-ID and ARIA-reference integrity. This is a source-only regression guard, not an automated screen-reader certification.

### Individual-component keyboard and form pass

- **NAV-04 default and M-NAV-06 drawer:** activating an in-page menu link previously closed the menu but could leave keyboard focus inside a hidden region. On activation the target section is now given a temporary programmatic focus target (removed on blur), while the native fragment link continues to navigate. The M-NAV-06 drawer clears inert background state before focusing the destination. Escape-to-trigger and existing focus containment remain intact.
- **BOOK-02:** date error text already used a live alert, but it was not linked to the date inputs and did not expose `aria-invalid`. Both date inputs now reference the error and set validity state on failed submission; changing a date clears stale error status. This remains an unsent local planning tool, not a booking.
- **GAL-06:** native modal already handled Escape and trigger restoration. Its image-position counter now uses a small atomic polite live status to announce keyboard Next/Previous updates.
- Added keyboard-driven Chromium regressions for the two NAV-04 modes, both date-error pathways, successful recovery and gallery status semantics. This pass remains **pending the newest CI workflow results** and is not a screen-reader certification.

### Contrast and focus-visible pass (targeted)

A source/CSS audit identified the following specific issues and fixes, with tests using computed styles in Chromium rather than only colour-token comparisons:

- **BOOK-02:** the small explanatory text (`#607366`), guest hint (`#617466`), and booking disclaimer (`#6a7d6a`) against `#ecede5` each fell below WCAG's **4.5:1** text threshold (approximately **4.30:1**, **4.24:1**, and **3.75:1**). All now use `#465a4c` (approximately **6.30:1** against that background). The original warm input focus outline (`#be8151`) measured only **2.76:1** against the booking page; changed to `#7b3d25` (approximately **7.02:1**). Links inside the dark guidance section get a distinct light focus ring.
- **FORM-01:** input and textarea `:focus` previously removed the 3px outline, leaving only a thin underline to indicate keyboard focus. That override was removed and an explicit 3px `:focus-visible` outline set for the default and optional mobile form.
- **GAL-06:** focus rings now use pale `#f5d682` against the dark gallery (over **10:1**) and `#7b3d25` against the pale `M-UTIL-02` reading sheet (over **7:1**). Visible links receive the same dark-gallery focus treatment.

Added Chromium computed-style regressions at phone and desktop breakpoints, with **4.5:1** for ordinary text and **3:1** for focus indicators. These specific measured pairings do not constitute a full-colour or WCAG 2.2 AA audit of all 157 examples, and the **latest CI results remain pending**.

### Extended form, newsletter and mobile menu audit

The following source issues were independently identified and addressed on `feature/component-showroom`; all remain subject to the new full browser/CI results.

- **FORM-03 (three-step questionnaire):** the project-choice radiogroup, required budget/timeline selects, and name/email fields now reference their own step-level error text and expose `aria-invalid`. Progression announces the active step in a concise visually-hidden live region. Errors clear after the corresponding answers become valid, without moving focus unexpectedly.
- **FORM-04 (service preferences):** the service group and date/time/name/email inputs now reference the form error message. The form tracks invalid state for the service group and clears stale error flags when the person edits a control. Its existing first-invalid-focus behaviour and unsent local draft remain intact.
- **FORM-05 (newsletter consent):** a missing frequency receives group-level `aria-describedby` and `aria-invalid`; the consent checkbox references its error directly. After an attempted submission, edits refresh the announced validity state.
- **NEWS-01 / NEWS-02 (newsletter examples):** individual email/consent errors and the topic-choice group are now programmatically associated with the fields they describe. NEWS-02 refreshes errors after the initial attempted submission, so corrected preferences no longer remain marked invalid. Both still prepare local-only, non-sending previews.
- **NAV-03 (including M-NAV-04):** activating a mobile link now closes the menu and moves keyboard focus to the chosen destination, rather than leaving it in hidden navigation. When the menu disappears on desktop resizing, focus shifts to a visible desktop navigation link if it was previously inside the menu. Escape continues to restore opener focus.

**Additional computed colour findings** (contrast ratios rounded; normal text target **4.5:1**, large text/focus target **3:1**):

| Design | Before | Adjusted result |
| --- | --- | --- |
| FORM-03 non-current progress labels | #69796d on #e7e9e2 = **3.76:1** | #465a4c = **6.07:1** |
| FORM-03 large accent heading | #72917c on #e7e9e2 = **2.83:1** | #607968 = **3.87:1** |
| FORM-04 intro paragraph | #61716a on #e4e6e2 = **4.10:1** | #465a4c (above 4.5:1) |
| FORM-04 small form hint | #67766a on #f3f4ed = **4.34:1** | #455a4e = **6.72:1** |
| FORM-04 focus outline | #ca7b4c on page #e4e6e2 = **2.59:1** | dark #7b3d25 (above 3:1), light ring on the dark section |
| FORM-05 small caption | #7c6b60 on #f1ece5 = **4.33:1** | #69554d (above 4.5:1) |
| FORM-05 large accent heading | #efe4d2 on #a88b7b = **2.51:1** | #fffaf2 = **3.04:1** |
| NEWS-01 large accent heading | #83927a on #d2d9ca = **2.28:1** | #455b48 = **5.11:1** |
| NEWS-01 explanatory paragraph | #536450 on #d2d9ca = **4.39:1** | #455a4a (above 4.5:1) |
| NEWS-02 large accent heading | #97806e on #e8e4dc = **2.94:1** | #8a715f = **3.59:1** |
| NEWS-02 small safety note | #627065 on #e8e4dc = **4.11:1** | #536454 = **4.99:1** |

Chromium regression tests cover Enter/Escape focus in both NAV-03 phone modes, step-by-step error semantics and recovery in FORM-03/04, newsletter checkbox/radio error associations and recovery, representative computed WCAG contrast pairs, and focus indicators against both light/dark surfaces.

These are **targeted design fixes, not a claim of complete WCAG certification**: colour measurements do not establish correct contrast for overlays on loaded imagery, visual states not sampled, browser zoom, or every component family. Screen-reader tests with VoiceOver/NVDA and real iOS/Android keyboard/assistive technology remain open.

### Still open for accessibility release

- Audit modal focus containment, form error announcements, language changes, menu controls and accessible naming across the 157 individual examples and 44 alternatives; check real assistive technologies.
- Verify WCAG 2.2 AA colour contrast for text and controls, focus visibility, target sizing and meaningful non-text content across loaded images and all breakpoints.
- Complete reduced-motion visual acceptance for all 20 full-template animations, physical iOS/Android testing, downloadable sample-document accessibility, and manual stakeholder approval.
- Keep all examples marked `in-review`; no implied accessibility signoff or `main` merge.
