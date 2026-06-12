import { useEffect, useState } from "react";
import { Modal } from "../components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import apiClient from "../hooks/api/apiClient";
import { getDistance } from "../hooks/Distance";

type SizeType = {
    id: number;
    size: string;
    quantity: number;
    unit: string;
};
interface StockAddToEventsType {
    stock: any[];
    events: any[];
}
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

    synced?: boolean;
};
type ItemState = {
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
};
interface ItemsModelProps {
    isOpens: boolean;
    hideAvailableButton: { [key: number]: boolean };

    setHideAvailableButton: React.Dispatch<
        React.SetStateAction<{ [key: number]: boolean }>
    >;
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
    appendsAll: any[];
    setStockAddToEvents: React.Dispatch<
        React.SetStateAction<{
            stock: any[];
            events: any[];
        }>
    >;

    itemsDate: React.Dispatch<
        React.SetStateAction<ItemState>
    >;
    stockAddToEvents: StockAddToEventsType

}

export default function AvaliableItems({
    isOpens,
    setIsOpens,
    getItemsIs_enabled,
    setStockAddToEvents,
    itemsDate,
    stockAddToEvents,
    setHideAvailableButton
}: ItemsModelProps) {
    if (!isOpens) return null;
    const [inventory, setInventory] = useState<
        InventoryType[]
    >([]);






    const [remaining, setRemaining] = useState<any>({});
    const [remainingS, setRemainingS] = useState<any>({});
    const [quantities, setQuantities] = useState<any>(
        {}
    );
    const [results_booked, results_bookedSet] = useState<{
        stock: { [key: number]: number };
        event: { [key: number]: number };
    }>({
        stock: {},
        event: {}
    });


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
        "updated_at": "2026-05-15T11:21:45.000Z",
        synced: true
    }])


    const handleAdd = (
        type: "stock" | "event",
        item: any
    ) => {

        // ========================= STOCK =========================
        if (type === "stock") {
            let newAddedQt = getItemsIs_enabled.horizontalPcs || getItemsIs_enabled.verticalPcs || getItemsIs_enabled.value || 0;
            const verticalQty = Number(
                item.verticalSizes?.[0]?.quantity || 0
            );

            const horizontalQty = Number(
                item.horizontalSizes?.[0]?.quantity || 0
            );

            const quantity = Number(
                item.quantity || 0
            );

            // use only existing qty
            const usedQty =
                verticalQty > 0
                    ? verticalQty
                    : horizontalQty > 0 ? horizontalQty : quantity;

            // prevent duplicate add
          

            // add stock
            setStockAddToEvents((prev: any) => ({
                ...prev,

                stock: [
                    ...prev.stock,
                    {
                        stockId: item.id,
                        stockname: item.wareHouse.name,
                        Categories: item.categories.id,
                        SubCategoreis: item.subCategories.id,
                        quntiry: Number(newAddedQt) > usedQty ? usedQty : newAddedQt,
                    },
                ],
            }));

            // update inventory
            setInventory((prev: InventoryType[]) =>
                prev.map((row) => {

                    if (row.id !== item.id) return row;

                    return {
                        ...row,

                        synced: true,

                        verticalSizes: row.verticalSizes.map(
                            (size) => ({
                                ...size,

                                quantity:
                                    size.quantity > 0
                                        ? Math.max(
                                            0,
                                            Number(size.quantity) - usedQty
                                        )
                                        : 0,
                            })
                        ),

                        horizontalSizes: row.horizontalSizes.map(
                            (size) => ({
                                ...size,

                                quantity:
                                    size.quantity > 0
                                        ? Math.max(
                                            0,
                                            Number(size.quantity) - usedQty
                                        )
                                        : 0,
                            })
                        ),

                        quantity:
                            Number(row.quantity || 0) > 0
                                ? Math.max(
                                    0,
                                    Number(row.quantity) - usedQty
                                )
                                : 0,
                    };
                })
            );

            // update selected available qty
            itemsDate((prev: any) => ({

                ...prev,

                verticalPcs:
                    Number(prev.verticalPcs ?? 0) > 0
                        ? String(
                            Math.max(
                                0,
                                Number(prev.verticalPcs) - usedQty
                            )
                        )
                        : prev.verticalPcs,

                horizontalPcs:
                    Number(prev.horizontalPcs ?? 0) > 0
                        ? String(
                            Math.max(
                                0,
                                Number(prev.horizontalPcs) - usedQty
                            )
                        )
                        : prev.horizontalPcs,

                quantity:
                    Number(prev.quantity ?? 0) > 0
                        ? Math.max(
                            0,
                            Number(prev.quantity) - usedQty
                        )
                        : 0,
            }));
        }

        // ========================= EVENT =========================
        if (type === "event") {
            let newAddedQt = getItemsIs_enabled.horizontalPcs || getItemsIs_enabled.verticalPcs || getItemsIs_enabled.value || 0;
            const verticalQty = Number(
                item.verticalPcs || 0
            );

            // console.log(item);
            
            const horizontalQty = Number(
                item.horizontalPcs || 0
            );
            const qt = Number(
                item.qt || 0
            );
            const usedQty =
                verticalQty > 0
                    ? verticalQty
                    : horizontalQty > 0 ? horizontalQty : qt;

            // prevent duplicate sync
           
            console.log(usedQty);
            

            // if (alreadyAdded) return;

            // add event

            // update records
            setBookEventsRecords((prev: any[]) =>
                prev.map((row) => {
                  
                    if (row.id !== item.id) return row;

                    return {
                        ...row,

                        synced: true,

                        verticalPcs:
                            Number(row.verticalPcs || 0) > 0
                                ? Math.max(
                                    0,
                                    Number(row.verticalPcs) - usedQty
                                )
                                : row.verticalPcs,

                        horizontalPcs:
                            Number(row.horizontalPcs || 0) > 0
                                ? Math.max(
                                    0,
                                    Number(row.horizontalPcs) - usedQty
                                )
                                : row.horizontalPcs,

                        qt: Number(row.qt || 0) > 0
                            ? Math.max(
                                0,
                                Number(row.qt) - usedQty
                            )
                            : row.qt,
                    };
                })
            );

            setStockAddToEvents((prev: any) => ({
                ...prev,

                events: [
                    ...prev.events,
                    {
                        id: item.id,
                        name: item.vanus,
                        categories: item.categories_id,
                        subcategores: item.subCategories_id,
                        quntity: Number(newAddedQt) > usedQty ? usedQty : newAddedQt,
                    },
                ],
            }));
            // update selected qty
            itemsDate((prev: any) => ({

                ...prev,

                verticalPcs:
                    Number(prev.verticalPcs || 0) > 0
                        ? String(
                            Math.max(
                                0,
                                Number(prev.verticalPcs) - usedQty
                            )
                        )
                        : prev.verticalPcs,

                horizontalPcs:
                    Number(prev.horizontalPcs || 0) > 0
                        ? String(
                            Math.max(
                                0,
                                Number(prev.horizontalPcs) - usedQty
                            )
                        )
                        : prev.horizontalPcs,

                qt:
                    Number(prev.qt || 0) > 0
                        ? String(
                            Math.max(
                                0,
                                Number(prev.qt) - usedQty
                            )
                        )
                        : prev.qt,
            }));
        }
    };


    const getInventory = async () => {
        try {
            const results = await apiClient.get(
                `/admin/Inverntory/items/eventStocks/${getItemsIs_enabled.bookedDate}/${getItemsIs_enabled.categoryId}/${getItemsIs_enabled.subCategoryId}`
            );

            setInventory(results?.data?.results?.results || []);
            let array: { [key: number]: number } = {};
            let events: { [key: number]: number } = {};

            results?.data?.results?.results_booked?.forEach((rows: any) => {

                const stockIds = JSON.parse(rows.stock_id || "[]");
                const quantities = JSON.parse(rows.st_qt || "[]");

                stockIds.forEach((value: number, key: number) => {

                    if (array[value]) {
                        array[value] += Number(quantities[key]);
                    } else {
                        array[value] = Number(quantities[key]);
                    }
                });

                const eventsId = JSON.parse(rows.event_stock_id || "[]");
                const eventQT = JSON.parse(rows.evnt_qt || "[]");

                eventsId.forEach((value: number, key: number) => {

                    if (events[value]) {
                        events[value] += Number(eventQT[key]);
                    } else {
                        events[value] = Number(eventQT[key]);
                    }
                });
            });

            results_bookedSet({
                stock: { ...array },
                event: { ...events }
            });

            // results_bookedSet(results?.data?.results?.results_booked || []);
        } catch (error) {
            // console.log(error);
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
            // console.log(error);
        }
    };

    useEffect(() => {
        fetchBookedEvents();
    }, [])




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



    // ---------------------------------------------



    useEffect(() => {
        const calculatedRemainings: any = {};

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
        // console.log(inventory);


        inventory.forEach(
            (rows: any, index: number) => {
                // ============================================
                // SIZE BASED
                // ============================================
                // console.log(rows);
                if (
                    rows.verticalSizes.length == 1 ||
                    rows.horizontalSizes.length == 1
                ) {
                    // =========================
                    // BOOKED VALUES
                    // =========================


                    const bookedVertical =
                        rows.verticalSizes.find(
                            (r: any) => r.unit === getItemsIs_enabled.verticalUnit
                        )?.quantity;

                    const bookedHorizontal =
                        rows.horizontalSizes.find(
                            (r: any) => r.unit === getItemsIs_enabled.horizontalUnit
                        )?.quantity;

                    // console.log(bookedVertical, bookedHorizontal);

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

                    calculatedRemainings[index] = {
                        vertical,
                        horizontal,
                    };
                } else {
                    // ============================================
                    // NORMAL QUANTITY
                    // ============================================

                    const bookedQty =
                        Number(rows.good || 0);




                    const currentQty =
                        Number(
                            getItemsIs_enabled.value || 0
                        );
                    ;

                    const qty =
                        bookedQty - currentQty;

                    calculatedRemainings[index] = {
                        qty,
                    };
                }
            }
        );

        // ============================================
        // SET STATE
        // ============================================

        setRemainingS(calculatedRemainings);
    }, [
        inventory,
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

    console.log(results_booked);
const fetchDistance = async () => {
  const result = await getDistance(
    "Patna, Bihar",
    "Delhi, India"
  );

  if (result) {
    console.log("Distance:", result.distance);
    console.log("Duration:", result.duration);
  }
};

fetchDistance();

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
                    onClick={() => {

                        setIsOpens(false);

                        setHideAvailableButton((prev) => ({
                            ...prev,
                            [getItemsIs_enabled.subCategoryId]: true
                        }));
                    }}
                    className="text-white hover:text-red-200 text-xl"
                >
                    Done
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
                                    {inventory &&
                                        inventory.length > 0 ? (
                                        inventory.map((rows, index) => (
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
                                                                                    {v.quantity <= (results_booked?.stock?.[rows.id]) ? 0 : v.quantity}
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
                                                                                    {h.quantity <= (results_booked?.stock?.[rows.id]) ? 0 : h.quantity}
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
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    {rows.verticalSizes.length > 0 ||
                                                        rows.horizontalSizes.length > 0 ? (
                                                        <span
                                                            className={`block font-medium text-theme-sm ${remainingS[index]
                                                                ?.horizontal <
                                                                0 ||
                                                                remainingS[index]
                                                                    ?.vertical < 0
                                                                ? "text-red-500"
                                                                : "text-green-500"
                                                                }`}
                                                        >
                                                            V:
                                                            {" "}
                                                            {remainingS[index]
                                                                ?.vertical ??
                                                                0}

                                                            {" | "}

                                                            H:
                                                            {" "}
                                                            {remainingS[index]
                                                                ?.horizontal ??
                                                                0}
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className={`block font-medium text-theme-sm ${remainingS[index]
                                                                ?.qty < 0
                                                                ? "text-red-500"
                                                                : "text-green-500"
                                                                }`}
                                                        >
                                                            {remainingS[index]
                                                                ?.qty ?? 0}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">

                                                    {(() => {

                                                        const isDisabled =
                                                            rows.verticalSizes?.some(
                                                                (v: any) =>
                                                                    v.quantity <= (results_booked?.stock?.[rows.id])
                                                            ) ||
                                                            rows.horizontalSizes?.some(
                                                                (h: any) =>
                                                                    h.quantity <= (results_booked?.stock?.[rows.id] || 0)
                                                            );

                                                        return (
                                                            <>

                                                                <span
                                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium
                                                                ${isDisabled
                                                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                                            : rows.synced
                                                                                ? "bg-amber-100 text-amber-700 cursor-pointer dark:bg-amber-900/20 dark:text-amber-400"
                                                                                : "bg-red-100 text-red-700 cursor-pointer dark:bg-red-900/20 dark:text-red-400"
                                                                        }`}
                                                                    onClick={() => {
                                                                        if (!isDisabled) {
                                                                            handleAdd("stock", rows);
                                                                        }
                                                                    }}
                                                                >
                                                                    {isDisabled
                                                                        ? "Disabled"
                                                                        : rows.synced
                                                                            ? "Synced"
                                                                            : "Sync"}
                                                                </span>
                                                            </>
                                                        );
                                                    })()}

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

                                                    <TableCell className="px-5 py-4 sm:px-6 text-start"  >
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium cursor-pointer
                                                            ${rows.synced
                                                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                                                                    : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                                                }`}
                                                            onClick={() =>
                                                                handleAdd("event", rows)
                                                            }
                                                        >
                                                            {rows.synced
                                                                ? "Synced"
                                                                : "Sync"}
                                                        </span>



                                                        {/* <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-green-400" onClick={() => handleAdd("event", rows)}>
                                                            Sync
                                                        </span> */}
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