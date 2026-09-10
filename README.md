# PrayerBox v2

A mosque management and **digital‑signage platform** built with **React 19**, **TypeScript**, and **Vite 6**. Admins and moderators manage prayer times and content from a web console; any number of **display screens** — TVs, tablets, or phones around the masjid — sign in with a per‑screen code and render a full‑screen, auto‑rotating slideshow of prayer times, weather, announcements, events, posts, YouTube videos, and custom‑designed Ayat & Hadith slides.

> 📖 For an exhaustive, feature‑by‑feature breakdown of everything the platform does, see **[FEATURES.md](./FEATURES.md)**.

---

## Contents

- [Overview](#overview)
- [Feature Summary](#feature-summary)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Project Structure](#project-structure)
- [Deployment, Offline & Browser Support](#deployment-offline--browser-support)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

PrayerBox is a single React SPA with **two runtime surfaces**, each behind its own authentication realm:

| Surface | Who uses it | How they sign in | What they get |
| --- | --- | --- | --- |
| **Admin console** (`/admin/*`) | Masjid admins & moderators | Email + password (Supabase Auth) | Content management, prayer‑time config, screens, settings |
| **Display** (`/`) | TVs / tablets / phones in the masjid | A per‑**screen** code | Full‑screen auto‑rotating slideshow |

The two sessions are tracked independently, so one device can hold both at once.

**Multi‑tenant, multi‑user, multi‑screen:**

- Every masjid is a tenant. Users belong to a masjid via a membership with a **role** — **admin** (full access) or **moderator** (content only). Roles are enforced both in the UI and by Postgres Row‑Level Security.
- A masjid defines one or more **screens**. Each screen has its own login code, **orientation** (landscape / portrait / mobile), **theme**, **language** (English / Urdu / Arabic), slide interval, and its own **ordered, visibility‑controlled set of assigned content**. The same announcement can appear on several screens in a different position on each.
- Edits in the console propagate to live screens in **real time** (via Supabase Realtime), and screens keep working **offline** from a local cache.

---

## Feature Summary

### 🖥️ Display Screens
- Create any number of named screens, each with its own **7‑character login code** (deep‑link with `…/login-with-code?code=CODE` to auto‑provision a device).
- Per‑screen **orientation** (landscape / portrait / mobile), **theme** (1–4), **display language** (en / ur / ar), and **slide interval** (5–60 s).
- Toggle the prayer‑times and weather slides per screen.
- **Assign content per screen** with drag‑to‑reorder and per‑screen visibility.
- **Orientation‑mismatch guard**, screen **wake lock** (keeps TVs awake), and live **realtime refresh** when content changes.

### 🕌 Prayer Times
- Calculation via the **Al‑Adhan API** — 23 calculation methods and Shafi/Hanafi juristic schools.
- **Three adjustable times per prayer** — **Starts**, **Athan**, and **Iqamah** — each independently set to default, a ±120‑minute offset, or a manual time.
- Independent **sunrise/sunset** adjustments and up to **three Jumma** congregations.
- **Hijri date** with selectable calculation method and ±2‑day offset.
- Monthly prayer‑times table in the console; single‑day, themed layout on the display with a live clock and next‑Iqamah countdown.

### 🎨 Display Themes
- **Four prayer‑time themes**: two decorative image‑card layouts (Theme 1 & 2), a clean flat table (Theme 3), and a fully **custom theme (Theme 4)**.
- The custom theme editor lets you set the background (image / color / gradient) + overlay, per‑language fonts, overall and per‑group text scaling, global and per‑group colors, and which elements are visible — with a live, language‑switchable preview.

### 📝 Content Management
- **Announcements** — text notices.
- **Events** — title, description, date/time, location, and Islamic‑event roles (chief guest, host, qari, naat khawn, karm farma).
- **Posts** — full‑screen image slides in **landscape or portrait**; upload your own or pick a predesigned template. Images are **auto‑cropped and downscaled** to the exact frame (no manual resizing).
- **YouTube Videos** — play videos on a screen via the YouTube player, with optional looping; videos play to completion before the slideshow advances.
- **Ayat & Hadith** — a full **visual slide designer** (see below).
- Soft‑delete (archive), and per‑screen assignment for every type.

### ✨ Ayat & Hadith Designer
- Pull verses from the **Quran** (AlQuran.cloud, selectable Urdu/English translations) or **Hadith** (hadithapi.com, with keyword search across major collections).
- Drag‑and‑drop **canvas editor** with layers (Arabic / Urdu / English / reference / overlay), per‑block fonts, sizes, colors, alignment, line height, and free positioning.
- Backgrounds from a curated library, your own uploads, or a solid/gradient fill.
- Designs are **rendered to an image** and shown as pre‑rendered slides on the display.

### 🌤️ Weather
- 5‑day forecast via **OpenWeather**, reduced to current conditions + a multi‑day row.
- Condition‑aware icons and backgrounds; localized condition names; auto‑refresh every 30 minutes.

### 🌍 Internationalization
- Display screens render in **English, Urdu, or Arabic**, with full **RTL** layout and localized dates, numbers, and weather.
- Masjid area name can be localized (Urdu / Arabic) per screen.

### 👥 Roles & Team
- **Admins** manage everything; **moderators** manage only content.
- Admins create moderator accounts directly (name + credentials), reset their passwords, or revoke access — all via secure Supabase Edge Functions.

### ⚙️ Settings, Profile & Account
- **Masjid Profile** — name, area (+ Urdu/Arabic), logo upload, and GPS coordinates via an interactive **Leaflet map** with search and "locate me".
- **Prayer configuration** — calculation method, juristic school, Hijri settings, and per‑prayer adjustments.
- **Account** — change email (with confirmation) and password (re‑verified against the current one).

### 🔐 Auth, PWA & Reliability
- Admin email/password with sign‑up, sign‑in, and email password reset; password‑strength meter.
- Installable **PWA** with a service worker on the display, **offline caching** (content, prayer times, weather), and midnight rollover without a network call.
- **Sentry** error monitoring, a top‑level error boundary, dark/light/system console theming, and legal pages (Privacy / Terms).

---

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | React 19, TypeScript 5.8, Vite 6 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4, Class Variance Authority, `tailwind-merge` |
| UI primitives | Radix UI, Lucide icons, Sonner (toasts) |
| State | Zustand (persisted) |
| Forms & validation | React Hook Form, Zod |
| i18n | i18next, react‑i18next (en / ur / ar) |
| Backend | Supabase — Auth, PostgreSQL (RLS), Storage, Edge Functions, Realtime |
| Maps | Leaflet, React‑Leaflet |
| Drag & drop | dnd-kit (lists), react‑moveable (designer canvas) |
| Slide rendering | html-to-image (Ayat/Hadith snapshot) |
| Animations & carousel | Framer Motion, Swiper |
| Date/Time | date-fns |
| Monitoring | Sentry (`@sentry/react`) |
| PWA | `vite-plugin-pwa` (Workbox) |
| External APIs | Al‑Adhan (prayer times & Hijri), OpenWeather (weather), Geoapify (geocoding & tiles), AlQuran.cloud (Quran), hadithapi.com (Hadith) |
| Tooling | ESLint, Prettier, Husky + lint‑staged |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- **Node.js 18+** and **npm**
- A **Supabase** project — run the migrations in [`supabase/migrations/`](./supabase/migrations/) (Auth, the Postgres schema + RLS, storage buckets, and the moderator Edge Functions in [`supabase/functions/`](./supabase/functions/))
- API keys for **Geoapify**, **OpenWeather**, and **hadithapi.com**

### Installation

1. Clone and install:

   ```bash
   git clone <repository-url>
   cd prayerbox-v2
   npm install
   ```

2. Create the environment file (see [below](#environment-variables)).

3. Start the dev server:

   ```bash
   npm run dev
   ```

---

## Environment Variables

Config is read from Vite env files. For local development create **`.env.development`** (a `.env.production` is used for production builds):

```env
# Required — Supabase
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>

# Required — third‑party APIs
VITE_GEOAPIFY_API_KEY=<geoapify-key>       # location search + map tiles
VITE_OPEN_WEATHER_API_KEY=<openweather-key> # weather forecast
VITE_HADITH_API_KEY=<hadithapi-key>         # Hadith search/fetch in the designer

# Optional — error monitoring
VITE_SENTRY_DSN=<sentry-dsn>
VITE_SENTRY_RELEASE=<release-id>
```

**Build‑only** variables (used by `vite.config.ts` to upload source maps to Sentry; all three must be set to enable it): `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`.

**Edge Functions** (set in the Supabase dashboard, not in `.env`): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

> The Al‑Adhan and AlQuran.cloud APIs require no key.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type‑check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format the codebase with Prettier |
| `npm run format:check` | Check formatting without writing |

Pre‑commit hooks (Husky + lint‑staged) run ESLint `--fix` and Prettier on staged `*.{js,jsx,ts,tsx}` files.

---

## Architecture

**Frontend.** A single Vite SPA. `src/main.tsx` initializes i18n, Sentry, and the service worker, then renders `App`, which wraps an `ErrorBoundary` and `ThemeProvider` around `Navigation` (all routes + guards). Route paths are centralized as enums in `src/constants/routes.ts`. Two persisted Zustand stores hold identity: `auth-store` (`{ masjidId, role }` for the console) and the display store (`{ loggedIn, masjidProfile, displayScreen }` for screens).

**Backend (Supabase).** Data access is organized as domain **services** under `src/lib/supabase/services/` on top of generic **helpers** in `src/lib/supabase/helpers.ts`. Security is enforced by **Row‑Level Security**: two SQL helpers (`get_user_masjid_id()`, `get_user_role()`) scope every row to the caller's masjid, allow content CRUD for any member, and restrict admin surfaces to admins. Displays read anon‑accessible rows (no session) by screen code. Moderator lifecycle (create / update / reset password / revoke) runs through service‑role **Edge Functions** in `supabase/functions/`.

**Realtime.** The display and prayer‑times hooks subscribe to Supabase `postgres_changes` channels (debounced) so console edits refresh live screens without a reload.

**Offline / PWA.** The service worker is registered **only on display routes** (the admin app stays always‑fresh). It precaches assets and uses runtime caching for Supabase storage and the Al‑Adhan/OpenWeather APIs. On top of that, three versioned `localStorage` caches (display content, a full month of prayer times, and weather) let a screen render instantly and survive offline and midnight/month rollovers.

**External APIs** (`src/api/`, all abortable and Sentry‑instrumented): Al‑Adhan (`/calendar`, `/timings`, `/gToH`), OpenWeather (`/forecast`, metric), Geoapify (geocoding + tiles), AlQuran.cloud (`/ayah/…/editions/…`), and hadithapi.com (`/hadiths`).

For the full data flow of every feature, see **[FEATURES.md](./FEATURES.md)**.

---

## Data Model

Postgres tables (see [`supabase/migrations/`](./supabase/migrations/)):

| Table | Purpose |
| --- | --- |
| `masjid_profiles` | Name, area (+ `area_ur`/`area_ar`), logo, coordinates, IANA `timezone` |
| `masjid_members` | User↔masjid membership with `role` (admin / moderator) |
| `display_screens` | Per‑screen code, orientation, theme, custom theme, language, interval, prayer/weather toggles |
| `screen_content` | Join of content→screen with per‑screen `display_order` + `visible` |
| `announcements`, `events`, `posts`, `youtube_videos`, `ayat_and_hadith` | Content items (soft‑deleted via `archived`) |
| `prayer_times` | Per‑prayer adjustments (starts / athan / iqamah) |
| `settings` | Calculation method, juristic school, Hijri method + offset, sunrise/sunset adjustments |

Storage buckets: `masjid-logos`, `masjid-posts`, `ayat-hadith-slides` (rendered designs), `user-backgrounds` (per‑masjid uploads), and `assets` (curated `predesigned-posts` and `ayat-hadith-backgrounds` folders).

---

## Project Structure

```
src/
├── api/                # External API clients (aladhan, openweather, geoapify, quran, hadith)
├── assets/             # Images, fonts, weather icons, theme/background art & videos
├── components/
│   ├── ui/             # Base UI primitives (Button, Input, Dialog, Map, ColorInput, ...)
│   ├── common/         # Shared widgets (DataTable, BackgroundControl, ImageTile, ...)
│   ├── ayat-hadith-designer/  # Canvas, content/design panels, layers, hadith search
│   ├── display/        # Display-mode slides
│   │   ├── prayer-timings/     #   theme dispatcher + themes/ (theme-1..4)
│   │   ├── weather/ youtube-videos/ announcements/ events/ posts/ ayat-hadith/ logout/
│   │   └── shared/            #   DisplayContainer, DisplayCard, CurrentTime, ...
│   ├── settings/       # Theme + custom-theme editors, app-theme
│   ├── prayer-times/   # Admin prayer-times table & states
│   ├── home/ layout/ modals/ skeletons/
├── constants/          # Routes, config enums, quran/hadith/custom-theme/slide-design
├── helpers/            # Background & font resolution
├── hooks/              # Prayer/weather/display data, realtime, wake lock, online status, ...
├── i18n/               # i18next setup, formatters, weather-condition keys, locales
├── lib/
│   ├── supabase/       # Client, helpers, realtime, per-entity services
│   ├── sentry.ts  pwa.ts
│   └── ...
├── navigation/         # Router + auth/role guards
├── pages/
│   ├── auth/           # Login, Register, Forgot Password, Login with Code
│   ├── app/            # Admin pages, Display, screens/, settings/, designer, editor
│   └── legal/          # Privacy Policy, Terms & Conditions
├── providers/          # ThemeProvider (dark/light/system)
├── store/              # Zustand stores (auth + display)
├── types/              # Type definitions (api, supabase, common, store)
└── utils/              # date/time, weather, prayer adjustments, image resize, caches, ...

supabase/
├── migrations/         # Schema, RLS, buckets, realtime, feature migrations
└── functions/          # Edge Functions (moderator create/get/update/revoke/reset-password)
```

---

## Deployment, Offline & Browser Support

- **Deployment:** Vercel (static SPA build).
- **PWA:** installable; the service worker runs on display routes only, with offline caching and 30‑minute update checks.
- **Legacy support:** the build uses `@vitejs/plugin-legacy` targeting `chrome >= 49`, `android >= 5` (excluding IE 11), with core‑js polyfills, an `es2015` target, and Terser minification — so the display runs on older TV boxes.
- **Large screens:** display components are sized in viewport/container units with `min-width: 3000px/4000px` breakpoints for 4K panels, and use `100dvh` with a `100vh` fallback for embedded browsers.

---

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Pre‑commit hooks (Husky + lint‑staged) will lint and format your staged code automatically.

---

## License

This project is private and proprietary.
