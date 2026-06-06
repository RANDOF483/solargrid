export type UserRole = 'customer' | 'operator' | 'technician' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  profile_id: string | null;
  customer_number: string;
  full_name: string;
  email: string;
  phone: string;
  national_id: string | null;
  address: string;
  city: string;
  region: string;
  category: 'residential' | 'commercial' | 'industrial';
  site_id: string | null;
  tariff_id: string | null;
  connection_status: 'pending' | 'active' | 'suspended' | 'disconnected';
  energy_balance_kwh: number;
  credit_balance: number;
  verified_at: string | null;
  connected_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  site?: MicrogridSite;
  tariff?: Tariff;
  meters?: SmartMeter[];
}

export interface MicrogridSite {
  id: string;
  name: string;
  location: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  capacity_kw: number;
  panel_count: number;
  inverter_count: number;
  battery_capacity_kwh: number;
  status: 'active' | 'inactive' | 'maintenance';
  commissioned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SmartMeter {
  id: string;
  meter_number: string;
  serial_number: string;
  customer_id: string | null;
  site_id: string | null;
  meter_type: 'prepaid' | 'postpaid' | 'smart';
  firmware_version: string | null;
  installed_at: string | null;
  last_reading: number;
  last_reading_at: string | null;
  status: 'unassigned' | 'active' | 'faulty' | 'maintenance' | 'decommissioned';
  tamper_alert: boolean;
  created_at: string;
  updated_at: string;
}

export interface Battery {
  id: string;
  site_id: string;
  name: string;
  capacity_kwh: number;
  current_charge_kwh: number;
  state_of_charge: number;
  voltage: number | null;
  temperature: number | null;
  cycle_count: number;
  health_percentage: number;
  status: 'normal' | 'charging' | 'discharging' | 'fault' | 'maintenance';
  last_reading_at: string;
}

export interface Tariff {
  id: string;
  name: string;
  category: 'residential' | 'commercial' | 'industrial' | 'payg';
  rate_per_kwh: number;
  fixed_charge: number;
  minimum_charge: number;
  currency: string;
  is_active: boolean;
  effective_from: string;
  effective_to: string | null;
}

export interface EnergyUsage {
  id: string;
  customer_id: string;
  meter_id: string | null;
  site_id: string | null;
  reading_kwh: number;
  consumption_kwh: number;
  cost_xaf: number;
  reading_type: 'automatic' | 'manual' | 'estimated';
  recorded_at: string;
}

export interface SolarProduction {
  id: string;
  site_id: string;
  generation_kwh: number;
  peak_power_kw: number;
  irradiance_wm2: number | null;
  temperature_c: number | null;
  efficiency_pct: number | null;
  recorded_at: string;
}

export interface Bill {
  id: string;
  bill_number: string;
  customer_id: string;
  meter_id: string | null;
  tariff_id: string | null;
  period_start: string;
  period_end: string;
  previous_reading: number;
  current_reading: number;
  consumption_kwh: number;
  energy_charge: number;
  fixed_charge: number;
  taxes: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  due_date: string | null;
  generated_at: string;
  paid_at: string | null;
  customer?: Customer;
}

export interface Payment {
  id: string;
  payment_reference: string;
  customer_id: string;
  bill_id: string | null;
  amount: number;
  currency: string;
  payment_method: 'mobile_money' | 'bank_transfer' | 'cash' | 'credit_card' | 'payg_credit';
  mobile_money_provider: 'mtn' | 'orange' | 'camtel' | null;
  transaction_id: string | null;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  notes: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface Complaint {
  id: string;
  ticket_number: string;
  customer_id: string;
  site_id: string | null;
  assigned_to: string | null;
  category: 'power_outage' | 'billing_dispute' | 'meter_fault' | 'connection_issue' | 'voltage_fluctuation' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  assignee?: Profile;
}

export interface MaintenanceRecord {
  id: string;
  site_id: string;
  complaint_id: string | null;
  technician_id: string | null;
  title: string;
  description: string;
  work_performed: string | null;
  parts_used: string | null;
  maintenance_type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  site?: MicrogridSite;
  technician?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success' | 'bill' | 'payment' | 'outage' | 'maintenance';
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeConnections: number;
  totalEnergyGenerated: number;
  currentBatteryLevel: number;
  dailyRevenue: number;
  outstandingBills: number;
  openComplaints: number;
  systemEfficiency: number;
}
