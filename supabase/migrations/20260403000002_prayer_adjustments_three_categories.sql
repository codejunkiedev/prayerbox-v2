-- ============================================
-- Update prayer_adjustments JSONB structure
-- from flat { type, offset?, manual_time? }
-- to nested { starts: {...}, athan: {...}, iqamah: {...} }
-- per prayer
-- ============================================

-- Transform existing prayer_adjustments data
UPDATE prayer_times
SET prayer_adjustments = (
  SELECT jsonb_object_agg(
    key,
    jsonb_build_object(
      'starts', value,
      'athan', jsonb_build_object('type', 'default'),
      'iqamah', jsonb_build_object('type', 'default')
    )
  )
  FROM jsonb_each(prayer_adjustments)
)
WHERE prayer_adjustments IS NOT NULL;
