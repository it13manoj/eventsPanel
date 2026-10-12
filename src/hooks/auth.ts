import { useState, useEffect } from "react";
import apiClient from "./api/apiClient";

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
}

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
    if (user.role_id === 2) return "ADMIN";
    return "STAFF";
  }
  return "ADMIN"; // Fallback to ADMIN if no user info yet
};

export const isAdminUser = (): boolean => {
  const role = getStoredRole();
  return role === "ADMIN" || role === "MANAGER";
};

export const isStaffUser = (): boolean => {
  const role = getStoredRole();
  return role === "STAFF" || role === "USERS" || role === "USER";
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
        const roleName = data.role?.role_name || (data.role_id === 2 ? "ADMIN" : "STAFF");
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
        };

        setUser(parsedUser);
        localStorage.setItem("user", JSON.stringify(parsedUser));
        localStorage.setItem("role", roleName);
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
  const isAdmin = role === "ADMIN" || role === "MANAGER";
  const isStaff = !isAdmin;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    window.location.href = "/";
  };

  return {
    user,
    role,
    isAdmin,
    isStaff,
    loading,
    logout,
    refreshUser: fetchProfile,
  };
};