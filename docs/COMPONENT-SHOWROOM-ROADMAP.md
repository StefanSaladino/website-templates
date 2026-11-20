# Boomer Automation — Client Component Showroom
## Development roadmap and complete component inventory (planning baseline v1.0)

**Status:** Specification only — nothing in this document is deployed or approved as completed code.  
**Repository target:** `StefanSaladino/website-templates`; **existing collection:** 24 independently designed templates.  
**Product:** A public, client-facing **visual selection showroom**, not a website builder, code marketplace, or internal developer-component package.  
**Success:** A prospective client can browse realistic components, inspect mobile and desktop views, shortlist exact IDs, and give the team a coherent design brief.

### Product boundaries

- **In scope:** visual catalogue, one complete example for every published variation, category/search filters, responsive previews, accessible demos, shortlist/export, design-style context, documented component metadata, photography provenance, automation/QA.
- **Out of scope in V1:** checkout, downloadable source code, user accounts, custom client project storage, live CMS editing, fully functional third-party bookings, a drag-and-drop page builder, and retrofitting every existing template.
- **Separate track:** the internal, reusable HTML/CSS/JS component library may later supply the showroom. Do not force the public examples to define an NPM API prematurely.
- **Release rule:** no component is marked live until its preview, responsive states, imagery rights, interactions, documentation, and QA have passed. An image-dependent variant without licensed images remains a draft.

## 1. Architectural decisions

**Stack**: Vite for development/build; HTML, scoped CSS, vanilla JavaScript; JSON metadata; GitHub repo and static GitHub Pages hosting. No database, server, React, or NPM package required for V1. Optional Playwright for screenshot/test automation and axe-core for accessibility auditing.

**Site routes / pages** (exact routing may be adapted to GitHub Pages static hosting):

- `/components/` — client-facing introduction and browsing entry point.
- `/components/category/<slug>/` — focused category grid.
- `/components/preview/<component-id>/` — real, isolated live rendering, not just a screenshot.
- `/components/shortlist/` — chosen IDs, preview thumbnails, copy summary and share/export actions.
- `/components/about/` — how to use selections, meaning of example content and integrations.

**Core data schema for every variation:**

```json
{
  "id": "HERO-01",
  "category": "hero",
  "title": "Full-bleed photography",
  "status": "draft",
  "exampleBusiness": "Lakeside retreat",
  "previewRoute": "/components/preview/HERO-01/",
  "thumbnail": "/components/assets/previews/HERO-01.webp",
  "stockAssetIds": ["STOCK-001"],
  "interactions": [],
  "integrationLevel": "static",
  "designTags": ["image-led", "minimal", "hospitality"],
  "hasMobileLayout": true,
  "notes": "Static design example; copy and imagery are illustrative"
}
```

Component code should use prefixed selectors/classes and local tokens, not global `h2`, `button`, or `img` selectors that clash with neighboring samples. Preview examples render in isolated documents or frames so one component's design system never leaks into another. Live previews are **lazy loaded on demand**; listing 100+ simultaneously running iframes is not acceptable.

**Client UX requirements:** category tabs, relevant filters (minimal / editorial / commercial / image-led / interactive), search, relevant-industry tags, descriptive short titles, both phone/desktop views, "Save to vision board", shortlist count, shareable selection summary and copy-to-clipboard. Keep the client experience plain-English: IDs are reference labels, not technical jargon. Selecting components does not promise a plug-and-play compatible site.

**Style and layout rule:** Separate structural variants (full-bleed vs split vs gallery) from styling choices (typefaces, colors, square/soft treatments). Style themes may be switched on selected showcase examples but must not be counted as completely new components unless the layout or interaction actually changes. Avoid a catalogue of minor color swaps.

## 2. Example contract — mandatory for EACH published option

1. **Real rendered example** with fictional business and believable content. Never a blank wireframe or mere description.
2. **Desktop and deliberately composed 320–430px mobile states**, plus tablet; a one-click viewport selector and separate screenshot thumbnail.
3. **Stock photography or video where imagery is relevant**, selected to illustrate the *actual layout*. Non-image elements such as a basic footer may use typography alone, but must appear inside a realistic full-width page-context preview.
4. **Visible component ID, name, 1-sentence use case**, industry tags, behavior, and any special integration caveat.
5. **Realistic interaction**: menus open and close; galleries filter; dialogs trap focus; slides use controls; forms validate; fake bookings/checkout never claim a real submission or confirmed availability.
6. **Clarity about editable parts**: brand, colors, text, images, font and links; display preview-only customization when feasible.
7. **Asset source record** tied to the asset ID and to the final local file, photographer, URL, license, date checked, rights flags, crop, and alt text.
8. **Performance-aware assets**: locally hosted, responsive images (`srcset`, `sizes`, width/height, modern formats, loading priority) and video poster/fallback; no dependence on hotlinked stock photos. <https://web.dev/learn/images/responsive-images>
9. **Responsive/accessible QA evidence** and no critical or high-severity issues.
10. **Functional visible links**: no `href="#"` pretending to navigate, no dead CTAs, no fake purchase/booking completion. If demo only, explicitly say so.
11. **Graceful degradation** if image fails or JS is disabled; don't display an empty black rectangle or inaccessible content.
12. **Comparison consistency**: thumbnails use a standardized aspect ratio **without imposing one visual formula** on the actual component.

## 3. Stock photography and licensing policy

**Preferred stock sources:** Pexels and Unsplash free libraries, with approved images downloaded and optimized for our demo site. Consult and record the current license at the exact asset's source page. Pexels expressly allows use in a website template that is sold; Unsplash generally permits commercial use, but restricts aggregating images into a competing stock service. These licenses do NOT automatically clear people’s likeness, identifiable brands, trademarked designs, private property, or all redistribution models.

- Sources: <https://www.pexels.com/license/> ; <https://unsplash.com/license> ; <https://help.unsplash.com/en/articles/2612329-releases-and-trademarks>.
- Maintain `assets/licensing/stock-manifest.json` with: unique asset ID, source URL, photographer/creator, platform, license URL, retrieval + review dates, allowed uses, release/trademark concerns, file hash, original filename, derived image paths, usage IDs, attribution when needed, and replacement status.
- **Never assume “stock = automatically compliant.”** Review licenses specifically before allowing source downloads or bundled sellable templates; preview use and asset redistribution are not identical. Avoid using a recognizable person as an implied customer/testimonial or an identifiable brand as an implied partner.
- Do not scrape a stock site, sell individual stock files, turn this into an image library, or make original stock assets separately downloadable.
- Use licensed images from distinct scenes; don't repeat the same architectural image across all 20 examples. Each image should prove the composition it is assigned to.
- Maintain an offline asset copy where rights allow; generate WebP/AVIF/JPEG fallbacks, mobile crops, `srcset` and metadata. Don't make the public catalogue depend on remote image URLs that can disappear.
- For genuinely licensed premium imagery (if used later), record the individual purchaser, scope, transferability, and distribution restrictions before use.
- For demos without meaningful image content (cookies, forms, typography), use a realistic surrounding page/context; no forced decorative stock photo.

## 4. Complete catalogue inventory — 29 families / 137 planned variations

Each line below is **a required distinct rendered example** and describes what the example must visually demonstrate. These are backlog specifications, not finished or licensed images. Component IDs are stable once released. A new concept gets a new ID, never repurpose an old ID to mean a different layout.

### Site chrome

#### Headers and navigation — 7 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **NAV-01** | Minimal wordmark | Architecture studio on a photographic homepage |
| **NAV-02** | Centered brand | Boutique fashion wordmark between two link groups |
| **NAV-03** | Transparent overlay | Hotel hero image with readable overlay menu |
| **NAV-04** | Utility/contact header | Contractor with phone and estimate action |
| **NAV-05** | Editorial rail | Photographer site with side-mounted menu |
| **NAV-06** | Fullscreen overlay menu | Creative agency with accessible full-screen navigation |
| **NAV-07** | Mega/navigation dropdown | Multi-service business with grouped routes |

#### Announcements and utility strips — 3 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **BAR-01** | Single announcement | Seasonal boutique offer across top |
| **BAR-02** | Location and hours | Cafe open hours and location strip |
| **BAR-03** | Multi-message ticker | Small retail campaign messages with pause control |

#### Footers — 5 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **FOOT-01** | Minimal footer | Photographer wordmark and essential links |
| **FOOT-02** | Multi-column footer | Service company links contacts and legal |
| **FOOT-03** | Oversized brand footer | Editorial studio large typographic signoff |
| **FOOT-04** | Contact-first footer | Local trade phone email and service radius |
| **FOOT-05** | Newsletter footer | Retail newsletter plus site links |

#### Calls to action — 5 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **CTA-01** | Compact band | Contractor book-consultation strip |
| **CTA-02** | Image-backed CTA | Hospitality sunset image and availability action |
| **CTA-03** | Oversized type CTA | Editorial agency typography and email link |
| **CTA-04** | Split photo CTA | Architecture project image and inquiry copy |
| **CTA-05** | Sticky mobile action | Local business call or quote bar |


### First impression

#### Hero sections — 9 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **HERO-01** | Full-bleed photography | Retreat shoreline photo with short stay message |
| **HERO-02** | Split image and copy | Renovator portrait-or-work photo beside concise promise |
| **HERO-03** | Asymmetric collage | Fashion campaign images in overlapping editorial grid |
| **HERO-04** | Typographic statement | Creative agency oversized text with small photo |
| **HERO-05** | Photo slideshow | Four portfolio images with pause and pagination |
| **HERO-06** | Video background | Fitness campaign with muted video and poster fallback |
| **HERO-07** | Service/conversion hero | Detailing studio key offer and booking action |
| **HERO-08** | Product hero | Artisan object close-up with shop collection link |
| **HERO-09** | Minimal photographic index | Architecture projects named beneath massive first image |

#### Page and section introductions — 3 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **INTRO-01** | Introductory quote | One-sentence founder statement next to portrait |
| **INTRO-02** | Category index | Numbered projects and short captions |
| **INTRO-03** | Image and manifesto | Studio material close-up with two-line positioning |


### Work and imagery

#### Galleries and image collections — 8 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **GAL-01** | Uniform grid | Landscape portfolio image tiles |
| **GAL-02** | Masonry editorial | Fashion portrait staggered columns |
| **GAL-03** | Full-width sequence | Architecture single-image chapters |
| **GAL-04** | Horizontal filmstrip | Travel photographs scrolled sideways |
| **GAL-05** | Category-filter gallery | Photography portraits products and spaces |
| **GAL-06** | Lightbox gallery | Interior portfolio enlargements with keyboard navigation |
| **GAL-07** | Immersive slideshow | Hospitality photos with swipe and controls |
| **GAL-08** | Mixed image and video | Creative studio portfolio with motion thumbnails |

#### Projects and case studies — 6 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **PRJ-01** | Featured project | Home builder one hero image and title |
| **PRJ-02** | Three-project showcase | Architect wide photographs and captions |
| **PRJ-03** | Numbered project index | Studio table of work and dates |
| **PRJ-04** | Before/process/after story | Renovator three-image sequence |
| **PRJ-05** | Editorial case study | Interior design long image sequence with details |
| **PRJ-06** | Interactive project switcher | Landscape project tabs and images |

#### Before-and-after comparisons — 3 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **COMP-01** | Draggable reveal | Renovated kitchen photo alignment |
| **COMP-02** | Side-by-side pair | Garden installation before and after |
| **COMP-03** | Toggle comparison | Car paint correction image state switch |

#### Video and rich media — 4 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **MEDIA-01** | Embedded feature film | Architecture walkthrough with consent-aware play |
| **MEDIA-02** | Inline muted reel | Creative studio showreel with reduced-motion fallback |
| **MEDIA-03** | Thumbnail video gallery | Fitness session clips in grid |
| **MEDIA-04** | Photo + captions feature | Retreat editorial image sequence with captions |


### Business storytelling

#### Services and capabilities — 6 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **SRV-01** | Text list | Architectural studio numbered service names |
| **SRV-02** | Photo tiles | Landscaping stonework gardens and lighting |
| **SRV-03** | Alternating split rows | Renovation services by image |
| **SRV-04** | Interactive service tabs | Vehicle detailing packages with changing image |
| **SRV-05** | Accordion services | Technical installation list with details |
| **SRV-06** | Service matrix | B2B advisory offerings by audience |

#### About and studio introductions — 4 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **ABOUT-01** | Founder portrait | Artisan founder photo and concise bio |
| **ABOUT-02** | Workshop story | Woodworker tools and short studio intro |
| **ABOUT-03** | Image-led values | Hospitality three atmosphere photos and labels |
| **ABOUT-04** | Two-column mission | Local business positioning and founder photo |

#### Teams and people — 4 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **TEAM-01** | Portrait grid | Architecture staff photographs and roles |
| **TEAM-02** | Featured founder | Salon owner portrait and introduction |
| **TEAM-03** | Artist roster | Tattoo studio artists and booking routes |
| **TEAM-04** | Compact team list | Agency names roles and links |

#### Process and how it works — 5 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **PROC-01** | Numbered timeline | Builder consultation design build |
| **PROC-02** | Photo-led sequence | Woodworker design to finishing photos |
| **PROC-03** | Alternating steps | Renovator milestones with large imagery |
| **PROC-04** | Horizontal milestones | Event project schedule |
| **PROC-05** | Expandable steps | B2B onboarding frequently expanded |

#### Proof and credentials — 4 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **TRUST-01** | Logo row | B2B trusted clients with permitted marks |
| **TRUST-02** | Credentials strip | Contractor certifications only if fictional demo-labelled |
| **TRUST-03** | Awards/media mentions | Creative studio publication references with demo labels |
| **TRUST-04** | Proof stats | Business metrics clearly marked as sample data |

#### Testimonials and reviews — 5 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **TEST-01** | Single pull quote | Homeowner praise as explicitly fictional demo |
| **TEST-02** | Quote carousel | Hospitality guest reviews with buttons |
| **TEST-03** | Photo and quote | Portrait with fictional attributed story |
| **TEST-04** | Review wall | Service reviews in clean editorial rows |
| **TEST-05** | Video testimonial | Client-story player with transcript |


### Offers and commerce

#### Pricing and packages — 5 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **PRICE-01** | Simple tier list | Detailing bronze silver gold |
| **PRICE-02** | Comparison matrix | Agency plan features and exclusions |
| **PRICE-03** | Starting-at price rows | Photographer package rates |
| **PRICE-04** | Single featured offer | Fitness pass promotion |
| **PRICE-05** | Custom quote estimator | Simple scope picker labelled illustrative only |

#### Products and collections — 5 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **PROD-01** | Product grid | Ceramics or accessories photographs |
| **PROD-02** | Featured product | Artisan chair full-width photography |
| **PROD-03** | Collection lookbook | Fashion editorial garments |
| **PROD-04** | Product detail strip | One item with options and information |
| **PROD-05** | New arrivals rail | Independent retail horizontally browsable |

#### Menus and offering lists — 4 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **MENU-01** | Minimal restaurant menu | Cafe categories names and prices |
| **MENU-02** | Food-photo menu | Restaurant small plate photography |
| **MENU-03** | Tabbed seasonal menu | Hotel restaurant lunch and dinner |
| **MENU-04** | Downloadable menu panel | Venue pdf menu with accessible link |

#### Booking and scheduling UI — 5 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **BOOK-01** | Appointment picker demo | Salon service and date selection without real slots |
| **BOOK-02** | Availability bar demo | Retreat arrive depart guest controls |
| **BOOK-03** | Quote request selector | Contractor job type and timeline |
| **BOOK-04** | Event RSVP panel | Small workshop date and seat details |
| **BOOK-05** | Reservation provider link | Restaurant external booking integration placeholder |


### Content and people

#### Articles and updates — 4 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **POST-01** | Editorial article index | Architecture journal photography and titles |
| **POST-02** | Featured story | Creative studio full-width image and excerpt |
| **POST-03** | Compact updates | Business news simple list |
| **POST-04** | Article detail layout | Case study reading view with images |

#### Events and schedules — 4 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **EVENT-01** | Event cards | Gallery exhibition dates and imagery |
| **EVENT-02** | Calendar/list schedule | Fitness upcoming classes |
| **EVENT-03** | Event detail | Studio open house location and RSVP |
| **EVENT-04** | Countdown launch | Event launch countdown with reduced motion |

#### Careers and opportunities — 3 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **CAREER-01** | Open roles list | Contractor job roles and locations |
| **CAREER-02** | Team recruitment CTA | Agency hiring photography and email |
| **CAREER-03** | Application interest form | Sample application capture clearly non-live |


### Conversion

#### Forms and lead capture — 6 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **FORM-01** | Minimal contact | Name email message |
| **FORM-02** | Project inquiry | Service budget dates project description |
| **FORM-03** | Multi-step questionnaire | Renovation budget and scope walkthrough |
| **FORM-04** | Appointment inquiry | Vehicle service date and contact |
| **FORM-05** | Newsletter consent | Email opt-in with privacy text |
| **FORM-06** | Upload inquiry | Portfolio attachment selector demo with upload backend requirement |

#### Contact sections — 4 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **CONTACT-01** | Compact contact | Studio email telephone and social |
| **CONTACT-02** | Image-led contact | Hospitality map-adjacent photo and address |
| **CONTACT-03** | Split form and details | Service company inquiry plus location |
| **CONTACT-04** | Large editorial contact | Creative agency prominent email headline |

#### Locations and maps — 4 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **LOC-01** | Single location | Cafe address hours and directions |
| **LOC-02** | Service-area map | Contractor region map with sample boundaries |
| **LOC-03** | Multiple branches | Salon cities and location chooser |
| **LOC-04** | Directions panel | Venue visit details and accessible map link |

#### Newsletter signups — 2 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **NEWS-01** | Inline sign-up | Fashion footer email and consent |
| **NEWS-02** | Editorial subscription panel | Architecture journal subscription with image |


### Interface patterns

#### Interactive and utility patterns — 7 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **UI-01** | Accordion | Accessible FAQ disclosure for services |
| **UI-02** | Tabs | Portfolio categories or offerings |
| **UI-03** | Modal/dialog | Project inquiry pop-up with focus trap |
| **UI-04** | Carousel controls | Image and reviews next previous |
| **UI-05** | Sticky action | Mobile booking or contact control |
| **UI-06** | Toast/feedback | Copied email confirmation and dismiss |
| **UI-07** | Floating help/FAQ | Small help entry opening accessible panel |

#### Privacy, consent and policies — 3 variants

| ID | Variation | Mandatory illustrative example |
|---|---|---|
| **LEGAL-01** | Cookie consent banner | Privacy controls with functional preference toggles |
| **LEGAL-02** | Privacy/terms links | Footer policies and disclosure navigation |
| **LEGAL-03** | Accessibility notice | Site accessibility statement and feedback link |


## 5. What the original 58-option list was missing

The initial list was strongest on visual sections (navigation, heroes, galleries, services, testimonials, processes, CTAs and forms). This expanded backlog explicitly includes: global announcement bars; page introductions; detailed project/case-study presentations; image comparisons; video; credentials/logos; pricing and package comparisons; products/collections and menus; booking and scheduling UIs; articles/blogs; events; careers; newsletter consent; location/service-area information; operational UI patterns; cookies/privacy/accessibility; richer footer variants. These are real client decisions, not automatic filler to add to every site.

**Advanced integrations are separate deliverables, not static visual variants**: authenticated accounts, real booking calendars, live restaurant reservations, live maps with geocoding, payments/checkout, quote engines, multi-location search, job applications with document storage, real newsletter subscription, CRM contact forms and commerce product feeds. Every relevant demo must explain what third-party service or custom code would be required in a final client website.

**Optional style references (not counted as variations):** typography pairs, color palette combinations, icon treatment, button shape, hover and scroll motion, image crops, section dividers and spacing density. These are selectable design preferences but should be presented in a separate "Visual details" panel rather than inflating the main component count.

## 6. Development phases and completion gates

### Phase 0 — Confirm scope and matrix
**Deliverables:** ratified 29-category inventory; priorities and use cases; list of 24 existing sites to mine for patterns; design-system contract; live-versus-demo distinctions; permanent ID policy.

**Exit:** no duplicate concepts or blind spots in common small-business, creative, hospitality, trades, B2B, restaurant and product workflows. All choices have an intended example.

### Phase 1 — Foundation and content/asset pipeline
**Deliverables:** `/components` route and shell; Vite integration under the existing GitHub Pages base path; JSON manifest; category schema; stock-license registry; image download-and-optimization script; thumbnail-generation rules; static preview isolation; base design tokens; client-centered terminology.

**Exit:** adding one component means creating its files/metadata and assets, not manually editing category counts or copying markup into three places. Production build and correct base paths pass.

### Phase 2 — Vertical slice: six finished components
**Suggested reference specimens:** NAV-03 transparent image navigation; HERO-01 full-bleed image; GAL-02 masonry; SRV-03 alternating services; CTA-02 image CTA; FORM-01 minimal contact.

**Deliverables:** all example-contract fields; real local licensed media; desktop/mobile preview; one fully interactive example (navigation, gallery); small sample shortlist; smoke tests.

**Exit:** a coworker can add a component consistently; a client can choose six distinct options without explanation; 320px works; image-license evidence is complete.

### Phase 3 — First public showroom release: approximately 35 options
**Coverage target (35 distinct IDs):** NAV-01/02/03/04; BAR-01; HERO-01/02/03/04/05/07; INTRO-01; GAL-01/02/03/05/06; PRJ-01/02/03; COMP-01; SRV-01/02/03; ABOUT-01; TEST-01; PROC-01/02; CTA-01/02/03; FORM-01/02; CONTACT-01; FOOT-01/02.

**Deliverables:** complete category index, real thumbnail + live preview for every item, keyboard-usable navigation, interactive mobile/desktop tabs, search, category and style filters, shortlist, copy summary.

**Exit:** 35/35 publish-ready checklist passes; no dead interactions; category counts auto-generated from metadata; gallery includes a clear Components link; preexisting template gallery remains unchanged.

### Phase 4 — Broaden commercial utility
**Add:** additional navigation + footers, trust/credentials, pricing, teams, quote selectors, appointment demos, restaurant menus, products, locations, newsletter and FAQ. Explicitly label integrations that are demo-only. Ensure service trades and local small businesses have enough examples beyond image-first brands.

**Exit:** every common single-page business section has at least one realistic, usable representative example.

### Phase 5 — Complete breadth of inventory
**Add:** all remaining GAL/PRJ/COMP/MEDIA, events, careers, blog/news, editorial case studies, advanced interactions, consent/privacy UI and remaining 137-item backlog as planned. Re-review whether some overly similar variants should be combined rather than forcing every row into production.

**Exit:** each approved family has sufficient genuinely distinct choices; no publication purely to hit a number. Update the inventory when justified and record rationale.

### Phase 6 — Polish client selection workflow
**Deliverables:** persistent local shortlist, reorder selections, remove choices, view side-by-side, export/copy a brief (`NAV-03 + HERO-01 + GAL-02 ...`), optional link to prefilled inquiry email, 'what can change?' FAQ, mobile shortlist accessibility.

**Exit:** a nontechnical client can go from browse to a coherent design brief in under 10 minutes, with no login.

### Phase 7 — CI, regression and operations
**Deliverables:** automated link and integrity checks; license-manifest checker; accessibility scan; Playwright interaction/viewport tests; screenshot diff review; performance smoke checks; broken-image monitoring plan; cache-busted production builds; release notes; contributions guide.

**Exit:** every new component has a repeatable QA workflow; existing 24 template links still work and are not restyled by the showroom.

### Phase 8 — Optional later integration with internal component library
**Deliverables:** extract stable component code patterns into a separately versioned internal library *only after proving reuse*. Map public IDs to internal implementations; avoid making style-specific preview HTML the universal code source.

**Exit:** internal developers can reuse components without coupling all client sites to the public gallery's CSS or JavaScript. Public showroom remains client-first.

## 7. Quality gates per published option

**Functional:** all links/actions have a meaningful result; keyboard works; Escape dismisses overlays; focus stays inside modal/menu when open and returns to trigger on close; menus do not scroll background when open; touch targets practical for phones; forms validate and cannot pretend to send.

**Responsive:** test 320, 360, 375, 390, 430, 768, 1024 and 1440px plus at least one wide viewport. No horizontal page overflow or clipped text. Check cropped photo subjects and touch layouts, not just computed bounding boxes. Real iOS Safari + Android Chrome spot checks are required for publishing the catalogue.

**Accessible:** landmarks/headings, associated input labels, contrast and focus visibility, image alt semantics, captions/transcripts for meaningful video, reduced-motion behavior, appropriate ARIA, no keyboard traps except intentional focus-contained dialogs. Automated scans are necessary but not sufficient.

**Visual quality:** each variation demonstrates a genuine structural/interaction difference from its siblings; no generic card wall, fake KPI filler, arbitrary gradients, unreadable tiny labels, image repetition, or aesthetic-only motion. The choice still feels intentional with real photography.

**Assets and performance:** local optimized image variants, reserved dimensions, LCP hero priority, noncritical lazy loading, preload only when justified, lightweight interactive scripts, no rendering 137 iframes at page load, optimized thumbnail sizes and a no-JS browse fallback.

**Legal/content:** stock license recorded; photography use appropriate to rights and context; no invented genuine client reviews/testimonials presented as real; no misleading real-service claims; no fake reservation time slots; contact/demo placeholders unmistakably marked.

**Publishing:** `draft → in-review → approved → live`. Only `live` appears as a selectable ready option. Every live ID has its own preview, screenshots, documented integration level and image manifest. Gallery counts and category stats derive from live manifest records, never hardcoded.

## 8. Suggested implementation repository layout

```text
website-templates/
├── index.html                         # existing template gallery (minimal safe link addition)
├── templates/                         # existing 24 templates — leave untouched initially
├── components/
│   ├── index.html                     # public showroom
│   ├── catalogue.css
│   ├── catalogue.js
│   ├── data/
│   │   ├── components.json            # IDs, status, categories, previews, tags
│   │   └── stock-manifest.json        # rights provenance per media asset
│   ├── previews/
│   │   ├── HERO-01/
│   │   │   ├── index.html
│   │   │   ├── styles.css
│   │   │   └── script.js
│   │   └── ...
│   ├── assets/
│   │   ├── photography/
│   │   ├── video/
│   │   └── thumbnails/
│   └── tests/
├── docs/
│   ├── COMPONENT-PREVIEW-CONTRACT.md
│   ├── STOCK-LICENSING.md
│   └── COMPONENT-RELEASE-CHECKLIST.md
└── ...
```

For maintainability, the example-preview folder can later live in the separately versioned internal component library and be bundled into the public gallery. Don't assume cross-repo publishing is needed in the first milestone.

## 9. Practical acceptance and next action

**First actual implementation step:** build the design/preview infrastructure and the six-component vertical slice. Do not start by generating 137 screenshots or hand-coding 137 pages, because the system has to prove accurate examples, safe stock media, isolation, mobile behavior, QA, and client selection first.

**Milestone 1 definition of done:** A gallery category can be browsed, an example opened, desktop/mobile previews switched, its interaction tried, its ID saved, its selected IDs copied, and the asset/license provenance audited. Once those six specimens pass, phase 3 becomes repeatable production rather than experimental work.

**Repository action:** None. This is a planning artifact only. Explicit authorization is still required to implement or push changes.