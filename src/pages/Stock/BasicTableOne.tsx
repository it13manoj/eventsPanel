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

// ======================================================
// TYPES
// ======================================================

type SizeType = {
  id: number;
  size: string;
  quantity: number;
  unit: string;
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
};

// ======================================================
// COMPONENT
// ======================================================

export default function BasicTableOne() {
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
  }, []);

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

                  <TableCell className="px-5 py-4 text-start">
                    {rows.have_size ? (
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
                    <div className="space-y-3">
                      {/* ================= VERTICAL ================= */}

                      {rows.vertical_enabled &&
                        rows.verticalSizes
                          ?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-blue-600">
                              Vertical
                            </h4>

                            <div className="space-y-1">
                              {rows.verticalSizes.map(
                                (v) => (
                                  <div
                                    key={v.id}
                                    className="rounded-lg bg-blue-50 px-2 py-1 text-xs dark:bg-blue-900/20"
                                  >
                                    {v.size}
                                    {v.unit}
                                    {" - "}
                                    Qty:
                                    {v.quantity}
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
                            <h4 className="font-semibold text-green-600">
                              Horizontal
                            </h4>

                            <div className="space-y-1">
                              {rows.horizontalSizes.map(
                                (h) => (
                                  <div
                                    key={h.id}
                                    className="rounded-lg bg-green-50 px-2 py-1 text-xs dark:bg-green-900/20"
                                  >
                                    {h.size}
                                    {h.unit}
                                    {" - "}
                                    Qty:
                                    {h.quantity}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* ================= SIMPLE QTY ================= */}

                      {!rows.have_size && (
                        <span className="text-gray-500">
                          No Sizes
                        </span>
                      )}
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