import { Building2, Users, TrendingUp, CheckCircle2, Clock, Activity, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCompanySidebarData } from "@/hooks/useSidebar";
import { useUpdateProfilePhoto } from "@/hooks/useProfilePhoto";
import { useLogout } from "@/hooks/useAuth";
import { useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// ── Initials helper ───────────────────────────────────────────────────────
const getInitials = (name: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getAvatarColor = (id: number): string => {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ];
  return colors[id % colors.length];
};

const OverviewSidebar = () => {
  const { t } = useLanguage();
  const { data: sidebarResponse, isLoading, error } = useCompanySidebarData();
  const { mutate: uploadPhoto, isPending: isUploading } = useUpdateProfilePhoto();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localLogoPreview, setLocalLogoPreview] = useState<string | null>(null);

  const sidebarData = sidebarResponse?.data;
  const user = sidebarData?.user;
  const company = user?.company;
  const statistics = sidebarData?.statistics;
  const recentWorkers = sidebarData?.recent_workers || [];

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (numAmount >= 1000000) return `${(numAmount / 1000000).toFixed(1)}M`;
    if (numAmount >= 1000) return `${(numAmount / 1000).toFixed(0)}K`;
    return numAmount.toFixed(0);
  };

  const formatActiveSince = (dateString: string) => {
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return "2022";
    }
  };

  const handleWorkerClick = (workerId: number) => {
    localStorage.setItem("company_open_worker_id", String(workerId));
    localStorage.setItem("company_active_tab", "workers");
    window.dispatchEvent(new Event("company-switch-to-workers"));
    window.dispatchEvent(new Event("company-open-worker"));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setLocalLogoPreview(objectUrl);
    uploadPhoto(file, {
      onSuccess: (data) => { setLocalLogoPreview(data.data.profile_photo); },
      onError: () => { setLocalLogoPreview(null); },
    });
    e.target.value = "";
  };

  const displayLogo = localLogoPreview || company?.logo;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full max-w-[280px]">
        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Card className="rounded-sm overflow-hidden border-border/40 shadow-sm">
            <div className="relative">
              <div className="h-12 bg-gradient-to-br from-primary via-primary/80 to-primary/60 animate-pulse" />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                <div className="w-14 h-14 rounded-lg border-[3px] border-background bg-muted animate-pulse" />
              </div>
            </div>
            <CardContent className="pt-8 pb-3 px-3 text-center">
              <div className="h-4 bg-muted rounded w-32 mx-auto mb-2 animate-pulse" />
              <div className="h-3 bg-muted rounded w-24 mx-auto mb-2 animate-pulse" />
              <div className="h-3 bg-muted rounded w-20 mx-auto mb-3 animate-pulse" />
              <div className="h-6 bg-muted rounded w-40 mx-auto animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !sidebarData || !user || !company) {
    return (
      <div className="flex flex-col h-full max-w-[280px]">
        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Card className="rounded-sm overflow-hidden border-border/40 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{t("company.companySidebar.loadError")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-[280px]">
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* Company Profile Card */}
        <Card className="rounded-sm overflow-hidden border-border/40 shadow-sm">
          <div className="relative">
            <div className="h-12 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
              <div className="relative group">
                <div className="w-14 h-14 rounded-lg border-[3px] border-background bg-background overflow-hidden p-0.5 flex items-center justify-center">
                  {displayLogo ? (
                    <img src={displayLogo} alt={company.business_name} className="w-full h-full object-contain object-center" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-primary" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md border border-background hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  title={t("company.companySidebar.changePhoto")}
                >
                  {isUploading ? (
                    <span className="w-2.5 h-2.5 border border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Pencil className="h-2.5 w-2.5" />
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp" className="hidden" onChange={handleFileChange} />
              </div>
            </div>
          </div>
          <CardContent className="pt-8 pb-3 px-3 text-center">
            <h2 className="text-sm font-semibold text-foreground mb-0.5">{company.business_name}</h2>
            <p className="text-[10px] text-muted-foreground mb-1.5 line-clamp-2">
              {t("sidebar.verifiedCompany")} | {t("sidebar.activeSince")} {formatActiveSince(user.created_at)}
            </p>
            <p className="text-[9px] text-muted-foreground mb-2.5">{user.address.district}, Rwanda</p>
            {company.status === "approved" && (
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium">
                <div className="w-5 h-5 rounded-sm bg-primary flex items-center justify-center text-primary-foreground">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span className="text-foreground">{t("sidebar.verifiedCompany")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Overview Card */}
        <Card className="rounded-sm border-border/40 shadow-sm">
          <CardContent className="p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{t("sidebar.totalWorkers")}</span>
              <span className="text-sm font-bold text-primary">{statistics?.total_workers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{t("sidebar.activeWorkers")}</span>
              <span className="text-xs font-bold text-green-600">{statistics?.active_workers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{t("sidebar.activeEmployments")}</span>
              <span className="text-xs font-bold">{statistics?.active_employments || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card className="rounded-sm border-border/40 shadow-sm">
          <CardContent className="p-2.5">
            <p className="text-[10px] text-muted-foreground mb-1.5">{t("sidebar.thisMonthRevenue")}</p>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded-sm bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-[11px] font-semibold text-foreground">
                {formatCurrency(statistics?.this_month_revenue || "0")} RWF
              </span>
            </div>
            {statistics?.revenue_growth_percentage !== undefined && statistics.revenue_growth_percentage !== 0 && (
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <Activity className="h-3 w-3" />
                <span>
                  {statistics.revenue_growth_percentage > 0 ? "+" : ""}
                  {statistics.revenue_growth_percentage}% {t("company.companySidebar.fromLastMonth")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Workers Card — initials avatar, clickable */}
        {recentWorkers.length > 0 && (
          <Card className="rounded-sm border-border/40 shadow-sm">
            <CardContent className="p-2.5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-semibold text-foreground">{t("sidebar.activeWorkers")}</h3>
                <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                  {recentWorkers.length}
                </Badge>
              </div>
              <div className="space-y-1.5">
                {recentWorkers.map((worker) => {
                  const name = worker.user?.name || worker.name || "";
                  return (
                    <button
                      key={worker.id}
                      onClick={() => handleWorkerClick(worker.id)}
                      className="w-full flex items-start gap-2 p-1.5 rounded-sm bg-muted/30 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer text-left"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${getAvatarColor(worker.id)}`}>
                        {getInitials(name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold truncate">{name}</p>
                        <p className="text-[9px] text-muted-foreground capitalize">{worker.experience_level}</p>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          <span>
                            {t("company.companySidebar.joined")}{" "}
                            {new Date(worker.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Logout Button */}
      <div className="pt-2 border-t border-border/40 mt-2 flex-shrink-0">
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-sm text-destructive hover:bg-destructive/10 transition-colors text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          {isLoggingOut ? t("auth.loggingOut") : t("auth.logout")}
        </button>
      </div>
    </div>
  );
};

export default OverviewSidebar;