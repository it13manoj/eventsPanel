export interface EventStatusOption {
  code: string;
  name: string;
  label: string;
  color: string;
  badgeClass: string;
}

export const EVENT_STATUSES: EventStatusOption[] = [
  {
    code: "0",
    name: "Enquiry",
    label: "Enquiry",
    color: "#F59E0B", // Amber / Warm Orange
    badgeClass: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300"
  },
  {
    code: "1",
    name: "Confirm",
    label: "Confirm",
    color: "#3B82F6", // Royal Blue
    badgeClass: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300"
  },
  {
    code: "2",
    name: "Installation",
    label: "Installation",
    color: "#8B5CF6", // Purple / Indigo
    badgeClass: "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300"
  },
  {
    code: "3",
    name: "Event Ongoing/ Live",
    label: "Event Ongoing/ Live",
    color: "#10B981", // Vivid Emerald Green
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300"
  },
  {
    code: "4",
    name: "Event Finished",
    label: "Event Finished",
    color: "#06B6D4", // Cyan / Teal
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300"
  },
  {
    code: "5",
    name: "Cancelled",
    label: "Cancelled",
    color: "#EF4444", // Red / Crimson
    badgeClass: "bg-red-50 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300"
  },
  {
    code: "6",
    name: "Postpone",
    label: "Postpone",
    color: "#6B7280", // Slate / Neutral Gray
    badgeClass: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300"
  }
];

export const normalizeStatusCode = (rawStatus: any): string => {
  if (rawStatus === null || rawStatus === undefined) return "0";
  const str = String(rawStatus).trim().toLowerCase();

  // 0: Enquiry
  if (str === "0" || str === "enquiry" || str === "enquriy" || str === "pending") return "0";

  // 1: Confirm
  if (str === "1" || str === "confirm" || str === "confirmed") return "1";

  // 2: Installation
  if (str === "2" || str === "installation" || str === "installation ongoing" || str === "installing") return "2";

  // 3: Event Ongoing/ Live
  if (
    str === "3" ||
    str === "event ongoing/ live" ||
    str === "event ongoing/live" ||
    str === "event ongoing" ||
    str === "ongoing" ||
    str === "live" ||
    str === "confirm/live"
  ) {
    return "3";
  }

  // 4: Event Finished (Complete Event)
  if (
    str === "4" ||
    str === "event finished" ||
    str === "finished" ||
    str === "complete" ||
    str === "completed"
  ) {
    return "4";
  }

  // 5: Cancelled
  if (str === "5" || str === "cancelled" || str === "canceled") return "5";

  // 6: Postpone
  if (str === "6" || str === "postpone" || str === "postponed" || str === "cancelled/postpone") return "6";

  return "0";
};

export const getStatusLabel = (rawStatus: any): string => {
  const code = normalizeStatusCode(rawStatus);
  const found = EVENT_STATUSES.find(s => s.code === code);
  return found ? found.label : "Enquiry";
};

export const getStatusColor = (rawStatus: any): string => {
  const code = normalizeStatusCode(rawStatus);
  const found = EVENT_STATUSES.find(s => s.code === code);
  return found ? found.color : "#F59E0B";
};

export const getStatusBadgeClass = (rawStatus: any): string => {
  const code = normalizeStatusCode(rawStatus);
  const found = EVENT_STATUSES.find(s => s.code === code);
  return found ? found.badgeClass : "bg-gray-100 text-gray-700 border-gray-300";
};

export const isEventLocked = (rawStatus: any): boolean => {
  const code = normalizeStatusCode(rawStatus);
  // Event Finished ("4") and Cancelled ("5") cannot be edited or modified
  return code === "4" || code === "5";
};
