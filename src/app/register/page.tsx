'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sun, Mail, Lock, User, Phone, MapPin, Building2, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    neighbourhood: '',
    city: 'Buea',
    region: 'South West',
    category: 'residential',
    national_id: '',
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          phone: form.phone,
          address: `${form.address}, ${form.neighbourhood}`,
          neighbourhood: form.neighbourhood,
          city: form.city,
          region: form.region,
          category: form.category,
          national_id: form.national_id,
          role: 'customer',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      setStep(3);
      setTimeout(() => router.push('/login'), 3000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}>
            <Sun size={24} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20, color: '#f9fafb' }}>SolarGrid Manager</p>
            <p style={{ fontSize: 12, color: '#6b7280' }}>Microgrid-as-a-Service Platform</p>
          </div>
        </Link>

        {/* Progress */}
        {step < 3 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              {[1, 2].map((s) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0,
                    background: step >= s ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.08)',
                    color: step >= s ? '#1a1a1a' : '#6b7280',
                  }}>
                    {s}
                  </div>
                  {s < 2 && (
                    <div style={{ flex: 1, height: 2, borderRadius: 1, background: step > s ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.08)' }} />
                  )}
                </div>
              ))}
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.02em', marginBottom: 6 }}>
              {step === 1 ? 'Create your account' : 'Connection details'}
            </h1>
            <p style={{ fontSize: 14, color: '#9ca3af' }}>
              {step === 1 ? 'Step 1 of 2 — Account information' : 'Step 2 of 2 — Your address and connection type'}
            </p>
          </div>
        )}

        {/* Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 36 }}>
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 14, marginBottom: 24 }}>
              {error}
            </div>
          )}

          {/* Step 3 — Success */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={40} style={{ color: '#34d399' }} />
              </div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800, color: '#f9fafb', marginBottom: 12 }}>Registration Successful!</h2>
              <p style={{ color: '#9ca3af', fontSize: 15, lineHeight: 1.7 }}>
                Welcome to SolarGrid Manager! Your account has been created. You can now sign in and complete your profile to activate your connection.
              </p>
              <p style={{ color: '#6b7280', fontSize: 13, marginTop: 20 }}>Redirecting to login...</p>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="text" className="form-input" style={{ paddingLeft: 42 }} placeholder="John Doe" required value={form.full_name} onChange={(e) => update('full_name', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="email" className="form-input" style={{ paddingLeft: 42 }} placeholder="john@example.com" required value={form.email} onChange={(e) => update('email', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="tel" className="form-input" style={{ paddingLeft: 42 }} placeholder="+237 600 000 000" required value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type={showPassword ? 'text' : 'password'} className="form-input" style={{ paddingLeft: 42, paddingRight: 44 }} placeholder="Min. 8 characters" required value={form.password} onChange={(e) => update('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="password" className="form-input" style={{ paddingLeft: 42 }} placeholder="Re-enter password" required value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }}>
                Continue <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Location info banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <MapPin size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: '#d1d5db' }}>
                  <span style={{ fontWeight: 600, color: '#f59e0b' }}>Buea, South West Region</span> — Select your quarter/neighbourhood below
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Quarter / Neighbourhood *</label>
                <select
                  className="form-select"
                  required
                  value={form.neighbourhood}
                  onChange={(e) => update('neighbourhood', e.target.value)}
                >
                  <option value="">— Select your quarter —</option>
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
                    <option value="Clerk's Quarter (UB)">Clerk&apos;s Quarter (UB Area)</option>
                  </optgroup>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Street / House Description</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: 42 }}
                    placeholder="e.g. Behind UB Main Gate, Red Gate Road"
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                  />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Optional — describe your exact location within the quarter</p>
              </div>

              <div className="form-group">
                <label className="form-label">Connection Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { value: 'residential', label: 'Residential', icon: '🏠' },
                    { value: 'commercial', label: 'Commercial', icon: '🏢' },
                    { value: 'industrial', label: 'Industrial', icon: '🏭' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 10px', borderRadius: 12, cursor: 'pointer',
                        border: `1px solid ${form.category === opt.value ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
                        background: form.category === opt.value ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input type="radio" name="category" value={opt.value} checked={form.category === opt.value} onChange={(e) => update('category', e.target.value)} style={{ display: 'none' }} />
                      <span style={{ fontSize: 22 }}>{opt.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: form.category === opt.value ? '#f59e0b' : '#9ca3af' }}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">National ID (Optional)</label>
                <input type="text" className="form-input" placeholder="e.g. 123456789" value={form.national_id} onChange={(e) => update('national_id', e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Back
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
                  {loading ? 'Creating account...' : <>Create Account <ArrowRight size={16} /></>}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 24 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#f59e0b', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
