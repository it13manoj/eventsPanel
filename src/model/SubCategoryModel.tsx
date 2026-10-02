import { useEffect, useState } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";
import { toast } from "react-toastify";

export default function SubCategoryModel({ isOpen, closeModal, subCategoryData, onSuccess }: any) {
    const isEdit = Boolean(subCategoryData && subCategoryData.id);

    const [enabled, setEnabled] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [form, setForm] = useState({
        categories_id: "",
        name: "",
        code: "",
        description: ""
    });

    const getCategories = async () => {
        try {
            const results = await apiClient.get("/admin/category/find");
            setCategories(results?.data?.results || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    useEffect(() => {
        if (subCategoryData && subCategoryData.id) {
            setForm({
                categories_id: String(subCategoryData.categories_id || subCategoryData.categories?.id || ""),
                name: subCategoryData.name || "",
                code: subCategoryData.code || "",
                description: subCategoryData.description || ""
            });
            setEnabled(Boolean(subCategoryData.is_enable));
        } else {
            setForm({
                categories_id: "",
                name: "",
                code: "",
                description: ""
            });
            setEnabled(false);
        }
    }, [subCategoryData, isOpen]);

    const eventHandler = (e: any) => {
        setForm(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    };

    const submitCategory = async (e: any) => {
        e.preventDefault();
        const data = {
            ...form,
            is_enable: enabled
        };

        try {
            if (isEdit) {
                await apiClient.put(`/admin/subCategory/update/${subCategoryData.id}`, data);
                toast.success("SubCategory updated successfully!");
            } else {
                await apiClient.post("/admin/subCategory/create", data);
                toast.success("SubCategory created successfully!");
            }
            if (onSuccess) onSuccess();
            closeModal();
        } catch (error: any) {
            console.error("Error saving subcategory:", error);
            toast.error(error?.response?.data?.message || "Failed to save subcategory");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[100%] p-6 lg:p-10"
        >
            <div className="overflow-y-auto custom-scrollbar">
                <div>
                    <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                        {isEdit ? "Edit Sub Category" : "Add Sub Category"}
                    </h5>
                </div>

                <form onSubmit={submitCategory}>
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Category */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Category
                            </label>
                            <select
                                required
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                name="categories_id"
                                value={form.categories_id}
                                onChange={eventHandler}
                            >
                                <option value="">Select Category</option>
                                {categories && categories.map((rows: any) => (
                                    <option key={rows.id} value={rows.id}>{rows.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sub Category Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Sub Category Name
                            </label>
                            <input
                                required
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="Enter sub category name"
                                name="name"
                                value={form.name}
                                onChange={eventHandler}
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
                                required
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="SUBCAT-001"
                                name="code"
                                value={form.code}
                                onChange={eventHandler}
                            />
                        </div>

                        {/* Enable Size Toggle */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Enable Size Option
                            </label>
                            <div className="flex items-center gap-3 mt-3">
                                <input
                                    type="checkbox"
                                    id="is_enable"
                                    checked={enabled}
                                    onChange={(e) => setEnabled(e.target.checked)}
                                    className="w-5 h-5 accent-brand-500 rounded cursor-pointer"
                                />
                                <label htmlFor="is_enable" className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                                    {enabled ? "Size measurement enabled" : "Size measurement disabled"}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-8">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            placeholder="Write sub category description..."
                            name="description"
                            value={form.description}
                            onChange={eventHandler}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn-success flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                        >
                            {isEdit ? "Update Sub Category" : "Save Sub Category"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}