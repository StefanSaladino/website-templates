# Stock-platform policy research for template distribution

_Review branch · 22 November 2026 · supporting notes, not a legal opinion or rights approval_

## Official source pages checked

- [Unsplash License](https://unsplash.com/license) grants broad personal/commercial photo use with limitations around competing/stock distribution. [Unsplash Terms](https://unsplash.com/terms) elaborate on selling substantially unmodified photographic copies and other prohibited uses.
- [Unsplash Help: releases and trademarks](https://help.unsplash.com/en/articles/2612329-releases-and-trademarks) explains that even where a copyright license covers the photo, identifiable people, brands, property or other depicted rights can call for separate assessment.
- [Unsplash+ License](https://unsplash.com/plus/license) is **distinct** from the ordinary free Unsplash license; it includes limitations affecting digital templates. **Do not infer** that a source photo was a free Unsplash photo or licensed under Unsplash+ from a CDN URL alone.
- [Pexels License](https://www.pexels.com/legal-pages/license/) expressly includes examples of photos/videos within websites and sellable templates, subject to restrictions. [Pexels Terms](https://www.pexels.com/terms-of-service/) restrict standalone redistribution; [Pexels Help on resale](https://help.pexels.com/hc/en-us/articles/360042790573-Can-I-sell-photos-or-videos-from-Pexels) elaborates. This does **not** grant model, property, brand or creator ownership assertions.

## Repository-specific decision

Do **not** broadly label the 62 active media records unlicensed merely because they are on Unsplash/Pexels, and do **not** approve them because those sites have generous copyright licenses. For each photo/poster/film verify the exact source page, author, provenance, applicable license/version, intended distribution mode, and depicted people/trademarks/property. A **design preview with a remote thumbnail** differs from a **paid zip of unaltered stock files**. Source identity and permitted template embedding alone do not verify depicted-person consent or claims made in the fictional demo.

Early searches for exact Unsplash CDN IDs did not reliably identify photographers or exact Unsplash photo pages. Other websites reusing a CDN ID are **not original-source evidence**. Thus 59 provenance gaps remain rather than assigning invented creators.

Source: `components/data/template-media-inventory.json` and [current queue](TEMPLATE-MEDIA-CLEARANCE-QUEUE.md). Until human review, keep all 62 at `needs-review`; do not silently package remote stills or high-bitrate Pexels video as licensed offline deliverables.
