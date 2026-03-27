ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS adesao_payment_type text DEFAULT 'vista';
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS adesao_installments integer NULL;