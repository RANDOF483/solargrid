import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateTicketNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customer_id');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assigned_to');

    let query = supabase
      .from('complaints')
      .select('*, customer:customers(full_name, customer_number, phone), assignee:profiles!assigned_to(full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (customerId) query = query.eq('customer_id', customerId);
    if (status) query = query.eq('status', status);
    if (assignedTo) query = query.eq('assigned_to', assignedTo);

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

    const ticketNumber = generateTicketNumber();

    const { data, error } = await supabase
      .from('complaints')
      .insert({
        ...body,
        ticket_number: ticketNumber,
        status: 'open',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Notify admins (in production, send to all operators)
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body = await req.json();
    const { id, ...updates } = body;

    if (updates.status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
