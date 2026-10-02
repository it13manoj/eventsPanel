import { useEffect, useState } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";
import { toast } from "react-toastify";

export default function CategoryModel({ isOpen, closeModal, categoryData, onSuccess }: any) {
    const isEdit = Boolean(categoryData && categoryData.id);

    const [form, setForm] = useState({
        name: "",
        code: "",
        status: "1",
        description: ""
    });

    useEffect(() => {
        if (categoryData && categoryData.id) {
            setForm({
                name: categoryData.name || "",
                code: categoryData.code || "",
                status: String(categoryData.status ?? "1"),
                description: categoryData.description || ""
            });
        } else {
            setForm({
                name: "",
                code: "",
                status: "1",
                description: ""
            });
        }
    }, [categoryData, isOpen]);

    const eventHandler = (e: any) => {
        setForm(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    };

    const submitCategory = async (e: any) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await apiClient.put(`/admin/category/update/${categoryData.id}`, form);
                toast.success("Category updated successfully!");
            } else {
                await apiClient.post("/admin/category/create", form);
                toast.success("Category created successfully!");
            }
            if (onSuccess) onSuccess();
            closeModal();
        } catch (error: any) {
            console.error("Error saving category:", error);
            toast.error(error?.response?.data?.message || "Error saving category");
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
                        {isEdit ? "Edit Category" : "Add Category"}
                    </h5>
                </div>

                <form onSubmit={submitCategory}>
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Category Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Category Name
                            </label>
                            <input
                                required
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="Enter category name"
                                name="name"
                                value={form.name}
                                onChange={eventHandler}
                            />
                        </div>

                        {/* Category Code */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Category Code
                            </label>
                            <input
                                required
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="CAT-001"
                                name="code"
                                value={form.code}
                                onChange={eventHandler}
                            />
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Status */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Status
                            </label>
                            <select
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                name="status"
                                value={form.status}
                                onChange={eventHandler}
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
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
                            placeholder="Write category description..."
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
                            {isEdit ? "Update Category" : "Save Category"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}