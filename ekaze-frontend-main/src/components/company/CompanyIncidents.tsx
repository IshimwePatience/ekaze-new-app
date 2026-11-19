import { useState, useMemo } from "react";
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
  X,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { useCompanyIncidents } from "@/hooks/useCompanyIncidents";
import type { CompanyIncidentFilters, CompanyIncidentItem } from "@/types/company-incident.types";
import CompanyIncidentDetailsModal from "./CompanyIncidentDetailsModal";
import CompanyCreateIncidentModal from "./CompanyCreateIncidentModal";
import { format } from "date-fns";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import { jsPDF } from "jspdf";

const CompanyIncidents = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [selectedIncidentIds, setSelectedIncidentIds] = useState<number[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filters: CompanyIncidentFilters = {
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    incident_type: typeFilter !== "all" ? (typeFilter as any) : undefined,
    per_page: perPage,
  };

  const { data, isLoading, isError, refetch } = useCompanyIncidents(currentPage, filters);

  const incidents: CompanyIncidentItem[] = data?.data?.data ?? [];
  const pagination = data?.data
    ? {
        current_page: data.data.current_page,
        last_page: data.data.last_page,
        per_page: data.data.per_page,
        total: data.data.total,
      }
    : null;

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const num = (i.incident_number || "").toLowerCase();
      const type = (i.incident_type || "").toLowerCase();
      const workerName = (i.worker?.full_name || `${i.worker?.first_name || ""} ${i.worker?.last_name || ""}`).toLowerCase();
      const employerName = (i.employer?.user?.name || "").toLowerCase();
      return num.includes(term) || type.includes(term) || workerName.includes(term) || employerName.includes(term);
    });
  }, [incidents, searchTerm]);

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
      theft: "Theft",
      violence: "Violence",
      negligence: "Negligence",
      misconduct: "Misconduct",
      other: "Other",
    };
    return map[type] ?? (type ? type.replace(/_/g, " ") : "General");
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
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Company Incident Management Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 14, 22);

    let y = 32;
    doc.setFont("helvetica", "bold");
    doc.text("Incident #", 14, y);
    doc.text("Worker / Party", 60, y);
    doc.text("Type", 115, y);
    doc.text("Status", 150, y);
    doc.text("Date", 180, y);

    y += 6;
    doc.setFont("helvetica", "normal");

    const exportList =
      selectedIncidentIds.length > 0
        ? filtered.filter((i) => selectedIncidentIds.includes(i.id))
        : filtered;

    exportList.forEach((item) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      const party = item.worker?.full_name || item.employer?.user?.name || "—";
      doc.text(item.incident_number || `INC-${item.id}`, 14, y);
      doc.text(party.slice(0, 22), 60, y);
      doc.text(getTypeLabel(item.incident_type), 115, y);
      doc.text(getStatusLabel(item.status), 150, y);
      doc.text(format(new Date(item.created_at || item.incident_date), "MMM dd, yyyy"), 180, y);
      y += 7;
    });

    doc.save(`company-incidents-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <div className="w-full bg-white space-y-0 animate-in fade-in duration-300">
      {/* Top Header matching Worker & Employer Incident Management */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb title="Incident Management">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Report Incident</span>
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export PDF</span>
            </Button>
          </div>
        </PageHeaderBreadcrumb>
      </div>

      {/* Main Studio Styled Table Layout */}
      <div className="w-full bg-white border-t border-slate-200">
        {selectedIncidentIds.length === 0 ? (
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
                  { value: "misconduct", label: "Misconduct" },
                  { value: "breach_of_contract", label: "Breach of Contract" },
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
        ) : (
          /* Contextual Bulk Action Bar */
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIncidentIds([])}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold font-sans">
                {selectedIncidentIds.length} selected
              </span>
              <button
                onClick={() => handleSelectAll(selectedIncidentIds.length < filtered.length)}
                className="text-xs text-[#38BDF8] hover:underline font-medium ml-1 font-sans cursor-pointer"
              >
                ({selectedIncidentIds.length === filtered.length ? "Deselect all" : "Select all"})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExport}
                className="h-7 text-xs text-white hover:bg-slate-800 rounded font-medium cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                Export Selected PDF
              </Button>
            </div>
          </div>
        )}

        {/* Table Content Section */}
        {isLoading ? (
          <div className="py-6 space-y-3">
            <Skeleton className="h-9 w-full rounded-none" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-none" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900 font-sans">
              Error loading incident records
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Please try refreshing the page.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <CharacterIllustration
            type="incidents"
            title="No incidents found"
            description={
              searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "No incident records match your criteria."
                : "No incidents have been reported for your workers yet."
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
                  className="rounded border-slate-300 font-medium text-xs h-8 cursor-pointer"
                >
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[750px] border-collapse">
              <TableHeader className="bg-transparent border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="w-10 pl-4 py-3">
                    <Checkbox
                      checked={
                        filtered.length > 0 && selectedIncidentIds.length === filtered.length
                      }
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      className="border-slate-400 rounded-sm"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Incident #
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Worker / Employer
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 hidden md:table-cell">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 hidden sm:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 text-right pr-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((incident) => {
                  const isSelected = selectedIncidentIds.includes(incident.id);
                  const partyName =
                    incident.worker?.full_name ||
                    incident.employer?.user?.name ||
                    "Worker";
                  const partyPhone =
                    incident.worker?.user?.phone ||
                    incident.employer?.user?.phone ||
                    "—";
                  const photo =
                    incident.worker?.user?.profile_photo ||
                    incident.employer?.user?.district;

                  return (
                    <TableRow
                      key={incident.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <TableCell className="pl-4 py-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelectIncident(incident.id)}
                          className="border-slate-400 rounded-sm"
                        />
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-semibold text-slate-900 font-sans">
                          {incident.incident_number || `INC-${incident.id}`}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200">
                            <AvatarImage src={incident.worker?.user?.profile_photo || undefined} />
                            <AvatarFallback className="p-0 bg-transparent border-none">
                              <DefaultAvatarSVG className="w-full h-full" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 font-sans">
                              {partyName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-sans">
                              {partyPhone}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-3">
                        <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded capitalize">
                          {getTypeLabel(incident.incident_type)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded capitalize">
                          {getStatusLabel(incident.status)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell py-3">
                        <span className="text-xs font-semibold text-slate-900 font-sans">
                          {format(
                            new Date(incident.created_at || incident.incident_date),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-4 py-3">
                        <CustomDropdown
                          widthClass="w-36"
                          align="end"
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Actions"
                              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          }
                          items={[
                            {
                              id: "view_details",
                              label: "View Details",
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

        {/* Bottom Pagination */}
        {pagination && (
          <YouTubeStudioPagination
            currentPage={currentPage}
            lastPage={pagination.last_page}
            perPage={perPage}
            total={pagination.total}
            onPageChange={(page) => setCurrentPage(page)}
            onPerPageChange={(newPerPage) => setPerPage(newPerPage)}
          />
        )}
      </div>

      <CompanyIncidentDetailsModal
        incidentId={selectedIncidentId}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedIncidentId(null);
        }}
      />

      <CompanyCreateIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default CompanyIncidents;