
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
import { Pencil, Trash2 } from "lucide-react";

interface CategoryListProps {
    onEdit?: (item: any) => void;
    refreshKey?: number;
}

export default function CategoryList({ onEdit, refreshKey }: CategoryListProps) {
    const [categories, setCategories] = useState<any[]>([]);

    const getCategories = async () => {
        try {
            const res = await apiClient.get("/admin/category/find");
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
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            await apiClient.delete(`/admin/category/delete/${id}`);
            toast.success("Category deleted successfully!");
            getCategories();
        } catch (error: any) {
            console.error("Delete failed:", error);
            toast.error(error?.response?.data?.message || "Failed to delete category");
        }
    };














    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
    
    {/* ========================================================= */}
    {/* 1. MOBILE VIEW: Stacked Cards (Visible on mobile only)     */}
    {/* ========================================================= */}
    <div className="block md:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
        {categories && categories.length > 0 ? (
            categories.map((item, index) => (
                <div key={item?.id} className="p-4 space-y-3 bg-white dark:bg-transparent">
                    
                    {/* Header: Sr.No, Name & Status */}
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
                            <span className="block text-[10px] text-gray-400 uppercase font-medium">Code</span>
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
                No Categories Found
            </div>
        )}
    </div>


    {/* ========================================================= */}
    {/* 2. DESKTOP VIEW: Traditional Table (Visible on md+ screens) */}
    {/* ========================================================= */}
    <div className="hidden md:block w-full max-w-full overflow-x-hidden">
        <Table className="w-full table-fixed border-collapse">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/70 dark:bg-gray-900/40">
                <TableRow>
                    <TableCell isHeader className="w-[6%] p-2.5 font-semibold text-gray-600 dark:text-gray-300 text-center text-xs">Sr.No.</TableCell>
                    <TableCell isHeader className="w-[24%] p-2.5 font-semibold text-gray-600 dark:text-gray-300 text-start text-xs break-words">Category Name</TableCell>
                    <TableCell isHeader className="w-[14%] p-2.5 font-semibold text-gray-600 dark:text-gray-300 text-start text-xs break-words">Code</TableCell>
                    <TableCell isHeader className="w-[12%] p-2.5 font-semibold text-gray-600 dark:text-gray-300 text-center text-xs">Status</TableCell>
                    <TableCell isHeader className="w-[32%] p-2.5 font-semibold text-gray-600 dark:text-gray-300 text-start text-xs break-words">Description</TableCell>
                    <TableCell isHeader className="w-[12%] p-2.5 font-semibold text-gray-600 dark:text-gray-300 text-center text-xs">Action</TableCell>
                </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {categories && categories.length > 0 ? (
                    categories.map((item, index) => (
                        <TableRow key={item?.id}>
                            <TableCell className="w-[6%] p-2.5 text-center font-medium text-gray-400 text-xs align-top">{index + 1}</TableCell>
                            <TableCell className="w-[24%] p-2.5 text-start whitespace-normal break-words leading-snug text-xs align-top">
                                <span className="font-semibold text-gray-800 dark:text-white">{item?.name}</span>
                            </TableCell>
                            <TableCell className="w-[14%] p-2.5 text-gray-500 whitespace-normal break-words font-mono text-xs align-top dark:text-gray-400">{item?.code || "-"}</TableCell>
                            <TableCell className="w-[12%] p-2.5 text-center text-xs align-top">
                                <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${Number(item?.status) === 1 ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"}`}>
                                    {Number(item?.status) === 1 ? "Active" : "Inactive"}
                                </span>
                            </TableCell>
                            <TableCell className="w-[32%] p-2.5 text-gray-600 dark:text-gray-300 text-start whitespace-normal break-words leading-snug text-xs align-top">{item?.description || "-"}</TableCell>
                            <TableCell className="w-[12%] p-2.5 text-center align-top">
                                <div className="flex items-center justify-center gap-1.5">
                                    <button 
                                        onClick={() => handleEdit(item)} 
                                        className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition cursor-pointer"
                                        title="Edit Category"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item?.id)} 
                                        className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition cursor-pointer"
                                        title="Delete Category"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="p-5 text-center text-gray-400">
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