import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'XAF'): string {
  if (currency === 'XAF') {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatEnergy(kwh: number): string {
  if (kwh >= 1000) {
    return `${(kwh / 1000).toFixed(2)} MWh`;
  }
  return `${kwh.toFixed(2)} kWh`;
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function generateCustomerNumber(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 90000 + 10000);
  return `SGM-${year}-${random}`;
}

export function generateMeterNumber(): string {
  const prefix = 'MTR';
  const random = Math.floor(Math.random() * 9000000 + 1000000);
  return `${prefix}${random}`;
}

export function generateBillNumber(): string {
  const now = new Date();
  const ym = `${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 900000 + 100000);
  return `BILL-${ym}-${random}`;
}

export function generatePaymentRef(): string {
  const now = new Date();
  const ts = format(now, 'yyMMddHHmm');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `PAY-${ts}-${random}`;
}

export function generateTicketNumber(): string {
  const now = new Date();
  const ym = `${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 90000 + 10000);
  return `TKT-${ym}-${random}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    disconnected: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    partial: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    escalated: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    normal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    charging: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    discharging: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    fault: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    completed_payment: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}

export function getBatteryIcon(soc: number): string {
  if (soc >= 80) return '🔋';
  if (soc >= 60) return '🔋';
  if (soc >= 40) return '🪫';
  if (soc >= 20) return '🪫';
  return '🪫';
}

export function calculateBillAmount(
  consumptionKwh: number,
  ratePerKwh: number,
  fixedCharge: number,
  taxRate = 0.1925
): { energy_charge: number; taxes: number; total_amount: number } {
  const energy_charge = consumptionKwh * ratePerKwh;
  const subtotal = energy_charge + fixedCharge;
  const taxes = subtotal * taxRate;
  const total_amount = subtotal + taxes;
  return {
    energy_charge: Math.round(energy_charge),
    taxes: Math.round(taxes),
    total_amount: Math.round(total_amount),
  };
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function truncate(text: string, length = 50): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Generate mock energy data for charts
export function generateMockEnergyData(days = 30) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const base = 15 + Math.random() * 10;
    data.push({
      date: format(date, 'MMM dd'),
      consumption: parseFloat(base.toFixed(2)),
      generation: parseFloat((base * (0.8 + Math.random() * 0.4)).toFixed(2)),
      cost: Math.round(base * 80),
    });
  }
  return data;
}

export function generateMockSolarData(hours = 24) {
  const data = [];
  for (let h = 0; h < hours; h++) {
    const hour = h;
    let generation = 0;
    if (hour >= 6 && hour <= 18) {
      const peak = Math.sin(((hour - 6) / 12) * Math.PI);
      generation = peak * 120 + Math.random() * 10 - 5;
      generation = Math.max(0, generation);
    }
    data.push({
      time: `${String(hour).padStart(2, '0')}:00`,
      generation: parseFloat(generation.toFixed(1)),
      demand: parseFloat((20 + Math.random() * 30).toFixed(1)),
    });
  }
  return data;
}
