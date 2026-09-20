import React from 'react';
import { Reservation, UserProfile } from '../../types';

interface DigitalPassModalProps {
  reservation: Reservation | null;
  user: UserProfile;
  onClose: () => void;
}

export const DigitalPassModal: React.FC<DigitalPassModalProps> = ({
  reservation,
  user,
  onClose,
}) => {
  if (!reservation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#263239]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-[#ddeaf3] z-10">
        {/* Pass Top Banner */}
        <div className="bg-[#2d4055] text-white p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-[#c9e7f8]">
                verified_user
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c9e7f8]">
                University Athletics Pass
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <h3 className="font-headline font-bold text-xl text-white">
                {reservation.courtName}
              </h3>
              <p className="text-xs text-[#b9cce6]">{reservation.courtSub}</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#c9e7f8] text-[#001e2b] text-xs font-bold uppercase tracking-wider">
              {reservation.status}
            </span>
          </div>
        </div>

        {/* Pass Body Content */}
        <div className="p-6 space-y-4 bg-[#f5faff]">
          {/* Holder & Keycard Meta */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-white rounded-xl border border-[#ddeaf3] shadow-xs">
            <div>
              <span className="text-[11px] font-semibold text-[#466271] uppercase block">
                Authorized Passholder
              </span>
              <span className="font-bold text-sm text-[#111d24]">
                {reservation.studentName || user.name}
              </span>
              <span className="text-xs text-[#74777d] block font-mono">
                {reservation.studentId || user.studentId}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#466271] uppercase block">
                Access Gate
              </span>
              <span className="font-bold text-sm text-[#2d4055]">Gate 2B • East Wing</span>
              <span className="text-xs text-[#466271] block">
                {reservation.checkInLocation}
              </span>
            </div>
          </div>

          {/* Schedule & Equipment */}
          <div className="p-3.5 bg-white rounded-xl border border-[#ddeaf3] space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#466271]">Scheduled Slot:</span>
              <span className="font-semibold text-[#2d4055]">{reservation.dateStr}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#466271]">Session Window:</span>
              <span className="font-bold text-[#2d4055]">{reservation.timeSlot}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#e3f0f9]">
              <span className="text-[#466271]">Loaned Equipment:</span>
              <span className="font-semibold text-[#2d4055]">
                {reservation.equipmentSummary}
              </span>
            </div>
          </div>

          {/* Simulated High-Res Barcode / Keycard sync */}
          <div className="p-4 bg-white rounded-xl border border-[#ddeaf3] flex flex-col items-center justify-center space-y-2 text-center shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-[#466271]">
              <span className="w-2 h-2 rounded-full bg-[#2d4055] animate-pulse" />
              <span>NFC / RFID Digital Keycard Active</span>
            </div>

            {/* Visual Barcode Bars */}
            <div className="w-full flex items-center justify-center gap-[2.5px] h-12 py-1 px-4 bg-[#f5faff] rounded">
              {[4, 2, 6, 3, 1, 5, 2, 4, 7, 2, 3, 5, 2, 6, 3, 1, 4, 6, 2, 5, 3, 6, 2, 4, 3, 7, 2, 4, 6, 3].map(
                (h, idx) => (
                  <div
                    key={idx}
                    className="bg-[#2d4055] rounded-full"
                    style={{
                      height: `${h * 4 + 14}px`,
                      width: idx % 3 === 0 ? '3px' : '2px',
                    }}
                  />
                )
              )}
            </div>
            <span className="font-mono text-xs font-semibold text-[#466271] tracking-widest">
              CRS-{reservation.id}-NFC{reservation.studentId.replace(/[^a-zA-Z0-9]/g, '')}
            </span>
          </div>

          {/* Operational Rule */}
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#e3f0f9] text-[#466271] text-xs">
            <span className="material-symbols-outlined text-base text-[#2d4055] shrink-0 mt-0.5">
              app_badging
            </span>
            <span>
              Tap your digital pass at Turnstile 2B or present this screen to the Control Desk 15 minutes before tip-off.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-[#ddeaf3] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              window.print();
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#2d4055] bg-[#e3f0f9] hover:bg-[#ddeaf3] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">print</span>
            Print Pass
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#44576d] hover:bg-[#2d4055] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
