import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useState } from "react";
import { useModal } from "../../../hooks/useModal";
import SubCategoryList from "./SubCategoryList";
import SubCategoryModel from "../../../model/SubCategoryModel";

export default function SubCategory() {
    const { isOpen, openModal, closeModal } = useModal();
    const [editSubCategory, setEditSubCategory] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAdd = () => {
        setEditSubCategory(null);
        openModal();
    };

    const handleEdit = (item: any) => {
        setEditSubCategory(item);
        openModal();
    };

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div>
            <PageMeta
                title="Sub Category List | Events Management"
                description="Manage sub categories"
            />
            <PageBreadcrumb pageTitle="Sub Category List" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-2">
                <div className="flex justify-end xl:py-2">
                    <button
                        className="btn btn-success btn-update-event w-full sm:w-auto rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                        onClick={handleAdd}
                    >
                        Add Sub Category
                    </button>
                </div>

                <SubCategoryList onEdit={handleEdit} refreshKey={refreshKey} />
            </div>

            {/* Modal Component */}
            <SubCategoryModel
                isOpen={isOpen}
                openModal={openModal}
                closeModal={closeModal}
                subCategoryData={editSubCategory}
                onSuccess={handleSuccess}
            />
        </div>
    );
}

