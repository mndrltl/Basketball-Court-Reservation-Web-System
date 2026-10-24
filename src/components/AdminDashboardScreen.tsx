import React, { useState } from 'react';
import { Reservation, CourtOption, EquipmentLoanItem, StudentMember, AdminTab, UserProfile } from '../types';
import { DatePicker } from './common/DatePicker';
import { AdminReserveCourtModal } from './modals/AdminReserveCourtModal';
import { GatepassCheckerModal } from './modals/GatepassCheckerModal';

interface AdminDashboardScreenProps {
  reservations: Reservation[];
  courts: CourtOption[];
  equipment: EquipmentLoanItem[];
  students: StudentMember[];
  user: UserProfile;
  activeTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
  isAdminReserveOpen?: boolean;
  onCloseAdminReserve?: () => void;
  isGatepassCheckerOpen?: boolean;
  onCloseGatepassChecker?: () => void;
  onOpenEditProfile?: () => void;
  onUpdateReservationStatus: (id: string, newStatus: Reservation['status'], isCheckedIn?: boolean) => void;
  onUpdateCourtStatus: (courtId: string, newStatus: CourtOption['status'], maintenanceNote?: string) => void;
  onUpdateEquipmentStock: (eqId: string, deltaAvailable: number, deltaTotal?: number) => void;
  onToggleStudentEligibility: (studentId: string) => void;
  onAddNewReservation: (res: Reservation) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  reservations,
  courts,
  equipment,
  students,
  user,
  activeTab,
  onTabChange,
  isAdminReserveOpen = false,
  onCloseAdminReserve,
  isGatepassCheckerOpen = false,
  onCloseGatepassChecker,
  onOpenEditProfile,
  onUpdateReservationStatus,
  onUpdateCourtStatus,
  onUpdateEquipmentStock,
  onToggleStudentEligibility,
  onAddNewReservation,
}) => {
  const [internalTab, setInternalTab] = useState<AdminTab>('overview');
  const currentTab = activeTab !== undefined ? activeTab : internalTab;
  const setCurrentTab = (tab: AdminTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courtFilter, setCourtFilter] = useState<string>('all');

  // Modal states
  const [isInternalReserveOpen, setIsInternalReserveOpen] = useState(false);
  const [isInternalGatepassOpen, setIsInternalGatepassOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockCourtId, setBlockCourtId] = useState(courts[0]?.id || 'bb-1');
  const [blockTimeSlot, setBlockTimeSlot] = useState('08:00 AM – 10:00 AM');
  const [blockIsoDate, setBlockIsoDate] = useState('2025-10-24');
  const [blockDate, setBlockDate] = useState('Today, Oct 24, 2025');
  const [blockReason, setBlockReason] = useState('Varsity Team Morning Scrimmage');
  const [blockType, setBlockType] = useState<'Varsity' | 'Maintenance'>('Varsity');

  // Edit Court Modal state
  const [editingCourt, setEditingCourt] = useState<CourtOption | null>(null);
  const [courtEditStatus, setCourtEditStatus] = useState<CourtOption['status']>('Available');
  const [courtEditNote, setCourtEditNote] = useState('');

  // Selected reservation to inspect pass
  const [inspectReservation, setInspectReservation] = useState<Reservation | null>(null);

  // Quick Check-in Student modal
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [checkinIdInput, setCheckinIdInput] = useState('');
  const [checkinFeedback, setCheckinFeedback] = useState<string | null>(null);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Metrics calculations
  const totalBookingsCount = reservations.length;
  const inProgressCount = reservations.filter(r => r.status === 'In Progress' || r.isCheckedIn).length;
  const pendingApprovalsCount = reservations.filter(r => r.status === 'Pending Confirmation').length;
  const totalLoanedBalls = equipment.reduce((acc, eq) => acc + (eq.loanedStock || 0), 0);
  const maintenanceCourtsCount = courts.filter(c => c.status === 'Maintenance').length;

  // Filtered reservations
  const filteredReservations = reservations.filter(r => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.docket.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'confirmed' && r.status === 'Confirmed') ||
      (statusFilter === 'in-progress' && (r.status === 'In Progress' || r.isCheckedIn)) ||
      (statusFilter === 'pending' && r.status === 'Pending Confirmation') ||
      (statusFilter === 'completed' && r.status === 'Completed') ||
      (statusFilter === 'varsity' && r.status === 'Blocked / Varsity') ||
      (statusFilter === 'cancelled' && r.status === 'Cancelled by User');

    const matchesCourt =
      courtFilter === 'all' || r.courtName.toLowerCase().includes(courtFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCourt;
  });

  const handleCreateBlockSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const court = courts.find(c => c.id === blockCourtId);
    if (!court) return;

    const newRes: Reservation = {
      id: `BLK-${Date.now().toString().slice(-4)}`,
      docket: `#CRS-BLK-${Math.floor(Math.random() * 9000 + 1000)}`,
      courtName: court.name,
      courtSub: court.subLocation,
      facilityDetail: court.fullLocation,
      dateStr: blockDate,
      isoDate: '2025-10-24',
      timeSlot: blockTimeSlot,
      equipmentSummary: blockType === 'Varsity' ? 'Varsity Team Equipment Rack' : 'Maintenance Rigging',
      equipmentDetails: [],
      checkInLocation: 'Main Arena Desk',
      status: blockType === 'Varsity' ? 'Blocked / Varsity' : 'Pending Confirmation',
      studentName: blockType === 'Varsity' ? 'Head Coach Marcus Hayes' : 'Athletic Facilities Dept',
      studentId: 'FAC-70192',
      studentEmail: 'admin@athletics.univ.edu',
      isCheckedIn: true,
      notes: blockReason,
    };

    onAddNewReservation(newRes);
    setIsBlockModalOpen(false);
    showToast(`Successfully blocked ${court.name} for ${blockTimeSlot} (${blockReason}).`);
  };

  const handleQuickCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = checkinIdInput.trim().toUpperCase();
    const match = reservations.find(
      r => r.studentId.toUpperCase() === cleanId || r.docket.toUpperCase() === cleanId
    );

    if (match) {
      onUpdateReservationStatus(match.id, 'In Progress', true);
      setCheckinFeedback(`Success! ${match.studentName} (${match.studentId}) is checked in for ${match.courtName}.`);
      showToast(`Student checked in: ${match.studentName}`);
      setTimeout(() => {
        setIsCheckinModalOpen(false);
        setCheckinIdInput('');
        setCheckinFeedback(null);
      }, 1500);
    } else {
      setCheckinFeedback(`No active reservation found for ID or Docket "${cleanId}". Please verify.`);
    }
  };

  const handleSaveCourtEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourt) return;
    onUpdateCourtStatus(editingCourt.id, courtEditStatus, courtEditNote);
    showToast(`Updated ${editingCourt.name} status to "${courtEditStatus}".`);
    setEditingCourt(null);
  };

  // Schedule grid time slots
  const scheduleHours = [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
    '07:00 PM',
    '08:00 PM',
    '09:00 PM',
  ];

  return (
    <div className="w-full">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2d4055] text-white px-5 py-3 rounded-xl shadow-lg border border-[#ddeaf3]/40 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-[#8cd0f8]">check_circle</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-6">
        {/* Admin Header & Quick Controls */}
        <section className="bg-white rounded-2xl p-6 lg:p-8 shadow-xs border border-[#ddeaf3]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2d4055] text-white flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                  Facility Operations
                </span>
                <span className="text-xs font-semibold text-[#466271]">
                  Building 4 • Arena Control Center
                </span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[#2d4055] tracking-tight">
                Athletic Facilities Administration Desk
              </h1>
              <p className="text-sm text-[#466271] max-w-2xl">
                Master schedule orchestration, real-time court availability, student verification, and sports equipment logistics.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                id="admin-reserve-slot-btn"
                onClick={() => setIsInternalReserveOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#2d4055] text-white hover:bg-[#111d24] transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Reserve Court</span>
              </button>

              <button
                id="admin-open-gatepass-btn"
                onClick={() => setIsInternalGatepassOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#e3f0f9] text-[#2d4055] hover:bg-[#ddeaf3] transition-all flex items-center gap-1.5 border border-[#ddeaf3] shadow-2xs"
              >
                <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                <span>Gatepass Checker</span>
              </button>

              <button
                id="admin-quick-checkin-btn"
                onClick={() => {
                  setIsCheckinModalOpen(true);
                  setCheckinFeedback(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#e3f0f9] text-[#2d4055] hover:bg-[#ddeaf3] transition-all flex items-center gap-1.5 border border-[#ddeaf3] shadow-2xs"
              >
                <span className="material-symbols-outlined text-base">badge</span>
                <span>Desk Check-in</span>
              </button>

              <button
                id="admin-block-slot-btn"
                onClick={() => setIsBlockModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#f5faff] text-[#466271] hover:bg-[#e3f0f9] hover:text-[#2d4055] transition-all flex items-center gap-1.5 border border-[#ddeaf3] shadow-2xs"
              >
                <span className="material-symbols-outlined text-base">block</span>
                <span>Block Court Slot</span>
              </button>

              {onOpenEditProfile && (
                <button
                  id="admin-edit-profile-btn"
                  onClick={onOpenEditProfile}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#f5faff] text-[#466271] hover:bg-[#e3f0f9] hover:text-[#2d4055] transition-all flex items-center gap-1.5 border border-[#ddeaf3] shadow-2xs"
                  title="Edit Admin Profile details"
                >
                  <span className="material-symbols-outlined text-base">manage_accounts</span>
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Operational Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#ddeaf3]">
            <div className="bg-[#f5faff] p-3.5 rounded-xl border border-[#ddeaf3]/80">
              <span className="text-[11px] font-semibold text-[#466271] uppercase tracking-wider block">
                Total Bookings Today
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-headline text-[#2d4055]">
                  {totalBookingsCount}
                </span>
                <span className="text-xs text-[#466271]">scheduled</span>
              </div>
            </div>

            <div className="bg-[#f5faff] p-3.5 rounded-xl border border-[#ddeaf3]/80">
              <span className="text-[11px] font-semibold text-[#466271] uppercase tracking-wider block">
                Active / Checked-In
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-headline text-[#1b7340]">
                  {inProgressCount}
                </span>
                <span className="text-xs text-[#1b7340] font-medium">currently on court</span>
              </div>
            </div>

            <div className="bg-[#f5faff] p-3.5 rounded-xl border border-[#ddeaf3]/80">
              <span className="text-[11px] font-semibold text-[#466271] uppercase tracking-wider block">
                Pending Approvals
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-headline text-[#9b51e0]">
                  {pendingApprovalsCount}
                </span>
                <span className="text-xs text-[#74777d]">needs review</span>
              </div>
            </div>

            <div className="bg-[#f5faff] p-3.5 rounded-xl border border-[#ddeaf3]/80">
              <span className="text-[11px] font-semibold text-[#466271] uppercase tracking-wider block">
                Equipment Out
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-headline text-[#2d4055]">
                  {totalLoanedBalls}
                </span>
                <span className="text-xs text-[#466271]">balls loaned</span>
              </div>
            </div>

            <div className="bg-[#f5faff] p-3.5 rounded-xl border border-[#ddeaf3]/80 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-[#466271] uppercase tracking-wider block">
                Courts Condition
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-headline text-[#2d4055]">
                  {courts.length - maintenanceCourtsCount}/{courts.length}
                </span>
                <span className="text-xs text-[#2d4055]">Operational</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#ddeaf3]">
          <button
            id="admin-tab-overview"
            onClick={() => setCurrentTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              currentTab === 'overview'
                ? 'bg-[#2d4055] text-white shadow-2xs'
                : 'text-[#466271] hover:bg-[#e3f0f9] hover:text-[#2d4055]'
            }`}
          >
            <span className="material-symbols-outlined text-base">monitoring</span>
            <span>Live Schedule &amp; Timetable</span>
          </button>

          <button
            id="admin-tab-reservations"
            onClick={() => setCurrentTab('reservations')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              currentTab === 'reservations'
                ? 'bg-[#2d4055] text-white shadow-2xs'
                : 'text-[#466271] hover:bg-[#e3f0f9] hover:text-[#2d4055]'
            }`}
          >
            <span className="material-symbols-outlined text-base">format_list_bulleted</span>
            <span>All Bookings ({reservations.length})</span>
            {pendingApprovalsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#44576d] text-white text-[11px] flex items-center justify-center font-bold">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            id="admin-tab-courts"
            onClick={() => setCurrentTab('courts')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              currentTab === 'courts'
                ? 'bg-[#2d4055] text-white shadow-2xs'
                : 'text-[#466271] hover:bg-[#e3f0f9] hover:text-[#2d4055]'
            }`}
          >
            <span className="material-symbols-outlined text-base">sports_score</span>
            <span>Court Arenas ({courts.length})</span>
          </button>

          <button
            id="admin-tab-equipment"
            onClick={() => setCurrentTab('equipment')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              currentTab === 'equipment'
                ? 'bg-[#2d4055] text-white shadow-2xs'
                : 'text-[#466271] hover:bg-[#e3f0f9] hover:text-[#2d4055]'
            }`}
          >
            <span className="material-symbols-outlined text-base">sports_basketball</span>
            <span>Equipment Locker</span>
          </button>

          <button
            id="admin-tab-students"
            onClick={() => setCurrentTab('students')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              currentTab === 'students'
                ? 'bg-[#2d4055] text-white shadow-2xs'
                : 'text-[#466271] hover:bg-[#e3f0f9] hover:text-[#2d4055]'
            }`}
          >
            <span className="material-symbols-outlined text-base">groups</span>
            <span>Student Athletes &amp; Passes</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & MASTER 2D SCHEDULE */}
        {currentTab === 'overview' && (
          <div className="space-y-6">
            {/* Live Arena Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courts.map(court => {
                const activeRes = reservations.find(
                  r => r.courtName === court.name && (r.status === 'In Progress' || r.isCheckedIn)
                );
                return (
                  <div
                    key={court.id}
                    className="bg-white rounded-xl p-5 border border-[#ddeaf3] shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#466271]">
                          {court.badge}
                        </span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                            court.status === 'Available'
                              ? 'bg-[#c9e7f8] text-[#2d4055]'
                              : court.status === 'Maintenance'
                              ? 'bg-[#d7e4ed] text-[#466271]'
                              : 'bg-[#ddeaf3] text-[#2d4055]'
                          }`}
                        >
                          {court.status}
                        </span>
                      </div>
                      <h3 className="font-headline font-bold text-lg text-[#2d4055]">
                        {court.name}
                      </h3>
                      <p className="text-xs text-[#74777d] mt-0.5">{court.fullLocation}</p>

                      <div className="mt-4 p-3 rounded-lg bg-[#f5faff] border border-[#ddeaf3]/70 text-xs">
                        {activeRes ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[#2d4055] font-semibold">
                              <span className="w-2 h-2 rounded-full bg-[#2d4055] animate-pulse" />
                              <span>OCCUPIED NOW</span>
                            </div>
                            <div className="font-medium text-[#2d4055]">{activeRes.studentName}</div>
                            <div className="text-[#466271]">{activeRes.timeSlot}</div>
                            <div className="text-[#74777d]">{activeRes.equipmentSummary}</div>
                          </div>
                        ) : court.status === 'Maintenance' ? (
                          <div className="text-[#466271]">
                            <span className="font-semibold block text-[#2d4055]">Under Maintenance:</span>
                            <span>{court.maintenanceNote || 'Scheduled floor inspection'}</span>
                          </div>
                        ) : (
                          <div className="text-[#2d4055] flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-base text-[#466271]">check_circle</span>
                            <span>Ready for Play • Next slot open</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#ddeaf3] flex items-center justify-between text-xs">
                      <span className="text-[#74777d]">{court.capacity}</span>
                      <button
                        onClick={() => {
                          setEditingCourt(court);
                          setCourtEditStatus(court.status);
                          setCourtEditNote(court.maintenanceNote || '');
                        }}
                        className="text-[#2d4055] font-semibold hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">tune</span>
                        <span>Manage Court</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Master Timetable Matrix */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#ddeaf3] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-headline font-bold text-lg text-[#2d4055] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#2d4055]">calendar_view_day</span>
                    Master Arena Timetable (Today's Hourly Allocations)
                  </h3>
                  <p className="text-xs text-[#74777d]">
                    Visual schedule showing reserved, varsity, and available time slots across all university courts.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-[#466271]">
                    <span className="w-3 h-3 rounded bg-white border border-[#ddeaf3]" />
                    Available
                  </span>
                  <span className="flex items-center gap-1 text-[#466271]">
                    <span className="w-3 h-3 rounded bg-[#c9e7f8] border border-[#a2cfec]" />
                    Student Booked
                  </span>
                  <span className="flex items-center gap-1 text-[#466271]">
                    <span className="w-3 h-3 rounded bg-[#2d4055] border border-[#111d24]" />
                    Varsity / Blocked
                  </span>
                  <span className="flex items-center gap-1 text-[#466271]">
                    <span className="w-3 h-3 rounded bg-[#d7e4ed] border border-[#bcc8d3]" />
                    Maintenance
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto pb-2">
                <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#e3f0f9]/80 text-[#2d4055] border-b border-[#ddeaf3]">
                      <th className="p-3 font-semibold sticky left-0 bg-[#e3f0f9] z-10 w-44">
                        Court / Arena
                      </th>
                      {scheduleHours.slice(0, 8).map(hour => (
                        <th key={hour} className="p-2 text-center font-semibold text-[#466271]">
                          {hour}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ddeaf3]/70">
                    {courts.map(court => (
                      <tr key={court.id} className="hover:bg-[#f5faff]/50">
                        <td className="p-3 font-semibold text-[#2d4055] sticky left-0 bg-white shadow-2xs z-10">
                          <div>{court.name}</div>
                          <span className="text-[10px] text-[#74777d] font-normal">{court.badge}</span>
                        </td>
                        {scheduleHours.slice(0, 8).map((hour, idx) => {
                          const isCourtMaint = court.status === 'Maintenance';
                          const matchingRes = reservations.find(
                            r => r.courtName === court.name && r.timeSlot.includes(hour.slice(0, 2))
                          );

                          if (isCourtMaint) {
                            return (
                              <td key={hour} className="p-1.5 text-center">
                                <div className="h-10 rounded-lg bg-[#d7e4ed] border border-[#bcc8d3] flex flex-col justify-center items-center text-[10px] text-[#466271] p-1 font-medium">
                                  <span>Maint</span>
                                </div>
                              </td>
                            );
                          }

                          if (matchingRes) {
                            const isVarsity = matchingRes.status === 'Blocked / Varsity';
                            return (
                              <td key={hour} className="p-1.5 text-center">
                                <div
                                  onClick={() => setInspectReservation(matchingRes)}
                                  className={`h-10 rounded-lg border flex flex-col justify-center items-center text-[10px] p-1 cursor-pointer transition-all hover:scale-105 shadow-2xs ${
                                    isVarsity
                                      ? 'bg-[#2d4055] border-[#111d24] text-white font-semibold'
                                      : 'bg-[#c9e7f8] border-[#a2cfec] text-[#2d4055] font-medium'
                                  }`}
                                  title={`${matchingRes.studentName} (${matchingRes.timeSlot})`}
                                >
                                  <span className="truncate max-w-[80px]">
                                    {isVarsity ? 'Varsity' : matchingRes.studentName.split(' ')[0]}
                                  </span>
                                  <span className="text-[9px] opacity-75">{matchingRes.status}</span>
                                </div>
                              </td>
                            );
                          }

                          // Default slot
                          const isBookedSim = (idx + court.name.length) % 4 === 0;
                          if (isBookedSim) {
                            return (
                              <td key={hour} className="p-1.5 text-center">
                                <div className="h-10 rounded-lg bg-[#e3f0f9] border border-[#ddeaf3] flex flex-col justify-center items-center text-[10px] text-[#466271] p-1 font-medium">
                                  <span>Intramural</span>
                                </div>
                              </td>
                            );
                          }

                          return (
                            <td key={hour} className="p-1.5 text-center">
                              <button
                                onClick={() => {
                                  setBlockCourtId(court.id);
                                  setBlockTimeSlot(`${hour} – ${scheduleHours[idx + 1] || '10:00 PM'}`);
                                  setIsBlockModalOpen(true);
                                }}
                                className="w-full h-10 rounded-lg bg-[#f5faff] hover:bg-[#e3f0f9] border border-[#ddeaf3] flex items-center justify-center text-[11px] font-medium text-[#466271] hover:text-[#2d4055] transition-colors"
                                title="Click to block or assign this slot"
                              >
                                <span>Open</span>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL RESERVATIONS TABLE */}
        {currentTab === 'reservations' && (
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#ddeaf3] space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline font-bold text-xl text-[#2d4055]">
                  Court Bookings &amp; Verification Desk
                </h2>
                <p className="text-xs text-[#74777d]">
                  Review, approve, check-in, or reallocate student court reservations.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-base">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by student, ID, or docket..."
                    className="pl-9 pr-3 py-1.5 rounded-xl border border-[#ddeaf3] text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2d4055] w-56 sm:w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#ddeaf3] text-xs bg-white text-[#466271] focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="pending">Pending Confirmation</option>
                  <option value="varsity">Varsity / Blocked</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={courtFilter}
                  onChange={e => setCourtFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#ddeaf3] text-xs bg-white text-[#466271] focus:outline-hidden"
                >
                  <option value="all">All Courts</option>
                  {courts.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reservations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="bg-[#f5faff] text-[#466271] border-b border-[#ddeaf3] uppercase tracking-wider text-[11px]">
                    <th className="p-3 font-semibold">Docket / Student</th>
                    <th className="p-3 font-semibold">Court &amp; Location</th>
                    <th className="p-3 font-semibold">Schedule Time</th>
                    <th className="p-3 font-semibold">Equipment Loaned</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Desk Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ddeaf3]/60">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-500">
                        No bookings match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map(res => (
                      <tr key={res.id} className="hover:bg-[#f5faff]/60 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-[#2d4055] text-sm">
                            {res.studentName}
                          </div>
                          <div className="text-[11px] text-[#466271] flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono">{res.studentId}</span>
                            <span>•</span>
                            <span className="font-mono text-[#2d4055]">{res.docket}</span>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-medium text-[#2d4055]">{res.courtName}</div>
                          <div className="text-[11px] text-[#74777d]">{res.courtSub}</div>
                        </td>

                        <td className="p-3">
                          <div className="font-medium text-[#2d4055]">{res.dateStr}</div>
                          <div className="text-[11px] text-[#466271]">{res.timeSlot}</div>
                        </td>

                        <td className="p-3">
                          <div className="text-[#2d4055] font-medium">{res.equipmentSummary}</div>
                          {res.notes && (
                            <div className="text-[10px] text-[#466271] italic mt-0.5">
                              Note: {res.notes}
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              res.status === 'Confirmed'
                                ? 'bg-[#c9e7f8] text-[#2d4055]'
                                : res.status === 'In Progress' || res.isCheckedIn
                                ? 'bg-[#2d4055] text-white'
                                : res.status === 'Pending Confirmation'
                                ? 'bg-[#ddeaf3] text-[#44576d]'
                                : res.status === 'Blocked / Varsity'
                                ? 'bg-[#344048] text-white'
                                : res.status === 'Completed'
                                ? 'bg-[#f5faff] text-[#74777d] border border-[#ddeaf3]'
                                : 'bg-[#d7e4ed] text-[#111d24]'
                            }`}
                          >
                            {res.status === 'In Progress' || res.isCheckedIn ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#8cd0f8] animate-pulse" />
                                <span>Checked In (Active)</span>
                              </>
                            ) : (
                              res.status
                            )}
                          </span>
                        </td>

                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {res.status === 'Pending Confirmation' && (
                            <button
                              onClick={() => {
                                onUpdateReservationStatus(res.id, 'Confirmed');
                                showToast(`Approved booking for ${res.studentName}.`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#2d4055] text-white font-medium hover:bg-[#111d24] text-[11px] transition-colors"
                            >
                              Approve
                            </button>
                          )}

                          {res.status === 'Confirmed' && !res.isCheckedIn && (
                            <button
                              onClick={() => {
                                onUpdateReservationStatus(res.id, 'In Progress', true);
                                showToast(`Checked in ${res.studentName} at desk.`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#2d4055] text-white font-medium hover:bg-[#1e2d3d] text-[11px] transition-colors"
                            >
                              Check In
                            </button>
                          )}

                          {(res.status === 'In Progress' || res.isCheckedIn) && (
                            <button
                              onClick={() => {
                                onUpdateReservationStatus(res.id, 'Completed');
                                showToast(`Session completed for ${res.studentName}. Equipment returned.`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 text-[11px] transition-colors"
                            >
                              Mark Completed
                            </button>
                          )}

                          <button
                            onClick={() => setInspectReservation(res)}
                            className="px-2 py-1 rounded-lg bg-[#e3f0f9] text-[#2d4055] font-medium hover:bg-[#d0e6f5] text-[11px] transition-colors"
                            title="Inspect Entry Pass & Barcode"
                          >
                            Pass
                          </button>

                          {res.status !== 'Completed' && res.status !== 'Cancelled by User' && (
                            <button
                              onClick={() => {
                                if (confirm(`Cancel reservation for ${res.studentName}?`)) {
                                  onUpdateReservationStatus(res.id, 'Cancelled by User');
                                  showToast(`Cancelled reservation ${res.docket}.`);
                                }
                              }}
                              className="px-2 py-1 rounded-lg text-red-600 hover:bg-red-50 text-[11px] transition-colors"
                              title="Cancel / Revoke booking"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: COURT ARENAS MANAGEMENT */}
        {currentTab === 'courts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#ddeaf3] shadow-xs">
              <div>
                <h2 className="font-headline font-bold text-xl text-[#2d4055]">
                  Court Facilities &amp; Maintenance Controls
                </h2>
                <p className="text-xs text-[#74777d]">
                  Set operating status, schedule maintenance closures, and configure facility capacity.
                </p>
              </div>
              <button
                onClick={() => {
                  setBlockType('Maintenance');
                  setIsBlockModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#2d4055] text-white hover:bg-[#1e2d3d] flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-base">construction</span>
                <span>Schedule Maintenance</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courts.map(court => (
                <div
                  key={court.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#ddeaf3] shadow-xs flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                    <img
                      src={court.imageUrl}
                      alt={court.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-xs ${
                          court.status === 'Available'
                            ? 'bg-[#2d4055] text-white'
                            : court.status === 'Maintenance'
                            ? 'bg-[#d7e4ed] text-[#2d4055]'
                            : 'bg-[#44576d] text-white'
                        }`}
                      >
                        {court.status}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 text-white">
                      <span className="text-[11px] font-semibold uppercase tracking-wider block opacity-90">
                        {court.badge}
                      </span>
                      <h3 className="font-headline font-bold text-lg leading-tight">{court.name}</h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="text-xs text-[#466271] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-[#2d4055]">
                          location_on
                        </span>
                        <span>{court.fullLocation}</span>
                      </div>
                      <div className="text-xs text-[#466271] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-[#2d4055]">
                          group
                        </span>
                        <span>{court.capacity}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#f5faff] border border-[#ddeaf3] text-xs space-y-1">
                        <div className="font-semibold text-[#2d4055]">Floor Condition:</div>
                        <div className="text-[#466271]">
                          {court.condition || 'FIBA standard compliant'}
                        </div>
                        {court.maintenanceNote && (
                          <div className="text-[#466271] text-[11px] font-medium pt-1 border-t border-[#ddeaf3]">
                            Notice: {court.maintenanceNote}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#ddeaf3] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#74777d]">Status:</span>
                        <select
                          value={court.status}
                          onChange={e => {
                            const newSt = e.target.value as CourtOption['status'];
                            onUpdateCourtStatus(court.id, newSt);
                            showToast(`Updated ${court.name} to ${newSt}.`);
                          }}
                          className="text-xs font-semibold px-2 py-1 rounded-lg border border-[#ddeaf3] bg-white text-[#2d4055]"
                        >
                          <option value="Available">Available</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          setEditingCourt(court);
                          setCourtEditStatus(court.status);
                          setCourtEditNote(court.maintenanceNote || '');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#e3f0f9] text-[#2d4055] hover:bg-[#d0e6f5] transition-colors"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EQUIPMENT INVENTORY DESK */}
        {currentTab === 'equipment' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#ddeaf3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline font-bold text-xl text-[#2d4055]">
                  Athletic Equipment Locker &amp; Inventory Management
                </h2>
                <p className="text-xs text-[#74777d]">
                  Monitor balls, scoreboards, whistles, and adjust stock counts.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-[#c9e7f8] text-[#2d4055] text-xs font-semibold">
                  Desk Attendant Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {equipment.map(item => {
                const total = item.totalStock || item.availableStock + (item.quantity || 0);
                const loaned = item.loanedStock || item.quantity || 0;
                const maint = item.maintenanceStock || 0;
                const avail = item.availableStock;
                const availPct = Math.round((avail / (total || 1)) * 100);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-6 border border-[#ddeaf3] shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-[#e3f0f9] overflow-hidden p-1 border border-[#ddeaf3] shrink-0 flex items-center justify-center">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#466271]">
                              {item.category}
                            </span>
                            <h3 className="font-headline font-bold text-lg text-[#2d4055]">
                              {item.name}
                            </h3>
                            <p className="text-xs text-[#74777d]">{item.spec}</p>
                          </div>
                        </div>

                        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-[#e3f0f9] text-[#2d4055]">
                          {avail} in locker
                        </span>
                      </div>

                      {/* Stock Bar */}
                      <div className="mt-5 space-y-1.5">
                        <div className="flex justify-between text-xs text-[#466271]">
                          <span>Locker Availability</span>
                          <span className="font-semibold text-[#2d4055]">{availPct}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#ddeaf3] overflow-hidden flex">
                          <div
                            className="bg-[#2d4055] h-full transition-all"
                            style={{ width: `${availPct}%` }}
                            title={`Available: ${avail}`}
                          />
                          <div
                            className="bg-[#44576d] h-full transition-all"
                            style={{ width: `${Math.round((loaned / (total || 1)) * 100)}%` }}
                            title={`Loaned: ${loaned}`}
                          />
                          <div
                            className="bg-[#d7e4ed] h-full transition-all"
                            style={{ width: `${Math.round((maint / (total || 1)) * 100)}%` }}
                            title={`Maintenance: ${maint}`}
                          />
                        </div>
                      </div>

                      {/* Stock breakdown numbers */}
                      <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                        <div className="bg-[#f5faff] p-2 rounded-lg border border-[#ddeaf3]">
                          <span className="text-[10px] text-[#74777d] uppercase font-semibold block">
                            Total
                          </span>
                          <span className="text-sm font-bold text-[#2d4055]">{total}</span>
                        </div>
                        <div className="bg-[#f5faff] p-2 rounded-lg border border-[#ddeaf3]">
                          <span className="text-[10px] text-[#2d4055] uppercase font-semibold block">
                            In Locker
                          </span>
                          <span className="text-sm font-bold text-[#2d4055]">{avail}</span>
                        </div>
                        <div className="bg-[#f5faff] p-2 rounded-lg border border-[#ddeaf3]">
                          <span className="text-[10px] text-[#466271] uppercase font-semibold block">
                            Loaned Out
                          </span>
                          <span className="text-sm font-bold text-[#466271]">{loaned}</span>
                        </div>
                        <div className="bg-[#f5faff] p-2 rounded-lg border border-[#ddeaf3]">
                          <span className="text-[10px] text-[#74777d] uppercase font-semibold block">
                            Maint
                          </span>
                          <span className="text-sm font-bold text-[#74777d]">{maint}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock adjustments */}
                    <div className="pt-4 border-t border-[#ddeaf3] flex items-center justify-between gap-3">
                      <span className="text-xs text-[#466271] font-medium">Quick Adjust Locker Stock:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (item.availableStock > 0) {
                              onUpdateEquipmentStock(item.id, -1);
                              showToast(`Checked out 1 ${item.name}.`);
                            }
                          }}
                          disabled={item.availableStock <= 0}
                          className="w-8 h-8 rounded-lg bg-[#e3f0f9] text-[#2d4055] hover:bg-[#d0e6f5] disabled:opacity-40 font-bold flex items-center justify-center transition-colors text-sm"
                          title="Record Loan (decrement available)"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => {
                            onUpdateEquipmentStock(item.id, 1);
                            showToast(`Checked in 1 returned ${item.name}.`);
                          }}
                          className="w-8 h-8 rounded-lg bg-[#2d4055] text-white hover:bg-[#1e2d3d] font-bold flex items-center justify-center transition-colors text-sm"
                          title="Record Return (increment available)"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => {
                            onUpdateEquipmentStock(item.id, 5, 5);
                            showToast(`Restocked +5 brand new ${item.name}.`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#e3f0f9] text-[#2d4055] hover:bg-[#d0e6f5] text-xs font-semibold transition-colors ml-1 border border-[#ddeaf3]"
                        >
                          +5 Restock
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: STUDENTS DIRECTORY & PASSES */}
        {currentTab === 'students' && (
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#ddeaf3] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline font-bold text-xl text-[#2d4055]">
                  Student Athletes &amp; Recreation Pass Holders
                </h2>
                <p className="text-xs text-[#74777d]">
                  Verify student membership, manage facility eligibility, and review playing records.
                </p>
              </div>
              <div className="text-xs text-[#466271] font-semibold bg-[#e3f0f9] px-3 py-1.5 rounded-xl border border-[#ddeaf3]">
                Total Enrolled Athletes: {students.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#f5faff] text-[#466271] border-b border-[#ddeaf3] uppercase tracking-wider text-[11px]">
                    <th className="p-3 font-semibold">Student Athlete</th>
                    <th className="p-3 font-semibold">Department / College</th>
                    <th className="p-3 font-semibold">Facility Eligibility</th>
                    <th className="p-3 font-semibold">Active Bookings</th>
                    <th className="p-3 font-semibold">Playtime Record</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ddeaf3]/60">
                  {students.map(stu => (
                    <tr key={stu.id} className="hover:bg-[#f5faff]/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-[#2d4055] text-sm">{stu.name}</div>
                        <div className="text-[11px] text-[#74777d] font-mono">{stu.studentId} • {stu.email}</div>
                      </td>
                      <td className="p-3 text-[#466271]">{stu.department}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            stu.eligibility === 'Active Full Member'
                              ? 'bg-[#c9e7f8] text-[#2d4055]'
                              : stu.eligibility === 'Varsity Athlete'
                              ? 'bg-[#2d4055] text-white'
                              : 'bg-[#d7e4ed] text-[#466271]'
                          }`}
                        >
                          {stu.eligibility}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-[#2d4055]">{stu.activeBookingsCount} active</td>
                      <td className="p-3 text-[#466271]">{stu.totalHoursPlayed} hours logged</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            onToggleStudentEligibility(stu.id);
                            showToast(`Updated eligibility for ${stu.name}.`);
                          }}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            stu.eligibility === 'Suspended'
                              ? 'bg-[#2d4055] text-white hover:bg-[#111d24]'
                              : 'bg-[#f5faff] text-[#466271] hover:bg-[#e3f0f9] border border-[#ddeaf3]'
                          }`}
                        >
                          {stu.eligibility === 'Suspended' ? 'Reinstate Access' : 'Suspend Pass'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: BLOCK COURT SLOT */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-[#ddeaf3] space-y-4">
            <div className="flex items-center justify-between border-b border-[#ddeaf3] pb-3">
              <h3 className="font-headline font-bold text-lg text-[#2d4055] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2d4055]">block</span>
                Block Court Slot
              </h3>
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateBlockSlot} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-[#466271] block mb-1">Select Court Arena</label>
                <select
                  value={blockCourtId}
                  onChange={e => setBlockCourtId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] bg-white text-xs text-[#2d4055]"
                >
                  {courts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#466271] block mb-1">Block Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBlockType('Varsity')}
                    className={`py-2 text-center rounded-xl font-semibold border transition-all ${
                      blockType === 'Varsity'
                        ? 'bg-[#2d4055] border-[#2d4055] text-white shadow-xs'
                        : 'bg-[#f5faff] border-[#ddeaf3] text-[#466271] hover:bg-[#e3f0f9]'
                    }`}
                  >
                    Varsity Practice
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlockType('Maintenance')}
                    className={`py-2 text-center rounded-xl font-semibold border transition-all ${
                      blockType === 'Maintenance'
                        ? 'bg-[#2d4055] border-[#2d4055] text-white shadow-xs'
                        : 'bg-[#f5faff] border-[#ddeaf3] text-[#466271] hover:bg-[#e3f0f9]'
                    }`}
                  >
                    Facility Maintenance
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#466271] block mb-1">Time Slot</label>
                <select
                  value={blockTimeSlot}
                  onChange={e => setBlockTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] bg-white text-xs text-[#2d4055]"
                >
                  <option value="08:00 AM – 10:00 AM">08:00 AM – 10:00 AM (Morning Session)</option>
                  <option value="10:00 AM – 12:00 PM">10:00 AM – 12:00 PM (Midday Session)</option>
                  <option value="01:00 PM – 03:00 PM">01:00 PM – 03:00 PM (Afternoon Session)</option>
                  <option value="03:00 PM – 05:00 PM">03:00 PM – 05:00 PM (Varsity Peak)</option>
                  <option value="07:00 PM – 09:00 PM">07:00 PM – 09:00 PM (Evening Session)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#466271] block mb-1">Date (Date Picker)</label>
                <DatePicker
                  id="admin-block-date-picker"
                  value={blockIsoDate}
                  onChange={(iso, label) => {
                    setBlockIsoDate(iso);
                    setBlockDate(label);
                  }}
                />
              </div>

              <div>
                <label className="font-semibold text-[#466271] block mb-1">Reason / Directive Note</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  placeholder="e.g. NCAA Men's Scrimmage or Floor Buffing"
                  className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] text-xs"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#ddeaf3]">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#466271] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2d4055] text-white hover:bg-[#1e2d3d]"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DESK CHECK-IN SCANNER */}
      {isCheckinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-[#ddeaf3] space-y-4">
            <div className="flex items-center justify-between border-b border-[#ddeaf3] pb-3">
              <h3 className="font-headline font-bold text-lg text-[#2d4055] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2d4055]">badge</span>
                Desk Check-In &amp; Verification
              </h3>
              <button
                onClick={() => setIsCheckinModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <p className="text-xs text-[#466271]">
              Enter the student's ID (e.g. <span className="font-mono font-semibold">20240396-C</span>) or docket number (e.g. <span className="font-mono font-semibold">#CRS-8849-25</span>) to stamp their check-in and issue equipment.
            </p>

            <form onSubmit={handleQuickCheckinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#466271] block mb-1">Student ID / Docket Number</label>
                <input
                  type="text"
                  value={checkinIdInput}
                  onChange={e => setCheckinIdInput(e.target.value)}
                  placeholder="e.g. 20240396-C or #CRS-8849-25"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#ddeaf3] text-sm font-mono focus:ring-2 focus:ring-[#2d4055] focus:outline-hidden uppercase"
                  autoFocus
                  required
                />
              </div>

              {/* Quick suggestion buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-[#74777d] w-full">Quick Demo IDs:</span>
                <button
                  type="button"
                  onClick={() => setCheckinIdInput('20240396-C')}
                  className="px-2 py-0.5 rounded bg-[#f5faff] border border-[#ddeaf3] text-[11px] font-mono text-[#2d4055]"
                >
                  20240396-C (Jamin)
                </button>
                <button
                  type="button"
                  onClick={() => setCheckinIdInput('20240412-M')}
                  className="px-2 py-0.5 rounded bg-[#f5faff] border border-[#ddeaf3] text-[11px] font-mono text-[#2d4055]"
                >
                  20240412-M (Mateo)
                </button>
              </div>

              {checkinFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    checkinFeedback.includes('Success')
                      ? 'bg-[#c9e7f8] text-[#2d4055] border border-[#a2cfec]'
                      : 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]'
                  }`}
                >
                  {checkinFeedback}
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#ddeaf3]">
                <button
                  type="button"
                  onClick={() => setIsCheckinModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#466271] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2d4055] text-white hover:bg-[#1e2d3d]"
                >
                  Validate &amp; Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT COURT DETAILS */}
      {editingCourt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-[#ddeaf3] space-y-4">
            <div className="flex items-center justify-between border-b border-[#ddeaf3] pb-3">
              <h3 className="font-headline font-bold text-lg text-[#2d4055] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2d4055]">tune</span>
                Configure {editingCourt.name}
              </h3>
              <button
                onClick={() => setEditingCourt(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCourtEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-[#466271] block mb-1">Operational Status</label>
                <select
                  value={courtEditStatus}
                  onChange={e => setCourtEditStatus(e.target.value as CourtOption['status'])}
                  className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] bg-white text-xs font-semibold text-[#2d4055]"
                >
                  <option value="Available">Available (Open for bookings)</option>
                  <option value="Maintenance">Under Maintenance</option>
                  <option value="Reserved">Reserved (Varsity only)</option>
                  <option value="Closed">Closed (Facility shutdown)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#466271] block mb-1">Maintenance / Bulletin Note</label>
                <textarea
                  value={courtEditNote}
                  onChange={e => setCourtEditNote(e.target.value)}
                  placeholder="e.g. Floor resurfacing in progress or rim calibration"
                  className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] text-xs h-20"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#ddeaf3]">
                <button
                  type="button"
                  onClick={() => setEditingCourt(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#466271] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2d4055] text-white hover:bg-[#1e2d3d]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: INSPECT GATE PASS & BARCODE */}
      {inspectReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#ddeaf3] space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-[#ddeaf3] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2d4055]">
                Digital Pass Inspection
              </span>
              <button
                onClick={() => setInspectReservation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="bg-[#f5faff] p-4 rounded-xl border border-[#ddeaf3] space-y-2">
              <div className="font-headline font-bold text-lg text-[#2d4055]">
                {inspectReservation.studentName}
              </div>
              <div className="text-xs text-[#466271] font-mono">{inspectReservation.studentId}</div>
              <div className="text-sm font-semibold text-[#2d4055]">{inspectReservation.courtName}</div>
              <div className="text-xs text-[#74777d]">{inspectReservation.timeSlot}</div>
              <div className="text-xs font-mono font-bold text-[#2d4055] pt-1">
                Docket: {inspectReservation.docket}
              </div>

              {/* Barcode representation */}
              <div className="pt-3 pb-1 flex flex-col items-center">
                <div className="flex items-center gap-[2px] h-12 bg-white px-3 py-1 rounded border border-gray-300">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2].map((w, i) => (
                    <div
                      key={i}
                      className="bg-black h-full"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-gray-500 mt-1">
                  * CRS-{inspectReservation.id} *
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  onUpdateReservationStatus(inspectReservation.id, 'In Progress', true);
                  showToast(`Checked in ${inspectReservation.studentName}.`);
                  setInspectReservation(null);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#2d4055] text-white hover:bg-[#1e2d3d]"
              >
                Mark Checked-In
              </button>
              <button
                onClick={() => setInspectReservation(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADMIN RESERVE COURT */}
      {(isAdminReserveOpen || isInternalReserveOpen) && (
        <AdminReserveCourtModal
          isOpen={true}
          courts={courts}
          user={user}
          onClose={() => {
            setIsInternalReserveOpen(false);
            onCloseAdminReserve?.();
          }}
          onSaveReservation={(res: Reservation) => {
            onAddNewReservation(res);
            setIsInternalReserveOpen(false);
            onCloseAdminReserve?.();
            showToast(`Admin reservation confirmed for ${res.courtName} (${res.studentName})`);
          }}
        />
      )}

      {/* MODAL 6: GATEPASS CHECKER SCANNER */}
      {(isGatepassCheckerOpen || isInternalGatepassOpen) && (
        <GatepassCheckerModal
          isOpen={true}
          reservations={reservations}
          onClose={() => {
            setIsInternalGatepassOpen(false);
            onCloseGatepassChecker?.();
          }}
          onValidateCheckIn={(resId: string) => {
            onUpdateReservationStatus(resId, 'In Progress', true);
            showToast('Pass checked in successfully!');
          }}
        />
      )}
    </div>
  );
};
