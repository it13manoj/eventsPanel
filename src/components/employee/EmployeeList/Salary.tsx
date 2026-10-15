import { useEffect, useState } from "react";
import apiClient from "../../../hooks/api/apiClient";
import { FaMoneyBillWave } from "react-icons/fa";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/auth";

export default function Salary() {
  const { user, isStaff } = useAuth();
  const [openPayModal, setOpenPayModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingSalary, setEditingSalary] = useState<any>(null);
  const [editAmount, setEditAmount] = useState("");
  const [remaing, setRemaing] = useState<number>(0);
  const [payAmount, setPayAmount] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [salaryData, setSalaryData] = useState<any[]>([]);
  const [employeeList, setEmployeeList] = useState<any[]>([]);

  // Get employee list
  const getEmployeeList = async () => {
    try {
      const results = await apiClient.get("/users/all");
      setEmployeeList(results?.data?.results || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isStaff && user?.id) {
      // Auto-load logged-in staff member's salary
      apiClient.get(`/users/findByPk`)
        .then((res) => {
          const fullUser = res.data?.user || res.data?.data || user;
          setSelectedEmployee({ emp: fullUser, shift: fullUser.sifting_type });
          refreshSalaryForEmployee(fullUser);
        })
        .catch(() => {
          setSelectedEmployee({ emp: user, shift: user.sifting_type });
          refreshSalaryForEmployee(user);
        });
    } else {
      getEmployeeList();
    }
  }, [isStaff, user?.id]);

  const refreshSalaryForEmployee = async (emp: any) => {
    try {
      const results = await apiClient.get(`/users/salary/${emp.id}`);
      const list = results?.data?.results || [];
      setSalaryData(list);
      const total = list.reduce(
        (sum: number, row: any) => sum + Number(row.paid || 0),
        0
      );
      setRemaing(total);
    } catch (error) {
      console.error(error);
    }
  };

  // Employee click
  const handleClick = async (emp: any) => {
    try {
      const shift = employeeList.filter(rows => (rows.id === emp.id) ? rows?.sifting_type : 0);
      setSelectedEmployee({ emp, shift });
      await refreshSalaryForEmployee(emp);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddPayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const basePay = Number(selectedEmployee.emp.base_pay || 0);
      const newPaid = Number(payAmount);
      const params = {
        user_id: selectedEmployee.emp.id,
        paid: newPaid,
        remaing: basePay - (remaing + newPaid),
      };

      await apiClient.post(`/users/salary/create`, params);
      toast.success("Payment recorded successfully!");
      setOpenPayModal(false);
      setPayAmount("");
      await refreshSalaryForEmployee(selectedEmployee.emp);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to record payment");
    }
  };

  const handleOpenEdit = (row: any) => {
    setEditingSalary(row);
    setEditAmount(String(row.paid || ""));
    setOpenEditModal(true);
  };

  const handleUpdatePayment = async () => {
    if (!editAmount || Number(editAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const basePay = Number(selectedEmployee.emp.base_pay || 0);
      const updatedPaid = Number(editAmount);
      const currentPaid = Number(editingSalary.paid || 0);
      const diff = updatedPaid - currentPaid;

      const params = {
        user_id: selectedEmployee.emp.id,
        paid: updatedPaid,
        remaing: basePay - (remaing + diff),
      };

      await apiClient.put(`/users/salary/update/${editingSalary.id}`, params);
      toast.success("Payment updated successfully!");
      setOpenEditModal(false);
      setEditingSalary(null);
      setEditAmount("");
      await refreshSalaryForEmployee(selectedEmployee.emp);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update payment");
    }
  };

  const handleDeletePayment = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;
    try {
      await apiClient.delete(`/users/salary/delete/${id}`);
      toast.success("Payment record deleted successfully!");
      await refreshSalaryForEmployee(selectedEmployee.emp);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete payment record");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left Side: Only show for Admin */}
      {!isStaff && (
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 border rounded-2xl bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden shadow-xs">
          <div className="px-4 py-3.5 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
            <h2 className="text-sm font-bold text-gray-800 dark:text-white">Employees Directory</h2>
          </div>

          <div className="divide-y dark:divide-gray-800 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {employeeList.map((item: any) => (
              <div
                key={item.id}
                onClick={() => handleClick(item)}
                className={`px-4 py-3 cursor-pointer transition ${
                  selectedEmployee?.emp?.id === item.id
                    ? "bg-brand-50 text-brand-600 font-semibold dark:bg-brand-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.email || "No email"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right Side */}
      <div className={`${isStaff ? "col-span-12" : "col-span-12 lg:col-span-8 xl:col-span-9"} border rounded-2xl bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden shadow-xs`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-6 sm:py-4 border-b dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              {isStaff ? "My Salary & Payment History" : (selectedEmployee?.emp?.name || "Select an Employee")}
            </h2>

            {selectedEmployee?.emp && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-medium">
                  Total Salary: <strong className="font-bold">₹{Number(selectedEmployee?.emp?.base_pay || 0).toLocaleString("en-IN")}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
                  Total Paid: <strong className="font-bold text-emerald-600 dark:text-emerald-400">₹{Number(remaing || 0).toLocaleString("en-IN")}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-medium">
                  Remaining: <strong className="font-bold">₹{Number(Math.max(0, (selectedEmployee?.emp?.base_pay || 0) - remaing)).toLocaleString("en-IN")}</strong>
                </span>
                {remaing > (selectedEmployee?.emp?.base_pay || 0) && (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-medium">
                    Extra Paid: <strong className="font-bold">₹{Number(remaing - (selectedEmployee?.emp?.base_pay || 0)).toLocaleString("en-IN")}</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Add Pay Button: Admin Only */}
          {!isStaff && (
            <button
              onClick={() => setOpenPayModal(true)}
              disabled={!selectedEmployee?.emp}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-xs transition shrink-0 ${
                selectedEmployee?.emp
                  ? "bg-brand-500 hover:bg-brand-600 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed opacity-60"
              }`}
            >
              <FaMoneyBillWave />
              Record Payment
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/[0.02] border-b dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Paid</th>
                <th className="px-6 py-3 text-left">Extra Pay</th>
                <th className="px-6 py-3 text-left">Remaining</th>
                {!isStaff && <th className="px-6 py-3 text-left">Actions</th>}
              </tr>
            </thead>

            <tbody className="divide-y dark:divide-gray-800">
              {salaryData.length > 0 ? (
                salaryData.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-3">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-3 text-green-600 font-medium">
                      ₹{row.paid || 0}
                    </td>
                    <td className="px-6 py-3 text-blue-500">
                      ₹{row.extra_pay || (row.remaing < 0 ? Math.abs(Number(row.remaing)) : 0)}
                    </td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">
                      ₹{row.remaing > 0 ? row.remaing : 0}
                    </td>
                    {!isStaff && (
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenEdit(row)}
                            className="text-gray-500 hover:text-brand-500 transition"
                            title="Edit Payment"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(row.id)}
                            className="text-gray-500 hover:text-red-500 transition"
                            title="Delete Payment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isStaff ? 4 : 5} className="text-center py-6 text-gray-400">
                    {selectedEmployee?.emp ? "No salary records found" : "Select an employee to view salary history"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Pay Modal */}
      {openPayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-99999 p-3 sm:p-5 overflow-hidden overscroll-none">
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md p-5 sm:p-6 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar" style={{ transform: "translateZ(0)" }}>
            <div className="flex items-center justify-between border-b dark:border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <FaMoneyBillWave size={18} />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">Record Salary Payment</h2>
              </div>
              <button
                onClick={() => setOpenPayModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                  Employee
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedEmployee?.emp?.name || ""}
                  className="w-full border rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 font-semibold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                  Payment Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Enter payment amount"
                    className="w-full border rounded-xl pl-8 pr-4 py-2.5 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono font-semibold text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t dark:border-gray-800 pt-4 mt-6">
              <button
                onClick={() => setOpenPayModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPayment}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
              >
                <FaMoneyBillWave />
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Pay Modal */}
      {openEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-99999 p-3 sm:p-5 overflow-hidden overscroll-none">
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md p-5 sm:p-6 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar" style={{ transform: "translateZ(0)" }}>
            <div className="flex items-center justify-between border-b dark:border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                  <Pencil size={18} />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">Edit Payment Record</h2>
              </div>
              <button
                onClick={() => setOpenEditModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                  Paid Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    placeholder="Enter new amount"
                    className="w-full border rounded-xl pl-8 pr-4 py-2.5 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono font-semibold text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t dark:border-gray-800 pt-4 mt-6">
              <button
                onClick={() => setOpenEditModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePayment}
                className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
              >
                Update Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}