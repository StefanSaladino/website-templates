# Client Component Preview Contract
Each published component must be a real, standalone browser-rendered example tied to its permanent ID and to believable fictional copy. No wireframe-only listings.

For every **live** component, require:
- A usable `previews/<ID>/index.html`, with isolated local CSS/JS and a meaningful demo brand.
- Desktop, tablet, and specifically composed mobile layouts at 320–430px.
- A thumbnail from the *finished* live rendering; page context for otherwise tiny components.
- Local, rights-reviewed stock imagery where relevant; manifest IDs linked to delivered optimized files; realistic alt text.
- A concise use case, behavior and integrations note; functional keyboard and pointer states.
- Honest demo labels: no fake booking slots, checkout confirmation, captured form submission or invented real client reviews.
- Focus containment and Escape restoration for modal/mobile overlays, no scroll bleed, reduced-motion support.
- Screenshots and QA evidence at 320, 360, 375, 390, 430, 768, 1024, 1440 and a wide viewport.
- No nonfunctional placeholder links, no third-party request on initial load without consent, and no runtime exceptions.

Status lifecycle: `draft → in-review → approved → live`. The ordinary public catalogue only lists `live`. All counts derive from metadata. Thumbnail target: 1200×900 WebP; recommended desktop screenshot 1440px, mobile 390px. Images must not dictate identical layouts or identical brand styles. The public app does not expose source downloads.


## Distinct mobile design options

Mobile responsiveness is mandatory for **every** core component; it is not a separate paid add-on or a desktop shrink-to-fit task. The roadmap also defines **44 optional, compatible mobile treatments** in 10 groups. A treatment must have its own stable ID, e.g. `M-HERO-02`, and must be a meaningful change to image sequencing, navigation, interaction, content hierarchy, or another mobile-specific pattern.

Every **released** mobile treatment additionally requires:
- A real interactive narrow-screen preview, **not just a static phone screenshot**; its own 390px and 320px capture; mobile source imagery and crop documented in the stock manifest.
- Explicit compatible core-component IDs, and a clear default mobile mode when no alternate is chosen. Do not present incompatible pairings.
- A comparison control that renders the actual default and alternate phone layouts; the client shortlist must preserve a chosen pair such as `HERO-01 + M-HERO-02`.
- Touch, keyboard, focus, zoomed-text, safe-area, native input, reduced-motion, short-height landscape and meaningful fallback QA; photo focal points must not be lost.
- A distinct status lifecycle `draft → in-review → approved → live`, with **no preview or selection claiming readiness before the image rights and behavior checks pass**.

The counts must distinguish `137 planned core component options` from `44 planned optional mobile treatments`. See the full mobile inventory and delivery gates in Section 6 of `COMPONENT-SHOWROOM-ROADMAP.md`.
