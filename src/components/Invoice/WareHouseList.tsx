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
                    <div className="max-w-full overflow-x-auto">
                        <Table className="resizable-table">
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Code</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Location</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Capacity</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Manager</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Contact</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">GST</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">License</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Address</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {warehouses && warehouses.length > 0 ? (
                                    warehouses.map((rows, index) => (
                                        <TableRow key={rows?.id}>
                                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {rows?.name}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {rows?.code}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {rows?.location || "-"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {rows?.capacity || "-"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {rows?.manager_name || "-"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {rows?.contact_number || "-"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {rows?.gst_number || "-"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {rows?.license_number || "-"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {rows?.address || "-"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-start">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(rows)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        ✏️Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(rows.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        🗑️Delete
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

