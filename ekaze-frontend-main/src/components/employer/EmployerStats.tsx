import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Plus,
  AlertTriangle,
  CalendarClock,
  Sparkles,
} from "lucide-react";
import { useEmployerDashboard } from "@/hooks/useEmployerDashboard";
import { useActiveWorkers } from "@/hooks/useActiveWorkers";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAutoPaymentSettings, useEmployerPaymentAwareness } from "@/hooks/useEmployerTransactions";

interface EmployerStatsProps {
  onOpenWorkerSearch?: () => void;
}

const EmployerStats = ({ onOpenWorkerSearch }: EmployerStatsProps) => {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useEmployerDashboard();
  const { data: activeWorkersData, isLoading: isWorkersLoading } = useActiveWorkers();
  const { data: autoPayData } = useAutoPaymentSettings();
  const isPaymentMethodConfigured = Boolean(autoPayData?.data?.is_configured);
  const { data: awarenessRes } = useEmployerPaymentAwareness();
  const awareness = awarenessRes?.data;

  if (isLoading && isWorkersLoading) {
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

  if ((isError || !data) && !activeWorkersData) {
    return (
      <div className="space-y-4 p-2">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <div>
                <h3 className="font-semibold text-sm text-destructive">{t("employer.employerStats.loadError")}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("employer.employerStats.loadErrorHint")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statistics = data?.data?.statistics;
  const workersList = activeWorkersData?.data?.data || [];

  const activeFromWorkers = workersList.filter(w =>
    (w.status === 'Hired' || w.current_employment?.status === 'active') &&
    w.status !== 'terminated' && w.status !== 'completed' &&
    w.current_employment?.status !== 'terminated'
  );

  const terminatedFromWorkers = workersList.filter(w =>
    w.status === 'terminated' || w.status === 'completed' || w.current_employment?.status === 'terminated'
  );

  // Active workers count: fallback to active workers list if statistics active is 0 or undefined
  const activeCount = (statistics?.workers?.active !== undefined && statistics.workers.active > 0)
    ? statistics.workers.active
    : activeFromWorkers.length;

  const totalHiredCount = (statistics?.workers?.total_hired !== undefined && statistics.workers.total_hired > 0)
    ? statistics.workers.total_hired
    : (workersList.length || activeCount);

  const terminatedCount = statistics?.workers?.terminated ?? terminatedFromWorkers.length;

  // Monthly spending: active salaries sum or transaction spent
  const salarySum = activeFromWorkers.reduce((acc, w) => {
    const s = Number(w.agreed_salary || w.current_employment?.agreed_salary || 0);
    return acc + (isNaN(s) ? 0 : s);
  }, 0);

  const rawSpending = statistics?.transactions?.this_month_spent;
  const spendingNum = typeof rawSpending === 'string' ? parseFloat(rawSpending.replace(/,/g, '')) : Number(rawSpending || 0);
  const monthlySpendingVal = spendingNum > 0 ? spendingNum : salarySum;

  const incidentsTotal = statistics?.incidents?.total ?? 0;
  const incidentsResolved = statistics?.incidents?.resolved ?? 0;

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : Number(amount || 0);
    if (isNaN(num) || num === 0) return '0';
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
    return num.toLocaleString();
  };

  const navigateTo = (tab: string) => {
    localStorage.setItem('employer_active_tab', tab);
    window.dispatchEvent(new CustomEvent('employer-navigate', { detail: tab }));
    window.dispatchEvent(new CustomEvent('dashboard-navigate', { detail: tab }));
  };

  const stats = [
    {
      title: t("employer.employerStats.activeWorkers"),
      value: activeCount.toString(),
      subtitle: t("employer.employerStats.currentlyHired"),
      percentage: totalHiredCount > 0 ? `${totalHiredCount} total` : t("employer.employerStats.fromTotal"),
      icon: Users,
      onClick: () => navigateTo('active'),
    },
    {
      title: t("employer.employerStats.totalHired"),
      value: totalHiredCount.toString(),
      subtitle: t("employer.employerStats.allTimeHired"),
      percentage: `${terminatedCount} ${t("employer.employerStats.terminated_workers")}`,
      icon: Briefcase,
      onClick: () => navigateTo('active'),
    },
    {
      title: t("employer.employerStats.monthlySpending"),
      value: formatCurrency(monthlySpendingVal),
      subtitle: "RWF",
      percentage: t("employer.employerStats.vsLastMonth"),
      icon: CreditCard,
      onClick: () => navigateTo('payments'),
    },
    {
      title: t("employer.employerStats.incidents"),
      value: incidentsTotal.toString(),
      subtitle: `${incidentsResolved} ${t("employer.employerStats.resolved")}`,
      percentage: t("employer.employerStats.underControl"),
      icon: AlertCircle,
      onClick: () => navigateTo('incidents'),
    },
  ];

  return (
    <div className="space-y-6 bg-white p-2 min-h-screen">
      {/* Top-up Guidance & Awareness Banner */}
      {awareness && awareness.has_active_workers && (awareness.is_overdue || awareness.is_upcoming) && (
        <div
          className={`p-4 rounded-xl border text-left transition-all shadow-xs ${awareness.is_overdue
              ? "bg-rose-50/70 border-rose-300 text-rose-950"
              : "bg-blue-50/70 border-blue-200 text-slate-900"
            }`}
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${awareness.is_overdue
                    ? "bg-rose-100 text-rose-700"
                    : "bg-blue-100 text-[#0062b8]"
                  }`}
              >
                {awareness.is_overdue ? (
                  <AlertTriangle className="w-5 h-5 animate-pulse text-rose-600" />
                ) : (
                  <CalendarClock className="w-5 h-5 text-[#0062b8]" />
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${awareness.is_overdue
                        ? "bg-rose-600 text-white"
                        : "bg-[#0062b8] text-white"
                      }`}
                  >
                    {awareness.is_overdue
                      ? `Overdue (${awareness.days_overdue} Days Overdue)`
                      : `Upcoming Payday (In ${awareness.days_until_due} Days)`}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {awareness.worker_name} • Dedicated Salary:{" "}
                    <span className="font-extrabold text-[#0062b8]">
                      {awareness.salary_formatted}
                    </span>
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                  {awareness.is_overdue ? (
                    <>
                      <strong>Attention Required:</strong> Payment due date was{" "}
                      <strong>{awareness.due_date}</strong>. Automated payout could not clear due to insufficient funds on your{" "}
                      <span className="font-semibold underline decoration-rose-400">
                        {awareness.payment_method === "card" ? "linked Bank Card" : "MTN Mobile Money account"}
                      </span>{" "}
                      (<code>{awareness.payment_account}</code>). Notice has been transmitted to Ihirwe Compliance.
                    </>
                  ) : (
                    <>
                      Payday is approaching on <strong>{awareness.due_date}</strong>. Ensure your payment method has at least{" "}
                      <strong>{awareness.salary_formatted}</strong> available for automated disbursement.
                    </>
                  )}
                </p>

                {/* Step-by-step top-up guidance box */}
                <div className="mt-2 p-2.5 bg-white border border-slate-200 rounded text-xs text-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Sparkles className="w-3.5 h-3.5 text-[#0062b8]" />
                    <span>How to top up & clear this payment:</span>
                  </div>
                  <p className="text-[11.5px] text-slate-600 pl-5">
                    {awareness.topup_instructions?.active_instructions}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 justify-end">
              <button
                onClick={() => navigateTo('payments')}
                className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-bold px-3 py-2 rounded h-9 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Go to Payments & Top-Up</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GCP Console Homepage Hero Welcome Banner (White & Coursera Blue) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            <p className="text-xs text-slate-500 font-normal">Welcome, Employer</p>
            <h1 className="text-2xl font-normal text-slate-900 tracking-tight">
              Manage household workers & monthly payments
            </h1>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>NIDA ID Verification & Identity Check</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>MTN MoMo Salary Payout & Wage Protection</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Automated Salary Payouts — Please set your payment method for monthly pay day</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => {
                  localStorage.setItem('employer_active_tab', 'profile');
                  window.dispatchEvent(new CustomEvent('employer-navigate', { detail: 'profile' }));
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
              <p className="text-xs font-semibold text-slate-900">Manage Employments</p>
              <span className="text-xs text-[#2478b8] font-medium">Active Household Portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* GCP Quick Action Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => {
            localStorage.setItem('employer_active_tab', 'payments');
            window.dispatchEvent(new CustomEvent('employer-navigate', { detail: 'payments' }));
            window.dispatchEvent(new CustomEvent('dashboard-navigate', { detail: 'payments' }));
          }}
          className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-normal flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          <span>Pay Salary via MoMo</span>
        </button>
        <button
          onClick={() => {
            localStorage.setItem('employer_active_tab', 'payments');
            window.dispatchEvent(new CustomEvent('employer-navigate', { detail: 'payments' }));
            window.dispatchEvent(new CustomEvent('dashboard-navigate', { detail: 'payments' }));
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('open-set-payment-method'));
            }, 80);
          }}
          className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-normal flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
        >
          <CreditCard className="w-3.5 h-3.5 text-slate-500" />
          <span>{isPaymentMethodConfigured ? "Update Payment Method" : "Set Payment Method"}</span>
        </button>
      </div>

      {/* GCP Resource Cards Grid */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-normal text-slate-900 tracking-tight">
          Employer Overview & Household Metrics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={stat.onClick}
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

export default EmployerStats;