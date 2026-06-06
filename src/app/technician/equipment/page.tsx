'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { Activity, RadioTower } from 'lucide-react';

export default function EquipmentPage() {
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
        <TopBar title="Equipment Status" subtitle="Live hardware telemetry" />
        <main className="dashboard-main">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Activity size={32} style={{ color: '#10b981' }} />
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Connecting to Inverters...</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 500, lineHeight: 1.6, marginBottom: 24 }}>
              The diagnostic tool is currently attempting to establish a local connection with the field hardware. Equipment temperatures and voltages will be displayed once the handshake is complete.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: 8, color: '#f59e0b', fontSize: 13, fontWeight: 600, border: '1px solid rgba(245,158,11,0.2)' }}>
              <RadioTower size={16} />
              Awaiting Telemetry
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
