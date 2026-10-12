import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/auth";

export default function AdminRoute() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return null;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/events" replace />;
}

