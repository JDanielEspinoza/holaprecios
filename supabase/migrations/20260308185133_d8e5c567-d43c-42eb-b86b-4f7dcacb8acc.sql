
-- Add archive_reason column to quotes
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS archive_reason text DEFAULT '';

-- Allow users to delete their own quotes
CREATE POLICY "Users can delete own quotes"
ON public.quotes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
