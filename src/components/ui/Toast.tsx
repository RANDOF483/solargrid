'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  onClose: () => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: { icon: 'text-emerald-400', border: 'rgba(16,185,129,0.3)' },
  error: { icon: 'text-red-400', border: 'rgba(239,68,68,0.3)' },
  info: { icon: 'text-blue-400', border: 'rgba(59,130,246,0.3)' },
  warning: { icon: 'text-amber-400', border: 'rgba(245,158,11,0.3)' },
};

function Toast({ type, title, message, onClose }: ToastProps) {
  const Icon = icons[type];
  const color = colors[type];

  return (
    <div
      className="toast"
      style={{ borderColor: color.border }}
    >
      <Icon size={20} className={color.icon} />
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
        {message && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{message}</p>}
      </div>
      <button onClick={onClose} className="btn btn-ghost p-1">
        <X size={16} />
      </button>
    </div>
  );
}

// Global toast state (simple singleton pattern)
type ToastListener = (toasts: ToastMessage[]) => void;
const listeners: ToastListener[] = [];
let toasts: ToastMessage[] = [];

function notify(toasts: ToastMessage[]) {
  listeners.forEach((l) => l([...toasts]));
}

export const toast = {
  show(type: ToastType, title: string, message?: string) {
    const id = Math.random().toString(36).slice(2);
    toasts = [...toasts, { id, type, title, message }];
    notify(toasts);
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      notify(toasts);
    }, 4000);
  },
  success: (title: string, message?: string) => toast.show('success', title, message),
  error: (title: string, message?: string) => toast.show('error', title, message),
  info: (title: string, message?: string) => toast.show('info', title, message),
  warning: (title: string, message?: string) => toast.show('warning', title, message),
};

export default function ToastContainer() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    listeners.push(setMessages);
    return () => {
      const idx = listeners.indexOf(setMessages);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
      {messages.map((msg) => (
        <Toast
          key={msg.id}
          type={msg.type}
          title={msg.title}
          message={msg.message}
          onClose={() => {
            toasts = toasts.filter((t) => t.id !== msg.id);
            notify(toasts);
          }}
        />
      ))}
    </div>
  );
}
