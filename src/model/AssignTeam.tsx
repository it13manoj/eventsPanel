import { useEffect, useState } from "react";
import apiClient from "../hooks/api/apiClient";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

export default function AssignTeam({
    isOpen,
    onClose,
    id
}: {
    isOpen: boolean;
    onClose: () => void;
    id: number | null;
}) {
    if (!isOpen) return null;

    const [items, setItems] = useState<any[]>([]);

    const getItems = async () => {
        try {
            if (id) {
                const res = await apiClient.get(`/admin/teamAssign/find/${id}`);
                setItems(res.data?.data || []);
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
        if (!window.confirm("Are you sure you want to remove this member from the team?")) return;
        try {
            await apiClient.delete(`/admin/teamAssignUser/delete/${assignUserId}`);
            toast.success("Team member removed successfully!");
            getItems();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to remove member");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-99999 p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-xl shadow-lg p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl font-bold"
                >
                    ✕
                </button>
                <div className="overflow-y-auto max-h-[75vh] custom-scrollbar p-2">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                        Assigned Team Members
                    </h3>

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
                                                <button
                                                    onClick={() => handleDeleteMember(rows.id)}
                                                    className="p-1.5 text-gray-500 hover:text-red-500 transition"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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