import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateBillNumber, calculateBillAmount } from '@/lib/utils';

// GET bills
export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customer_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('bills')
      .select('*, customer:customers(full_name, customer_number, email)', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('generated_at', { ascending: false });

    if (customerId) query = query.eq('customer_id', customerId);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data, count });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST generate bill
export async function POST(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body = await req.json();
    const { customer_id, period_start, period_end, current_reading } = body;

    // Get customer with meter and tariff
    const { data: customer, error: custErr } = await supabase
      .from('customers')
      .select('*, tariff:tariffs(*), meters:smart_meters(*)')
      .eq('id', customer_id)
      .single();

    if (custErr || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const meter = Array.isArray(customer.meters) ? customer.meters[0] : customer.meters;
    const tariff = customer.tariff;

    const previousReading = meter?.last_reading || 0;
    const consumptionKwh = Math.max(0, current_reading - previousReading);
    const ratePerKwh = tariff?.rate_per_kwh || 80;
    const fixedCharge = tariff?.fixed_charge || 500;

    const { energy_charge, taxes, total_amount } = calculateBillAmount(
      consumptionKwh,
      ratePerKwh,
      fixedCharge
    );

    const billNumber = generateBillNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const { data: bill, error: billErr } = await supabase
      .from('bills')
      .insert({
        bill_number: billNumber,
        customer_id,
        meter_id: meter?.id || null,
        tariff_id: tariff?.id || null,
        period_start,
        period_end,
        previous_reading: previousReading,
        current_reading,
        consumption_kwh: consumptionKwh,
        energy_charge,
        fixed_charge: fixedCharge,
        taxes,
        total_amount,
        amount_paid: 0,
        balance_due: total_amount,
        status: 'unpaid',
        due_date: dueDate.toISOString(),
      })
      .select()
      .single();

    if (billErr) return NextResponse.json({ error: billErr.message }, { status: 500 });

    // Update meter reading
    if (meter) {
      await supabase.from('smart_meters').update({
        last_reading: current_reading,
        last_reading_at: new Date().toISOString(),
      }).eq('id', meter.id);
    }

    // Send notification
    await supabase.from('notifications').insert({
      user_id: customer.profile_id,
      title: 'New Bill Generated',
      message: `Your bill ${billNumber} for ${consumptionKwh.toFixed(2)} kWh is ready. Amount due: ${total_amount.toLocaleString()} XAF`,
      type: 'bill',
      action_url: '/dashboard/bills',
    });

    return NextResponse.json({ data: bill }, { status: 201 });
  } catch (err) {
    console.error('Bill generation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
