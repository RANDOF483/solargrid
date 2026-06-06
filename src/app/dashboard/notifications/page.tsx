'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import ToastContainer from '@/components/ui/Toast';
import { Bell, CheckCircle } from 'lucide-react';
import { timeAgo, cn } from '@/lib/utils';

type NotifType = 'info' | 'warning' | 'alert' | 'success' | 'bill' | 'payment' | 'outage' | 'maintenance';

interface Notif {
  id: string;
  title: string;
  message: string;
  type: NotifType;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

const typeColors: Record<NotifType, string> = {
  info: '#60a5fa', warning: '#fbbf24', alert: '#f87171', success: '#34d399',
  bill: '#f59e0b', payment: '#34d399', outage: '#ef4444', maintenance: '#a78bfa',
};

const typeEmoji: Record<NotifType, string> = {
  info: 'ℹ️', warning: '⚠️', alert: '🚨', success: '✅',
  bill: '📄', payment: '💳', outage: '⚡', maintenance: '🔧',
};

export default function CustomerNotifications() {
  const [profile, setProfile] = useState<{ full_name: string; role: string; id: string } | null>(null);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setNotifications(data || []);
      setLoading(false);
    };
    init();
  }, []);

  const markAllRead = async () => {
    const supabase = createClient();
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile?.id || '');
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="dashboard-layout">
      <Sidebar role="customer" userName={profile?.full_name || 'Customer'} unreadNotifications={unreadCount} />
      <div className="dashboard-content">
        <TopBar title="Notifications" subtitle={`${unreadCount} unread`} unreadNotifications={unreadCount} />
        <main className="dashboard-main">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn btn-secondary btn-sm"><CheckCircle size={14} /> Mark all read</button>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
              <Bell size={48} style={{ color: '#f59e0b', margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No notifications yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>Notifications about your account, bills, and outages will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notifications.map(notif => {
                const color = typeColors[notif.type];
                const emoji = typeEmoji[notif.type];
                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.is_read && markRead(notif.id)}
                    style={{
                      display: 'flex', gap: 14, padding: '16px 18px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                      background: notif.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(245,158,11,0.04)',
                      border: `1px solid ${notif.is_read ? 'var(--border-color)' : 'rgba(245,158,11,0.15)'}`,
                    }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 14, fontWeight: notif.is_read ? 500 : 700, color: 'var(--text-primary)' }}>{notif.title}</p>
                        {!notif.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{notif.message}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{timeAgo(notif.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
