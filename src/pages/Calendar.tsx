import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import multiMonthPlugin from "@fullcalendar/multimonth";
import apiClient from "../hooks/api/apiClient";
import AutoComplete from "../components/utils/ChosenSelect";
// import DatePicker from "../components/form/date-picker";
import { Link } from "react-router";
import AvaliableItems from "../model/AvaliableItems";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { EVENT_STATUSES, normalizeStatusCode, getStatusColor } from "../utils/eventStatus";
import { LayoutTemplate, CheckCircle2, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";





interface CalendarEvent extends EventInput {
  extendedProps?: {
    calendar?: string;
    vanus?: string;
  };
}

// interface ItemState {
//   categoryId: number;
//   subCategoryId: number;
//   isEnable: boolean;
//   dateOfEvent?: string;
//   bookedDate?: string;
//   value: string;
//   horizontalValue: string;
//   verticalValue: string;
// }

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

type StockAddToEventsType = {
  stock: any[];
  events: any[];
};

type SizeOption = {
  size: string;
  unit: string;
};

type DimensionSizeData = {
  vertical: SizeOption[];
  horizontal: SizeOption[];
  loading: boolean;
  loaded?: boolean;
  error?: string;
};

const Calendar: React.FC = () => {
  const [isOpens, setIsOpens] = useState(false);
  const [dimensionSizeData, setDimensionSizeData] = useState<
    Record<string, DimensionSizeData>
  >({});
  const [hideAvailableButton, setHideAvailableButton] =
    useState<{ [key: number]: boolean }>({});
  const [stockAddToEvents, setStockAddToEvents] =
    useState<StockAddToEventsType>({
      stock: [],
      events: [],
    });
  const [getItemsIs_enabled, itemsDate] = useState<ItemState>({
    categoryId: 0,
    subCategoryId: 0,

    isEnable: false,

    dateOfEvent: "",
    bookedDate: "",

    width: "",
    height: "",

    value: "",

    vertical: false,
    horizontal: false,

    verticalValue: "",
    horizontalValue: "",

    verticalUnit: "ft",
    horizontalUnit: "ft",

    verticalPcs: "",
    horizontalPcs: "",

    eventsName: "",
    eventsId: 0,
    stockName: "",
    stockId: 0
  });
  const [calendarKey, setCalendarKey] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [date, setDate] = useState<Date | null>(new Date());
  // Original Form States
  const [eventId, setEventId] = useState();
  const [designId, setDesignId] = useState();
  const [selectedTech, setSelectedTech] = useState<string>("");
  const [eventTitle, setEventTitle] = useState("");
  const [vanus, setVanus] = useState("");
  const [dateOfEvent, setDateOfEvent] = useState("");
  const [locationOfVanus, setLocationOfVanus] = useState("");
  const [venueAvailabiliyDate, setVenueAvailalityDate] = useState("");
  const [bookingDays, setBookingDays] = useState("");
  const [placeOfBooking, setPlaceOfBooking] = useState("");
  const [transportCharges, setTransportCharges] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [amountTaxes, setAmountTaxes] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  //   const [setIsWarehouseModalOpen] = useState("");
  // const [SelectWarehouse] = useState("");

  // Context Menu States
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [contextData, setContextData] = useState<{ date?: string; event?: any }>({});

  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [checkStock, setCheckStock] = useState({
    categories_id: 0,
    sub_categories_id: 0,
    quntites: 0,
    width: null,
    height: null
  });

  const [templatesList, setTemplatesList] = useState<any[]>([]);
  const [templateId, setTemplateId] = useState<number>(0);
  const [templateName, setTemplateName] = useState<string>("");

  console.log(eventStartDate, eventEndDate, eventLevel);


  const [categories, setCategories] = useState([{
    id: "",
    name: ""
  }]);
  const [subCategories, setSubCategories] = useState([{
    id: 0,
    name: "",
    is_enable: false
  }]);

  const [appendsAll, setAppendsAll] = useState([
    {
      categories: { id: 0, name: "" },
      subCategories: { id: 0, name: "", is_enable: false },
      inputs: {
        width: "",
        height: "",
        price: "",
        vprice: "",
        hprice: "",
        vertical: false,
        horizontal: false,
        verticalValue: "",
        horizontalValue: "",
        verticalUnit: "ft",
        horizontalUnit: "ft",
        verticalPcs: "",
        horizontalPcs: "",
        value: "", // ✅ important if used
        eventsName: "",
        eventsId: 0,
        stockName: "",
        stockId: 0
      }
    }
  ]);



  const setCategoresAnd_SubCategories = (
    e: any,
    type: "category" | "subCategory"
  ) => {
    const id = Number(e.target.value);
    const name = e.target.options[e.target.selectedIndex].text;

    setAppendsAll((prev: any) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;

      // ✅ CATEGORY SELECT → ADD NEW ROW
      if (type === "category") {
        updated.push({
          categories: { id, name },
          subCategories: { id: 0, name: "", is_enable: false },
          inputs: {
            value: 0,
            width: 0,
            height: 0,
          },
        });

        return updated;
      }

      // ✅ SUBCATEGORY SELECT → UPDATE LAST ROW
      if (type === "subCategory") {
        // find is_enable from your subCategories list
        const selectedSub = subCategories.find(
          (r: any) => r.id === id
        );

        if (selectedSub?.is_enable && updated[lastIndex]?.categories?.id) {
          loadDimensionSizes(updated[lastIndex].categories.id, id);
        }

        updated[lastIndex] = {
          ...updated[lastIndex],
          subCategories: {
            id,
            name,
            is_enable: selectedSub?.is_enable || false,
          },
        };

        return updated;
      }

      return prev;
    });
  };

  const handleInputChange = (
    index: number,
    field:
      | "width"
      | "height"
      | "value"
      | "price"
      | "vprice"
      | "hprice"
      | "vertical"
      | "horizontal"
      | "verticalValue"
      | "horizontalValue"
      | "verticalUnit"
      | "horizontalUnit"
      | "verticalPcs"
      | "horizontalPcs",
    value: string | boolean
  ) => {
    setAppendsAll((prev: any) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        inputs: {
          ...updated[index].inputs,
          [field]: value,
        },
      };

      return updated;
    });
  };

  const handleDimensionSelect = (
    index: number,
    dimension: "vertical" | "horizontal",
    size: string,
    unit: string
  ) => {
    setAppendsAll((prev: any) => {
      const updated = [...prev];
      const prefix = dimension;
      updated[index] = {
        ...updated[index],
        inputs: {
          ...updated[index].inputs,
          [`${prefix}Value`]: size,
          [`${prefix}Unit`]: unit,
        },
      };
      return updated;
    });
  };

  const loadDimensionSizes = async (
    categoryId: number,
    subCategoryId: number
  ) => {
    if (!categoryId || !subCategoryId) return;

    const cacheKey = `${categoryId}:${subCategoryId}`;
    const cachedData = dimensionSizeData[cacheKey];

    if (cachedData?.loading || cachedData?.loaded) return;

    setDimensionSizeData((prev) => ({
      ...prev,
      [cacheKey]: {
        vertical: prev[cacheKey]?.vertical || [],
        horizontal: prev[cacheKey]?.horizontal || [],
        loading: true,
      },
    }));

    try {
      let stocks: any[] = [];
      try {
        const response = await apiClient.get(
          `/admin/Inverntory/findBycategoriesAndSubCategories/${categoryId}/${subCategoryId}`
        );
        const raw = response?.data?.results || response?.data?.data || [];
        stocks = Array.isArray(raw) ? raw : (raw.results || []);
      } catch (err) {
        console.warn("findBycategoriesAndSubCategories failed, trying eventStocks", err);
      }

      if ((!stocks || stocks.length === 0) && dateOfEvent) {
        try {
          const fallbackRes = await apiClient.get(
            `/admin/Inverntory/items/eventStocks/${dateOfEvent}/${categoryId}/${subCategoryId}`
          );
          const raw = fallbackRes?.data?.results?.results || fallbackRes?.data?.results || [];
          stocks = Array.isArray(raw) ? raw : [];
        } catch (err) {
          console.warn("Fallback eventStocks also failed", err);
        }
      }

      const collectSizes = (dimension: "verticalSizes" | "horizontalSizes") => {
        const uniqueSizes = new Map<string, SizeOption>();

        stocks.forEach((stock: any) => {
          (stock[dimension] || []).forEach((size: any) => {
            if (size.size == null || size.size === "" || !size.unit) return;
            const option: SizeOption = {
              size: String(size.size).trim(),
              unit: String(size.unit).trim(),
            };
            uniqueSizes.set(
              `${option.size.toLowerCase()}_${option.unit.toLowerCase()}`,
              option
            );
          });
        });

        return Array.from(uniqueSizes.values()).sort((a, b) => {
          const numA = parseFloat(a.size);
          const numB = parseFloat(b.size);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          return a.size.localeCompare(b.size);
        });
      };

      setDimensionSizeData((prev) => ({
        ...prev,
        [cacheKey]: {
          vertical: collectSizes("verticalSizes"),
          horizontal: collectSizes("horizontalSizes"),
          loading: false,
          loaded: true,
        },
      }));
    } catch (error) {
      console.error("Failed to load available dimension sizes:", error);
      setDimensionSizeData((prev) => ({
        ...prev,
        [cacheKey]: {
          vertical: [],
          horizontal: [],
          loading: false,
          error: "Unable to load sizes.",
        },
      }));
    }
  };

  const getSizeOptions = (
    options: SizeOption[],
    selectedSize: string,
    selectedUnit: string
  ) => {
    if (
      !selectedSize ||
      options.some(
        (option) =>
          option.size.toLowerCase() === selectedSize.toLowerCase() &&
          option.unit.toLowerCase() === (selectedUnit || "ft").toLowerCase()
      )
    ) {
      return options;
    }

    return [{ size: selectedSize, unit: selectedUnit || "ft" }, ...options];
  };

  useEffect(() => {
    appendsAll.forEach((row: any) => {
      if (
        row.subCategories?.is_enable &&
        (row.inputs?.vertical || row.inputs?.horizontal)
      ) {
        if (row.categories?.id && row.subCategories?.id) {
          loadDimensionSizes(row.categories.id, row.subCategories.id);
        }
      }
    });
  }, [appendsAll]);
  // --- Handlers ---

  // console.log(eventStartDate, eventLevel, eventEndDate);


  const resetModalFields = () => {
    setEventTitle("");
    setVanus("");
    setDateOfEvent("");
    setLocationOfVanus("");
    setVenueAvailalityDate("");
    setBookingDays("");
    setPlaceOfBooking("");
    setTransportCharges("");
    setSpecialRequest("");
    setAmountTaxes("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setDate(null);
    setSelectedEvent(null);
    setAppendsAll([]);
    setHideAvailableButton([])
  };
  const getEvents = async () => {
    try {
      const results = await apiClient.get("/admin/Events/find");
      const apiEvents = results?.data?.results || [];

      const formattedEvents: CalendarEvent[] = apiEvents.flatMap((item: any) => {

        const startDate = new Date(item.doe);
        const endDate = new Date(item.nodb);

        const color = getStatusColor(item.status);

        return [
          {
            id: "event-" + item.id,
            title: `${item.c_name} (${item.vanus})`,
            start: startDate,
            end: endDate,
            allDay: false,
            backgroundColor: color,
            borderColor: color,
            extendedProps: {
              ...item,
              calendar: "Primary",
            },
          },
        ];


      });

      setEvents(eventsWithSerial(formattedEvents));


    } catch (error) {
      // console.log(error);
    }
  };

  const handleAddOrUpdateEvent = async () => {
    console.log(stockAddToEvents);

    // ===============================GROUP BY ITEM AND EVENT FOR BOOKED THE EVNETS ===========================
    const groupedData = Object.values(
      stockAddToEvents.stock.reduce((acc: any, item: any) => {
        const key = `${item.Categories}-${item.SubCategoreis}`;

        if (!acc[key]) {
          acc[key] = {
            Categories: item.Categories,
            SubCategoreis: item.SubCategoreis,
            stock_id: [],
            st_qt: [],
          };
        }

        const index = acc[key].stock_id.indexOf(
          item.stockId
        );

        if (index === -1) {
          acc[key].stock_id.push(item.stockId);

          acc[key].st_qt.push(Number(item.quntiry));
        } else {
          acc[key].st_qt[index] += Number(item.quntiry);
        }

        return acc;
      }, {})
    );

    const groupedEventData = Object.values(
      stockAddToEvents.events.reduce((acc: any, item: any) => {
        const key = `${item.categories}-${item.subcategores}`;

        if (!acc[key]) {
          acc[key] = {
            Categories: item.categories,
            SubCategoreis: item.subcategores,
            event_stock_id: [],
            evnt_qt: [],
          };
        }

        const index = acc[key].event_stock_id.indexOf(
          item.id
        );

        if (index === -1) {
          acc[key].event_stock_id.push(item.id);

          acc[key].evnt_qt.push(Number(item.quntity));
        } else {
          acc[key].evnt_qt[index] += Number(item.quntity);
        }

        return acc;
      }, {})
    );

    if (!templateId) {
      toast.error("Please select an Event Template (Required as per requirements).");
      return;
    }

    const data = {
      id: eventId ? eventId : null,
      designName: selectedTech,
      c_name: eventTitle,
      vanus: vanus,
      doe: dateOfEvent,
      v_location: locationOfVanus,
      v_a_d: venueAvailabiliyDate,
      nodb: date,
      pob: placeOfBooking,
      tc: transportCharges,
      sr: specialRequest,
      amount: amountTaxes,
      quntites: checkStock.quntites,
      width: checkStock.width,
      height: checkStock.height,
      categories_id: checkStock.categories_id,
      sub_categories_id: checkStock.sub_categories_id,
      bookedItems: appendsAll.filter(r => r.categories.id != 0),
      stockDetails: groupedData,
      eventDetails: groupedEventData,
      status: normalizeStatusCode(eventLevel),
      template_id: templateId,
      template_name: templateName
    };



    await apiClient.post("admin/Events/create", data);
    setTimeout(() => {
      getEvents();
      closeModal();
      resetModalFields();
      setRefreshKey(prev => prev + 1);
      setCalendarKey((prev) => prev + 1);
    }, 500)
    getEvents();
    closeModal();
    resetModalFields();
    setRefreshKey(prev => prev + 1);
    setCalendarKey((prev) => prev + 1);
  };

  // --- Right Click Logic ---
  const handleContextMenu = (e: MouseEvent, date?: string, event?: any) => {
    e.preventDefault();
    setMenuPosition({ x: e.pageX, y: e.pageY });
    setContextData({ date, event });
    setMenuVisible(true);
  };

  useEffect(() => {
    getEvents();
    const hideMenu = () => setMenuVisible(false);
    window.addEventListener("click", hideMenu);
    return () => window.removeEventListener("click", hideMenu);
  }, []);



  const formatDateLocal = (date: Date) => {
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  };









  const getCategories = async () => {
    try {
      const results = await apiClient.get("/admin/category/find");
      setCategories(results?.data?.results)

    } catch {

    }
  }

  const [stockList, setStockList] = useState<any[]>([]);

  const getStockSummary = async () => {
    try {
      const res = await apiClient.get("/admin/Inverntory/availableStockSummary");
      setStockList(res?.data?.results || []);
    } catch (err) {
      console.warn("Error fetching availableStockSummary in Calendar:", err);
    }
  };

  const getTemplates = async () => {
    try {
      const results = await apiClient.get("/admin/template/all");
      setTemplatesList(results?.data?.results || results?.data?.data || []);
    } catch (err) {
      console.error("Error fetching templates:", err);
    }
  };

  const applyTemplateItems = (tpl: any) => {
    if (!tpl) return;
    if (tpl.total_price !== undefined && tpl.total_price !== null) {
      setAmountTaxes(String(tpl.total_price));
    }
    if (Array.isArray(tpl.items) && tpl.items.length > 0) {
      const mapped = tpl.items.map((it: any) => ({
        categories: {
          id: it.category_id,
          name: it.category_name,
        },
        subCategories: {
          id: it.subcategory_id,
          name: it.subcategory_name,
          is_enable: Boolean(it.vertical || it.horizontal),
        },
        inputs: {
          width: "",
          height: "",
          price: it.price !== undefined ? String(it.price) : "0",
          vprice: it.price !== undefined ? String(it.price) : "0",
          hprice: it.price !== undefined ? String(it.price) : "0",
          vertical: Boolean(it.vertical),
          horizontal: Boolean(it.horizontal),
          verticalValue: it.verticalValue || "",
          horizontalValue: it.horizontalValue || "",
          verticalUnit: it.verticalUnit || "ft",
          horizontalUnit: it.horizontalUnit || "ft",
          verticalPcs: it.verticalPcs ? String(it.verticalPcs) : "",
          horizontalPcs: it.horizontalPcs ? String(it.horizontalPcs) : "",
          value: it.quantity ? String(it.quantity) : "1",
          eventsName: "",
          eventsId: 0,
          stockName: "",
          stockId: it.category_id || 0,
        },
      }));
      setAppendsAll(mapped);
    }
  };

  const handleSelectTemplate = (id: number) => {
    setTemplateId(id);
    const found = templatesList.find((t: any) => t.id === id);
    if (found) {
      setTemplateName(found.name);
      applyTemplateItems(found);
      toast.success(`Template "${found.name}" applied! (₹${found.total_price})`);
    } else {
      setTemplateName("");
    }
  };

  useEffect(() => {
    getCategories();
    getTemplates();
    getStockSummary();
  }, [])



  const eventHandler = async (e: any) => {
    try {
      const id = e.target.value;
      const results = await apiClient.get(`/admin/subCategory/findByid/${id}`)
      setSubCategories(results?.data?.results)
    } catch {

    }

  }



  // const [stocksData, setStockData] = useState({
  //   "quntites": 0,
  //   "height": 0,
  //   "width": 0
  // });
  const [messages, setMessage] = useState<string>("");

  const getGoods = async (e: any) => {
    try {
      const results = await apiClient(
        `/admin/Inverntory/calculate/${checkStock.categories_id}/${checkStock.sub_categories_id}`
      );

      const resultsevents = await apiClient(
        `/admin/Events/calculate/${dateOfEvent}/${bookingDays}/${checkStock.categories_id}/${checkStock.sub_categories_id}`
      );

      // ✅ Convert to number (VERY IMPORTANT)
      const totalStock = Number(results?.data?.quntites) || 0;
      const bookedStock = Number(resultsevents?.data?.quntites) || 0;
      const requestedStock = Number(e.target.value) || 0;

      const remainingStock = totalStock - bookedStock;
      const afterBooking = remainingStock - requestedStock;

      let messageHtml = "";

      // console.log(bookedStock, requestedStock, afterBooking);


      if (bookedStock + requestedStock > totalStock) {
        messageHtml = `
          <span style="color:red">
            IN THIS DATE BETWEEN WE DON'T HAVE ANY STOCK LIMIT.
            CURRENT STOCK: ${remainingStock}
            AFTER BOOKING: ${afterBooking}
          </span>
        `;
      } else if (afterBooking < 0) {
        messageHtml = `
          <span style="color:red">
            IN THIS DATE BETWEEN WE DON'T HAVE ANY STOCK LIMIT.
            CURRENT STOCK: ${remainingStock}
            AFTER BOOKING: ${afterBooking}
          </span>
        `;
      } else {
        messageHtml = `
          <span style="color:green">
            STOCK AVAILABLE
            CURRENT STOCK: ${remainingStock}
            AFTER BOOKING: ${afterBooking}
          </span>
        `;
      }

      setMessage(`<div>${messageHtml}</div>`);
    } catch (error) {
      console.error(error);

      setMessage(`
        <span style="color:red">
          Something went wrong while fetching stock data.
        </span>
      `);
    }
  };



  const fillEventForm = (event: any) => {


    const data = event.extendedProps || {};

    setSelectedEvent(event);

    const formatDate = (d: string) => {
      if (!d) return "";

      const date = new Date(d);

      if (isNaN(date.getTime())) return "";

      return date.toISOString().split("T")[0];
    };

    const formatDateTimeLocal = (d: string) => {
      if (!d) return "";
      const date = new Date(d);
      const pad = (n: number) => String(n).padStart(2, "0");

      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    // ✅ Fill fields
    setDesignId(data.design_id);
    setEventId(data.id);
    setEventTitle(data.c_name || "");
    setVanus(data.vanus || "");
    setDateOfEvent(formatDate(data.doe));
    setEventLevel(normalizeStatusCode(data.status));
    setEventStartDate(formatDate(data.doe));

    if (data.doe && data.nodb) {

      // START DATE
      const start = new Date(data.doe);

      // END DATE
      const end = new Date(data.nodb);

      setDate(end);

      // EVENT START DATE
      setEventStartDate(formatDate(start.toISOString()));

      // EVENT END DATE
      setEventEndDate(formatDate(end.toISOString()));

      // OPTIONAL: calculate booking days difference
      const diffTime = end.getTime() - start.getTime();

      const diffDays = Math.ceil(
        diffTime / (1000 * 60 * 60 * 24)
      );

      setBookingDays(String(diffDays));
    }

    setVenueAvailalityDate(formatDateTimeLocal(data.v_a_d));
    setLocationOfVanus(data.v_location || "");
    setPlaceOfBooking(data.pob || "");
    setTransportCharges(data.tc || "");
    setSpecialRequest(data.sr || "");
    setAmountTaxes(data.amount || "");

    // category
    setCheckStock({
      categories_id: data.categories_id || 0,
      sub_categories_id: data.sub_categories_id || 0,
      quntites: data.quntites || 0,
      width: data.width || null,
      height: data.height || null
    });

    setTemplateId(data.template_id || 0);
    setTemplateName(data.template_name || "");

    // load subcategory list
    if (data.categories_id) {
      eventHandler({ target: { value: data.categories_id } });
    }

    // booked items
    if (data.bookedItems) {
      setAppendsAll(data.bookedItems);
    }
    getBookedItems(data?.id);
  };

  const getBookedItems = async (id: any) => {
    try {
      const res = await apiClient.get("/admin/Events/bookedEvents/items/" + id);

      const results = res.data.results.reduce(
        (acc: Record<number, boolean>, row: any) => {
          acc[row.subCategories_id] = true;
          return acc;
        },
        {}
      );

      setHideAvailableButton(results);

      const mappedData = res.data.results.map((row: any) => ({
        categories: {
          id: row.categories_id,
          name: row.categories_name,
        },

        subCategories: {
          id: row.subCategories_id,
          name: row.subCategories_name,
          is_enable: row.vertical || row.horizontal,
        },



        inputs: {
          width: "",
          height: "",

          price: row.price || "0.00",
          vprice: row.vprice || "0.00",
          hprice: row.hprice || "0.00",

          vertical: row.vertical,
          horizontal: row.horizontal,

          verticalValue: row.verticalValue || "",
          horizontalValue: row.horizontalValue || "",

          verticalUnit: row.verticalUnit || "ft",
          horizontalUnit: row.horizontalUnit || "ft",

          verticalPcs: row.verticalPcs?.toString() || "",
          horizontalPcs: row.horizontalPcs?.toString() || "",

          value: row.qt?.toString() || "",

          eventsName: "",
          eventsId: row.event_id,

          stockName: "",
          stockId: JSON.parse(row.stock_id || "[0]")[0],

        },
      }));

      setAppendsAll(mappedData);


    } catch (err) {
      console.error(err);
    }
  }


  const getBookData = (categoryId: number, subCategoryId: number) => {
    // console.log(dateOfEvent, appendsAll);
    console.log(categoryId);
    console.log(subCategoryId);

  }


  // console.log(stockAddToEvents);

  const refresh = () => {
    setEventTitle("");
    setVanus("");
    setDateOfEvent("");
    setLocationOfVanus("");
    setVenueAvailalityDate("");
    setBookingDays("");
    setPlaceOfBooking("");
    setTransportCharges("");
    setSpecialRequest("");
    setAmountTaxes("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setDate(null);
    setSelectedEvent(null);
    setAppendsAll([]);
    setHideAvailableButton([]);
    setTemplateId(0);
    setTemplateName("");
  }

  return (
    <>
      <PageMeta title="Calendar" description="Event Management" />

      {/* CUSTOM CONTEXT MENU */}

      {menuVisible && (
        <div
          className="absolute z-50 w-44 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-1.5 overflow-hidden text-sm"
          style={{ top: menuPosition.y, left: menuPosition.x }}
          key={refreshKey}
        >
          <button
            onClick={() => {
              resetModalFields();
              if (contextData.date) {
                setEventStartDate(contextData.date);
                setDateOfEvent(contextData.date);
              }
              openModal();
            }}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2"
          >
            ➕ Create Event
          </button>
          {contextData.event && (
            <button
              onClick={() => {
                fillEventForm(contextData.event);
                openModal();
              }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2"
            >
              👁️ View Details
            </button>
          )}
        </div>
      )}


      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            key={calendarKey}
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "Yearly,dayGridMonth,timeGridWeek,timeGridDay",
            }}
            views={{
              Yearly: { type: "multiMonth", duration: { months: 12 } },
            }}
            events={events}

            // REMOVED: click and select events
            selectable={false}

            // ATTACH: Right-click listeners
            dayCellDidMount={(arg) => {
              arg.el.addEventListener("contextmenu", (e) => handleContextMenu(e, formatDateLocal(arg.date)));
            }}
            eventDidMount={(arg) => {
              arg.el.addEventListener("contextmenu", (e) => {
                e.stopPropagation();
                handleContextMenu(e, undefined, arg.event);
              });
            }}

            eventContent={renderEventContent}
          />
        </div>

        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-6xl w-full mx-auto p-0 rounded-2xl sm:rounded-3xl overflow-hidden [&>button]:hidden">
          <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h2 className="text-lg font-semibold text-white">
              {selectedEvent ? "Update Event" : "Create Event"}
            </h2>
            <button
              onClick={() => { closeModal(); refresh() }}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all flex items-center justify-center cursor-pointer text-base"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto custom-scrollbar p-4 sm:p-6 flex-1 max-h-[82vh]">
            {/* SAME DESIGN AS PREVIOUS */}
            <AutoComplete setSelectedTech={setSelectedTech}
              designId={designId}
            />
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Event Template Dropdown - Not Optional / Required per requirements */}
              <div className="md:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-indigo-200 dark:border-indigo-800 shadow-xs space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                      <LayoutTemplate size={16} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider block">
                        Event Template <span className="text-rose-500 font-extrabold">* (Required per requirements)</span>
                      </label>
                      <span className="text-[11px] text-indigo-700 dark:text-indigo-300">
                        Select a pre-configured template to automatically populate stock items and package price.
                      </span>
                    </div>
                  </div>
                  {templateId > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      ✓ Template Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-9">
                    <select
                      value={templateId || 0}
                      onChange={(e) => handleSelectTemplate(Number(e.target.value))}
                      className="h-11 w-full rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value={0}>-- Select Event Template (Required) --</option>
                      {templatesList.map((tpl: any) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name} — (₹{Number(tpl.total_price || 0).toLocaleString()} | {tpl.items?.length || 0} stock items)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <Link
                      to="/templates"
                      target="_blank"
                      className="h-11 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 transition"
                    >
                      <Sparkles size={14} />
                      Manage Templates
                    </Link>
                  </div>
                </div>

                {templateId > 0 && (() => {
                  const currentTpl = templatesList.find((t: any) => t.id === templateId);
                  return (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-indigo-200 dark:border-indigo-800/60 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <span className="text-gray-700 dark:text-gray-200">
                            Template: <strong>{templateName}</strong> | Package Price:{" "}
                            <strong className="text-emerald-600 dark:text-emerald-400">
                              ₹{Number(currentTpl?.total_price || 0).toLocaleString()}
                            </strong>
                            {currentTpl?.items?.length ? ` (${currentTpl.items.length} items)` : ""}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (currentTpl) applyTemplateItems(currentTpl);
                          }}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1"
                        >
                          <RotateCcw size={12} /> Reload Template Items
                        </button>
                      </div>

                      {/* Live Stock Availability for Template Items */}
                      {currentTpl && Array.isArray(currentTpl.items) && currentTpl.items.length > 0 && (
                        <div className="p-3 rounded-xl bg-white dark:bg-gray-900/90 border border-indigo-100 dark:border-indigo-900/50 space-y-2 text-xs">
                          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                            <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                              <span>📦</span> Stock Availability & Remaining Ratio:
                            </span>
                            <span className="text-[11px] text-gray-500">
                              (Deducts items in uncompleted events)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {currentTpl.items.map((it: any, idx: number) => {
                              const matchedStock = stockList.find(
                                (s: any) =>
                                  Number(s.categories_id) === Number(it.category_id) &&
                                  Number(s.sub_categories_id) === Number(it.subcategory_id)
                              );
                              const totalStock = matchedStock
                                ? matchedStock.total_quantity !== undefined
                                  ? matchedStock.total_quantity
                                  : matchedStock.quantity
                                : 0;
                              const inUseStock = matchedStock ? matchedStock.allocated_quantity || 0 : 0;
                              const availStock = matchedStock
                                ? matchedStock.available_quantity !== undefined
                                  ? matchedStock.available_quantity
                                  : totalStock
                                : 0;
                              const reqQty = Number(it.quantity || 1);
                              const hasEnough = availStock >= reqQty;

                              return (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-lg border text-[11px] flex items-center justify-between gap-2 ${
                                    hasEnough
                                      ? "bg-gray-50/70 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700"
                                      : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                                  }`}
                                >
                                  <div className="truncate">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                      {it.subcategory_name || `Item #${idx + 1}`}
                                    </span>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                      Needs: <strong>{reqQty} pcs</strong>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span
                                      className={`font-bold ${
                                        hasEnough
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : "text-rose-600 dark:text-rose-400"
                                      }`}
                                    >
                                      {availStock} / {totalStock} avail
                                    </span>
                                    <div className="text-[10px] text-gray-400">
                                      {inUseStock > 0 ? `${inUseStock} in use` : "Idle"}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Client Name</label>
                <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">VENUE</label>
                <input type="text" value={vanus} onChange={(e) => setVanus(e.target.value)} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Date Of Event</label>
                <input type="date" value={dateOfEvent} onChange={(e) => setDateOfEvent(e.target.value)} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" disabled />
              </div>

              {/* <DatePicker
                id="date-picker"
                label="Last Booking Day"
                placeholder="Select a date"
                onChange={(dates: Date[]) => setDate(dates)}
              /> */}


              <div className="relative w-full z-50">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Last Booking Date & Time
                </label>

                <ReactDatePicker
                  selected={date}
                  onChange={(date: Date | null) => setDate(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd-MM-yyyy hh:mm aa"
                  placeholderText="Select Date & Time"
                  popperPlacement="bottom-start"
                  popperClassName="z-[9999]"
                  className="
                  dark:bg-dark-900
                  h-11
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-transparent
                  px-4
                  py-2.5
                  text-sm
                  text-gray-800
                  shadow-theme-xs
                  placeholder:text-gray-400
                  focus:border-brand-300
                  focus:outline-none
                  focus:ring-2
                  focus:ring-brand-500/10
                  dark:border-gray-700
                  dark:bg-gray-900
                  dark:text-white/90
                "
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Venue Availability Date & Time</label>
                <input type="datetime-local" value={venueAvailabiliyDate} onChange={(e) => setVenueAvailalityDate(e.target.value)} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
              </div>
              <div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Location Of VENUE</label>
                  <input type="text" value={locationOfVanus} onChange={(e) => setLocationOfVanus(e.target.value)} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Category</label>
                <select className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="categories_id" onChange={(e: any) => {
                  eventHandler(e);
                  setCategoresAnd_SubCategories(e, "category");
                  setCheckStock({
                    ...checkStock,
                    [e.target.name]: e.target.value,
                    sub_categories_id: 0,
                  })
                }}>
                  <option value={0}> Select Category</option>
                  {categories && categories?.map(rows => (
                    <option value={rows?.id}> {rows.name}</option>
                  ))}
                </select>
              </div>

              <div >
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Sub-Category</label>
                <select
                  value={checkStock.sub_categories_id || 0}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  name="sub_categories_id"
                  onChange={(e) => {
                    setCategoresAnd_SubCategories(e, "subCategory")
                    setCheckStock((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }));
                  }}
                >
                  <option value={0}> Select Sub Category</option>
                  {subCategories && subCategories.map(rows => (
                    <option value={rows?.id}>{rows.name}</option>
                  ))}
                </select>

              </div>




              <div className="md:col-span-2">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {appendsAll &&
                    appendsAll.map((rows, i) => {
                      if (rows.categories.id === 0) return null;

                      const cacheKey = `${rows.categories?.id}:${rows.subCategories?.id}`;
                      const dimData = dimensionSizeData[cacheKey];
                      const verticalOptions = getSizeOptions(
                        dimData?.vertical || [],
                        rows.inputs?.verticalValue || "",
                        rows.inputs?.verticalUnit || "ft"
                      );
                      const horizontalOptions = getSizeOptions(
                        dimData?.horizontal || [],
                        rows.inputs?.horizontalValue || "",
                        rows.inputs?.horizontalUnit || "ft"
                      );

                      const selectedVerticalOption = verticalOptions.find(
                        (opt) =>
                          opt.size.toLowerCase() ===
                            (rows.inputs?.verticalValue || "").toLowerCase() &&
                          opt.unit.toLowerCase() ===
                            (rows.inputs?.verticalUnit || "ft").toLowerCase()
                      );
                      const verticalSelectValue = selectedVerticalOption
                        ? `${selectedVerticalOption.size}|${selectedVerticalOption.unit}`
                        : rows.inputs?.verticalValue
                        ? `${rows.inputs.verticalValue}|${
                            rows.inputs?.verticalUnit || "ft"
                          }`
                        : "";

                      const selectedHorizontalOption = horizontalOptions.find(
                        (opt) =>
                          opt.size.toLowerCase() ===
                            (rows.inputs?.horizontalValue || "").toLowerCase() &&
                          opt.unit.toLowerCase() ===
                            (rows.inputs?.horizontalUnit || "ft").toLowerCase()
                      );
                      const horizontalSelectValue = selectedHorizontalOption
                        ? `${selectedHorizontalOption.size}|${selectedHorizontalOption.unit}`
                        : rows.inputs?.horizontalValue
                        ? `${rows.inputs.horizontalValue}|${
                            rows.inputs?.horizontalUnit || "ft"
                          }`
                        : "";

                      return (
                        <div
                          key={i}
                          className="
              relative
              rounded-3xl
              border
              border-gray-200
              dark:border-gray-700
              bg-white
              dark:bg-gray-900
              p-6
              shadow-sm
              hover:shadow-lg
              transition-all
              duration-300
              space-y-6
            "
                        >
                          {/* REMOVE */}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = appendsAll.filter(
                                (_, index) => index !== i
                              );
                              setAppendsAll(updated);
                              setHideAvailableButton((prev) => {
                                const newState = { ...prev };
                                delete newState[rows.subCategories?.id];
                                return newState;
                              });
                            }}
                            className="
                absolute
                top-4
                right-4
                h-9
                w-9
                rounded-full
                bg-red-50
                text-red-500
                hover:bg-red-100
                flex
                items-center
                justify-center
              "
                          >
                            ✕
                          </button>

                          {/* CATEGORY */}
                          <div className="flex flex-wrap gap-4">
                            <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 px-4 py-3 min-w-[150px]">
                              <p className="text-xs text-gray-500 mb-1">
                                Category
                              </p>

                              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                                {rows.categories?.name}
                              </h3>
                            </div>

                            <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 px-4 py-3 min-w-[180px]">
                              <p className="text-xs text-gray-500 mb-1">
                                Sub Category
                              </p>

                              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                                {rows.subCategories?.name}
                              </h3>
                            </div>
                          </div>

                          {/* SIZE SECTION */}
                          {rows.subCategories.is_enable ? (
                            <div className="space-y-6">
                              {/* CHECKBOXES */}
                              <div className="flex flex-wrap gap-6">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                  <input
                                    type="checkbox"
                                    checked={rows.inputs.vertical || false}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      handleInputChange(
                                        i,
                                        "vertical",
                                        checked
                                      );
                                      if (
                                        checked &&
                                        rows.categories?.id &&
                                        rows.subCategories?.id
                                      ) {
                                        loadDimensionSizes(
                                          rows.categories.id,
                                          rows.subCategories.id
                                        );
                                      }
                                    }}
                                  />
                                  Vertical
                                </label>

                                <label className="flex items-center gap-2 text-sm font-medium">
                                  <input
                                    type="checkbox"
                                    checked={rows.inputs.horizontal || false}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      handleInputChange(
                                        i,
                                        "horizontal",
                                        checked
                                      );
                                      if (
                                        checked &&
                                        rows.categories?.id &&
                                        rows.subCategories?.id
                                      ) {
                                        loadDimensionSizes(
                                          rows.categories.id,
                                          rows.subCategories.id
                                        );
                                      }
                                    }}
                                  />
                                  Horizontal
                                </label>
                              </div>

                              {/* VERTICAL */}
                              {rows.inputs.vertical && (
                                <div className="space-y-4 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                                  <h4 className="font-semibold text-gray-800 dark:text-white">
                                    Vertical Details
                                  </h4>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {/* SIZE */}
                                    <div>
                                      <label className="mb-2 block text-sm font-medium">
                                        Vertical Size
                                      </label>

                                      <div className="flex items-center overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                                        <select
                                          value={verticalSelectValue}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            if (val) {
                                              const [size, unit] = val.split("|");
                                              handleDimensionSelect(
                                                i,
                                                "vertical",
                                                size,
                                                unit || "ft"
                                              );
                                            } else {
                                              handleDimensionSelect(
                                                i,
                                                "vertical",
                                                "",
                                                "ft"
                                              );
                                            }
                                          }}
                                          className="w-full h-12 px-4 bg-transparent outline-none text-sm text-gray-800 dark:text-white"
                                        >
                                          <option value="">
                                            {dimData?.loading
                                              ? "Loading sizes..."
                                              : verticalOptions.length === 0
                                              ? "No sizes available"
                                              : "Select Vertical Size"}
                                          </option>
                                          {verticalOptions.map((opt, optIdx) => (
                                            <option
                                              key={`vert-${optIdx}-${opt.size}-${opt.unit}`}
                                              value={`${opt.size}|${opt.unit}`}
                                            >
                                              {`${opt.size}${opt.unit}`}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>

                                    {/* PCS */}
                                    <div>
                                      <label className="mb-2 block text-sm font-medium">
                                        Vertical PCS
                                      </label>

                                      <div className="flex items-center overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700">
                                        <input
                                          type="number"
                                          placeholder="Enter PCS"
                                          value={
                                            rows.inputs.verticalPcs || ""
                                          }
                                          onChange={(e) =>
                                            handleInputChange(
                                              i,
                                              "verticalPcs",
                                              e.target.value
                                            )
                                          }
                                          className="flex-1 h-12 px-4 bg-transparent outline-none text-sm"
                                        />

                                        <div className="h-12 px-5 flex items-center border-l border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-semibold">
                                          PCS
                                        </div>
                                      </div>
                                    </div>

                                    {/* price */}
                                    <div>
                                      <label className="mb-2 block text-sm font-medium">
                                        Amount
                                      </label>

                                      <div className="flex items-center overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700">
                                        ₹
                                        <input
                                          type="text"
                                          placeholder="Enter Price"
                                          value={rows.inputs.vprice || ""}
                                          onChange={(e) =>
                                            handleInputChange(
                                              i,
                                              "vprice",
                                              e.target.value
                                            )
                                          }
                                          className="flex-1 h-12 px-4 bg-transparent outline-none text-sm"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* HORIZONTAL */}
                              {rows.inputs.horizontal && (
                                <div className="space-y-4 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                                  <h4 className="font-semibold text-gray-800 dark:text-white">
                                    Horizontal Details
                                  </h4>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {/* SIZE */}
                                    <div>
                                      <label className="mb-2 block text-sm font-medium">
                                        Horizontal Size
                                      </label>

                                      <div className="flex items-center overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                                        <select
                                          value={horizontalSelectValue}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            if (val) {
                                              const [size, unit] = val.split("|");
                                              handleDimensionSelect(
                                                i,
                                                "horizontal",
                                                size,
                                                unit || "ft"
                                              );
                                            } else {
                                              handleDimensionSelect(
                                                i,
                                                "horizontal",
                                                "",
                                                "ft"
                                              );
                                            }
                                          }}
                                          className="w-full h-12 px-4 bg-transparent outline-none text-sm text-gray-800 dark:text-white"
                                        >
                                          <option value="">
                                            {dimData?.loading
                                              ? "Loading sizes..."
                                              : horizontalOptions.length === 0
                                              ? "No sizes available"
                                              : "Select Horizontal Size"}
                                          </option>
                                          {horizontalOptions.map((opt, optIdx) => (
                                            <option
                                              key={`horiz-${optIdx}-${opt.size}-${opt.unit}`}
                                              value={`${opt.size}|${opt.unit}`}
                                            >
                                              {`${opt.size}${opt.unit}`}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>

                                    {/* PCS */}
                                    <div>
                                      <label className="mb-2 block text-sm font-medium">
                                        Horizontal PCS
                                      </label>

                                      <div className="flex items-center overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700">
                                        <input
                                          type="number"
                                          placeholder="Enter PCS"
                                          value={
                                            rows.inputs.horizontalPcs || ""
                                          }
                                          onChange={(e) =>
                                            handleInputChange(
                                              i,
                                              "horizontalPcs",
                                              e.target.value
                                            )
                                          }
                                          className="flex-1 h-12 px-4 bg-transparent outline-none text-sm"
                                        />

                                        <div className="h-12 px-5 flex items-center border-l border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-semibold">
                                          PCS
                                        </div>
                                      </div>
                                    </div>

                                    {/* price */}
                                    <div>
                                      <label className="mb-2 block text-sm font-medium">
                                        Amount
                                      </label>

                                      <div className="flex items-center overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700">
                                        ₹
                                        <input
                                          type="text"
                                          placeholder="Enter Price"
                                          value={rows.inputs.hprice || ""}
                                          onChange={(e) =>
                                            handleInputChange(
                                              i,
                                              "hprice",
                                              e.target.value
                                            )
                                          }
                                          className="flex-1 h-12 px-4 bg-transparent outline-none text-sm"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* NORMAL QUANTITY */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                <label className="mb-2 block text-sm font-medium">
                                  Quantity
                                </label>

                                <div className="flex items-center overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700">
                                  <input
                                    type="number"
                                    placeholder="Enter Quantity"
                                    value={rows.inputs.value || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        i,
                                        "value",
                                        e.target.value
                                      )
                                    }
                                    className="flex-1 h-12 px-4 bg-transparent outline-none text-sm"
                                  />

                                  <div className="h-12 px-5 flex items-center border-l border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-semibold">
                                    PCS
                                  </div>
                                </div>

                              </div>

                              {/* price */}
                              <div>
                                <label className="mb-2 block text-sm font-medium">
                                  Amount
                                </label>

                                <div className="flex items-center overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700">
                                  ₹
                                  <input
                                    type="text"
                                    placeholder="Enter Price"

                                    className="flex-1 h-12 px-4 bg-transparent outline-none text-sm"
                                    value={rows.inputs.price || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        i,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          {
                            !hideAvailableButton[rows.subCategories?.id] ? (
                              <div className="pt-2">
                                <Link
                                  to=""
                                  onClick={() => {
                                    setIsOpens(true);

                                    itemsDate({
                                      categoryId: rows.categories?.id,
                                      subCategoryId:
                                        rows.subCategories?.id,
                                      isEnable:
                                        rows.subCategories?.is_enable,

                                      bookedDate: dateOfEvent,

                                      value: rows.inputs?.value,

                                      horizontalValue:
                                        rows.inputs?.horizontalValue,

                                      horizontalUnit:
                                        rows.inputs?.horizontalUnit,

                                      verticalValue:
                                        rows.inputs?.verticalValue,

                                      verticalUnit:
                                        rows.inputs?.verticalUnit,

                                      horizontalPcs:
                                        rows.inputs?.horizontalPcs,

                                      verticalPcs:
                                        rows.inputs?.verticalPcs,

                                      stockId: rows.categories?.id
                                    });

                                    getBookData(
                                      rows.categories?.id,
                                      rows.subCategories?.id
                                    );
                                  }}
                                  className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-gradient-to-r
                                    from-blue-600
                                    to-blue-500
                                    px-6
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-white
                                    shadow-md
                                    hover:scale-[1.02]
                                    hover:shadow-lg
                                    transition-all
                                    "
                                >
                                  Available Stock
                                </Link>
                              </div>
                            ) : (<div className="pt-2">
                              <Link
                                to=""

                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-gradient-to-r
                                    bg-gray-200 text-gray-500 cursor-not-allowed
                                    px-6
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-white
                                    shadow-md
                                    "
                              >
                                Added
                              </Link>
                            </div>)
                          }

                        </div>
                      );
                    })}
                </div>
              </div>






              <div className="hidden">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Qunities</label>
                <input type="text" onChange={(e) => {
                  getGoods(e);
                  setCheckStock({
                    ...checkStock,
                    [e.target.name]: e.target.value
                  });
                }} className=" dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="quntites" />
              </div>
              <div className="hidden">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Width(ft)</label>
                <input type="text" onChange={(e) => {
                  getGoods(e);
                  setCheckStock({
                    ...checkStock,
                    [e.target.name]: e.target.value
                  });
                }} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="quntites" />
              </div>
              <div className="hidden">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Height(ft)</label>
                <input type="text" onChange={(e) => {
                  getGoods(e);
                  setCheckStock({
                    ...checkStock,
                    [e.target.name]: e.target.value
                  });

                }} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="quntites" />
              </div>


              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Place Of Booking</label>
                <input type="text" value={placeOfBooking} onChange={(e) => setPlaceOfBooking(e.target.value)} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Transport Charges</label>
                <input type="number" value={transportCharges} onChange={(e) => setTransportCharges(e.target.value)} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
              </div>
              <div className="md:col-span-2" dangerouslySetInnerHTML={{
                __html: messages ?? "",
              }}>
              </div>


              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Amount</label>
                <input type="number" value={amountTaxes} onChange={(e) => setAmountTaxes(e.target.value)} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Status</label>
                <select
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  value={normalizeStatusCode(eventLevel)}
                  onChange={e => { setEventLevel(e.target.value) }}
                >
                  {EVENT_STATUSES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>


              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Special Request</label>
                <textarea value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"></textarea>
              </div>

            </div>

            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button onClick={closeModal} type="button" className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:w-auto">Close</button>
              <button onClick={handleAddOrUpdateEvent} type="button" className="btn btn-success flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto">
                {selectedEvent ? "Update Changes" : "Add Event"}
              </button>
            </div>
          </div>
        </Modal>
      </div>


      <AvaliableItems isOpens={isOpens} setIsOpens={setIsOpens} itemsDate={itemsDate} getItemsIs_enabled={getItemsIs_enabled} setAppendsAll={setAppendsAll} appendsAll={appendsAll} setStockAddToEvents={setStockAddToEvents} stockAddToEvents={stockAddToEvents} setHideAvailableButton={setHideAvailableButton} hideAvailableButton={hideAvailableButton} locationOfVanus={locationOfVanus} />
    </>
  );
};


const eventsWithSerial = (events: any[]) => {
  const map = new Map();

  return events.map((event) => {
    const date = event.doe; // "2026-06-12"

    const currentCount = (map.get(date) || 0) + 1;
    map.set(date, currentCount);

    return {
      ...event,
      extendedProps: {
        ...event.extendedProps,
        serialNo: currentCount,
      },
    };
  });
};


const renderEventContent = (eventInfo: any) => {
  const calendar = eventInfo.event.extendedProps?.calendar;

  const safeCalendarClass = calendar
    ? `fc-bg-${String(calendar).toLowerCase().replace(/\s+/g, "-")}`
    : "fc-bg-default";

  const serialNo = eventInfo.event.extendedProps?.serialNo;

  return (
    <div
      className={`event-fc-color flex fc-event-main ${safeCalendarClass} p-1 rounded-sm`}
    >
      <div className="flex items-center gap-2 p-1 rounded-sm">
        <span
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "#2563eb",
            color: "#fff",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {serialNo}
        </span>
      </div>

      <div className="fc-daygrid-event-dot"></div>

      {/* <div className="fc-event-time">{eventInfo.timeText}</div> */}

      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;