import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Clock,
  CreditCard,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Star,
  User,
  Building,
  MapPin,
  CreditCardIcon,
  Plus,
  Lock,
  Wallet,
  PiggyBank,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkerDashboard, useUpdateWorkerAvailability } from "@/hooks/useWorkerOwner";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

const WorkerStats = () => {
  const { t } = useLanguage();

  const { data, isLoading, isError } = useWorkerDashboard();
  const updateAvailability = useUpdateWorkerAvailability();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'available' | 'unavailable' | null>(null);

  const handleToggleClick = () => {
    if (!data?.data?.worker) return;
    const isHiredCheck = data.data.worker.availability_status === 'hired' || Boolean(data.data.statistics?.active_employment) || Boolean(data.data.current_employment && (data.data.current_employment as any).status === 'active');
    if (isHiredCheck) return;

    const currentStatus = data.data.worker.availability_status;
    const nextStatus = currentStatus === 'available' ? 'unavailable' : 'available';
    setPendingStatus(nextStatus);
    setShowConfirmDialog(true);
  };

  const handleConfirmToggle = () => {
    if (!pendingStatus) return;
    updateAvailability.mutate({ availability_status: pendingStatus });
    setShowConfirmDialog(false);
    setPendingStatus(null);
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
        <Skeleton className="h-80" />
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
                <h3 className="font-semibold text-sm text-destructive">{t("worker.workerStats.loadError")}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("worker.workerStats.loadErrorHint")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, worker, statistics, current_employment } = data.data;
  const isHired = worker.availability_status === 'hired' || Boolean(statistics?.active_employment) || Boolean(current_employment && (current_employment as any).status === 'active');

  const formatCurrency = (amount: number): string => {
    return `RF ${new Intl.NumberFormat('en-RW', {
      maximumFractionDigits: 0,
    }).format(amount || 0)}`;
  };

  const stats = [
    {
      title: "Active Jobs",
      value: (statistics?.active_employments ?? statistics?.active_jobs ?? (current_employment ? 1 : 0)).toString(),
      subtitle: "currently working",
      percentage: "this week",
      icon: Briefcase,
      color: "text-[#2478b8]",
      bgColor: "bg-blue-50 border border-blue-100",
      tab: "work-history",
    },
    {
      title: "Wallet Balance",
      value: formatCurrency(Number(statistics?.wallet_balance ?? 0)),
      subtitle: "available payout",
      percentage: "MoMo account",
      icon: Wallet,
      color: "text-[#2478b8]",
      bgColor: "bg-blue-50 border border-blue-100",
      tab: "wallet",
    },
    {
      title: "Saving",
      value: formatCurrency(Number(statistics?.total_savings ?? statistics?.savings ?? 0)),
      subtitle: "vault accumulation",
      percentage: "auto-deducted",
      icon: PiggyBank,
      color: "text-[#2478b8]",
      bgColor: "bg-blue-50 border border-blue-100",
      tab: "wallet",
    },
    {
      title: "Rating",
      value: (Number(statistics?.average_rating ?? statistics?.rating ?? worker?.rating ?? 5.0)).toFixed(1),
      subtitle: "out of 5.0",
      percentage: "average score",
      icon: Star,
      color: "text-[#2478b8]",
      bgColor: "bg-blue-50 border border-blue-100",
      tab: "profile",
    },
  ];

  const navigateTo = (tab: string) => {
    localStorage.setItem('worker_active_tab', tab);
    window.dispatchEvent(new CustomEvent('worker-navigate', { detail: tab }));
  };

  return (
    <div className="space-y-6 bg-white p-2">
      {/* GCP Console Homepage Hero Welcome Banner (White & Coursera Blue) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            <p className="text-xs text-slate-500 font-normal">Welcome, {worker.first_name || "Worker"}</p>
            <h1 className="text-2xl font-normal text-slate-900 tracking-tight">
              Manage your work status & salary payout history
            </h1>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>NIDA Identity Verified & Approved Profile</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant Mobile Money Payout Account Active</span>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-3 flex-wrap">
              {isHired ? (
                <Button
                  size="sm"
                  disabled={true}
                  className="px-4 py-1.5 text-xs font-semibold rounded shadow-none bg-slate-100 border border-slate-300 text-slate-500 cursor-not-allowed flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hired (Active Contract)</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant={worker.availability_status === 'available' ? "default" : "destructive"}
                  onClick={handleToggleClick}
                  disabled={updateAvailability.isPending}
                  className={`px-4 py-1.5 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer ${worker.availability_status === 'available'
                    ? "bg-[#2478b8] hover:bg-[#1b6296] text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                >
                  {updateAvailability.isPending
                    ? t("worker.workerStats.updating")
                    : worker.availability_status === 'available'
                      ? "Available for Hire (Set Unavailable)"
                      : "Set to Available"}
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateTo('profile')}
                className="px-4 py-1.5 border border-[#2478b8] text-[#2478b8] hover:bg-blue-50 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6 space-y-4">
            <p className="text-xs text-slate-500 font-medium">Quick options</p>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-900">Work Status</p>
              {isHired ? (
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300 inline-block">
                  Hired (Active Contract)
                </span>
              ) : (
                <span className={`text-xs font-semibold capitalize ${worker.availability_status === 'available' ? 'text-emerald-700' : 'text-slate-600'
                  }`}>
                  {worker.availability_status || "Available"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GCP Quick Action Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={isHired ? undefined : handleToggleClick}
          disabled={isHired || updateAvailability.isPending}
          className={`px-3 py-1.5 rounded border text-xs font-normal flex items-center gap-1.5 transition-colors shadow-2xs shrink-0 ${isHired
            ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
            : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
            }`}
        >
          {isHired ? <Lock className="w-3.5 h-3.5 text-slate-400" /> : <Plus className="w-3.5 h-3.5 text-slate-500" />}
          <span>{isHired ? "Status Locked (Hired)" : "Toggle Availability Status"}</span>
        </button>
      </div>

      {/* GCP Resource Cards Grid */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-normal text-slate-900 tracking-tight">
          Worker Overview & Performance
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={stat.tab ? () => navigateTo(stat.tab) : undefined}
                className="bg-white border border-slate-200 hover:border-slate-400 rounded-lg p-4 transition-all flex flex-col justify-between h-36 cursor-pointer shadow-2xs group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded ${stat.bgColor} ${stat.color} group-hover:scale-105 transition-transform shrink-0`}>
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

      {/* Confirmation Dialog for changing availability */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md bg-white rounded-xl p-6 shadow-xl border border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              Confirm Status Change
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-600 mt-2">
              {pendingStatus === 'unavailable'
                ? "Are you sure you want to change your status to Unavailable? You will be marked as unavailable and employers will not be able to hire you."
                : "Are you sure you want to change your status to Available? Employers will be able to discover and hire you."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 gap-2 flex sm:justify-end">
            <AlertDialogCancel
              disabled={updateAvailability.isPending}
              className="text-xs font-semibold px-4 py-2 border border-slate-200"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmToggle}
              disabled={updateAvailability.isPending}
              className={`text-xs font-semibold px-4 py-2 text-white ${pendingStatus === 'unavailable'
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#2478b8] hover:bg-[#1b6296]"
                }`}
            >
              {pendingStatus === 'unavailable' ? "Yes, Set Unavailable" : "Yes, Set Available"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkerStats;