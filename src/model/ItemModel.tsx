import { Modal } from "../components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";



interface BookedItem {
    id: number;
    categories_name: string;
    subCategories_name: string;
    width: string;
    height: string;
    qt: number;
    event_id: number;
    created_at: string;
    updated_at: string;
}

interface ItemsModelProps {
    isOpens: boolean;
    setIsOpens: (value: boolean) => void;
    selectedItems: BookedItem[];
}

export default function ItemsModel({
    isOpens,
    setIsOpens,
    selectedItems,
}: ItemsModelProps) {
    if (!isOpens) return null; // ✅ FIXED


    console.log(selectedItems);


    return (
        <Modal
            isOpen={isOpens}
            onClose={() => setIsOpens(false)}
             className="max-w-6xl w-full mx-auto p-0 rounded-2xl overflow-hidden [&>button]:hidden"
        >
               <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                <h2 className="text-lg font-semibold text-white">
                    Booked Items
                </h2>
                <button
                    onClick={() => setIsOpens(false)}
                    className="text-white hover:text-red-200 text-xl"
                >
                    ✕
                </button>
            </div>
                <div className="max-w-full overflow-x-auto  p-5">
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
                                    Categories
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Sub Categories
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Width
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Length
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Quntites
                                </TableCell>
                                 <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Price
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    status
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedItems?.length > 0 ? (
                                selectedItems.map((rows, index) => (
                                    <TableRow key={rows.id}>
                                        <TableCell>{index + 1}</TableCell>

                                        <TableCell>
                                            {rows.categories_name}
                                        </TableCell>

                                        <TableCell>
                                            {rows.subCategories_name}
                                        </TableCell>

                                        <TableCell>
                                            {rows.width}
                                        </TableCell>

                                        <TableCell>
                                            {rows.height}
                                        </TableCell>

                                        <TableCell>
                                            {rows.qt}
                                        </TableCell>

                                        <TableCell>
                                            {rows.qt > 0 ? "In Use" : "Available"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell  className="text-center py-4">
                                        No Data Found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                    </Table>
                </div>
            
        </Modal>
    );
}