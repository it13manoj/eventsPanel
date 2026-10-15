import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useEffect, useState } from "react";
import apiClient from "../../../hooks/api/apiClient";
import images from "../../../hooks/api/apiImages";
import {
  Pencil,
  Trash2,
  Search,
  LayoutGrid,
  List,
  Phone,
  Mail,
  Briefcase,
  Clock,
  UserCheck,
  Users,
  Shield
} from "lucide-react";
import { toast } from "react-toastify";

const roleMap: Record<number, string> = {
  1: "Admin",
  2: "Manager",
  3: "Staff",
  4: "Driver"
};

export default function EmployeeList({ refreshKey = 0, onEdit, onRefresh }: any) {
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [shiftFilter, setShiftFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const getEmployeeList = async () => {
    setLoading(true);
    try {
      const results = await apiClient.get("/users/all");
      setEmployeeList(results?.data?.results || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmployeeList();
  }, [refreshKey]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const res = await apiClient.delete(`/users/delete/${id}`);
      if (res.data?.success === false || res.data?.status === false) {
        toast.error(res.data?.message || "Failed to delete employee");
      } else {
        toast.success("Employee deleted successfully!");
        getEmployeeList();
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error deleting employee");
    }
  };

  // Filtered List
  const filteredEmployees = employeeList.filter((emp) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      emp.name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.contact?.toString().includes(q) ||
      emp.job?.toLowerCase().includes(q);

    const matchesRole =
      roleFilter === "ALL" || String(emp.role_id) === String(roleFilter);

    const isNight =
      emp.sifting_type === 2 ||
      (emp.shift && emp.shift.toLowerCase().includes("night"));
    const matchesShift =
      shiftFilter === "ALL" ||
      (shiftFilter === "NIGHT" && isNight) ||
      (shiftFilter === "DAY" && !isNight);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && Boolean(emp.isactive)) ||
      (statusFilter === "INACTIVE" && !Boolean(emp.isactive));

    return matchesSearch && matchesRole && matchesShift && matchesStatus;
  });

  const totalCount = employeeList.length;
  const activeCount = employeeList.filter((e) => Boolean(e.isactive)).length;
  const dayShiftCount = employeeList.filter((e) => e.sifting_type !== 2 && !(e.shift && e.shift.toLowerCase().includes("night"))).length;
  const nightShiftCount = totalCount - dayShiftCount;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Stats Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Staff</p>
          <div className="flex items-center justify-between mt-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</h3>
            <Users className="text-blue-500" size={18} />
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Active</p>
          <div className="flex items-center justify-between mt-1">
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</h3>
            <UserCheck className="text-emerald-500" size={18} />
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Day Shift</p>
          <div className="flex items-center justify-between mt-1">
            <h3 className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{dayShiftCount}</h3>
            <Clock className="text-amber-500" size={18} />
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Night Shift</p>
          <div className="flex items-center justify-between mt-1">
            <h3 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{nightShiftCount}</h3>
            <Clock className="text-indigo-500" size={18} />
          </div>
        </div>
      </div>

      {/* Search, Filters, and View Toggle Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, contact, designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Roles</option>
            <option value="1">Admin</option>
            <option value="2">Manager</option>
            <option value="3">Staff</option>
            <option value="4">Driver</option>
          </select>

          {/* Shift Filter */}
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="px-2.5 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Shifts</option>
            <option value="DAY">Day Shift</option>
            <option value="NIGHT">Night Shift</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* View Toggle Buttons */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden p-0.5 bg-gray-50 dark:bg-gray-800 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-1.5 rounded-lg transition ${viewMode === "table"
                  ? "bg-white dark:bg-gray-700 text-blue-600 shadow-xs"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              title="Card Grid View"
              className={`p-1.5 rounded-lg transition ${viewMode === "cards"
                  ? "bg-white dark:bg-gray-700 text-blue-600 shadow-xs"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">Loading employees...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        /* Empty State */
        <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <Users size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <h3 className="font-bold text-gray-800 dark:text-white">No employees found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Try adjusting your search criteria or clear the filters.
          </p>
        </div>
      ) : viewMode === "cards" ? (
        /* ======================== CARD GRID VIEW ======================== */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEmployees.map((emp) => {
            const isNight =
              emp.sifting_type === 2 ||
              (emp.shift && emp.shift.toLowerCase().includes("night"));
            const roleName = roleMap[emp?.role_id] || emp?.role?.role_name || `Role ${emp?.role_id}`;

            return (
              <div
                key={emp.id}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Avatar & Actions */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="relative">
                      {emp?.img ? (
                        <img
                          src={`${images.baseUrl}/${emp.img}`}
                          alt={emp.name}
                          className="w-13 h-13 object-cover rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50"
                          onError={(e: any) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-lg">
                          {emp?.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${emp.isactive ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        title={emp.isactive ? "Active" : "Inactive"}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => (onEdit ? onEdit(emp) : null)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 dark:bg-gray-800 dark:hover:bg-blue-900/30 dark:text-gray-300 dark:hover:text-blue-400 transition"
                        title="Edit Employee"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 dark:bg-gray-800 dark:hover:bg-rose-900/30 dark:text-gray-300 dark:hover:text-rose-400 transition"
                        title="Delete Employee"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Name and Designation */}
                  <div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white truncate">
                      {emp.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <Briefcase size={12} className="text-gray-400 shrink-0" />
                      <span className="truncate">{emp.job || "No Designation"}</span>
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      <Shield size={10} /> {roleName}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${isNight
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        }`}
                    >
                      <Clock size={10} /> {isNight ? "Night Shift" : "Day Shift"} ({emp.shift_hour ? `${emp.shift_hour}h` : "8h"})
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 truncate">
                      <Phone size={13} className="text-gray-400 shrink-0" />
                      <a href={`tel:${emp.contact}`} className="hover:text-blue-600 truncate">
                        {emp.contact || "No Contact"}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={13} className="text-gray-400 shrink-0" />
                      <a href={`mailto:${emp.email}`} className="hover:text-blue-600 truncate">
                        {emp.email || "No Email"}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Footer Pay Info */}
                <div className="mt-4 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Base Salary</span>
                  <span className="font-bold text-gray-900 dark:text-white font-mono">
                    {emp.base_pay ? `₹${Number(emp.base_pay).toLocaleString("en-IN")}` : "N/A"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ======================== RESPONSIVE TABLE VIEW ======================== */
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">

          {/* ========================================================= */}
          {/* 1. MOBILE VIEW: Stacked Cards (Visible on mobile only)     */}
          {/* ========================================================= */}
          <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800">
            {filteredEmployees.map((rows, idx) => {
              const isNight =
                rows.sifting_type === 2 ||
                (rows.shift && rows.shift.toLowerCase().includes("night"));

              return (
                <div key={rows?.id} className="p-4 space-y-3 bg-white dark:bg-transparent">

                  {/* Top Row: Index, Avatar, Name & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-400">#{idx + 1}</span>
                      {rows?.img ? (
                        <img
                          src={`${images.baseUrl}/${rows.img}`}
                          alt={rows.name}
                          className="w-10 h-10 object-cover rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 shrink-0"
                          onError={(e: any) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {rows?.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {rows?.name}
                        </h4>
                        <span className="text-[11px] text-gray-400">ID #{rows?.id}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-semibold shrink-0 ${rows?.isactive
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                      {rows?.isactive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Role & Designation Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {roleMap[rows?.role_id] || rows?.role?.role_name || `Role ${rows?.role_id}`}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                      {rows?.job || "N/A"}
                    </span>
                  </div>

                  {/* Grid Meta Information */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase font-medium">Contact</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{rows?.contact || "N/A"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase font-medium">Email</span>
                      <span className="text-gray-800 dark:text-gray-200 truncate block">{rows?.email || "N/A"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase font-medium">Shift</span>
                      <span className={`inline-flex items-center gap-1 font-semibold ${isNight ? "text-indigo-600 dark:text-indigo-400" : "text-amber-600 dark:text-amber-400"}`}>
                        <Clock size={10} />
                        {isNight ? "Night" : "Day"} ({rows.shift_hour ? `${rows.shift_hour}h` : "8h"})
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase font-medium">Base Pay</span>
                      <span className="font-mono font-semibold text-gray-900 dark:text-white">
                        {rows?.base_pay ? `₹${Number(rows.base_pay).toLocaleString("en-IN")}` : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => (onEdit ? onEdit(rows) : null)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 transition"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rows.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 transition"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>

                </div>
              );
            })}
          </div>


          {/* ========================================================= */}
          {/* 2. DESKTOP VIEW: Table with Sticky Actions (md and up)    */}
          {/* ========================================================= */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <Table className="min-w-[1100px] w-full text-xs sm:text-sm">
              {/* Table Header */}
              <TableHeader className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-start whitespace-nowrap">#</TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-start whitespace-nowrap">Employee</TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-start whitespace-nowrap">Contact & Email</TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-start whitespace-nowrap">Role</TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-start whitespace-nowrap">Designation</TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-start whitespace-nowrap">Shift</TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-start whitespace-nowrap">Gender</TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-start whitespace-nowrap">Base Pay</TableCell>
                  <TableCell isHeader className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-center whitespace-nowrap">Status</TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-center whitespace-nowrap sticky right-0 bg-gray-50 dark:bg-gray-800 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredEmployees.map((rows, idx) => {
                  const isNight =
                    rows.sifting_type === 2 ||
                    (rows.shift && rows.shift.toLowerCase().includes("night"));

                  return (
                    <TableRow key={rows?.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                      <TableCell className="px-4 py-3 text-start font-medium text-gray-400 whitespace-nowrap">
                        {idx + 1}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {rows?.img ? (
                            <img
                              src={`${images.baseUrl}/${rows.img}`}
                              alt={rows.name}
                              className="w-9 h-9 object-cover rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 shrink-0"
                              
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                              {rows?.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {rows?.name}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              ID #{rows?.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start whitespace-nowrap">
                        <div className="text-gray-800 dark:text-gray-200 font-medium">
                          {rows?.contact || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {rows?.email}
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start whitespace-nowrap">
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {roleMap[rows?.role_id] || rows?.role?.role_name || `Role ${rows?.role_id}`}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {rows?.job || "N/A"}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isNight
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            }`}
                        >
                          <Clock size={11} />
                          {isNight ? "Night Shift" : "Day Shift"} ({rows.shift_hour ? `${rows.shift_hour}h` : "8h"})
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-gray-600 dark:text-gray-300 capitalize whitespace-nowrap">
                        {rows?.gender || "N/A"}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start font-mono font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {rows?.base_pay ? `₹${Number(rows.base_pay).toLocaleString("en-IN")}` : "N/A"}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${rows?.isactive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                        >
                          {rows?.isactive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-center whitespace-nowrap sticky right-0 bg-white dark:bg-gray-900 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => (onEdit ? onEdit(rows) : null)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition"
                            title="Edit Employee"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(rows.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:text-gray-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 transition"
                            title="Delete Employee"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

