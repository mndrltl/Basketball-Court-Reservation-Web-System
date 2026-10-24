import type { UserProfile } from '../types';
import { apiRequest, ApiError } from './apiClient';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseUserProfile(value: unknown): UserProfile {
  if (!isRecord(value) || !isRecord(value.user)) {
    throw new ApiError(502, 'The server returned an invalid user profile.');
  }

  const user = value.user;
  if (
    typeof user.uid !== 'string'
    || typeof user.name !== 'string'
    || typeof user.studentId !== 'string'
    || typeof user.email !== 'string'
    || typeof user.role !== 'string'
    || typeof user.eligibility !== 'string'
    || typeof user.avatarUrl !== 'string'
    || typeof user.isAdmin !== 'boolean'
  ) {
    throw new ApiError(502, 'The server returned an invalid user profile.');
  }

  return {
    uid: user.uid,
    name: user.name,
    studentId: user.studentId,
    email: user.email,
    role: user.role,
    eligibility: user.eligibility,
    avatarUrl: user.avatarUrl,
    isAdmin: user.isAdmin
  };
}

async function verifyCreatedSession(user: UserProfile): Promise<UserProfile> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || sessionUser.uid !== user.uid) {
    throw new ApiError(401, 'The server could not verify the sign-in session.');
  }
  return sessionUser;
}

export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  const response = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return verifyCreatedSession(parseUserProfile(response));
}

export async function registerWithEmail(
  name: string,
  studentId: string,
  email: string,
  password: string
): Promise<UserProfile> {
  const response = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, studentId, email, password })
  });
  return verifyCreatedSession(parseUserProfile(response));
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    return parseUserProfile(await apiRequest('/api/auth/me'));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await apiRequest('/api/auth/logout', { method: 'POST' });
}
