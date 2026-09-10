#!/usr/bin/env node
/**
 * Fills in masjid_profiles.timezone for rows that do not have one yet, by
 * reverse-geocoding their coordinates through Geoapify. Only touches rows whose
 * timezone is still NULL, so it is safe to re-run.
 *
 * Usage:
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<service role key> \
 *   GEOAPIFY_API_KEY=<key> \
 *   node supabase/scripts/backfill-masjid-timezones.mjs [--dry-run]
 */

const DRY_RUN = process.argv.includes('--dry-run');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

for (const [name, value] of [
  ['SUPABASE_URL', SUPABASE_URL],
  ['SUPABASE_SERVICE_ROLE_KEY', SERVICE_ROLE_KEY],
  ['GEOAPIFY_API_KEY', GEOAPIFY_API_KEY],
]) {
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const REQUEST_SPACING_MS = 250;

const restHeaders = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchProfilesMissingTimezone() {
  const url = new URL(`${SUPABASE_URL}/rest/v1/masjid_profiles`);
  url.searchParams.set('select', 'id,name,latitude,longitude');
  url.searchParams.set('timezone', 'is.null');
  url.searchParams.set('order', 'created_at.asc');

  const response = await fetch(url, { headers: restHeaders });
  if (!response.ok) {
    throw new Error(`Reading masjid_profiles failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

async function resolveTimezone(latitude, longitude) {
  const url = new URL('https://api.geoapify.com/v1/geocode/reverse');
  url.searchParams.set('lat', String(latitude));
  url.searchParams.set('lon', String(longitude));
  url.searchParams.set('apiKey', GEOAPIFY_API_KEY);
  url.searchParams.set('format', 'geojson');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geoapify returned ${response.status}: ${await response.text()}`);
  }

  const body = await response.json();
  const name = body?.features?.[0]?.properties?.timezone?.name;

  if (!name || !name.includes('/')) {
    throw new Error(`No IANA zone in the response (got ${JSON.stringify(name)})`);
  }
  return name;
}

async function writeTimezone(id, timezone) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/masjid_profiles`);
  url.searchParams.set('id', `eq.${id}`);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: { ...restHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify({ timezone }),
  });
  if (!response.ok) {
    throw new Error(`Writing timezone failed: ${response.status} ${await response.text()}`);
  }
}

const profiles = await fetchProfilesMissingTimezone();

if (profiles.length === 0) {
  console.log('Every masjid profile already has a timezone. Nothing to do.');
  process.exit(0);
}

console.log(
  `${profiles.length} profile(s) without a timezone${DRY_RUN ? ' (dry run, nothing will be written)' : ''}\n`
);

let resolved = 0;
const skipped = [];
const failed = [];

for (const profile of profiles) {
  const label = `${profile.name} (${profile.id})`;

  if (profile.latitude == null || profile.longitude == null) {
    skipped.push(`${label} — no coordinates on the profile`);
    console.log(`  skip  ${label}: no coordinates`);
    continue;
  }

  try {
    const timezone = await resolveTimezone(profile.latitude, profile.longitude);
    if (!DRY_RUN) await writeTimezone(profile.id, timezone);
    resolved += 1;
    console.log(`  ok    ${label}: ${timezone}`);
  } catch (error) {
    failed.push(`${label} — ${error.message}`);
    console.log(`  FAIL  ${label}: ${error.message}`);
  }

  await sleep(REQUEST_SPACING_MS);
}

console.log(`\n${resolved} resolved, ${skipped.length} skipped, ${failed.length} failed`);

if (skipped.length > 0) {
  console.log('\nSkipped — these masjids have no location set, so an admin has to');
  console.log('pick one in Settings → Masjid Profile before they can get a timezone:');
  for (const line of skipped) console.log(`  - ${line}`);
}

if (failed.length > 0) {
  console.log('\nFailed — safe to re-run, these rows are still NULL:');
  for (const line of failed) console.log(`  - ${line}`);
  process.exit(1);
}
