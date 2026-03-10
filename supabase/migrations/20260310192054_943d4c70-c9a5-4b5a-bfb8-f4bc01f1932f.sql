-- Add permissive SELECT policy so both anon and authenticated can view any quote (for public cotizacion page)
CREATE POLICY "Public read access to quotes"
ON public.quotes FOR SELECT
TO anon, authenticated
USING (true);
