import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  MapPin,
  Calendar,
  AlertCircle,
  Download,
  X,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { usePoliceIncidents, usePoliceDashboard } from "@/hooks/usePoliceAnalytics";
import type { PoliceAnalyticsFilters } from "@/types/police-analytics.types";
import { format } from "date-fns";
import { policeAnalyticsApi } from "@/api/policeAnalyticsService";
import IncidentDetailsModal from "@/components/police/IncidentDetailsModal";
import IncidentGeoMap from "@/components/police/IncidentGeoMap";
import VisualStatistics from "./VisualStatistics";
import { useLanguage } from "@/contexts/LanguageContext";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";

const IncidentsManagement = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Partial<PoliceAnalyticsFilters>>({
    period: "last_30_days",
    status: "all",
  });
  const [customFromDate, setCustomFromDate] = useState<Date | undefined>();
  const [customToDate, setCustomToDate]     = useState<Date | undefined>();
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "pdf">("pdf");

  // ── Page view: overview | map | stats ────────────────────────────────
  const [pageView, setPageView] = useState<"overview" | "map" | "stats">("overview");

  const { data, isLoading, isError, refetch } = usePoliceIncidents(filters, currentPage, 20);
  const { data: dashboardData } = usePoliceDashboard(filters);

  useEffect(() => {
    if (filters.period === "custom" && customFromDate && customToDate) {
      setFilters((prev) => ({
        ...prev,
        from_date: format(customFromDate, "yyyy-MM-dd"),
        to_date:   format(customToDate,   "yyyy-MM-dd"),
      }));
    }
  }, [customFromDate, customToDate, filters.period]);

  const handleFilterChange = <K extends keyof PoliceAnalyticsFilters>(
    key: K,
    value: PoliceAnalyticsFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    if (key === "period") {
      setShowCustomDates(value === "custom");
      if (value !== "custom") {
        setCustomFromDate(undefined);
        setCustomToDate(undefined);
      }
    }
  };

  const handleClearCustomDates = () => {
    setCustomFromDate(undefined);
    setCustomToDate(undefined);
    setFilters((prev) => ({
      ...prev,
      period:    "last_30_days",
      from_date: undefined,
      to_date:   undefined,
    }));
    setShowCustomDates(false);
  };

  const handleExport = async (fmt: "json" | "csv" | "pdf" = exportFormat) => {
    try {
      const blob = await policeAnalyticsApi.exportAnalytics(fmt, filters);
      const mimeTypes = { json: "application/json", csv: "text/csv", pdf: "application/pdf" };
      const filename  = `incidents-${format(new Date(), "yyyy-MM-dd")}.${fmt}`;
      const url = window.URL.createObjectURL(new Blob([blob], { type: mimeTypes[fmt] }));
      const a   = document.createElement("a");
      a.href     = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? "all" : (value as PoliceAnalyticsFilters["status"]),
    }));
    setCurrentPage(1);
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending:            t("police.incidentsManagement.pending_tab"),
      reported:           t("police.incidentsManagement.pending_tab"),
      investigating:      t("police.incidentsManagement.investigating_tab"),
      under_investigation:t("police.incidentsManagement.investigating_tab"),
      resolved:           t("police.incidentsManagement.resolved_tab"),
    };
    return statusMap[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const statusText = getStatusText(status);
    switch (status) {
      case "reported":
        return <Badge className="text-[9px] bg-orange-500/10 text-orange-700 hover:bg-orange-500/20">{statusText}</Badge>;
      case "under_investigation":
        return <Badge className="text-[9px] bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">{statusText}</Badge>;
      case "resolved":
        return <Badge className="text-[9px] bg-green-500/10 text-green-700 hover:bg-green-500/20">{statusText}</Badge>;
      default:
        return <Badge variant="secondary" className="text-[9px]">{statusText}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-8 h-8 mx-auto text-destructive mb-2" />
        <p className="text-sm text-destructive">{t("police.incidentsManagement.failedToLoad")}</p>
      </div>
    );
  }

  const { incidents, pagination } = data.data;

  const filteredIncidents = searchQuery.trim()
    ? incidents.filter(
        (i) =>
          i.incident_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : incidents;

  const pendingCount       = incidents.filter((i) => i.status === "reported").length;
  const investigatingCount = incidents.filter((i) => i.status === "under_investigation").length;
  const resolvedCount      = incidents.filter((i) => i.status === "resolved").length;

  const stats = dashboardData?.data?.statistics
    ? [
        {
          title:       t("police.incidentsManagement.total"),
          value:       pagination.total.toString(),
          subtitle:    t("police.incidentsManagement.incidents"),
          change:      dashboardData.data.statistics.total_incidents.formatted_change,
          trend:       dashboardData.data.statistics.total_incidents.trend,
          icon:        AlertTriangle,
          color:       "text-red-600",
          bgColor:     "bg-red-50",
          darkBgColor: "dark:bg-red-950/30",
        },
        {
          title:       t("police.incidentsManagement.pending"),
          value:       pendingCount.toString(),
          subtitle:    t("police.incidentsManagement.awaiting"),
          change:      dashboardData.data.statistics.pending_review.formatted_change,
          trend:       dashboardData.data.statistics.pending_review.trend,
          icon:        FileText,
          color:       "text-orange-600",
          bgColor:     "bg-orange-50",
          darkBgColor: "dark:bg-orange-950/30",
        },
        {
          title:       t("police.incidentsManagement.investigating"),
          value:       investigatingCount.toString(),
          subtitle:    t("police.incidentsManagement.inProgress"),
          icon:        Clock,
          color:       "text-blue-600",
          bgColor:     "bg-blue-50",
          darkBgColor: "dark:bg-blue-950/30",
        },
        {
          title:       t("police.incidentsManagement.resolved"),
          value:       resolvedCount.toString(),
          subtitle:    t("police.incidentsManagement.closed"),
          change:      dashboardData.data.statistics.resolved.formatted_change,
          trend:       dashboardData.data.statistics.resolved.trend,
          icon:        CheckCircle2,
          color:       "text-green-600",
          bgColor:     "bg-green-50",
          darkBgColor: "dark:bg-green-950/30",
        },
      ]
    : [];

  // District data from dashboard (real DB data, no dummies)
  const districtIncidents: { district: string; incidents: number; percentage: number }[] =
    dashboardData?.data?.district_incidents ?? [];

  // Incident trends from dashboard
  const incidentTrends = dashboardData?.data?.incident_trends ?? [];

  return (
    <div className="space-y-4">
      {/* ── Page header + three-way toggle ──────────────────────────── */}
      <div className="flex flex-col items-center gap-1 mb-1">
        <h1 className="text-base font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-center">
          {t("police.incidentsManagement.title")}
        </h1>
        <p className="text-[10px] text-muted-foreground text-center">
          {t("police.incidentsManagement.subtitle")}
        </p>

        {/* Three-tab toggle pill */}
        <div className="flex items-center mt-2 bg-muted/60 rounded-full p-1 gap-1">
          {(
            [
              { id: "overview", label: "Overview" },
              { id: "map",      label: "Geo Map" },
              { id: "stats",    label: "Visual Statistics" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setPageView(id)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-300 ${
                pageView === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Shared filter bar (hidden on map / stats) ────────────────── */}
      {pageView === "overview" && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {showCustomDates && (
                <>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <Filter className="w-3 h-3 text-blue-600" />
                    <span className="text-[10px] text-muted-foreground">{t("police.incidentsManagement.from")}:</span>
                    <DatePicker date={customFromDate} onDateChange={setCustomFromDate} placeholder={t("police.incidentsManagement.startDate")} />
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <span className="text-[10px] text-muted-foreground">{t("police.incidentsManagement.to2")}:</span>
                    <DatePicker date={customToDate} onDateChange={setCustomToDate} placeholder={t("police.incidentsManagement.endDate")} disabled={!customFromDate} />
                  </div>
                  <Button size="sm" variant="ghost" onClick={handleClearCustomDates} className="h-8 text-xs">
                    <X className="w-3 h-3 mr-1" />
                    {t("police.incidentsManagement.clear")}
                  </Button>
                </>
              )}

              <Select
                value={filters.period || "last_30_days"}
                onValueChange={(value) => handleFilterChange("period", value as PoliceAnalyticsFilters["period"])}
              >
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder={t("police.incidentsManagement.selectPeriod")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">{t("police.incidentsManagement.last7Days")}</SelectItem>
                  <SelectItem value="last_30_days">{t("police.incidentsManagement.last30Days")}</SelectItem>
                  <SelectItem value="last_90_days">{t("police.incidentsManagement.last90Days")}</SelectItem>
                  <SelectItem value="this_month">{t("police.incidentsManagement.thisMonth")}</SelectItem>
                  <SelectItem value="last_month">{t("police.incidentsManagement.lastMonth")}</SelectItem>
                  <SelectItem value="custom">{t("police.incidentsManagement.customRange")}</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-0">
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as "json" | "csv" | "pdf")}>
                  <SelectTrigger className="w-[70px] h-8 text-xs rounded-r-none border-r-0">
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
                  <span>{t("police.incidentsManagement.export")}</span>
                </Button>
              </div>
            </div>

            {showCustomDates && customFromDate && customToDate && (
              <div className="text-[10px] text-muted-foreground px-2 py-1.5 bg-muted/50 rounded-md mt-2">
                📅 {t("police.incidentsManagement.showingDataFrom")}{" "}
                <span className="font-semibold text-foreground">{format(customFromDate, "PPP")}</span>
                {" "}{t("police.incidentsManagement.to2").toLowerCase()}{" "}
                <span className="font-semibold text-foreground">{format(customToDate, "PPP")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Content panels ────────────────────────────────────────────── */}

      {/* OVERVIEW panel */}
      {pageView === "overview" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-400">
          {/* Tabs bar */}
          <div className="border-b border-slate-200 bg-white">
            <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar">
              {[
                { id: "all", label: t("police.incidentsManagement.all"), count: pagination.total },
                { id: "pending", label: t("police.incidentsManagement.pending_tab"), count: pendingCount },
                { id: "investigating", label: t("police.incidentsManagement.investigating_tab"), count: investigatingCount },
                { id: "resolved", label: t("police.incidentsManagement.resolved_tab"), count: resolvedCount },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center space-x-2 py-3 border-b-2 font-medium text-xs transition-colors whitespace-nowrap ${
                      isActive
                        ? "border-[#2478b8] text-[#2478b8]"
                        : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      isActive ? "bg-[#2478b8]/10 text-[#2478b8] font-semibold" : "bg-slate-100 text-slate-600"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full bg-white p-2 border-t border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder={t("police.incidentsManagement.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs border-slate-200"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="w-full bg-white border-t border-b border-slate-200 overflow-hidden">
            {filteredIncidents.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex flex-col items-center justify-center">
                  <CharacterIllustration type="incidents" className="w-36 h-36 mb-4" />
                  <h3 className="text-base font-bold text-slate-800 mb-1">{t("police.incidentsManagement.noIncidentsFound")}</h3>
                  <p className="text-xs text-slate-500 max-w-sm">No incident records match your criteria.</p>
                </div>
              </div>
            ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border/50 bg-muted/30">
                            {[
                              t("police.incidentsManagement.incidentId"),
                              t("police.incidentsManagement.type"),
                              t("police.incidentsManagement.worker"),
                              t("police.incidentsManagement.location"),
                              t("police.incidentsManagement.status"),
                              t("police.incidentsManagement.reported"),
                              t("police.incidentsManagement.actions"),
                            ].map((h, i) => (
                              <th
                                key={i}
                                className={`py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider ${
                                  i >= 4 ? "text-center" : "text-left"
                                }`}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredIncidents.map((incident, index) => (
                            <tr key={index} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-4">
                                <span className="text-[10px] font-mono font-semibold text-foreground">
                                  {incident.incident_number}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-3 h-3 text-orange-600" />
                                  <span className="text-[10px] font-semibold text-foreground">{incident.type}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <p className="text-[10px] font-semibold text-foreground">{incident.worker.name}</p>
                                  <p className="text-[9px] text-muted-foreground">
                                    {t("police.incidentsManagement.id")}: {incident.worker.worker_id}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">{incident.location}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex justify-center">{getStatusBadge(incident.status)}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">
                                    {incident.reported_date?.split(",")[0] || "N/A"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    title={t("police.incidentsManagement.viewDetails")}
                                    onClick={() => {
                                      setSelectedIncidentId(Number(incident.id));
                                      setIsDetailsModalOpen(true);
                                    }}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
          </div>

          {/* Pagination */}
          {pagination.total > pagination.per_page && (
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                {t("police.incidentsManagement.showing")}{" "}
                {(pagination.current_page - 1) * pagination.per_page + 1}{" "}
                {t("police.incidentsManagement.to2")}{" "}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)}{" "}
                {t("police.incidentsManagement.of")}{" "}
                {pagination.total}{" "}
                {t("police.incidentsManagement.results")}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.current_page === 1}
                  className="h-8 text-xs"
                >
                  {t("police.incidentsManagement.previous")}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {t("police.incidentsManagement.page")}{" "}
                  {pagination.current_page}{" "}
                  {t("police.incidentsManagement.of")}{" "}
                  {pagination.last_page}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))}
                  disabled={pagination.current_page === pagination.last_page}
                  className="h-8 text-xs"
                >
                  {t("police.incidentsManagement.next")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GEO MAP panel */}
      {pageView === "map" && (
        <div className="animate-in fade-in slide-in-from-right-3 duration-400">
          <IncidentGeoMap incidents={filteredIncidents} />
        </div>
      )}

      {/* VISUAL STATISTICS panel */}
      {pageView === "stats" && (
        <div className="animate-in fade-in slide-in-from-right-3 duration-400">
          <VisualStatistics
            incidents={incidents}
            incidentTrends={incidentTrends}
            districtIncidents={districtIncidents}
          />
        </div>
      )}

      <IncidentDetailsModal
        incidentId={selectedIncidentId}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedIncidentId(null);
        }}
        onUpdate={() => refetch()}
      />
    </div>
  );
};

export default IncidentsManagement;