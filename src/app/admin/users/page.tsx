'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { UserCog, ShieldAlert } from 'lucide-react';

export default function UsersPage() {
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(p);
      }
    };
    init();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" userName={profile?.full_name || 'Admin'} />
      <div className="dashboard-content">
        <TopBar title="User Management" subtitle="Manage system administrators and operators" />
        <main className="dashboard-main">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <UserCog size={32} style={{ color: '#ef4444' }} />
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Access Restricted</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 500, lineHeight: 1.6, marginBottom: 24 }}>
              To ensure database integrity, Role-Based Access Control (RBAC) modifications must be performed directly through the Supabase Authentication console by the primary database owner.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, color: '#ef4444', fontSize: 13, fontWeight: 600, border: '1px solid rgba(239,68,68,0.2)' }}>
              <ShieldAlert size={16} />
              Requires Root Privileges
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
