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

const Calendar: React.FC = () => {
  const [isOpens, setIsOpens] = useState(false);
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

  })

  // console.log(eventStartDate, eventEndDate, eventLevel);


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

        const color =
          item.status == 0 ? "#FFA500" :
            item.status == 1 ? "#008000" :
              item.status == 2 ? "#8B4513" :
                item.status == 3 ? "#87CEEB" :
                  item.status == 4 ? "#FF0000" :
                    "#ffffff";

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

    // ==================================================================================================

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
      status: eventLevel
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
  useEffect(() => {
    getCategories();
  }, [])



  const eventHandler = async (e: any) => {
    try {
      const id = e.target.value;
      const results = await apiClient.get(`/admin/subCategory/findByid/${id}`)
      setSubCategories(results?.data?.results)
    } catch {

    }

  }

  const [status] = useState({
    0: "Enquriy",
    1: "Confirm/Live",
    2: "Installation Ongoing",
    3: "Event Finished",
    4: "Cancelled/Postpone",
  })

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
    setEventLevel(data.status);
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
    // console.log(categoryId);
    // console.log(subCategoryId);

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
    setHideAvailableButton([])
  }

  return (
    <>
      <PageMeta title="Calendar" description="Event Management" />

      {/* CUSTOM CONTEXT MENU */}

      {menuVisible && (
        <div
          className="absolute z-50 w-40 bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-800 dark:border-gray-700 py-2"
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
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            ➕ Create Event
          </button>
          {contextData.event && (
            <button
              onClick={() => {
                fillEventForm(contextData.event);
                openModal();
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
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

        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-8xl w-full mx-auto p-0 rounded-2xl overflow-hidden [&>button]:hidden">
          <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h2 className="text-lg font-semibold text-white">
              {selectedEvent ? "Update Event" : "Create Event"}
            </h2>
            <button
              onClick={() => { closeModal(); refresh() }}
              className="text-white hover:text-red-200 text-xl"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto custom-scrollbar p-5">
            {/* SAME DESIGN AS PREVIOUS */}
            <AutoComplete setSelectedTech={setSelectedTech}
              designId={designId}
            />
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    appendsAll.map((rows, i) =>
                      rows.categories.id !== 0 ? (
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
                                    onChange={(e) =>
                                      handleInputChange(
                                        i,
                                        "vertical",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  Vertical
                                </label>

                                <label className="flex items-center gap-2 text-sm font-medium">
                                  <input
                                    type="checkbox"
                                    checked={rows.inputs.horizontal || false}
                                    onChange={(e) =>
                                      handleInputChange(
                                        i,
                                        "horizontal",
                                        e.target.checked
                                      )
                                    }
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

                                      <div className="flex items-center overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700">
                                        <input
                                          type="text"
                                          placeholder="Enter Vertical Size"
                                          value={
                                            rows.inputs.verticalValue || ""
                                          }
                                          onChange={(e) =>
                                            handleInputChange(
                                              i,
                                              "verticalValue",
                                              e.target.value
                                            )
                                          }
                                          className="flex-1 h-12 px-4 bg-transparent outline-none text-sm"
                                        />

                                        <select
                                          value={
                                            rows.inputs.verticalUnit ||
                                            "ft"
                                          }
                                          onChange={(e) =>
                                            handleInputChange(
                                              i,
                                              "verticalUnit",
                                              e.target.value
                                            )
                                          }
                                          className="h-12 border-l border-gray-300 dark:border-gray-700 px-4 bg-gray-50 dark:bg-gray-800 outline-none"
                                        >
                                          <option value="ft">FT</option>
                                          <option value="m">M</option>
                                          <option value="mm">MM</option>
                                          <option value="in">IN</option>
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

                                      <div className="flex items-center overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700">
                                        <input
                                          type="text"
                                          placeholder="Enter Horizontal Size"
                                          value={
                                            rows.inputs.horizontalValue ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            handleInputChange(
                                              i,
                                              "horizontalValue",
                                              e.target.value
                                            )
                                          }
                                          className="flex-1 h-12 px-4 bg-transparent outline-none text-sm"
                                        />

                                        <select
                                          value={
                                            rows.inputs.horizontalUnit ||
                                            "ft"
                                          }
                                          onChange={(e) =>
                                            handleInputChange(
                                              i,
                                              "horizontalUnit",
                                              e.target.value
                                            )
                                          }
                                          className="h-12 border-l border-gray-300 dark:border-gray-700 px-4 bg-gray-50 dark:bg-gray-800 outline-none"
                                        >
                                          <option value="ft">FT</option>
                                          <option value="m">M</option>
                                          <option value="mm">MM</option>
                                          <option value="in">IN</option>
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
                      ) : null
                    )}
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
                <select className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" value={eventLevel} onChange={e => { setEventLevel(e.target.value) }}>
                  <option value={0} >Select Status</option>
                  {Object.entries(status).map(([key, value]) => (
                    <option key={key} value={key} >
                      {value}
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

      <div className="fc-event-time">{eventInfo.timeText}</div>

      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;