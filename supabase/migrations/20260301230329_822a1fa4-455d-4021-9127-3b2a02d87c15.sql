
CREATE TABLE public.quotes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  client_name text DEFAULT '',
  client_company text DEFAULT '',
  client_phone text DEFAULT '',
  client_email text DEFAULT '',
  clients_count integer NOT NULL DEFAULT 0,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  discount integer NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  discounted_total numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  installation_cost numeric NOT NULL DEFAULT 0,
  seller_name text DEFAULT '',
  seller_cargo text DEFAULT '',
  seller_numero text DEFAULT '',
  seller_email text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own quotes
CREATE POLICY "Users can insert own quotes" ON public.quotes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can view their own quotes
CREATE POLICY "Users can view own quotes" ON public.quotes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Anyone can view a quote by id (for shared links)
CREATE POLICY "Anyone can view quotes by id" ON public.quotes
  FOR SELECT TO anon
  USING (true);
