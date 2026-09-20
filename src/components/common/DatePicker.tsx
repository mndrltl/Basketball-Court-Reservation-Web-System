import React, { useState } from 'react';

interface DatePickerProps {
  value: string; // ISO date 'YYYY-MM-DD'
  onChange: (isoDate: string, formattedLabel: string) => void;
  id?: string;
  minDate?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  id = 'unified-date-picker',
  minDate,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse incoming value
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(
    isNaN(initialDate.getTime()) ? new Date().getFullYear() : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    isNaN(initialDate.getTime()) ? new Date().getMonth() : initialDate.getMonth()
  );

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to format ISO to nice label
  const formatLabel = (iso: string) => {
    try {
      const parts = iso.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      // fallback
    }
    return iso;
  };

  // Days calculations
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  // Convert so Monday is 0, Sunday is 6
  const startOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const newIso = `${viewYear}-${monthStr}-${dayStr}`;
    const label = formatLabel(newIso);
    onChange(newIso, label);
    setIsOpen(false);
  };

  // Active day check
  const isSelected = (day: number) => {
    if (!value) return false;
    const parts = value.split('-');
    if (parts.length !== 3) return false;
    return (
      Number(parts[0]) === viewYear &&
      Number(parts[1]) - 1 === viewMonth &&
      Number(parts[2]) === day
    );
  };

  return (
    <div className={`relative inline-block w-full ${className}`} id={`${id}-wrapper`}>
      {/* Trigger / Display Input */}
      <div
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#ddeaf3] bg-white hover:bg-[#f5faff] cursor-pointer transition-all shadow-2xs group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="material-symbols-outlined text-[#2d4055] text-[18px] group-hover:scale-110 transition-transform">
            calendar_month
          </span>
          <span className="text-xs font-semibold text-[#2d4055] truncate">
            {value ? formatLabel(value) : 'Select target date...'}
          </span>
        </div>
        <span className="material-symbols-outlined text-[#74777d] text-[18px]">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </div>

      {/* Popover Calendar Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            id={`${id}-dropdown`}
            className="absolute left-0 mt-2 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-[#ddeaf3] p-4 text-xs animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header: Month / Year + Navigation */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#ddeaf3]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#466271] block">
                  Calendar Schedule
                </span>
                <span className="font-headline font-bold text-sm text-[#2d4055]">
                  {monthNames[viewMonth]} {viewYear}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-7 h-7 rounded-lg bg-[#f5faff] hover:bg-[#e3f0f9] text-[#2d4055] flex items-center justify-center border border-[#ddeaf3] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-7 h-7 rounded-lg bg-[#f5faff] hover:bg-[#e3f0f9] text-[#2d4055] flex items-center justify-center border border-[#ddeaf3] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[#466271] text-[11px] mb-1.5">
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
              <span>Su</span>
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {/* Empty leading offsets */}
              {[...Array(startOffset)].map((_, i) => (
                <div key={`empty-${i}`} className="py-2 text-[#c4c6cd]" />
              ))}

              {/* Month Days */}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const active = isSelected(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`py-1.5 rounded-lg font-medium transition-all ${
                      active
                        ? 'bg-[#2d4055] text-white font-bold shadow-xs ring-2 ring-[#2d4055]/30'
                        : 'bg-[#f5faff] text-[#2d4055] hover:bg-[#e3f0f9]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Quick Today Shortcut */}
            <div className="mt-3 pt-2.5 border-t border-[#ddeaf3] flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const monthStr = String(today.getMonth() + 1).padStart(2, '0');
                  const dayStr = String(today.getDate()).padStart(2, '0');
                  const todayIso = `${today.getFullYear()}-${monthStr}-${dayStr}`;
                  onChange(todayIso, formatLabel(todayIso));
                  setIsOpen(false);
                }}
                className="text-[#2d4055] font-semibold hover:underline"
              >
                Today
              </button>
              <span className="text-[#74777d]">Academic Term 2025-2026</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
