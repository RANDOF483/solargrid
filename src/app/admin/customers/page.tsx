'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import ToastContainer, { toast } from '@/components/ui/Toast';
import { Plus, Edit, Trash2, Power, Eye } from 'lucide-react';
import { formatDate, getStatusColor, generateCustomerNumber, cn } from '@/lib/utils';
import type { Customer } from '@/lib/types';

export default function CustomersPage() {
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [tariffs, setTariffs] = useState<{ id: string; name: string; category: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', address: '', neighbourhood: '', city: 'Buea',
    region: 'South West', category: 'residential', site_id: '', tariff_id: '',
    national_id: '', connection_status: 'pending',
  });

  const resetForm = () => setForm({ full_name: '', email: '', phone: '', address: '', neighbourhood: '', city: 'Buea', region: 'South West', category: 'residential', site_id: '', tariff_id: '', national_id: '', connection_status: 'pending' });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      await fetchCustomers();

      const [siteRes, tariffRes] = await Promise.all([
        supabase.from('microgrid_sites').select('id, name').eq('status', 'active'),
        supabase.from('tariffs').select('id, name, category').eq('is_active', true),
      ]);
      setSites(siteRes.data || []);
      setTariffs(tariffRes.data || []);
      setLoading(false);
    };
    init();
  }, []);

  const fetchCustomers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('customers')
      .select('*, site:microgrid_sites(name), tariff:tariffs(name, rate_per_kwh)')
      .order('created_at', { ascending: false });
    setCustomers(data || []);
  };

  const handleSave = async () => {
    const supabase = createClient();
    try {
      if (editingCustomer) {
        const { error } = await supabase.from('customers').update(form).eq('id', editingCustomer.id);
        if (error) throw error;
        toast.success('Customer Updated', 'Customer details have been updated.');
      } else {
        const customerNumber = generateCustomerNumber();
        const { error } = await supabase.from('customers').insert({
          ...form,
          address: form.neighbourhood ? `${form.address ? form.address + ', ' : ''}${form.neighbourhood}, Buea` : form.address,
          customer_number: customerNumber,
        });
        if (error) throw error;
        toast.success('Customer Created', `Customer ${customerNumber} has been registered.`);
      }
      setShowModal(false);
      resetForm();
      setEditingCustomer(null);
      await fetchCustomers();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to save customer');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      neighbourhood: (customer as Customer & { neighbourhood?: string }).neighbourhood || '',
      city: customer.city,
      region: customer.region,
      category: customer.category,
      site_id: customer.site_id || '',
      tariff_id: customer.tariff_id || '',
      national_id: customer.national_id || '',
      connection_status: customer.connection_status,
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (customer: Customer) => {
    const supabase = createClient();
    const newStatus = customer.connection_status === 'active' ? 'suspended' : 'active';
    const { error } = await supabase.from('customers').update({ connection_status: newStatus }).eq('id', customer.id);
    if (!error) {
      toast.success('Status Updated', `Customer ${customer.full_name} is now ${newStatus}.`);
      await fetchCustomers();
    }
  };

  const columns = [
    { key: 'customer_number', label: 'Account #', render: (_: unknown, row: Customer) => <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#f59e0b' }}>{row.customer_number}</span> },
    { key: 'full_name', label: 'Customer', render: (_: unknown, row: Customer) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#1a1a1a', flexShrink: 0 }}>
          {row.full_name.charAt(0)}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.full_name}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.email}</p>
        </div>
      </div>
    )},
    { key: 'phone', label: 'Phone' },
    { key: 'category', label: 'Category', render: (v: unknown) => <span className={cn('badge', getStatusColor(String(v)))}>{String(v)}</span> },
    { key: 'connection_status', label: 'Status' },
    { key: 'site', label: 'Site', render: (_: unknown, row: Customer) => <span style={{ fontSize: 13 }}>{(row.site as { name: string } | undefined)?.name || '—'}</span> },
    { key: 'created_at', label: 'Joined', render: (v: unknown) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(String(v))}</span> },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar role={profile?.role as 'admin' || 'admin'} userName={profile?.full_name || 'Admin'} />
      <div className="dashboard-content">
        <TopBar title="Customer Management" subtitle="Register, manage, and monitor customers" />
        <main className="dashboard-main">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {['All', 'Active', 'Pending', 'Suspended'].map((status) => (
                <button key={status} className={cn('btn btn-sm', status === 'All' ? 'btn-primary' : 'btn-secondary')}>
                  {status}
                </button>
              ))}
            </div>
            <button onClick={() => { resetForm(); setEditingCustomer(null); setShowModal(true); }} className="btn btn-primary">
              <Plus size={16} /> Add Customer
            </button>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                All Customers ({customers.length})
              </h3>
            </div>
            <div style={{ padding: '16px 24px 24px' }}>
              <DataTable
                columns={columns}
                data={customers}
                loading={loading}
                searchPlaceholder="Search by name, email, account..."
                emptyMessage="No customers found. Add your first customer."
                actions={(row: Customer) => (
                  <>
                    <button onClick={() => handleEdit(row)} className="btn btn-ghost btn-sm p-1.5" title="Edit">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleToggleStatus(row)} className="btn btn-ghost btn-sm p-1.5" title="Toggle status">
                      <Power size={14} style={{ color: row.connection_status === 'active' ? '#ef4444' : '#10b981' }} />
                    </button>
                  </>
                )}
              />
            </div>
          </div>

          {/* Modal */}
          <Modal
            isOpen={showModal}
            onClose={() => { setShowModal(false); setEditingCustomer(null); resetForm(); }}
            title={editingCustomer ? 'Edit Customer' : 'Register New Customer'}
            size="lg"
            footer={
              <>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleSave} className="btn btn-primary">
                  {editingCustomer ? 'Update Customer' : 'Register Customer'}
                </button>
              </>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@email.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+237 600 000 000" required />
              </div>
              <div className="form-group">
                <label className="form-label">National ID</label>
                <input className="form-input" value={form.national_id} onChange={(e) => setForm(f => ({ ...f, national_id: e.target.value }))} placeholder="Optional" />
              </div>

              {/* Buea Neighbourhood */}
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Quarter / Neighbourhood — Buea *</label>
                <select className="form-select" value={form.neighbourhood} onChange={(e) => setForm(f => ({ ...f, neighbourhood: e.target.value }))}>
                  <option value="">— Select quarter —</option>
                  <optgroup label="Central Buea">
                    <option value="Molyko">Molyko</option>
                    <option value="Buea Town">Buea Town</option>
                    <option value="GRA (Government Residential Area)">GRA (Government Residential Area)</option>
                    <option value="Federal Quarter">Federal Quarter</option>
                    <option value="Clerks Quarter">Clerks Quarter</option>
                    <option value="Fako Quarter">Fako Quarter</option>
                    <option value="Camp SIC">Camp SIC</option>
                  </optgroup>
                  <optgroup label="Soppo Area">
                    <option value="Great Soppo">Great Soppo</option>
                    <option value="Small Soppo">Small Soppo</option>
                    <option value="Bonduma">Bonduma</option>
                    <option value="Wonyalikombo">Wonyalikombo</option>
                  </optgroup>
                  <optgroup label="Mile Areas">
                    <option value="Mile 16">Mile 16 (Bokwango)</option>
                    <option value="Mile 17">Mile 17 (Muea Junction)</option>
                  </optgroup>
                  <optgroup label="Outskirts / Suburbs">
                    <option value="Bokwango">Bokwango</option>
                    <option value="Muea">Muea</option>
                    <option value="Lysoka">Lysoka</option>
                    <option value="Tole">Tole</option>
                    <option value="Bova">Bova</option>
                    <option value="Bolifamba">Bolifamba</option>
                    <option value="Bomaka">Bomaka</option>
                    <option value="Bwassa">Bwassa</option>
                    <option value="Likoko">Likoko</option>
                    <option value="Likoko-Membea">Likoko-Membea</option>
                    <option value="Muyuka">Muyuka</option>
                    <option value="Ekona">Ekona</option>
                    <option value="Dibanda">Dibanda</option>
                    <option value="Madagascar">Madagascar</option>
                    <option value="Sandpit">Sandpit</option>
                  </optgroup>
                  <optgroup label="University Area">
                    <option value="Molyko (UB Campus)">Molyko — UB Campus Area</option>
                    <option value="Clerks Quarter (UB)">Clerks Quarter (UB Area)</option>
                  </optgroup>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Street / House Description</label>
                <input className="form-input" value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder="e.g. Behind UB Main Gate, Red Gate Road" />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Microgrid Site</label>
                <select className="form-select" value={form.site_id} onChange={(e) => setForm(f => ({ ...f, site_id: e.target.value }))}>
                  <option value="">— Select Site —</option>
                  {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tariff Plan</label>
                <select className="form-select" value={form.tariff_id} onChange={(e) => setForm(f => ({ ...f, tariff_id: e.target.value }))}>
                  <option value="">— Select Tariff —</option>
                  {tariffs.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              {editingCustomer && (
                <div className="form-group">
                  <label className="form-label">Connection Status</label>
                  <select className="form-select" value={form.connection_status} onChange={(e) => setForm(f => ({ ...f, connection_status: e.target.value }))}>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="disconnected">Disconnected</option>
                  </select>
                </div>
              )}
            </div>
          </Modal>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
