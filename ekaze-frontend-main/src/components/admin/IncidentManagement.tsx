import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import IncidentGeoMap from "./IncidentGeoMap";
import { Map } from "lucide-react";
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
  AlertTriangle,
  Search,
  Eye,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  FileText,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Paperclip,
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
  useIncidents,
  useIncidentStatistics,
  useDeleteIncident,
} from "@/hooks/useIncidents";
import { useAuth } from "@/hooks/useAuth";
import type { Incident } from "@/types/incident.types";
import IncidentDetailsModal from "./IncidentDetailsModal";
import AddProofFilesModal from "./AddProofFilesModal";
import { getHtmlSummary } from "@/lib/stringUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";

const getMediaUrl = (path?: string | null): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const baseUrl = "http://localhost:5000";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

const getInitials = (name?: string): string => {
  if (!name || name === "—") return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const IncidentManagement = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isSupervisor = user?.role?.toLowerCase() === "supervisor";
  const districtName = user?.district || (isSupervisor ? "Gasabo" : null);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"all" | "map">("all");
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [selectedIncidentForFiles, setSelectedIncidentForFiles] = useState<{ id: number; number: string } | null>(null);

  // Delete incident states
  const [incidentToDelete, setIncidentToDelete] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteIncidentMutation = useDeleteIncident();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Unified incident fetch with filters
  const { data: incidentsResponse, isLoading: isLoadingIncidents } = useIncidents(currentPage, {
    status: statusFilter !== "all" ? statusFilter : undefined,
    incident_type: typeFilter !== "all" ? typeFilter : undefined,
    search: searchTerm || undefined,
    per_page: perPage,
  });

  const { data: statisticsData } = useIncidentStatistics();
  const statistics = statisticsData?.data;

  const handleTabChange = (value: string) => {
    setActiveTab(value as "all" | "map");
  };

  const handleViewDetails = (incidentId: number) => {
    setSelectedIncidentId(incidentId);
    setIsDetailsModalOpen(true);
  };

  // Robust array extraction supporting both flat array & paginated structures
  const allIncidents: Incident[] = useMemo(() => {
    if (!incidentsResponse) return [];
    const payload: any = incidentsResponse;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.data?.data)) return payload.data.data;
    return [];
  }, [incidentsResponse]);

  // Client-side safety filter matching current search and filters
  const filteredIncidents = useMemo(() => {
    return allIncidents.filter((incident: Incident) => {
      if (statusFilter !== "all" && incident.status !== statusFilter) {
        return false;
      }
      if (typeFilter !== "all" && incident.incident_type !== typeFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const num = (incident.incident_number || "").toLowerCase();
        const desc = (incident.description || "").toLowerCase();
        const title = (incident.title || "").toLowerCase();
        const loc = (incident.incident_location || "").toLowerCase();
        const workerName = `${incident.worker?.user?.name || ""} ${incident.worker?.first_name || ""} ${incident.worker?.last_name || ""}`.toLowerCase();
        const empName = `${incident.employer?.user?.name || ""} ${incident.reporter?.name || ""}`.toLowerCase();

        return (
          num.includes(query) ||
          desc.includes(query) ||
          title.includes(query) ||
          loc.includes(query) ||
          workerName.includes(query) ||
          empName.includes(query)
        );
      }
      return true;
    });
  }, [allIncidents, statusFilter, typeFilter, searchTerm]);

  // Paginated incidents for the table view
  const paginatedIncidents = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredIncidents.slice(start, start + perPage);
  }, [filteredIncidents, currentPage, perPage]);

  const getSeverityText = (severity: string): string => {
    const severityMap: Record<string, string> = {
      critical: t("admin.incidentManagement.critical"),
      high: t("admin.incidentManagement.high"),
      medium: t("admin.incidentManagement.medium"),
      low: t("admin.incidentManagement.low"),
    };
    return severityMap[severity] || severity;
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      reported: t("admin.incidentManagement.reported_status"),
      under_investigation: t("admin.incidentManagement.under_investigation"),
      resolved: t("admin.incidentManagement.resolved_status"),
      dismissed: t("admin.incidentManagement.dismissed_status"),
      escalated: t("admin.incidentManagement.escalated_status"),
    };
    return statusMap[status] || status;
  };

const getIncidentTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    theft: t("admin.incidentManagement.theft"),
    violence: t("admin.incidentManagement.violence"),
    negligence: t("admin.incidentManagement.negligence"),
    breach_of_contract: t("admin.incidentManagement.breach_of_contract"),
    misconduct: t("admin.incidentManagement.misconduct"),
    non_payment: "Non-Payment",
    unsafe_conditions: "Unsafe Conditions",
    harassment: "Harassment",
    wrongful_termination: "Wrongful Termination",
    other: t("admin.incidentManagement.other"),
  };
  return typeMap[type] || type;
};

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-400",
      high: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-400",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400",
      low: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-400",
    };
    return styles[severity as keyof typeof styles] || "";
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      reported: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-400",
      under_investigation: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400",
      resolved: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400",
      dismissed: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-400",
      escalated: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-400",
    };
    return styles[status as keyof typeof styles] || "";
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-3 h-3 text-red-600" />;
      case "high":
        return <AlertTriangle className="w-3 h-3 text-orange-600" />;
      case "medium":
        return <Clock className="w-3 h-3 text-yellow-600" />;
      default:
        return <CheckCircle2 className="w-3 h-3 text-blue-600" />;
    }
  };

  // Stats configuration
  const stats = [
    {
      title: t("admin.incidentManagement.reported"),
      value: (statistics?.by_status.reported || 0).toString(),
      subtitle: t("admin.incidentManagement.newIncidents"),
      change: statistics?.today || 0,
      percentage: "Today",
      trend: "neutral",
      icon: FileText,
      color: "text-red-600",
      bgColor: "bg-red-50",
      darkBgColor: "dark:bg-red-950/30",
    },
    {
      title: t("admin.incidentManagement.investigating"),
      value: (statistics?.by_status.under_investigation || 0).toString(),
      subtitle: t("admin.incidentManagement.inProgress"),
      change: statistics?.open_cases || 0,
      percentage: "Open cases",
      trend: "neutral",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      darkBgColor: "dark:bg-yellow-950/30",
    },
    {
      title: t("admin.incidentManagement.resolved"),
      value: (statistics?.by_status.resolved || 0).toString(),
      subtitle: t("admin.incidentManagement.completed"),
change: statistics?.this_month || 0,
percentage: "This month",
      trend: "up",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      darkBgColor: "dark:bg-green-950/30",
    },
    {
      title: t("admin.incidentManagement.dismissed"),
      value: (statistics?.by_status.dismissed || 0).toString(),
change: statistics?.this_week || 0,
      percentage: t("admin.incidentManagement.lowSeverity"),
      trend: "neutral",
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      darkBgColor: "dark:bg-gray-950/30",
    },
    {
      title: t("admin.incidentManagement.escalated"),
      value: (statistics?.by_status.escalated || 0).toString(),
      subtitle: t("admin.incidentManagement.priorityCases"),
change: statistics?.unassigned || 0,
percentage: "Unassigned",
trend: (statistics?.by_status.escalated || 0) > 0 ? "down" : "up",
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      darkBgColor: "dark:bg-purple-950/30",
    },
  ];

  const IncidentsTable = ({
    incidents,
    loading,
  }: {
    incidents: Incident[];
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

    if (incidents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <CharacterIllustration type="incidents" className="w-36 h-36 mb-4" />
          <h3 className="text-base font-bold text-slate-800 mb-1">{t("admin.incidentManagement.noIncidentsFound")}</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            {searchTerm || typeFilter !== "all" || statusFilter !== "all"
              ? t("admin.incidentManagement.noIncidentsMatch")
              : t("admin.incidentManagement.noIncidentsReported")}
          </p>
          {(searchTerm || typeFilter !== "all" || statusFilter !== "all") && (
            <Button
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("all");
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white rounded-lg text-xs font-semibold px-4 h-8 cursor-pointer"
            >
              {t("admin.incidentManagement.clearFilters")}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto">
          <Table className="w-full border-collapse">
            <TableHeader className="bg-transparent border-b border-slate-200">
              <TableRow className="hover:bg-transparent border-b border-slate-200">
                <TableHead className="text-xs font-semibold text-slate-600">Case Number</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600">{t("admin.incidentManagement.worker")}</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 hidden md:table-cell">{t("admin.incidentManagement.reportedBy")}</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 hidden lg:table-cell">{t("admin.incidentManagement.type")}</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600">{t("admin.incidentManagement.status")}</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 hidden sm:table-cell">{t("admin.incidentManagement.date")}</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 text-right pr-2">{t("admin.incidentManagement.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident: Incident) => {
                const workerName =
                  incident.worker?.user?.name ||
                  `${incident.worker?.first_name || ""} ${incident.worker?.last_name || ""}`.trim() ||
                  "Worker";
                const workerPhone = incident.worker?.user?.phone || incident.worker?.phone;
                const workerPhoto = incident.worker?.user?.profile_photo;
                const workerPhotoUrl = getMediaUrl(workerPhoto);
                const workerInitials = getInitials(workerName);

                const reporterName =
                  incident.employer?.user?.name ||
                  incident.reporter?.name ||
                  t("admin.incidentManagement.notAvailable");
                const reporterPhone = incident.employer?.user?.phone || incident.reporter?.phone;
                const isReporterWorker =
                  incident.reporter?.id &&
                  incident.worker?.user?.id &&
                  String(incident.reporter.id) === String(incident.worker.user.id);
                const reporterPhoto = incident.employer?.user
                  ? incident.employer.user.profile_photo
                  : isReporterWorker
                  ? null
                  : incident.reporter?.profile_photo;
                const reporterPhotoUrl = getMediaUrl(reporterPhoto);
                const reporterInitials = getInitials(reporterName);

                return (
                  <TableRow
                    key={incident.id}
                    className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="py-3 font-semibold text-xs text-slate-900 whitespace-nowrap">
                      {incident.incident_number || `INC-${incident.id}`}
                    </TableCell>
                    <TableCell className="text-xs py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs text-slate-700">
                          {workerPhotoUrl ? (
                            <img
                              src={workerPhotoUrl}
                              alt={workerName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            workerInitials
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{workerName}</p>
                          {workerPhone && (
                            <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                              {workerPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs hidden md:table-cell text-slate-700 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs text-slate-700">
                          {reporterPhotoUrl ? (
                            <img
                              src={reporterPhotoUrl}
                              alt={reporterName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            reporterInitials
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{reporterName}</p>
                          {reporterPhone && (
                            <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                              {reporterPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs hidden lg:table-cell text-slate-700 py-3">
                      {getIncidentTypeText(incident.incident_type)}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {getStatusText(incident.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">
                      {incident.incident_date
                        ? new Date(incident.incident_date).toLocaleDateString()
                        : new Date(incident.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-3 pr-2 text-right">
                      {(() => {
                        const isCreator = Boolean(
                          user?.id && (
                            Number(incident.reporter_id) === Number(user.id) ||
                            Number(incident.reporter?.id) === Number(user.id)
                          )
                        );
                        const statusLower = (incident.status || "").toLowerCase();
                        const isUnderReviewOrResolved = [
                          "under_investigation",
                          "investigating",
                          "in_progress",
                          "follow_up",
                          "resolved",
                          "dismissed",
                          "escalated",
                          "closed"
                        ].includes(statusLower);

                        const canEditOrDelete = isCreator && !isUnderReviewOrResolved && statusLower === "reported";

                        const dropdownItems: any[] = [
                          {
                            label: "View Details",
                            onClick: () => handleViewDetails(incident.id),
                          },
                          {
                            label: "Add Proof Files",
                            onClick: () =>
                              setSelectedIncidentForFiles({
                                id: incident.id,
                                number: incident.incident_number,
                              }),
                          },
                        ];

                        if (canEditOrDelete) {
                          dropdownItems.push(
                            {
                              label: "Edit / Update Incident",
                              onClick: () => handleViewDetails(incident.id),
                            },
                            "separator",
                            {
                              label: "Delete Incident",
                              danger: true,
                              onClick: () => {
                                setIncidentToDelete(incident.id);
                                setIsDeleteModalOpen(true);
                              },
                            }
                          );
                        }

                        return (
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
                            items={dropdownItems}
                          />
                        );
                      })()}
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

  // Strictly TWO tabs as requested
  const tabsConfig = [
    { 
      key: "all", 
      label: isSupervisor ? "District Incidents" : (t("admin.incidentManagement.allIncidents") || "All Incidents"), 
      count: filteredIncidents.length 
    },
    { key: "map", label: "Geo Map" },
  ];

  return (
    <div className="w-full bg-white space-y-0">
      {/* Header */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb 
          title={isSupervisor ? `District Incident Management (${districtName} District)` : t("admin.incidentManagement.title")} 
        />
      </div>

      {/* Main Content Layout */}
      <div className="w-full bg-white border-t border-slate-200">
        {/* Navigation Tabs - Exactly Two Tabs: All Incidents and Geo Map */}
        <div className="border-b border-slate-200 px-0 bg-white flex items-center gap-6 overflow-x-auto no-scrollbar">
          {tabsConfig.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "border-[#2478b8] text-[#2478b8]"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive ? "bg-[#2478b8]/10 text-[#2478b8]" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Bar with Status & Incident Type filters and Search */}
        <StudioFilterBar
          categories={[
            {
              id: "status",
              label: "Status",
              options: [
                { value: "all", label: "All Statuses" },
                { value: "reported", label: t("admin.incidentManagement.reported_status") || "Reported" },
                { value: "under_investigation", label: t("admin.incidentManagement.under_investigation") || "Investigating" },
                { value: "resolved", label: t("admin.incidentManagement.resolved_status") || "Resolved" },
                { value: "dismissed", label: t("admin.incidentManagement.dismissed_status") || "Dismissed" },
                { value: "escalated", label: t("admin.incidentManagement.escalated_status") || "Escalated" },
              ],
            },
            {
              id: "type",
              label: "Incident Type",
              options: [
                { value: "all", label: "All Types" },
                { value: "theft", label: "Theft" },
                { value: "violence", label: "Violence" },
                { value: "negligence", label: "Negligence" },
                { value: "breach_of_contract", label: "Breach of Contract" },
                { value: "misconduct", label: "Misconduct" },
                { value: "non_payment", label: "Non-Payment" },
                { value: "unsafe_conditions", label: "Unsafe Conditions" },
                { value: "harassment", label: "Harassment" },
                { value: "wrongful_termination", label: "Wrongful Termination" },
                { value: "other", label: "Other" },
              ],
            },
          ]}
          activeFilters={{
            status: statusFilter,
            type: typeFilter,
          }}
          onFilterChange={(catId, val) => {
            if (catId === "status") {
              setStatusFilter(val);
              setCurrentPage(1);
            } else if (catId === "type") {
              setTypeFilter(val);
              setCurrentPage(1);
            }
          }}
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          onClearAll={() => {
            setSearchTerm("");
            setTypeFilter("all");
            setStatusFilter("all");
            setCurrentPage(1);
          }}
        />

        {/* Content View: Geo Map or Incident Table */}
        <div className="py-2">
          {activeTab === "map" ? (
            <IncidentGeoMap incidents={filteredIncidents} />
          ) : (
            <>
              <IncidentsTable incidents={paginatedIncidents} loading={isLoadingIncidents} />
              <YouTubeStudioPagination
                currentPage={currentPage}
                lastPage={Math.max(1, Math.ceil(filteredIncidents.length / perPage))}
                perPage={perPage}
                total={filteredIncidents.length}
                onPageChange={(page) => setCurrentPage(page)}
                onPerPageChange={(val) => {
                  setPerPage(val);
                  setCurrentPage(1);
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <IncidentDetailsModal
        incidentId={selectedIncidentId}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedIncidentId(null);
        }}
      />

      <AddProofFilesModal
        incidentId={selectedIncidentForFiles?.id ?? null}
        incidentNumber={selectedIncidentForFiles?.number}
        isOpen={!!selectedIncidentForFiles}
        onClose={() => setSelectedIncidentForFiles(null)}
      />

      {/* Delete Incident Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 shadow-xl rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Confirm Incident Deletion</DialogTitle>
            <DialogDescription className="text-xs text-slate-600 mt-1">
              Are you sure you want to delete this incident report? This action is permanent and cannot be undone.
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
              loading={deleteIncidentMutation.isPending}
              onClick={() => {
                if (incidentToDelete) {
                  deleteIncidentMutation.mutate(incidentToDelete, {
                    onSuccess: () => {
                      setIsDeleteModalOpen(false);
                      setIncidentToDelete(null);
                    },
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4"
            >
              Delete Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentManagement;