import { useState, useEffect } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";
import { toast } from "react-toastify";
import { EVENT_STATUSES, normalizeStatusCode, isEventLocked, getStatusLabel } from "../utils/eventStatus";
import { Lock } from "lucide-react";

interface EventEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventData: any;
    onSuccess: () => void;
}

export default function EventEditModal({ isOpen, onClose, eventData, onSuccess }: EventEditModalProps) {
    const [templates, setTemplates] = useState<any[]>([]);
    const [form, setForm] = useState<any>({
        c_name: "",
        vanus: "",
        doe: "",
        v_location: "",
        v_a_d: "",
        nodb: "1",
        amount: "",
        status: "0",
        template_id: 0,
        template_name: ""
    });

    const [stockList, setStockList] = useState<any[]>([]);

    useEffect(() => {
        const fetchTemplatesAndStock = async () => {
            try {
                const res = await apiClient.get("/admin/template/all");
                setTemplates(res.data.results || res.data.data || []);
            } catch (err) {
                console.error("Error fetching templates:", err);
            }
            try {
                const stockRes = await apiClient.get("/admin/Inverntory/availableStockSummary");
                setStockList(stockRes.data?.results || []);
            } catch (err) {
                console.warn("Error fetching stock summary:", err);
            }
        };
        if (isOpen) {
            fetchTemplatesAndStock();
        }
    }, [isOpen]);

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
                status: normalizeStatusCode(eventData.status),
                template_id: eventData.template_id || 0,
                template_name: eventData.template_name || ""
            });
        }
    }, [eventData, isOpen]);

    const handleChange = (e: any) => {
        setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const isLocked = isEventLocked(eventData?.status);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (isLocked) {
            toast.warning("This event is Completed or Cancelled and cannot be updated.");
            return;
        }
        if (!form.template_id) {
            toast.error("Please select an Event Template (Required as per requirements).");
            return;
        }

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
            className="max-w-5xl w-full p-4 sm:p-6 lg:p-8"
        >
            <div className="overflow-y-auto max-h-[80vh] custom-scrollbar">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <h5 className="font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl flex items-center gap-2">
                        Edit Event Details
                        {isLocked && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 inline-flex items-center gap-1">
                                <Lock size={12} />
                                Locked (Read-Only)
                            </span>
                        )}
                    </h5>
                </div>

                {isLocked && (
                    <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm font-semibold">
                        <Lock size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>This event is finalized ({getStatusLabel(eventData?.status)}). All fields are locked and records cannot be updated or changed.</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <fieldset disabled={isLocked} className="space-y-4">
                    {/* Event Template Dropdown - Not Optional / Required per requirements */}
                    <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-1.5">
                        <label className="block text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                            Event Template <span className="text-rose-500 font-extrabold">* (Required per requirements)</span>
                        </label>
                        <select
                            name="template_id"
                            value={form.template_id || 0}
                            onChange={(e) => {
                                const tId = Number(e.target.value);
                                const found = templates.find((t: any) => t.id === tId);
                                setForm((prev: any) => ({
                                    ...prev,
                                    template_id: tId,
                                    template_name: found ? found.name : "",
                                    ...(found && found.total_price ? { amount: String(found.total_price) } : {})
                                }));
                                if (found) {
                                    toast.info(`Applied template "${found.name}" (Amount: ₹${found.total_price})`);
                                }
                            }}
                            required
                            className="h-11 w-full rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-800 dark:text-white"
                        >
                            <option value={0}>-- Select Event Template (Required) --</option>
                            {templates.map((tpl: any) => (
                                <option key={tpl.id} value={tpl.id}>
                                    {tpl.name} — (₹{Number(tpl.total_price || 0).toLocaleString()} | {tpl.items?.length || 0} items)
                                </option>
                            ))}
                        </select>
                        {form.template_name && (
                            <span className="text-[11px] text-indigo-700 dark:text-indigo-300 block">
                                Current Active Template: <strong>{form.template_name}</strong>
                            </span>
                        )}

                        {/* Live Stock Availability Breakdown */}
                        {form.template_id > 0 && (() => {
                            const curTpl = templates.find((t: any) => t.id === Number(form.template_id));
                            if (!curTpl || !Array.isArray(curTpl.items) || curTpl.items.length === 0) return null;
                            return (
                                <div className="mt-2 p-2.5 rounded-lg bg-white/90 dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between font-semibold text-indigo-900 dark:text-indigo-300 border-b border-gray-100 dark:border-gray-800 pb-1 text-[11px]">
                                        <span>📦 Stock Availability for Template Items:</span>
                                        <span className="text-gray-400 font-normal">Active event deduction applied</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                        {curTpl.items.map((it: any, idx: number) => {
                                            const matchedStock = stockList.find(
                                                (s: any) =>
                                                    Number(s.categories_id) === Number(it.category_id) &&
                                                    Number(s.sub_categories_id) === Number(it.subcategory_id)
                                            );
                                            const total = matchedStock
                                                ? (matchedStock.total_quantity !== undefined ? matchedStock.total_quantity : matchedStock.quantity)
                                                : 0;
                                            const inUse = matchedStock ? (matchedStock.allocated_quantity || 0) : 0;
                                            const avail = matchedStock
                                                ? (matchedStock.available_quantity !== undefined ? matchedStock.available_quantity : total)
                                                : 0;
                                            const reqQty = Number(it.quantity || 1);
                                            const hasEnough = avail >= reqQty;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`p-1.5 rounded-md border text-[11px] flex items-center justify-between gap-1.5 ${
                                                        hasEnough
                                                            ? "bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700"
                                                            : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800"
                                                    }`}
                                                >
                                                    <div className="truncate">
                                                        <strong className="text-gray-900 dark:text-white">{it.subcategory_name}</strong>
                                                        <span className="text-[10px] text-gray-500 block">Needs: {reqQty} pcs</span>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <span className={`font-bold ${hasEnough ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                                            {avail} / {total} avail
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 block">({inUse} in use)</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

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
                    </fieldset>

                    <div className="flex items-center gap-3 mt-6 sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                        >
                            {isLocked ? "Close" : "Cancel"}
                        </button>
                        {!isLocked && (
                            <button
                                type="submit"
                                className="btn btn-success flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                            >
                                Update Event
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </Modal>
    );
}

