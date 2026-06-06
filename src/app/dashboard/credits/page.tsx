'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { Battery, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CreditsPage() {
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
        <TopBar title="Buy Credits" subtitle="Top up your prepaid energy balance" />
        <main className="dashboard-main">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Battery size={32} style={{ color: '#8b5cf6' }} />
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Prepaid Mode Disabled</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 500, lineHeight: 1.6, marginBottom: 24 }}>
              Your account is currently set to standard monthly billing. The "Buy Credits" feature is only available for Pay-As-You-Go (PAYG) customers. 
              To pay an outstanding bill, please visit the Payments module.
            </p>
            <Link href="/dashboard/payments" className="btn btn-primary">
              Go to Payments <ArrowRight size={16} />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
