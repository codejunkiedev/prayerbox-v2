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
