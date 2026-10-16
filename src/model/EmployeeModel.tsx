import { useState, useEffect } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";
import images from "../hooks/api/apiImages";
import { toast } from "react-toastify";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    User,
    UserPlus,
    Calendar,
    Briefcase,
    Clock,
    IndianRupee,
    Lock,
    MapPin,
    ShieldCheck,
    CheckCircle2,
    X,
    Phone,
    Mail,
    FileText,
    CreditCard,
    Upload,
    Trash2
} from "lucide-react";

export default function EmployeeModel({ isOpen, closeModal, editData, onSuccess }: any) {
    if (!isOpen) return null;

    const isEdit = Boolean(editData && editData.id);

    const [form, setForm] = useState<any>({
        name: "",
        email: "",
        contact: "",
        contact2: "",
        job: "",
        dob: "",
        gender: "male",
        role_id: 3,
        shift: "Day Shift (9:00 AM - 6:00 PM)",
        shift_hour: 8,
        address: "",
        city: "",
        state: "",
        pincode: "",
        base_pay: "",
        isactive: true,
        password: "",
        adharcard_number: "",
        insurance_number: ""
    });
    const [file, setFile] = useState<File | null>(null);
    const [adharFrontFile, setAdharFrontFile] = useState<File | null>(null);
    const [adharBackFile, setAdharBackFile] = useState<File | null>(null);
    const [insuranceFile, setInsuranceFile] = useState<File | null>(null);

    const [previewAdharFront, setPreviewAdharFront] = useState<string | null>(null);
    const [previewAdharBack, setPreviewAdharBack] = useState<string | null>(null);
    const [previewInsurance, setPreviewInsurance] = useState<string | null>(null);

    const [roles, setRoles] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            apiClient.get("/users/role")
                .then((res: any) => {
                    const data = res?.data?.results || res?.data?.data || [];
                    if (Array.isArray(data) && data.length > 0) {
                        setRoles(data);
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch roles:", err);
                });
        }
    }, [isOpen]);

    useEffect(() => {
        if (editData && editData.id) {
            setForm({
                name: editData.name || "",
                email: editData.email || "",
                contact: editData.contact || "",
                contact2: editData.contact2 || "",
                job: editData.job || "",
                dob: editData.dob ? editData.dob.substring(0, 10) : "",
                gender: editData.gender || "male",
                role_id: editData.role_id || 3,
                shift: editData.shift || (editData.sifting_type === 2 ? "Night Shift (9:00 PM - 6:00 AM)" : "Day Shift (9:00 AM - 6:00 PM)"),
                shift_hour: editData.shift_hour !== undefined && editData.shift_hour !== null ? editData.shift_hour : 8,
                address: editData.address || "",
                city: editData.city || "",
                state: editData.state || "",
                pincode: editData.pincode || "",
                base_pay: editData.base_pay || "",
                isactive: editData.isactive !== undefined ? editData.isactive : true,
                password: "",
                adharcard_number: editData.adharcard_number || "",
                insurance_number: editData.insurance_number || ""
            });
            setFile(null);
            setAdharFrontFile(null);
            setAdharBackFile(null);
            setInsuranceFile(null);
            setPreviewAdharFront(editData.adharcard_front ? `${images.baseUrl}/${editData.adharcard_front}` : null);
            setPreviewAdharBack(editData.adharcard_back ? `${images.baseUrl}/${editData.adharcard_back}` : null);
            setPreviewInsurance(editData.insurance_pic ? `${images.baseUrl}/${editData.insurance_pic}` : null);
        } else {
            setForm({
                name: "",
                email: "",
                contact: "",
                contact2: "",
                job: "",
                dob: "",
                gender: "male",
                role_id: 3,
                shift: "Day Shift (9:00 AM - 6:00 PM)",
                shift_hour: 8,
                address: "",
                city: "",
                state: "",
                pincode: "",
                base_pay: "",
                isactive: true,
                password: "",
                adharcard_number: "",
                insurance_number: ""
            });
            setFile(null);
            setAdharFrontFile(null);
            setAdharBackFile(null);
            setInsuranceFile(null);
            setPreviewAdharFront(null);
            setPreviewAdharBack(null);
            setPreviewInsurance(null);
        }
    }, [editData, isOpen]);

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setForm((prev: any) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleDobChange = (date: Date | null) => {
        if (!date || isNaN(date.getTime())) {
            setForm((prev: any) => ({ ...prev, dob: "" }));
            return;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        setForm((prev: any) => ({ ...prev, dob: `${year}-${month}-${day}` }));
    };

    const handleFileChange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAdharFrontChange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setAdharFrontFile(selected);
            setPreviewAdharFront(URL.createObjectURL(selected));
        }
    };

    const handleAdharBackChange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setAdharBackFile(selected);
            setPreviewAdharBack(URL.createObjectURL(selected));
        }
    };

    const handleInsurancePicChange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setInsuranceFile(selected);
            setPreviewInsurance(URL.createObjectURL(selected));
        }
    };

    const submitHandler = async (e: any) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("email", form.email);
            formData.append("contact", form.contact);
            if (form.contact2) formData.append("contact2", form.contact2);
            if (form.job) formData.append("job", form.job);
            if (form.dob) formData.append("dob", form.dob);
            formData.append("gender", form.gender);
            formData.append("role_id", String(form.role_id));
            if (form.address) formData.append("address", form.address);
            if (form.city) formData.append("city", form.city);
            if (form.state) formData.append("state", form.state);
            if (form.pincode) formData.append("pincode", String(form.pincode));
            if (form.base_pay) formData.append("base_pay", String(form.base_pay));
            if (form.shift) {
                formData.append("shift", form.shift);
                const sType = form.shift.toLowerCase().includes("night") ? 2 : 1;
                formData.append("sifting_type", String(sType));
            }
            formData.append("shift_hour", String(form.shift_hour !== undefined && form.shift_hour !== "" ? form.shift_hour : 8));
            formData.append("isactive", String(form.isactive));
            if (form.password) formData.append("password", form.password);

            // Document Details
            if (form.adharcard_number) formData.append("adharcard_number", form.adharcard_number);
            if (form.insurance_number) formData.append("insurance_number", form.insurance_number);
            if (form.insurance_number || insuranceFile || previewInsurance) {
                formData.append("insurance", "true");
            }

            // File Uploads
            if (file) formData.append("img", file);
            if (adharFrontFile) formData.append("adharcard_front", adharFrontFile);
            if (adharBackFile) formData.append("adharcard_back", adharBackFile);
            if (insuranceFile) formData.append("insurance_pic", insuranceFile);

            if (isEdit) {
                await apiClient.put(`/users/profile/${editData.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Employee updated successfully!");
            } else {
                await apiClient.post("/users/create", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Employee created successfully!");
            }

            if (onSuccess) onSuccess();
            closeModal();
        } catch (err: any) {
            console.error("Error saving employee:", err);
            toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to save employee");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-4xl w-full mx-auto p-0 rounded-2xl sm:rounded-3xl overflow-hidden [&>button]:hidden shadow-2xl border border-gray-100 dark:border-gray-800"
        >
            {/* Header with matching gradient as AvaliableItems */}
            <div className="flex justify-between items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/20 text-white shadow-inner">
                        {isEdit ? <User className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-white">
                            {isEdit ? "Edit Employee Profile" : "Register New Employee"}
                        </h2>
                        <p className="text-xs text-blue-100 hidden sm:block">
                            {isEdit
                                ? "Update employee profile details, work shift, and salary scale"
                                : "Add personal details, shift assignment, role permissions, and salary scale"}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={closeModal}
                    className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                    <X className="w-4 h-4" /> Close
                </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 space-y-5 overflow-y-auto max-h-[82vh] custom-scrollbar">
                <form onSubmit={submitHandler} className="space-y-5">
                    {/* SECTION 1: Personal & Contact Information */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-5 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100 dark:border-gray-700/60">
                            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <User className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                Personal & Contact Details
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Name */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Employee's Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                    name="name"
                                    value={form.name || ""}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                    name="email"
                                    value={form.email || ""}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Contact */}
                            <div>
                                <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                                    Primary Contact No. <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                    name="contact"
                                    value={form.contact || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. +91 9876543210"
                                    required
                                />
                            </div>

                            {/* Secondary Contact */}
                            <div>
                                <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                    Secondary / Emergency Contact
                                </label>
                                <input
                                    className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                    name="contact2"
                                    value={form.contact2 || ""}
                                    onChange={handleChange}
                                    placeholder="Alternate contact number"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Date Of Birth with Calendar Datepicker */}
                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    Date Of Birth
                                </label>
                                <div className="relative w-full [&>.react-datepicker-wrapper]:w-full">
                                    <ReactDatePicker
                                        selected={form.dob ? new Date(form.dob) : null}
                                        onChange={handleDobChange}
                                        dateFormat="yyyy-MM-dd"
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        maxDate={new Date()}
                                        placeholderText="Select Date of Birth"
                                        wrapperClassName="w-full"
                                        className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition cursor-pointer"
                                    />
                                    <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Gender
                                </label>
                                <div className="flex items-center gap-3 h-11">
                                    {["male", "female", "other"].map((g) => (
                                        <label
                                            key={g}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold capitalize cursor-pointer transition ${
                                                form.gender === g
                                                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300"
                                                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={g}
                                                checked={form.gender === g}
                                                onChange={handleChange}
                                                className="hidden"
                                            />
                                            {g}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Role, Shift & Compensation */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-5 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100 dark:border-gray-700/60">
                            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                Job Role, Shift & Compensation
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Role */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    System Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="role_id"
                                    value={form.role_id}
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition cursor-pointer"
                                >
                                    {roles.length > 0 ? (
                                        roles.map((r: any) => (
                                            <option key={r.id} value={r.id}>
                                                {r.role_name}
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value={1}>Admin</option>
                                            <option value={2}>Manager</option>
                                            <option value={3}>Staff</option>
                                            <option value={4}>Driver</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Job Designation */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Job Designation
                                </label>
                                <input
                                    className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                    name="job"
                                    value={form.job || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. Technician, Sound Engineer, Electrician"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {/* Shift Type */}
                            <div className="lg:col-span-2">
                                <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                    Employee Shift
                                </label>
                                <select
                                    name="shift"
                                    value={form.shift || ""}
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                >
                                    <option value="Day Shift (9:00 AM - 6:00 PM)">Day Shift (9:00 AM - 6:00 PM)</option>
                                    <option value="Morning Shift (6:00 AM - 2:00 PM)">Morning Shift (6:00 AM - 2:00 PM)</option>
                                    <option value="Evening Shift (2:00 PM - 10:00 PM)">Evening Shift (2:00 PM - 10:00 PM)</option>
                                    <option value="Night Shift (9:00 PM - 6:00 AM)">Night Shift (9:00 PM - 6:00 AM)</option>
                                    <option value="Rotational Shift">Rotational Shift</option>
                                    <option value="Flexible / Event Basis">Flexible / Event Basis</option>
                                </select>
                            </div>

                            {/* Shift Hours */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Target Daily Hours
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type="number"
                                        min="1"
                                        max="24"
                                        step="0.5"
                                        className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 pr-12 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                        name="shift_hour"
                                        value={form.shift_hour !== undefined ? form.shift_hour : 8}
                                        onChange={handleChange}
                                        placeholder="8"
                                        required
                                    />
                                    <span className="absolute right-3.5 text-xs text-gray-400 font-semibold pointer-events-none">
                                        Hrs
                                    </span>
                                </div>
                            </div>

                            {/* Base Pay */}
                            <div>
                                <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                                    Base Salary (₹)
                                </label>
                                <input
                                    type="number"
                                    className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                    name="base_pay"
                                    value={form.base_pay || ""}
                                    onChange={handleChange}
                                    placeholder="Monthly Salary"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                <Lock className="w-3.5 h-3.5 text-gray-400" />
                                {isEdit ? "New Password (Leave blank to keep existing)" : "Password"} {!isEdit && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="password"
                                className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                name="password"
                                value={form.password || ""}
                                onChange={handleChange}
                                placeholder={isEdit ? "••••••••" : "Create login password"}
                                required={!isEdit}
                            />
                        </div>
                    </div>

                    {/* SECTION 3: Residential Address */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-5 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100 dark:border-gray-700/60">
                            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                Residential Address
                            </h3>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Street Address
                            </label>
                            <textarea
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
                                name="address"
                                value={form.address || ""}
                                onChange={handleChange}
                                placeholder="House / Flat No., Street, Landmark"
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    City
                                </label>
                                <input
                                    className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                    name="city"
                                    value={form.city || ""}
                                    onChange={handleChange}
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    State
                                </label>
                                <input
                                    className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                    name="state"
                                    value={form.state || ""}
                                    onChange={handleChange}
                                    placeholder="State"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Pincode
                                </label>
                                <input
                                    className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                    name="pincode"
                                    value={form.pincode || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. 462001"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: Identity & Verification Documents (Aadhaar & Insurance) */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-5 shadow-xs space-y-5">
                        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-700/60">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                        Identity Documents & Verification
                                    </h3>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        Upload Aadhaar Card (Front & Back) and Insurance document details
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                KYC / Verification
                            </span>
                        </div>

                        {/* Aadhaar Details Sub-section */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-blue-500" /> Aadhaar Card Details
                            </h4>

                            {/* Aadhaar Number */}
                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                                    Aadhaar Card Number
                                </label>
                                <input
                                    type="text"
                                    className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-mono text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition tracking-wide"
                                    name="adharcard_number"
                                    value={form.adharcard_number || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. 1234 5678 9012"
                                    maxLength={20}
                                />
                            </div>

                            {/* Aadhaar Front & Back Photos Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Aadhaar Front */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Aadhaar Card - Front Photo
                                    </label>
                                    {previewAdharFront ? (
                                        <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-2 flex items-center gap-3">
                                            <img
                                                src={previewAdharFront}
                                                alt="Aadhaar Front Preview"
                                                className="w-16 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate block">
                                                    Front Photo Attached
                                                </span>
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAdharFrontFile(null);
                                                    setPreviewAdharFront(null);
                                                }}
                                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                                                title="Remove photo"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-gray-900 cursor-pointer transition">
                                            <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Upload Front Side</span>
                                            <span className="text-[10px] text-gray-400">PNG, JPG up to 5MB</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAdharFrontChange}
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* Aadhaar Back */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Aadhaar Card - Back Photo
                                    </label>
                                    {previewAdharBack ? (
                                        <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-2 flex items-center gap-3">
                                            <img
                                                src={previewAdharBack}
                                                alt="Aadhaar Back Preview"
                                                className="w-16 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate block">
                                                    Back Photo Attached
                                                </span>
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAdharBackFile(null);
                                                    setPreviewAdharBack(null);
                                                }}
                                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                                                title="Remove photo"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-gray-900 cursor-pointer transition">
                                            <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Upload Back Side</span>
                                            <span className="text-[10px] text-gray-400">PNG, JPG up to 5MB</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAdharBackChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Insurance Details Sub-section */}
                        <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Insurance Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Insurance Number */}
                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                        Insurance / Policy Number
                                    </label>
                                    <input
                                        type="text"
                                        className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-mono text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                        name="insurance_number"
                                        value={form.insurance_number || ""}
                                        onChange={handleChange}
                                        placeholder="e.g. POL-98765432"
                                    />
                                </div>

                                {/* Insurance Photo */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Insurance Document / Photo
                                    </label>
                                    {previewInsurance ? (
                                        <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-2 flex items-center gap-3">
                                            <img
                                                src={previewInsurance}
                                                alt="Insurance Document Preview"
                                                className="w-16 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate block">
                                                    Insurance Document Attached
                                                </span>
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setInsuranceFile(null);
                                                    setPreviewInsurance(null);
                                                }}
                                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                                                title="Remove photo"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-400 bg-white dark:bg-gray-900 cursor-pointer transition">
                                            <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Upload Insurance Doc</span>
                                            <span className="text-[10px] text-gray-400">PNG, JPG, PDF preview</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleInsurancePicChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: Profile Image & Status */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-5 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100 dark:border-gray-700/60">
                            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                Profile Image & Account Status
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Profile Image */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Profile Photo
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-xs text-gray-800 dark:text-white shadow-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Account Status
                                </label>
                                <select
                                    name="isactive"
                                    value={String(form.isactive)}
                                    onChange={(e) => setForm((p: any) => ({ ...p, isactive: e.target.value === "true" }))}
                                    className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                >
                                    <option value="true">Active (Access Enabled)</option>
                                    <option value="false">Inactive (Suspended)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            onClick={closeModal}
                            type="button"
                            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold transition cursor-pointer shadow-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition cursor-pointer"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {isEdit ? "Update Employee" : "Save Employee"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}