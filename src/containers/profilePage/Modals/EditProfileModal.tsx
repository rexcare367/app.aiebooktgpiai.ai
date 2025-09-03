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
          <div className="form-group">
            <label htmlFor="icNumber">IC Number:</label>
            <input
              type="text"
              id="icNumber"
              name="icNumber"
              value={editedProfile.icNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-Mail:</label>
            <input type="email" id="email" name="email" value={editedProfile.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="guardianName">Guardian Name:</label>
            <input
              type="text"
              id="guardianName"
              name="guardianName"
              value={editedProfile.guardianName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="fullName">Full Name:</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={editedProfile.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={editedProfile.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={editedProfile.address}
              onChange={handleChange}
              required
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

