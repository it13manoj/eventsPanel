
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";

import { useEffect, useState } from "react";
import apiClient from "../../../hooks/api/apiClient";

export default function CategoryList() {
    const [categories, setCategories] = useState([]);

    const getCategories = async () => {
        try {
            const res = await apiClient.get("admin/category/find");
            setCategories(res?.data?.results || []);
        } catch (error) {
            console.log("Error fetching categories");
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    // ================= Resize Table =================
    useEffect(() => {
        const thElements = document.querySelectorAll(".resizable-table th");

        thElements.forEach((th) => {
            const handleWheel = (e) => {
                e.preventDefault();
                const delta = e.deltaY;
                const currentWidth = th.offsetWidth;

                let newWidth = delta < 0
                    ? currentWidth + 20
                    : currentWidth - 20;

                newWidth = Math.max(80, newWidth);
                th.style.width = newWidth + "px";
            };

            th.addEventListener("wheel", handleWheel, { passive: false });
        });

        return () => {
            thElements.forEach((th) => {
                th.removeEventListener("wheel", () => { });
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
                                Category Name
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Code
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Status
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
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {categories.map((item, index) => (
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

                                {/* Code */}
                                <TableCell className="px-5 py-4 text-gray-500">
                                    {item?.code}
                                </TableCell>

                                {/* Status */}
                                <TableCell className="px-5 py-4">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${item?.status == 1
                                            ? "bg-green-100 text-green-600"
                                            : "bg-red-100 text-red-600"
                                            }`}
                                    >
                                        {item?.status == 1 ? "Active" : "Inactive"}
                                    </span>
                                </TableCell>

                                {/* Description */}
                                <TableCell className="px-5 py-4 text-gray-500">
                                    {item?.description || "N/A"}
                                </TableCell>

                                <TableCell className="px-5 py-4 text-start">
                                    <div className="flex gap-2">

                                        {/* Edit Button */}
                                        <button onClick={() => handleEdit(rows)} className="text-blue-500 hover:text-blue-700">
                                            ✏️Edit
                                        </button>


                                        {/* Delete Button */}
                                        <button onClick={() => handleDelete(rows?.id)} className="text-red-500 hover:text-red-700">
                                            🗑️Delete
                                        </button>

                                    </div>
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            </div>
        </div>
    );
}