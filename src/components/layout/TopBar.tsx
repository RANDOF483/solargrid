'use client';

import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  unreadNotifications?: number;
}

export default function TopBar({ title, subtitle, unreadNotifications = 0 }: TopBarProps) {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <header className="dashboard-header">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm w-48"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="btn btn-ghost p-2"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="btn btn-ghost p-2 relative notification-dot" aria-label="Notifications">
          <Bell size={18} />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>

        {/* Time indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 solar-pulse" />
          <span className="text-xs font-medium" style={{ color: '#f59e0b' }}>Live</span>
        </div>
      </div>
    </header>
  );
}
