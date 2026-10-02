import React, { useEffect, useState, useRef } from "react";
import {
  Building2,
  Calendar,
  Users,
  Edit,
  Save,
  X,
  Camera,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  RefreshCw,
  Upload,
  Trash2,
  CheckCircle2
} from "lucide-react";
import apiClient from "../../hooks/api/apiClient";
import images from "../../hooks/api/apiImages";
import { toast } from "react-toastify";

interface CompanyData {
  id: number;
  companyName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  gst: string;
  founded: string;
  totalEvents: string;
  teamMembers: string;
  about: string;
  logo: string | null;
}

const defaultCompany: CompanyData = {
  id: 1,
  companyName: "ABC Event Management",
  email: "info@abcevents.com",
  phone: "+91 9876543210",
  website: "www.abcevents.com",
  address: "Patna, Bihar, India",
  gst: "10ABCDE1234F1Z5",
  founded: "2018",
  totalEvents: "250",
  teamMembers: "35",
  about:
    "ABC Event Management specializes in weddings, corporate events, birthday parties, cultural programs, and large-scale event planning across India.",
  logo: null,
};

export default function CompanyProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [company, setCompany] = useState<CompanyData>(defaultCompany);
  const [originalCompany, setOriginalCompany] = useState<CompanyData>(defaultCompany);

  // Photo management state
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [previewLogoUrl, setPreviewLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCompany({
      ...company,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG, JPG, JPEG, WEBP)");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size should be less than 5MB");
        return;
      }

      setSelectedLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewLogoUrl(previewUrl);
      if (!isEditing) {
        setIsEditing(true);
      }
    }
  };

  const handleClearSelectedLogo = () => {
    setSelectedLogoFile(null);
    if (previewLogoUrl) {
      URL.revokeObjectURL(previewLogoUrl);
      setPreviewLogoUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const results = await apiClient.get(`/admin/Companies/1`);
      const data = results.data?.data;
      if (data) {
        const loaded: CompanyData = {
          id: data.id || 1,
          companyName: data.companyName || "",
          email: data.email || "",
          phone: data.phone || "",
          website: data.website || "",
          address: data.address || "",
          gst: data.gstNumber || "",
          founded: data.foundedYear ? String(data.foundedYear) : "",
          totalEvents: data.totalEvents ? String(data.totalEvents) : "0",
          teamMembers: data.teamMembers ? String(data.teamMembers) : "0",
          about: data.aboutCompany || "",
          logo: data.logo || null,
        };
        setCompany(loaded);
        setOriginalCompany(loaded);
      }
    } catch (err: any) {
      console.error("Failed to load company profile:", err);
      toast.error(err?.response?.data?.message || "Failed to load company profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
    return () => {
      if (previewLogoUrl) {
        URL.revokeObjectURL(previewLogoUrl);
      }
    };
  }, []);

  const handleCancel = () => {
    setCompany(originalCompany);
    handleClearSelectedLogo();
    setIsEditing(false);
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.companyName.trim()) {
      toast.error("Company Name is required");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("companyName", company.companyName.trim());
      formData.append("email", company.email.trim());
      formData.append("phone", company.phone.trim());
      formData.append("website", company.website.trim());
      formData.append("gstNumber", company.gst.trim());
      formData.append("foundedYear", company.founded.trim());
      formData.append("totalEvents", company.totalEvents.trim());
      formData.append("teamMembers", company.teamMembers.trim());
      formData.append("address", company.address.trim());
      formData.append("aboutCompany", company.about.trim());

      if (selectedLogoFile) {
        formData.append("logo", selectedLogoFile);
      }

      const companyId = company.id || 1;
      const response = await apiClient.put(`/admin/Companies/${companyId}`, formData);

      if (response.data?.success) {
        toast.success(response.data?.message || "Company profile updated successfully!");
        const updated = response.data?.data;
        if (updated) {
          const updatedCompany: CompanyData = {
            id: updated.id || companyId,
            companyName: updated.companyName || "",
            email: updated.email || "",
            phone: updated.phone || "",
            website: updated.website || "",
            address: updated.address || "",
            gst: updated.gstNumber || "",
            founded: updated.foundedYear ? String(updated.foundedYear) : "",
            totalEvents: updated.totalEvents ? String(updated.totalEvents) : "0",
            teamMembers: updated.teamMembers ? String(updated.teamMembers) : "0",
            about: updated.aboutCompany || "",
            logo: updated.logo || null,
          };
          setCompany(updatedCompany);
          setOriginalCompany(updatedCompany);
        }
        handleClearSelectedLogo();
        setIsEditing(false);
      } else {
        toast.error(response.data?.message || "Failed to update company profile");
      }
    } catch (err: any) {
      console.error("Error updating company:", err);
      toast.error(err?.response?.data?.message || "Failed to update company profile");
    } finally {
      setSaving(false);
    }
  };

  const getDisplayedLogoUrl = () => {
    if (previewLogoUrl) return previewLogoUrl;
    if (!company.logo) return null;
    if (company.logo.startsWith("http://") || company.logo.startsWith("https://")) {
      return company.logo;
    }
    return `${images.baseUrl}/${company.logo}`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={32} className="animate-spin text-blue-600" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading company profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Hidden File Input for Logo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
        <form onSubmit={submitHandler}>
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 sm:p-10 text-white overflow-hidden">
            {/* Decorative background circle */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 rounded-full bg-indigo-500/20 blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Company Logo / Photo Container */}
              <div className="relative group">
                <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-white dark:bg-gray-800 p-1.5 shadow-2xl border-4 border-white/30 dark:border-gray-700/50 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                  {getDisplayedLogoUrl() ? (
                    <img
                      src={getDisplayedLogoUrl()!}
                      alt={company.companyName}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-50 dark:bg-gray-700 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Building2 size={56} />
                    </div>
                  )}
                </div>

                {/* Photo Change Trigger */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload / Change Company Photo"
                  className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg border-2 border-white dark:border-gray-900 transition-all transform hover:scale-110 flex items-center justify-center cursor-pointer group-hover:ring-4 group-hover:ring-blue-400/30"
                >
                  <Camera size={16} />
                </button>
              </div>

              {/* Company Overview & Title */}
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    {company.companyName || "Company Name"}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <CheckCircle2 size={12} /> Active
                  </span>
                </div>

                <p className="text-blue-100 text-sm sm:text-base font-medium flex items-center justify-center sm:justify-start gap-2">
                  <Sparkles size={16} className="text-amber-300" /> Event Management & Operations Fleet
                </p>

                {/* Staged Photo Alert */}
                {selectedLogoFile && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs text-white">
                    <Upload size={14} className="text-yellow-300" />
                    <span>New logo selected: <b>{selectedLogoFile.name}</b></span>
                    <button
                      type="button"
                      onClick={handleClearSelectedLogo}
                      className="ml-2 hover:text-red-300 transition-colors"
                      title="Discard selected image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions in Header */}
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm shadow-sm"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* Visual Photo Upload Banner in Edit Mode */}
            {isEditing && (
              <div className="p-4 rounded-xl border border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Camera size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Company Brand Logo & Photo
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Upload a PNG, JPG, or WEBP logo (Max 5MB). Photo updates dynamically.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Upload size={14} />
                    {selectedLogoFile ? "Choose Different Photo" : "Upload New Photo"}
                  </button>
                  {selectedLogoFile && (
                    <button
                      type="button"
                      onClick={handleClearSelectedLogo}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Reset selected photo"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Building2 size={18} />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    value={company.companyName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter company name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-600 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Corporate Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={company.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. contact@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-600 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Contact Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={company.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. +91 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-600 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Official Website
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Globe size={18} />
                  </div>
                  <input
                    type="text"
                    name="website"
                    value={company.website}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. https://www.example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-600 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {/* GST Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  GST / Tax Registration Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FileText size={18} />
                  </div>
                  <input
                    type="text"
                    name="gst"
                    value={company.gst}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. 10ABCDE1234F1Z5"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-600 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm font-mono"
                  />
                </div>
              </div>

              {/* Founded Year */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Founded Year
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="number"
                    name="founded"
                    value={company.founded}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. 2018"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-600 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {/* Total Events */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Total Completed Events
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Sparkles size={18} />
                  </div>
                  <input
                    type="number"
                    name="totalEvents"
                    value={company.totalEvents}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. 250"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-600 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {/* Team Members */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Core Team Size
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Users size={18} />
                  </div>
                  <input
                    type="number"
                    name="teamMembers"
                    value={company.teamMembers}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. 35"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-600 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Corporate / Headquarters Address
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 pointer-events-none text-gray-400">
                    <MapPin size={18} />
                  </div>
                  <textarea
                    name="address"
                    value={company.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={2}
                    placeholder="Street, City, State, Pin Code"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-600 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {/* About Company */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  About Company / Bio
                </label>
                <textarea
                  name="about"
                  value={company.about}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Describe your event management company, services, and vision..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-600 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm leading-relaxed"
                />
              </div>
            </div>

            {/* Statistics Display Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-center transition-all hover:shadow-md">
                <div className="w-12 h-12 mx-auto rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                  <Calendar size={24} />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {company.totalEvents || "0"}
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
                  Total Events
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-center transition-all hover:shadow-md">
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                  <Users size={24} />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {company.teamMembers || "0"}
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
                  Team Members
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 text-center transition-all hover:shadow-md">
                <div className="w-12 h-12 mx-auto rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
                  <Building2 size={24} />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {company.founded || "—"}
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
                  Year Founded
                </p>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {isEditing ? (
                  <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                    ● You have unsaved changes. Remember to click &quot;Save Changes&quot;.
                  </span>
                ) : (
                  <span>Click &quot;Edit Profile&quot; to modify company information and brand assets.</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-md transition-all hover:shadow-lg active:scale-95 cursor-pointer text-sm"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer text-sm"
                    >
                      <X size={16} />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-md transition-all hover:shadow-lg active:scale-95 cursor-pointer text-sm disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}