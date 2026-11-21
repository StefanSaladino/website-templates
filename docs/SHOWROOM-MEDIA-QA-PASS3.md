# Boomer Automation showroom — Pass 3: media provenance and native desktop QA

_Development branch: `feature/component-showroom`; audit conducted 20–21 November 2026. **Not a publication or licensing approval.**_

## What was confirmed

The 157 standalone component preview pages contained **26 distinct remote static media URLs** in their `img`, `video`, or `source` tags (including image/video posters). Ten of those URL identities lacked records in the original 16-entry stock manifest.

- Added **STOCK-017–026** as explicitly **needs-review** entries, each with the exact CDN URL identity, actual preview component, visible image description, and unverified creator/licensing status.
- Fixed the missing reciprocal association between **STOCK-013** and **ANIM-20**.
- Strengthened `components/scripts/check-media.mjs` to fail source checks whenever a built in-review, approved or live preview references remote media with no matching manifest entry or without a matching component `stockAssetIds` link. Unlike the previous check, this enforces provenance before entries are marked live. Poster URLs are included.
- **26/26** entries remain `needs-review`; **zero** are cleared, locally downloaded, hash-verified or approved for redistributed commercial use.
- The existing demo video is a direct 4096×2160 Pexels URL. Reduced-bandwidth delivery, author verification, attribution and any depicted-person/brand rights remain unresolved; the current on-demand loading does not resolve its size or license questions.

## Full-page template scope discovered

Separately audited the 24 original full-page templates (HTML/JS/CSS). **19 templates reference 71 distinct remote third-party media URLs**: **69 Unsplash images**, **one Pexels poster**, and **one Pexels video**. Only **13** of those URL identities overlap the now-expanded component manifest; **58 are still outside the component-level inventory**. This is a scope boundary, not approval of the overlapping 13. The original template gallery remains unchanged.

| Original template | Distinct remote URL references |
|---|---:|
| frame-portfolio | 11 |
| editorial-commerce | 9 |
| muskoka-retreat | 5 |
| monolith-architecture | 4 |
| woodworker | 4 |
| garage-detailing | 4 |
| real-estate | 4 |
| event-launch | 4 |
| storefront | 3 |
| custom-bakes | 3 |
| restaurant | 3 |
| creative-agency | 3 |
| landscaping | 3 |
| pools | 3 |
| contractor | 2 |
| architecture | 2 |
| fitness-launch | 2 |
| tattoo-studio | 2 |
| law-firm | 1 |

The 71 distinct URLs may appear more than once within HTML and scripts. The counts are **distinct identities per template** and must not be confused with licensed asset counts or independent source pages.

## License interpretation and risk controls

Source-platform permission does **not** alone establish that identifiable people, private property, logos, artwork or brands depicted in the frame may be used as implied customers, employees, advertisers or completed project references. Before any sample media is presented as release-ready:

1. Resolve the exact source **photo/video page and creator**, not merely a CDN file URL. Record that identity and source-page evidence.
2. Verify the particular license and whether the intended site redistribution, crop, marketing context and recognizable content need separate permission. Any missing permission keeps the media blocked from production.
3. Inspect the actual bytes, width, height, compression, visual framing, alignment to the fictional scenario, `alt` text and mobile art direction. Store a verified local derivative with a SHA-256 record and a responsive asset budget.
4. Replace unsupported claims and unrelated project photos with truthful descriptions or approved content. A photo on a kitchen-project preview **must never imply it depicts that fictional team's completed work**.
5. Review all **58 non-inventoried original-template URLs** separately before the original template set is marketed or redistributed with included source media. Do not silently extend the component-only manifest to imply those templates are cleared.

Official source rules: [Unsplash License](https://unsplash.com/license), [Unsplash releases and trademarks](https://help.unsplash.com/en/articles/2612329-releases-and-trademarks), [Pexels License](https://www.pexels.com/license/), [Pexels commercial-use guidance](https://help.pexels.com/hc/en-us/articles/360042295214-Can-I-use-the-photos-and-videos-for-a-commercial-project).

## Native desktop screenshot evidence

The automated Chromium runner previously produced 390px-wide **review-host snapshots** that *simulate* a 1440px iframe. Those are useful to inspect preview controls, but are not native desktop visual evidence.

A new browser QA section captures actual, **unscaled** 1440×900 previews for **11 representative examples** (`NAV-05`, `HERO-09`, `GAL-07`, `GAL-08`, `PRICE-02`, `SRV-06`, `TEST-01`, `POST-02`, `EVENT-03`, `CONTACT-03`, `ANIM-12`) and actual **1280×800** previews for **four** high-priority examples. It asserts no page-wide horizontal overflow and a visible first-level heading at 1440px, producing `component-browser-evidence/desktop-native/measurements.json` and PNG captures.

These browser captures keep external media requests blocked for reproducibility. They **do not replace** loaded-image crop QA, phone hardware checks, color/contrast audit across every component, document review or real-world accessibility testing.

## Remaining gates

- Confirm green **source/build and browser** CI on the newest combined QA pass, then inspect desktop-native screenshots before accepting any specific layout.
- Run an independent loaded-media visual review with rights-cleared local image derivatives.
- Close **26 component media approvals** and, if included in release, account for **58 additional original-template URLs**.
- Complete physical iOS/Android tests, keyboard/screen-reader pass, sample-menu PDF accessibility check and stakeholder signoff.
- Keep all 157 core components `in-review`; do not merge the review branch to `main` without explicit release authorization.
