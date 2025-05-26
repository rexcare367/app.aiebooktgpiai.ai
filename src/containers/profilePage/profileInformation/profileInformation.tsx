import React, { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser, fetchUserAttributes, updateUserAttributes } from "@aws-amplify/auth";
import toast from "react-hot-toast";
import { EditProfileModal } from "./editProfileModal";
import "./profileInformation.css";
import { User, Mail, Phone, MapPin, Shield, Pencil, Loader2 } from "lucide-react";
import api from "../../../utils/axios";

const ProfileInformationSection = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [guardianName, setGuardianName] = useState<string>("");
  const [rewards, setRewards] = useState<any>([]);
  const [school, setSchool] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");

  const userProfile = useMemo(() => {
    return {
      icNumber: username,
      email,
      phoneNumber,
      address,
      fullName: name,
      guardianName,
    };
  }, [username, email, phoneNumber, address, name, guardianName]);

  const fileInputRef = useRef<HTMLInputElement>(null);


  const groupedRewards = useMemo(() => {
    const rewardMap = rewards.reduce((acc, reward) => {
      const key = `${reward.badge}-${reward.title}`;
      if (!acc[key]) {
        acc[key] = { ...reward, count: 1 };
      } else {
        acc[key].count += 1;
      }
      return acc;
    }, {});
    return Object.values(rewardMap);
  }, [rewards]);

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
    const { username } = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    const { email, phone_number, address, name, "custom:guardianName": guardianName } = attributes;

    await api.get(`/api/users/user/${username}`).then((res) => {
      setAvatar(res.data.data.user.avatar_url);
      setRewards(res.data.data.rewards);
      setSchool(res.data.data.user.school);
    });

    setUsername(username);
    setEmail(email || "");
    setPhoneNumber(phone_number || "");
    setAddress(address || "");
    setName(name || "");
    setGuardianName(guardianName || "");
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProfileInformation();
  }, []);

  const handleUpdateProfile = async (updatedProfile) => {
    setIsUpdating(true);
    const { phoneNumber, fullName, address, guardianName } = updatedProfile;
    setGuardianName(guardianName);
    setAddress(address);
    setPhoneNumber(phoneNumber);
    setName(fullName);
    try {
      const attributes = await updateUserAttributes({
        userAttributes: {
          phone_number: phoneNumber,
          name: fullName,
          address: address,
          "custom:guardianName": guardianName,
        },
      })
        .then(() => {
          toast.success("Update successful");
          setIsEditModalOpen(false);
        })
        .catch((error) => {
          toast.error(error.message);
        });
      console.log("===== updated attributes", attributes);
      setIsUpdating(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="profile-info-container">
      <div className="profile-header">
        {/* <img src={avatar} alt={name} className="profile-avatar" onClick={() => showLogoModal(true)} /> */}
        <div className="relative user-avatar group">
            <img src={avatar} alt="User avatar" className="profile-avatar" />
            {isUpdating && <Loader2 className="absolute w-16 h-16 top-7 left-7 animate-spin" />}

            <button
              className="absolute bottom-0 right-0 transition-opacity opacity-0 group-hover:opacity-100"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUpdating}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

        <div className="profile-title-section">
          <h1 className="profile-name">{name || "User"}</h1>
          <div className="badges-collection">
            {groupedRewards.map((reward: any, i: number) => (
              <div className="badge-item" key={i} title={reward.description}>
                <div className="badge-content">
                  <img src={reward.badge} alt={reward.title} />
                  <span className="badge-title">{reward.title}</span>
                  {reward.count > 1 && <span className="badge-count">×{reward.count}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button className="profile-edit-btn" onClick={() => setIsEditModalOpen(true)}>
          <Pencil size={24} />
        </button>
      </div>

      <div className="profile-info-grid">
        <div className="info-item">
          <div className="info-icon">
            <User size={24} />
          </div>
          <div className="info-content">
            <div className="info-label">ID Number</div>
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
            <User size={24} />
          </div>
          <div className="info-content">
            <div className="info-label">Guardian Name</div>
            <div className="info-value">{guardianName || "Not set"}</div>
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon">
            <Shield size={24} />
          </div>
          <div className="info-content">
            <div className="info-label">School</div>
            <div className="info-value">{school || "Not set"}</div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          profile={userProfile}
          onSave={handleUpdateProfile}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfileInformationSection;
