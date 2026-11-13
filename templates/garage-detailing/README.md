# GARAGE — automotive detailing studio

Dark detailing-service template with a **usable static-site email-request preparation flow**, designed to feature the *work* rather than only glamorous vehicles.

## Customize

1. Replace the GARAGE business name, copy, service labels and genuine work photographs in `index.html`.
2. Replace `DEMO_EMAIL='hello@example.com'` inside `script.js` with a real inbox.
3. Adjust colors in `styles.css`: `--bg`, `--rust`, `--ink` (the booking area uses a brighter terracotta for accessible small text).
4. Add real, licensed process and finished-result photographs. Demo Unsplash images need network access and are **not bundled**; do not imply they depict the client's actual work.
5. Update SEO title/description, `og-card.jpg`, favicon and an absolute deployed `og:image` URL.
6. For fully functional website submissions, replace the email-draft handoff with a verified form endpoint and add spam/privacy protection. No backend exists here by design.

## Booking request behavior

The form collects name, email, vehicle, service, preferred date and optional notes. All required inputs use browser validation; choosing a service from the service list preselects it. Submitting the form **prepares a filled-in email draft preview** with links to open the email client or copy the details. No data is sent, appointment booked or success claimed. Users must still send the email from their own mail application. A visitor without an email handler can copy the text.

The mobile menu holds keyboard focus, locks background scroll and restores focus when closed with Escape. Test in real Safari before shipping.
