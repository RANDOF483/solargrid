import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const unreadOnly = searchParams.get('unread') === 'true';

    let query = supabase.from('notifications').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(50);
    if (userId) query = query.eq('user_id', userId);
    if (unreadOnly) query = query.eq('is_read', false);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data, count });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { id, user_id } = await req.json();
    
    let query = supabase.from('notifications').update({ is_read: true });
    if (id) query = query.eq('id', id);
    else if (user_id) query = query.eq('user_id', user_id);

    const { error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
