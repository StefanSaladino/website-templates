# Boomer Automation — Website Template Library

A standalone gallery of landing-page concepts. The gallery uses Boomer Automation's name and lion mark, while every template gets its own fictional brand and independent visual direction.

## Current milestone

Ten templates are live:

1. **Quiet SaaS / Arc** — `templates/quiet-saas/`
2. **Dark Tech / KERN** — `templates/dark-tech/`
3. **Architecture / Morrow** — `templates/architecture/`
4. **Fitness Launch / YARD** — `templates/fitness-launch/`
5. **Contractor / LINE + LEVEL** — `templates/contractor/`
6. **Restaurant / SERA** — `templates/restaurant/`
7. **App Launch / TIDE** — `templates/app-launch/`
8. **Creative Agency / OFFCUT** — `templates/creative-agency/`
9. **Real Estate / CURRENT** — `templates/real-estate/`
10. **Waitlist / STILL** — `templates/waitlist/`

Open `index.html` with Live Server and click any live template preview.

## Mobile-first baseline

The main gallery and every live template receive a dedicated mobile composition. Mobile headers remain accessible while scrolling, 320px layouts are treated as their own compositions, touch targets are enlarged, hero typography/media are independently tuned, and sticky headers do not cover anchored content.

## Motion direction

Motion is part of the collection only when it serves the concept:

- Arc: section fade-ins, product depth/parallax and a soft wave line beneath the hero.
- KERN: restrained editorial reveals and slight release-document scroll depth.
- Morrow: full-screen photography, image parallax and scroll-triggered reveals.
- YARD: kinetic headline entrance, full-bleed photo parallax and diagonal hero geometry.
- LINE + LEVEL: restrained section reveals and light hero-photo parallax; conversion clarity remains the focus.
- SERA: full-screen dining-room photography, slow parallax, shallow curved hero sweep and restrained reveals.
- TIDE: device parallax, section reveals and a full-width wave transition beneath the hero.
- OFFCUT: full-screen background film with explicit playback control, poster fallback and restrained portfolio reveals.
- CURRENT: pronounced multi-layer water ripples, restrained image parallax and section reveals.
- STILL: deliberately static; only form focus/hover states provide feedback.

Every template respects `prefers-reduced-motion`.

## Design contract

`UI-DESIGN-RULES.md` is the locked project-wide design contract. Fictional brands, product UI, prices, testimonials and sample data are allowed when they support the concept. The contract prevents repetitive AI-generated layouts and meaningless visual sophistication—not useful fiction.

## Structure

- `index.html` — main template gallery
- `styles.css` — gallery styles
- `script.js` — gallery filtering
- `UI-DESIGN-RULES.md` — locked rules for every template
- `MOBILE-QA.md` — mobile baseline and per-template notes
- `templates/quiet-saas/` — Template 01
- `templates/dark-tech/` — Template 02
- `templates/architecture/` — Template 03
- `templates/fitness-launch/` — Template 04
- `templates/contractor/` — Template 05
- `templates/restaurant/` — Template 06
- `templates/app-launch/` — Template 07
- `templates/creative-agency/` — Template 08
- `templates/real-estate/` — Template 09
- `templates/waitlist/` — Template 10
- `PROJECT-ROADMAP.md` — project status

## Photography

Several templates use remote Unsplash or Pexels media so photographic/video landing pages can use high-quality assets without bloating each ZIP handoff. An internet connection is required for those remote assets to load in local preview. Credits are included inside the relevant fictional template footer.

## Thumbnail policy

Every completed template must replace its placeholder artwork with a gallery preview that accurately matches the finished page.


### Template 05 refinement
LINE + LEVEL now uses a restrained muted-olive accent instead of cobalt blue, and its mobile service strip uses aligned number/title columns.


### Template 06 — SERA
SERA introduces the first hospitality template: a full-screen restaurant hero, menu rows, atmospheric photography and a compact reservation flow. The fictional data and pricing are intentionally plausible demo content rather than decorative telemetry.


### Template 07 — TIDE
TIDE is a bright consumer-app launch page built without stock photography: a CSS-rendered phone, solid colour blocks, a hero wave, meaningful sample day data and a short download-focused conversion path.


### Template 08 — OFFCUT
OFFCUT introduces the first true video-hero template: a fashion/culture creative office with a full-screen studio film, pause/play control, reduced-motion poster fallback, editorial portfolio rows and a single brief-starting CTA.


### 09 — Real Estate

`templates/real-estate/` — CURRENT / Lakehouse Realty. Full-bleed waterfront hero, animated multi-layer ripple transition, property collection/index, representation section and mobile-first inquiry form.

- Template 09 image reliability patch: replaced a retired Unsplash image used twice and moved CURRENT image embeds from `/download` routes to direct `images.unsplash.com` CDN URLs.


CURRENT was fully redesigned after the first pass: the hero now separates copy and photography, the ripple field is substantially deeper/more animated, and all listing photography uses independent frames with no text overlap.


### Template 10 — STILL

`templates/waitlist/` — STILL / Private Beta. One-screen personal-finance waitlist with a typographic poster composition, a single email action, no photography and no decorative motion. The right-side principles rail becomes a compact two-column band on phones.

## GitHub Pages deployment

This project is designed to publish directly from the repository root on GitHub Pages. All internal navigation, stylesheets and scripts use repository-relative paths so the site works when served from a project URL such as `https://<username>.github.io/website-templates/`.

Recommended Pages settings:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/(root)**

`.nojekyll` is included so GitHub Pages serves the repository as plain static files without Jekyll processing.

The demo forms are front-end examples only; GitHub Pages does not provide a form-processing backend. Remote Unsplash/Pexels media requires network access in the visitor's browser.

## Gallery featured picks

The homepage now separates discovery into two non-duplicated layers: **3 Featured Templates** (OFFCUT / Creative Agency, CURRENT / Real Estate, and SERA / Restaurant) followed by the remaining **7 templates** in the filterable library. Featured picks are deliberately excluded from the library grid so visitors never see the same template twice on the homepage.
