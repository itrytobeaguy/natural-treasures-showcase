ALTER TABLE public.designs ADD COLUMN is_hidden boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.designs.is_hidden IS 'Hidden products remain manageable by admins but are excluded from the public storefront.';
ALTER POLICY "Anyone can view designs" ON public.designs USING (NOT is_hidden);
CREATE POLICY "Admins view all designs" ON public.designs FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));