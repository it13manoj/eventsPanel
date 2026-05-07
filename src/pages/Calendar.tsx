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
import DatePicker from "../components/form/date-picker";






interface CalendarEvent extends EventInput {
  extendedProps?: {
    calendar?: string;
    vanus?: string;
  };
}




const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [date, setDate] = useState<Date[]>([]);
  // Original Form States
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
        value: 0,
        width: "",
        height: ""
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
    field: "value" | "width" | "height",
    value: string
  ) => {
    setAppendsAll((prev: any) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        inputs: {
          ...updated[index].inputs,
          [field]: value
        }
      };

      return updated;
    });
  };

  // --- Handlers ---

  console.log(eventStartDate, eventLevel, eventEndDate);


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
    setSelectedEvent(null);
  };

  const getEvents = async () => {
    try {
      const results = await apiClient.get("admin/Events/find");
      const apiEvents = results?.data?.results || [];

      const formattedEvents: CalendarEvent[] = apiEvents.flatMap((item: any) => {
        const startDate = new Date(item.doe);
        const endDate = new Date(item.doe);
        endDate.setDate(endDate.getDate() + Number(item.nodb));

        const start = startDate.toISOString().split("T")[0];
        const end = endDate.toISOString().split("T")[0];

        const color =
          item.status == 0 ? "#FFA500" :
            item.status == 1 ? "#008000" :
              item.status == 2 ? "#8B4513" :
                item.status == 3 ? "#87CEEB" :
                  item.status == 4 ? "#FF0000" : "#ffffff";

        return [
          {
            id: "event-" + item.id,
            title: `${item.c_name} (${item.vanus})`,
            start,
            end,
            allDay: true,
            extendedProps: { ...item, calendar: "Primary" },
          },
          {
            id: "bg-" + item.id,
            start,
            end,
            display: "background",
            backgroundColor: color,
          },
        ];
      });
      setEvents(formattedEvents);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddOrUpdateEvent = async () => {
    const start = new Date(dateOfEvent);
    const end = new Date(date[0]);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    const data = {
      designName: selectedTech,
      c_name: eventTitle,
      vanus: vanus,
      doe: dateOfEvent,
      v_location: locationOfVanus,
      v_a_d: venueAvailabiliyDate,
      nodb: diffDays,
      pob: placeOfBooking,
      tc: transportCharges,
      sr: specialRequest,
      amount: amountTaxes,
      quntites: checkStock.quntites,
      width: checkStock.width,
      height: checkStock.height,
      categories_id: checkStock.categories_id,
      sub_categories_id: checkStock.sub_categories_id,
      bookedItems: appendsAll.filter(r => r.categories.id != 0)
    };


    await apiClient.post("admin/Events/create", data);
    getEvents();
    closeModal();
    resetModalFields();
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

      console.log(bookedStock, requestedStock, afterBooking);


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

  console.log(date);


  return (
    <>
      <PageMeta title="Calendar" description="Event Management" />

      {/* CUSTOM CONTEXT MENU */}

      {menuVisible && (
        <div
          className="absolute z-50 w-40 bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-800 dark:border-gray-700 py-2"
          style={{ top: menuPosition.y, left: menuPosition.x }}
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
                const event = contextData.event;
                setSelectedEvent(event);
                setEventTitle(event.title);
                setEventStartDate(event.start?.toISOString().split("T")[0] || "");
                // Populate from extendedProps
                setVanus(event.extendedProps?.vanus || "");
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
                    onClick={() => closeModal()}
                    className="text-white hover:text-red-200 text-xl"
                >
                    ✕
                </button>
            </div>
          <div className="overflow-y-auto custom-scrollbar p-5">
            {/* SAME DESIGN AS PREVIOUS */}
            <AutoComplete setSelectedTech={setSelectedTech}

            />
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Client Name</label>
                <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">VANUS</label>
                <input type="text" value={vanus} onChange={(e) => setVanus(e.target.value)} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Date Of Event</label>
                <input type="date" value={dateOfEvent} onChange={(e) => setDateOfEvent(e.target.value)} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
              </div>

              <DatePicker
                id="date-picker"
                label="Last Booking Day"
                placeholder="Select a date"
                onChange={(dates: Date[]) => setDate(dates)}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Venue Availability Date & Time</label>
                <input type="datetime-local" value={venueAvailabiliyDate} onChange={(e) => setVenueAvailalityDate(e.target.value)} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
              </div>
              <div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Location Of VANUS</label>
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
                    [e.target.name]: e.target.value
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appendsAll && appendsAll.map((rows, i) => (
                    rows.categories.id != 0 &&
                    <div
                      key={i}
                      className="grid grid-cols-9 gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 shadow-sm"
                    >
                      {/* Category */}
                      <div className="col-span-3 h-11 flex items-center px-2 text-sm text-gray-800 dark:text-white/90">
                        {rows.categories?.name}
                      </div>

                      {/* Sub Category */}
                      <div className="col-span-3 h-11 flex items-center px-2 text-sm text-gray-800 dark:text-white/90">
                        {rows.subCategories?.name}
                      </div>

                      {/* Input */}

                      {rows.subCategories.is_enable ? (
                        <>
                          <input
                            type="text"
                            placeholder="Width"
                            value={rows.inputs.width || ""}
                            onChange={(e) =>
                              handleInputChange(i, "width", e.target.value)
                            }
                          />

                          <input
                            type="text"
                            placeholder="Height"
                            value={rows.inputs.height || ""}
                            onChange={(e) =>
                              handleInputChange(i, "height", e.target.value)
                            }
                          />
                        </>
                      ) : (
                        <input
                          type="text"
                          placeholder="Quantity"
                          value={rows.inputs.value || ""}
                          onChange={(e) =>
                            handleInputChange(i, "value", e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
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
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Amount + Taxes</label>
                <input type="number" value={amountTaxes} onChange={(e) => setAmountTaxes(e.target.value)} className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Status</label>
                <select className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" >
                  <option value={0} >Select Status</option>
                  {Object.entries(status).map(([key, value]) => (
                    <option key={key} value={key}>
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
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar?.toLowerCase()}`;
  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;