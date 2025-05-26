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
    <div className="profile-infomation-modal-overlay fixed top-0 left-0 right-0 flex justify-center items-center
  ">
      <div className="profile-infomation-modal p-8 bg-white max-w-[500px] w-[90%] rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="form-group flex flex-col gap-4">
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
            <button type="submit" className="save-btn bg-primary hover:bg-primary-dark text-white">
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
