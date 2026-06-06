'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import ToastContainer, { toast } from '@/components/ui/Toast';
import { Plus, MapPin } from 'lucide-react';
import { getStatusColor, cn } from '@/lib/utils';
import type { MicrogridSite } from '@/lib/types';

export default function SitesPage() {
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [sites, setSites] = useState<MicrogridSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MicrogridSite | null>(null);
  const [form, setForm] = useState({ name: '', location: '', region: 'South West', capacity_kw: '', panel_count: '', battery_capacity_kwh: '', status: 'active' });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      const { data } = await supabase.from('microgrid_sites').select('*').order('created_at', { ascending: false });
      setSites(data || []);
      setLoading(false);
    };
    init();
  }, []);

  const handleSave = async () => {
    const supabase = createClient();
    try {
      const payload = { ...form, capacity_kw: parseFloat(form.capacity_kw) || 0, panel_count: parseInt(form.panel_count) || 0, battery_capacity_kwh: parseFloat(form.battery_capacity_kwh) || 0 };
      if (editing) {
        await supabase.from('microgrid_sites').update(payload).eq('id', editing.id);
        toast.success('Site Updated');
        setSites(prev => prev.map(s => s.id === editing.id ? { ...s, ...payload } as MicrogridSite : s));
      } else {
        const { data } = await supabase.from('microgrid_sites').insert(payload).select().single();
        toast.success('Site Created');
        if (data) setSites(prev => [data, ...prev]);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', location: '', region: 'South West', capacity_kw: '', panel_count: '', battery_capacity_kwh: '', status: 'active' });
    } catch { toast.error('Failed to save site'); }
  };

  const columns: any[] = [
    { key: 'name', label: 'Site Name', render: (_: unknown, row: MicrogridSite) => <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={18} style={{ color: '#f59e0b' }} /></div><div><p style={{ fontSize: 13, fontWeight: 700 }}>{row.name}</p><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.location}</p></div></div> },
    { key: 'region', label: 'Region' },
    { key: 'capacity_kw', label: 'Capacity', render: (v: any) => <span style={{ fontSize: 13, fontWeight: 600 }}>{String(v)} kW</span> },
    { key: 'panel_count', label: 'Panels', render: (v: any) => <span>{String(v)} panels</span> },
    { key: 'battery_capacity_kwh', label: 'Battery', render: (v: any) => <span>{String(v)} kWh</span> },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" userName={profile?.full_name || 'Admin'} />
      <div className="dashboard-content">
        <TopBar title="Microgrid Sites" subtitle="Manage solar microgrid installations" />
        <main className="dashboard-main">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Sites', value: sites.length, color: '#60a5fa' },
              { label: 'Active Sites', value: sites.filter(s => s.status === 'active').length, color: '#34d399' },
              { label: 'Total Capacity', value: `${sites.reduce((s, site) => s + site.capacity_kw, 0).toFixed(0)} kW`, color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn btn-primary"><Plus size={16} /> Add Site</button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>All Sites</h3>
            </div>
            <div style={{ padding: '16px 24px 24px' }}>
              <DataTable columns={columns} data={sites} loading={loading} emptyMessage="No sites registered." actions={(row: MicrogridSite) => (
                <button onClick={() => { setEditing(row); setForm({ name: row.name, location: row.location, region: row.region, capacity_kw: String(row.capacity_kw), panel_count: String(row.panel_count), battery_capacity_kwh: String(row.battery_capacity_kwh), status: row.status }); setShowModal(true); }} className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>Edit</button>
              )} />
            </div>
          </div>
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Site' : 'Add Microgrid Site'}
            footer={<><button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button><button onClick={handleSave} className="btn btn-primary">Save Site</button></>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Site Name *</label><input className="form-input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Buea Main Grid" /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Location *</label><input className="form-input" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Street / Town" /></div>
              <div className="form-group"><label className="form-label">Region</label><select className="form-select" value={form.region} onChange={(e) => setForm(f => ({ ...f, region: e.target.value }))}><option value="South West">South West</option><option value="North West">North West</option><option value="Littoral">Littoral</option></select></div>
              <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}><option value="active">Active</option><option value="inactive">Inactive</option><option value="maintenance">Maintenance</option></select></div>
              <div className="form-group"><label className="form-label">Capacity (kW)</label><input type="number" className="form-input" value={form.capacity_kw} onChange={(e) => setForm(f => ({ ...f, capacity_kw: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Panel Count</label><input type="number" className="form-input" value={form.panel_count} onChange={(e) => setForm(f => ({ ...f, panel_count: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Battery Capacity (kWh)</label><input type="number" className="form-input" value={form.battery_capacity_kwh} onChange={(e) => setForm(f => ({ ...f, battery_capacity_kwh: e.target.value }))} /></div>
            </div>
          </Modal>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
