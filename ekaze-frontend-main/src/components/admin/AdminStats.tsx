import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

const AdminStats = () => {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useAdminDashboard();

  const formatRevenue = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const navigateTo = (tab: string) => {
    localStorage.setItem('admin_active_tab', tab);
    window.dispatchEvent(new CustomEvent('admin-navigate', { detail: tab }));
  };

  if (isLoading) {
    return (
      <div className="space-y-5 bg-white p-2">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-56 bg-slate-100" />
            <Skeleton className="h-4 w-96 mt-2 bg-slate-100" />
          </div>
          <Skeleton className="h-6 w-32 bg-slate-100" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-5 bg-white p-2">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive">{t("admin.adminStats.loadError")}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("admin.adminStats.loadErrorHint")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { statistics } = data.data;

  const stats = [
    {
      id: "money_statement",
      category: "payments",
      tabId: "payments",
      title: "Money Statement",
      value: `${formatRevenue(statistics.transactions.total_revenue)} RWF`,
      subtitle: "All money passed through system",
      percentage: "Total System Flow",
      icon: Wallet,
    },
    {
      id: "admin_registration_gains",
      category: "payments",
      tabId: "payments",
      title: "Admin Registration Gains",
      value: `${formatRevenue(statistics.transactions.registration_revenue ?? 100000)} RWF`,
      subtitle: "Company & worker registrations",
      percentage: "Admin Gains",
      icon: Wallet,
    },
    {
      id: "freelance_contact_revenue",
      category: "payments",
      tabId: "payments",
      title: "Freelance Contact Revenue",
      value: `${formatRevenue(statistics.transactions.freelance_contact_revenue ?? 15000)} RWF`,
      subtitle: "Paid to access freelance contacts",
      percentage: "Admin Account",
      icon: Wallet,
    },
    {
      id: "incidents",
      category: "incidents",
      tabId: "incidents",
      title: t("admin.adminStats.activeIncidents") || "Active Incidents",
      value: (statistics.incidents.open + statistics.incidents.under_investigation).toString(),
      subtitle: `${statistics.incidents.resolved} ${t("admin.adminStats.resolved") || "resolved"}`,
      percentage: `${statistics.incidents.total} ${t("admin.adminStats.total") || "total"}`,
      icon: AlertTriangle,
    },
  ];


  return (
    <div className="space-y-6 bg-white p-2 min-h-screen">
      {/* GCP Console Homepage Hero Welcome Banner (White & Coursera Blue) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Hero Main Section */}
          <div className="lg:col-span-8 space-y-3">
            <p className="text-xs text-slate-500 font-normal">Welcome, Admin</p>
            <h1 className="text-2xl font-normal text-slate-900 tracking-tight">
              Manage Ekaze with real-time verification & MoMo analytics
            </h1>

            {/* Checklist with Green Checkmarks */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Access to NIDA database & worker identity verification</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant MTN MoMo payout & revenue settlement</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>24/7 Security audit logging and incident response</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => navigateTo('profile')}
                className="px-4 py-1.5 bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Right Section ("Other options") */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6 space-y-4">
            <p className="text-xs text-slate-500 font-medium">Other options</p>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-900">Try the latest verification models</p>
              <button
                onClick={() => navigateTo('workers')}
                className="text-xs text-[#2478b8] hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                <span>Try NIDA Sync</span>
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-900">Configure Ekaze for enterprise workloads</p>
              <button
                onClick={() => navigateTo('companies')}
                className="text-xs text-[#2478b8] hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                <span>Company setup</span>
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* GCP Console Title: Popular getting started resources */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-normal text-slate-900 tracking-tight">
          Popular getting started resources
        </h2>

        {/* Main GCP Stats Resource Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={() => navigateTo(stat.tabId)}
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

export default AdminStats;