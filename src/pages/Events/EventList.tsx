
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

import StockModel from "../../model/StockModel";
import { useModal } from "../../hooks/useModal";
import EventsTable from "./EventsTable";


export default function EventsList() {

    const { isOpen, openModal, closeModal } = useModal();

    return (
        <div>
            <PageMeta
                title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Event List" />
                <EventsTable />
            {/* <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-2">
                <div className="flex justify-end xl:py-2">
                 
                </div>

                
            </div> */}

            {/* Modal Component */}
            <StockModel
                isOpen={isOpen}
                openModal={openModal}
                closeModal={closeModal}
            />
        </div>
    )
}
