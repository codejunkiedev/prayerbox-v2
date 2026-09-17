-- ============================================
-- Screen orientation: landscape or portrait only
-- ============================================
-- `mobile` was a third orientation that never had a layout of its own. It sat on
-- the same 1080×1920 canvas as `portrait` and the orientation guard demanded a
-- portrait monitor for it, but every layout branches on `orientation =
-- 'portrait'` — so a mobile screen asked for a tall monitor and then painted the
-- landscape layout on it. Nothing else distinguished the two.
--
-- Existing rows are rewritten to `portrait`, which is the shape they were
-- already asking their monitor for: no screen has to be rehung, and each one now
-- gets the layout it should have had. Ayat & hadith slides were rendered at
-- 1080×1920 under `mobile` exactly as under `portrait`, so their stored images
-- stay correct untouched.
--
-- Push this only AFTER the bundle that drops the Mobile option is deployed: the
-- tightened CHECK rejects a write the old admin form can still make.

DO $$
DECLARE
  v_screens BIGINT;
  v_slides BIGINT;
BEGIN
  UPDATE display_screens SET orientation = 'portrait' WHERE orientation = 'mobile';
  GET DIAGNOSTICS v_screens = ROW_COUNT;

  UPDATE ayat_and_hadith SET orientation = 'portrait' WHERE orientation = 'mobile';
  GET DIAGNOSTICS v_slides = ROW_COUNT;

  IF v_screens + v_slides > 0 THEN
    RAISE NOTICE 'Moved % screen(s) and % ayat/hadith slide(s) from mobile to portrait',
      v_screens, v_slides;
  END IF;
END $$;

-- Dropped by name without IF EXISTS, so a database whose constraint names have
-- drifted fails here rather than quietly keeping the three-value check.
ALTER TABLE display_screens
  DROP CONSTRAINT display_screens_orientation_check,
  ADD CONSTRAINT display_screens_orientation_check
    CHECK (orientation IN ('landscape', 'portrait'));

ALTER TABLE ayat_and_hadith
  DROP CONSTRAINT ayat_and_hadith_orientation_check,
  ADD CONSTRAINT ayat_and_hadith_orientation_check
    CHECK (orientation IN ('landscape', 'portrait'));
