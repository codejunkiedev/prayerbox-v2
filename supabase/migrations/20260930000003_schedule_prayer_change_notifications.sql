-- ============================================
-- Run notify-prayer-changes every five minutes
-- ============================================
-- Reads two Vault secrets, created by hand per project (docs/operations.md):
-- `project_url` and `prayer_changes_secret`, the latter matching the Edge
-- Function's PRAYER_CHANGES_SECRET. Until both exist the call fails and the
-- queue simply waits.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'notify-prayer-changes',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
      || '/functions/v1/notify-prayer-changes',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-notify-secret',
      (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'prayer_changes_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
