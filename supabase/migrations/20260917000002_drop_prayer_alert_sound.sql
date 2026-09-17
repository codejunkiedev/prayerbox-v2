-- ============================================
-- The trigger set is the whole alert switch
-- ============================================
-- `prayer_alert_sound` had two values and only one of them did anything. The
-- alert is audio-only — the display sounds a beep and renders nothing — so
-- `silent` was indistinguishable from a screen with no times ticked, which
-- `20260804000003_drop_prayer_alert_enabled` already made the one source of
-- truth when it dropped the enable flag for the same reason.
--
-- It never had a control in the screen form either, so `silent` was reachable
-- only by editing this column by hand.
--
-- Screens set to `silent` keep their silence: with the column gone their
-- ticked times would otherwise start beeping.
--
-- Push this only AFTER the bundle that stops sending the column is deployed —
-- the old admin form writes it on every screen save.

UPDATE display_screens
  SET prayer_alert_triggers = ARRAY[]::TEXT[]
  WHERE prayer_alert_sound = 'silent';

-- The CHECK constraint is dropped with the column it covers.
ALTER TABLE display_screens DROP COLUMN prayer_alert_sound;
