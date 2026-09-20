import React from 'react';
import { ViewTab, UserProfile, AdminTab } from '../types';
import { ASSETS } from '../data/initialData';

interface HeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  user: UserProfile;
  onLogout: () => void;
  onOpenPass: () => void;
  onOpenEditProfile: () => void;
  adminSubTab?: AdminTab;
  onSelectAdminSubTab?: (tab: AdminTab) => void;
  onOpenGatepassChecker?: () => void;
  onOpenAdminReserveModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  onOpenPass,
  onOpenEditProfile,
  adminSubTab = 'overview',
  onSelectAdminSubTab,
  onOpenGatepassChecker,
  onOpenAdminReserveModal,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-[#ddeaf3] shadow-[0_1px_4px_rgba(0,0,0,0.02),0_4px_16px_rgba(45,64,85,0.05)]">
      <div className="h-16 w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
        {/* Brand / Logo */}
        <div
          onClick={() => onSelectTab(user.isAdmin ? 'admin' : 'dashboard')}
          className="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer group select-none"
          id="header-brand-logo"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#2d4055] to-[#111d24] p-1.5 flex items-center justify-center shadow-xs ring-1 ring-black/5 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <img
              alt="Court Reservation System Logo"
              className="h-full w-full object-contain filter brightness-110"
              src={ASSETS.logo}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-bold text-[#466271] tracking-wider uppercase leading-none whitespace-nowrap">
              Varsity Athletics
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-headline font-bold text-xs sm:text-sm lg:text-base text-[#111d24] tracking-tight leading-snug whitespace-nowrap">
                Court Reservation System
              </span>
              {user.isAdmin ? (
                <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#e3f0f9] text-[#2d4055] border border-[#ddeaf3] uppercase tracking-wide whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2d4055] animate-pulse" />
                  Admin Panel
                </span>
              ) : (
                <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#e9f5ff] text-[#2d4055] border border-[#ddeaf3] whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2d4055] animate-pulse" />
                  Courts Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center Navigation: Student Nav vs Admin Nav aligned in identical structural pill container */}
        {!user.isAdmin ? (
          <nav
            aria-label="Student Navigation"
            className="flex items-center p-1 bg-[#f5faff] rounded-xl border border-[#ddeaf3] shadow-2xs shrink-0 overflow-x-auto scrollbar-none"
          >
            <button
              id="nav-dashboard"
              onClick={() => onSelectTab('dashboard')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              id="nav-reservations"
              onClick={() => onSelectTab('reservations')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                currentTab === 'reservations'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">event_available</span>
              <span>Reserve Court</span>
            </button>

            <button
              id="nav-booking-history"
              onClick={() => onSelectTab('booking-history')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                currentTab === 'booking-history'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span className="hidden md:inline">My Bookings</span>
            </button>
          </nav>
        ) : (
          /* Admin View: Aligned directly with student nav style, but for Admin Console tabs */
          <nav
            aria-label="Admin Operations Navigation"
            className="flex items-center p-1 bg-[#f5faff] rounded-xl border border-[#ddeaf3] shadow-2xs shrink-0 overflow-x-auto scrollbar-none"
          >
            <button
              id="admin-nav-overview"
              onClick={() => {
                onSelectTab('admin');
                onSelectAdminSubTab?.('overview');
              }}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminSubTab === 'overview'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">monitoring</span>
              <span className="hidden sm:inline">Schedule</span>
            </button>

            <button
              id="admin-nav-reservations"
              onClick={() => {
                onSelectTab('admin');
                onSelectAdminSubTab?.('reservations');
              }}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminSubTab === 'reservations'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">format_list_bulleted</span>
              <span>Bookings</span>
            </button>

            <button
              id="admin-nav-courts"
              onClick={() => {
                onSelectTab('admin');
                onSelectAdminSubTab?.('courts');
              }}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminSubTab === 'courts'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">sports_score</span>
              <span className="hidden md:inline">Courts</span>
            </button>

            <button
              id="admin-nav-equipment"
              onClick={() => {
                onSelectTab('admin');
                onSelectAdminSubTab?.('equipment');
              }}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminSubTab === 'equipment'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">sports_basketball</span>
              <span className="hidden md:inline">Locker</span>
            </button>

            <button
              id="admin-nav-students"
              onClick={() => {
                onSelectTab('admin');
                onSelectAdminSubTab?.('students');
              }}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminSubTab === 'students'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">groups</span>
              <span className="hidden lg:inline">Athletes</span>
            </button>
          </nav>
        )}

        {/* User Profile & Actions Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Admin Reserve Court Button */}
          {user.isAdmin && onOpenAdminReserveModal && (
            <button
              id="header-admin-reserve-btn"
              onClick={onOpenAdminReserveModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2d4055] text-white hover:bg-[#111d24] transition-all shadow-2xs whitespace-nowrap"
              title="Schedule or reserve a court on behalf of students/teams"
            >
              <span className="material-symbols-outlined text-[17px]">add_circle</span>
              <span className="hidden md:inline">Reserve Court</span>
            </button>
          )}

          {/* Admin Gatepass Checker Button */}
          {user.isAdmin && onOpenGatepassChecker && (
            <button
              id="header-gatepass-checker-btn"
              onClick={onOpenGatepassChecker}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#e3f0f9] text-[#2d4055] hover:bg-[#ddeaf3] border border-[#ddeaf3] transition-all shadow-2xs group whitespace-nowrap"
              title="Open Turnstile Gatepass Scanner"
            >
              <span className="material-symbols-outlined text-[17px] text-[#2d4055] group-hover:scale-110 transition-transform">
                qr_code_scanner
              </span>
              <span className="hidden md:inline">Gatepass Checker</span>
            </button>
          )}

          {/* Student Gate Pass Button */}
          {!user.isAdmin && (
            <button
              id="header-gate-pass-btn"
              onClick={onOpenPass}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#e3f0f9] text-[#2d4055] hover:bg-[#ddeaf3] border border-[#ddeaf3] transition-all shadow-2xs group whitespace-nowrap"
              title="Open Digital Gate Access Keycard"
            >
              <span className="material-symbols-outlined text-[17px] text-[#2d4055] group-hover:scale-110 transition-transform">
                qr_code_2
              </span>
              <span>Gate Pass</span>
            </button>
          )}

          {/* Profile Card / Edit Profile Trigger */}
          <div
            onClick={onOpenEditProfile}
            title="Click to view & edit your profile details"
            className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-2.5 py-1 rounded-xl transition-all border border-[#ddeaf3] hover:border-[#b4c8e2] bg-[#f5faff] hover:bg-[#e9f5ff] cursor-pointer shadow-2xs group shrink-0"
            id="header-user-profile"
          >
            <div className="relative shrink-0">
              <img
                alt={user.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-[#ddeaf3] group-hover:ring-[#2d4055] transition-all"
                src={user.avatarUrl}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white bg-[#2d4055]" />
            </div>
            <div className="flex flex-col text-left hidden lg:block whitespace-nowrap">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-[#111d24] block leading-tight">
                  {user.name}
                </span>
                <span className="material-symbols-outlined text-[13px] text-[#74777d] group-hover:text-[#2d4055]">
                  edit
                </span>
              </div>
              <span className="text-[10px] text-[#466271] font-medium block">
                {user.isAdmin ? (
                  <span className="font-semibold text-[#2d4055]">Facility Director</span>
                ) : (
                  <span className="font-mono text-[#2d4055]">{user.studentId}</span>
                )}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            id="header-logout-btn"
            onClick={onLogout}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-[#466271] hover:text-[#93000a] hover:bg-[#ffdad6]/40 border border-[#ddeaf3] hover:border-[#ba1a1a]/30 transition-all flex items-center gap-1.5 shadow-2xs shrink-0 whitespace-nowrap"
            type="button"
            title="Sign out of varsity athletics session"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
