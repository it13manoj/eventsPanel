import { useState } from "react";
import PageBreadcrumb from "../../common/PageBreadCrumb";
import PageMeta from "../../common/PageMeta";
import EmployeeModel from "../../../model/EmployeeModel";
import { useModal } from "../../../hooks/useModal";
import { useAuth } from "../../../hooks/auth";
import EmployeeList from "./EmployeeList";
import { Plus, Users } from "lucide-react";

export default function AddEmployee() {
    const { isOpen, openModal, closeModal } = useModal();
    const { canEdit } = useAuth();
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
        <div className="space-y-5 p-2 sm:p-4">
            <PageMeta
                title="Employee Directory | Admin Dashboard"
                description="Manage employees, roles, shifts, and salaries"
            />
            <PageBreadcrumb pageTitle="Employee Directory" />

            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Users size={22} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            Staff & Employee Directory
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Search, filter, manage employee profiles, work shifts, and payment scales
                        </p>
                    </div>
                </div>

                {canEdit("employees") && (
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                    >
                        <Plus size={16} />
                        Add Employee
                    </button>
                )}
            </div>

            <EmployeeList
                refreshKey={refreshKey}
                onEdit={handleEdit}
                onRefresh={handleRefresh}
            />

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

