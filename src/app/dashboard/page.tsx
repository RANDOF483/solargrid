'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/ui/StatCard';
import ToastContainer from '@/components/ui/Toast';
import {
  Zap, Battery, FileText, CreditCard, AlertTriangle, TrendingUp,
  Sun, Activity, Gauge
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import {
  formatCurrency, formatEnergy, formatDate, getStatusColor,
  generateMockEnergyData, cn
} from '@/lib/utils';
import type { Customer, Bill, Payment, Complaint, Notification } from '@/lib/types';

interface DashboardData {
  customer: Customer | null;
  recentBills: Bill[];
  recentPayments: Payment[];
  openComplaints: Complaint[];
  notifications: Notification[];
  energyData: ReturnType<typeof generateMockEnergyData>;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1a2234', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ color: '#9ca3af', fontSize: 12, marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
            {p.name}: {p.value} {p.name === 'cost' ? 'XAF' : 'kWh'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CustomerDashboard() {
  const [data, setData] = useState<DashboardData>({
    customer: null,
    recentBills: [],
    recentPayments: [],
    openComplaints: [],
    notifications: [],
    energyData: generateMockEnergyData(14),
  });
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }

      const [profileRes, customerRes, billsRes, paymentsRes, complaintsRes, notifRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('customers').select('*, site:microgrid_sites(name,location), tariff:tariffs(name,rate_per_kwh), meters:smart_meters(*)').eq('profile_id', user.id).single(),
        supabase.from('bills').select('*').eq('customer_id', (await supabase.from('customers').select('id').eq('profile_id', user.id).single()).data?.id || '').order('generated_at', { ascending: false }).limit(5),
        supabase.from('payments').select('*').eq('customer_id', (await supabase.from('customers').select('id').eq('profile_id', user.id).single()).data?.id || '').order('created_at', { ascending: false }).limit(5),
        supabase.from('complaints').select('*').eq('customer_id', (await supabase.from('customers').select('id').eq('profile_id', user.id).single()).data?.id || '').in('status', ['open', 'in_progress']).limit(5),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      ]);

      setProfile(profileRes.data);
      setData((prev) => ({
        ...prev,
        customer: customerRes.data,
        recentBills: billsRes.data || [],
        recentPayments: paymentsRes.data || [],
        openComplaints: complaintsRes.data || [],
        notifications: notifRes.data || [],
      }));
      setLoading(false);
    };

    fetchData();
  }, []);

  const customer = data.customer;
  const unreadNotifications = data.notifications.filter((n) => !n.is_read).length;
  const totalBillsDue = data.recentBills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.balance_due, 0);

  const solarData = [
    { time: '06:00', generation: 2, demand: 5 },
    { time: '08:00', generation: 25, demand: 18 },
    { time: '10:00', generation: 65, demand: 22 },
    { time: '12:00', generation: 90, demand: 28 },
    { time: '14:00', generation: 75, demand: 32 },
    { time: '16:00', generation: 50, demand: 35 },
    { time: '18:00', generation: 15, demand: 42 },
    { time: '20:00', generation: 0, demand: 38 },
    { time: '22:00', generation: 0, demand: 20 },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar role="customer" userName={profile?.full_name || 'Customer'} unreadNotifications={unreadNotifications} />
      <div className="dashboard-content">
        <TopBar
          title="Customer Dashboard"
          subtitle={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'Customer'}!`}
          unreadNotifications={unreadNotifications}
        />
        <main className="dashboard-main">
          {/* Account Status Banner */}
          {customer && (
            <div style={{
              padding: '16px 24px',
              borderRadius: 14,
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              background: customer.connection_status === 'active'
                ? 'rgba(16,185,129,0.08)'
                : 'rgba(245,158,11,0.08)',
              border: `1px solid ${customer.connection_status === 'active' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: customer.connection_status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={18} style={{ color: customer.connection_status === 'active' ? '#34d399' : '#f59e0b' }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Account: {customer.customer_number}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {customer.category} · {customer.site?.name || 'No site assigned'}
                  </p>
                </div>
              </div>
              <span className={cn('badge', getStatusColor(customer.connection_status))}>
                {customer.connection_status.replace('_', ' ')}
              </span>
            </div>
          )}

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
            <StatCard
              title="Energy Balance"
              value={formatEnergy(customer?.energy_balance_kwh || 0)}
              subtitle="Available credit"
              icon={Battery}
              gradient="green"
              trend={5.2}
              trendLabel="vs last month"
            />
            <StatCard
              title="Credit Balance"
              value={formatCurrency(customer?.credit_balance || 0)}
              subtitle="Account balance"
              icon={CreditCard}
              gradient="blue"
            />
            <StatCard
              title="Bills Due"
              value={formatCurrency(totalBillsDue)}
              subtitle={`${data.recentBills.filter(b => b.status !== 'paid').length} outstanding bills`}
              icon={FileText}
              gradient={totalBillsDue > 0 ? 'red' : 'green'}
            />
            <StatCard
              title="Open Complaints"
              value={data.openComplaints.length}
              subtitle="Awaiting resolution"
              icon={AlertTriangle}
              gradient={data.openComplaints.length > 0 ? 'amber' : 'green'}
            />
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
            {/* Energy consumption chart */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    Energy Consumption
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last 14 days (kWh)</p>
                </div>
                <Zap size={18} style={{ color: '#f59e0b' }} />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.energyData}>
                  <defs>
                    <linearGradient id="consumptionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="consumption" name="consumption" stroke="#f59e0b" fill="url(#consumptionGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Solar generation today */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    Solar Generation Today
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>kW output vs demand</p>
                </div>
                <Sun size={18} style={{ color: '#fbbf24' }} />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={solarData}>
                  <defs>
                    <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="generation" name="Generation (kW)" stroke="#fbbf24" fill="url(#solarGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="demand" name="Demand (kW)" stroke="#60a5fa" fill="url(#demandGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Recent Bills */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Bills</h3>
                <a href="/dashboard/bills" style={{ fontSize: 13, color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
              </div>
              {data.recentBills.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No bills yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {data.recentBills.slice(0, 4).map((bill) => (
                    <div key={bill.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{bill.bill_number}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(bill.generated_at)}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(bill.total_amount)}</p>
                        <span className={cn('badge', getStatusColor(bill.status))} style={{ fontSize: 10 }}>{bill.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</h3>
                <a href="/dashboard/notifications" style={{ fontSize: 13, color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
              </div>
              {data.notifications.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No notifications</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.notifications.slice(0, 5).map((notif) => {
                    const colors: Record<string, string> = { info: '#60a5fa', warning: '#fbbf24', alert: '#f87171', success: '#34d399', bill: '#f59e0b', payment: '#34d399', outage: '#f87171', maintenance: '#a78bfa' };
                    return (
                      <div key={notif.id} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, background: notif.is_read ? 'transparent' : 'rgba(245,158,11,0.05)', border: '1px solid var(--border-color)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[notif.type] || '#9ca3af', marginTop: 5, flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: notif.is_read ? 400 : 600, color: 'var(--text-primary)' }}>{notif.title}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{notif.message.slice(0, 80)}{notif.message.length > 80 ? '...' : ''}</p>
                        </div>
                      </div>
                    );
                  })}
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
