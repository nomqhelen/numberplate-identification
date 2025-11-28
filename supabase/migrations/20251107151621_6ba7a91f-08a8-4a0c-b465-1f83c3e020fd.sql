-- Add indexes for better query performance on filtering
CREATE INDEX IF NOT EXISTS idx_toll_transactions_created_at ON public.toll_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_toll_transactions_vehicle_id ON public.toll_transactions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_toll_transactions_toll_station_id ON public.toll_transactions(toll_station_id);

-- Add payment_type column to distinguish between recharges and toll payments
ALTER TABLE public.toll_transactions ADD COLUMN IF NOT EXISTS transaction_type text DEFAULT 'toll';
ALTER TABLE public.toll_transactions DROP CONSTRAINT IF EXISTS toll_transactions_transaction_type_check;
ALTER TABLE public.toll_transactions ADD CONSTRAINT toll_transactions_transaction_type_check CHECK (transaction_type IN ('toll', 'recharge'));

-- Create a view for admin to see all transactions with vehicle and owner details
CREATE OR REPLACE VIEW public.admin_transaction_view AS
SELECT 
  t.*,
  v.license_plate,
  v.owner_name,
  v.owner_id,
  ts.station_name,
  ts.location as station_location
FROM public.toll_transactions t
JOIN public.vehicles v ON t.vehicle_id = v.id
JOIN public.toll_stations ts ON t.toll_station_id = ts.id;

-- Grant access to admin view
GRANT SELECT ON public.admin_transaction_view TO authenticated;