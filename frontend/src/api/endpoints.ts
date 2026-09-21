import { apiClient } from './client';
import type {
  Appointment,
  Consultation,
  DashboardStats,
  Doctor,
  MedicalRecord,
  Paginated,
  Patient,
  Service,
  SingleResponse,
  User,
} from '../types';

// ============================================
// AUTH
// ============================================

export const authApi = {
  me: () =>
    apiClient.get<User>('/auth/me').then((r) => r.data),

  logout: () =>
    apiClient.post<{ message: string }>('/auth/logout').then((r) => r.data),
};

// ============================================
// PATIENTS
// ============================================

export interface PatientFilters {
  search?: string;
  gender?: 'M' | 'F' | 'autre';
  archived?: boolean;
  per_page?: number;
  page?: number;
}

export const patientsApi = {
  list: (filters: PatientFilters = {}) =>
    apiClient
      .get<Paginated<Patient>>('/patients', { params: filters })
      .then((r) => r.data),

  get: (id: number) =>
    apiClient
      .get<SingleResponse<Patient>>(`/patients/${id}`)
      .then((r) => r.data.data),

  create: (payload: Partial<Patient>) =>
    apiClient
      .post<SingleResponse<Patient>>('/patients', payload)
      .then((r) => r.data.data),

  update: (id: number, payload: Partial<Patient>) =>
    apiClient
      .patch<SingleResponse<Patient>>(`/patients/${id}`, payload)
      .then((r) => r.data.data),

  archive: (id: number) =>
    apiClient
      .delete<{ message: string }>(`/patients/${id}`)
      .then((r) => r.data),

  medicalRecords: (
    id: number,
    params: { type?: string; page?: number; per_page?: number } = {}
  ) =>
    apiClient
      .get<Paginated<MedicalRecord>>(`/patients/${id}/medical-records`, { params })
      .then((r) => r.data),
};

// ============================================
// SERVICES
// ============================================

export interface ServiceFilters {
  search?: string;
  active?: boolean;
  per_page?: number;
  page?: number;
}

export const servicesApi = {
  list: (params: ServiceFilters = {}) =>
    apiClient
      .get<Paginated<Service>>('/services', { params })
      .then((r) => r.data),

  get: (id: number) =>
    apiClient
      .get<SingleResponse<Service>>(`/services/${id}`)
      .then((r) => r.data.data),

  create: (payload: Partial<Service>) =>
    apiClient
      .post<SingleResponse<Service>>('/services', payload)
      .then((r) => r.data.data),

  update: (id: number, payload: Partial<Service>) =>
    apiClient
      .patch<SingleResponse<Service>>(`/services/${id}`, payload)
      .then((r) => r.data.data),

  delete: (id: number) =>
    apiClient
      .delete<{ message: string }>(`/services/${id}`)
      .then((r) => r.data),
};

// ============================================
// DOCTORS
// ============================================

export interface DoctorFilters {
  search?: string;
  speciality?: string;
  service_id?: number;
  include_inactive?: boolean;
  per_page?: number;
  page?: number;
}

export interface DoctorCreatePayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  speciality: string;
  service_id: number;
  office_phone?: string;
  is_available?: boolean;
}

export const doctorsApi = {
  list: (params: DoctorFilters = {}) =>
    apiClient
      .get<Paginated<Doctor>>('/doctors', { params })
      .then((r) => r.data),

  get: (id: number) =>
    apiClient
      .get<SingleResponse<Doctor>>(`/doctors/${id}`)
      .then((r) => r.data.data),

  create: (payload: DoctorCreatePayload) =>
    apiClient
      .post<SingleResponse<Doctor>>('/doctors', payload)
      .then((r) => r.data.data),

  update: (id: number, payload: Partial<DoctorCreatePayload>) =>
    apiClient
      .patch<SingleResponse<Doctor>>(`/doctors/${id}`, payload)
      .then((r) => r.data.data),

  deactivate: (id: number) =>
    apiClient
      .delete<{ message: string }>(`/doctors/${id}`)
      .then((r) => r.data),
};

// ============================================
// APPOINTMENTS
// ============================================

export interface AppointmentFilters {
  status?: string;
  doctor_id?: number;
  patient_id?: number;
  service_id?: number;
  date?: string;
  from?: string;
  to?: string;
  sort?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface AppointmentCreatePayload {
  patient_id: number;
  doctor_id: number;
  service_id?: number;
  scheduled_at: string;
  duration_minutes?: number;
  reason?: string;
  notes?: string;
}

export const appointmentsApi = {
  list: (params: AppointmentFilters = {}) =>
    apiClient
      .get<Paginated<Appointment>>('/appointments', { params })
      .then((r) => r.data),

  get: (id: number) =>
    apiClient
      .get<SingleResponse<Appointment>>(`/appointments/${id}`)
      .then((r) => r.data.data),

  create: (payload: AppointmentCreatePayload) =>
    apiClient
      .post<SingleResponse<Appointment>>('/appointments', payload)
      .then((r) => r.data.data),

  update: (id: number, payload: Partial<AppointmentCreatePayload>) =>
    apiClient
      .patch<SingleResponse<Appointment>>(`/appointments/${id}`, payload)
      .then((r) => r.data.data),

  updateStatus: (id: number, status: string) =>
    apiClient
      .patch<SingleResponse<Appointment>>(`/appointments/${id}/status`, { status })
      .then((r) => r.data.data),

  cancel: (id: number) =>
    apiClient
      .delete<{ message: string }>(`/appointments/${id}`)
      .then((r) => r.data),
};

// ============================================
// CONSULTATIONS
// ============================================

export interface ConsultationFilters {
  patient_id?: number;
  doctor_id?: number;
  from?: string;
  to?: string;
  sort?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface ConsultationCreatePayload {
  patient_id: number;
  doctor_id: number;
  appointment_id?: number | null;
  consultation_date?: string;
  motif?: string;
  observations?: string;
  diagnostic?: string;
  traitement?: string;
  notes?: string;
}

export const consultationsApi = {
  list: (params: ConsultationFilters = {}) =>
    apiClient
      .get<Paginated<Consultation>>('/consultations', { params })
      .then((r) => r.data),

  get: (id: number) =>
    apiClient
      .get<SingleResponse<Consultation>>(`/consultations/${id}`)
      .then((r) => r.data.data),

  create: (payload: ConsultationCreatePayload) =>
    apiClient
      .post<SingleResponse<Consultation>>('/consultations', payload)
      .then((r) => r.data.data),

  update: (id: number, payload: Partial<ConsultationCreatePayload>) =>
    apiClient
      .patch<SingleResponse<Consultation>>(`/consultations/${id}`, payload)
      .then((r) => r.data.data),
};

// ============================================
// DASHBOARD
// ============================================

export const dashboardApi = {
  stats: () =>
    apiClient.get<DashboardStats>('/dashboard/stats').then((r) => r.data),

  appointmentsToday: () =>
    apiClient
      .get<{ data: Appointment[] }>('/dashboard/appointments/today')
      .then((r) => r.data.data),

  appointmentsUpcoming: (days = 7) =>
    apiClient
      .get<{ data: Appointment[] }>('/dashboard/appointments/upcoming', {
        params: { days },
      })
      .then((r) => r.data.data),
};