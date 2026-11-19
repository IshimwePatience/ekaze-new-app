import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import { Plus } from "lucide-react";
import CreateUserModal from "./CreateUserModal";
import { CreateUserFormPage } from "./CreateUserFormPage";
import { EditUserFormPage } from "./EditUserFormPage";
import { ViewUserFormPage } from "./ViewUserFormPage";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  User,
  UserCheck,
  Search,
  Eye,
  Building2,
  AlertTriangle,
  Star,
  Inbox,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
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
  useWorkers,
  useAvailableWorkers,
  useHiredWorkers,
  useUnavailableWorkers,
  useDeleteWorker,
} from "@/hooks/useWorkers";
import type { Worker } from "@/types/worker.types";
import WorkerDetailsModal from "@/components/admin/WorkerDetailsModal";
import EditUserModal from "@/components/admin/EditUserModal";
import type { UserData } from "@/api/userService";
import { useLanguage } from "@/contexts/LanguageContext";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";

const WorkerManagement = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Edit & Delete states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [workerToDelete, setWorkerToDelete] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteWorkerMutation = useDeleteWorker();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data: allWorkersData, isLoading: isLoadingAll } = useWorkers(currentPage);
  const { data: availableWorkersData, isLoading: isLoadingAvailable } = useAvailableWorkers();
  const { data: hiredWorkersData, isLoading: isLoadingHired } = useHiredWorkers();
  const { data: unavailableWorkersData, isLoading: isLoadingUnavailable } = useUnavailableWorkers();

  const [groupBy, setGroupBy] = useState<"none" | "district" | "sector" | "province">("none");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleViewDetails = (workerId: number) => {
    setSelectedWorkerId(workerId);
    setIsModalOpen(true);
  };

  const getWorkers = (): Worker[] => {
    switch (activeTab) {
      case "available":
        return availableWorkersData?.data?.data || [];
      case "hired":
        return hiredWorkersData?.data?.data || [];
      case "unavailable":
        return unavailableWorkersData?.data?.data || [];
      default:
        return allWorkersData?.data?.data || [];
    }
  };

  if (isCreateModalOpen) {
    return <CreateUserFormPage defaultRole="worker" onBack={() => setIsCreateModalOpen(false)} />;
  }

  if (editingUser) {
    return <EditUserFormPage user={editingUser} userId={editingUser?.id} onBack={() => setEditingUser(null)} />;
  }

  if (isModalOpen && selectedWorkerId) {
    const selectedWorker = getWorkers().find((w) => w.id === selectedWorkerId);
    const workerUser = selectedWorker?.user || {
      id: selectedWorker?.user_id,
      name: `${selectedWorker?.first_name || ""} ${selectedWorker?.last_name || ""}`.trim(),
      phone: selectedWorker?.phone || selectedWorker?.user?.phone,
      national_id: selectedWorker?.user?.national_id,
      role: "worker",
      province: selectedWorker?.province || selectedWorker?.user?.province,
      district: selectedWorker?.district || selectedWorker?.user?.district,
      sector: selectedWorker?.sector || selectedWorker?.user?.sector,
      cell: selectedWorker?.cell || selectedWorker?.user?.cell,
      village: selectedWorker?.village || selectedWorker?.user?.village,
      profile_photo: selectedWorker?.user?.profile_photo,
      is_verified: selectedWorker?.nida_verified || selectedWorker?.user?.is_verified,
      gender: selectedWorker?.gender || selectedWorker?.user?.gender,
      email: selectedWorker?.user?.email,
      status: selectedWorker?.availability_status || "active",
    };
    return (
      <ViewUserFormPage
        user={workerUser}
        userId={selectedWorker?.user_id || selectedWorker?.user?.id}
        onBack={() => {
          setIsModalOpen(false);
          setSelectedWorkerId(null);
        }}
        onEdit={() => {
          setIsModalOpen(false);
          if (workerUser) {
            setEditingUser(workerUser);
          }
        }}
      />
    );
  }

  const filteredWorkers = getWorkers().filter((worker) => {
    const fullName = `${worker.first_name} ${worker.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      worker.id.toString().includes(searchTerm) ||
      worker.user.national_id.includes(searchTerm);
    const matchesType =
      typeFilter === "all" || worker.registration_type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || worker.availability_status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      available: t("admin.workerManagement.available_badge"),
      hired: t("admin.workerManagement.hired_badge"),
      unavailable: t("admin.workerManagement.unavailable_badge"),
      active: t("admin.workerManagement.active_badge"),
      suspended: t("admin.workerManagement.suspended_badge"),
    };
    return statusMap[status] || status;
  };

  const getTypeText = (type: string): { full: string; short: string } => {
    if (type === "company") {
      return {
        full: t("admin.workerManagement.company"),
        short: t("admin.workerManagement.companyShort"),
      };
    } else {
      return {
        full: t("admin.workerManagement.freelance"),
        short: t("admin.workerManagement.freelanceShort"),
      };
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400",
      hired: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-400",
      unavailable: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-400",
      active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400",
      suspended: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-400",
    };
    return styles[status as keyof typeof styles] || "";
  };

  const getStatusCounts = () => {
    const allWorkers = allWorkersData?.data?.data || [];
    const available = availableWorkersData?.data?.data?.length || 0;
    const hired = hiredWorkersData?.data?.data?.length || 0;
    return {
      total: allWorkers.length,
      company: allWorkers.filter((w) => w.registration_type === "company").length,
      freelance: allWorkers.filter((w) => w.registration_type === "freelance").length,
      suspended: allWorkers.filter((w) => w.user.status === "suspended").length,
      available,
      hired,
    };
  };

  const getGroupedWorkers = () => {
    if (groupBy === "none") return null;
    const groups: Record<string, Worker[]> = {};
    filteredWorkers.forEach((worker) => {
      const key =
        groupBy === "province" ? (worker.user.province ?? "Unknown") :
          groupBy === "district" ? (worker.user.district ?? "Unknown") :
            (worker.user.sector ?? "Unknown");
      if (!groups[key]) groups[key] = [];
      groups[key].push(worker);
    });
    return groups;
  };

  const statusCounts = getStatusCounts();

  const isLoading = () => {
    switch (activeTab) {
      case "available":
        return isLoadingAvailable;
      case "hired":
        return isLoadingHired;
      case "unavailable":
        return isLoadingUnavailable;
      default:
        return isLoadingAll;
    }
  };

  // Stats configuration
  const stats = [
    {
      title: t("admin.workerManagement.totalWorkers"),
      value: statusCounts.total.toString(),
      subtitle: t("admin.workerManagement.registered"),
      change: statusCounts.available,
      percentage: t("admin.workerManagement.available"),
      trend: statusCounts.available > 0 ? "up" : "neutral",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      darkBgColor: "dark:bg-purple-950/30",
    },
    {
      title: t("admin.workerManagement.companyWorkers"),
      value: statusCounts.company.toString(),
      subtitle: t("admin.workerManagement.employed"),
      change: statusCounts.hired,
      percentage: t("admin.workerManagement.currentlyHired"),
      trend: "neutral",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      darkBgColor: "dark:bg-blue-950/30",
    },
    {
      title: t("admin.workerManagement.freelancers"),
      value: statusCounts.freelance.toString(),
      subtitle: t("admin.workerManagement.independent"),
      change: statusCounts.available,
      percentage: t("admin.workerManagement.readyToWork"),
      trend: "up",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      darkBgColor: "dark:bg-green-950/30",
    },
    {
      title: t("admin.workerManagement.suspended"),
      value: statusCounts.suspended.toString(),
      subtitle: t("admin.workerManagement.inactive"),
      change: statusCounts.total - statusCounts.suspended,
      percentage: t("admin.workerManagement.activeWorkers"),
      trend: statusCounts.suspended > 0 ? "down" : "up",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      darkBgColor: "dark:bg-red-950/30",
    },
  ];

  const WorkersTable = ({
    workers,
    loading,
  }: {
    workers: Worker[];
    loading: boolean;
  }) => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (workers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <CharacterIllustration type="workers" className="w-36 h-36 mb-4" />
          <h3 className="text-base font-bold text-slate-800 mb-1">{t("admin.workerManagement.noWorkersFound")}</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            {searchTerm || typeFilter !== "all" || statusFilter !== "all"
              ? t("admin.workerManagement.noWorkersMatch")
              : activeTab === "all"
                ? t("admin.workerManagement.noWorkersRegistered")
                : activeTab === "available"
                  ? t("admin.workerManagement.noAvailableWorkers")
                  : activeTab === "hired"
                    ? t("admin.workerManagement.noHiredWorkers")
                    : t("admin.workerManagement.noUnavailableWorkers")}
          </p>
          {(searchTerm || typeFilter !== "all" || statusFilter !== "all") && (
            <Button
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white rounded-lg text-xs font-semibold px-4 h-8"
            >
              {t("admin.workerManagement.clearFilters")}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {activeTab === "all"
              ? t("admin.workerManagement.allWorkers")
              : activeTab === "available"
                ? t("admin.workerManagement.available_tab")
                : activeTab === "hired"
                  ? t("admin.workerManagement.hired_tab")
                  : t("admin.workerManagement.unavailable_tab")}{" "}
            ({workers.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t("admin.workerManagement.worker")}</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Email</TableHead>
                <TableHead className="text-xs hidden md:table-cell">{t("admin.workerManagement.contact")}</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">{t("admin.workerManagement.location")}</TableHead>
                <TableHead className="text-xs">{t("admin.workerManagement.type")}</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">{t("admin.workerManagement.rating")}</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">{t("admin.workerManagement.jobs")}</TableHead>
                <TableHead className="text-xs">{t("admin.workerManagement.status")}</TableHead>
                <TableHead className="text-xs text-right">{t("admin.workerManagement.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker, index) => {
                const typeText = getTypeText(worker.registration_type);
                return (
                  <TableRow
                    key={worker.id}
                    className="animate-in fade-in slide-in-from-left-4 border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-200">
                          <AvatarImage src={worker.user?.profile_photo || undefined} />
                          <AvatarFallback className="p-0 bg-transparent border-none">
                            <DefaultAvatarSVG className="w-full h-full" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            {worker.first_name} {worker.last_name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-3">
                      <p className="text-xs font-semibold text-slate-900 font-sans">
                        {worker.user?.email || "-"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-3">
                      <div className="text-xs">
                        <p className="text-xs font-semibold text-slate-900 font-sans">{worker.user?.phone || "-"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs hidden lg:table-cell font-semibold text-slate-900 font-sans py-3">
                      {worker.user?.district}
                      {worker.user?.sector && `, ${worker.user.sector}`}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs font-semibold text-slate-900 font-sans bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {typeText.full}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3">
                      {parseFloat(worker.average_rating) > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-semibold text-slate-900 font-sans">
                            {parseFloat(worker.average_rating).toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-900 font-sans">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs hidden sm:table-cell font-semibold text-slate-900 font-sans py-3">
                      {worker.total_employments}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {getStatusText(worker.availability_status)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 pr-2 text-right">
                      <CustomDropdown
                        widthClass="w-48"
                        trigger={
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                        items={[
                          {
                            label: "View Details",
                            onClick: () => handleViewDetails(worker.id),
                          },
                          {
                            label: "Logs",
                            onClick: () => {
                              const uId = worker.user_id || worker.user?.id || worker.id;
                              window.open(`/user-logs?user_id=${uId}`, "_blank");
                            },
                          },
                          ...(worker.user
                            ? [
                              {
                                label: "Edit Worker User",
                                onClick: () => {
                                  setEditingUser(worker.user);
                                  setIsEditModalOpen(true);
                                },
                              },
                            ]
                            : []),
                          "separator",
                          {
                            label: "Delete Worker",
                            danger: true,
                            onClick: () => {
                              setWorkerToDelete(worker.id);
                              setIsDeleteModalOpen(true);
                            },
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const tabsConfig = [
    { key: "all", label: t("admin.workerManagement.allWorkers"), count: statusCounts.total },
    { key: "available", label: t("admin.workerManagement.available_tab"), count: statusCounts.available },
    { key: "hired", label: t("admin.workerManagement.hired_tab"), count: statusCounts.hired },
    { key: "unavailable", label: t("admin.workerManagement.unavailable_tab"), count: statusCounts.suspended },
  ];

  if (isCreateModalOpen) {
    return <CreateUserFormPage defaultRole="worker" onBack={() => setIsCreateModalOpen(false)} />;
  }

  if (editingUser) {
    return <EditUserFormPage user={editingUser as any} onBack={() => setEditingUser(null)} />;
  }

  if (isModalOpen && selectedWorkerId) {
    const selectedWorker = filteredWorkers.find((w) => w.id === selectedWorkerId);
    const workerUser = selectedWorker?.user || {
      id: selectedWorkerId,
      name: selectedWorker ? `${selectedWorker.first_name} ${selectedWorker.last_name}` : `Worker #${selectedWorkerId}`,
      phone: selectedWorker?.phone_number || "",
      email: selectedWorker?.email || "",
      role: "worker",
    };
    return (
      <ViewUserFormPage
        user={workerUser as any}
        onBack={() => {
          setIsModalOpen(false);
          setSelectedWorkerId(null);
        }}
        onEdit={() => {
          setIsModalOpen(false);
          setEditingUser(workerUser as any);
        }}
      />
    );
  }

  return (
    <div className="w-full bg-white space-y-0">
      {/* Header */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb title={t("admin.workerManagement.title")}>
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t("admin.workerManagement.registerWorker")}</span>
          </Button>
        </PageHeaderBreadcrumb>
      </div>

      {/* Main YouTube Studio Styled Content Layout */}
      <div className="w-full bg-white border-t border-slate-200">
        {/* Filter Bar */}
        <StudioFilterBar
          categories={[
            {
              id: "type",
              label: "Registration Type",
              options: [
                { value: "all", label: "All Types" },
                { value: "company", label: "Company" },
                { value: "freelance", label: "Freelance" },
              ],
            },
            {
              id: "status",
              label: "Status",
              options: [
                { value: "all", label: "All Status" },
                { value: "available", label: "Available" },
                { value: "hired", label: "Hired" },
                { value: "unavailable", label: "Unavailable" },
              ],
            },
            {
              id: "group",
              label: "Group By Location",
              options: [
                { value: "none", label: "No Grouping" },
                { value: "province", label: "Province" },
                { value: "district", label: "District" },
                { value: "sector", label: "Sector" },
              ],
            },
          ]}
          activeFilters={{
            type: typeFilter,
            status: statusFilter,
            group: groupBy,
          }}
          onFilterChange={(catId, val) => {
            if (catId === "type") setTypeFilter(val);
            if (catId === "status") setStatusFilter(val);
            if (catId === "group") setGroupBy(val as typeof groupBy);
          }}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearAll={() => {
            setSearchTerm("");
            setTypeFilter("all");
            setStatusFilter("all");
            setGroupBy("none");
          }}
        />

        {/* Table Content */}
        <div className="py-2">
          {groupBy !== "none" && !isLoading() ? (
            <div className="space-y-4">
              {Object.entries(getGroupedWorkers() ?? {})
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([groupName, groupWorkers]) => (
                  <div key={groupName}>
                    <div className="flex items-center gap-2 my-3 px-2">
                      <div className="h-px flex-1 bg-slate-200" />
                      <Badge variant="outline" className="text-xs font-semibold capitalize border-slate-300">
                        {groupName} ({groupWorkers.length})
                      </Badge>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    <WorkersTable workers={groupWorkers} loading={false} />
                  </div>
                ))}
            </div>
          ) : (
            <WorkersTable workers={filteredWorkers} loading={isLoading()} />
          )}
        </div>

        <YouTubeStudioPagination
          currentPage={currentPage}
          lastPage={Math.max(1, Math.ceil(filteredWorkers.length / perPage))}
          perPage={perPage}
          total={filteredWorkers.length}
          onPageChange={(page) => setCurrentPage(page)}
          onPerPageChange={(val) => {
            setPerPage(val);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Worker Details Modal */}
      <WorkerDetailsModal
        workerId={selectedWorkerId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWorkerId(null);
        }}
      />
      {/* Create Worker Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultRole="worker"
      />

      {/* Edit Worker User Modal */}
      <EditUserModal
        user={editingUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
      />

      {/* Delete Worker Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 shadow-xl rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Confirm Worker Deletion</DialogTitle>
            <DialogDescription className="text-xs text-slate-600 mt-1">
              Are you sure you want to delete this worker profile? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-xs font-semibold text-slate-700 border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              loading={deleteWorkerMutation.isPending}
              onClick={() => {
                if (workerToDelete) {
                  deleteWorkerMutation.mutate(workerToDelete, {
                    onSuccess: () => {
                      setIsDeleteModalOpen(false);
                      setWorkerToDelete(null);
                    },
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4"
            >
              Delete Worker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerManagement;