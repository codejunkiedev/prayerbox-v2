#!/usr/bin/env bash
# Verifies the display lockdown (migrations 20260909000001 / 20260909000002)
# against a live project, using only the publishable (anon) key — i.e. exactly
# what an attacker holding the shipped key can do.
#
#   PHASE=a ./verify-anon-lockdown.sh   after pushing phase A: the new read path
#                                       works and the old one is untouched
#   PHASE=b ./verify-anon-lockdown.sh   after pushing phase B: the old path is
#                                       gone and the new one still works
#
#   SCREEN_CODE=<real code>             needed to exercise the functions
#   SUPABASE_URL / SUPABASE_ANON_KEY    default to the production project
set -u
URL="${SUPABASE_URL:-https://epwbvhpdzraxhvltzvfw.supabase.co}"
KEY="${SUPABASE_ANON_KEY:-sb_publishable_jZF0usi1-g3fbGMZtIxzIQ_Q1Q_82zq}"
PHASE="${PHASE:-b}"
CODE="${SCREEN_CODE:-}"
H=(-H "apikey: $KEY" -H "Authorization: Bearer $KEY")
pass=0; fail=0
ok()   { echo "  PASS  $1"; pass=$((pass+1)); }
bad()  { echo "  FAIL  $1"; fail=$((fail+1)); }
skip() { echo "  SKIP  $1"; }

closed() { case "$1" in "[]"|*"permission denied"*) return 0 ;; *) return 1 ;; esac; }

rpc() {
  curl -s -X POST "${H[@]}" -H "Content-Type: application/json" \
    -d "{\"p_code\":\"$1\"}" "$URL/rest/v1/rpc/$2"
}

echo "=== The new read path (added by phase A) ==="
if [ -z "$CODE" ]; then
  skip "set SCREEN_CODE=<a real screen code> to exercise the functions"
else
  [ "$(rpc "$CODE" verify_screen_code)" = "true" ] \
    && ok "verify_screen_code accepts a real code" \
    || bad "verify_screen_code rejected a real code"
  [ "$(rpc zzzzzzz verify_screen_code)" = "false" ] \
    && ok "verify_screen_code rejects a bogus code" \
    || bad "verify_screen_code accepted a bogus code"
  for fn in get_display_session get_display_prayer_settings get_display_payload; do
    if rpc "$CODE" "$fn" | python3 -c '
import sys, json
d = json.load(sys.stdin)
assert isinstance(d, dict) and d, d
print("        " + ", ".join(
    "%s=%s" % (k, "set" if d[k] not in (None, [], {}) else "empty") for k in d))
' 2>/dev/null; then ok "$fn returned a payload"; else bad "$fn returned nothing usable"; fi
    [ "$(rpc zzzzzzz "$fn")" = "null" ] \
      && ok "$fn returns null for a bogus code" \
      || bad "$fn leaked something on a bogus code"
  done
fi

echo
if [ "$PHASE" = "a" ]; then
  echo "=== The old read path (phase A must NOT have touched it) ==="
  r=$(curl -s "${H[@]}" "$URL/rest/v1/display_screens?select=id&limit=1")
  closed "$r" && bad "display_screens already closed — phase B applied early?" \
               || ok "display_screens still readable, as phase A intends"
  echo
  echo "$pass passed, $fail failed  (phase A: additive only)"
  exit $((fail > 0))
fi

echo "=== AC1: screen codes cannot be listed or enumerated ==="
r=$(curl -s "${H[@]}" "$URL/rest/v1/display_screens?select=code" | head -c 200)
closed "$r" && ok "display_screens returns no rows" || bad "display_screens still readable: $r"
if [ -n "$CODE" ]; then
  r=$(curl -s "${H[@]}" "$URL/rest/v1/display_screens?select=id&code=eq.$CODE" | head -c 200)
  closed "$r" && ok "filtering by a KNOWN-GOOD code returns nothing" \
               || bad "a known-good code is still resolvable through the table: $r"
else
  skip "set SCREEN_CODE to prove the code predicate is dead, not just the projection"
fi

echo
echo "=== AC2: anon cannot retrieve content it did not request by code ==="
for t in announcements events posts youtube_videos ayat_and_hadith \
         masjid_profiles settings prayer_times screen_content; do
  r=$(curl -s "${H[@]}" "$URL/rest/v1/$t?select=id&limit=5" | head -c 200)
  closed "$r" && ok "$t closed to anon" || bad "$t still readable: $r"
done
for b in masjid-posts user-backgrounds masjid-logos ayat-hadith-slides assets; do
  n=$(curl -s -X POST "${H[@]}" -H "Content-Type: application/json" \
        -d '{"prefix":"","limit":5}' "$URL/storage/v1/object/list/$b" \
      | python3 -c 'import sys,json
try:
  d = json.load(sys.stdin); print(len(d) if isinstance(d, list) else 0)
except Exception: print(0)')
  [ "$n" = "0" ] && ok "storage bucket $b not listable" \
                 || bad "storage bucket $b listed $n objects"
done

echo
echo "=== AC3: the display still renders (public buckets bypass RLS) ==="
if [ -z "$CODE" ]; then
  skip "set SCREEN_CODE to fetch a real image out of the display payload"
else
  # Pull an image the screen actually renders, then fetch it with no key at all.
  img=$(rpc "$CODE" get_display_payload | python3 -c '
import sys, json
d = json.load(sys.stdin) or {}
for row in (d.get("content") or {}).values():
    for k in ("image_url", "logo_url"):
        if row.get(k):
            print(row[k]); raise SystemExit
print((d.get("masjid_profile") or {}).get("logo_url") or "")
')
  if [ -z "$img" ]; then
    skip "this screen renders no stored images — nothing to fetch"
  else
    r=$(curl -s -o /dev/null -w "%{http_code}" "$img")
    [ "$r" = "200" ] && ok "a rendered image still serves with no key at all" \
                     || bad "image the display renders returned HTTP $r ($img)"
  fi
fi

echo
echo "$pass passed, $fail failed"
exit $((fail > 0))
