import { useState, useEffect } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";
import { toast } from "react-toastify";

export default function VehicleDetailModel({ isOpen, closeModal, vehicleData, onSuccess }: any) {
    const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
    const [form, setForm] = useState<any>({
        name: "",
        vehicle_number: "",
        vehicle_type_id: "",
        owner_agency: "",
        contact: "",
        driver_contact: "",
        ownershiptype: "Owner",
        load_capacity: "",
        commission: "",
        insurance: ""
    });
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const res = await apiClient.get("/admin/vehicle/find");
                setVehicleTypes(res?.data?.results || []);
            } catch (err) {
                console.error("Error fetching vehicle types:", err);
            }
        };
        fetchTypes();
    }, []);

    useEffect(() => {
        if (vehicleData && vehicleData.id) {
            setForm({
                name: vehicleData.name || "",
                vehicle_number: vehicleData.vehicle_number || "",
                vehicle_type_id: vehicleData.vehicle_type_id || vehicleData.vehiclesTypes?.id || "",
                owner_agency: vehicleData.owner_agency || "",
                contact: vehicleData.contact || "",
                driver_contact: vehicleData.driver_contact || "",
                ownershiptype: vehicleData.commission != null ? "Agency" : "Owner",
                load_capacity: vehicleData.load_capacity || "",
                commission: vehicleData.commission || "",
                insurance: vehicleData.insurance || ""
            });
            setFile(null);
        }
    }, [vehicleData, isOpen]);

    const handleChange = (e: any) => {
        setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("vehicle_number", form.vehicle_number);
            formData.append("vehicle_type_id", form.vehicle_type_id);
            formData.append("owner_agency", form.owner_agency);
            formData.append("contact", form.contact);
            formData.append("driver_contact", form.driver_contact);
            formData.append("ownershiptype", form.ownershiptype);
            formData.append("load_capacity", form.load_capacity);
            formData.append("commission", form.commission);
            formData.append("insurance", form.insurance);
            if (file) {
                formData.append("image", file);
            }

            await apiClient.put(`/admin/vehicleDetails/update/${vehicleData.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Vehicle updated successfully!");
            if (onSuccess) onSuccess();
            closeModal();
        } catch (err: any) {
            console.error("Error updating vehicle:", err);
            toast.error(err.response?.data?.message || "Failed to update vehicle");
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
                    Edit Vehicle
                </h5>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Vehicle Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Vehicle Name
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Vehicle Name"
                                name="name"
                                value={form.name || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Vehicle Number */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Vehicle Number
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Vehicle Number"
                                name="vehicle_number"
                                value={form.vehicle_number || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Vehicle Type */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Vehicle Type
                            </label>
                            <select
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="vehicle_type_id"
                                value={form.vehicle_type_id || ""}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Vehicle Type</option>
                                {vehicleTypes.map((vt: any) => (
                                    <option key={vt.id} value={vt.id}>
                                        {vt.name} ({vt.wheel} wheels)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Owner / Agency Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Owner / Agency Name
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Owner / Agency Name"
                                name="owner_agency"
                                value={form.owner_agency || ""}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Contact */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Contact Number
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Contact Number"
                                name="contact"
                                value={form.contact || ""}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Driver Contact */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Driver Contact
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Driver Contact"
                                name="driver_contact"
                                value={form.driver_contact || ""}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Load Capacity */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Load Capacity
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Load Capacity"
                                name="load_capacity"
                                value={form.load_capacity || ""}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Commission */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Commission (%)
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Commission"
                                name="commission"
                                value={form.commission || ""}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Insurance Expiry */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Insurance Expiry
                            </label>
                            <input
                                type="date"
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="insurance"
                                value={form.insurance || ""}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Image */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Change Image (Optional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

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
                            className="btn btn-success flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                        >
                            Update Vehicle
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

