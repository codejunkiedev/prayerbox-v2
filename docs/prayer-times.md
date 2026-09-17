# Prayer times

Base times come from the **Al-Adhan API** (`api/aladhan.ts`, no key). There is no calculation library in this repo, and **no times are stored in Postgres** — only adjustments. Any plan to compute times server-side would mean either materializing Al-Adhan months per masjid or reimplementing the solar math for all 23 methods.

Configuration splits across `settings` (how times are computed) and `prayer_times` (how they are displayed), one row each per masjid.

## Three categories per prayer

`starts`, `athan` and `iqamah` are all derived from the **same raw base time** and differ only by adjustment, so an unconfigured masjid shows all three as identical.

| Type      | Behaviour                          |
| --------- | ---------------------------------- |
| `default` | Use the base time unchanged        |
| `offset`  | Shift ±120 minutes, 1-minute steps |
| `manual`  | A fixed `HH:mm`                    |

A `manual` with no time set, or an `offset` with no offset, falls through to the base time. Everything is whole-minute, and offsets wrap silently across midnight — a large negative offset on Fajr wraps backwards the same way.

Prayers are `fajr, dhuhr, asr, maghrib, isha` plus `jumma1/2/3`, all three of which base on Dhuhr. A Jumma variant counts as active when any of its three categories is non-default; with none set, a single `jumma1` carrying the unadjusted Dhuhr time is shown. How the themes then _render_ those variants differs — see [Display runtime](./display.md#themes).

## Solar times

Four adjustments live on `settings`: `sunrise_adjustment`, `ishraq_adjustment`, `chasht_adjustment`, `sunset_adjustment`, on the same default/offset/manual model. Solar times have no athan or iqamah.

Ishraq and Chasht are **not returned by the API**:

- **Ishraq** = adjusted sunrise + 15 minutes.
- **Chasht** = the midpoint between adjusted sunrise and the API's _raw_ Dhuhr, clamped at zero so a manual sunrise past Zawal cannot push it backwards into the night.

Both chain off the _adjusted_ sunrise and then take their own adjustment on top. Dhuhr is used unadjusted there deliberately: a masjid's Dhuhr adjustment is a jamaat preference, not a solar one.

## Editing

Two modals on the Prayer Timings page.

**Adjustments** tabs by category, with an accordion of prayers — Jummas sit right after Dhuhr and note that they apply only on Fridays. The Starts tab additionally lists Sunrise, Ishraq, Chasht, Sunset in sun order.

**Calculation** covers method (Al-Adhan ids — the list lives in `constants/config.ts`, with 6 intentionally absent to match Al-Adhan's numbering), juristic school (0 Shafi / 1 Hanafi), read-only coordinates, and Hijri method (`HJCoSA` / `UAQ` / `DIYANET`) with a ±2-day offset and live preview.

New-masjid defaults: Muslim World League (3), Shafi (0), Umm al-Qura, offset 0, and **no seeded solar adjustments** — they fall back to `{ type: 'default' }` in the modal.

## Admin table vs display

The **admin table** fetches the whole month and toggles between Starts / Athan / Iqamah. Sunrise, Ishraq and Chasht appear only under Starts, between Fajr and Dhuhr; **sunset is configurable but never shown there**. Today is highlighted, Fridays are tagged and fill the Jumma columns.

The **display** fetches the month, picks today's row client-side, and renders it through the selected theme with a live clock and countdowns.

## Timezone

**Everything resolves in the masjid's timezone**, not the viewer's: the countdown to the next prayer and iqamah, the on-screen clock, the midnight rollover that re-picks today's row, the Hijri date, and the prayer alerts. A screen inside the masjid is unaffected either way; anywhere else previously showed the wrong prayer at the wrong offset.

`utils/timezone.ts` does the round trip with a deliberate two-pass correction so a guess landing across a DST transition is fixed. Time strings are parsed by explicit pattern rather than `new Date()`, keeping midnight exact — `12:00 AM` and `12:00 PM` are the two cases a naive `% 12` gets wrong.

"Next prayer" scans the array **in order** and returns the first future entry. It does not wrap to tomorrow's Fajr, and it depends on callers passing a chronological array.

## Caching

A whole month is cached in `localStorage` keyed by `lat:lon:method:school:year:month`. The display hydrates from cache first — instant and offline-friendly — then refreshes. A midnight timer re-selects today's row from the cached month **with no network call**, and a month change triggers the next fetch.
