import { User, TrendingUp, Users, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSidebarData } from "@/hooks/useSidebar";
import { useNavigate } from "react-router-dom";
import { useUpdateEmployerProfilePhoto } from "@/hooks/useProfilePhoto";
import { useLogout } from "@/hooks/useAuth";
import { useRef, useState } from "react";
import noPhoto from "../../assets/no-photo.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const EmployerSidebar = () => {
  const { t } = useLanguage();
  const { data: sidebarResponse, isLoading, error } = useSidebarData();
  const navigate = useNavigate();
  const { mutate: uploadPhoto, isPending: isUploading } = useUpdateEmployerProfilePhoto();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPhotoPreview, setLocalPhotoPreview] = useState<string | null>(null);

  const sidebarData = sidebarResponse?.data;
  const user = sidebarData?.user;
  const statistics = sidebarData?.statistics;
  const recentWorkers = sidebarData?.recent_workers || [];

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatActiveSince = (dateString: string) => {
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return '2023';
    }
  };

  const handleDisplayDashboard = () => {
    localStorage.setItem("employer_active_tab", "overview");
    window.location.reload();
  };

  const handleWorkerClick = (workerId: number) => {
    localStorage.setItem("employer_open_worker_id", String(workerId));
    localStorage.setItem("employer_active_tab", "active");
    window.dispatchEvent(new Event("employer-switch-to-active"));
  };

  const calculateDuration = (hiredAt: string) => {
    try {
      const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(hiredAt).getTime()) / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths === 0) return `${diffDays} ${t("employer.employerSidebar.days")}`;
      if (diffMonths === 1) return t("employer.employerSidebar.oneMonth");
      return `${diffMonths} ${t("employer.employerSidebar.months")}`;
    } catch {
      return t("employer.employerSidebar.ongoing");
    }
  };

  const formatWorkType = (type: string) => type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setLocalPhotoPreview(objectUrl);

    uploadPhoto(file, {
      onSuccess: (data) => {
        setLocalPhotoPreview(data.data.profile_photo);
      },
      onError: () => {
        setLocalPhotoPreview(null);
      },
    });

    e.target.value = "";
  };

  const displayPhoto = localPhotoPreview || user?.profile_photo || null;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full max-w-[280px]">
        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Card className="rounded-sm overflow-hidden border-border/40 shadow-sm">
            <div className="relative">
              <div className="h-12 bg-gradient-to-br from-primary via-primary/80 to-primary/60 animate-pulse" />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                <div className="w-14 h-14 rounded-full border-[3px] border-background bg-muted animate-pulse" />
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

  if (error || !sidebarData || !user) {
    return (
      <div className="flex flex-col h-full max-w-[280px]">
        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Card className="rounded-sm overflow-hidden border-border/40 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">
                {t("employer.employerSidebar.loadError")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-[280px]">
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* Profile Card */}
        <Card className="rounded-sm overflow-hidden border-border/40 shadow-sm">
          <div className="relative">
            <div className="h-12 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />

            {/* Profile Picture with edit button */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
              <div className="relative group">
                <div className="w-14 h-14 rounded-full border-[3px] border-background bg-background overflow-hidden">
                  {displayPhoto ? (
                    <img src={displayPhoto} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <img src={noPhoto} alt={user.name} className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Pencil button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="
                    absolute -bottom-1.5 -right-1.5
                    w-5 h-5 rounded-full
                    bg-primary text-primary-foreground
                    flex items-center justify-center
                    shadow-md border border-background
                    hover:bg-primary/90 transition-colors
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                  title={t("employer.employerSidebar.changePhoto")}
                >
                  {isUploading ? (
                    <span className="w-2.5 h-2.5 border border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Pencil className="h-2.5 w-2.5" />
                  )}
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <CardContent className="pt-8 pb-3 px-3 text-center">
            <h2 className="text-sm font-semibold text-foreground mb-0.5">{user.name}</h2>
            <p className="text-[10px] text-muted-foreground mb-1.5 line-clamp-2">
              {t("employer.employerSidebar.role")} | {t("sidebar.activeSince")} {formatActiveSince(user.created_at)}
            </p>
            <p className="text-[9px] text-muted-foreground mb-2.5">
              {user.address.sector}, {user.address.district}
            </p>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium">
              <div className={`w-5 h-5 rounded-sm ${user.is_verified ? 'bg-primary' : 'bg-muted'} flex items-center justify-center text-primary-foreground text-[9px] font-bold`}>
                {user.is_verified ? '✓' : '?'}
              </div>
              <span className="text-foreground">
                {user.is_verified
                  ? t("sidebar.verifiedEmployer")
                  : t("sidebar.unverifiedEmployer")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="rounded-sm border-border/40 shadow-sm">
          <CardContent className="p-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground">{t("sidebar.activeWorkers")}</span>
              <span className="text-sm font-bold text-primary">{statistics?.active_workers || 0}</span>
            </div>
            <button
              onClick={handleDisplayDashboard}
              className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {t("sidebar.viewAnalytics")}
            </button>
          </CardContent>
        </Card>

        {/* Spending Card */}
        <Card className="rounded-sm border-border/40 shadow-sm">
          <CardContent className="p-2.5">
            <p className="text-[10px] text-muted-foreground mb-1.5">{t("sidebar.thisMonthSpending")}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-sm bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-primary" />
              </div>
              <span className="text-[11px] font-semibold text-foreground">
                {formatCurrency(statistics?.this_month_spent || '0')} {t("employer.employerSidebar.currency")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Active Workers Card */}
        {recentWorkers.length > 0 && (
          <Card className="rounded-sm border-border/40 shadow-sm">
            <CardContent className="p-2.5">
              <h3 className="text-[11px] font-semibold text-foreground mb-2">
                {t("sidebar.activeWorkers")}
              </h3>
              <div className="space-y-2">
                {recentWorkers.slice(0, 3).map((worker) => (
                  <button
                    key={worker.id}
                    onClick={() => handleWorkerClick(worker.id)}
                    className="w-full flex items-start gap-2 p-1.5 rounded-sm bg-muted/30 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer text-left"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-border/40">
                      {worker.profile_photo ? (
                        <img src={worker.profile_photo} alt={worker.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-3.5 w-3.5 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold truncate">{worker.name}</p>
                      <p className="text-[9px] text-muted-foreground">{formatWorkType(worker.type)}</p>
                      <p className="text-[9px] text-muted-foreground">{calculateDuration(worker.hired_at)}</p>
                    </div>
                  </button>
                ))}
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

export default EmployerSidebar;