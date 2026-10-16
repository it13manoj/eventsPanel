import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  ChevronDownIcon,
  HorizontaLDots,
} from "../icons";
import { Users, LayoutDashboard, CalendarDays, Warehouse, ClipboardList, Settings, User, LayoutTemplate } from "lucide-react";
import { Truck, FileText } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { useAuth } from "../hooks/auth";
import { useCompany } from "../hooks/useCompany";
import images from "../hooks/api/apiImages";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { canView, isStaff } = useAuth();
  const { company } = useCompany();
  const location = useLocation();

  const currentNavItems = useMemo(() => {
    const items: NavItem[] = [];

    // Dashboard
    if (canView("dashboard")) {
      items.push({
        icon: <LayoutDashboard />,
        name: "Dashboard",
        subItems: [
          { name: "Company Profile", path: "/companyprofile", pro: false },
          { name: "Available Stock", path: "/availablestock", pro: false },
        ],
      });
    }

    // Calendar Booking
    if (canView("calendar")) {
      items.push({
        icon: <CalendarDays />,
        name: "Calendar Booking",
        path: "/calendar",
      });
    }

    // Events List
    if (canView("events")) {
      items.push({
        icon: <ClipboardList />,
        name: "Events List",
        path: "/events",
      });
    }

    // Event Templates
    if (canView("templates")) {
      items.push({
        icon: <LayoutTemplate />,
        name: "Event Templates",
        path: "/templates",
      });
    }

    // Employee section (Employee List, Roles & Permissions, Attendance, Salary)
    const empSub: { name: string; path: string; pro?: boolean }[] = [];
    if (canView("employees")) {
      empSub.push({ name: "Employee List", path: "/employeelist", pro: false });
    }
    if (canView("roles")) {
      empSub.push({ name: "Roles & Permissions", path: "/roles-permissions", pro: false });
    }
    if (canView("attendance")) {
      empSub.push({ name: "Attendance", path: "/attendance", pro: false });
    }
    if (canView("salary")) {
      empSub.push({ name: "Salary", path: "/salary", pro: false });
    }

    if (empSub.length > 0) {
      items.push({
        icon: <Users />,
        name: "Employee",
        subItems: empSub,
      });
    }

    // Inventory
    if (canView("inventory")) {
      items.push({
        icon: <Warehouse />,
        name: "Inventory",
        subItems: [
          { name: "Ware House", path: "/wherehouse", pro: false },
          { name: "Ware House List", path: "/warehouselist", pro: false },
          { name: "Stock", path: "/stock", pro: false },
          { name: "Category", path: "/category", pro: false },
          { name: "Sub Category", path: "/sub-category", pro: false },
        ],
      });
    }

    // Vehicle Management
    if (canView("vehicles")) {
      items.push({
        icon: <Truck />,
        name: "Vehicle Management",
        subItems: [
          { name: "Vehicle Types", path: "/addvehicle", pro: false },
          { name: "Owner Vehicle", path: "/owner-vahicle", pro: false },
          { name: "Agency Vehicle", path: "/agency-vehicle", pro: false },
          { name: "Vehicle", path: "/vehicle", pro: false },
        ],
      });
    }

    // Invoice
    if (canView("invoices")) {
      items.push({
        icon: <FileText />,
        name: "Invoice",
        subItems: [{ name: "Invoice List", path: "/invoicelist", pro: false }],
      });
    }

    // My Profile (accessible to all logged in users)
    items.push({
      icon: <User />,
      name: "My Profile",
      path: "/profile",
    });

    // Setting
    if (canView("settings")) {
      items.push({
        icon: <Settings />,
        name: "Setting",
        path: "/setting",
      });
    }

    return items;
  }, [canView]);

  const currentOthersItems: NavItem[] = [];

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? currentNavItems : currentOthersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-4 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to={isStaff ? "/events" : "/dashboard"} className="flex items-center gap-2">
          {company?.logo ? (
            isExpanded || isHovered || isMobileOpen ? (
              <div className="flex items-center gap-2.5 px-2">
                <img
                  src={`${images.baseUrl}/${company.logo}`}
                  alt={company.companyName || "Logo"}
                  className="max-h-10 max-w-[140px] object-contain rounded-md"
                />
                {company.companyName && (
                  <span className="font-extrabold text-sm text-gray-800 dark:text-white truncate max-w-[90px]">
                    {company.companyName}
                  </span>
                )}
              </div>
            ) : (
              <img
                src={`${images.baseUrl}/${company.logo}`}
                alt={company.companyName || "Logo"}
                className="w-8 h-8 object-contain rounded-md"
              />
            )
          ) : isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo1.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(currentNavItems, "main")}
            </div>
            {!isStaff && currentOthersItems.length > 0 && (
              <div className="">
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    ""
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(currentOthersItems, "others")}
              </div>
            )}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
