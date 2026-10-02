import { useEffect, useState } from "react";
import apiClient from "../../../hooks/api/apiClient";
import { FaMoneyBillWave } from "react-icons/fa";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

export default function Salary() {
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
    getEmployeeList();
  }, []);

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
    <div className="grid grid-cols-12 gap-4">
      {/* Left Side */}
      <div className="col-span-3 border rounded-xl bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-4 py-3 border-b dark:border-gray-800">
          <h2 className="text-sm font-semibold">Employees</h2>
        </div>

        <div className="divide-y dark:divide-gray-800 max-h-[70vh] overflow-y-auto">
          {employeeList.map((item: any) => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className={`px-4 py-3 cursor-pointer transition ${
                selectedEmployee?.emp?.id === item.id
                  ? "bg-brand-50 text-brand-600 font-medium dark:bg-brand-900/20"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div className="font-medium text-sm">{item.name}</div>
              <div className="text-xs text-gray-500">{item.email}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side */}
      <div className="col-span-9 border rounded-xl bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold">
              {selectedEmployee?.emp?.name || "Select an Employee"}
            </h2>

            {selectedEmployee?.emp && (
              <div className="flex flex-wrap gap-4 mt-1 text-sm">
                <span className="text-gray-500">
                  Total Salary: ₹{selectedEmployee?.emp?.base_pay || 0}
                </span>
                <span className="text-green-600">
                  Total Paid: ₹{remaing || 0}
                </span>
                <span className="text-blue-600">
                  Remaining: ₹{Math.max(0, (selectedEmployee?.emp?.base_pay || 0) - remaing)}
                </span>
                {remaing > (selectedEmployee?.emp?.base_pay || 0) && (
                  <span className="text-red-500">
                    Extra Paid: ₹{remaing - (selectedEmployee?.emp?.base_pay || 0)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Add Pay Button */}
          <button
            onClick={() => setOpenPayModal(true)}
            disabled={!selectedEmployee?.emp}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow transition ${
              selectedEmployee?.emp
                ? "bg-brand-500 hover:bg-brand-600 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <FaMoneyBillWave />
            Add Pay
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/[0.02] border-b dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Paid</th>
                <th className="px-6 py-3 text-left">Extra Pay</th>
                <th className="px-6 py-3 text-left">Remaining</th>
                <th className="px-6 py-3 text-left">Actions</th>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">
                    {selectedEmployee?.emp ? "No salary records found for this employee" : "Select an employee to view salary history"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Pay Modal */}
      {openPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-lg font-semibold">Record Payment</h2>
              <button
                onClick={() => setOpenPayModal(false)}
                className="text-gray-500 hover:text-red-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Employee
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedEmployee?.emp?.name || ""}
                  className="w-full border rounded-lg px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4 mt-6">
              <button
                onClick={() => setOpenPayModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPayment}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-lg font-semibold">Edit Payment</h2>
              <button
                onClick={() => setOpenEditModal(false)}
                className="text-gray-500 hover:text-red-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Paid Amount (₹)
                </label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="Enter new amount"
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4 mt-6">
              <button
                onClick={() => setOpenEditModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePayment}
                className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg"
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