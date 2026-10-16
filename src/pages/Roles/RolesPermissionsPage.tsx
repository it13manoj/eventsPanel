import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Shield,
  Key,
  Users,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Search,
  Sparkles,
  Info,
  Calendar,
  ClipboardList,
  LayoutTemplate,
  Truck,
  Warehouse,
  FileText,
  Clock,
  DollarSign,
  Settings,
  LayoutDashboard
} from "lucide-react";
import { toast } from "react-toastify";
import apiClient from "../../hooks/api/apiClient";
import { useAuth, ALL_MODULES, PermissionsMap } from "../../hooks/auth";
import { Modal } from "../../components/ui/modal";

interface RoleItem {
  id: number;
  role_name: string;
  description?: string;
  permissions?: PermissionsMap | string;
  user_count?: number;
  createdAt?: string;
}

const moduleIcons: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard className="w-4 h-4" />,
  calendar: <Calendar className="w-4 h-4" />,
  events: <ClipboardList className="w-4 h-4" />,
  templates: <LayoutTemplate className="w-4 h-4" />,
  employees: <Users className="w-4 h-4" />,
  roles: <ShieldCheck className="w-4 h-4" />,
  attendance: <Clock className="w-4 h-4" />,
  salary: <DollarSign className="w-4 h-4" />,
  inventory: <Warehouse className="w-4 h-4" />,
  vehicles: <Truck className="w-4 h-4" />,
  invoices: <FileText className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
};

export default function RolesPermissionsPage() {
  const { canEdit, isAdmin } = useAuth();
  const hasEditPermission = isAdmin || canEdit("roles");

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [permissionsMatrix, setPermissionsMatrix] = useState<PermissionsMap>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/users/role");
      const data = res?.data?.results || res?.data?.data || [];
      setRoles(data);
    } catch (err: any) {
      console.error("Error fetching roles:", err);
      toast.error(err.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const parsePermissions = (perms: any): PermissionsMap => {
    if (!perms) return {};
    if (typeof perms === "string") {
      try {
        return JSON.parse(perms);
      } catch {
        return {};
      }
    }
    return perms;
  };

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setRoleName("");
    setDescription("");
    // Default matrix with all modules turned off
    const initialMatrix: PermissionsMap = {};
    ALL_MODULES.forEach((m) => {
      initialMatrix[m.id] = { view: false, edit: false };
    });
    setPermissionsMatrix(initialMatrix);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role: RoleItem) => {
    setEditingRole(role);
    setRoleName(role.role_name);
    setDescription(role.description || "");

    const existing = parsePermissions(role.permissions);
    const matrix: PermissionsMap = {};
    ALL_MODULES.forEach((m) => {
      matrix[m.id] = {
        view: existing[m.id]?.view ?? (role.role_name.toUpperCase() === "ADMIN"),
        edit: existing[m.id]?.edit ?? (role.role_name.toUpperCase() === "ADMIN"),
      };
    });
    setPermissionsMatrix(matrix);
    setIsModalOpen(true);
  };

  const handleToggleView = (moduleId: string) => {
    setPermissionsMatrix((prev) => {
      const current = prev[moduleId] || { view: false, edit: false };
      const nextView = !current.view;
      return {
        ...prev,
        [moduleId]: {
          view: nextView,
          // If view is disabled, edit must also be disabled
          edit: nextView ? current.edit : false,
        },
      };
    });
  };

  const handleToggleEdit = (moduleId: string) => {
    setPermissionsMatrix((prev) => {
      const current = prev[moduleId] || { view: false, edit: false };
      const nextEdit = !current.edit;
      return {
        ...prev,
        [moduleId]: {
          // If edit is enabled, view must automatically be enabled
          view: nextEdit ? true : current.view,
          edit: nextEdit,
        },
      };
    });
  };

  const applyPreset = (preset: "admin" | "viewOnly" | "operational" | "clear") => {
    const updated: PermissionsMap = {};
    ALL_MODULES.forEach((m) => {
      if (preset === "admin") {
        updated[m.id] = { view: true, edit: true };
      } else if (preset === "viewOnly") {
        updated[m.id] = { view: true, edit: false };
      } else if (preset === "operational") {
        const ops = ["events", "calendar", "inventory", "vehicles", "attendance"];
        updated[m.id] = ops.includes(m.id)
          ? { view: true, edit: true }
          : { view: false, edit: false };
      } else {
        updated[m.id] = { view: false, edit: false };
      }
    });
    setPermissionsMatrix(updated);
  };

  const handleSubmitRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.warning("Please provide a Role Name");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        role_name: roleName.trim().toUpperCase(),
        description: description.trim(),
        permissions: permissionsMatrix,
      };

      if (editingRole) {
        await apiClient.put(`/users/role/${editingRole.id}`, payload);
        toast.success(`Role "${payload.role_name}" updated successfully!`);
      } else {
        await apiClient.post("/users/role/create", payload);
        toast.success(`Role "${payload.role_name}" created successfully!`);
      }

      setIsModalOpen(false);
      fetchRoles();
    } catch (err: any) {
      console.error("Error saving role:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to save role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (role: RoleItem) => {
    if (role.role_name.toUpperCase() === "ADMIN") {
      toast.error("The system ADMIN role cannot be deleted.");
      return;
    }
    if ((role.user_count || 0) > 0) {
      toast.warning(
        `Cannot delete role "${role.role_name}". There are ${role.user_count} employee(s) currently assigned. Please reassign them first.`
      );
      return;
    }
    setRoleToDelete(role);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/users/role/${roleToDelete.id}`);
      toast.success(`Role "${roleToDelete.role_name}" removed successfully!`);
      setDeleteModalOpen(false);
      setRoleToDelete(null);
      fetchRoles();
    } catch (err: any) {
      console.error("Error deleting role:", err);
      toast.error(err.response?.data?.message || "Failed to delete role");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return roles;
    const q = searchQuery.toLowerCase();
    return roles.filter(
      (r) =>
        r.role_name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
    );
  }, [roles, searchQuery]);

  // Statistics
  const totalEmployees = useMemo(
    () => roles.reduce((sum, r) => sum + (r.user_count || 0), 0),
    [roles]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Roles & Permissions
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Access Control
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure system roles, access levels, and granular view and edit capabilities across all modules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasEditPermission && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Role</span>
            </button>
          )}
        </div>
      </div>

      {/* Permission Mode Alert Banner if View-Only */}
      {!hasEditPermission && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
          <Info className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">View-Only Mode:</span> You have permission to inspect system roles and configured privileges, but only administrators can create, modify, or delete roles.
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Defined Roles
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{roles.length}</span>
            <span className="text-xs text-gray-400">active roles</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Assigned Staff
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalEmployees}</span>
            <span className="text-xs text-gray-400">employees mapped</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Protected System Roles
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {roles.filter((r) => r.role_name.toUpperCase() === "ADMIN").length || 1}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Full privilege</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total System Modules
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{ALL_MODULES.length}</span>
            <span className="text-xs text-gray-400">configurable modules</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search roles or descriptions..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-xs"
        />
      </div>

      {/* Role Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 animate-pulse space-y-4"
            >
              <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-700/60 rounded"></div>
              <div className="h-16 bg-gray-50 dark:bg-gray-700/30 rounded-xl"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60">
          <ShieldCheck className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">No roles found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {searchQuery ? "Try refining your search keyword" : "Create a role to configure module permissions"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => {
            const perms = parsePermissions(role.permissions);
            const isSystemAdmin = role.role_name.toUpperCase() === "ADMIN";

            let viewCount = 0;
            let editCount = 0;
            ALL_MODULES.forEach((m) => {
              if (isSystemAdmin || perms[m.id]?.view) viewCount++;
              if (isSystemAdmin || perms[m.id]?.edit) editCount++;
            });

            return (
              <div
                key={role.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/70 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600/60 transition-all duration-200"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                          {role.role_name}
                        </h3>
                        {isSystemAdmin ? (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                            Super Admin
                          </span>
                        ) : role.role_name.toUpperCase() === "MANAGER" ? (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            Manager
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Custom Role
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[32px]">
                        {role.description || "No description provided for this role."}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 shrink-0">
                      {isSystemAdmin ? <Lock className="w-5 h-5 text-purple-500" /> : <Key className="w-5 h-5 text-indigo-500" />}
                    </div>
                  </div>

                  {/* Employees Count Badge */}
                  <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-gray-50/80 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-750">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>Assigned Staff</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {role.user_count || 0} {role.user_count === 1 ? "Employee" : "Employees"}
                    </span>
                  </div>

                  {/* Permission Metrics */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400">View Access</div>
                      <div className="text-lg font-bold text-blue-900 dark:text-blue-200 mt-0.5">
                        {isSystemAdmin ? "All (12)" : `${viewCount} / ${ALL_MODULES.length}`}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                      <div className="text-xs font-medium text-purple-600 dark:text-purple-400">Edit Access</div>
                      <div className="text-lg font-bold text-purple-900 dark:text-purple-200 mt-0.5">
                        {isSystemAdmin ? "All (12)" : `${editCount} / ${ALL_MODULES.length}`}
                      </div>
                    </div>
                  </div>

                  {/* Enabled Modules Pills preview */}
                  <div className="mt-4">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Permitted Modules
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {ALL_MODULES.map((m) => {
                        const hasView = isSystemAdmin || perms[m.id]?.view;
                        const hasEdit = isSystemAdmin || perms[m.id]?.edit;
                        if (!hasView) return null;
                        return (
                          <span
                            key={m.id}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                              hasEdit
                                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {moduleIcons[m.id]}
                            <span>{m.label}</span>
                            {hasEdit && <span className="text-[9px] font-bold text-indigo-500 uppercase">Edit</span>}
                          </span>
                        );
                      })}
                      {viewCount === 0 && (
                        <span className="text-xs text-gray-400 italic">No modules enabled</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditModal(role)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{hasEditPermission ? "Configure Permissions" : "View Permissions"}</span>
                  </button>

                  {hasEditPermission && !isSystemAdmin && (
                    <button
                      onClick={() => handleOpenDelete(role)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer"
                      title={
                        (role.user_count || 0) > 0
                          ? "Cannot delete role with assigned employees"
                          : "Delete Role"
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Role Creation / Editing Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-4xl w-full mx-auto p-0 rounded-2xl sm:rounded-3xl overflow-hidden [&>button]:hidden shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 text-white shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {editingRole ? `Configure Role: ${editingRole.role_name}` : "Create New Role & Permissions"}
              </h2>
              <p className="text-xs text-blue-100">
                Grant or restrict view and edit access across all system sections
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmitRole} className="flex flex-col flex-1 min-h-0 bg-white dark:bg-gray-900">
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-130px)]">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  disabled={editingRole?.role_name.toUpperCase() === "ADMIN" || !hasEditPermission}
                  placeholder="e.g. OPERATIONS_COORDINATOR"
                  className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none transition disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
                {editingRole?.role_name.toUpperCase() === "ADMIN" && (
                  <p className="text-[11px] text-gray-400 mt-1">Built-in system role name cannot be renamed.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Role Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!hasEditPermission}
                  placeholder="e.g. Handles warehouse equipment checks and calendar booking"
                  className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>

            {/* Quick Action Presets (only shown when editing is allowed) */}
            {hasEditPermission && (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Quick Permission Presets:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset("admin")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 transition cursor-pointer"
                  >
                    Select All (Full Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("operational")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition cursor-pointer"
                  >
                    Operational Only
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("viewOnly")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition cursor-pointer"
                  >
                    View Only All
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("clear")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 transition cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Permissions Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-500" />
                  <span>Module Permission Matrix</span>
                </h3>
                <span className="text-xs text-gray-400">
                  Enabling Edit automatically grants View access
                </span>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-xs divide-y divide-gray-100 dark:divide-gray-800">
                {ALL_MODULES.map((module) => {
                  const state = permissionsMatrix[module.id] || { view: false, edit: false };
                  const isViewActive = !!state.view;
                  const isEditActive = !!state.edit;

                  return (
                    <div
                      key={module.id}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition"
                    >
                      {/* Module Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`p-2.5 rounded-xl shrink-0 ${
                            isViewActive
                              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                          }`}
                        >
                          {moduleIcons[module.id]}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>{module.label}</span>
                            {isEditActive ? (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                                Full Control
                              </span>
                            ) : isViewActive ? (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                View Only
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-500 dark:bg-gray-800">
                                No Access
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      {/* View & Edit Switches */}
                      <div className="flex items-center gap-4 shrink-0 sm:self-center self-end pt-2 sm:pt-0">
                        {/* View Switch */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            View
                          </span>
                          <input
                            type="checkbox"
                            checked={isViewActive}
                            onChange={() => handleToggleView(module.id)}
                            disabled={!hasEditPermission}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>

                        {/* Edit Switch */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            Edit
                          </span>
                          <input
                            type="checkbox"
                            checked={isEditActive}
                            onChange={() => handleToggleEdit(module.id)}
                            disabled={!hasEditPermission}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              Cancel
            </button>
            {hasEditPermission && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Saving Role...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingRole ? "Update Role Permissions" : "Save New Role"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        className="max-w-md w-full mx-auto p-0 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        <div className="p-6 text-center space-y-4 bg-white dark:bg-gray-900">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Role</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Are you sure you want to delete role{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                "{roleToDelete?.role_name}"
              </span>
              ? This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 disabled:opacity-50 transition cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Role"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

