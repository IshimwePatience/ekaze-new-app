import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  Search,
  Eye,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Wallet,
  CreditCardIcon,
} from "lucide-react";
import { useWorkerTransactions, useWorkerTransactionStatistics } from "@/hooks/useWorkerTransactions";
import { workerTransactionApi } from "@/api/workerTransactionService";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { WorkerTransactionFilters, WorkerTransactionItem } from "@/types/worker-transaction.types";
import WorkerTransactionDetailsModal from "./WorkerTransactionDetailsModal";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WorkerTransactions = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"all" | "earnings" | "pending">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('pdf');

  const filters: WorkerTransactionFilters = {
    type: activeTab === "earnings" ? undefined : 
          activeTab === "pending" ? undefined : undefined,
    status: activeTab === "pending" ? "pending" : 
            activeTab === "earnings" ? "completed" : undefined,
    start_date: dateRange.start || undefined,
    end_date: dateRange.end || undefined,
    search: searchTerm || undefined,
    per_page: 15,
  };

  const { data, isLoading, isError, refetch } = useWorkerTransactions(currentPage, filters);
  const { data: statsData } = useWorkerTransactionStatistics();

  const handleTabChange = (value: string) => {
    setActiveTab(value as typeof activeTab);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleViewDetails = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedTransactionId(null);
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [type]: value }));
    setCurrentPage(1);
  };

const handleExport = async (fmt: 'json' | 'csv' | 'pdf' = exportFormat) => {
    try {
      const blob = await workerTransactionApi.exportTransactions(fmt, filters);
      const mimeTypes = { json: 'application/json', csv: 'text/csv', pdf: 'application/pdf' };
      const url = window.URL.createObjectURL(new Blob([blob], { type: mimeTypes[fmt] }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-transactions-${format(new Date(), 'yyyy-MM-dd')}.${fmt}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return styles[status as keyof typeof styles] || "";
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      subscription_fee: "bg-purple-100 text-purple-800 border-purple-200",
      salary_deduction: "bg-indigo-100 text-indigo-800 border-indigo-200",
      worker_registration: "bg-cyan-100 text-cyan-800 border-cyan-200",
    };
    return styles[type as keyof typeof styles] || "";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      subscription_fee: t("worker.transactions.types.subscription_fee"),
      salary_deduction: t("worker.transactions.types.salary_deduction"),
      worker_registration: t("worker.transactions.types.worker_registration"),
    };
    return labels[type] || type.replace('_', ' ');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-3 w-80 mt-1.5" />
          </div>
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="space-y-4">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <div>
                <h3 className="font-semibold text-sm text-destructive">
                  {t("worker.transactions.loadError")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("worker.transactions.loadErrorHint")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statistics = statsData?.data;
  const transactions = data.data.data;
  const pagination = data.data;

  const stats = [
    {
      title: t("worker.transactions.stats.totalEarnings.title"),
      value: formatCurrency(statistics?.summary.total_earnings || 0),
      subtitle: t("worker.transactions.stats.totalEarnings.subtitle"),
      change: statistics?.summary.total_earnings > 0 ? `+${formatCurrency(Math.min(statistics.summary.total_earnings, 500000))}` : "0",
      percentage: t("worker.transactions.stats.totalEarnings.percentage"),
      trend: statistics?.summary.total_earnings > 0 ? "up" : "neutral",
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-50",
      darkBgColor: "dark:bg-green-950/30",
    },
    {
      title: t("worker.transactions.stats.totalTransactions.title"),
      value: statistics?.summary.total_transactions.toString() || "0",
      subtitle: t("worker.transactions.stats.totalTransactions.subtitle"),
      change: statistics?.summary.total_transactions > 0 ? `+${Math.min(statistics.summary.total_transactions, 50)}` : "0",
      percentage: `${statistics?.summary.success_rate || 0}% ${t("worker.transactions.stats.totalTransactions.percentage")}`,
      trend: statistics?.summary.success_rate >= 90 ? "up" : "neutral",
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      darkBgColor: "dark:bg-blue-950/30",
    },
    {
      title: t("worker.transactions.stats.pending.title"),
      value: statistics?.summary.pending_transactions.toString() || "0",
      subtitle: t("worker.transactions.stats.pending.subtitle"),
      change: `${statistics?.summary.pending_transactions || 0}`,
      percentage: t("worker.transactions.stats.pending.percentage"),
      trend: statistics?.summary.pending_transactions > 0 ? "down" : "neutral",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      darkBgColor: "dark:bg-orange-950/30",
    },
    {
      title: t("worker.transactions.stats.failed.title"),
      value: statistics?.summary.failed_transactions.toString() || "0",
      subtitle: t("worker.transactions.stats.failed.subtitle"),
      change: `${statistics?.summary.failed_transactions || 0}`,
      percentage: `${Math.round((statistics?.summary.failed_transactions || 0) / (statistics?.summary.total_transactions || 1) * 100)}% ${t("worker.transactions.stats.failed.percentage")}`,
      trend: statistics?.summary.failed_transactions > 0 ? "down" : "neutral",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      darkBgColor: "dark:bg-red-950/30",
    },
  ];

  // Prepare data for charts
  const monthlyEarningsData = statistics?.monthly_earnings.map(item => ({
    month: item.month,
    earnings: item.total,
    transactions: item.count,
  })) || [];

  const earningsByTypeData = Object.entries(statistics?.earnings_by_type || {}).map(([type, total]) => ({
    type: getTypeLabel(type),
    value: total,
    color: getTypeColor(type),
  }));

  const dailyEarningsData = statistics?.daily_earnings.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    earnings: item.total,
  })) || [];

  const transactionTypeData = Object.entries(statistics?.transaction_types || {}).map(([type, data]) => ({
    type: getTypeLabel(type),
    count: data.count,
    earnings: data.total,
  }));

  function getTypeColor(type: string) {
    const colors: Record<string, string> = {
      subscription_fee: '#8b5cf6',
      salary_deduction: '#6366f1',
      worker_registration: '#06b6d4',
    };
    return colors[type] || '#9ca3af';
  }

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 pt-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t("worker.transactions.title")}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("worker.transactions.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0">
            <Select
              value={exportFormat}
              onValueChange={(v) => setExportFormat(v as 'json' | 'csv' | 'pdf')}
            >
              <SelectTrigger className="w-[70px] h-8 text-xs rounded-r-none border-r-0 border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() => handleExport(exportFormat)}
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded-r rounded-l-none shadow-2xs flex items-center gap-1.5 cursor-pointer h-8"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t("worker.transactions.export")}</span>
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="h-8 text-xs gap-1.5 border-slate-200 bg-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t("worker.transactions.refresh")}
          </Button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Earnings Chart */}
        <Card className="border-border/40 shadow-sm" style={{ borderRadius: '10px' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t("worker.transactions.charts.monthlyEarnings")}
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {monthlyEarningsData.length} {t("worker.transactions.charts.months")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyEarningsData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                  tickFormatter={(value) => `${value / 1000}K`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), t("worker.transactions.charts.earnings")]}
                  contentStyle={{ 
                    fontSize: '11px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEarnings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Earnings by Type Pie Chart */}
        <Card className="border-border/40 shadow-sm" style={{ borderRadius: '10px' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                {t("worker.transactions.charts.earningsByType")}
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {earningsByTypeData.length} {t("worker.transactions.charts.types")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            {earningsByTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={earningsByTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {earningsByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), t("worker.transactions.charts.earnings")]}
                    contentStyle={{ 
                      fontSize: '11px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground">{t("worker.transactions.charts.noData")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Earnings Chart */}
        <Card className="border-border/40 shadow-sm" style={{ borderRadius: '10px' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {t("worker.transactions.charts.dailyEarnings")}
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {dailyEarningsData.length} {t("worker.transactions.charts.days")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyEarningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                  tickFormatter={(value) => `${value / 1000}K`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), t("worker.transactions.charts.earnings")]}
                  contentStyle={{ 
                    fontSize: '11px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <Bar 
                  dataKey="earnings" 
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Type Summary */}
        <Card className="border-border/40 shadow-sm" style={{ borderRadius: '10px' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCardIcon className="w-4 h-4" />
                {t("worker.transactions.charts.transactionSummary")}
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {transactionTypeData.length} {t("worker.transactions.charts.types")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <div className="space-y-3">
              {transactionTypeData.map((type, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getTypeColor(Object.keys(statistics?.transaction_types || {})[index]) }}
                    />
                    <span className="text-xs font-medium">{type.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold">{type.count} {t("worker.transactions.transactions")}</p>
                    <p className="text-[10px] text-muted-foreground">{formatCurrency(type.earnings)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-border/40 shadow-sm" style={{ borderRadius: '10px' }}>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <CardHeader className="pb-0 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-transparent p-0">
                <TabsTrigger value="all" className="text-[10px]">
                  {t("worker.transactions.tabs.all")}
                </TabsTrigger>
                <TabsTrigger value="earnings" className="text-[10px]">
                  <CreditCardIcon className="w-3.5 h-3.5 mr-0 sm:mr-1.5" />
                  <span className="hidden sm:inline">{t("worker.transactions.tabs.earnings")}</span>
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-[10px]">
                  <Clock className="w-3.5 h-3.5 mr-0 sm:mr-1.5" />
                  <span className="hidden sm:inline">{t("worker.transactions.tabs.pending")}</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      type="date"
                      placeholder={t("worker.transactions.filters.startDate")}
                      value={dateRange.start}
                      onChange={(e) => handleDateChange('start', e.target.value)}
                      className="pl-8 h-9 text-xs w-full sm:w-32"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      type="date"
                      placeholder={t("worker.transactions.filters.endDate")}
                      value={dateRange.end}
                      onChange={(e) => handleDateChange('end', e.target.value)}
                      className="pl-8 h-9 text-xs w-full sm:w-32"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="relative w-full sm:w-48">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder={t("worker.transactions.filters.search")}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-8 h-9 text-xs"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs gap-1.5"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {t("worker.transactions.refresh")}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            {/* All Transactions Tab */}
            <TabsContent value="all" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">{t("worker.transactions.all.title")}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {transactions.length} {t("worker.transactions.transactions")}
                    </Badge>
                    {data.summary && (
                      <Badge variant="outline" className="text-[10px]">
                        {t("worker.transactions.all.total")}: {formatCurrency(data.summary.total_amount)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.id")}
                        </th>
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.type")}
                        </th>
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.amount")}
                        </th>
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.status")}
                        </th>
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.method")}
                        </th>
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.date")}
                        </th>
                        <th className="text-right py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8">
                            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">{t("worker.transactions.empty.noTransactions")}</p>
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction: WorkerTransactionItem) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-3">
                              <span className="text-xs font-mono font-medium text-foreground">
                                {transaction.transaction_id}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <Badge className={`text-[9px] ${getTypeBadge(transaction.transaction_type)}`}>
                                {getTypeLabel(transaction.transaction_type)}
                              </Badge>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-xs font-semibold text-foreground">
                                {formatCurrency(transaction.amount)}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <Badge className={`text-[9px] ${getStatusBadge(transaction.status)}`}>
                                {t(`worker.transactions.status.${transaction.status}`)}
                              </Badge>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-xs text-muted-foreground">
                                {transaction.payment_method || t("worker.transactions.notAvailable")}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetails(transaction.id)}
                                className="h-8 w-8 p-0 hover:bg-muted/50"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      {t("worker.transactions.pagination.showing")} {pagination.from} {t("worker.transactions.pagination.to")} {pagination.to} {t("worker.transactions.pagination.of")} {pagination.total} {t("worker.transactions.pagination.results")}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="h-8 text-xs"
                      >
                        {t("worker.transactions.pagination.previous")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))
                        }
                        disabled={currentPage === pagination.last_page}
                        className="h-8 text-xs"
                      >
                        {t("worker.transactions.pagination.next")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Earnings Tab */}
            <TabsContent value="earnings" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">{t("worker.transactions.earnings.title")}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {transactions.length} {t("worker.transactions.transactions")}
                    </Badge>
                    {data.summary && (
                      <Badge variant="default" className="text-[10px]">
                        {t("worker.transactions.earnings.total")}: {formatCurrency(data.summary.total_amount)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.id")}
                        </th>
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.type")}
                        </th>
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.amount")}
                        </th>
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.method")}
                        </th>
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.date")}
                        </th>
                        <th className="text-right py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8">
                            <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">{t("worker.transactions.empty.noEarnings")}</p>
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction: WorkerTransactionItem) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-3">
                              <span className="text-xs font-mono font-medium text-foreground">
                                {transaction.transaction_id}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <Badge className={`text-[9px] ${getTypeBadge(transaction.transaction_type)}`}>
                                {getTypeLabel(transaction.transaction_type)}
                              </Badge>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-xs font-semibold text-foreground">
                                {formatCurrency(transaction.amount)}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-xs text-muted-foreground">
                                {transaction.payment_method || t("worker.transactions.notAvailable")}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetails(transaction.id)}
                                className="h-8 w-8 p-0 hover:bg-muted/50"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {pagination.last_page > 1 && (
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      {t("worker.transactions.pagination.showing")} {pagination.from} {t("worker.transactions.pagination.to")} {pagination.to} {t("worker.transactions.pagination.of")} {pagination.total} {t("worker.transactions.pagination.results")}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="h-8 text-xs"
                      >
                        {t("worker.transactions.pagination.previous")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))
                        }
                        disabled={currentPage === pagination.last_page}
                        className="h-8 text-xs"
                      >
                        {t("worker.transactions.pagination.next")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Pending Tab */}
            <TabsContent value="pending" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">{t("worker.transactions.pending.title")}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {transactions.length} {t("worker.transactions.transactions")}
                    </Badge>
                    {data.summary && (
                      <Badge variant="outline" className="text-[10px]">
                        {t("worker.transactions.pending.total")}: {formatCurrency(data.summary.total_amount)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.id")}
                        </th>
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.type")}
                        </th>
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.amount")}
                        </th>
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.created")}
                        </th>
                        <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.description")}
                        </th>
                        <th className="text-right py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("worker.transactions.table.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8">
                            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">{t("worker.transactions.empty.noPending")}</p>
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction: WorkerTransactionItem) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-3">
                              <span className="text-xs font-mono font-medium text-foreground">
                                {transaction.transaction_id}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <Badge className={`text-[9px] ${getTypeBadge(transaction.transaction_type)}`}>
                                {getTypeLabel(transaction.transaction_type)}
                              </Badge>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-xs font-semibold text-foreground">
                                {formatCurrency(transaction.amount)}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {transaction.description || t("worker.transactions.noDescription")}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetails(transaction.id)}
                                className="h-8 w-8 p-0 hover:bg-muted/50"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {pagination.last_page > 1 && (
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      {t("worker.transactions.pagination.showing")} {pagination.from} {t("worker.transactions.pagination.to")} {pagination.to} {t("worker.transactions.pagination.of")} {pagination.total} {t("worker.transactions.pagination.results")}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="h-8 text-xs"
                      >
                        {t("worker.transactions.pagination.previous")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))
                        }
                        disabled={currentPage === pagination.last_page}
                        className="h-8 text-xs"
                      >
                        {t("worker.transactions.pagination.next")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Recent Transactions Card */}
      {statistics?.recent_transactions && statistics.recent_transactions.length > 0 && (
        <Card className="border-border/40 shadow-sm" style={{ borderRadius: '10px' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t("worker.transactions.recent.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.recent_transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-600' 
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : transaction.status === 'pending' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{transaction.transaction_id}</p>
                      <p className="text-[10px] text-muted-foreground">{transaction.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold">{formatCurrency(transaction.amount)}</p>
                    <p className="text-[10px] text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <WorkerTransactionDetailsModal
        transactionId={selectedTransactionId}
        isOpen={detailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
};

export default WorkerTransactions;