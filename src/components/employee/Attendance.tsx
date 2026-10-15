import { useEffect, useState } from "react";
import apiClient from "../../hooks/api/apiClient";
import { useAuth } from "../../hooks/auth";
import {
  Calendar as CalendarIcon,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  RotateCcw,
  UserX,
  UserCheck,
  AlertTriangle,
  Info,
  Clock,
  Zap,
  Check,
  Award,
} from "lucide-react";
import { toast } from "react-toastify";

export default function Attendance() {
  const { user, isStaff } = useAuth();
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [attendanceOverrides, setAttendanceOverrides] = useState<Record<number, any>>({});
  const [duties, setDuties] = useState<Record<number, any[]>>({});
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    day: number;
    records: any[];
    status: string;
    override?: any;
  } | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [submittingOverride, setSubmittingOverride] = useState<boolean>(false);
  const [shiftConfirmModal, setShiftConfirmModal] = useState<{
    day: number;
    targetShift: 2 | 3;
    hoursWorked: number;
    shiftName: string;
    reason: string;
  } | null>(null);
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

      const [teamResult, attendanceResult] = await Promise.all([
        apiClient.get(`/admin/teamAssign/findByUserId/${userId}`),
        apiClient
          .get(
            `/admin/attendance/findByUserId/${userId}?year=${selectedYear}&month=${selectedMonth + 1}`
          )
          .catch(() => ({ data: { data: [] } })),
      ]);

      const records = teamResult.data.data || [];
      setAllAssignments(records);

      const overrides = attendanceResult.data.data || attendanceResult.data.results || [];
      const overridesMap: Record<number, any> = {};
      overrides.forEach((ov: any) => {
        if (!ov.date) return;
        const parts = String(ov.date).split("T")[0].split("-");
        if (parts.length === 3) {
          const yr = parseInt(parts[0], 10);
          const mo = parseInt(parts[1], 10) - 1;
          const dy = parseInt(parts[2], 10);
          if (yr === selectedYear && mo === selectedMonth) {
            overridesMap[dy] = ov;
          }
        }
      });
      setAttendanceOverrides(overridesMap);

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

      // 1. Mark event duties as Present by default (assigned to event)
      records.forEach((item: any) => {
        addDutyForDate(item.eventDate, item);
        addDutyForDate(item.assignedAt, item);

        if (item.presentFromDate && item.presentToDate) {
          const start = new Date(item.presentFromDate);
          const end = new Date(item.presentToDate);
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const minDate = start <= end ? new Date(start) : new Date(end);
            const maxDate = start <= end ? new Date(end) : new Date(start);
            const diffDays = Math.round(
              (maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24)
            );
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

      // 2. Fill unassigned dates
      for (let day = 1; day <= daysInMonth; day++) {
        const isCurrentMonth =
          selectedMonth === today.getMonth() &&
          selectedYear === today.getFullYear();

        if (!attendanceMap[day]) {
          if (isCurrentMonth) {
            attendanceMap[day] = day <= today.getDate() ? "absent" : "future";
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

      // 3. Apply admin overrides (e.g. absent on specific event days)
      Object.keys(overridesMap).forEach((dayStr) => {
        const day = Number(dayStr);
        const ov = overridesMap[day];
        if (ov && ov.status) {
          attendanceMap[day] = ov.status;
        }
      });

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

  // Handle Admin marking attendance (absent or present)
  const handleMarkAttendance = async (day: number, status: "absent" | "present") => {
    if (!selectedUser) return;
    try {
      setSubmittingOverride(true);
      const m = String(selectedMonth + 1).padStart(2, "0");
      const d = String(day).padStart(2, "0");
      const dateStr = `${selectedYear}-${m}-${d}`;

      await apiClient.post("/admin/attendance/mark", {
        user_id: selectedUser,
        date: dateStr,
        status: status,
        reason:
          overrideReason ||
          (status === "absent"
            ? "Marked absent by admin"
            : "Marked present by admin"),
        event_id: selectedDayInfo?.records?.[0]?.event_id || null,
      });

      toast.success(
        `Day ${day} marked as ${status.toUpperCase()} successfully!`
      );
      setSelectedDayInfo(null);
      await getDataFoUsers(selectedUser);
    } catch (error: any) {
      console.error("Failed to mark attendance:", error);
      toast.error(
        error.response?.data?.message || "Failed to update attendance"
      );
    } finally {
      setSubmittingOverride(false);
    }
  };

  // Handle Admin resetting attendance override
  const handleResetAttendance = async (day: number) => {
    if (!selectedUser) return;
    try {
      setSubmittingOverride(true);
      const m = String(selectedMonth + 1).padStart(2, "0");
      const d = String(day).padStart(2, "0");
      const dateStr = `${selectedYear}-${m}-${d}`;

      await apiClient.delete(`/admin/attendance/remove/${selectedUser}/${dateStr}`);

      toast.success(`Day ${day} attendance reset to default assignment!`);
      setSelectedDayInfo(null);
      await getDataFoUsers(selectedUser);
    } catch (error: any) {
      console.error("Failed to reset attendance:", error);
      toast.error(
        error.response?.data?.message || "Failed to reset attendance"
      );
    } finally {
      setSubmittingOverride(false);
    }
  };

  // Handle confirming 2nd or 3rd shift when hours completed
  const handleConfirmShift = async () => {
    if (!shiftConfirmModal || !selectedUser) return;
    try {
      setSubmittingOverride(true);
      const { day, targetShift, hoursWorked, shiftName, reason } = shiftConfirmModal;
      const m = String(selectedMonth + 1).padStart(2, "0");
      const d = String(day).padStart(2, "0");
      const dateStr = `${selectedYear}-${m}-${d}`;

      await apiClient.post("/admin/attendance/mark", {
        user_id: selectedUser,
        date: dateStr,
        status: "present",
        shifts_count: targetShift,
        hours_worked: hoursWorked,
        shift_name: shiftName,
        reason:
          reason ||
          `Daily shift hours (${empShiftHour}h) completed. Authorized ${shiftName}`,
        event_id: selectedDayInfo?.records?.[0]?.event_id || null,
      });

      toast.success(
        `Day ${day}: ${shiftName} (${hoursWorked}h) confirmed & authorized successfully!`
      );
      setShiftConfirmModal(null);
      setSelectedDayInfo(null);
      await getDataFoUsers(selectedUser);
    } catch (error: any) {
      console.error("Failed to authorize shift:", error);
      toast.error(error.response?.data?.message || "Failed to authorize shift");
    } finally {
      setSubmittingOverride(false);
    }
  };

  // Handle resetting back to standard 1st shift
  const handleResetToStandardShift = async (day: number) => {
    if (!selectedUser) return;
    try {
      setSubmittingOverride(true);
      const m = String(selectedMonth + 1).padStart(2, "0");
      const d = String(day).padStart(2, "0");
      const dateStr = `${selectedYear}-${m}-${d}`;

      await apiClient.post("/admin/attendance/mark", {
        user_id: selectedUser,
        date: dateStr,
        status: "present",
        shifts_count: 1,
        hours_worked: empShiftHour,
        shift_name: "1st Shift",
        reason: "Reset to standard 1st shift",
        event_id: selectedDayInfo?.records?.[0]?.event_id || null,
      });

      toast.success(`Day ${day} reset to standard 1st shift (${empShiftHour}h)!`);
      setSelectedDayInfo(null);
      await getDataFoUsers(selectedUser);
    } catch (error: any) {
      console.error("Failed to reset shift:", error);
      toast.error(error.response?.data?.message || "Failed to reset shift");
    } finally {
      setSubmittingOverride(false);
    }
  };

  // Current employee & shift hours target
  const currentEmp = isStaff
    ? user
    : users.find((u) => u.id === selectedUser);
  const empShiftHour = Number(currentEmp?.shift_hour) || 8;

  // Total summary counts & shift stats calculation
  let totalHoursWorked = 0;
  let totalShiftsCount = 0;
  let multiShiftCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const status = attendance[day];
    if (status === "present") {
      const ov = attendanceOverrides[day];
      const shifts = ov && ov.shifts_count ? Number(ov.shifts_count) : 1;
      const hours =
        ov && ov.hours_worked !== undefined && ov.hours_worked !== null
          ? Number(ov.hours_worked)
          : shifts * empShiftHour;
      totalShiftsCount += shifts;
      totalHoursWorked += hours;
      if (shifts > 1) {
        multiShiftCount += 1;
      }
    }
  }

  const presentDays = Object.values(attendance).filter((s) => s === "present").length;
  const absentDays = Object.values(attendance).filter((s) => s === "absent").length;
  const dutyDays = Object.keys(duties).length;
  const overrideCount = Object.keys(attendanceOverrides).length;

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
              ? `View your monthly attendance status and assigned event duties. Daily Target: ${empShiftHour}h/shift.`
              : `Viewing attendance for: ${selectedUserName || "Selected Employee"} (Daily Target: ${empShiftHour}h/shift)`}
          </p>
        </div>

        {/* Attendance Badges / Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            Present: {presentDays} Days
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Total Shifts: {totalShiftsCount} {multiShiftCount > 0 && `(${multiShiftCount} Double/Triple)`}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            Hours Worked: {totalHoursWorked} hrs
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            Duties: {dutyDays} Days
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
            Absent: {absentDays} Days
          </div>
          {overrideCount > 0 && !isStaff && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
              Admin Overrides: {overrideCount}
            </div>
          )}
        </div>
      </div>

      {/* Legend & Instructions for Admin */}
      {!isStaff && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-800 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>Shift & Attendance Guide:</strong> When daily target ({empShiftHour}h) is completed on a present day, click that date to authorize <strong>2nd Shift (Double Shift)</strong> or <strong>3rd Shift (Triple Shift)</strong> with confirmation popup.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> 1st Shift
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span> 2nd Shift
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span> 3rd Shift
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span> Absent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 border-2 border-blue-400 rounded-full"></span> Team Duty
            </span>
          </div>
        </div>
      )}

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
                const override = attendanceOverrides[day];
                const shiftsCount = override?.shifts_count
                  ? Number(override.shifts_count)
                  : status === "present"
                  ? 1
                  : 0;
                const hoursWorked =
                  override?.hours_worked !== undefined && override?.hours_worked !== null
                    ? Number(override.hours_worked)
                    : status === "present"
                    ? shiftsCount * empShiftHour
                    : 0;

                let cellBg =
                  "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700";

                if (status === "present") {
                  if (shiftsCount >= 3) {
                    cellBg =
                      "bg-gradient-to-br from-amber-600 to-amber-700 text-white border-amber-800 shadow-sm";
                  } else if (shiftsCount === 2) {
                    cellBg =
                      "bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-700 shadow-sm";
                  } else {
                    cellBg = "bg-emerald-500 text-white border-emerald-600 shadow-sm";
                  }
                } else if (status === "absent") {
                  cellBg = "bg-rose-500 text-white border-rose-600 shadow-sm";
                } else if (status === "future") {
                  cellBg =
                    "bg-gray-50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-800";
                }

                return (
                  <div
                    key={day}
                    onClick={() => {
                      setSelectedDayInfo({
                        day,
                        records: dayDuties,
                        status: status || "future",
                        override,
                      });
                      setOverrideReason(override?.reason || "");
                    }}
                    className={`min-h-[75px] sm:min-h-[90px] rounded-xl p-2 flex flex-col justify-between border transition-all cursor-pointer hover:scale-[1.02] ${cellBg} ${
                      override
                        ? "ring-2 ring-amber-400 dark:ring-amber-300"
                        : dayDuties.length > 0
                        ? "ring-1 ring-blue-400"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-sm">{day}</span>
                      <div className="flex items-center gap-1">
                        {override && (
                          <span
                            className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 font-bold uppercase tracking-tight"
                            title="Admin manual override"
                          >
                            Admin
                          </span>
                        )}
                        {dayDuties.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/25 text-white flex items-center gap-1 font-semibold">
                            <Users size={11} /> Team
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Shift & Hours Badge */}
                    {status === "present" && (
                      <div className="my-1">
                        {shiftsCount >= 3 ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/30 text-amber-200 border border-amber-300/40">
                            <Zap size={9} className="fill-amber-300 text-amber-300" />
                            3rd Shift ({hoursWorked}h)
                          </span>
                        ) : shiftsCount === 2 ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/30 text-indigo-100 border border-indigo-300/40">
                            <Zap size={9} className="fill-indigo-300 text-indigo-300" />
                            2nd Shift ({hoursWorked}h)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-black/20 text-emerald-100">
                            <Clock size={9} />
                            {hoursWorked}h
                          </span>
                        )}
                      </div>
                    )}

                    {dayDuties.length > 0 ? (
                      <div className="mt-0.5">
                        <p className="text-[10px] font-semibold truncate leading-tight">
                          {dayDuties[0].eventName}
                        </p>
                        <p className="text-[9px] opacity-90 truncate flex items-center justify-between">
                          <span>{dayDuties[0].venue || "Event Duty"}</span>
                          <span className="font-bold uppercase text-[9px] px-1 py-0.2 rounded bg-black/20">
                            {status}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div className="text-[10px] uppercase font-semibold opacity-90">
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
                        <span>
                          {assign.venue}{" "}
                          {assign.venueLocation ? `(${assign.venueLocation})` : ""}
                        </span>
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

      {/* Modal for Day Attendance & Duty Management */}
      {selectedDayInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-99999 p-3 sm:p-5 overflow-hidden overscroll-none">
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg p-5 sm:p-6 border border-gray-100 dark:border-gray-800 space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar" style={{ transform: "translateZ(0)" }}>
            {/* Header */}
            <div className="flex items-center justify-between border-b dark:border-gray-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                  Day {selectedDayInfo.day} - {new Date(selectedYear, selectedMonth, selectedDayInfo.day).toLocaleDateString("default", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Employee: <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedUserName || "Employee"}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedDayInfo(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Current Attendance Status Badge */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Attendance Status:
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                  selectedDayInfo.status === "present"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                    : selectedDayInfo.status === "absent"
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {selectedDayInfo.status === "present" && <CheckCircle2 size={13} />}
                {selectedDayInfo.status === "absent" && <XCircle size={13} />}
                {selectedDayInfo.status}
              </span>
            </div>

            {/* Shift Hours Tracking & Multi-Shift Authorization Card */}
            {(() => {
              const dayShifts = selectedDayInfo.override?.shifts_count
                ? Number(selectedDayInfo.override.shifts_count)
                : selectedDayInfo.status === "present"
                ? 1
                : 0;
              const dayHours =
                selectedDayInfo.override?.hours_worked !== undefined &&
                selectedDayInfo.override?.hours_worked !== null
                  ? Number(selectedDayInfo.override.hours_worked)
                  : selectedDayInfo.status === "present"
                  ? dayShifts * empShiftHour
                  : 0;
              const hasCompletedStandard =
                selectedDayInfo.status === "present" && dayHours >= empShiftHour;

              return (
                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Shift Hours Tracking
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                      Standard Target: <strong>{empShiftHour} hrs/day</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 block mb-0.5">Logged Hours</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1.5 flex-wrap">
                        {dayHours} hrs
                        {dayShifts > 1 && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
                              dayShifts >= 3
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                                : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200"
                            }`}
                          >
                            {dayShifts === 2 ? "2nd Shift" : "3rd Shift"}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 block mb-0.5">Shift Target Status</span>
                      <span
                        className={`text-xs font-bold flex items-center gap-1 ${
                          hasCompletedStandard
                            ? "text-emerald-600 dark:text-emerald-400"
                            : selectedDayInfo.status === "present"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-gray-500"
                        }`}
                      >
                        {hasCompletedStandard ? (
                          <>
                            <CheckCircle2 size={13} /> Target Completed ({dayHours}/{empShiftHour}h)
                          </>
                        ) : selectedDayInfo.status === "present" ? (
                          <>Incomplete ({dayHours}/{empShiftHour}h)</>
                        ) : (
                          <>Not Present</>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {selectedDayInfo.status === "present" && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                        <span>Completion: {Math.round((dayHours / empShiftHour) * 100)}%</span>
                        <span>
                          {dayShifts} Shift{dayShifts > 1 ? "s" : ""} Logged
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            dayShifts >= 3
                              ? "bg-amber-500"
                              : dayShifts === 2
                              ? "bg-indigo-600"
                              : "bg-emerald-500"
                          }`}
                          style={{
                            width: `${Math.min(100, (dayHours / (empShiftHour * 3)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Notice when shift hours are completed */}
                  {hasCompletedStandard && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">
                          Daily shift target ({empShiftHour}h) has been completed!
                        </p>
                        <p className="text-[11px] opacity-90">
                          Employee has completed required shift hours. You can authorize a <strong>2nd Shift (Double Shift)</strong> or <strong>3rd Shift (Triple Shift)</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Multi-Shift Action Buttons for Admin */}
                  {!isStaff && selectedDayInfo.status === "present" && (
                    <div className="pt-2 border-t dark:border-gray-700/60 flex flex-wrap gap-2">
                      {dayShifts < 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setShiftConfirmModal({
                              day: selectedDayInfo.day,
                              targetShift: 2,
                              hoursWorked: empShiftHour * 2,
                              shiftName: "2nd Shift (Double Shift)",
                              reason: `Daily shift hours (${empShiftHour}h) completed. Authorized 2nd Shift.`,
                            });
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                        >
                          <Zap size={14} />
                          Authorize 2nd Shift ({empShiftHour * 2}h)
                        </button>
                      )}

                      {dayShifts === 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setShiftConfirmModal({
                              day: selectedDayInfo.day,
                              targetShift: 3,
                              hoursWorked: empShiftHour * 3,
                              shiftName: "3rd Shift (Triple Shift)",
                              reason: `2nd shift completed. Authorized 3rd Shift for overnight duty.`,
                            });
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                        >
                          <Zap size={14} />
                          Authorize 3rd Shift ({empShiftHour * 3}h)
                        </button>
                      )}

                      {dayShifts > 1 && (
                        <button
                          type="button"
                          disabled={submittingOverride}
                          onClick={() => handleResetToStandardShift(selectedDayInfo.day)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                        >
                          <RotateCcw size={13} />
                          Reset to 1st Shift
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Manual Admin Override Notice */}
            {selectedDayInfo.override && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle size={14} className="text-amber-600" />
                  Admin Override Applied
                </div>
                <p>
                  This date was manually marked as <strong>{selectedDayInfo.override.status.toUpperCase()}</strong> by Admin.
                </p>
                {selectedDayInfo.override.reason && (
                  <p className="opacity-90">
                    Reason: <em>{selectedDayInfo.override.reason}</em>
                  </p>
                )}
              </div>
            )}

            {/* Assigned Event Duty Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Event Duty Assignment
              </h4>
              {selectedDayInfo.records.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedDayInfo.records.map((rec: any, idx: number) => (
                    <div
                      key={rec.id || idx}
                      className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-xs space-y-1"
                    >
                      <h5 className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                        {rec.eventName}
                      </h5>
                      <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <MapPin size={13} /> {rec.venue || "Venue not specified"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Default Status from Event Assignment: <span className="font-semibold text-emerald-600">Present</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                  No event duty assigned on this date.
                </p>
              )}
            </div>

            {/* Admin Attendance Controls */}
            {!isStaff && (
              <div className="pt-2 border-t dark:border-gray-800 space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Admin Action: Update Attendance
                </h4>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Reason / Remarks (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Leave, Absent from site, Medical reason"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Mark Absent Button */}
                  {selectedDayInfo.status !== "absent" && (
                    <button
                      type="button"
                      disabled={submittingOverride}
                      onClick={() => handleMarkAttendance(selectedDayInfo.day, "absent")}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      <UserX size={14} />
                      Mark Absent for Day {selectedDayInfo.day}
                    </button>
                  )}

                  {/* Mark Present Button */}
                  {selectedDayInfo.status !== "present" && (
                    <button
                      type="button"
                      disabled={submittingOverride}
                      onClick={() => handleMarkAttendance(selectedDayInfo.day, "present")}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      <UserCheck size={14} />
                      Mark Present for Day {selectedDayInfo.day}
                    </button>
                  )}

                  {/* Reset to Default Button (if overridden) */}
                  {selectedDayInfo.override && (
                    <button
                      type="button"
                      disabled={submittingOverride}
                      onClick={() => handleResetAttendance(selectedDayInfo.day)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                      title="Remove manual override and restore event assignment status"
                    >
                      <RotateCcw size={14} />
                      Reset to Default
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={() => setSelectedDayInfo(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Shift Confirmation Popup Modal */}
      {shiftConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-99999 p-3 sm:p-5 overflow-hidden overscroll-none">
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md p-5 sm:p-6 border border-gray-100 dark:border-gray-800 space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar" style={{ transform: "translateZ(0)" }}>
            <div className="flex items-center justify-between border-b dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-800 dark:text-white">
                    Authorize {shiftConfirmModal.targetShift === 2 ? "2nd Shift (Double)" : "3rd Shift (Triple)"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Shift Hours Completion Confirmation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShiftConfirmModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Confirmation message banner */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Zap size={14} className="text-amber-600" />
                Shift Hours Completed Confirmation
              </div>
              <p>
                Employee <strong>{selectedUserName}</strong> has completed standard shift hours ({empShiftHour}h) on{" "}
                <strong>
                  {new Date(selectedYear, selectedMonth, shiftConfirmModal.day).toLocaleDateString("default", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>.
              </p>
              <p className="text-[11px] opacity-90">
                Confirm authorizing <strong>{shiftConfirmModal.targetShift === 2 ? "2nd Shift (Double Shift)" : "3rd Shift (Triple Shift)"}</strong> for this employee?
              </p>
            </div>

            {/* Shift details fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Shift Title:
                </label>
                <input
                  type="text"
                  value={shiftConfirmModal.shiftName}
                  onChange={(e) =>
                    setShiftConfirmModal({ ...shiftConfirmModal, shiftName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Total Working Hours to Record (Cumulative):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min={empShiftHour}
                    max="24"
                    value={shiftConfirmModal.hoursWorked}
                    onChange={(e) =>
                      setShiftConfirmModal({
                        ...shiftConfirmModal,
                        hoursWorked: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-400 font-medium">
                    hours
                  </span>
                </div>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 block">
                  Standard: {empShiftHour}h | 2nd Shift: {empShiftHour * 2}h | 3rd Shift: {empShiftHour * 3}h
                </span>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Authorization Remarks / Reason:
                </label>
                <textarea
                  rows={2}
                  value={shiftConfirmModal.reason}
                  onChange={(e) =>
                    setShiftConfirmModal({ ...shiftConfirmModal, reason: e.target.value })
                  }
                  placeholder="e.g. Overtime requested, emergency support completed, extended shift"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-gray-800">
              <button
                type="button"
                onClick={() => setShiftConfirmModal(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingOverride}
                onClick={handleConfirmShift}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check size={14} />
                {submittingOverride ? "Saving..." : `Confirm & Authorize ${shiftConfirmModal.targetShift === 2 ? "2nd" : "3rd"} Shift`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}