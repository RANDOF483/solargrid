'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { Settings, Lock } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ full_name: string; role: string; email: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile({ ...p, email: user.email });
      }
    };
    init();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar role="technician" userName={profile?.full_name || 'Technician'} />
      <div className="dashboard-content">
        <TopBar title="Technician Profile" subtitle="Manage your account settings" />
        <main className="dashboard-main">
          <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Personal Information</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={profile?.full_name || ''} readOnly disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={profile?.email || ''} readOnly disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input type="text" className="form-input" value="Field Technician" readOnly disabled style={{ textTransform: 'capitalize' }} />
              </div>
            </div>
            <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#f59e0b', fontSize: 13, fontWeight: 600 }}>
              <Lock size={16} />
              Profile updates must be handled by the administrator.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
