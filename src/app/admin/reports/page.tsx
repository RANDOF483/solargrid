'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import ToastContainer from '@/components/ui/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatCurrency, generateMockEnergyData } from '@/lib/utils';
import { Download, TrendingUp, BarChart3, Activity } from 'lucide-react';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

const monthlyRevenue = [
  { month: 'Jan', revenue: 1250000, customers: 42 },
  { month: 'Feb', revenue: 1450000, customers: 51 },
  { month: 'Mar', revenue: 1380000, customers: 58 },
  { month: 'Apr', revenue: 1620000, customers: 65 },
  { month: 'May', revenue: 1890000, customers: 78 },
  { month: 'Jun', revenue: 2140000, customers: 92 },
];

const solarEfficiency = [
  { day: 'Mon', efficiency: 82, generation: 145 },
  { day: 'Tue', efficiency: 78, generation: 138 },
  { day: 'Wed', efficiency: 91, generation: 162 },
  { day: 'Thu', efficiency: 85, generation: 151 },
  { day: 'Fri', efficiency: 76, generation: 134 },
  { day: 'Sat', efficiency: 88, generation: 156 },
  { day: 'Sun', efficiency: 94, generation: 167 },
];

const categoryRevenue = [
  { name: 'Residential', value: 45 },
  { name: 'Commercial', value: 35 },
  { name: 'Industrial', value: 20 },
];

export default function ReportsPage() {
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const energyData = generateMockEnergyData(30);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
    };
    init();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" userName={profile?.full_name || 'Admin'} />
      <div className="dashboard-content">
        <TopBar title="Reports & Analytics" subtitle="Comprehensive platform insights" />
        <main className="dashboard-main">
          {/* Export buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginBottom: 28 }}>
            <button className="btn btn-secondary btn-sm"><Download size={14} /> Export PDF</button>
            <button className="btn btn-secondary btn-sm"><Download size={14} /> Export Excel</button>
          </div>

          {/* KPI summary row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Revenue (YTD)', value: formatCurrency(9730000), trend: '+24%', color: '#f59e0b' },
              { label: 'kWh Generated (YTD)', value: '987,420 kWh', trend: '+18%', color: '#34d399' },
              { label: 'Customer Growth', value: '427 total', trend: '+38%', color: '#60a5fa' },
              { label: 'System Efficiency', value: '84.7%', trend: '+2.1%', color: '#a78bfa' },
            ].map((k, i) => (
              <div key={i} className="card" style={{ padding: '20px 18px' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 22, fontWeight: 800, color: k.color, marginBottom: 2 }}>{k.value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{k.label}</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '2px 8px', borderRadius: 99 }}>{k.trend}</span>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
            <div className="card">
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Revenue & Customer Growth</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue (XAF)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="customers" name="Customers" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Revenue by Category</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryRevenue} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                    {categoryRevenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="card">
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>30-Day Energy Consumption</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={energyData}>
                  <defs>
                    <linearGradient id="rptGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="consumption" name="kWh" stroke="#f59e0b" fill="url(#rptGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Solar Efficiency (This Week)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={solarEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="efficiency" name="Efficiency %" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="generation" name="Generation kWh" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
