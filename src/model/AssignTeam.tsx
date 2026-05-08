import { useEffect, useState } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";



export default function AssignTeam({
    isOpen,
    onClose,
    id
}: {
    isOpen: boolean;
    onClose: () => void;
    id: number | null;
}){
    if (!isOpen) return null; // ✅ FIXED
    const [items, setItems] = useState([{
        users: {
            id: 0,
            name: "",
            email: "",
            contact: ""
        }
    }])
    const getItems = async () => {
        try {
            const res = await apiClient.get(`/admin/teamAssign/find/${id}`)
            setItems(res.data.data.TeamAssignUser);

        } catch {

        }
    }
    useEffect(() => {
        getItems()
    }, [])

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-6xl w-full mx-auto p-0 rounded-2xl overflow-hidden [&>button]:hidden"
        >
             <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                <h2 className="text-lg font-semibold text-white">
                    Assign Teams
                </h2>
                <button
                    onClick={() => onClose()}
                    className="text-white hover:text-red-200 text-xl"
                >
                    ✕
                </button>
            </div>
            <div className="overflow-y-auto custom-scrollbar  p-5">
                
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
                                    Name
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Email
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Contact
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {items && items.map(rows => (
                                <TableRow key={rows?.users.id}>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 overflow-hidden rounded-full">
                                                {rows?.users.id}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                        <div>
                                            <div>
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {rows?.users.name}
                                                </span>

                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                        <div>
                                            <div>
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {rows?.users.email}
                                                </span>

                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                        <div>
                                            <div>
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {rows?.users.contact}
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