import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useModal } from "../../../hooks/useModal";
import VehicleDetails from "./VehicleDetails";
import VehicleModal from "../../../model/VehicleModel";

export default function AddVehicle() {
    const { isOpen, openModal, closeModal } = useModal();
    const [editVehicle, setEditVehicle] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAdd = () => {
        setEditVehicle(null);
        openModal();
    };

    const handleEdit = (vehicle: any) => {
        setEditVehicle(vehicle);
        openModal();
    };

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div>
            <PageMeta
                title="Vehicle Types | TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
                description="Manage vehicle types"
            />
            <PageBreadcrumb pageTitle="Vehicle Types" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-2">
                <div className="flex justify-end xl:py-2">
                    <button
                        className="btn btn-success btn-update-event w-full sm:w-auto rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                        onClick={handleAdd}
                    >
                        Add Vehicle Type
                    </button>
                </div>

                <VehicleDetails 
                    refreshKey={refreshKey} 
                    onEdit={handleEdit} 
                    onRefresh={handleRefresh} 
                />
            </div>

            {/* Modal Component */}
            <VehicleModal
                isOpen={isOpen}
                closeModal={closeModal}
                editData={editVehicle}
                onSuccess={handleRefresh}
            />
        </div>
    );
}

