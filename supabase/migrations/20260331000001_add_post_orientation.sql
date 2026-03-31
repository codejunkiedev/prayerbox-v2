-- Add orientation column to posts table
-- Defaults to 'landscape' for all existing posts (they were created with 16:9 images)
ALTER TABLE posts
  ADD COLUMN orientation TEXT NOT NULL DEFAULT 'landscape';

ALTER TABLE posts
  ADD CONSTRAINT posts_orientation_check CHECK (orientation IN ('landscape', 'portrait'));
