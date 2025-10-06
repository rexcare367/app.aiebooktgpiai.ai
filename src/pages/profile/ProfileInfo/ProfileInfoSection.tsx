import React, { useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";
import { Pencil, Loader2 } from "lucide-react";
import api from "../../../utils/axios";
import authService, { UserData } from "../../../utils/authService";

const ProfileInfoSection = () => {
  const userData: UserData | null = authService.getUserData();
  
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

  // Store original values for reset
  const [originalValues, setOriginalValues] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    address: "",
    name: "",
    guardianName: "",
    school: "",
    avatar: ""
  });

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

      const profileData = {
        username: user.ic_number || user.icNumber || user.username || "",
        email: user.email || "",
        phoneNumber: user.phone || user.phone_number || "",
        address: user.address || "",
        name: user.name || user.full_name || "",
        guardianName: user.guardian_name || user.guardianName || "",
        avatar: user.avatar_url || user.avatar || "",
        school: user.school || ""
      };

      setUsername(profileData.username);
      setEmail(profileData.email);
      setPhoneNumber(profileData.phoneNumber);
      setAddress(profileData.address);
      setName(profileData.name);
      setGuardianName(profileData.guardianName);
      setAvatar(profileData.avatar);
      setSchool(profileData.school);

      // Store original values for reset
      setOriginalValues(profileData);
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

      await api.patch(`/api/users/${userData?.id}`, payload);

      toast.success("Profile updated successfully");
      
      // Update original values after successful save
      setOriginalValues({
        username,
        email,
        phoneNumber,
        address,
        name,
        guardianName,
        school,
        avatar
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error((error as any)?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    setUsername(originalValues.username);
    setEmail(originalValues.email);
    setPhoneNumber(originalValues.phoneNumber);
    setAddress(originalValues.address);
    setName(originalValues.name);
    setGuardianName(originalValues.guardianName);
    setSchool(originalValues.school);
    setAvatar(originalValues.avatar);
  };

  return isLoading ? (
    <div className="bg-white dark:bg-gray-800 flex items-center justify-center min-h-[200px] rounded-2xl p-8 shadow-lg dark:shadow-gray-900/30 dark:text-white">
      <Loader2 className="w-10 h-10 animate-spin text-theme" />
    </div>
  ) : (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 transition-all duration-300 shadow-lg hover:shadow-xl dark:shadow-gray-900/30 dark:hover:shadow-gray-900/50 border-2 border-transparent/20 border-solid dark:text-white">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4 pb-6 mb-6 border-b-2 border-gray-200 dark:border-gray-700">
        {/* Avatar Section */}
        <div className="relative group">
          <div className="relative">
            <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden shadow-lg dark:shadow-gray-900/50 transition-all duration-300 ring-4 ring-gray-200 dark:ring-gray-700">
              <img 
                src={avatar || "/assets/icon.png"} 
                alt="User avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {isUpdating && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 dark:bg-white/30">
              <Loader2 className="w-8 h-8 animate-spin text-white dark:text-gray-800" />
            </div>
          )}

          {/* Edit Avatar Button */}
          <button
            className="bg-theme absolute bottom-0 right-0 p-2 rounded-full shadow-lg dark:shadow-gray-900/50 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 text-white"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUpdating}
            title="Change avatar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* User Info */}
        <div className="text-center">
          <h1 className="text-xl lg:text-2xl font-bold mb-1 text-app">
            {name || "User"}
          </h1>
          <p className="text-sm lg:text-base font-medium text-app-2 dark:text-gray-300">
            {username || "ID not set"}
          </p>
        </div>
      </div>

      {/* Profile Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7 w-full">
          <div className="flex flex-col gap-2 w-full">
            <label className="text-base md:text-lg font-medium text-app-2 dark:text-gray-300">Full name</label>
            <input 
              className="w-full rounded-md px-4 py-2 text-sm leading-tight border-2 bg-transparent border-transparent/20 text-app caret-theme transition-all duration-200 focus:outline-none focus:border-theme focus:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 " 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-base md:text-lg font-medium text-app-2 dark:text-gray-300">School</label>
            <input 
              className="w-full rounded-md px-4 py-2 text-sm leading-tight border-2 bg-transparent border-transparent/20 text-app caret-theme transition-all duration-200 focus:outline-none focus:border-theme focus:shadow-lg disabled:cursor-not-allowed disabled:opacity-60" 
              value={school} 
              onChange={(e) => setSchool(e.target.value)} 
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-base md:text-lg font-medium text-app-2 dark:text-gray-300">Phone</label>
            <input 
              className="w-full rounded-md px-4 py-2 text-sm leading-tight border-2 bg-transparent border-transparent/20 text-app caret-theme transition-all duration-200 focus:outline-none focus:border-theme focus:shadow-lg disabled:cursor-not-allowed disabled:opacity-60" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-base md:text-lg font-medium text-app-2 dark:text-gray-300">Guardian name</label>
            <input 
              className="w-full rounded-md px-4 py-2 text-sm leading-tight border-2 bg-transparent border-transparent/20 text-app caret-theme transition-all duration-200 focus:outline-none focus:border-theme focus:shadow-lg disabled:cursor-not-allowed disabled:opacity-60" 
              value={guardianName} 
              onChange={(e) => setGuardianName(e.target.value)} 
            />
          </div>
          <div className="flex flex-col gap-2 w-full col-span-full">
            <label className="text-base md:text-lg font-medium text-app-2 dark:text-gray-300">Address</label>
            <input 
              className="w-full rounded-md px-4 py-2 text-sm leading-tight border-2 bg-transparent border-transparent/20 text-app caret-theme transition-all duration-200 focus:outline-none focus:border-theme focus:shadow-lg disabled:cursor-not-allowed disabled:opacity-60" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-base md:text-lg font-medium text-app-2 dark:text-gray-300">Email</label>
            <input 
              className="w-full rounded-md px-4 py-2 text-sm leading-tight border-2 bg-transparent border-transparent/20 text-app caret-theme transition-all duration-200 focus:outline-none focus:border-theme focus:shadow-lg disabled:cursor-not-allowed disabled:opacity-60" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-base md:text-lg font-medium text-app-2 dark:text-gray-300">IC Number</label>
            <input 
              className="w-full rounded-md px-4 py-2 text-sm leading-tight border-2 bg-transparent border-transparent/20 text-app caret-theme transition-all duration-200 focus:outline-none focus:border-theme focus:shadow-lg disabled:cursor-not-allowed disabled:opacity-60" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>

          <div className="mt-8 lg:mt-10 flex flex-wrap justify-end md:justify-end gap-5 pb-6 lg:pb-8 col-span-full">
            <button 
              className="bg-theme rounded-xl px-6 py-3 border-none w-full md:w-auto cursor-pointer min-w-[120px] text-base md:text-lg transition-all duration-200 font-medium text-white hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60" 
              onClick={handleSave} 
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save"}
            </button>
            <button
              className="bg-gray-400 dark:bg-gray-600 rounded-xl px-6 py-3 border-none w-full md:w-auto cursor-pointer min-w-[120px] text-base md:text-lg transition-all duration-200 font-medium text-white hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleReset}
              disabled={isUpdating}
            >
              Reset
            </button>
          </div>
        </div>
    </div>
  );
};

export default ProfileInfoSection;