import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    const { licensePlate, tollStationId } = requestBody;

    // Input validation
    if (!licensePlate || typeof licensePlate !== 'string' || licensePlate.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid license plate - must be a non-empty string' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate license plate format (basic alphanumeric check, max 15 characters)
    const licensePlateRegex = /^[A-Z0-9\s-]{1,15}$/i;
    if (!licensePlateRegex.test(licensePlate.trim())) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid license plate format - must contain only letters, numbers, spaces, or hyphens (max 15 characters)' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!tollStationId || typeof tollStationId !== 'string') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid toll station ID - must be a valid UUID string' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tollStationId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid toll station ID format - must be a valid UUID' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`RFID Simulation started for license plate: ${licensePlate}`);

    // Step 1: Vehicle RFID reader captures tag data
    console.log('Step 1: Capturing RFID tag data...');

    // Step 2: Validate tag (check database)
    console.log('Step 2: Validating vehicle in database...');
    const { data: vehicle, error: vehicleError } = await supabaseClient
      .from('vehicles')
      .select('*')
      .eq('license_plate', licensePlate)
      .maybeSingle();

    if (vehicleError) {
      console.error('Database error:', vehicleError);
      throw vehicleError;
    }

    // Get toll station info
    const { data: tollStation } = await supabaseClient
      .from('toll_stations')
      .select('*')
      .eq('id', tollStationId)
      .single();

    const tollAmount = 15.0; // Fixed toll amount for simulation

    // Step 3: Decision - Valid or Invalid
    if (!vehicle) {
      // Vehicle invalid - generate alert
      console.log('Step 3: Vehicle NOT FOUND - Generating alert...');
      
      const { error: alertError } = await supabaseClient
        .from('alerts')
        .insert({
          license_plate: licensePlate,
          alert_type: 'unregistered_vehicle',
          message: `Unregistered vehicle detected: ${licensePlate}`,
          location: tollStation?.location || 'Unknown',
          toll_station_id: tollStationId,
          priority: 'high',
          status: 'active',
        });

      if (alertError) {
        console.error('Error creating alert:', alertError);
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: `Vehicle ${licensePlate} is not registered in the system`,
          alert: 'Alert generated for law enforcement',
          vehicleValid: false,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (vehicle.status !== 'active') {
      // Vehicle invalid status - generate alert
      console.log(`Step 3: Vehicle status is ${vehicle.status} - Generating alert...`);
      
      const { error: alertError } = await supabaseClient
        .from('alerts')
        .insert({
          vehicle_id: vehicle.id,
          license_plate: licensePlate,
          alert_type: 'invalid_status',
          message: `Vehicle with invalid status detected: ${licensePlate} (${vehicle.status})`,
          location: tollStation?.location || 'Unknown',
          toll_station_id: tollStationId,
          priority: 'high',
          status: 'active',
        });

      if (alertError) {
        console.error('Error creating alert:', alertError);
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: `Vehicle ${licensePlate} has invalid status: ${vehicle.status}`,
          alert: 'Alert generated for law enforcement',
          vehicleValid: false,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (vehicle.balance < tollAmount) {
      // Insufficient balance - generate alert
      console.log('Step 3: Insufficient balance - Generating alert...');
      
      const { error: alertError } = await supabaseClient
        .from('alerts')
        .insert({
          vehicle_id: vehicle.id,
          license_plate: licensePlate,
          alert_type: 'insufficient_balance',
          message: `Vehicle with insufficient balance: ${licensePlate} (Balance: $${vehicle.balance})`,
          location: tollStation?.location || 'Unknown',
          toll_station_id: tollStationId,
          priority: 'medium',
          status: 'active',
        });

      if (alertError) {
        console.error('Error creating alert:', alertError);
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: `Insufficient balance. Current: $${vehicle.balance}, Required: $${tollAmount}`,
          alert: 'Payment required alert generated',
          vehicleValid: false,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Vehicle valid - Store transaction record
    console.log('Step 3: Vehicle VALID - Processing transaction...');
    console.log('Step 4: Storing transaction record...');

    const newBalance = Number(vehicle.balance) - tollAmount;
    
    const { error: transactionError } = await supabaseClient
      .from('toll_transactions')
      .insert({
        vehicle_id: vehicle.id,
        toll_station_id: tollStationId,
        rfid_tag: vehicle.rfid_tag,
        toll_amount: tollAmount,
        balance_before: vehicle.balance,
        balance_after: newBalance,
        transaction_status: 'success',
        payment_method: 'rfid',
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      throw transactionError;
    }

    // Update vehicle balance
    const { error: updateError } = await supabaseClient
      .from('vehicles')
      .update({ balance: newBalance })
      .eq('id', vehicle.id);

    if (updateError) {
      console.error('Error updating balance:', updateError);
      throw updateError;
    }

    // Step 5: Generate report
    console.log('Step 5: Generating transaction report...');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Toll transaction completed successfully',
        vehicleValid: true,
        transaction: {
          vehicle: licensePlate,
          tollAmount: tollAmount,
          previousBalance: vehicle.balance,
          newBalance: newBalance,
          tollStation: tollStation?.station_name || 'Unknown',
          timestamp: new Date().toISOString(),
        },
        report: 'Transaction logged successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('RFID Simulation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
