import React, { useEffect, useRef, useState } from 'react';
import { ViewTab, UserProfile, AdminTab } from '../types';
import { BasketballLogo } from './BasketballLogo';
import { UserAvatar } from './UserAvatar';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
    if (isMenuOpen) menuButtonRef.current?.focus();
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-[#ddeaf3] shadow-[0_1px_4px_rgba(0,0,0,0.02),0_4px_16px_rgba(45,64,85,0.05)]">
      <div className="relative h-16 w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
        {/* Brand / Logo */}
        <button
          type="button"
          onClick={() => {
            onSelectTab(user.isAdmin ? 'admin' : 'dashboard');
            closeMenu();
          }}
          className="flex min-w-0 items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer group select-none text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d] rounded-lg"
          id="header-brand-logo"
          aria-label={user.isAdmin ? 'Go to admin overview' : 'Go to dashboard'}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#2d4055] to-[#111d24] p-1.5 flex items-center justify-center shadow-xs ring-1 ring-black/5 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <BasketballLogo className="h-full w-full text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-bold text-[#466271] tracking-wider uppercase leading-none whitespace-nowrap">
              Varsity Athletics
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="hidden min-[360px]:inline font-headline font-bold text-xs sm:text-sm lg:text-base text-[#111d24] tracking-tight leading-snug whitespace-nowrap">
                Court Reservation System
              </span>
              {user.isAdmin ? (
                <span className="hidden min-[1680px]:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#e3f0f9] text-[#2d4055] border border-[#ddeaf3] uppercase tracking-wide whitespace-nowrap">
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
        </button>

        <button
          ref={menuButtonRef}
          type="button"
          className={`${user.isAdmin ? 'min-[1680px]:hidden' : 'xl:hidden'} inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ddeaf3] bg-[#f5faff] text-[#2d4055] hover:bg-[#e9f5ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d]`}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="header-navigation-menu"
          onClick={() => setIsMenuOpen(open => !open)}
        >
          <span className="material-symbols-outlined text-2xl" aria-hidden="true">
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        <div
          id="header-navigation-menu"
          className={`absolute left-3 right-3 top-full mt-2 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border border-[#ddeaf3] bg-white p-3 shadow-lg flex-col gap-3 ${
            user.isAdmin
              ? 'min-[1680px]:static min-[1680px]:m-0 min-[1680px]:max-h-none min-[1680px]:flex min-[1680px]:flex-row min-[1680px]:items-center min-[1680px]:justify-between min-[1680px]:gap-2 min-[1680px]:overflow-visible min-[1680px]:rounded-none min-[1680px]:border-0 min-[1680px]:bg-transparent min-[1680px]:p-0 min-[1680px]:shadow-none min-[1680px]:flex-1'
              : 'xl:static xl:m-0 xl:max-h-none xl:flex xl:flex-row xl:items-center xl:justify-between xl:gap-2 xl:overflow-visible xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none xl:flex-1'
          } ${
            isMenuOpen ? 'flex' : 'hidden'
          }`}
        >
        {/* Center Navigation: Student Nav vs Admin Nav aligned in identical structural pill container */}
        {!user.isAdmin ? (
          <nav
            aria-label="Student Navigation"
            className="flex w-full flex-col items-stretch p-1 bg-[#f5faff] rounded-xl border border-[#ddeaf3] shadow-2xs xl:w-auto xl:flex-row xl:items-center"
          >
            <button
              type="button"
              id="nav-dashboard"
              onClick={() => {
                onSelectTab('dashboard');
                closeMenu();
              }}
              className={`w-full justify-start px-2.5 sm:px-3.5 py-2 xl:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d] xl:w-auto ${
                currentTab === 'dashboard'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              id="nav-reservations"
              onClick={() => {
                onSelectTab('reservations');
                closeMenu();
              }}
              className={`w-full justify-start px-2.5 sm:px-3.5 py-2 xl:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d] xl:w-auto ${
                currentTab === 'reservations'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">event_available</span>
              <span>Reserve Court</span>
            </button>

            <button
              type="button"
              id="nav-booking-history"
              onClick={() => {
                onSelectTab('booking-history');
                closeMenu();
              }}
              className={`w-full justify-start px-2.5 sm:px-3.5 py-2 xl:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d] xl:w-auto ${
                currentTab === 'booking-history'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span>My Bookings</span>
            </button>
          </nav>
        ) : (
          /* Admin View: Aligned directly with student nav style, but for Admin Console tabs */
          <nav
            aria-label="Admin Operations Navigation"
            className="flex w-full flex-col items-stretch p-1 bg-[#f5faff] rounded-xl border border-[#ddeaf3] shadow-2xs min-[1680px]:w-auto min-[1680px]:flex-row min-[1680px]:items-center"
          >
            <button
              type="button"
              id="admin-nav-overview"
              onClick={() => {
                onSelectTab('admin');
                onSelectAdminSubTab?.('overview');
                closeMenu();
              }}
              className={`w-full justify-start px-2 sm:px-3 py-2 min-[1680px]:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d] min-[1680px]:w-auto ${
                adminSubTab === 'overview'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">monitoring</span>
              <span>Schedule</span>
            </button>

            <button
              type="button"
              id="admin-nav-reservations"
              onClick={() => {
                onSelectTab('admin');
                onSelectAdminSubTab?.('reservations');
                closeMenu();
              }}
              className={`w-full justify-start px-2 sm:px-3 py-2 min-[1680px]:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d] min-[1680px]:w-auto ${
                adminSubTab === 'reservations'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">format_list_bulleted</span>
              <span>Bookings</span>
            </button>

            <button
              type="button"
              id="admin-nav-courts"
              onClick={() => {
                onSelectTab('admin');
                onSelectAdminSubTab?.('courts');
                closeMenu();
              }}
              className={`w-full justify-start px-2 sm:px-3 py-2 min-[1680px]:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d] min-[1680px]:w-auto ${
                adminSubTab === 'courts'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">sports_score</span>
              <span>Courts</span>
            </button>

            <button
              type="button"
              id="admin-nav-equipment"
              onClick={() => {
                onSelectTab('admin');
                onSelectAdminSubTab?.('equipment');
                closeMenu();
              }}
              className={`w-full justify-start px-2 sm:px-3 py-2 min-[1680px]:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d] min-[1680px]:w-auto ${
                adminSubTab === 'equipment'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">sports_basketball</span>
              <span>Locker</span>
            </button>

            <button
              type="button"
              id="admin-nav-students"
              onClick={() => {
                onSelectTab('admin');
                onSelectAdminSubTab?.('students');
                closeMenu();
              }}
              className={`w-full justify-start px-2 sm:px-3 py-2 min-[1680px]:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d] min-[1680px]:w-auto ${
                adminSubTab === 'students'
                  ? 'bg-white text-[#2d4055] shadow-xs border border-[#ddeaf3]'
                  : 'text-[#466271] hover:text-[#111d24] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">groups</span>
              <span>Athletes</span>
            </button>
          </nav>
        )}

        {/* User Profile & Actions Bar */}
        <div className={`flex flex-col items-stretch gap-2 ${
          user.isAdmin
            ? 'min-[1680px]:flex-row min-[1680px]:items-center min-[1680px]:gap-1.5'
            : 'xl:flex-row xl:items-center xl:gap-1.5 2xl:gap-2.5'
        }`}>
          {/* Admin Reserve Court Button */}
          {user.isAdmin && onOpenAdminReserveModal && (
            <button
              type="button"
              id="header-admin-reserve-btn"
              onClick={() => {
                onOpenAdminReserveModal();
                setIsMenuOpen(false);
              }}
              className="w-full min-[1680px]:w-auto flex items-center justify-start gap-1.5 px-2.5 sm:px-3 py-2 min-[1680px]:py-1.5 rounded-xl text-xs font-semibold bg-[#2d4055] text-white hover:bg-[#111d24] transition-all shadow-2xs whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d]"
              title="Schedule or reserve a court on behalf of students/teams"
            >
              <span className="material-symbols-outlined text-[17px]">add_circle</span>
              <span>Reserve Court</span>
            </button>
          )}

          {/* Admin Gatepass Checker Button */}
          {user.isAdmin && onOpenGatepassChecker && (
            <button
              type="button"
              id="header-gatepass-checker-btn"
              onClick={() => {
                onOpenGatepassChecker();
                setIsMenuOpen(false);
              }}
              className="w-full min-[1680px]:w-auto flex items-center justify-start gap-1.5 px-2.5 sm:px-3 py-2 min-[1680px]:py-1.5 rounded-xl text-xs font-semibold bg-[#e3f0f9] text-[#2d4055] hover:bg-[#ddeaf3] border border-[#ddeaf3] transition-all shadow-2xs group whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d]"
              title="Open Turnstile Gatepass Scanner"
            >
              <span className="material-symbols-outlined text-[17px] text-[#2d4055] group-hover:scale-110 transition-transform">
                qr_code_scanner
              </span>
              <span>Gatepass Checker</span>
            </button>
          )}

          {/* Student Gate Pass Button */}
          {!user.isAdmin && (
            <button
              type="button"
              id="header-gate-pass-btn"
              onClick={() => {
                onOpenPass();
                setIsMenuOpen(false);
              }}
              className="w-full xl:w-auto flex items-center justify-start gap-1.5 px-2.5 sm:px-3 py-2 xl:py-1.5 rounded-xl text-xs font-semibold bg-[#e3f0f9] text-[#2d4055] hover:bg-[#ddeaf3] border border-[#ddeaf3] transition-all shadow-2xs group whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d]"
              title="Open Digital Gate Access Keycard"
            >
              <span className="material-symbols-outlined text-[17px] text-[#2d4055] group-hover:scale-110 transition-transform">
                qr_code_2
              </span>
              <span>Gate Pass</span>
            </button>
          )}

          {/* Profile Card / Edit Profile Trigger */}
          <button
            type="button"
            onClick={() => {
              onOpenEditProfile();
              setIsMenuOpen(false);
            }}
            title="Click to view & edit your profile details"
            aria-label={`View and edit profile for ${user.name}`}
            className={`w-full flex items-center justify-start gap-2 sm:gap-2.5 px-2 sm:px-2.5 py-2 rounded-xl transition-all border border-[#ddeaf3] hover:border-[#b4c8e2] bg-[#f5faff] hover:bg-[#e9f5ff] cursor-pointer shadow-2xs group shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d] ${
              user.isAdmin ? 'min-[1680px]:w-auto min-[1680px]:py-1' : 'xl:w-auto xl:py-1'
            }`}
            id="header-user-profile"
          >
            <div className="relative shrink-0">
              <UserAvatar
                alt={user.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-[#ddeaf3] group-hover:ring-[#2d4055] transition-all"
                src={user.avatarUrl}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white bg-[#2d4055]" />
            </div>
            <div className={`flex min-w-0 flex-col text-left ${
              user.isAdmin ? 'min-[1680px]:whitespace-nowrap' : 'xl:whitespace-nowrap'
            }`}>
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
          </button>

          {/* Logout Button */}
          <button
            id="header-logout-btn"
            onClick={() => {
              onLogout();
              setIsMenuOpen(false);
            }}
            className={`w-full px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-[#466271] hover:text-[#93000a] hover:bg-[#ffdad6]/40 border border-[#ddeaf3] hover:border-[#ba1a1a]/30 transition-all flex items-center justify-start gap-1.5 shadow-2xs shrink-0 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44576d] ${
              user.isAdmin ? 'min-[1680px]:w-auto min-[1680px]:py-1.5' : 'xl:w-auto xl:py-1.5'
            }`}
            type="button"
            title="Sign out of varsity athletics session"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
        </div>
      </div>
    </header>
  );
};
