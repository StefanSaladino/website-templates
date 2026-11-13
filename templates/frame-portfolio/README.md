# FRAME — photography-first portfolio

Nine-image gallery with category filters and a native `<dialog>` photo viewer. Static HTML, CSS and JavaScript.

## Customize

1. Replace `FRAME`, headings, captions, image URLs and the placeholder email in `index.html`.
2. Each `.frame` gallery button has `data-category`, `data-title` and `data-no` attributes. These drive filtering and the viewer caption. Categories are `portrait`, `editorial`, `still`.
3. Keep meaningful `<img alt>` descriptions; the full-screen viewer uses the same alt text.
4. Set palette in `styles.css` (`--paper`, `--ink`, `--muted`) and change the supplied favicon and `og-card.jpg` to suit your client.
5. Use licensed, optimized local photographs before a paid or production deployment. These external Unsplash URLs are **not bundled** in the ZIP; `srcset` currently references remote samples.
6. Replace contact metadata, create an absolute `og:image` URL after publishing, and update the demo credits.

## Controls

- Filters: All / Portrait / Editorial / Still Life, now with a compact filtered layout and live screen-reader result count.
- Tap/click any photo to open the full-screen viewer; Next/Prev buttons and left/right arrow keys work; Escape closes; focus returns to the opening photo.
- No account, database, framework or backend required.
