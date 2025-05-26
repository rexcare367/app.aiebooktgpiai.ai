import React, { useState } from "react";

interface ProfileData {
  icNumber: string;
  email: string;
  guardianName: string;
  fullName: string;
  phoneNumber: string;
  address: string;
}

interface UpdateLogoModalProps {
  profile: ProfileData;
  onSave: (updatedProfile: ProfileData) => void;
  onClose: () => void;
}

export function UpdateLogoModal({ profile, onSave, onClose }: UpdateLogoModalProps) {
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
        <h2 className="text-2xl font-bold mb-4">Edit Profile Picture</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
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
