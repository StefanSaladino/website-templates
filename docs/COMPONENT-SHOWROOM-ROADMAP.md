# Boomer Automation — Client Component Showroom
## Development roadmap and complete component inventory (planning baseline v1.1 — mobile design tracks)

**Status:** Specification only — nothing in this document is deployed or approved as completed code.  
**Repository target:** `StefanSaladino/website-templates`; **existing collection:** 24 independently designed templates.  
**Product:** A public, client-facing **visual selection showroom**, not a website builder, code marketplace, or internal developer-component package.  
**Success:** A prospective client can browse realistic components, inspect mobile and desktop views, select compatible mobile-specific layouts where available, shortlist exact paired IDs, and give the team a coherent design brief.

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

**Client UX requirements:** mobile treatment comparison and compatible desktop/mobile pairing; category tabs, relevant filters (minimal / editorial / commercial / image-led / interactive), search, relevant-industry tags, descriptive short titles, both phone/desktop views, "Save to vision board", shortlist count, shareable selection summary and copy-to-clipboard. Keep the client experience plain-English: IDs are reference labels, not technical jargon. Selecting components does not promise a plug-and-play compatible site.

**Style and layout rule:** Separate structural variants (full-bleed vs split vs gallery) from styling choices (typefaces, colors, square/soft treatments). Style themes may be switched on selected showcase examples but must not be counted as completely new components unless the layout or interaction actually changes. Avoid a catalogue of minor color swaps.

## 2. Example contract — mandatory for EACH published option

1. **Real rendered example** with fictional business and believable content. Never a blank wireframe or mere description.
2. **Desktop and deliberately composed 320–430px mobile states**, plus tablet; a one-click viewport selector and separate screenshot thumbnail. Where a selectable alternate mobile treatment exists, show an actual second rendered narrow-screen design and its stable mobile ID (see Section 6).
3. **Stock photography or video where imagery is relevant**, selected to illustrate the *actual layout*. Non-image elements such as a basic footer may use typography alone, but must appear inside a realistic full-width page-context preview.
4. **Visible component ID, name, 1-sentence use case**, industry tags, behavior, and any special integration caveat.
5. **Realistic interaction**: menus open and close; galleries filter; dialogs trap focus; slides use controls; forms validate; fake bookings/checkout never claim a real submission or confirmed availability.
6. **Clarity about editable parts**: brand, colors, text, images, font and links; display preview-only customization when feasible.
7. **Asset source record** tied to the asset ID and to the final local file, photographer, URL, license, date checked, rights flags, crop, and alt text.
8. **Performance-aware assets**: license-documented responsive images via local assets or reviewed external HTTPS URLs (`srcset`, `sizes`, width/height, modern formats, loading priority) and video poster/fallback; remote image delivery is allowed with trusted-source metadata, resilience checks and an optional local fallback. <https://web.dev/learn/images/responsive-images>
9. **Responsive/accessible QA evidence** and no critical or high-severity issues.
10. **Functional visible links**: no `href="#"` pretending to navigate, no dead CTAs, no fake purchase/booking completion. If demo only, explicitly say so.
11. **Graceful degradation** if image fails or JS is disabled; don't display an empty black rectangle or inaccessible content.
12. **Comparison consistency**: thumbnails use a standardized aspect ratio **without imposing one visual formula** on the actual component.

## 3. Stock photography and licensing policy

**Preferred stock sources:** Pexels and Unsplash free libraries, using individually reviewed image URLs or downloaded/optimized copies for our demo site. Consult and record the current license at the exact asset's source page. Pexels expressly allows use in a website template that is sold; Unsplash generally permits commercial use, but restricts aggregating images into a competing stock service. These licenses do NOT automatically clear people’s likeness, identifiable brands, trademarked designs, private property, or all redistribution models.

- Sources: <https://www.pexels.com/license/> ; <https://unsplash.com/license> ; <https://help.unsplash.com/en/articles/2612329-releases-and-trademarks>.
- Maintain `assets/licensing/stock-manifest.json` with: unique asset ID, source URL, photographer/creator, platform, license URL, retrieval + review dates, allowed uses, release/trademark concerns, file hash, original filename, derived image paths, usage IDs, attribution when needed, and replacement status.
- **Never assume “stock = automatically compliant.”** Review licenses specifically before allowing source downloads or bundled sellable templates; preview use and asset redistribution are not identical. Avoid using a recognizable person as an implied customer/testimonial or an identifiable brand as an implied partner.
- Do not scrape a stock site, sell individual stock files, turn this into an image library, or make original stock assets separately downloadable.
- Use licensed images from distinct scenes; don't repeat the same architectural image across all 20 examples. Each image should prove the composition it is assigned to.
- Prefer responsive image delivery, stable image URLs and documented source/crop metadata; local optimized copies are optional. Remotely hosted photos must have verified URLs and visual fallbacks because sources can change.
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

## 6. Mobile design tracks — 44 additional named options

**Mobile is both a required state and a client-selectable design decision.** The original 137 component IDs remain stable and each still requires its own fully implemented, considered phone layout. In addition, we will maintain **44 curated mobile-specific treatments** (not 137 × 44 permutations) that clients can compare and select independently where structurally compatible. These are a planning backlog, not 44 finished previews.

**Example:** A client can choose `HERO-01` (desktop full-bleed photography) and `M-HERO-02` (photograph above concise copy on phones), while another client pairs that same desktop section with `M-HERO-01` (immersive mobile photo). Both combinations must be genuinely implemented and validated; do not suggest unsupported combinations.

### Mobile selection and compatibility rules

1. **Every core component has one mandatory mobile baseline** designed for 320px and up. Baseline behavior is not counted as an extra catalogue choice or a second component.
2. **Additional mobile treatments use stable `M-<FAMILY>-NN` IDs.** Each is a distinct layout or interaction change, not a palette, breakpoint tweak, or minor typographic variation.
3. **Every released mobile option gets an actual browser-rendered example**, with a fictional brand, realistic copy, suitable reviewed local stock imagery where relevant, mobile screenshots at 390px and 320px, interaction and accessibility evidence, and a compatibility list of core component IDs.
4. **Selections are a pair when applicable** (`desktopComponentId`, `mobileTreatmentId`); if no alternate is chosen, use the core component's default mobile treatment. Shortlists and copied briefs must preserve the pair, not only the desktop ID.
5. **Preview controls must show Desktop / Tablet / Phone, and on Phone allow Default / Mobile A / Mobile B only where implemented.** No fake phone mockups or screenshots posing as an interactive view. On a physical phone, allow opening the example full screen without a scaled tiny frame.
6. **Incompatible pairings are not offered** (e.g. hotel booking-only sticky controls on a legal footer). Any responsive overrides must preserve semantics, reading order, focus, keyboard behavior, and accessible labels.
7. **Mobile source photography needs its own crop review**, safe text contrast and focal-point verification. Record image usage by component and treatment; generate dedicated phone derivatives where necessary, using the same rights-reviewed source.
8. **Sticky UI is restrained**: avoid multiple overlapping sticky elements, respect `env(safe-area-inset-bottom)` / inset top, keep input fields and native keyboards clear, and allow adequate viewport for content.
9. **Mobile interactions are mobile-native where helpful**: swipe as an enhancement with buttons/keyboard alternatives; minimum practical touch targets; non-hover access to actions; no hidden critical functionality.
10. **Do not offer every mobile treatment on every desktop component.** Compatibility and conversion implications determine pairings; document why a combination is supported.

### Curated mobile-option inventory (44 distinct examples)

Every row below requires its own realistic example with an actual working narrow-screen interaction and individually reviewed imagery when the scene calls for photography.

#### Navigation and sticky chrome — 6 options

| ID | Mobile layout / behavior | Required example |
|---|---|---|
| **M-NAV-01** | Compact wordmark and menu | A boutique hotel with a fixed brand bar, 44px menu target, and clear open state |
| **M-NAV-02** | Logo plus persistent inquiry | Local contractor header with compact branding and a single reachable quote action |
| **M-NAV-03** | Bottom navigation | Multi-section studio portfolio with three grounded destinations and safe-area clearance |
| **M-NAV-04** | Full-screen menu overlay | Hotel photo hero opening a focus-contained full-height menu with Escape/return focus |
| **M-NAV-05** | Horizontal anchor tabs | Restaurant page with scrollable section anchors and a visible active section |
| **M-NAV-06** | Off-canvas drawer | Product collection with accessible slide-in navigation and scroll lock |

#### Hero compositions — 5 options

| ID | Mobile layout / behavior | Required example |
|---|---|---|
| **M-HERO-01** | Immersive photo first | Lake retreat with an image-dominant first screen and short overlaid headline |
| **M-HERO-02** | Photograph above short copy | Architectural home image followed by a tightly composed headline and action |
| **M-HERO-03** | Typography before image | Professional service hero prioritizing a readable promise and call button |
| **M-HERO-04** | Offset image crop and caption | Creative studio portrait positioned intentionally for narrow screens |
| **M-HERO-05** | Touch-controlled slides | Boutique accommodation hero with explicit next/previous and slide position |

#### Galleries and project imagery — 5 options

| ID | Mobile layout / behavior | Required example |
|---|---|---|
| **M-GAL-01** | Single-column image sequence | Architectural portfolio with edge-to-edge images and concise captions |
| **M-GAL-02** | Swipeable photo rail | Hospitality image gallery with visible next-item affordance and keyboard support |
| **M-GAL-03** | Adaptive two-column grid | Product lookbook with consistent image proportions and readable labels |
| **M-GAL-04** | Compact masonry reflow | Portrait portfolio with variable heights but a stable reading order |
| **M-GAL-05** | Thumbnails to full-screen viewer | Detailing before-and-after gallery opening an accessible photo viewer |

#### Services and capability presentation — 4 options

| ID | Mobile layout / behavior | Required example |
|---|---|---|
| **M-SRV-01** | Alternating desktop to vertical photo story | Renovation services retaining image-first hierarchy without zigzag on phone |
| **M-SRV-02** | Scrollable category switcher | Wellness services with short touch-friendly category tabs |
| **M-SRV-03** | Expandable service rows | Contractor services showing details on demand and full keyboard control |
| **M-SRV-04** | Compact service index | Architecture studio showing text-first offerings with a single photo feature |

#### Products, menus, and pricing — 4 options

| ID | Mobile layout / behavior | Required example |
|---|---|---|
| **M-COM-01** | Product carousel | Apparel collection with touch browsing and non-hidden prices |
| **M-COM-02** | Adaptive merchandise grid | Homewares catalogue using one column on narrow devices, two when readable |
| **M-COM-03** | Compact restaurant menu | Food menu with readable dish names, prices, and optional photo detail |
| **M-COM-04** | Stacked or toggleable pricing | Service packages with clear price comparisons and no inaccessible horizontal table |

#### Forms and booking controls — 4 options

| ID | Mobile layout / behavior | Required example |
|---|---|---|
| **M-FRM-01** | Single-column contact form | Name, email and message with correct native input types and visible error states |
| **M-FRM-02** | Progressive inquiry steps | Renovation intake split into short steps with review and back controls |
| **M-FRM-03** | Sticky booking action | Hotel availability action that stays useful without covering form fields |
| **M-FRM-04** | Native date and time controls | Appointment request using mobile-native pickers and overflow-safe labels |

#### About, trust, and process — 4 options

| ID | Mobile layout / behavior | Required example |
|---|---|---|
| **M-STORY-01** | Portrait and brief introduction | Founder story with legible caption and high-quality phone crop |
| **M-STORY-02** | Swipeable testimonial focus | One readable review at a time, real attribution or clearly fictional demo text |
| **M-STORY-03** | Vertical numbered timeline | Renovation process steps with short descriptions and an obvious sequence |
| **M-STORY-04** | Wrapped credentials strip | Qualified partner marks that remain legible without infinite marquee animation |

#### Calls to action, contact, and footer — 4 options

| ID | Mobile layout / behavior | Required example |
|---|---|---|
| **M-CTA-01** | Safe-area sticky primary action | Service enquiry button with dismissal/overlap safeguards |
| **M-CTA-02** | Full-width inline action | Retreat booking CTA framed clearly without excessive borders or ornament |
| **M-CTA-03** | Click-to-call contact sheet | Local trades contact section with phone/email choices, no fake backend |
| **M-CTA-04** | Compact disclosure footer | Multi-column footer turning into accessible expand/collapse groups |

#### Utility interactions — 5 options

| ID | Mobile layout / behavior | Required example |
|---|---|---|
| **M-UTIL-01** | Tabs to scrollable rail | Category filters becoming a labeled horizontal strip rather than tiny pills |
| **M-UTIL-02** | Full-screen modal sheet | Gallery details opening as a keyboard-safe mobile sheet |
| **M-UTIL-03** | Touch comparison slider | Project before-and-after with slider label and accessible alternative |
| **M-UTIL-04** | Filter drawer | Product filtering in an accessible modal drawer with apply/reset controls |
| **M-UTIL-05** | Contextual back-to-top | Long portfolio with unobtrusive visible return navigation |

#### Video and motion — 3 options

| ID | Mobile layout / behavior | Required example |
|---|---|---|
| **M-MEDIA-01** | Poster-first video | Studio reel loading an optimized still before explicit playback |
| **M-MEDIA-02** | Muted inline loop | Short decorative clip with reduced-motion static fallback |
| **M-MEDIA-03** | Portrait crop for wide film | Landscape footage art-directed for phone without losing the subject |

### Mobile delivery by milestone

- **Phase 1 / foundation:** add the mobile-treatment schema and compatibility linkage to the component catalogue, plus a shared browser preview harness and capture standards; no claims that treatments are live before implementation.
- **Phase 2 / six vertical-slice examples:** implement the default phone layout for all six core specimens; additionally prove at least four paired alternative treatments: `M-NAV-04` with `NAV-03`, `M-HERO-02` with `HERO-01`, `M-GAL-02` with `GAL-02`, and `M-SRV-03` with `SRV-03`. All four alternates must show actual differences, stock where applicable, and working controls. Verify `CTA-02` and `FORM-01` mobile defaults and safe-area interactions.
- **Phase 3 / first public showroom:** target roughly 14 published mobile treatments across navigation, heroes, galleries, services, CTAs and forms alongside 35 core IDs. No unsupported combinatorial permutations.
- **Phase 4 / commercial utility:** publish relevant mobile product, price, booking, service and contact treatments as those section families are built.
- **Phase 5 / full coverage:** complete, consolidate or deliberately retire the remaining mobile treatments based on actual distinct value; do not manufacture 44 nearly identical options to hit a quota.
- **Phase 6 / shortlist:** include mobile treatment IDs and their parent pairs in save/export/share flows; offer a plain-language visual comparison of alternatives.
- **Phase 7 / automated QA:** verify mobile permutations chosen for publication, screenshot diffs, orientation change, keyboard/assistive input, and actual iOS Safari and Android Chrome on phones.

### Mobile-specific quality gate

Check 320 / 360 / 375 / 390 / 430px and short-height landscape devices, plus 768px transition. Confirm no horizontal overflow, meaningful fold composition, copy legibility, image focal points, menu/overlay focus handling, safe-area padding, native date inputs, zoomed text, on-screen keyboard avoidance, tap/drag parity and reduced-motion fallback. Capture at least one actual iPhone Safari and one Android Chrome pass for each **interaction class**, with representative layouts sampled across the catalogue; treat emulation as insufficient for final production approval.

**Mobile naming rule:** the base 137 options and these 44 mobile treatments are tracked as **separate catalogues**, not 181 interchangeable desktop components. Counts and progress reports must distinguish them (`core options live` vs `mobile treatments live`).

## 7. Development phases and completion gates

### Phase 0 — Confirm scope and matrix
**Deliverables:** ratified 29-category inventory; priorities and use cases; list of 24 existing sites to mine for patterns; design-system contract; live-versus-demo distinctions; permanent ID policy.

**Exit:** no duplicate concepts or blind spots in common small-business, creative, hospitality, trades, B2B, restaurant and product workflows. All choices have an intended example.

### Phase 1 — Foundation and content/asset pipeline
**Deliverables:** `/components` route and shell; Vite integration under the existing GitHub Pages base path; JSON manifest; category schema; stock-license registry; image download-and-optimization script; thumbnail-generation rules; static preview isolation; base design tokens; client-centered terminology.

**Exit:** adding one component means creating its files/metadata and assets, not manually editing category counts or copying markup into three places. Production build and correct base paths pass. Data model also accommodates optional mobile treatment ID(s), compatible core IDs and their per-treatment media and preview evidence.

### Phase 2 — Vertical slice: six finished components
**Suggested reference specimens:** NAV-03 transparent image navigation; HERO-01 full-bleed image; GAL-02 masonry; SRV-03 alternating services; CTA-02 image CTA; FORM-01 minimal contact.

**Deliverables:** all example-contract fields; license-documented stock media (local or remote HTTPS); desktop/mobile preview; one fully interactive example (navigation, gallery); small sample shortlist; smoke tests. Prove four distinct alternate phone designs (M-NAV-04, M-HERO-02, M-GAL-02, M-SRV-03) in addition to the six default phone layouts.

**Exit:** a coworker can add a component consistently; a client can choose six distinct options without explanation and compare the four corresponding mobile alternatives; 320px works; image-license evidence is complete.

### Phase 3 — First public showroom release: approximately 35 options
**Coverage target (35 distinct IDs):** NAV-01/02/03/04; BAR-01; HERO-01/02/03/04/05/07; INTRO-01; GAL-01/02/03/05/06; PRJ-01/02/03; COMP-01; SRV-01/02/03; ABOUT-01; TEST-01; PROC-01/02; CTA-01/02/03; FORM-01/02; CONTACT-01; FOOT-01/02.

**Deliverables:** complete category index, real thumbnail + live preview for every item, keyboard-usable navigation, interactive mobile/desktop tabs and compatible alternative mobile treatments (target 14 published), search, category and style filters, shortlist, copy summary.

**Exit:** 35/35 publish-ready checklist passes; no dead interactions; category counts auto-generated from metadata; gallery includes a clear Components link; preexisting template gallery remains unchanged.

### Phase 4 — Broaden commercial utility
**Add:** additional navigation + footers, trust/credentials, pricing, teams, quote selectors, appointment demos, restaurant menus, products, locations, newsletter and FAQ. Explicitly label integrations that are demo-only. Ensure service trades and local small businesses have enough examples beyond image-first brands.

**Exit:** every common single-page business section has at least one realistic, usable representative example.

### Phase 5 — Complete breadth of inventory
**Add:** all remaining GAL/PRJ/COMP/MEDIA, events, careers, blog/news, editorial case studies, advanced interactions, consent/privacy UI and remaining 137-item backlog as planned. Re-review whether some overly similar variants should be combined rather than forcing every row into production.

**Exit:** each approved family has sufficient genuinely distinct choices; no publication purely to hit a number. Update the inventory when justified and record rationale.

### Phase 6 — Polish client selection workflow
**Deliverables:** persistent local shortlist, reorder selections, remove choices, view side-by-side, export/copy a brief (`NAV-03 [mobile: M-NAV-04] + HERO-01 [mobile: M-HERO-02] ...`), optional link to prefilled inquiry email, 'what can change?' FAQ, mobile shortlist accessibility.

**Exit:** a nontechnical client can go from browse to a coherent design brief in under 10 minutes, with no login.

### Phase 7 — CI, regression and operations
**Deliverables:** automated link and integrity checks; license-manifest checker; accessibility scan; Playwright interaction/viewport tests; screenshot diff review; performance smoke checks; broken-image monitoring plan; cache-busted production builds; release notes; contributions guide.

**Exit:** every new component has a repeatable QA workflow; existing 24 template links still work and are not restyled by the showroom.

### Phase 8 — Optional later integration with internal component library
**Deliverables:** extract stable component code patterns into a separately versioned internal library *only after proving reuse*. Map public IDs to internal implementations; avoid making style-specific preview HTML the universal code source.

**Exit:** internal developers can reuse components without coupling all client sites to the public gallery's CSS or JavaScript. Public showroom remains client-first.

## 8. Quality gates per published option

**Functional:** all links/actions have a meaningful result; keyboard works; Escape dismisses overlays; focus stays inside modal/menu when open and returns to trigger on close; menus do not scroll background when open; touch targets practical for phones; forms validate and cannot pretend to send.

**Responsive:** test 320, 360, 375, 390, 430, 768, 1024 and 1440px plus at least one wide viewport and short-height landscape. Every core component needs its own deliberate mobile baseline; all selectable mobile alternates require separate QA. No horizontal overflow or clipped text. Check cropped photo subjects, sticky safe areas, text zoom, native controls and touch layouts, not just computed bounding boxes. Real iOS Safari + Android Chrome spot checks are required for publishing the catalogue.

**Accessible:** landmarks/headings, associated input labels, contrast and focus visibility, image alt semantics, captions/transcripts for meaningful video, reduced-motion behavior, appropriate ARIA, no keyboard traps except intentional focus-contained dialogs. Automated scans are necessary but not sufficient.

**Visual quality:** each variation demonstrates a genuine structural/interaction difference from its siblings; no generic card wall, fake KPI filler, arbitrary gradients, unreadable tiny labels, image repetition, or aesthetic-only motion. The choice still feels intentional with real photography.

**Assets and performance:** rights-reviewed remote or locally optimized image variants, reserved dimensions, LCP hero priority, noncritical lazy loading, preload only when justified, lightweight interactive scripts, no rendering 137 iframes at page load, optimized thumbnail sizes and a no-JS browse fallback.

**Legal/content:** stock license and source recorded; photography use appropriate to rights and context; no invented genuine client reviews/testimonials presented as real; no misleading real-service claims; no fake reservation time slots; contact/demo placeholders unmistakably marked.

**Publishing:** `draft → in-review → approved → live`. Only `live` appears as a selectable ready option. Every live ID has its own preview, screenshots, documented integration level and image manifest. Gallery counts and category stats derive from live manifest records, never hardcoded.

## 9. Suggested implementation repository layout

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

## 10. Practical acceptance and next action

**First actual implementation step:** build the design/preview infrastructure and the six-component vertical slice. Do not start by generating 137 screenshots or hand-coding 137 pages, because the system has to prove accurate examples, safe stock media, isolation, mobile behavior, QA, and client selection first.

**Milestone 1 definition of done:** A gallery category can be browsed, an example opened, desktop/mobile previews switched, its interaction tried, and compatible alternate mobile designs compared; its ID (and selected mobile treatment ID where applicable) saved, selected IDs copied, and the asset/license provenance audited. Once those six specimens pass, phase 3 becomes repeatable production rather than experimental work.

**Repository state:** The foundation is being developed on `feature/component-showroom`; this roadmap amendment is planning only, not evidence of 44 implemented mobile examples. Do not merge or publish until the component and mobile-specific release gates pass.
## Development amendment — remote stock and final client visual review
The component showroom can use source-documented direct HTTPS stock image URLs (Unsplash or Pexels) instead of downloading every image into GitHub. Include photographer, source URL, current license link, permitted usage assessment, and the production CDN URL in the media manifest. Check real image availability, behavior and accessible alternatives before release. Retain a sensible fallback if image loading fails. This does **not** eliminate likeness, trademark, property, endorsement or other rights considerations. The client has chosen to perform final visual inspection **after the showroom is implemented**, so do not hold up building the remaining components for preliminary photo-crop approval. Track those visual approvals as deferred and keep unapproved examples in review. Functional, route, accessibility and responsive code checks continue throughout development.


## Interface decision — client portal saving deferred
The Component Showroom stays a **browse-and-explore experience** until the planned client portal is designed. Remove the public/in-review working shortlist, localStorage saving and copy-ID controls from the live review interface. Component IDs remain visible as references for project conversations. The future authenticated client portal may have a simple Save action tied to client accounts; do not implement account storage, favorites or placeholder buttons in the public viewer. Use plain-language device choices (Computer / Tablet / Phone) and simple inspection modes (Whole design / Look closer) rather than pixels and scale percentages. This decision supersedes earlier Phase 2 and Phase 6 prototype shortlist requirements.


## Scope amendment — dedicated animation patterns (November 20, 2026)

**New catalogue family:** Motion and animation (ANIM-01 through ANIM-07), distinct from generic hover effects used inside other components. The original 29-family/137-variation inventory remains the v1.1 historical baseline above. The current plan is **30 families / 144 core IDs**; 44 optional mobile layouts remain separate. Motion patterns are previewed as realistic interactive sections—not abstract GIFs, global themes or animations added to every page. This amendment does not waive the earlier Phase 3 release gate.

| ID | Pattern | Client-facing example | Completion acceptance |
|---|---|---|---|
| ANIM-01 | Staggered editorial reveal | Materials studio headline, rule and small project description | User replay; each element shown in order; text always visible with no JS/reduced motion. **In review.** |
| ANIM-02 | Kinetic headline entrance | Creative agency two-line title | Once/replayable, measured timing, no per-character gimmicks or clipping at 320px. |
| ANIM-03 | Image mask reveal | Architecture project photograph | Deliberate rectangular reveal and static mobile/reduced-motion fallback; image-source rights cleared. |
| ANIM-04 | Bounded scroll parallax | Landscaping project image | Small, clamped transform only in view, and disabled for low-power/mobile/reduced-motion. |
| ANIM-05 | Content transition | Materials studio switches two narratives | Accessible, user-controlled change with no focus loss or visually hidden interactive controls. |
| ANIM-06 | Controlled editorial ticker | Studio events/announcements | Step-by-step navigation; if it moves automatically, provide a pause control; never essential continuously moving text. |
| ANIM-07 | Step/timeline progress | Builder's illustrative four-stage process | User-triggered stage changes and labelled progress, never fabricated real delivery status. |

**Performance and accessibility contract:** Motion is optional, purposeful and finite; prefer opacity/transform over layout shifts, and prevent cumulative layout shift. Do not hide core content until JS initializes. Honor `prefers-reduced-motion`, keyboard/touch parity, contrast, 200% text zoom and short mobile viewports. Pause nonessential motion when the tab is hidden; never prevent clicking or reading. Only mark `live` after actual rendered screenshot review, browser interaction QA, device QA and rights verification for image-led patterns.

**Implementation order:** start with ANIM-01 (interactive proof), then ANIM-02/03 after the current Phase 3 sections, followed by ANIM-05/07; review ANIM-04/06 carefully for motion sensitivity and mobile/performance costs. Each variation receives its own focusable preview, realistic fictional context, and descriptive catalogue guidance. Public availability stays blocked until the usual approval steps.

**Roadmap hygiene:** the heading "35 distinct IDs" in the Phase 3 target actually lists 36 different IDs; use the enumerated list as the build baseline. Keep approved/client-release status separate from working preview counts. The client portal's Save feature remains deferred and is not part of this animation work.

## Additional animation inventory — expansion to twenty patterns (November 20, 2026)

The initial seven-pattern amendment has been **expanded to ANIM-01–ANIM-20**. The current authoritative total is **30 categories and 157 planned core options** (original 137 plus 20 motion variants), with the pre-existing 44 optional phone-layout choices unchanged. The first seven remain as described immediately above; these thirteen further patterns are also required distinct examples, not simple changes of speed or color.

| ID | Additional pattern | Realistic sample | UX and QA condition |
|---|---|---|---|
| ANIM-08 | Text line-wipe | Editorial publisher: a heading exposed line by line | Line masking reveals complete readable sentences; no broken text at zoom. |
| ANIM-09 | Diagonal section reveal | Independent furniture studio: a clipped transition between two editorial panels | One intentional angled panel wipe with a simple no-motion replacement. |
| ANIM-10 | Scroll chapter indicator | Travel feature: narrative progress across three illustrated chapters | Scroll-derived position, clear chapter labels, no scroll hijacking. |
| ANIM-11 | Image focus zoom | Architectural portfolio: slight project photograph enlargement on hover and focus | Limited scale, keyboard/touch equivalent and no crop clipping. |
| ANIM-12 | Project image exchange | Interior designer: switching project photography by focus or click | Persistent selected state and accessible controls, never hover-only. |
| ANIM-13 | Horizontal story rail | Photographic journal: scroll-snap story frames with keyboard controls | Visible previous/next and reduced-motion instant scrolling. |
| ANIM-14 | Accordion detail transition | Craft workshop: expanding technical detail between numbered services | Native semantic disclosure, optional measured reveal, no focus traps. |
| ANIM-15 | Meaningful number count-up | Local nonprofit: funding goal/progress with explicit measurement labels | Static complete value until initiated, no invented precision. |
| ANIM-16 | Pointer-tracking spotlight | Creative studio: restrained light following product detail under a pointer | Mouse-only enhancement, fully useful with keyboard/touch and reduced motion. |
| ANIM-17 | Layered story stack | Architectural publication: stacked editorial chapter cards on scroll | Small bounded layering with a normal linear document fallback. |
| ANIM-18 | Intersection reveal rhythm | Gallery: art-directed project rows appearing as they enter view | Each reveals once, does not hide content before JS runs. |
| ANIM-19 | Local page transition | Museum microsite: switching two internal exhibit views | Same-origin navigable demo, transition never conceals route state or history. |
| ANIM-20 | Step-controlled image carousel | Product craft portfolio: navigating a finite sequence of still images | Explicit arrows and position indicators; no unpausable autoplay. |

**Grouping to help clients:** text & editorial (ANIM-01, 02, 08); image & project motion (03, 04, 11, 12, 20); section & scrolling (09, 10, 13, 17, 18); interface & feedback (05, 06, 07, 14, 15, 16, 19). These are catalog filters/tags rather than a new explosion of category IDs. Keep phone behavior deliberate; interactive components require pointer, touch and keyboard parity; all effects must respect `prefers-reduced-motion`. Never create an infinite, distracting animated effect simply to reach the target count.

**Build order:** implement and test ANIM-01, 02, 05 and 07 first to validate different interaction classes. Then animation examples join the regular Phase 3 backlog. Image-led motion requires the existing stock-image approval, cropping and performance gates. Current IDs stay `draft` until a working isolated preview and metadata contract exist; no status is promoted to `live` without client acceptance.


## Integration amendment — animation patterns inside complete templates (November 20, 2026)

**Product rule:** An animation preview alone is not enough to demonstrate a reusable design treatment. Every implemented motion pattern must also be inspectable on at least one relevant **real full-page template**, with an obvious route from the component card and review screen. Patterns should not be distributed uniformly across all templates; each effect needs a design reason. The naturally static STILL waitlist and other intentionally still designs are exempt unless a meaningful user-triggered transition is requested.

| Animation ID | Full-page template | Applied section and effect | Proof |
|---|---|---|---|
| ANIM-01 | Arc (Quiet SaaS) | Staged hero copy entrance, replayable via “Replay intro” | CSS/JS in templates/quiet-saas |
| ANIM-02 | OFFCUT (Creative Agency) | Whole-line kinetic headline entrance with “Replay title” | CSS/JS in templates/creative-agency |
| ANIM-03 | Morrow (Architecture) | Photographic hero image mask reveal with replay, static fallback | CSS/JS in templates/architecture |
| ANIM-05 | MORA (Storefront) | Finish swatches now actually change product media and selection text, with a restrained transition | CSS/JS in templates/storefront |
| ANIM-06 | WOBBLEWORKS (Interactive Playground) | Existing full-width ticker now has a working pause/play control and reduced-motion behavior | CSS/JS in templates/interactive-playground |
| ANIM-07 | LINE + LEVEL (Contractor) | Selectable numbered process stages drive a real visual progress line | CSS/JS in templates/contractor |

The six working animation specimens (ANIM-01, 02, 03, 05, 06, 07) and their full-template routes remain **in-review**. Fourteen remaining animation IDs are still drafts. Each pattern's metadata includes a `fullTemplateRoute` and `fullTemplateName`; the viewer/catalogue offer a dedicated “See on a full website” link. Build artifacts include the unmodified-other full templates so these relative routes remain valid on the GitHub Pages project base and in the CI preview.

**QA expansion:** The browser test suite must open the full templates and verify motion can be replayed or controlled with keyboard/touch controls, required text remains present, and reduced-motion preferences suppress movement. Screenshot/automated checks do not waive manual iOS Safari, Android, photo crop/rights and final visual approval. All work stays on `feature/component-showroom`; do not merge to main until separately authorized.

## Six-animation continuation (November 20, 2026)

The working motion catalogue is now **12 of 20** planned patterns. Each is linked to an original full-page website, not just an isolated demo. The existing Phase 3 release inventory of 36 core layout IDs is unchanged.

| ID | Animation | Integrated full-page template | Verified behaviour to test |
|---|---|---|---|
| ANIM-08 | Whole-line text wipe | AFTER DARK (Event Launch) | Replayable poster title; reduced-motion static |
| ANIM-10 | Chapter progress | Morrow House (Muskoka Retreat) | Current section indicator, native anchor links and progress meter |
| ANIM-11 | Image focus zoom | BED & BORDER (Landscaping) | Button-controlled detail zoom with static reduced-motion mode |
| ANIM-14 | FAQ detail transition | NORTHLINE LAW (Law Firm) | Native, accessible disclosure sections; measured content entrance |
| ANIM-15 | Meaningful count-up | YARD (Fitness Launch) | Replay of the existing fictional six-person/one-coach format |
| ANIM-18 | Image entrance rhythm | BLACKLINE (Tattoo Studio) | Once-on-entry image cadence plus explicit replay |

**Remaining draft motion IDs:** ANIM-04, ANIM-09, ANIM-12, ANIM-13, ANIM-16, ANIM-17, ANIM-19, ANIM-20. They require equally genuine in-template behaviour before status promotion. All in-review examples still await live image-loading and crop QA, physical iOS Safari and Android Chrome, motion-sensitive/accessibility checks, performance review and client visual acceptance. Nothing is promoted to live or merged into main.

**Enforced contract:** Every non-draft animation must have a valid full-page template route and name. Build and browser regressions verify the integration as well as the isolated preview.

## Four integrated motion patterns — November 20, 2026

Four additional distinct behaviours move to **in-review**. The working animation set is now **16 of 20**. Every option has an isolated showroom demo and a real integration in one of the existing complete templates:

| ID | Pattern | Full-page destination | Active interaction |
|---|---|---|---|
| ANIM-09 | Diagonal section reveal | RANGE/FOUND / Editorial Commerce (`#journal`) | Angled journal panel appears on entry and supports manual replay |
| ANIM-12 | Project image exchange | FRAME / Photographer Portfolio (`#frame-feature`) | Portrait, editorial and object images exchange with accessible pressed state and live text |
| ANIM-17 | Layered story stack | MONOLITH / Architecture (`#chapters`) | Three actual sticky editorial cards on wide screens, conventional linear scroll on phone and reduced-motion |
| ANIM-20 | Step-controlled image carousel | GRAIN & GABLE / Woodworker (`#craft-showcase`) | Finite three-frame craft sequence with previous/next, direct step choice, boundaries and no autoplay |

**Still drafts:** ANIM-04 (bounded parallax), ANIM-13 (horizontal story rail), ANIM-16 (pointer spotlight), ANIM-19 (local page transition). Each must satisfy the preview+full-template integration policy before review. In-review is **not** live or release-ready; images still require crop and rights checks, and motion requires real mobile Safari/Android plus accessibility and visual QA. No changes to main are authorized.

**QA contract strengthened:** In addition to testing interactive behaviour, the built catalogue now requires the actual `data-motion-pattern="ANIM-xx"` marker inside the linked complete template. This prevents a route existing without an implemented motion treatment.

## Final motion batch — all 20 patterns implemented (November 20, 2026)

The planned motion range is now **20 / 20 working in-review**. Each example has an isolated responsive showroom specimen, a working motion treatment within an original complete website template, and direct review/catalogue links. Four last additions:

| ID | Behaviour | Integrated website | Fallbacks |
|---|---|---|---|
| ANIM-04 | Bounded photographic parallax | BED & BORDER (Landscaping) · hero photo | ±24px clamp, pause control, still image on phones and reduced-motion devices |
| ANIM-13 | Horizontal photographic story rail | Waterline (Real Estate) · `#shore-stories` | Native scroll-snap, swipe/keyboard support, finite previous/next, instant reduced-motion scroll |
| ANIM-16 | Pointer-tracking spotlight | KERN (Dark Tech) · `#inspection` | Content never hidden; optional keyboard/touch emphasis control; pointer halo disabled for reduced motion or coarse pointers |
| ANIM-19 | Local page transition with browser history | Tide (App Launch) · `#planner-views` | Hash-addressable Today/Tomorrow views, working Back/Forward, both views visible when JS disabled |

**Release status:** all 20 are `in-review`, none are `live`. Core catalogue has 56 in-review of 157 options; mobile alternatives remain 4 in-review of 44. The animation build stage is complete; further work prioritizes visual QA and the mobile-alternative design backlog, not gratuitously adding effects. Media licensing, image loading and cropping, real iOS Safari / Android Chrome checks, reduced-motion inspection, performance and human accessibility review are still required before approval. `main` remains unchanged.

**QA:** Added explicit integration route/fragment checks and browser regressions for photo clamp, parallax pause, rail movement and bounds, pointer follow and accessible fallback, deep-linked local views, Back/Forward and no-script content.

## Mobile design expansion — six distinct phone treatments (November 20, 2026)

Mobile alternatives in review: **10 / 44** (four earlier plus six newly added). Core examples remain **56 / 157** in review; animations remain **20 / 20 implemented**. These treatments are selectable by the existing review page's phone comparison selector, retain their original parent previews, and are not applied to unrelated full website templates:

| ID | Parent | Alternate phone design |
|---|---|---|
| M-NAV-01 | NAV-01 | Compact anchored menu with focus management and Escape close |
| M-HERO-03 | HERO-03 | Large poster-first typography above a tight three-photo editorial strip |
| M-GAL-03 | GAL-03 | First featured study followed by a two-column, captioned image gallery |
| M-SRV-02 | SRV-02 | Scrollable service category tabs with one visible service and an announced selected state |
| M-FRM-02 | FORM-02 | Two validated project/contact steps with back navigation and the original local summary |
| M-CTA-01 | CTA-01 | Fixed bottom phone action honoring safe-area insets; hides beside its original CTA |

The defaults, original semantics and non-mobile layouts remain available. No client site has been deployed or any parent component marked live. Visual crop, photography rights, physical iOS/Android interaction and accessibility review remain mandatory before approval.

**QA:** Added source-level parent-to-alternative symmetry and explicit browser tests for navigation focus/close, collage/gallery geometry, actual switcher selection, native field validity, step/back/summary continuity, sticky-action suppression and 390px overflow.

## Mobile design expansion: six interaction-led options (November 20, 2026)

Six more mobile alternatives are functional and in review, bringing the mobile library to **16 / 44 in review** (28 drafts). Core examples remain **56 / 157 in review**, and all **20 / 20 animation patterns** remain complete. Every mobile treatment is a distinct optional layout or behaviour within its original built parent; the normal design stays intact:

| ID | Parent | Mobile behaviour |
|---|---|---|
| M-NAV-05 | NAV-02 | Sticky horizontal section-anchor rail with live location indicator |
| M-NAV-06 | NAV-04 | Accessible off-canvas drawer with backdrop, focus containment, background inerting and Escape/return focus |
| M-GAL-05 | GAL-06 | Compact thumbnail gallery, native full-screen viewer with optional horizontal touch swipe |
| M-FRM-04 | FORM-01 | Native date/time preference in a local, non-booking contact summary |
| M-UTIL-03 | COMP-01 | Touch-scrubbable image comparison with native keyboard slider and selection presets |
| M-UTIL-04 | GAL-05 | Native filter modal using the live category filter control set |

**Quality gates:** explicit browser interaction checks, selected state, native dialog semantics, Escape and return focus, no sideways phone scrolling, and unchanged base options. All treatments still require physical iOS Safari and Android Chrome checks, photography licensing/crop sign-off and a human accessibility review. These are **not live** and not merged to `main`.

## Commerce, project storytelling and appointment mobile treatments — November 20, 2026

Core in-review examples **60 / 157** (four added): `PROD-01` illustrated ceramics product grid, `PRICE-01` illustrative pricing tiers, `MENU-01` fictional restaurant menu, and `BOOK-01` local-only consultation planner. All four have real responsive markup and behaviour, not an empty mobile dependency.

Mobile treatments in review: **22 / 44** (six newly added), with 22 still draft. Animations remain **20 / 20** implemented. The six additions:

| ID | Parent core | Functional phone treatment |
|---|---|---|
| M-COM-01 | PROD-01 | Native scroll-snap product rail, bounded next/previous and real product material inspection |
| M-COM-03 | MENU-01 | Native compact restaurant category disclosures; original menu readable in normal mode |
| M-COM-04 | PRICE-01 | Keyboard/touch-selectable pricing tier cards with working native inclusions |
| M-FRM-03 | BOOK-01 | Safe-area sticky consultation request; local validation only, never a real appointment |
| M-STORY-02 | TEST-01 | Three clearly fictional quote studies, manual next/previous and touch swipe, no autoplay |
| M-STORY-03 | PROC-01 | Vertical project-stage rail with native detail expansion and linked sticky progress index |

**Release integrity:** Example ceramic objects are original CSS studies, not real inventory. Sample restaurant dishes, prices and client quotes are explicitly illustrative. Appointment selections never check availability, collect user data, reserve slots or send requests. All remain `in-review` pending visual, real-phone, accessibility, content and legal/media review.

**QA:** original parent functionality, native form validation, reduced-motion fallback, focus management, touch/navigation state, mobile overflow and base-mode regression tests.

## Multiple optional phone styles per component — November 20, 2026

**27 / 44** mobile treatments in review (**17 drafts**). Core previews remain **60 / 157**, animations **20 / 20**. The showroom now supports *all* built alternate phone styles for each component rather than silently selecting just the first one. Every component maintains its original responsive phone layout as Style 1, with distinct additional phone choices alongside:

| Parent | Default | Additional mobile layouts |
|---|---|---|
| NAV-04 | Responsive dropdown | M-NAV-06 edge drawer; M-NAV-02 persistent enquiry + dropdown |
| GAL-02 | Two-column responsive gallery | M-GAL-02 touch photo rail; M-GAL-04 compact featured-photo mosaic |
| PROD-01 | Vertical product list | M-COM-01 swipeable merchandise rail; M-COM-02 feature + two-column merchandise |
| HERO-05 | Responsive slideshow | M-HERO-05 mobile art-direction with touch gestures and slide selectors |
| ABOUT-01 | Responsive portrait and copy | M-STORY-01 photo-cover editorial introduction |

All are optional composition choices, not mobile compatibility patches. The original desktop, tablet, mobile layouts and review URLs remain valid. The new review selector exposes as many numbered phone styles as a component actually has, with proper selected-state, device switching and active-iframe routes. Automated browser tests check both mobile alternatives on each reused parent and their unchanged original interfaces.

**Requested CTA refinement:** removed arrow glyph from CTA-03's main link and removed unused arrow styling. The text-only anchor remains functional. Manual browser/device, media rights and design approval gates remain open.

## Seven more responsive phone alternatives — November 20, 2026

The optional mobile-design inventory reaches **34 / 44 in review** (**10 drafts remain**). Core catalogue remains **60 / 157 in review**; the animation inventory remains **20 / 20 built and integrated**. These are new responsive compositions, not separate core components or superficial colour changes:

| Phone ID | Parent | Actual phone experience |
|---|---|---|
| M-HERO-01 | HERO-01 | Immersive shoreline photography, small in-image editorial copy and a genuine full-width on-page CTA |
| M-GAL-01 | GAL-03 | Full-width vertical photography with high-contrast caption overlays inside each photo chapter |
| M-SRV-01 | SRV-03 | Edge-to-edge renovation photos and overlapping service description cards; original native details preserved |
| M-CTA-02 | CTA-02 | Separate photo and text panels with an accessible full-width anchor action |
| M-CTA-04 | FOOT-02 | Compact responsive footer with exactly one native disclosure open at a time; all destination links retained |
| M-UTIL-01 | GAL-05 | Touch/keyboard-accessible scroll-snap filter rail; existing live photo filtering retained |
| M-UTIL-05 | PRJ-03 | Return-to-projects control appears after scrolling and links to the real index; respects phone safe area |

The original default compositions, existing phone styles and wide-screen versions remain intact. The reviewer dynamically exposes the additional named Style choices for each parent and the new modes use the same source content. The existing Chromium smoke suite has explicit assertions for these layouts, disclosure/filter/back-to-top interactions and absence of page-level horizontal overflow. **These checks are committed, not newly reported as passed here.** Media-rights acceptance, image-loaded screenshots, physical-device Safari/Android testing, accessibility/performance and final visual approval remain outstanding. Do not promote these options to live or merge to main.

## Mobile-alternative track completed — November 20, 2026

All **44 / 44** optional mobile designs now have source implementations, reciprocal catalogue metadata and phone selector routes. They are all `in-review`, **none live**; every parent continues to offer its deliberately composed default responsive layout. The 10 latest options complete the previously open groups:

| Phone ID | Existing/new parent | Distinct working design |
|---|---|---|
| M-NAV-03 | NAV-02 | Fixed safe-area bottom navigation for the actual portfolio section anchors |
| M-HERO-04 | HERO-04 | Offset creative-studio portrait crop with explicit stock caption |
| M-SRV-04 | SRV-01 | Compact numbered architecture index with a single clearly illustrative photograph |
| M-FRM-01 | FORM-01 | Form-first compact inquiry ticket, retaining native field types and honest validation |
| M-STORY-04 | TRUST-02 (new) | Two-column wrapping category badges; no fabricated real certifications or infinite marquee |
| M-CTA-03 | CONTACT-01 | Tel/mailto demonstration with reserved fictional example destinations and non-live disclosures |
| M-UTIL-02 | GAL-06 | Native full-height portrait-information sheet with keyboard navigation and focus restoration |
| M-MEDIA-01 | MEDIA-01 (new) | Poster-first vertical film with explicit opt-in playback |
| M-MEDIA-02 | MEDIA-01 | Muted in-view inline loop, manual pause, reduced-motion/data-saver poster fallback |
| M-MEDIA-03 | MEDIA-01 | Art-directed 3:4 portrait crop of the existing wide film with explicit playback |

Two genuinely new core preview implementations, **TRUST-02** and **MEDIA-01**, were required rather than claiming mobile options had no parent. Core catalogue advances from **60 to 62 / 157**. Animations remain **20 / 20 built and integrated**. The review viewer already supports multiple independently selectable styles under one parent: MEDIA-01 now has default plus three distinct phone alternatives.

**Media limitation:** MEDIA-01 reuses the existing OFFCUT Pexels video ID 9489382 with a static poster. This is a development reference, **not a cleared distribution asset**. Creator/source link, rights, final handset crop, video file size/format and real playback must be verified; do not publish/sell the prototype footage on the strength of its preview. It does not claim actual studio clients or real qualifications. STOCK-011 records these unresolved matters, and SRV-01's illustrative kitchen photo now has reciprocal STOCK-007 attribution.

**QA:** New source and browser regression assertions cover the 10 options, real interactions, video fetch only on request except opt-in muted loop, reduced-motion/data-saving fallback, image/detail-sheet focus/keyboard controls, native contact link destinations, and 390px overflow. **The code/test additions are not proof of a passing CI or physical-device run.** Complete existing release gates: rights/media audit, image-loaded screenshots, iOS Safari and Android Chrome, keyboard/accessibility review, video performance, client visual signoff. All items stay in review and `main` remains untouched.

**Next engineering milestone:** the optional mobile design backlog is now zero. Prioritize remaining **95 core examples** by real client demand, starting underrepresented trust, rich media, about/team and contact sections; preserve quality gates and avoid inventing demo transactions. Do not add new phone variants merely to inflate inventory.

## Seven new core specimens — team, trust, studio, contact and inline media (November 20, 2026)

The core catalogue reaches **69 / 157 in-review** (seven new source-complete responsive examples, **88 drafts remain**). The planned optional mobile design track is still **44 / 44 built in-review**, and all **20 / 20 ANIM** patterns still have isolated and full-template implementations. No option is marked `live`; `main` has not been merged.

| Core ID | Family | New actual demonstration |
|---|---|---|
| TEAM-01 | Teams and people | Three asymmetric real stock portrait frames with sample architectural roles, explicitly saying the pictured models are not employees |
| TEAM-02 | Teams and people | Featured, monochrome single-founder salon layout with a distinct photo-first mobile composition and fictional non-attributed founder story |
| TRUST-01 | Proof and credentials | Five original, purely fictional typographic client marks in a structured desktop row / mobile grid without fabricated testimonials or actual customer relationships |
| TRUST-03 | Proof and credentials | Fictional editorial/award ledger with accessible native disclosures describing required source verification; no real publication or winning claim |
| ABOUT-02 | About/studio storytelling | A materials-led fictional workshop introduction, two real workshop photo slots and expandable working-process notes |
| CONTACT-02 | Contact sections | Landscape-led sample lodge contact panel, abstract non-geographic concept diagram, truthful demo address and actual linked contact-form example |
| MEDIA-02 | Rich media | An opt-in muted inline studio reel, pause control, poster fallback, reduced-motion blocking and offscreen pause—deliberately distinct from the wide MEDIA-01 feature-film pattern |

**Source and legal policy:** TEAM-01, TEAM-02 and CONTACT-02 reuse existing registered stock portraits/landscape with reciprocal usage metadata. MEDIA-02 reuses the existing unapproved Pexels demonstration film STOCK-011 and loads video only after direct visitor action. ABOUT-02 reuses two woodworking photos already present in the GRAIN & GABLE full-page template; the new manifest records STOCK-012/013 with creator and individual source-page attribution explicitly **unverified**. These workshop images cannot be distributed/sold or marked release-ready until the original pages, creator, rights and suitability are checked. All sample people, client marks, articles, awards, addresses and business relationships are visibly labeled as fictional.

**Review and QA:** Each new specimen contains a genuine HTML/CSS/JS isolated preview, a deliberate desktop composition and intentionally composed narrow-screen layout, a focusable real showcase section, and in-page working links. Native details, photo image fallbacks, form-demo routing, mute/play/pause states and honest errors are included where appropriate. The Chromium regression source now asserts real content, truthful labels, keyboard disclosure, video does not fetch until opted in, reduced-motion poster-only behavior and 320px page width. Source-level checks found no duplicate IDs, missing alt attributes, broken anchors or missing reciprocal stock links. **A fresh passing production build and real-browser execution have not been verified in this GitHub-only pass.** Image-loaded screenshots, media rights, physical iOS Safari/Android Chrome, accessibility and final human visual review remain required.

**Next build order:** finish more unrepresented service and business-story families, especially TEAM-03/04, TRUST-04, ABOUT-03/04, MEDIA-03/04, and a fully verified contact/location variant; keep source-led image choice and avoid pseudo interactions or repeated visual formulas. Once enough demos exist, execute the full release gates and review the design set before any promotion to live.

## Four complete core families — second seven-item batch (November 20, 2026)

This working-branch pass completes all planned core examples across **teams (4/4), trust (4/4), about (4/4) and rich media (4/4)**. Core inventory is now **76 / 157 in-review**; **81 core drafts remain**, while **44 / 44 mobile treatments** and **20 / 20 integrated animation patterns** remain implemented. None are `live`, and no merge to `main` is authorized or performed.

| Core ID | Live in isolated preview, not production | Distinct functional behavior |
|---|---|---|
| TEAM-03 | Fictional tattoo-artist specialty cards illustrated through original CSS artwork | Artist preference toggles true `aria-pressed`; a form generates an explicitly NOT SENT local-only draft, never books an appointment |
| TEAM-04 | Compact four-person fictional agency index with role/category labels | Native profile details, live department filters and accurate visible-count status |
| TRUST-04 | Clear SIMULATED DATA example metrics and methodology disclosures | Two reporting-period controls change four actual example values; no business claims implied |
| ABOUT-03 | Staggered hospitality values paired with three differently paced remote stock photographs | Three independent photos captioned as NOT a single business location; real editorial navigation, no dead controls |
| ABOUT-04 | Two-column local business mission and supporting unrelated founder-model portrait | Clear three-part mission commitments and real in-page links; stock model and fictional quote disclosed |
| MEDIA-03 | Three chapter thumbnails opening a single legitimate video element in a native dialog | Loads a **single** unapproved stock video only after click, provides playback and a static poster, Escape close and focus restoration; never invents multiple source films |
| MEDIA-04 | Caption-led photography story with an interactive media frame and reading column | Three real independent stock photos swap with synchronized captions, selected status and bounded Previous/Next controls |

**Rights and authenticity:** Existing STOCK-001, -002, -004, -007, -008 and -011 references were reused with reciprocal usage metadata. No new unverified source was invented. STOCK-011 remains a high-bandwidth unapproved Pexels reference and is reused in MEDIA-03 only as a proof of the playback/gallery interaction. The three chapter thumbnails show the **same sample source** and do not represent three real recordings. All demonstration team members, tattoo artists, client performance statistics, mission founders and accommodation properties are explicitly fictional. Replacing them with authentic, licensed material is a hard release gate.

**QA evidence:** Seven original responsive `index.html`, `styles.css`, `script.js` preview sets created, catalogue/reviewer metadata wired, and custom Chromium regression assertions added for actual artist-note generation, team filtering, metrics switching, native media dialog/keyboard focus, photo selection, and 320px overflow. Connector-based source checks passed JavaScript syntax, HTML anchor targets/duplicate IDs, image alt requirements, balanced CSS brackets and stock-manifest reciprocity. The augmented browser script parses. **No full Chromium run, real image-loaded visual comparison, physical iOS/Android pass or GitHub CI success has been verified**, and nothing is approved for release.

**Suggested next core build:** shift to remaining under-covered categories (locations, careers, newsletter, legal, testimonials, project variants, pricing, booking and conversion-oriented sections) rather than adding unnecessary further variants to these completed families. Keep the showroom browse-only: no saved favourites/shortlists or client portal until separately designed. Do not promote or merge `main`.

## New business information and conversion specimens — November 20, 2026

**84 / 157 core examples built and in review** (eight new, **73 drafts remain**); **44 / 44** optional mobile treatments in review; **20 / 20** motion patterns remain implemented in both isolated previews and connected full-page templates. All remain review-only; nothing was promoted to `live` or merged to `main`.

| New core component | Actual working demonstration |
|---|---|
| LOC-01 | Fictional single-café location, seven-day example hours and accessible native arrival-question disclosures; **no fake directions or open-now claim** |
| LOC-02 | A four-zone interactive service-area illustration with live selection, `aria-pressed`, updated status and explicitly **non-geographic** boundaries |
| CAREER-01 | Three clearly fictional job listings with native role disclosures, real office/site filters and a local example role-selection summary; **not actual job opportunities** |
| CAREER-03 | Accessible applicant interest form that validates fields, focuses invalid entries and generates only a local **NOT SENT** draft; no upload, storage or backend |
| NEWS-01 | Simplified retail newsletter: native email validation, explicit unselected consent, non-sending success preview and working reset |
| NEWS-02 | Image-led journal with real topic and frequency preferences, validation, explicit consent and an honest **not subscribed** local preview |
| UI-01 | Six real native FAQ disclosures, client-side question searching, single-open behavior, accurate live result count and no-results reset |
| FORM-03 | True three-step renovation questionnaire with per-stage required choices, forward/back navigation, retained answers, invalid-field guidance and an unsent local draft; **no computed price or submitted lead** |

The newsletter family is now **2/2 source-complete**, locations **2/4**, careers **2/3**, forms **3/6**, interface utilities **1/7**. Across the catalogue, the eight new previews have distinct desktop and phone compositions rather than a single resized card template. NEWS-02 reuses registered interior STOCK-007, openly labeled as an unrelated sample photo; reciprocal manifest attribution was updated. All contact details, job titles, business identities, service areas, opening hours, staffing claims and budget examples are fictitious design content.

**Quality and release gates:** Every new specimen has its own `index.html`, `styles.css` and `script.js`, review route, catalogue focus guidance and accessible mobile fallback. The source-level QA verified no duplicate HTML IDs, no dangling in-page anchors, image alt text, balanced CSS declarations, and parseable preview JavaScript. The smoke-test source now exercises location disclosures, selectable regions, careers filtering and drafts, newsletter consent/validation, FAQ search and zero-results, staged form validation/back navigation and narrow 320px layout checks. Showcase validator and browser smoke category maps now include `locations`, `careers`, `newsletter` and `interface`. The browser smoke source parses, but **there is still no confirmed passing browser/CI run or image-loaded physical-device report**. Do not claim that a committed test is a passing test. Stock-rights review and real client acceptance remain mandatory.

**Next priority:** fill the **interface utilities and remaining forms/careers/locations** with genuine working interaction, then assess legal/policy examples, footer conversion flows, and proof/testimonials without fictional endorsements. Before building too much more, run the full Chromium suite in an environment with the repo and Playwright dependencies and inspect actual phone/desktop screenshots. Do not create a saved-favourites system or client portal until separately requested.

## Eight interaction-heavy core previews and branch CI — November 20, 2026

The branch reaches **92 / 157 core components implemented in review** (eight new this pass, **65 drafts remain**). Optional mobile alternatives stay **44 / 44 implemented in-review**, with **20 / 20 motion patterns** still linked into their full-site templates. All remain in review; none promoted to `live`; `main` is unchanged.

| New core ID | Functional demo and truthful boundary |
|---|---|
| UI-02 | Three original illustrated tab panels, accessible tab roles, roving focus and Arrow/Home/End navigation; no fabricated portfolio imagery |
| UI-03 | Native inquiry modal with Escape, focus restoration, validated fields and a local **NOT SENT** note; no message delivery |
| UI-06 | Reserved-address clipboard control, feedback that reflects real copy success/failure, persistent status and dismissible toast with corrected originating-control focus |
| LOC-03 | Fictional three-branch salon selector with true `aria-pressed`, updated hours and unique content; no invented real address/booking |
| LOC-04 | Arrival panel for independently documented **Toronto City Hall (100 Queen St W)**, with a working Google Maps directions URL and official City link, plus distinct travel-topic controls; conceptual diagram and demo brand explicitly unaffiliated |
| FORM-04 | Example vehicle service inquiry with actual service/date/time/email validation, browser-local future date rule and **NOT BOOKED OR SENT** local summary |
| FORM-06 | File picker checks basic PDF/JPEG/PNG file type and <=8 MB, shows filename/size only, clear/reset and **NOT UPLOADED** summary; does not read, store or send file contents |
| LEGAL-01 | Demo cookie banner with equally visible Accept/Reject, off-by-default optional analytics/marketing controls, native dialog, browser-local persistence, reopen and reset; zero tracking vendors and no compliance certification |

**Completion by affected families:** Locations **4/4**, Interface **4/7**, Forms **5/6**, Legal **1/3**. Each new core ID includes physically created `index.html`, `styles.css`, `script.js`, responsive desktop and phone compositions, its own review metadata, correct section-level focus anchor and no new unreviewed photo asset. LEGAL-01 required adding the `legal:'section'` validator mapping.

**Important QA improvement:** New `.github/workflows/component-showroom-qa.yml` triggers on pushes to `feature/component-showroom`, relevant pull requests and manual dispatch. It installs dependencies, validates/builds the complete showroom, executes the existing Chromium regression suite, and retains artifacts in `components/component-browser-evidence/`. Eight new browser scenarios assert real controls, focus, honest non-submission and 320px width. Connector-based source audits passed JS parse, balanced CSS braces, unique HTML IDs, intact local anchors, photo-alt checks and catalogue consistency. The full source browser regression script parses. **No successful GitHub Actions run or actual Chrome browser pass has yet been confirmed**; the connector currently exposes no check statuses and its workflow-run query is limited to pull request events. Do not infer passed CI from the committed workflow.

**Next priorities:** inspect the newly enabled CI run via GitHub Actions or the associated PR and address any real failures before promotion; then implement UI-04/05/07, FORM-05, LEGAL-02/03, and remaining conversion/legal components. Preserve exact asset rights checks and reviewer-only publication.
