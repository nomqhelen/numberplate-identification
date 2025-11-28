-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'owner');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update vehicles table to link to owner
ALTER TABLE public.vehicles ADD COLUMN owner_id UUID REFERENCES public.profiles(id);

-- Update vehicles RLS policies
DROP POLICY IF EXISTS "Allow public read access to vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Allow public insert to vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Allow public update to vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Allow public delete to vehicles" ON public.vehicles;

CREATE POLICY "Admins can view all vehicles"
  ON public.vehicles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can view their own vehicles"
  ON public.vehicles
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can insert vehicles"
  ON public.vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all vehicles"
  ON public.vehicles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can update their own vehicles"
  ON public.vehicles
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can delete vehicles"
  ON public.vehicles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update toll_transactions RLS policies
DROP POLICY IF EXISTS "Allow public read access to toll_transactions" ON public.toll_transactions;
DROP POLICY IF EXISTS "Allow public insert to toll_transactions" ON public.toll_transactions;

CREATE POLICY "Admins can view all transactions"
  ON public.toll_transactions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can view their vehicle transactions"
  ON public.toll_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = toll_transactions.vehicle_id
      AND vehicles.owner_id = auth.uid()
    )
  );

CREATE POLICY "System can insert transactions"
  ON public.toll_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update toll_stations RLS policies  
DROP POLICY IF EXISTS "Allow public read access to toll_stations" ON public.toll_stations;

CREATE POLICY "Anyone can view toll stations"
  ON public.toll_stations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage toll stations"
  ON public.toll_stations
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update rfid_readers RLS policies
DROP POLICY IF EXISTS "Allow public read access to rfid_readers" ON public.rfid_readers;

CREATE POLICY "Anyone can view RFID readers"
  ON public.rfid_readers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage RFID readers"
  ON public.rfid_readers
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create alerts table for invalid vehicle notifications
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id),
  license_plate TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  location TEXT,
  toll_station_id UUID REFERENCES public.toll_stations(id),
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all alerts"
  ON public.alerts
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert alerts"
  ON public.alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update alerts"
  ON public.alerts
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for profile updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;