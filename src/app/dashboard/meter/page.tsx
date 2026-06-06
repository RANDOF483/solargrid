'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { Gauge, AlertTriangle } from 'lucide-react';

export default function MeterPage() {
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
      <Sidebar role="customer" userName={profile?.full_name || 'Customer'} />
      <div className="dashboard-content">
        <TopBar title="My Meter" subtitle="View your smart meter details" />
        <main className="dashboard-main">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Gauge size={32} style={{ color: '#60a5fa' }} />
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Meter Module Pending Initialization</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 500, lineHeight: 1.6, marginBottom: 24 }}>
              Your physical smart meter connection is currently being configured by our technicians in Buea. Once your meter is physically installed and synced, your live readings will appear here.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: 8, color: '#f59e0b', fontSize: 13, fontWeight: 600 }}>
              <AlertTriangle size={16} />
              Status: Awaiting Field Installation
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
