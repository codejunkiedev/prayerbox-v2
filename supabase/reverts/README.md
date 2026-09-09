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
