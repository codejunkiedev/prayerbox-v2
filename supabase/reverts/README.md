# Reverts

One file per migration that is worth being able to undo. They are **not**
applied automatically — the Supabase CLI is forward-only and has no `down`
step, so a revert is itself a migration.

To run one, either paste it into the project's SQL editor, or copy it into
`supabase/migrations/` under a fresh timestamp and `supabase db push`.

| Revert | Undoes | Notes |
| --- | --- | --- |
| `20260909000002_revoke_anon_display_access.revert.sql` | Phase B | Restores the anon read path while leaving phase A intact, so old and new bundles both work. Usually the only one you want. |
| `20260909000001_add_display_read_functions.revert.sql` | Phase A | Drops the read functions and the beacon. **Revert B first** — with B applied, these functions are the display's only way in. |
| `20260909000003_scope_storage_writes.revert.sql` | Storage writes | Restores the unscoped storage write policies, reopening cross-masjid image writes and the shared `assets` library. Independent of A and B. |
| `20260910000001_add_timezone_to_masjid_profiles.revert.sql` | Masjid timezone | Drops `masjid_profiles.timezone`, losing every resolved zone. Puts the product back to rendering masjid datetimes against the viewer's clock. |
| `20260910000002_events_timestamptz_and_end_time.revert.sql` | Events timestamptz | Puts `events.date_time` back to TEXT and drops `end_time`/`ends_at`, losing any end times an admin has set. Roll the web app back first. |

## The display lockdown, in order

1. Push `20260909000001` (additive; nothing breaks, both bundles work).
2. Deploy the web app and ship the TV shell update.
3. Confirm screens are on the new bundle. A refreshed `screen_heartbeats.last_seen_at`
   does NOT prove this — both bundles call `record_screen_heartbeat`. Use the
   project's API logs instead: if no anon `GET /rest/v1/<table>` requests have
   arrived for an hour or so, every live screen is reading through the RPCs.
   The service worker checks for a new build every 30 minutes and auto-reloads
   (`src/lib/pwa.ts`), so online screens self-update without intervention.
4. Push `20260909000002` (revokes the old path).

Rolling back from step 4 means running revert B and nothing else.

A screen still on the old bundle when B lands does not go blank: both display
hooks hydrate from their localStorage cache and swallow the failed fetch, so it
keeps rendering its last payload until the service worker picks up the new build.
The failure mode is stale content for up to ~30 minutes, not a dead screen.

`supabase/verify-anon-lockdown.sh` checks each phase against a live project
using only the publishable key: `PHASE=a` after step 1, `PHASE=b` after step 4.
Pass `SCREEN_CODE=<a real code>` to exercise the read functions.

## Storage writes (20260909000003)

Same ordering hazard as phase B, for the same reason: the migration requires a
client that uploads to `<masjid_id>/…`. Applied before that client is deployed,
every image upload fails — posts, logos and ayat/hadith slides alike. Reads and
existing images are unaffected either way.

1. Deploy the web app carrying the masjid-prefixed upload paths.
2. Push `20260909000003`.

Rollback is `20260909000003_*.revert.sql`, which is independent of A and B.

### Follow-up not covered by the migration

24 objects were orphaned from their database rows by the account cleanup
(13 post images, 10 slides, 1 logo). Storage is not covered by the foreign-key
cascades, so they are still stored, still billed, and still readable by public
URL. Deleting the `storage.objects` row alone leaves the underlying file behind,
so removal has to go through the storage API with the service role. Query for
them with `supabase/reverts/../../scratchpad` style joins on `image_url`, or in
the dashboard. After the migration they are unreachable by any member — their
owners were deleted — so they can only be removed with service-role access.

## Masjid timezone (20260910000001)

The migration adds the column but cannot fill it in — mapping a coordinate to an
IANA zone needs boundary data Postgres does not ship. Ordering:

1. Push `20260910000001`. Nothing changes yet: the column is NULL everywhere and
   every client falls back to the device clock, exactly as before.
2. Deploy the web app. New and edited profiles resolve their zone from the map
   pin, and opening Settings → Masjid Profile offers a derived zone for a
   profile that has none.
3. Run the backfill for everything else:

   ```
   SUPABASE_URL=https://<ref>.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=<service role key> \
   GEOAPIFY_API_KEY=<key> \
   node supabase/scripts/backfill-masjid-timezones.mjs --dry-run
   ```

   Drop `--dry-run` once the output looks right. It is safe to re-run, only ever
   touches rows that are still NULL, and reports profiles with no coordinates —
   those need an admin to set a location before they can get a zone.

Steps 1 and 2 are independent, and there is no window where anything breaks:
until a row has a zone it renders the way it does today.

Once `SELECT count(*) FROM masjid_profiles WHERE timezone IS NULL` is zero and
staying zero, the column can be tightened with `ALTER TABLE masjid_profiles
ALTER COLUMN timezone SET NOT NULL`. That is deliberately not a migration here:
pushed before the backfill it would fail, and pushed after it would still fail
for any masjid whose profile has no coordinates.

## Events timestamptz (20260910000002)

`20260910000002` refuses to run if any `events.date_time` lacks a UTC offset,
rather than reinterpreting those values in the session timezone. Every row the
app wrote is a full ISO instant, so this should not fire; if it does, the
exception names the offending value and nothing has changed.

Order against the app bundle matters on the way back, not the way out. The new
bundle sends `end_time` on every event save, so running the revert while it is
still deployed makes events unsaveable — roll the web app back first.
