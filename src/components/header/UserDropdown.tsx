import { useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/auth";
import images from "../../hooks/api/apiImages";
import { User, LogOut } from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isStaff } = useAuth();
  const navigation = useNavigate();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigation("/");
  };

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "A";
  const userPhoto = user?.img ? `${images.baseUrl}/${user.img}` : null;

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400 group cursor-pointer"
        aria-label="User Menu"
      >
        <span className="mr-2.5 overflow-hidden rounded-full h-10 w-10 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
          {userPhoto ? (
            <img
              src={userPhoto}
              alt={user?.name || "User"}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback to initial if image fails to load
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="font-bold text-sm text-brand-600 dark:text-brand-400">
              {userInitial}
            </span>
          )}
        </span>

        <div className="hidden sm:block text-left mr-1">
          <span className="block font-semibold text-theme-sm text-gray-800 dark:text-gray-200 leading-tight">
            {user?.name || (isStaff ? "Staff Member" : "Administrator")}
          </span>
          <span className="block text-[10px] text-gray-400 capitalize">
            {user?.role ? user.role.toLowerCase() : (isStaff ? "Staff" : "Admin")}
          </span>
        </div>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="https://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3.5 shadow-2xl dark:border-gray-800 dark:bg-gray-900 z-99999"
      >
        {/* User Card Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="h-11 w-11 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={user?.name || "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-bold text-base text-brand-600 dark:text-brand-400">
                {userInitial}
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <span className="block font-bold text-gray-800 text-sm dark:text-white truncate">
              {user?.name || (isStaff ? "Staff Member" : "Administrator")}
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || "user@system.com"}
            </span>
            <span className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 uppercase tracking-wider">
              {user?.role || (isStaff ? "STAFF" : "ADMIN")}
            </span>
          </div>
        </div>

        {/* Dropdown Items: ONLY Edit Profile & Logout */}
        <ul className="flex flex-col gap-1 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2.5 font-medium text-gray-700 rounded-xl group text-theme-sm hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white transition"
            >
              <User size={18} className="text-gray-500 group-hover:text-brand-500 dark:text-gray-400 transition" />
              Edit Profile
            </DropdownItem>
          </li>
        </ul>

        {/* Logout */}
        <button
          type="button"
          onClick={() => {
            closeDropdown();
            logout();
          }}
          className="flex items-center gap-3 px-3 py-2.5 mt-2 font-medium text-rose-600 rounded-xl group text-theme-sm hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition cursor-pointer text-left w-full"
        >
          <LogOut size={18} className="text-rose-500 group-hover:text-rose-600 transition" />
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
