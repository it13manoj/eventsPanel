import { useState, useEffect } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VehicleModal({ isOpen, closeModal, editData, onSuccess }: any) {
    const isEdit = Boolean(editData && editData.id);

    const [form, setForm] = useState<any>({
        name: "",
        wheel: "",
        capacity: "",
        fuel_type: "",
        description: ""
    });

    useEffect(() => {
        if (editData && editData.id) {
            setForm({
                name: editData.name || "",
                wheel: editData.wheel || "",
                capacity: editData.capacity || "",
                fuel_type: editData.fuel_type || "",
                description: editData.description || ""
            });
        } else {
            setForm({
                name: "",
                wheel: "",
                capacity: "",
                fuel_type: "",
                description: ""
            });
        }
    }, [editData, isOpen]);

    const eventHandler = (e: any) => {
        setForm((prevState: any) => ({ ...prevState, [e.target.name]: e.target.value }));
    };

    const submitHandler = async (e: any) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await apiClient.put(`/admin/vehicle/update/${editData.id}`, form);
                toast.success("Vehicle type updated successfully!");
            } else {
                await apiClient.post("/admin/vehicle/create", form);
                toast.success("Vehicle type created successfully!");
            }
            if (onSuccess) onSuccess();
            closeModal();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to save vehicle type");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[100%] p-6 lg:p-10">
            <div className="overflow-y-auto custom-scrollbar">
                <div>
                    <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                        {isEdit ? "Edit Vehicle Type" : "Add Vehicle Type"}
                    </h5>
                </div>

                <form onSubmit={submitHandler}>
                    {/* Row 1 */}
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Vehicle Type */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Vehicle Name
                            </label>
                            <input
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="Write the Vehicle Name"
                                name="name"
                                value={form.name || ""}
                                onChange={eventHandler}
                                required
                            />
                        </div>

                        {/* Vehicle Wheel */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Number Of Vehicle Wheel
                            </label>
                            <input
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="Write the Number of Vehicle wheel"
                                name="wheel"
                                value={form.wheel || ""}
                                onChange={eventHandler}
                            />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Fuel Type */}
                        <div>
                            <label className="label-style">Fuel Type</label>
                            <select
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                name="fuel_type"
                                value={form.fuel_type || ""}
                                onChange={eventHandler}
                            >
                                <option value="">Select</option>
                                <option value={"diesel"}>Diesel</option>
                                <option value={"petrol"}>Petrol</option>
                                <option value={"cng"}>CNG</option>
                                <option value={"electric"}>Electric</option>
                            </select>
                        </div>

                        {/* Load Capacity */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Load Capacity (Ton)
                            </label>
                            <input
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="Capacity"
                                name="capacity"
                                value={form.capacity || ""}
                                onChange={eventHandler}
                            />
                        </div>
                    </div>

                    {/* Row 3 */}
                    {/* Vehicle Description */}
                    <div className="mt-8">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Description
                        </label>
                        <textarea
                            className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            name="description"
                            value={form.description || ""}
                            onChange={eventHandler}
                            placeholder="Write the Description"
                        ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 mt-6 sm:justify-end">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                        >
                            {isEdit ? "Update Vehicle" : "Save Vehicle"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}