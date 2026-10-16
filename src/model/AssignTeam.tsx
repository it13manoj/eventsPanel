import { useEffect, useState } from "react";
import apiClient from "../hooks/api/apiClient";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import { Trash2, Lock } from "lucide-react";
import { toast } from "react-toastify";

export default function AssignTeam({
    isOpen,
    onClose,
    id,
    isLocked = false,
    onRefresh
}: {
    isOpen: boolean;
    onClose: () => void;
    id: number | null;
    isLocked?: boolean;
    onRefresh?: () => void;
}) {
    if (!isOpen) return null;

    const [items, setItems] = useState<any[]>([]);

    const getItems = async () => {
        try {
            if (id) {
                const res = await apiClient.get(`/admin/teamAssign/find/${id}`);
                const data = res.data?.data || res.data?.results || [];
                const list = Array.isArray(data) ? data : (data?.TeamAssignUser || []);
                setItems(list);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (id) {
            getItems();
        }
    }, [id, isOpen]);

    const handleDeleteMember = async (assignUserId: number) => {
        if (isLocked) {
            toast.warning("Cannot remove team member. Event is Completed or Cancelled.");
            return;
        }
        if (!window.confirm("Are you sure you want to remove this member from the team?")) return;
        try {
            await apiClient.delete(`/admin/teamAssign/deleteAssignUsers/${assignUserId}`);
            toast.success("Team member removed successfully!");
            getItems();
            if (onRefresh) onRefresh();
        } catch (err: any) {
            try {
                await apiClient.delete(`/admin/teamAssignUser/delete/${assignUserId}`);
                toast.success("Team member removed successfully!");
                getItems();
                if (onRefresh) onRefresh();
            } catch (fallbackErr: any) {
                console.error("Error deleting member:", fallbackErr);
                toast.error(err.response?.data?.message || fallbackErr.response?.data?.message || "Failed to remove member");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-99999 p-3 sm:p-5 overflow-hidden overscroll-none">
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 relative max-h-[92vh] flex flex-col overflow-hidden" style={{ transform: "translateZ(0)" }}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-lg font-bold"
                >
                    ✕
                </button>
                <div className="overflow-y-auto max-h-[75vh] custom-scrollbar p-1 sm:p-2 flex-1">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            Assigned Team Members
                            {isLocked && (
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 inline-flex items-center gap-1">
                                    <Lock size={12} />
                                    Read Only (Locked)
                                </span>
                            )}
                        </h3>
                    </div>

                    {isLocked && (
                        <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-amber-800 dark:text-amber-200 text-xs sm:text-sm font-semibold">
                            <Lock size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
                            <span>This event is finalized (Completed or Cancelled). Team member assignments are locked and cannot be modified.</span>
                        </div>
                    )}

                    <div className="max-w-full overflow-x-auto">
                        <Table className="resizable-table">
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        #
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Name
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Email
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Contact
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Action
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {items && items.length > 0 ? (
                                    items.map((rows, index) => (
                                        <TableRow key={rows?.id || index}>
                                            <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start">
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {rows?.name}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                                                {rows?.email}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                                                {rows?.contact}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start">
                                                {isLocked ? (
                                                    <span className="text-xs text-gray-400 font-medium italic flex items-center gap-1">
                                                        <Lock size={11} /> Locked
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDeleteMember(rows.id)}
                                                        className="p-1.5 text-gray-500 hover:text-red-500 transition cursor-pointer"
                                                        title="Remove Member"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-gray-400">
                                            No team members assigned
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}