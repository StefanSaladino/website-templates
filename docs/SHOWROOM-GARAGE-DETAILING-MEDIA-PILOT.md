# GARAGE Automotive Studio — photo audit

_21 November 2026 · `feature/component-showroom` · four visual observations, zero media rights approvals._

## Evidence

[Candidate review workflow](https://github.com/StefanSaladino/website-templates/actions/runs/44946417454) downloaded 4 of 4 JPEG previews, no acquisition failures. Generated seven compare-only desktop/phone crops per identity; private seven-day artifact is named `original-template-media-candidates`. Crops are stress tests, not screenshots of the actual loaded desktop/mobile template. The samples are transformed CDN downloads, **not rights-cleared source originals**.

| Image identity | Candidate dimensions | Finding and follow-up |
| --- | --- | --- |
| TM-006 | 1800×1063 | White performance coupe parked in a dim multi-car indoor storage area, not a silver sports car. Centered 3:5 phone cover clips much of the foreground vehicle; attention crop retains its front but loses setting. |
| TM-019 | 1800×1200 | Bright blue performance coupe parked outdoors on desert ground at sunset, not a red vehicle or post-detailing job. Narrow centered 3:5 crops cut away much of the vehicle. |
| TM-020 | 1800×2250 | Silver-gray BMW performance sedan parked on a road at dusk with hills behind, not a close-up of freshly detailed bodywork. Portrait crops keep the car; trade dress and client context remain unverified. |
| TM-033 | 1800×2400 | Person wearing a cap and gloves machine-polishing a black vehicle panel near the side mirror. A 16:9 stress crop excludes the worker's face; tall portrait shows person and panel. Model and workplace rights remain unverified. |

## SHA-256 for the specific downloaded JPEG samples

| Identity | Candidate byte hash |
| --- | --- |
| TM-006 | `2aa4ce1f0b38232a6f1c777d6b69b9c20222933c72c2a713b9986d5d8800984e` |
| TM-019 | `8840572553c89a383eaa3a0798dce8114550cad4ce6c2f353f34a4d169e8a5db` |
| TM-020 | `0ea3772f4aa603c580e5ca233f6fc4941dfaa91875719b0e633b3277fabc42c8` |
| TM-033 | `3f5006a6b91a784b08a264bd88a1553159a98685ce2ece2b89a67095e08158d7` |

## Corrective action on development template

- Corrected false alt text: the primary photograph depicts a **blue**, not red, performance coupe; the final featured storage-garage car is **white**, not silver; the outdoor silver-gray sedan is not a close-up detailing shot.
- Refined both image descriptions of the real depicted person using a polisher near a black vehicle's side mirror. The person is stock, not a confirmed employee.
- Relabeled the photo-gallery categories as illustrative image/detailing/vehicle studies instead of asserting examples of work completed by the fictional company.
- Added a visible explanation before the gallery: these cars and the detailer are **not verified GARAGE customers, employees or completed projects**.
- Removed an unsupported currently operating location in the hero; the template explicitly says fictional studio. The footer says illustrative stock with media rights still pending.
- Added browser regression checks for the blue and white car alt text and an onscreen client-work disclaimer.

## Release blockers

1. Confirm the authentic Unsplash page, creator, licensing and redistribution rights for all four identities; check depicted-person consent and visible automotive branding/trade dress, plus model/property permission if applicable.
2. Verify actual hero framing, headline contrast and legibility at 320, 390, 768 and 1440 pixels. Auto attention/crop options can truncate the detailer’s head, car fronts or wider composition.
3. Before commercial publication, use approved relevant portfolio/stock photos with non-misleading captions; provide optimized rights-cleared local assets. Do not market stock automotive images as a finished service.
4. Keep template and all photo records in `needs-review`; physical-device accessibility, stakeholder acceptance and formal media approval remain open.

**Next photo audit target:** real-estate (four photos).
