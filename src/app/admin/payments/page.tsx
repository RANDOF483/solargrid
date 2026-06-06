'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import ToastContainer, { toast } from '@/components/ui/Toast';
import { Plus } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor, cn } from '@/lib/utils';
import type { Payment } from '@/lib/types';

export default function AdminPayments() {
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<{ id: string; full_name: string; customer_number: string }[]>([]);
  const [bills, setBills] = useState<{ id: string; bill_number: string; balance_due: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customer_id: '', bill_id: '', amount: '', payment_method: 'cash', mobile_money_provider: 'mtn', notes: '' });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      const [payRes, custRes] = await Promise.all([
        supabase.from('payments').select('*, customer:customers(full_name, customer_number)').order('created_at', { ascending: false }),
        supabase.from('customers').select('id, full_name, customer_number').order('full_name'),
      ]);
      setPayments(payRes.data || []);
      setCustomers(custRes.data || []);
      setLoading(false);
    };
    init();
  }, []);

  const onCustomerChange = async (custId: string) => {
    setForm(f => ({ ...f, customer_id: custId, bill_id: '' }));
    if (custId) {
      const supabase = createClient();
      const { data } = await supabase.from('bills').select('id, bill_number, balance_due').eq('customer_id', custId).neq('status', 'paid');
      setBills(data || []);
    }
  };

  const handleRecord = async () => {
    if (!form.customer_id || !form.amount) { toast.error('Fill required fields'); return; }
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: form.customer_id, bill_id: form.bill_id || null, amount: parseFloat(form.amount), payment_method: form.payment_method, mobile_money_provider: form.payment_method === 'mobile_money' ? form.mobile_money_provider : null, notes: form.notes }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error('Error', data.error); return; }
      toast.success('Payment Recorded', `Ref: ${data.data.payment_reference}`);
      setShowModal(false);
      setPayments(prev => [data.data, ...prev]);
    } catch { toast.error('Error'); }
  };

  const columns = [
    { key: 'payment_reference', label: 'Reference', render: (_: unknown, row: Payment) => <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#f59e0b' }}>{row.payment_reference}</span> },
    { key: 'customer', label: 'Customer', render: (_: unknown, row: Payment & { customer?: { full_name: string; customer_number: string } }) => <div><p style={{ fontSize: 13, fontWeight: 600 }}>{row.customer?.full_name}</p><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.customer?.customer_number}</p></div> },
    { key: 'amount', label: 'Amount', render: (v: unknown) => <span style={{ fontSize: 14, fontWeight: 700, color: '#34d399' }}>{formatCurrency(Number(v))}</span> },
    { key: 'payment_method', label: 'Method', render: (v: unknown) => <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{String(v).replace('_', ' ')}</span> },
    { key: 'mobile_money_provider', label: 'Provider', render: (v: unknown) => <span style={{ fontSize: 13 }}>{v ? String(v).toUpperCase() : '—'}</span> },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Date', render: (v: unknown) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(String(v))}</span> },
  ];

  const totalCollected = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" userName={profile?.full_name || 'Admin'} />
      <div className="dashboard-content">
        <TopBar title="Payment Management" />
        <main className="dashboard-main">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Transactions', value: payments.length, color: '#60a5fa' },
              { label: 'Total Collected', value: formatCurrency(totalCollected), color: '#34d399' },
              { label: 'Failed', value: payments.filter(p => p.status === 'failed').length, color: '#ef4444' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> Record Payment</button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>All Payments ({payments.length})</h3>
            </div>
            <div style={{ padding: '16px 24px 24px' }}><DataTable columns={columns} data={payments} loading={loading} emptyMessage="No payments recorded." /></div>
          </div>
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Payment"
            footer={<><button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button><button onClick={handleRecord} className="btn btn-primary">Record</button></>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group"><label className="form-label">Customer *</label>
                <select className="form-select" value={form.customer_id} onChange={(e) => onCustomerChange(e.target.value)}>
                  <option value="">— Select —</option>{customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Bill (optional)</label>
                <select className="form-select" value={form.bill_id} onChange={(e) => { setForm(f => ({ ...f, bill_id: e.target.value })); const b = bills.find(b => b.id === e.target.value); if (b) setForm(f => ({ ...f, amount: String(b.balance_due) })); }}>
                  <option value="">— No specific bill —</option>{bills.map(b => <option key={b.id} value={b.id}>{b.bill_number} ({formatCurrency(b.balance_due)} due)</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Amount (XAF) *</label><input type="number" className="form-input" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label className="form-label">Method</label>
                  <select className="form-select" value={form.payment_method} onChange={(e) => setForm(f => ({ ...f, payment_method: e.target.value }))}>
                    <option value="cash">Cash</option><option value="mobile_money">Mobile Money</option><option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                {form.payment_method === 'mobile_money' && (
                  <div className="form-group"><label className="form-label">Provider</label>
                    <select className="form-select" value={form.mobile_money_provider} onChange={(e) => setForm(f => ({ ...f, mobile_money_provider: e.target.value }))}>
                      <option value="mtn">MTN MoMo</option><option value="orange">Orange Money</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="form-group"><label className="form-label">Notes</label><input className="form-input" value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" /></div>
            </div>
          </Modal>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
