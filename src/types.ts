export type ViewTab = 'dashboard' | 'reservations' | 'booking-history' | 'admin' | 'auth';

export type AdminTab = 'overview' | 'reservations' | 'courts' | 'equipment' | 'students' | 'schedule';

export interface UserProfile {
  uid?: string;
  name: string;
  studentId: string;
  email: string;
  role: string;
  eligibility: string;
  avatarUrl: string;
  isAdmin?: boolean;
}

export interface CourtOption {
  id: string;
  name: string;
  type: 'basketball' | 'volleyball';
  badge: string;
  subLocation: string;
  fullLocation: string;
  capacity: string;
  imageUrl: string;
  status: 'Available' | 'Reserved' | 'Maintenance' | 'Closed';
  maintenanceNote?: string;
  condition?: string;
}

export interface TimeSlot {
  id: string;
  timeRange: string;
  label: string;
  status: 'available' | 'reserved' | 'closed';
}

export interface EquipmentLoanItem {
  id: string;
  name: string;
  category: string;
  spec: string;
  description: string;
  availableStock: number;
  totalStock?: number;
  loanedStock?: number;
  maintenanceStock?: number;
  imageUrl: string;
  quantity: number;
}

export interface Reservation {
  id: string;
  docket: string;
  courtName: string;
  courtSub: string;
  facilityDetail: string;
  dateStr: string;
  isoDate: string;
  timeSlot: string;
  equipmentSummary: string;
  equipmentDetails: { name: string; qty: number }[];
  checkInLocation: string;
  status: 'Confirmed' | 'Pending Confirmation' | 'In Progress' | 'Completed' | 'Cancelled by User' | 'Blocked / Varsity';
  studentName: string;
  studentId: string;
  studentEmail?: string;
  isCheckedIn?: boolean;
  notes?: string;
}

export interface BookingHistoryRecord {
  id: string;
  courtName: string;
  courtType: 'Basketball' | 'Volleyball';
  date: string;
  timeSlot: string;
  equipmentRequested: string;
  status: 'Completed' | 'Cancelled by User';
}

export interface StudentMember {
  id: string;
  studentId: string;
  name: string;
  email: string;
  department: string;
  eligibility: 'Active Full Member' | 'Varsity Athlete' | 'Suspended' | 'Faculty/Staff';
  activeBookingsCount: number;
  totalHoursPlayed: number;
  joinDate: string;
}

