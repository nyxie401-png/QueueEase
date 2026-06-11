/**
 * QueueEase V2 — Shared TypeScript Types
 */

// ─── User & Auth ──────────────────────────────────────────

export type UserRole = 'patient' | 'doctor' | 'receptionist';

export interface User {
  _id: string;
  firebaseUid?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address?: Address;
  nic?: string;
  
  // Doctor-specific
  specialization?: string;
  medicalLicenseNo?: string;
  clinicIds?: string[];
  
  // Patient-specific
  medicalHistory?: MedicalHistory[];
  allergies?: string[];
  bloodType?: BloodType;
  emergencyContact?: EmergencyContact;
  
  // Receptionist-specific
  employedClinicId?: string;
  employeeId?: string;
  
  isActive: boolean;
  isVerified: boolean;
  fcmToken?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street?: string;
  city?: string;
  district?: string;
  postalCode?: string;
}

export interface MedicalHistory {
  condition: string;
  diagnosedDate?: string;
  notes?: string;
}

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// ─── Clinic ──────────────────────────────────────────────

export interface Clinic {
  _id: string;
  name: string;
  description?: string;
  address: ClinicAddress;
  phone: string;
  email?: string;
  website?: string;
  doctorId: string | User;
  receptionistIds?: string[] | User[];
  specialty?: string;
  workingHours: WorkingHours[];
  queueConfig: QueueConfig;
  services: ClinicService[];
  isActive: boolean;
  isVerified: boolean;
  rating: { average: number; count: number };
  createdAt: string;
}

export interface ClinicAddress extends Address {
  province?: string;
  coordinates?: { lat: number; lng: number };
}

export interface WorkingHours {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface QueueConfig {
  maxPatientsPerSlot: number;
  slotDurationMinutes: number;
  allowWalkIns: boolean;
  allowEmergencyQueue: boolean;
  estimatedWaitTimePerPatient: number;
}

export interface ClinicService {
  name: string;
  duration: number;
  fee: number;
  currency: string;
}

// ─── Queue ───────────────────────────────────────────────

export type QueueStatus = 'open' | 'paused' | 'closed';
export type EntryStatus = 'waiting' | 'in-consultation' | 'completed' | 'cancelled' | 'no-show';
export type Priority = 'normal' | 'urgent' | 'emergency';
export type AppointmentType = 'walk-in' | 'appointment' | 'follow-up' | 'emergency';

export interface Queue {
  _id: string;
  clinicId: string | Clinic;
  doctorId: string | User;
  date: string;
  currentToken?: string;
  currentPosition: number;
  tokenCounter: number;
  entries: QueueEntry[];
  stats: QueueStats;
  isActive: boolean;
  status: QueueStatus;
  pausedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueueEntry {
  _id: string;
  patientId: string | User;
  patientName: string;
  patientPhone?: string;
  tokenNumber: string;
  position: number;
  status: EntryStatus;
  priority: Priority;
  emergencyReason?: string;
  appointmentType: AppointmentType;
  joinedAt: string;
  estimatedWaitMinutes?: number;
  calledAt?: string;
  consultationStartedAt?: string;
  completedAt?: string;
  notes?: string;
  predictedWaitMinutes?: number;
}

export interface QueueStats {
  totalPatients: number;
  completed: number;
  cancelled: number;
  noShows: number;
  emergencies: number;
  averageWaitMinutes: number;
  averageConsultationMinutes: number;
}

// ─── Appointment ─────────────────────────────────────────

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
export type AppointmentTypeFull = 'consultation' | 'follow-up' | 'check-up' | 'procedure' | 'emergency';

export interface Appointment {
  _id: string;
  patientId: string | User;
  clinicId: string | Clinic;
  doctorId: string | User;
  date: string;
  timeSlot: { start: string; end: string };
  type: AppointmentTypeFull;
  status: AppointmentStatus;
  reason?: string;
  symptoms?: string[];
  queueId?: string;
  queueEntryId?: string;
  tokenNumber?: string;
  doctorNotes?: string;
  receptionistNotes?: string;
  prescription?: Prescription;
  payment: Payment;
  reminderSent: boolean;
  cancelledBy?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  medications: Medication[];
  labTests: string[];
  advice?: string;
  followUpDate?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Payment {
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'waived';
  method?: 'cash' | 'card' | 'insurance' | 'other';
  paidAt?: string;
}

// ─── Notification ────────────────────────────────────────

export type NotificationType = 
  | 'queue-update'
  | 'appointment-reminder'
  | 'turn-approaching'
  | 'your-turn'
  | 'appointment-confirmed'
  | 'appointment-cancelled'
  | 'emergency-alert'
  | 'system';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  clinicId?: string;
  queueId?: string;
  appointmentId?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  pushSent: boolean;
  createdAt: string;
}

// ─── Analytics ───────────────────────────────────────────

export interface AnalyticsData {
  _id: string;
  clinicId: string;
  doctorId: string;
  date: string;
  totalPatients: number;
  walkIns: number;
  appointments: number;
  emergencies: number;
  completed: number;
  cancelled: number;
  noShows: number;
  averageWaitMinutes: number;
  maxWaitMinutes: number;
  medianWaitMinutes: number;
  averageConsultationMinutes: number;
  maxConsultationMinutes: number;
  peakHour: string;
  peakHourPatients: number;
  hourlyBreakdown: HourlyBreakdown[];
  averageRating: number;
  ratingCount: number;
}

export interface HourlyBreakdown {
  hour: number;
  patients: number;
  avgWait: number;
}

export interface DashboardStats {
  today: {
    totalPatients: number;
    completed: number;
    waiting: number;
    emergencies: number;
    avgWaitMinutes: number;
    avgConsultationMinutes: number;
    status: string;
  };
  weeklyTrend: AnalyticsData[];
  upcomingAppointments: number;
}

// ─── Doctor Availability ─────────────────────────────────

export type DoctorStatus = 'available' | 'in-consultation' | 'on-break' | 'unavailable' | 'off-duty';

export interface DoctorAvailability {
  _id: string;
  doctorId: string | User;
  clinicId: string | Clinic;
  weeklySchedule: WeeklyScheduleItem[];
  overrides: AvailabilityOverride[];
  currentStatus: DoctorStatus;
  avgConsultationMinutes: number;
  isAcceptingPatients: boolean;
}

export interface WeeklyScheduleItem {
  day: DayOfWeek;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
  maxAppointments: number;
}

export interface AvailabilityOverride {
  date: string;
  isAvailable: boolean;
  reason?: string;
  customHours?: { start: string; end: string };
}

// ─── API Response ────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ─── Socket Events ───────────────────────────────────────

export interface QueueUpdateEvent {
  queueId: string;
  action: 'patient-joined' | 'patient-called' | 'consultation-completed' | 'entry-cancelled' | 'emergency-added';
  entry?: QueueEntry;
  calledToken?: string;
  completedToken?: string;
  cancelledToken?: string;
  waitingCount: number;
  emergencyCount?: number;
}

export interface QueueStatusEvent {
  queueId: string;
  status: QueueStatus;
  reason?: string;
}

export interface YourTurnEvent {
  tokenNumber: string;
  message: string;
}

export interface TurnApproachingEvent {
  tokenNumber: string;
  position: number;
}
