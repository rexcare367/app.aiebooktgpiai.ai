import React, { useEffect, useMemo, useRef, useState } from "react";

import toast from "react-hot-toast";
import "./ProfileInfoSection.css";
import { User, Mail, Phone, MapPin, Shield, Pencil, Loader2, School } from "lucide-react";
import api from "../../../utils/axios";

const ProfileInfoSection = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [guardianName, setGuardianName] = useState<string>("");
  const [school, setSchool] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await setIsUpdating(true);
      const formData = new FormData();
      formData.append("file", file);

      await api
        .post(`/api/users/user/upload_avatar/${username}`, formData)
        .then((res) => setAvatar(res.data.data))
        .catch((err) => console.log("err", err));
    } catch (error) {
      console.error("Error uploading avatar:", error);
      // You might want to show an error toast here
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchProfileInformation = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/user/auth/profile`);
      const root = res?.data ?? {};
      const data = root.data ?? root; // support either { data: {...} } or flat
      const user = data.user ?? data; // support nesting under user

      setUsername(user.ic_number || user.icNumber || user.username || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phone || user.phone_number || "");
      setAddress(user.address || "");
      setName(user.name || user.full_name || "");
      setGuardianName(user.guardian_name || user.guardianName || "");
      setAvatar(user.avatar_url || user.avatar || "");
      setSchool(user.school || "");
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error((error as any)?.response?.data?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileInformation();
  }, []);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const payload = {
        email: email,
        phone: phoneNumber,
        address: address,
        name: name,
        guardian_name: guardianName,
        school: school,
      };

      await api.patch(`/api/users/${username}`, payload);

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error((error as any)?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return isLoading ? (
    <div className="profile-info-container flex items-center justify-center min-h-[200px]">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  ) : (
    <div className="profile-info-container">
      <div className="profile-header">
        <div className="relative user-avatar group">
          <img src={avatar} alt="User avatar" className=" rounded-full h-20 w-20" />
          {isUpdating && <Loader2 className="absolute w-16 h-16 top-7 left-7 animate-spin" />}

          <button
            className="absolute bottom-0 right-0 transition-opacity opacity-0 group-hover:opacity-100"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUpdating}
            title="Change avatar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        <div className="profile-title-section">
          <h1 className=" text-lg font-bold">{username || "User"}</h1>
          <h1 className="text-sm font-bold">{name || "User"}</h1>
        </div>
        {!isEditing ? (
          <button className="profile-edit-btn" onClick={() => setIsEditing(true)} title="Edit profile">
            <Pencil size={24} />
          </button>
        ) : null}
      </div>

      {!isEditing ? (
        <div className="profile-info-grid">
          <div className="info-item">
            <div className="info-icon">
              <User size={24} />
            </div>
            <div className="info-content">
              <div className="info-label">IC Number</div>
              <div className="info-value">{username || "Not set"}</div>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <Mail size={24} />
            </div>
            <div className="info-content">
              <div className="info-label">Email</div>
              <div className="info-value">{email || "Not set"}</div>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <Phone size={24} />
            </div>
            <div className="info-content">
              <div className="info-label">Phone</div>
              <div className="info-value">{phoneNumber || "Not set"}</div>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <MapPin size={24} />
            </div>
            <div className="info-content">
              <div className="info-label">Address</div>
              <div className="info-value">{address || "Not set"}</div>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <Shield size={24} />
            </div>
            <div className="info-content">
              <div className="info-label">Guardian Name</div>
              <div className="info-value">{guardianName || "Not set"}</div>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <School size={24} />
            </div>
            <div className="info-content">
              <div className="info-label">School</div>
              <div className="info-value">{school || "Not set"}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="profile-form">
          <div className="form-group">
            <label>Full name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>School</label>
            <input className="form-input" value={school} onChange={(e) => setSchool(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-input" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Guardian name</label>
            <input className="form-input" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Address</label>
            <input className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>IC Number</label>
            <input className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="profile-action-buttons" style={{ gridColumn: "1 / -1" }}>
            <button className="form-button" onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save"}
            </button>
            <button
              className="form-button"
              style={{ backgroundColor: "#9CA3AF" }}
              onClick={() => {
                setIsEditing(false);
                fetchProfileInformation();
              }}
              disabled={isUpdating}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfoSection;