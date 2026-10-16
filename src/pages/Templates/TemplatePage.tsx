import React, { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Modal } from "../../components/ui/modal";
import apiClient from "../../hooks/api/apiClient";
import { useAuth } from "../../hooks/auth";
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
  Check,
} from "lucide-react";
import {
  TemplateItem,
  EventTemplateData,
  normalizeTemplateItems,
} from "../../utils/templateHelpers";

export type { TemplateItem, EventTemplateData };

interface DimensionOption {
  size: string;
  unit: string;
  quantity: number;
  label: string;
}

export default function TemplatePage() {
  const { canEdit } = useAuth();
  const canEditTemplates = canEdit("templates");
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
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
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

  // Dynamic stock dimensions & total stock count
  const [availableVerticalSizes, setAvailableVerticalSizes] = useState<DimensionOption[]>([]);
  const [availableHorizontalSizes, setAvailableHorizontalSizes] = useState<DimensionOption[]>([]);
  const [totalVerticalStock, setTotalVerticalStock] = useState<number>(0);
  const [totalHorizontalStock, setTotalHorizontalStock] = useState<number>(0);
  const [loadingDimensionSizes, setLoadingDimensionSizes] = useState<boolean>(false);

  // Fetch templates list
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/template/all");
      const rawList = res.data.results || res.data.data || [];
      const list = rawList.map((tpl: any) => ({
        ...tpl,
        items: normalizeTemplateItems(tpl.items),
      }));
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

  // Stock availability indicators
  const hasVerticalStock = availableVerticalSizes.length > 0;
  const hasHorizontalStock = availableHorizontalSizes.length > 0;

  // When stock has only horizontal, vertical is disabled
  const isVerticalDisabled = !hasVerticalStock && hasHorizontalStock;
  // When stock has only vertical, horizontal is disabled
  const isHorizontalDisabled = !hasHorizontalStock && hasVerticalStock;

  // Determine if currently selected stock has vertical/horizontal dimensions
  const hasDimensions = Boolean(
    hasVerticalStock ||
    hasHorizontalStock ||
    subCatIsEnable
  );

  // Dynamic dropdown options for vertical sizes
  const verticalDropdownOptions = useMemo(() => {
    const opts = [...availableVerticalSizes];
    if (
      !isVerticalDisabled &&
      itemVertical &&
      itemVerticalValue &&
      !opts.some((o) => o.size === itemVerticalValue && o.unit === itemVerticalUnit)
    ) {
      opts.unshift({
        size: itemVerticalValue,
        unit: itemVerticalUnit || "ft",
        quantity: 0,
        label: `${itemVerticalValue}${itemVerticalUnit || "ft"}`,
      });
    }
    return opts;
  }, [availableVerticalSizes, isVerticalDisabled, itemVertical, itemVerticalValue, itemVerticalUnit]);

  // Dynamic dropdown options for horizontal sizes
  const horizontalDropdownOptions = useMemo(() => {
    const opts = [...availableHorizontalSizes];
    if (
      !isHorizontalDisabled &&
      itemHorizontal &&
      itemHorizontalValue &&
      !opts.some((o) => o.size === itemHorizontalValue && o.unit === itemHorizontalUnit)
    ) {
      opts.unshift({
        size: itemHorizontalValue,
        unit: itemHorizontalUnit || "ft",
        quantity: 0,
        label: `${itemHorizontalValue}${itemHorizontalUnit || "ft"}`,
      });
    }
    return opts;
  }, [availableHorizontalSizes, isHorizontalDisabled, itemHorizontal, itemHorizontalValue, itemHorizontalUnit]);

  // Load dimension sizes and stock quantities for category + subcategory
  const loadDimensionSizes = async (
    catId: number,
    subId: number,
    selectedVSize?: string,
    selectedVUnit?: string,
    selectedHSize?: string,
    selectedHUnit?: string
  ) => {
    if (!catId || !subId) {
      setAvailableVerticalSizes([]);
      setAvailableHorizontalSizes([]);
      setTotalVerticalStock(0);
      setTotalHorizontalStock(0);
      return;
    }

    setLoadingDimensionSizes(true);
    try {
      let stocks: any[] = [];
      try {
        const res = await apiClient.get(
          `/admin/Inverntory/findBycategoriesAndSubCategories/${catId}/${subId}`
        );
        const raw = res?.data?.results || res?.data?.data || [];
        stocks = Array.isArray(raw) ? raw : (raw.results || []);
      } catch (apiErr) {
        console.warn("findBycategoriesAndSubCategories error:", apiErr);
      }

      // Fallback to stockList if specific inventory endpoint returns empty
      if (stocks.length === 0 && stockList && stockList.length > 0) {
        stocks = stockList.filter(
          (s: any) =>
            Number(s.categories_id) === Number(catId) &&
            Number(s.sub_categories_id) === Number(subId)
        );
      }

      // Aggregate vertical sizes
      const vMap = new Map<string, DimensionOption>();
      let totalVQty = 0;
      stocks.forEach((stk: any) => {
        (stk.verticalSizes || []).forEach((row: any) => {
          if (row.size != null && row.size !== "") {
            const sizeStr = String(row.size).trim();
            const unitStr = String(row.unit || "ft").trim();
            const qty = Number(row.quantity) || 0;
            totalVQty += qty;
            const key = `${sizeStr.toLowerCase()}_${unitStr.toLowerCase()}`;
            if (vMap.has(key)) {
              const existing = vMap.get(key)!;
              existing.quantity += qty;
            } else {
              vMap.set(key, {
                size: sizeStr,
                unit: unitStr,
                quantity: qty,
                label: `${sizeStr}${unitStr}`,
              });
            }
          }
        });
      });

      // Aggregate horizontal sizes
      const hMap = new Map<string, DimensionOption>();
      let totalHQty = 0;
      stocks.forEach((stk: any) => {
        (stk.horizontalSizes || []).forEach((row: any) => {
          if (row.size != null && row.size !== "") {
            const sizeStr = String(row.size).trim();
            const unitStr = String(row.unit || "ft").trim();
            const qty = Number(row.quantity) || 0;
            totalHQty += qty;
            const key = `${sizeStr.toLowerCase()}_${unitStr.toLowerCase()}`;
            if (hMap.has(key)) {
              const existing = hMap.get(key)!;
              existing.quantity += qty;
            } else {
              hMap.set(key, {
                size: sizeStr,
                unit: unitStr,
                quantity: qty,
                label: `${sizeStr}${unitStr}`,
              });
            }
          }
        });
      });

      const sortSizes = (list: DimensionOption[]) => {
        return list.sort((a, b) => {
          const numA = parseFloat(a.size);
          const numB = parseFloat(b.size);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.size.localeCompare(b.size);
        });
      };

      const sortedV = sortSizes(Array.from(vMap.values()));
      const sortedH = sortSizes(Array.from(hMap.values()));

      setAvailableVerticalSizes(sortedV);
      setAvailableHorizontalSizes(sortedH);
      setTotalVerticalStock(totalVQty);
      setTotalHorizontalStock(totalHQty);

      const hasV = sortedV.length > 0;
      const hasH = sortedH.length > 0;

      if (hasV && !hasH) {
        // Only vertical in stock: enable vertical, disable horizontal
        setItemVertical(true);
        setItemHorizontal(false);
        if (selectedVSize) {
          setItemVerticalValue(selectedVSize);
          if (selectedVUnit) setItemVerticalUnit(selectedVUnit);
        } else {
          setItemVerticalValue(sortedV[0].size);
          setItemVerticalUnit(sortedV[0].unit);
        }
      } else if (!hasV && hasH) {
        // Only horizontal in stock: disable vertical, enable horizontal
        setItemVertical(false);
        setItemHorizontal(true);
        if (selectedHSize) {
          setItemHorizontalValue(selectedHSize);
          if (selectedHUnit) setItemHorizontalUnit(selectedHUnit);
        } else {
          setItemHorizontalValue(sortedH[0].size);
          setItemHorizontalUnit(sortedH[0].unit);
        }
      } else if (hasV && hasH) {
        // Both available in stock: enable both
        setItemVertical(selectedVSize !== undefined ? Boolean(selectedVSize) : true);
        setItemHorizontal(selectedHSize !== undefined ? Boolean(selectedHSize) : true);
        if (selectedVSize) {
          setItemVerticalValue(selectedVSize);
          if (selectedVUnit) setItemVerticalUnit(selectedVUnit);
        } else {
          setItemVerticalValue(sortedV[0].size);
          setItemVerticalUnit(sortedV[0].unit);
        }
        if (selectedHSize) {
          setItemHorizontalValue(selectedHSize);
          if (selectedHUnit) setItemHorizontalUnit(selectedHUnit);
        } else {
          setItemHorizontalValue(sortedH[0].size);
          setItemHorizontalUnit(sortedH[0].unit);
        }
      } else {
        // Neither available in stock
        setItemVertical(false);
        setItemHorizontal(false);
      }
    } catch (err) {
      console.warn("Failed to load dimension sizes for template item:", err);
      setAvailableVerticalSizes([]);
      setAvailableHorizontalSizes([]);
      setTotalVerticalStock(0);
      setTotalHorizontalStock(0);
      setItemVertical(false);
      setItemHorizontal(false);
    } finally {
      setLoadingDimensionSizes(false);
    }
  };

  // When Category changes in Item Selector
  const handleCategoryChange = async (catId: number) => {
    setSelectedCatId(catId);
    setSelectedSubCatId(0);
    setSelectedSubCatName("");
    setSubCategories([]);
    setAvailableVerticalSizes([]);
    setAvailableHorizontalSizes([]);
    setTotalVerticalStock(0);
    setTotalHorizontalStock(0);
    setItemVertical(false);
    setItemHorizontal(false);
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
      setAvailableVerticalSizes([]);
      setAvailableHorizontalSizes([]);
      setTotalVerticalStock(0);
      setTotalHorizontalStock(0);
      setItemVertical(false);
      setItemHorizontal(false);
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

    // Fetch dynamic stock dimensions (vertical & horizontal)
    if (selectedCatId && subId) {
      loadDimensionSizes(selectedCatId, subId);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setSelectedTemplate(null);
    setFormName("");
    setFormTotalPrice("");
    setFormDescription("");
    setFormItems([]);
    setEditingItemIndex(null);
    resetItemBuilder();
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (tpl: EventTemplateData) => {
    setSelectedTemplate(tpl);
    setFormName(tpl.name || "");
    setFormTotalPrice(String(tpl.total_price || 0));
    setFormDescription(tpl.description || "");
    const normalizedItems = normalizeTemplateItems(tpl.items);
    setFormItems(normalizedItems);
    setEditingItemIndex(null);
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
    setAvailableVerticalSizes([]);
    setAvailableHorizontalSizes([]);
    setTotalVerticalStock(0);
    setTotalHorizontalStock(0);
    setEditingItemIndex(null);
  };

  // Load an existing item into builder for editing
  const handleEditExistingItem = async (index: number) => {
    const item = formItems[index];
    if (!item) return;

    setEditingItemIndex(index);
    setSelectedCatId(item.category_id);
    setSelectedCatName(item.category_name);

    // Fetch subcategories for this category so dropdown displays accurately
    try {
      const res = await apiClient.get(`/admin/subCategory/findByid/${item.category_id}`);
      const subs = res.data.results || res.data.data || [];
      setSubCategories(subs);
      const sub = subs.find((s: any) => s.id === item.subcategory_id);
      setSubCatIsEnable(Boolean(sub?.is_enable || item.vertical || item.horizontal));
    } catch (err) {
      console.error("Error loading subcategories for item edit:", err);
    }

    setSelectedSubCatId(item.subcategory_id);
    setSelectedSubCatName(item.subcategory_name);
    setItemQuantity(item.quantity || 1);
    setItemPrice(item.price || 0);

    setItemVertical(Boolean(item.vertical));
    setItemVerticalValue(item.verticalValue || "10");
    setItemVerticalUnit(item.verticalUnit || "ft");
    setItemVerticalPcs(item.verticalPcs || 1);

    setItemHorizontal(Boolean(item.horizontal));
    setItemHorizontalValue(item.horizontalValue || "10");
    setItemHorizontalUnit(item.horizontalUnit || "ft");
    setItemHorizontalPcs(item.horizontalPcs || 1);

    // Load available stock dimension sizes for this category & subcategory
    loadDimensionSizes(
      item.category_id,
      item.subcategory_id,
      item.verticalValue,
      item.verticalUnit,
      item.horizontalValue,
      item.horizontalUnit
    );
  };

  const handleCancelEditItem = () => {
    resetItemBuilder();
  };

  // Add or Update Item to Template List
  const handleAddItem = () => {
    if (!selectedCatId || !selectedSubCatId) {
      toast.warning("Please select both Category and Sub Category from stock.");
      return;
    }

    let finalQty = Number(itemQuantity);
    let finalPrice = Number(itemPrice) || 0;

    const finalVertical = !isVerticalDisabled && Boolean(itemVertical);
    const finalHorizontal = !isHorizontalDisabled && Boolean(itemHorizontal);

    if (hasDimensions) {
      const vPcs = finalVertical ? Number(itemVerticalPcs) || 0 : 0;
      const hPcs = finalHorizontal ? Number(itemHorizontalPcs) || 0 : 0;

      if (!finalVertical && !finalHorizontal) {
        if (isVerticalDisabled) {
          toast.warning("Vertical is not in stock. Please enable Horizontal dimension.");
        } else if (isHorizontalDisabled) {
          toast.warning("Horizontal is not in stock. Please enable Vertical dimension.");
        } else {
          toast.warning("Please enable Vertical or Horizontal dimension.");
        }
        return;
      }

      if (finalVertical && vPcs <= 0) {
        toast.warning("Vertical pieces (Pcs) must be at least 1.");
        return;
      }

      if (finalHorizontal && hPcs <= 0) {
        toast.warning("Horizontal pieces (Pcs) must be at least 1.");
        return;
      }

      finalQty = (vPcs + hPcs) || 1;
      finalPrice = 0; // Standard rate is removed for dimension-based stock
    } else {
      if (finalQty <= 0) {
        toast.warning("Number of items (Quantity) must be at least 1.");
        return;
      }
    }

    const newItem: TemplateItem = {
      id:
        editingItemIndex !== null && formItems[editingItemIndex]?.id
          ? formItems[editingItemIndex].id
          : `${Date.now()}-${Math.random()}`,
      category_id: selectedCatId,
      category_name: selectedCatName,
      subcategory_id: selectedSubCatId,
      subcategory_name: selectedSubCatName,
      quantity: finalQty,
      price: finalPrice,
      vertical: finalVertical,
      verticalValue: finalVertical ? itemVerticalValue : undefined,
      verticalUnit: finalVertical ? itemVerticalUnit : undefined,
      verticalPcs: finalVertical ? Number(itemVerticalPcs) : undefined,
      horizontal: finalHorizontal,
      horizontalValue: finalHorizontal ? itemHorizontalValue : undefined,
      horizontalUnit: finalHorizontal ? itemHorizontalUnit : undefined,
      horizontalPcs: finalHorizontal ? Number(itemHorizontalPcs) : undefined,
    };

    let updated: TemplateItem[];
    if (editingItemIndex !== null) {
      updated = [...formItems];
      updated[editingItemIndex] = newItem;
      toast.success(`Updated item "${selectedSubCatName}" in template!`);
    } else {
      updated = [...formItems, newItem];
      toast.success(`Added ${selectedSubCatName} (${finalQty} pcs) to template!`);
    }

    setFormItems(updated);

    // Auto-calculate suggested total price if user hasn't overridden or form is empty
    const autoTotal = updated.reduce(
      (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
      0
    );
    if (!formTotalPrice || Number(formTotalPrice) === 0) {
      setFormTotalPrice(String(autoTotal));
    }

    resetItemBuilder();
  };

  // Remove Item from Template
  const handleRemoveItem = (index: number) => {
    if (editingItemIndex === index) {
      resetItemBuilder();
    }
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

        {canEditTemplates && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm rounded-xl shadow-theme-xs transition active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            Create New Template
          </button>
        )}
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
                      {canEditTemplates && (
                        <button
                          onClick={handleOpenCreateModal}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-semibold hover:bg-brand-600 cursor-pointer"
                        >
                          <Plus size={14} /> Create Template
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((tpl, idx) => {
                  const items = normalizeTemplateItems(tpl.items);
                  const itemCount = items.length;
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
                          {items.slice(0, 2).map((it, itIdx) => (
                            <span
                              key={it.id || itIdx}
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
                              setSelectedTemplate({
                                ...tpl,
                                items: normalizeTemplateItems(tpl.items),
                              });
                              setIsViewModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-blue-600 transition cursor-pointer"
                            title="View Template Details"
                          >
                            <Eye size={16} />
                          </button>
                          {canEditTemplates && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(tpl)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-emerald-600 transition cursor-pointer"
                                title="Edit Template"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setTemplateToDelete(tpl);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-rose-600 transition cursor-pointer"
                                title="Delete Template"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
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

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${!hasDimensions ? "lg:grid-cols-4" : ""} gap-3 text-xs`}>
                  {/* Category Selection */}
                  <div>
                    <label className="block font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Stock Category:
                    </label>
                    <select
                      value={selectedCatId}
                      onChange={(e) => handleCategoryChange(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-gray-800 dark:text-gray-200"
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
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-gray-800 dark:text-gray-200 disabled:opacity-50"
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

                  {/* Generic Quantity and Price - Hidden/Removed when Stock has Vertical & Horizontal Dimensions */}
                  {!hasDimensions && (
                    <>
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
                    </>
                  )}
                </div>

                {/* Loading Dimension Sizes Indicator */}
                {loadingDimensionSizes && (
                  <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400">
                    <RefreshCw className="animate-spin" size={13} />
                    <span>Loading vertical and horizontal stock dimensions...</span>
                  </div>
                )}

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

                {/* Dynamic Dimension Inputs & Stock Totals if stock has vertical/horizontal data */}
                {hasDimensions && (
                  <div className="pt-2 border-t border-brand-200 dark:border-brand-900/40 space-y-3">
                    {/* Dimension Stock Summary Counters */}
                    {(hasVerticalStock || hasHorizontalStock) && (
                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/40 dark:to-purple-950/40 border border-blue-200/80 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200">
                          <Sparkles size={14} className="text-brand-500" />
                          <span>Stock Dimensions for "{selectedSubCatName}":</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {hasVerticalStock ? (
                            <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold flex items-center gap-1">
                              <span>📏 Total Vertical in Stock:</span>
                              <strong className="text-sm font-extrabold text-blue-700 dark:text-blue-300">{totalVerticalStock}</strong> pcs
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-gray-200/70 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1">
                              <span>📏 Vertical:</span>
                              <strong className="text-xs">No Stock (Disabled)</strong>
                            </span>
                          )}
                          {hasHorizontalStock ? (
                            <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-bold flex items-center gap-1">
                              <span>📐 Total Horizontal in Stock:</span>
                              <strong className="text-sm font-extrabold text-purple-700 dark:text-purple-300">{totalHorizontalStock}</strong> pcs
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-gray-200/70 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1">
                              <span>📐 Horizontal:</span>
                              <strong className="text-xs">No Stock (Disabled)</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Vertical Dimension Card */}
                      <div className={`p-3 rounded-xl border transition space-y-2.5 ${
                        isVerticalDisabled
                          ? "bg-gray-100/70 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/60 opacity-60"
                          : itemVertical
                            ? "bg-blue-50/40 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800"
                            : "bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700"
                      }`}>
                        <div className="flex items-center justify-between">
                          <label className={`flex items-center gap-2 font-semibold ${
                            isVerticalDisabled
                              ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                              : "text-gray-800 dark:text-white cursor-pointer"
                          }`}>
                            <input
                              type="checkbox"
                              checked={!isVerticalDisabled && itemVertical}
                              disabled={isVerticalDisabled}
                              onChange={(e) => {
                                if (isVerticalDisabled) return;
                                setItemVertical(e.target.checked);
                              }}
                              className="rounded text-brand-500 disabled:cursor-not-allowed"
                            />
                            Vertical Dimension
                          </label>
                          {isVerticalDisabled ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                              Disabled (No Stock)
                            </span>
                          ) : totalVerticalStock > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                              Stock: {totalVerticalStock} pcs
                            </span>
                          ) : null}
                        </div>

                        {!isVerticalDisabled && itemVertical && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-semibold mb-1">
                                Size:
                              </span>
                              {verticalDropdownOptions.length > 0 ? (
                                <select
                                  value={`${itemVerticalValue}|${itemVerticalUnit}`}
                                  onChange={(e) => {
                                    const [vSize, vUnit] = e.target.value.split("|");
                                    setItemVerticalValue(vSize);
                                    setItemVerticalUnit(vUnit || "ft");
                                  }}
                                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none font-semibold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500"
                                >
                                  {verticalDropdownOptions.map((opt) => (
                                    <option key={`${opt.size}_${opt.unit}`} value={`${opt.size}|${opt.unit}`}>
                                      {opt.size}{opt.unit}{opt.quantity ? ` (${opt.quantity} in stock)` : ""}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="flex">
                                  <input
                                    type="text"
                                    value={itemVerticalValue}
                                    onChange={(e) => setItemVerticalValue(e.target.value)}
                                    placeholder="e.g. 10"
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
                              )}
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-semibold mb-1">
                                Vertical Pieces (Pcs):
                              </span>
                              <input
                                type="number"
                                min={1}
                                value={itemVerticalPcs}
                                onChange={(e) =>
                                  setItemVerticalPcs(Math.max(1, parseInt(e.target.value) || 1))
                                }
                                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none font-semibold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Horizontal Dimension Card */}
                      <div className={`p-3 rounded-xl border transition space-y-2.5 ${
                        isHorizontalDisabled
                          ? "bg-gray-100/70 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/60 opacity-60"
                          : itemHorizontal
                            ? "bg-purple-50/40 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800"
                            : "bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700"
                      }`}>
                        <div className="flex items-center justify-between">
                          <label className={`flex items-center gap-2 font-semibold ${
                            isHorizontalDisabled
                              ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                              : "text-gray-800 dark:text-white cursor-pointer"
                          }`}>
                            <input
                              type="checkbox"
                              checked={!isHorizontalDisabled && itemHorizontal}
                              disabled={isHorizontalDisabled}
                              onChange={(e) => {
                                if (isHorizontalDisabled) return;
                                setItemHorizontal(e.target.checked);
                              }}
                              className="rounded text-brand-500 disabled:cursor-not-allowed"
                            />
                            Horizontal Dimension
                          </label>
                          {isHorizontalDisabled ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                              Disabled (No Stock)
                            </span>
                          ) : totalHorizontalStock > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                              Stock: {totalHorizontalStock} pcs
                            </span>
                          ) : null}
                        </div>

                        {!isHorizontalDisabled && itemHorizontal && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-semibold mb-1">
                                Size:
                              </span>
                              {horizontalDropdownOptions.length > 0 ? (
                                <select
                                  value={`${itemHorizontalValue}|${itemHorizontalUnit}`}
                                  onChange={(e) => {
                                    const [hSize, hUnit] = e.target.value.split("|");
                                    setItemHorizontalValue(hSize);
                                    setItemHorizontalUnit(hUnit || "ft");
                                  }}
                                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none font-semibold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500"
                                >
                                  {horizontalDropdownOptions.map((opt) => (
                                    <option key={`${opt.size}_${opt.unit}`} value={`${opt.size}|${opt.unit}`}>
                                      {opt.size}{opt.unit}{opt.quantity ? ` (${opt.quantity} in stock)` : ""}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="flex">
                                  <input
                                    type="text"
                                    value={itemHorizontalValue}
                                    onChange={(e) => setItemHorizontalValue(e.target.value)}
                                    placeholder="e.g. 10"
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
                              )}
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-semibold mb-1">
                                Horizontal Pieces (Pcs):
                              </span>
                              <input
                                type="number"
                                min={1}
                                value={itemHorizontalPcs}
                                onChange={(e) =>
                                  setItemHorizontalPcs(Math.max(1, parseInt(e.target.value) || 1))
                                }
                                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none font-semibold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  {editingItemIndex !== null ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1.5">
                        <Edit2 size={12} /> Editing Item #{editingItemIndex + 1}
                      </span>
                      <button
                        type="button"
                        onClick={handleCancelEditItem}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    {editingItemIndex !== null && (
                      <button
                        type="button"
                        onClick={handleCancelEditItem}
                        className="px-3.5 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!selectedSubCatId}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-40 transition"
                    >
                      {editingItemIndex !== null ? (
                        <>
                          <Check size={15} /> Update Item in Template
                        </>
                      ) : (
                        <>
                          <Plus size={15} /> Add Item to Template
                        </>
                      )}
                    </button>
                  </div>
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
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {formItems.map((it, idx) => (
                      <div
                        key={it.id || idx}
                        className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                          editingItemIndex === idx
                            ? "border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20 dark:bg-brand-950/30"
                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-gray-800 dark:text-white text-sm">
                                {it.subcategory_name}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                Cat: {it.category_name}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                              {it.vertical && (
                                <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
                                  📏 V: {it.verticalValue || "-"}{it.verticalUnit || "ft"} ({it.verticalPcs || 1} pcs)
                                </span>
                              )}
                              {it.horizontal && (
                                <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium">
                                  📐 H: {it.horizontalValue || "-"}{it.horizontalUnit || "ft"} ({it.horizontalPcs || 1} pcs)
                                </span>
                              )}
                              {!it.vertical && !it.horizontal && (
                                <span className="text-gray-400">Standard Spec</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                          <div className="text-right">
                            <span className="font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                              Qty: {it.quantity}
                            </span>
                            {it.price > 0 && (
                              <span className="text-[11px] text-gray-500 block mt-0.5">
                                ₹{it.price} each = ₹{(it.price * it.quantity).toLocaleString()}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditExistingItem(idx)}
                              className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg transition cursor-pointer"
                              title="Edit this item"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 rounded-lg transition cursor-pointer"
                              title="Remove this item"
                            >
                              <X size={15} />
                            </button>
                          </div>
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
      {isViewModalOpen && selectedTemplate && (() => {
        const viewItems = normalizeTemplateItems(selectedTemplate.items);
        return (
          <Modal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            className="max-w-2xl w-full p-4 sm:p-6 lg:p-8"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-500 font-bold">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                      {selectedTemplate.name}
                    </h3>
                    {selectedTemplate.created_at && (
                      <span className="text-[11px] text-gray-400">
                        Created: {new Date(selectedTemplate.created_at).toLocaleString()}
                      </span>
                    )}
                  </div>
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
                  {viewItems.length} Stock Item{viewItems.length !== 1 ? "s" : ""}
                </span>
              </div>

              {selectedTemplate.description ? (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                  <span className="text-[11px] uppercase font-bold text-gray-400 block mb-0.5">Description / Scope</span>
                  <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedTemplate.description}
                  </p>
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Configured Stock Items & Quantities ({viewItems.length})
                  </h4>
                  {viewItems.length > 0 && (
                    <span className="text-[11px] text-gray-400 font-medium">
                      Items Subtotal: ₹{viewItems.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 1)), 0).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {viewItems.length > 0 ? (
                    viewItems.map((it, idx) => {
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
                          key={it.id || idx}
                          className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-gray-800 dark:text-white text-sm">
                                {it.subcategory_name}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                Category: {it.category_name}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                              {it.vertical && (
                                <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
                                  📏 V: {it.verticalValue || "-"}{it.verticalUnit || "ft"} ({it.verticalPcs || 1} pcs)
                                </span>
                              )}
                              {it.horizontal && (
                                <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium">
                                  📐 H: {it.horizontalValue || "-"}{it.horizontalUnit || "ft"} ({it.horizontalPcs || 1} pcs)
                                </span>
                              )}
                              {!it.vertical && !it.horizontal && (
                                <span className="text-gray-400">Standard Dimension Spec</span>
                              )}
                            </div>

                            <div className="text-[10px] text-gray-500 pt-0.5 flex flex-wrap items-center gap-1.5">
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

                          <div className="text-right shrink-0">
                            <span className="font-bold text-sm px-2.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 block">
                              {it.quantity} Pcs
                            </span>
                            {it.price > 0 ? (
                              <span className="text-[11px] text-gray-500 block mt-1">
                                ₹{it.price} each = ₹{(it.price * it.quantity).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 block mt-1">
                                Included in package
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-xs text-gray-400">
                      No stock items configured in this template.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t dark:border-gray-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const tpl = selectedTemplate;
                    setIsViewModalOpen(false);
                    handleOpenEditModal(tpl);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-theme-xs transition cursor-pointer"
                >
                  <Edit2 size={14} /> Edit Template
                </button>

                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

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
