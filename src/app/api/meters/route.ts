import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('site_id');

    let query = supabase.from('smart_meters').select('*, customer:customers(full_name, customer_number), site:microgrid_sites(name)', { count: 'exact' }).order('created_at', { ascending: false });
    if (siteId) query = query.eq('site_id', siteId);

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
    const { data, error } = await supabase.from('smart_meters').insert(body).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
