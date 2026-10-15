
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";

import { useEffect, useState } from "react";
import apiClient from "../../../hooks/api/apiClient";
import { toast } from "react-toastify";

interface SubCategoryListProps {
    onEdit?: (item: any) => void;
    refreshKey?: number;
}

export default function SubCategoryList({ onEdit, refreshKey }: SubCategoryListProps) {
    const [categories, setCategories] = useState<any[]>([]);

    const getCategories = async () => {
        try {
            const res = await apiClient.get("/admin/subCategory/find");
            setCategories(res?.data?.results || []);
        } catch (error) {
            console.log("Error fetching categories");
        }
    };

    useEffect(() => {
        getCategories();
    }, [refreshKey]);

    const handleEdit = (item: any) => {
        if (onEdit) onEdit(item);
    };

    const handleDelete = async (id: any) => {
        if (!window.confirm("Are you sure you want to delete this subcategory?")) return;
        try {
            await apiClient.delete(`/admin/subCategory/delete/${id}`);
            toast.success("SubCategory deleted successfully!");
            getCategories();
        } catch (error: any) {
            console.error("Delete failed:", error);
            toast.error(error?.response?.data?.message || "Failed to delete subcategory");
        }
    };







    // =============================Resize able table ========================
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
        {categories && categories.length > 0 ? (
            categories.map((item, index) => (
                <div key={item?.id} className="p-4 space-y-3 bg-white dark:bg-transparent">
                    
                    {/* Header: Sr.No, Sub-Category Name & Status */}
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <span className="text-xs font-semibold text-gray-400">#{index + 1}</span>
                            <h3 className="font-semibold text-gray-800 text-base dark:text-white/90">
                                {item?.name}
                            </h3>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            Number(item?.status) === 1
                                ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                        }`}>
                            {Number(item?.status) === 1 ? "Active" : "Inactive"}
                        </span>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-gray-100 dark:border-white/[0.03]">
                        <div>
                            <span className="block text-[10px] text-gray-400 uppercase font-medium">Category Name</span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{item?.categories?.name || "-"}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] text-gray-400 uppercase font-medium">Sub-Category Code</span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{item?.code || "-"}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="block text-[10px] text-gray-400 uppercase font-medium">Description</span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{item?.description || "N/A"}</span>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                            onClick={() => handleEdit(item)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 transition"
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={() => handleDelete(item?.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 transition"
                        >
                            🗑️ Delete
                        </button>
                    </div>

                </div>
            ))
        ) : (
            <div className="p-8 text-center text-gray-400 text-sm">
                No Sub-Categories Found
            </div>
        )}
    </div>


    {/* ========================================================= */}
    {/* 2. DESKTOP VIEW: Traditional Table (Visible on md+ screens) */}
    {/* ========================================================= */}
    <div className="hidden md:block max-w-full overflow-x-auto">
        <Table className="resizable-table">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Sr.No.</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Category Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Sub-Category Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Sub-Category Code</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Description</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
                </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {categories && categories.length > 0 ? (
                    categories.map((item, index) => (
                        <TableRow key={item?.id}>
                            <TableCell className="px-5 py-4">{index + 1}</TableCell>
                            <TableCell className="px-5 py-4">
                                <span className="font-medium text-gray-800 dark:text-white">{item?.categories?.name}</span>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                                <span className="font-medium text-gray-800 dark:text-white">{item?.name}</span>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500">{item?.code}</TableCell>
                            <TableCell className="px-5 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${Number(item?.status) === 1 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                    {Number(item?.status) === 1 ? "Active" : "Inactive"}
                                </span>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500">{item?.description || "N/A"}</TableCell>
                            <TableCell className="px-5 py-4 text-start">
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700">✏️Edit</button>
                                    <button onClick={() => handleDelete(item?.id)} className="text-red-500 hover:text-red-700">🗑️Delete</button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={7} className="p-5 text-center text-gray-400">
                            No Data Found
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
</div>
    );
}