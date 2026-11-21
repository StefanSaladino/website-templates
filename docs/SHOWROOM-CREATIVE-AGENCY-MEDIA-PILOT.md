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
