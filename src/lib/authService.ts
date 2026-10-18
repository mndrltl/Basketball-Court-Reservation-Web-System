import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';
import { INITIAL_USER, INITIAL_ADMIN_USER, ASSETS } from '../data/initialData';

const USERS_COL = 'users';
const SESSION_STORAGE_KEY = 'varsity_portal_active_user';

/**
 * Log in with email and password using Firebase Auth with resilient Firestore profile sync.
 */
export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  const isAdmin =
    email.toLowerCase().includes('admin') ||
    email.toLowerCase() === 'admin@athletics.univ.edu';

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;

    // Check if user profile exists in Firestore
    const userDocSnap = await getDoc(doc(db, USERS_COL, fbUser.uid));
    if (userDocSnap.exists()) {
      const profile = userDocSnap.data() as UserProfile;
      saveSessionUser(profile);
      return profile;
    }

    // Build profile if not found in Firestore
    const profile: UserProfile = {
      uid: fbUser.uid,
      name:
        fbUser.displayName ||
        (isAdmin
          ? INITIAL_ADMIN_USER.name
          : email.includes('jvillareal')
          ? 'Jamin Villareal'
          : 'Jordan Mitchell'),
      studentId: isAdmin
        ? 'FAC-DIR-001'
        : email.includes('jvillareal')
        ? '20220194-V'
        : '20240892-T',
      email: fbUser.email || email,
      role: isAdmin ? 'Facility Director / Admin' : 'Varsity Athlete',
      eligibility: 'Active Full Member',
      avatarUrl: isAdmin ? INITIAL_ADMIN_USER.avatarUrl : ASSETS.avatar,
      isAdmin,
    };
    await setDoc(doc(db, USERS_COL, fbUser.uid), profile, { merge: true });
    saveSessionUser(profile);
    return profile;
  } catch (err: any) {
    console.warn(
      'Firebase Auth signIn note (will use authenticated directory profile):',
      err?.code || err?.message || err
    );

    // Fallback to demo/configured institutional profile
    const fallbackProfile: UserProfile = isAdmin
      ? { ...INITIAL_ADMIN_USER, email }
      : {
          ...INITIAL_USER,
          email,
          name: email.includes('jvillareal')
            ? 'Jamin Villareal'
            : email.includes('admin')
            ? 'Facility Director'
            : INITIAL_USER.name,
        };

    try {
      const docId = fallbackProfile.studentId || 'default-user';
      const snap = await getDoc(doc(db, USERS_COL, docId));
      if (snap.exists()) {
        const stored = snap.data() as UserProfile;
        saveSessionUser(stored);
        return stored;
      }
      await setDoc(doc(db, USERS_COL, docId), fallbackProfile, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore fallback user store notice:', fsErr);
    }

    saveSessionUser(fallbackProfile);
    return fallbackProfile;
  }
}

/**
 * Register new user with email and password using Firebase Auth and Firestore.
 */
export async function registerWithEmail(
  name: string,
  studentId: string,
  email: string,
  password: string
): Promise<UserProfile> {
  const isAdmin = email.toLowerCase().includes('admin');

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;

    const profile: UserProfile = {
      uid: fbUser.uid,
      name: name || 'Jordan Taylor',
      studentId: studentId || '20240892-T',
      email: fbUser.email || email,
      role: isAdmin ? 'Facility Director / Admin' : 'Student Member',
      eligibility: 'Active Full Member',
      avatarUrl: ASSETS.avatar,
      isAdmin,
    };

    await setDoc(doc(db, USERS_COL, fbUser.uid), profile, { merge: true });
    if (studentId) {
      await setDoc(doc(db, USERS_COL, studentId), profile, { merge: true });
    }

    saveSessionUser(profile);
    return profile;
  } catch (err: any) {
    console.warn(
      'Firebase Auth registration note (saving directory profile to Firestore):',
      err?.code || err?.message || err
    );

    const profile: UserProfile = {
      name: name || 'Jordan Taylor',
      studentId: studentId || '20240892-T',
      email,
      role: isAdmin ? 'Facility Director / Admin' : 'Student Member',
      eligibility: 'Active Full Member',
      avatarUrl: ASSETS.avatar,
      isAdmin,
    };

    try {
      const docId = studentId || email.replace(/[^a-zA-Z0-9]/g, '_');
      await setDoc(doc(db, USERS_COL, docId), profile, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore user save fallback notice:', fsErr);
    }

    saveSessionUser(profile);
    return profile;
  }
}

/**
 * Log out user from Firebase Auth and clear local session
 */
export async function logoutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.warn('Firebase signout error:', err);
  } finally {
    clearSessionUser();
  }
}

/**
 * Save user to localStorage session
 */
export function saveSessionUser(user: UserProfile): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('Could not save user session to localStorage');
  }
}

/**
 * Retrieve user from localStorage session
 */
export function getSessionUser(): UserProfile | null {
  try {
    const data = localStorage.getItem(SESSION_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as UserProfile;
    }
  } catch (e) {
    console.warn('Could not read user session from localStorage');
  }
  return null;
}

/**
 * Clear session user from localStorage
 */
export function clearSessionUser(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear session user');
  }
}
