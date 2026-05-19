import { useEffect, useState } from "react";
import { Modal } from "../components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import apiClient from "../hooks/api/apiClient";

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

        eventsName?: string;
        eventsId?: number;
        stockName?: string;
        stockId?: number
    }
    setAppendsAll: React.Dispatch<
        React.SetStateAction<any[]>
    >;

}

export default function AvaliableItems({
    isOpens,
    setIsOpens,
    getItemsIs_enabled,
    setAppendsAll
}: ItemsModelProps) {
    if (!isOpens) return null;
    const [inventory, setInventory] = useState<
        InventoryType[]
    >([]);
    const [remaining, setRemaining] = useState<any>({});
    const [quantities, setQuantities] = useState<any>(
        {}
    );
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
                        <div>
                            <span>Ware House</span>
                            <Table className="resizable-table">
                                {/* Table Header */}

                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell
                                            isHeader
                                            className="hidden px-5 py-3 text-start"
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
                                            className="hidden px-5 py-3 text-start"
                                        >
                                            Category
                                        </TableCell>

                                        <TableCell
                                            isHeader
                                            className="hidden px-5 py-3 text-start"
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
                                            className="hidden px-5 py-3 text-start"
                                        >
                                            Bad
                                        </TableCell>

                                        <TableCell
                                            isHeader
                                            className="hidden px-5 py-3 text-start"
                                        >
                                            Missing
                                        </TableCell>

                                        <TableCell
                                            isHeader
                                            className="hidden px-5 py-3 text-start"
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

                                {/* Table Body */}
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {inventory &&
                                        inventory.length > 0 ? (
                                        inventory.map((rows) => (
                                            <TableRow key={rows.id}>
                                                {/* ====================================================== */}
                                                {/* ID */}
                                                {/* ====================================================== */}

                                                <TableCell className="hidden px-5 py-4 text-start">
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

                                                <TableCell className="hidden px-5 py-4 text-start">
                                                    {rows?.categories?.name}
                                                </TableCell>

                                                {/* ====================================================== */}
                                                {/* SUB CATEGORY */}
                                                {/* ====================================================== */}

                                                <TableCell className="hidden px-5 py-4 text-start">
                                                    {rows?.subCategories?.name}
                                                </TableCell>

                                                {/* ====================================================== */}
                                                {/* QUANTITY */}
                                                {/* ====================================================== */}

                                                <TableCell className="px-5 py-4 text-start">
                                                    {rows.have_size ? (
                                                        <span

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

                                                <TableCell className="hidden px-5 py-4 text-start">
                                                    {rows.bad}
                                                </TableCell>

                                                {/* ====================================================== */}
                                                {/* MISSING */}
                                                {/* ====================================================== */}

                                                <TableCell className="hidden px-5 py-4 text-start">
                                                    {rows.missing}
                                                </TableCell>

                                                {/* ====================================================== */}
                                                {/* PRICE */}
                                                {/* ====================================================== */}

                                                <TableCell className="hidden px-5 py-4 text-start">
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
                        <div>
                            <span>Events</span>
                            <Table className="resizable-table">
                                {/* Table Header */}
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell
                                            isHeader
                                            className="hidden px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
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
                                            className="hidden px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
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
                                            className="hidden px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Category
                                        </TableCell>

                                        <TableCell
                                            isHeader
                                            className="hidden px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
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

                                                    <TableCell className="hidden px-5 py-4 sm:px-6 text-start">
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

                                                    <TableCell className="hidden px-5 py-4 sm:px-6 text-start">
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

                                                    <TableCell className="hidden px-5 py-4 sm:px-6 text-start">
                                                        <span className="block font-medium text-blue-600 text-theme-sm">
                                                            {rows.categories_name}
                                                        </span>
                                                    </TableCell>

                                                    {/* ================================================= */}
                                                    {/* SUB CATEGORY */}
                                                    {/* ================================================= */}

                                                    <TableCell className="hidden px-5 py-4 sm:px-6 text-start">
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
                                                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-green-400" onClick={() => {
                                                            setAppendsAll((prev: any) =>
                                                                prev.map((item: any) => {
                                                                    // match same category + subcategory
                                                                    if (
                                                                        item.categories.id === rows.categories_id &&
                                                                        item.subCategories.id ===
                                                                        rows.subCategories_id
                                                                    ) {
                                                                        return {
                                                                            ...item,

                                                                            inputs: {
                                                                                ...item.inputs,

                                                                                // =========================
                                                                                // UPDATE ONLY EVENT DATA
                                                                                // =========================

                                                                                eventsName:
                                                                                    rows.c_name || "",

                                                                                eventsId:
                                                                                    rows.event_id || 0,

                                                                                stockName:
                                                                                    rows.subCategories_name || "",

                                                                                stockId:
                                                                                    rows.id || 0,
                                                                            },
                                                                        };
                                                                    }

                                                                    return item;
                                                                })
                                                            );

                                                            // close popup
                                                            () => setIsOpens(false)
                                                        }}>
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
            </div>
            {/* Footer */}

        </Modal>
    );
}