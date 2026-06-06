'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  Sun, LayoutDashboard, Users, Zap, FileText, CreditCard,
  AlertTriangle, Wrench, BarChart3, Settings, Bell, LogOut,
  ChevronDown, Menu, X, Battery, MapPin, Gauge, Building2,
  ClipboardList, UserCog, Activity
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  children?: NavItem[];
}

interface SidebarProps {
  role: 'customer' | 'operator' | 'technician' | 'admin';
  userName: string;
  unreadNotifications?: number;
}

const customerNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Meter', href: '/dashboard/meter', icon: Gauge },
  { label: 'Energy Usage', href: '/dashboard/energy', icon: Zap },
  { label: 'Bills & Invoices', href: '/dashboard/bills', icon: FileText },
  { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { label: 'Buy Credits', href: '/dashboard/credits', icon: Battery },
  { label: 'Complaints', href: '/dashboard/complaints', icon: AlertTriangle },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', href: '/dashboard/profile', icon: Settings },
];

const adminNav: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Microgrid Sites', href: '/admin/sites', icon: MapPin },
  { label: 'Smart Meters', href: '/admin/meters', icon: Gauge },
  { label: 'Solar Generation', href: '/admin/generation', icon: Sun },
  { label: 'Battery Storage', href: '/admin/batteries', icon: Battery },
  { label: 'Tariffs', href: '/admin/tariffs', icon: CreditCard },
  { label: 'Bills', href: '/admin/bills', icon: FileText },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Complaints', href: '/admin/complaints', icon: AlertTriangle },
  { label: 'Maintenance', href: '/admin/maintenance', icon: Wrench },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'User Management', href: '/admin/users', icon: UserCog },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const technicianNav: NavItem[] = [
  { label: 'Dashboard', href: '/technician', icon: LayoutDashboard },
  { label: 'My Tasks', href: '/technician/tasks', icon: ClipboardList },
  { label: 'Maintenance', href: '/technician/maintenance', icon: Wrench },
  { label: 'Equipment Status', href: '/technician/equipment', icon: Activity },
  { label: 'Site Overview', href: '/technician/sites', icon: Building2 },
  { label: 'Profile', href: '/technician/profile', icon: Settings },
];

export default function Sidebar({ role, userName, unreadNotifications = 0 }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems =
    role === 'customer' ? customerNav :
    role === 'technician' ? technicianNav :
    adminNav;

  const homeHref =
    role === 'customer' ? '/dashboard' :
    role === 'technician' ? '/technician' :
    '/admin';

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 btn btn-secondary p-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn('sidebar', isOpen && 'open')}>
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <Link href={homeHref} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Sun size={22} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-base" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
                SolarGrid
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {role === 'customer' ? 'Customer Portal' :
                 role === 'technician' ? 'Technician Portal' :
                 'Admin Console'}
              </p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 mx-4 mt-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{userName}</p>
              <p className="text-xs capitalize" style={{ color: '#f59e0b' }}>{role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-4 mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
              Navigation
            </p>
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('sidebar-link', isActive && 'active')}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.label === 'Notifications' && unreadNotifications > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-400"
            style={{ margin: 0, width: '100%' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
