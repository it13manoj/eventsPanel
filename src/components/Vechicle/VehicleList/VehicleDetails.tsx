
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";

import { useEffect, useState } from "react";
import apiClient from "../../../hooks/api/apiClient";

export default function VehicleDetails({closeModal }: any) {
    const [vType, setvType] = useState([{
        id:0,
        name:"",
        wheel:"",
        capacity:"",
        isActive:"",
        description:"",
        fuel_type:"",
    }]);

    const getVechicleType = async () => {
        try {
            const res = await apiClient.get("/admin/vehicle/find");
            setvType(res?.data?.results || []);
        } catch (error) {
            console.log("Error fetching categories");
        }
    };

    useEffect(() => {
        getVechicleType();
    }, []);

    useEffect(() => {
        getVechicleType();
    }, [closeModal]);




 const handleEdit = (e:any)=>{
    console.log(e);
    
 }

const handleDelete = (e:any) =>{
 console.log(e);
 
}














// =============================Resize able table ========================
    useEffect(() => {
  const thElements = document.querySelectorAll(".resizable-table th");

  thElements.forEach((th: any) => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // stop page scroll

      const delta = e.deltaY;

      const currentWidth = th.offsetWidth;

      // scroll up = increase, scroll down = decrease
      let newWidth = delta < 0 
        ? currentWidth + 20 
        : currentWidth - 20;

      // min width protection
      newWidth = Math.max(80, newWidth);

      th.style.width = newWidth + "px";
    };

    th.addEventListener("wheel", handleWheel, { passive: false });
  });

  return () => {
    thElements.forEach((th: any) => {
      th.removeEventListener("wheel", () => {});
    });
  };
}, []);






    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table className="resizable-table">

                    {/* Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Sr.No.
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Vehicle Name
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Wheel Type
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Fuel Type
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Capacity
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Description
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {vType && vType.map((item, index) => (
                            <TableRow key={item?.id}>

                                {/* ID */}
                                <TableCell className="px-5 py-4">
                                    {index + 1}
                                </TableCell>

                                {/* Name */}
                                <TableCell className="px-5 py-4">
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {item?.name}
                                    </span>
                                </TableCell>

                                {/* wheel type */}
                                <TableCell className="px-5 py-4">
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {item?.wheel}
                                    </span>
                                </TableCell>

                                {/* fuel type */}
                                <TableCell className="px-5 py-4">
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {item?.fuel_type}
                                    </span>
                                </TableCell>

                                {/* capacity */}
                                <TableCell className="px-5 py-4">
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {item?.capacity}
                                    </span>
                                </TableCell>

                                {/* Description */}
                                <TableCell className="px-5 py-4 text-gray-500">
                                    {item?.description || "N/A"}
                                </TableCell>

                                <TableCell className="px-5 py-4 text-start">
                                    <div className="flex gap-2">

                                        {/* Edit Button */}
                                        <button onClick={() => handleEdit(item.id)} className="text-blue-500 hover:text-blue-700">
                                            ✏️Edit
                                        </button>


                                        {/* Delete Button */}
                                        <button onClick={() => handleDelete(item?.id)} className="text-red-500 hover:text-red-700">
                                            🗑️Delete
                                        </button>

                                    </div>
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            </div>
        </div>
    );
}