import { Navigate, Outlet } from "react-router";
import { useAuth, PermissionModule } from "../hooks/auth";

interface PermissionRouteProps {
  module: PermissionModule;
  requiresEdit?: boolean;
}

export default function PermissionRoute({ module, requiresEdit = false }: PermissionRouteProps) {
  const { canView, canEdit, loading, isAdmin } = useAuth();

  if (loading) {
    return null;
  }

  // System admin bypasses all checks
  if (isAdmin) {
    return <Outlet />;
  }

  const hasAccess = requiresEdit ? canEdit(module) : canView(module);

  if (!hasAccess) {
    // Redirect to events or profile as fallback
    const fallback = canView("events") ? "/events" : "/profile";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

