import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  Search,
  TrendingUp,
  TrendingDown,
  Download,
  Eye,
  Clock,
  AlertTriangle,
  Building2,
  Users,
  RefreshCw,
  Filter,
  X,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Inbox,
  CreditCard,
  Receipt,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { useToast } from "@/hooks/use-toast";

import { useTransactions, useTransactionStatistics, useExportTransactions } from "@/hooks/useTransactions";
import type { Transaction, TransactionFilters } from "@/types/transaction.types";
import TransactionDetailsModal from "./TransactionDetailsModal";
import { formatCurrency, getStatusColor, getTransactionTypeLabel, getPaymentMethodLabel } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";

const TransactionManagement = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('pdf');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch data based on active tab
  const { data: transactionsResponse, isLoading: isLoadingAll } = useTransactions(currentPage, {
    ...filters,
    status: activeTab !== "all" ? activeTab : undefined,
    per_page: perPage,
  });

  const { data: statisticsData, isLoading: isLoadingStats } = useTransactionStatistics();

  const exportMutation = useExportTransactions();

  // Extract data from the correct response structure
  const transactions = Array.isArray(transactionsResponse?.data?.data) 
    ? transactionsResponse.data.data 
    : [];
  const paginationInfo = transactionsResponse?.data;
  const statistics = transactionsResponse?.summary;
  const analytics = statisticsData?.data;

  // Helper function to safely convert string|number to number
  const toNumber = (value: string | number | undefined): number => {
    if (value === undefined || value === null) return 0;
    return typeof value === 'string' ? parseFloat(value) || 0 : value;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilters(prev => ({
      ...prev,
      status: value === "all" ? undefined : value
    }));
  };

  const handleFilterChange = (key: keyof TransactionFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value
    }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.length >= 3 || value === "") {
      handleFilterChange("search", value);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({});
    setActiveTab("all");
  };

const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({ format: exportFormat, ...filters });
      const mimeTypes = { json: 'application/json', csv: 'text/csv', pdf: 'application/pdf' };
      const url = window.URL.createObjectURL(new Blob([blob], { type: mimeTypes[exportFormat] }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colorClass = getStatusColor(status);
    switch (colorClass) {
      case 'green': return t("admin.transactionManagement.statusGreen");
      case 'yellow': return t("admin.transactionManagement.statusYellow");
      case 'red': return t("admin.transactionManagement.statusRed");
      case 'orange': return t("admin.transactionManagement.statusOrange");
      case 'purple': return t("admin.transactionManagement.statusPurple");
      default: return t("admin.transactionManagement.statusGray");
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      completed: t("admin.transactionManagement.completed"),
      pending: t("admin.transactionManagement.pending"),
      failed: t("admin.transactionManagement.failed_status"),
      review: t("admin.transactionManagement.review"),
      refunded: t("admin.transactionManagement.refunded"),
    };
    return statusMap[status] || status;
  };

  const getTransactionTypeText = (type: string): string => {
    const typeMap: Record<string, string> = {
      employer_registration: t("admin.transactionManagement.employer_registration"),
      worker_registration: t("admin.transactionManagement.worker_registration"),
      refund: t("admin.transactionManagement.refund"),
      service_fee: t("admin.transactionManagement.service_fee"),
      subscription: t("admin.transactionManagement.subscription"),
    };
    return typeMap[type] || type;
  };

  const getPaymentMethodText = (method: string): string => {
    const methodMap: Record<string, string> = {
      mobile_money: t("admin.transactionManagement.mobile_money"),
      bank_transfer: t("admin.transactionManagement.bank_transfer"),
      card: t("admin.transactionManagement.card"),
      cash: t("admin.transactionManagement.cash"),
    };
    return methodMap[method] || method;
  };

  // Convert string values to numbers for calculations
  const totalRevenue = toNumber(statistics?.total_revenue);
  const pendingAmount = toNumber(statistics?.pending_amount);
  const failedAmount = toNumber(statistics?.failed_amount);
  const todayRevenue = toNumber(statistics?.today_revenue);
  const totalTransactions = toNumber(statistics?.total_transactions);
  const monthRevenue = toNumber(statistics?.this_month_revenue);

  const activeFilterCount = Object.keys(filters).filter(key => 
    filters[key as keyof TransactionFilters] !== undefined && 
    key !== 'search'
  ).length + (searchTerm ? 1 : 0);

  // Stats configuration matching the incident management design
  const stats = [
    {
      title: t("admin.transactionManagement.totalRevenue"),
      value: formatCurrency(totalRevenue),
      subtitle: t("admin.transactionManagement.allTime"),
      change: monthRevenue,
      percentage: t("admin.transactionManagement.thisMonth"),
      trend: monthRevenue > 0 ? "up" : "neutral",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      darkBgColor: "dark:bg-green-950/30",
    },
    {
      title: t("admin.transactionManagement.todayRevenue"),
      value: formatCurrency(todayRevenue),
      subtitle: t("admin.transactionManagement.hours24"),
      change: todayRevenue,
      percentage: t("admin.transactionManagement.today"),
      trend: todayRevenue > 0 ? "up" : "neutral",
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      darkBgColor: "dark:bg-blue-950/30",
    },
    {
      title: t("admin.transactionManagement.pendingAmount"),
      value: formatCurrency(pendingAmount),
      subtitle: t("admin.transactionManagement.awaiting"),
      change: pendingAmount,
      percentage: t("admin.transactionManagement.inQueue"),
      trend: pendingAmount > 0 ? "down" : "neutral",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      darkBgColor: "dark:bg-yellow-950/30",
    },
    {
      title: t("admin.transactionManagement.failedAmount"),
      value: formatCurrency(failedAmount),
      subtitle: t("admin.transactionManagement.unsuccessful"),
      change: failedAmount,
      percentage: t("admin.transactionManagement.failed"),
      trend: failedAmount > 0 ? "down" : "up",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      darkBgColor: "dark:bg-red-950/30",
    },
    {
      title: t("admin.transactionManagement.totalTransactions"),
      value: totalTransactions.toString(),
      subtitle: t("admin.transactionManagement.processed"),
      change: totalTransactions,
      percentage: t("admin.transactionManagement.allTime"),
      trend: "up",
      icon: Receipt,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      darkBgColor: "dark:bg-purple-950/30",
    },
  ];

  const TransactionsTable = ({
    transactions: tableTransactions,
    loading,
  }: {
    transactions: Transaction[];
    loading: boolean;
  }) => {
    if (loading) {
      return (
        <div className="py-6 space-y-3">
          <Skeleton className="h-9 w-full rounded-none" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-none" />
          ))}
        </div>
      );
    }

    if (tableTransactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <CharacterIllustration type="transactions" className="w-36 h-36 mb-4" />
          <h3 className="text-base font-bold text-slate-800 mb-1">{t("admin.transactionManagement.noTransactionsFound")}</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            {searchTerm || Object.keys(filters).some(k => filters[k as keyof TransactionFilters] !== undefined)
              ? t("admin.transactionManagement.noTransactionsMatch")
              : activeTab === "all"
              ? t("admin.transactionManagement.noTransactionsRecorded")
              : activeTab === "completed"
              ? t("admin.transactionManagement.noCompletedTransactions")
              : activeTab === "pending"
              ? t("admin.transactionManagement.noPendingTransactions")
              : activeTab === "failed"
              ? t("admin.transactionManagement.noFailedTransactions")
              : activeTab === "review"
              ? t("admin.transactionManagement.noReviewTransactions")
              : t("admin.transactionManagement.noRefundedTransactions")}
          </p>
          {(searchTerm || Object.keys(filters).some(k => filters[k as keyof TransactionFilters] !== undefined)) && (
            <Button
              size="sm"
              onClick={handleClearFilters}
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white rounded-lg text-xs font-semibold px-4 h-8"
            >
              {t("admin.transactionManagement.clearFilters")}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto w-full">
        <Table className="w-full min-w-[850px] border-collapse">
          <TableHeader className="bg-transparent border-b border-slate-200">
            <TableRow className="hover:bg-transparent border-b border-slate-200">
              <TableHead className="text-xs font-semibold text-slate-900 font-sans pl-4">{t("admin.transactionManagement.transactionId")}</TableHead>
              <TableHead className="text-xs font-semibold text-slate-900 font-sans">{t("admin.transactionManagement.user")}</TableHead>
              <TableHead className="text-xs font-semibold text-slate-900 font-sans">{t("admin.transactionManagement.type")}</TableHead>
              <TableHead className="text-xs font-semibold text-slate-900 font-sans">{t("admin.transactionManagement.amount")}</TableHead>
              <TableHead className="text-xs font-semibold text-slate-900 font-sans hidden md:table-cell">{t("admin.transactionManagement.method")}</TableHead>
              <TableHead className="text-xs font-semibold text-slate-900 font-sans">{t("admin.transactionManagement.status")}</TableHead>
              <TableHead className="text-xs font-semibold text-slate-900 font-sans hidden lg:table-cell">{t("admin.transactionManagement.date")}</TableHead>
              <TableHead className="text-xs font-semibold text-slate-900 font-sans text-right pr-4">{t("admin.transactionManagement.actions")}</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {tableTransactions.map((txn, index) => (
                <TableRow
                  key={txn.id}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="py-3 pl-4 text-xs">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{txn.transaction_id}</p>
                      <p className="text-[11px] font-normal text-slate-500">
                        {t("admin.transactionManagement.ref")}: {txn.payment_reference || t("admin.transactionManagement.noEmail")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-xs">
                    <div className="flex items-center gap-2">
                      {txn.transaction_type === "worker_registration" ? (
                        <Building2 className="w-4 h-4 text-slate-500" />
                      ) : (
                        <Users className="w-4 h-4 text-slate-500" />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{txn.user?.name || t("admin.transactionManagement.unknown")}</p>
                        <p className="text-[11px] font-normal text-slate-500">
                          {txn.user?.email || t("admin.transactionManagement.noEmail")}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-slate-700 font-normal">
                    {getTransactionTypeText(txn.transaction_type)}
                  </TableCell>
                  <TableCell className="py-3 text-xs">
                    <span className="text-xs font-semibold text-slate-900">
                      {txn.transaction_type === "refund" ? "-" : "+"}
                      {formatCurrency(toNumber(txn.amount))}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-slate-700 font-normal hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      {getPaymentMethodText(txn.payment_method)}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-xs">
                    <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                      {getStatusText(txn.status)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-slate-700 font-normal hidden lg:table-cell">
                    {new Date(txn.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-xs py-3 pr-4 text-right">
                    <CustomDropdown
                      widthClass="w-44"
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
                          onClick: () => {
                            setSelectedTransaction(txn);
                            setViewDialogOpen(true);
                          },
                        },
                        ...(txn.status === "completed" && txn.transaction_type !== "refund"
                          ? [
                              {
                                label: "Issue Refund",
                                danger: true,
                                onClick: () => {
                                  setSelectedTransaction(txn);
                                  setRefundDialogOpen(true);
                                },
                              },
                            ]
                          : []),
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    );
  };

  return (
    <div className="w-full bg-white space-y-0">
      {/* Header */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb title={t("admin.transactionManagement.title")}>
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              onClick={() => setExportDialogOpen(true)}
              disabled={exportMutation.isPending}
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{exportMutation.isPending ? t("admin.transactionManagement.exporting") : t("admin.transactionManagement.export")}</span>
            </Button>
          </div>
        </PageHeaderBreadcrumb>
      </div>

      {/* Main YouTube Studio Styled Content Layout */}
      <div className="w-full bg-white border-t border-slate-200">
        <StudioFilterBar
          searchPlaceholder={t("admin.transactionManagement.searchPlaceholder")}
          searchValue={searchTerm}
          onSearchChange={handleSearch}
          filters={[
            {
              id: "type",
              label: t("admin.transactionManagement.typeFilter"),
              type: "select",
              currentValue: filters.type,
              options: [
                { label: t("admin.transactionManagement.employer_registration"), value: "employer_registration" },
                { label: t("admin.transactionManagement.worker_registration"), value: "worker_registration" },
                { label: t("admin.transactionManagement.refund"), value: "refund" },
                { label: t("admin.transactionManagement.service_fee"), value: "service_fee" },
                { label: t("admin.transactionManagement.subscription"), value: "subscription" },
              ],
            },
            {
              id: "payment_method",
              label: t("admin.transactionManagement.paymentMethod"),
              type: "select",
              currentValue: filters.payment_method,
              options: [
                { label: t("admin.transactionManagement.mobile_money"), value: "mobile_money" },
                { label: t("admin.transactionManagement.bank_transfer"), value: "bank_transfer" },
                { label: t("admin.transactionManagement.card"), value: "card" },
                { label: t("admin.transactionManagement.cash"), value: "cash" },
              ],
            }
          ]}
          onFilterSelect={(id, val) => handleFilterChange(id as keyof TransactionFilters, val)}
          onRemoveFilter={(id) => handleFilterChange(id as keyof TransactionFilters, undefined)}
          onClearAll={handleClearFilters}
        />

        {/* Table Container */}
        <TransactionsTable transactions={transactions} loading={isLoadingAll} />

        {paginationInfo && (
          <YouTubeStudioPagination
            currentPage={currentPage}
            lastPage={paginationInfo.last_page || Math.max(1, Math.ceil((paginationInfo.total || transactions.length) / perPage))}
            perPage={perPage}
            total={paginationInfo.total || transactions.length}
            onPageChange={(page) => setCurrentPage(page)}
            onPerPageChange={(val) => {
              setPerPage(val);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transactionId={selectedTransaction?.transaction_id || null}
        isOpen={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedTransaction(null);
        }}
      />

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.transactionManagement.issueRefund")}</DialogTitle>
            <DialogDescription>
              {t("admin.transactionManagement.refundConfirmation")
                .replace("{amount}", formatCurrency(toNumber(selectedTransaction?.amount)))
                .replace("{user}", selectedTransaction?.user?.name || "")}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-950/20 dark:border-yellow-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                {t("admin.transactionManagement.refundWarning")}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRefundDialogOpen(false)}
            >
              {t("admin.transactionManagement.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                toast({
                  title: t("admin.transactionManagement.refundInitiated"),
                  description: t("admin.transactionManagement.refundDescription")
                    .replace("{amount}", formatCurrency(toNumber(selectedTransaction?.amount))),
                });
                setRefundDialogOpen(false);
                setSelectedTransaction(null);
              }}
            >
              {t("admin.transactionManagement.confirmRefund")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.transactionManagement.exportTransactions")}</DialogTitle>
            <DialogDescription>
              {t("admin.transactionManagement.exportDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("admin.transactionManagement.exportFormat")}</label>
          <Select value={exportFormat} onValueChange={(value: 'json' | 'csv' | 'pdf') => setExportFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/20 dark:border-blue-900">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {t("admin.transactionManagement.exportInfo")}
                  {filters.from_date || filters.to_date ? ` ${t("admin.transactionManagement.dateRangeInfo")}` : ""}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setExportDialogOpen(false)}
              disabled={exportMutation.isPending}
            >
              {t("admin.transactionManagement.cancel")}
            </Button>
            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? t("admin.transactionManagement.exporting") : t("admin.transactionManagement.export")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionManagement;