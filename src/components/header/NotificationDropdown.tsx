import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router";
import apiClient from "../../hooks/api/apiClient";
import { normalizeStatusCode } from "../../utils/eventStatus";
import {
  Bell,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  CheckCheck,
  ChevronRight,
  Layers
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "today" | "upcoming" | "template" | "completed" | "info";
  path: string;
  read: boolean;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("read_notifications");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const navigate = useNavigate();

  const fetchDynamicNotifications = async () => {
    try {
      const res = await apiClient.get("admin/Events/find");
      const events: any[] = res?.data?.results || [];

      const todayStr = new Date().toISOString().split("T")[0];
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const items: NotificationItem[] = [];

      events.forEach((ev: any) => {
        if (!ev || !ev.id) return;
        const evDateStr = ev.doe ? new Date(ev.doe).toISOString().split("T")[0] : null;

        // 1. Event Today
        if (evDateStr === todayStr) {
          items.push({
            id: `today-${ev.id}`,
            title: `Event Today: ${ev.c_name || "Client Event"}`,
            message: `Event active today at ${ev.vanus || "Venue"}${ev.v_location ? ` (${ev.v_location})` : ""}.`,
            time: "Today",
            type: "today",
            path: "/events",
            read: readIds.includes(`today-${ev.id}`),
          });
        }
        // 2. Upcoming in next 4 days
        else if (ev.doe) {
          const evDate = new Date(ev.doe);
          evDate.setHours(0, 0, 0, 0);
          const diffDays = Math.round((evDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays > 0 && diffDays <= 4) {
            items.push({
              id: `upcoming-${ev.id}`,
              title: `Upcoming Event: ${ev.c_name || "Client"}`,
              message: `Scheduled in ${diffDays} day${diffDays > 1 ? "s" : ""} (${new Date(ev.doe).toLocaleDateString()}) at ${ev.vanus || "Venue"}.`,
              time: `in ${diffDays}d`,
              type: "upcoming",
              path: "/calendar",
              read: readIds.includes(`upcoming-${ev.id}`),
            });
          }
        }

        // 3. Template package applied
        if (ev.template_name && items.length < 12) {
          items.push({
            id: `tpl-${ev.id}`,
            title: `Package: ${ev.template_name}`,
            message: `Event #${ev.id} (${ev.c_name}) configured with "${ev.template_name}" package.`,
            time: "Template",
            type: "template",
            path: "/events",
            read: readIds.includes(`tpl-${ev.id}`),
          });
        }

        // 4. Completed Event Notification
        if (normalizeStatusCode(ev.status) === "4" && items.length < 15) {
          items.push({
            id: `completed-${ev.id}`,
            title: `Event Finished #${ev.id}`,
            message: `${ev.c_name} at ${ev.vanus || "Venue"} successfully finished. Invoice ready.`,
            time: "Finished",
            type: "completed",
            path: "/invoicelist",
            read: readIds.includes(`completed-${ev.id}`),
          });
        }
      });

      // If no events match, provide a helpful general alert
      if (items.length === 0) {
        items.push({
          id: "welcome-system",
          title: "System Ready",
          message: "All events, fleet movements, and team assignments are up to date.",
          time: "Now",
          type: "info",
          path: "/calendar",
          read: readIds.includes("welcome-system"),
        });
      }

      setNotifications(items);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchDynamicNotifications();
    const interval = setInterval(fetchDynamicNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    localStorage.setItem("read_notifications", JSON.stringify(updated));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.read) {
      const updated = Array.from(new Set([...readIds, item.id]));
      setReadIds(updated);
      localStorage.setItem("read_notifications", JSON.stringify(updated));
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
    }
    closeDropdown();
    navigate(item.path);
  };

  const renderIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "today":
        return (
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 shrink-0">
            <Sparkles size={16} />
          </div>
        );
      case "upcoming":
        return (
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shrink-0">
            <Calendar size={16} />
          </div>
        );
      case "template":
        return (
          <div className="p-2 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 shrink-0">
            <Layers size={16} />
          </div>
        );
      case "completed":
        return (
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 shrink-0">
            <CheckCircle2 size={16} />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 shrink-0">
            <AlertCircle size={16} />
          </div>
        );
    }
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 z-10 flex h-5 min-w-5 items-center justify-center px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <Bell size={20} className={unreadCount > 0 ? "text-gray-800 dark:text-white" : ""} />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[120px] sm:-right-8 lg:right-0 mt-[17px] flex h-[500px] w-[340px] sm:w-[380px] flex-col rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-800 dark:bg-gray-900 z-99999"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h5 className="text-base font-bold text-gray-900 dark:text-white">
              Notifications
            </h5>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                title="Mark all as read"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition cursor-pointer"
              >
                <CheckCheck size={14} />
                Mark read
              </button>
            )}
            <button
              onClick={closeDropdown}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List of dynamic notifications */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100 dark:divide-gray-800/60 pr-1">
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`flex items-start gap-3 p-3 rounded-xl transition cursor-pointer my-1 ${
                  item.read
                    ? "hover:bg-gray-50 dark:hover:bg-gray-800/40 opacity-75"
                    : "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/30"
                }`}
              >
                {renderIcon(item.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                <ChevronRight size={14} className="text-gray-400 self-center shrink-0" />
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-gray-400">
              <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="text-xs font-semibold">You're all caught up!</p>
              <p className="text-[11px] text-gray-500 mt-0.5">No new alerts at this time.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
          <button
            onClick={() => {
              closeDropdown();
              navigate("/events");
            }}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
          >
            View All Events & Fleet Movements →
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
