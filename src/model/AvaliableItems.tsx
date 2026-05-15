import { useEffect, useState } from "react";
import { Modal } from "../components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import apiClient from "../hooks/api/apiClient";



interface ItemsModelProps {
    isOpens: boolean;
    setIsOpens: (value: boolean) => void;
    getItemsIs_enabled: {
        categoryId: number;
        subCategoryId: number;
        isEnable: boolean;

        dateOfEvent?: string;
        bookedDate?: string;

        width?: string;
        height?: string;

        value?: string;

        vertical?: boolean;
        horizontal?: boolean;

        verticalValue?: string;
        horizontalValue?: string;

        verticalUnit?: string;
        horizontalUnit?: string;

        verticalPcs?: string;
        horizontalPcs?: string;
    }

}

export default function AvaliableItems({
    isOpens,
    setIsOpens,
    getItemsIs_enabled

}: ItemsModelProps) {
    if (!isOpens) return null;
    const [remaining, setRemaining] = useState<any>({});
    const [bookEventRecords, setBookEventsRecords] = useState([{
        "id": 1,
        "c_name": "Rahul",
        "nodb": "2026-05-22T11:06:58.000Z",
        "doe": "2026-05-15T00:00:00.000Z",
        "vanus": "Marrige Events",
        "v_location": "Buxar",
        "booked_event_id": 1,
        "categories_id": 1,
        "categories_name": "Truss",
        "subCategories_id": 1,
        "subCategories_name": "500MM*600MM",
        "vertical": 1,
        "horizontal": 1,
        "verticalValue": "3",
        "verticalPcs": 20,
        "verticalUnit": "mm",
        "horizontalValue": "3",
        "horizontalPcs": 50,
        "horizontalUnit": "mm",
        "qt": 0,
        "event_id": 1,
        "created_at": "2026-05-15T11:21:45.000Z",
        "updated_at": "2026-05-15T11:21:45.000Z"
    }])
    const fetchBookedEvents = async () => {
        try {

            if (
                !getItemsIs_enabled.bookedDate ||
                !getItemsIs_enabled.categoryId ||
                !getItemsIs_enabled.subCategoryId
            ) {
                return;
            }

            const results = await apiClient.get(
                `/admin/Events/bookedEvents/itemsDate/${encodeURIComponent(
                    getItemsIs_enabled.bookedDate
                )}/${getItemsIs_enabled.categoryId}/${getItemsIs_enabled.subCategoryId}`
            );

            setBookEventsRecords(results.data?.results || []);

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchBookedEvents();
    }, [getItemsIs_enabled])




    const formatDate = (date: string) => {
        return new Date(date).toLocaleString();
    };



    
useEffect(() => {
  const calculatedRemaining: any = {};

  // ============================================
  // CLEAN NUMBER
  // ============================================

  const cleanNumber = (value: any) => {
    return parseFloat(
      String(value || "0").replace(
        /[^\d.]/g,
        ""
      )
    );
  };

  // ============================================
  // LOOP
  // ============================================

  bookEventRecords.forEach(
    (rows: any, index: number) => {
      // ============================================
      // SIZE BASED
      // ============================================

      if (
        rows.vertical == 1 ||
        rows.horizontal == 1
      ) {
        // =========================
        // BOOKED VALUES
        // =========================

        const bookedVertical =
          cleanNumber(
            rows.verticalPcs
          );

        const bookedHorizontal =
          cleanNumber(
            rows.horizontalPcs
          );

        // =========================
        // CURRENT INPUT VALUES
        // =========================

        const currentVertical =
          cleanNumber(
            getItemsIs_enabled.verticalPcs
          );

        const currentHorizontal =
          cleanNumber(
            getItemsIs_enabled.horizontalPcs
          );

        // =========================
        // REMAINING
        // =========================

        const vertical =
          bookedVertical -
          currentVertical;

        const horizontal =
          bookedHorizontal -
          currentHorizontal;

        calculatedRemaining[index] = {
          vertical,
          horizontal,
        };
      } else {
        // ============================================
        // NORMAL QUANTITY
        // ============================================

        const bookedQty =
          Number(rows.qt || 0);

        const currentQty =
          Number(
            getItemsIs_enabled.value || 0
          );

        const qty =
          bookedQty - currentQty;

        calculatedRemaining[index] = {
          qty,
        };
      }
    }
  );

  // ============================================
  // SET STATE
  // ============================================

  setRemaining(calculatedRemaining);
}, [
  bookEventRecords,
  getItemsIs_enabled,
]);


    // ============================================================Resize Able Table=================================


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
                th.removeEventListener("wheel", () => { });
            });
        };
    }, []);
    return (
        <Modal
            isOpen={isOpens}
            onClose={() => setIsOpens(false)}

            className="max-w-8xl w-full mx-auto p-0 rounded-2xl overflow-hidden [&>button]:hidden"
        >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                <h2 className="text-lg font-semibold text-white">
                    Event Details
                </h2>
                <button
                    onClick={() => setIsOpens(false)}
                    className="text-white hover:text-red-200 text-xl"
                >
                    ✕
                </button>
            </div>

            {/* Body */}
            <div className="p-6 bg-gray-50 space-y-6">
                <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Table>
                            {/* Table Header */}
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        WaresHouse
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Address
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Distance
                                    </TableCell>
                                    {getItemsIs_enabled.isEnable == true ? <>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Vertical
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Horizontal
                                        </TableCell>
                                    </> :
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Total Stock
                                        </TableCell>

                                    }

                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Remaining Stock
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Action
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            {/* Table Body */}
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">

                                <TableRow>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 overflow-hidden rounded-full">

                                            </div>
                                            <div>
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    "Name"
                                                </span>
                                                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                                    "Name"
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                </TableRow>

                            </TableBody>
                        </Table>

                        <Table className="resizable-table">
                            {/* Table Header */}
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Client Name
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Events Type
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Address
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Start Date
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        End Date
                                    </TableCell>

                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Category
                                    </TableCell>

                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Sub Category
                                    </TableCell>
                                    {getItemsIs_enabled.isEnable == true ? <>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Vertical |  Horizontal
                                        </TableCell>

                                    </> :
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Total Stock
                                        </TableCell>

                                    }
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Remainin Items
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Action
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            {/* Table Body */}
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {bookEventRecords &&
                                    bookEventRecords.map(
                                        (rows: any, index: number) => (
                                            <TableRow
                                                key={rows.id || index}
                                            >
                                                {/* ================================================= */}
                                                {/* CLIENT NAME */}
                                                {/* ================================================= */}

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {rows.c_name}
                                                    </span>
                                                </TableCell>

                                                {/* ================================================= */}
                                                {/* EVENT TYPE */}
                                                {/* ================================================= */}

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {rows.vanus}
                                                    </span>
                                                </TableCell>

                                                {/* ================================================= */}
                                                {/* LOCATION */}
                                                {/* ================================================= */}

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {rows.v_location}
                                                    </span>
                                                </TableCell>

                                                {/* ================================================= */}
                                                {/* EVENT DATE */}
                                                {/* ================================================= */}

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {formatDate(rows.doe)}
                                                    </span>
                                                </TableCell>

                                                {/* ================================================= */}
                                                {/* BOOKED DATE */}
                                                {/* ================================================= */}

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {formatDate(rows.nodb)}
                                                    </span>
                                                </TableCell>

                                                {/* ================================================= */}
                                                {/* CATEGORY */}
                                                {/* ================================================= */}

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="block font-medium text-blue-600 text-theme-sm">
                                                        {rows.categories_name}
                                                    </span>
                                                </TableCell>

                                                {/* ================================================= */}
                                                {/* SUB CATEGORY */}
                                                {/* ================================================= */}

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="block font-medium text-purple-600 text-theme-sm">
                                                        {rows.subCategories_name}
                                                    </span>
                                                </TableCell>

                                                {/* ================================================= */}
                                                {/* BOOKED ITEM DETAILS */}
                                                {/* ================================================= */}

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    {/* ================= SIZE ENABLE ================= */}

                                                    {rows.vertical ||
                                                        rows.horizontal ? (
                                                        <div className="space-y-2">
                                                            {/* ================= VERTICAL ================= */}

                                                            {rows.vertical == 1 && (
                                                                <div className="rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
                                                                    <span className="block text-xs font-semibold text-blue-600">
                                                                        Vertical
                                                                    </span>

                                                                    <span className="text-sm text-gray-700 dark:text-white">
                                                                        Size:
                                                                        {" "}
                                                                        {
                                                                            rows.verticalValue
                                                                        }
                                                                        {
                                                                            rows.verticalUnit
                                                                        }
                                                                    </span>

                                                                    <br />

                                                                    <span className="text-sm text-gray-700 dark:text-white">
                                                                        PCS:
                                                                        {" "}
                                                                        {
                                                                            rows.verticalPcs
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* ================= HORIZONTAL ================= */}

                                                            {rows.horizontal ==
                                                                1 && (
                                                                    <div className="rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20">
                                                                        <span className="block text-xs font-semibold text-green-600">
                                                                            Horizontal
                                                                        </span>

                                                                        <span className="text-sm text-gray-700 dark:text-white">
                                                                            Size:
                                                                            {" "}
                                                                            {
                                                                                rows.horizontalValue
                                                                            }
                                                                            {
                                                                                rows.horizontalUnit
                                                                            }
                                                                        </span>

                                                                        <br />

                                                                        <span className="text-sm text-gray-700 dark:text-white">
                                                                            PCS:
                                                                            {" "}
                                                                            {
                                                                                rows.horizontalPcs
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    ) : (
                                                        <div className="rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-800">
                                                            <span className="text-sm font-medium text-gray-700 dark:text-white">
                                                                Quantity:
                                                                {" "}
                                                                {rows.qt}
                                                            </span>
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* ================================================= */}
                                                {/* REMAINING */}
                                                {/* ================================================= */}

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    {rows.vertical ||
                                                        rows.horizontal ? (
                                                        <span
                                                            className={`block font-medium text-theme-sm ${remaining[index]
                                                                    ?.horizontal <
                                                                    0 ||
                                                                    remaining[index]
                                                                        ?.vertical < 0
                                                                    ? "text-red-500"
                                                                    : "text-green-500"
                                                                }`}
                                                        >
                                                            V:
                                                            {" "}
                                                            {remaining[index]
                                                                ?.vertical ??
                                                                0}

                                                            {" | "}

                                                            H:
                                                            {" "}
                                                            {remaining[index]
                                                                ?.horizontal ??
                                                                0}
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className={`block font-medium text-theme-sm ${remaining[index]
                                                                    ?.qty < 0
                                                                    ? "text-red-500"
                                                                    : "text-green-500"
                                                                }`}
                                                        >
                                                            {remaining[index]
                                                                ?.qty ?? 0}
                                                        </span>
                                                    )}
                                                </TableCell>

                                                {/* ================================================= */}
                                                {/* STATUS */}
                                                {/* ================================================= */}

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-green-400">
                                                        Sync
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
            {/* Footer */}

        </Modal>
    );
}