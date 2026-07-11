import { useEffect, useState } from "react";
import apiClient from "../../hooks/api/apiClient";

const statusColors: any = {
  present: "bg-green-500",
  absent: "bg-red-500",
  leave: "bg-yellow-400",
  holiday: "bg-blue-500",
};





export default function Attendance() {
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const today = currentDate.getDate();

  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();
  const handleClick = (day: number) => {
    const current = attendance[day];

    // cycle status
    const next =
      current === "present"
        ? "absent"
        : current === "absent"
          ? "leave"
          : current === "leave"
            ? "holiday"
            : "present";

    setAttendance((prev: any) => ({
      ...prev,
      [day]: next,
    }));
  };


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

      const records = result.data.results || [];

      const attendanceMap: Record<number, string> = {};

      records.forEach((item: any) => {
        const [year, month, day] = item.assignedAt
          .split("T")[0]
          .split("-")
          .map(Number);

        if (
          year === currentYear &&
          month === currentMonth + 1
        ) {
          attendanceMap[day] = "present";
        }
      });

      for (let day = 1; day <= daysInMonth; day++) {
        if (!attendanceMap[day]) {
          attendanceMap[day] = "absent";
        }
      }

      setAttendance(attendanceMap);
    } catch (error) {
      console.error(error);
    }
  };

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
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-yellow-400 rounded"></span> Leave
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-blue-500 rounded"></span> Holiday
        </span>
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
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;

              let bgClass = "bg-gray-200 text-black";

              if (selectedUser) {
                if (day > today) {
                  bgClass = "bg-amber-700 text-white";
                } else if (attendance[day] === "present") {
                  bgClass = "bg-green-500 text-white";
                } else {
                  bgClass = "bg-red-500 text-white";
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