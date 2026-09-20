import React, { useState } from 'react';
import { Reservation } from '../../types';
import { DatePicker } from '../common/DatePicker';

interface EditReservationModalProps {
  reservation: Reservation;
  onClose: () => void;
  onSave: (updated: Partial<Reservation>) => void;
}

export const EditReservationModal: React.FC<EditReservationModalProps> = ({
  reservation,
  onClose,
  onSave,
}) => {
  const [selectedCourt, setSelectedCourt] = useState(
    reservation.courtName.includes('Volleyball')
      ? 'Volleyball Court 1 (North Pavilion)'
      : 'Basketball Court 1 (East Gymnasium)'
  );
  const [selectedDate, setSelectedDate] = useState(reservation.isoDate || '2025-10-24');
  const [selectedSlot, setSelectedSlot] = useState(reservation.timeSlot);
  const [ballCount, setBallCount] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const courtClean = selectedCourt.split(' (')[0];
    const subClean = selectedCourt.includes('East')
      ? 'East Wing, Hardwood Arena'
      : selectedCourt.includes('West')
      ? 'West Wing, Main Fieldhouse'
      : 'South Pavilion, Olympic Net';

    // Format readable date
    let dateFormatted = selectedDate;
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        dateFormatted = d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      // fallback
    }

    onSave({
      courtName: courtClean,
      courtSub: subClean,
      dateStr: dateFormatted,
      isoDate: selectedDate,
      timeSlot: selectedSlot,
      equipmentSummary:
        ballCount > 0 ? `${ballCount} Official Basketballs` : 'None Requested',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#263239]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-xl space-y-4 z-10 border border-[#ddeaf3]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#466271]">
              Reservation Modification
            </span>
            <h3 className="font-headline text-xl font-bold text-[#2d4055] tracking-tight">
              Edit Court Reservation
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#e3f0f9] flex items-center justify-center text-[#466271] hover:text-[#2d4055] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-[#466271]">
              Court Selection
            </label>
            <div className="relative">
              <select
                id="edit-court"
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="w-full h-11 px-3 bg-[#e9f5ff] rounded-lg text-sm text-[#2d4055] font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[#44576d] pr-10 border border-[#ddeaf3]"
              >
                <option value="Basketball Court 1 (East Gymnasium)">
                  Basketball Court 1 (East Gymnasium)
                </option>
                <option value="Basketball Court 2 (East Gymnasium)">
                  Basketball Court 2 (East Gymnasium)
                </option>
                <option value="Volleyball Court 1 (North Pavilion)">
                  Volleyball Court 1 (North Pavilion)
                </option>
                <option value="Volleyball Court 2 (North Pavilion)">
                  Volleyball Court 2 (North Pavilion)
                </option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-3 text-[#466271] text-[20px]">
                expand_more
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-[#466271]">
                Date
              </label>
              <DatePicker
                id="edit-reservation-datepicker"
                value={selectedDate}
                onChange={(iso) => setSelectedDate(iso)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-[#466271]">
                Time Slot
              </label>
              <div className="relative">
                <select
                  id="edit-slot"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full h-11 px-3 bg-[#e9f5ff] rounded-lg text-sm text-[#2d4055] font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[#44576d] pr-10 border border-[#ddeaf3]"
                >
                  <option value="02:00 PM – 03:00 PM">02:00 PM – 03:00 PM</option>
                  <option value="03:00 PM – 04:00 PM">03:00 PM – 04:00 PM</option>
                  <option value="04:00 PM – 05:00 PM">04:00 PM – 05:00 PM</option>
                  <option value="05:00 PM – 06:00 PM">05:00 PM – 06:00 PM</option>
                  <option value="06:00 PM – 07:00 PM">06:00 PM – 07:00 PM</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-3 text-[#466271] text-[20px]">
                  schedule
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-[#466271]">
              Equipment Check-Out Counter
            </label>
            <div className="flex items-center justify-between p-3 bg-[#e9f5ff] rounded-lg border border-[#ddeaf3]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#44576d] text-[22px]">
                  sports_basketball
                </span>
                <div>
                  <span className="text-sm font-semibold text-[#2d4055] block">
                    Official Game Basketballs
                  </span>
                  <span className="text-xs text-[#466271]">Max 4 balls per reservation</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBallCount((c) => Math.max(0, c - 1))}
                  className="w-8 h-8 rounded bg-white text-[#2d4055] font-bold hover:bg-[#c9e7f8] flex items-center justify-center border border-[#ddeaf3] shadow-xs"
                >
                  -
                </button>
                <span className="w-8 text-center font-headline font-bold text-base text-[#2d4055]">
                  {ballCount}
                </span>
                <button
                  type="button"
                  onClick={() => setBallCount((c) => Math.min(4, c + 1))}
                  className="w-8 h-8 rounded bg-white text-[#2d4055] font-bold hover:bg-[#c9e7f8] flex items-center justify-center border border-[#ddeaf3] shadow-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#ddeaf3]/60 flex items-start gap-2 text-[#466271] text-xs">
            <span className="material-symbols-outlined text-[18px] text-[#2d4055] shrink-0">
              info
            </span>
            <span>
              Changes are subject to court slot availability. Existing locker hall codes will remain valid.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-[#466271] hover:bg-[#e3f0f9] transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#44576d] text-white hover:bg-[#2d4055] transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
