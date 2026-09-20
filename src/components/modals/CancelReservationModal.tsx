import React from 'react';
import { Reservation } from '../../types';

interface CancelReservationModalProps {
  reservation: Reservation;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelReservationModal: React.FC<CancelReservationModalProps> = ({
  reservation,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#263239]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl max-w-md w-full p-6 sm:p-8 shadow-xl space-y-4 z-10 border border-[#ddeaf3]">
        <div className="w-12 h-12 rounded-xl bg-[#ddeaf3] text-[#2d4055] flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]">event_busy</span>
        </div>

        <div className="space-y-1">
          <h3 className="font-headline text-xl font-bold text-[#2d4055] tracking-tight">
            Cancel Reservation?
          </h3>
          <p className="text-sm text-[#466271] leading-relaxed">
            Are you sure you want to cancel your reservation for{' '}
            <strong className="text-[#2d4055] font-semibold">{reservation.courtName}</strong> on{' '}
            <strong className="text-[#2d4055] font-semibold">
              {reservation.dateStr} at {reservation.timeSlot.split(' – ')[0]}
            </strong>
            ?
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-[#e9f5ff] text-[#466271] text-xs space-y-1 border border-[#ddeaf3]">
          <div className="flex items-center gap-1.5 text-[#2d4055] font-semibold">
            <span className="material-symbols-outlined text-[16px]">release_alert</span>
            Collegiate Reallocation Notice
          </div>
          <p>
            This slot will immediately open for other students and recreation groups on the university athletic timetable.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold text-[#466271] hover:bg-[#e3f0f9] transition-colors text-center"
          >
            Keep Reservation
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold bg-[#2d4055] text-white hover:bg-[#263239] transition-colors text-center shadow-sm"
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};
