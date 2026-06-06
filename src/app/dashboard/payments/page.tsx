'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import ToastContainer, { toast } from '@/components/ui/Toast';
import { CreditCard, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils';
import type { Payment, Bill } from '@/lib/types';

export default function CustomerPayments() {
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [customer, setCustomer] = useState<{ id: string; profile_id: string } | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [unpaidBills, setUnpaidBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<Bill | null>(null);
  const [payForm, setPayForm] = useState({ method: 'mobile_money', provider: 'mtn', amount: '' });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      const { data: cust } = await supabase.from('customers').select('id, profile_id').eq('profile_id', user.id).single();
      setCustomer(cust);
      if (cust) {
        const [payRes, billRes] = await Promise.all([
          supabase.from('payments').select('*').eq('customer_id', cust.id).order('created_at', { ascending: false }),
          supabase.from('bills').select('*').eq('customer_id', cust.id).in('status', ['unpaid', 'partial', 'overdue']).order('due_date', { ascending: true }),
        ]);
        setPayments(payRes.data || []);
        setUnpaidBills(billRes.data || []);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handlePay = async () => {
    if (!customer || !paying) return;
    const amount = parseFloat(payForm.amount) || paying.balance_due;
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customer.id, bill_id: paying.id, amount, payment_method: payForm.method, mobile_money_provider: payForm.provider }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error('Payment failed', data.error); return; }
      toast.success('Payment Successful!', `${formatCurrency(amount)} paid. Ref: ${data.data.payment_reference}`);
      setPaying(null);
      setUnpaidBills(prev => prev.filter(b => b.id !== paying.id));
      setPayments(prev => [data.data, ...prev]);
    } catch { toast.error('Payment Error', 'Try again later'); }
  };

  const totalPaid = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const totalDue = unpaidBills.reduce((s, b) => s + b.balance_due, 0);

  return (
    <div className="dashboard-layout">
      <Sidebar role="customer" userName={profile?.full_name || 'Customer'} />
      <div className="dashboard-content">
        <TopBar title="Payments" subtitle="Pay bills and view payment history" />
        <main className="dashboard-main">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
            {[
              { label: 'Total Paid', value: formatCurrency(totalPaid), color: '#34d399', icon: '✓' },
              { label: 'Outstanding', value: formatCurrency(totalDue), color: '#ef4444', icon: '!' },
              { label: 'Transactions', value: payments.length, color: '#60a5fa', icon: '#' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: s.color, fontWeight: 800 }}>{s.icon}</div>
                <div><p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</p><p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</p></div>
              </div>
            ))}
          </div>

          {/* Unpaid Bills */}
          {unpaidBills.length > 0 && (
            <div className="card" style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Outstanding Bills</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {unpaidBills.map((bill) => (
                  <div key={bill.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{bill.bill_number}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due: {bill.due_date ? formatDate(bill.due_date) : 'N/A'} · {bill.consumption_kwh?.toFixed(2)} kWh</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: '#ef4444' }}>{formatCurrency(bill.balance_due)}</p>
                        <span className={cn('badge', getStatusColor(bill.status))} style={{ fontSize: 10 }}>{bill.status}</span>
                      </div>
                      <button onClick={() => { setPaying(bill); setPayForm(f => ({ ...f, amount: String(bill.balance_due) })); }} className="btn btn-primary btn-sm">Pay Now</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment History */}
          <div className="card">
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Payment History</h3>
            {payments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>No payments yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {payments.map((p) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', items: 'center', gap: 12 }}>
                      <CreditCard size={18} style={{ color: '#60a5fa', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.payment_reference}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.payment_method.replace('_', ' ')} · {p.mobile_money_provider?.toUpperCase()} · {formatDate(p.created_at)}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#34d399' }}>{formatCurrency(p.amount)}</p>
                      <span className={cn('badge', getStatusColor(p.status))} style={{ fontSize: 10 }}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Modal */}
          {paying && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: 420 }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>Make Payment</h2>
                <div style={{ padding: 16, borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Bill {paying.bill_number}</p>
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b', fontFamily: 'Outfit, sans-serif' }}>{formatCurrency(paying.balance_due)}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group"><label className="form-label">Payment Method</label>
                    <select className="form-select" value={payForm.method} onChange={(e) => setPayForm(f => ({ ...f, method: e.target.value }))}>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                  {payForm.method === 'mobile_money' && (
                    <>
                      <div className="form-group"><label className="form-label">Provider</label>
                        <select className="form-select" value={payForm.provider} onChange={(e) => setPayForm(f => ({ ...f, provider: e.target.value }))}>
                          <option value="mtn">MTN Mobile Money</option>
                          <option value="orange">Orange Money</option>
                          <option value="camtel">Camtel</option>
                        </select>
                      </div>
                      <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.2)', marginTop: -6 }}>
                        <p style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          Please send the Mobile Money payment to <strong style={{ color: '#34d399', fontSize: 14 }}>671 17 64 36</strong>.<br/>
                          <span style={{ color: 'var(--text-muted)' }}>You can also reach us on WhatsApp at this same number for support.</span>
                        </p>
                      </div>
                    </>
                  )}
                  <div className="form-group"><label className="form-label">Amount (XAF)</label>
                    <input type="number" className="form-input" value={payForm.amount} onChange={(e) => setPayForm(f => ({ ...f, amount: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button onClick={() => setPaying(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button onClick={handlePay} className="btn btn-primary" style={{ flex: 2 }}>Confirm Payment</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
