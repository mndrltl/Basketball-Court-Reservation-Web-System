import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Reservation, CourtOption, EquipmentLoanItem, StudentMember, UserProfile } from '../types';
import {
  INITIAL_USER,
  INITIAL_ADMIN_USER,
  INITIAL_ALL_RESERVATIONS,
  COURTS_DATA,
  INITIAL_EQUIPMENT,
  INITIAL_STUDENTS,
} from '../data/initialData';

const USERS_COL = 'users';
const RESERVATIONS_COL = 'reservations';
const COURTS_COL = 'courts';
const EQUIPMENT_COL = 'equipment';
const STUDENTS_COL = 'students';

/**
 * All possible 1-hour time slots for the facility (06:00 AM – 11:00 PM operating window).
 */
export const ALL_TIME_SLOTS = [
  '06:00 AM – 07:00 AM',
  '07:00 AM – 08:00 AM',
  '08:00 AM – 09:00 AM',
  '09:00 AM – 10:00 AM',
  '10:00 AM – 11:00 AM',
  '11:00 AM – 12:00 PM',
  '12:00 PM – 01:00 PM',
  '01:00 PM – 02:00 PM',
  '02:00 PM – 03:00 PM',
  '03:00 PM – 04:00 PM',
  '04:00 PM – 05:00 PM',
  '05:00 PM – 06:00 PM',
  '06:00 PM – 07:00 PM',
  '07:00 PM – 08:00 PM',
  '08:00 PM – 09:00 PM',
  '09:00 PM – 10:00 PM',
  '10:00 PM – 11:00 PM',
];

// ==========================================================================
// SEED
// ==========================================================================

/**
 * Seed initial data to Firestore if collections are empty
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const resSnap = await getDocs(query(collection(db, RESERVATIONS_COL), limit(1)));
    if (resSnap.empty) {
      console.log('Seeding initial reservations to Firestore...');
      for (const res of INITIAL_ALL_RESERVATIONS) {
        await setDoc(doc(db, RESERVATIONS_COL, res.id), res);
      }
    }

    const courtsSnap = await getDocs(query(collection(db, COURTS_COL), limit(1)));
    if (courtsSnap.empty) {
      console.log('Seeding initial courts to Firestore...');
      for (const court of COURTS_DATA) {
        await setDoc(doc(db, COURTS_COL, court.id), court);
      }
    }

    const eqSnap = await getDocs(query(collection(db, EQUIPMENT_COL), limit(1)));
    if (eqSnap.empty) {
      console.log('Seeding initial equipment to Firestore...');
      for (const item of INITIAL_EQUIPMENT) {
        await setDoc(doc(db, EQUIPMENT_COL, item.id), item);
      }
    }

    const studentSnap = await getDocs(query(collection(db, STUDENTS_COL), limit(1)));
    if (studentSnap.empty) {
      console.log('Seeding initial students to Firestore...');
      for (const student of INITIAL_STUDENTS) {
        await setDoc(doc(db, STUDENTS_COL, student.id), student);
      }
    }

    // Ensure default demo users exist
    const studentDocId = INITIAL_USER.uid || INITIAL_USER.studentId || 'default-student';
    const adminDocId = INITIAL_ADMIN_USER.uid || INITIAL_ADMIN_USER.studentId || 'default-admin';
    await setDoc(doc(db, USERS_COL, studentDocId), INITIAL_USER, { merge: true });
    await setDoc(doc(db, USERS_COL, adminDocId), INITIAL_ADMIN_USER, { merge: true });
  } catch (err) {
    console.warn('Firestore initial seed note:', err);
  }
}

// ==========================================================================
// RESERVATIONS
// ==========================================================================

/**
 * Fetch all reservations from Firestore
 */
export async function fetchFirestoreReservations(): Promise<Reservation[]> {
  try {
    const snap = await getDocs(collection(db, RESERVATIONS_COL));
    if (snap.empty) return INITIAL_ALL_RESERVATIONS;
    return snap.docs.map(d => d.data() as Reservation);
  } catch (err) {
    console.warn('Failed to fetch reservations from Firestore, fallback to local', err);
    return INITIAL_ALL_RESERVATIONS;
  }
}

/**
 * Save new reservation to Firestore.
 * Throws on failure so callers can handle errors.
 */
export async function saveFirestoreReservation(reservation: Reservation): Promise<void> {
  await setDoc(doc(db, RESERVATIONS_COL, reservation.id), reservation);
}

/**
 * Update reservation in Firestore.
 * Throws on failure so callers can handle errors.
 */
export async function updateFirestoreReservation(
  id: string,
  updates: Partial<Reservation>
): Promise<void> {
  await updateDoc(doc(db, RESERVATIONS_COL, id), updates);
}

// ==========================================================================
// COURTS
// ==========================================================================

/**
 * Fetch courts from Firestore
 */
export async function fetchFirestoreCourts(): Promise<CourtOption[]> {
  try {
    const snap = await getDocs(collection(db, COURTS_COL));
    if (snap.empty) return COURTS_DATA;
    return snap.docs.map(d => d.data() as CourtOption);
  } catch (err) {
    return COURTS_DATA;
  }
}

/**
 * Update court status in Firestore.
 * Throws on failure so callers can handle errors.
 */
export async function updateFirestoreCourt(
  courtId: string,
  status: CourtOption['status'],
  maintenanceNote?: string
): Promise<void> {
  const payload: Partial<CourtOption> = { status };
  if (maintenanceNote !== undefined) payload.maintenanceNote = maintenanceNote;
  await updateDoc(doc(db, COURTS_COL, courtId), payload);
}

// ==========================================================================
// EQUIPMENT
// ==========================================================================

/**
 * Fetch all equipment from Firestore
 */
export async function fetchFirestoreEquipment(): Promise<EquipmentLoanItem[]> {
  try {
    const snap = await getDocs(collection(db, EQUIPMENT_COL));
    if (snap.empty) return INITIAL_EQUIPMENT;
    return snap.docs.map(d => d.data() as EquipmentLoanItem);
  } catch (err) {
    console.warn('Failed to fetch equipment from Firestore, fallback to local', err);
    return INITIAL_EQUIPMENT;
  }
}

/**
 * Update equipment record in Firestore.
 * Throws on failure so callers can handle errors.
 */
export async function updateFirestoreEquipment(
  eqId: string,
  updates: Partial<EquipmentLoanItem>
): Promise<void> {
  await updateDoc(doc(db, EQUIPMENT_COL, eqId), updates);
}

// ==========================================================================
// STUDENTS
// ==========================================================================

/**
 * Fetch all students from Firestore
 */
export async function fetchFirestoreStudents(): Promise<StudentMember[]> {
  try {
    const snap = await getDocs(collection(db, STUDENTS_COL));
    if (snap.empty) return INITIAL_STUDENTS;
    return snap.docs.map(d => d.data() as StudentMember);
  } catch (err) {
    console.warn('Failed to fetch students from Firestore, fallback to local', err);
    return INITIAL_STUDENTS;
  }
}

/**
 * Update student record in Firestore.
 * Throws on failure so callers can handle errors.
 */
export async function updateFirestoreStudent(
  studentDocId: string,
  updates: Partial<StudentMember>
): Promise<void> {
  await updateDoc(doc(db, STUDENTS_COL, studentDocId), updates);
}

// ==========================================================================
// USER PROFILE
// ==========================================================================

/**
 * Update user profile in Firestore
 */
export async function saveFirestoreUserProfile(user: UserProfile): Promise<void> {
  try {
    const docId = user.uid || user.studentId || 'current-user';
    await setDoc(doc(db, USERS_COL, docId), user, { merge: true });
  } catch (err) {
    console.warn('Failed to save user profile in Firestore:', err);
  }
}

// ==========================================================================
// BOOKING CONFLICT DETECTION
// ==========================================================================

/**
 * Check for booking conflicts using local state (fast, for pre-submit validation).
 * Returns the conflicting reservation or null.
 */
export function checkLocalBookingConflict(
  allReservations: Reservation[],
  courtName: string,
  isoDate: string,
  timeSlot: string,
  excludeReservationId?: string
): Reservation | null {
  return allReservations.find(r =>
    r.courtName === courtName &&
    r.isoDate === isoDate &&
    r.timeSlot === timeSlot &&
    r.status !== 'Cancelled by User' &&
    r.status !== 'Completed' &&
    r.id !== excludeReservationId
  ) || null;
}

/**
 * Server-side conflict check: re-fetches reservations from Firestore.
 * Use immediately before confirming a booking to prevent race conditions.
 */
export async function checkServerBookingConflict(
  courtName: string,
  isoDate: string,
  timeSlot: string,
  excludeReservationId?: string
): Promise<Reservation | null> {
  const allReservations = await fetchFirestoreReservations();
  return checkLocalBookingConflict(allReservations, courtName, isoDate, timeSlot, excludeReservationId);
}

// ==========================================================================
// DYNAMIC TIME SLOT AVAILABILITY
// ==========================================================================

/**
 * Parse a time string like "04:00 PM" to a 24-hour number (16).
 */
function parseTimeToHour(timeStr: string): number {
  const parts = timeStr.trim().split(' ');
  const period = parts[1]; // AM or PM
  const [hoursStr] = parts[0].split(':');
  let hours = Number(hoursStr);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours;
}

/**
 * Compute available time slots for a specific court on a specific date,
 * based on actual reservation data.
 */
export function computeTimeSlotAvailability(
  allReservations: Reservation[],
  courtName: string,
  isoDate: string,
  selectedSlot?: string
): { id: string; time: string; label: string; status: 'open' | 'reserved' | 'selected' | 'closed' }[] {
  // Collect booked slot strings for this court and date
  const bookedSlots = new Set(
    allReservations
      .filter(r =>
        r.courtName === courtName &&
        r.isoDate === isoDate &&
        r.status !== 'Cancelled by User' &&
        r.status !== 'Completed'
      )
      .map(r => r.timeSlot)
  );

  // Check if the date is today or in the past (relative to real current time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const slotDate = new Date(isoDate + 'T00:00:00');
  const isToday = slotDate.getTime() === today.getTime();
  const isPast = slotDate < today;

  const now = new Date();
  const currentHour = now.getHours();

  return ALL_TIME_SLOTS.map((time, idx) => {
    const slotId = `slot-${idx + 1}`;

    // If date is in the past, mark all as closed
    if (isPast) {
      return { id: slotId, time, label: 'Past Date', status: 'closed' as const };
    }

    // If today, check if the start time has already passed
    if (isToday) {
      const startHourStr = time.split(' – ')[0];
      const slotHour = parseTimeToHour(startHourStr);
      if (slotHour <= currentHour) {
        return { id: slotId, time, label: 'Time Passed', status: 'closed' as const };
      }
    }

    // Check if booked
    if (bookedSlots.has(time)) {
      // Find who booked it for the label
      const booker = allReservations.find(r =>
        r.courtName === courtName &&
        r.isoDate === isoDate &&
        r.timeSlot === time &&
        r.status !== 'Cancelled by User' &&
        r.status !== 'Completed'
      );
      const label = booker?.status === 'Blocked / Varsity'
        ? 'Varsity Block'
        : 'Reserved';
      return { id: slotId, time, label, status: 'reserved' as const };
    }

    // Check if this is the user's selected slot
    if (selectedSlot === time) {
      return { id: slotId, time, label: 'Active Slot Selected', status: 'selected' as const };
    }

    return { id: slotId, time, label: 'Standard Reservation', status: 'open' as const };
  });
}

// ==========================================================================
// VALIDATION HELPERS
// ==========================================================================

/**
 * Check if a court is available for booking (not Maintenance or Closed).
 */
export function isCourtBookable(court: CourtOption): boolean {
  return court.status === 'Available' || court.status === 'Reserved';
}

/**
 * Check if a date string represents today or a future date.
 */
export function isDateValid(isoDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(isoDate + 'T00:00:00');
  return checkDate >= today;
}

/**
 * Derive BookingHistoryRecords from reservation data for a specific user.
 */
export function deriveBookingHistory(
  allReservations: Reservation[],
  userStudentId: string
): { id: string; courtName: string; courtType: 'Basketball' | 'Volleyball'; date: string; timeSlot: string; equipmentRequested: string; status: 'Completed' | 'Cancelled by User' }[] {
  return allReservations
    .filter(r =>
      (r.status === 'Completed' || r.status === 'Cancelled by User') &&
      r.studentId === userStudentId
    )
    .map(r => ({
      id: r.id,
      courtName: r.courtName,
      courtType: (r.courtName.toLowerCase().includes('volleyball') ? 'Volleyball' : 'Basketball') as 'Basketball' | 'Volleyball',
      date: r.dateStr,
      timeSlot: r.timeSlot,
      equipmentRequested: r.equipmentSummary || 'None',
      status: r.status as 'Completed' | 'Cancelled by User',
    }));
}
