# Template 12 — AFTER DARK

Route: `templates/event-launch/`

Concept: kinetic poster-style one-night music event for Toronto / Hamilton harbour, with black + bone + signal red art direction.

Primary CTA: **Get tickets**.

Key design ideas:
- full-viewport poster hero
- giant condensed event typography over live-event photography
- animated lineup ticker
- oversized editorial artist list rather than cards
- two-room schedule board
- image-led venue section
- ticket rows rather than pricing cards
- mobile-only full-height red menu that wipes in from the right and staggers navigation links
- body scroll lock, Escape close, and reduced-motion support

Gallery integration:
- template count: 12
- library count: 9
- Creative count: 5
- Experimental count: 2
- thumbnail mirrors the finished hero

The ZIP is intended to be extracted over the existing `website-templates` working tree after Template 11 R2 is present.

## QA completed before handoff

Tested viewport sizes: `320×568`, `375×667`, `390×844`, `430×932`, `768×1024`, `1024×768`, `1366×768`, `1440×900`, `1920×1080`.

Checks passed:
- document width equals viewport width at every tested size
- hero height equals the available viewport below the sticky header
- no detected horizontal clipping in headings, body copy, links, buttons, schedule rows, venue details, or ticket rows
- no collisions between hero topline/title/bottom content
- no collisions inside lineup, schedule, venue-detail, ticket, or checkout rows
- mobile menu tested open at 320–768 px: full viewport width, no link collisions, body scroll locked
- Escape closes mobile menu
- demo ticket interaction produces its status message
- reduced-motion styles included

The responsive browser environment used neutral placeholder image boxes for layout testing because external image loading is restricted there; the final template retains the live Unsplash image URLs.
