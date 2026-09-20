import React from 'react';
import { Reservation, UserProfile } from '../types';
import { ASSETS } from '../data/initialData';

interface DashboardScreenProps {
  user: UserProfile;
  activeReservation: Reservation | null;
  onNavigateToReserve: (sport?: 'basketball' | 'volleyball', focusEquipment?: boolean) => void;
  onNavigateToReservationsTab: () => void;
  onNavigateToHistoryTab: () => void;
  onOpenCalendarModal: () => void;
  onOpenPassModal: () => void;
  onOpenEditProfile?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  activeReservation,
  onNavigateToReserve,
  onNavigateToReservationsTab,
  onNavigateToHistoryTab,
  onOpenCalendarModal,
  onOpenPassModal,
  onOpenEditProfile,
}) => {
  return (
    <div className="w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-6 lg:space-y-8">
        {/* Welcome Header & Active Status Banner */}
        <section className="bg-white rounded-2xl p-6 lg:p-8 shadow-xs border border-[#ddeaf3]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#466271] text-xs font-semibold uppercase tracking-wider">
                <span className="material-symbols-outlined text-base text-[#2d4055]">
                  verified_user
                </span>
                <span>University Athletics &amp; Recreation Pass</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[#2d4055] tracking-tight">
                Welcome back, {user.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#43474c] text-sm">
                <span>
                  Student ID:{' '}
                  <span className="font-semibold font-mono text-[#2d4055]">{user.studentId}</span>
                </span>
                <span className="text-[#c4c6cd]">•</span>
                <span>
                  Eligibility:{' '}
                  <span className="text-[#2d4055] font-semibold">{user.eligibility}</span>
                </span>
                {onOpenEditProfile && (
                  <>
                    <span className="text-[#c4c6cd]">•</span>
                    <button
                      type="button"
                      id="dashboard-edit-profile-btn"
                      onClick={onOpenEditProfile}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#466271] hover:text-[#2d4055] hover:underline cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      <span>Edit Profile</span>
                    </button>
                  </>
                )}
                <span className="text-[#c4c6cd]">•</span>
                <span>Recreation Center Arena (Building 4)</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#e9f5ff] rounded-xl shrink-0 border border-[#ddeaf3]">
              <div className="w-12 h-12 rounded-xl bg-[#e3f0f9] flex items-center justify-center text-[#44576d] shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-2xl">event_available</span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-[#466271] uppercase tracking-wider">
                  Active Schedule
                </span>
                <span className="font-headline text-lg font-bold text-[#2d4055]">
                  {activeReservation ? '1 Upcoming Reservation' : '0 Active Bookings'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Highlighted Upcoming Reservation Quick Bar */}
        {activeReservation ? (
          <section className="bg-[#e3f0f9] rounded-2xl p-6 lg:p-8 shadow-xs border border-[#ddeaf3]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#44576d] text-white flex items-center justify-center shrink-0 mt-1 sm:mt-0 shadow-xs">
                  <span className="material-symbols-outlined">sports_basketball</span>
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded bg-[#d7e4ed] text-[#2d4055] font-bold uppercase tracking-wider">
                      Upcoming Booking
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded bg-[#44576d] text-white font-bold uppercase tracking-wider">
                      {activeReservation.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-1 pt-1 text-[#111d24]">
                    <div>
                      <span className="text-xs text-[#466271] block">Court</span>
                      <span className="font-headline text-base font-bold text-[#2d4055]">
                        {activeReservation.courtName}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#466271] block">Date &amp; Time</span>
                      <span className="text-sm font-semibold text-[#2d4055]">
                        Tomorrow, Oct 24, 2025 • {activeReservation.timeSlot}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#466271] block">Equipment Checked Out</span>
                      <span className="text-sm font-semibold text-[#2d4055]">
                        {activeReservation.equipmentSummary}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  id="btn-view-pass"
                  type="button"
                  onClick={onOpenPassModal}
                  className="px-5 py-2.5 bg-[#44576d] hover:bg-[#2d4055] text-white text-sm font-semibold rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">badge</span>
                  <span>View Pass</span>
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-[#e3f0f9] rounded-2xl p-6 text-center border border-[#ddeaf3]">
            <p className="text-sm text-[#466271]">No active upcoming court reservations.</p>
            <button
              onClick={() => onNavigateToReserve('basketball')}
              className="mt-2 text-sm font-bold text-[#2d4055] hover:underline"
            >
              Book a court slot now →
            </button>
          </section>
        )}

        {/* Main Navigation & Reservation Action Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#2d4055]">
                Court Services &amp; Management
              </h2>
              <p className="text-sm text-[#466271]">
                Select an athletic resource to schedule or manage reservations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Basketball Court Reservation */}
            <article className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all border border-[#ddeaf3] group">
              <div className="relative h-52 w-full overflow-hidden bg-[#e3f0f9]">
                <img
                  alt="State University Wildcats Indoor Hardwood Basketball Court"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={ASSETS.basketballCourt}
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-bold bg-white/95 backdrop-blur-sm text-[#2d4055] uppercase shadow-xs">
                  Regulation Hardwood
                </span>
              </div>
              <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#2d4055]">
                    <span className="material-symbols-outlined text-xl">sports_basketball</span>
                    <h3 className="font-headline text-lg font-bold text-[#2d4055]">
                      Basketball Court Reservation
                    </h3>
                  </div>
                  <p className="text-sm text-[#43474c] leading-relaxed">
                    Reserve university hardwood courts for team practice, intramurals, or casual play.
                  </p>
                </div>
                <button
                  id="card-btn-bb"
                  type="button"
                  onClick={() => onNavigateToReserve('basketball')}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#44576d] hover:bg-[#2d4055] text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Select Court</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </article>

            {/* Card 2: Volleyball Court Reservation */}
            <article className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all border border-[#ddeaf3] group">
              <div className="relative h-52 w-full overflow-hidden bg-[#e3f0f9]">
                <img
                  alt="Indoor collegiate volleyball arena"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={ASSETS.volleyballCourt}
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-bold bg-white/95 backdrop-blur-sm text-[#2d4055] uppercase shadow-xs">
                  Competition Net
                </span>
              </div>
              <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#2d4055]">
                    <span className="material-symbols-outlined text-xl">sports_volleyball</span>
                    <h3 className="font-headline text-lg font-bold text-[#2d4055]">
                      Volleyball Court Reservation
                    </h3>
                  </div>
                  <p className="text-sm text-[#43474c] leading-relaxed">
                    Book competition-grade indoor net courts with regulation court markings.
                  </p>
                </div>
                <button
                  id="card-btn-vb"
                  type="button"
                  onClick={() => onNavigateToReserve('volleyball')}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#44576d] hover:bg-[#2d4055] text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Select Court</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </article>

            {/* Card 3: Court Availability */}
            <article className="flex flex-col bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-all justify-between gap-4 border border-[#ddeaf3]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#e3f0f9] flex items-center justify-center text-[#44576d]">
                    <span className="material-symbols-outlined text-2xl">calendar_month</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-[#e3f0f9] text-[#466271] font-bold uppercase tracking-wider">
                    Live Timetable
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline text-lg font-bold text-[#2d4055]">
                    Court Availability
                  </h3>
                  <p className="text-sm text-[#43474c] leading-relaxed">
                    Explore real-time court schedules, free time slots, and peak booking hours.
                  </p>
                </div>
                <div className="p-3 bg-[#e9f5ff] rounded-xl space-y-1.5 border border-[#ddeaf3]">
                  <div className="flex justify-between text-xs text-[#466271]">
                    <span>Today's Peak Hours</span>
                    <span className="font-bold text-[#2d4055]">5:00 PM – 9:00 PM</span>
                  </div>
                  <div className="w-full bg-[#d7e4ed] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#44576d] h-full w-3/4 rounded-full" />
                  </div>
                </div>
              </div>
              <button
                id="card-btn-availability"
                type="button"
                onClick={onOpenCalendarModal}
                className="w-full py-2.5 px-4 rounded-lg bg-[#44576d] hover:bg-[#2d4055] text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>View Calendar</span>
                <span className="material-symbols-outlined text-lg">calendar_today</span>
              </button>
            </article>

            {/* Card 4: Sports Equipment Reservation */}
            <article className="flex flex-col bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-all justify-between gap-4 border border-[#ddeaf3]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#e3f0f9] flex items-center justify-center text-[#44576d]">
                    <span className="material-symbols-outlined text-2xl">sports_handball</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-[#e3f0f9] text-[#466271] font-bold uppercase tracking-wider">
                    Facility Gear
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline text-lg font-bold text-[#2d4055]">
                    Sports Equipment Reservation
                  </h3>
                  <p className="text-sm text-[#43474c] leading-relaxed">
                    Reserve official leather basketballs and composite competition volleyballs.
                  </p>
                </div>
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-[#466271]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#44576d]" /> Game Basketballs
                    </span>
                    <span className="text-[#2d4055] font-bold">18 In Locker</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#466271]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#466271]" /> Regulation Volleyballs
                    </span>
                    <span className="text-[#2d4055] font-bold">14 In Locker</span>
                  </div>
                </div>
              </div>
              <button
                id="card-btn-equipment"
                type="button"
                onClick={() => onNavigateToReserve('basketball', true)}
                className="w-full py-2.5 px-4 rounded-lg bg-[#44576d] hover:bg-[#2d4055] text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Reserve Equipment</span>
                <span className="material-symbols-outlined text-lg">inventory_2</span>
              </button>
            </article>

            {/* Card 5: My Reservations */}
            <article className="flex flex-col bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-all justify-between gap-4 border border-[#ddeaf3]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#e3f0f9] flex items-center justify-center text-[#44576d]">
                    <span className="material-symbols-outlined text-2xl">pending_actions</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-[#e3f0f9] text-[#466271] font-bold uppercase tracking-wider">
                    Active Desk
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline text-lg font-bold text-[#2d4055]">
                    My Reservations
                  </h3>
                  <p className="text-sm text-[#43474c] leading-relaxed">
                    View active court bookings, check confirmation status, edit details, or cancel.
                  </p>
                </div>
                <div className="p-3 bg-[#e9f5ff] rounded-xl space-y-1 border border-[#ddeaf3]">
                  <span className="text-[11px] font-semibold text-[#466271] uppercase block">
                    Next Entry QR Ready
                  </span>
                  <span className="text-xs text-[#2d4055] font-medium block">
                    Auto-checkin active 15m prior to slot
                  </span>
                </div>
              </div>
              <button
                id="card-btn-manage-reservations"
                type="button"
                onClick={onNavigateToReservationsTab}
                className="w-full py-2.5 px-4 rounded-lg bg-[#44576d] hover:bg-[#2d4055] text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Manage Bookings</span>
                <span className="material-symbols-outlined text-lg">edit_calendar</span>
              </button>
            </article>

            {/* Card 6: Booking History */}
            <article className="flex flex-col bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-all justify-between gap-4 border border-[#ddeaf3]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#e3f0f9] flex items-center justify-center text-[#44576d]">
                    <span className="material-symbols-outlined text-2xl">history</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-[#e3f0f9] text-[#466271] font-bold uppercase tracking-wider">
                    Archives
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline text-lg font-bold text-[#2d4055]">
                    Booking History
                  </h3>
                  <p className="text-sm text-[#43474c] leading-relaxed">
                    Review previous completed court reservations, equipment logs, and activity records.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-[#466271] p-3 bg-[#e9f5ff] rounded-xl border border-[#ddeaf3]">
                  <span>Completed Sessions</span>
                  <span className="font-headline text-lg font-bold text-[#2d4055]">12 Hours</span>
                </div>
              </div>
              <button
                id="card-btn-view-history"
                type="button"
                onClick={onNavigateToHistoryTab}
                className="w-full py-2.5 px-4 rounded-lg bg-[#44576d] hover:bg-[#2d4055] text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>View History</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </article>
          </div>
        </div>

        {/* Facility Guidelines Information Row */}
        <section className="bg-white rounded-2xl p-6 lg:p-8 shadow-xs border border-[#ddeaf3]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#466271] text-2xl shrink-0 mt-0.5">
                timer
              </span>
              <div>
                <h4 className="text-sm font-bold text-[#2d4055]">Slot Limits</h4>
                <p className="text-xs text-[#43474c] mt-0.5 leading-relaxed">
                  Students may reserve up to 2 hours per day across all courts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#466271] text-2xl shrink-0 mt-0.5">
                app_badging
              </span>
              <div>
                <h4 className="text-sm font-bold text-[#2d4055]">Check-in Policy</h4>
                <p className="text-xs text-[#43474c] mt-0.5 leading-relaxed">
                  Present student ID card or digital confirmation at Court Control Desk.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#466271] text-2xl shrink-0 mt-0.5">
                clean_hands
              </span>
              <div>
                <h4 className="text-sm font-bold text-[#2d4055]">Court Footwear</h4>
                <p className="text-xs text-[#43474c] mt-0.5 leading-relaxed">
                  Non-marking athletic footwear required on all competition hardwoods.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
