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
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import {
  Plus,
  Download,
  MoreVertical,
} from "lucide-react";
import { useWorkerIncidents } from "@/hooks/useWorkerIncidents";
import type { WorkerIncidentFilters } from "@/types/worker-incident.types";
import WorkerIncidentDetailsModal from "./WorkerIncidentDetailsModal";
import CreateWorkerIncidentModal from "./CreateWorkerIncidentModal";
import { format } from "date-fns";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import { api } from "@/lib/api";
import { jsPDF } from "jspdf";

const WorkerIncidentManagement = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [selectedIncidentIds, setSelectedIncidentIds] = useState<number[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filters: WorkerIncidentFilters = {
    status: statusFilter as any,
    incident_type: typeFilter as any,
    page: currentPage,
    per_page: perPage,
  };

  const { data, isLoading } = useWorkerIncidents(filters);

  const incidents = data?.data?.data ?? [];
  const pagination = data?.data
    ? {
        current_page: data.data.current_page,
        last_page: data.data.last_page,
        per_page: data.data.per_page,
        total: data.data.total,
      }
    : null;

  const filtered = incidents.filter((i) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      i.incident_number.toLowerCase().includes(t) ||
      i.incident_type.toLowerCase().includes(t) ||
      (i.employer?.user?.name ?? "").toLowerCase().includes(t)
    );
  });

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      reported: "Reported",
      under_investigation: "Under Investigation",
      resolved: "Resolved",
      dismissed: "Dismissed",
      escalated: "Escalated",
    };
    return map[status] ?? status;
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      non_payment: "Non-Payment",
      unsafe_conditions: "Unsafe Conditions",
      harassment: "Harassment",
      breach_of_contract: "Breach of Contract",
      wrongful_termination: "Wrongful Termination",
      other: "Other",
    };
    return map[type] ?? type;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIncidentIds(filtered.map((i) => i.id));
    } else {
      setSelectedIncidentIds([]);
    }
  };

  const handleToggleSelectIncident = (id: number) => {
    setSelectedIncidentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    try {
      const res = await api.get("/worker/incidents/export/pdf", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `worker-incidents-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Client-side PDF generation fallback with jsPDF
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Worker Incident Reports", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 14, 28);
      doc.text(`Total Incidents: ${filtered.length}`, 14, 34);

      let y = 44;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Incident #", 14, y);
      doc.text("Employer", 50, y);
      doc.text("Type", 105, y);
      doc.text("Status", 145, y);
      doc.text("Date", 175, y);
      doc.line(14, y + 2, 196, y + 2);

      y += 8;
      doc.setFont("helvetica", "normal");
      filtered.forEach((item) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(item.incident_number || "—", 14, y);
        doc.text((item.employer?.user?.name || "—").slice(0, 22), 50, y);
        doc.text(getTypeLabel(item.incident_type), 105, y);
        doc.text(getStatusLabel(item.status), 145, y);
        doc.text(
          format(new Date(item.created_at || item.incident_date), "MMM dd, yyyy"),
          175,
          y
        );
        y += 7;
      });

      doc.save(`worker-incidents-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    }
  };

  return (
    <div className="w-full bg-white space-y-0">
      {/* Top Header */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb title="Incident Management">
          <div className="flex items-center gap-2">
            {/* Export PDF styled as plain text button like Import Excel */}
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-transparent border-0 px-2 py-1 font-medium"
              onClick={handleExport}
            >
              Export PDF
            </button>

            {/* Report Incident - Primary Blue Button */}
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Report Incident</span>
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
                { value: "non_payment", label: "Non-Payment" },
                { value: "unsafe_conditions", label: "Unsafe Conditions" },
                { value: "harassment", label: "Harassment" },
                { value: "breach_of_contract", label: "Breach of Contract" },
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
        ) : filtered.length === 0 ? (
          <CharacterIllustration
            type="general"
            title="No incidents found"
            description={
              searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "No incident records match your criteria."
                : "No incidents reported yet."
            }
            action={
              searchTerm || statusFilter !== "all" || typeFilter !== "all" ? (
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
                      checked={
                        filtered.length > 0 && selectedIncidentIds.length === filtered.length
                      }
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      className="border-slate-400 rounded-sm"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Incident #</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Employer</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 hidden md:table-cell">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 hidden sm:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 text-right pr-2">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((incident) => {
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
                                incident.employer?.user?.profile_photo
                                  ? (incident.employer.user.profile_photo.startsWith("http") || incident.employer.user.profile_photo.startsWith("data:")
                                      ? incident.employer.user.profile_photo
                                      : `${(import.meta.env.VITE_STORAGE_URL || "http://localhost:5000").replace(/\/$/, "")}/${incident.employer.user.profile_photo.replace(/^\//, "")}`)
                                  : undefined
                              }
                              alt={incident.employer?.user?.name ?? "Employer"}
                            />
                            <AvatarFallback className="p-0 bg-transparent border-none">
                              <DefaultAvatarSVG className="w-full h-full" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">
                              {incident.employer?.user?.name ?? "—"}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {incident.employer?.user?.phone ?? ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-3">
                        <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                          {getTypeLabel(incident.incident_type)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                          {getStatusLabel(incident.status)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell py-3">
                        <span className="text-xs font-normal text-slate-700">
                          {format(
                            new Date(incident.created_at || incident.incident_date),
                            "MMM dd, yyyy"
                          )}
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
            currentPage={pagination.current_page || currentPage}
            lastPage={pagination.last_page || 1}
            perPage={perPage}
            total={pagination.total || filtered.length}
            onPageChange={(page) => setCurrentPage(page)}
            onPerPageChange={(val) => {
              setPerPage(val);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      <WorkerIncidentDetailsModal
        incidentId={selectedIncidentId}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
      <CreateWorkerIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default WorkerIncidentManagement;