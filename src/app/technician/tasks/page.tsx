'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { ClipboardList, CheckCircle } from 'lucide-react';

export default function TasksPage() {
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
      <Sidebar role="technician" userName={profile?.full_name || 'Technician'} />
      <div className="dashboard-content">
        <TopBar title="My Tasks" subtitle="View your assigned work orders" />
        <main className="dashboard-main">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <ClipboardList size={32} style={{ color: '#60a5fa' }} />
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>No Pending Tasks</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 500, lineHeight: 1.6, marginBottom: 24 }}>
              You currently have no active work orders assigned to you by the grid administrator. All systems in your sector are operating normally.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(52,211,153,0.1)', borderRadius: 8, color: '#34d399', fontSize: 13, fontWeight: 600, border: '1px solid rgba(52,211,153,0.2)' }}>
              <CheckCircle size={16} />
              All Caught Up
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
