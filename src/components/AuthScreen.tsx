import React, { useState } from 'react';
import { ASSETS, INITIAL_ADMIN_USER, INITIAL_USER } from '../data/initialData';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('jvillareal@athletics.univ.edu');
  const [loginPassword, setLoginPassword] = useState('VarsityPlayer#2025');
  const [rememberDevice, setRememberDevice] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('Jordan Taylor');
  const [regId, setRegId] = useState('ID-882190');
  const [regEmail, setRegEmail] = useState('jtaylor@athletics.univ.edu');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Feedback toast state
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isAdminLogin =
      loginIdentifier.toLowerCase().includes('admin') ||
      loginIdentifier.toLowerCase() === 'admin@athletics.univ.edu';

    setFeedback({
      type: 'success',
      message: isAdminLogin
        ? 'Validating Administrator credentials... Redirecting to Facilities Management Desk.'
        : 'Validating directory credentials... Redirecting to varsity portal.',
    });

    setTimeout(() => {
      if (isAdminLogin) {
        onLoginSuccess({
          ...INITIAL_ADMIN_USER,
          email: loginIdentifier,
        });
      } else {
        onLoginSuccess({
          ...INITIAL_USER,
          email: loginIdentifier,
          name: loginIdentifier.includes('jvillareal') ? 'Jamin Villareal' : 'Jordan Mitchell',
        });
      }
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setFeedback({
        type: 'error',
        message: 'Passwords do not match. Please verify both fields.',
      });
      return;
    }

    if (regPassword.length < 8) {
      setFeedback({
        type: 'error',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }

    setFeedback({
      type: 'success',
      message: 'Account profile submitted! University registrar verified. Welcome to the portal.',
    });

    setTimeout(() => {
      onLoginSuccess({
        name: regName || 'Jordan Taylor',
        studentId: regId || '20240892-T',
        email: regEmail,
        role: 'Student Member',
        eligibility: 'Active Full Member',
        avatarUrl: ASSETS.avatar,
      });
    }, 700);
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
                    <img
                      alt="Basketball Court Reservation System Logo"
                      className="w-full h-full object-contain filter invert contrast-200"
                      src={ASSETS.logo}
                    />
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

                {/* Institutional Badges & Operational Indicators */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#e3f0f9] p-3 rounded-lg flex flex-col justify-center border border-[#ddeaf3]">
                    <div className="flex items-center space-x-1.5 text-[#2d4055] text-xs font-semibold">
                      <span className="material-symbols-outlined text-base">sports_basketball</span>
                      <span>Courts 1-8</span>
                    </div>
                    <span className="text-[11px] text-[#466271] mt-0.5">Hardwood FIBA Grade</span>
                  </div>

                  <div className="bg-[#e3f0f9] p-3 rounded-lg flex flex-col justify-center border border-[#ddeaf3]">
                    <div className="flex items-center space-x-1.5 text-[#2d4055] text-xs font-semibold">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      <span>06:00 - 23:00</span>
                    </div>
                    <span className="text-[11px] text-[#466271] mt-0.5">Daily Session Slots</span>
                  </div>
                </div>
              </div>

              {/* Live Schedule Operational Notice */}
              <div className="mt-6 pt-4 flex flex-col space-y-2">
                <div className="bg-[#ddeaf3]/70 p-4 rounded-xl flex flex-col space-y-1.5 border border-[#c4c6cd]/50 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#2d4055] font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#2d4055] animate-pulse" />
                      LIVE SCHEDULE • TODAY
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#44576d] text-white font-semibold">
                      In Progress
                    </span>
                  </div>

                  <div className="flex flex-col pt-1">
                    <span className="font-headline font-semibold text-base text-[#2d4055]">
                      Basketball Court 1
                    </span>
                    <span className="text-xs text-[#466271]">(Main Hardwood)</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[#466271] text-xs pt-1">
                    <span className="material-symbols-outlined text-base text-[#2d4055]">schedule</span>
                    <span>Current Slot: 04:00 PM – 05:00 PM</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[#466271] text-xs">
                    <span className="material-symbols-outlined text-base text-[#2d4055]">sports_basketball</span>
                    <span>Loaned: 2 Official Basketballs</span>
                  </div>

                  <div className="pt-2 border-t border-[#c4c6cd]/40 flex items-center justify-between text-xs mt-1">
                    <span className="text-[#74777d]">Next Upcoming:</span>
                    <span className="text-[#2d4055] font-semibold">Volleyball Court 3 (05:00 PM)</span>
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
                      {/* One-click Demo Credentials Bar */}
                      <div className="p-3 bg-[#e3f0f9]/70 rounded-xl border border-[#ddeaf3] space-y-1.5">
                        <span className="text-[11px] font-semibold text-[#466271] uppercase tracking-wider block">
                          Instant Demo Credentials
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setLoginIdentifier('jvillareal@athletics.univ.edu');
                              setLoginPassword('VarsityPlayer#2025');
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                              loginIdentifier.includes('jvillareal')
                                ? 'bg-white text-[#2d4055] border-[#2d4055] shadow-xs'
                                : 'bg-white/60 text-[#466271] border-[#ddeaf3] hover:bg-white'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[15px]">sports_handball</span>
                            <span>Student Athlete</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setLoginIdentifier('admin@athletics.univ.edu');
                              setLoginPassword('AdminPass#2025');
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                              loginIdentifier.includes('admin')
                                ? 'bg-[#2d4055] text-white border-[#2d4055] shadow-xs'
                                : 'bg-white/60 text-[#466271] border-[#ddeaf3] hover:bg-white'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
                            <span>Facility Admin</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label
                          className="text-xs font-semibold text-[#344048] flex items-center justify-between"
                          htmlFor="login-identifier"
                        >
                          <span>University Email / Account Username</span>
                          <span className="text-[11px] text-[#74777d] font-normal">
                            e.g. s123456@univ.edu
                          </span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3 text-[#466271] text-lg pointer-events-none">
                            mail
                          </span>
                          <input
                            id="login-identifier"
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            placeholder="netid@university.edu or staff ID"
                            required
                            type="text"
                            className="w-full h-10 pl-10 pr-3 bg-white text-[#111d24] text-sm rounded-lg border border-[#c4c6cd] focus:ring-2 focus:ring-[#44576d] focus:border-transparent outline-none shadow-xs transition-all"
                          />
                        </div>
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
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••••••"
                            required
                            type={showPassword ? 'text' : 'password'}
                            className="w-full h-10 pl-10 pr-10 bg-white text-[#111d24] text-sm rounded-lg border border-[#c4c6cd] focus:ring-2 focus:ring-[#44576d] focus:border-transparent outline-none shadow-xs transition-all"
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
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            id="remember-device"
                            checked={rememberDevice}
                            onChange={(e) => setRememberDevice(e.target.checked)}
                            type="checkbox"
                            className="w-4 h-4 rounded text-[#44576d] border-[#c4c6cd] focus:ring-0 accent-[#44576d]"
                          />
                          <span className="text-xs text-[#466271] select-none">
                            Remember this device for 30 days
                          </span>
                        </label>
                      </div>

                      <button
                        id="btn-login-submit"
                        type="submit"
                        className="w-full h-11 bg-[#44576d] hover:bg-[#2d4055] text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c9e7f8] focus:ring-offset-2 mt-4 cursor-pointer"
                      >
                        <span>Log In</span>
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
                              onChange={(e) => setRegName(e.target.value)}
                              placeholder="Jordan Taylor"
                              required
                              type="text"
                              className="w-full h-10 pl-10 pr-3 bg-white text-[#111d24] text-sm rounded-lg border border-[#c4c6cd] focus:ring-2 focus:ring-[#44576d] outline-none shadow-xs"
                            />
                          </div>
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
                              onChange={(e) => setRegId(e.target.value)}
                              placeholder="20240396-C"
                              required
                              type="text"
                              className="w-full h-10 pl-10 pr-3 bg-white text-[#111d24] text-sm rounded-lg border border-[#c4c6cd] focus:ring-2 focus:ring-[#44576d] outline-none shadow-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label
                          className="text-xs font-semibold text-[#344048] flex justify-between"
                          htmlFor="reg-email"
                        >
                          <span>University Email Address</span>
                          <span className="text-[11px] text-[#74777d]">Must end in .edu</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3 text-[#466271] text-lg pointer-events-none">
                            alternate_email
                          </span>
                          <input
                            id="reg-email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="jtaylor@athletics.univ.edu"
                            required
                            type="email"
                            className="w-full h-10 pl-10 pr-3 bg-white text-[#111d24] text-sm rounded-lg border border-[#c4c6cd] focus:ring-2 focus:ring-[#44576d] outline-none shadow-xs"
                          />
                        </div>
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
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Min 8 characters"
                              required
                              type="password"
                              className="w-full h-10 pl-10 pr-3 bg-white text-[#111d24] text-sm rounded-lg border border-[#c4c6cd] focus:ring-2 focus:ring-[#44576d] outline-none shadow-xs"
                            />
                          </div>
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
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                              placeholder="Repeat password"
                              required
                              type="password"
                              className="w-full h-10 pl-10 pr-3 bg-white text-[#111d24] text-sm rounded-lg border border-[#c4c6cd] focus:ring-2 focus:ring-[#44576d] outline-none shadow-xs"
                            />
                          </div>
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
                          Minimum 8 characters with at least one number and uppercase symbol.
                        </span>
                      </div>

                      <button
                        id="btn-register-submit"
                        type="submit"
                        className="w-full h-11 bg-[#44576d] hover:bg-[#2d4055] text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c9e7f8] focus:ring-offset-2 mt-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">how_to_reg</span>
                        <span>Create Account</span>
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
