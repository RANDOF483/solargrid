'use client';

import { cn, getStatusColor } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  pageSize?: number;
  actions?: (row: T) => React.ReactNode;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('badge', getStatusColor(status))}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="skeleton h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  );
}

export default function DataTable<T extends any>({
  columns,
  data,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No records found',
  pageSize = 10,
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const allColumns = actions
    ? [...columns, { key: '__actions__', label: 'Actions' }]
    : columns;

  const filtered = data.filter((row) => {
    if (!search) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const getValue = (row: T, key: string): unknown => {
    const keys = key.split('.');
    let val: unknown = row;
    for (const k of keys) {
      if (val && typeof val === 'object') val = (val as Record<string, unknown>)[k];
      else return '';
    }
    return val;
  };

  return (
    <div className="w-full">
      {searchable && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl w-full max-w-xs" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent outline-none text-sm flex-1"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
        <table className="data-table">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {allColumns.map((col) => (
                <th key={String(col.key)} className={col.className}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={allColumns.length} />
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      📭
                    </div>
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr key={i} className="animate-fadeIn">
                  {columns.map((col) => {
                    const val = getValue(row, String(col.key));
                    return (
                      <td key={String(col.key)} className={col.className}>
                        {col.render ? col.render(val, row) : (
                          typeof val === 'string' && ['active', 'inactive', 'pending', 'suspended', 'disconnected', 'paid', 'unpaid', 'partial', 'overdue', 'open', 'in_progress', 'resolved', 'closed', 'escalated', 'completed', 'scheduled', 'cancelled', 'normal', 'charging', 'discharging', 'fault', 'maintenance', 'critical', 'high', 'medium', 'low', 'failed'].includes(val)
                            ? <StatusBadge status={val} />
                            : <span>{String(val ?? '—')}</span>
                        )}
                      </td>
                    );
                  })}
                  {actions && (
                    <td>
                      <div className="flex items-center gap-2">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-ghost btn-sm p-2"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn('btn btn-sm px-3', page === p ? 'btn-primary' : 'btn-ghost')}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-ghost btn-sm p-2"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
