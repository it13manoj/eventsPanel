import { useEffect, useState } from "react";
import apiClient from "../../hooks/api/apiClient";
import { useAuth } from "../../hooks/auth";
import { Calendar as CalendarIcon, Users, MapPin, CheckCircle2 } from "lucide-react";

export default function Attendance() {
  const { user, isStaff } = useAuth();
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [duties, setDuties] = useState<Record<number, any[]>>({});
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDayDuties, setSelectedDayDuties] = useState<{ day: number; records: any[] } | null>(null);
  const today = new Date();

  const daysInMonth = new Date(
    selectedYear,
    selectedMonth + 1,
    0
  ).getDate();

  const fetchUsers = async () => {
    try {
      const result = await apiClient.get("/users/all");
      const list = result.data.results || [];
      setUsers(list);
      if (!isStaff && list.length > 0 && !selectedUser) {
        setSelectedUser(list[0].id);
        setSelectedUserName(list[0].name);
        getDataFoUsers(list[0].id, list[0].name);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (isStaff && user?.id) {
      setSelectedUser(user.id);
      setSelectedUserName(user.name);
      getDataFoUsers(user.id, user.name);
    } else {
      fetchUsers();
    }
  }, [isStaff, user?.id]);

  const getDataFoUsers = async (userId: number, name?: string) => {
    try {
      setSelectedUser(userId);
      if (name) setSelectedUserName(name);

      const result = await apiClient.get(
        `/admin/teamAssign/findByUserId/${userId}`
      );

      const records = result.data.data || [];
      setAllAssignments(records);

      const attendanceMap: Record<number, string> = {};
      const dutiesMap: Record<number, any[]> = {};

      const addDutyForDate = (dateVal: string | Date | null | undefined, item: any) => {
        if (!dateVal) return;
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return;
        if (d.getFullYear() === selectedYear && d.getMonth() === selectedMonth) {
          const day = d.getDate();
          attendanceMap[day] = "present";
          if (!dutiesMap[day]) dutiesMap[day] = [];
          if (!dutiesMap[day].some((x: any) => x.id === item.id)) {
            dutiesMap[day].push(item);
          }
        }
      };

      records.forEach((item: any) => {
        // Mark event date as present
        addDutyForDate(item.eventDate, item);

        // Mark assigned date as present
        addDutyForDate(item.assignedAt, item);

        // Mark date range from presentFromDate to presentToDate
        if (item.presentFromDate && item.presentToDate) {
          const start = new Date(item.presentFromDate);
          const end = new Date(item.presentToDate);
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const minDate = start <= end ? new Date(start) : new Date(end);
            const maxDate = start <= end ? new Date(end) : new Date(start);
            const diffDays = Math.round((maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24));
            if (diffDays <= 31) {
              const cur = new Date(minDate);
              while (cur <= maxDate) {
                addDutyForDate(cur, item);
                cur.setDate(cur.getDate() + 1);
              }
            } else {
              addDutyForDate(minDate, item);
              addDutyForDate(maxDate, item);
            }
          }
        } else if (item.presentFromDate) {
          addDutyForDate(item.presentFromDate, item);
        } else if (item.presentToDate) {
          addDutyForDate(item.presentToDate, item);
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
          } else if (
            selectedYear < today.getFullYear() ||
            (selectedYear === today.getFullYear() && selectedMonth < today.getMonth())
          ) {
            attendanceMap[day] = "absent";
          } else {
            attendanceMap[day] = "future";
          }
        }
      }

      setAttendance(attendanceMap);
      setDuties(dutiesMap);
    } catch (error) {
      console.error("Error fetching user attendance:", error);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      getDataFoUsers(selectedUser);
    }
  }, [selectedMonth, selectedYear]);

  // Total summary counts
  const presentDays = Object.values(attendance).filter((s) => s === "present").length;
  const absentDays = Object.values(attendance).filter((s) => s === "absent").length;
  const dutyDays = Object.keys(duties).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-blue-600" />
            {isStaff ? "My Attendance & Team Duty Record" : "Employee Attendance"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isStaff
              ? "View your monthly attendance status and assigned event duty schedule."
              : `Viewing attendance records for: ${selectedUserName || "Selected Employee"}`}
          </p>
        </div>

        {/* Attendance Badges / Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            Present: {presentDays} Days
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            Team Assigned Duties: {dutyDays} Days
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
            Absent: {absentDays} Days
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* User List (Admin Only) */}
        {!isStaff && (
          <div className="col-span-12 md:col-span-3 lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 max-h-[75vh] overflow-y-auto">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
              Select Staff
            </h3>
            <ul className="space-y-1">
              {users.map((u) => (
                <li
                  key={u.id}
                  onClick={() => getDataFoUsers(u.id, u.name)}
                  className={`p-2.5 rounded-lg cursor-pointer transition text-sm flex items-center justify-between ${
                    selectedUser === u.id
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="truncate">{u.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Calendar */}
        <div className={!isStaff ? "col-span-12 md:col-span-9 lg:col-span-10" : "col-span-12"}>
          <div className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-xs">
            {/* Calendar Header Controls */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <button
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear((y) => y - 1);
                  } else {
                    setSelectedMonth((m) => m - 1);
                  }
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-sm font-medium transition"
              >
                ◀ Previous
              </button>

              <div className="flex items-center gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500"
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
                  className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <h3 className="font-bold text-base text-gray-800 dark:text-white hidden sm:block">
                  {new Date(selectedYear, selectedMonth).toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
              </div>

              <button
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear((y) => y + 1);
                  } else {
                    setSelectedMonth((m) => m + 1);
                  }
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-sm font-medium transition"
              >
                Next ▶
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const status = attendance[day];
                const dayDuties = duties[day] || [];

                let cellBg = "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700";

                if (status === "present") {
                  cellBg = "bg-emerald-500 text-white border-emerald-600 shadow-sm";
                } else if (status === "absent") {
                  cellBg = "bg-rose-500 text-white border-rose-600";
                } else if (status === "future") {
                  cellBg = "bg-gray-50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-800";
                }

                return (
                  <div
                    key={day}
                    onClick={() => {
                      if (dayDuties.length > 0) {
                        setSelectedDayDuties({ day, records: dayDuties });
                      }
                    }}
                    className={`min-h-[75px] sm:min-h-[85px] rounded-xl p-2 flex flex-col justify-between border transition-all ${cellBg} ${
                      dayDuties.length > 0 ? "ring-2 ring-blue-400 cursor-pointer hover:scale-[1.02]" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>{day}</span>
                      {dayDuties.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/25 text-white flex items-center gap-1 font-semibold">
                          <Users size={11} /> Team
                        </span>
                      )}
                    </div>

                    {dayDuties.length > 0 ? (
                      <div className="mt-1">
                        <p className="text-[10px] font-semibold truncate leading-tight">
                          {dayDuties[0].eventName}
                        </p>
                        <p className="text-[9px] opacity-80 truncate">
                          {dayDuties[0].venue || "Event Duty"}
                        </p>
                      </div>
                    ) : (
                      <div className="text-[10px] uppercase font-medium opacity-80">
                        {status || ""}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Event Duties Details List */}
          <div className="mt-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-xs">
            <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
              <Users className="text-blue-600" size={18} />
              Assigned Event Duties & Schedule
            </h3>

            {allAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allAssignments.map((assign, idx) => (
                  <div
                    key={assign.id || idx}
                    className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-800 dark:text-white">
                        {assign.eventName || "Event Duty"}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Present (Team Assigned)
                      </span>
                    </div>

                    {assign.venue && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <MapPin size={13} className="text-gray-400" />
                        <span>{assign.venue} {assign.venueLocation ? `(${assign.venueLocation})` : ""}</span>
                      </div>
                    )}

                    <div className="text-[11px] text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-3">
                      {assign.eventDate && (
                        <span>
                          Event Date: {new Date(assign.eventDate).toLocaleDateString()}
                        </span>
                      )}
                      {assign.assignedAt && (
                        <span>
                          Assigned: {new Date(assign.assignedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                No active team event assignments recorded for this employee.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Day Duties details */}
      {selectedDayDuties && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                Day {selectedDayDuties.day} - Assigned Event Duty
              </h3>
              <button
                onClick={() => setSelectedDayDuties(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {selectedDayDuties.records.map((rec: any, idx: number) => (
                <div
                  key={rec.id || idx}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"
                >
                  <h4 className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {rec.eventName}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-1">
                    <MapPin size={13} /> {rec.venue || "Venue not specified"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Attendance Status: Present
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setSelectedDayDuties(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}