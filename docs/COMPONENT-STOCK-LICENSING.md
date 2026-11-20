# Stock Media Policy and Audit Record
Use authentic licensed stock photos only where they materially demonstrate the component. Preferred sources: Pexels and Unsplash; check **the license terms of the actual asset at time of selection**. Generic platform permissions do not clear model/personality rights, trademarks, misleading endorsements, recognizable client brands, all private property, or bundled redistribution.

Record each approved asset in `components/data/stock-manifest.json`:
`id,sourceUrl,photographer,platform,licenseUrl,licenseReviewedAt,reviewStatus,rightsNotes,usageIds,altText,originalFilename,fileHashSHA256,derived`.

Rights flags are required for recognizable people, products, trade dress, and protected locations. Do not use a person's photo to imply a real customer review or staff affiliation. Do not scrape stock providers. Do not redistribute originals as a stock image catalogue. License suitability must be assessed separately if the templates become downloadable paid products.

The optimizer accepts only a manually acquired source file with an *approved* manifest record. Produce WebP responsive variants, reserve image dimensions, use appropriate crops and verify visually. When the record is uncertain, mark `draft` or `needs-review`; the associated preview cannot go live.
