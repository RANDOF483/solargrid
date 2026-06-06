'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
  trend?: number; // percentage change
  trendLabel?: string;
  gradient?: 'amber' | 'blue' | 'green' | 'purple' | 'red';
  className?: string;
}

const gradients = {
  amber: 'from-amber-500/20 to-amber-600/5',
  blue: 'from-blue-500/20 to-blue-600/5',
  green: 'from-emerald-500/20 to-emerald-600/5',
  purple: 'from-purple-500/20 to-purple-600/5',
  red: 'from-red-500/20 to-red-600/5',
};

const iconBg = {
  amber: 'bg-amber-500/20 text-amber-400',
  blue: 'bg-blue-500/20 text-blue-400',
  green: 'bg-emerald-500/20 text-emerald-400',
  purple: 'bg-purple-500/20 text-purple-400',
  red: 'bg-red-500/20 text-red-400',
};

const borderColors = {
  amber: 'rgba(245,158,11,0.2)',
  blue: 'rgba(59,130,246,0.2)',
  green: 'rgba(16,185,129,0.2)',
  purple: 'rgba(139,92,246,0.2)',
  red: 'rgba(239,68,68,0.2)',
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = 'amber',
  trend,
  trendLabel,
  className,
}: StatCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div
      className={cn(
        'stat-card animate-fadeIn',
        className
      )}
      style={{ borderColor: borderColors[gradient] }}
    >
      {/* Gradient overlay */}
      <div
        className={cn('absolute inset-0 rounded-2xl bg-gradient-to-br opacity-30', gradients[gradient])}
        aria-hidden
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBg[gradient])}>
            <Icon size={22} />
          </div>
          {trend !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
                isPositive && 'bg-emerald-500/15 text-emerald-400',
                isNegative && 'bg-red-500/15 text-red-400',
                !isPositive && !isNegative && 'bg-gray-500/15 text-gray-400'
              )}
            >
              {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : <Minus size={12} />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <p className="text-2xl font-bold animate-countUp" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
            {value}
          </p>
        </div>

        {/* Title */}
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</p>

        {/* Subtitle / trend label */}
        {(subtitle || trendLabel) && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {subtitle || trendLabel}
          </p>
        )}
      </div>
    </div>
  );
}
