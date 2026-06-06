'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import ToastContainer, { toast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import { AlertTriangle, Plus } from 'lucide-react';
import { formatDate, getStatusColor, generateTicketNumber, cn } from '@/lib/utils';

export default function CustomerComplaints() {
  const [profile, setProfile] = useState<{ full_name: string; role: string; id: string } | null>(null);
  const [customer, setCustomer] = useState<{ id: string } | null>(null);
  const [complaints, setComplaints] = useState<{ id: string; ticket_number: string; subject: string; category: string; priority: string; status: string; description: string; created_at: string; resolved_at: string | null }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subject: '', category: 'power_outage', priority: 'medium', description: '' });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      const { data: cust } = await supabase.from('customers').select('id').eq('profile_id', user.id).single();
      setCustomer(cust);
      if (cust) {
        const { data } = await supabase.from('complaints').select('*').eq('customer_id', cust.id).order('created_at', { ascending: false });
        setComplaints(data || []);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSubmit = async () => {
    if (!customer || !form.subject || !form.description) { toast.error('Fill all fields'); return; }
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customer.id, ...form, ticket_number: generateTicketNumber() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error('Error', data.error); return; }
      toast.success('Complaint Submitted', `Ticket ${data.data.ticket_number} created.`);
      setComplaints(prev => [data.data, ...prev]);
      setShowModal(false);
      setForm({ subject: '', category: 'power_outage', priority: 'medium', description: '' });
    } catch { toast.error('Error submitting complaint'); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="customer" userName={profile?.full_name || 'Customer'} />
      <div className="dashboard-content">
        <TopBar title="My Complaints" subtitle="Report issues and track resolutions" />
        <main className="dashboard-main">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> Report Issue</button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)}
            </div>
          ) : complaints.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
              <AlertTriangle size={48} style={{ color: '#f59e0b', margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Complaints</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>You haven&apos;t filed any complaints. Use the button above to report an issue.</p>
              <button onClick={() => setShowModal(true)} className="btn btn-primary">Report Issue</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {complaints.map((c) => (
                <div key={c.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 4 }}>{c.ticket_number}</span>
                        <span className={cn('badge', getStatusColor(c.priority))} style={{ fontSize: 11 }}>{c.priority}</span>
                        <span className={cn('badge', getStatusColor(c.status))} style={{ fontSize: 11 }}>{c.status.replace('_', ' ')}</span>
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{c.subject}</h4>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.description}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                        Filed: {formatDate(c.created_at)}
                        {c.resolved_at && ` · Resolved: ${formatDate(c.resolved_at)}`}
                      </p>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{c.category.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Report New Issue"
            footer={<><button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button><button onClick={handleSubmit} className="btn btn-primary">Submit</button></>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group"><label className="form-label">Subject *</label><input className="form-input" value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of the issue" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="power_outage">Power Outage</option>
                    <option value="billing_dispute">Billing Dispute</option>
                    <option value="meter_fault">Meter Fault</option>
                    <option value="connection_issue">Connection Issue</option>
                    <option value="voltage_fluctuation">Voltage Fluctuation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Description *</label><textarea className="form-input" rows={4} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the problem in detail..." /></div>
            </div>
          </Modal>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
