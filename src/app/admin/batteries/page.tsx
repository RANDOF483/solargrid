'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { Battery, Activity } from 'lucide-react';

export default function BatteriesPage() {
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
        <TopBar title="Battery Storage" subtitle="Real-time storage capacity and health" />
        <main className="dashboard-main">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Battery size={32} style={{ color: '#10b981' }} />
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Battery Telemetry Disconnected</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 500, lineHeight: 1.6, marginBottom: 24 }}>
              The system is currently unable to retrieve state-of-charge (SOC) data from the inverter controllers at the Buea Main Grid. Live charts will resume when the connection is restored.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(16,185,129,0.1)', borderRadius: 8, color: '#10b981', fontSize: 13, fontWeight: 600, border: '1px solid rgba(16,185,129,0.2)' }}>
              <Activity size={16} />
              Awaiting Sensor Data
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
