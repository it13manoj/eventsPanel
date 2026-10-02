import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useState } from "react";
import CategoryModel from "../../../model/CategoryModel";
import { useModal } from "../../../hooks/useModal";
import CategoryList from "./CotegoryList";

export default function Category() {
    const { isOpen, openModal, closeModal } = useModal();
    const [editCategory, setEditCategory] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAdd = () => {
        setEditCategory(null);
        openModal();
    };

    const handleEdit = (item: any) => {
        setEditCategory(item);
        openModal();
    };

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div>
            <PageMeta
                title="Category List | Events Management"
                description="Manage event categories"
            />
            <PageBreadcrumb pageTitle="Category List" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-2">
                <div className="flex justify-end xl:py-2">
                    <button
                        className="btn btn-success btn-update-event w-full sm:w-auto rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                        onClick={handleAdd}
                    >
                        Add Category
                    </button>
                </div>

                <CategoryList onEdit={handleEdit} refreshKey={refreshKey} />
            </div>

            {/* Modal Component */}
            <CategoryModel
                isOpen={isOpen}
                openModal={openModal}
                closeModal={closeModal}
                categoryData={editCategory}
                onSuccess={handleSuccess}
            />
        </div>
    );
}

