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
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const requestBody = await req.json();
    const { vehicleId, amount, paymentMethod = 'credit_card' } = requestBody;

    // Input validation
    if (!vehicleId || typeof vehicleId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid vehicleId - must be a valid UUID string' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(vehicleId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid vehicleId format - must be a valid UUID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0 || amount > 10000) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount - must be a positive number between 0 and 10000' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const validPaymentMethods = ['credit_card', 'debit_card', 'mobile_money'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment method' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing payment for user ${user.id}, vehicle ${vehicleId}, amount: $${amount}`);

    // Verify the vehicle belongs to the user
    const { data: vehicle, error: vehicleError } = await supabaseClient
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .eq('owner_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      return new Response(
        JSON.stringify({ error: 'Vehicle not found or access denied' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Simulate payment processing with token/API key
    console.log('Simulating payment gateway processing...');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

    // Payment successful - update vehicle balance
    const newBalance = Number(vehicle.balance) + Number(amount);
    
    const { error: updateError } = await supabaseClient
      .from('vehicles')
      .update({ balance: newBalance })
      .eq('id', vehicleId);

    if (updateError) {
      console.error('Error updating balance:', updateError);
      throw updateError;
    }

    // Create a transaction record for the recharge
    const { error: transactionError } = await supabaseClient
      .from('toll_transactions')
      .insert({
        vehicle_id: vehicleId,
        toll_station_id: null, // No toll station for recharge
        rfid_tag: vehicle.rfid_tag,
        toll_amount: -amount, // Negative amount indicates recharge
        balance_before: vehicle.balance,
        balance_after: newBalance,
        transaction_status: 'success',
        payment_method: paymentMethod,
      });

    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
    }

    console.log(`Payment successful. New balance: $${newBalance}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment processed successfully',
        transaction: {
          vehicleId,
          amount,
          previousBalance: vehicle.balance,
          newBalance,
          paymentMethod,
          timestamp: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
