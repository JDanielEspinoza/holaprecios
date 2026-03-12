
CREATE TABLE public.webhook_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  quote_id text,
  request_url text,
  payload_size_bytes integer,
  status_code integer,
  response_body_preview text,
  response_headers jsonb,
  retry_count integer DEFAULT 0,
  error_type text,
  user_agent text
);

ALTER TABLE public.webhook_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert webhook errors"
  ON public.webhook_errors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full access"
  ON public.webhook_errors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
