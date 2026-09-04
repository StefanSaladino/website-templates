# Template 13 — NORTHLINE LAW

## Status
Complete ZIP handoff for local extraction. No GitHub write was performed by ChatGPT.

## Route
`/templates/law-firm/`

## Concept
- Brand: NORTHLINE / LAW
- Industry: boutique legal / professional services
- Audience: owners, families, operators and private clients
- Primary CTA: Request a consultation
- Palette: warm paper, oxblood, graphite and stone
- Typography: Newsreader + DM Sans
- Direction: restrained editorial legal practice, designed to feel authoritative without using the usual navy/gold law-firm visual shorthand

## Major page elements
- Asymmetrical three-part hero with architectural office image and file-index rail
- Practice index using accessible expandable `<details>` rows
- Three-step matter process
- Large matter-note editorial quote
- Two counsel profiles
- Consultation form
- Footer and mobile-menu return links to the main template gallery

## Mobile navigation
NORTHLINE uses a left-side architectural drawer rather than AFTER DARK's right-side event wipe:
- warm stone panel
- oxblood edge rule
- dark backdrop
- staggered serif navigation
- body scroll lock
- Escape, backdrop and Close button support
- Back to templates link in the drawer
- reduced-motion handling

## Main gallery integration
- Collection count: 13
- Live count: 13
- Library count: 10
- Business filter count: 4
- Added Professional Services / Legal gallery card and a matching NORTHLINE thumbnail
- Added `template-13-gallery.css`

## Back-to-gallery pass
Every existing template now has an option to return to the main template page.

Already had an in-page/footer return link and was left structurally unchanged:
- Architecture
- Dark Tech
- Editorial Commerce
- Event Launch
- Real Estate
- Waitlist

Pages that did not have a return path receive a small, neutral `← Templates` utility link through their existing JavaScript:
- App Launch
- Contractor
- Creative Agency
- Fitness Launch
- Quiet SaaS
- Restaurant

NORTHLINE includes the return link natively in both its mobile menu and footer.

## Responsive QA
Checked at:
- 320×568
- 375×667
- 390×844
- 430×932
- 768×1024
- 1024×768
- 1366×768
- 1440×900
- 1920×1080

Checks performed:
- no horizontal document overflow
- no detected leaf-text overflow
- practice rows fit their containers, including the open state
- counsel rows fit
- consultation form fits
- footer fits
- hero/title/image regions do not collide
- mobile navigation fits at 320, 375, 430 and 768 px
- body scrolling locks while the mobile drawer is open
- Escape closes the drawer
- backdrop and explicit Close button close the drawer

The final practice-row open icon was changed from a rotated plus to a true × state to remove a 5–6 px transformed bounding-box artifact at narrow widths.

External image networking is restricted in the QA browser environment, so responsive geometry was tested against the actual page markup/CSS with same-size image placeholders. The production page retains its external Unsplash image URLs.

## Extraction
From the repository root:

```powershell
Expand-Archive "$env:USERPROFILE\Downloads\website-templates-step-14-template-13-northline-law.zip" -DestinationPath . -Force

git status
git diff --check
```

Then preview `/templates/law-firm/` locally before committing.
