import { useEffect, useState, useMemo } from "react";
import apiClient from "../../hooks/api/apiClient";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import {
  Boxes,
  Layers,
  CheckCircle2,
  Search,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

interface SizeType {
  id: number;
  size: string;
  quantity: number;
  unit: string;
  allocated_qty?: number;
  available_qty?: number;
  available_ratio?: number;
}

interface InventoryItem {
  id: number;
  categories: {
    id?: number;
    name: string;
  };
  subCategories: {
    id?: number;
    name: string;
  };
  wareHouse: {
    id: number;
    name: string;
    address?: string;
  };
  width?: string;
  height?: string;
  color?: string;
  quantity: number;
  quality?: string;
  price?: number;
  good: number;
  bad: number;
  missing: number;
  have_size: boolean;
  vertical_enabled: boolean;
  horizontal_enabled: boolean;
  verticalSizes: SizeType[];
  horizontalSizes: SizeType[];
  total_quantity?: number;
  allocated_quantity?: number;
  available_quantity?: number;
  available_ratio?: number;
  available_percent?: number;
  matched_active_events?: Array<{
    event_id: number;
    event_name: string;
    template_name?: string;
    allocated: number;
  }>;
}

export default function AvailableStock() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [subCategories, setSubCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterAvailability, setFilterAvailability] = useState<string>("all"); // "all" | "in_use" | "available" | "low"

  // Load Categories
  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/admin/category/find");
      setCategories(res?.data?.results || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Load SubCategories when Category changes
  const handleCategoryChange = async (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubCategory("");
    if (!catId) {
      setSubCategories([]);
      return;
    }
    try {
      const res = await apiClient.get(`/admin/subCategory/findByid/${catId}`);
      setSubCategories(res?.data?.results || []);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    }
  };

  // Load Inventory with Live Stock Availability & Ratios
  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/Inverntory/availableStockSummary");
      setInventory(res?.data?.results || []);
    } catch (err) {
      console.warn("availableStockSummary failed, falling back to /find", err);
      try {
        const fallback = await apiClient.get("/admin/Inverntory/find");
        setInventory(fallback?.data?.results || []);
      } catch (e) {
        console.error("Failed to load inventory:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStock();
  }, []);

  // Filtered Inventory
  const filteredList = useMemo(() => {
    return inventory.filter((item) => {
      // Category filter
      if (selectedCategory && String(item.categories?.id) !== String(selectedCategory)) {
        if (!item.categories?.name?.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // SubCategory filter
      if (selectedSubCategory && String(item.subCategories?.id) !== String(selectedSubCategory)) {
        if (!item.subCategories?.name?.toLowerCase().includes(selectedSubCategory.toLowerCase())) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const catName = item.categories?.name?.toLowerCase() || "";
        const subName = item.subCategories?.name?.toLowerCase() || "";
        const whName = item.wareHouse?.name?.toLowerCase() || "";
        const matchesEvent = item.matched_active_events?.some(
          (ev) =>
            ev.event_name.toLowerCase().includes(q) ||
            (ev.template_name && ev.template_name.toLowerCase().includes(q))
        );

        if (!catName.includes(q) && !subName.includes(q) && !whName.includes(q) && !matchesEvent) {
          return false;
        }
      }

      // Availability filter
      const alloc = item.allocated_quantity || 0;
      const avail = item.available_quantity !== undefined ? item.available_quantity : item.quantity;
      if (filterAvailability === "in_use" && alloc <= 0) return false;
      if (filterAvailability === "available" && avail <= 0) return false;
      if (filterAvailability === "low" && avail > 5) return false;

      return true;
    });
  }, [inventory, selectedCategory, selectedSubCategory, searchQuery, filterAvailability]);

  // Overall KPI Metrics
  const metrics = useMemo(() => {
    const totalItems = inventory.length;
    const totalUnits = inventory.reduce(
      (sum, item) => sum + (item.total_quantity !== undefined ? item.total_quantity : item.quantity),
      0
    );
    const inUseUnits = inventory.reduce((sum, item) => sum + (item.allocated_quantity || 0), 0);
    const availableUnits = inventory.reduce(
      (sum, item) =>
        sum + (item.available_quantity !== undefined ? item.available_quantity : item.quantity),
      0
    );

    const overallRatio = totalUnits > 0 ? Math.round((availableUnits / totalUnits) * 100) : 100;
    const activeEventsSet = new Set<number>();
    inventory.forEach((i) => {
      i.matched_active_events?.forEach((ev) => activeEventsSet.add(ev.event_id));
    });

    return {
      totalItems,
      totalUnits,
      inUseUnits,
      availableUnits,
      overallRatio,
      activeEventsCount: activeEventsSet.size,
    };
  }, [inventory]);

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSearchQuery("");
    setFilterAvailability("all");
    setSubCategories([]);
    fetchStock();
  };

  return (
    <div className="space-y-6 pb-12">
      <PageMeta
        title="Available Stock & Ratio | Events Panel"
        description="Live stock inventory availability, template usage, and remaining ratios across uncompleted events."
      />
      <PageBreadcrumb pageTitle="Available Stock" />

      {/* ===================== SUMMARY KPI METRICS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Units */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Boxes size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Stock Inventory</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
              {metrics.totalUnits.toLocaleString()}{" "}
              <span className="text-xs font-normal text-gray-500">units</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{metrics.totalItems} distinct items</p>
          </div>
        </div>

        {/* In-Use in Active Events */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">In Use (Active Events)</p>
            <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-0.5">
              {metrics.inUseUnits.toLocaleString()}{" "}
              <span className="text-xs font-normal text-amber-700">units</span>
            </h3>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
              Across {metrics.activeEventsCount} uncompleted events
            </p>
          </div>
        </div>

        {/* Available Remaining Stock */}
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Remaining Available</p>
            <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">
              {metrics.availableUnits.toLocaleString()}{" "}
              <span className="text-xs font-normal text-emerald-700">units</span>
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              Free to book for new events
            </p>
          </div>
        </div>

        {/* Overall Available Ratio */}
        <div className="rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Available Ratio</p>
            <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-0.5">
              {metrics.overallRatio}%
            </h3>
            <div className="w-28 bg-purple-200 dark:bg-purple-900/60 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="bg-purple-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, metrics.overallRatio)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===================== FILTER CONTROLS ===================== */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Stock Inventory Availability & Ratios
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Live calculated available stock (Total Stock - Items used in active/uncompleted events)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchStock}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
          >
            <RotateCcw size={13} className={loading ? "animate-spin" : ""} />
            Refresh Stock
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search category, item, warehouse, event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* SubCategory Dropdown */}
          <div>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={!selectedCategory || subCategories.length === 0}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
            >
              <option value="">All Sub-Categories</option>
              {subCategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2">
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All Items</option>
              <option value="in_use">In Use in Active Events Only</option>
              <option value="available">Available Units Only</option>
              <option value="low">Low Stock (&le; 5 units)</option>
            </select>

            {(selectedCategory || selectedSubCategory || searchQuery || filterAvailability !== "all") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 transition shrink-0"
                title="Reset filters"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===================== AVAILABLE STOCK TABLE ===================== */}
     <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-xs">
  
  {/* ========================================================= */}
  {/* 1. MOBILE VIEW: Stacked Cards (Visible on mobile only)     */}
  {/* ========================================================= */}
  <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800">
    {loading ? (
      <div className="text-center py-12 text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          Loading live stock availability...
        </div>
      </div>
    ) : filteredList.length === 0 ? (
      <div className="text-center py-12 text-gray-500 p-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <Boxes size={32} className="text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium">No stock items match your filter.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-brand-600 hover:underline font-semibold"
          >
            Reset filters
          </button>
        </div>
      </div>
    ) : (
      filteredList.map((row) => {
        const total = row.total_quantity !== undefined ? row.total_quantity : row.quantity;
        const allocated = row.allocated_quantity || 0;
        const available = row.available_quantity !== undefined ? row.available_quantity : total;
        const percent = row.available_percent !== undefined
          ? row.available_percent
          : total > 0
          ? Math.round((available / total) * 100)
          : 100;

        return (
          <div key={row.id} className="p-4 space-y-3">
            {/* Header: ID, Category & Sub-Category */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs text-gray-400">#{row.id}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                  {row.categories?.name || "-"} ({row.subCategories?.name || "-"})
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Warehouse: {row.wareHouse?.name || "-"}
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                percent > 50
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : percent > 20
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
              }`}>
                {percent}% Available
              </span>
            </div>

            {/* Quantities & Status Info Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-medium">Total Stock</span>
                <span className="font-bold text-gray-900 dark:text-white">{total}</span>
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-medium">In Use (Active)</span>
                <span className={`font-semibold ${allocated > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-400"}`}>
                  {allocated > 0 ? `${allocated} in use` : "0 (Idle)"}
                </span>
              </div>
              <div className="col-span-2 pt-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500 uppercase font-medium text-[10px]">Ratio (Available / Total)</span>
                  <span className={`font-bold ${available > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                    {available} / {total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      percent > 50 ? "bg-emerald-500" : percent > 20 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Sizes Breakdown if available */}
            {row.have_size && (row.verticalSizes?.length > 0 || row.horizontalSizes?.length > 0) && (
              <div className="space-y-1.5 pt-1 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sizes Breakdown</span>
                {row.vertical_enabled && row.verticalSizes?.length > 0 && (
                  <div className="space-y-1">
                    {row.verticalSizes.map((v) => (
                      <div key={v.id} className="p-2 rounded-lg bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 flex justify-between items-center">
                        <span className="font-semibold text-blue-800 dark:text-blue-300">{v.size} {v.unit}</span>
                        <span className="font-bold text-emerald-600">{v.available_qty ?? v.quantity} Avail</span>
                      </div>
                    ))}
                  </div>
                )}
                {row.horizontal_enabled && row.horizontalSizes?.length > 0 && (
                  <div className="space-y-1">
                    {row.horizontalSizes.map((h) => (
                      <div key={h.id} className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 flex justify-between items-center">
                        <span className="font-semibold text-emerald-800 dark:text-emerald-300">{h.size} {h.unit}</span>
                        <span className="font-bold text-emerald-600">{h.available_qty ?? h.quantity} Avail</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Active Events / Templates */}
            {row.matched_active_events && row.matched_active_events.length > 0 && (
              <div className="space-y-1 pt-1 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Events</span>
                {row.matched_active_events.map((ev, i) => (
                  <div key={i} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-900 dark:text-white">#{ev.event_id}: {ev.event_name}</span>
                    <span className="font-bold text-amber-600">{ev.allocated} pcs</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })
    )}
  </div>


  {/* ========================================================= */}
  {/* 2. DESKTOP VIEW: Traditional Table (Visible on md+ screens) */}
  {/* ========================================================= */}
  <div className="hidden md:block w-full max-w-full overflow-x-hidden">
    <Table className="w-full table-fixed border-collapse text-left">
      <TableHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <TableRow>
          <TableCell isHeader className="w-[3.5%] p-2 text-center whitespace-nowrap">#</TableCell>
          <TableCell isHeader className="w-[12%] p-2 break-words">Warehouse</TableCell>
          <TableCell isHeader className="w-[13%] p-2 break-words">Category</TableCell>
          <TableCell isHeader className="w-[13%] p-2 break-words">Sub-Category</TableCell>
          <TableCell isHeader className="w-[6.5%] p-2 text-center break-words">Total Stock</TableCell>
          <TableCell isHeader className="w-[9%] p-2 text-center break-words">In Use (Active)</TableCell>
          <TableCell isHeader className="w-[14%] p-2 break-words">Available Remaining (Ratio)</TableCell>
          <TableCell isHeader className="w-[14%] p-2 break-words">Sizes Breakdown</TableCell>
          <TableCell isHeader className="w-[15%] p-2 break-words">Active Events / Templates</TableCell>
        </TableRow>
      </TableHeader>

      <TableBody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
        {loading ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-12 text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                Loading live stock availability...
              </div>
            </TableCell>
          </TableRow>
        ) : filteredList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-12 text-gray-500">
              <div className="flex flex-col items-center justify-center gap-2">
                <Boxes size={32} className="text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium">No stock items match your filter.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-brand-600 hover:underline font-semibold"
                >
                  Reset filters
                </button>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          filteredList.map((row) => {
            const total = row.total_quantity !== undefined ? row.total_quantity : row.quantity;
            const allocated = row.allocated_quantity || 0;
            const available = row.available_quantity !== undefined ? row.available_quantity : total;
            const percent = row.available_percent !== undefined
              ? row.available_percent
              : total > 0
              ? Math.round((available / total) * 100)
              : 100;

            return (
              <TableRow
                key={row.id}
                className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition"
              >
                <TableCell className="w-[3.5%] p-2 text-center font-mono text-gray-400 text-xs align-top">
                  #{row.id}
                </TableCell>
                <TableCell className="w-[12%] p-2 font-medium text-gray-800 dark:text-gray-200 whitespace-normal break-words leading-snug text-xs align-top">
                  {row.wareHouse?.name || "-"}
                </TableCell>
                <TableCell className="w-[13%] p-2 whitespace-normal break-words leading-snug text-xs align-top">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {row.categories?.name || "-"}
                  </span>
                </TableCell>
                <TableCell className="w-[13%] p-2 text-gray-700 dark:text-gray-300 whitespace-normal break-words leading-snug text-xs align-top">
                  {row.subCategories?.name || "-"}
                </TableCell>
                <TableCell className="w-[6.5%] p-2 text-center font-bold text-gray-900 dark:text-white text-xs align-top">
                  {total}
                </TableCell>
                <TableCell className="w-[9%] p-2 text-center text-xs align-top">
                  {allocated > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      {allocated} in use
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">0 (Idle)</span>
                  )}
                </TableCell>
                <TableCell className="w-[14%] p-2 align-top">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-bold ${available > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {available} avail
                      </span>
                      <span className={`text-[10px] font-bold px-1 py-0.2 rounded ${percent > 50 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : percent > 20 ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"}`}>
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${percent > 50 ? "bg-emerald-500" : percent > 20 ? "bg-amber-500" : "bg-rose-500"}`}
                        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      Ratio: <strong>{available}</strong> / {total}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="w-[14%] p-2 align-top">
                  {row.have_size ? (
                    <div className="space-y-1.5">
                      {row.vertical_enabled && row.verticalSizes?.length > 0 && (
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Vertical</span>
                          {row.verticalSizes.map((v) => (
                            <div key={v.id} className="p-1 rounded bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 text-[10px] flex items-center justify-between">
                              <span className="font-semibold text-blue-800 dark:text-blue-300">{v.size} {v.unit}</span>
                              <span className={(v.available_qty || 0) <= 0 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                                {v.available_qty !== undefined ? v.available_qty : v.quantity} Avail
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {row.horizontal_enabled && row.horizontalSizes?.length > 0 && (
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Horizontal</span>
                          {row.horizontalSizes.map((h) => (
                            <div key={h.id} className="p-1 rounded bg-emerald-50/70 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 text-[10px] flex items-center justify-between">
                              <span className="font-semibold text-emerald-800 dark:text-emerald-300">{h.size} {h.unit}</span>
                              <span className={(h.available_qty || 0) <= 0 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                                {h.available_qty !== undefined ? h.available_qty : h.quantity} Avail
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-[11px]">Standard Item</span>
                  )}
                </TableCell>
                <TableCell className="w-[15%] p-2 align-top">
                  {row.matched_active_events && row.matched_active_events.length > 0 ? (
                    <div className="space-y-1">
                      {row.matched_active_events.map((ev, i) => (
                        <div key={i} className="p-1 rounded bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60 text-[10px]">
                          <div className="font-semibold text-gray-900 dark:text-white truncate" title={`Event #${ev.event_id}: ${ev.event_name}`}>
                            #{ev.event_id}: {ev.event_name}
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-gray-500 mt-0.5">
                            <span className="truncate max-w-[80px]" title={ev.template_name || "Direct"}>
                              {ev.template_name ? `Tpl: ${ev.template_name}` : "Direct"}
                            </span>
                            <span className="font-bold text-amber-700 dark:text-amber-300">{ev.allocated} pcs</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-[11px]">None (Available)</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  </div>
</div>
    </div>
  );
}