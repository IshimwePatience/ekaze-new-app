import { User, TrendingUp, CheckCircle2, FileText, MapPin, Star, Briefcase, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkerSidebarData } from "@/hooks/useSidebar";
import { useUpdateWorkerProfilePhoto } from "@/hooks/useProfilePhoto";
import { useLogout } from "@/hooks/useAuth";
import { useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const WorkerOverviewSidebar = () => {
  const { t } = useLanguage();
  const { data: sidebarResponse, isLoading, error } = useWorkerSidebarData();
  const { mutate: uploadPhoto, isPending: isUploading } = useUpdateWorkerProfilePhoto();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPhotoPreview, setLocalPhotoPreview] = useState<string | null>(null);

  const sidebarData = sidebarResponse?.data;
  const user = sidebarData?.user;
  const worker = sidebarData?.worker;
  const statistics = sidebarData?.statistics;
  const currentEmployment = sidebarData?.current_employment;

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (numAmount >= 1000000) return `${(numAmount / 1000000).toFixed(1)}M`;
    if (numAmount >= 1000) return `${(numAmount / 1000).toFixed(0)}K`;
    return numAmount.toFixed(0);
  };

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

  if (error || !sidebarData || !user || !worker) {
    return (
      <div className="flex flex-col h-full max-w-[280px]">
        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Card className="rounded-sm overflow-hidden border-border/40 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">
                {t("worker.workerSidebar.loadError")}
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
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <User className="h-7 w-7 text-primary" />
                    </div>
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
                  title={t("worker.workerSidebar.changePhoto")}
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
            <p className="text-[10px] text-muted-foreground mb-1.5 line-clamp-2 capitalize">
              {(worker.work_type_preferences ?? []).join(", ")} | {worker.experience_level} {t("worker.workerSidebar.level")}
            </p>
            <p className="text-[9px] text-muted-foreground mb-2.5">
              {(worker.preferred_districts ?? []).slice(0, 2).join(", ")}
            </p>

            {worker.registration_type === "company" && worker.company_id && (
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium">
                <div className="w-5 h-5 rounded-sm bg-primary flex items-center justify-center text-primary-foreground">
                  <Briefcase className="h-3 w-3" />
                </div>
                <span className="text-foreground">{t("worker.workerSidebar.companyWorker")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="rounded-sm border-border/40 shadow-sm">
          <CardContent className="p-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground">{t("worker.workerSidebar.activeEmployment")}</span>
              <span className="text-sm font-bold text-primary">
                {statistics.active_employment ? "1" : "0"}
              </span>
            </div>
            <button className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors">
              {t("worker.workerSidebar.viewAllStats")}
            </button>
          </CardContent>
        </Card>

        {/* Current Salary Card */}
        {currentEmployment && (
          <Card className="rounded-sm border-border/40 shadow-sm">
            <CardContent className="p-2.5">
              <p className="text-[10px] text-muted-foreground mb-1.5">{t("worker.workerSidebar.currentSalary")}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-sm bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-primary" />
                </div>
                <span className="text-[11px] font-semibold text-foreground">
                  {formatCurrency(currentEmployment.agreed_salary)} {t("worker.workerSidebar.salaryUnit")}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rating Card */}
        {parseFloat(worker.average_rating) > 0 && (
          <Card className="rounded-sm border-border/40 shadow-sm">
            <CardContent className="p-2.5">
              <p className="text-[10px] text-muted-foreground mb-1.5">{t("worker.workerSidebar.averageRating")}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-sm bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center">
                  <Star className="h-3 w-3 text-yellow-600 fill-yellow-600" />
                </div>
                <span className="text-[11px] font-semibold text-foreground">
                  {parseFloat(worker.average_rating).toFixed(1)} / 5.0
                </span>
                <span className="text-[9px] text-muted-foreground">
                  ({worker.total_ratings} {worker.total_ratings === 1
                    ? t("worker.workerSidebar.review")
                    : t("worker.workerSidebar.reviews")})
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats Card */}
        <Card className="rounded-sm border-border/40 shadow-sm">
          <CardContent className="p-2.5">
            <h3 className="text-[11px] font-semibold text-foreground mb-2">{t("worker.workerSidebar.quickStats")}</h3>
            <div className="space-y-2.5">
              {/* Total Employments */}
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-sm bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-foreground font-medium">
                    {t("worker.workerSidebar.totalEmployments")}: {statistics.total_employments}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{t("worker.workerSidebar.employmentHistory")}</p>
                </div>
              </div>

              {/* NIDA */}
              <div className="flex items-start gap-2">
                <div className={`w-6 h-6 rounded-sm ${statistics.nida_verified ? "bg-green-100 dark:bg-green-950/30" : "bg-gray-100 dark:bg-gray-950/30"} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <CheckCircle2 className={`h-3.5 w-3.5 ${statistics.nida_verified ? "text-green-600" : "text-gray-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-foreground font-medium">
                    {statistics.nida_verified
                      ? t("worker.workerSidebar.nidaVerified")
                      : t("worker.workerSidebar.nidaNotVerified")}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{t("worker.workerSidebar.identityVerification")}</p>
                </div>
              </div>

              {/* Insurance */}
              <div className="flex items-start gap-2">
                <div className={`w-6 h-6 rounded-sm ${statistics.has_insurance ? "bg-purple-100 dark:bg-purple-950/30" : "bg-gray-100 dark:bg-gray-950/30"} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <FileText className={`h-3.5 w-3.5 ${statistics.has_insurance ? "text-purple-600" : "text-gray-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-foreground font-medium">
                    {statistics.has_insurance
                      ? t("worker.workerSidebar.hasInsurance")
                      : t("worker.workerSidebar.noInsurance")}
                  </p>
                  {statistics.has_insurance && worker.insurance_provider && (
                    <p className="text-[9px] text-muted-foreground">{worker.insurance_provider}</p>
                  )}
                </div>
              </div>

              {/* Incidents */}
              <div className="flex items-start gap-2">
                <div className={`w-6 h-6 rounded-sm ${statistics.total_incidents > 0 ? "bg-red-100 dark:bg-red-950/30" : "bg-green-100 dark:bg-green-950/30"} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <MapPin className={`h-3.5 w-3.5 ${statistics.total_incidents > 0 ? "text-red-600" : "text-green-600"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-foreground font-medium">
                    {statistics.total_incidents === 0
                      ? t("worker.workerSidebar.noIncidents")
                      : `${statistics.total_incidents} ${statistics.total_incidents > 1
                          ? t("worker.workerSidebar.incidents")
                          : t("worker.workerSidebar.incident")}`}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {statistics.unresolved_incidents > 0
                      ? `${statistics.unresolved_incidents} ${t("worker.workerSidebar.unresolved")}`
                      : t("worker.workerSidebar.cleanRecord")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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

export default WorkerOverviewSidebar;