# Mobile QA — Gallery + Live Templates

## Locked baseline

All current and future templates are designed mobile-first. A desktop composition is not considered complete until its phone hierarchy has been deliberately designed.

## Main gallery

- Sticky compact header remains visible while browsing long template lists.
- Boomer Automation mark/name stay readable without consuming the viewport.
- Primary Browse action remains touch-sized.
- Hero scale and spacing are reduced for phone scan speed.
- Featured previews use taller mobile aspect ratios.
- Filters become a horizontal touch scroller instead of wrapping into several rows.
- Template cards remain one-column on phones.
- Anchor positions account for the sticky header.

## Template 01 — Quiet SaaS / Arc

- Mobile header is now sticky.
- Mobile menu is fixed below the header instead of being left behind in the document flow.
- Background scrolling locks while the menu is open.
- Menu closes on Escape, link selection and desktop resize.
- Hero CTA becomes a full-width primary action.
- Hero type is rebalanced for 320–430px.
- Product dashboard is simplified and tightened for phone dimensions.
- Feature visuals and CTA section use smaller radii and less desktop-style whitespace.
- Sticky-header anchor offsets are applied.

## Template 02 — KERN

- Sticky header retained and tightened for phone widths.
- Primary release-plan action remains persistent without adding a redundant burger menu.
- Hero typography is reduced to preserve the intended line breaks at narrow widths.
- Release document rows reflow into readable vertical structures.
- Method and release-index spacing are reduced for a better mobile reading rhythm.
- Release tables collapse into mobile rows instead of horizontal scrolling.
- Sticky-header anchor offsets are applied.

## Template 03 — Morrow / Architecture

- Desktop keeps its transparent absolute hero navigation.
- Mobile switches to a sticky dark translucent header so navigation does not disappear after the hero.
- The hero is pulled beneath the sticky header so it still reads as a full-screen photographic opening.
- Mobile image crop, type scale and project metadata are independently tuned.
- Editorial sections use shorter mobile spacing and simpler grids.
- Project copy no longer relies on desktop minimum heights.
- Practice rows and contact composition are rebuilt for a vertical scan.
- Sticky-header anchor offsets are applied.

## QA requirements going forward

Every new template is checked at 320px, 375–430px, tablet, laptop and wide desktop. No horizontal page overflow, inaccessible navigation or desktop-only composition is accepted as complete.

## Template 04 — YARD / Fitness Launch

- Sticky mobile header begins at 900px and below.
- Burger menu is attached to the sticky header and locks page scroll while open.
- Hero image uses a phone-specific crop and the oversized headline scales independently from desktop.
- Primary trial CTA becomes full-width on mobile.
- Schedule rows collapse from three columns into a readable two-row pattern instead of horizontal scrolling.
- Method rows preserve order and large touch-safe spacing.
- Parallax and kinetic headline motion are disabled by `prefers-reduced-motion`.


## Template 05 — LINE + LEVEL / Contractor

- Sticky header remains visible across the full phone experience.
- Burger menu is attached to the header and locks background scrolling while open.
- Hero changes from desktop split-screen to copy-first vertical composition, followed by the renovation image.
- Site-visit CTA becomes full width.
- Project-focus facts collapse to one column rather than shrinking.
- Service strip becomes a touch-safe two-column grid and then one column at very narrow widths.
- Example scope rows recompose from three columns into readable stacked rows.
- Project case study switches from side-by-side photography/copy to a vertical sequence.
- Process rows preserve numbering and context without horizontal scrolling.
- Lead form collapses to one column.
- Parallax is disabled under reduced-motion preferences.


## Template 06 — SERA / Restaurant

- Sticky mobile header remains visible over the long hospitality page.
- Menu opens beneath the header, locks background scrolling and closes on navigation, Escape or desktop resize.
- Full-screen hero gets its own phone crop so the dining room remains legible behind the headline.
- Hero actions stack vertically and the reservation CTA remains the clear primary action.
- Menu rows preserve dish, description and price without horizontal scrolling.
- Room section moves from desktop split composition to image-first vertical reading order.
- Reservation form collapses to one column.
- Visit details reflow for 320px without clipped addresses or metadata.
- Parallax and reveal transitions respect `prefers-reduced-motion`.


## Template 07 — TIDE / App Launch

- Sticky mobile header remains visible throughout the page.
- Mobile menu opens below the sticky header, locks background scroll and closes on navigation, Escape or desktop resize.
- Hero changes to copy-first vertical order with a full-width primary CTA before the device.
- Phone mockup and surrounding colour fields get independent narrow-screen sizing rather than scaling the desktop composition as one unit.
- Hero wave is shallower on phones to protect viewport space.
- Day-view timeline uses a narrower time column and preserves readable event hierarchy.
- Lists section intentionally reorders copy before the second device on mobile.
- Detail rows collapse to vertical editorial rows with no horizontal overflow.
- Final download headline and brand mark are separately scaled for 320–430px.
- Device parallax and reveal transitions are removed under `prefers-reduced-motion`.


## Template 08 — OFFCUT / Creative Agency

- Sticky dark mobile header remains visible after the full-screen film hero.
- Menu opens directly below the header, locks background scrolling and closes on navigation, Escape or desktop resize.
- Background film keeps a mobile-specific crop; primary copy stays readable over the moving image.
- Primary brief CTA becomes full width on phones.
- Hero film includes a visible pause/play control and falls back to a still poster under `prefers-reduced-motion`.
- Portfolio projects recompose from alternating desktop splits into image-first vertical sequences.
- Large project typography and artwork scale independently for 320–430px rather than shrinking the desktop layout.
- Approach rows collapse to a two-column label/content hierarchy with body copy below the heading.
- No horizontal overflow is required at 320px.
- OFFCUT MORA project art: decorative M is reduced/repositioned on mobile so it does not obscure “stay / for one / more”.
- OFFCUT hero: added dedicated mobile clearance below the italic “keeping” line so the display word cannot collide with the supporting paragraph at 320–430 px.


- OFFCUT North End artwork: oversized NE mark is explicitly layered behind all text and reduced/repositioned on mobile so it cannot obscure NORTH END / 3 NIGHTS or LOUD ENOUGH.
