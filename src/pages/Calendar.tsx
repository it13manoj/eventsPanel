import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import multiMonthPlugin from "@fullcalendar/multimonth";
import apiClient from "../hooks/api/apiClient";

interface CalendarEvent extends EventInput {
  extendedProps?: {
    calendar?: string;
  };
}

const calendarsEvents = {
  Danger: "danger",
  Success: "success",
  Primary: "primary",
  Warning: "warning",
};

const cellBackgroundColors: Record<string, string> = {
  Danger: "rgba(94, 5, 5, 0.15)",
  Success: "rgb(5, 167, 64)",
  Primary: "rgba(0, 14, 207, 0.15)",
  Warning: "rgba(247, 240, 221, 0.15)",
};

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);


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






  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();



  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setDateOfEvent(selectInfo.startStr)
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;

    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar);

    openModal();
  };

  const handleAddOrUpdateEvent = async () => {
    const bgColor = cellBackgroundColors[eventLevel];

    const mainEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventTitle,
      start: eventStartDate,
      end: eventEndDate,
      allDay: true,
      extendedProps: { calendar: eventLevel },
    };

    const bgEvent: CalendarEvent = {
      id: "bg-" + Date.now(),
      start: eventStartDate,
      end: eventEndDate,
      display: "background",
      backgroundColor: bgColor,
    };

    setEvents((prev) => [...prev, mainEvent, bgEvent]);

    const data = {
      "c_name": eventTitle,
      "vanus": vanus,
      "doe": dateOfEvent,
      "v_location": locationOfVanus,
      "v_a_d": venueAvailabiliyDate,
      "nodb": bookingDays,
      "pob": placeOfBooking,
      "tc": transportCharges,
      "sr": specialRequest,
      "amount": amountTaxes
    }
    const results = await apiClient.post("admin/Events/create", data)
    console.log(results)

    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
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
        item.status == 0
          ? "#FFA500"
          : item.status == 1
          ? "#008000"
          : item.status == 2
          ? "#8B4513"
          : item.status == 3
          ? "#87CEEB"
          : item.status == 4
          ? "#FF0000"
          : "#ffffff";

      return [
        {
          id: "event-" + item.id,
          title: `${item.c_name} (${item.vanus})`,
          start,
          end,
          allDay: true,
          extendedProps: {
            calendar: "Primary",
          },
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

    console.log("Formatted Events:", formattedEvents);

    setEvents(formattedEvents);
  } catch (error) {
    console.log(error);
  }
};

  useEffect(() => {
    getEvents()
  }, [0])

  return (
    <>
      <PageMeta
        title="React.js Calendar Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Calendar Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              multiMonthPlugin,
            ]}
            initialView="Yearly"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "Yearly,dayGridMonth,timeGridWeek,timeGridDay",
            }}
            views={{
              Yearly: {
                type: "multiMonth",
                duration: { months: 12 },
              },
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
          />
        </div>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[100%] p-6 lg:p-10"
        >
          <div className="overflow-y-auto custom-scrollbar">
            {/* Header */}


            {/* Form: 2-column grid */}
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Client Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Client Name
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* VANUS */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  VANUS
                </label>
                <input
                  type="text"
                  value={vanus} onChange={(e) => setVanus(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* Date Of Event */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Date Of Event
                </label>
                <input
                  type="date"
                  value={dateOfEvent} onChange={(e) => setDateOfEvent(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* Location Of VANUS */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Location Of VANUS
                </label>
                <input
                  type="text"
                  value={locationOfVanus} onChange={(e) => setLocationOfVanus(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* Venue Availability Date & Time */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Venue Availability Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={venueAvailabiliyDate}
                  onChange={(e) => setVenueAvailalityDate(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* Number Of Days of Booking */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Number Of Days of Booking
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter number of days"
                  value={bookingDays}
                  onChange={(e) => setBookingDays(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* Place Of Booking */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Place Of Booking
                </label>
                <input
                  type="text"
                  placeholder="Enter place of booking"
                  value={placeOfBooking}
                  onChange={(e) => setPlaceOfBooking(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* Transport Charges */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Transport Charges (If Booking Outside Indore City)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter transport charges"
                  value={transportCharges}
                  onChange={(e) => setTransportCharges(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* Special Request */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Special Request (If Any)
                </label>
                <textarea
                  placeholder="Enter any special request"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                ></textarea>
              </div>

              {/* Amount + Taxes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Amount + Taxes
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter total amount"
                  value={amountTaxes}
                  onChange={(e) => setAmountTaxes(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* Event Color */}
              <div className="md:col-span-2 " style={{ display: "none" }}>
                <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Color
                </label>
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  {Object.entries(calendarsEvents).map(([key, value]) => (
                    <div key={key} className="n-chk">
                      <div className={`form-check form-check-${value} form-check-inline`}>
                        <label
                          className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                          htmlFor={`modal${key}`}
                        >
                          <span className="relative">
                            <input
                              className="sr-only form-check-input"
                              type="radio"
                              name="event-level"
                              value={key}
                              id={`modal${key}`}
                              checked={eventLevel === key}
                              onChange={() => setEventLevel(key)}
                            />
                            <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                              <span
                                className={`h-2 w-2 rounded-full bg-white ${eventLevel === key ? "block" : "hidden"}`}
                              ></span>
                            </span>
                          </span>
                          {key}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Date */}
              <div style={{ display: "none" }}>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Enter Start Date
                </label>
                <input
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* End Date */}
              <div style={{ display: "none" }}>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Enter End Date
                </label>
                <input
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Close
              </button>
              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
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
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
