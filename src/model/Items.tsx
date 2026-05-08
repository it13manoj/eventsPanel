import { useEffect, useState } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";




export default function Items({ isOpen, closeModal, selectedId }: any) {
    if (!isOpen) return null; // ✅ FIXED
    const [items, setItems ]= useState([{
        id:0,
        ft:"",
        qt:""
        }])
    const getItems = async () =>{
            try{
                const res = await apiClient.get(`/admin/Inverntory/items/find/${selectedId}`)
                    setItems(res.data.results)
            }catch{

            }
    }
useEffect(()=>{
            getItems()
},[])

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[100%] p-6 lg:p-10"
        >
            <div className="overflow-y-auto custom-scrollbar">
                <h5 className="mb-4 font-semibold text-gray-800 text-xl dark:text-white">
                    Items
                </h5>
                <div className="max-w-full overflow-x-auto">
                    <Table className="resizable-table">
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    #
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Size
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Quntity
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    status
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {items && items.map(rows=>(
                            <TableRow key={rows?.id}>
                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 overflow-hidden rounded-full">
                                            {rows?.id}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                    <div>
                                        <div>
                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {rows?.ft}
                                            </span>

                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                    <div>
                                        <div>
                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {rows?.qt}
                                            </span>

                                        </div>
                                    </div>
                                </TableCell>
                                 <TableCell className="px-5 py-4 sm:px-6 text-start">
                                    <div>
                                        <div>
                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                               {"Active"}
                                            </span>

                                        </div>
                                    </div>
                                </TableCell>
                                </TableRow>
                        ))}
                                </TableBody>

                            </Table>
                        </div>
                </div>
        </Modal>
    );
}