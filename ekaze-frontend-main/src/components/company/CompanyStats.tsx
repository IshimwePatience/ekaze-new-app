import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileText,
  Plus
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyDashboard } from "@/hooks/useCompanies";
import { useCompanyTransactionStatistics } from "@/hooks/useCompanyTransactions";
import { useEmployers } from "@/hooks/useEmployers";
import { useLanguage } from "@/contexts/LanguageContext";

const CompanyStats = () => {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useCompanyDashboard();
  const { data: txStatsData } = useCompanyTransactionStatistics();
  const { data: employersData } = useEmployers(1, { per_page: 1 });

  const navigateTo = (tab: string) => {
    localStorage.setItem('company_active_tab', tab);
    window.dispatchEvent(new CustomEvent('company-navigate', { detail: tab }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4 bg-white p-2">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-44 bg-slate-100" />
            <Skeleton className="h-3 w-80 mt-1.5 bg-slate-100" />
          </div>
          <Skeleton className="h-5 w-28 bg-slate-100" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="space-y-4 bg-white p-2">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <div>
                <h3 className="font-semibold text-sm text-destructive">{t("company.companyStats.loadError")}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("company.companyStats.loadErrorHint")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { statistics } = data?.data || {};

  const workersTotal = statistics?.workers?.total ?? 0;
  const workersAvailable = statistics?.workers?.available ?? 0;
  const activeEmploymentsCount = statistics?.employments?.active ?? 0;
  const pendingRequestsCount = statistics?.hiring_requests?.pending ?? 0;
  const employersTotal =
    (statistics as any)?.employers?.total ??
    (employersData?.data as any)?.total ??
    0;

  const companyCutNum =
    Number((statistics as any)?.commissions?.company_cut) ||
    Number((statistics as any)?.revenue?.company_cut) ||
    Number((txStatsData?.data as any)?.summary?.company_cut) ||
    Number(statistics?.revenue?.total) ||
    0;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const stats = [
    {
      id: "revenue",
      category: "revenue",
      tabId: "revenue",
      title: "Money Cut (Commissions)",
      value: formatCurrency(companyCutNum),
      subtitle: "Worker placements cut (10%)",
      percentage: "Commission cut",
      icon: CreditCard,
    },
    {
      id: "workers",
      category: "workers",
      tabId: "workers",
      title: "Total Workers",
      value: workersTotal.toLocaleString(),
      subtitle: `${workersAvailable} available on roster`,
      percentage: `${activeEmploymentsCount} hired`,
      icon: Users,
    },
    {
      id: "employers",
      category: "employers",
      tabId: "employers",
      title: "Total Employers",
      value: employersTotal.toLocaleString(),
      subtitle: "Client companies & hirers",
      percentage: "Active clients",
      icon: Briefcase,
    },
    {
      id: "requests",
      category: "requests",
      tabId: "requests",
      title: "Pending Requests",
      value: pendingRequestsCount.toLocaleString(),
      subtitle: "Awaiting company review",
      percentage: pendingRequestsCount > 0 ? "Action required" : "Up to date",
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6 bg-white p-2 min-h-screen">
      {/* Company Homepage Hero Welcome Banner (Canvas Style) */}
      <div className="bg-white border border-[#e1e4e8] rounded-xl p-6 shadow-2xs relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            <p className="text-xs text-[#59636C] font-normal">Welcome, Company Manager</p>
            <h1 className="text-2xl font-normal text-[#2D3B45] tracking-tight">
              Manage company workforce & hiring operations
            </h1>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2.5 text-[13px] text-[#59636C] font-normal">
                <CheckCircle2 className="w-4 h-4 text-[#2478b8] shrink-0" />
                <span>Verified Worker Roster & NIDA ID Checks</span>
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-[#59636C] font-normal">
                <CheckCircle2 className="w-4 h-4 text-[#2478b8] shrink-0" />
                <span>Automated Hiring Contracts & MoMo Settlement</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => navigateTo('profile')}
                className="px-4 py-2 bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#e1e4e8] pt-4 lg:pt-0 lg:pl-6 space-y-4">
            <p className="text-xs text-[#59636C] font-medium">Other options</p>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#2D3B45]">Review Pending Requests</p>
              <button
                onClick={() => navigateTo('requests')}
                className="text-xs text-[#2478b8] hover:underline font-medium cursor-pointer"
              >
                Active Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyStats;