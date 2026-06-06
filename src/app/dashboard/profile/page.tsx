'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import ToastContainer, { toast } from '@/components/ui/Toast';
import { User, Phone, Mail, MapPin, Save } from 'lucide-react';

export default function CustomerProfile() {
  const [profile, setProfile] = useState<{ id: string; full_name: string; email: string; phone: string; role: string } | null>(null);
  const [customer, setCustomer] = useState<{ id: string; customer_number: string; address: string; city: string; category: string; connection_status: string; credit_balance: number; energy_balance_kwh: number } | null>(null);
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: c } = await supabase.from('customers').select('*').eq('profile_id', user.id).single();
      setProfile(p);
      setCustomer(c);
      setForm({ full_name: p?.full_name || '', phone: p?.phone || '', address: c?.address || '' });
    };
    init();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    try {
      await supabase.from('profiles').update({ full_name: form.full_name, phone: form.phone }).eq('id', profile?.id || '');
      if (customer) await supabase.from('customers').update({ address: form.address, full_name: form.full_name, phone: form.phone }).eq('id', customer.id);
      setProfile(p => p ? { ...p, full_name: form.full_name, phone: form.phone } : p);
      toast.success('Profile Updated', 'Your information has been saved.');
    } catch { toast.error('Failed to save profile'); }
    setSaving(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="customer" userName={profile?.full_name || 'Customer'} />
      <div className="dashboard-content">
        <TopBar title="My Profile" />
        <main className="dashboard-main">
          <div style={{ maxWidth: 700, display: 'grid', gap: 24 }}>
            {/* Account card */}
            {customer && (
              <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(59,130,246,0.05))', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#1a1a1a' }}>
                    {profile?.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{profile?.full_name}</h2>
                    <p style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>Account #{customer.customer_number}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{customer.category} · {customer.connection_status}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
                  <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Energy Balance</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: '#34d399' }}>{customer.energy_balance_kwh.toFixed(2)} kWh</p>
                  </div>
                  <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Credit Balance</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: '#60a5fa' }}>{customer.credit_balance.toLocaleString()} XAF</p>
                  </div>
                </div>
              </div>
            )}

            {/* Edit form */}
            <div className="card">
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>Personal Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 42 }} value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 42 }} value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 42, opacity: 0.6, cursor: 'not-allowed' }} value={profile?.email || ''} disabled />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 42 }} value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
                  </div>
                </div>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
