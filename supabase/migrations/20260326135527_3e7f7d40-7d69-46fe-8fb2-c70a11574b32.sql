
-- Add event columns to quotes
ALTER TABLE public.quotes ADD COLUMN event_code TEXT DEFAULT NULL;
ALTER TABLE public.quotes ADD COLUMN event_quote_label TEXT DEFAULT NULL;

-- Function to generate event quote label on insert
CREATE OR REPLACE FUNCTION public.generate_event_quote_label()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  event_count INTEGER;
  prefix TEXT;
BEGIN
  -- Only generate label if event_code is provided and not 'NONE'
  IF NEW.event_code IS NOT NULL AND NEW.event_code != 'NONE' THEN
    -- Get prefix mapping
    prefix := CASE NEW.event_code
      WHEN 'ANDINA26' THEN 'ANDINA'
      WHEN 'APTC26' THEN 'APTC26'
      WHEN 'ABRINT26' THEN 'ABRINT26'
      ELSE NEW.event_code
    END;
    
    -- Count existing quotes for this event
    SELECT COUNT(*) + 1 INTO event_count
    FROM public.quotes
    WHERE event_code = NEW.event_code;
    
    -- Generate label like APTC26-01
    NEW.event_quote_label := prefix || '-' || LPAD(event_count::TEXT, 2, '0');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER tr_generate_event_quote_label
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_event_quote_label();
