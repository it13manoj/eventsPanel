import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";

import { FaTruck } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";

import { useEffect, useState } from "react";
import apiClient from "../../hooks/api/apiClient";
import EventAssignModel from "../../model/EventAssignModel";
import { useModal } from "../../hooks/useModal";
import ItemsModel from "../../model/ItemModel";
import EventDetailsModal from "../../model/EventDetailsModal";
import AssignTeam from "../../model/AssignTeam";
import { format } from "date-fns";
import VehicleAssign from "../../model/VehicleAssign";

interface BookedItem {
    id: number;
    categories_id: number;
    categories_name: string;
    subCategories_id: number;
    subCategories_name: string;
    width: string;
    height: string;
    qt: number;
    event_id: number;
    created_at: string;
    updated_at: string;
}

interface Installation {
    installing: string,
    uninstalling: string,
    event_id: number
}


export default function EventsTable() {
    const [eid, setEId] = useState({
        id: ""
    })
    const { isOpen, openModal, closeModal } = useModal();
    const [isOpens, setIsOpens] = useState(false);
    const [bookedItems, setBookedItems] = useState<Record<number, BookedItem[]>>({});
    const [selectedItems, setSelectedItems] = useState<BookedItem[] | null>(null);

    const [inst, setInst] = useState<{ [key: number]: Installation[] }>({});

    const [isOpenes, setIsOpenes] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);


    const [isOpenTeam, setIsOpenTeam] = useState(false);
     const [isOpenvehicle, setIsOpenvehicle] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

    console.log(setSelectedItems);
    
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



    const getBookedItems = async (id: number) => {
        try {
            const res = await apiClient(`/admin/Events/bookedEvents/items/${id}`);
            const items: BookedItem[] = res?.data?.results || [];

            setBookedItems(prev => ({
                ...prev,
                [id]: items
            }));
        } catch {
            setBookedItems(prev => ({
                ...prev,
                [id]: []
            }));
        }
    };


    useEffect(() => {
        events.forEach((row: any) => {
            if (row.id && bookedItems[row.id] === undefined) {
                getBookedItems(row.id);
            }
        });
    }, [events, bookedItems]);



    const installationUninstallation = async (id: number) => {
        try {
            const res = await apiClient(`/admin/teamAssign/install/undinstall/${id}`);
            console.log(res, "-----------");

            const items: Installation[] = res?.data?.data || [];

            setInst((prev) => ({
                ...prev,
                [id]: items,
            }));
        } catch (error) {
            console.error(error);

            setInst((prev) => ({
                ...prev,
                [id]: [],
            }));
        }
    };

    useEffect(() => {
        setTimeout(() => {
            events.forEach((row: any) => {
                if (row.id && inst[row.id] === undefined) {
                    installationUninstallation(row.id);
                }
            });
        }, 2000)

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
                th.removeEventListener("wheel", () => { });
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
                                Teams
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                installation
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Uninstallation
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
                                    <span
                                        className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 cursor-pointer hover:text-blue-600"
                                        onClick={() => {
                                            setSelectedRow(rows);
                                            setIsOpenes(true);
                                        }}
                                    >
                                        {rows?.c_name}
                                    </span>
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



                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <span
                                        className="cursor-pointer text-blue-600 hover:underline"
                                        onClick={() => {
                                            setSelectedTeamId(rows.id);
                                            setIsOpenTeam(true);
                                        }}
                                    >
                                        {teamSizes[rows.id] ?? 0}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {
                                        inst[rows.id]?.[0]?.installing &&
                                            !isNaN(new Date(inst[rows.id][0].installing).getTime())
                                            ? format(
                                                new Date(inst[rows.id][0].installing),
                                                "dd-MM-yyyy hh:mm aa"
                                            )
                                            : "-"
                                    }
                                </TableCell>

                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {
                                        inst[rows.id]?.[0]?.uninstalling &&
                                            !isNaN(new Date(inst[rows.id][0].uninstalling).getTime())
                                            ? format(
                                                new Date(inst[rows.id][0].uninstalling),
                                                "dd-MM-yyyy hh:mm aa"
                                            )
                                            : "-"
                                    }
                                </TableCell>

                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {(teamSizes[rows.id] ?? 0) > 0 ? (
                                        <button type="button" className="btn btn-dander btn-update-event w-full sm:w-auto rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600" >Team Assigned</button>

                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                {/* Assign Team */}
                                                <button
                                                    className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                                                    title="Assign Team"
                                                    onClick={() => { openModal(); getEventsByID(rows.id); }}
                                                >
                                                    <HiUserGroup size={18} />
                                                </button>

                                                {/* Assign Vehicle */}
                                                <button
                                                    className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition"
                                                    title="Assign Vehicle"
                                                    onClick={() => { getEventsByID(rows.id); setIsOpenvehicle(true)}}
                                                >
                                                    <FaTruck size={18} />
                                                </button>
                                            </div>

                                        </>
                                        // <button type="button" className="btn btn-success btn-update-event w-full sm:w-auto rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600" onClick={() => { openModal(); getEventsByID(rows.id); }}>Assign Team</button>

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

            <ItemsModel
                selectedItems={selectedItems || []}
                isOpens={isOpens}
                setIsOpens={setIsOpens}

            />

            <EventDetailsModal
                isOpen={isOpenes}
                onClose={() => setIsOpenes(false)}
                data={selectedRow}
                bookedItems={bookedItems}
            />
            <AssignTeam isOpen={isOpenTeam}
                onClose={() => setIsOpenTeam(false)}
                id={selectedTeamId} />

            <VehicleAssign isOpen={isOpenvehicle}
                onClose={() => setIsOpenvehicle(false)}
                id={selectedTeamId} />
        </div>
    );
}
