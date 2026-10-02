import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../hooks/api/apiClient";
import images from "../../hooks/api/apiImages";
import { toast } from "react-toastify";
import {
  User,
  Lock,
  Mail,
  Shield,
  MapPin,
  Camera,
  Save,
  CheckCircle,
  Eye,
  EyeOff,
  Briefcase,
  AlertCircle,
  RefreshCw
} from "lucide-react";

export default function SettingPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Profile Form State
  const [profile, setProfile] = useState<any>({
    id: null,
    name: "",
    email: "",
    contact: "",
    contact2: "",
    job: "",
    dob: "",
    gender: "male",
    address: "",
    city: "",
    state: "",
    pincode: "",
    role: null,
    img: ""
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch logged in profile
  const fetchMyProfile = async () => {
    try {
      setFetching(true);
      const res = await apiClient.get("/users/findByPk");
      const userData = res?.data?.results || res?.data?.data || {};

      setProfile({
        id: userData.id || null,
        name: userData.name || "",
        email: userData.email || "",
        contact: userData.contact || "",
        contact2: userData.contact2 || "",
        job: userData.job || "",
        dob: userData.dob ? userData.dob.substring(0, 10) : "",
        gender: userData.gender || "male",
        address: userData.address || "",
        city: userData.city || "",
        state: userData.state || "",
        pincode: userData.pincode || "",
        role: userData.role?.role_name || (userData.role_id === 1 ? "Admin" : userData.role_id === 2 ? "Manager" : "Staff"),
        img: userData.img || ""
      });

      if (userData.img) {
        setAvatarPreview(`${images.baseUrl}/${userData.img}`);
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      toast.error(err.response?.data?.message || "Failed to load profile details");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("contact", profile.contact);
      if (profile.contact2) formData.append("contact2", profile.contact2);
      if (profile.job) formData.append("job", profile.job);
      if (profile.dob) formData.append("dob", profile.dob);
      if (profile.gender) formData.append("gender", profile.gender);
      if (profile.address) formData.append("address", profile.address);
      if (profile.city) formData.append("city", profile.city);
      if (profile.state) formData.append("state", profile.state);
      if (profile.pincode) formData.append("pincode", String(profile.pincode));
      if (avatarFile) {
        formData.append("img", avatarFile);
      }

      const res = await apiClient.put("/users/profile-me", formData);
      if (res.data?.success) {
        toast.success("Profile updated successfully!");
        fetchMyProfile();
      } else {
        toast.error(res.data?.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Error saving profile:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirmation password do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.put("/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (res.data?.success) {
        toast.success("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        toast.error(res.data?.message || "Failed to update password");
      }
    } catch (err: any) {
      console.error("Error changing password:", err);
      toast.error(err.response?.data?.message || "Incorrect current password or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="Settings & Profile | Event Panel"
        description="Admin password change and user profile configuration"
      />
      <PageBreadcrumb pageTitle="Settings" />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Hero Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand-500 shadow-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={profile.name || "User Avatar"}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarPreview("")}
                  />
                ) : (
                  <User size={40} className="text-gray-400" />
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg cursor-pointer transition transform hover:scale-105"
                title="Change Avatar"
              >
                <Camera size={14} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {profile.name || "Loading User..."}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <Shield size={12} />
                  {profile.role || "Admin"}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1">
                <Mail size={14} /> {profile.email || "No email available"}
              </p>
              {profile.job && (
                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                  <Briefcase size={12} /> {profile.job}
                </p>
              )}
            </div>

            {/* Quick Action Badges */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === "profile"
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === "password"
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        {activeTab === "profile" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-8 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
              <h4 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <User size={20} className="text-brand-500" />
                User Profile Configuration
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update your personal information, contact phone numbers, and address details.
              </p>
            </div>

            {fetching ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw size={28} className="animate-spin text-brand-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading profile configuration...</p>
              </div>
            ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    required
                    placeholder="Enter full name"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Primary Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="contact"
                      value={profile.contact}
                      onChange={handleProfileChange}
                      required
                      placeholder="10-digit mobile number"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Secondary / Alternate Contact
                  </label>
                  <input
                    type="text"
                    name="contact2"
                    value={profile.contact2}
                    onChange={handleProfileChange}
                    placeholder="Optional alternate number"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Job & DOB */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Job Title / Designation
                  </label>
                  <input
                    type="text"
                    name="job"
                    value={profile.job}
                    onChange={handleProfileChange}
                    placeholder="e.g. Administrator, Lead Manager"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={profile.dob}
                    onChange={handleProfileChange}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleProfileChange}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-4 pt-2">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <MapPin size={16} className="text-brand-500" />
                  Address Information
                </h5>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Street Address
                  </label>
                  <textarea
                    name="address"
                    rows={2}
                    value={profile.address}
                    onChange={handleProfileChange}
                    placeholder="Enter complete address"
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city}
                      onChange={handleProfileChange}
                      placeholder="City"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={profile.state}
                      onChange={handleProfileChange}
                      placeholder="State"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Postal Code / PIN
                    </label>
                    <input
                      type="number"
                      name="pincode"
                      value={profile.pincode}
                      onChange={handleProfileChange}
                      placeholder="Pincode"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-md transition disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? "Saving Changes..." : "Save Profile Configuration"}
                </button>
              </div>
            </form>
            )}
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === "password" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-8 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
              <h4 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Lock size={20} className="text-brand-500" />
                Change Account Password
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                For security reasons, please enter your existing password before choosing a new strong password.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="max-w-xl space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 pr-11 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter at least 6 characters"
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 pr-11 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Re-type new password"
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 pr-11 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordForm.newPassword && passwordForm.confirmPassword && (
                  <p className={`text-xs mt-1.5 flex items-center gap-1 ${
                    passwordForm.newPassword === passwordForm.confirmPassword ? "text-green-600" : "text-red-500"
                  }`}>
                    {passwordForm.newPassword === passwordForm.confirmPassword ? (
                      <>
                        <CheckCircle size={14} /> Passwords match
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} /> Passwords do not match
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-md transition disabled:opacity-50"
                >
                  <Lock size={18} />
                  {loading ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
