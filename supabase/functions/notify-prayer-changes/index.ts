/**
 * Tells followers when a masjid's prayer times change.
 *
 *   POST /notify-prayer-changes
 *   header: x-notify-secret: $PRAYER_CHANGES_SECRET
 *
 * Run every few minutes by pg_cron. Each run claims masjids whose last edit is
 * ten minutes old, resolves their next two weeks with the new configuration,
 * compares against `masjid_prayer_baseline` and pushes one message per masjid.
 */
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { loadTimingsConfig, resolveWindow } from '../_shared/masjid-timings.ts';
import { shiftIsoDate, todayInTimeZone } from '../_shared/aladhan.ts';
import { describeChanges, diffPrayerDays, type DayTimes } from '../_shared/prayer-changes.ts';
import { sendPushMessages } from '../_shared/expo-push.ts';

const QUIET_SECONDS = 600;
const CLAIM_LIMIT = 20;
const WINDOW_DAYS = 13;
const SOFT_DEADLINE_MS = 50_000;
const ANDROID_CHANNEL_ID = 'masjid-updates';

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const followerTokens = async (admin: SupabaseClient, masjidId: string): Promise<string[]> => {
  const { data, error } = await admin
    .from('push_devices')
    .select('expo_push_token, push_subscriptions!inner(masjid_id)')
    .eq('push_subscriptions.masjid_id', masjidId);
  if (error) throw error;

  return (data ?? []).map(row => row.expo_push_token as string);
};

const processMasjid = async (admin: SupabaseClient, masjidId: string) => {
  const config = await loadTimingsConfig(admin, masjidId);
  if (!config) {
    await admin.from('masjid_prayer_baseline').delete().eq('masjid_id', masjidId);
    return { sent: 0, changes: 0 };
  }

  const today = todayInTimeZone(config.timezone);
  const toIso = shiftIsoDate(today, WINDOW_DAYS);

  const [days, { data: baseline, error: baselineError }, { data: profile, error: profileError }] =
    await Promise.all([
      resolveWindow(admin, config, today, toIso),
      admin
        .from('masjid_prayer_baseline')
        .select('day, times')
        .eq('masjid_id', masjidId)
        .gte('day', today)
        .lte('day', toIso),
      admin.from('masjid_profiles').select('name').eq('id', masjidId).single(),
    ]);
  if (baselineError) throw baselineError;
  if (profileError) throw profileError;

  const after: DayTimes[] = days.map(row => ({ day: row.day, times: row.times }));
  const changes = diffPrayerDays((baseline ?? []) as DayTimes[], after);

  const { error: writeError } = await admin.from('masjid_prayer_baseline').upsert(
    after.map(row => ({ masjid_id: masjidId, day: row.day, times: row.times })),
    {
      onConflict: 'masjid_id,day',
    }
  );
  if (writeError) throw writeError;
  await admin.from('masjid_prayer_baseline').delete().eq('masjid_id', masjidId).lt('day', today);

  const message = describeChanges(profile.name, changes, today);
  if (!message) return { sent: 0, changes: 0 };

  const tokens = await followerTokens(admin, masjidId);
  const result = await sendPushMessages(
    tokens.map(to => ({
      to,
      ...message,
      channelId: ANDROID_CHANNEL_ID,
      data: { type: 'timings_changed', masjidId },
    }))
  );

  if (result.unregistered.length > 0) {
    await admin.from('push_devices').delete().in('expo_push_token', result.unregistered);
  }

  return { sent: result.sent, changes: changes.length };
};

Deno.serve(async req => {
  const secret = Deno.env.get('PRAYER_CHANGES_SECRET');
  if (!secret) return json({ error: 'Notify secret is not configured' }, 503);
  if (req.headers.get('x-notify-secret') !== secret) return json({ error: 'Forbidden' }, 403);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const startedAt = Date.now();
  const summary = { claimed: 0, notified: 0, sent: 0, failed: 0, requeued: 0 };

  const { data: claimed, error } = await admin.rpc('claim_prayer_changes', {
    p_quiet_seconds: QUIET_SECONDS,
    p_limit: CLAIM_LIMIT,
  });
  if (error) {
    console.error('claim_prayer_changes failed', error);
    return json({ error: 'Claim failed' }, 500);
  }

  const queue = (claimed ?? []) as { masjid_id: string; changed_at: string }[];
  summary.claimed = queue.length;

  for (const item of queue) {
    const outOfTime = Date.now() - startedAt > SOFT_DEADLINE_MS;

    try {
      if (outOfTime) throw new Error('deadline');
      const result = await processMasjid(admin, item.masjid_id);
      if (result.changes > 0) summary.notified += 1;
      summary.sent += result.sent;
    } catch (e) {
      if (!outOfTime) {
        summary.failed += 1;
        console.error(`notify-prayer-changes failed for ${item.masjid_id}`, e);
      }
      // Back on the queue with its original time, unless a newer edit already is.
      const { error: requeueError } = await admin.from('masjid_prayer_changes').upsert(
        { masjid_id: item.masjid_id, changed_at: item.changed_at },
        {
          onConflict: 'masjid_id',
          ignoreDuplicates: true,
        }
      );
      if (requeueError) console.error('requeue failed', requeueError);
      else summary.requeued += 1;
    }
  }

  return json({ ok: summary.failed === 0, ...summary });
});
