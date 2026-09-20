import React, { useState } from 'react';
import { CourtOption, Reservation, UserProfile } from '../../types';
import { DatePicker } from '../common/DatePicker';

interface AdminReserveCourtModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: CourtOption[];
  user: UserProfile;
  onSaveReservation: (newReservation: Reservation) => void;
}

export const AdminReserveCourtModal: React.FC<AdminReserveCourtModalProps> = ({
  isOpen,
  onClose,
  courts,
  user,
  onSaveReservation,
}) => {
  const [selectedCourtId, setSelectedCourtId] = useState(courts[0]?.id || 'bb-1');
  const [reserveForType, setReserveForType] = useState<'student' | 'faculty' | 'varsity'>('student');
  const [beneficiaryName, setBeneficiaryName] = useState('Mateo Santos');
  const [beneficiaryId, setBeneficiaryId] = useState('20240412-M');
  const [selectedDate, setSelectedDate] = useState('2025-10-24');
  const [timeSlot, setTimeSlot] = useState('02:00 PM – 03:00 PM');
  const [equipmentBalls, setEquipmentBalls] = useState(2);
  const [notes, setNotes] = useState('Admin scheduled via Facility Desk');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const court = courts.find((c) => c.id === selectedCourtId) || courts[0];

    // Format human-readable date
    let dateStr = selectedDate;
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        dateStr = d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      // fallback
    }

    const sportLabel = court.type === 'volleyball' ? 'Volleyballs' : 'Basketballs';

    const newRes: Reservation = {
      id: `ADM-${Date.now().toString().slice(-4)}`,
      docket: `#CRS-ADM-${Math.floor(Math.random() * 9000 + 1000)}`,
      courtName: court.name,
      courtSub: court.subLocation,
      facilityDetail: `${court.name} • ${court.badge}`,
      dateStr,
      isoDate: selectedDate,
      timeSlot,
      equipmentSummary: equipmentBalls > 0 ? `${equipmentBalls} ${sportLabel}` : 'None Requested',
      equipmentDetails: equipmentBalls > 0 ? [{ name: sportLabel, qty: equipmentBalls }] : [],
      checkInLocation: 'Main Desk • Turnstile 1',
      status: reserveForType === 'varsity' ? 'Blocked / Varsity' : 'Confirmed',
      studentName: beneficiaryName.trim() || user.name,
      studentId: beneficiaryId.trim() || user.studentId,
      isCheckedIn: false,
      notes: notes.trim(),
    };

    onSaveReservation(newRes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111d24]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        id="admin-reserve-modal-container"
        className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl z-10 border border-[#ddeaf3] space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ddeaf3]">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#466271]">
              <span className="material-symbols-outlined text-[16px] text-[#2d4055]">
                edit_calendar
              </span>
              <span>Facility Administration Desk</span>
            </div>
            <h3 className="font-headline text-xl font-bold text-[#2d4055] tracking-tight">
              Schedule / Reserve Court Slot
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#f5faff] hover:bg-[#e3f0f9] flex items-center justify-center text-[#466271] hover:text-[#2d4055] transition-colors border border-[#ddeaf3]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Reservation Beneficiary Type */}
          <div>
            <label className="font-bold text-[#2d4055] block mb-1">
              Reservation Authority / Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setReserveForType('student');
                  setBeneficiaryName('Mateo Santos');
                  setBeneficiaryId('20240412-M');
                }}
                className={`py-2 rounded-xl font-semibold border transition-all text-center ${
                  reserveForType === 'student'
                    ? 'bg-[#2d4055] text-white border-[#2d4055] shadow-xs'
                    : 'bg-[#f5faff] text-[#466271] border-[#ddeaf3] hover:bg-[#e3f0f9]'
                }`}
              >
                Student Athlete
              </button>
              <button
                type="button"
                onClick={() => {
                  setReserveForType('varsity');
                  setBeneficiaryName('Varsity Team Practice');
                  setBeneficiaryId('VARSITY-T1');
                }}
                className={`py-2 rounded-xl font-semibold border transition-all text-center ${
                  reserveForType === 'varsity'
                    ? 'bg-[#2d4055] text-white border-[#2d4055] shadow-xs'
                    : 'bg-[#f5faff] text-[#466271] border-[#ddeaf3] hover:bg-[#e3f0f9]'
                }`}
              >
                Varsity Practice
              </button>
              <button
                type="button"
                onClick={() => {
                  setReserveForType('faculty');
                  setBeneficiaryName('Faculty Recreation League');
                  setBeneficiaryId('FACULTY-REC');
                }}
                className={`py-2 rounded-xl font-semibold border transition-all text-center ${
                  reserveForType === 'faculty'
                    ? 'bg-[#2d4055] text-white border-[#2d4055] shadow-xs'
                    : 'bg-[#f5faff] text-[#466271] border-[#ddeaf3] hover:bg-[#e3f0f9]'
                }`}
              >
                Faculty / Staff
              </button>
            </div>
          </div>

          {/* Beneficiary Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#2d4055] block mb-1">Booked On Behalf Of</label>
              <input
                type="text"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                required
                placeholder="Student or Team Name"
                className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] text-xs font-semibold text-[#2d4055] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d4055]"
              />
            </div>
            <div>
              <label className="font-bold text-[#2d4055] block mb-1">Student / Team ID</label>
              <input
                type="text"
                value={beneficiaryId}
                onChange={(e) => setBeneficiaryId(e.target.value)}
                required
                placeholder="e.g. 20240412-M"
                className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] text-xs font-mono text-[#2d4055] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d4055]"
              />
            </div>
          </div>

          {/* Court Selection */}
          <div>
            <label className="font-bold text-[#2d4055] block mb-1">Target Court Arena</label>
            <select
              value={selectedCourtId}
              onChange={(e) => setSelectedCourtId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] text-xs font-semibold text-[#2d4055] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d4055]"
            >
              {courts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.badge}) • {c.subLocation}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#2d4055] block mb-1">
                Reservation Date
              </label>
              <DatePicker
                id="admin-reserve-datepicker"
                value={selectedDate}
                onChange={(iso) => setSelectedDate(iso)}
              />
            </div>
            <div>
              <label className="font-bold text-[#2d4055] block mb-1">Session Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] text-xs font-semibold text-[#2d4055] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d4055]"
              >
                <option value="08:00 AM – 09:00 AM">08:00 AM – 09:00 AM (Early Session)</option>
                <option value="09:00 AM – 10:00 AM">09:00 AM – 10:00 AM (Morning Session)</option>
                <option value="10:00 AM – 11:00 AM">10:00 AM – 11:00 AM (Midday Session)</option>
                <option value="01:00 PM – 02:00 PM">01:00 PM – 02:00 PM (Afternoon Early)</option>
                <option value="02:00 PM – 03:00 PM">02:00 PM – 03:00 PM (Afternoon Standard)</option>
                <option value="03:00 PM – 04:00 PM">03:00 PM – 04:00 PM (Peak Session)</option>
                <option value="04:00 PM – 05:00 PM">04:00 PM – 05:00 PM (Varsity Peak)</option>
                <option value="07:00 PM – 08:00 PM">07:00 PM – 08:00 PM (Evening Session)</option>
              </select>
            </div>
          </div>

          {/* Equipment Loan Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#2d4055] block mb-1">Equipment Balls Loan</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEquipmentBalls((b) => Math.max(0, b - 1))}
                  className="w-8 h-8 rounded-lg bg-[#e3f0f9] text-[#2d4055] font-bold flex items-center justify-center hover:bg-[#d0e6f5] border border-[#ddeaf3]"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-sm text-[#2d4055]">
                  {equipmentBalls}
                </span>
                <button
                  type="button"
                  onClick={() => setEquipmentBalls((b) => Math.min(10, b + 1))}
                  className="w-8 h-8 rounded-lg bg-[#2d4055] text-white font-bold flex items-center justify-center hover:bg-[#111d24]"
                >
                  +
                </button>
                <span className="text-[11px] text-[#466271] ml-1">Official Equipment</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#2d4055] block mb-1">Administrative Note</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason or instructions"
                className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] text-xs text-[#2d4055] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d4055]"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-[#ddeaf3] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#466271] hover:bg-[#f5faff] transition-colors border border-[#ddeaf3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="admin-confirm-reserve-btn"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2d4055] text-white hover:bg-[#111d24] transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Confirm &amp; Issue Docket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
