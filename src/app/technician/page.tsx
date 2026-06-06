'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/ui/StatCard';
import ToastContainer, { toast } from '@/components/ui/Toast';
import { Wrench, ClipboardList, CheckCircle, Clock, Activity } from 'lucide-react';
import { formatDate, getStatusColor, cn } from '@/lib/utils';
import type { Complaint, MaintenanceRecord } from '@/lib/types';

export default function TechnicianDashboard() {
  const [profile, setProfile] = useState<{ full_name: string; role: string; id: string } | null>(null);
  const [tasks, setTasks] = useState<Complaint[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);

      const [tasksRes, maintRes] = await Promise.all([
        supabase.from('complaints').select('*, customer:customers(full_name, phone, address)').eq('assigned_to', user.id).in('status', ['open', 'in_progress']).order('created_at', { ascending: false }),
        supabase.from('maintenance_records').select('*, site:microgrid_sites(name, location)').eq('technician_id', user.id).order('scheduled_at', { ascending: true }).limit(10),
      ]);
      setTasks(tasksRes.data || []);
      setMaintenance(maintRes.data || []);
      setLoading(false);
    };
    init();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const supabase = createClient();
    const { error } = await supabase.from('complaints').update({ status, ...(status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}) }).eq('id', id);
    if (!error) {
      toast.success('Task Updated', `Status changed to ${status}`);
      setTasks(t => t.map(task => task.id === id ? { ...task, status: status as Complaint['status'] } : task));
    }
    setUpdatingId(null);
  };

  const resolvedCount = tasks.filter(t => t.status === 'resolved').length;
  const pendingCount = tasks.filter(t => t.status === 'open').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <div className="dashboard-layout">
      <Sidebar role="technician" userName={profile?.full_name || 'Technician'} />
      <div className="dashboard-content">
        <TopBar title="Technician Dashboard" subtitle={`Welcome, ${profile?.full_name?.split(' ')[0] || 'Technician'}`} />
        <main className="dashboard-main">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
            <StatCard title="Assigned Tasks" value={tasks.length} icon={ClipboardList} gradient="blue" />
            <StatCard title="Pending" value={pendingCount} icon={Clock} gradient="amber" />
            <StatCard title="In Progress" value={inProgressCount} icon={Activity} gradient="purple" />
            <StatCard title="Maintenance Jobs" value={maintenance.length} icon={Wrench} gradient="green" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Tasks */}
            <div className="card">
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>My Assigned Tasks</h3>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
                </div>
              ) : tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <CheckCircle size={40} style={{ margin: '0 auto 12px', color: '#34d399' }} />
                  <p>No assigned tasks. You&apos;re all caught up!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {tasks.map((task) => {
                    const cust = task.customer as { full_name: string; phone: string; address: string } | undefined;
                    return (
                      <div key={task.id} style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{task.subject}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.ticket_number} · {cust?.full_name || 'Unknown'}</p>
                            {cust?.address && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>📍 {cust.address}</p>}
                          </div>
                          <span className={cn('badge', getStatusColor(task.priority))} style={{ fontSize: 10, flexShrink: 0 }}>{task.priority}</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{task.description.slice(0, 100)}{task.description.length > 100 ? '...' : ''}</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {task.status === 'open' && (
                            <button onClick={() => updateStatus(task.id, 'in_progress')} disabled={updatingId === task.id} className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>Start Work</button>
                          )}
                          {task.status === 'in_progress' && (
                            <button onClick={() => updateStatus(task.id, 'resolved')} disabled={updatingId === task.id} className="btn btn-success btn-sm" style={{ fontSize: 11 }}>Mark Resolved</button>
                          )}
                          <span className={cn('badge', getStatusColor(task.status))} style={{ fontSize: 10, alignSelf: 'center' }}>{task.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Maintenance Schedule */}
            <div className="card">
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Maintenance Schedule</h3>
              {maintenance.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { title: 'Panel Cleaning — Buea Main Grid', type: 'preventive', date: 'Jun 08, 2026', status: 'scheduled' },
                    { title: 'Battery Inspection — Site A', type: 'inspection', date: 'Jun 10, 2026', status: 'scheduled' },
                    { title: 'Inverter Check — Limbe Hub', type: 'preventive', date: 'Jun 12, 2026', status: 'scheduled' },
                  ].map((m, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</p>
                        <span className={cn('badge', getStatusColor(m.status))} style={{ fontSize: 10 }}>{m.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📅 {m.date}</span>
                        <span style={{ fontSize: 11, color: '#a78bfa' }}>🔧 {m.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {maintenance.map((m) => (
                    <div key={m.id} style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</p>
                        <span className={cn('badge', getStatusColor(m.status))} style={{ fontSize: 10 }}>{m.status}</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {m.scheduled_at ? formatDate(m.scheduled_at) : 'No date set'} · {m.maintenance_type}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
