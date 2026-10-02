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
    color: "#FFA500", // Amber / Orange
    badgeClass: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300"
  },
  {
    code: "1",
    name: "Confirm/Live",
    label: "Confirm/Live",
    color: "#008000", // Green
    badgeClass: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300"
  },
  {
    code: "2",
    name: "Installation Ongoing",
    label: "Installation Ongoing",
    color: "#8B4513", // Brown / Purple
    badgeClass: "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300"
  },
  {
    code: "3",
    name: "Event Finished",
    label: "Event Finished", // Equivalent to Complete Event
    color: "#87CEEB", // Sky Blue
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300"
  },
  {
    code: "4",
    name: "Cancelled/Postpone",
    label: "Cancelled/Postpone",
    color: "#FF0000", // Red
    badgeClass: "bg-red-50 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300"
  }
];

export const normalizeStatusCode = (rawStatus: any): string => {
  if (rawStatus === null || rawStatus === undefined) return "0";
  const str = String(rawStatus).trim().toLowerCase();
  if (str === "0" || str === "enquriy" || str === "enquiry" || str === "pending") return "0";
  if (str === "1" || str === "confirm/live" || str === "confirm" || str === "confirmed" || str === "live") return "1";
  if (str === "2" || str === "installation ongoing" || str === "installation" || str === "in progress") return "2";
  if (str === "3" || str === "event finished" || str === "finished" || str === "complete" || str === "completed") return "3";
  if (str === "4" || str === "cancelled/postpone" || str === "cancelled" || str === "canceled" || str === "postpone") return "4";
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
  return found ? found.color : "#FFA500";
};

export const getStatusBadgeClass = (rawStatus: any): string => {
  const code = normalizeStatusCode(rawStatus);
  const found = EVENT_STATUSES.find(s => s.code === code);
  return found ? found.badgeClass : "bg-gray-100 text-gray-700 border-gray-300";
};
