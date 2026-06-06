import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    let customer = null;
    if (profile?.role === 'customer') {
      const { data } = await supabase
        .from('customers')
        .select('*, site:microgrid_sites(name, location), tariff:tariffs(name, rate_per_kwh)')
        .eq('profile_id', user.id)
        .single();
      customer = data;
    }

    return NextResponse.json({ user: profile, customer });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
