import React, { useState } from 'react';
import { Reservation, BookingHistoryRecord, UserProfile } from '../types';

interface SchedulesBookingsScreenProps {
  user: UserProfile;
  activeReservation: Reservation | null;
  historyRecords: BookingHistoryRecord[];
  initialSubTab?: 'active' | 'history';
  onEditReservation: () => void;
  onCancelReservation: () => void;
  onNavigateToReserve: () => void;
}

export const SchedulesBookingsScreen: React.FC<SchedulesBookingsScreenProps> = ({
  user,
  activeReservation,
  historyRecords,
  initialSubTab = 'active',
  onEditReservation,
  onCancelReservation,
  onNavigateToReserve,
}) => {
  const [subTab, setSubTab] = useState<'active' | 'history'>(initialSubTab);

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#e9f5ff] to-[#f5faff] py-8 lg:py-12 border-b border-[#ddeaf3]">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#c9e7f8] opacity-40 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-[#d7e4ed] opacity-60 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10 space-y-6">
          {/* Header Title & Switcher */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[#466271] mb-1">
                <span className="material-symbols-outlined text-[20px]">sports_basketball</span>
                <span className="text-xs uppercase tracking-wider text-[#466271] font-semibold">
                  Student Athletics &amp; Recreation
                </span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[#2d4055] tracking-tight">
                Court Schedules &amp; Bookings
              </h1>
              <p className="text-sm text-[#466271] mt-1">
                Manage active floor allocations, review collegiate rec records, and manage equipment checkout.
              </p>
            </div>

            {/* Sub-tab pills */}
            <div className="flex items-center gap-1 bg-[#ddeaf3]/80 backdrop-blur-md p-1.5 rounded-xl shadow-xs self-start md:self-auto border border-[#c4c6cd]/50">
              <button
                id="tab-active"
                type="button"
                onClick={() => setSubTab('active')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  subTab === 'active'
                    ? 'bg-[#44576d] text-white shadow-xs'
                    : 'text-[#466271] hover:text-[#2d4055] hover:bg-[#e3f0f9]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">event_available</span>
                <span>Active Reservations</span>
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
                  {activeReservation ? 1 : 0}
                </span>
              </button>

              <button
                id="tab-history"
                type="button"
                onClick={() => setSubTab('history')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  subTab === 'history'
                    ? 'bg-[#44576d] text-white shadow-xs'
                    : 'text-[#466271] hover:text-[#2d4055] hover:bg-[#e3f0f9]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">history</span>
                <span>Booking History (Past Records)</span>
              </button>
            </div>
          </div>

          {/* ACTIVE RESERVATIONS VIEW */}
          {subTab === 'active' && (
            <div className="space-y-6" id="section-active">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-4">
                  {activeReservation ? (
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all relative overflow-hidden border border-[#ddeaf3]">
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#44576d]" />

                      {/* Header row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e3f0f9] text-[#2d4055] text-xs uppercase tracking-wider font-bold">
                            <span className="w-2 h-2 rounded-full bg-[#44576d]" />
                            {activeReservation.status}
                          </span>
                          <span className="text-xs font-semibold text-[#466271]">
                            ID #{activeReservation.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#466271] text-xs font-medium">
                          <span className="material-symbols-outlined text-[16px] text-[#2d4055]">
                            verified_user
                          </span>
                          <span>East Gymnasium Floor Key Verified</span>
                        </div>
                      </div>

                      {/* Facility & Date detail banner */}
                      <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#e9f5ff]/70 p-4 sm:p-5 rounded-xl border border-[#ddeaf3]">
                        <div className="space-y-1">
                          <span className="text-[11px] uppercase text-[#466271] tracking-wider font-semibold block">
                            Reserved Facility
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#2d4055] text-[24px]">
                              stadium
                            </span>
                            <h2 className="font-headline text-xl font-bold text-[#2d4055] tracking-tight">
                              {activeReservation.courtName}
                            </h2>
                          </div>
                          <p className="text-xs text-[#466271]">
                            {activeReservation.facilityDetail}
                          </p>
                        </div>

                        <div className="h-px md:h-12 w-full md:w-px bg-[#ddeaf3]" />

                        <div className="space-y-1">
                          <span className="text-[11px] uppercase text-[#466271] tracking-wider font-semibold block">
                            Date &amp; Time Slot
                          </span>
                          <div className="flex items-center gap-1.5 text-[#2d4055] font-headline text-base font-bold">
                            <span className="material-symbols-outlined text-[18px] text-[#466271]">
                              calendar_today
                            </span>
                            <span>{activeReservation.dateStr}</span>
                          </div>
                          <p className="text-xs text-[#111d24] font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-[#44576d]">
                              schedule
                            </span>
                            <span>{activeReservation.timeSlot}</span>
                          </p>
                        </div>
                      </div>

                      {/* Equipment and Access info */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-3.5 rounded-xl flex items-center gap-3 border border-[#ddeaf3] shadow-xs">
                          <div className="w-10 h-10 rounded-lg bg-[#e3f0f9] flex items-center justify-center text-[#44576d] shrink-0">
                            <span className="material-symbols-outlined text-[22px]">
                              sports_basketball
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] uppercase text-[#466271] font-semibold block">
                              Equipment Requested
                            </span>
                            <span className="text-sm font-bold text-[#2d4055] truncate block">
                              {activeReservation.equipmentSummary}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white p-3.5 rounded-xl flex items-center gap-3 border border-[#ddeaf3] shadow-xs">
                          <div className="w-10 h-10 rounded-lg bg-[#e3f0f9] flex items-center justify-center text-[#44576d] shrink-0">
                            <span className="material-symbols-outlined text-[22px]">
                              pin_drop
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] uppercase text-[#466271] font-semibold block">
                              Access Check-In
                            </span>
                            <span className="text-sm font-bold text-[#2d4055] truncate block">
                              {activeReservation.checkInLocation}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer actions */}
                      <div className="mt-6 pt-4 border-t border-[#ddeaf3] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 text-[#466271] text-xs">
                          <span className="material-symbols-outlined text-[18px]">info</span>
                          <span>Free cancellation permitted up to 2 hours before scheduled slot.</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={onEditReservation}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#2d4055] bg-[#e3f0f9] hover:bg-[#c9e7f8] transition-colors border border-[#ddeaf3]"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit_calendar
                            </span>
                            <span>Edit Reservation</span>
                          </button>

                          <button
                            type="button"
                            onClick={onCancelReservation}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#344048] hover:bg-[#ddeaf3] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-8 text-center border border-[#ddeaf3] space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#e3f0f9] text-[#2d4055] mx-auto flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">event_busy</span>
                      </div>
                      <h3 className="font-headline font-bold text-lg text-[#2d4055]">
                        No Active Reservations
                      </h3>
                      <p className="text-xs text-[#466271]">
                        You currently do not have any pending or confirmed court bookings.
                      </p>
                      <button
                        onClick={onNavigateToReserve}
                        className="px-4 py-2 rounded-lg bg-[#44576d] text-white text-xs font-semibold hover:bg-[#2d4055]"
                      >
                        Reserve a Court
                      </button>
                    </div>
                  )}

                  {/* Recurring Intramural note */}
                  <div className="bg-[#e9f5ff]/70 backdrop-blur-md rounded-2xl p-4 sm:p-5 flex items-center gap-4 border border-[#ddeaf3]">
                    <div className="w-12 h-12 rounded-xl bg-[#d7e4ed] flex items-center justify-center text-[#2d4055] shrink-0">
                      <span className="material-symbols-outlined text-[26px]">info</span>
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-[#2d4055]">
                        Need recurring court access for intramural practices?
                      </h4>
                      <p className="text-xs text-[#466271] leading-relaxed">
                        Collegiate department team managers can submit semester-long block schedules through the main administration desk.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Facility Status Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xs border border-[#ddeaf3] space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline text-base font-bold text-[#2d4055]">
                        Facility Status
                      </h3>
                      <span className="text-[11px] text-[#466271] uppercase font-semibold">
                        Live Floor Load
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-[#466271] mb-1">
                          <span>East Gym Capacity</span>
                          <span className="text-[#2d4055] font-bold">68% Occupied</span>
                        </div>
                        <div className="w-full h-2 bg-[#e3f0f9] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#44576d] rounded-full transition-all duration-500"
                            style={{ width: '68%' }}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#e9f5ff] space-y-1 border border-[#ddeaf3]">
                        <span className="text-[11px] uppercase text-[#466271] font-semibold block">
                          Next Upcoming Maintenance
                        </span>
                        <div className="flex items-center gap-1.5 text-[#2d4055] text-xs font-semibold">
                          <span className="material-symbols-outlined text-[16px] text-[#466271]">
                            cleaning_services
                          </span>
                          <span>Court Resurfacing: Oct 28, 06:00 AM</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#ddeaf3]">
                      <span className="text-[11px] uppercase text-[#466271] block mb-2 font-bold">
                        Rules &amp; Guidelines
                      </span>
                      <ul className="space-y-2 text-xs text-[#466271]">
                        <li className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-[#2d4055] shrink-0 mt-0.5">
                            check
                          </span>
                          <span>Non-marking athletic shoes mandatory on hardwood floors.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-[#2d4055] shrink-0 mt-0.5">
                            check
                          </span>
                          <span>Only sealed water containers allowed inside court enclosure.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-[#2d4055] shrink-0 mt-0.5">
                            check
                          </span>
                          <span>Return borrowed equipment to Desk #2 promptly at slot end.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Athletic ID Card */}
                  <div className="bg-[#2d4055] text-white rounded-2xl p-5 shadow-xs space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#b9cce6] font-semibold block">
                      Athletic ID
                    </span>
                    <div className="font-headline text-lg font-bold text-white">
                      {user.name}
                    </div>
                    <p className="text-xs text-[#b9cce6]">
                      Student Recreation Pass #{user.studentId} • Active Status
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOOKING HISTORY VIEW */}
          {subTab === 'history' && (
            <div className="space-y-4" id="section-history">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xs border border-[#ddeaf3] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                  <div>
                    <h2 className="font-headline text-xl font-bold text-[#2d4055]">
                      Booking History &amp; Attendance
                    </h2>
                    <p className="text-xs text-[#466271]">
                      Archived reservation logs for academic year 2025–2026.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-[#e3f0f9] px-3 py-1.5 rounded-lg text-[#2d4055] text-xs font-semibold flex items-center gap-1.5 border border-[#ddeaf3]">
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                      <span>{historyRecords.length} Records Logged</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-[#ddeaf3] rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#e9f5ff] text-[#466271] font-bold uppercase tracking-wider border-b border-[#ddeaf3]">
                        <th className="py-3 px-4">Court Name</th>
                        <th className="py-3 px-4">Court Type</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Time Slot</th>
                        <th className="py-3 px-4">Equipment Requested</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ddeaf3]">
                      {historyRecords.map((record) => (
                        <tr
                          key={record.id}
                          className="hover:bg-[#f5faff] transition-colors"
                        >
                          <td className="py-3.5 px-4 font-semibold text-[#2d4055]">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[#44576d] text-[18px]">
                                {record.courtType === 'Basketball'
                                  ? 'sports_basketball'
                                  : 'sports_volleyball'}
                              </span>
                              <span>{record.courtName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-[#466271]">{record.courtType}</td>
                          <td className="py-3.5 px-4 font-medium text-[#2d4055]">{record.date}</td>
                          <td className="py-3.5 px-4 text-[#466271]">{record.timeSlot}</td>
                          <td className="py-3.5 px-4">
                            {record.equipmentRequested !== 'None' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#e3f0f9] text-[11px] font-semibold text-[#2d4055]">
                                <span className="material-symbols-outlined text-[13px]">
                                  {record.courtType === 'Basketball'
                                    ? 'sports_basketball'
                                    : 'sports_volleyball'}
                                </span>
                                {record.equipmentRequested}
                              </span>
                            ) : (
                              <span className="text-[#74777d] italic">None</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {record.status === 'Completed' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ddeaf3] text-[#2d4055] text-[11px] uppercase font-bold tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#44576d]" />
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffd2cc] text-[#ba1a1a] text-[11px] uppercase font-bold tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                                Cancelled by User
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between text-xs text-[#466271] gap-2">
                  <span>Showing all {historyRecords.length} past collegiate reservations</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled
                      className="px-3 py-1 rounded bg-[#e3f0f9] text-[#74777d] opacity-50 cursor-not-allowed text-xs font-semibold"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-[#44576d] text-white text-xs font-bold"
                    >
                      1
                    </button>
                    <button
                      type="button"
                      disabled
                      className="px-3 py-1 rounded bg-[#e3f0f9] text-[#74777d] opacity-50 cursor-not-allowed text-xs font-semibold"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
