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
