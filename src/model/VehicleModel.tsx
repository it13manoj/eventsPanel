
import { useState } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";

import "react-toastify/dist/ReactToastify.css";


export default function VehicleModal({ isOpen, closeModal }: any) {



    const [form, setform] = useState({});

    const eventHendler = (e: any) => {
        setform(preState => ({ ...preState, [e.target.name]: e.target.value }))
    }

    const submitHendler = async (e: any) => {
        e.preventDefault()
        try {
            const results = await apiClient.post("/admin/vehicle/create", form);

            console.log(results)
            closeModal()

        } catch {

        }
    }



    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[100%] p-6 lg:p-10">
            <div className="overflow-y-auto custom-scrollbar">
                <div>
                    <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                        {"Vehicle Details"}
                    </h5>
                </div>

                {/* Form: 2-column grid */}
               <form onSubmit={submitHendler}>

                    {/* Row 1 */}
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* Vehicle Type */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Vehicle Name
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" placeholder="Write the Vehicle Name" name="name" onChange={eventHendler} />
                        </div>


                        {/* Vehicle Wheel */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Number Of Vehicle Wheel
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" placeholder="Write the Number of Vehicle wheel" name="wheel" onChange={eventHendler} />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* Fuel Type */}
                        <div>
                            <label className="label-style">Fuel Type</label>
                            <select className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="fuel_type" onChange={eventHendler}>
                                <option>Select</option>
                                <option value={"diesel"}>Diesel</option>
                                <option value={"petrol"}>Petrol</option>
                                <option value={"cng"}>CNG</option>
                                <option value={"electric"}>Electric</option>
                            </select>
                        </div>

                        {/* Load Capacity */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Load Capacity (Ton)
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" placeholder="Capacity" name="capacity" onChange={eventHendler} />
                        </div>
                    </div>

                    {/* Row 3 */}


                    {/* Vahicale Discription */}
                    <div className="mt-8">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Discription
                        </label>
                        <textarea
                            className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            name="description" onChange={eventHendler}
                            placeholder="Write the Discription"
                        ></textarea>
                    </div>


                    {/* Buttons */}
                    <div className="flex items-center gap-3 mt-6 sm:justify-end">
                        <button
                            type="button"
                            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                        >
                            Save Vehicle
                        </button>
                    </div>

                </form>
            </div>


        </Modal>
    );
}