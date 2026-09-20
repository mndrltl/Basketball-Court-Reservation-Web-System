/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ViewTab, UserProfile, Reservation, BookingHistoryRecord, CourtOption, EquipmentLoanItem, StudentMember } from './types';
import {
  INITIAL_USER,
  INITIAL_ADMIN_USER,
  INITIAL_ACTIVE_RESERVATION,
  INITIAL_HISTORY_RECORDS,
  INITIAL_ALL_RESERVATIONS,
  COURTS_DATA,
  INITIAL_EQUIPMENT,
  INITIAL_STUDENTS,
} from './data/initialData';
import {
  seedFirestoreIfEmpty,
  fetchFirestoreReservations,
  saveFirestoreReservation,
  updateFirestoreReservation,
  fetchFirestoreCourts,
  updateFirestoreCourt,
  saveFirestoreUserProfile,
} from './lib/firestoreService';
import { testFirestoreConnection } from './lib/firebase';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthScreen } from './components/AuthScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { ReservationFlowScreen } from './components/ReservationFlowScreen';
import { SchedulesBookingsScreen } from './components/SchedulesBookingsScreen';
import { AdminDashboardScreen } from './components/AdminDashboardScreen';
import { DigitalPassModal } from './components/modals/DigitalPassModal';
import { EditReservationModal } from './components/modals/EditReservationModal';
import { CancelReservationModal } from './components/modals/CancelReservationModal';
import { AvailabilityCalendarModal } from './components/modals/AvailabilityCalendarModal';
import { EditProfileModal } from './components/modals/EditProfileModal';
import { AdminReserveCourtModal } from './components/modals/AdminReserveCourtModal';
import { GatepassCheckerModal } from './components/modals/GatepassCheckerModal';
import { AdminTab } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [adminSubTab, setAdminSubTab] = useState<AdminTab>('overview');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(
    INITIAL_ACTIVE_RESERVATION
  );
  const [historyRecords, setHistoryRecords] = useState<BookingHistoryRecord[]>(
    INITIAL_HISTORY_RECORDS
  );

  // Admin and Facility State
  const [allReservations, setAllReservations] = useState<Reservation[]>(INITIAL_ALL_RESERVATIONS);
  const [courts, setCourts] = useState<CourtOption[]>(COURTS_DATA);
  const [equipment, setEquipment] = useState<EquipmentLoanItem[]>(INITIAL_EQUIPMENT);
  const [students, setStudents] = useState<StudentMember[]>(INITIAL_STUDENTS);

  // Reservation Flow configuration
  const [reserveSportType, setReserveSportType] = useState<'basketball' | 'volleyball'>('basketball');
  const [reserveFocusEquipment, setReserveFocusEquipment] = useState<boolean>(false);

  // Schedules / Bookings sub-tab
  const [schedulesSubTab, setSchedulesSubTab] = useState<'active' | 'history'>('active');

  // Modals state
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAdminReserveOpen, setIsAdminReserveOpen] = useState(false);
  const [isGatepassCheckerOpen, setIsGatepassCheckerOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Firestore connection and sync data
  useEffect(() => {
    let isMounted = true;
    async function initFirestore() {
      try {
        await testFirestoreConnection();
        await seedFirestoreIfEmpty();
        const loadedReservations = await fetchFirestoreReservations();
        const loadedCourts = await fetchFirestoreCourts();
        if (isMounted) {
          if (loadedReservations && loadedReservations.length > 0) {
            setAllReservations(loadedReservations);
            // If active reservation exists in loaded list
            const foundActive = loadedReservations.find(
              r => r.status === 'Confirmed' || r.status === 'In Progress'
            );
            if (foundActive) {
              setActiveReservation(foundActive);
            }
          }
          if (loadedCourts && loadedCourts.length > 0) {
            setCourts(loadedCourts);
          }
        }
      } catch (err) {
        console.warn('Firestore initialization notice:', err);
      }
    }
    initFirestore();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
    saveFirestoreUserProfile(newUser);
    if (newUser.isAdmin) {
      setCurrentTab('admin');
      showToast(`Welcome Director ${newUser.name}! Facilities Management Desk open.`);
    } else {
      setCurrentTab('dashboard');
      showToast(`Welcome back, ${newUser.name}! Directory access authenticated.`);
    }
  };

  const handleLogout = () => {
    setCurrentTab('auth');
    showToast('Signed out of athletic directory session.');
  };

  const handleConfirmNewBooking = (newRes: Reservation) => {
    setActiveReservation(newRes);
    setAllReservations(prev => [newRes, ...prev]);
    saveFirestoreReservation(newRes);
    showToast(`Reservation confirmed for ${newRes.courtName}! Keycard pass ready.`);
  };

  const handleSaveEditReservation = (updated: Partial<Reservation>) => {
    if (!activeReservation) return;
    const merged = { ...activeReservation, ...updated };
    setActiveReservation(merged);
    setAllReservations(prev => prev.map(r => (r.id === merged.id ? merged : r)));
    updateFirestoreReservation(merged.id, updated);
    setIsEditModalOpen(false);
    showToast(`Reservation updated for ${merged.courtName}`);
  };

  const handleConfirmCancelReservation = () => {
    if (!activeReservation) return;
    const cancelledRecord: BookingHistoryRecord = {
      id: `hist-${Date.now()}`,
      courtName: activeReservation.courtName,
      courtType: activeReservation.courtName.includes('Volleyball') ? 'Volleyball' : 'Basketball',
      date: 'Today, Oct 24, 2025',
      timeSlot: activeReservation.timeSlot,
      equipmentRequested: activeReservation.equipmentSummary || 'None',
      status: 'Cancelled by User',
    };

    setHistoryRecords((prev) => [cancelledRecord, ...prev]);
    setAllReservations(prev =>
      prev.map(r => (r.id === activeReservation.id ? { ...r, status: 'Cancelled by User' } : r))
    );
    updateFirestoreReservation(activeReservation.id, { status: 'Cancelled by User' });
    setActiveReservation(null);
    setIsCancelModalOpen(false);
    showToast('Reservation cancelled. Slot has been released to varsity timetable.');
  };

  // Admin Handlers
  const handleUpdateReservationStatus = (
    id: string,
    newStatus: Reservation['status'],
    isCheckedIn?: boolean
  ) => {
    setAllReservations(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            status: newStatus,
            isCheckedIn: isCheckedIn !== undefined ? isCheckedIn : r.isCheckedIn,
          };
        }
        return r;
      })
    );

    updateFirestoreReservation(id, {
      status: newStatus,
      ...(isCheckedIn !== undefined ? { isCheckedIn } : {}),
    });

    if (activeReservation?.id === id) {
      setActiveReservation(prev => (prev ? { ...prev, status: newStatus, isCheckedIn: !!isCheckedIn } : null));
    }
  };

  const handleUpdateCourtStatus = (
    courtId: string,
    newStatus: CourtOption['status'],
    maintenanceNote?: string
  ) => {
    setCourts(prev =>
      prev.map(c => {
        if (c.id === courtId) {
          return {
            ...c,
            status: newStatus,
            maintenanceNote: maintenanceNote !== undefined ? maintenanceNote : c.maintenanceNote,
          };
        }
        return c;
      })
    );
    updateFirestoreCourt(courtId, newStatus, maintenanceNote);
  };

  const handleUpdateEquipmentStock = (eqId: string, deltaAvailable: number, deltaTotal = 0) => {
    setEquipment(prev =>
      prev.map(item => {
        if (item.id === eqId) {
          const newAvail = Math.max(0, item.availableStock + deltaAvailable);
          const newTotal = (item.totalStock || item.availableStock) + deltaTotal;
          return {
            ...item,
            availableStock: newAvail,
            totalStock: newTotal,
          };
        }
        return item;
      })
    );
  };

  const handleToggleStudentEligibility = (studentId: string) => {
    setStudents(prev =>
      prev.map(stu => {
        if (stu.id === studentId) {
          const isSuspended = stu.eligibility === 'Suspended';
          return {
            ...stu,
            eligibility: isSuspended ? 'Active Full Member' : 'Suspended',
          };
        }
        return stu;
      })
    );
  };

  const handleAddNewReservation = (newRes: Reservation) => {
    setAllReservations(prev => [newRes, ...prev]);
    saveFirestoreReservation(newRes);
  };

  const handleNavigateToReserve = (
    sport: 'basketball' | 'volleyball' = 'basketball',
    focusEquipment = false
  ) => {
    setReserveSportType(sport);
    setReserveFocusEquipment(focusEquipment);
    setCurrentTab('reservations');
    if (focusEquipment) {
      setTimeout(() => {
        document.getElementById('equipment-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleBookFromCalendar = (courtName: string, timeSlot: string) => {
    setIsCalendarModalOpen(false);
    setReserveSportType(courtName.toLowerCase().includes('volleyball') ? 'volleyball' : 'basketball');
    setCurrentTab('reservations');
    showToast(`Selected ${courtName} (${timeSlot}). Choose equipment and confirm.`);
  };

  // If Auth screen is active
  if (currentTab === 'auth') {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5faff]">
        {/* Quick Portal Switch Bar at very top for instant preview testing */}
        <div className="w-full bg-[#2d4055] text-white py-1.5 px-4 text-xs flex items-center justify-between">
          <span className="font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8cd0f8] animate-pulse" />
            University Athletics Portal • Directory Authentication Screen
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setUser(INITIAL_USER);
                setCurrentTab('dashboard');
              }}
              className="px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors flex items-center gap-1 text-[11px]"
            >
              <span>Preview Student View</span>
              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
            </button>
            <button
              onClick={() => {
                setUser(INITIAL_ADMIN_USER);
                setCurrentTab('admin');
              }}
              className="px-2.5 py-0.5 rounded bg-[#ddeaf3] text-[#2d4055] hover:bg-white font-semibold transition-colors flex items-center gap-1 text-[11px]"
            >
              <span>Preview Admin Desk</span>
              <span className="material-symbols-outlined text-[13px]">admin_panel_settings</span>
            </button>
          </div>
        </div>

        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5faff] text-[#111d24]">
      {/* Fixed Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'booking-history') {
            setSchedulesSubTab('history');
            setCurrentTab('booking-history');
          } else if (tab === 'reservations') {
            setCurrentTab('reservations');
          } else if (tab === 'admin') {
            setCurrentTab('admin');
          } else {
            setCurrentTab('dashboard');
          }
        }}
        user={user}
        onLogout={handleLogout}
        onOpenPass={() => setIsPassModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        adminSubTab={adminSubTab}
        onSelectAdminSubTab={(tab) => {
          setAdminSubTab(tab);
          setCurrentTab('admin');
        }}
        onOpenGatepassChecker={() => setIsGatepassCheckerOpen(true)}
        onOpenAdminReserveModal={() => setIsAdminReserveOpen(true)}
      />

      {/* Main Content View with top offset for fixed navbar */}
      <main className="w-full pt-16 flex-1 bg-[#f5faff] pb-12">
        {currentTab === 'dashboard' && (
          <DashboardScreen
            user={user}
            activeReservation={activeReservation}
            onNavigateToReserve={handleNavigateToReserve}
            onNavigateToReservationsTab={() => {
              setSchedulesSubTab('active');
              setCurrentTab('booking-history');
            }}
            onNavigateToHistoryTab={() => {
              setSchedulesSubTab('history');
              setCurrentTab('booking-history');
            }}
            onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
            onOpenPassModal={() => setIsPassModalOpen(true)}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
          />
        )}

        {currentTab === 'reservations' && (
          <ReservationFlowScreen
            user={user}
            initialSport={reserveSportType}
            focusEquipment={reserveFocusEquipment}
            onConfirmBooking={handleConfirmNewBooking}
            onOpenPassModal={() => setIsPassModalOpen(true)}
          />
        )}

        {currentTab === 'booking-history' && (
          <SchedulesBookingsScreen
            user={user}
            activeReservation={activeReservation}
            historyRecords={historyRecords}
            initialSubTab={schedulesSubTab}
            onEditReservation={() => setIsEditModalOpen(true)}
            onCancelReservation={() => setIsCancelModalOpen(true)}
            onNavigateToReserve={() => handleNavigateToReserve('basketball')}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardScreen
            reservations={allReservations}
            courts={courts}
            equipment={equipment}
            students={students}
            user={user}
            activeTab={adminSubTab}
            onTabChange={setAdminSubTab}
            isAdminReserveOpen={isAdminReserveOpen}
            onCloseAdminReserve={() => setIsAdminReserveOpen(false)}
            isGatepassCheckerOpen={isGatepassCheckerOpen}
            onCloseGatepassChecker={() => setIsGatepassCheckerOpen(false)}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onUpdateReservationStatus={handleUpdateReservationStatus}
            onUpdateCourtStatus={handleUpdateCourtStatus}
            onUpdateEquipmentStock={handleUpdateEquipmentStock}
            onToggleStudentEligibility={handleToggleStudentEligibility}
            onAddNewReservation={handleAddNewReservation}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      {isPassModalOpen && activeReservation && (
        <DigitalPassModal
          reservation={activeReservation}
          user={user}
          onClose={() => setIsPassModalOpen(false)}
        />
      )}

      {isEditProfileOpen && (
        <EditProfileModal
          user={user}
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={(updated) => {
            const merged = { ...user, ...updated };
            setUser(merged);
            saveFirestoreUserProfile(merged);
            showToast('Profile updated successfully.');
          }}
        />
      )}

      {isEditModalOpen && activeReservation && (
        <EditReservationModal
          reservation={activeReservation}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEditReservation}
        />
      )}

      {isCancelModalOpen && activeReservation && (
        <CancelReservationModal
          reservation={activeReservation}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancelReservation}
        />
      )}

      {isCalendarModalOpen && (
        <AvailabilityCalendarModal
          onClose={() => setIsCalendarModalOpen(false)}
          onBookCourt={handleBookFromCalendar}
        />
      )}

      {isAdminReserveOpen && (
        <AdminReserveCourtModal
          isOpen={isAdminReserveOpen}
          courts={courts}
          user={user}
          onClose={() => setIsAdminReserveOpen(false)}
          onSaveReservation={(newRes) => {
            handleAddNewReservation(newRes);
            setIsAdminReserveOpen(false);
            showToast(`Admin reservation confirmed for ${newRes.courtName} (${newRes.studentName})`);
          }}
        />
      )}

      {isGatepassCheckerOpen && (
        <GatepassCheckerModal
          isOpen={isGatepassCheckerOpen}
          reservations={allReservations}
          onClose={() => setIsGatepassCheckerOpen(false)}
          onValidateCheckIn={(resId) => {
            handleUpdateReservationStatus(resId, 'In Progress', true);
            showToast('Pass checked in successfully!');
          }}
        />
      )}

      {/* Floating System Toast */}
      {toastMessage && (
        <div
          id="toast"
          className="fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none"
        >
          <div className="bg-[#2d4055] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-[#44576d]">
            <span className="material-symbols-outlined text-[#c9e7f8] text-[20px]">
              check_circle
            </span>
            <span id="toast-message">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

