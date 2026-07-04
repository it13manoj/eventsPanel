
import PageMeta from "../common/PageMeta";
import PageBreadcrumb from "../common/PageBreadCrumb";
import { useEffect, useState } from "react";
import apiClient from "../../hooks/api/apiClient";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaUserPlus } from "react-icons/fa";

interface Agent {
    id: number;
    name: string;
    owner_agency: number;
    status: number;
}


export default function Agency() {
    const [vehicletype, setVehicleType] = useState([{
        id: 0,
        name: ""
    }])

    const [form, setform] = useState({
        name: "",
        vehicle_number: "",
        vehicle_type_id: "",
        owner_agency: "",
        contact: "",
        load_capacity: "",
        insurance: "",
        driver_contact: "",
        commission: ""
    });
    const [file, setFile] = useState<any>(null);

    const gettheVehicleType = async () => {
        try {
            const results = await apiClient.get("/admin/vehicle/find");
            setVehicleType(results.data.results)
        } catch {

        }
    }

    useEffect(() => {
        gettheVehicleType()
    }, [0])

    const eventHendlerfile = (e: any) => {
        setFile(e.target.files[0]);
    };



    const eventHendler = (e: any) => {
        setform(preState => ({ ...preState, [e.target.name]: e.target.value }))
    }

    const submitHendler = async (e: any) => {
        e.preventDefault()
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("vehicle_number", form.vehicle_number);
        formData.append("vehicle_type_id", form.vehicle_type_id);
        formData.append("owner_agency", form.owner_agency);
        formData.append("contact", form.contact);
         formData.append("ownershiptype", "Agency");
        formData.append("load_capacity", form.load_capacity);
        formData.append("insurance", form.insurance);
        formData.append("driver_contact", form.driver_contact);
        formData.append("commission", form.commission);
        formData.append("image", file);


        try {
            const results = await apiClient.post("/admin/vehicleDetails/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // override here
                },
            });

            console.log(results)
            toast.success("Successfully Created!");
        } catch {

        }
    }

    // ---------------------------------------------------------

    const [open, setOpen] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([

    ]);

    const [agent, setAgent] = useState({
        id: 0,
        name: "",
        owner_agency: "2",

    });

    const saveAgent = async () => {
        try {
            if (agent.id === 0) {
                // Create
                await apiClient.post("/admin/AgentOwner/create", agent);
            } else {
                // Update
                await apiClient.put(`/admin/AgentOwner/update/${agent.id}`, agent);
            }

            // Refresh the list
            const res = await apiClient.get("/admin/AgentOwner/find");
            setAgents(res.data.data);

            // Reset form
            setAgent({
                id: 0,
                name: "",
                owner_agency: "2",
            });

        } catch (error) {
            console.error(error);
        }
    };

    const editAgent = async (row: Agent) => {
        setAgent({
            id: row.id,
            name: row.name,
            owner_agency: row.owner_agency.toString(),
        });
        await apiClient.post(`/admin/AgentOwner/update/${row.id}`, row);
        const res = await apiClient.get(`/admin/AgentOwner/find`);
        setAgents([
            ...agents,
            ...res.data.data,
        ]);
    };

    const deleteAgent = async (id: number) => {
        setAgents(agents.filter((x) => x.id !== id));
        await apiClient.delete(`/admin/AgentOwner/deletes/${id}`);
        //   loadAgents()
    };

    const loadAgents = async () => {
        const res = await apiClient.get(`/admin/AgentOwner/find`);

        console.log(res);

        // return false;
        console.log(res?.data?.data);

        setAgents([
            ...agents,
            ...res.data.data,
        ]);
    }

    useEffect(() => {
        loadAgents()
    }, [])

    return (

        <div>
            <PageMeta
                title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Agency Vechicle" />
            <ToastContainer
                position="bottom-left"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                pauseOnHover
            />
            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                    {/* View Button */}

                    <button className="flex items-center gap-2 btn btn-success btn-update-event w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto" onClick={() => setOpen(true)}
                    >
                        <FaUserPlus size={18} />
                        Manage Agents
                    </button>
                </div>
                <form onSubmit={submitHendler}>
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* Vehicle Type */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Vehicle Name
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" placeholder="Enter the name" name="name" onChange={eventHendler} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Vehicle Number
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" placeholder="BR01AB1234" name="vehicle_number" onChange={eventHendler} />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Vehicle Type
                            </label>
                            <select className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" name="vehicle_type_id" onChange={eventHendler} >
                                <option>Select</option>
                                {vehicletype && vehicletype.map(rows => (
                                    <option value={rows.id}>{rows.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Vehicle Number */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Agent Name
                            </label>
                            {/* <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" placeholder="Owner name" name="owner_agency" onChange={eventHendler} /> */}

                            <select className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" name="owner_agency" onChange={eventHendler} >
                                <option>Select</option>
                                {agents && agents.map(rows => (
                                    <option value={rows.name}>{rows.name}</option>
                                ))}
                            </select>
                        </div>



                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* Agent Name */}


                        {/* Agent Contact */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Agent Contact
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" placeholder="+91 XXXXX XXXXX" name="contact" onChange={eventHendler} />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Commission (%)
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" placeholder="Commission %" name="commission" onChange={eventHendler} />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Load Capacity (Ton)
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" placeholder="Capacity" name="load_capacity" onChange={eventHendler} />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Insurance Expiry
                            </label>
                            <input type="date" className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" name="insurance" onChange={eventHendler} />
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">



                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Driver Contact No.
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" placeholder="+91 XXXXX XXXXX" name="driver_contact" onChange={eventHendler} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Vehicle Image
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
    file:rounded-lg file:border-0 file:text-sm file:font-semibold
    file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                                name="image" onChange={eventHendlerfile}
                            />
                        </div>


                        {/* Vehicle Image Upload */}

                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                        <button type="button" className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto">
                            Cancel
                        </button>

                        <button type="submit" className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto">
                            Save Agent Vehicle
                        </button>
                    </div>
                </form>
            </div>

            {open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl">

                        {/* Close Button */}
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition"
                        >
                            <FaTimes size={18} />
                        </button>

                        {/* Header */}
                        <div className="border-b px-6 py-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Agent Management
                            </h2>
                        </div>

                        {/* Body */}

                        <div className="grid grid-cols-12 gap-6 p-6">

                            {/* Left */}

                            <div className="col-span-4">

                                <h3 className="font-semibold mb-4">
                                    {agent.id === 0 ? "Add Agent" : "Update Agent"}
                                </h3>

                                <input
                                    className="border rounded-lg w-full p-3 mb-4"
                                    placeholder="Agent Name"
                                    value={agent.name}
                                    onChange={(e) =>
                                        setAgent({
                                            ...agent,
                                            name: e.target.value,
                                        })
                                    }
                                />

                                <input
                                    className=" hidden border rounded-lg w-full p-3 mb-4"
                                    placeholder="Owner Agency"
                                    value={2}
                                    onChange={(e) =>
                                        setAgent({
                                            ...agent,
                                            owner_agency: e.target.value,
                                        })
                                    }
                                />

                                <button
                                    onClick={saveAgent}
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg w-full py-3 flex justify-center items-center gap-2"
                                >
                                    <FaPlus />
                                    {agent.id === 0 ? "Add Agent" : "Update Agent"}
                                </button>
                            </div>

                            {/* Right */}

                            <div className="col-span-8">

                                <h3 className="font-semibold mb-4">
                                    Agent List
                                </h3>

                                <table className="w-full border">

                                    <thead className="bg-gray-100">

                                        <tr>

                                            <th className="p-3">Name</th>

                                            {/* <th className="p-3">
                                            Agency
                                        </th> */}

                                            <th className="p-3">
                                                Status
                                            </th>

                                            <th className="p-3">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {agents.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="border-t"
                                            >
                                                <td className="p-1 text-center align-middle">
                                                    {row.name}
                                                </td>

                                                {/* <td className="p-3">
                                                {row.owner_agency}
                                            </td> */}

                                                <td className="p-3 text-center align-middle">

                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs text-center align-middle">
                                                        {(row?.status == 1) ? "Active" : "Inactive"}
                                                    </span>

                                                </td>

                                                <td className="p-3 text-center align-middle">

                                                    <div className="gap-2 text-center align-middle">


                                                        <button
                                                            onClick={() =>
                                                                editAgent(row)
                                                            }
                                                            className="bg-yellow-500 text-white p-2 rounded"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        &nbsp;
                                                        <button
                                                            onClick={() =>
                                                                deleteAgent(row.id)
                                                            }
                                                            className="bg-red-500 text-white p-2 rounded"
                                                        >
                                                            <FaTrash />
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </div>
            )}
        </div>

    )

}