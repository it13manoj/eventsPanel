
import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

import StockModel from "../../model/StockModel";
import { useModal } from "../../hooks/useModal";
import BasicTableOne from "./BasicTableOne";

export default function StockPages() {
    const { isOpen, openModal, closeModal } = useModal();
    const [editStock, setEditStock] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAdd = () => {
        setEditStock(null);
        openModal();
    };

    const handleEdit = (stock: any) => {
        setEditStock(stock);
        openModal();
    };

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div>
            <PageMeta
                title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Inventory" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-2">
                <div className="flex justify-end xl:py-2">
                    <button
                        className="btn btn-success btn-update-event w-full sm:w-auto rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                        onClick={handleAdd}
                    >
                        Add Stock
                    </button>
                </div>

                <BasicTableOne 
                    refreshKey={refreshKey} 
                    onEdit={handleEdit} 
                    onRefresh={handleRefresh} 
                />
            </div>

            {/* Modal Component */}
            <StockModel
                isOpen={isOpen}
                closeModal={closeModal}
                stockData={editStock}
                onSuccess={handleRefresh}
            />
        </div>
    );
}
