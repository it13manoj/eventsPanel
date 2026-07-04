import { useEffect, useState } from "react";
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
}) {
    if (!isOpen) return null; // ✅ FIXED
    const [items, setItems] = useState([{
        id: 0,
        name: "",
        email: "",
        contact: ""
    }])
    const getItems = async () => {
        try {
            const res = await apiClient.get(`/admin/teamAssign/find/${id}`)
            setItems(res.data.data);

        } catch {

        }
    }
    useEffect(() => {
        getItems()
    }, [])

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center" >
            <div className="bg-white w-full max-w-6xl rounded-xl shadow-lg p-6 relative">
                <button
                    onClick={() => onClose()}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                >
                    ✕
                </button>
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
                                {items && items.map((rows, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 overflow-hidden rounded-full">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                                            <div>
                                                <div>
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {rows?.name}
                                                    </span>

                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                                            <div>
                                                <div>
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {rows?.email}
                                                    </span>

                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                                            <div>
                                                <div>
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {rows?.contact}
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
            </div>
        </div>

    );
}