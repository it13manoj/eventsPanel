import { useState } from "react";
import { Search, IndianRupee, CalendarDays } from "lucide-react";

const paymentData = [
  {
    id: 1,
    employeeName: "Rahul Kumar",
    paymentDate: "05-05-2026",
    amount: 15000,
    paymentType: "Salary",
    status: "Paid",
  },
  {
    id: 2,
    employeeName: "Amit Singh",
    paymentDate: "04-05-2026",
    amount: 8000,
    paymentType: "Advance",
    status: "Paid",
  },
  {
    id: 3,
    employeeName: "Priya Sharma",
    paymentDate: "02-05-2026",
    amount: 12000,
    paymentType: "Salary",
    status: "Pending",
  },
];

export default function PaymentDiary() {
  const [search, setSearch] = useState("");

  const filteredPayments = paymentData.filter((item) =>
    item.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payment Diary</h1>

          <div className="relative w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-lg pl-10 pr-4 py-2"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200">
            <thead>
              <tr className="bg-blue-600 text-white text-left">
                <th className="p-3">Employee Name</th>
                <th className="p-3">Payment Date</th>
                <th className="p-3">Payment Type</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-blue-600">
                    <a href={`/employee-payment/${payment.id}`}>
                      {payment.employeeName}
                    </a>
                    
                  </td>

                  <td className="p-3 flex items-center gap-2">
                    <CalendarDays size={16} />
                    {payment.paymentDate}
                  </td>

                  <td className="p-3">{payment.paymentType}</td>

                  <td className="p-3 flex items-center gap-1 text-green-600 font-semibold">
                    <IndianRupee size={16} />
                    {payment.amount}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        payment.status === "Paid"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <a
                      href={`/employee-payment/${payment.id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg"
                    >
                      View Details
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
