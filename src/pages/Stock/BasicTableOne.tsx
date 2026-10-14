import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import { useEffect, useState } from "react";
import apiClient from "../../hooks/api/apiClient";
import Items from "../../model/Items";
import { useModal } from "../../hooks/useModal";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

// ======================================================
// TYPES
// ======================================================

interface BasicTableOneProps {
  refreshKey?: number;
  onEdit?: (item: any) => void;
  onRefresh?: () => void;
}

type SizeType = {
  id: number;
  size: string;
  quantity: number;
  unit: string;
  allocated_qty?: number;
  available_qty?: number;
  available_ratio?: number;
};

type InventoryType = {
  id: number;

  categories: {
    name: string;
  };

  subCategories: {
    name: string;
  };

  wareHouse: {
    id: number;
    name: string;
  };

  width: string;
  height: string;
  color: string;
  quantity: number;
  quality: string;
  price: number;

  good: number;
  bad: number;
  missing: number;

  have_size: boolean;

  vertical_enabled: boolean;
  horizontal_enabled: boolean;

  verticalSizes: SizeType[];
  horizontalSizes: SizeType[];

  total_quantity?: number;
  allocated_quantity?: number;
  available_quantity?: number;
  available_ratio?: number;
  available_percent?: number;
  matched_active_events?: Array<{
    event_id: number;
    event_name: string;
    template_name?: string;
    allocated: number;
  }>;
};

// ======================================================
// COMPONENT
// ======================================================

export default function BasicTableOne({ refreshKey = 0, onEdit, onRefresh }: BasicTableOneProps) {
  const [inventory, setInventory] = useState<
    InventoryType[]
  >([]);

  // ======================================================
  // GET INVENTORY
  // ======================================================

  const getInventory = async () => {
    try {
      const results = await apiClient.get(
        "/admin/Inverntory/find"
      );

      setInventory(results?.data?.results || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getInventory();
  }, [refreshKey]);

  // ======================================================
  // DELETE INVENTORY
  // ======================================================

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this stock item?")) return;
    try {
      const res = await apiClient.delete(`/admin/Inverntory/delete/${id}`);
      if (res.data?.status === false) {
        toast.error(res.data?.message || "Failed to delete stock item");
      } else {
        toast.success("Stock item deleted successfully!");
        getInventory();
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error deleting stock item");
    }
  };

  // ======================================================
  // RESIZABLE TABLE
  // ======================================================

  useEffect(() => {
    const thElements =
      document.querySelectorAll(
        ".resizable-table th"
      );

    thElements.forEach((th: any) => {
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();

        const delta = e.deltaY;

        const currentWidth = th.offsetWidth;

        let newWidth =
          delta < 0
            ? currentWidth + 20
            : currentWidth - 20;

        newWidth = Math.max(80, newWidth);

        th.style.width = newWidth + "px";
      };

      th.addEventListener(
        "wheel",
        handleWheel,
        {
          passive: false,
        }
      );
    });

    return () => {
      thElements.forEach((th: any) => {
        th.removeEventListener(
          "wheel",
          () => {}
        );
      });
    };
  }, []);

  // ======================================================
  // QUANTITY API
  // ======================================================

  const [quantities, setQuantities] = useState<any>(
    {}
  );

  const getQunity = async (id: number) => {
    try {
      const res = await apiClient.get(
        `/admin/Inverntory/items/calculate/${id}`
      );

      setQuantities((prev: any) => ({
        ...prev,
        [id]: res.data.results,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    inventory.forEach((row: any) => {
      if (row.have_size) {
        getQunity(row.id);
      }
    });
  }, [inventory]);

  // ======================================================
  // MODAL
  // ======================================================

  const {
    isOpen,
    openModal,
    closeModal,
  } = useModal();

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const handleOpen = (id: number) => {
    setSelectedId(id);
    openModal();
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table className="resizable-table">
          {/* ====================================================== */}
          {/* HEADER */}
          {/* ====================================================== */}

          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-start"
              >
                #
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-start"
              >
                WareHouse
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-start"
              >
                Category
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-start"
              >
                SubCategory
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-start"
              >
                Total Qty
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-start"
              >
                In Use (Active)
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-start"
              >
                Available (Ratio)
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-start"
              >
                Good
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-start"
              >
                Bad
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-start"
              >
                Missing
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-start"
              >
                Price
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-start"
              >
                Sizes
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-start"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* ====================================================== */}
          {/* BODY */}
          {/* ====================================================== */}

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {inventory &&
            inventory.length > 0 ? (
              inventory.map((rows) => (
                <TableRow key={rows.id}>
                  {/* ====================================================== */}
                  {/* ID */}
                  {/* ====================================================== */}

                  <TableCell className="px-5 py-4 text-start">
                    {rows.id}
                  </TableCell>

                  {/* ====================================================== */}
                  {/* WAREHOUSE */}
                  {/* ====================================================== */}

                  <TableCell className="px-5 py-4 text-start">
                    {rows?.wareHouse?.name}
                  </TableCell>

                  {/* ====================================================== */}
                  {/* CATEGORY */}
                  {/* ====================================================== */}

                  <TableCell className="px-5 py-4 text-start">
                    {rows?.categories?.name}
                  </TableCell>

                  {/* ====================================================== */}
                  {/* SUB CATEGORY */}
                  {/* ====================================================== */}

                  <TableCell className="px-5 py-4 text-start">
                    {rows?.subCategories?.name}
                  </TableCell>

                  {/* ====================================================== */}
                  {/* QUANTITY */}
                  {/* ====================================================== */}

                  {/* ====================================================== */}
                  {/* TOTAL QUANTITY */}
                  {/* ====================================================== */}

                  <TableCell className="px-5 py-4 text-start font-semibold text-gray-900 dark:text-white">
                    {rows.total_quantity !== undefined ? (
                      rows.total_quantity
                    ) : rows.have_size ? (
                      <span
                        onClick={() =>
                          handleOpen(rows.id)
                        }
                        className="cursor-pointer text-blue-500 underline"
                      >
                        {quantities[rows.id] ??
                          "Loading..."}
                      </span>
                    ) : (
                      rows.quantity
                    )}
                  </TableCell>

                  {/* ====================================================== */}
                  {/* IN USE (ACTIVE / UNCOMPLETED EVENTS) */}
                  {/* ====================================================== */}

                  <TableCell className="px-5 py-4 text-start">
                    {(rows.allocated_quantity || 0) > 0 ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          {rows.allocated_quantity} in use
                        </span>
                        {rows.matched_active_events && rows.matched_active_events.length > 0 && (
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            {rows.matched_active_events.map((ev, i) => (
                              <div key={i} className="truncate max-w-[140px]" title={`${ev.event_name} (${ev.allocated} pcs)${ev.template_name ? ` [${ev.template_name}]` : ""}`}>
                                • {ev.event_name}: <strong>{ev.allocated}</strong>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">0 (Idle)</span>
                    )}
                  </TableCell>

                  {/* ====================================================== */}
                  {/* AVAILABLE (REMAINING RATIO) */}
                  {/* ====================================================== */}

                  <TableCell className="px-5 py-4 text-start">
                    <div className="space-y-1 min-w-[125px]">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-sm font-bold ${(rows.available_quantity || 0) > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                          {rows.available_quantity !== undefined ? rows.available_quantity : rows.quantity} avail
                        </span>
                        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {rows.available_percent !== undefined ? rows.available_percent : 100}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${(rows.available_percent || 0) > 50 ? "bg-emerald-500" : (rows.available_percent || 0) > 20 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${Math.min(100, Math.max(0, rows.available_percent !== undefined ? rows.available_percent : 100))}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                        Ratio: {rows.available_quantity !== undefined ? rows.available_quantity : rows.quantity} / {rows.total_quantity !== undefined ? rows.total_quantity : rows.quantity}
                      </div>
                    </div>
                  </TableCell>

                  {/* ====================================================== */}
                  {/* GOOD */}
                  {/* ====================================================== */}

                  <TableCell className="px-5 py-4 text-start">
                    {rows.good}
                  </TableCell>

                  {/* ====================================================== */}
                  {/* BAD */}
                  {/* ====================================================== */}

                  <TableCell className="px-5 py-4 text-start">
                    {rows.bad}
                  </TableCell>

                  {/* ====================================================== */}
                  {/* MISSING */}
                  {/* ====================================================== */}

                  <TableCell className="px-5 py-4 text-start">
                    {rows.missing}
                  </TableCell>

                  {/* ====================================================== */}
                  {/* PRICE */}
                  {/* ====================================================== */}

                  <TableCell className="px-5 py-4 text-start">
                    ₹ {rows.price}
                  </TableCell>

                  {/* ====================================================== */}
                  {/* SIZES */}
                  {/* ====================================================== */}

                  <TableCell className="px-5 py-4 text-start">
                    <div className="space-y-3 min-w-[150px]">
                      {/* ================= VERTICAL ================= */}

                      {rows.vertical_enabled &&
                        rows.verticalSizes
                          ?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-blue-600 text-xs mb-1">
                              Vertical
                            </h4>

                            <div className="space-y-1">
                              {rows.verticalSizes.map(
                                (v) => (
                                  <div
                                    key={v.id}
                                    className="rounded-lg bg-blue-50/80 dark:bg-blue-900/20 px-2.5 py-1.5 text-xs border border-blue-100 dark:border-blue-800/40"
                                  >
                                    <div className="flex items-center justify-between font-semibold text-blue-700 dark:text-blue-300">
                                      <span>{v.size} {v.unit}</span>
                                      <span className={v.available_qty !== undefined && v.available_qty <= 0 ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>
                                        {v.available_qty !== undefined ? v.available_qty : v.quantity} Avail
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-600 dark:text-gray-400">
                                      <span>Total: <strong>{v.quantity}</strong></span>
                                      {(v.allocated_qty || 0) > 0 && (
                                        <span className="text-amber-600 dark:text-amber-400">In Use: <strong>{v.allocated_qty}</strong></span>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* ================= HORIZONTAL ================= */}

                      {rows.horizontal_enabled &&
                        rows
                          .horizontalSizes
                          ?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-green-600 text-xs mb-1">
                              Horizontal
                            </h4>

                            <div className="space-y-1">
                              {rows.horizontalSizes.map(
                                (h) => (
                                  <div
                                    key={h.id}
                                    className="rounded-lg bg-green-50/80 dark:bg-green-900/20 px-2.5 py-1.5 text-xs border border-green-100 dark:border-green-800/40"
                                  >
                                    <div className="flex items-center justify-between font-semibold text-green-700 dark:text-green-300">
                                      <span>{h.size} {h.unit}</span>
                                      <span className={h.available_qty !== undefined && h.available_qty <= 0 ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>
                                        {h.available_qty !== undefined ? h.available_qty : h.quantity} Avail
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-600 dark:text-gray-400">
                                      <span>Total: <strong>{h.quantity}</strong></span>
                                      {(h.allocated_qty || 0) > 0 && (
                                        <span className="text-amber-600 dark:text-amber-400">In Use: <strong>{h.allocated_qty}</strong></span>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* ================= SIMPLE QTY ================= */}

                      {!rows.have_size && (
                        <span className="text-xs text-gray-400 italic">
                          Standard Stock
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onEdit ? onEdit(rows) : null}
                        className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                        title="Edit Stock"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rows.id)}
                        className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                        title="Delete Stock"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="p-5">
                  No Data Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ====================================================== */}
      {/* ITEMS MODAL */}
      {/* ====================================================== */}

      <Items
        isOpen={isOpen}
        closeModal={closeModal}
        selectedId={selectedId}
      />
    </div>
  );
}