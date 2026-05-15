import { useEffect, useState } from "react";
import apiClient from "../../../hooks/api/apiClient";

export default function Salary() {
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
  const handleClick =  async (emp: any) => {
      try {
        
      const results = await apiClient.get(`/users/salary/${emp.id}`);
      setSalaryData(results?.data?.results);
      console.log(results?.data?.results,"results?.data?.results");
      setSelectedEmployee(emp);
    } catch (error) {
        console.log(error);
        
    }
  };


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
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            {selectedEmployee?.name || "Select Employee"}
          </h2>

          <p className="text-sm text-gray-500">
            Total Salary: ₹ {selectedEmployee?.base_pay || 0}
          </p>
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
                      ₹ {row.extra_pay || 0}
                    </td>

                    <td className="px-6 py-3 text-green-600">
                      ₹ {row.remaing || 0}
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
    </div>
  );
}