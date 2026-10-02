import { useState } from "react";
import PageBreadcrumb from "../../common/PageBreadCrumb";
import PageMeta from "../../common/PageMeta";
import EmployeeModel from "../../../model/EmployeeModel";
import { useModal } from "../../../hooks/useModal";
import EmployeeList from "./EmployeeList";

export default function AddEmployee() {
    const { isOpen, openModal, closeModal } = useModal();
    const [editEmployee, setEditEmployee] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAdd = () => {
        setEditEmployee(null);
        openModal();
    };

    const handleEdit = (emp: any) => {
        setEditEmployee(emp);
        openModal();
    };

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div>
            <PageMeta
                title="Employee Dashboard | TailAdmin"
                description="Manage employees"
            />
            <PageBreadcrumb pageTitle="Employee" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-2">
                <div className="flex justify-end xl:py-2">
                    <button
                        className="btn btn-success btn-update-event w-full sm:w-auto rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                        onClick={handleAdd}
                    >
                        Add Employee
                    </button>
                </div>

                <EmployeeList
                    refreshKey={refreshKey}
                    onEdit={handleEdit}
                    onRefresh={handleRefresh}
                />
            </div>

            {/* Modal Component */}
            <EmployeeModel
                isOpen={isOpen}
                closeModal={closeModal}
                editData={editEmployee}
                onSuccess={handleRefresh}
            />
        </div>
    );
}

