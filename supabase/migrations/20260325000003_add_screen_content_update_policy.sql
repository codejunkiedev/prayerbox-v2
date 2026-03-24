-- ============================================
-- Add missing UPDATE policy for screen_content
-- ============================================
CREATE POLICY "Users can update own screen content"
  ON screen_content FOR UPDATE
  TO authenticated
  USING (screen_id IN (SELECT id FROM display_screens WHERE user_id = auth.uid()))
  WITH CHECK (screen_id IN (SELECT id FROM display_screens WHERE user_id = auth.uid()));
