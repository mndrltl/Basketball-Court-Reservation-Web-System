import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
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
 * Save new reservation to Firestore
 */
export async function saveFirestoreReservation(reservation: Reservation): Promise<void> {
  try {
    await setDoc(doc(db, RESERVATIONS_COL, reservation.id), reservation);
  } catch (err) {
    console.warn('Failed to save reservation to Firestore:', err);
  }
}

/**
 * Update reservation in Firestore
 */
export async function updateFirestoreReservation(
  id: string,
  updates: Partial<Reservation>
): Promise<void> {
  try {
    await updateDoc(doc(db, RESERVATIONS_COL, id), updates);
  } catch (err) {
    console.warn('Failed to update reservation in Firestore:', err);
  }
}

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
 * Update court status in Firestore
 */
export async function updateFirestoreCourt(
  courtId: string,
  status: CourtOption['status'],
  maintenanceNote?: string
): Promise<void> {
  try {
    const payload: Partial<CourtOption> = { status };
    if (maintenanceNote !== undefined) payload.maintenanceNote = maintenanceNote;
    await updateDoc(doc(db, COURTS_COL, courtId), payload);
  } catch (err) {
    console.warn('Failed to update court in Firestore:', err);
  }
}

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
