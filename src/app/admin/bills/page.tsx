'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import ToastContainer, { toast } from '@/components/ui/Toast';
import { Plus, FileText, Download } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor, generateBillNumber, cn } from '@/lib/utils';
import type { Bill } from '@/lib/types';

export default function BillsPage() {
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [customers, setCustomers] = useState<{ id: string; full_name: string; customer_number: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customer_id: '', current_reading: '', period_start: '', period_end: '' });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      await fetchBills();
      const { data: cData } = await supabase.from('customers').select('id, full_name, customer_number').order('full_name');
      setCustomers(cData || []);
      setLoading(false);
    };
    init();
  }, []);

  const fetchBills = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('bills').select('*, customer:customers(full_name, customer_number)').order('generated_at', { ascending: false });
    setBills(data || []);
  };

  const handleGenerate = async () => {
    if (!form.customer_id || !form.current_reading) { toast.error('Missing fields'); return; }
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: form.customer_id, current_reading: parseFloat(form.current_reading), period_start: form.period_start || new Date(Date.now() - 30 * 86400000).toISOString(), period_end: form.period_end || new Date().toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error('Error', data.error); return; }
      toast.success('Bill Generated', `Bill ${data.data.bill_number} created.`);
      setShowModal(false);
      setForm({ customer_id: '', current_reading: '', period_start: '', period_end: '' });
      await fetchBills();
    } catch { toast.error('Error', 'Failed to generate bill'); }
  };

  const handleMarkPaid = async (bill: Bill) => {
    const supabase = createClient();
    await supabase.from('bills').update({ status: 'paid', amount_paid: bill.total_amount, balance_due: 0, paid_at: new Date().toISOString() }).eq('id', bill.id);
    toast.success('Bill Marked Paid');
    await fetchBills();
  };

  const columns = [
    { key: 'bill_number', label: 'Bill #', render: (_: unknown, row: Bill) => <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#f59e0b' }}>{row.bill_number}</span> },
    { key: 'customer', label: 'Customer', render: (_: unknown, row: Bill & { customer?: { full_name: string; customer_number: string } }) => <div><p style={{ fontSize: 13, fontWeight: 600 }}>{row.customer?.full_name}</p><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.customer?.customer_number}</p></div> },
    { key: 'consumption_kwh', label: 'Consumption', render: (v: unknown) => <span style={{ fontSize: 13, fontWeight: 600 }}>{Number(v).toFixed(2)} kWh</span> },
    { key: 'total_amount', label: 'Total', render: (v: unknown) => <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(Number(v))}</span> },
    { key: 'balance_due', label: 'Balance Due', render: (v: unknown) => <span style={{ fontSize: 13, fontWeight: 600, color: Number(v) > 0 ? '#ef4444' : '#34d399' }}>{formatCurrency(Number(v))}</span> },
    { key: 'status', label: 'Status' },
    { key: 'due_date', label: 'Due Date', render: (v: unknown) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v ? formatDate(String(v)) : '—'}</span> },
  ];

  const totalDue = bills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.balance_due, 0);
  const totalCollected = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount_paid, 0);

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" userName={profile?.full_name || 'Admin'} />
      <div className="dashboard-content">
        <TopBar title="Billing Management" subtitle="Generate and manage customer bills" />
        <main className="dashboard-main">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Bills', value: bills.length, color: '#60a5fa' },
              { label: 'Outstanding', value: bills.filter(b => b.status === 'unpaid').length, color: '#ef4444' },
              { label: 'Total Due', value: formatCurrency(totalDue), color: '#f59e0b' },
              { label: 'Collected', value: formatCurrency(totalCollected), color: '#34d399' },
            ].map((stat, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: stat.color, marginBottom: 4 }}>{stat.value}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> Generate Bill</button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>All Bills ({bills.length})</h3>
            </div>
            <div style={{ padding: '16px 24px 24px' }}>
              <DataTable columns={columns} data={bills} loading={loading} emptyMessage="No bills generated yet." actions={(row: Bill) => (
                <>
                  {row.status !== 'paid' && (
                    <button onClick={() => handleMarkPaid(row)} className="btn btn-success btn-sm" style={{ fontSize: 11 }}>Mark Paid</button>
                  )}
                  <button className="btn btn-ghost btn-sm p-1.5"><Download size={14} /></button>
                </>
              )} />
            </div>
          </div>

          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Generate Bill"
            footer={<><button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button><button onClick={handleGenerate} className="btn btn-primary">Generate</button></>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group"><label className="form-label">Customer *</label>
                <select className="form-select" value={form.customer_id} onChange={(e) => setForm(f => ({ ...f, customer_id: e.target.value }))}>
                  <option value="">— Select Customer —</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.customer_number})</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Current Meter Reading (kWh) *</label>
                <input type="number" step="0.001" className="form-input" value={form.current_reading} onChange={(e) => setForm(f => ({ ...f, current_reading: e.target.value }))} placeholder="e.g. 1250.500" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label className="form-label">Period Start</label><input type="date" className="form-input" value={form.period_start} onChange={(e) => setForm(f => ({ ...f, period_start: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Period End</label><input type="date" className="form-input" value={form.period_end} onChange={(e) => setForm(f => ({ ...f, period_end: e.target.value }))} /></div>
              </div>
            </div>
          </Modal>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
