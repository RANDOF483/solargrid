'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import ToastContainer, { toast } from '@/components/ui/Toast';
import { formatDate, getStatusColor, cn } from '@/lib/utils';
import type { Complaint } from '@/lib/types';

export default function ComplaintsPage() {
  const [profile, setProfile] = useState<{ full_name: string; role: string; id: string } | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [technicians, setTechnicians] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: '', assigned_to: '', resolution: '' });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      await fetchComplaints();
      const { data: techData } = await supabase.from('profiles').select('id, full_name').in('role', ['technician', 'operator', 'admin']);
      setTechnicians(techData || []);
      setLoading(false);
    };
    init();
  }, []);

  const fetchComplaints = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('complaints').select('*, customer:customers(full_name, customer_number, phone), assignee:profiles!assigned_to(full_name)').order('created_at', { ascending: false });
    setComplaints(data || []);
  };

  const openDetail = (c: Complaint) => {
    setSelected(c);
    setUpdateForm({ status: c.status, assigned_to: c.assigned_to || '', resolution: c.resolution || '' });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    try {
      const res = await fetch('/api/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, ...updateForm }),
      });
      if (!res.ok) { toast.error('Update Failed'); return; }
      toast.success('Complaint Updated');
      setShowModal(false);
      await fetchComplaints();
    } catch { toast.error('Error'); }
  };

  const priorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-amber-500 text-black',
      low: 'bg-blue-500 text-white',
    };
    return <span className={cn('badge', styles[priority] || '')}>{priority}</span>;
  };

  const columns: any[] = [
    { key: 'ticket_number', label: 'Ticket', render: (_: unknown, row: Complaint) => <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#f59e0b' }}>{row.ticket_number}</span> },
    { key: 'customer', label: 'Customer', render: (_: unknown, row: Complaint & { customer?: { full_name: string; phone: string } }) => <div><p style={{ fontSize: 13, fontWeight: 600 }}>{row.customer?.full_name || '—'}</p><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.customer?.phone}</p></div> },
    { key: 'subject', label: 'Subject', render: (v: unknown) => <span style={{ fontSize: 13, maxWidth: 200, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{String(v)}</span> },
    { key: 'category', label: 'Category', render: (v: unknown) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{String(v).replace(/_/g, ' ')}</span> },
    { key: 'priority', label: 'Priority', render: (v: unknown) => priorityBadge(String(v)) },
    { key: 'status', label: 'Status' },
    { key: 'assignee', label: 'Assigned To', render: (_: unknown, row: Complaint & { assignee?: { full_name: string } }) => <span style={{ fontSize: 13 }}>{row.assignee?.full_name || 'Unassigned'}</span> },
    { key: 'created_at', label: 'Date', render: (v: unknown) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(String(v))}</span> },
  ];

  const openCount = complaints.filter(c => c.status === 'open').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" userName={profile?.full_name || 'Admin'} />
      <div className="dashboard-content">
        <TopBar title="Complaint Management" subtitle="Track and resolve customer issues" />
        <main className="dashboard-main">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total', value: complaints.length, color: '#60a5fa' },
              { label: 'Open', value: openCount, color: '#ef4444' },
              { label: 'In Progress', value: inProgressCount, color: '#f59e0b' },
              { label: 'Resolved', value: resolvedCount, color: '#34d399' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>All Complaints</h3>
            </div>
            <div style={{ padding: '16px 24px 24px' }}>
              <DataTable columns={columns} data={complaints} loading={loading} emptyMessage="No complaints filed."
                actions={(row: Complaint) => (
                  <button onClick={() => openDetail(row)} className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>Manage</button>
                )}
              />
            </div>
          </div>

          {selected && (
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Complaint — ${selected.ticket_number}`} size="lg"
              footer={<><button onClick={() => setShowModal(false)} className="btn btn-secondary">Close</button><button onClick={handleUpdate} className="btn btn-primary">Update</button></>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>{selected.subject}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selected.description}</p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <span className={cn('badge', getStatusColor(selected.priority))}>{selected.priority}</span>
                    <span className={cn('badge', getStatusColor(selected.category))}>{selected.category.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group"><label className="form-label">Status</label>
                    <select className="form-select" value={updateForm.status} onChange={(e) => setUpdateForm(f => ({ ...f, status: e.target.value }))}>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                      <option value="escalated">Escalated</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Assign Technician</label>
                    <select className="form-select" value={updateForm.assigned_to} onChange={(e) => setUpdateForm(f => ({ ...f, assigned_to: e.target.value }))}>
                      <option value="">— Unassigned —</option>
                      {technicians.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Resolution Notes</label>
                  <textarea className="form-input" rows={3} value={updateForm.resolution} onChange={(e) => setUpdateForm(f => ({ ...f, resolution: e.target.value }))} placeholder="Describe how the issue was resolved..." />
                </div>
              </div>
            </Modal>
          )}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
