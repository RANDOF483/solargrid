'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/ui/StatCard';
import ToastContainer from '@/components/ui/Toast';
import {
  Users, Zap, Battery, DollarSign, FileText, AlertTriangle,
  Sun, Activity, TrendingUp, MapPin, Gauge, Wrench
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, Legend
} from 'recharts';
import { formatCurrency, formatEnergy, formatDate, getStatusColor, cn } from '@/lib/utils';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1a2234', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ color: '#9ca3af', fontSize: 12, marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
            {p.name}: {typeof p.value === 'number' && p.name.includes('Revenue') ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Mock data generators
const generateRevenueData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((m) => ({
    month: m,
    revenue: Math.floor(Math.random() * 4000000 + 1000000),
    billed: Math.floor(Math.random() * 3500000 + 800000),
  }));
};

const generateGenerationData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((d) => ({
    day: d,
    generated: parseFloat((80 + Math.random() * 70).toFixed(1)),
    consumed: parseFloat((60 + Math.random() * 60).toFixed(1)),
  }));
};

const batteryData = [
  { name: 'Site A', value: 75 },
  { name: 'Site B', value: 62 },
  { name: 'Site C', value: 88 },
];

const categoryData = [
  { name: 'Residential', value: 320 },
  { name: 'Commercial', value: 95 },
  { name: 'Industrial', value: 12 },
];

export default function AdminDashboard() {
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeConnections: 0,
    pendingApprovals: 0,
    openComplaints: 0,
    unpaidBills: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    activeSites: 0,
    avgBatteryLevel: 68.5,
    totalGenerationToday: 142.8,
  });
  const [recentComplaints, setRecentComplaints] = useState<{ ticket_number: string; subject: string; status: string; priority: string; customer?: { full_name: string } }[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<{ full_name: string; customer_number: string; connection_status: string; created_at: string; category: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const revenueData = generateRevenueData();
  const generationData = generateGenerationData();

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      // Fetch stats in parallel
      const [
        { count: totalCust },
        { count: activeCust },
        { count: openCompl },
        { count: unpaidBillCount },
        { count: activeSiteCount },
        complRes,
        custRes,
      ] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('customers').select('*', { count: 'exact', head: true }).eq('connection_status', 'active'),
        supabase.from('complaints').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
        supabase.from('bills').select('*', { count: 'exact', head: true }).eq('status', 'unpaid'),
        supabase.from('microgrid_sites').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('complaints').select('*, customer:customers(full_name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('customers').select('*').order('created_at', { ascending: false }).limit(6),
      ]);

      setStats((prev) => ({
        ...prev,
        totalCustomers: totalCust || 427,
        activeConnections: activeCust || 389,
        openComplaints: openCompl || 12,
        unpaidBills: unpaidBillCount || 34,
        activeSites: activeSiteCount || 3,
        totalRevenue: 28450000,
        todayRevenue: 850000,
        pendingApprovals: 8,
      }));

      setRecentComplaints(complRes.data || []);
      setRecentCustomers(custRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" userName={profile?.full_name || 'Administrator'} />
      <div className="dashboard-content">
        <TopBar title="Admin Dashboard" subtitle="System overview and analytics" />
        <main className="dashboard-main">

          {/* Live System Status Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 20px', borderRadius: 14, marginBottom: 28, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', flexWrap: 'wrap' }}>
            {[
              { label: 'Grid Status', value: 'Operational', color: '#34d399', dot: true },
              { label: 'Solar Output', value: '142.8 kW', color: '#f59e0b', dot: false },
              { label: 'Avg Battery', value: '68.5%', color: '#60a5fa', dot: false },
              { label: 'Active Meters', value: '389', color: '#a78bfa', dot: false },
              { label: 'Load Factor', value: '78.2%', color: '#34d399', dot: false },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {item.dot && <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} className="solar-pulse" />}
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
            <StatCard title="Total Customers" value={stats.totalCustomers.toLocaleString()} icon={Users} gradient="blue" trend={8.2} trendLabel="new this month" />
            <StatCard title="Active Connections" value={stats.activeConnections.toLocaleString()} icon={Activity} gradient="green" trend={2.1} />
            <StatCard title="Daily Revenue" value={formatCurrency(stats.todayRevenue)} icon={DollarSign} gradient="amber" trend={12.5} />
            <StatCard title="Solar Generated" value={`${stats.totalGenerationToday} kWh`} icon={Sun} gradient="amber" trend={-3.4} trendLabel="vs yesterday" />
            <StatCard title="Battery Avg" value={`${stats.avgBatteryLevel}%`} icon={Battery} gradient="blue" />
            <StatCard title="Open Complaints" value={stats.openComplaints} icon={AlertTriangle} gradient={stats.openComplaints > 10 ? 'red' : 'amber'} />
            <StatCard title="Unpaid Bills" value={stats.unpaidBills} icon={FileText} gradient={stats.unpaidBills > 20 ? 'red' : 'amber'} />
            <StatCard title="Active Sites" value={stats.activeSites} icon={MapPin} gradient="green" />
          </div>

          {/* Charts Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
            {/* Revenue chart */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Monthly Revenue</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Billed vs Collected (XAF)</p>
                </div>
                <DollarSign size={18} style={{ color: '#f59e0b' }} />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue (XAF)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="billed" name="Billed (XAF)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Customer category pie */}
            <div className="card">
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Customers by Type</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Distribution breakdown</p>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {categoryData.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i] }} />
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            {/* Solar generation */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Generation vs Demand</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This week (kWh)</p>
                </div>
                <Sun size={18} style={{ color: '#fbbf24' }} />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={generationData}>
                  <defs>
                    <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="generated" name="Generated" stroke="#fbbf24" fill="url(#genGrad)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="consumed" name="Consumed" stroke="#60a5fa" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Battery levels */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Battery Levels</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>State of charge per site</p>
                </div>
                <Battery size={18} style={{ color: '#10b981' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 8 }}>
                {batteryData.map((bat, i) => {
                  const color = bat.value >= 70 ? '#10b981' : bat.value >= 40 ? '#f59e0b' : '#ef4444';
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{bat.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color }}>{bat.value}%</span>
                      </div>
                      <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${bat.value}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`, borderRadius: 5, transition: 'width 1.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 28 }}>
                {[
                  { label: 'Generate Bills', href: '/admin/bills', color: '#f59e0b', icon: FileText },
                  { label: 'View Complaints', href: '/admin/complaints', color: '#ef4444', icon: AlertTriangle },
                  { label: 'Add Customer', href: '/admin/customers', color: '#10b981', icon: Users },
                  { label: 'Add Meter', href: '/admin/meters', color: '#60a5fa', icon: Gauge },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <a key={action.label} href={action.href} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', borderRadius: 10, textDecoration: 'none',
                      background: `${action.color}11`, border: `1px solid ${action.color}30`, transition: 'all 0.2s',
                    }}>
                      <Icon size={18} style={{ color: action.color }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: action.color, textAlign: 'center' }}>{action.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Recent complaints */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Complaints</h3>
                <a href="/admin/complaints" style={{ fontSize: 13, color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentComplaints.length === 0 ? (
                  // Sample data if empty
                  [
                    { ticket_number: 'TKT-2406-00001', subject: 'Power fluctuation at night', status: 'open', priority: 'high', customer: { full_name: 'John Ngwa' } },
                    { ticket_number: 'TKT-2406-00002', subject: 'Meter showing wrong reading', status: 'in_progress', priority: 'medium', customer: { full_name: 'Mary Fon' } },
                    { ticket_number: 'TKT-2406-00003', subject: 'No electricity since morning', status: 'escalated', priority: 'critical', customer: { full_name: 'Peter Agha' } },
                  ].map((c) => (
                    <div key={c.ticket_number} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.subject}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.ticket_number} · {c.customer?.full_name}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span className={cn('badge', getStatusColor(c.priority))} style={{ fontSize: 10 }}>{c.priority}</span>
                        <span className={cn('badge', getStatusColor(c.status))} style={{ fontSize: 10 }}>{c.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))
                ) : recentComplaints.map((c) => (
                  <div key={c.ticket_number} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.subject}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.ticket_number} · {c.customer?.full_name}</p>
                    </div>
                    <span className={cn('badge', getStatusColor(c.status))} style={{ fontSize: 10 }}>{c.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Customers */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Customers</h3>
                <a href="/admin/customers" style={{ fontSize: 13, color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(recentCustomers.length === 0 ? [
                  { full_name: 'Ambe Richard', customer_number: 'SGM-26-10021', connection_status: 'active', created_at: new Date().toISOString(), category: 'residential' },
                  { full_name: 'Ngwa Joyce', customer_number: 'SGM-26-10022', connection_status: 'pending', created_at: new Date().toISOString(), category: 'commercial' },
                  { full_name: 'Fon Beltus', customer_number: 'SGM-26-10023', connection_status: 'active', created_at: new Date().toISOString(), category: 'residential' },
                  { full_name: 'Agha Florence', customer_number: 'SGM-26-10024', connection_status: 'suspended', created_at: new Date().toISOString(), category: 'residential' },
                ] : recentCustomers).map((cust, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#1a1a1a', flexShrink: 0 }}>
                      {cust.full_name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cust.full_name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cust.customer_number} · {cust.category}</p>
                    </div>
                    <span className={cn('badge', getStatusColor(cust.connection_status))} style={{ fontSize: 10 }}>
                      {cust.connection_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
