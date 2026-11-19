import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  CreditCardIcon,
  Activity,
  Plus,
  FileText,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";
import { useSupervisorDashboard } from "@/hooks/useSupervisorDashboard";
import { useLanguage } from "@/contexts/LanguageContext";

const SupervisorStats = () => {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useSupervisorDashboard();

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
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <div>
                <h3 className="font-semibold text-sm text-destructive">
                  {t("supervisor.supervisorStats.loadError")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("supervisor.supervisorStats.loadErrorHint")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const districtName = data?.data?.district || (data as any)?.district || "Gasabo";
  const incidents = (data?.data as any)?.incidents || {};
  const workforce = (data?.data as any)?.workforce || {};
  const statistics = (data?.data?.statistics || {}) as any;

  const totalIncidents = incidents.total ?? statistics.district_incidents ?? 0;
  const activeIncidents = incidents.active ?? statistics.active_incidents ?? 0;
  const hiredWorkforce = workforce.hired ?? statistics.hired_workforce ?? 0;
  const terminatedWorkforce = workforce.terminated ?? statistics.terminated_contracts ?? 0;

  const handleCardClick = (tab?: string) => {
    if (!tab) return;
    localStorage.setItem("supervisor_active_tab", tab);
    window.dispatchEvent(new CustomEvent("supervisor-navigate", { detail: tab }));
    window.dispatchEvent(new CustomEvent("dashboard-navigate", { detail: tab }));
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
  };

  const stats = [
    {
      title: "District Incidents",
      value: totalIncidents.toString(),
      subtitle: `${districtName} Jurisdiction`,
      percentage: `${activeIncidents} active / pending`,
      icon: AlertTriangle,
      tab: "incidents",
    },
    {
      title: "Active Investigations",
      value: activeIncidents.toString(),
      subtitle: "under review",
      percentage: "in district",
      icon: Search,
      tab: "incidents",
    },
    {
      title: "Currently Hired",
      value: `${hiredWorkforce} Hired`,
      subtitle: `${districtName} Workforce`,
      percentage: "active contracts",
      icon: UserCheck,
      tab: "workforce",
    },
    {
      title: "Contract Terminated",
      value: `${terminatedWorkforce} Terminated`,
      subtitle: "ended contracts",
      percentage: "in district",
      icon: UserX,
      tab: "workforce",
    },
  ];

  return (
    <div className="space-y-6 bg-white p-2 min-h-screen">
      {/* GCP Console Homepage Hero Welcome Banner (White & Coursera Blue) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            <p className="text-xs text-slate-500 font-normal">Welcome, District Supervisor</p>
            <h1 className="text-2xl font-normal text-slate-900 tracking-tight">
              Monitor district workforce, user sessions & system analytics
            </h1>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>District Jurisdiction Audit Logging & Compliance</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Real-Time Uptime & System Health Monitoring</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => {
                  localStorage.setItem('supervisor_active_tab', 'profile');
                  window.dispatchEvent(new CustomEvent('supervisor-navigate', { detail: 'profile' }));
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
            <div
              onClick={() => {
                localStorage.setItem('supervisor_active_tab', 'profile');
                window.dispatchEvent(new CustomEvent('supervisor-navigate', { detail: 'profile' }));
                window.dispatchEvent(new CustomEvent('dashboard-navigate', { detail: 'profile' }));
              }}
              className="space-y-1 cursor-pointer group"
            >
              <p className="text-xs font-semibold text-slate-900 group-hover:text-[#2478b8] transition-colors">Supervisor Account Settings</p>
              <span className="text-xs text-[#2478b8] font-medium">Manage Profile & Preferences</span>
            </div>
          </div>
        </div>
      </div>

      {/* GCP Resource Cards Grid */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-normal text-slate-900 tracking-tight">
          District Overview & System Health
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={() => handleCardClick(stat.tab)}
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

export default SupervisorStats;