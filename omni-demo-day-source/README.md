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

1. **Lead delivery.** Each booking request is POSTed (form-encoded) to the Zapier Catch Hook in `CONFIG.endpoint` in
   `main.js` (`https://hooks.zapier.com/hooks/catch/18066862/41syo8n/`). Fields: `event`, `first_name`, `last_name`,
   `clinic_name`, `email`, `phone`, `preferred_time` (the hour they would like between 10am and 6pm; Sciton replies to
   confirm the slot), `form_location` (hero or footer), `page_url`, `submitted_at`, plus `utm_source`, `utm_medium`,
   `utm_campaign`, `utm_content`, `utm_term` and `fbclid` captured from the ad click. The Zap handles delivery to Sciton.
   The visitor only reaches the thank-you page once Zapier answers `status: "success"`; otherwise they see an error.
   Set `endpoint` to `''` to stop sending.
2. **Tracking (GTM-N37FXBXC).** Both pages load the same Google Tag Manager container as the other Sciton landing
   pages; there is no hard-coded pixel. GTM fires the Meta Pixel (1589274142845919) PageView on every page, and the
   Meta `Lead` event plus the Google Ads conversion (AW-18410112361 / Pd4XCN_b1-ccEOmK0MpE) on any URL containing
   `thank-you`, so `/omni-demo-day/thank-you` counts as a lead. On a successful submission `main.js` also pushes
   `lead_form_success` (form_id, campaign `omni-demo-day`, form_location, preferred_time) to the dataLayer and
   dispatches an `omni:lead` event on `document`.
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
