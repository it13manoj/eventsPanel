import { useEffect, useState, useMemo } from "react";
import { Modal } from "../components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import apiClient from "../hooks/api/apiClient";
import { toast } from "react-toastify";
import { MapPin, Sparkles, Building2, Calendar as CalendarIcon, RefreshCw, CheckCircle2, ArrowRightLeft } from "lucide-react";



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
        address: string
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

    locationOfVanus: string;
}

export default function AvaliableItems({
    isOpens,
    setIsOpens,
    getItemsIs_enabled,
    setStockAddToEvents,
    itemsDate,
    stockAddToEvents,
    setHideAvailableButton,
    locationOfVanus
}: ItemsModelProps) {
    if (!isOpens) return null;

    const [currentLocation, setCurrentLocation] = useState<string>(
        locationOfVanus ? locationOfVanus.toString() : ""
    );

    useEffect(() => {
        if (locationOfVanus) {
            setCurrentLocation(locationOfVanus.toString());
        }
    }, [locationOfVanus]);

    const [inventory, setInventory] = useState<InventoryType[]>([]);

    const [dist, setDist] = useState<
        {
            inventoryId: number;
            address: string;
            distance: string;
            distanceValue?: number | null;
            duration?: string;
        }[]
    >([]);

    const [edist, seteDist] = useState<
        {
            eventId: number;
            address: string;
            distance: string;
            distanceValue?: number | null;
            duration?: string;
        }[]
    >([]);

    const [remaining, setRemaining] = useState<any>({});
    const [remainingS, setRemainingS] = useState<any>({});
    const [quantities, setQuantities] = useState<any>({});
    const [results_booked, results_bookedSet] = useState<{
        stock: { [key: number]: number };
        event: { [key: number]: number };
    }>({
        stock: {},
        event: {}
    });

    const [bookEventRecords, setBookEventsRecords] = useState<any[]>([]);

    // Find min warehouse distance for comparison
    const minWarehouseInfo = useMemo(() => {
        if (!dist || dist.length === 0) return null;
        const validWarehouses = dist.filter(
            d => typeof d.distanceValue === "number" && d.distanceValue > 0
        );
        if (validWarehouses.length === 0) return null;
        return validWarehouses.reduce((prev, curr) =>
            prev.distanceValue! < curr.distanceValue! ? prev : curr
        );
    }, [dist]);

    // Check if any finished event is closer than the warehouse
    const nearestEventComparison = useMemo(() => {
        if (!edist || edist.length === 0 || !minWarehouseInfo?.distanceValue) return null;

        const closerEvents = bookEventRecords
            .map(event => {
                const distanceObj = edist.find(e => e.eventId === event.id);
                return {
                    event,
                    distanceObj,
                };
            })
            .filter(item => 
                item.distanceObj && 
                typeof item.distanceObj.distanceValue === "number" && 
                item.distanceObj.distanceValue > 0 && 
                item.distanceObj.distanceValue < minWarehouseInfo.distanceValue!
            )
            .sort((a, b) => a.distanceObj!.distanceValue! - b.distanceObj!.distanceValue!);

        if (closerEvents.length === 0) return null;

        return {
            nearest: closerEvents[0],
            minWarehouseDistance: minWarehouseInfo.distance,
            allCloserEventIds: new Set(closerEvents.map(c => c.event.id)),
        };
    }, [edist, bookEventRecords, minWarehouseInfo]);

    const handleAdd = (
        type: "stock" | "event",
        item: any
    ) => {
        // ========================= STOCK =========================
        if (type === "stock") {
            const requestedQty = Number(
                getItemsIs_enabled.horizontalPcs || 
                getItemsIs_enabled.verticalPcs || 
                getItemsIs_enabled.value || 
                0
            );

            const verticalQty = Number(item.verticalSizes?.[0]?.quantity || 0);
            const horizontalQty = Number(item.horizontalSizes?.[0]?.quantity || 0);
            const quantity = Number(item.good || item.quantity || 0);

            const availableQty = verticalQty > 0 ? verticalQty : horizontalQty > 0 ? horizontalQty : quantity;
            const syncQty = requestedQty > 0 && availableQty > requestedQty ? requestedQty : availableQty;

            // add stock
            setStockAddToEvents((prev: any) => ({
                ...prev,
                stock: [
                    ...prev.stock.filter((s: any) => s.stockId !== item.id),
                    {
                        stockId: item.id,
                        stockname: item.wareHouse?.name || "Warehouse",
                        Categories: item.categories?.id || getItemsIs_enabled.categoryId,
                        SubCategoreis: item.subCategories?.id || getItemsIs_enabled.subCategoryId,
                        quntiry: syncQty,
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
                        verticalSizes: (row.verticalSizes || []).map((size) => ({
                            ...size,
                            quantity: size.quantity > 0 ? Math.max(0, Number(size.quantity) - syncQty) : 0,
                        })),
                        horizontalSizes: (row.horizontalSizes || []).map((size) => ({
                            ...size,
                            quantity: size.quantity > 0 ? Math.max(0, Number(size.quantity) - syncQty) : 0,
                        })),
                        quantity: Number(row.quantity || 0) > 0 ? Math.max(0, Number(row.quantity) - syncQty) : 0,
                    };
                })
            );

            // update selected available qty
            itemsDate((prev: any) => ({
                ...prev,
                verticalPcs: Number(prev.verticalPcs ?? 0) > 0 ? String(Math.max(0, Number(prev.verticalPcs) - syncQty)) : prev.verticalPcs,
                horizontalPcs: Number(prev.horizontalPcs ?? 0) > 0 ? String(Math.max(0, Number(prev.horizontalPcs) - syncQty)) : prev.horizontalPcs,
                value: Number(prev.value ?? 0) > 0 ? String(Math.max(0, Number(prev.value) - syncQty)) : prev.value,
                quantity: Number(prev.quantity ?? 0) > 0 ? Math.max(0, Number(prev.quantity) - syncQty) : 0,
            }));

            toast.success(`Successfully synced ${syncQty} items from warehouse "${item.wareHouse?.name || 'Warehouse'}"!`);
        }

        // ========================= EVENT =========================
        if (type === "event") {
            const requestedQty = Number(
                getItemsIs_enabled.horizontalPcs || 
                getItemsIs_enabled.verticalPcs || 
                getItemsIs_enabled.value || 
                0
            );

            const verticalQty = Number(item.verticalPcs || 0);
            const horizontalQty = Number(item.horizontalPcs || 0);
            const qt = Number(item.qt || 0);

            const availableQty = (verticalQty > 0 || horizontalQty > 0)
                ? (verticalQty + horizontalQty)
                : qt;

            const syncQty = requestedQty > 0 && availableQty > requestedQty ? requestedQty : availableQty;

            // update records
            setBookEventsRecords((prev: any[]) =>
                prev.map((row) => {
                    if (row.id !== item.id) return row;
                    return {
                        ...row,
                        synced: true,
                        verticalPcs: Number(row.verticalPcs || 0) > 0 ? Math.max(0, Number(row.verticalPcs) - syncQty) : row.verticalPcs,
                        horizontalPcs: Number(row.horizontalPcs || 0) > 0 ? Math.max(0, Number(row.horizontalPcs) - syncQty) : row.horizontalPcs,
                        qt: Number(row.qt || 0) > 0 ? Math.max(0, Number(row.qt) - syncQty) : row.qt,
                    };
                })
            );

            setStockAddToEvents((prev: any) => ({
                ...prev,
                events: [
                    ...prev.events.filter((e: any) => e.id !== item.id),
                    {
                        id: item.id,
                        name: item.vanus,
                        categories: item.categories_id,
                        subcategores: item.subCategories_id,
                        quntity: syncQty,
                    },
                ],
            }));

            // update selected qty
            itemsDate((prev: any) => ({
                ...prev,
                verticalPcs: Number(prev.verticalPcs || 0) > 0 ? String(Math.max(0, Number(prev.verticalPcs) - syncQty)) : prev.verticalPcs,
                horizontalPcs: Number(prev.horizontalPcs || 0) > 0 ? String(Math.max(0, Number(prev.horizontalPcs) - syncQty)) : prev.horizontalPcs,
                value: Number(prev.value || 0) > 0 ? String(Math.max(0, Number(prev.value) - syncQty)) : prev.value,
                qt: Number(prev.qt || 0) > 0 ? String(Math.max(0, Number(prev.qt) - syncQty)) : prev.qt,
            }));

            toast.success(`Successfully synced ${syncQty} items from finished event "${item.vanus}"!`);
        }
    };

    const getInventory = async () => {
        try {
            if (!getItemsIs_enabled?.categoryId || !getItemsIs_enabled?.subCategoryId) return;
            const bookedDateParam = getItemsIs_enabled.bookedDate || new Date().toISOString().split("T")[0];
            const results = await apiClient.get(
                `/admin/Inverntory/items/eventStocks/${encodeURIComponent(bookedDateParam)}/${getItemsIs_enabled.categoryId}/${getItemsIs_enabled.subCategoryId}`
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

        } catch (error) {
            console.error("getInventory error:", error);
        }
    };

    const fetchBookedEvents = async () => {
        try {
            if (
                !getItemsIs_enabled.categoryId ||
                !getItemsIs_enabled.subCategoryId
            ) {
                return;
            }

            const bookedDateParam = getItemsIs_enabled.bookedDate || new Date().toISOString().split("T")[0];
            const results = await apiClient.get(
                `/admin/Events/bookedEvents/itemsDate/${encodeURIComponent(
                    bookedDateParam
                )}/${getItemsIs_enabled.categoryId}/${getItemsIs_enabled.subCategoryId}`
            );

            setBookEventsRecords(results.data?.results || []);

        } catch (error) {
            console.error("fetchBookedEvents error:", error);
        }
    };

    useEffect(() => {
        if (isOpens) {
            getInventory();
            fetchBookedEvents();
        }
    }, [
        isOpens,
        getItemsIs_enabled.categoryId,
        getItemsIs_enabled.subCategoryId,
        getItemsIs_enabled.bookedDate
    ]);

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


    const getDistance = async (customOrigin?: string) => {
        const origin = (customOrigin ?? currentLocation ?? locationOfVanus ?? "").toString().trim();
        if (!origin || !inventory.length) {
            return;
        }

        try {
            const distances = await Promise.all(
                inventory.map(async (row) => {
                    const dest = (row.wareHouse?.address || (row.wareHouse as any)?.location || row.wareHouse?.name || "").toString().trim();
                    if (!dest) {
                        return {
                            inventoryId: row.id,
                            address: "",
                            distance: "-",
                            distanceValue: null,
                            duration: "",
                        };
                    }
                    try {
                        const response = await apiClient.get("/admin/Inverntory/getDistances", {
                            params: { from: origin, to: dest }
                        });
                        return {
                            inventoryId: row.id,
                            address: dest,
                            distance: response.data?.distance || "-",
                            distanceValue: typeof response.data?.distance_value === "number" ? response.data.distance_value : null,
                            duration: response.data?.duration || "",
                        };
                    } catch (err) {
                        return {
                            inventoryId: row.id,
                            address: dest,
                            distance: "-",
                            distanceValue: null,
                            duration: "",
                        };
                    }
                })
            );

            setDist(distances);
        } catch (error) {
            console.error("getDistance error:", error);
        }
    };

    const geteventDistance = async (customOrigin?: string) => {
        const origin = (customOrigin ?? currentLocation ?? locationOfVanus ?? "").toString().trim();
        if (!origin || !bookEventRecords.length) {
            return;
        }

        try {
            const distances = await Promise.all(
                bookEventRecords.map(async (row) => {
                    const dest = (row.v_location || row.vanus || "").toString().trim();
                    if (!dest) {
                        return {
                            eventId: row.id,
                            address: "",
                            distance: "-",
                            distanceValue: null,
                            duration: "",
                        };
                    }
                    try {
                        const response = await apiClient.get("/admin/Inverntory/getDistances", {
                            params: { from: origin, to: dest }
                        });
                        return {
                            eventId: row.id,
                            address: dest,
                            distance: response.data?.distance || "-",
                            distanceValue: typeof response.data?.distance_value === "number" ? response.data.distance_value : null,
                            duration: response.data?.duration || "",
                        };
                    } catch (err) {
                        return {
                            eventId: row.id,
                            address: dest,
                            distance: "-",
                            distanceValue: null,
                            duration: "",
                        };
                    }
                })
            );

            seteDist(distances);
        } catch (error) {
            console.error("geteventDistance error:", error);
        }
    };

    useEffect(() => {
        if (isOpens && currentLocation && bookEventRecords.length > 0) {
            geteventDistance(currentLocation);
        }
    }, [isOpens, currentLocation, bookEventRecords]);

    useEffect(() => {
        if (isOpens && currentLocation && inventory.length > 0) {
            getDistance(currentLocation);
        }
    }, [isOpens, currentLocation, inventory]);

    return (
        <Modal
            isOpen={isOpens}
            onClose={() => setIsOpens(false)}
            className="max-w-6xl w-full mx-auto p-0 rounded-2xl sm:rounded-3xl overflow-hidden [&>button]:hidden"
        >
            {/* Header */}
            <div className="flex justify-between items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/20 text-white">
                        <ArrowRightLeft className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-white">
                            Available Stock & Finished Events Logistics
                        </h2>
                        <p className="text-xs text-blue-100 hidden sm:block">
                            Compare distances from Warehouses and Finished Events to move stock efficiently
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setIsOpens(false);
                        setHideAvailableButton((prev) => ({
                            ...prev,
                            [getItemsIs_enabled.subCategoryId]: true
                        }));
                    }}
                    className="px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-semibold text-xs shadow-sm transition cursor-pointer"
                >
                    Done
                </button>
            </div>

            {/* Location & Controls Bar */}
            <div className="px-4 sm:px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 shrink-0">
                        Today's Venue:
                    </span>
                    <input
                        type="text"
                        value={currentLocation}
                        onChange={(e) => setCurrentLocation(e.target.value)}
                        placeholder="Enter venue location / city (e.g. Bhopal, Indore, Buxar)"
                        className="text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            getDistance(currentLocation);
                            geteventDistance(currentLocation);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1 transition shrink-0 cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Recalculate
                    </button>
                </div>

                <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                        Warehouses: <strong className="text-gray-900 dark:text-gray-100">{inventory.length}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="w-3.5 h-3.5 text-emerald-500" />
                        Finished Events: <strong className="text-gray-900 dark:text-gray-100">{bookEventRecords.length}</strong>
                    </span>
                </div>
            </div>

            {/* Smart Logistics Recommendation Banner */}
            {nearestEventComparison && (
                <div className="mx-4 sm:mx-6 mt-4 rounded-xl border border-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/40 dark:border-emerald-700 p-3.5 shadow-sm flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                    </div>
                    <div className="flex-1 text-xs sm:text-sm text-emerald-900 dark:text-emerald-100">
                        <div className="font-bold flex items-center gap-2">
                            <span>Nearby Event Stock Available</span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200">
                                Closer than Warehouse
                            </span>
                        </div>
                        <p className="mt-1 text-emerald-800 dark:text-emerald-200 text-xs">
                            Event <strong>"{nearestEventComparison.nearest.event.vanus}"</strong> ({nearestEventComparison.nearest.event.v_location || "Venue"}) is only <strong>{nearestEventComparison.nearest.distanceObj?.distance}</strong> away {nearestEventComparison.nearest.distanceObj?.duration ? `(${nearestEventComparison.nearest.distanceObj?.duration})` : ""} — which is nearer than the Warehouse ({nearestEventComparison.minWarehouseDistance}). Moving stock directly from this event will save transport time and logistics cost!
                        </p>
                    </div>
                </div>
            )}

            {/* Body */}
            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 space-y-6 overflow-y-auto max-h-[82vh] custom-scrollbar">
                <div className="md:col-span-2">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div>
                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2 block">Warehouse Stock</span>
                            <div className="overflow-x-auto w-full custom-scrollbar rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
                                            className="px-5 py-3 text-start"
                                        >
                                            Distance
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

                                                <TableCell className="px-5 py-4 text-start">
                                                    {(() => {
                                                        const dObj = dist?.find((r) => r.inventoryId === rows.id);
                                                        if (!dObj || !dObj.distance || dObj.distance === "-") {
                                                            return <span className="text-gray-400 text-xs">Distance unavailable</span>;
                                                        }
                                                        return (
                                                            <div>
                                                                <span className="font-semibold text-gray-800 dark:text-gray-200 block text-xs">
                                                                    {dObj.distance}
                                                                </span>
                                                                {dObj.duration && (
                                                                    <span className="text-[11px] text-gray-500 block">
                                                                        ({dObj.duration})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">

                                                    {(() => {
                                                        const isAlreadySynced = rows.synced || stockAddToEvents?.stock?.some((s: any) => s.stockId === rows.id);
                                                        const isDisabled =
                                                            rows.verticalSizes?.some(
                                                                (v: any) =>
                                                                    v.quantity <= (results_booked?.stock?.[rows.id] ?? 0)
                                                            ) ||
                                                            rows.horizontalSizes?.some(
                                                                (h: any) =>
                                                                    h.quantity <= (results_booked?.stock?.[rows.id] ?? 0)
                                                            );

                                                        if (isAlreadySynced) {
                                                            return (
                                                                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                                                                </span>
                                                            );
                                                        }

                                                        if (isDisabled) {
                                                            return (
                                                                <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium bg-gray-200 text-gray-500 cursor-not-allowed">
                                                                    No Stock
                                                                </span>
                                                            );
                                                        }

                                                        return (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAdd("stock", rows)}
                                                                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm cursor-pointer"
                                                            >
                                                                Sync
                                                            </button>
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
                        </div>
                        <div>
                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2 block">Events Stock</span>
                            <div className="overflow-x-auto w-full custom-scrollbar rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
                                            Distance
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
                                    {bookEventRecords && bookEventRecords.length > 0 ? (
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
                                                    <TableCell className="px-5 py-4 text-start">
                                                        {(() => {
                                                            const dObj = edist?.find((r) => r.eventId === rows.id);
                                                            const isCloser = nearestEventComparison?.allCloserEventIds?.has(rows.id);
                                                            if (!dObj || !dObj.distance || dObj.distance === "-") {
                                                                return <span className="text-gray-400 text-xs">Distance unavailable</span>;
                                                            }
                                                            return (
                                                                <div className="space-y-1">
                                                                    <span className="font-semibold text-gray-800 dark:text-gray-200 block text-xs">
                                                                        {dObj.distance}
                                                                    </span>
                                                                    {dObj.duration && (
                                                                        <span className="text-[11px] text-gray-500 block">
                                                                            ({dObj.duration})
                                                                        </span>
                                                                    )}
                                                                    {isCloser && (
                                                                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                                                            ⭐ Closer than Warehouse
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </TableCell>
                                                    {/* ================================================= */}
                                                    {/* ACTION */}
                                                    {/* ================================================= */}

                                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                        {(() => {
                                                            const isAlreadySynced = rows.synced || stockAddToEvents?.events?.some((e: any) => e.id === rows.id);

                                                            if (isAlreadySynced) {
                                                                return (
                                                                    <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                                                                    </span>
                                                                );
                                                            }

                                                            return (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAdd("event", rows)}
                                                                    className="inline-flex items-center gap-1 rounded-full px-3.5 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer"
                                                                >
                                                                    Sync to Event
                                                                </button>
                                                            );
                                                        })()}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="p-5 text-center text-xs text-gray-500 dark:text-gray-400">
                                                    No finished events found holding this stock item.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                </TableBody>
                            </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Footer */}

        </Modal>
    );
}