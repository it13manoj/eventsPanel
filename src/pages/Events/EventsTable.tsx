import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";


import { useEffect, useState } from "react";
import apiClient from "../../hooks/api/apiClient";
import EventAssignModel from "../../model/EventAssignModel";
import { useModal } from "../../hooks/useModal";



export default function EventsTable() {
    const [eid, setEId] = useState({
        id: ""
    })
    const { isOpen, openModal, closeModal } = useModal();
    const [events, setEvents] = useState([{
        "id": 0,
        "c_name": "",
        "vanus": "",
        "doe": "",
        "v_location": "",
        "v_a_d": "",
        "nodb": "",
        "pob": "",
        "tc": "",
        "sr": "",
        "amount": "",
        "status": "",
        "created_at": ""
    }])


    const getEvents = async () => {
        try {
            const results = await apiClient.get("admin/Events/find")
            setEvents(results?.data?.results);
        } catch {

        }
    }

    const getStatusColor = (status: any) => {
        const statusColors: Record<number, string> = {
            0: "Enquriy",
            1: "Confirm/Live",
            2: "Installation Ongoing",
            3: "Event Finished",
            4: "Cancelled/Postpone",
        };

        return statusColors[Number(status)] || "#ffffff";
    };

     useEffect(() => {
        getEvents()
    }, [isOpen])

    useEffect(() => {
        getEvents()
    }, [0])

    const getEventsByID = (id: any) => {
        setEId({ id: id });
    }

    const [teamSizes, setTeamSizes] = useState<{ [key: number]: number }>({});

    const getTeamMember = async (id: number) => {
        try {
            if (id > 0) {
                const res = await apiClient(`/admin/teamAssign/find/${id}`);
                const size = res?.data?.data?.TeamAssignUser?.length || 0;

                setTeamSizes(prev => ({
                    ...prev,
                    [id]: size
                }));
            }
        } catch {
            setTeamSizes(prev => ({
                ...prev,
                [id]: 0
            }));
        }
    };

    useEffect(() => {
        events.forEach((row: any) => {
            if (!teamSizes[row.id]) {
                getTeamMember(row.id);
            }
        });
    }, [events]);

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
      th.removeEventListener("wheel", () => {});
    });
  };
}, []);



    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-scroll" style={{ whiteSpace: "nowrap" }}>
                <Table className="resizable-table">
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                #
                            </TableCell>
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
                                VANUS
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Start Date Of Event
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                End Date Of Event
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Location Of VANUS
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Venue Availability Date & Time
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Number Of Days of Booking
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Place Of Booking
                            </TableCell>


                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Transport Charges
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Special Request
                            </TableCell>


                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Amount + Taxes
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Booking Date
                            </TableCell>


                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Status
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Team
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
                        {events && events.map((rows) => (
                            <TableRow key={rows?.id}>
                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 overflow-hidden rounded-full">
                                            {rows?.id}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                    <div>
                                        <div>
                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {rows?.c_name}
                                            </span>

                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {rows?.vanus}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    <div className="flex -space-x-2">
                                        {rows?.doe && !isNaN(new Date(rows.doe).getTime())
                                            ? new Date(rows.doe).toISOString().split("T")[0]
                                            : "-"}
                                    </div>
                                </TableCell>

                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    <div className="flex -space-x-2">
                                        {(() => {
                                            if (!rows?.doe) return "-";

                                            const startDate = new Date(rows.doe);
                                            if (isNaN(startDate.getTime())) return "-";

                                            startDate.setDate(startDate.getDate() + Number(rows?.nodb || 0));

                                            return startDate.toISOString().split("T")[0];
                                        })()}
                                    </div>
                                </TableCell>

                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {rows?.v_location}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {/* {rows?.v_a_d} */}
                                    {rows?.v_a_d && !isNaN(new Date(rows.v_a_d).getTime()) ? new Date(rows?.v_a_d)
                                        .toISOString()
                                        .slice(0, 19)
                                        .replace("T", " ") : "_"}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {rows?.nodb}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {rows?.pob}

                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {rows?.tc}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {rows?.sr}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {rows?.amount}
                                </TableCell>

                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {/* {rows?.v_a_d} */}
                                    {rows?.created_at && !isNaN(new Date(rows.created_at).getTime()) ? new Date(rows?.created_at)
                                        .toISOString()
                                        .slice(0, 19)
                                        .replace("T", " ") : "_"}
                                </TableCell>

                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {
                                        getStatusColor(Number(rows.status))

                                    }
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {teamSizes[rows.id] ?? 0}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {(teamSizes[rows.id] ?? 0) > 0 ? (
                                        <button type="button" className="btn btn-dander btn-update-event w-full sm:w-auto rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600" >Team Assigned</button>

                                    ) : (
                                        <button type="button" className="btn btn-success btn-update-event w-full sm:w-auto rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600" onClick={() => { openModal(); getEventsByID(rows.id); }}>Assign Team</button>

                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <EventAssignModel
                eid={eid}
                isOpen={isOpen}
                openModal={openModal}
                closeModal={closeModal} />
        </div>
    );
}
