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
import {
  CheckCircle2,
  MoreVertical,
  X,
  CreditCard,
  AlertCircle,
  Download,
  Eye,
  FileSpreadsheet,
  ChevronDown
} from "lucide-react";
import { useCompanyTransactions, useCompanyTransactionStatistics } from "@/hooks/useCompanyTransactions";
import { format } from "date-fns";
import { StudioFilterBar, type FilterCategory } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import CompanyTransactionDetailsModal from "./CompanyTransactionDetailsModal";
import { companyTransactionApi } from "@/api/companyTransactionService";
import type { CompanyTransactionFilters, CompanyTransactionItem } from "@/types/company-transaction.types";

interface WorkerEarningItem {
  id: number;
  worker_name: string;
  worker_phone: string;
  profile_photo: string | null;
  profession: string;
  employer_name: string;
  status: string;
  monthly_salary: number;
  cut_percentage: number;
  company_cut: number;
  worker_net: number;
  start_date: string;
}

const CompanyTransactions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewFilter, setViewFilter] = useState<"earnings" | "transactions">("earnings");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const filters: CompanyTransactionFilters = {
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchTerm || undefined,
    per_page: perPage,
  };

  const { data, isLoading, isError, refetch } = useCompanyTransactions(currentPage, filters);
  const { data: statsData, refetch: refetchStats } = useCompanyTransactionStatistics();

  const statistics = statsData?.data;
  const transactions: CompanyTransactionItem[] = data?.data?.data || [];
  const pagination = data?.data;

  // Worker earnings data
  const rawWorkerEarnings: WorkerEarningItem[] = (statistics as any)?.worker_earnings || [];

  // Filtered worker earnings
  const filteredWorkerEarnings = useMemo(() => {
    return rawWorkerEarnings.filter((item) => {
      const matchesSearch =
        !searchTerm.trim() ||
        item.worker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.worker_phone?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [rawWorkerEarnings, searchTerm, statusFilter]);

  // Currency Formatter
  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  // Selection handlers
  const currentListIds = useMemo(() => {
    if (viewFilter === "earnings") {
      return filteredWorkerEarnings.map((w) => w.id);
    }
    return transactions.map((t) => t.id);
  }, [viewFilter, filteredWorkerEarnings, transactions]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(currentListIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export handler
  const handleExport = async (fmt: "csv" | "pdf" | "json" = "pdf") => {
    try {
      const blob = await companyTransactionApi.exportTransactions(fmt, {
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      const mimeTypes = { json: "application/json", csv: "text/csv", pdf: "application/pdf" };
      const url = window.URL.createObjectURL(new Blob([blob], { type: mimeTypes[fmt] }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `earnings-report-${format(new Date(), "yyyy-MM-dd")}.${fmt}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const filterCategories: FilterCategory[] = [
    {
      id: "view",
      label: "View",
      options: [
        { value: "earnings", label: "Worker Earnings & Cut" },
        { value: "transactions", label: "Transactions & Settlements" },
      ],
    },
    {
      id: "status",
      label: "Status",
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
        { value: "pending", label: "Pending" },
      ],
    },
  ];

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Top Page Header Breadcrumb matching User Management / Employers */}
      <div className="flex items-center justify-between pb-1">
        <PageHeaderBreadcrumb title="Revenue & Earnings">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleExport("pdf")}
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export Report</span>
            </Button>
          </div>
        </PageHeaderBreadcrumb>
      </div>

      {/* Main Flat Studio Layout matching User Management screenshot */}
      <div className="w-full bg-white border-t border-slate-200">
        {/* Studio Filter Bar & Contextual Bulk Action Bar */}
        {selectedIds.length === 0 ? (
          <StudioFilterBar
            categories={filterCategories}
            activeFilters={{
              view: viewFilter,
              status: statusFilter,
            }}
            onFilterChange={(catId, val) => {
              if (catId === "view") setViewFilter(val as any);
              if (catId === "status") setStatusFilter(val);
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            searchTerm={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            onClearAll={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setViewFilter("earnings");
              setCurrentPage(1);
              setSelectedIds([]);
            }}
          />
        ) : (
          /* Contextual Bulk Action Bar */
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds([])}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold font-sans">
                {selectedIds.length} selected
              </span>
              <button
                onClick={() => handleSelectAll(selectedIds.length < currentListIds.length)}
                className="text-xs text-[#38BDF8] hover:underline font-medium ml-1 font-sans cursor-pointer"
              >
                ({selectedIds.length === currentListIds.length ? "Deselect all" : "Select all"})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleExport("csv")}
                className="h-7 text-xs text-white hover:bg-slate-800 rounded font-medium cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="py-6 space-y-3">
            <Skeleton className="h-9 w-full rounded-none" />
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-none" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900 font-sans">
              Error loading earnings records
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Please try refreshing the page.
            </p>
          </div>
        ) : viewFilter === "earnings" ? (
          /* VIEW 1: WORKER EARNINGS & COMPANY CUT TABLE */
          filteredWorkerEarnings.length === 0 ? (
            <CharacterIllustration
              type="users"
              title="No worker earnings records found"
              description={
                searchTerm || statusFilter !== "all"
                  ? "No worker records match your current filters."
                  : "When your registered workers are hired by client employers, their earnings and your cut will appear here."
              }
              action={
                searchTerm || statusFilter !== "all" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="rounded border-slate-300 font-medium text-xs h-8 cursor-pointer"
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto w-full">
              <Table className="w-full min-w-[850px] border-collapse">
                <TableHeader className="bg-transparent border-b border-slate-200">
                  <TableRow className="hover:bg-transparent border-b border-slate-200">
                    <TableHead className="w-10 pl-4 py-3">
                      <Checkbox
                        checked={
                          filteredWorkerEarnings.length > 0 &&
                          selectedIds.length === filteredWorkerEarnings.length
                        }
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        className="border-slate-400 rounded-sm"
                      />
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                      User
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                      Employer
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                      Contact
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                      Role
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                      Worker Earning
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                      Company Cut (10%)
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                      Verified
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 pr-4 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkerEarnings.map((worker) => {
                    const isSelected = selectedIds.includes(worker.id);
                    return (
                      <TableRow
                        key={worker.id}
                        className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                          isSelected ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <TableCell className="pl-4 py-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleSelect(worker.id)}
                            className="border-slate-400 rounded-sm"
                          />
                        </TableCell>

                        {/* User (Avatar + Name) */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-slate-200">
                              <AvatarImage src={worker.profile_photo || undefined} />
                              <AvatarFallback className="p-0 bg-transparent border-none">
                                <DefaultAvatarSVG className="w-full h-full" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-semibold text-slate-900 font-sans">
                                {worker.worker_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Employer */}
                        <TableCell className="py-3">
                          <p className="text-xs font-semibold text-slate-900 font-sans">
                            {worker.employer_name || "—"}
                          </p>
                        </TableCell>

                        {/* Contact */}
                        <TableCell className="py-3">
                          <p className="text-xs font-semibold text-slate-900 font-sans">
                            {worker.worker_phone || "—"}
                          </p>
                        </TableCell>

                        {/* Role */}
                        <TableCell className="py-3">
                          <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                            {worker.profession || "Driver"}
                          </span>
                        </TableCell>

                        {/* Worker Earning */}
                        <TableCell className="py-3">
                          <span className="text-xs font-semibold text-slate-900 font-sans">
                            {worker.monthly_salary > 0 ? formatCurrency(worker.monthly_salary) : "—"}
                          </span>
                        </TableCell>

                        {/* Company Cut */}
                        <TableCell className="py-3">
                          {worker.company_cut > 0 ? (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-sans">
                              +{formatCurrency(worker.company_cut)} ({worker.cut_percentage || 10}%)
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-sans">—</span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3">
                          <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                            {worker.status === "active" ? "Active" : "Available"}
                          </span>
                        </TableCell>

                        {/* Verified */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                            <span className="text-xs font-semibold text-slate-900 font-sans">
                              Verified
                            </span>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3 pr-4 text-right">
                          <CustomDropdown
                            widthClass="w-40"
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
                                id: "export_pdf",
                                label: "Export PDF",
                                onClick: () => handleExport("pdf"),
                              },
                              {
                                id: "export_csv",
                                label: "Export CSV",
                                onClick: () => handleExport("csv"),
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
          )
        ) : (
          /* VIEW 2: TRANSACTIONS & SETTLEMENTS TABLE */
          transactions.length === 0 ? (
            <CharacterIllustration
              type="transactions"
              title="No settlement transactions recorded"
              description="Official financial transaction records will appear here as disbursements are completed."
            />
          ) : (
            <div className="overflow-x-auto w-full">
              <Table className="w-full min-w-[850px] border-collapse">
                <TableHeader className="bg-transparent border-b border-slate-200">
                  <TableRow className="hover:bg-transparent border-b border-slate-200">
                    <TableHead className="w-10 pl-4 py-3">
                      <Checkbox
                        checked={
                          transactions.length > 0 && selectedIds.length === transactions.length
                        }
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        className="border-slate-400 rounded-sm"
                      />
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                      Reference ID
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                      Type
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                      Amount
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                      Payment Method
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 pr-4 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const isSelected = selectedIds.includes(transaction.id);
                    return (
                      <TableRow
                        key={transaction.id}
                        className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                          isSelected ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <TableCell className="pl-4 py-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleSelect(transaction.id)}
                            className="border-slate-400 rounded-sm"
                          />
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-xs font-semibold text-slate-900 font-sans">
                            {transaction.transaction_id}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                            {transaction.transaction_type?.replace(/_/g, " ") || "Placement Fee"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-xs font-semibold text-slate-900 font-sans">
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-xs font-semibold text-slate-900 font-sans">
                            {transaction.payment_method || "MTN Mobile Money"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                            {transaction.status || "Completed"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-xs font-semibold text-slate-900 font-sans">
                            {format(new Date(transaction.created_at), "MMM dd, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 pr-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedTransactionId(transaction.id);
                              setDetailsModalOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )
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

      <CompanyTransactionDetailsModal
        transactionId={selectedTransactionId}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedTransactionId(null);
        }}
      />
    </div>
  );
};

export default CompanyTransactions;