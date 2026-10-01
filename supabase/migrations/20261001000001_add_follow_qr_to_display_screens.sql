-- ============================================
-- Follow QR slide: a per-screen opt-in
-- ============================================
-- The slide carries a link to the masjid in the Alkhairi app. The display shows
-- it only while the masjid is listed, which it reads off the profile already in
-- its payload, so un-listing takes the slide down without touching this column.

ALTER TABLE display_screens ADD COLUMN show_follow_qr BOOLEAN NOT NULL DEFAULT false;
