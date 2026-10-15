# Sciton OMNI Demo Day: Meta campaign landing page

Landing page and thank-you page for the Sciton OMNI Demo Day Meta campaign
(Monday 2 November 2026, SkinCeuticals, 187 Wood Lane, London W12 7SA, demo slots 10am to 6pm).

- Live: `https://www.scitonlasers.uk/omni-demo-day` (thank-you page: `/omni-demo-day/thank-you`)
- Built with HTML and Tailwind CSS 3.4, styled from the OMNI Brand Guidelines and sciton.com/omnilaserhairremoval
  (plum radial gradient, ITC Avant Garde Gothic via Typekit, Playfair Display italic accents, pill buttons).

## How it sits in this repo

The Vercel project serves the `Sciton Landing Pages/` folder. The Demo Day is self-contained so it cannot affect the
Google Ads pages:

- `Sciton Landing Pages/omni-demo-day/` is the built, deployed page: `index.html`, `thank-you/index.html`,
  `favicon.png` and its own `assets/` (CSS, JS, images, video). It shares no CSS, JS, tracking or thank-you page with
  the other landing pages.
- `omni-demo-day-source/` (this folder) holds the sources and build script. It sits outside `Sciton Landing Pages/`,
  so it is never deployed.
- Every link and asset path is absolute (`/omni-demo-day/...`). The project uses `cleanUrls`, so the page is served at
  `/omni-demo-day` with no trailing slash; relative paths would resolve to the site root, and the form would land on
  the Google Ads `/thank-you` page.

## Editing

- `src/pages/index.html` and `src/pages/thank-you.html`: page markup
- `src/partials/lead-form.html`: the booking form (included twice on the landing page: hero and closing section)
- `src/input.css` and `tailwind.config.js`: brand tokens and shared components
- `../Sciton Landing Pages/omni-demo-day/assets/js/main.js` and `thank-you.js`: behaviour

```
npm install
node build.mjs
```

`node build.mjs` writes `index.html`, `thank-you/index.html` and `assets/css/styles.css` into
`../Sciton Landing Pages/omni-demo-day/`. Commit the built files. The build stamps the CSS and JS links with a
content hash (`?v=...`), so browsers never keep a stale copy; always rebuild after editing the scripts too.
Preview the whole site locally with `node serve.mjs 8233`, then open `http://localhost:8233/omni-demo-day/`.

## Before going live

1. **Lead delivery.** Each booking request is emailed to victoria.jeacock@sciton.com through FormSubmit
   (`CONFIG.endpoint` in `main.js`, AJAX endpoint `https://formsubmit.co/ajax/<email>`). `buildEmail` lays it out as a
   table: Name, Clinic, Email, Mobile number, Preferred time (the hour they would like between 10am and 6pm; Sciton
   replies to confirm the slot), Event, Form (top or bottom of the page), Source (UTMs), Submitted, Page and the
   Facebook click ID. Reply-To is the requester's email. **The first submission triggers a one-off "Activate Form" email
   from FormSubmit to the recipient; nothing is delivered until that link is clicked.** While the form is not active,
   FormSubmit returns `success: "false"` and the visitor sees an error instead of the thank-you page. To change the
   recipient, change the address in `CONFIG.endpoint` (it needs activating again); set it to `''` to stop sending.
2. **Meta Pixel.** Paste the base code where marked in the `<head>` of both pages, and fire `fbq('track', 'Lead')`
   on the thank-you page. An `omni:lead` event is also dispatched on `document` at submission. The Google Ads GTM
   container used by the other landing pages is deliberately not on these pages.
3. **Noindex.** The project's `vercel.json` already sends `X-Robots-Tag: noindex, nofollow` on every path, and both
   pages also carry a robots meta tag (`noindex, nofollow, noarchive, nosnippet, noimageindex`).

## Content sources

- Copy: the Meta plan (Sciton Laser_Open Day Meta ads, 2 Nov), Sciton's Demo Day email (problem / solution, the
  OMNI Business Advantage, Acunzo and Hennessey quotes), the OMNI brochure spreads and sciton.com/omni.
  British English throughout; US-only details (110 V, the ASPS stat) are left out.
- Imagery and video: sciton.com/omnilaserhairremoval and sciton.com/omni (device, handpieces, feature loops,
  Dianne Quibell MD testimonials, product film) and a treatment still from the Meta ad shoot, optimised to
  WebP / H.264.
- Before and afters: Sciton OMNI B&A cards (back, underarm, ear on darker skin), courtesy of Bay Area Laser Lab.
