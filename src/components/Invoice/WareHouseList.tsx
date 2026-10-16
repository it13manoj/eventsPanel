import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { useEffect, useState } from "react";
import apiClient from "../../hooks/api/apiClient";
import PageMeta from "../common/PageMeta";
import PageBreadcrumb from "../common/PageBreadCrumb";
import WareHouseModel from "../../model/WareHouseModel";
import { useModal } from "../../hooks/useModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Trash2 } from "lucide-react";

export default function WareHouseList() {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const { isOpen, openModal, closeModal } = useModal();
    const [editWarehouse, setEditWarehouse] = useState<any>(null);

    const getWarehouse = async () => {
        try {
            const results = await apiClient.get("/admin/warehouse/find");
            setWarehouses(results?.data?.results || []);
        } catch (error) {
            console.error("Error fetching warehouses:", error);
        }
    };

    useEffect(() => {
        getWarehouse();
    }, []);

    const handleAdd = () => {
        setEditWarehouse(null);
        openModal();
    };

    const handleEdit = (warehouse: any) => {
        setEditWarehouse(warehouse);
        openModal();
    };

    const handleDelete = async (id: any) => {
        if (!window.confirm("Are you sure you want to delete this warehouse?")) return;
        try {
            await apiClient.delete(`/admin/warehouse/delete/${id}`);
            toast.success("Warehouse deleted successfully!");
            getWarehouse();
        } catch (error: any) {
            console.error("Failed to delete warehouse:", error);
            toast.error(error?.response?.data?.message || "Failed to delete warehouse");
        }
    };

    const handleSuccess = () => {
        getWarehouse();
    };

    return (
        <div>
            <PageMeta
                title="Warehouse List | Events Management"
                description="Manage all warehouses"
            />
            <PageBreadcrumb pageTitle="Warehouse List" />
            <ToastContainer position="bottom-left" autoClose={3000} />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-4">
                <div className="flex justify-end mb-4">
                    <button
                        className="btn btn-success w-full sm:w-auto rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                        onClick={handleAdd}
                    >
                        Add Warehouse
                    </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">

                    {/* ========================================================= */}
                    {/* 1. MOBILE VIEW: Stacked Cards (Visible on mobile only)     */}
                    {/* ========================================================= */}
                    <div className="block md:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {warehouses && warehouses.length > 0 ? (
                            warehouses.map((rows, index) => (
                                <div key={rows?.id} className="p-4 space-y-3 bg-white dark:bg-transparent">

                                    {/* Header: Index, Name & Code */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400">#{index + 1}</span>
                                            <h3 className="font-semibold text-gray-800 text-base dark:text-white/90">
                                                {rows?.name}
                                            </h3>
                                        </div>
                                        {rows?.code && (
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                {rows.code}
                                            </span>
                                        )}
                                    </div>

                                    {/* Metadata Grid */}
                                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-gray-100 dark:border-white/[0.03]">
                                        <div>
                                            <span className="block text-[10px] text-gray-400 uppercase font-medium">Location</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{rows?.location || "-"}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 uppercase font-medium">Capacity</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{rows?.capacity || "-"}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 uppercase font-medium">Manager</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{rows?.manager_name || "-"}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 uppercase font-medium">Contact</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{rows?.contact_number || "-"}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 uppercase font-medium">GST Number</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{rows?.gst_number || "-"}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 uppercase font-medium">License</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{rows?.license_number || "-"}</span>
                                        </div>
                                    </div>

                                    {/* Full-width Address if present */}
                                    {rows?.address && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">Address: </span>
                                            {rows.address}
                                        </div>
                                    )}

                                    {/* Actions Bar */}
                                    <div className="flex items-center justify-end gap-2 pt-1">
                                        <button
                                            onClick={() => handleEdit(rows)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 transition"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rows.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 transition"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>

                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No Warehouses Found
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
                                    <TableCell isHeader className="w-[3.5%] p-2 font-semibold text-gray-600 dark:text-gray-300 text-center text-xs">#</TableCell>
                                    <TableCell isHeader className="w-[14%] p-2 font-semibold text-gray-600 dark:text-gray-300 text-start text-xs break-words">Name</TableCell>
                                    <TableCell isHeader className="w-[8%] p-2 font-semibold text-gray-600 dark:text-gray-300 text-start text-xs break-words">Code</TableCell>
                                    <TableCell isHeader className="w-[8.5%] p-2 font-semibold text-gray-600 dark:text-gray-300 text-start text-xs break-words">Location</TableCell>
                                    <TableCell isHeader className="w-[6%] p-2 font-semibold text-gray-600 dark:text-gray-300 text-center text-xs break-words">Capacity</TableCell>
                                    <TableCell isHeader className="w-[9%] p-2 font-semibold text-gray-600 dark:text-gray-300 text-start text-xs break-words">Manager</TableCell>
                                    <TableCell isHeader className="w-[9.5%] p-2 font-semibold text-gray-600 dark:text-gray-300 text-start text-xs break-words">Contact</TableCell>
                                    <TableCell isHeader className="w-[12%] p-2 font-semibold text-gray-600 dark:text-gray-300 text-start text-xs break-words">GST</TableCell>
                                    <TableCell isHeader className="w-[7%] p-2 font-semibold text-gray-600 dark:text-gray-300 text-start text-xs break-words">License</TableCell>
                                    <TableCell isHeader className="w-[14%] p-2 font-semibold text-gray-600 dark:text-gray-300 text-start text-xs break-words">Address</TableCell>
                                    <TableCell isHeader className="w-[8.5%] p-2 font-semibold text-gray-600 dark:text-gray-300 text-center text-xs">Actions</TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {warehouses && warehouses.length > 0 ? (
                                    warehouses.map((rows, index) => (
                                        <TableRow key={rows?.id}>
                                            <TableCell className="w-[3.5%] p-2 text-center font-medium text-gray-400 text-xs align-top">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="w-[14%] p-2 text-start whitespace-normal break-words leading-snug text-xs align-top">
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {rows?.name}
                                                </span>
                                            </TableCell>
                                            <TableCell className="w-[8%] p-2 text-start whitespace-normal break-words text-gray-500 font-mono text-xs align-top dark:text-gray-400">
                                                {rows?.code || "-"}
                                            </TableCell>
                                            <TableCell className="w-[8.5%] p-2 text-start whitespace-normal break-words text-gray-600 text-xs align-top dark:text-gray-300">
                                                {rows?.location || "-"}
                                            </TableCell>
                                            <TableCell className="w-[6%] p-2 text-center whitespace-normal break-words text-gray-600 text-xs align-top dark:text-gray-300">
                                                {rows?.capacity ?? "-"}
                                            </TableCell>
                                            <TableCell className="w-[9%] p-2 text-start whitespace-normal break-words text-gray-600 text-xs align-top dark:text-gray-300">
                                                {rows?.manager_name || "-"}
                                            </TableCell>
                                            <TableCell className="w-[9.5%] p-2 text-start whitespace-normal break-words text-gray-600 text-xs align-top dark:text-gray-300">
                                                {rows?.contact_number || "-"}
                                            </TableCell>
                                            <TableCell className="w-[12%] p-2 text-start whitespace-normal break-all font-mono text-gray-600 text-xs align-top dark:text-gray-300">
                                                {rows?.gst_number || "-"}
                                            </TableCell>
                                            <TableCell className="w-[7%] p-2 text-start whitespace-normal break-words text-gray-600 text-xs align-top dark:text-gray-300">
                                                {rows?.license_number || "-"}
                                            </TableCell>
                                            <TableCell className="w-[14%] p-2 text-start whitespace-normal break-words text-gray-600 text-xs leading-snug align-top dark:text-gray-300">
                                                {rows?.address || "-"}
                                            </TableCell>
                                            <TableCell className="w-[8.5%] p-2 text-center align-top">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => handleEdit(rows)}
                                                        className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition cursor-pointer"
                                                        title="Edit Warehouse"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(rows.id)}
                                                        className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition cursor-pointer"
                                                        title="Delete Warehouse"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={11} className="p-5 text-center text-gray-400">
                                            No Warehouses Found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Warehouse Edit / Create Modal */}
            <WareHouseModel
                isOpen={isOpen}
                openModal={openModal}
                closeModal={closeModal}
                warehouseData={editWarehouse}
                onSuccess={handleSuccess}
            />
        </div>
    );
}

