# Actual loaded-image QA — OFFCUT, RANGE/FOUND and Morrow House

_Status: review tooling; source/media licensing is not granted by a screenshot, visual match, or valid HTTP response._

## Scope and rationale

The main showroom Chromium smoke suite deliberately aborts external Unsplash/Pexels requests for deterministic animation and UI checks. That means its green status **cannot establish** successful image loading, hero text readability over actual photographs, brand/logo visibility, or mobile crop quality. This independent review test addresses those gaps without touching production release gates.

Run \`node components/scripts/capture-loaded-media.mjs\` after \`cd components && npm run build\` (from the repository root use \`cd components && node scripts/capture-loaded-media.mjs\`). The optional [Showroom loaded still-image review GitHub Action](../.github/workflows/showroom-loaded-media-qa.yml) executes on updates to its script and via manual workflow dispatch. It records the source picture sizes, \`object-fit\` and \`object-position\`, viewport overflow, HTTP status, browser errors, screenshot files, and any image decode failures.

| Template | Image-bearing elements reviewed | Screenshot regions |
| --- | --- | --- |
| OFFCUT creative agency | Actual Pexels **poster**; no film source attached | Hero and portfolio |
| RANGE/FOUND editorial commerce | Hero, five remaining product photos and night-camp journal photo (7 \`img\` tags) | Hero, product collection, journal |
| Morrow House retreat | Hero/lake/season photo reuse and two unrelated room stock photos (5 \`img\` tags) | Hero, illustrated house, room strip, seasons |

Each template is captured at **320, 390, 768, 1440 CSS pixels**, with reduced-motion enabled for the narrowest viewport. The reports and screenshots are uploaded as **private, short-lived GitHub Actions artifacts** for human crop and contrast inspection.

## Strict non-approval boundary

- The 4096×2160 Pexels video is **never activated, fetched, or played**. Its URL must remain detached; even a request attempt is flagged. The Pexels poster is explicitly decoded from the original URL for this evidence-only check.
- The current external images remain \`needs-review\`; photographer/source-page attribution, model/property/brand rights and licensed local derivatives require separate work.
- Images that load and decode are **not** automatically deemed legally usable, visually aligned, contrast-accessible, or suitable for production. A human must inspect each screenshot at 320/390/768/1440 and record specific fixes.
- This is **desktop Chromium emulation**, not physical iOS Safari or Android Chrome. Also required: keyboard/VoiceOver/NVDA checks, accessibility contrast evaluation, approved local media derivatives and stakeholder acceptance.
- CDN or runner network blocking is surfaced as a failure with explicit image details; do not work around a failure by falsely claiming the source is licensed or by suppressing errors.

## Acceptance review

Reviewers should mark each screenshot accepted, rejected, or requiring adjustment after examining actual loaded-media focal point, headline/CTA contrast, overlay truncation, branded logos, misleading stock-to-brand association, and tablet/phone art direction. Any failed decoding or missing remote images should be investigated before considering a template for release.
