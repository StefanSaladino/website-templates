# Component Release Checklist
- [ ] Component ID is unique, stable and matches its category.
- [ ] The variation demonstrates a meaningfully distinct structure or interaction.
- [ ] A real contextualized example (not a screenshot-only mockup) exists.
- [ ] All intended photography rights and creator/source details are recorded; approved remote HTTPS URLs or locally optimized images work.
- [ ] Desktop and mobile thumbnails match the real finished component.
- [ ] Mobile composition validated at 320/360/375/390/430px; tablet, desktop and wide layout reviewed.
- [ ] Keyboard, focus trapping/return, ARIA, focus outlines, contrast and reduced motion pass.
- [ ] All forms, booking flows and interactive controls behave honestly and correctly.
- [ ] No dead links or dummy third-party integrations claiming success.
- [ ] Gallery load performance and LCP reviewed; images lazy loaded where appropriate.
- [ ] Automated smoke/accessibility tests and manual mobile Safari QA documented.
- [ ] Status changed to live **only after** all preceding items pass.

- [ ] Every core component has a deliberately art-directed **default mobile composition**, not just stacked desktop columns.
- [ ] When an alternate mobile layout is offered, its stable `M-...` ID, compatibility matrix, working preview, separate screenshots and release status are documented.
- [ ] A client can compare default vs alternate mobile treatments, and saved selections export both the core ID and the selected mobile treatment ID.
- [ ] Phone safe areas, short landscape heights, native picker behavior, virtual keyboard overlap, 200% text enlargement, non-hover functionality and focal-point image cropping have been inspected.
- [ ] Mobile treatment imagery has source-reviewed rights and verified mobile cropping, using approved remote or local media; no placeholder image is treated as production-approved.
- [ ] Real iOS Safari and Android Chrome representative interaction testing is recorded for the released pattern family.

## Additional motion-pattern gate
- [ ] A released animation has a distinctive real, isolated preview and a working full-page template example linked from the catalogue/review.
- [ ] Full-template interaction is demonstrated, including visible entrance/replay or controllable state and keyboard/touch parity.
- [ ] Reduced motion suppresses nonessential movement; no JavaScript failure leaves content hidden or controls falsely enabled.
- [ ] An effect is appropriate for the specific template; intentionally static designs are not forced into animation.
