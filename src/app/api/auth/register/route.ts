import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateCustomerNumber } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, full_name, phone, role = 'customer' } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Email, password, and full name are required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, phone, role },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email,
      full_name,
      phone: phone || null,
      role,
    });

    if (profileError) {
      // Rollback
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // If role is customer, create customer record
    if (role === 'customer') {
      const customerNumber = generateCustomerNumber();
      const { data: tariff } = await supabase
        .from('tariffs')
        .select('id')
        .eq('category', 'residential')
        .eq('is_active', true)
        .single();

      const { data: site } = await supabase
        .from('microgrid_sites')
        .select('id')
        .eq('status', 'active')
        .limit(1)
        .single();

      await supabase.from('customers').insert({
        profile_id: userId,
        customer_number: customerNumber,
        full_name,
        email,
        phone: phone || '',
        address: body.address || 'Not provided',
        city: body.city || 'Buea',
        region: body.region || 'South West',
        category: body.category || 'residential',
        tariff_id: tariff?.id || null,
        site_id: site?.id || null,
        connection_status: 'pending',
        energy_balance_kwh: 0,
        credit_balance: 0,
      });

      // Send welcome notification
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Welcome to SolarGrid Manager!',
        message: `Your account ${customerNumber} has been created. Please complete your profile to activate your connection.`,
        type: 'info',
      });
    }

    return NextResponse.json({ success: true, userId }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
