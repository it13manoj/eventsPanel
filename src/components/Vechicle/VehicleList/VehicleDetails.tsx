import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import { useEffect, useState } from "react";
import apiClient from "../../../hooks/api/apiClient";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

export default function VehicleDetails({ refreshKey = 0, onEdit, onRefresh }: any) {
    const [vType, setvType] = useState<any[]>([]);

    const getVehicleType = async () => {
        try {
            const res = await apiClient.get("/admin/vehicle/find");
            setvType(res?.data?.results || []);
        } catch (error) {
            console.error("Error fetching vehicle types:", error);
        }
    };

    useEffect(() => {
        getVehicleType();
    }, [refreshKey]);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this vehicle type?")) return;
        try {
            const res = await apiClient.delete(`/admin/vehicle/delete/${id}`);
            if (res.data?.status === false) {
                toast.error(res.data?.message || "Failed to delete vehicle type");
            } else {
                toast.success("Vehicle type deleted successfully!");
                getVehicleType();
                if (onRefresh) onRefresh();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error deleting vehicle type");
        }
    };

    // Resizable table
    useEffect(() => {
        const thElements = document.querySelectorAll(".resizable-table th");

        thElements.forEach((th: any) => {
            const handleWheel = (e: WheelEvent) => {
                e.preventDefault();
                const delta = e.deltaY;
                const currentWidth = th.offsetWidth;
                let newWidth = delta < 0 ? currentWidth + 20 : currentWidth - 20;
                newWidth = Math.max(80, newWidth);
                th.style.width = newWidth + "px";
            };

            th.addEventListener("wheel", handleWheel, { passive: false });
        });

        return () => {
            thElements.forEach((th: any) => {
                th.removeEventListener("wheel", () => {});
            });
        };
    }, []);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table className="resizable-table">
                    {/* Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Sr.No.
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Vehicle Name
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Wheel Type
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Fuel Type
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Capacity
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Description
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {vType && vType.length > 0 ? (
                            vType.map((item, index) => (
                                <TableRow key={item?.id}>
                                    {/* ID */}
                                    <TableCell className="px-5 py-4">
                                        {index + 1}
                                    </TableCell>

                                    {/* Name */}
                                    <TableCell className="px-5 py-4">
                                        <span className="font-medium text-gray-800 dark:text-white">
                                            {item?.name}
                                        </span>
                                    </TableCell>

                                    {/* wheel type */}
                                    <TableCell className="px-5 py-4">
                                        <span className="font-medium text-gray-800 dark:text-white">
                                            {item?.wheel}
                                        </span>
                                    </TableCell>

                                    {/* fuel type */}
                                    <TableCell className="px-5 py-4">
                                        <span className="font-medium text-gray-800 dark:text-white">
                                            {item?.fuel_type}
                                        </span>
                                    </TableCell>

                                    {/* capacity */}
                                    <TableCell className="px-5 py-4">
                                        <span className="font-medium text-gray-800 dark:text-white">
                                            {item?.capacity}
                                        </span>
                                    </TableCell>

                                    {/* Description */}
                                    <TableCell className="px-5 py-4 text-gray-500">
                                        {item?.description || "N/A"}
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="px-5 py-4 text-start">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => onEdit ? onEdit(item) : null}
                                                className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                title="Edit"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item?.id)}
                                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell className="px-5 py-4 text-center text-gray-500" colSpan={7}>
                                    No vehicle types found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}