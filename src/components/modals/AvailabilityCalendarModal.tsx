import React, { useState } from 'react';
import { DatePicker } from '../common/DatePicker';

interface AvailabilityCalendarModalProps {
  onClose: () => void;
  onBookCourt: (courtName: string, timeSlot: string) => void;
}

export const AvailabilityCalendarModal: React.FC<AvailabilityCalendarModalProps> = ({
  onClose,
  onBookCourt,
}) => {
  const [selectedSport, setSelectedSport] = useState<'all' | 'basketball' | 'volleyball'>('all');
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>('2025-10-24');
  const [formattedDateLabel, setFormattedDateLabel] = useState<string>('Fri, Oct 24, 2025');

  const courts = [
    { id: 'bb1', name: 'Basketball Court 1 (Main Hardwood)', type: 'basketball' },
    { id: 'bb2', name: 'Basketball Court 2 (West Wing Quad)', type: 'basketball' },
    { id: 'bb3', name: 'Basketball Court 3 (Training Annex)', type: 'basketball' },
    { id: 'vb1', name: 'Volleyball Court 1 (South Pavilion)', type: 'volleyball' },
    { id: 'vb2', name: 'Volleyball Court 2 (North Pavilion)', type: 'volleyball' },
  ];

  const timeSlots = [
    '08:00 AM',
    '10:00 AM',
    '12:00 PM',
    '02:00 PM',
    '04:00 PM',
    '06:00 PM',
    '08:00 PM',
  ];

  // Schedule mock matrix
  const getSlotStatus = (courtId: string, slotIdx: number) => {
    if (courtId === 'bb1' && slotIdx === 4) return 'current';
    if ((courtId === 'bb1' && slotIdx === 3) || (courtId === 'bb2' && slotIdx === 5)) return 'reserved';
    if (slotIdx === 6) return 'peak';
    if (courtId === 'vb1' && slotIdx === 2) return 'reserved';
    return 'open';
  };

  const filteredCourts =
    selectedSport === 'all'
      ? courts
      : courts.filter((c) => c.type === selectedSport);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111d24]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        id="availability-modal-container"
        className="relative bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl z-10 border border-[#ddeaf3] max-h-[90vh] flex flex-col space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ddeaf3]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#466271] uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px] text-[#2d4055]">
                calendar_month
              </span>
              <span>Live Arena Timetable</span>
            </div>
            <h3 className="font-headline text-2xl font-bold text-[#2d4055] tracking-tight">
              Court Availability Matrix
            </h3>
            <p className="text-xs text-[#466271]">
              Real-time operational status for {formattedDateLabel}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Global DatePicker Dropdown */}
            <div className="w-48">
              <DatePicker
                id="availability-date-picker"
                value={selectedIsoDate}
                onChange={(iso, label) => {
                  setSelectedIsoDate(iso);
                  setFormattedDateLabel(label);
                }}
              />
            </div>

            <div className="inline-flex p-1 bg-[#e3f0f9] rounded-xl text-xs font-semibold border border-[#ddeaf3]">
              <button
                type="button"
                onClick={() => setSelectedSport('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedSport === 'all'
                    ? 'bg-[#2d4055] text-white shadow-xs'
                    : 'text-[#466271] hover:text-[#2d4055]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedSport('basketball')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedSport === 'basketball'
                    ? 'bg-[#2d4055] text-white shadow-xs'
                    : 'text-[#466271] hover:text-[#2d4055]'
                }`}
              >
                Basketball
              </button>
              <button
                type="button"
                onClick={() => setSelectedSport('volleyball')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedSport === 'volleyball'
                    ? 'bg-[#2d4055] text-white shadow-xs'
                    : 'text-[#466271] hover:text-[#2d4055]'
                }`}
              >
                Volleyball
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#f5faff] hover:bg-[#e3f0f9] flex items-center justify-center text-[#466271] hover:text-[#2d4055] border border-[#ddeaf3] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#466271]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#e9f5ff] border border-[#ddeaf3]" />
              Open / Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#2d4055]" />
              In Progress / Booked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#ddeaf3] border border-[#c4c6cd]" />
              Reserved
            </span>
          </div>
          <span className="text-[11px] text-[#74777d]">Click any open slot to reserve immediately</span>
        </div>

        {/* Schedule Grid Table */}
        <div className="overflow-x-auto flex-1 my-2 border border-[#ddeaf3] rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f5faff] text-[#2d4055] font-semibold border-b border-[#ddeaf3]">
                <th className="py-3 px-4 min-w-[200px]">Facility / Arena</th>
                {timeSlots.map((slot) => (
                  <th key={slot} className="py-3 px-3 text-center min-w-[90px]">
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ddeaf3]">
              {filteredCourts.map((court) => (
                <tr key={court.id} className="hover:bg-[#f5faff] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#2d4055]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-[#2d4055]">
                        {court.type === 'basketball' ? 'sports_basketball' : 'sports_volleyball'}
                      </span>
                      <span>{court.name}</span>
                    </div>
                  </td>
                  {timeSlots.map((slot, sIdx) => {
                    const status = getSlotStatus(court.id, sIdx);
                    if (status === 'current') {
                      return (
                        <td key={slot} className="py-2 px-2 text-center">
                          <span className="inline-block px-2 py-1.5 rounded-lg bg-[#2d4055] text-white font-semibold text-[11px] shadow-xs">
                            Active Slot
                          </span>
                        </td>
                      );
                    }
                    if (status === 'reserved') {
                      return (
                        <td key={slot} className="py-2 px-2 text-center">
                          <span className="inline-block px-2 py-1 rounded bg-[#ddeaf3] text-[#466271] text-[11px]">
                            Reserved
                          </span>
                        </td>
                      );
                    }
                    if (status === 'peak') {
                      return (
                        <td key={slot} className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              onBookCourt(court.name.split(' (')[0], `${slot} – 09:00 PM`);
                            }}
                            className="px-2 py-1.5 rounded-lg bg-[#e3f0f9] text-[#2d4055] hover:bg-[#d0e6f5] font-semibold text-[11px] transition-colors w-full border border-[#ddeaf3]"
                          >
                            Peak Slot
                          </button>
                        </td>
                      );
                    }
                    return (
                      <td key={slot} className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            onBookCourt(court.name.split(' (')[0], `${slot} – 05:00 PM`);
                          }}
                          className="px-2 py-1.5 rounded-lg bg-[#f5faff] text-[#2d4055] hover:bg-[#e3f0f9] font-semibold text-[11px] transition-colors border border-[#ddeaf3] w-full"
                        >
                          Open
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t border-[#ddeaf3] flex items-center justify-between text-xs text-[#466271]">
          <span>Tip: Collegiate varsity teams practice from 1:00 PM – 2:00 PM daily.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#2d4055] text-white text-xs font-semibold hover:bg-[#111d24] transition-colors shadow-xs"
          >
            Close Timetable
          </button>
        </div>
      </div>
    </div>
  );
};
