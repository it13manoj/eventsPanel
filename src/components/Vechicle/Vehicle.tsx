import { useEffect, useState } from "react";
import PageMeta from "../common/PageMeta";
import PageBreadcrumb from "../common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import apiClient from "../../hooks/api/apiClient";
import images from "../../hooks/api/apiImages";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import VehicleDetailModel from "../../model/VehicleDetailModel";
import { useModal } from "../../hooks/useModal";

export default function Vechicle() {
  const [vehicleData, setVehicleData] = useState<any[]>([]);
  const [editVehicle, setEditVehicle] = useState<any>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const getVehicle = async () => {
    try {
      const results = await apiClient.get("/admin/vehicleDetails/find");
      setVehicleData(results?.data?.results || []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  useEffect(() => {
    getVehicle();
  }, []);

  const handleEdit = (row: any) => {
    setEditVehicle(row);
    openModal();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      const res = await apiClient.delete(`/admin/vehicleDetails/delete/${id}`);
      if (res.data?.status === false) {
        toast.error(res.data?.message || "Failed to delete vehicle");
      } else {
        toast.success("Vehicle deleted successfully!");
        getVehicle();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error deleting vehicle");
    }
  };

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
        <Table className="resizable-table">
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
                "Images",
                "Status",
                "Actions"
              ].map((col, i) => (
                <TableCell
                  key={i}
                  isHeader
                  className="relative px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 resize-column"
                >
                  {col}
                  <span className="resizer"></span>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {vehicleData && vehicleData.length > 0 ? (
              vehicleData.map((rows) => (
                <TableRow key={rows?.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="font-medium text-gray-800 dark:text-white">
                      {rows?.id}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {rows?.name}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {rows?.vehicle_number}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {rows?.vehiclesTypes?.name} ({rows?.vehiclesTypes?.wheel} wheels)
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {rows?.owner_agency}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {rows?.contact}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {rows?.commission != null && rows?.commission !== "" ? "Agency" : "Owner"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {rows?.load_capacity}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {rows?.commission || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {rows?.insurance || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {rows?.image ? (
                      <img
                        src={`${images.baseUrl}/${rows?.image}`}
                        alt={rows?.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      "No image"
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <span className={`px-2 py-1 text-xs rounded-full ${rows?.status === 1 || rows?.status === "1" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {rows?.status === 1 || rows?.status === "1" ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(rows)}
                        className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                        title="Edit Vehicle"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rows.id)}
                        className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="px-5 py-4 text-center text-gray-500" colSpan={13}>
                  No vehicles found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <VehicleDetailModel
        isOpen={isOpen}
        closeModal={closeModal}
        vehicleData={editVehicle}
        onSuccess={getVehicle}
      />
    </div>
  );
}