import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import {
  Eye,
  Plus,
  Download,
  MoreVertical,
} from "lucide-react";
import { useEmployerIncidents } from "@/hooks/useEmployerIncidents";
import { employerIncidentApi } from "@/api/employerIncidentService";
import type { IncidentFilters } from "@/types/employer-incident.types";
import IncidentDetailsModal from "./IncidentDetailsModal";
import CreateEmployerIncidentModal from "./CreateEmployerIncidentModal";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";

// Subtype labels map
const SUBTYPE_LABELS: Record<string, string> = {
  pickpocketing: "Pickpocketing",
  burglary: "Burglary",
  fraud: "Fraud / Deception",
  shoplifting: "Shoplifting",
  physical_assault: "Physical Assault",
  sexual_harassment: "Sexual Harassment",
  verbal_abuse: "Verbal Abuse / Threats",
  domestic_violence: "Domestic Violence",
  property_damage: "Property Damage",
  safety_violation: "Safety Violation",
  duty_abandonment: "Abandonment of Duty",
  non_payment: "Non-payment Dispute",
  unauthorized_absence: "Unauthorized Absence",
  early_termination: "Early Termination",
  insubordination: "Insubordination",
  substance_abuse: "Substance Abuse",
  harassment: "Harassment of Colleagues",
  dishonesty: "Dishonesty",
  general: "General / Unclassified",
  other: "Other",
};

const IncidentManagement = () => {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [selectedIncidentIds, setSelectedIncidentIds] = useState<number[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading } = useEmployerIncidents({
    status: statusFilter as any,
    incident_type: typeFilter as any,
    page: currentPage,
    per_page: perPage,
    ...(searchTerm && { search: searchTerm }),
  });

  const incidents = data?.data?.data || [];
  const pagination = data?.data ? {
    current_page: data.data.current_page,
    last_page: data.data.last_page,
    per_page: data.data.per_page,
    total: data.data.total,
  } : null;

  const handleExport = async () => {
    try {
      const blob = await employerIncidentApi.exportIncidents({
        status: statusFilter as any,
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `incidents-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      reported: t("employer.incidentManagement.reported_badge"),
      under_investigation: t("employer.incidentManagement.under_investigation_badge"),
      resolved: t("employer.incidentManagement.resolved_badge"),
      dismissed: t("employer.incidentManagement.dismissed_badge"),
      escalated: t("employer.incidentManagement.escalated_badge"),
    };
    return statusMap[status] || status;
  };

  const getIncidentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      theft: t("employer.incidentManagement.theft_label"),
      violence: t("employer.incidentManagement.violence_label"),
      negligence: t("employer.incidentManagement.negligence_label"),
      breach_of_contract: t("employer.incidentManagement.breach_of_contract_label"),
      misconduct: t("employer.incidentManagement.misconduct_label"),
      other: t("employer.incidentManagement.other_label"),
    };
    return labels[type] || type;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIncidentIds(incidents.map((i) => i.id));
    } else {
      setSelectedIncidentIds([]);
    }
  };

  const handleToggleSelectIncident = (id: number) => {
    setSelectedIncidentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full bg-white space-y-0">
      {/* Top Header */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb title={t("employer.incidentManagement.title")}>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t("employer.incidentManagement.reportIncidentBtn")}</span>
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t("employer.incidentManagement.exportPdf")}</span>
            </Button>
          </div>
        </PageHeaderBreadcrumb>
      </div>

      {/* Main Studio Styled Table Layout */}
      <div className="w-full bg-white border-t border-slate-200">
        <StudioFilterBar
          categories={[
            {
              id: "status",
              label: "Status",
              options: [
                { value: "all", label: "All Status" },
                { value: "reported", label: "Reported" },
                { value: "under_investigation", label: "Under Investigation" },
                { value: "resolved", label: "Resolved" },
                { value: "dismissed", label: "Dismissed" },
                { value: "escalated", label: "Escalated" },
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
                { value: "other", label: "Other" },
              ],
            },
          ]}
          activeFilters={{
            status: statusFilter,
            type: typeFilter,
          }}
          onFilterChange={(catId, val) => {
            if (catId === "status") setStatusFilter(val);
            if (catId === "type") setTypeFilter(val);
            setCurrentPage(1);
          }}
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          onClearAll={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setTypeFilter("all");
            setCurrentPage(1);
          }}
        />

        {/* Table Content Section */}
        {isLoading ? (
          <div className="py-6 space-y-3">
            <Skeleton className="h-9 w-full rounded-none" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-none" />
            ))}
          </div>
        ) : incidents.length === 0 ? (
          <CharacterIllustration
            type="general"
            title={t("employer.incidentManagement.noIncidentsFound")}
            description={
              searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "No incident records match your criteria."
                : "No incidents reported yet."
            }
            action={
              (searchTerm || statusFilter !== "all" || typeFilter !== "all") ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                  className="rounded-lg border-slate-300 font-medium text-xs h-9"
                >
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader className="bg-transparent border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="w-10 pl-2">
                    <Checkbox
                      checked={incidents.length > 0 && selectedIncidentIds.length === incidents.length}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      className="border-slate-400 rounded-sm"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Incident #</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Worker</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 hidden md:table-cell">Type</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 text-right pr-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident) => {
                  const isSelected = selectedIncidentIds.includes(incident.id);
                  return (
                    <TableRow
                      key={incident.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <TableCell className="pl-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelectIncident(incident.id)}
                          className="border-slate-400 rounded-sm"
                        />
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-semibold text-slate-900 font-mono">
                          {incident.incident_number}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200">
                            <AvatarImage
                              src={
                                incident.worker?.profile_photo
                                  ? (incident.worker.profile_photo.startsWith("http") || incident.worker.profile_photo.startsWith("data:")
                                      ? incident.worker.profile_photo
                                      : `${(import.meta.env.VITE_STORAGE_URL || "http://localhost:5000").replace(/\/$/, "")}/${incident.worker.profile_photo.replace(/^\//, "")}`)
                                  : undefined
                              }
                              alt={`${incident.worker?.first_name || ""} ${incident.worker?.last_name || ""}`}
                            />
                            <AvatarFallback className="p-0 bg-transparent border-none">
                              <DefaultAvatarSVG className="w-full h-full" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">
                              {incident.worker.first_name} {incident.worker.last_name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-3">
                        <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                          {getIncidentTypeLabel(incident.incident_type)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                          {getStatusText(incident.status)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell py-3">
                        <span className="text-xs font-normal text-slate-700">
                          {format(new Date(incident.created_at), 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-2 py-3">
                        <CustomDropdown
                          widthClass="w-48"
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
                            {
                              label: "View Incident Details",
                              onClick: () => {
                                setSelectedIncidentId(incident.id);
                                setIsDetailsModalOpen(true);
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
        )}

        {pagination && (
          <YouTubeStudioPagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            perPage={perPage}
            total={pagination.total}
            onPageChange={(page) => setCurrentPage(page)}
            onPerPageChange={(val) => {
              setPerPage(val);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      <IncidentDetailsModal
        incidentId={selectedIncidentId}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
      <CreateEmployerIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default IncidentManagement;