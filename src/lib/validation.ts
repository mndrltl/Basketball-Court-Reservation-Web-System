export type AuthField = 'name' | 'studentId' | 'email' | 'password' | 'confirmPassword';

export type AuthFieldErrors = Partial<Record<AuthField, string>>;

export function isValidName(value: string): boolean {
  const name = value.trim();
  return name.length >= 2
    && name.length <= 100
    && /^[\p{L}\p{M}]+(?:[ .'\u2019-][\p{L}\p{M}]+)*\.?$/u.test(name);
}

export function isValidStudentId(value: string): boolean {
  return /^\d{8}-[A-Z]$/i.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidUniversityEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  return isValidEmail(email) && email.endsWith('.edu');
}

export function isValidPassword(value: string): boolean {
  const byteLength = new TextEncoder().encode(value).length;
  return byteLength >= 8 && byteLength <= 72;
}

export function getRegistrationErrors(
  name: string,
  studentId: string,
  email: string,
  password: string,
  confirmPassword: string
): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (!isValidName(name)) {
    errors.name = 'Enter a valid name using letters, spaces, apostrophes, or hyphens.';
  }
  if (!isValidStudentId(studentId)) {
    errors.studentId = 'Use the format 12345678-A.';
  }
  if (!isValidUniversityEmail(email)) {
    errors.email = 'Enter a valid university .edu email address.';
  }
  if (!isValidPassword(password)) {
    errors.password = 'Password must be 8 to 72 UTF-8 bytes long.';
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}
