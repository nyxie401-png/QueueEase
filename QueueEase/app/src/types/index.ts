// ─── User Types ───────────────────────────────────────────────────────────────
export type UserRole = 'patient' | 'doctor' | 'receptionist';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  clinicId?: string;
  avatar?: string;
  isVerified?: boolean;
  visitCount?: number;
  createdAt: number;
  updatedAt: number;
}

// ─── Queue Types ──────────────────────────────────────────────────────────────
export type QueueStatus = 'WAITING' | 'CALLED' | 'SERVED' | 'NO_SHOW' | 'CANCELLED';

export interface QueueEntry {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  queuePosition: number;
  status: QueueStatus;
  bookingDate: string;
  arrivalTime?: number;
  consultationDuration?: number;
  estimatedWaitTime?: number;
  predictedTime?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CurrentQueueData {
  position: number;
  estimatedWait: number;
  status: QueueStatus;
  predictedTime?: string;
  ahead: AheadEntry[];
}

export interface AheadEntry {
  id: string;
  name: string;
  position: number;
  status: string;
  predictedTime?: string;
  isMe?: boolean;
}

// ─── Clinic Types ─────────────────────────────────────────────────────────────
export interface Clinic {
  id: string;
  name: string;
  doctorName: string;
  specialty: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  operatingHours: string;
  sessionStartScheduled: string;
  sessionStartActual?: string;
  maxPatientsPerDay: number;
  avgConsultationTime: number;
  isOpen: boolean;
  createdAt: number;
  updatedAt: number;
}

// ─── Notification Types ───────────────────────────────────────────────────────
export type NotificationType = 'QUEUE_UPDATE' | 'TURN_APPROACHING' | 'APPOINTMENT_REMINDER' | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: number;
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}
