import React, { useState } from "react";

interface ProfileData {
  icNumber: string;
  email: string;
  guardianName: string;
  fullName: string;
  phoneNumber: string;
  address: string;
}

interface UpdateAvatarModalProps {
  profile: ProfileData;
  onSave: (updatedProfile: ProfileData) => void;
  onClose: () => void;
}

export function UpdateAvatarModal({ profile, onSave, onClose }: UpdateAvatarModalProps) {
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
        <h2 className="modal-title">Edit Profile Picture</h2>
        <form onSubmit={handleSubmit} className="modal-form">
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

