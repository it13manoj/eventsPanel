import { useEffect, useState } from "react";
import apiClient from "../../../hooks/api/apiClient";
import { FaMoneyBillWave } from "react-icons/fa";



export default function Salary() {
  const [openPayModal, setOpenPayModal] = useState(false);
  const [remaing, setremaing] = useState<Number>();
  const [payAmount, setPayAmount] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [salaryData, setSalaryData] = useState([{
    "id": 0,
    "paid": 0,
    "user_id": 0,
    "remaing": 0,
    "extra_pay": 0,
    "created_at": "2026-05-15T08:21:38.000Z",
  }]);
  const [employeeList, setEmployeeList] = useState<any[]>([]);

  // Get employee list
  const getEmployeeList = async () => {
    try {
      const results = await apiClient.get("/users/all");
      setEmployeeList(results?.data?.results || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getEmployeeList();
  }, []);



  // Employee click
  const handleClick = async (emp: any) => {
    try {

      const results = await apiClient.get(`/users/salary/${emp.id}`);
      setSalaryData(results?.data?.results);
      const total = results.data.results.reduce(
        (sum: number, row: any) => sum + Number(row.paid || 0),
        0
      );

      setremaing(total)

      const shift = employeeList.filter(rows => (rows.id == results?.data?.results[0]?.user_id) ? rows?.sifting_type : 0)
      setSelectedEmployee({ emp, shift });


    } catch (error) {
      console.log(error);

    }
  };

  const paid = async () => {
    const params = {
      user_id: selectedEmployee.emp.id,
      paid: payAmount,
      remaing:Number(selectedEmployee.emp.base_pay) - (Number(remaing) + Number(payAmount))
    }

    await apiClient.post(`/users/salary/create`, params);

    setremaing(0)
    
  }

  return (
    <div className="grid grid-cols-12 gap-4">

      {/* Left Side */}
      <div className="col-span-2 border rounded-xl bg-white">
        <div className="px-4 py-3 border-b">
          <h2 className="text-sm font-semibold">Employees</h2>
        </div>

        <div className="divide-y">
          {employeeList.map((item: any) => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className="px-4 py-3 cursor-pointer hover:bg-gray-100"
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side */}
      <div className="col-span-10 border rounded-xl bg-white">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          {/* Employee Details */}
          <div>
            <h2 className="text-lg font-semibold">
              {selectedEmployee?.emp?.name || "Select Employee"}
            </h2>

            <p className="text-sm text-gray-500">
              Total Salary: ₹ {selectedEmployee?.emp?.base_pay || 0}
            </p>

             <p className="text-sm text-green-500">
              Total Paid Amount: ₹ {Number(remaing) || 0}
            </p>
              <p className="text-sm text-red-500">
              Extra Paid Amount: ₹ {Number(remaing) - Number(selectedEmployee?.emp?.base_pay) < 0 ? 0 : Number(remaing) - Number(selectedEmployee?.emp?.base_pay) || 0}
            </p>

            <p className="text-sm text-gray-500">
              Total Shift: {selectedEmployee?.shift?.[0]?.sifting_type || 0}
            </p>

          
          </div>

          {/* Add Pay Button */}
          <button
            onClick={() => setOpenPayModal(true)}
            className={`flex items-center gap-2 bg-${selectedEmployee?.emp?.name == null ? "brown" : "green"}-600 hover:bg-${selectedEmployee?.emp?.name == null ? " brown" : "green"}-700 text-white px-4 py-2 rounded-lg shadow`}
            disabled={selectedEmployee?.emp?.name == null}
          >
            <FaMoneyBillWave />
            Add Pay
          </button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Paid</th>
                <th className="px-6 py-3 text-left">Extra Pay</th>
                <th className="px-6 py-3 text-left">Remaining Salary</th>
              </tr>
            </thead>

            <tbody>
              {salaryData.length > 0 ? (
                salaryData.map((row, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="px-6 py-3">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td className="px-6 py-3 text-red-500">
                      ₹ {row.paid || 0}
                    </td>

                    <td className="px-6 py-3 text-blue-500">
                      ₹ {row.remaing < 0 ? Math.abs(Number(row.paid)) : 0 || 0}
                    </td>

                    <td className="px-6 py-3 text-green-600">
                      ₹ {row.remaing > 0 ? row.remaing : 0|| 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-6 text-gray-400"
                  >
                    No Salary Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {openPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">

            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Add Payment</h2>

              <button
                onClick={() => setOpenPayModal(false)}
                className="text-gray-500 hover:text-red-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6">

              <label className="block text-sm font-medium mb-2">
                Enter Amount
              </label>

              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />

            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t px-6 py-4">

              <button
                onClick={() => setOpenPayModal(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  console.log("Paid:", payAmount);

                  // Call your API here

                  setOpenPayModal(false);
                  setPayAmount("");
                  paid()
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
              >
                <FaMoneyBillWave />
                Pay
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}