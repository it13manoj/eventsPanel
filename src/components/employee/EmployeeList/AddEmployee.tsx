
import PageBreadcrumb from "../../common/PageBreadCrumb";
import PageMeta from "../../common/PageMeta";
import EmployeeModel from "../../../model/EmployeeModel";
import { useModal } from "../../../hooks/useModal";
import EmplyeeList from "./EmployeeList";

export default function AddEmployee() {

    const { isOpen, openModal, closeModal } = useModal();

    return (
        <div>
            <PageMeta
                title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Employee" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-2">
                <div className="flex justify-end xl:py-2">
                    {/* Fix: Use openModal here */}
                    <button
                        className="btn btn-success btn-update-event w-full sm:w-auto rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                        onClick={openModal} // <-- open modal instead of closeModal
                    >
                        Add
                    </button>
                </div>

                <EmplyeeList />
            </div>

            {/* Modal Component */}
            <EmployeeModel
                isOpen={isOpen}
                openModal={openModal}
                closeModal={closeModal}
            />
        </div>
    )
}
