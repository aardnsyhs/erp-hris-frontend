# Lajur

Lajur is the HRIS and ERP frontend for employee records, department structure, positions, attendance, leave requests, employment contracts, and payroll. It supports English and Indonesian. English is the default language; workspace pages follow the NEXT_LOCALE cookie.

## Development

```sh
npm install
npm run dev
```

Use `npm run test:i18n` for translation, currency, public metadata, and routing checks. Use `npm run build` followed by `npm start` for a production instance.

The backend proxy uses `BACKEND_API_URL` (default `http://localhost:3000`) and exposes `/api/v1`. The browser API client uses `NEXT_PUBLIC_API_URL`, normally `/api/v1`. Keep the frontend and backend on different local ports.

## Brand

The approved name is **Lajur**. The name and production origin are defined in `lib/site.ts`. The connected L paths represent the employee and operational records managed in one workspace. The mark uses the application's existing brown accent and follows its theme colors in the interface.

`public/brand-mark.svg` is the vector master. `components/shared/brand-mark.tsx` renders the same geometry in the interface. `app/favicon.ico` contains a 32px version; `public/apple-touch-icon.png` contains a 180px version. The `/share/en` and `/share/id` routes render localized social images.

## Public pages and SEO

- English: `https://hris.ardiansyah.app/about`
- Indonesian: `https://hris.ardiansyah.app/id/about`
- Sitemap: `https://hris.ardiansyah.app/sitemap.xml`
- Crawler rules: `https://hris.ardiansyah.app/robots.txt`

The product pages render text on the server and are available without login. Their URL determines the page language, including the HTML language, rather than a visitor's language cookie. They use canonical URLs, reciprocal language alternatives, and Open Graph/Twitter metadata. The root remains the existing authenticated dashboard. Login and workspace pages receive noindex metadata and an X-Robots-Tag response header.

The default production origin is `https://hris.ardiansyah.app`. To override it, set `SITE_URL` to an HTTPS origin without a path, query, credentials, or fragment. Invalid configuration disables public indexing and yields an empty sitemap. Development mode also disables indexing.

Optional environment variables:

```dotenv
SITE_URL=https://hris.ardiansyah.app
GOOGLE_SITE_VERIFICATION=
```

GOOGLE_SITE_VERIFICATION takes the token from Google's HTML-tag verification method, rather than the entire meta tag. A Search Console domain property verified through DNS does not need this variable.

After deploying the production build:

1. Confirm both public pages return HTTP 200 without a login cookie, contain the expected canonical and language links, and have index metadata.
2. Confirm robots.txt allows crawling and points to the production sitemap. Confirm the sitemap lists only the two public product pages.
3. Verify ownership of hris.ardiansyah.app in Google Search Console and submit `https://hris.ardiansyah.app/sitemap.xml`.
4. Inspect the public URLs in Search Console and request indexing. Monitor the Page Indexing report.

These changes make the public pages eligible for crawling; Google decides whether and when to index them. Deployment and Search Console submission are separate from editing this repository. See [Google's technical requirements](https://developers.google.com/search/docs/essentials/technical) and [sitemap submission instructions](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
