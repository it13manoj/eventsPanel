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

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">

        {/* ========================================================= */}
        {/* 1. MOBILE VIEW: Stacked Cards (Visible on mobile only)     */}
        {/* ========================================================= */}
        <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {vehicleData && vehicleData.length > 0 ? (
            vehicleData.map((rows) => (
              <div key={rows?.id} className="py-4 space-y-3">

                {/* Top Row: ID, Vehicle Image / Avatar, Name & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {rows?.image ? (
                      <img
                        src={`${images.baseUrl}/${rows?.image}`}
                        alt={rows?.name}
                        className="w-12 h-12 object-cover rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 shrink-0"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                        {rows?.name?.charAt(0) || "V"}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-semibold text-gray-400">#{rows?.id}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                        {rows?.name}
                      </h3>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {rows?.vehicle_number}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-semibold ${rows?.status === 1 || rows?.status === "1"
                      ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                    {rows?.status === 1 || rows?.status === "1" ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-medium">Vehicle Type</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {rows?.vehiclesTypes?.name} ({rows?.vehiclesTypes?.wheel} wheels)
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-medium">Owner / Agent</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{rows?.owner_agency || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-medium">Contact</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{rows?.contact || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-medium">Ownership</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {rows?.commission != null && rows?.commission !== "" ? "Agency" : "Owner"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-medium">Load Capacity</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{rows?.load_capacity || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-medium">Commission</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{rows?.commission ? `${rows.commission}%` : "N/A"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[10px] text-gray-400 uppercase font-medium">Insurance Expiry</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{rows?.insurance || "N/A"}</span>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleEdit(rows)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(rows.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">
              No vehicles found
            </div>
          )}
        </div>


        {/* ========================================================= */}
        {/* 2. DESKTOP VIEW: Traditional Table (Visible on md+ screens) */}
        {/* ========================================================= */}
        <div className="hidden md:block overflow-x-auto">
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
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {rows?.commission != null && rows?.commission !== "" ? "Agency" : "Owner"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {rows?.load_capacity}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {rows?.commission || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {rows?.insurance || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {rows?.image ? (
                        <img
                          src={`${images.baseUrl}/${rows?.image}`}
                          alt={rows?.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            e.currentTarget.style.display = 'none';
                          }}
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