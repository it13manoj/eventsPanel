import { useEffect, useState } from "react";
import apiClient from "../../hooks/api/apiClient";




export default function Attendance() {
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const today = new Date();

  const daysInMonth = new Date(
    selectedYear,
    selectedMonth + 1,
    0
  ).getDate();





  const fetchUsers = async () => {
    try {
      const result = await apiClient.get("/users/all")
      setUsers(result.data.results); // Assuming the API returns an array of users in result.data.data
    } catch (error) {

    }
  }

  useEffect(() => {
    fetchUsers();
  }, [])


  const getDataFoUsers = async (userId: number) => {
    try {
      setSelectedUser(userId);

      const result = await apiClient.get(
        `/admin/teamAssign/findByUserId/${userId}`
      );

      const records = result.data.data || [];

      const attendanceMap: Record<number, string> = {};
      console.log(records, '-----------');
      records.forEach((item: any) => {
        const date = new Date(item.assignedAt);

        const year = date.getFullYear();

        const month = date.getMonth();
        const day = date.getDate();

        if (year === selectedYear && month === selectedMonth) {


          attendanceMap[day] =
            item.status?.toLowerCase() || "present";
        }
      });

      // Fill remaining dates
      for (let day = 1; day <= daysInMonth; day++) {
        const isCurrentMonth =
          selectedMonth === today.getMonth() &&
          selectedYear === today.getFullYear();

        if (!attendanceMap[day]) {
          if (isCurrentMonth) {
            attendanceMap[day] =
              day <= today.getDate() ? "absent" : "future";
          } else {
            attendanceMap[day] = "absent";
          }
        }
      }

      setAttendance(attendanceMap);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      getDataFoUsers(selectedUser);
    }
  }, [selectedMonth, selectedYear]);


  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Employee Attendance</h2>

      {/* Legend */}
      <div className="flex gap-4 mb-6 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-500 rounded"></span> Present
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-red-500 rounded"></span> Absent
        </span>
        {/* <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-yellow-400 rounded"></span> Leave
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-blue-500 rounded"></span> Holiday
        </span> */}
      </div>

      {
        /**
        * Cratea a user list here on click showing the attendance status of the selected day.
        * You can use a modal or a side panel to display the list of users and their attendance status for the selected day.
        * The list can be fetched from an API or a static array for demonstration purposes.
         */
      }

      <div className="grid grid-cols-12 gap-6">
        {/* User List (2 Columns) */}
        <div className="col-span-2 rounded-lg p-4 max-h-[80vh] overflow-y-auto">
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                key={user.id}
                onClick={() => getDataFoUsers(user.id)}
                className={`p-3 rounded-lg cursor-pointer transition
        ${selectedUser === user.id
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                  }`}
              >
                {user.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Calendar (10 Columns) */}
        <div className="col-span-10">
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            {/* Previous Button */}
            <button
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear((y) => y - 1);
                } else {
                  setSelectedMonth((m) => m - 1);
                }
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              ◀ Previous
            </button>

            {/* Month & Year Selection */}
            <div className="flex items-center gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border rounded-lg px-3 py-2"
              >
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border rounded-lg px-3 py-2"
              >
                {[2024, 2025, 2026, 2027, 2028].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <h3 className="font-semibold text-lg">
                {new Date(selectedYear, selectedMonth).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
            </div>

            {/* Next Button */}
            <button
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear((y) => y + 1);
                } else {
                  setSelectedMonth((m) => m + 1);
                }
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              Next ▶
            </button>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;


              let bgClass = "bg-gray-200 text-black";

              if (selectedUser) {
                switch (attendance[day]) {
                  case "present":
                    bgClass = "bg-green-500 text-white";
                    break;

                  case "absent":
                    bgClass = "bg-red-500 text-white";
                    break;

                  case "leave":
                    bgClass = "bg-yellow-400 text-black";
                    break;

                  case "holiday":
                    bgClass = "bg-blue-500 text-white";
                    break;

                  case "future":
                    bgClass = "bg-gray-300 text-gray-500";
                    break;

                  default:
                    bgClass = "bg-gray-200";
                }
              }

              return (
                <div
                  key={day}
                  className={`h-16 rounded-lg flex items-center justify-center font-semibold ${bgClass}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}