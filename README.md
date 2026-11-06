# PILOT Library

**Products catalogue on mobile apps for iOS & Android** — a web/PWA storefront for
aviation merchandise (apparel, bags, flight accessories, souvenirs) whose product
data and photography live in a **Google Drive** folder and are exposed through a
small **catalogue API**.

- Design reference: `image-1.png` (UGMonk-style catalogue layout — full-bleed
  category banner, centred underlined tabs, 4-up grid of studio tiles)
- Logo: `image-2.png` → extracted to transparent PNG lockups in `public/assets/`
- Hero cover: `image-3.png` → `public/hero/cover.jpg`
- Product photos: Google Drive folder **Pilot-library** (`1lda7ww3UybIHobPLm6ZecWaJr4jepiCH`)

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Regenerate the image assets (tiles, icons, hero, OG image):

```bash
pip install pillow numpy
npm run images
```

## Operations console (back office) — separate frontend

```bash
cd admin && npm install
npm run dev          # http://localhost:3001 — mobile-first ops console
```

- Separate Next.js app in `admin/` (deploy as its own project, e.g. Vercel root dir `admin`)
- Login with `ADMIN_PASSCODE`; edit price / stock / status per SKU from a phone
- **Google Sheets inside the Drive folder is the shared database**
  (`slug|name|price|stock|status|category|updated_at`); the storefront reads it
  automatically (60s cache) and hides `hidden` SKUs without a redeploy
- Without credentials the console runs in demo mode against the public catalogue API
- Architecture, Google setup steps and runbook (Thai): **[docs/ADMIN-SYSTEM.md](docs/ADMIN-SYSTEM.md)**

## Mobile apps (iOS & Android) + phone demo

```bash
npm run build:mobile     # static export of the app → out/
npm run mobile:sync      # export + copy into the native shells
npm run mobile:ios       # Xcode  (macOS)
npm run mobile:android   # Android Studio
npm run mobile:assets    # regenerate icon + splash sets from the logo
npm run demo:qr          # QR code for the /demo page
```

Step-by-step (Thai): **[docs/MOBILE-BUILD.md](docs/MOBILE-BUILD.md)**

- Native shells live in `ios/` (SPM, no CocoaPods needed) and `android/`
  (Gradle), package id `com.pilotlibrary.catalogue`.
- The app bundles the whole catalogue and its imagery, so it opens offline; it
  can refresh photos from the Drive-backed API via `NEXT_PUBLIC_CATALOG_API`.
- Installed app (PWA or native) gets a 5-tab bottom bar and native status bar,
  splash screen, haptics and an Android hardware-back handler (`lib/native.ts`).
- `/demo` shows a scannable QR + install steps for iOS and Android.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Reference layout: hero banner, category tabs, full catalogue grid |
| `/shop?c=apparel\|bags\|accessories\|souvenirs` | Category listing with sort |
| `/product/[slug]` | Product detail — gallery, colours, sizes, inquiry bag, Drive source link |
| `/inquiry` | “Bag” — list of chosen items, one-tap LINE / call hand-off |
| `/search` | Client-side instant search |
| `/journal` | Brand story + **how the Drive connection works** |
| `/manifest.webmanifest` | PWA manifest (installable on iOS & Android) |

## Catalogue API

```
GET /api/products                  → full catalogue (filter: ?category=&q=)
GET /api/products/{slug}           → one product + related items
GET /api/drive/status              → Drive bridge health check
```

Responses are JSON, cacheable (`s-maxage=600`) and CORS-open so the same data can
feed native iOS/Android shells or a static site.

## Connecting Google Drive (live photos)

The site always works out of the box: imagery is pre-built into
`public/catalog/*.jpg` and metadata lives in `data/products.ts`.

To stream photos straight from the Drive folder instead:

1. Create an API key in Google Cloud Console and enable the **Google Drive API**.
2. Share the `Pilot-library` folder as *Anyone with the link — Viewer*.
3. Add a `.env.local`:

```bash
GOOGLE_DRIVE_FOLDER_ID=1lda7ww3UybIHobPLm6ZecWaJr4jepiCH
GOOGLE_DRIVE_API_KEY=your_api_key_here
NEXT_PUBLIC_SITE_URL=https://your-domain.example   # optional, for OG/sitemap
```

4. Restart. `GET /api/drive/status` should report `ok: true`; the home page
   indicator flips from *Catalogue snapshot* to *Live from Google Drive* and every
   product image resolves to `lh3.googleusercontent.com/d/<fileId>`.

`lib/drive.ts` matches Drive files by id first, then by source filename
(`driveFile` on each product), and falls back per-image, so a partially connected
folder never breaks the page.

## Project layout

```
app/                 routes (App Router) + API handlers + PWA manifest
components/          header, hero, tabs, product card, gallery, buy box, inquiry, search
data/products.ts     curated catalogue: names, prices (THB), sizes, colours, copy
lib/drive.ts         Drive bridge + catalogue merge + helpers
lib/format.ts        price / date formatting
scripts/prepare-images.py  photo pipeline (tiles, feathering, icons, hero, OG)
assets-source/       original Drive downloads + the supplied logo & cover artwork
public/              generated catalogue tiles, hero, logo lockups, icons, sw.js
```

## Media pipeline

`scripts/prepare-images.py` crops each promo photo down to the actual product,
pads it onto the warm studio background used by the reference layout, feathers the
edges so mixed sources look consistent, and writes a 1× and 2× tile (900 / 900 px)
plus gallery shots. Icons are masked-safe for Android, and a 1200×630 OG image is
generated from the cover artwork.

## Notes

- Prices are in THB. Products whose price isn’t fixed show **สอบถามราคา**
  (price on request) and are excluded from the inquiry estimate.
- The inquiry bag is client-side only (`localStorage`), no checkout or payment.
- Offline: a service worker caches the shell and catalogue imagery, so the app
  opens without a connection once installed.
