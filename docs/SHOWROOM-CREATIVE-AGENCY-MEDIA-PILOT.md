# OFFCUT — Pexels poster and 4K film review

_21 November 2026 · `feature/component-showroom` · one poster visually observed, one video header probed, **neither rights-approved**_

## Original identities

- `TM-001`: `https://images.pexels.com/videos/9489382/pexels-photo-9489382.jpeg` — still poster, also tracked as component `STOCK-011`.
- `TM-071`: `https://videos.pexels.com/video-files/9489382/9489382-uhd_4096_2160_25fps.mp4` — original remote MP4 identity, linked to `STOCK-011`.
- The inventory and matching component stock manifest both remain `needs-review`. Pexels source page ID 9489382 and creator identity could not be independently confirmed, so they must not be credited by guess. The earlier unsupported cottonbro studio credit was removed from the OFFCUT footer.

## Captured internal evidence

[Successful candidate review workflow](https://github.com/StefanSaladino/website-templates/actions/runs/44945462804) downloaded the poster only, produced seven crop alternatives, and made a separate HEAD request for the video without downloading video bytes.

| Observation | Result |
| --- | --- |
| Poster candidate | 1800 × 949 pixels, 27,128 bytes, WebP encoded by CDN |
| Poster SHA-256 | `b4f2d264fd6e518dd7497b5ad683b5b6a9174866401b1224305e561f144064be` |
| Poster subject | Fashion subject in a flowing green dress/head covering on green cyclorama, seated among white geometric platforms; white studio tracking crosses visible |
| Poster 3:5 mobile crop | Main person and front white platforms remain visible; edges of staging and flowing train are cropped |
| Video request method | **HEAD** only, HTTP **200** |
| Video Content-Type | `video/mp4` |
| Video Accept-Ranges | `bytes` |
| Video Content-Length | **Not supplied**, actual transfer size unknown |
| Video pixels/frame rate | Filename advertises 4096×2160, 25fps; **not confirmed by decoding** |
| Video duration and codec | **Not observed** (cannot be inferred from HEAD) |
| Rights/source | Named creator, relevant releases and license for redistributed templates **unverified** |

**Do not conflate the poster's captured SHA-256 with the video SHA-256. No complete video body, frames, codec, duration or file size were obtained.**

## Fixed in development template

- Removed native `autoplay`, set `preload="none"`, and withheld the `<source>` URL behind a `data-src` attribute. The browser receives the poster but **does not request 4K MP4 on initial entry**, mobile, reduced motion or Save-Data.
- Visitor can explicitly choose **Play film**; that interaction attaches the Pexels URL and starts playback. The control exposes loading/cancel/play/pause states, handles failed playback and pauses if the tab is hidden or reduced-motion preference changes.
- Kept the full template's separate `ANIM-02` headline animation, which works on the poster. Reduced-motion CSS no longer hides the video control, so explicit consent remains possible; it still disables headline motion.
- Removed redundant reduced-motion CSS poster URL and updated the media inventory usage to the remaining `index.html` source only.
- Added Chromium smoke assertions for no video request source or autoplay on page entry, reduced-motion without network attachment, keyboard-accessible opt-in and pause state. The test stubs `play()` and `load()` so that it **never downloads the 4K stream**.
- Changed the unverified photographer credit to an explicit source/creator-rights-pending statement.

## Blockers and next actions

1. Confirm the actual Pexels **video 9489382** provider page, contributor, original video license, any depicted-person/property permissions, and allowed redistribution/derivatives; record trustworthy evidence in a separate approved-asset register.
2. Inspect the real full video frames and duration using an authorized, rights-cleared original in a controlled environment. The HEAD test is not a film visual review.
3. Create an approved local compressed 1080p or smaller H.264/WebM rendition, mobile poster sizes, fallback and exact video byte/duration budget; do not select an unverified Pexels rendition by guessing its URL.
4. Verify the poster's text contrast and person crop on loaded site at 320/390/768/1440px, plus Save-Data, mobile Safari, Android Chrome, keyboard, reduced motion and bandwidth restrictions.
5. Keep video poster/film media **needs-review**, template in development, and release approvals unchanged until all source/QA signoffs.

**Status:** poster visual screening complete; MP4 endpoint metadata only; 0/2 rights-approved. Other pending media identities remain in the 71-entry inventory.

## Follow-up: original source verified and 4K streaming controlled (22 November 2026)

The exact public [Pexels video page](https://www.pexels.com/video/woman-in-a-studio-posing-at-the-camera-9489382/) now identifies **cottonbro studio** as the contributor. The [current Pexels license](https://www.pexels.com/license/) expressly allows media use in websites and templates, including templates sold to customers, subject to its prohibited uses. Notably, it forbids implying endorsement by depicted people/brands and certain independent redistribution. Attribution was voluntarily restored to the OFFCUT footer. The source-page identification is now recorded in both TM-001/TM-071 and STOCK-011.

**This does not grant automatic production approval.** The original 4K MP4 has only been checked via HEAD: no full bytes, duration, codec, actual resolution, decoded frames, local derivative, model permission or final licensed context were inspected. Both original-template identities and the shared component stock record remain `needs-review`.

### Improved film interaction

The OFFCUT template now shows a visible, accessible status disclosing that the source is an **unoptimized 4K MP4 of unknown transfer size**. The first click changes the control to “Confirm 4K stream” with **no source attached or network video request**. Only a second click attaches the original MP4 and attempts playback. The user can cancel loading; after stopping, the source is **removed**, rather than merely pausing while bandwidth remains in use. The stream is also stopped when the tab is hidden, video is scrolled offscreen, reduced motion is enabled during playback, or browser Save-Data becomes active. A Save-Data visitor cannot stream even if clicking the control. The poster and separate ANIM-02 replay remain available.

The rest of the template now identifies its agency and three portfolio cases as **fictional**, and does not offer a misleading `mailto:studio@example.com` destination. Browser tests cover two-step consent, source removal, Save-Data without transferring film bytes and the existing title motion.

### Release gates still open

- Obtain and inspect an authorized full video; record actual dimensions, codec, duration, bytes, mobile crop and file hash. Filename and HEAD alone are not proof.
- Choose and encode a genuine rights-cleared mobile-friendly 1080p-or-smaller rendition with tested byte budget and poster; never construct an unverified Pexels rendition URL.
- Confirm the person and scene are presented without implying a real client, employee or endorsement; observe actual Pexels terms and any additional rights.
- Run loaded-poster contrast/crop QA, full Chromium suites, mobile Safari/Android testing and accessibility review separately.
- Keep original media, all component stock and the template in review until explicitly accepted.

## OFFCUT person-free textile film replacement — 23 November 2026
All earlier TM-001/TM-071 posterior screenshots, metadata notes, SHA fingerprint and 4K streaming protocol evidence above belong to **retired historical media only**. The active original OFFCUT video hero now pairs **TM-139**, a still from [Mikhail Nilov's Pexels 7677235 red silk source](https://www.pexels.com/video/close-up-video-of-a-red-silk-cloth-7677235/), with **TM-140**, the Pexels default 1920x1080/25fps/0:18 film. The exact image file uses `images.pexels.com/videos/7677235/pexels-photo-7677235.jpeg`; the publisher Free download resolves to `videos.pexels.com/video-files/7677235/7677235-hd_1920_1080_25fps.mp4`. The original fashion-subject footage and green poster are retired in the full template, featured root gallery and shared STOCK-011's five isolated previews (MEDIA-01/02/03, GAL-08, HERO-06). No recognizable person or obvious brand appears in the source's red-silk concept; its fabric still needs actual crop and headline contrast inspection. The original template retains `ANIM-02` and explicit two-stage opt-in, with no video preloading and Save-Data and reduced-motion guards. The selected 1080p file is the **publisher default**, not an optimized/locally trans-coded derivative. No MP4 bytes/frame/codec/transfer-budget testing or actual local photo/video license grant was completed. Every asset remains `needs-review`, source licensing and physical/native-device acceptance open. The next current-SHA browser and screenshot pass must inspect mobile 320/390, tablet 768, desktop 1440, plus five isolated preview interactions and movie title contrast.

## Current red-silk loaded-photo/tablet layout audit — 23 November 2026
Real loaded screenshot evidence from [run 45287645173](https://github.com/StefanSaladino/website-templates/actions/runs/45287645173) shows legible red-silk poster and high-contrast headline at 320,390,768,1440 CSS px. Actual 320/390 phone widths keep the HD-transfer warning below the CTA and above their replay/film buttons; 1440px stays visually balanced. **The 768px tablet screenshot revealed a concrete failure missed by the old <=390px gate**: the HD film transfer notice was anchored to the left and clipped outside the viewport immediately beneath the primary CTA. Corrected 621–900px view by allocating a right-aligned, width-bounded control grid, making the warning normal-flow 11px text, and leaving additional footer/CTA clearance. Updated both full Chromium smoke and actual loaded-image screenshot geometry gates to include 768px, not just 320/390. The two-click opt-in, no auto-play, Save-Data and reduced-motion guards, poster and independent ANIM-02 motion stay unchanged. Updated source and rights status are still TM-139/TM-140 Pexels/Mikhail Nilov, `needs-review`, with uninspected MP4 body and commercial template packaging. Full current-commit retest required.

## Current playback contract — supersedes earlier two-click OFFCUT notes
The full OFFCUT template now requests the existing muted HD loop automatically on entry when reduced motion and Save-Data are off, with a one-click play/pause control and poster fallback. The old transfer/status and portfolio information banners are removed. Still-photo CI forces reduced motion for OFFCUT; simulated browser smoke covers autoplay, pause, blocked playback, and preference changes without downloading the film. Actual native autoplay and bytes/codec/contrast/crop acceptance remain open. Shared standalone media previews retain their own opt-in flows. No license or production approval.

## Native autoplay follow-up
OFFCUT originally depended on an IntersectionObserver and JavaScript-only play request with no HTML `autoplay` attribute, so the visible Play film control could remain the first apparent action. The full hero now declares native muted looping inline autoplay and launches via a small inline bootstrap before the rest of the document loads. Main controller no longer reloads an already attached source. Preserve Save-Data/reduced-motion poster mode and note browsers may suppress autoplay under OS-specific power or playback settings. The original feature branch remains review-only; standalone component previews are unchanged.
