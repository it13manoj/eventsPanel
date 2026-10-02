import { useState, useEffect } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";
import { toast } from "react-toastify";

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
        address: "",
        city: "",
        state: "",
        pincode: "",
        base_pay: "",
        isactive: true,
        password: ""
    });
    const [file, setFile] = useState<File | null>(null);

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
                address: editData.address || "",
                city: editData.city || "",
                state: editData.state || "",
                pincode: editData.pincode || "",
                base_pay: editData.base_pay || "",
                isactive: editData.isactive !== undefined ? editData.isactive : true,
                password: ""
            });
            setFile(null);
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
                address: "",
                city: "",
                state: "",
                pincode: "",
                base_pay: "",
                isactive: true,
                password: ""
            });
            setFile(null);
        }
    }, [editData, isOpen]);

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setForm((prev: any) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleFileChange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
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
            formData.append("isactive", String(form.isactive));
            if (form.password) formData.append("password", form.password);
            if (file) formData.append("img", file);

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
            className="max-w-[100%] p-6 lg:p-10"
        >
            <div className="overflow-y-auto max-h-[80vh] custom-scrollbar">
                <h5 className="mb-4 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                    {isEdit ? "Edit Employee" : "Add Employee"}
                </h5>

                <form onSubmit={submitHandler} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Employee's Name
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="name"
                                value={form.name || ""}
                                onChange={handleChange}
                                placeholder="Full Name"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Email Id
                            </label>
                            <input
                                type="email"
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
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
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Contact No.
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="contact"
                                value={form.contact || ""}
                                onChange={handleChange}
                                placeholder="Contact Number"
                                required
                            />
                        </div>

                        {/* Alternate Contact */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Secondary Contact
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="contact2"
                                value={form.contact2 || ""}
                                onChange={handleChange}
                                placeholder="Secondary Contact"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* DOB */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Date Of Birth
                            </label>
                            <input
                                type="date"
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="dob"
                                value={form.dob || ""}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Gender
                            </label>
                            <div className="flex items-center gap-4 mt-3">
                                {["male", "female", "other"].map((g) => (
                                    <label key={g} className="flex items-center gap-2 capitalize text-sm text-gray-700 dark:text-gray-300">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={g}
                                            checked={form.gender === g}
                                            onChange={handleChange}
                                            className="accent-brand-500"
                                        />
                                        {g}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Role */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Role
                            </label>
                            <select
                                name="role_id"
                                value={form.role_id}
                                onChange={handleChange}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            >
                                <option value={1}>Admin</option>
                                <option value={2}>Manager</option>
                                <option value={3}>Staff</option>
                                <option value={4}>Driver</option>
                            </select>
                        </div>

                        {/* Designation / Job */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Job Designation
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="job"
                                value={form.job || ""}
                                onChange={handleChange}
                                placeholder="Job title"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Employee Shift */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Employee Shift
                            </label>
                            <select
                                name="shift"
                                value={form.shift || ""}
                                onChange={handleChange}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            >
                                <option value="Day Shift (9:00 AM - 6:00 PM)">Day Shift (9:00 AM - 6:00 PM)</option>
                                <option value="Morning Shift (6:00 AM - 2:00 PM)">Morning Shift (6:00 AM - 2:00 PM)</option>
                                <option value="Evening Shift (2:00 PM - 10:00 PM)">Evening Shift (2:00 PM - 10:00 PM)</option>
                                <option value="Night Shift (9:00 PM - 6:00 AM)">Night Shift (9:00 PM - 6:00 AM)</option>
                                <option value="Rotational Shift">Rotational Shift</option>
                                <option value="Flexible / Event Basis">Flexible / Event Basis</option>
                            </select>
                        </div>

                        {/* Base Pay */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Base Pay (Salary)
                            </label>
                            <input
                                type="number"
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="base_pay"
                                value={form.base_pay || ""}
                                onChange={handleChange}
                                placeholder="Base Pay"
                            />
                        </div>

                        {/* Password (Optional for edit) */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                {isEdit ? "New Password (Leave blank)" : "Password"}
                            </label>
                            <input
                                type="password"
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="password"
                                value={form.password || ""}
                                onChange={handleChange}
                                placeholder={isEdit ? "••••••••" : "Password"}
                                required={!isEdit}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Address
                        </label>
                        <textarea
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            name="address"
                            value={form.address || ""}
                            onChange={handleChange}
                            placeholder="Full Address"
                            rows={2}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                City
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="city"
                                value={form.city || ""}
                                onChange={handleChange}
                                placeholder="City"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                State
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="state"
                                value={form.state || ""}
                                onChange={handleChange}
                                placeholder="State"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Pincode
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="pincode"
                                value={form.pincode || ""}
                                onChange={handleChange}
                                placeholder="Pincode"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Profile Image */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Profile Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Status
                            </label>
                            <select
                                name="isactive"
                                value={String(form.isactive)}
                                onChange={(e) => setForm((p: any) => ({ ...p, isactive: e.target.value === "true" }))}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 sm:justify-end">
                        <button
                            onClick={closeModal}
                            type="button"
                            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                        >
                            {isEdit ? "Update Employee" : "Save Employee"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}