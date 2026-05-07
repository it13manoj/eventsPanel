import { useEffect, useState } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";


type RowType = {
    size: string;
    quantity: string;
};

export default function StockModel({ isOpen, closeModal }: any) {
    if (!isOpen) return null; // ✅ FIXED

    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [wareHouse, setWarehouse] = useState<any[]>([]);

    const [inventory, setInventory] = useState<any>({});
    const [enabled, setEnabled] = useState(false);
    const [rows, setRows] = useState<RowType[]>([
        { size: "", quantity: "" }
    ]);

    const addRow = () => {
        setRows((prev) => [...prev, { size: "", quantity: "" }]);
    };

    const deleteRow = (index: number) => {
        setRows((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRowChange = (
        index: number,
        field: keyof RowType,   // ✅ FIX
        value: string
    ) => {
        const updated = [...rows];
        updated[index][field] = value;
        setRows(updated);
    };


    // ================= GET DATA =================

    const getCategories = async () => {
        try {
            const results = await apiClient.get("/admin/category/find");
            setCategories(results?.data?.results || []);
        } catch (err) {
            console.log(err);
        }
    };

    const wareHouses = async () => {
        try {
            const results = await apiClient.get("/admin/warehouse/find");
            setWarehouse(results?.data?.results || []);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getCategories();
        wareHouses();
    }, []);

    // ================= HANDLERS =================

    const eventHandler = async (e: any) => {
        try {
            const id = e.target.value;
            const results = await apiClient.get(
                `/admin/subCategory/findByid/${id}`
            );
            setSubCategories(results?.data?.results || []);
        } catch (err) {
            console.log(err);
        }
    };

    const datahandler = (e: any) => {
        setInventory((prev: any) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // sync switch value to inventory
    useEffect(() => {
        setInventory((prev: any) => ({
            ...prev,
            status: enabled ? 1 : 0,
        }));
    }, [enabled]);

    const submitHandler = async (e: any) => {
        e.preventDefault();
        let data = rows.filter(r => r.size != "" || r.quantity != "");
        let stocks = { ...inventory, data }
        console.log(stocks);

        try {
            const results = await apiClient.post(
                "/admin/Inverntory/create",
                stocks
            );
            console.log(results);
            closeModal();
        } catch (err) {
            console.log(err);
        }
    };

    // ================= UI =================

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[100%] p-6 lg:p-10"
        >
            <div className="overflow-y-auto custom-scrollbar">
                <h5 className="mb-4 font-semibold text-gray-800 text-xl dark:text-white">
                    Stock
                </h5>

                <form onSubmit={submitHandler}>
                    {/* Category + SubCategory */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm">Category</label>
                            <select
                                name="categories_id"
                                onChange={(e) => {
                                    eventHandler(e);
                                    datahandler(e);
                                }}
                                className="h-11 w-full border rounded-lg px-3"
                            >
                                <option value={0}>Select Category</option>
                                {categories.map((row) => (
                                    <option key={row.id} value={row.id}>
                                        {row.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm">Sub Category</label>
                            <select
                                name="sub_categories_id"
                                onChange={datahandler}
                                className="h-11 w-full border rounded-lg px-3"
                            >
                                <option value={0}>Select Sub Category</option>
                                {subCategories.map((row) => (
                                    <option key={row.id} value={row.id}>
                                        {row.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Warehouse */}
                    <div className="mt-4">
                        <label className="text-sm">Warehouse</label>
                        <select
                            name="ware_house_id"
                            onChange={datahandler}
                            className="h-11 w-full border rounded-lg px-3"
                        >
                            <option value={0}>Select Warehouse</option>
                            {wareHouse.map((row) => (
                                <option key={row.id} value={row.id}>
                                    {row.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Switch */}
                    <div className="mt-4 flex items-center gap-3">
                        <span>Have you Width and Length ?</span>

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

                        {/* ✅ Show only when enabled */}
                        {enabled ? (
                            <button
                                type="button"
                                onClick={addRow}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg mb-4"

                            >
                                Add
                            </button>
                        ) : <div> <input
                            name="quantity"
                            placeholder="Quantity"
                            onChange={datahandler}
                            className="h-11 border rounded-lg px-3"
                        /> </div>}
                    </div>

                    <div className="md:col-span-1">
                        {enabled && (
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                {rows.map((row, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-3 gap-3 items-center"
                                    >
                                        {/* Size Input */}
                                        <input
                                            type="text"
                                            placeholder="Size (e.g. 10x10)"
                                            value={row.size}
                                            onChange={(e) =>
                                                handleRowChange(index, "size", e.target.value)
                                            }
                                            className="h-11 border rounded-lg px-3"
                                        />

                                        {/* Quantity Input */}
                                        <input
                                            type="number"
                                            placeholder="Quantity"
                                            value={row.quantity}
                                            onChange={(e) =>
                                                handleRowChange(index, "quantity", e.target.value)
                                            }
                                            className="h-11 border rounded-lg px-3"
                                        />

                                        {/* Delete Button */}
                                        <button
                                            type="button"
                                            onClick={() => deleteRow(index)}
                                            className="h-11 bg-red-500 text-white rounded-lg"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* Width + Height */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 hidden">
                        <input
                            name="width"
                            placeholder="Width (ft)"
                            onChange={datahandler}
                            className="h-11 border rounded-lg px-3"
                        />
                        <input
                            name="height"
                            placeholder="Height (ft)"
                            onChange={datahandler}
                            className="h-11 border rounded-lg px-3"
                        />
                    </div>

                    {/* Color + Quantity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 hidden">
                        <input
                            type="color"
                            name="color"
                            onChange={datahandler}
                            className="h-11 border rounded-lg px-3"
                        />
                        <input
                            name="quantity"
                            placeholder="Quantity"
                            onChange={datahandler}
                            className="h-11 border rounded-lg px-3"
                        />
                    </div>

                    {/* Price + Quality */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <input
                            name="price"
                            placeholder="Price"
                            onChange={datahandler}
                            className="h-11 border rounded-lg px-3"
                        />
                        <input
                            name="quality"
                            placeholder="Quality"
                            onChange={datahandler}
                            className="h-11 border rounded-lg px-3"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-6 justify-end">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Close
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-lg"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}