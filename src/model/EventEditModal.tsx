import { useState, useEffect } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";
import { toast } from "react-toastify";
import { EVENT_STATUSES, normalizeStatusCode } from "../utils/eventStatus";

interface EventEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventData: any;
    onSuccess: () => void;
}

export default function EventEditModal({ isOpen, onClose, eventData, onSuccess }: EventEditModalProps) {
    const [form, setForm] = useState<any>({
        c_name: "",
        vanus: "",
        doe: "",
        v_location: "",
        v_a_d: "",
        nodb: "1",
        amount: "",
        status: "0"
    });

    useEffect(() => {
        if (eventData && eventData.id) {
            setForm({
                c_name: eventData.c_name || "",
                vanus: eventData.vanus || "",
                doe: eventData.doe ? eventData.doe.substring(0, 10) : "",
                v_location: eventData.v_location || "",
                v_a_d: eventData.v_a_d || "",
                nodb: eventData.nodb || "1",
                amount: eventData.amount || "",
                status: normalizeStatusCode(eventData.status)
            });
        }
    }, [eventData, isOpen]);

    const handleChange = (e: any) => {
        setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const normalizedStatus = normalizeStatusCode(form.status);
            await apiClient.put(`/admin/Events/update/${eventData.id}`, {
                ...form,
                status: normalizedStatus
            });
            await apiClient.put(`/admin/Events/updateStatus/${eventData.id}`, {
                status: normalizedStatus
            });
            toast.success("Event updated successfully!");
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error updating event:", err);
            toast.error(err.response?.data?.message || "Failed to update event");
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[100%] p-6 lg:p-10"
        >
            <div className="overflow-y-auto max-h-[80vh] custom-scrollbar">
                <h5 className="mb-4 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                    Edit Event Details
                </h5>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Client Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Client Name
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="c_name"
                                value={form.c_name || ""}
                                onChange={handleChange}
                                placeholder="Client Name"
                                required
                            />
                        </div>

                        {/* Venue */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Venue
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="vanus"
                                value={form.vanus || ""}
                                onChange={handleChange}
                                placeholder="Venue Name"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Date of Event */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Date of Event
                            </label>
                            <input
                                type="date"
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="doe"
                                value={form.doe || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Number of Days Booked */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Number of Days Booked
                            </label>
                            <input
                                type="number"
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="nodb"
                                value={form.nodb || ""}
                                onChange={handleChange}
                                placeholder="1"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Venue Location */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Venue Location (City / Area)
                            </label>
                            <input
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="v_location"
                                value={form.v_location || ""}
                                onChange={handleChange}
                                placeholder="City or Location"
                            />
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Total Amount (₹)
                            </label>
                            <input
                                type="number"
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                name="amount"
                                value={form.amount || ""}
                                onChange={handleChange}
                                placeholder="Total Amount"
                            />
                        </div>
                    </div>

                    {/* Event Status */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Event Status
                        </label>
                        <select
                            name="status"
                            value={normalizeStatusCode(form.status)}
                            onChange={handleChange}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                            {EVENT_STATUSES.map((st) => (
                                <option key={st.code} value={st.code}>
                                    {st.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Venue Address Details */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Venue Address Details
                        </label>
                        <textarea
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            name="v_a_d"
                            value={form.v_a_d || ""}
                            onChange={handleChange}
                            placeholder="Detailed venue address"
                            rows={2}
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-3 mt-6 sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                        >
                            Update Event
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

