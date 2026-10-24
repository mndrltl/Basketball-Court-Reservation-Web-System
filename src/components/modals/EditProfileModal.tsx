import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { UserAvatar } from '../UserAvatar';

interface EditProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<UserProfile>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [studentId, setStudentId] = useState(user.studentId);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [eligibility, setEligibility] = useState(user.eligibility);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      studentId: studentId.trim(),
      email: email.trim(),
      role: role.trim(),
      eligibility: eligibility.trim(),
      avatarUrl: avatarUrl.trim() || user.avatarUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111d24]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        id="edit-profile-modal-container"
        className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl z-10 border border-[#ddeaf3] space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ddeaf3]">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#466271]">
              <span className="material-symbols-outlined text-[16px] text-[#2d4055]">
                manage_accounts
              </span>
              <span>{user.isAdmin ? 'Admin Credentials' : 'Athletic ID Card'}</span>
            </div>
            <h3 className="font-headline text-xl font-bold text-[#2d4055] tracking-tight">
              Edit {user.isAdmin ? 'Administrator' : 'Student'} Profile
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

        {/* Current Avatar Preview */}
        <div className="flex items-center gap-4 p-3 bg-[#f5faff] rounded-xl border border-[#ddeaf3]">
          <div className="relative shrink-0">
            <UserAvatar
              src={avatarUrl || user.avatarUrl}
              alt={name}
              className="w-14 h-14 rounded-full ring-2 ring-[#44576d]/30"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#44576d] ring-2 ring-white" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-[#2d4055] block truncate">{name}</span>
            <span className="text-[11px] text-[#466271] font-mono block">{studentId}</span>
            <span className="text-[10px] text-[#74777d] block truncate">{email}</span>
          </div>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#2d4055] block mb-1">Full Legal Name</label>
              <input
                type="text"
                id="profile-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] text-xs font-medium text-[#2d4055] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d4055]"
              />
            </div>

            <div>
              <label className="font-bold text-[#2d4055] block mb-1">
                {user.isAdmin ? 'Staff / Faculty ID' : 'Institutional Student ID'}
              </label>
              <input
                type="text"
                id="profile-id-input"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                placeholder={user.isAdmin ? 'e.g. FAC-70192' : 'e.g. 20240396-C'}
                pattern={user.isAdmin ? undefined : '^\\d{8}-[A-Za-z]$'}
                title={user.isAdmin ? 'Staff ID' : 'Student ID format: 8 digits, hyphen, single letter (e.g. 20240396-C)'}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] text-xs font-mono uppercase text-[#2d4055] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d4055]"
              />
              {!user.isAdmin && (
                <span className="text-[10px] text-[#466271] block mt-0.5">
                  Format: 8 digits, hyphen, letter (e.g. <span className="font-mono font-semibold">20240396-C</span>)
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#2d4055] block mb-1">Institutional Email</label>
              <input
                type="email"
                id="profile-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] text-xs font-medium text-[#2d4055] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d4055]"
              />
            </div>

            <div>
              <label className="font-bold text-[#2d4055] block mb-1">Athletic / Campus Role</label>
              <input
                type="text"
                id="profile-role-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] text-xs font-medium text-[#2d4055] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d4055]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#2d4055] block mb-1">Facility Eligibility</label>
              <select
                id="profile-eligibility-select"
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] text-xs font-medium text-[#2d4055] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d4055]"
              >
                <option value="Active Full Member">Active Full Member</option>
                <option value="Varsity Athlete">Varsity Athlete</option>
                <option value="Faculty / Facility Staff">Faculty / Facility Staff</option>
                <option value="Intramural Captain">Intramural Captain</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#2d4055] block mb-1">Avatar Image URL</label>
              <input
                type="url"
                id="profile-avatar-input"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-[#ddeaf3] text-xs text-[#2d4055] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d4055]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#ddeaf3] flex items-center justify-end gap-2.5">
            <button
              type="button"
              id="cancel-profile-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#466271] hover:bg-[#f5faff] transition-colors border border-[#ddeaf3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-profile-btn"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2d4055] text-white hover:bg-[#111d24] transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
