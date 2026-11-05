# go.fortworthapartmentreviews.com

One-page apartment search form served by GitHub Pages, styled to match
[FortWorthApartmentReviews.com](https://fortworthapartmentreviews.com).

## What's here

- `index.html`: the form page. The header, footer and theme are the main
  site's `/get-started/` page; every menu and footer link goes back to
  fortworthapartmentreviews.com. Below 1360px the header uses the menu
  button, since the main site's desktop menu is wider than the screen there.
- The form is the fortworthsecondchanceapartments.com form
  (`quad0028/sca-fortworth`, `/find-apartments/`): three steps, Fort Worth
  areas and neighborhoods, follow-up questions for rental and background
  answers. The consent names the Fort Worth Apartment Locators Group.
- `thank-you/index.html`: where the form lands after a send, with what
  happens next.
- `css/form.css`: the form's own styles, scoped under `.bca` so they never
  touch the main site's header and footer.
- `sca-dropdown-validation.js`, `guest-card-copy-v1.js`: copied from
  sca-fortworth unchanged. `_astro/form-area-context.js`: sca-fortworth's
  `?area=` heading, worded for this page ("Get Your Free Mansfield
  Apartment List").
- `_astro/`, `fonts/`, `images/brand/`: the main site's stylesheets, fonts,
  logo and favicon, self-hosted.
- `docs/`: the TREC Information About Brokerage Services and Consumer
  Protection Notice PDFs, linked at the bottom of the footer on every page.
- `banners/`: ad banners in the main site's colors and fonts.
- `CNAME`, `404.html` (sends to `/`), `robots.txt`.

## How the form sends a lead

1. It posts the lead as JSON to the n8n webhook `NewWeb5` (the one
   sca-fortworth uses), with `formId` `fwr-secure-form` and `formTitle`
   "Fort Worth Apartment Reviews - Get Started".
2. It sends an email copy to FormSubmit with sca-fortworth's FormSubmit key
   and the subject "Guest Card - Fort Worth Apartment Reviews Referred By:
   the Fort Worth Apartment Locators Group - Apartment Locators with Spirit
   Real Estate".
3. It goes to `/thank-you/`.

`guest-card-copy-v1.js` only acts on the sca domains it lists, so on this
domain the email copy goes straight to FormSubmit. The old form's funnel
beacon (`/formfunnel`) is not on the page.

The form and thank-you pages are `noindex, nofollow`.

## Deploying changes

GitHub Pages serves the `main` branch root. Push to `main` and the site
updates in about a minute.
