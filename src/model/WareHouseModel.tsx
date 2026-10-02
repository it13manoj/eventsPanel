import { useEffect, useState } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";
import { toast } from "react-toastify";

export default function WareHouseModel({ isOpen, closeModal, warehouseData, onSuccess }: any) {
    const isEdit = Boolean(warehouseData && warehouseData.id);

    const [form, setForm] = useState({
        name: "",
        code: "",
        location: "",
        capacity: "",
        manager_name: "",
        contact_number: "",
        gst_number: "",
        license_number: "",
        address: "",
        google_link: ""
    });

    useEffect(() => {
        if (warehouseData && warehouseData.id) {
            setForm({
                name: warehouseData.name || "",
                code: warehouseData.code || "",
                location: warehouseData.location || "",
                capacity: warehouseData.capacity || "",
                manager_name: warehouseData.manager_name || "",
                contact_number: warehouseData.contact_number || "",
                gst_number: warehouseData.gst_number || "",
                license_number: warehouseData.license_number || "",
                address: warehouseData.address || "",
                google_link: warehouseData.google_link || ""
            });
        } else {
            setForm({
                name: "",
                code: "",
                location: "",
                capacity: "",
                manager_name: "",
                contact_number: "",
                gst_number: "",
                license_number: "",
                address: "",
                google_link: ""
            });
        }
    }, [warehouseData, isOpen]);

    const eventHandler = (e: any) => {
        setForm(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    };

    const submitWarehouse = async (e: any) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await apiClient.put(`/admin/warehouse/update/${warehouseData.id}`, form);
                toast.success("Warehouse updated successfully!");
            } else {
                await apiClient.post("/admin/warehouse/create", form);
                toast.success("Warehouse created successfully!");
            }
            if (onSuccess) onSuccess();
            closeModal();
        } catch (error: any) {
            console.error("Error saving warehouse:", error);
            toast.error(error?.response?.data?.message || "Failed to save warehouse");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[90%] lg:max-w-4xl p-6 lg:p-10"
        >
            <div className="overflow-y-auto custom-scrollbar max-h-[85vh]">
                <div>
                    <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                        {isEdit ? "Edit Warehouse" : "Add Warehouse"}
                    </h5>
                </div>

                <form onSubmit={submitWarehouse}>
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Warehouse Name
                            </label>
                            <input
                                required
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="Enter warehouse name"
                                name="name"
                                value={form.name}
                                onChange={eventHandler}
                            />
                        </div>

                        {/* Code */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Warehouse Code
                            </label>
                            <input
                                required
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="WH-001"
                                name="code"
                                value={form.code}
                                onChange={eventHandler}
                            />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Location */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Location
                            </label>
                            <input
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="Location city/area"
                                name="location"
                                value={form.location}
                                onChange={eventHandler}
                            />
                        </div>

                        {/* Capacity */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Capacity
                            </label>
                            <input
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="Capacity (e.g. 5000 sq ft)"
                                name="capacity"
                                value={form.capacity}
                                onChange={eventHandler}
                            />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Manager Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Manager Name
                            </label>
                            <input
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="Manager name"
                                name="manager_name"
                                value={form.manager_name}
                                onChange={eventHandler}
                            />
                        </div>

                        {/* Contact Number */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Contact Number
                            </label>
                            <input
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="Phone number"
                                name="contact_number"
                                value={form.contact_number}
                                onChange={eventHandler}
                            />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* GST Number */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                GST Number
                            </label>
                            <input
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="GST Number"
                                name="gst_number"
                                value={form.gst_number}
                                onChange={eventHandler}
                            />
                        </div>

                        {/* License Number */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                License Number
                            </label>
                            <input
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="License Number"
                                name="license_number"
                                value={form.license_number}
                                onChange={eventHandler}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="mt-4">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Address
                        </label>
                        <input
                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            placeholder="Complete address"
                            name="address"
                            value={form.address}
                            onChange={eventHandler}
                        />
                    </div>

                    {/* Google Map Link */}
                    <div className="mt-4">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Google Map Embed Link
                        </label>
                        <input
                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            placeholder="https://maps.google.com/..."
                            name="google_link"
                            value={form.google_link}
                            onChange={eventHandler}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn-success flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                        >
                            {isEdit ? "Update Warehouse" : "Save Warehouse"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

