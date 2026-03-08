
CREATE TABLE public.user_workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_name text NOT NULL DEFAULT 'Wispro + IXC Soft',
  auto_assigned boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, workspace_name)
);

ALTER TABLE public.user_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workspaces" ON public.user_workspaces
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "System can insert workspaces" ON public.user_workspaces
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email_contacto)
  VALUES (NEW.id, NEW.email);
  
  IF NEW.email LIKE '%@ixcsoft.com.br' 
     OR NEW.email LIKE '%@opasuite.com.br' 
     OR NEW.email LIKE '%@wispro.co' THEN
    INSERT INTO public.user_workspaces (user_id, workspace_name, auto_assigned)
    VALUES (NEW.id, 'Wispro + IXC Soft', true)
    ON CONFLICT (user_id, workspace_name) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;
