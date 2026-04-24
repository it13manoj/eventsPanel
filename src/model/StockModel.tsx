import { useEffect, useState } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";


export default function StockModel({ isOpen, closeModal}: any) {
    if (!open) return null;
    const [categories, setCategories] = useState([{
        id: "",
        name: ""
    }]);
    const [subCategories, setSubCategories] = useState([{
        id: "",
        name: ""
    }]);

    const [inventory, setInventory] = useState({})
    const [wareHouse, setWarehouse] = useState([{
        id: "",
        name: ""
    }])




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


    const datahandler = (e: any) => {
        setInventory(preState => ({ ...preState, [e.target.name]: e.target.value }))
    }


    const submitHandler = (e: any) => {
        e.preventDefault();

        try {
            const results = apiClient.post("/admin/Inverntory/create", inventory)
            console.log(results);
            closeModal();
        } catch {

        }
    }

    const wareHouses = async () => {
        try {
            const results = await apiClient.get("/admin/warehouse/find")
            setWarehouse(results?.data?.results)
        } catch {

        }
    }

    useEffect(() => {
        wareHouses()
    }, [0])


    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[100%] p-6 lg:p-10">
            <div className="overflow-y-auto custom-scrollbar">
                <div>
                    <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                        {"Stock"}
                    </h5>
                </div>

                {/* Form: 2-column grid */}
                <form onSubmit={submitHandler} >
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Category
                            </label>
                            <select className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="categories_id" onChange={(e: any) => {
                                eventHandler(e);
                                datahandler(e);
                            }}>
                                <option value={0}> Select Category</option>
                                {categories && categories?.map(rows => (
                                    <option value={rows?.id}> {rows.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Sub Category
                            </label>
                            <select className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="sub_categories_id" onChange={datahandler}>
                                <option value={0}> Select Sub Category</option>
                                {subCategories && subCategories.map(rows => (
                                    <option value={rows?.id}>{rows.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Ware House
                            </label>
                            <select className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="ware_house_id" onChange={datahandler}>
                                <option value={0}> Select Ware House</option>
                                {wareHouse && wareHouse.map(rows => (
                                    <option value={rows?.id}>{rows.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Width(ft)
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="width" onChange={datahandler} />

                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Height(ft)
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="height" onChange={datahandler} />

                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Color
                            </label>
                            <input type="color" className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="color" onChange={datahandler} />

                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Number Of Quantity
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="quantity" onChange={datahandler} />

                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Price(ft)
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="price" onChange={datahandler} />

                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Quality
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="quality" onChange={datahandler} />

                        </div>
                    </div>



                    <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                        <button
                            onClick={closeModal}
                            type="button"
                            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                        >
                            Close
                        </button>
                        <button

                            type="submit"
                            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                        >
                            {"Submit"}
                        </button>
                    </div>
                </form>
            </div>


        </Modal>
    );
}