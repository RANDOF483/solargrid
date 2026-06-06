'use client';

import Link from 'next/link';
import {
  Sun, Zap, Battery, BarChart3, Shield, Smartphone, ArrowRight,
  CheckCircle, Star, MapPin, Users, Activity, ChevronRight
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Real-Time Monitoring',
    desc: 'Monitor your energy consumption, solar generation, and battery levels in real time from any device.',
    color: 'amber',
  },
  {
    icon: Battery,
    title: 'Smart Billing',
    desc: 'Automated bill generation with transparent pricing, mobile money payments, and instant receipts.',
    color: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    desc: 'Detailed consumption trends, revenue analytics, and exportable reports for data-driven decisions.',
    color: 'green',
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    desc: 'Enterprise-grade security with role-based access control, JWT authentication, and audit logging.',
    color: 'purple',
  },
  {
    icon: Smartphone,
    title: 'Mobile Money Ready',
    desc: 'Integrated MTN Mobile Money and Orange Money support for seamless energy credit purchases.',
    color: 'amber',
  },
  {
    icon: Users,
    title: 'Multi-Role Access',
    desc: 'Dedicated portals for customers, operators, and field technicians with tailored dashboards.',
    color: 'blue',
  },
];

const stats = [
  { value: '150+', label: 'kW Installed Capacity', icon: Sun },
  { value: '500+', label: 'Active Customers', icon: Users },
  { value: '99.2%', label: 'Uptime Guaranteed', icon: Activity },
  { value: '3', label: 'Microgrid Sites', icon: MapPin },
];

const plans = [
  {
    name: 'Residential',
    price: '80',
    desc: 'Perfect for homes and small households',
    features: ['Up to 5 kWh/day', 'Smart meter included', 'Mobile money payments', 'Basic support'],
    color: 'amber',
    popular: false,
  },
  {
    name: 'Commercial',
    price: '100',
    desc: 'Ideal for shops and small businesses',
    features: ['Up to 20 kWh/day', 'Priority metering', 'API access', 'Dedicated support', 'Monthly reports'],
    color: 'blue',
    popular: true,
  },
  {
    name: 'Industrial',
    price: '120',
    desc: 'For factories and large enterprises',
    features: ['Unlimited capacity', 'Custom metering', 'SLA guarantee', '24/7 support', 'Custom reports', 'On-site technician'],
    color: 'purple',
    popular: false,
  },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(10,15,30,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
              <Sun size={22} color="white" />
            </div>
            <div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18, color: '#f9fafb' }}>SolarGrid</span>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400, fontSize: 14, color: '#f59e0b', marginLeft: 6 }}>Manager</span>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="#features" style={{ padding: '8px 16px', color: '#9ca3af', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Features</Link>
            <Link href="#pricing" style={{ padding: '8px 16px', color: '#9ca3af', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Pricing</Link>
            <Link href="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: 100, paddingBottom: 120 }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: -100, left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 99, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', marginBottom: 32 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} className="solar-pulse" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>Powering Southwest Cameroon with Solar Energy</span>
          </div>

          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#f9fafb', marginBottom: 24, maxWidth: 900, margin: '0 auto 24px' }}>
            The Future of
            <span style={{ display: 'block', background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Solar Microgrid
            </span>
            Management
          </h1>

          <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 620, margin: '0 auto 48px', lineHeight: 1.7 }}>
            Professional utility-grade platform for managing solar microgrids in Buea, Cameroon. 
            Monitor generation, manage customers, automate billing, and track every kilowatt.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Start Free Trial
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              View Demo Dashboard
            </Link>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 80, maxWidth: 800, margin: '80px auto 0' }}>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                    <Icon size={16} style={{ color: '#f59e0b' }} />
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: '#f9fafb' }}>{stat.value}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ paddingTop: 80, paddingBottom: 80, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: 12 }}>Platform Features</p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 40, fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.02em', marginBottom: 16 }}>
              Everything You Need
            </h2>
            <p style={{ fontSize: 16, color: '#9ca3af', maxWidth: 500, margin: '0 auto' }}>
              Built for the operational demands of a real solar utility company
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {features.map((feat, i) => {
              const Icon = feat.icon;
              const bg = feat.color === 'amber' ? 'rgba(245,158,11,0.1)' : feat.color === 'blue' ? 'rgba(59,130,246,0.1)' : feat.color === 'green' ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.1)';
              const iconColor = feat.color === 'amber' ? '#f59e0b' : feat.color === 'blue' ? '#60a5fa' : feat.color === 'green' ? '#34d399' : '#a78bfa';
              return (
                <div key={i} className="card" style={{ animationDelay: `${i * 100}ms` }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <Icon size={22} style={{ color: iconColor }} />
                  </div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, fontWeight: 700, color: '#f9fafb', marginBottom: 10 }}>{feat.title}</h3>
                  <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7 }}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ paddingTop: 80, paddingBottom: 80, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: 12 }}>Tariff Plans</p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 40, fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.02em', marginBottom: 16 }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontSize: 16, color: '#9ca3af' }}>All prices in XAF per kWh. No hidden fees.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
            {plans.map((plan, i) => {
              const border = plan.popular ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)';
              return (
                <div
                  key={i}
                  style={{
                    background: plan.popular ? 'rgba(245,158,11,0.05)' : 'var(--bg-card)',
                    border: `1px solid ${border}`,
                    borderRadius: 20,
                    padding: 32,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {plan.popular && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#1a1a1a', padding: '4px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      Most Popular
                    </div>
                  )}
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 22, fontWeight: 700, color: '#f9fafb', marginBottom: 8 }}>{plan.name}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>{plan.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 48, fontWeight: 900, color: '#f9fafb' }}>{plan.price}</span>
                    <span style={{ fontSize: 14, color: '#6b7280' }}>XAF/kWh</span>
                  </div>
                  <ul style={{ listStyle: 'none', marginBottom: 28 }}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: j < plan.features.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <CheckCircle size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: '#d1d5db' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={plan.popular ? 'btn btn-primary' : 'btn btn-secondary'} style={{ width: '100%', justifyContent: 'center' }}>
                    Get Started <ChevronRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(59,130,246,0.05))', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 24, padding: '60px 40px' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(245,158,11,0.3)' }}>
            <Sun size={32} color="white" />
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800, color: '#f9fafb', marginBottom: 16, letterSpacing: '-0.02em' }}>
            Ready to go solar?
          </h2>
          <p style={{ fontSize: 16, color: '#9ca3af', marginBottom: 36 }}>
            Join hundreds of families and businesses in Buea already powering their lives with clean solar energy.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Register Today <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sun size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, color: '#f9fafb' }}>SolarGrid Manager</span>
          </div>
          <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
            © {new Date().getFullYear()} SolarGrid Manager. Microgrid-as-a-Service Platform — Buea, Cameroon.
          </p>
          <div style={{ display: 'flex', gap: 24, margin: '8px 0', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>WhatsApp / Support: <strong style={{ color: '#f9fafb' }}>671 17 64 36</strong></span>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>Email: <a href="mailto:fanyu427@gmail.com" style={{ color: '#f59e0b', textDecoration: 'none' }}>fanyu427@gmail.com</a></span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service'].map((item) => (
              <Link key={item} href="#" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>{item}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
