# Boomer Automation — Website Template Library

A standalone gallery of landing-page concepts. The gallery uses Boomer Automation's name and lion mark, while every template gets its own fictional brand and independent visual direction.

## Current milestone

Five templates are live:

1. **Quiet SaaS / Arc** — `templates/quiet-saas/`
2. **Dark Tech / KERN** — `templates/dark-tech/`
3. **Architecture / Morrow** — `templates/architecture/`
4. **Fitness Launch / YARD** — `templates/fitness-launch/`
5. **Contractor / LINE + LEVEL** — `templates/contractor/`

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
- `PROJECT-ROADMAP.md` — project status

## Photography

Several templates use remote Unsplash images so photographic landing pages can use high-quality imagery without bloating each ZIP handoff. An internet connection is required for those photographs to load in local preview. Credits are included inside the relevant fictional template footer.

## Thumbnail policy

Every completed template must replace its placeholder artwork with a gallery preview that accurately matches the finished page.


### Template 05 refinement
LINE + LEVEL now uses a restrained muted-olive accent instead of cobalt blue, and its mobile service strip uses aligned number/title columns.
