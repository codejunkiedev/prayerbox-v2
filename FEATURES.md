# PrayerBox v2 — Available Features

A detailed, feature‑by‑feature reference for the PrayerBox platform, reflecting the current codebase. This is the companion to the [README](./README.md): the README gives the overview and setup; this document explains **what every feature does, how it works, and how it is configured**.

## Table of Contents

1. [Platform Model](#1-platform-model)
2. [Authentication & Roles](#2-authentication--roles)
3. [Masjid Profile](#3-masjid-profile)
4. [Display Screens](#4-display-screens)
5. [The Display Runtime](#5-the-display-runtime)
6. [Prayer Times](#6-prayer-times)
7. [Display Themes](#7-display-themes)
8. [Content Management](#8-content-management)
   - [Announcements](#81-announcements) · [Events](#82-events) · [Posts](#83-posts) · [YouTube Videos](#84-youtube-videos)
9. [Ayat & Hadith Designer](#9-ayat--hadith-designer)
10. [Weather](#10-weather)
11. [Internationalization](#11-internationalization)
12. [Settings & Configuration](#12-settings--configuration)
13. [Realtime, Offline & PWA](#13-realtime-offline--pwa)
14. [Infrastructure & Reliability](#14-infrastructure--reliability)
15. [Reference Tables](#15-reference-tables)

---

## 1. Platform Model

PrayerBox is one React SPA serving **two audiences through two authentication realms**:

| Realm | Route space | Sign‑in | State store |
| --- | --- | --- | --- |
| **Console** | `/admin/*` | Email + password (Supabase Auth) | `auth-store` → `{ masjidId, role }` |
| **Display** | `/` and `/logout` | A per‑**screen** code | display store → `{ loggedIn, masjidProfile, displayScreen }` |

The realms are independent, so one device can be logged into both.

**Multi‑tenant.** Each masjid is a tenant. Users join a masjid through a `masjid_members` row carrying a **role** (`admin` or `moderator`). Row‑Level Security scopes every query to the caller's masjid via the SQL helpers `get_user_masjid_id()` and `get_user_role()`.

**Multi‑screen.** A masjid owns one or more **display screens**. Each screen has its own login code, orientation, theme, language, slide interval, and an independently ordered/visibility‑controlled set of assigned content. The live display reads anon‑accessible rows keyed by its screen code — it holds no Supabase session.

**Route map** (`src/constants/routes.ts`):
- Public: `/privacy`, `/terms`
- Auth: `/login`, `/register`, `/forgot-password`, `/login-with-code`
- Console: `/admin` (home), `/admin/announcements`, `/admin/events`, `/admin/posts`, `/admin/youtube-videos`, `/admin/ayat-and-hadith` (+ `/new`, `/:id/edit`), `/admin/prayer-timings`, `/admin/screens` (+ `/:id`, `/:id/customize-theme`), `/admin/settings` (+ `/profile`, `/account`), `/admin/moderators`, `/admin/support`, `/admin/reset-password`
- Display: `/`, `/logout`

Guards (`src/navigation/index.tsx`): admin routes require an email session; several are further wrapped in `<RequireAdmin>` (redirects moderators to Home) — **Screens, Screen Detail, Prayer Timings, Settings, Profile, Moderators, Support**. Content pages are open to moderators too. Display routes require a screen‑code session.

---

## 2. Authentication & Roles

### 2.1 Console auth (email/password)

Backed by Supabase Auth; helpers in `src/lib/supabase/helpers.ts`, forms via React Hook Form + Zod.

- **Sign up** (`/register`) — email, password (≥ 8), confirm, with a live password‑strength meter. On success the user is created and signed in.
- **Sign in** (`/login`) — email + password; links to forgot‑password, register, and display code login; shows the Terms/Privacy footer.
- **Forgot password** (`/forgot-password`) — sends a Supabase reset link back to `/admin/reset-password`, then shows a "check your email" state.
- **Reset password** (`/admin/reset-password`) — sets a new password, then auto‑redirects to Home after 5 s.
- **Sign out** — from the header dropdown; the auth store is cleared reactively via the Supabase `onAuthStateChange` subscription.

Auth errors that are normal user mistakes (HTTP 400/422/429 — wrong password, already registered, rate limited) are **not** reported to Sentry; other failures are.

### 2.2 Roles: admin vs moderator

Membership lives in `masjid_members` (`{ masjid_id, user_id, role, name, last_active_at }`). `role` is `admin` or `moderator`.

- **Admins** can do everything: screens, prayer config, settings, profile, moderators, plus all content.
- **Moderators** can manage **content only** — Announcements, Events, Posts, YouTube Videos, Ayat & Hadith — scoped to their masjid. They cannot reach screens, prayer config, settings, profile, or the moderators page.

This is enforced twice: client‑side (`RequireAdmin` route wrapper + role‑aware sidebar) and server‑side (RLS grants content CRUD to any member but restricts admin tables to `get_user_role() = 'admin'`).

**Admin bootstrap.** When a masjid profile is first created, a Postgres trigger (`on_masjid_profile_insert` → `handle_new_masjid_profile()`) automatically inserts an `admin` membership for the creator. The client mirrors this by setting `{ masjidId, role: 'admin' }` in the auth store. A freshly signed‑up user with no membership yet is granted a transient admin with `masjidId: null` so onboarding (creating the profile) is reachable.

**Activity tracking.** `last_active_at` is bumped on login and by triggers on any content mutation.

### 2.3 Managing moderators

Page: `/admin/moderators` (admin‑only). There is no email‑invite flow — the admin creates a full credentialed account directly. The table shows name, email, last active, and date added, with per‑row **Edit**, **Reset password**, and **Revoke** actions.

Each action calls a secure Supabase **Edge Function** (service‑role, verifies the caller is an admin of the same masjid):

| Function | Action |
| --- | --- |
| `create-moderator` | Creates the auth user (email confirmed) + a `moderator` membership; rolls back the user if the membership insert fails |
| `get-moderators` | Lists the masjid's moderators, enriched with email |
| `update-moderator` | Updates a moderator's name and/or email |
| `reset-moderator-password` | Sets a new password for a moderator |
| `revoke-moderator` | Deletes the membership and the auth user (invalidating sessions) |

Moderators sign in through the **same** `/login` page; their role simply restricts what they see and can do.

### 2.4 Display code login

`/login-with-code`: enter a screen's code → `getScreenByCode(code)` → load the masjid profile by the screen's `masjid_id` → store `{ displayScreen, masjidProfile, loggedIn: true }`. Visiting `/login-with-code?code=CODE` **auto‑signs in once** (guarded by a ref), so a device can be provisioned by URL. `/logout` clears the display session.

---

## 3. Masjid Profile

Page: `/admin/settings/profile` (admin‑only) — table `masjid_profiles`, service `masjid-profile.ts`.

**Fields:** `name`, `area`, `area_ur` (Urdu), `area_ar` (Arabic), `logo_url`, `latitude`, `longitude`. The localized areas render RTL with the correct font and feed the display's localized area label (English fallback when blank).

> The masjid login **code** no longer lives here — it moved to individual screens (see §4). `masjid_profiles.code` was dropped.

**Logo upload:** JPEG / PNG / GIF / WebP, max 5 MB, uploaded to the `masjid-logos` bucket with a live preview and remove option.

**Location picker** (map modal → Leaflet map):
- Geoapify `osm-bright` tiles; a custom teal marker.
- Click to place; "locate me" via browser geolocation (high accuracy, distinct permission/timeout messages); a coordinates readout.
- A search box (`useLocationSearch`) queries Geoapify autocomplete — debounced 400 ms, min 3 chars, cancelling in‑flight requests.
- Default center is the Islamabad/Rawalpindi region when nothing is set.

Coordinates feed prayer‑time and weather calculations everywhere.

---

## 4. Display Screens

Screens are the heart of the signage system. Table `display_screens`; service `screens.ts`; managed at `/admin/screens` (list) and `/admin/screens/:id` (detail), both admin‑only.

### 4.1 Screen fields

| Field | Values | Notes |
| --- | --- | --- |
| `name` | text | e.g. "Main Hall", "Entrance" |
| `code` | 7‑char base‑36 | Unique per‑screen **login code**, auto‑generated, read‑only, copy‑to‑clipboard |
| `orientation` | `landscape` / `portrait` / `mobile` | Drives layout and content compatibility |
| `show_prayer_times` | boolean | Toggles the prayer slide |
| `show_weather` | boolean | Toggles the weather slide |
| `theme` | `theme-1..4` | Prayer‑times theme (theme‑4 = custom) |
| `custom_theme` | JSON or null | Theme‑4 configuration |
| `language` | `en` / `ur` / `ar` | Display language |
| `slide_interval_seconds` | 5–60 (default 5) | Seconds per slide; **videos ignore it** |

Created/edited via a modal (name, orientation, language, slide interval, and the two toggles). On edit, the code is shown read‑only with a copy button and the note "Use this code to connect a display to this screen."

### 4.2 Assigning content to screens

Content is assigned through the `screen_content` join table — a polymorphic link `{ screen_id, content_id, content_type, display_order, visible }`. `content_type` is one of `announcements`, `events`, `posts`, `youtube_videos`, `ayat_and_hadith`.

- From any content list row, the **Screens** action opens the assignment modal: it lists all screens with checkboxes (pre‑checked where already assigned). Saving diffs the selection — removed screens are deleted, newly added ones are appended at each target screen's `max(display_order) + 1` with `visible: true`.
- **Posts filter by orientation:** a landscape post only offers landscape screens; a portrait post offers portrait or mobile screens, with a banner noting how many were hidden.
- Right after **creating** a content item, the assignment modal opens automatically (with a "Skip" option) so you can place it immediately.

### 4.3 Per‑screen ordering & visibility

On the screen detail page, the assigned‑content table is **drag‑reorderable** (writes contiguous `display_order`) and each row has a **visibility** switch (optimistic). Because order and visibility live on `screen_content`, the same item can sit at a different position and visibility on each screen. The detail page also hosts the per‑screen **theme picker** (and, for theme‑4, the "Customize" link).

---

## 5. The Display Runtime

Route `/` (`src/pages/app/display.tsx`) — a full‑screen Swiper slideshow driven entirely by the logged‑in screen's config.

### 5.1 Slide assembly & order

1. **Prayer times** — first, when `show_prayer_times`.
2. **Weather** — next, when `show_weather` and a forecast is available.
3. **Assigned content** — each visible `screen_content` item in `display_order`, dispatched by type to the matching slide component. Archived items are skipped.

If nothing is assigned, an "No content assigned" screen shows; if prayer settings are missing, a corresponding message shows; if the screen row is deleted, the display signs out.

### 5.2 Rotation

Swiper uses a fade crossfade (800 ms) with keyboard navigation. A timer advances every `slide_interval_seconds` (default 5 s). **YouTube slides are the exception:** the timer skips them, and the video advances the carousel itself when it ends (a looping video never advances). When **offline**, YouTube slides are filtered out entirely so the loop keeps cycling.

### 5.3 Orientation

Each slide receives the screen's orientation and branches its layout (landscape vs portrait/mobile). An **orientation‑mismatch guard** compares the physical monitor's aspect ratio against the configured orientation and, on mismatch, replaces the display with a clear message (re‑checking on resize). Reference sizes: landscape 1920×1080, portrait/mobile 1080×1920.

### 5.4 Language, wake lock

An effect sets i18n to the screen's `language`, so all slides, dates, numbers, and weather render accordingly (see §11). The runtime also acquires a **screen wake lock** to keep TVs awake, re‑acquiring it when the tab becomes visible again.

---

## 6. Prayer Times

Data source: **Al‑Adhan API** (`src/api/aladhan.ts`, no key). Config lives across two tables — `settings` (how times are computed) and `prayer_times` (per‑prayer display adjustments).

### 6.1 The three‑category adjustment model

This is the defining change from earlier versions. **Every prayer has three independently adjustable times:**

| Category | Meaning |
| --- | --- |
| **Starts** | When the prayer window begins (the raw Al‑Adhan time) |
| **Athan** | Call to prayer |
| **Iqamah** | Congregation start |

Each category is one of three types:

| Type | Behavior |
| --- | --- |
| **Default** | Use the computed time unchanged |
| **Offset** | Shift by ±120 minutes (1‑minute steps) |
| **Manual** | A fixed `HH:mm` time |

Prayers: `fajr, dhuhr, asr, maghrib, isha` plus `jumma1, jumma2, jumma3` (Friday Dhuhr variants). A Jumma variant appears only when it has a non‑default adjustment; if none are set, a single Jumma equal to Dhuhr is shown. This lets a masjid publish up to three Friday congregations.

**Editing** (Prayer Timings → "Adjustments" modal): top‑level tabs are the three categories (Starts / Athan / Iqamah); within each, an accordion of prayers with a Default/Offset/Manual control (slider for offset, time picker for manual). The Starts tab additionally exposes **Sunrise** and **Sunset**.

### 6.2 Sunrise & sunset

Sunrise and sunset show a single time each, so they live as separate `sunrise_adjustment` / `sunset_adjustment` fields on `settings` (same default/offset/manual model). They render in the theme header, separate from the prayer table.

### 6.3 Calculation settings (Hijri too)

Calculation method and juristic school now live on `settings` (moved from `prayer_times`). The **"Calculation" modal** (Prayer Timings page) has two tabs:
- **Prayer** — calculation method (23 options), juristic school (Shafi / Hanafi), and read‑only masjid coordinates (edited on the Profile page).
- **Hijri** — Hijri calculation method (HJCoSA / UAQ / DIYANET), a ±2‑day offset, and a live date preview.

Defaults for a new masjid: Muslim World League (3), Shafi (0), Umm al‑Qura, offset 0.

### 6.4 Admin table vs display

- **Admin** (`/admin/prayer-timings`) fetches the **whole month** and renders a table with a Starts/Athan/Iqamah toggle. Columns: Date, Fajr, (Sunrise on the Starts view), Dhuhr, active Jummas, Asr, Maghrib, Isha. Today is highlighted; Fridays are tagged and fill the Jumma columns.
- **Display** fetches the month, picks **today's row** client‑side, and renders it through the selected theme with a live clock, next‑prayer / next‑Iqamah countdowns, sunrise/sunset, and Gregorian + Hijri dates. Times are shown in 12‑hour format.

### 6.5 Caching & resilience

The full month is cached in `localStorage` keyed by `lat:lon:method:school:year:month`. The display hydrates from cache first (instant, offline‑friendly), then refreshes; a **midnight timer** re‑selects today's row from the cached month **without a network call**, and a month change triggers the next fetch. A realtime channel on `settings` + `prayer_times` refreshes live on config changes.

### 6.6 Hijri date

`useAdjustedHijriDate` calls Al‑Adhan's `gToH` endpoint for `today + offset` days using the configured method, formatted (and localized) for display, with the offset applied to the Gregorian date before conversion (to align with local moon‑sighting).

---

## 7. Display Themes

Four prayer‑time themes, chosen **per screen**. All receive the same processed timings, dates, sunrise/sunset, and clock.

| Theme | Style |
| --- | --- |
| **Theme 1** | Decorative image‑card layout; large seven‑segment digital times, gold header clock; two columns (landscape) or a single alternating column (portrait) |
| **Theme 2** | Image‑card layout with different art and fonts; a 2×3 grid beside a tall side clock (landscape), single column (portrait) |
| **Theme 3** | Clean flat **table** — Prayer / Starts / Athan / Iqamah columns, emerald header, zebra rows, highlighted next‑Iqamah row, and a "Next Iqamah" countdown card |
| **Theme 4** | **Custom** — reuses Theme 3's layout but every visual aspect is configurable |

Themes 1–2 map prayers to bundled card art (all three Jummas share one card); Themes 3–4 use no card art.

### 7.1 The custom theme (Theme 4) editor

Route `/admin/screens/:id/customize-theme`. The editor changes appearance and element visibility only — never positioning — with a live, language‑switchable preview beside the controls. Configuration (`display_screens.custom_theme`, JSON):

- **Background** — image (library or your own upload), solid color, or gradient (from/to/angle).
- **Overlay** — toggle, color, and opacity.
- **Fonts** — per language (English / Arabic / Urdu), chosen from curated font sets.
- **Text size** — an overall scale plus per‑group multipliers for **header, names, times, countdown, date** (0.5×–3×). Sizes emit in container‑query units so the theme scales identically full‑screen and in the small preview.
- **Colors** — a global color plus optional per‑group overrides (null = inherit global).
- **Visibility** — show/hide the Starts / Athan / Iqamah columns (at least one must stay on), sunrise/sunset, next‑Iqamah card, Hijri date, Gregorian date, and clock. The prayer‑name column is always shown; hidden columns reflow cleanly.

Save writes the config to the screen; Reset restores defaults.

---

## 8. Content Management

All content types share a pattern: a list page with create/edit modal, soft‑delete (archive), and per‑screen assignment. **Ordering and visibility are per‑screen** (`screen_content`), not properties of the item — the same item can appear differently on each screen. Every item carries only `archived` for lifecycle. Deleting sets `archived: true` and removes all its screen assignments.

### 8.1 Announcements

A single **description** field (required). Simplest type; renders one announcement per slide.

### 8.2 Events

Fields: `title`, `description`, `date_time` (timestamptz), `end_time` (timestamptz, optional), `location`, `chief_guest`, `host` (optional), `qari`, `naat_khawn`, `karm_farma` — all required except host and end time. The modal has "Basic Information" and "Participants" sections. These are Islamic‑event roles (chief guest, host, qari/reciter, naat reciter, patron).

**Times are the masjid's, not the viewer's.** Start and end are stored as absolute instants and rendered in `masjid_profiles.timezone` on every surface, so an 8pm Karachi event reads as 8pm to an admin in London and on a phone anywhere. The modal collects wall‑clock times in that same zone and labels which one it is using. Where a masjid has no timezone set the formatters fall back to the viewing device's, which is how the product behaved before the column existed.

**Prayer times follow the same clock.** The prayer strings the API returns are the masjid's wall clock, so the countdown to the next prayer/iqamah, the displayed clock, the midnight rollover that re-picks today's row, the Hijri date and the prayer alert all resolve against `masjid_profiles.timezone` rather than the viewing device's. A screen inside the masjid is unaffected; anywhere else previously showed the wrong prayer at the wrong offset.

**Upcoming vs past.** An event is upcoming until its `end_time`, or until `date_time` + 2 hours where no end time is set (`DEFAULT_EVENT_DURATION_MINUTES`). The database materialises this into `events.ends_at`, a stored generated column indexed by `idx_events_upcoming`, so the admin console's Upcoming / Past / All tabs filter server‑side. Finished events stop being sent to screens: `get_display_payload` excludes them, and the display re‑checks the cut‑off on a minute tick so an event also disappears between payload refetches.

### 8.3 Posts

A **title** plus one **image**, in **landscape or portrait** (`orientation`, chosen at creation and immutable). On the display a post is a full‑screen image.

- **Two sources** (new landscape posts): a **predesigned template** (from the `assets/predesigned-posts` folder) or your **own upload**. Portrait posts go straight to upload (the predesigned library is 16:9).
- **Auto‑resize, not rejection** (the key change): images are validated for **aspect ratio only** (16:9 landscape / 9:16 portrait, ±5% tolerance). Any resolution is accepted — the image is **center‑cropped to the exact ratio and downscaled** to fit the target box (up to 1920×1080 / 1080×1920, max 3840×2160 / 2160×3840), re‑encoded as JPEG with quality stepped down to stay under 5 MB. Formats: JPEG / PNG / GIF / WebP.
- Uploaded images go to the `masjid-posts` bucket.

### 8.4 YouTube Videos

Fields: `title`, `youtube_url` (validated against watch / embed / shorts / youtu.be URL forms), `loop_video`. On the display the video plays via the **YouTube IFrame Player API** using a privacy‑enhanced (no‑cookie) embed, autoplay, no controls/branding. A non‑looping video advances the slideshow when it ends; a looping video restarts and holds the slide. The player is created only for the active slide (no background audio). Requires network — videos are omitted when offline.

---

## 9. Ayat & Hadith Designer

A full visual slide builder. List at `/admin/ayat-and-hadith`; designer at `/admin/ayat-and-hadith/new` and `/:id/edit`. Table `ayat_and_hadith`; rendered images in the `ayat-hadith-slides` bucket.

### 9.1 Sourcing content

Orientation (landscape/portrait) is chosen up front. The **Content** panel toggles between Ayat and Hadith:

- **Ayat** — pick a Surah (full 114‑surah list) and Ayah; optionally enable Urdu and/or English translations, each with a selectable edition. Verses come from **AlQuran.cloud** (`/ayah/{surah}:{ayah}/editions/…`, Arabic edition `quran-uthmani`).
- **Hadith** — pick a book (Bukhari, Muslim, Tirmidhi, Abu Dawood, Nasai, Ibn Majah) and hadith number, or **search by keyword** (with language + book filters, paginated) via **hadithapi.com** (`/hadiths`, requires `VITE_HADITH_API_KEY`). Urdu/English toggles included.

The chosen text (Arabic + optional translations + a generated reference) is fetched (debounced, abortable) and stored as `cached_text` so the slide can be re‑opened and edited later.

### 9.2 The canvas editor

A live canvas (true‑size, CSS‑scaled to fit) with a **layer system**: overlay, Arabic, Urdu, English, and reference. Each text layer is independently configured in the **Design** panel:
- Font (per‑script sets — Arabic: Amiri / Scheherazade / Reem Kufi; Urdu: Noto Nastaliq / Gulzar; English: Inter / Playfair / Merriweather), size, color, line height, and alignment. The reference layer has separate Arabic and English fonts.
- **Free positioning** — drag/resize each layer (react‑moveable, with snapping and clamping). Positions are stored as percentage boxes (`x/y/width/height`) so they scale across orientations.
- **Background** — image (curated library or your own upload), solid color, or gradient, plus a draggable semi‑transparent overlay box.

### 9.3 Rendering & display

On save, selection outlines are hidden and the canvas is **snapshotted to a PNG** (`html-to-image`, after fonts load), uploaded to `ayat-hadith-slides`, and the row stores `image_url` + `image_path` alongside the source and style. On the display the slide is simply the **pre‑rendered image** — the display never re‑renders the text/layers (style/cached_text exist only to re‑edit).

---

## 10. Weather

Source: **OpenWeather** 5‑day / 3‑hour forecast (metric), keyed by `VITE_OPEN_WEATHER_API_KEY`. Appears only on the display when `show_weather` is on and a forecast is available.

Parsing reduces the feed to **current conditions** (nearest slot) plus **daily entries** (skipping today, preferring the noon sample, tracking daily min/max), capped at 7 days; wind is converted to km/h. The slide shows the current icon, temperature, "feels like", description, humidity and wind, and a multi‑day forecast row.

Visuals are condition‑aware: icons and backgrounds map OpenWeather condition IDs and day/night to bundled assets. Condition **names are localized by stable condition ID** (not OpenWeather's patchy `lang` output) with a fallback to the API description. The forecast auto‑refreshes every **30 minutes**, hydrates from a `localStorage` cache first, and keeps the last good data on failure.

---

## 11. Internationalization

Display screens render in **English, Urdu, or Arabic** (per‑screen `language`). Setup: i18next + react‑i18next with `en`/`ur`/`ar` locales.

- **Direction** — LTR for English, **RTL for Urdu/Arabic**, applied to layout containers; times/numbers are forced LTR with **Latin digits** for legibility.
- **Fonts** — Urdu and Arabic map to dedicated script fonts.
- **Localized content** — prayer labels/columns, weather labels, and weather condition names are keyed translations; the masjid **area** name uses `area_ur`/`area_ar` (English fallback).
- **Scope** — today the translated surfaces are the display screens (weather slide + Themes 3/4). Admin/auth screens are English‑only; new display strings must be added to all three locale files.

The console's own dark/light/system appearance is a separate, unrelated setting (header theme toggle).

---

## 12. Settings & Configuration

Two distinct notions of "settings":

**(A) The `settings` table** — per‑masjid computation config: calculation method, juristic school, Hijri method + offset, and sunrise/sunset adjustments. Edited from the **Prayer Timings** page's two modals (not the Settings pages). The theme moved to per‑screen, and the old module list was removed (content ordering/visibility is now per‑screen).

**(B) The Settings pages** (`/admin/settings`) — a small admin hub with two entries:
- **Profile** — the masjid profile (§3).
- **Account** — change email (confirmation link) and update password (re‑verified against the current password, with a strength meter).

---

## 13. Realtime, Offline & PWA

**Realtime.** The display subscribes to a Supabase `postgres_changes` channel covering the screen, its content assignments, settings, profile, and all content tables (debounced 250 ms). Any console edit bumps a refresh key and re‑pulls data — live screens update without a reload. Prayer times have their own channel on `settings` + `prayer_times`.

**Offline / PWA.** The service worker is registered **only on display routes** (`/`, `/logout`, `/login-with-code`) and proactively unregistered elsewhere, keeping the console always‑fresh. It precaches build assets and uses runtime caching (CacheFirst for Supabase storage; NetworkFirst for Al‑Adhan and OpenWeather; cached fonts). On top, three versioned `localStorage` caches hold parsed app data:
- **Display content** (per screen) — renders instantly and offline.
- **Prayer times** (a full month per location/method) — survives offline and midnight/month rollovers.
- **Weather** (per location/language) — hydrates before the network resolves.

The display also acquires a **wake lock** to keep TVs awake and detects online/offline to drop YouTube slides when disconnected. The app is an installable PWA ("Prayer Box", standalone, 30‑minute update checks).

---

## 14. Infrastructure & Reliability

- **Error monitoring** — Sentry (`initSentry`) with tracing and session replay on errors; typed capture helpers tag Supabase/PostgREST/Auth/Storage/Functions and external‑API errors (Geoapify / OpenWeather / Al‑Adhan / Quran / Hadith); AbortErrors and expected auth errors are ignored. Source maps upload at build time when Sentry build vars are set.
- **Error boundary** — a top‑level class boundary shows a recovery card (Refresh / Go Back) and reports to Sentry.
- **Console theming** — `ThemeProvider` toggles dark/light/system on the document (with a View‑Transitions radial reveal), persisted to `prayerbox-ui-theme`.
- **Layout & nav** — a collapsible desktop sidebar (persisted) and mobile drawer; role‑ and onboarding‑aware nav items: Home + content items for everyone; Screens, Prayer Timings, Settings, Moderators, Support for admins.
- **Legal & support** — public Privacy Policy (`/privacy`) and Terms (`/terms`) pages, linked from the auth screens; a Support page (`/admin/support`) embedding a prefilled Google Form.
- **Build** — `@vitejs/plugin-legacy` (`chrome >= 49`, `android >= 5`, not IE 11), `es2015` target, Terser; `@` → `./src` alias.

---

## 15. Reference Tables

### Calculation Methods

Prayer‑time methods (`src/constants/config.ts`, value = Al‑Adhan method id): 0 Shia Ithna‑Ashari, 1 Karachi, 2 ISNA, **3 Muslim World League (default)**, 4 Umm al‑Qura, 5 Egyptian, 7 Tehran, 8 Gulf Region, 9 Kuwait, 10 Qatar, 11 Singapore, 12 France, 13 Turkey (Diyanet), 14 Russia, 15 Moonsighting Committee, 16 Dubai, 17 Malaysia (JAKIM), 18 Tunisia, 19 Algeria, 20 Indonesia (KEMENAG), 21 Morocco, 22 Lisbon, 23 Jordan. *(6 is intentionally absent, matching Al‑Adhan's numbering.)*

### Juristic Schools

| ID | School | Effect |
| --- | --- | --- |
| 0 | Shafi *(default)* | Standard Asr (also Maliki/Hanbali) |
| 1 | Hanafi | Later Asr |

### Hijri Methods

`HJCoSA` (High Judicial Council of Saudi Arabia), `UAQ` (Umm al‑Qura, default), `DIYANET`.

### Screen Enums

- **Orientation:** `landscape`, `portrait`, `mobile`
- **Theme:** `theme-1`, `theme-2`, `theme-3`, `theme-4` (custom)
- **Language:** `en`, `ur`, `ar`
- **Slide interval:** 5–60 s (default 5)
- **Content types:** `announcements`, `events`, `posts`, `youtube_videos`, `ayat_and_hadith`

### Database Tables

| Table | Purpose |
| --- | --- |
| `masjid_profiles` | Name, area (+ ur/ar), logo, coordinates |
| `masjid_members` | User↔masjid membership + role |
| `display_screens` | Per‑screen code, orientation, theme, custom theme, language, interval, toggles |
| `screen_content` | Content→screen assignment with per‑screen order + visibility |
| `announcements`, `events`, `posts`, `youtube_videos`, `ayat_and_hadith` | Content items (`archived`) |
| `prayer_times` | Per‑prayer adjustments (starts / athan / iqamah) |
| `settings` | Calculation method, juristic school, Hijri method + offset, sunrise/sunset adjustments |

### Storage Buckets

| Bucket | Contents |
| --- | --- |
| `masjid-logos` | Masjid logos |
| `masjid-posts` | Uploaded post images |
| `ayat-hadith-slides` | Rendered Ayat & Hadith designs |
| `user-backgrounds` | Per‑masjid uploaded backgrounds |
| `assets` | Curated `predesigned-posts` and `ayat-hadith-backgrounds` folders |

### External APIs

| API | Used for | Key |
| --- | --- | --- |
| Al‑Adhan | Prayer times + Hijri conversion | None |
| OpenWeather | 5‑day / 3‑hour forecast | `VITE_OPEN_WEATHER_API_KEY` |
| Geoapify | Location autocomplete + map tiles | `VITE_GEOAPIFY_API_KEY` |
| AlQuran.cloud | Quran verses + translations | None |
| hadithapi.com | Hadith fetch + keyword search | `VITE_HADITH_API_KEY` |

### Image Rules

| Rule | Value |
| --- | --- |
| Accepted types | JPEG, PNG, GIF, WebP |
| Max stored size | 5 MB (auto‑compressed) |
| Post/background aspect | 16:9 (landscape) or 9:16 (portrait), ±5% |
| Handling | Auto center‑crop + downscale (never rejected for size) |
