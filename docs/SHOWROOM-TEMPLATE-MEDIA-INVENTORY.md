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


## Candidate image QA workflow (local-only tooling)

The `components/scripts/prepare-template-media-review.mjs` script creates a **private, ignored review folder**, separate from the application and from production media. The output is not committed to GitHub.

From the repository:

```bash
cd components
npm install --no-audit --no-fund

# Inspect a small, high-impact group. Downloads are permitted only from
# the existing Unsplash / Pexels image CDN identities in the inventory.
npm run review:template-media -- --templates=frame-portfolio --limit=5

# Other useful review batches:
npm run review:template-media -- --templates=editorial-commerce --limit=9
npm run review:template-media -- --templates=muskoka-retreat --limit=5

# Fully offline metadata-only run, with no external requests:
npm run review:template-media -- --offline --limit=5

# Select particular registered identities:
npm run review:template-media -- --ids=TM-002,TM-003
```

The script writes `stock-candidates/template-review/index.html`, `review.css`, and `results.json`; when online candidate downloads succeed, it also writes the original candidate bytes and a **16:9 desktop stress test**, **3:4 portrait desktop**, **5:4 landscape desktop**, **three different 3:4 phone compositions** (centered, attention-based and full-frame contain), and a **3:5 tall centered phone crop** for each image. All are preliminary crop candidates, not verified browser CSS presentations. The extra compositions are review alternatives, not production selections. The contact sheet uses rows and side-by-side crop comparisons, not a generic card layout. Video is intentionally **not downloaded**; a bounded HEAD-only metadata probe records MIME type, range support and content-length when provided, without decoding frames, establishing duration or conferring rights. Its original identity remains flagged for manual film/performance review.

For each successfully downloaded image the report captures **actual width, height, bytes and SHA-256**. A download is marked `downloaded-for-review`, **never** `approved`. A screenshot or crop can't establish a person, place, trademark, artwork, release or creator's identity. Download errors remain visible in the report and cause a nonzero exit status. The script has CDN host checks, a 25-second request deadline and a 16 MB per-image candidate cap. The folder is ignored by Git.

A separate GitHub Actions workflow, `.github/workflows/component-template-media-candidates.yml`, can be launched manually with an allowed template and batch size. Push-triggered runs now default to the **three-image restaurant photo batch**; workflow_dispatch includes all 19 media-bearing template families plus the FRAME photo batches. It uploads private **7-day review artifacts** with the local HTML sheet, source byte hashes, crop previews, and any download failures. This workflow is **not** part of production build validation and must never mark an image licensed or ready for a customer site. Downloads may fail or remain blocked by the CDN, in which case the report retains the failure instead of substituting a misleading picture.

The deterministic offline smoke test `components/scripts/test-template-media-review.mjs` runs as part of `npm run check` and production build QA. It verifies that the review output is generated with the expected warnings and **no** network requests, unapproved imagery or downloaded assets. CI does **not** fetch photos. This test proves review-tool generation, not actual photography quality or licensing.

**Visual screening: FRAME 11/11, editorial-commerce 9/9, muskoka-retreat 5/5, creative-agency poster 1/1, garage-detailing 4/4, real-estate 4/4, and monolith-architecture 4/4, woodworker 4/4, event-launch 4/4, custom-bakes 3/3, storefront 3/3, landscaping 3/3, and restaurant 3/3 = 58 distinct images inspected; creative-agency video has HEAD-only evidence, not decoded visual review. Zero licensed/rights-approved.** Review artifacts are private; actual browser crops and source-page/creator proof remain open.

**Review order and specific risks:**

1. `frame-portfolio` — **11 images**, including close-up and fashion portraits. [The visual findings for all 11 FRAME photographs](./SHOWROOM-FRAME-PORTFOLIO-MEDIA-PILOT.md) show that wide crops can cut faces and attention-based phone crops can misframe subjects; no rights have been approved. Prioritize identifiable people, apparent model releases, whether a stock face implies endorsement, and portrait cropping across devices.
2. `editorial-commerce` — **9/9 visually inspected** in [the editorial commerce pilot](./SHOWROOM-EDITORIAL-COMMERCE-MEDIA-PILOT.md); TM-005, TM-044 and TM-065 require replacement for brand/product mismatches, and TM-028's unsupported hero location description was corrected. All media still awaits source-page and rights clearance.
3. `muskoka-retreat` — **5/5 visually inspected** in [the Muskoka audit](./SHOWROOM-MUSKOKA-RETREAT-MEDIA-PILOT.md). TM-031 is an alpine cabin photo (not Muskoka); TM-021 is a small hut on frozen lake (not the suite), both flagged for replacement. The template now clearly identifies fictional accommodation, illustrative photography and a non-navigable map; no property, room or location has been verified.
4. `creative-agency` — **Pexels poster observed; video HEAD-only probed** in [OFFCUT media audit](./SHOWROOM-CREATIVE-AGENCY-MEDIA-PILOT.md). The green studio fashion photograph contains a recognizable person and white tracking markers. The MP4 endpoint accepted HEAD and advertises byte ranges but gave no size or duration. The 4K source is gated behind explicit Play on the demo; creator/rights, decoded film and optimized derivative remain open.

5. `garage-detailing` — **4/4 visually inspected** in [the GARAGE photo audit](./SHOWROOM-GARAGE-DETAILING-MEDIA-PILOT.md). Red-versus-blue and silver-versus-white alt mismatches fixed. Demo stock photos remain unverified as client work, and a visible disclaimer now precedes the gallery.

6. `real-estate` — **4/4 visually inspected** in [the CURRENT property-photo audit](./SHOWROOM-REAL-ESTATE-MEDIA-PILOT.md). TM-011 is a coastal stilt-house photograph, not a verified Georgian Bay residence; TM-062 shows a mountainous view. These require appropriate replacements before publication; the template now clearly labels invented home details, misleading location/price claims, and its non-submitting demo form.

7. `monolith-architecture` — **4/4 visually screened** in [MONOLITH architecture audit](./SHOWROOM-MONOLITH-ARCHITECTURE-MEDIA-PILOT.md). TM-023 is an exterior, not the previously described interior; the template now labels unrelated stock and fictional project names/locations without design attribution.

8. `woodworker` — **4/4 visually reviewed** in [the GRAIN & GABLE audit](./SHOWROOM-WOODWORKER-MEDIA-PILOT.md). TM-043 is a tiered planter, not a verified cedar build; TM-048 visibly depicts a barefoot saw operator and requires urgent replacement, including shared component STOCK-013. The template now distinguishes illustrative stock, fictional shop products and sample prices; its form reports no submission.

9. `event-launch` — **4/4 visually reviewed** in [the AFTER DARK event-photo audit](./SHOWROOM-EVENT-LAUNCH-MEDIA-PILOT.md). TM-052 is an arena with pyrotechnics, TM-056 a large outdoor crowd, TM-049 a red-lit branded stage, and TM-045 a monochrome drum-kit stage. None depicts the invented two-room harbour event. The October 17, 2026 date is past, lineup and venue invented, and no real tickets are available; the template now labels these facts and removes its false street address.

10. `custom-bakes` — **3/3 visually reviewed** in [the DOT + CRUMB bakery-photo audit](./SHOWROOM-CUSTOM-BAKES-MEDIA-PILOT.md). TM-029 is a small chocolate-topped dessert beside a visible Nutella jar (not a wedding cake); TM-037 shows number-four, unicorn and letter-L cookies; TM-060 is only a frosting macro, not a verified vanilla raspberry cake. The template now explicitly marks the stock photography, fictional bakery, sample ingredients/prices, nonexistent pickup details and non-submitting inquiry form.

11. `storefront` — **3/3 visually reviewed** in [the MORA storefront-photo audit](./SHOWROOM-STOREFRONT-MEDIA-PILOT.md). TM-038 visibly bears ENDLESS PURE labels, TM-067 displays NORDIC products, and TM-034 shows a different brand's black pump by a sink. None depicts a MORA product or verifies manufacturing, shipping, ingredients, refill design or pricing. Fictional storefront claims and previously invented testimonial now clearly identified; checkout and newsletter remain non-submitting demos.

12. `landscaping` — **3/3 visually reviewed** in [the BED & BORDER landscaping-photo audit](./SHOWROOM-LANDSCAPING-MEDIA-PILOT.md). TM-035 shows foliage and stone steps rather than a verified studio garden; TM-050 is a raised terrace with autumn foliage, not confirmed construction or drainage work; TM-051 is a masonry wall that may be a different property. The template now labels its case study and contact form fictional, removes fake before/after and West Burlington project claims, and retains the garden zoom/depth controls.

13. `restaurant` — **3/3 visually reviewed** in [the SERA supper-club photo audit](./SHOWROOM-RESTAURANT-MEDIA-PILOT.md). TM-047 is a dim wall/lamp/table corner; TM-059 an arched-window dining room; TM-063 an ornate room of golden pendants and curved upholstered booths. All are unrelated reference venues, not a restaurant at a verified Queen Street address. The template now labels the fictional sample menu, dining room, hours, capacity, location and non-booking reservation form.

The automated review generator intentionally does **not** guess source pages, creators, model/property permissions, crop acceptance or commercial distribution rights. Those decisions require manual evidence. Platform rules can allow commercial image use while still restricting implied endorsement and other depicted rights: [Unsplash terms](https://unsplash.com/terms), [Unsplash depicted rights guidance](https://help.unsplash.com/en/articles/2612329-releases-and-trademarks), [Pexels licence](https://www.pexels.com/license/), and [Pexels commercial guidance](https://help.pexels.com/hc/en-us/articles/360042295214-Can-I-use-the-photos-and-videos-for-a-commercial-project).

## Manual clearance procedure

For each `TM-###` entry, resolve and save the **actual provider photo/video page**, named creator and license evidence. Check any identifiable people, interiors, business signage, logos, recognizable artwork, location claims and context-of-use restrictions. A venue, home or person pictured in stock must not appear to be a real customer, employee, completed project or endorsed client merely because the template presents that story.

After rights and context review, acquire the approved original bytes, inspect and document meaningful desktop/mobile crops, compress responsive derivatives, verify SHA-256 hashes and alt text, and update the template to load the local assets. Retire the remote-media inventory record once the remote URL is no longer used; keep the licensing/provenance evidence in a separate approved-asset register. A future clearance pass must define and test that register before marking any template production-ready.

Prioritize **frame-portfolio (11)**, **editorial-commerce (9)**, **muskoka-retreat (5)** and the **4096×2160 Pexels video** in `creative-agency`, which carries separate size, performance, creator and model/property concerns.

## Release status

This work is a **provenance control**, not a visual redesign or commercial-media approval. Until the 71 source rights decisions are resolved, the templates must remain development demonstrations with fictional claims clearly labelled. Do not merge the feature branch, mark components live, or distribute sample photography as licensed production content without explicit user authorization.

