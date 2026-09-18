#!/usr/bin/env node
/**
 * Copies `src/utils/prayer-engine.ts` to `supabase/functions/_shared/`.
 *
 * The Edge Function bundler only ships files under `supabase/functions/`, so the
 * engine cannot simply be imported from `src/`. It is copied instead, and
 * `--check` (wired into CI as `npm run check:engine`) fails when the copy has
 * fallen behind the original.
 *
 *   node supabase/scripts/sync-prayer-engine.mjs [--check]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = resolve(root, 'src/utils/prayer-engine.ts');
const target = resolve(root, 'supabase/functions/_shared/prayer-engine.ts');

const BANNER = `// GENERATED FILE — do not edit.
// Copied from src/utils/prayer-engine.ts by supabase/scripts/sync-prayer-engine.mjs.
// Edit the original and run \`npm run sync:engine\`.

`;

const expected = BANNER + readFileSync(source, 'utf8');
const check = process.argv.includes('--check');

let current = null;
try {
  current = readFileSync(target, 'utf8');
} catch {
  current = null;
}

if (current === expected) {
  console.log(`prayer engine copy is current (${target.replace(`${root}/`, '')})`);
  process.exit(0);
}

if (check) {
  console.error(
    `prayer engine copy is stale: ${target.replace(`${root}/`, '')} does not match ` +
      'src/utils/prayer-engine.ts. Run `npm run sync:engine` and commit the result.'
  );
  process.exit(1);
}

writeFileSync(target, expected);
console.log(`wrote ${target.replace(`${root}/`, '')}`);
