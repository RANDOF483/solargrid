'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import ToastContainer, { toast } from '@/components/ui/Toast';
import { Plus, Edit, AlertTriangle } from 'lucide-react';
import { formatDate, getStatusColor, generateMeterNumber, cn } from '@/lib/utils';
import type { SmartMeter } from '@/lib/types';

export default function MetersPage() {
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [meters, setMeters] = useState<SmartMeter[]>([]);
  const [customers, setCustomers] = useState<{ id: string; full_name: string; customer_number: string }[]>([]);
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SmartMeter | null>(null);
  const [form, setForm] = useState({ meter_number: '', serial_number: '', customer_id: '', site_id: '', meter_type: 'prepaid', firmware_version: '', status: 'unassigned' });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      await fetchMeters();
      const [cRes, sRes] = await Promise.all([
        supabase.from('customers').select('id, full_name, customer_number').order('full_name'),
        supabase.from('microgrid_sites').select('id, name').eq('status', 'active'),
      ]);
      setCustomers(cRes.data || []);
      setSites(sRes.data || []);
      setLoading(false);
    };
    init();
  }, []);

  const fetchMeters = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('smart_meters').select('*, customer:customers(full_name, customer_number), site:microgrid_sites(name)').order('created_at', { ascending: false });
    setMeters(data || []);
  };

  const handleSave = async () => {
    const supabase = createClient();
    try {
      if (editing) {
        const { error } = await supabase.from('smart_meters').update(form).eq('id', editing.id);
        if (error) throw error;
        toast.success('Meter Updated');
      } else {
        const mn = generateMeterNumber();
        const { error } = await supabase.from('smart_meters').insert({ ...form, meter_number: form.meter_number || mn, serial_number: form.serial_number || `SN${mn}` });
        if (error) throw error;
        toast.success('Meter Registered');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ meter_number: '', serial_number: '', customer_id: '', site_id: '', meter_type: 'prepaid', firmware_version: '', status: 'unassigned' });
      await fetchMeters();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed');
    }
  };

  const columns = [
    { key: 'meter_number', label: 'Meter #', render: (_: unknown, row: SmartMeter) => <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#60a5fa' }}>{row.meter_number}</span> },
    { key: 'serial_number', label: 'Serial #', render: (_: unknown, row: SmartMeter) => <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{row.serial_number}</span> },
    { key: 'customer', label: 'Customer', render: (_: unknown, row: SmartMeter & { customer?: { full_name: string } }) => row.customer ? <span style={{ fontSize: 13 }}>{row.customer.full_name}</span> : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Unassigned</span> },
    { key: 'meter_type', label: 'Type', render: (v: unknown) => <span style={{ textTransform: 'capitalize', fontSize: 13 }}>{String(v)}</span> },
    { key: 'status', label: 'Status' },
    { key: 'last_reading', label: 'Last Reading (kWh)', render: (v: unknown) => <span style={{ fontSize: 13, fontWeight: 600 }}>{v != null ? Number(v).toFixed(2) : '—'}</span> },
    { key: 'tamper_alert', label: 'Tamper', render: (v: unknown) => v ? <AlertTriangle size={14} style={{ color: '#ef4444' }} /> : <span style={{ color: '#34d399', fontSize: 12 }}>OK</span> },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" userName={profile?.full_name || 'Admin'} />
      <div className="dashboard-content">
        <TopBar title="Smart Meter Management" />
        <main className="dashboard-main">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn btn-primary"><Plus size={16} /> Register Meter</button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>All Meters ({meters.length})</h3>
            </div>
            <div style={{ padding: '16px 24px 24px' }}>
              <DataTable columns={columns} data={meters} loading={loading} emptyMessage="No meters registered." actions={(row: SmartMeter) => (
                <button onClick={() => { setEditing(row); setForm({ meter_number: row.meter_number, serial_number: row.serial_number, customer_id: row.customer_id || '', site_id: row.site_id || '', meter_type: row.meter_type, firmware_version: row.firmware_version || '', status: row.status }); setShowModal(true); }} className="btn btn-ghost btn-sm p-1.5"><Edit size={14} /></button>
              )} />
            </div>
          </div>
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Meter' : 'Register Meter'} footer={<><button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button><button onClick={handleSave} className="btn btn-primary">Save</button></>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group"><label className="form-label">Meter Number</label><input className="form-input" value={form.meter_number} onChange={(e) => setForm(f => ({ ...f, meter_number: e.target.value }))} placeholder="Auto-generated" /></div>
              <div className="form-group"><label className="form-label">Serial Number</label><input className="form-input" value={form.serial_number} onChange={(e) => setForm(f => ({ ...f, serial_number: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={form.meter_type} onChange={(e) => setForm(f => ({ ...f, meter_type: e.target.value }))}><option value="prepaid">Prepaid</option><option value="postpaid">Postpaid</option><option value="smart">Smart</option></select></div>
              <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}><option value="unassigned">Unassigned</option><option value="active">Active</option><option value="faulty">Faulty</option><option value="maintenance">Maintenance</option></select></div>
              <div className="form-group"><label className="form-label">Customer</label><select className="form-select" value={form.customer_id} onChange={(e) => setForm(f => ({ ...f, customer_id: e.target.value }))}><option value="">Unassigned</option>{customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Site</label><select className="form-select" value={form.site_id} onChange={(e) => setForm(f => ({ ...f, site_id: e.target.value }))}><option value="">— Select —</option>{sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            </div>
          </Modal>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
