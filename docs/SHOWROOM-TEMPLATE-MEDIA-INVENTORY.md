# Full-template image and video review inventory

_Development only · `feature/component-showroom` · 20–21 November 2026 · **no rights approval**_

## What this covers

The original **24 complete site templates** under `templates/` are a separate distribution surface from the **157 standalone component examples**. Their remote stock imagery cannot be considered cleared just because some URLs happen to overlap the component inventory.

- **71 distinct remote CDN URL identities**, including **70 image/poster identities and one Pexels video**.
- **19 site templates contain those identities**, while five currently use none.
- **14 identities** reference an asset also listed in the 26-entry component manifest, including both the Pexels poster and video associated with `STOCK-011`. Those 14 are **not approved**.
- **57 identities** have **no matching component stock record**. Their creator/source pages and rights are still unverified.
- **71 of 71 are `needs-review`**. No image, video, creator consent, release, crop, responsive derivative or redistribution approval has been signed off.

This pass creates `components/data/template-media-inventory.json`, a review queue with stable `TM-001`–`TM-071` IDs. Each record lists its **normalized exact CDN identity**, original template IDs, exact filenames where used, image/video category, optional matching `STOCK-###` reference, and explicit empty rights and local-derivative fields.

Normalization intentionally strips CDN query strings (such as `w=`, `fit=`, `q=` and `auto=`) to group alternate transformations of the same underlying photo/video. It does **not** infer creator, license or actual photographic content.

## Source inventory by template

| Template | Remote identities |
| --- | ---: |
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
| landscaping | 3 |
| pools | 3 |
| contractor | 2 |
| architecture | 2 |
| fitness-launch | 2 |
| tattoo-studio | 2 |
| creative-agency | 2 |
| law-firm | 1 |
| **Total** | **71** |

The media-free templates are `app-launch`, `dark-tech`, `interactive-playground`, `quiet-saas`, and `waitlist`.

## Automated regression gate

`components/scripts/check-template-media.mjs` is now called from `npm run check`, which is also exercised by `npm run build` and the two existing GitHub Actions QA workflows.

The gate:

1. Discovers the expected 24 original templates, reads every HTML, CSS and JavaScript file at each template root, and detects external Unsplash and Pexels media URLs (including posters and video).
2. Checks that **every** detected CDN identity has a corresponding `TM-###` record. Newly added remote URLs fail the build until they are explicitly registered.
3. Verifies each **template and original filename** listed in the inventory actually references the asset, and rejects stale or missing usages and duplicate identities.
4. Rejects third-party media in HTML `img`, `video`, `source` or `audio` tags from outside the tracked CDN hosts until the source is reviewed and the scanner is extended.
5. Verifies optional `STOCK-###` cross-links against the current component manifest; overlapping assets **do not inherit clearance**.
6. Rejects `approved` on an active remote identity. Approval and redistribution require verified evidence and a **real migration to a rights-cleared local derivative** first.

The gate catches metadata and drift; it cannot determine copyright ownership, model/property release requirements, photographic relevance, actual visual quality or final redistribution permission.

## Manual clearance procedure

For each `TM-###` entry, resolve and save the **actual provider photo/video page**, named creator and license evidence. Check any identifiable people, interiors, business signage, logos, recognizable artwork, location claims and context-of-use restrictions. A venue, home or person pictured in stock must not appear to be a real customer, employee, completed project or endorsed client merely because the template presents that story.

After rights and context review, acquire the approved original bytes, inspect and document meaningful desktop/mobile crops, compress responsive derivatives, verify SHA-256 hashes and alt text, and update the template to load the local assets. Retire the remote-media inventory record once the remote URL is no longer used; keep the licensing/provenance evidence in a separate approved-asset register. A future clearance pass must define and test that register before marking any template production-ready.

Prioritize **frame-portfolio (11)**, **editorial-commerce (9)**, **muskoka-retreat (5)** and the **4096×2160 Pexels video** in `creative-agency`, which carries separate size, performance, creator and model/property concerns.

## Release status

This work is a **provenance control**, not a visual redesign or commercial-media approval. Until the 71 source rights decisions are resolved, the templates must remain development demonstrations with fictional claims clearly labelled. Do not merge the feature branch, mark components live, or distribute sample photography as licensed production content without explicit user authorization.

