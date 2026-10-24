import React, { useState } from 'react';
import { CourtOption, Reservation, UserProfile } from '../types';
import { COURTS_DATA, ASSETS } from '../data/initialData';
import { DatePicker } from './common/DatePicker';
import { computeTimeSlotAvailability, checkLocalBookingConflict, isCourtBookable } from '../lib/firestoreService';

interface ReservationFlowScreenProps {
  user: UserProfile;
  initialSport?: 'basketball' | 'volleyball';
  focusEquipment?: boolean;
  onConfirmBooking: (newReservation: Reservation) => void;
  onOpenPassModal: () => void;
  courts?: CourtOption[];
  reservations?: Reservation[];
}

export const ReservationFlowScreen: React.FC<ReservationFlowScreenProps> = ({
  user,
  initialSport = 'basketball',
  focusEquipment = false,
  onConfirmBooking,
  onOpenPassModal,
  courts = COURTS_DATA,
  reservations = [],
}) => {
  const [sportType, setSportType] = useState<'basketball' | 'volleyball'>(initialSport);

  const availableCourts = courts && courts.length > 0 ? courts : COURTS_DATA;
  const courtsToDisplay = availableCourts.filter((c) => c.type === sportType);

  // Selection states
  const [selectedCourt, setSelectedCourt] = useState<CourtOption>(
    () => courtsToDisplay[0] || COURTS_DATA[0]
  );
  //const [selectedDay, setSelectedDay] = useState<number>(24);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
});
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('04:00 PM – 05:00 PM');
  const [qtyBasketballs, setQtyBasketballs] = useState<number>(2);
  const [qtyVolleyballs, setQtyVolleyballs] = useState<number>(0);
  const [agreedToRules, setAgreedToRules] = useState<boolean>(true);
  const [confirmedState, setConfirmedState] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Created reservation to display in success modal
  const [lastCreatedReservation, setLastCreatedReservation] = useState<Reservation | null>(null);

  //const currentIsoDate = `2025-10-${selectedDay < 10 ? '0' + selectedDay : selectedDay}`;
  const currentIsoDate = selectedDate;

  // Dynamically compute available time slots based on reservations in database
  const dynamicSlots = computeTimeSlotAvailability(
    reservations,
    selectedCourt.name,
    currentIsoDate,
    selectedTimeSlot
  );

  // Helper for equipment summary text
  const getEquipmentSummary = () => {
    const list: string[] = [];
    if (qtyBasketballs > 0) {
      list.push(`${qtyBasketballs} Official Basketball${qtyBasketballs > 1 ? 's' : ''}`);
    }
    if (qtyVolleyballs > 0) {
      list.push(`${qtyVolleyballs} Indoor Volleyball${qtyVolleyballs > 1 ? 's' : ''}`);
    }
    return list.length > 0 ? list.join(', ') : 'None Requested';
  };

  const handleConfirmReservation = () => {
    setValidationError(null);

      // Reject reservation dates in the past.
  const now = new Date();
  const today = new Date();
  const todayIsoDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  if (currentIsoDate < todayIsoDate) {
    const err = 'You cannot book a reservation for a past date.';
    setValidationError(err);
    alert(err);
    return;
  }

  // Read the starting time from the selected one-hour slot.
  const timeMatch = selectedTimeSlot.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)\s*–/i
  );

  if (!timeMatch) {
    const err = 'Invalid time slot. Please select a valid time.';
    setValidationError(err);
    alert(err);
    return;
  }

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const period = timeMatch[3].toUpperCase();

  if (hours < 1 || hours > 12 || minutes > 59) {
    const err = 'Invalid time slot. Please select a valid time.';
    setValidationError(err);
    alert(err);
    return;
  }

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const bookingStart = new Date(`${currentIsoDate}T00:00:00`);
  bookingStart.setHours(hours, minutes, 0, 0);

  if (bookingStart <= now) {
    const err = 'This time slot has already started or passed. Please select a future time slot.';
    setValidationError(err);
    alert(err);
    return;
  }

    // 1. Check student eligibility
    if (user.eligibility === 'Suspended') {
      const err = 'Your athletic facility membership is currently Suspended. Reservations cannot be booked.';
      setValidationError(err);
      alert(err);
      return;
    }

    // 2. Check court condition / maintenance status
    if (!isCourtBookable(selectedCourt)) {
      const err = `${selectedCourt.name} is currently marked as ${selectedCourt.status}. Please choose an available court.`;
      setValidationError(err);
      alert(err);
      return;
    }

    // 3. Check facility regulations agreement
    if (!agreedToRules) {
      const err = 'Please agree to the athletic facility rules before confirming.';
      setValidationError(err);
      alert(err);
      return;
    }

    // 4. Check for double booking conflicts
    const conflict = checkLocalBookingConflict(
      reservations,
      selectedCourt.name,
      currentIsoDate,
      selectedTimeSlot
    );
    if (conflict) {
      const err = `Conflict Detected: ${selectedCourt.name} is already booked for ${selectedTimeSlot}. Please pick an open time slot.`;
      setValidationError(err);
      alert(err);
      return;
    }

    const newRes: Reservation = {
      id: `REC-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      docket: '#CRS-8849-25',
      courtName: selectedCourt.name,
      courtSub: selectedCourt.subLocation,
      facilityDetail: `${selectedCourt.name} • ${selectedCourt.badge}`,
      //dateStr: `Thursday, Oct ${selectedDay}, 2025`,
      dateStr: new Date(`${currentIsoDate}T00:00:00`).toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}),
      isoDate: currentIsoDate,
      timeSlot: selectedTimeSlot,
      equipmentSummary: getEquipmentSummary(),
      equipmentDetails: [
        ...(qtyBasketballs > 0 ? [{ name: 'Official Basketballs', qty: qtyBasketballs }] : []),
        ...(qtyVolleyballs > 0 ? [{ name: 'Indoor Volleyballs', qty: qtyVolleyballs }] : []),
      ],
      checkInLocation: 'Desk #2 North Locker Hall',
      status: 'Confirmed',
      studentName: user.name,
      studentId: user.studentId,
    };

    setConfirmedState(true);
    setLastCreatedReservation(newRes);
    setShowSuccessModal(true);
    onConfirmBooking(newRes);
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {/* Top Utility & Stepper Navigation */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-[#466271] mb-1 text-xs font-semibold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">stadium</span>
                <span>Facility Booking Desk</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[#2d4055] tracking-tight">
                Court &amp; Equipment Allocation
              </h1>
              <p className="text-sm text-[#466271] mt-1">
                Intercollegiate Athletic Complex • Academic Year 2025–2026
              </p>
            </div>

            {/* Live Facility Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-[#e9f5ff] rounded-xl shadow-xs border border-[#ddeaf3]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2d4055] animate-pulse" />
              <span className="text-xs text-[#2d4055] font-semibold">
                Fieldhouse Operating: Courts Online
              </span>
            </div>
          </div>

          {/* Step Indicator Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#ddeaf3]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
              {/* Step 1 */}
              <div className="flex items-center gap-3 p-1">
                <div className="w-9 h-9 rounded-lg bg-[#2d4055] text-white flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
                  1
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-[#466271] uppercase tracking-wider block font-semibold">
                    Stage 01
                  </span>
                  <span className="text-sm text-[#2d4055] truncate block font-bold">
                    Court Selection
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3 p-1">
                <div className="w-9 h-9 rounded-lg bg-[#2d4055] text-white flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
                  2
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-[#466271] uppercase tracking-wider block font-semibold">
                    Stage 02
                  </span>
                  <span className="text-sm text-[#2d4055] truncate block font-bold">
                    Date &amp; Schedule
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3 p-1">
                <div className="w-9 h-9 rounded-lg bg-[#c9e7f8] text-[#001e2b] flex items-center justify-center text-sm font-bold shrink-0">
                  3
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-[#466271] uppercase tracking-wider block font-semibold">
                    Stage 03
                  </span>
                  <span className="text-sm text-[#2d4055] truncate block font-bold">
                    Equipment Gear
                  </span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-center gap-3 p-1 opacity-70">
                <div className="w-9 h-9 rounded-lg bg-[#ddeaf3] text-[#466271] flex items-center justify-center text-sm font-bold shrink-0">
                  4
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-[#466271] uppercase tracking-wider block font-semibold">
                    Stage 04
                  </span>
                  <span className="text-sm text-[#466271] truncate block font-semibold">
                    Final Verification
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Booking Body Grid: Left Action Sections vs Right Summary Flight Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Flow Interaction Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* SECTION 1: Court Selection Tabs & Grid */}
            <section className="bg-white rounded-2xl p-6 shadow-xs border border-[#ddeaf3]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-[#2d4055]">
                    <span className="text-xs font-bold text-[#466271] uppercase">Step 01</span>
                    <span className="text-[#c4c6cd]">•</span>
                    <h2 className="font-headline text-lg font-bold text-[#2d4055]">
                      Select Active Court Arena
                    </h2>
                  </div>
                  <p className="text-xs text-[#466271] mt-0.5">
                    Choose regulation indoor hardwood surfaces
                  </p>
                </div>

                {/* Category Toggle Pills */}
                <div className="inline-flex p-1 bg-[#e3f0f9] rounded-xl shrink-0 border border-[#ddeaf3]">
                  <button
                    id="tab-bb"
                    type="button"
                    onClick={() => {
                      setSportType('basketball');
                      const firstBb = COURTS_DATA.find((c) => c.type === 'basketball');
                      if (firstBb) setSelectedCourt(firstBb);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      sportType === 'basketball'
                        ? 'bg-[#2d4055] text-white shadow-xs'
                        : 'text-[#43474c] hover:text-[#2d4055]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">sports_basketball</span>
                    <span>Basketball Courts</span>
                  </button>

                  <button
                    id="tab-vb"
                    type="button"
                    onClick={() => {
                      setSportType('volleyball');
                      const firstVb = COURTS_DATA.find((c) => c.type === 'volleyball');
                      if (firstVb) setSelectedCourt(firstVb);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      sportType === 'volleyball'
                        ? 'bg-[#2d4055] text-white shadow-xs'
                        : 'text-[#43474c] hover:text-[#2d4055]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">sports_volleyball</span>
                    <span>Volleyball Courts</span>
                  </button>
                </div>
              </div>

              {/* Courts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courtsToDisplay.map((court) => {
                  const isSelected = selectedCourt.id === court.id;
                  return (
                    <div
                      key={court.id}
                      id={`court-card-${court.id}`}
                      onClick={() => setSelectedCourt(court)}
                      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border ${
                        isSelected
                          ? 'bg-[#e9f5ff] border-[#44576d] shadow-md ring-2 ring-[#44576d]/20'
                          : 'bg-white border-[#ddeaf3] shadow-xs hover:shadow-md'
                      }`}
                    >
                      <div className="relative h-44 w-full overflow-hidden bg-[#e3f0f9]">
                        <img
                          alt={court.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          src={court.imageUrl}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2d4055]/80 via-transparent to-transparent" />
                        <div className="absolute top-3 right-3">
                          {isSelected ? (
                            <span className="px-2.5 py-0.5 rounded text-xs bg-[#2d4055] text-white uppercase tracking-wider font-semibold shadow-xs flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">
                                check_circle
                              </span>{' '}
                              Selected
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded text-xs bg-white/90 text-[#2d4055] uppercase tracking-wider font-semibold shadow-xs">
                              Available
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-3 left-3 text-white">
                          <span className="text-[11px] uppercase tracking-wider text-white/80 block">
                            {court.badge}
                          </span>
                          <h3 className="font-headline text-lg font-bold text-white">
                            {court.name}
                          </h3>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[#466271] text-xs">
                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                            <span>{court.fullLocation}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#2d4055] text-xs font-semibold">
                            <span className="material-symbols-outlined text-[16px]">groups</span>
                            <span>Capacity: {court.capacity}</span>
                          </div>
                        </div>
                        <div
                          className={`h-8 px-3 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'bg-[#c9e7f8] text-[#001e2b]'
                              : 'bg-[#e3f0f9] text-[#466271]'
                          }`}
                        >
                          {isSelected ? 'Status: Available' : 'Select'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 2: Date & Time Selection */}
            <section className="bg-white rounded-2xl p-6 shadow-xs border border-[#ddeaf3]">
              <div className="mb-6">
                <div className="flex items-center gap-1.5 text-[#2d4055]">
                  <span className="text-xs font-bold text-[#466271] uppercase">Step 02</span>
                  <span className="text-[#c4c6cd]">•</span>
                  <h2 className="font-headline text-lg font-bold text-[#2d4055]">
                    Date &amp; Scheduled Timetable
                  </h2>
                </div>
                <p className="text-xs text-[#466271] mt-0.5">
                  Choose your 60-minute training session block
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Calendar View (October 2025) */}
                <div className="md:col-span-5 bg-[#e9f5ff] p-4 rounded-xl border border-[#ddeaf3]">
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#466271] font-semibold block">
                        Semester Term
                      </span>
                      <h4 className="font-headline text-base font-bold text-[#2d4055]">
                        October 2025
                      </h4>
                    </div>
                    <div className="w-44">
                      <DatePicker
                        id="stage2-quick-date-picker"
                        value={selectedDate}
                        onChange={(iso) => {
                          setSelectedDate(iso);
                        }}
                      />
                    </div>
                  </div>

                  {/* Calendar Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#466271] mb-2 font-bold">
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                    <span>Su</span>
                  </div>

                  {/* Calendar Day Matrix */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    <span className="py-2 text-[#c4c6cd]">29</span>
                    <span className="py-2 text-[#c4c6cd]">30</span>
                    {[...Array(31)].map((_, i) => {
                      const day = i + 1;
                      //const isCurrentDay = day === selectedDay;
                      const isCurrentDay =
  selectedDate === `2025-10-${String(day).padStart(2, '0')}`;
                      return (
                        <button
                          key={day}
                          type="button"
                         //onClick={() => setSelectedDay(day)}
                         onClick={() => {
  setSelectedDate(`2025-10-${String(day).padStart(2, '0')}`);
}}
                          className={`py-2 rounded-lg font-medium transition-all ${
                            isCurrentDay
                              ? 'bg-[#2d4055] text-white font-bold shadow-xs ring-2 ring-[#2d4055]/20'
                              : 'bg-white text-[#466271] hover:bg-[#e3f0f9]'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                    <span className="py-2 text-[#c4c6cd]">1</span>
                    <span className="py-2 text-[#c4c6cd]">2</span>
                  </div>

                  {/* Selected Date Banner */}
                  <div className="mt-4 pt-3 border-t border-[#ddeaf3] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#2d4055] font-semibold text-xs">
                      <span className="material-symbols-outlined text-[18px]">event</span>
                      <span>
  {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}
</span>
                    </div>
                    <span className="text-[11px] text-[#466271]">Regulation Hours</span>
                  </div>
                </div>

                {/* Time Slots Matrix */}
                <div className="md:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-[#466271] uppercase font-bold">
                        Slot Availability Matrix
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-[#466271]">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[#c9e7f8]" /> Available
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[#2d4055]" /> Selected
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[#ddeaf3]" /> Reserved
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="slot-container">
                      {dynamicSlots.map((slot) => {
                        const isSelected = selectedTimeSlot === slot.time;
                        const isReserved = slot.status === 'reserved' || slot.status === 'closed';

                        if (isReserved) {
                          return (
                            <div
                              key={slot.id}
                              className="p-3 rounded-xl bg-[#ddeaf3]/70 opacity-60 cursor-not-allowed flex items-center justify-between border border-[#ddeaf3]"
                            >
                              <div>
                                <span className="text-xs text-[#466271] block font-medium">
                                  {slot.time}
                                </span>
                                <span className="text-[11px] text-[#74777d] block">{slot.label}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[11px] bg-[#e3f0f9] text-[#74777d] uppercase font-semibold">
                                {slot.status === 'reserved' ? 'Reserved' : 'Closed'}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={slot.id}
                            onClick={() => setSelectedTimeSlot(slot.time)}
                            className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${
                              isSelected
                                ? 'bg-[#2d4055] text-white shadow-md border-[#2d4055]'
                                : 'bg-white text-[#2d4055] border-[#ddeaf3] shadow-xs hover:border-[#44576d]'
                            }`}
                          >
                            <div>
                              <span
                                className={`text-xs block font-bold ${
                                  isSelected ? 'text-white' : 'text-[#2d4055]'
                                }`}
                              >
                                {slot.time}
                              </span>
                              <span
                                className={`text-[11px] block ${
                                  isSelected ? 'text-white/80' : 'text-[#466271]'
                                }`}
                              >
                                {isSelected ? 'Active Slot Selected' : 'Standard Reservation'}
                              </span>
                            </div>

                            {isSelected ? (
                              <span className="w-6 h-6 rounded bg-white text-[#2d4055] flex items-center justify-center shadow-xs">
                                <span className="material-symbols-outlined text-[16px] font-bold">
                                  check
                                </span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[11px] bg-[#c9e7f8] text-[#001e2b] uppercase font-semibold">
                                Open
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footnote */}
                  <div className="mt-4 p-3 rounded-xl bg-[#e3f0f9] flex items-center gap-2 text-[#466271] border border-[#ddeaf3]">
                    <span className="material-symbols-outlined text-[18px] text-[#2d4055] shrink-0">
                      info
                    </span>
                    <span className="text-xs">
                      Consecutive bookings are restricted to a maximum of two hours per institutional ID.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: Sports Equipment Reservation & Availability */}
            <section
              id="equipment-section"
              className={`bg-white rounded-2xl p-6 shadow-xs border transition-all ${
                focusEquipment ? 'border-[#2d4055] ring-2 ring-[#2d4055]/10' : 'border-[#ddeaf3]'
              }`}
            >
              <div className="mb-6">
                <div className="flex items-center gap-1.5 text-[#2d4055]">
                  <span className="text-xs font-bold text-[#466271] uppercase">Step 03</span>
                  <span className="text-[#c4c6cd]">•</span>
                  <h2 className="font-headline text-lg font-bold text-[#2d4055]">
                    Equipment Loan Desk
                  </h2>
                </div>
                <p className="text-xs text-[#466271] mt-0.5">
                  Complimentary athletic inventory included with arena reservation
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Official Basketballs */}
                <div className="bg-[#e9f5ff] rounded-2xl p-4 flex flex-col justify-between shadow-xs border border-[#ddeaf3]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 shadow-inner bg-white border border-[#ddeaf3]">
                      <img
                        alt="Official Competition Basketballs"
                        className="w-full h-full object-cover"
                        src={ASSETS.basketballsEquipment}
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#466271] block">
                        NFHS / NCAA Spec
                      </span>
                      <h3 className="font-headline text-base font-bold text-[#2d4055] truncate">
                        Official Basketballs
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-[#2d4055] text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#2d4055]" />
                        <span>
                          Available: <strong id="stock-bb">{18 - qtyBasketballs}</strong> remaining
                        </span>
                      </div>
                      <span className="text-xs text-[#466271] block mt-0.5">
                        Full grain composite leather
                      </span>
                    </div>
                  </div>

                  {/* Stepper Control */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#ddeaf3]">
                    <span className="text-xs font-semibold text-[#466271]">Reserve Quantity</span>
                    <div className="inline-flex items-center gap-2 bg-[#e3f0f9] rounded-xl p-1 border border-[#ddeaf3]">
                      <button
                        type="button"
                        onClick={() => setQtyBasketballs((q) => Math.max(0, q - 1))}
                        className="w-8 h-8 rounded-lg bg-white text-[#2d4055] hover:bg-[#ddeaf3] transition-colors flex items-center justify-center font-bold shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">remove</span>
                      </button>
                      <span
                        className="w-8 text-center font-headline font-bold text-base text-[#2d4055]"
                        id="qty-bb"
                      >
                        {qtyBasketballs}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQtyBasketballs((q) => Math.min(6, q + 1))}
                        className="w-8 h-8 rounded-lg bg-white text-[#2d4055] hover:bg-[#ddeaf3] transition-colors flex items-center justify-center font-bold shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Indoor Tournament Volleyballs */}
                <div className="bg-[#e9f5ff] rounded-2xl p-4 flex flex-col justify-between shadow-xs border border-[#ddeaf3]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 shadow-inner bg-white border border-[#ddeaf3]">
                      <img
                        alt="Indoor Tournament Volleyballs"
                        className="w-full h-full object-cover"
                        src={ASSETS.volleyballsEquipment}
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#466271] block">
                        FIVB Tournament Spec
                      </span>
                      <h3 className="font-headline text-base font-bold text-[#2d4055] truncate">
                        Indoor Volleyballs
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-[#2d4055] text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#2d4055]" />
                        <span>
                          Available: <strong id="stock-vb">{12 - qtyVolleyballs}</strong> remaining
                        </span>
                      </div>
                      <span className="text-xs text-[#466271] block mt-0.5">
                        Micro-fiber composite cover
                      </span>
                    </div>
                  </div>

                  {/* Stepper Control */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#ddeaf3]">
                    <span className="text-xs font-semibold text-[#466271]">Reserve Quantity</span>
                    <div className="inline-flex items-center gap-2 bg-[#e3f0f9] rounded-xl p-1 border border-[#ddeaf3]">
                      <button
                        type="button"
                        onClick={() => setQtyVolleyballs((q) => Math.max(0, q - 1))}
                        className="w-8 h-8 rounded-lg bg-white text-[#2d4055] hover:bg-[#ddeaf3] transition-colors flex items-center justify-center font-bold shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">remove</span>
                      </button>
                      <span
                        className="w-8 text-center font-headline font-bold text-base text-[#2d4055]"
                        id="qty-vb"
                      >
                        {qtyVolleyballs}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQtyVolleyballs((q) => Math.min(6, q + 1))}
                        className="w-8 h-8 rounded-lg bg-white text-[#2d4055] hover:bg-[#ddeaf3] transition-colors flex items-center justify-center font-bold shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* SECTION 4: Flight Card / Confirmation Review Panel (Right Side) */}
          <aside className="lg:col-span-4 sticky top-24 flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-[#ddeaf3]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#ddeaf3]">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#466271] font-semibold">
                    Summary Docket
                  </span>
                  <h3 className="font-headline text-xl font-bold text-[#2d4055]">
                    Booking Details
                  </h3>
                </div>
                <span
                  id="status-badge"
                  className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-2xs ${
                    confirmedState
                      ? 'bg-[#2d4055] text-white'
                      : 'bg-[#c9e7f8] text-[#001e2b]'
                  }`}
                >
                  {confirmedState ? 'Confirmed' : 'Pending Confirmation'}
                </span>
              </div>

              {/* Summary Flight Items */}
              <div className="space-y-4 text-[#111d24]">
                {/* Court Item */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e3f0f9] flex items-center justify-center text-[#2d4055] shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[20px]">sports_score</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-[#466271] uppercase font-semibold block">
                      Selected Arena
                    </span>
                    <p className="text-sm text-[#2d4055] font-bold truncate" id="sum-court">
                      {selectedCourt.name}
                    </p>
                    <p className="text-xs text-[#466271] truncate" id="sum-court-sub">
                      {selectedCourt.subLocation}
                    </p>
                  </div>
                </div>

                {/* Date Item */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e3f0f9] flex items-center justify-center text-[#2d4055] shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-[#466271] uppercase font-semibold block">
                      Reservation Date
                    </span>
                    <p className="text-sm text-[#2d4055] font-bold" id="sum-date">
                      {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})}
                    </p>
                    <p className="text-xs text-[#466271]">Standard Academic Schedule</p>
                  </div>
                </div>

                {/* Time Slot Item */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e3f0f9] flex items-center justify-center text-[#2d4055] shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-[#466271] uppercase font-semibold block">
                      Time Window (60m)
                    </span>
                    <p className="text-sm text-[#2d4055] font-bold" id="sum-time">
                      {selectedTimeSlot}
                    </p>
                    <p className="text-xs text-[#466271]">Check-in at facility control 10m prior</p>
                  </div>
                </div>

                {/* Loan Equipment Item */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e3f0f9] flex items-center justify-center text-[#2d4055] shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[20px]">sports</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-[#466271] uppercase font-semibold block">
                      Loan Equipment
                    </span>
                    <p className="text-sm text-[#2d4055] font-bold" id="sum-equip">
                      {getEquipmentSummary()}
                    </p>
                    <p className="text-xs text-[#466271]">Pick-up rack behind court scoretable</p>
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="mt-6 pt-4 border-t border-[#ddeaf3]">
                <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                  <input
                    id="rules-agree"
                    checked={agreedToRules}
                    onChange={(e) => setAgreedToRules(e.target.checked)}
                    type="checkbox"
                    className="mt-0.5 rounded text-[#2d4055] accent-[#2d4055] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-[#466271] group-hover:text-[#2d4055] leading-relaxed transition-colors">
                    I agree to the Athletic Center rules, non-marking indoor footwear mandate, and return protocols.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2">
                <button
                  id="btn-confirm"
                  type="button"
                  onClick={handleConfirmReservation}
                  className="w-full py-3 rounded-xl bg-[#2d4055] text-white text-sm font-semibold hover:bg-[#111d24] transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Confirm Reservation</span>
                </button>

                <button
                  id="btn-edit-reservation"
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#c9e7f8] text-[#001e2b] text-sm font-semibold hover:bg-[#aecbdc] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  <span>Edit Reservation</span>
                </button>
              </div>

              {/* Reference ID Metadata */}
              <div className="mt-4 pt-3 border-t border-[#ddeaf3] flex items-center justify-between text-[#466271] text-[11px] font-mono">
                <span>DOCKET: #CRS-8849-25</span>
                <span>UNIVERSITY REC ID: #4092</span>
              </div>
            </div>

            {/* Note */}
            <div className="p-4 rounded-xl bg-[#e9f5ff] text-[#466271] flex items-start gap-2.5 border border-[#ddeaf3]">
              <span className="material-symbols-outlined text-[#2d4055] text-[20px] shrink-0 mt-0.5">
                verified_user
              </span>
              <p className="text-xs leading-relaxed">
                All court access cards are automatically synced with student/faculty digital keycards upon confirmation.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && lastCreatedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#263239]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setShowSuccessModal(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl transform transition-all text-center z-10 border border-[#ddeaf3]">
            <div className="w-16 h-16 rounded-full bg-[#c9e7f8] text-[#2d4055] mx-auto flex items-center justify-center mb-4 shadow-xs">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-[#466271]">
              Booking Authorized
            </span>
            <h3 className="font-headline text-2xl font-bold text-[#2d4055] mt-1">
              Court Confirmed!
            </h3>
            <p className="text-sm text-[#466271] mt-2 leading-relaxed">
              Your slot for <strong className="text-[#2d4055]">{lastCreatedReservation.courtName}</strong> on{' '}
              <span className="text-[#2d4055] font-semibold">
                {lastCreatedReservation.dateStr} ({lastCreatedReservation.timeSlot})
              </span>{' '}
              has been reserved.
            </p>

            <div className="my-5 p-4 rounded-xl bg-[#e9f5ff] text-left space-y-2 border border-[#ddeaf3]">
              <div className="flex justify-between text-xs">
                <span className="text-[#466271]">Authorized Holder:</span>
                <span className="font-semibold text-[#2d4055]">
                  {lastCreatedReservation.studentName} (ID #4092)
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#466271]">Equipment Checkout:</span>
                <span className="font-semibold text-[#2d4055]">
                  {lastCreatedReservation.equipmentSummary}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#466271]">Access Gate:</span>
                <span className="font-semibold text-[#2d4055]">East Wing Arena Gate 2B</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onOpenPassModal();
                }}
                className="w-full py-2.5 rounded-lg bg-[#2d4055] text-white text-sm font-semibold hover:bg-[#111d24] transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">badge</span>
                <span>View Digital Keycard Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 rounded-lg bg-[#e3f0f9] text-[#2d4055] text-sm font-semibold hover:bg-[#ddeaf3] transition-all"
              >
                Done • Return to Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
