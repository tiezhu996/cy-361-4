export interface FeatureItem {
  id: number;
  title: string;
  description: string;
  status: string;
  metric: string;
}

export interface KpiItem {
  label: string;
  value: string;
  trend: string;
  tone: string;
}

export interface OperationRecord {
  key: string;
  name: string;
  owner: string;
  status: string;
  metric: string;
  priority: string;
}

export enum ReservationStatus {
  PENDING = "pending",
  CHECKED_IN = "checked_in",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  VIOLATED = "violated",
}

export enum ViolationType {
  LATE_CHECKIN = "late_checkin",
  NO_SHOW = "no_show",
  OVERTIME = "overtime",
}

export interface User {
  id: number;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  role: string;
  isCertified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: number;
  name: string;
  model?: string;
  serialNumber: string;
  location?: string;
  category?: string;
  description?: string;
  purchaseDate?: string;
  imageUrl?: string;
  status: string;
  requiresCertification: boolean;
  minReserveMinutes: number;
  maxReserveHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: number;
  equipmentId: number;
  userId: number;
  startTime: string;
  endTime: string;
  checkinTime?: string;
  checkoutTime?: string;
  actualDurationMinutes?: number;
  status: ReservationStatus;
  qrCodeToken: string;
  purpose?: string;
  createdAt: string;
  updatedAt: string;
  equipment?: Equipment;
  user?: User;
}

export interface Violation {
  id: number;
  userId: number;
  reservationId: number;
  type: ViolationType;
  description?: string;
  createdAt: string;
  user?: User;
  reservation?: Reservation;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface OverviewStats {
  equipmentCount: number;
  userCount: number;
  todayReservations: number;
  todayCompleted: number;
  todayPending: number;
  todayCheckedIn: number;
  totalViolations: number;
}

export interface UpcomingReservation {
  id: number;
  equipmentName?: string;
  userName?: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
}

export interface RecentViolation {
  id: number;
  userName?: string;
  equipmentName?: string;
  type: ViolationType;
  description?: string;
  createdAt: string;
}

export interface OverviewResponse {
  appName: string;
  appCode: string;
  description: string;
  features: FeatureItem[];
  kpis: KpiItem[];
  records: OperationRecord[];
  stats: OverviewStats;
  upcomingReservations: UpcomingReservation[];
  recentViolations: RecentViolation[];
}

export interface CreateReservationRequest {
  equipmentId: number;
  userId: number;
  startTime: string;
  endTime: string;
  purpose?: string;
}

export interface CheckinRequest {
  qrCodeToken: string;
}
