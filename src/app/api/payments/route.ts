import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generatePaymentRef } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customer_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('payments')
      .select('*, customer:customers(full_name, customer_number)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (customerId) query = query.eq('customer_id', customerId);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data, count });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body = await req.json();
    const { customer_id, bill_id, amount, payment_method, mobile_money_provider, transaction_id } = body;

    const paymentRef = generatePaymentRef();

    // Simulate payment processing
    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .insert({
        payment_reference: paymentRef,
        customer_id,
        bill_id: bill_id || null,
        amount,
        payment_method,
        mobile_money_provider: mobile_money_provider || null,
        transaction_id: transaction_id || null,
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (payErr) return NextResponse.json({ error: payErr.message }, { status: 400 });

    // Update bill if linked
    if (bill_id) {
      const { data: bill } = await supabase
        .from('bills')
        .select('total_amount, amount_paid')
        .eq('id', bill_id)
        .single();

      if (bill) {
        const newPaid = (bill.amount_paid || 0) + amount;
        const newBalance = Math.max(0, bill.total_amount - newPaid);
        const newStatus = newBalance <= 0 ? 'paid' : 'partial';

        await supabase.from('bills').update({
          amount_paid: newPaid,
          balance_due: newBalance,
          status: newStatus,
          paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
        }).eq('id', bill_id);
      }
    }

    // Get profile for notification
    const { data: customer } = await supabase
      .from('customers')
      .select('profile_id')
      .eq('id', customer_id)
      .single();

    if (customer?.profile_id) {
      await supabase.from('notifications').insert({
        user_id: customer.profile_id,
        title: 'Payment Confirmed',
        message: `Your payment of ${amount.toLocaleString()} XAF (Ref: ${paymentRef}) has been received. Thank you!`,
        type: 'payment',
        action_url: '/dashboard/payments',
      });
    }

    return NextResponse.json({ data: payment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
