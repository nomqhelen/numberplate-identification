-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfid_tag VARCHAR(50) NOT NULL UNIQUE,
  license_plate VARCHAR(20) NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create toll_stations table
CREATE TABLE public.toll_stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_code VARCHAR(20) NOT NULL UNIQUE,
  station_name VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create toll_transactions table
CREATE TABLE public.toll_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  toll_station_id UUID NOT NULL REFERENCES public.toll_stations(id),
  rfid_tag VARCHAR(50) NOT NULL,
  transaction_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  toll_amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  transaction_status VARCHAR(20) NOT NULL DEFAULT 'success',
  payment_method VARCHAR(20) NOT NULL DEFAULT 'rfid',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rfid_readers table
CREATE TABLE public.rfid_readers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reader_code VARCHAR(20) NOT NULL UNIQUE,
  toll_station_id UUID NOT NULL REFERENCES public.toll_stations(id),
  reader_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'online',
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  firmware_version VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toll_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toll_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfid_readers ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for testing)
CREATE POLICY "Allow public read access to vehicles" 
ON public.vehicles FOR SELECT USING (true);

CREATE POLICY "Allow public insert to vehicles" 
ON public.vehicles FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to vehicles" 
ON public.vehicles FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to vehicles" 
ON public.vehicles FOR DELETE USING (true);

CREATE POLICY "Allow public read access to toll_stations" 
ON public.toll_stations FOR SELECT USING (true);

CREATE POLICY "Allow public insert to toll_stations" 
ON public.toll_stations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to toll_transactions" 
ON public.toll_transactions FOR SELECT USING (true);

CREATE POLICY "Allow public insert to toll_transactions" 
ON public.toll_transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to rfid_readers" 
ON public.rfid_readers FOR SELECT USING (true);

CREATE POLICY "Allow public insert to rfid_readers" 
ON public.rfid_readers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to rfid_readers" 
ON public.rfid_readers FOR UPDATE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_toll_stations_updated_at
BEFORE UPDATE ON public.toll_stations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rfid_readers_updated_at
BEFORE UPDATE ON public.rfid_readers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for toll_transactions
ALTER TABLE public.toll_transactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.toll_transactions;