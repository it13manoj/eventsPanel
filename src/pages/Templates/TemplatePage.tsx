import React, { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Modal } from "../../components/ui/modal";
import apiClient from "../../hooks/api/apiClient";
import { toast } from "react-toastify";
import {
  LayoutTemplate,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Package,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles,
  FolderPlus,
} from "lucide-react";

export interface TemplateItem {
  id?: string;
  category_id: number;
  category_name: string;
  subcategory_id: number;
  subcategory_name: string;
  quantity: number;
  price: number;
  vertical?: boolean;
  horizontal?: boolean;
  verticalValue?: string;
  verticalUnit?: string;
  verticalPcs?: number;
  horizontalValue?: string;
  horizontalUnit?: string;
  horizontalPcs?: number;
}

export interface EventTemplateData {
  id?: number;
  name: string;
  total_price: number;
  description?: string;
  items: TemplateItem[];
  created_at?: string;
  updated_at?: string;
}

export default function TemplatePage() {
  const [templates, setTemplates] = useState<EventTemplateData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplateData | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<EventTemplateData | null>(null);

  // Form states for Create/Edit
  const [formName, setFormName] = useState<string>("");
  const [formTotalPrice, setFormTotalPrice] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formItems, setFormItems] = useState<TemplateItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Item builder states inside form
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number>(0);
  const [selectedCatName, setSelectedCatName] = useState<string>("");
  const [selectedSubCatId, setSelectedSubCatId] = useState<number>(0);
  const [selectedSubCatName, setSelectedSubCatName] = useState<string>("");
  const [subCatIsEnable, setSubCatIsEnable] = useState<boolean>(false);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(0);

  // Dimensions for item
  const [itemVertical, setItemVertical] = useState<boolean>(false);
  const [itemVerticalValue, setItemVerticalValue] = useState<string>("10");
  const [itemVerticalUnit, setItemVerticalUnit] = useState<string>("ft");
  const [itemVerticalPcs, setItemVerticalPcs] = useState<number>(1);

  const [itemHorizontal, setItemHorizontal] = useState<boolean>(false);
  const [itemHorizontalValue, setItemHorizontalValue] = useState<string>("10");
  const [itemHorizontalUnit, setItemHorizontalUnit] = useState<string>("ft");
  const [itemHorizontalPcs, setItemHorizontalPcs] = useState<number>(1);

  // Fetch templates list
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/template/all");
      const list = res.data.results || res.data.data || [];
      setTemplates(list);
    } catch (err: any) {
      console.error("Error fetching templates:", err);
      toast.error(err.response?.data?.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Categories for Item Selector
  const [stockList, setStockList] = useState<any[]>([]);

  const fetchStockSummary = async () => {
    try {
      const res = await apiClient.get("/admin/Inverntory/availableStockSummary");
      setStockList(res.data?.results || []);
    } catch (err) {
      console.warn("Error fetching stock summary in TemplatePage:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/admin/category/find");
      setCategories(res.data.results || res.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    fetchStockSummary();
  }, []);

  const selectedStockItem = useMemo(() => {
    if (!selectedCatId || !selectedSubCatId) return null;
    return stockList.find(
      (s: any) =>
        Number(s.categories_id) === Number(selectedCatId) &&
        Number(s.sub_categories_id) === Number(selectedSubCatId)
    );
  }, [stockList, selectedCatId, selectedSubCatId]);

  // When Category changes in Item Selector
  const handleCategoryChange = async (catId: number) => {
    setSelectedCatId(catId);
    setSelectedSubCatId(0);
    setSelectedSubCatName("");
    setSubCategories([]);
    if (!catId) return;

    const cat = categories.find((c) => c.id === catId);
    setSelectedCatName(cat ? cat.name : "");

    try {
      const res = await apiClient.get(`/admin/subCategory/findByid/${catId}`);
      setSubCategories(res.data.results || res.data.data || []);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    }
  };

  // When SubCategory changes in Item Selector
  const handleSubCategoryChange = (subId: number) => {
    setSelectedSubCatId(subId);
    if (!subId) {
      setSelectedSubCatName("");
      setSubCatIsEnable(false);
      return;
    }

    const sub = subCategories.find((s) => s.id === subId);
    if (sub) {
      setSelectedSubCatName(sub.name);
      setSubCatIsEnable(Boolean(sub.is_enable));
      if (!sub.is_enable) {
        setItemVertical(false);
        setItemHorizontal(false);
      }
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setSelectedTemplate(null);
    setFormName("");
    setFormTotalPrice("");
    setFormDescription("");
    setFormItems([]);
    resetItemBuilder();
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (tpl: EventTemplateData) => {
    setSelectedTemplate(tpl);
    setFormName(tpl.name || "");
    setFormTotalPrice(String(tpl.total_price || 0));
    setFormDescription(tpl.description || "");
    setFormItems(Array.isArray(tpl.items) ? [...tpl.items] : []);
    resetItemBuilder();
    setIsFormModalOpen(true);
  };

  // Reset Item Builder Fields
  const resetItemBuilder = () => {
    setSelectedCatId(0);
    setSelectedCatName("");
    setSelectedSubCatId(0);
    setSelectedSubCatName("");
    setSubCategories([]);
    setSubCatIsEnable(false);
    setItemQuantity(1);
    setItemPrice(0);
    setItemVertical(false);
    setItemVerticalValue("10");
    setItemVerticalUnit("ft");
    setItemVerticalPcs(1);
    setItemHorizontal(false);
    setItemHorizontalValue("10");
    setItemHorizontalUnit("ft");
    setItemHorizontalPcs(1);
  };

  // Add Item to Template List
  const handleAddItem = () => {
    if (!selectedCatId || !selectedSubCatId) {
      toast.warning("Please select both Category and Sub Category from stock.");
      return;
    }

    if (itemQuantity <= 0) {
      toast.warning("Number of items (Quantity) must be at least 1.");
      return;
    }

    const newItem: TemplateItem = {
      id: `${Date.now()}-${Math.random()}`,
      category_id: selectedCatId,
      category_name: selectedCatName,
      subcategory_id: selectedSubCatId,
      subcategory_name: selectedSubCatName,
      quantity: Number(itemQuantity),
      price: Number(itemPrice) || 0,
      vertical: itemVertical,
      verticalValue: itemVertical ? itemVerticalValue : undefined,
      verticalUnit: itemVertical ? itemVerticalUnit : undefined,
      verticalPcs: itemVertical ? Number(itemVerticalPcs) : undefined,
      horizontal: itemHorizontal,
      horizontalValue: itemHorizontal ? itemHorizontalValue : undefined,
      horizontalUnit: itemHorizontal ? itemHorizontalUnit : undefined,
      horizontalPcs: itemHorizontal ? Number(itemHorizontalPcs) : undefined,
    };

    const updated = [...formItems, newItem];
    setFormItems(updated);

    // Auto-calculate suggested total price if user hasn't overridden or form is empty
    const autoTotal = updated.reduce(
      (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
      0
    );
    if (!formTotalPrice || Number(formTotalPrice) === 0) {
      setFormTotalPrice(String(autoTotal));
    }

    toast.success(`Added ${selectedSubCatName} (${itemQuantity} pcs) to template!`);
    resetItemBuilder();
  };

  // Remove Item from Template
  const handleRemoveItem = (index: number) => {
    const updated = formItems.filter((_, idx) => idx !== index);
    setFormItems(updated);
  };

  // Auto-calculate total price button
  const handleAutoCalculateTotal = () => {
    const sum = formItems.reduce(
      (acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1),
      0
    );
    setFormTotalPrice(String(sum));
    toast.info(`Total price updated to ₹${sum}`);
  };

  // Submit Template (Create or Update)
  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      toast.error("Template Name is required.");
      return;
    }

    if (formTotalPrice === "" || isNaN(Number(formTotalPrice))) {
      toast.error("Total Price field is required.");
      return;
    }

    if (formItems.length === 0) {
      toast.warning("Please add at least one stock item to this template.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formName.trim(),
        total_price: parseFloat(formTotalPrice) || 0,
        description: formDescription.trim(),
        items: formItems,
      };

      if (selectedTemplate && selectedTemplate.id) {
        // Update
        await apiClient.put(`/admin/template/update/${selectedTemplate.id}`, payload);
        toast.success(`Template "${formName}" updated successfully!`);
      } else {
        // Create
        await apiClient.post("/admin/template/create", payload);
        toast.success(`Template "${formName}" created successfully!`);
      }

      setIsFormModalOpen(false);
      fetchTemplates();
    } catch (err: any) {
      console.error("Error saving template:", err);
      toast.error(err.response?.data?.message || "Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Template Confirmation
  const confirmDelete = async () => {
    if (!templateToDelete || !templateToDelete.id) return;
    try {
      await apiClient.delete(`/admin/template/delete/${templateToDelete.id}`);
      toast.success(`Template "${templateToDelete.name}" deleted successfully!`);
      setIsDeleteModalOpen(false);
      setTemplateToDelete(null);
      fetchTemplates();
    } catch (err: any) {
      console.error("Error deleting template:", err);
      toast.error(err.response?.data?.message || "Failed to delete template");
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter(
    (tpl) =>
      tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tpl.description && tpl.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Summary Metrics
  const totalTemplatesCount = templates.length;
  const totalItemsConfigured = templates.reduce(
    (acc, t) => acc + (Array.isArray(t.items) ? t.items.length : 0),
    0
  );
  const avgPrice =
    totalTemplatesCount > 0
      ? Math.round(
          templates.reduce((acc, t) => acc + Number(t.total_price || 0), 0) /
            totalTemplatesCount
        )
      : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageMeta
        title="Event Templates | TailAdmin"
        description="Event Templates management panel for stock packages and pricing"
      />
      <PageBreadcrumb pageTitle="Event Templates" />

      {/* Header and Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2.5">
            <LayoutTemplate className="text-brand-500 w-7 h-7" />
            Event Templates Panel
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, update, and manage reusable event stock packages with pre-configured items,
            quantities, and total prices.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm rounded-xl shadow-theme-xs transition active:scale-95"
        >
          <Plus size={18} />
          Create New Template
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <LayoutTemplate size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Total Templates</span>
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              {totalTemplatesCount}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Package size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Stock Items Configured</span>
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              {totalItemsConfigured} Items
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <IndianRupee size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Avg Package Price</span>
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              ₹{avgPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTemplates}
              className="p-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300 transition"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Templates Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">#</th>
                <th className="py-3.5 px-4 font-semibold">Template Name</th>
                <th className="py-3.5 px-4 font-semibold">Stock Items Included</th>
                <th className="py-3.5 px-4 font-semibold">Total Price</th>
                <th className="py-3.5 px-4 font-semibold">Description</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    <RefreshCw className="animate-spin inline mr-2" size={18} />
                    Loading templates...
                  </td>
                </tr>
              ) : filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                        <LayoutTemplate size={28} />
                      </div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">
                        No Event Templates Found
                      </p>
                      <p className="text-xs text-gray-500">
                        Get started by creating your first reusable stock package template.
                      </p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-semibold hover:bg-brand-600"
                      >
                        <Plus size={14} /> Create Template
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((tpl, idx) => {
                  const itemCount = Array.isArray(tpl.items) ? tpl.items.length : 0;
                  return (
                    <tr
                      key={tpl.id || idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                    >
                      <td className="py-3.5 px-4 font-medium text-gray-400">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-500 font-bold">
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 dark:text-white block">
                              {tpl.name}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {tpl.created_at
                                ? new Date(tpl.created_at).toLocaleDateString()
                                : "Template"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Stock Items Included */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                            {itemCount} item{itemCount !== 1 ? "s" : ""}
                          </span>
                          {Array.isArray(tpl.items) &&
                            tpl.items.slice(0, 2).map((it, itIdx) => (
                              <span
                                key={itIdx}
                                className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium truncate max-w-[130px]"
                              >
                                {it.subcategory_name} ({it.quantity})
                              </span>
                            ))}
                          {itemCount > 2 && (
                            <span className="text-[11px] text-gray-400 font-medium">
                              +{itemCount - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Price */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹{Number(tpl.total_price || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-xs text-gray-500">
                        {tpl.description || "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedTemplate(tpl);
                              setIsViewModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-blue-600 transition"
                            title="View Template Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(tpl)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-emerald-600 transition"
                            title="Edit Template"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setTemplateToDelete(tpl);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-rose-600 transition"
                            title="Delete Template"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT TEMPLATE MODAL */}
      {isFormModalOpen && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          className="max-w-4xl w-full p-4 sm:p-6 lg:p-8"
        >
          <div className="max-h-[82vh] overflow-y-auto custom-scrollbar pr-1 sm:pr-2 space-y-6 flex-1">
            <div className="flex items-center justify-between border-b dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-500 flex items-center justify-center font-bold shrink-0">
                  <LayoutTemplate size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                    {selectedTemplate ? "Edit Event Template" : "Create New Event Template"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Configure template name, total package price, and add stock items.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTemplate} className="space-y-6">
              {/* Top Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Template Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Standard Wedding Stage Setup, DJ Truss 30x40"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Total Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    {formItems.length > 0 && (
                      <button
                        type="button"
                        onClick={handleAutoCalculateTotal}
                        className="text-[11px] text-brand-500 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw size={11} /> Auto-calculate from items
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      step="0.01"
                      placeholder="e.g. 25000"
                      value={formTotalPrice}
                      onChange={(e) => setFormTotalPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 font-bold text-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Description / Scope (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Package includes stage riser, black carpeting, truss system, and backdrop lights."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white resize-none"
                  />
                </div>
              </div>

              {/* ITEM BUILDER CARD */}
              <div className="p-4 rounded-2xl border border-brand-200 dark:border-brand-900/50 bg-brand-50/30 dark:bg-brand-950/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FolderPlus className="text-brand-500" size={17} />
                    Add Multiple Items from Stock
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    Select stock items & specify quantities
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Category Selection */}
                  <div>
                    <label className="block font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Stock Category:
                    </label>
                    <select
                      value={selectedCatId}
                      onChange={(e) => handleCategoryChange(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value={0}>Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SubCategory Selection */}
                  <div>
                    <label className="block font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Stock Sub Category / Item:
                    </label>
                    <select
                      value={selectedSubCatId}
                      onChange={(e) => handleSubCategoryChange(Number(e.target.value))}
                      disabled={!selectedCatId || subCategories.length === 0}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                    >
                      <option value={0}>
                        {!selectedCatId
                          ? "Select Category first"
                          : subCategories.length === 0
                          ? "No items in category"
                          : "Select Sub Category"}
                      </option>
                      {subCategories.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Number of Items / Quantity */}
                  <div>
                    <label className="block font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Number of Items (Qty):
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                    />
                  </div>

                  {/* Price per item */}
                  <div>
                    <label className="block font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Rate / Price (₹ per unit):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={itemPrice}
                      onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Live Stock Availability Info Badge */}
                {selectedStockItem && (() => {
                  const total = selectedStockItem.total_quantity !== undefined ? selectedStockItem.total_quantity : selectedStockItem.quantity;
                  const inUse = selectedStockItem.allocated_quantity || 0;
                  const avail = selectedStockItem.available_quantity !== undefined ? selectedStockItem.available_quantity : total;
                  const pct = selectedStockItem.available_percent !== undefined ? selectedStockItem.available_percent : 100;
                  return (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-brand-200 dark:border-brand-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                          <span>📦</span> Live Stock Status for "{selectedSubCatName}":
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          Total: <strong>{total}</strong>
                        </span>
                        {inUse > 0 && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            | In Use (Active Events): <strong>{inUse}</strong>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={avail > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>
                          Available Remaining: {avail} pcs ({pct}%)
                        </span>
                        <span className="text-gray-400 font-mono text-[11px]">Ratio: {avail}/{total}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Dimension Inputs if SubCategory has size enabled */}
                {subCatIsEnable && (
                  <div className="pt-2 border-t border-brand-200 dark:border-brand-900/40 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Vertical Dimension */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 space-y-2">
                      <label className="flex items-center gap-2 font-semibold text-gray-800 dark:text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={itemVertical}
                          onChange={(e) => setItemVertical(e.target.checked)}
                          className="rounded text-brand-500"
                        />
                        Vertical Dimension
                      </label>
                      {itemVertical && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-[10px] text-gray-400 block">Size:</span>
                            <div className="flex">
                              <input
                                type="text"
                                value={itemVerticalValue}
                                onChange={(e) => setItemVerticalValue(e.target.value)}
                                className="w-full px-2 py-1 text-xs border rounded-l-lg outline-none"
                              />
                              <select
                                value={itemVerticalUnit}
                                onChange={(e) => setItemVerticalUnit(e.target.value)}
                                className="border border-l-0 rounded-r-lg px-1 bg-gray-50 text-[10px]"
                              >
                                <option value="ft">ft</option>
                                <option value="m">m</option>
                                <option value="in">in</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block">Pcs:</span>
                            <input
                              type="number"
                              min={1}
                              value={itemVerticalPcs}
                              onChange={(e) =>
                                setItemVerticalPcs(parseInt(e.target.value) || 1)
                              }
                              className="w-full px-2 py-1 text-xs border rounded-lg outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Horizontal Dimension */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 space-y-2">
                      <label className="flex items-center gap-2 font-semibold text-gray-800 dark:text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={itemHorizontal}
                          onChange={(e) => setItemHorizontal(e.target.checked)}
                          className="rounded text-brand-500"
                        />
                        Horizontal Dimension
                      </label>
                      {itemHorizontal && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-[10px] text-gray-400 block">Size:</span>
                            <div className="flex">
                              <input
                                type="text"
                                value={itemHorizontalValue}
                                onChange={(e) => setItemHorizontalValue(e.target.value)}
                                className="w-full px-2 py-1 text-xs border rounded-l-lg outline-none"
                              />
                              <select
                                value={itemHorizontalUnit}
                                onChange={(e) => setItemHorizontalUnit(e.target.value)}
                                className="border border-l-0 rounded-r-lg px-1 bg-gray-50 text-[10px]"
                              >
                                <option value="ft">ft</option>
                                <option value="m">m</option>
                                <option value="in">in</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block">Pcs:</span>
                            <input
                              type="number"
                              min={1}
                              value={itemHorizontalPcs}
                              onChange={(e) =>
                                setItemHorizontalPcs(parseInt(e.target.value) || 1)
                              }
                              className="w-full px-2 py-1 text-xs border rounded-lg outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-right pt-1">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!selectedSubCatId}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-40 transition"
                  >
                    <Plus size={15} /> Add Item to Template
                  </button>
                </div>
              </div>

              {/* LIST OF CURRENTLY ADDED ITEMS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Template Stock Items ({formItems.length})
                  </h4>
                  {formItems.length > 0 && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Calculated Total: ₹
                      {formItems
                        .reduce(
                          (sum, it) =>
                            sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
                          0
                        )
                        .toLocaleString()}
                    </span>
                  )}
                </div>

                {formItems.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-xs text-gray-400">
                    No items added yet. Use the selector above to add stock items and number of items to this template.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {formItems.map((it, idx) => (
                      <div
                        key={it.id || idx}
                        className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 font-bold flex items-center justify-center text-[11px]">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-gray-800 dark:text-white text-sm">
                              {it.subcategory_name}
                            </span>
                            <span className="text-[11px] text-gray-400 block">
                              Category: {it.category_name}
                              {it.vertical &&
                                ` | V: ${it.verticalValue}${it.verticalUnit} (${it.verticalPcs} pcs)`}
                              {it.horizontal &&
                                ` | H: ${it.horizontalValue}${it.horizontalUnit} (${it.horizontalPcs} pcs)`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                              Qty: {it.quantity}
                            </span>
                            {it.price > 0 && (
                              <span className="text-[11px] text-gray-500 block mt-0.5">
                                ₹{it.price} each = ₹{it.price * it.quantity}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 rounded-lg transition"
                            title="Remove Item"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-theme-xs transition disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  {isSubmitting
                    ? "Saving..."
                    : selectedTemplate
                    ? "Update Template"
                    : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* VIEW TEMPLATE DETAILS MODAL */}
      {isViewModalOpen && selectedTemplate && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          className="max-w-2xl w-full p-4 sm:p-6 lg:p-8"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="text-brand-500" size={20} />
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                  {selectedTemplate.name}
                </h3>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Total Package Price</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{Number(selectedTemplate.total_price || 0).toLocaleString()}
                </span>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300 font-bold">
                {Array.isArray(selectedTemplate.items) ? selectedTemplate.items.length : 0} Items
              </span>
            </div>

            {selectedTemplate.description && (
              <p className="text-xs text-gray-600 dark:text-gray-300 italic">
                "{selectedTemplate.description}"
              </p>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Configured Stock Items & Quantities
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {Array.isArray(selectedTemplate.items) && selectedTemplate.items.length > 0 ? (
                  selectedTemplate.items.map((it, idx) => {
                    const matchedStock = stockList.find(
                      (s: any) =>
                        Number(s.categories_id) === Number(it.category_id) &&
                        Number(s.sub_categories_id) === Number(it.subcategory_id)
                    );
                    const totalStock = matchedStock
                      ? matchedStock.total_quantity !== undefined
                        ? matchedStock.total_quantity
                        : matchedStock.quantity
                      : "-";
                    const inUseStock = matchedStock ? matchedStock.allocated_quantity || 0 : 0;
                    const availStock = matchedStock
                      ? matchedStock.available_quantity !== undefined
                        ? matchedStock.available_quantity
                        : totalStock
                      : "-";

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-gray-800 dark:text-white block">
                            {it.subcategory_name}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            Category: {it.category_name}
                            {it.vertical &&
                              ` | V: ${it.verticalValue}${it.verticalUnit} (${it.verticalPcs} pcs)`}
                            {it.horizontal &&
                              ` | H: ${it.horizontalValue}${it.horizontalUnit} (${it.horizontalPcs} pcs)`}
                          </span>
                          <div className="text-[10px] text-gray-500 mt-1 flex flex-wrap items-center gap-1.5">
                            <span>📦 Live Inventory: Total <strong>{totalStock}</strong></span>
                            {inUseStock > 0 && (
                              <span className="text-amber-600 font-medium">
                                | In-Use: <strong>{inUseStock}</strong>
                              </span>
                            )}
                            <span
                              className={
                                typeof availStock === "number" && availStock < it.quantity
                                  ? "text-rose-600 font-bold"
                                  : "text-emerald-600 font-bold"
                              }
                            >
                              | Available: <strong>{availStock}</strong>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-sm text-brand-600">
                            {it.quantity} Pcs
                          </span>
                          {it.price > 0 && (
                            <span className="text-[11px] text-gray-500 block">
                              ₹{it.price * it.quantity}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400">No items configured in this template.</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t dark:border-gray-800 text-right">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && templateToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          className="max-w-md w-full p-5 sm:p-6"
        >
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">
              Delete Event Template?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Are you sure you want to delete template{" "}
              <strong className="text-gray-700 dark:text-gray-200">
                "{templateToDelete.name}"
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
