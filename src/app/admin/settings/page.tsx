'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { Settings, Lock } from 'lucide-react';

export default function SettingsPage() {
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
        <TopBar title="Platform Settings" subtitle="System configuration and integrations" />
        <main className="dashboard-main">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(107,114,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Settings size={32} style={{ color: '#9ca3af' }} />
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Settings Locked</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 500, lineHeight: 1.6, marginBottom: 24 }}>
              Global platform settings, API integrations (MTN/Orange MoMo keys), and regional configuration are currently locked in this environment to prevent accidental configuration changes during the demonstration.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, border: '1px solid var(--border-color)' }}>
              <Lock size={16} />
              Read-Only Mode
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
