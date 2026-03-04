
-- Add quote_number (auto-incrementing), archived flag, and entry_payment_paid flag
ALTER TABLE public.quotes 
  ADD COLUMN IF NOT EXISTS quote_number SERIAL,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS entry_payment_paid BOOLEAN NOT NULL DEFAULT false;

-- Allow users to update their own quotes (for archive/payment marking)
CREATE POLICY "Users can update own quotes"
ON public.quotes
FOR UPDATE
USING (auth.uid() = user_id);

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_quotes_archived ON public.quotes(archived);
CREATE INDEX IF NOT EXISTS idx_quotes_user_created ON public.quotes(user_id, created_at DESC);
