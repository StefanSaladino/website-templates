# Phase 2: six core specimens + four alternate phone layouts

**Branch:** `feature/component-showroom`. **Status:** in review; not merged or released.

## Implemented
- `NAV-03`: Highwater Cabins transparent/solid header with accessible menu; `M-NAV-04` provides an immersive full-screen phone menu, compared with a compact drawer default.
- `HERO-01`: Fjord Field Lodge full-bleed photographic hero; `M-HERO-02` places the image above a separate editorial text zone on phone.
- `GAL-02`: Still / Form masonry collection, category filters, keyboard-operable image viewer; `M-GAL-02` adds a scroll-snap photo rail with accessible previous/next buttons.
- `SRV-03`: Northern Workshop alternating service rows, accessible native details; `M-SRV-03` offers a condensed mobile service index.
- `CTA-02`: Last Light image-backed action linking to actual next page content.
- `FORM-01`: Pier / Studio minimal contact demo with required-field validation, local inquiry preview and copy action; does not pretend to transmit data.

The new `components/review.html` offers desktop/tablet/phone switching and alternate phone comparisons, plus a proof-of-concept local shortlist that preserves parent and mobile IDs.

## Verification performed
- Chromium document-injection smoke tests at 320, 360, 375, 390, 430, 768, 1024, 1440 and 1920px for the six baseline demos.
- Repeated mobile-option test configurations for all four alternates; a narrow HERO-01 alternate grid overflow was found and corrected.
- Menus, Escape and focus return; gallery filters, image viewer, arrow controls, photo rail; native details; form validation, draft summary and copy; review controls and shortlist behavior.
- Final offline Chromium geometry sweep showed no horizontal overflow or script exceptions in tested configurations. This is **not** a production HTTP/Pages, physical iPhone, or real-image-load verification.

## Outstanding blockers
1. Obtain individually rights-reviewed stock image originals and record final URLs, creator/release concerns and source hashes; build local responsive derivatives and mobile crops.
2. Verify all image scenes and actual desktop/mobile crops visually with loaded photography. Make faithful thumbnails.
3. Verify production Vite multi-page build, GitHub Pages base routing and remote preview links.
4. Conduct real iOS Safari and Android Chrome checks, including focus, on-screen keyboard, native inputs, short-height layout and safe areas.
5. Run full accessibility/performance audits, finalize client-friendly shortlist, and only then change statuses from in review to live.

All existing 24 templates and the root gallery on `main` remain unchanged.
