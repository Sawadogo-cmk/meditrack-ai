// ============================================
// Auth & User
// ============================================

export type RoleName = 'admin' | 'doctor' | 'secretary' | 'patient';

export interface Role {
  id: number;
  name: RoleName;
  label: string;
  description: string | null;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  is_active: boolean;
  role_id: number;
  role?: Role;
  last_login_at: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  token_type: 'Bearer';
}

// ============================================
// Patient
// ============================================

export type Gender = 'M' | 'F' | 'autre';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Patient {
  id: number;
  code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  birth_date: string | null;
  age: number | null;
  gender: Gender | null;
  phone: string | null;
  address: string | null;
  blood_group: BloodGroup | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  is_archived: boolean;
  archived_at: string | null;
  created_by: number | null;
  creator?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

// ============================================
// Service
// ============================================

export interface Service {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  doctors_count?: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// Doctor
// ============================================

export interface Doctor {
  id: number;
  speciality: string;
  office_phone: string | null;
  is_available: boolean;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone: string | null;
    is_active: boolean;
  };
  service: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Appointment
// ============================================

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface Appointment {
  id: number;
  scheduled_at: string;
  duration_minutes: number;
  ends_at: string;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  patient: {
    id: number;
    code: string;
    full_name: string;
    phone: string | null;
  } | null;
  doctor: {
    id: number;
    speciality: string;
    full_name: string | null;
  } | null;
  service: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Consultation
// ============================================

export interface Consultation {
  id: number;
  consultation_date: string;
  motif: string | null;
  observations: string | null;
  diagnostic: string | null;
  traitement: string | null;
  notes: string | null;
  appointment: {
    id: number;
    scheduled_at: string;
    status: AppointmentStatus;
  } | null;
  patient: {
    id: number;
    code: string;
    full_name: string;
  } | null;
  doctor: {
    id: number;
    speciality: string;
    full_name: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Medical Record
// ============================================

export type MedicalRecordType =
  | 'consultation'
  | 'examen'
  | 'hospitalisation'
  | 'vaccin'
  | 'allergie'
  | 'autre';

export interface MedicalRecord {
  id: number;
  record_type: MedicalRecordType;
  title: string;
  description: string | null;
  record_date: string;
  consultation_id: number | null;
  created_by: number | null;
  created_at: string;
}

// ============================================
// Dashboard
// ============================================

export type LoadLevel = 'idle' | 'low' | 'medium' | 'high' | 'no_doctor';

export interface DashboardStats {
  generated_at: string;
  patients: {
    total: number;
    active: number;
    archived: number;
    new_this_month: number;
  };
  doctors: {
    total: number;
    active: number;
    inactive: number;
  };
  appointments: {
    today: number;
    upcoming: number;
    this_month: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    no_show: number;
  };
  consultations: {
    total: number;
    this_month: number;
    this_week: number;
  };
  services: {
    total: number;
    active: number;
    distribution: Array<{
      id: number;
      name: string;
      is_active: boolean;
      doctors_count: number;
      appointments_count: number;
      appointments_per_doctor: number | null;
      load_level: LoadLevel;
    }>;
  };
}

// ============================================
// Pagination (Laravel)
// ============================================

export interface Paginated<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface SingleResponse<T> {
  data: T;
}

// ============================================
// Erreurs API
// ============================================

export interface ApiValidationError {
  message: string;
  errors: Record<string, string[]>;
}

// ============================================
// Intelligence Artificielle
// ============================================

export type AiTrend = 'hausse' | 'baisse' | 'stable';

export interface AiForecastPoint {
  date: string;
  predicted_appointments: number;
}

export interface AiServicePrediction {
  service_name: string;
  average_history: number;
  average_forecast: number;
  variation_pct: number;
  trend: AiTrend;
  forecast: AiForecastPoint[];
}

export interface AiPredictions {
  history_days: number;
  forecast_days: number;
  generated_at: string;
  services: AiServicePrediction[];
}

export interface AiTrendAlert {
  level: string;
  service: string;
  message: string;
}

export interface AiTrends {
  generated_at: string;
  alerts: AiTrendAlert[];
  services_summary: Array<{
    service: string;
    trend: AiTrend;
    variation_pct: number;
  }>;
}