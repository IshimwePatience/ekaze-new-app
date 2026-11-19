import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  User,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Ban,
  UserCheck,
  Shield,
  Building2,
  Briefcase,
  HardHat,
  Plus,
  MapPin,
  Filter,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react";

import { CreateUserFormPage } from "./CreateUserFormPage";
import { EditUserFormPage } from "./EditUserFormPage";
import { ViewUserFormPage } from "./ViewUserFormPage";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useUsers,
  useUserStatistics,
  useUsersByRole,
  useUsersByStatus,
  useDeleteUser,
} from "@/hooks/useUsers";
import AssignJurisdictionModal from "./AssignJurisdictionModal";
import type { User as UserType } from "@/types/user.types";
import UserDetailsModal from "./UserDetailsModal";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { StudioFilterBar, FilterCategory } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";

const UserManagement = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<string>("info");

  useEffect(() => {
    const userIdParam = searchParams.get("user_id");
    const openLogsParam = searchParams.get("open_logs");
    if (userIdParam) {
      const parsedId = parseInt(userIdParam, 10);
      if (!isNaN(parsedId)) {
        setSelectedUserId(parsedId);
        setModalInitialTab(openLogsParam === "true" ? "activity" : "info");
        setIsDetailsModalOpen(true);
      }
    }
  }, [searchParams]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCreateRole, setSelectedCreateRole] = useState<string>("employer");
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const deleteUserMutation = useDeleteUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState<string | null>(null);

  const { data: allUsersData, isLoading: isLoadingAll } = useUsers(currentPage, {
    search: searchTerm || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    per_page: perPage,
  });

  const { data: statisticsData } = useUserStatistics();

  // Role-based queries
  const { data: adminsData, isLoading: isLoadingAdmins } = useUsersByRole('admin', {
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    per_page: perPage,
  });

  const { data: companiesData, isLoading: isLoadingCompanies } = useUsersByRole('company', {
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    per_page: perPage,
  });

  const { data: employersData, isLoading: isLoadingEmployers } = useUsersByRole('employer', {
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    per_page: perPage,
  });

  const { data: workersData, isLoading: isLoadingWorkers } = useUsersByRole('worker', {
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    per_page: perPage,
  });

  const { data: policeData, isLoading: isLoadingPolice } = useUsersByRole('police', {
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    per_page: perPage,
  });

  // Status-based queries
  const { data: activeUsersData, isLoading: isLoadingActive } = useUsersByStatus('active', {
    search: searchTerm || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    per_page: perPage,
  });

  const { data: pendingUsersData, isLoading: isLoadingPending } = useUsersByStatus('pending', {
    search: searchTerm || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    per_page: perPage,
  });

  const { data: suspendedUsersData, isLoading: isLoadingSuspended } = useUsersByStatus('suspended', {
    search: searchTerm || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    per_page: perPage,
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    setSelectedUserIds([]);
  };

  const handleViewDetails = (userId: number) => {
    setSelectedUserId(userId);
    setIsDetailsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedUserIds([]);
  };

  const handlePerPageChange = (value: string) => {
    setPerPage(parseInt(value));
    setCurrentPage(1);
    setSelectedUserIds([]);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "admins":
        return adminsData?.data;
      case "companies":
        return companiesData?.data;
      case "employers":
        return employersData?.data;
      case "workers":
        return workersData?.data;
      case "police":
        return policeData?.data;
      case "active":
        return activeUsersData?.data;
      case "pending":
        return pendingUsersData?.data;
      case "suspended":
        return suspendedUsersData?.data;
      default:
        return allUsersData?.data;
    }
  };

  const currentData = getCurrentData();
  const users = currentData?.data || [];



  const pagination = currentData ? {
    current_page: currentData.current_page,
    last_page: currentData.last_page,
    per_page: currentData.per_page,
    total: currentData.total,
    from: (currentData.current_page - 1) * currentData.per_page + 1,
    to: Math.min(currentData.current_page * currentData.per_page, currentData.total),
  } : null;

  const isLoading = () => {
    switch (activeTab) {
      case "admins":
        return isLoadingAdmins;
      case "companies":
        return isLoadingCompanies;
      case "employers":
        return isLoadingEmployers;
      case "workers":
        return isLoadingWorkers;
      case "police":
        return isLoadingPolice;
      case "active":
        return isLoadingActive;
      case "pending":
        return isLoadingPending;
      case "suspended":
        return isLoadingSuspended;
      default:
        return isLoadingAll;
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      active: t("admin.userManagement.active"),
      pending: t("admin.userManagement.pending"),
      suspended: t("admin.userManagement.suspended_badge"),
      inactive: t("admin.userManagement.inactive_badge"),
    };
    return statusMap[status] || status;
  };

  const getRoleText = (role: string): string => {
    const roleMap: Record<string, string> = {
      admin: t("admin.userManagement.admin"),
      company: t("admin.userManagement.company"),
      worker: "Driver",
      employer: t("admin.userManagement.employer"),
    };
    return roleMap[role] || role;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400",
      suspended: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-400",
      inactive: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-400",
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400";
  };


  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-400",
      company: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400",
      worker: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-400",
      employer: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-400",
    };
    return styles[role] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400";
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return Shield;
      case "company":
        return Building2;
      case "employer":
        return Briefcase;
      case "worker":
        return HardHat;
      default:
        return Users;
    }
  };

  const statistics = statisticsData?.data;

  const tabsConfig = [
    { key: "all", label: t("admin.userManagement.allUsers"), count: statistics?.total },
    { key: "active", label: t("admin.userManagement.active_tab"), count: statistics?.by_status?.active },
    { key: "pending", label: t("admin.userManagement.pending_tab"), count: statistics?.by_status?.pending },
    { key: "suspended", label: t("admin.userManagement.suspended_tab"), count: statistics?.by_status?.suspended },
    { key: "companies", label: t("admin.userManagement.companies"), count: statistics?.by_role?.company },
    { key: "admins", label: t("admin.userManagement.admins"), count: statistics?.by_role?.admin },
    { key: "workers", label: "Drivers", count: statistics?.by_role?.worker },
  ];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(users.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelectUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };



  // Pagination component (YouTube Studio style matching Image 1)
  const Pagination = () => {
    if (!pagination || pagination.last_page <= 1) return null;

    return (
      <div className="flex items-center justify-end gap-6 px-4 py-2.5 border-t border-slate-200 bg-white text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
            <SelectTrigger className="h-7 border-none bg-transparent shadow-none text-xs font-semibold focus:ring-0 px-1 gap-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-slate-200">
              <SelectItem value="10" className="text-xs">10</SelectItem>
              <SelectItem value="20" className="text-xs">20</SelectItem>
              <SelectItem value="30" className="text-xs">30</SelectItem>
              <SelectItem value="50" className="text-xs">50</SelectItem>
              <SelectItem value="100" className="text-xs">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          {pagination.from}–{pagination.to} of {pagination.total}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination.current_page === 1}
            className="p-1 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-30"
            title="First page"
          >
            ‹‹
          </button>
          <button
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="p-1 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-30"
            title="Previous page"
          >
            ‹
          </button>
          <button
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            className="p-1 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-30"
            title="Next page"
          >
            ›
          </button>
          <button
            onClick={() => handlePageChange(pagination.last_page)}
            disabled={pagination.current_page === pagination.last_page}
            className="p-1 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-30"
            title="Last page"
          >
            ››
          </button>
        </div>
      </div>
    );
  };

  if (isCreateModalOpen) {
    return (
      <CreateUserFormPage
        defaultRole={selectedCreateRole}
        onBack={() => setIsCreateModalOpen(false)}
      />
    );
  }

  if (editingUser) {
    return <EditUserFormPage user={editingUser} onBack={() => setEditingUser(null)} />;
  }

  if (isDetailsModalOpen && selectedUserId) {
    const selectedUser = users.find((u) => String(u.id) === String(selectedUserId));
    return (
      <ViewUserFormPage
        user={selectedUser}
        userId={selectedUserId}
        onBack={() => {
          setIsDetailsModalOpen(false);
          setSelectedUserId(null);
        }}
        onEdit={() => {
          setIsDetailsModalOpen(false);
          if (selectedUser) {
            setEditingUser(selectedUser);
          }
        }}
      />
    );
  }

  return (
    <div className="w-full bg-white space-y-0">
      {/* Top Header */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb title={t("admin.userManagement.title")}>
          <CustomDropdown
            widthClass="w-48"
            trigger={
              <Button
                size="sm"
                className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t("admin.userManagement.addNewUser")}</span>
              </Button>
            }
            items={[
              { id: "company", label: "Company", onClick: () => { setSelectedCreateRole("company"); setIsCreateModalOpen(true); } },
              { id: "admin", label: "Admin", onClick: () => { setSelectedCreateRole("admin"); setIsCreateModalOpen(true); } },
            ]}
          />
        </PageHeaderBreadcrumb>
      </div>

      {/* Main YouTube Studio Styled Content Layout */}
      <div className="w-full bg-white border-t border-slate-200">

        {/* YouTube Studio Filter & Active Chips Line (White & Blue) */}
        {selectedUserIds.length === 0 ? (
          <StudioFilterBar
            categories={[
              {
                id: "role",
                label: "Role",
                options: [
                  { value: "all", label: "All Roles" },
                  { value: "admin", label: "Admin" },
                  { value: "company", label: "Company" },
                  { value: "worker", label: "Driver" },
                ],
              },
              {
                id: "status",
                label: "Status",
                options: [
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "pending", label: "Pending" },
                  { value: "suspended", label: "Suspended" },
                ],
              },
            ]}
            activeFilters={{
              role: roleFilter,
              status: statusFilter,
            }}
            onFilterChange={(catId, val) => {
              if (catId === "role") setRoleFilter(val);
              if (catId === "status") setStatusFilter(val);
              setCurrentPage(1);
            }}
            searchTerm={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            onClearAll={() => {
              setSearchTerm("");
              setRoleFilter("all");
              setStatusFilter("all");
              setCurrentPage(1);
            }}
          />
        ) : (
          /* YouTube Studio Style Contextual Bulk Action Bar (Matching Image 3) */
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedUserIds([])}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold">
                {selectedUserIds.length} selected
              </span>
              <button
                onClick={() => handleSelectAll(selectedUserIds.length < users.length)}
                className="text-xs text-[#38BDF8] hover:underline font-medium ml-1"
              >
                ({selectedUserIds.length === users.length ? "Deselect all" : "Select all"})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-white hover:bg-slate-800 rounded-lg font-medium"
              >
                Actions
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Table Content Section (Flat YouTube Studio Table) */}
        {isLoading() ? (
          <div className="py-6 space-y-3">
            <Skeleton className="h-9 w-full rounded-none" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-none" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <CharacterIllustration
            type="users"
            title={t("admin.userManagement.noUsersFound")}
            description={
              searchTerm || statusFilter !== "all" || roleFilter !== "all"
                ? t("admin.userManagement.noUsersMatch")
                : t("admin.userManagement.noUsersRegistered")
            }
            action={
              (searchTerm || statusFilter !== "all" || roleFilter !== "all") ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setStatusFilter("all");
                  }}
                  className="rounded-lg border-slate-300 font-medium text-xs h-9"
                >
                  {t("admin.userManagement.clearFilters")}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t("admin.userManagement.addNewUser")}</span>
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[750px] border-collapse">
              <TableHeader className="bg-transparent border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="w-10 pl-2">
                    <Checkbox
                      checked={users.length > 0 && selectedUserIds.length === users.length}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      className="border-slate-400 rounded-sm"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">{t("admin.userManagement.user")}</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">Email</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">{t("admin.userManagement.contact")}</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">{t("admin.userManagement.role")}</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">{t("admin.userManagement.status")}</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">{t("admin.userManagement.verified")}</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">{t("admin.userManagement.location")}</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans text-right pr-2">{t("admin.userManagement.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <TableRow
                      key={user.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/50" : ""
                        }`}
                    >
                      <TableCell className="pl-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelectUser(user.id)}
                          className="border-slate-400 rounded-sm"
                        />
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200">
                            <AvatarImage src={user.profile_photo || undefined} />
                            <AvatarFallback className="p-0 bg-transparent border-none">
                              <DefaultAvatarSVG className="w-full h-full" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 font-sans">{user.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <p className="text-xs font-semibold text-slate-900 font-sans">{user.email}</p>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="text-xs">
                          <p className="text-xs font-semibold text-slate-900 font-sans">{user.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                          {getRoleText(user.role)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                          {getStatusText(user.status)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        {["admin", "police", "supervisor"].includes(user.role?.toLowerCase()) ? (
                          <span className="text-xs font-semibold text-slate-400 font-sans">N/A</span>
                        ) : user.is_verified ? (
                          <div className="flex items-center gap-1 text-slate-900 font-semibold text-xs font-sans">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                            <span>{t("admin.userManagement.verified_yes")}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-500 font-semibold text-xs font-sans">
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t("admin.userManagement.verified_no")}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-900 font-semibold font-sans py-3">
                        {user.district || t("admin.userManagement.notAvailable")}
                      </TableCell>
                      <TableCell className="text-right pr-2 py-3">
                        <CustomDropdown
                          widthClass="w-44"
                          trigger={
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          }
                          items={[
                            { label: "View Details", onClick: () => handleViewDetails(user.id) },
                            { label: "Logs", onClick: () => window.open(`/user-logs?user_id=${user.id}`, "_blank") },
                            { label: "Edit User", onClick: () => setEditingUser(user) },
                            ...(user.role === "police" ? [{ label: "Assign Jurisdiction", onClick: () => setSelectedOfficer({ id: user.id, name: user.name }) }] : []),
                            "separator",
                            { label: "Delete User", danger: true, onClick: () => setUserToDelete(user) },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {pagination && (
          <YouTubeStudioPagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            perPage={perPage}
            total={pagination.total}
            onPageChange={handlePageChange}
            onPerPageChange={(val) => handlePerPageChange(val.toString())}
          />
        )}
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        userId={selectedUserId}
        isOpen={isDetailsModalOpen}
        initialTab={modalInitialTab}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedUserId(null);
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
      />

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong className="text-slate-900">{userToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setUserToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (userToDelete) {
                  deleteUserMutation.mutate(userToDelete.id, {
                    onSuccess: () => setUserToDelete(null),
                  });
                }
              }}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;