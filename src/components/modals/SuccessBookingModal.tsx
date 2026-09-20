import React from 'react';
import { Reservation } from '../../types';

interface SuccessBookingModalProps {
  reservation: Reservation;
  onClose: () => void;
  onViewPass: () => void;
}

export const SuccessBookingModal: React.FC<SuccessBookingModalProps> = ({
  reservation,
  onClose,
  onViewPass,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#263239]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
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
          Your slot for <strong className="text-[#2d4055]">{reservation.courtName}</strong> on{' '}
          <span className="text-[#2d4055] font-semibold">
            {reservation.dateStr} ({reservation.timeSlot})
          </span>{' '}
          has been reserved.
        </p>

        <div className="my-5 p-4 rounded-xl bg-[#e9f5ff] text-left space-y-2 border border-[#ddeaf3]">
          <div className="flex justify-between text-xs">
            <span className="text-[#466271]">Authorized Holder:</span>
            <span className="font-semibold text-[#2d4055]">
              {reservation.studentName} ({reservation.studentId})
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#466271]">Equipment Checkout:</span>
            <span className="font-semibold text-[#2d4055]">{reservation.equipmentSummary}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#466271]">Access Gate:</span>
            <span className="font-semibold text-[#2d4055]">East Wing Arena Gate 2B</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onViewPass}
            className="w-full py-2.5 rounded-lg bg-[#44576d] text-white text-sm font-semibold hover:bg-[#2d4055] transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">badge</span>
            <span>View Digital Keycard Pass</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-[#e3f0f9] text-[#2d4055] text-sm font-semibold hover:bg-[#ddeaf3] transition-all"
          >
            Done • Return to Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
