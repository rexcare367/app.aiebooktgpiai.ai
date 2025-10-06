import React, { useState } from "react";

interface ProfileData {
  icNumber: string;
  email: string;
  guardianName: string;
  fullName: string;
  phoneNumber: string;
  address: string;
}

interface EditProfileModalProps {
  profile: ProfileData;
  onSave: (updatedProfile: ProfileData) => void;
  onClose: () => void;
}

export function EditProfileModal({ profile, onSave, onClose }: EditProfileModalProps) {
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedProfile);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="icNumber" className="text-base md:text-lg font-medium" style={{ color: 'var(--text-color-2)' }}>IC Number:</label>
            <input
              type="text"
              id="icNumber"
              name="icNumber"
              value={editedProfile.icNumber}
              onChange={handleChange}
              required
              className="w-full rounded-xl px-4 py-2 text-sm leading-tight border transition-all duration-200 focus:outline-none focus:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              style={{ 
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                caretColor: 'var(--active-theme-color)'
              }}
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="email" className="text-base md:text-lg font-medium" style={{ color: 'var(--text-color-2)' }}>E-Mail:</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={editedProfile.email} 
              onChange={handleChange} 
              required 
              className="w-full rounded-xl px-4 py-2 text-sm leading-tight border transition-all duration-200 focus:outline-none focus:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              style={{ 
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                caretColor: 'var(--active-theme-color)'
              }}
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="guardianName" className="text-base md:text-lg font-medium" style={{ color: 'var(--text-color-2)' }}>Guardian Name:</label>
            <input
              type="text"
              id="guardianName"
              name="guardianName"
              value={editedProfile.guardianName}
              onChange={handleChange}
              required
              className="w-full rounded-xl px-4 py-2 text-sm leading-tight border transition-all duration-200 focus:outline-none focus:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              style={{ 
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                caretColor: 'var(--active-theme-color)'
              }}
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="fullName" className="text-base md:text-lg font-medium" style={{ color: 'var(--text-color-2)' }}>Full Name:</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={editedProfile.fullName}
              onChange={handleChange}
              required
              className="w-full rounded-xl px-4 py-2 text-sm leading-tight border transition-all duration-200 focus:outline-none focus:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              style={{ 
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                caretColor: 'var(--active-theme-color)'
              }}
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="phoneNumber" className="text-base md:text-lg font-medium" style={{ color: 'var(--text-color-2)' }}>Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={editedProfile.phoneNumber}
              onChange={handleChange}
              required
              className="w-full rounded-xl px-4 py-2 text-sm leading-tight border transition-all duration-200 focus:outline-none focus:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              style={{ 
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                caretColor: 'var(--active-theme-color)'
              }}
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="address" className="text-base md:text-lg font-medium" style={{ color: 'var(--text-color-2)' }}>Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={editedProfile.address}
              onChange={handleChange}
              required
              className="w-full rounded-xl px-4 py-2 text-sm leading-tight border transition-all duration-200 focus:outline-none focus:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              style={{ 
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                caretColor: 'var(--active-theme-color)'
              }}
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="save-btn">
              Save
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

