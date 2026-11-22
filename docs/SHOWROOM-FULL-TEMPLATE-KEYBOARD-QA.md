# Full-template keyboard navigation QA — OFFCUT, RANGE/FOUND, Morrow House

_Development-branch source and browser review only. Not a WCAG 2.2 AA certificate._

## Defect

The mobile menus in all three photographic full-page examples previously hid their navigation when a menu link was followed **without transferring focus to the destination section**. A keyboard or assistive-technology user could therefore remain focused inside an element that had just become hidden. RANGE/FOUND also lacked an Escape-to-close handler. OFFCUT and Morrow House closed on Escape but did not restore focus to the menu button. When resizing to desktop navigation, all three could hide the focused link.

## Fix

All three templates now provide:

- A visually hidden **Skip to main content** link that appears first during keyboard navigation, with a focusable \`main#top\` target.
- Explicit accessible menu button names and existing \`aria-expanded\` states.
- In-page menu links that close the drawer **and transfer focus to the relevant visible section**. Temporary \`tabindex="-1"\` is removed after focus moves away.
- Escape that closes an open menu and returns focus to its opener.
- A wide-layout breakpoint transition that focuses a visible desktop-navigation link if the currently focused control was inside the hidden mobile menu.
- Visible 3px keyboard focus outlines on light and dark backgrounds. Focus-ring color and geometry still need independent human assessment over every photo/background.

## Repeatable automated evidence

\`node components/scripts/test-template-keyboard.mjs\` requires a built \`dist\` tree and Playwright/system Chromium. [The dedicated workflow](../.github/workflows/full-template-keyboard-qa.yml) runs on changes to these templates or the test script and saves a \`results.json\` report for each **320px, 390px and 768px** mobile/tablet viewport (nine total). Every case checks: keyboard-first skip link, Enter navigation, menu link destination focus, no stranded hidden focus, Escape opener focus, desktop resize, browser exceptions, and absence of 4K video fetch attempts. Remote third-party photos are blocked in this test to make keyboard outcomes deterministic.

This automated test **does not substitute** for testing with VoiceOver, NVDA, TalkBack, real touch screen, or operating-system high-contrast settings. It also does not approve any of the remaining 65 external media identities, repair untagged sample PDFs, or change the in-review status of components.


## Verification checkpoint — all nine native keyboard cases passed

The first dedicated run exposed a breakpoint race in three of nine cases where focus was lost while the page switched from mobile to desktop navigation. The resize handoff now checks the prior expanded-menu state and defers focusing a visible desktop link until the next animation frame, after responsive styles settle.

The corrected [full-template keyboard regression run 45071383861](https://github.com/StefanSaladino/website-templates/actions/runs/45071383861) **passed all nine combinations** (three full site templates × 320, 390 and 768px). Skip-link first focus, Enter navigation, target focus after menu link activation, Escape-to-opener, breakpoint focus, absence of script errors and absence of 4K video requests were verified by Chromium. VoiceOver/NVDA, real Safari/Android, keyboard zoom and all 24 templates remain outside this pass.

## Follow-up: contractor, woodworker and restaurant menu-accessibility remediation

The source review found the same hidden-focused-menu issue in LINE + LEVEL, GRAIN & GABLE and SERA. Menu-link activation now transfers keyboard focus to a visible on-page destination. Escape closes an open drawer and restores focus to its opener, and breakpoint changes with an expanded drawer transfer focus to visible desktop navigation on the next animation frame. Each template also gains a skip link, a focusable main landmark and stronger representative focus outlines.

The dedicated browser workflow now covers **six full templates × three phone/tablet widths (18 cases)**, including the contractor's distinct `.menu-button` control. This change is developer regression work, not WCAG certification or a physical-device audit. Previous 9/9 results are historical and do not apply to this commit without new green browser evidence.

## NORTHLINE LAW: focus containment for an animated drawer

NORTHLINE LAW already had a skip link, but its `main#main` was not explicitly focusable and the animated navigation drawer could retain a keyboard focus target while closing. The drawer now controls main/footer `inert` state, sends focus to a visible Close button when opened, cycles Tab/Shift+Tab inside the open drawer, restores focus to the opener for Escape/Close/backdrop, and moves focus into an in-page destination after selecting a link. The closing drawer becomes inert immediately even when its 460ms visual transition continues; reduced-motion users get immediate hiding. A desktop resize transfers focus to a visible desktop-nav link. The bypass link's destination is focusable and focus indicators are strengthened.

The follow-on targeted test `components/scripts/test-law-firm-menu-keyboard.mjs` runs in the same CI workflow after the six-template keyboard suite, covering three phone/tablet widths with reduced motion plus a normal-motion closing test. The legal demo still does not transmit client intake data. Media rights, real Safari/Android and assistive-technology testing remain open.

## Verified seven-template checkpoint — 22 November 2026

The expanded keyboard suite passed in [GitHub Actions run 45072657451](https://github.com/StefanSaladino/website-templates/actions/runs/45072657451) on the corrected legal-drawer test commit `e5a55a8`.

- **18/18 standard keyboard cases passed** for OFFCUT, RANGE/FOUND, Morrow House, LINE + LEVEL, GRAIN & GABLE and SERA, at 320/390/768 CSS pixels.
- **4/4 NORTHLINE LAW cases passed** for the animated navigation drawer, covering reduced motion at 320/390/768 and normal motion at 390. Test assertions verify skip link, focus containment, page inertness, tab wrapping, link-to-destination focus, Escape and button/backdrop restoration, delayed close, and desktop-breakpoint focus.
- **22/22 targeted browser cases passed**, zero failures. The earlier legal drawer test briefly failed on two breakpoint assertions because CSS hid the drawer before a subsequent JavaScript resize callback could update `aria-expanded`. The corrected test awaits both the ARIA state and visual hiding; no user-facing functionality was disabled.

This is a focused keyboard navigation regression pass across **7 of the 24** full templates. It does not imply full accessible navigation or WCAG compliance across the remaining 17 templates, independent mobile alternatives, or all interaction types. Real Safari, Android Chrome, VoiceOver, NVDA, contrast-on-photography and client acceptance still remain to be completed.

## Next three: bakery, landscapes and pool design (22 November 2026)

DOT + CRUMB, BED & BORDER and TIDEFORM previously closed mobile menus without moving keyboard focus to the visible destination. Escape closed without returning focus to the toggle, and breakpoint resizing could hide a focused navigation item. Each now includes a skip-to-main link, a focusable main target, focus handoff on menu link activation, Escape return, desktop focus recovery and distinct keyboard focus outlines. The bakery's dynamic menu-height and native iOS date-input sizing logic were retained.

The standard isolated full-template keyboard suite now covers **nine of 24 templates** with **27 responsive Chromium cases** at 320/390/768px, plus NORTHLINE LAW's four separate drawer cases (31 total scoped browser cases). All other templates, actual screen readers, photo contrast, real iOS/Android and media-rights clearance remain release blockers. New source requires fresh passing CI; the prior 22-case run does not verify the new three templates.

## MORA storefront: non-commercial bag dialog and navigation

MORA's demo bag originally used only `aria-hidden` and an off-screen transform: keyboard tabbing could reach its buttons when closed, and opening it neither moved focus to the bag nor prevented background interaction. Escape and close did not restore focus to the initiating Add/Bag button. Re-rendering a removed line also destroyed the focused button.

The bag is now marked as a dialog with a named heading, modal state, and `inert` while closed. Opening the bag temporarily makes the page header, main and footer inert, moves focus to Close, loops Tab/Shift+Tab through bag controls and restores focus to the exact opener when dismissed. Removing a line shifts focus to the next available Remove button or Close; the existing bag counter, subtotal and fake checkout remain functional and explicitly non-transacting. Its mobile menu gets the standard skip link, link-to-target focus, Escape and breakpoint recovery.

The shared keyboard matrix expands to **ten of 24 templates** (30 viewport cases). A dedicated storefront-cart regression checks modal focus, close behavior, line removal, hidden inertness and false-purchase safeguards. Neither automated path constitutes real accessibility certification or approval to sell fictional merchandise.

## Eleven-template QA checkpoint — 22 November 2026

**DOT + CRUMB, BED & BORDER and TIDEFORM** now have keyboard-visible skip links, focusable main content, Escape-to-opener behavior, meaningful destination focus and correct desktop-breakpoint focus. The bakery's native date control/mobile menu height adaptations and all three templates' animations remain intact.

**MORA** now has the same mobile navigation behavior and a fully keyboard-contained demonstration shopping-bag dialog. Previously, the off-screen bag allowed keyboard access while closed and opening it did not move or contain focus. The dialog now declares a name, modal role and inert closed state; opening it inerts header/main/footer, focuses Close, loops Tab/Shift+Tab through its actions, restores the initiating Add or Bag control, and maintains focus after removing an example product. No purchase or email subscription can be made through the demo.

The first MORA script replacement accidentally produced malformed JavaScript in source. The implementation was rebuilt from the last syntactically valid ANIM-05 script and explicitly parsed before recommit. To prevent recurrence, `components/scripts/check-template-scripts.mjs` now runs before the standard build and checks JavaScript syntax for every full template.

[Dedicated keyboard QA run 45075392398](https://github.com/StefanSaladino/website-templates/actions/runs/45075392398) **passed all 38 focused cases on corrected commit `d25fd38`**: 30 standard cases across 10 full templates at 320/390/768px, four NORTHLINE LAW drawer cases, and four MORA bag cases (320/390/768/1280px). **11 of 24** full templates are now included when counting the independently tested law-firm drawer. The additional syntax gate and later full CI are evaluated on subsequent SHA `d87e364`, not on the broken interim commits.

This establishes specific keyboard/browser regressions only—not a WCAG 2.2 audit or physical Safari/Android, VoiceOver/NVDA, real image contrast, media licensing or stakeholder acceptance.

## Next review batch: YARD, BLACKLINE and CURRENT — 22 November 2026

The three additional full-template navigation patterns previously closed mobile links without moving keyboard focus to their destinations, closed on Escape without restoring focus, and risked stranding focus at a responsive breakpoint. **YARD** (fitness), **BLACKLINE SOCIAL CLUB** (tattoo) and **CURRENT** (realty) now each have skip-to-main links, focusable main landmarks, keyboard-visible outlines, destination focus, Escape-to-toggle and desktop focus recovery. The tattoo/gallery and realty/rail animations and fictional-form safeguards were left intact.

The standard browser suite now includes **13 of 24 full templates × 320/390/768px** (39 regular keyboard cases), plus four independently scripted NORTHLINE LAW drawer cases and four MORA demo-bag cases (47 targeted keyboard checks total). All new work remains in review, with no media approval or production merge. Independent mobile Safari, Android, assistive-technology, colour-contrast-on-imagery and loaded-photo crop review remain outstanding.

## AFTER DARK: full-screen animated navigation focus protection

The AFTER DARK event template's mobile nav remained keyboard-interactive during its 390ms exit transition, and the skip link and focusable main landmark were missing. An event menu link could also leave focus stranded inside the closing drawer. Its full-screen menu now makes the header/main/footer inert while expanded, moves focus to the first visible link, loops Tab and Shift+Tab through nav links, and immediately makes the drawer inert while closing. Escape returns focus to the opener; selecting a section transfers focus to that destination; resizing to desktop restores focus to visible desktop navigation. Reduced-motion mode hides the drawer immediately rather than waiting for an exit effect. The design/lineup animations and strictly fictional ticket notice were preserved.

A dedicated `test-event-launch-keyboard.mjs` browser check is attached to the existing keyboard workflow, including reduced motion at 320/390/768px and normal exit animation at 390px. It tests keyboard control and lifecycle only, not ticket payments, legal licenses or real event availability. The remaining full templates and stakeholder accessibility approvals remain pending.

## Verified 15-template keyboard checkpoint — 22 November 2026

The [dedicated keyboard regression run 45076502960](https://github.com/StefanSaladino/website-templates/actions/runs/45076502960) passed **51 of 51 isolated browser cases** on source commit `e666fe8b`, without fetching remote third-party stills or the 4K OFFCUT film:

- **39/39** standard menu keyboard cases covering 13 full templates at 320, 390 and 768px. The newly added YARD, BLACKLINE and CURRENT cases confirm skip-to-main, Enter, destination focus, Escape-to-toggle and desktop breakpoint focus recovery.
- **4/4** NORTHLINE LAW animated legal drawer cases (including reduced-motion vs ordinary close).
- **4/4** MORA storefront demo-bag cases (including desktop, inert hidden controls, focus trapping, remove-item focus and fictional checkout).
- **4/4** AFTER DARK full-screen animated menu cases at 320/390/768 reduced motion and 390 normal motion. These assert the skip link, focus containment, background inertness, destination focus, immediate inertness during delayed close, Escape restoration and responsive focus recovery.

This is **15 of 24 full site templates** with explicit keyboard tests (13 standard + 2 separately tested animated/special dialogs). **9 full templates remain** beyond this targeted keyboard pass. That count does not establish that every tested template meets WCAG, has legally usable photographs, or works identically in native Safari, TalkBack, VoiceOver or NVDA. Other component-level mobile alternatives and full-site responsive signoff remain separate.
