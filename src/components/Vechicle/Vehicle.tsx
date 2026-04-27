import { useEffect, useState, } from "react";
import PageMeta from "../common/PageMeta";
import PageBreadcrumb from "../common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import apiClient from "../../hooks/api/apiClient";
import images from "../../hooks/api/apiImages";


export default function Vechicle() {
const [vehicleDate, setVehicalDate] = useState([{
  id:0,
  name:"",
  vehicle_number:"",
  vehiclesTypes:{
    name:"",
    wheel:""
  },
  owner_agency:"",
  contact:"",
  driver_contact:"",
  load_capacity:"",
  commission:"",
  insurance:"",
  image:"",
  status:""
}])

const getVehicle = async () =>{
  try{
      const results = await apiClient.get("/admin/vehicleDetails/find")
      setVehicalDate(results?.data?.results)
  }catch{

  }
}

useEffect(()=>{
        getVehicle()
},[0])



  // ✅ Resize Logic
  useEffect(() => {
    const resizers = document.querySelectorAll<HTMLSpanElement>(".resizer");

    resizers.forEach((resizer) => {
      let startX = 0;
      let startWidth = 0;

      const mouseDownHandler = (e: MouseEvent) => {
        const th = resizer.parentElement as HTMLElement;

        startX = e.clientX;
        startWidth = th.offsetWidth;

        const mouseMoveHandler = (e: MouseEvent) => {
          const dx = e.clientX - startX;
          th.style.width = `${startWidth + dx}px`;
        };

        const mouseUpHandler = () => {
          document.removeEventListener("mousemove", mouseMoveHandler);
          document.removeEventListener("mouseup", mouseUpHandler);
        };

        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
      };

      resizer.addEventListener("mousedown", mouseDownHandler);

      return () => {
        resizer.removeEventListener("mousedown", mouseDownHandler);
      };
    });
  }, []);

  return (
    <div>
      <PageMeta
        title="Vehicle Dashboard"
        description="Vehicle Management"
      />
      <PageBreadcrumb pageTitle="Vehicle" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12 overflow-x-auto">
        <Table  className="resizable-table">
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>

              {[
                "#",
                 "Vehicle Name",
                "Vehicle Number",
                "Vehicle Type",
                "Owner / Agent Name",
                "Contact Number",
                "Ownership Type",
                "Load Capacity",
                "Commission (%)",
                "Insurance Expiry",
                "images",
                "Status"
              ].map((col, i) => (
                <TableCell
                  key={i}
                  isHeader
                  className="relative px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 resize-column"
                >
                  {col}

                  {/* ✅ Resizer Handle */}
                  <span className="resizer"></span>
                </TableCell>
              ))}

            </TableRow>

          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {vehicleDate && vehicleDate.map((rows) => (
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
                                                {rows?.name}
                                            </span>

                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {rows?.vehicle_number}
                                </TableCell>
                                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    <div className="flex -space-x-2">
                                        {rows?.vehiclesTypes.name } ({rows?.vehiclesTypes.wheel })
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    <div className="flex -space-x-2">
                                        {rows?.owner_agency}
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {rows?.contact}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400" >
                                    {rows?.commission != null ? "Agency" : "Owner" }
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {rows?.load_capacity}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {rows?.commission}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {rows?.insurance}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <img src={`${images.baseUrl}/${rows?.image}`} />
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                   {rows?.status}
                                 
                                </TableCell>
                               
                            </TableRow>
                        ))}
                    </TableBody>
        </Table>
      </div>
    </div>
  );
}