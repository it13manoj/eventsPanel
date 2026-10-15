import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";

import { FaTruck } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";

import { useEffect, useState } from "react";
import apiClient from "../../hooks/api/apiClient";
import EventAssignModel from "../../model/EventAssignModel";
import { useModal } from "../../hooks/useModal";
import ItemsModel from "../../model/ItemModel";
import EventDetailsModal from "../../model/EventDetailsModal";
import AssignTeam from "../../model/AssignTeam";
import { format } from "date-fns";
import VehicleAssign from "../../model/VehicleAssign";
import { Pencil, Trash2, Lock } from "lucide-react";
import { toast } from "react-toastify";
import EventEditModal from "../../model/EventEditModal";
import { EVENT_STATUSES, normalizeStatusCode, getStatusBadgeClass, getStatusLabel, isEventLocked } from "../../utils/eventStatus";
import { useAuth } from "../../hooks/auth";

interface BookedItem {
    id: number;
    categories_id: number;
    categories_name: string;
    subCategories_id: number;
    subCategories_name: string;
    width: string;
    height: string;
    qt: number;
    event_id: number;
    created_at: string;
    updated_at: string;
}

interface Installation {
    installing: string,
    uninstalling: string,
    event_id: number
}


export default function EventsTable() {
    const { isStaff } = useAuth();
    const [eid, setEId] = useState({
        id: ""
    })
    const { isOpen, openModal, closeModal } = useModal();
    const [isOpens, setIsOpens] = useState(false);
    const [bookedItems, setBookedItems] = useState<Record<number, BookedItem[]>>({});
    const [selectedItems] = useState<BookedItem[] | null>(null);

    const [inst, setInst] = useState<{ [key: number]: Installation[] }>({});

    const [isOpenes, setIsOpenes] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);


    const [isOpenTeam, setIsOpenTeam] = useState(false);
    const [isOpenvehicle, setIsOpenvehicle] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
    const [selectedTeamLocked, setSelectedTeamLocked] = useState<boolean>(false);
    const [selectedVehicleEventId, setSelectedVehicleEventId] = useState<number | null>(null);
    const [editEvent, setEditEvent] = useState<any>(null);
    const [isOpenEditEvent, setIsOpenEditEvent] = useState(false);

    const handleEditEvent = (row: any) => {
        if (isEventLocked(row?.status)) {
            toast.warning("This event is Completed or Cancelled and cannot be edited.");
            return;
        }
        setEditEvent(row);
        setIsOpenEditEvent(true);
    };

    const handleDeleteEvent = async (id: number) => {
        const ev = events.find((e: any) => e.id === id);
        if (ev && isEventLocked(ev.status)) {
            toast.warning("This event is Completed or Cancelled and cannot be deleted.");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this event? This will also remove all associated booked event records.")) return;
        try {
            const res = await apiClient.delete(`/admin/Events/delete/${id}`);
            if (res.data?.status === false) {
                toast.error(res.data?.message || "Failed to delete event");
            } else {
                toast.success("Event deleted successfully!");
                getEvents();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error deleting event");
        }
    };

    const handleUpdateStatus = async (id: number, newStatusCode: string) => {
        const currentEvent = events.find((e: any) => e.id === id);
        if (currentEvent && isEventLocked(currentEvent.status)) {
            toast.warning("This event is Completed or Cancelled. Status cannot be modified.");
            return;
        }
        try {
            const res = await apiClient.put(`/admin/Events/updateStatus/${id}`, { status: newStatusCode });
            if (res.data?.status !== false) {
                toast.success(`Event #${id} marked as ${getStatusLabel(newStatusCode)}`);
                getEvents();
            } else {
                toast.error(res.data?.message || "Failed to update event status");
            }
        } catch (err: any) {
            console.error("Error updating status:", err);
            toast.error(err.response?.data?.message || "Error updating event status");
        }
    };
    
    const [events, setEvents] = useState<any[]>([{
        "id": 0,
        "c_name": "",
        "vanus": "",
        "doe": "",
        "v_location": "",
        "v_a_d": "",
        "nodb": "",
        "pob": "",
        "tc": "",
        "sr": "",
        "amount": "",
        "status": "",
        "created_at": "",
        "template_id": 0,
        "template_name": ""
    }])


    const getEvents = async () => {
        try {
            const results = await apiClient.get("admin/Events/find")
            setEvents(results?.data?.results);
        } catch {

        }
    }

    

    useEffect(() => {
        getEvents()
    }, [isOpen])

    useEffect(() => {
        getEvents()
    }, [0])

    const getEventsByID = (id: any) => {
        setEId({ id: id });
    }

    const [teamSizes, setTeamSizes] = useState<{ [key: number]: number }>({});

    const getTeamMember = async (id: number) => {
        try {
            if (id > 0) {
                const res = await apiClient(`/admin/teamAssign/find/${id}`);
                const size = res?.data?.data?.TeamAssignUser?.length || 0;

                setTeamSizes(prev => ({
                    ...prev,
                    [id]: size
                }));
            }
        } catch {
            setTeamSizes(prev => ({
                ...prev,
                [id]: 0
            }));
        }
    };

    useEffect(() => {
        events.forEach((row: any) => {
            if (!teamSizes[row.id]) {
                getTeamMember(row.id);
            }
        });
    }, [events]);



    const getBookedItems = async (id: number) => {
        try {
            const res = await apiClient(`/admin/Events/bookedEvents/items/${id}`);
            const items: BookedItem[] = res?.data?.results || [];

            setBookedItems(prev => ({
                ...prev,
                [id]: items
            }));
        } catch {
            setBookedItems(prev => ({
                ...prev,
                [id]: []
            }));
        }
    };


    useEffect(() => {
        events.forEach((row: any) => {
            if (row.id && bookedItems[row.id] === undefined) {
                getBookedItems(row.id);
            }
        });
    }, [events, bookedItems]);



    const installationUninstallation = async (id: number) => {
        try {
            const res = await apiClient(`/admin/teamAssign/install/undinstall/${id}`);
            console.log(res, "-----------");

            const items: Installation[] = res?.data?.data || [];

            setInst((prev) => ({
                ...prev,
                [id]: items,
            }));
        } catch (error) {
            console.error(error);

            setInst((prev) => ({
                ...prev,
                [id]: [],
            }));
        }
    };

    useEffect(() => {
        setTimeout(() => {
            events.forEach((row: any) => {
                if (row.id && inst[row.id] === undefined) {
                    installationUninstallation(row.id);
                }
            });
        }, 2000)

    }, [events]);


    // ============================================================Resize Able Table=================================


    useEffect(() => {
        const thElements = document.querySelectorAll(".resizable-table th");

        thElements.forEach((th: any) => {
            const handleWheel = (e: WheelEvent) => {
                e.preventDefault(); // stop page scroll

                const delta = e.deltaY;

                const currentWidth = th.offsetWidth;

                // scroll up = increase, scroll down = decrease
                let newWidth = delta < 0
                    ? currentWidth + 20
                    : currentWidth - 20;

                // min width protection
                newWidth = Math.max(80, newWidth);

                th.style.width = newWidth + "px";
            };

            th.addEventListener("wheel", handleWheel, { passive: false });
        });

        return () => {
            thElements.forEach((th: any) => {
                th.removeEventListener("wheel", () => { });
            });
        };
    }, []);



    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
    
    {/* ========================================================= */}
    {/* 1. MOBILE VIEW: Stacked Cards (Visible on mobile only)     */}
    {/* ========================================================= */}
    <div className="block md:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
        {events && events.map((rows) => {
            const isLocked = isEventLocked(rows.status);
            return (
                <div key={rows?.id} className={`p-4 space-y-3 ${isLocked ? "bg-gray-50/60 dark:bg-gray-900/40" : "bg-white dark:bg-transparent"}`}>
                    
                    {/* Card Header: ID, Status & Lock */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                #{rows?.id}
                            </span>
                            {isLocked && (
                                <span title="Record is locked (Completed or Cancelled)" className="inline-flex items-center text-amber-500">
                                    <Lock size={13} />
                                </span>
                            )}
                        </div>
                        <div>
                            {isStaff || isLocked ? (
                                <span className={`text-xs font-semibold rounded-lg px-2.5 py-1 border inline-flex items-center gap-1.5 ${getStatusBadgeClass(rows.status)}`}>
                                    {isLocked && <Lock className="w-3 h-3 text-current" />}
                                    {getStatusLabel(rows.status)}
                                </span>
                            ) : (
                                <select
                                    value={normalizeStatusCode(rows.status)}
                                    onChange={(e) => handleUpdateStatus(rows.id, e.target.value)}
                                    className={`text-xs font-semibold rounded-lg px-2 py-1 border transition cursor-pointer focus:outline-none ${getStatusBadgeClass(rows.status)}`}
                                >
                                    {EVENT_STATUSES.map((st) => (
                                        <option key={st.code} value={st.code}>
                                            {st.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Client Name & Template */}
                    <div>
                        <span
                            className="block font-medium text-gray-800 text-base dark:text-white/90 cursor-pointer hover:text-blue-600"
                            onClick={() => {
                                setSelectedRow(rows);
                                setIsOpenes(true);
                            }}
                        >
                            {rows?.c_name}
                        </span>
                        {rows?.template_name && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 mt-1">
                                ⚡ {rows.template_name}
                            </span>
                        )}
                    </div>

                    {/* Grid Meta Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.02] p-2.5 rounded-lg border border-gray-100 dark:border-white/[0.03]">
                        <div>
                            <span className="block font-medium text-gray-400 dark:text-gray-500 text-[10px] uppercase">VANUS</span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{rows?.vanus || "-"}</span>
                        </div>
                        <div>
                            <span className="block font-medium text-gray-400 dark:text-gray-500 text-[10px] uppercase">Event Date</span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                {rows?.doe && !isNaN(new Date(rows.doe).getTime()) ? new Date(rows.doe).toISOString().split("T")[0] : "-"}
                            </span>
                        </div>
                        <div>
                            <span className="block font-medium text-gray-400 dark:text-gray-500 text-[10px] uppercase">Teams</span>
                            <span
                                className="text-blue-600 dark:text-blue-400 font-semibold cursor-pointer underline"
                                onClick={() => {
                                    setSelectedTeamId(rows.id);
                                    setSelectedTeamLocked(isLocked);
                                    setIsOpenTeam(true);
                                }}
                            >
                                {teamSizes[rows.id] ?? 0} Members
                            </span>
                        </div>
                        <div>
                            <span className="block font-medium text-gray-400 dark:text-gray-500 text-[10px] uppercase">Installation</span>
                            <span className="text-gray-700 dark:text-gray-300">
                                {inst[rows.id]?.[0]?.installing && !isNaN(new Date(inst[rows.id][0].installing).getTime())
                                    ? format(new Date(inst[rows.id][0].installing), "dd-MM hh:mm aa")
                                    : "-"}
                            </span>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        {!isStaff && (
                            (teamSizes[rows.id] ?? 0) > 0 ? (
                                <span className="rounded-lg px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                    Team Assigned
                                </span>
                            ) : (
                                <button
                                    disabled={isLocked}
                                    className={`flex items-center justify-center p-1.5 rounded-lg text-xs font-medium ${isLocked ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60" : "bg-blue-600 text-white"}`}
                                    onClick={() => {
                                        if (isLocked) return;
                                        openModal();
                                        getEventsByID(rows.id);
                                    }}
                                >
                                    <HiUserGroup size={16} /> Assign
                                </button>
                            )
                        )}

                        {/* Vehicle Button */}
                        <button
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${isLocked ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700" : "bg-emerald-600 text-white"}`}
                            onClick={() => {
                                setSelectedVehicleEventId(rows.id);
                                setSelectedTeamId(rows.id);
                                getEventsByID(rows.id);
                                setIsOpenvehicle(true);
                            }}
                        >
                            <FaTruck size={13} />
                            {isLocked ? "View" : (isStaff ? "Vehicle" : "Track")}
                        </button>

                        {!isStaff && !isLocked && (
                            <>
                                <button
                                    className="p-1.5 text-gray-500 hover:text-brand-500 dark:text-gray-400 transition"
                                    onClick={() => handleEditEvent(rows)}
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 transition"
                                    onClick={() => handleDeleteEvent(rows.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>

                </div>
            );
        })}
    </div>


    {/* ========================================================= */}
    {/* 2. DESKTOP VIEW: Traditional Table (Visible on md+ screens) */}
    {/* ========================================================= */}
    <div className="hidden md:block max-w-full overflow-x-scroll" style={{ whiteSpace: "nowrap" }}>
        <Table className="resizable-table">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Client Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">VANUS</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Start Date Of Event</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Teams</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">installation</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Uninstallation</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
                </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {events && events.map((rows) => {
                    const isLocked = isEventLocked(rows.status);
                    return (
                        <TableRow key={rows?.id} className={isLocked ? "bg-gray-50/60 dark:bg-gray-900/40" : ""}>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">#{rows?.id}</span>
                                    {isLocked && <Lock size={13} className="text-amber-500" />}
                                </div>
                            </TableCell>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                                <span
                                    className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 cursor-pointer hover:text-blue-600"
                                    onClick={() => { setSelectedRow(rows); setIsOpenes(true); }}
                                >
                                    {rows?.c_name}
                                </span>
                                {rows?.template_name && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 mt-0.5">
                                        ⚡ {rows.template_name}
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{rows?.vanus}</TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                {rows?.doe && !isNaN(new Date(rows.doe).getTime()) ? new Date(rows.doe).toISOString().split("T")[0] : "-"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                <span
                                    className={isLocked ? "cursor-pointer text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600" : "cursor-pointer text-blue-600 hover:underline"}
                                    onClick={() => { setSelectedTeamId(rows.id); setSelectedTeamLocked(isLocked); setIsOpenTeam(true); }}
                                >
                                    {teamSizes[rows.id] ?? 0}
                                    {isLocked && <Lock className="w-3 h-3 inline ml-1 text-amber-500" />}
                                </span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                {inst[rows.id]?.[0]?.installing && !isNaN(new Date(inst[rows.id][0].installing).getTime())
                                    ? format(new Date(inst[rows.id][0].installing), "dd-MM-yyyy hh:mm aa")
                                    : "-"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                {inst[rows.id]?.[0]?.uninstalling && !isNaN(new Date(inst[rows.id][0].uninstalling).getTime())
                                    ? format(new Date(inst[rows.id][0].uninstalling), "dd-MM-yyyy hh:mm aa")
                                    : "-"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start text-theme-sm">
                                {isStaff || isLocked ? (
                                    <span className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border inline-flex items-center gap-1.5 ${isLocked ? "opacity-90" : ""} ${getStatusBadgeClass(rows.status)}`}>
                                        {isLocked && <Lock className="w-3 h-3 text-current" />}
                                        {getStatusLabel(rows.status)}
                                    </span>
                                ) : (
                                    <select
                                        value={normalizeStatusCode(rows.status)}
                                        onChange={(e) => handleUpdateStatus(rows.id, e.target.value)}
                                        className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border transition cursor-pointer focus:outline-none ${getStatusBadgeClass(rows.status)}`}
                                    >
                                        {EVENT_STATUSES.map((st) => (
                                            <option key={st.code} value={st.code}>{st.label}</option>
                                        ))}
                                    </select>
                                )}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    {!isStaff && (
                                        (teamSizes[rows.id] ?? 0) > 0 ? (
                                            <span className={`rounded-lg px-2 py-1 text-xs font-medium ${isLocked ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"}`}>
                                                Team Assigned
                                            </span>
                                        ) : (
                                            <button
                                                disabled={isLocked}
                                                className={`flex items-center justify-center p-2 rounded-lg transition ${isLocked ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed opacity-60" : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"}`}
                                                onClick={() => {
                                                    if (isLocked) return;
                                                    openModal();
                                                    getEventsByID(rows.id);
                                                }}
                                            >
                                                <HiUserGroup size={16} />
                                            </button>
                                        )
                                    )}

                                    {isLocked ? (
                                        <button
                                            className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                                            onClick={() => {
                                                setSelectedVehicleEventId(rows.id);
                                                setSelectedTeamId(rows.id);
                                                getEventsByID(rows.id);
                                                setIsOpenvehicle(true);
                                            }}
                                        >
                                            <FaTruck size={14} className="text-gray-400" />
                                            <span className="flex items-center gap-1"><Lock size={11} className="text-gray-400" />View</span>
                                        </button>
                                    ) : (
                                        <button
                                            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
                                            onClick={() => {
                                                setSelectedVehicleEventId(rows.id);
                                                setSelectedTeamId(rows.id);
                                                getEventsByID(rows.id);
                                                setIsOpenvehicle(true);
                                            }}
                                        >
                                            <FaTruck size={14} />
                                            {isStaff ? "Update Vehicle" : ""}
                                        </button>
                                    )}

                                    {!isStaff && (
                                        <>
                                            <button
                                                disabled={isLocked}
                                                className={`p-1.5 transition ${isLocked ? "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-40" : "text-gray-500 hover:text-brand-500 dark:text-gray-400 cursor-pointer"}`}
                                                onClick={() => !isLocked && handleEditEvent(rows)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                disabled={isLocked}
                                                className={`p-1.5 transition ${isLocked ? "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-40" : "text-gray-500 hover:text-red-500 dark:text-gray-400 cursor-pointer"}`}
                                                onClick={() => !isLocked && handleDeleteEvent(rows.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    </div>

    {/* Modals remain unchanged */}
    <EventAssignModel eid={eid} isOpen={isOpen} openModal={openModal} closeModal={closeModal} />
    <ItemsModel selectedItems={selectedItems || []} isOpens={isOpens} setIsOpens={setIsOpens} />
    <EventDetailsModal isOpen={isOpenes} onClose={() => setIsOpenes(false)} data={selectedRow} bookedItems={bookedItems} />
    <AssignTeam isOpen={isOpenTeam} onClose={() => setIsOpenTeam(false)} id={selectedTeamId} isLocked={selectedTeamLocked} />
    <VehicleAssign isOpen={isOpenvehicle} onClose={() => setIsOpenvehicle(false)} id={selectedVehicleEventId || selectedTeamId || (eid && eid.id ? Number(eid.id) : null)} onEventStatusUpdated={getEvents} />
    <EventEditModal isOpen={isOpenEditEvent} onClose={() => setIsOpenEditEvent(false)} eventData={editEvent} onSuccess={getEvents} />
</div>
    );
}
