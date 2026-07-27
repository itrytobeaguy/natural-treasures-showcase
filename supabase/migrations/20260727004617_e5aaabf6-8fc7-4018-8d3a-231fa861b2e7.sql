
-- 1) Move has_role out of the API-exposed public schema into a private schema
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Update policies to use private.has_role
DROP POLICY IF EXISTS "Admins delete designs" ON public.designs;
DROP POLICY IF EXISTS "Admins insert designs" ON public.designs;
DROP POLICY IF EXISTS "Admins update designs" ON public.designs;
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins view all orders" ON public.orders;

CREATE POLICY "Admins delete designs" ON public.designs FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins insert designs" ON public.designs FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update designs" ON public.designs FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Drop the public has_role now that policies no longer reference it
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 2) Tighten permissive INSERT policy on orders
DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;

CREATE POLICY "Guests place orders without user link" ON public.orders
FOR INSERT TO anon
WITH CHECK (user_id IS NULL);

CREATE POLICY "Users place their own orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());
