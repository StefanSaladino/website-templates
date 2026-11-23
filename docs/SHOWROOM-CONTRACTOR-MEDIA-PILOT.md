# LINE + LEVEL — contractor photo review and project-claim corrections

_22 November 2026 · `feature/component-showroom` · preliminary visual review, not a licensing approval._

## Verified candidate capture

The [final-three-image candidate workflow](https://github.com/StefanSaladino/website-templates/actions/runs/45066123356) successfully generated source previews, widescreen/portrait desktop candidates and multiple phone crops. These are private, short-lived review artifacts, not production images or evidence of source rights.

| Media | Preview size | SHA-256 (transformed JPEG) | Visual observations |
|---|---|---|---|
| TM-053 — hero | 1800×2400 | `d5156d942a94d7daf58617f0851e7692b1209c9a8b6dbeebdf3cd3543f037f63` | Tall interior of a building mid-renovation, exposed light-gauge metal-stud and ceiling framing, construction materials, and a visible worker in the background. Identity, location, contractor, PPE and safety permissions are unknown. Landscape crop removes significant ceiling/floor detail; portrait phone crop retains the vertical context. |
| TM-046 — case study | 1800×1198 | `d476051e063e7d9232865c65f48c4c80b88a8c3c43392c14e7970cbf4920d22d` | Bright completed white kitchen with white tile floor, central island, sink/window, open adjoining space. Does not demonstrate a LINE + LEVEL remodel, removed load-bearing wall, construction duration, or Vaughan location. Tight phone crop loses some room context. |

## Source-page and use limitations

Both identities are external Unsplash stock image URLs. The original template footer claimed photographers Olek Buzunov and Smart Renovations without establishing a one-to-one photographer match to the reviewed photo IDs; that unsupported attribution was removed rather than certified. Exact source photo pages, named photographers, license evidence and any model/worker, private-property, business or artwork rights remain unverified. Both media entries remain `needs-review`, with no local production derivative or release authorization.

## Corrections made

- The website explicitly identifies LINE + LEVEL as fictional, with no customer or completed project record.
- The hero image is labelled unrelated stock rather than a real North Toronto job; its alt describes visible studs and the worker.
- The white kitchen is labelled as a concept study, not Vaughan work or a verified construction outcome. Removed the invented **11-week** duration and a claimed load-bearing wall removal; structural changes require project-specific evidence and permission.
- Previously offered “Book a site visit” actions now open only a local demo form. The submit event is prevented, status text confirms **no request sent or saved**, and a no-JavaScript inline fallback also prevents query-string navigation.
- Existing ANIM-07 process interactions and mobile hierarchy are preserved. Browser regression tests assert fiction labeling, stock attribution boundaries, honest form behavior and motion progression.

## Still blocked

1. Verify actual Unsplash source pages and creator attribution for each exact image, commercial redistribution rights and any depicted-worker property/likeness permissions.
2. Approve full-page desktop/mobile framing at actual 320/390/768/1280/1440 widths with loaded media and fallback behavior; candidate crops alone are insufficient.
3. Re-run the current-commit full build/Chromium and physical-device/accessibility checks. Do not claim real project history or publication readiness.

## Original Pexels source replacement — 23 November 2026
The earlier Unsplash TM-053/TM-046 screenshots and hashes are retained above only as **retired historical evidence**. They no longer supply the template or original gallery. Active publisher-attributed images:
- **TM-129**, [Thới Nam Cao, Pexels 15124970](https://www.pexels.com/photo/men-working-inside-a-house-under-repairs-15124970/), official page describes a real kitchen undergoing renovation, with worker and materials; 6240×4160. Independent photo, no fictional builder affiliation.
- **TM-130**, [Peter Vang, Pexels 37357024](https://www.pexels.com/photo/modern-renovated-kitchen-with-hardwood-floors-37357024/), bright finished white kitchen with hardwood floors and appliances; 4551×3413. Independent photo, not a LINE + LEVEL completed job.
Both official pages have a named photographer and Free label. HTML uses real image IDs, responsive `srcset`/`sizes`, alt, intrinsic dimensions, eager hero and lazy project; root gallery hero and honest teaser copy are synchronized. Source scanners forbid retired photos. New-commit photo decode, crops and all browser checks must be inspected after CI. A publisher label is not model/property, trademark, commercial redistribution, or stakeholder approval.
