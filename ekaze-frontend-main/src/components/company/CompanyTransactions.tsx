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
import {
  CheckCircle2,
  MoreVertical,
  X,
  CreditCard,
  AlertCircle,
  Download,
  Eye,
  FileSpreadsheet,
} from "lucide-react";
import { useCompanyTransactions } from "@/hooks/useCompanyTransactions";
import { format } from "date-fns";
import { StudioFilterBar, type FilterCategory } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import CompanyTransactionDetailsModal from "./CompanyTransactionDetailsModal";
import { companyTransactionApi } from "@/api/companyTransactionService";
import type { CompanyTransactionFilters, CompanyTransactionItem } from "@/types/company-transaction.types";

const CompanyTransactions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const filters: CompanyTransactionFilters = {
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchTerm || undefined,
    per_page: perPage,
  };

  const { data, isLoading, isError } = useCompanyTransactions(currentPage, filters);

  const transactions: CompanyTransactionItem[] = useMemo(() => {
    const list = data?.data?.data || [];
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (t) =>
        t.transaction_id?.toLowerCase().includes(term) ||
        t.payment_reference?.toLowerCase().includes(term) ||
        (t as any).payment_phone?.includes(term) ||
        (t as any).phone_number?.includes(term)
    );
  }, [data?.data?.data, searchTerm]);

  const pagination = data?.data;

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

  const currentListIds = useMemo(() => transactions.map((t) => t.id), [transactions]);

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
      a.download = `card-payments-report-${format(new Date(), "yyyy-MM-dd")}.${fmt}`;
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
      id: "status",
      label: "Payment Status",
      options: [
        { value: "all", label: "All Status" },
        { value: "completed", label: "Completed" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
      ],
    },
  ];

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Top Page Header Breadcrumb */}
      <div className="flex items-center justify-between pb-1">
        <PageHeaderBreadcrumb title="Card Payments">
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

      {/* Main Flat Studio Layout */}
      <div className="w-full bg-white border-t border-slate-200">
        {selectedIds.length === 0 ? (
          <StudioFilterBar
            categories={filterCategories}
            activeFilters={{
              status: statusFilter,
            }}
            onFilterChange={(catId, val) => {
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
              setCurrentPage(1);
              setSelectedIds([]);
            }}
          />
        ) : (
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
              Error loading card payment records
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Please try refreshing the page.
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <CharacterIllustration
            type="transactions"
            title="No card payments recorded"
            description={
              searchTerm || statusFilter !== "all"
                ? "No card payment records match your filters."
                : "When you pay for driver cards using MTN MoMo, payment records will appear here."
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
                    Cards Paid For
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    MTN MoMo Number
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Amount Paid
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Payment Method
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Date Paid
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 pr-4 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const isSelected = selectedIds.includes(transaction.id);
                  const isSuccess =
                    transaction.status === "completed" ||
                    transaction.status === "successful" ||
                    transaction.status === "paid";
                  const isPending =
                    transaction.status === "pending" || transaction.status === "waiting";
                  const cardsCount =
                    (transaction as any)?.metadata?.worker_ids?.length ||
                    (transaction as any)?.metadata?.requested_worker_ids?.length ||
                    1;
                  const phoneNum =
                    (transaction as any)?.payment_phone ||
                    (transaction as any)?.phone_number ||
                    (transaction as any)?.metadata?.pay_phone ||
                    transaction.user?.phone ||
                    "—";

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

                      {/* Reference ID */}
                      <TableCell className="py-3">
                        <span className="text-xs font-semibold text-slate-900 font-mono">
                          {transaction.payment_reference || transaction.transaction_id || `REF-${transaction.id}`}
                        </span>
                      </TableCell>

                      {/* Cards Paid For */}
                      <TableCell className="py-3">
                        <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          {cardsCount} {cardsCount === 1 ? "Driver Card" : "Driver Cards"}
                        </span>
                      </TableCell>

                      {/* MTN MoMo Number */}
                      <TableCell className="py-3">
                        <span className="text-xs font-medium text-slate-800 font-sans">
                          {phoneNum}
                        </span>
                      </TableCell>

                      {/* Amount Paid */}
                      <TableCell className="py-3">
                        <span className="text-xs font-bold text-slate-900 font-sans">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>

                      {/* Payment Method */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ffcc00] text-black">
                            MTN
                          </span>
                          <span className="text-xs font-medium text-slate-700">MoMo</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3">
                        {isSuccess ? (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded capitalize inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Completed
                          </span>
                        ) : isPending ? (
                          <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded capitalize">
                            Pending
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded capitalize">
                            {transaction.status || "Failed"}
                          </span>
                        )}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-3">
                        <span className="text-xs text-slate-600 font-sans">
                          {transaction.created_at
                            ? format(new Date(transaction.created_at), "MMM dd, yyyy 'at' h:mm a")
                            : "—"}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 pr-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedTransactionId(transaction.id);
                            setDetailsModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                          title="View Details"
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
        )}

        {/* Bottom Pagination */}
        {pagination && pagination.total > 0 && (
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