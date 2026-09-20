import React, { useState } from 'react';
import { Reservation } from '../../types';

interface GatepassCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  onValidateCheckIn: (id: string) => void;
}

export const GatepassCheckerModal: React.FC<GatepassCheckerModalProps> = ({
  isOpen,
  onClose,
  reservations,
  onValidateCheckIn,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scanSimActive, setScanSimActive] = useState(false);
  const [verifiedPass, setVerifiedPass] = useState<Reservation | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchTerm.trim().toUpperCase();
    if (!query) return;

    setScanSimActive(true);
    setVerificationError(null);
    setVerifiedPass(null);

    setTimeout(() => {
      setScanSimActive(false);
      const match = reservations.find(
        (r) =>
          r.studentId.toUpperCase() === query ||
          r.docket.toUpperCase().includes(query) ||
          r.id.toUpperCase().includes(query) ||
          r.studentName.toUpperCase().includes(query)
      );

      if (match) {
        setVerifiedPass(match);
      } else {
        setVerificationError(`No matching active pass found for keycard query "${query}".`);
      }
    }, 400);
  };

  const handleInstantQuickCheck = (idOrDocket: string) => {
    setSearchTerm(idOrDocket);
    setScanSimActive(true);
    setVerificationError(null);
    setVerifiedPass(null);

    setTimeout(() => {
      setScanSimActive(false);
      const match = reservations.find(
        (r) =>
          r.studentId.toUpperCase() === idOrDocket.toUpperCase() ||
          r.docket.toUpperCase().includes(idOrDocket.toUpperCase())
      );
      if (match) {
        setVerifiedPass(match);
      } else {
        setVerificationError(`No pass found for "${idOrDocket}".`);
      }
    }, 300);
  };

  const handleConfirmAccess = () => {
    if (!verifiedPass) return;
    onValidateCheckIn(verifiedPass.id);
    setVerifiedPass((prev) => (prev ? { ...prev, isCheckedIn: true, status: 'In Progress' } : null));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111d24]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        id="gatepass-checker-modal-container"
        className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl z-10 border border-[#ddeaf3] space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ddeaf3]">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#466271]">
              <span className="material-symbols-outlined text-[16px] text-[#2d4055]">
                qr_code_scanner
              </span>
              <span>Facility Security &amp; Turnstile</span>
            </div>
            <h3 className="font-headline text-xl font-bold text-[#2d4055] tracking-tight">
              Gatepass Scanner &amp; Access Checker
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

        {/* Turnstile scanner input */}
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#2d4055] mb-1">
              Scan RFID Barcode, Docket Number, or Student ID
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#466271] text-[18px]">
                  contactless
                </span>
                <input
                  type="text"
                  id="gatepass-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. 20240396-C or #CRS-8849-25"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#ddeaf3] text-xs font-mono uppercase bg-[#f5faff] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d4055] text-[#2d4055]"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                id="gatepass-scan-btn"
                disabled={scanSimActive || !searchTerm.trim()}
                className="px-4 py-2 bg-[#2d4055] hover:bg-[#111d24] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                {scanSimActive ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      sync
                    </span>
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">search</span>
                    <span>Verify Pass</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#466271] pt-1">
            <span className="font-semibold text-[#74777d]">Quick Scan Demo Passes:</span>
            {reservations.slice(0, 3).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleInstantQuickCheck(r.studentId)}
                className="px-2.5 py-1 rounded-lg bg-[#e9f5ff] hover:bg-[#ddeaf3] text-[#2d4055] font-mono border border-[#ddeaf3] transition-colors"
              >
                {r.studentId} ({r.studentName.split(' ')[0]})
              </button>
            ))}
          </div>
        </form>

        {/* Verification result screen */}
        {verificationError && (
          <div className="p-4 rounded-xl bg-[#ffdad6]/60 border border-[#ba1a1a]/30 text-xs text-[#93000a] flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] shrink-0 text-[#ba1a1a]">
              error
            </span>
            <div className="min-w-0">
              <span className="font-bold block">Access Turnstile Denied</span>
              <span>{verificationError}</span>
            </div>
          </div>
        )}

        {verifiedPass && (
          <div className="p-4 rounded-xl bg-[#f5faff] border border-[#ddeaf3] space-y-3.5">
            {/* Pass status banner */}
            <div className="flex items-center justify-between pb-3 border-b border-[#ddeaf3]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2d4055] animate-pulse" />
                <span className="font-bold text-xs text-[#2d4055] uppercase tracking-wide">
                  Gate Access Validated
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#e3f0f9] text-[#2d4055] border border-[#ddeaf3]">
                {verifiedPass.docket}
              </span>
            </div>

            {/* Holder information */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-[#466271] uppercase tracking-wider block font-semibold">
                  Student Athlete
                </span>
                <span className="font-bold text-[#2d4055] text-sm block">
                  {verifiedPass.studentName}
                </span>
                <span className="font-mono text-[11px] text-[#466271]">
                  ID: {verifiedPass.studentId}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#466271] uppercase tracking-wider block font-semibold">
                  Authorized Arena
                </span>
                <span className="font-bold text-[#2d4055] text-sm block">
                  {verifiedPass.courtName}
                </span>
                <span className="text-[11px] text-[#466271] block">
                  {verifiedPass.courtSub}
                </span>
              </div>
            </div>

            {/* Timetable & equipment */}
            <div className="p-3 bg-white rounded-lg border border-[#ddeaf3] grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-[#74777d] uppercase font-semibold block">
                  Allocated Session
                </span>
                <span className="font-semibold text-[#2d4055]">{verifiedPass.timeSlot}</span>
                <span className="text-[11px] text-[#466271] block">{verifiedPass.dateStr}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#74777d] uppercase font-semibold block">
                  Equipment Pass
                </span>
                <span className="font-semibold text-[#2d4055] block">
                  {verifiedPass.equipmentSummary}
                </span>
                <span className="text-[11px] text-[#74777d]">Turnstile: Turnstile Gate A</span>
              </div>
            </div>

            {/* Barcode graphic */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-[#ddeaf3]">
              <div className="flex items-center gap-[2px] h-10 px-2">
                {[3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4, 2, 3, 1, 4, 2, 3].map(
                  (w, i) => (
                    <div
                      key={i}
                      className="bg-[#2d4055] h-full rounded-xs"
                      style={{ width: `${w * 1.6}px` }}
                    />
                  )
                )}
              </div>
              <span className="text-[10px] font-mono text-[#466271] mt-1">
                * GATEPASS-AUTH-{verifiedPass.id} *
              </span>
            </div>

            {/* Turnstile Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              {verifiedPass.isCheckedIn ? (
                <div className="w-full py-2 px-3 rounded-xl bg-[#e3f0f9] text-[#2d4055] text-xs font-semibold text-center border border-[#ddeaf3] flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#2d4055]">
                    task_alt
                  </span>
                  <span>Pass Already Checked-In &amp; Granted Turnstile Access</span>
                </div>
              ) : (
                <button
                  type="button"
                  id="grant-turnstile-access-btn"
                  onClick={handleConfirmAccess}
                  className="w-full py-2.5 px-4 bg-[#2d4055] hover:bg-[#111d24] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  <span>Grant Turnstile Entry &amp; Mark Checked In</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#466271] hover:bg-[#f5faff] transition-colors border border-[#ddeaf3]"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
