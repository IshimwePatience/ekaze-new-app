import { useState, useCallback, useMemo } from "react";
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
  MoreVertical,
  X,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useHiringRequests, useHiringRequestStatistics } from "@/hooks/useHiringRequests";
import { format } from "date-fns";
import HiringRequestDetailsModal from "./HiringRequestDetailsModal";
import WorkerDetailsModal from "./WorkerDetailsModal";
import EmployerDetailsModal from "./EmployerDetailsModal";
import type { HiringRequestItem } from "@/types/hiring-request.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { CustomDropdown } from "@/components/ui/custom-dropdown";

const HiringRequests = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Worker & Employer modal state
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);

  const [employerModalOpen, setEmployerModalOpen] = useState(false);
  const [selectedEmployerId, setSelectedEmployerId] = useState<number | null>(null);
  const [selectedEmployerFallback, setSelectedEmployerFallback] = useState<any>(null);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const computedStatus =
    activeTab === "new"
      ? "pending"
      : historyStatusFilter === "all"
      ? "history"
      : (historyStatusFilter as "accepted" | "rejected");

  const filters = {
    status: computedStatus as any,
    search: searchTerm || undefined,
    per_page: perPage,
  };

  const { data, isLoading, isError } = useHiringRequests(currentPage, filters);
  const { data: statsData } = useHiringRequestStatistics();
  const stats = statsData?.data;

  const rawRequests: HiringRequestItem[] = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? (data.data as unknown as HiringRequestItem[])
    : [];

  // Filter requests strictly based on active tab:
  // "new" tab -> pending approval only
  // "history" tab -> accepted, rejected, cancelled
  const displayedRequests = useMemo(() => {
    return rawRequests.filter((request) => {
      if (activeTab === "new") {
        return request.status === "pending";
      } else {
        if (historyStatusFilter === "all") {
          return request.status !== "pending";
        }
        return request.status === historyStatusFilter;
      }
    });
  }, [rawRequests, activeTab, historyStatusFilter]);

  const paginationData = data?.data;
  const pagination = paginationData && typeof paginationData === "object" && "total" in paginationData
    ? {
        current_page: paginationData.current_page || currentPage,
        last_page: paginationData.last_page || 1,
        per_page: paginationData.per_page || perPage,
        total: paginationData.total ?? displayedRequests.length,
      }
    : {
        current_page: currentPage,
        last_page: 1,
        per_page: perPage,
        total: displayedRequests.length,
      };

  // ── Selection helpers ──────────────────────────────────────────────
  const allIds = displayedRequests.map((r) => r.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleOne = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Pagination handlers ────────────────────────────────────────────
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds(new Set());
  };

  const handlePerPageChange = (val: string) => {
    setPerPage(parseInt(val));
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handleViewDetails = (requestId: number) => {
    setSelectedRequestId(requestId);
    setDetailsModalOpen(true);
  };

  const handleViewWorkerDetails = (workerId?: number) => {
    if (!workerId) return;
    setSelectedWorkerId(workerId);
    setWorkerModalOpen(true);
  };

  const handleViewEmployerDetails = (employerId?: number, fallbackEmployer?: any) => {
    if (!employerId && !fallbackEmployer) return;
    setSelectedEmployerId(employerId || null);
    setSelectedEmployerFallback(fallbackEmployer || null);
    setEmployerModalOpen(true);
  };

  const handleCloseModal = () => {
    setDetailsModalOpen(false);
    setSelectedRequestId(null);
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: t("company.hiringRequests.pending_badge") || "Pending",
      accepted: t("company.hiringRequests.accepted_badge") || "Accepted",
      rejected: t("company.hiringRequests.rejected_badge") || "Rejected",
      cancelled: t("company.hiringRequests.cancelled") || "Cancelled",
    };
    return statusMap[status] || status;
  };

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "—";
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="w-full bg-white space-y-0">
      {/* Top Header matching Registered Workers & User Management */}
      <div className="pt-1 pb-1 px-0">
        <PageHeaderBreadcrumb title={t("company.hiringRequests.title") || "Hiring Requests"} />
      </div>

      {/* Two Tabs: New Requests (Pending Approval) & History (Accepted / Handled) */}
      <div className="w-full bg-white border-b border-slate-200 flex items-center gap-8 px-2 sm:px-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab("new");
            setCurrentPage(1);
            setSelectedIds(new Set());
          }}
          className={`pb-3 pt-2.5 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 border-0 bg-transparent ${
            activeTab === "new"
              ? "!border-[#2478b8] text-[#2478b8]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>New Requests</span>
          {stats && typeof stats.pending === "number" && stats.pending > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
              {stats.pending}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("history");
            setCurrentPage(1);
            setSelectedIds(new Set());
          }}
          className={`pb-3 pt-2.5 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 border-0 bg-transparent ${
            activeTab === "history"
              ? "!border-[#2478b8] text-[#2478b8]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>History</span>
          {stats && typeof stats.accepted === "number" && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
              {(stats.accepted || 0) + (stats.rejected || 0)}
            </span>
          )}
        </button>
      </div>

      {/* Main YouTube Studio Styled Content Layout */}
      <div className="w-full bg-white">
        {/* Studio Filter Bar or Contextual Bulk Action Bar */}
        {selectedIds.size === 0 ? (
          <StudioFilterBar
            categories={
              activeTab === "history"
                ? [
                    {
                      id: "status",
                      label: "Status",
                      options: [
                        { value: "all", label: "All History" },
                        { value: "accepted", label: "Accepted" },
                        { value: "rejected", label: "Rejected" },
                      ],
                    },
                  ]
                : []
            }
            activeFilters={{
              status: historyStatusFilter,
            }}
            onFilterChange={(catId, val) => {
              if (catId === "status") setHistoryStatusFilter(val);
              setCurrentPage(1);
            }}
            searchTerm={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            onClearAll={() => {
              setSearchTerm("");
              setHistoryStatusFilter("all");
              setCurrentPage(1);
            }}
          />
        ) : (
          /* Contextual Bulk Action Bar */
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold">
                {selectedIds.size} selected
              </span>
              <button
                onClick={() => handleSelectAll(selectedIds.size < displayedRequests.length)}
                className="text-xs text-[#38BDF8] hover:underline font-medium ml-1 cursor-pointer"
              >
                ({selectedIds.size === displayedRequests.length ? "Deselect all" : "Select all"})
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
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
            <h3 className="text-sm font-semibold text-slate-900">
              {t("company.hiringRequests.loadError") || "Error loading hiring requests"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t("company.hiringRequests.loadErrorHint") || "Please try refreshing the page."}
            </p>
          </div>
        ) : displayedRequests.length === 0 ? (
          /* Empty State matching Registered Workers */
          <CharacterIllustration
            type="users"
            title={
              activeTab === "new"
                ? "No new requests"
                : "No request history"
            }
            description={
              activeTab === "new"
                ? searchTerm
                  ? "No pending hiring requests match your search."
                  : "No new hiring requests are awaiting approval."
                : searchTerm || historyStatusFilter !== "all"
                ? "No past hiring requests match your search and filter criteria."
                : "No processed hiring requests found in history."
            }
            action={
              searchTerm || (activeTab === "history" && historyStatusFilter !== "all") ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setHistoryStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border-slate-300 font-medium text-xs h-9 cursor-pointer"
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          /* Table matching Registered Workers & User Management */
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[750px] border-collapse">
              <TableHeader className="bg-transparent border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="w-10 pl-2">
                    <Checkbox
                      checked={displayedRequests.length > 0 && selectedIds.size === displayedRequests.length}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      className="border-slate-400 rounded-sm"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">
                    {t("company.hiringRequests.worker") || "Worker"}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">
                    {t("company.hiringRequests.employer") || "Employer"}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">
                    Contact Fee
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">
                    {t("company.hiringRequests.status") || "Status"}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans whitespace-nowrap">
                    Date & Time
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans text-right pr-2">
                    {t("company.hiringRequests.actions") || "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedRequests.map((request) => {
                  const isSelected = selectedIds.has(request.id);
                  const workerName =
                    `${request.worker?.first_name || ""} ${request.worker?.last_name || ""}`.trim() ||
                    `Worker #${request.worker_id}`;
                  const employerName =
                    request.employer?.user?.name || `Employer #${request.employer_id}`;

                  return (
                    <TableRow
                      key={request.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <TableCell className="pl-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(request.id)}
                          className="border-slate-400 rounded-sm"
                        />
                      </TableCell>

                      {/* Worker Avatar + Name */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200">
                            <AvatarImage src={request.worker?.user?.profile_photo || undefined} />
                            <AvatarFallback className="p-0 bg-transparent border-none">
                              <DefaultAvatarSVG className="w-full h-full" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 font-sans">
                              {workerName}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {request.worker?.user?.phone || request.worker?.experience_level || "Worker"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Employer */}
                      <TableCell className="py-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-900 font-sans">
                            {employerName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {request.employer?.user?.phone || request.employer?.user?.district || "—"}
                          </p>
                        </div>
                      </TableCell>

                      {/* Contact Fee */}
                      <TableCell className="py-3">
                        <p className="text-xs font-semibold text-slate-900 font-sans">
                          {formatCurrency(request.proposed_salary || 5000)}
                        </p>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3">
                        <span className={`text-xs font-normal px-2 py-0.5 rounded capitalize border ${
                          request.status === "accepted"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : request.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}>
                          {getStatusText(request.status)}
                        </span>
                      </TableCell>

                      {/* Date & Time */}
                      <TableCell className="text-xs font-normal text-slate-700 font-sans py-3 whitespace-nowrap">
                        {request.created_at
                          ? format(new Date(request.created_at), "MMM dd, yyyy 'at' hh:mm a")
                          : "—"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-2 py-3">
                        <CustomDropdown
                          widthClass="w-52"
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
                              label: "View Worker Details",
                              onClick: () => handleViewWorkerDetails(request.worker_id || request.worker?.id),
                            },
                            {
                              label: "View Employer Details",
                              onClick: () => handleViewEmployerDetails(request.employer_id || request.employer?.id, request.employer),
                            },
                            {
                              label: activeTab === "new" ? "Review & Decide" : "Request Details",
                              onClick: () => handleViewDetails(request.id),
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

        {/* Pagination matching Registered Workers & User Management */}
        {pagination && pagination.total > 0 && (
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

      {/* Details Modal */}
      <HiringRequestDetailsModal
        requestId={selectedRequestId}
        isOpen={detailsModalOpen}
        onClose={handleCloseModal}
      />

      {/* Worker Details Modal */}
      <WorkerDetailsModal
        workerId={selectedWorkerId}
        isOpen={workerModalOpen}
        onClose={() => {
          setWorkerModalOpen(false);
          setSelectedWorkerId(null);
        }}
      />

      {/* Employer Details Modal */}
      <EmployerDetailsModal
        employerId={selectedEmployerId}
        isOpen={employerModalOpen}
        onClose={() => {
          setEmployerModalOpen(false);
          setSelectedEmployerId(null);
          setSelectedEmployerFallback(null);
        }}
        fallbackEmployer={selectedEmployerFallback}
      />
    </div>
  );
};

export default HiringRequests;