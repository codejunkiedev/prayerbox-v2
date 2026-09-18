# Operations

Environment, build, deployment, the hardware displays run on, and what happens when the network goes away.

## Environment variables

Vite reads per-mode env files (`.env.development`, `.env.production`).

Only the two Supabase variables are needed to build and boot — CI proves it by building with nothing else set. The rest disable individual features when absent.

```env
# Required
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

# Feature-gated — the app runs without these, with that feature degraded
VITE_GEOAPIFY_API_KEY=        # map tiles, location search, timezone lookup
VITE_OPEN_WEATHER_API_KEY=    # weather slide
VITE_HADITH_API_KEY=          # hadith fetch + search in the designer

# Optional
VITE_SENTRY_DSN=              # unset disables Sentry entirely
VITE_SENTRY_RELEASE=          # used at runtime and as the build-time release name
```

**Build-only**, read by `vite.config.ts` and never bundled: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`. All three must be set together — the same flag also gates `build.sourcemap`, so source maps are only emitted when Sentry upload is on.

**Edge Function secrets**, set with `supabase secrets set`: `PRAYER_CACHE_WARM_SECRET` authenticates calls to `warm-prayer-cache`, which refuses to run without it. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided by the platform.

**Edge Functions** read `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the Supabase dashboard, not from `.env`.

Al-Adhan and AlQuran.cloud need no key.

> ⚠️ `.env.development` and `.env.production` are currently **tracked in git** and `.gitignore` has no `.env*` rule. `SENTRY_AUTH_TOKEN` is a write-scoped build secret that does not belong in the repository, and it is in history, so deleting the files does not un-leak it. Add `.env*` to `.gitignore`, `git rm --cached` both files, rotate the Sentry token, and commit a `.env.example` instead. The `VITE_*` keys ship inside the client bundle by design, so treat them as public and rate-limit them at the provider.

## Scripts

| Command                           | Description                                         |
| --------------------------------- | --------------------------------------------------- |
| `npm run dev`                     | Vite dev server                                     |
| `npm run build`                   | `tsc -b && vite build`                              |
| `npm run preview`                 | Serve the production build                          |
| `npm run lint`                    | ESLint (flat config, `eslint.config.js`)            |
| `npm run format` / `format:check` | Prettier write / check                              |
| `npm run prepare`                 | Installs Husky hooks; runs automatically on install |

`.husky/pre-commit` runs `npx lint-staged`, which applies `eslint --fix` and `prettier --write` to staged `*.{js,jsx,ts,tsx}`. CI (`.github/workflows/ci.yml`) additionally runs `npx tsc --noEmit`. **There is no test runner and there are no test files.**

## Build

`@vitejs/plugin-legacy` targeting `['chrome >= 96', 'android >= 12']`, an `es2015` target, Terser, and core-js polyfills. PostCSS states the same floor, so both pipelines agree on the Android 12 minimum from [Display hardware](#display-hardware). `@` aliases to `./src`.

Display components size themselves in viewport and container units, with `[@media(min-width:3000px)]` and `4000px` variants for 4K panels and `100dvh` with a `100vh` fallback for embedded browsers. These are arbitrary Tailwind variants, which is why they work with no config file: Tailwind 4 is configured entirely from `src/index.css`.

## Deployment

Vercel, as a static SPA build. `vercel.json` is only a catch-all rewrite to `/`; Vercel auto-detects Vite, and deployment runs through the Git integration — CI lints, type-checks, and builds but does not deploy.

The rewrite deliberately catches `/admin/*` too, which is why `index.html` carries an inline service-worker recovery script for non-display routes.

## Offline, service worker and caches

The service worker registers only on `/`, `/logout` and `/login-with-code`, and is proactively unregistered elsewhere so the console stays fresh.

Workbox precaches build assets and adds five runtime rules:

| Rule                     | Strategy             | Limits                |
| ------------------------ | -------------------- | --------------------- |
| Supabase storage         | CacheFirst           | 200 entries / 30 days |
| Al-Adhan                 | NetworkFirst, 8 s    | 50 / 35 days          |
| OpenWeather              | NetworkFirst, 6 s    | 20 / 1 day            |
| Google Fonts stylesheets | StaleWhileRevalidate | —                     |
| Google Fonts files       | CacheFirst           | 30 / 1 year           |

Updates are checked every 30 minutes and applied immediately. A `navigateFallback` to `/index.html` denylists `/admin`, `/login`, `/register` and `/forgot-password`.

A second recovery layer sits in `index.html` as an inline pre-module script: on any non-display path it unregisters every service worker, clears all Cache Storage and reloads — which is what rescues an admin from a stale worker serving an index with dead asset hashes.

**localStorage caches**, all versioned in the key, all swallowing quota errors, none with eviction beyond that version:

| Key                                                                        | Contents                                                                                                                             |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `display_data_cache_v1:<screenId>`                                         | Per-screen render payload                                                                                                            |
| `prayer_times_month_cache_v1:<lat>:<lon>:<method>:<school>:<year>:<month>` | A full month of times                                                                                                                |
| `weather_forecast_cache_v1`                                                | **One global slot** — stores lat/lon/language and returns null on mismatch, so only one combination is cached at a time, with no TTL |

Four further keys exist outside that scheme: `display` and `auth` (Zustand), `prayerbox-ui-theme`, and `sidebarCollapsed`.

## Monitoring

**Sentry** initializes first in `main.tsx` and is a complete no-op without `VITE_SENTRY_DSN`. Traces sample at 0.1 in production and 1.0 otherwise; session replay is off except on errors, where it is **unmasked** (`maskAllText: false`, `blockAllMedia: false`) — worth knowing before putting anything sensitive on screen.

Typed capture helpers tag Supabase, PostgREST, Auth, Storage, Functions, PWA and each external API. AbortErrors are skipped inside the external-fetch helper specifically, not globally; PostgREST `PGRST116` is suppressed. `identifySentryUser` attaches id, email, masjid id and role.

There is **no analytics of any kind** and no global `unhandledrejection` handler.

**Error boundary.** One top-level class boundary showing a recovery card. Stack details render in development only; in production the error and its component stack go to Sentry rather than to the screen.

**Theming and layout.** `ThemeProvider` wraps the whole app — display and legal routes included, not just the console — persisting to `prayerbox-ui-theme`, tracking OS changes live in `system` mode, and revealing via a View Transition that is skipped under `prefers-reduced-motion`. A collapsible persisted sidebar above 768 px and a mobile drawer carry role- and onboarding-aware items. User-facing errors mostly surface through `sonner` toasts.

## Display hardware

PrayerBox runs fullscreen in a browser on a TV box. The Android version matters more than anything else, because it determines the Chrome/WebView version and therefore CSS support.

**Minimum:** Android 12+, 2 GB RAM (4 GB recommended), an Ethernet port, HDMI 1080p.

| Budget     | Android | Chipset | RAM/Storage | PKR          | USD    |
| ---------- | ------- | ------- | ----------- | ------------ | ------ |
| X96H       | 13      | H618    | 4 GB/64 GB  | 8,000–12,000 | $30–40 |
| T95 (H616) | 10–12   | H616    | 4 GB/32 GB  | 6,000–8,000  | $25–30 |
| H96 Max    | 12–13   | Various | 4 GB/32 GB  | 10,500       | $35    |

| Certified                   | OS            | RAM/Storage | PKR           | USD    |
| --------------------------- | ------------- | ----------- | ------------- | ------ |
| Xiaomi Mi Box S / TV Box S  | Google TV     | 2 GB/8 GB   | 12,000–15,000 | $50–60 |
| MECOOL KM2 Plus             | Android TV 12 | 2 GB/16 GB  | 15,000        | $88    |
| Amazon Fire TV Stick 4K Max | Fire OS       | 2 GB        | 8,000–10,000  | $35–50 |

Certified devices keep receiving Chrome/WebView updates, which matters for a display expected to run for years. Prefer a box over a stick for heat dissipation, and wired Ethernet over WiFi.

**Setup.** Install Chrome from the Play Store — the built-in browser on most boxes is too old. [Fully Kiosk Browser](https://www.fully-kiosk.com/) is worth installing on top: true fullscreen, auto-restart on crash, auto-launch on boot, and no way to navigate away by accident.

**Where to buy (Pakistan):** [Daraz.pk](https://www.daraz.pk/tag/android-tv-box-price/) · [AndroidBox.pk](https://androidbox.pk/) · [LAPTAB](https://www.laptab.com.pk/android-smart-tv-box/) · [W11Stop](https://w11stop.com/smart-tv-box-and-devices) · [OLX](https://www.olx.com.pk/items/q-android-tv-box)

**Known issues on Android 9 and below** (e.g. older X96Q): the prayer-timings screen scrolls because of a viewport-height miscalculation, `backdrop-filter: blur()` is unsupported so slides render blank, weather video backgrounds do not autoplay, and slide transitions stutter. Legacy polyfills and CSS fallbacks cover some of this, but a modern Android version is the real fix.
