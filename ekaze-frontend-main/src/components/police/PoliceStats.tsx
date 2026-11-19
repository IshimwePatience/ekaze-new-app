import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { usePoliceDashboard } from "@/hooks/usePoliceAnalytics";
import { useLanguage } from "@/contexts/LanguageContext";

const PoliceStats = () => {
  const { t } = useLanguage();
  const { data, isLoading, isError } = usePoliceDashboard();

  if (isLoading) {
    return (
      <div className="space-y-4 p-2">
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
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4 p-2">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <div>
                <h3 className="font-semibold text-sm text-destructive">
                  {t("police.policeStats.loadError")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("police.policeStats.loadErrorHint")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { statistics } = data.data || {};

  const totalIncidentsObj = statistics?.total_incidents || { value: 0, formatted_change: "0", trend: "neutral" };
  const pendingReviewObj = statistics?.pending_review || { value: 0, formatted_change: "0", trend: "neutral" };
  const resolvedObj = statistics?.resolved || { value: 0, formatted_change: "0", trend: "neutral" };
  const criticalCasesObj = statistics?.critical_cases || { value: 0, formatted_change: "0", trend: "neutral" };

  const stats = [
    {
      title: t("police.policeStats.totalIncidents"),
      value: (totalIncidentsObj.value ?? 0).toString(),
      subtitle: t("police.policeStats.inPeriod"),
      percentage: t("police.policeStats.vsPrevious"),
      icon: AlertTriangle,
    },
    {
      title: t("police.policeStats.pendingReview"),
      value: (pendingReviewObj.value ?? 0).toString(),
      subtitle: t("police.policeStats.awaitingAction"),
      percentage: t("police.policeStats.vsPrevious"),
      icon: FileText,
    },
    {
      title: t("police.policeStats.resolved"),
      value: (resolvedObj.value ?? 0).toString(),
      subtitle: t("police.policeStats.inPeriod"),
      percentage: t("police.policeStats.vsPrevious"),
      icon: CheckCircle2,
    },
    {
      title: t("police.policeStats.criticalCases"),
      value: (criticalCasesObj.value ?? 0).toString(),
      subtitle: t("police.policeStats.urgent"),
      percentage: t("police.policeStats.vsPrevious"),
      icon: XCircle,
    },
  ];

  return (
    <div className="space-y-6 bg-white p-2 min-h-screen">
      {/* GCP Console Homepage Hero Welcome Banner (White & Coursera Blue) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            <p className="text-xs text-slate-500 font-normal">Welcome, Police Officer</p>
            <h1 className="text-2xl font-normal text-slate-900 tracking-tight">
              Monitor security incidents, worker identity verification & clearance
            </h1>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>NIDA Database Worker Identity Verification</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>24/7 Real-Time Incident Reporting & Clearance Audit</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => {
                  localStorage.setItem('police_active_tab', 'profile');
                  window.dispatchEvent(new CustomEvent('police-navigate', { detail: 'profile' }));
                  window.dispatchEvent(new CustomEvent('dashboard-navigate', { detail: 'profile' }));
                }}
                className="px-4 py-1.5 bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6 space-y-4">
            <p className="text-xs text-slate-500 font-medium">Quick options</p>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-900">Incident Clearance Portal</p>
              <span className="text-xs text-[#2478b8] font-medium">Active Clearance Log</span>
            </div>
          </div>
        </div>
      </div>

      {/* GCP Quick Action Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-normal flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          <span>Report New Security Incident</span>
        </button>
        <button
          className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-normal flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          <span>Verify Worker NIDA Identity</span>
        </button>
      </div>

      {/* GCP Resource Cards Grid */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-normal text-slate-900 tracking-tight">
          Security Incidents & Investigations Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200 hover:border-slate-400 rounded-lg p-4 transition-all flex flex-col justify-between h-36 cursor-pointer shadow-2xs group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-slate-50 text-[#2478b8] group-hover:bg-blue-50 transition-colors shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#2478b8] transition-colors">
                      {stat.title}
                    </p>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-normal">
                  <span className="text-lg font-bold text-slate-900">{stat.value}</span>
                  <span className="text-slate-400">{stat.percentage}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PoliceStats;