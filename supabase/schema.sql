-- ============================================================
-- SolarGrid Manager — Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ROLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL CHECK (name IN ('customer', 'operator', 'technician', 'admin')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES
  ('customer', 'End-user customer of the microgrid'),
  ('operator', 'Grid operator with full admin access'),
  ('technician', 'Field technician for repairs and maintenance'),
  ('admin', 'System administrator')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'operator', 'technician', 'admin')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MICROGRID SITES
-- ============================================================
CREATE TABLE IF NOT EXISTS microgrid_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'South West',
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  capacity_kw DECIMAL(10,2) NOT NULL DEFAULT 0,
  panel_count INTEGER DEFAULT 0,
  inverter_count INTEGER DEFAULT 0,
  battery_capacity_kwh DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  commissioned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BATTERIES
-- ============================================================
CREATE TABLE IF NOT EXISTS batteries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES microgrid_sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity_kwh DECIMAL(10,2) NOT NULL,
  current_charge_kwh DECIMAL(10,2) DEFAULT 0,
  state_of_charge DECIMAL(5,2) DEFAULT 0,
  voltage DECIMAL(8,2),
  temperature DECIMAL(6,2),
  cycle_count INTEGER DEFAULT 0,
  health_percentage DECIMAL(5,2) DEFAULT 100,
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'charging', 'discharging', 'fault', 'maintenance')),
  last_reading_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TARIFFS
-- ============================================================
CREATE TABLE IF NOT EXISTS tariffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('residential', 'commercial', 'industrial', 'payg')),
  rate_per_kwh DECIMAL(10,4) NOT NULL,
  fixed_charge DECIMAL(10,2) DEFAULT 0,
  minimum_charge DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'XAF',
  is_active BOOLEAN DEFAULT TRUE,
  effective_from TIMESTAMPTZ DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tariffs (name, category, rate_per_kwh, fixed_charge, minimum_charge) VALUES
  ('Residential Standard', 'residential', 80.00, 500.00, 1000.00),
  ('Commercial Standard', 'commercial', 100.00, 1000.00, 2000.00),
  ('Industrial Standard', 'industrial', 120.00, 5000.00, 10000.00),
  ('Pay-As-You-Go', 'payg', 95.00, 0.00, 0.00)
ON CONFLICT DO NOTHING;

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  national_id TEXT,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'Buea',
  region TEXT DEFAULT 'South West',
  category TEXT DEFAULT 'residential' CHECK (category IN ('residential', 'commercial', 'industrial')),
  site_id UUID REFERENCES microgrid_sites(id) ON DELETE SET NULL,
  tariff_id UUID REFERENCES tariffs(id) ON DELETE SET NULL,
  connection_status TEXT DEFAULT 'pending' CHECK (connection_status IN ('pending', 'active', 'suspended', 'disconnected')),
  energy_balance_kwh DECIMAL(10,3) DEFAULT 0,
  credit_balance DECIMAL(12,2) DEFAULT 0,
  verified_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SMART METERS
-- ============================================================
CREATE TABLE IF NOT EXISTS smart_meters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meter_number TEXT UNIQUE NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  site_id UUID REFERENCES microgrid_sites(id) ON DELETE SET NULL,
  meter_type TEXT DEFAULT 'prepaid' CHECK (meter_type IN ('prepaid', 'postpaid', 'smart')),
  firmware_version TEXT,
  installed_at TIMESTAMPTZ,
  last_reading DECIMAL(12,3) DEFAULT 0,
  last_reading_at TIMESTAMPTZ,
  status TEXT DEFAULT 'unassigned' CHECK (status IN ('unassigned', 'active', 'faulty', 'maintenance', 'decommissioned')),
  tamper_alert BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENERGY USAGE
-- ============================================================
CREATE TABLE IF NOT EXISTS energy_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  meter_id UUID REFERENCES smart_meters(id) ON DELETE SET NULL,
  site_id UUID REFERENCES microgrid_sites(id) ON DELETE SET NULL,
  reading_kwh DECIMAL(12,3) NOT NULL,
  consumption_kwh DECIMAL(12,3) DEFAULT 0,
  cost_xaf DECIMAL(12,2) DEFAULT 0,
  reading_type TEXT DEFAULT 'automatic' CHECK (reading_type IN ('automatic', 'manual', 'estimated')),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SOLAR PRODUCTION
-- ============================================================
CREATE TABLE IF NOT EXISTS solar_production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES microgrid_sites(id) ON DELETE CASCADE,
  generation_kwh DECIMAL(12,3) NOT NULL DEFAULT 0,
  peak_power_kw DECIMAL(10,3) DEFAULT 0,
  irradiance_wm2 DECIMAL(8,2),
  temperature_c DECIMAL(6,2),
  efficiency_pct DECIMAL(5,2),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BILLS
-- ============================================================
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  meter_id UUID REFERENCES smart_meters(id) ON DELETE SET NULL,
  tariff_id UUID REFERENCES tariffs(id) ON DELETE SET NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  previous_reading DECIMAL(12,3) DEFAULT 0,
  current_reading DECIMAL(12,3) DEFAULT 0,
  consumption_kwh DECIMAL(12,3) DEFAULT 0,
  energy_charge DECIMAL(12,2) DEFAULT 0,
  fixed_charge DECIMAL(12,2) DEFAULT 0,
  taxes DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  balance_due DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'overdue', 'cancelled')),
  due_date TIMESTAMPTZ,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_reference TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'XAF',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mobile_money', 'bank_transfer', 'cash', 'credit_card', 'payg_credit')),
  mobile_money_provider TEXT CHECK (mobile_money_provider IN ('mtn', 'orange', 'camtel')),
  transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMPLAINTS
-- ============================================================
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  site_id UUID REFERENCES microgrid_sites(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('power_outage', 'billing_dispute', 'meter_fault', 'connection_issue', 'voltage_fluctuation', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'escalated')),
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MAINTENANCE RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES microgrid_sites(id) ON DELETE CASCADE,
  complaint_id UUID REFERENCES complaints(id) ON DELETE SET NULL,
  technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  work_performed TEXT,
  parts_used TEXT,
  maintenance_type TEXT DEFAULT 'corrective' CHECK (maintenance_type IN ('preventive', 'corrective', 'emergency', 'inspection')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'alert', 'success', 'bill', 'payment', 'outage', 'maintenance')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_usage ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can manage all profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');

-- Customers: customers can see their own record
CREATE POLICY "Customer can view own record" ON customers FOR SELECT USING (
  profile_id = auth.uid() OR auth.role() = 'service_role'
);
CREATE POLICY "Service role manages customers" ON customers FOR ALL USING (auth.role() = 'service_role');

-- Bills: customers see their own bills
CREATE POLICY "Customer can view own bills" ON bills FOR SELECT USING (
  customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR auth.role() = 'service_role'
);
CREATE POLICY "Service role manages bills" ON bills FOR ALL USING (auth.role() = 'service_role');

-- Payments: customers see their own payments
CREATE POLICY "Customer can view own payments" ON payments FOR SELECT USING (
  customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR auth.role() = 'service_role'
);
CREATE POLICY "Service role manages payments" ON payments FOR ALL USING (auth.role() = 'service_role');

-- Complaints: customers see their own
CREATE POLICY "Customer can manage own complaints" ON complaints FOR ALL USING (
  customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR auth.role() = 'service_role'
);

-- Notifications: users see own
CREATE POLICY "User can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Service role manages notifications" ON notifications FOR ALL USING (auth.role() = 'service_role');

-- Energy usage: customers see their own
CREATE POLICY "Customer can view own energy usage" ON energy_usage FOR SELECT USING (
  customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR auth.role() = 'service_role'
);
CREATE POLICY "Service role manages energy usage" ON energy_usage FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Insert microgrid sites
INSERT INTO microgrid_sites (name, location, region, capacity_kw, panel_count, battery_capacity_kwh, status)
VALUES
  ('Buea Main Grid', 'Buea Town, Southwest Region', 'South West', 150.00, 300, 450.00, 'active'),
  ('Limbe Solar Hub', 'Limbe City, Southwest Region', 'South West', 80.00, 160, 240.00, 'active'),
  ('Molyko Campus Grid', 'Molyko, Buea', 'South West', 50.00, 100, 150.00, 'active')
ON CONFLICT DO NOTHING;

-- Insert batteries for main site
INSERT INTO batteries (site_id, name, capacity_kwh, current_charge_kwh, state_of_charge, status)
SELECT id, 'Bank A - Primary', 225.00, 168.75, 75.00, 'normal' FROM microgrid_sites WHERE name = 'Buea Main Grid' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to generate customer number
CREATE OR REPLACE FUNCTION generate_customer_number()
RETURNS TEXT AS $$
DECLARE
  num TEXT;
BEGIN
  num := 'SGM-' || TO_CHAR(NOW(), 'YY') || '-' || LPAD(NEXTVAL('customer_seq')::TEXT, 5, '0');
  RETURN num;
END;
$$ LANGUAGE plpgsql;

-- Sequence for customer numbers
CREATE SEQUENCE IF NOT EXISTS customer_seq START 1001;

-- Function to generate bill number
CREATE OR REPLACE FUNCTION generate_bill_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'BILL-' || TO_CHAR(NOW(), 'YYMM') || '-' || LPAD(NEXTVAL('bill_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS bill_seq START 1;

-- Function to generate payment reference
CREATE OR REPLACE FUNCTION generate_payment_ref()
RETURNS TEXT AS $$
BEGIN
  RETURN 'PAY-' || TO_CHAR(NOW(), 'YYMMDDHH24MI') || '-' || FLOOR(RANDOM() * 9000 + 1000)::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TKT-' || TO_CHAR(NOW(), 'YYMM') || '-' || LPAD(NEXTVAL('ticket_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1;

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_meters_updated_at BEFORE UPDATE ON smart_meters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON microgrid_sites FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_energy_usage_customer ON energy_usage(customer_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_solar_production_site ON solar_production(site_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_bills_customer ON bills(customer_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_customer ON complaints(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
