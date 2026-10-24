import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { BasketballLogo } from './BasketballLogo';
import type { UserProfile } from '../types';
import { loginWithEmail, registerWithEmail } from '../lib/authService';
import { ApiError } from '../lib/apiClient';
import {
  getRegistrationErrors,
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidStudentId,
  isValidUniversityEmail
} from '../lib/validation';
import type { AuthField, AuthFieldErrors } from '../lib/validation';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  systemError?: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, systemError }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});

  // Feedback toast state
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const clearFieldError = (field: AuthField, value: string) => {
    const valid = field === 'name'
      ? isValidName(value)
      : field === 'studentId'
        ? isValidStudentId(value)
        : field === 'email'
            ? activeTab === 'register' ? isValidUniversityEmail(value) : isValidEmail(value)
          : field === 'password'
            ? isValidPassword(value)
            : value === regPassword;
    if (!valid) return;

    setFieldErrors(previous => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  // Password strength calculation
  const getPasswordStrength = (val: string) => {
    if (!val) return { score: 0, label: 'Awaiting input' };
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (score <= 1) return { score: 1, label: 'Low Resilience' };
    if (score === 2) return { score: 2, label: 'Moderate' };
    return { score: Math.min(4, score), label: 'Institutional Standard' };
  };

  const strength = getPasswordStrength(regPassword);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: AuthFieldErrors = {};
    if (!isValidEmail(loginIdentifier)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!loginPassword) {
      errors.password = 'Enter your password.';
    }
    setFieldErrors(errors);
    setFeedback(null);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      const userProfile = await loginWithEmail(loginIdentifier.trim(), loginPassword);
      onLoginSuccess(userProfile);
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors({
          email: error.fieldErrors.email,
          password: error.fieldErrors.password,
          name: error.fieldErrors.name,
          studentId: error.fieldErrors.studentId,
          confirmPassword: error.fieldErrors.confirmPassword
        });
      }
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Login failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = getRegistrationErrors(regName, regId, regEmail, regPassword, regConfirmPassword);
    setFieldErrors(errors);
    setFeedback(null);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      const userProfile = await registerWithEmail(regName, regId, regEmail, regPassword);
      onLoginSuccess(userProfile);
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors({
          email: error.fieldErrors.email,
          password: error.fieldErrors.password,
          name: error.fieldErrors.name,
          studentId: error.fieldErrors.studentId,
          confirmPassword: error.fieldErrors.confirmPassword
        });
      }
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-[#f5faff]">
      <div className="flex flex-col w-full max-w-6xl mx-auto my-auto">
        <div className="relative w-full rounded-2xl overflow-hidden bg-[#e9f5ff] shadow-xl p-4 sm:p-6 lg:p-10 border border-[#ddeaf3]">
          {/* Ambient Decorative Blurs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#c9e7f8]/40 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#d0e4ff]/30 blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left Column: Institutional Brand & Facility Stats */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-white/85 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-sm border border-[#ddeaf3]/70">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-[#2d4055] flex items-center justify-center text-white shadow-sm overflow-hidden p-1.5 shrink-0">
                    <BasketballLogo className="w-full h-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-[#466271] uppercase tracking-widest">
                      Athletic Facilities Board
                    </span>
                    <span className="font-headline text-lg font-bold text-[#2d4055] tracking-tight">
                      Varsity Court Portal
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[#2d4055] leading-tight">
                    Basketball Court Reservation Web System
                  </h1>
                  <p className="text-sm text-[#466271] mt-2 leading-relaxed">
                    Official university athletic facility booking portal for indoor basketball courts, volleyball courts, and equipment lending.
                  </p>
                </div>

                {/* Sports and booking services */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#e3f0f9] p-3 rounded-lg flex flex-col justify-center border border-[#ddeaf3]">
                    <div className="flex items-center space-x-1.5 text-[#2d4055] text-xs font-semibold">
                      <span className="material-symbols-outlined text-base">sports_basketball</span>
                      <span>Basketball</span>
                    </div>
                    <span className="text-[11px] text-[#466271] mt-0.5">Court reservations</span>
                  </div>

                  <div className="bg-[#e3f0f9] p-3 rounded-lg flex flex-col justify-center border border-[#ddeaf3]">
                    <div className="flex items-center space-x-1.5 text-[#2d4055] text-xs font-semibold">
                      <span className="material-symbols-outlined text-base">sports_volleyball</span>
                      <span>Volleyball</span>
                    </div>
                    <span className="text-[11px] text-[#466271] mt-0.5">Court reservations</span>
                  </div>
                </div>
              </div>

              {/* Authentication information */}
              <div className="mt-6 pt-4 flex flex-col space-y-2">
                <div className="bg-[#ddeaf3]/70 p-4 rounded-xl flex flex-col space-y-1.5 border border-[#c4c6cd]/50 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#2d4055] font-bold">
                      <span className="material-symbols-outlined text-base">verified_user</span>
                      Secure account access
                    </span>
                  </div>

                  <div className="flex flex-col pt-1">
                    <span className="font-headline font-semibold text-base text-[#2d4055]">
                      Your athletics account
                    </span>
                    <span className="text-xs text-[#466271]">Sign in to manage reservations and profile details.</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[#466271] text-xs pt-1">
                    <span className="material-symbols-outlined text-base text-[#2d4055]">lock</span>
                    <span>Sessions are protected by an HTTP-only cookie.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Frosted Auth Card Container with Tabs */}
            <div className="lg:col-span-7 flex flex-col bg-white/95 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-sm border border-[#ddeaf3]/70 justify-between">
              <div>
                {/* Segmented Tab Navigation */}
                <div className="flex p-1 bg-[#e3f0f9] rounded-lg mb-6 border border-[#ddeaf3]">
                  <button
                    id="tab-login"
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setFeedback(null);
                    }}
                    className={`flex-1 py-2 text-center text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'login'
                        ? 'bg-[#44576d] text-white shadow-sm'
                        : 'text-[#466271] hover:text-[#2d4055]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">login</span>
                    Log In
                  </button>

                  <button
                    id="tab-register"
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setFeedback(null);
                    }}
                    className={`flex-1 py-2 text-center text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'register'
                        ? 'bg-[#44576d] text-white shadow-sm'
                        : 'text-[#466271] hover:text-[#2d4055]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">person_add</span>
                    Create Account
                  </button>
                </div>

                {/* Log In Form View */}
                {activeTab === 'login' && (
                  <div className="flex flex-col space-y-4" id="view-login">
                    <div className="flex flex-col">
                      <h2 className="font-headline text-xl font-bold text-[#2d4055]">
                        Sign in to your account
                      </h2>
                      <p className="text-sm text-[#466271] mt-1">
                        Provide your verified institutional credentials to manage reservations.
                      </p>
                    </div>

                    <form className="space-y-4 pt-1" onSubmit={handleLoginSubmit}>
                      <div className="flex flex-col space-y-1">
                        <label
                          className="text-xs font-semibold text-[#344048] flex items-center justify-between"
                          htmlFor="login-identifier"
                        >
                          <span>University Email</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3 text-[#466271] text-lg pointer-events-none">
                            mail
                          </span>
                          <input
                            id="login-identifier"
                            value={loginIdentifier}
                            onChange={(e) => {
                              setLoginIdentifier(e.target.value);
                              clearFieldError('email', e.target.value);
                              setFeedback(null);
                            }}
                            placeholder="name@university.edu"
                            required
                            type="email"
                            aria-invalid={Boolean(fieldErrors.email)}
                            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                            className={`w-full h-10 pl-10 pr-3 bg-white text-[#111d24] text-sm rounded-lg border ${
                              fieldErrors.email ? 'border-[#ba1a1a]' : 'border-[#c4c6cd]'
                            } focus:ring-2 focus:ring-[#44576d] focus:border-transparent outline-none shadow-xs transition-all`}
                          />
                        </div>
                        {fieldErrors.email && (
                          <p id="login-email-error" className="text-xs text-[#ba1a1a]" role="alert">
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-[#344048]" htmlFor="login-password">
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                'Password reset requests require contacting the University Athletics Registrar desk (athletics-support@univ.edu).'
                              )
                            }
                            className="text-xs text-[#2d4055] hover:underline"
                          >
                            Forgot credentials?
                          </button>
                        </div>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3 text-[#466271] text-lg pointer-events-none">
                            lock
                          </span>
                          <input
                            id="login-password"
                            value={loginPassword}
                            onChange={(e) => {
                              setLoginPassword(e.target.value);
                              clearFieldError('password', e.target.value);
                              setFeedback(null);
                            }}
                            placeholder="••••••••••••"
                            required
                            type={showPassword ? 'text' : 'password'}
                            aria-invalid={Boolean(fieldErrors.password)}
                            aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                            className={`w-full h-10 pl-10 pr-10 bg-white text-[#111d24] text-sm rounded-lg border ${
                              fieldErrors.password ? 'border-[#ba1a1a]' : 'border-[#c4c6cd]'
                            } focus:ring-2 focus:ring-[#44576d] focus:border-transparent outline-none shadow-xs transition-all`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 text-[#466271] hover:text-[#2d4055]"
                          >
                            <span className="material-symbols-outlined text-lg">
                              {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                        {fieldErrors.password && (
                          <p id="login-password-error" className="text-xs text-[#ba1a1a]" role="alert">
                            {fieldErrors.password}
                          </p>
                        )}
                      </div>

                      <button
                        id="btn-login-submit"
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-[#44576d] hover:bg-[#2d4055] disabled:opacity-60 disabled:cursor-wait text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c9e7f8] focus:ring-offset-2 mt-4 cursor-pointer"
                      >
                        <span>{isLoading ? 'Signing in…' : 'Log In'}</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </button>

                      <div className="text-center pt-2">
                        <span className="text-xs text-[#466271]">Need an account? </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('register');
                            setFeedback(null);
                          }}
                          className="text-xs font-semibold text-[#2d4055] hover:underline"
                        >
                          Register here
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Registration Form View */}
                {activeTab === 'register' && (
                  <div className="flex flex-col space-y-3" id="view-register">
                    <div className="flex flex-col">
                      <h2 className="font-headline text-xl font-bold text-[#2d4055]">
                        Athletic Account Enrollment
                      </h2>
                      <p className="text-xs text-[#466271] mt-0.5">
                        Section 5 Provisioning: University student and staff profile verification.
                      </p>
                    </div>

                    <form className="space-y-3 pt-1" onSubmit={handleRegisterSubmit}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col space-y-1">
                          <label className="text-xs font-semibold text-[#344048]" htmlFor="reg-name">
                            Full Name
                          </label>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3 text-[#466271] text-lg pointer-events-none">
                              badge
                            </span>
                            <input
                              id="reg-name"
                              value={regName}
                              onChange={(e) => {
                                setRegName(e.target.value);
                                clearFieldError('name', e.target.value);
                                setFeedback(null);
                              }}
                              placeholder="Jordan Taylor"
                              required
                              type="text"
                              aria-invalid={Boolean(fieldErrors.name)}
                              aria-describedby={fieldErrors.name ? 'reg-name-error' : undefined}
                              className={`w-full h-10 pl-10 pr-3 bg-white text-[#111d24] text-sm rounded-lg border ${
                                fieldErrors.name ? 'border-[#ba1a1a]' : 'border-[#c4c6cd]'
                              } focus:ring-2 focus:ring-[#44576d] outline-none shadow-xs`}
                            />
                          </div>
                          {fieldErrors.name && (
                            <p id="reg-name-error" className="text-xs text-[#ba1a1a]" role="alert">
                              {fieldErrors.name}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col space-y-1">
                          <label className="text-xs font-semibold text-[#344048]" htmlFor="reg-id">
                            Student / Employee ID
                          </label>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3 text-[#466271] text-lg pointer-events-none">
                              pin
                            </span>
                            <input
                              id="reg-id"
                              value={regId}
                              onChange={(e) => {
                                setRegId(e.target.value);
                                clearFieldError('studentId', e.target.value);
                                setFeedback(null);
                              }}
                              placeholder="20240396-C"
                              required
                              type="text"
                              aria-invalid={Boolean(fieldErrors.studentId)}
                              aria-describedby={fieldErrors.studentId ? 'reg-id-error' : 'reg-id-hint'}
                              className={`w-full h-10 pl-10 pr-3 bg-white text-[#111d24] text-sm rounded-lg border ${
                                fieldErrors.studentId ? 'border-[#ba1a1a]' : 'border-[#c4c6cd]'
                              } focus:ring-2 focus:ring-[#44576d] outline-none shadow-xs font-mono`}
                            />
                          </div>
                          {fieldErrors.studentId ? (
                            <p id="reg-id-error" className="text-xs text-[#ba1a1a]" role="alert">
                              {fieldErrors.studentId}
                            </p>
                          ) : (
                            <p id="reg-id-hint" className="text-[11px] text-[#74777d]">
                              Eight digits, hyphen, and one letter.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label
                          className="text-xs font-semibold text-[#344048] flex justify-between"
                          htmlFor="reg-email"
                        >
                          <span>University Email Address</span>
                          <span className="text-[11px] text-[#74777d]">Use your university .edu address</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3 text-[#466271] text-lg pointer-events-none">
                            alternate_email
                          </span>
                          <input
                            id="reg-email"
                            value={regEmail}
                            onChange={(e) => {
                              setRegEmail(e.target.value);
                              clearFieldError('email', e.target.value);
                              setFeedback(null);
                            }}
                            placeholder="jtaylor@athletics.univ.edu"
                            required
                            type="email"
                            aria-invalid={Boolean(fieldErrors.email)}
                            aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
                            className={`w-full h-10 pl-10 pr-3 bg-white text-[#111d24] text-sm rounded-lg border ${
                              fieldErrors.email ? 'border-[#ba1a1a]' : 'border-[#c4c6cd]'
                            } focus:ring-2 focus:ring-[#44576d] outline-none shadow-xs`}
                          />
                        </div>
                        {fieldErrors.email && (
                          <p id="reg-email-error" className="text-xs text-[#ba1a1a]" role="alert">
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col space-y-1">
                          <label className="text-xs font-semibold text-[#344048]" htmlFor="reg-password">
                            Account Password
                          </label>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3 text-[#466271] text-lg pointer-events-none">
                              lock_open
                            </span>
                            <input
                              id="reg-password"
                              value={regPassword}
                              onChange={(e) => {
                                setRegPassword(e.target.value);
                                clearFieldError('password', e.target.value);
                                if (e.target.value === regConfirmPassword) {
                                  setFieldErrors(previous => {
                                    if (!previous.confirmPassword) return previous;
                                    const next = { ...previous };
                                    delete next.confirmPassword;
                                    return next;
                                  });
                                }
                                setFeedback(null);
                              }}
                              placeholder="8 to 72 bytes"
                              required
                              type={showRegPassword ? 'text' : 'password'}
                              aria-invalid={Boolean(fieldErrors.password)}
                              aria-describedby={fieldErrors.password ? 'reg-password-error' : undefined}
                              className={`w-full h-10 pl-10 pr-10 bg-white text-[#111d24] text-sm rounded-lg border ${
                                fieldErrors.password ? 'border-[#ba1a1a]' : 'border-[#c4c6cd]'
                              } focus:ring-2 focus:ring-[#44576d] outline-none shadow-xs`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(visible => !visible)}
                              aria-label={`${showRegPassword ? 'Hide' : 'Show'} account password`}
                              aria-pressed={showRegPassword}
                              className="absolute right-2 p-1 text-[#466271] hover:text-[#2d4055] focus-visible:outline-2 focus-visible:outline-[#44576d] rounded"
                            >
                              {showRegPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                            </button>
                          </div>
                          {fieldErrors.password && (
                            <p id="reg-password-error" className="text-xs text-[#ba1a1a]" role="alert">
                              {fieldErrors.password}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col space-y-1">
                          <label className="text-xs font-semibold text-[#344048]" htmlFor="reg-confirm-password">
                            Confirm Password
                          </label>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3 text-[#466271] text-lg pointer-events-none">
                              check_circle
                            </span>
                            <input
                              id="reg-confirm-password"
                              value={regConfirmPassword}
                              onChange={(e) => {
                                setRegConfirmPassword(e.target.value);
                                clearFieldError('confirmPassword', e.target.value);
                                setFeedback(null);
                              }}
                              placeholder="Repeat password"
                              required
                              type={showRegConfirmPassword ? 'text' : 'password'}
                              aria-invalid={Boolean(fieldErrors.confirmPassword)}
                              aria-describedby={fieldErrors.confirmPassword ? 'reg-confirm-password-error' : undefined}
                              className={`w-full h-10 pl-10 pr-10 bg-white text-[#111d24] text-sm rounded-lg border ${
                                fieldErrors.confirmPassword ? 'border-[#ba1a1a]' : 'border-[#c4c6cd]'
                              } focus:ring-2 focus:ring-[#44576d] outline-none shadow-xs`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegConfirmPassword(visible => !visible)}
                              aria-label={`${showRegConfirmPassword ? 'Hide' : 'Show'} confirm password`}
                              aria-pressed={showRegConfirmPassword}
                              className="absolute right-2 p-1 text-[#466271] hover:text-[#2d4055] focus-visible:outline-2 focus-visible:outline-[#44576d] rounded"
                            >
                              {showRegConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                            </button>
                          </div>
                          {fieldErrors.confirmPassword && (
                            <p id="reg-confirm-password-error" className="text-xs text-[#ba1a1a]" role="alert">
                              {fieldErrors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Password Security Meter */}
                      <div className="p-3 bg-[#e3f0f9] rounded-lg flex flex-col space-y-1.5 border border-[#ddeaf3]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#466271]">Password Security Meter</span>
                          <span
                            className={`font-semibold ${
                              strength.score === 0
                                ? 'text-[#74777d]'
                                : strength.score === 1
                                ? 'text-[#ba1a1a]'
                                : strength.score === 2
                                ? 'text-[#466271]'
                                : 'text-[#2d4055]'
                            }`}
                          >
                            {strength.label}
                          </span>
                        </div>

                        <div className="w-full h-1.5 bg-[#ddeaf3] rounded-full overflow-hidden flex gap-0.5">
                          <div
                            className={`h-full w-1/4 rounded-full transition-all duration-300 ${
                              strength.score >= 1
                                ? strength.score === 1
                                  ? 'bg-[#ba1a1a]'
                                  : 'bg-[#44576d]'
                                : 'bg-[#c4c6cd]'
                            }`}
                          />
                          <div
                            className={`h-full w-1/4 rounded-full transition-all duration-300 ${
                              strength.score >= 2 ? 'bg-[#44576d]' : 'bg-[#c4c6cd]'
                            }`}
                          />
                          <div
                            className={`h-full w-1/4 rounded-full transition-all duration-300 ${
                              strength.score >= 3 ? 'bg-[#44576d]' : 'bg-[#c4c6cd]'
                            }`}
                          />
                          <div
                            className={`h-full w-1/4 rounded-full transition-all duration-300 ${
                              strength.score >= 4 ? 'bg-[#2d4055]' : 'bg-[#c4c6cd]'
                            }`}
                          />
                        </div>
                        <span className="text-[11px] text-[#74777d]">
                          Use at least 8 characters. Passwords are case-sensitive.
                        </span>
                      </div>

                      <button
                        id="btn-register-submit"
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-[#44576d] hover:bg-[#2d4055] disabled:opacity-60 disabled:cursor-wait text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c9e7f8] focus:ring-offset-2 mt-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">how_to_reg</span>
                        <span>{isLoading ? 'Creating account…' : 'Create Account'}</span>
                      </button>

                      <div className="text-center pt-1">
                        <span className="text-xs text-[#466271]">Already have an account? </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('login');
                            setFeedback(null);
                          }}
                          className="text-xs font-semibold text-[#2d4055] hover:underline"
                        >
                          Log In
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Feedback Message Toast */}
              {feedback && (
                <div
                  id="feedback-alert"
                  className={`mt-4 p-3 rounded-lg flex items-center space-x-2.5 transition-all text-xs font-medium ${
                    feedback.type === 'error'
                      ? 'bg-[#ffdad6] text-[#93000a] border border-[#ffdad6]'
                      : 'bg-[#c9e7f8] text-[#4c6877] border border-[#aecbdc]'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {feedback.type === 'error' ? 'error' : 'task_alt'}
                  </span>
                  <span className="flex-1">{feedback.message}</span>
                </div>
              )}
              {systemError && (
                <div
                  className="mt-4 p-3 rounded-lg bg-[#ffdad6] text-[#93000a] border border-[#ffdad6] text-xs font-medium"
                  role="alert"
                >
                  {systemError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
