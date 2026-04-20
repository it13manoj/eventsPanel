import { useState } from "react";

const statusColors: any = {
  present: "bg-green-500",
  absent: "bg-red-500",
  leave: "bg-yellow-400",
  holiday: "bg-blue-500",
};

export default function Attendance() {
  const [attendance, setAttendance] = useState<any>({});

  const daysInMonth = 31; // static (you can make dynamic later)

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

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const status = attendance[day];

          return (
            <div
              key={day}
              onClick={() => handleClick(day)}
              className={`h-16 flex items-center justify-center rounded-lg cursor-pointer text-white font-semibold
                ${status ? statusColors[status] : "bg-gray-200 text-black"}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}