-- ============================================
-- The trigger set is the alert's on/off switch
-- ============================================
-- `prayer_alert_enabled` said nothing the trigger list below it didn't: a
-- screen with no times ticked is a screen that stays silent. Dropping it leaves
-- one source of truth and removes the state where alerts are "on" with nothing
-- to fire on.

-- Screens that were switched off keep their silence — their leftover
-- ARRAY['iqamah'] default would otherwise read as "alert at iqamah" the moment
-- the flag disappears.
UPDATE display_screens
  SET prayer_alert_triggers = ARRAY[]::TEXT[]
  WHERE NOT prayer_alert_enabled;

ALTER TABLE display_screens
  DROP COLUMN prayer_alert_enabled,
  ALTER COLUMN prayer_alert_triggers SET DEFAULT ARRAY[]::TEXT[];
