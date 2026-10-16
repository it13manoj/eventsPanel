import { useState, useEffect, useMemo, useCallback } from "react";
import apiClient from "./api/apiClient";

export interface ModulePermission {
  view: boolean;
  edit: boolean;
}

export type PermissionModule =
  | "dashboard"
  | "calendar"
  | "events"
  | "templates"
  | "employees"
  | "roles"
  | "attendance"
  | "salary"
  | "inventory"
  | "vehicles"
  | "invoices"
  | "settings";

export type PermissionsMap = Record<string, ModulePermission>;

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role?: string;
  job?: string;
  img?: string;
  contact?: string;
  base_pay?: number;
  sifting_type?: number;
  permissions?: PermissionsMap | string | null;
}

export const ALL_MODULES: { id: PermissionModule; label: string; description: string; iconName?: string }[] = [
  { id: "dashboard", label: "Dashboard", description: "Analytics, available stock overview, and company profile" },
  { id: "calendar", label: "Calendar Booking", description: "Calendar view and event scheduling" },
  { id: "events", label: "Events Management", description: "Manage booked events, status updates, and vehicle/crew assignments" },
  { id: "templates", label: "Event Templates", description: "Manage reusable event dimension and stock templates" },
  { id: "employees", label: "Employees", description: "Manage employee profiles, designations, and system accounts" },
  { id: "roles", label: "Roles & Permissions", description: "Configure system roles and module access control" },
  { id: "attendance", label: "Attendance", description: "Daily attendance logs, check-in/out, and shift tracking" },
  { id: "salary", label: "Salary & Payroll", description: "Salary records, deductions, and payroll calculations" },
  { id: "inventory", label: "Inventory & Warehouses", description: "Warehouses, stock levels, categories, and subcategories" },
  { id: "vehicles", label: "Vehicle Management", description: "Manage transport vehicles, agencies, and owner vehicles" },
  { id: "invoices", label: "Invoices & Billing", description: "Generate and manage customer billing invoices" },
  { id: "settings", label: "Settings", description: "Personal profile and password preferences" },
];

export const DEFAULT_ADMIN_PERMISSIONS: PermissionsMap = {
  dashboard: { view: true, edit: true },
  calendar: { view: true, edit: true },
  events: { view: true, edit: true },
  templates: { view: true, edit: true },
  employees: { view: true, edit: true },
  roles: { view: true, edit: true },
  attendance: { view: true, edit: true },
  salary: { view: true, edit: true },
  inventory: { view: true, edit: true },
  vehicles: { view: true, edit: true },
  invoices: { view: true, edit: true },
  settings: { view: true, edit: true },
};

export const DEFAULT_STAFF_PERMISSIONS: PermissionsMap = {
  dashboard: { view: false, edit: false },
  calendar: { view: false, edit: false },
  events: { view: true, edit: false },
  templates: { view: false, edit: false },
  employees: { view: false, edit: false },
  roles: { view: false, edit: false },
  attendance: { view: true, edit: false },
  salary: { view: true, edit: false },
  inventory: { view: false, edit: false },
  vehicles: { view: false, edit: false },
  invoices: { view: false, edit: false },
  settings: { view: true, edit: false },
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token;
};

export const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getStoredRole = (): string => {
  const storedRole = localStorage.getItem("role");
  if (storedRole) return storedRole.toUpperCase();
  const user = getStoredUser();
  if (user) {
    if (user.role) return user.role.toUpperCase();
    if (user.role_id === 2 || user.role_id === 1) return "ADMIN";
    return "STAFF";
  }
  return "ADMIN";
};

export const getStoredPermissions = (): PermissionsMap | null => {
  try {
    const raw = localStorage.getItem("permissions");
    if (raw) return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    // fallback
  }
  const user = getStoredUser();
  if (user && user.permissions) {
    if (typeof user.permissions === "string") {
      try {
        return JSON.parse(user.permissions);
      } catch {
        return null;
      }
    }
    return user.permissions as PermissionsMap;
  }
  return null;
};

export const isAdminUser = (): boolean => {
  const role = getStoredRole();
  return role === "ADMIN";
};

export const isStaffUser = (): boolean => {
  const role = getStoredRole();
  return role === "STAFF" || role === "USERS" || role === "USER" || role === "DRIVER";
};

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get("/users/findByPk");
      const data = res?.data?.results || res?.data?.data;
      if (data) {
        const roleName = data.role?.role_name || (data.role_id === 2 || data.role_id === 1 ? "ADMIN" : "STAFF");
        const rolePermissions = data.role?.permissions || data.permissions;
        const parsedPermissions: PermissionsMap | null =
          typeof rolePermissions === "string"
            ? JSON.parse(rolePermissions)
            : rolePermissions || null;

        const parsedUser: AuthUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          role_id: data.role_id,
          role: roleName,
          job: data.job,
          img: data.img,
          contact: data.contact,
          base_pay: data.base_pay,
          sifting_type: data.sifting_type,
          permissions: parsedPermissions,
        };

        setUser(parsedUser);
        localStorage.setItem("user", JSON.stringify(parsedUser));
        localStorage.setItem("role", roleName);
        if (parsedPermissions) {
          localStorage.setItem("permissions", JSON.stringify(parsedPermissions));
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const role = user?.role?.toUpperCase() || getStoredRole();
  const isAdmin = role === "ADMIN";
  const isStaff = !isAdmin && role !== "MANAGER";

  const permissions: PermissionsMap | null = useMemo(() => {
    if (user?.permissions) {
      if (typeof user.permissions === "string") {
        try {
          return JSON.parse(user.permissions);
        } catch {
          return null;
        }
      }
      return user.permissions as PermissionsMap;
    }
    return getStoredPermissions();
  }, [user]);

  const canView = useCallback(
    (module: string): boolean => {
      // System ADMIN always has full view access
      if (isAdmin) return true;

      // If permissions matrix is configured for this role
      if (permissions && permissions[module]) {
        return !!permissions[module].view;
      }

      // Default fallback if permissions not explicitly set
      if (role === "MANAGER") {
        return true;
      }

      // Fallback for staff
      const staffAllowed = ["events", "attendance", "salary", "settings"];
      return staffAllowed.includes(module);
    },
    [isAdmin, permissions, role]
  );

  const canEdit = useCallback(
    (module: string): boolean => {
      // System ADMIN always has full edit access
      if (isAdmin) return true;

      // If permissions matrix is configured for this role
      if (permissions && permissions[module]) {
        return !!permissions[module].edit;
      }

      // Default fallback if permissions not explicitly set
      if (role === "MANAGER") {
        // Manager can edit operations, but not system roles
        return module !== "roles";
      }

      return false;
    },
    [isAdmin, permissions, role]
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("permissions");
    setUser(null);
    window.location.href = "/";
  };

  return {
    user,
    role,
    isAdmin,
    isStaff,
    permissions,
    canView,
    canEdit,
    loading,
    logout,
    refreshUser: fetchProfile,
  };
};