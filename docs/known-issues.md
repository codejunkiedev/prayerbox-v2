# Known issues

Live issues found while documenting the codebase, listed so nobody rediscovers them the hard way. Remove an entry when you fix it.

## Gaps

- **PWA installability is marginal** — the manifest ships only `/vite.svg` at `sizes: 'any'`, with no 192/512 or maskable icons.

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
