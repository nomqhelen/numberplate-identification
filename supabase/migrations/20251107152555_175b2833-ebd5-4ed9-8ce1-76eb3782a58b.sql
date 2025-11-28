-- Fix 1: Remove public insert policy on toll_stations and restrict to admins only
DROP POLICY IF EXISTS "Allow public insert to toll_stations" ON public.toll_stations;

CREATE POLICY "Admins only can insert toll stations"
ON public.toll_stations
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Recreate admin_transaction_view with security_barrier
-- Views cannot have RLS policies, but security_barrier ensures security
DROP VIEW IF EXISTS public.admin_transaction_view;

CREATE VIEW public.admin_transaction_view
WITH (security_barrier = true)
AS
SELECT 
  t.*,
  v.license_plate,
  v.owner_name,
  v.owner_id,
  ts.station_name,
  ts.location as station_location
FROM public.toll_transactions t
JOIN public.vehicles v ON t.vehicle_id = v.id
JOIN public.toll_stations ts ON t.toll_station_id = ts.id
WHERE has_role(auth.uid(), 'admin'::app_role);

-- Grant access only to authenticated users
REVOKE ALL ON public.admin_transaction_view FROM PUBLIC;
GRANT SELECT ON public.admin_transaction_view TO authenticated;

-- Fix 3: Update auto_assign_role function to always assign 'owner' role (not email-based)
DROP FUNCTION IF EXISTS public.auto_assign_role() CASCADE;

CREATE OR REPLACE FUNCTION public.auto_assign_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Always assign 'owner' role to new users
  -- Admins must be promoted manually by existing admins
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'owner');
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_role();