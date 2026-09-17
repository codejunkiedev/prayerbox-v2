# Known issues

Live issues found while documenting the codebase, listed so nobody rediscovers them the hard way. **None are fixed.** Remove an entry when you fix it.

## Bugs

- **`mobile` screens paint the wrong layout.** The orientation guard treats `mobile` as portrait, so a mobile screen demands a portrait monitor — but every layout branches on `orientation === 'portrait'`, so it then renders landscape.
- **The custom-theme editor is not admin-gated.** `/admin/screens/:id/customize-theme` sits outside `RequireAdmin` while every other screens route is inside it, so a moderator with the URL can open it.
- **Stack traces ship to production.** `error-boundary.tsx` defaults to dev-only detail, but `App.tsx` passes `showDetails={true}` unconditionally, so end users see the error string and component stack.
- **The weather noon preference never fires** at timezone offsets that aren't whole multiples of 3 hours: it compares device-local hours against UTC-aligned slots, so at UTC+5 no slot is ever exactly 12:00 and each day silently takes its first, often pre-dawn, sample. "Skip today" likewise uses the device date rather than the masjid's, unlike the rest of the display.
- **`process.env.NODE_ENV` is referenced in `components/error-boundary.tsx`** with no Vite `define` shim. `process` is undefined in the browser bundle; it survives only because the prop is always passed explicitly.

## Gaps

- **`prayer_alert_sound: 'silent'` has no UI.** The screen form hardcodes `'beep'`, so the value is reachable only by editing the database.
- **PWA installability is marginal** — the manifest ships only `/vite.svg` at `sizes: 'any'`, with no 192/512 or maskable icons.
- **Browser-target contradiction:** PostCSS targets `chrome >= 83` while the legacy plugin targets `chrome >= 49`, which undercuts the old-TV story.

## Drift

- **`types/supabase.ts` types `timezone` as `string | null`**, which the `NOT NULL` column no longer permits. Because the Supabase types are hand-written rather than generated, drift like this is invisible at compile time.
- **The comment at the top of `i18n/index.ts`** still claims only the weather slide consumes translations. All four prayer themes do.

## Dead code and config

- `tailwind.config.js` — v4 ignores it without an `@config` directive, so its `3xl`/`4xl` screens generate nothing.
- `.eslintrc.cjs` — superseded by the flat `eslint.config.js`.
- `styles/globals.css` — imported by nothing; the real stylesheet is `index.css`.
- `MODULES` in `constants/config.ts`, `ayatAndHadithSchema` and `solarAdjustmentsSchema` in `lib/zod.ts` — all referenced nowhere.
- Unused dependencies: `deps`, `@tailwindcss/vite`, `next-themes`. `tailwindcss-animate` is referenced only by the dead Tailwind config.
- `assets/i18n/locales/` — empty; the real locales are in `i18n/locales/`.
- `hooks/useImageValidation.ts` exists but is not exported from the barrel.
- A root directory literally named `--help`, left over from a mistyped command.
