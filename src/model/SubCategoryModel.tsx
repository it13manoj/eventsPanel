
import { useEffect, useState } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";



export default function SubCategoryModel({ isOpen, closeModal }: any) {

    const [enabled, setEnabled] = useState(false);



    const [category, setCategories] = useState([{
        "id": "",
        "name": ""
    }]);
    const [from, setform] = useState({})

    const eventHendler = (e: any) => {
        setform(preState => ({ ...preState, [e.target.name]: e.target.value }))
    }

    const submitCategory = async (e: any) => {
        e.preventDefault();
        const data ={
            ...from,
            is_enable: enabled
        }
        try {
            const results = await apiClient.post("/admin/subCategory/create", data);
            console.log(results);
            closeModal()
        } catch {
            console.log("error");
        }
    }

    const getCategories = async () => {
        try {
            const results = await apiClient.get("/admin/category/find");
            setCategories(results?.data?.results);
        } catch {

        }
    }


    useEffect(() => {
        getCategories()
    }, [0])


    console.log(category);


    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[100%] p-6 lg:p-10">
            <div className="overflow-y-auto custom-scrollbar">
                <div>
                    <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                        {"Sub Category"}
                    </h5>
                </div>

                {/* Form: 2-column grid */}
                <form onSubmit={submitCategory}>
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* Category */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Category
                            </label>
                            <select
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                name="categories_id" onChange={eventHendler}
                            >
                                <option value="">Select Category</option>
                                {category && category.map(rows => (
                                    <option value={rows.id}>{rows.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sub Category Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Sub Category Name
                            </label>
                            <input
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="Enter sub category name" name="name" onChange={eventHendler}
                            />
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* Sub Category Code */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Sub Category Code
                            </label>
                            <input
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="SUB-001" name="code" onChange={eventHendler}
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Status
                            </label>
                            <select
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                name="status" onChange={eventHendler}
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <span>Dynamic Enable ?</span>

                        <button
                            type="button"
                            onClick={() => setEnabled(!enabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${enabled ? "bg-green-500" : "bg-gray-300"
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enabled ? "translate-x-6" : "translate-x-1"
                                    }`}
                            />
                        </button>


                    </div>
                    {/* Description */}
                    <div className="mt-8">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Description
                        </label>
                        <textarea

                            className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            placeholder="Write sub category description..." name="description" onChange={eventHendler}
                        ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
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
                            Save Sub Category
                        </button>
                    </div>
                </form>
            </div>


        </Modal>
    );
}