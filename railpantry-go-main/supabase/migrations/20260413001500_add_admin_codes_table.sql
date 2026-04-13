-- Create admin_codes table for operator access control
CREATE TABLE public.admin_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_username TEXT NOT NULL,
  code TEXT NOT NULL,
  train_number TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read admin codes" ON public.admin_codes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert admin codes" ON public.admin_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update admin codes" ON public.admin_codes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete admin codes" ON public.admin_codes FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_codes;

CREATE TRIGGER update_admin_codes_updated_at BEFORE UPDATE ON public.admin_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
