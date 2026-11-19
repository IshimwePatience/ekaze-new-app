import { useState } from "react";
import { Modal } from "antd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  Star,
  CheckCircle2,
  XCircle,
  Ban,
  Building2,
  UserCheck,
  AlertCircle,
  Award,
  Wallet,
  Clock,
  X,
} from "lucide-react";
import {
  useWorkerDetails,
  useVerifyNida,
  useSuspendWorker,
  useReactivateWorker,
  useWorkerAnalytics,
} from "@/hooks/useWorkers";
import { workerApi } from "@/api/workerService";
import { FileDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WorkerDetailsModalProps {
  workerId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const WorkerDetailsModal = ({
  workerId,
  isOpen,
  onClose,
}: WorkerDetailsModalProps) => {
  const { t } = useLanguage();
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"verify" | "suspend" | "reactivate">("verify");
  const [actionReason, setActionReason] = useState("");
  const [activeTab, setActiveTab] = useState("info");
  const [reportModalOpen, setReportModalOpen] = useState(false);

const { data, isLoading } = useWorkerDetails(workerId);
  const { data: analyticsData } = useWorkerAnalytics(workerId);
  const analytics = analyticsData?.data;
  const verifyNida = useVerifyNida();
  const suspendWorker = useSuspendWorker();
  const reactivateWorker = useReactivateWorker();

  const worker = data?.data?.worker;
  const statistics = data?.data?.statistics;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleAction = (type: "verify" | "suspend" | "reactivate") => {
    setActionType(type);
    setActionReason("");
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!workerId) return;

    try {
      if (actionType === "verify") {
        await verifyNida.mutateAsync(workerId);
      } else if (actionType === "suspend") {
        await suspendWorker.mutateAsync({
          id: workerId,
          data: { suspension_reason: actionReason },
        });
      } else if (actionType === "reactivate") {
        await reactivateWorker.mutateAsync(workerId);
      }
      setActionDialogOpen(false);
      onClose();
    } catch (error) {
      // Error handled by mutation hooks
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      available: t("admin.workerDetails.available_badge"),
      hired: t("admin.workerDetails.hired_badge"),
      unavailable: t("admin.workerDetails.unavailable_badge"),
      active: t("admin.workerDetails.active_badge"),
      suspended: t("admin.workerDetails.suspended_badge"),
      completed: t("admin.workerDetails.completed_badge"),
      pending: t("admin.workerDetails.pending_badge"),
    };
    return statusMap[status] || status;
  };

  const getSeverityText = (severity: string): string => {
    const severityMap: Record<string, string> = {
      high: t("admin.workerDetails.high"),
      medium: t("admin.workerDetails.medium"),
      low: t("admin.workerDetails.low"),
    };
    return severityMap[severity] || severity;
  };

  const getExperienceText = (level: string): string => {
    const experienceMap: Record<string, string> = {
      entry: t("admin.workerDetails.entry"),
      intermediate: t("admin.workerDetails.intermediate"),
      advanced: t("admin.workerDetails.advanced"),
      expert: t("admin.workerDetails.expert"),
    };
    return experienceMap[level] || level;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: "bg-green-100 text-green-800 border-green-200",
      hired: "bg-blue-100 text-blue-800 border-blue-200",
      unavailable: "bg-orange-100 text-orange-800 border-orange-200",
      active: "bg-green-100 text-green-800 border-green-200",
      suspended: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return styles[status as keyof typeof styles] || "";
  };

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width="95vw"
        centered
        zIndex={1000}
        closeIcon={
          <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </div>
        }
        styles={{
          body: {
            maxHeight: "85vh",
            overflowY: "auto",
            padding: "16px",
          },
          mask: {
            backdropFilter: "blur(4px)",
          },
        }}
        className="worker-details-modal"
      >
        {isLoading || !worker ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={worker.user.profile_photo || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {worker.first_name[0]}
                    {worker.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {worker.first_name} {worker.last_name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.workerDetails.workerId")}: {worker.id} | {t("admin.workerDetails.nationalId")}: {worker.user.national_id}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      className={`text-xs ${getStatusBadge(
                        worker.availability_status
                      )}`}
                    >
                      {getStatusText(worker.availability_status)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {worker.registration_type === "company" ? (
                        <>
                          <Building2 className="w-3 h-3 mr-1" />
                          {t("admin.workerDetails.companyWorker")}
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" />
                          {t("admin.workerDetails.freelancer")}
                        </>
                      )}
                    </Badge>
                    {worker.nida_verified && (
                      <Badge variant="outline" className="text-xs bg-green-50">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
                        {t("admin.workerDetails.nidaVerified")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Briefcase className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {statistics?.total_jobs || 0}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{t("admin.workerDetails.totalJobs")}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {parseFloat(worker.average_rating).toFixed(1)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t("admin.workerDetails.avgRating")}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Wallet className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {formatCurrency(statistics?.total_earnings || 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{t("admin.workerDetails.earnings")}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {statistics?.total_days_employed || 0}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{t("admin.workerDetails.daysWorked")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="info" className="transition-all duration-200">
                  {t("admin.workerDetails.workerInfo")}
                </TabsTrigger>
                <TabsTrigger
                  value="employment"
                  className="transition-all duration-200"
                >
                  {t("admin.workerDetails.employment")} ({worker.employments?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="ratings"
                  className="transition-all duration-200"
                >
                  {t("admin.workerDetails.ratings")} ({worker.ratings?.length || 0})
                </TabsTrigger>
              <TabsTrigger
                  value="incidents"
                  className="transition-all duration-200"
                >
                  {t("admin.workerDetails.incidents")} ({worker.incidents?.length || 0})
                </TabsTrigger>
<TabsTrigger
                  value="analytics"
                  className="transition-all duration-200"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Worker Info Tab */}
              <TabsContent value="info" className="space-y-3 mt-3">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Personal Information */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-primary" />
                          {t("admin.workerDetails.personalInformation")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">
                                {t("admin.workerDetails.email")}
                              </p>
                              <p className="text-xs font-medium">
                                {worker.user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">
                                {t("admin.workerDetails.phone")}
                              </p>
                              <p className="text-xs font-medium">
                                {worker.user.phone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">
                                {t("admin.workerDetails.location")}
                              </p>
                              <p className="text-xs font-medium">
                                {worker.user.district}, {worker.user.sector}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">
                                {t("admin.workerDetails.age")}
                              </p>
                              <p className="text-xs font-medium">{worker.age} {t("admin.workerDetails.years")}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Award className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">
                                {t("admin.workerDetails.experience")}
                              </p>
                              <p className="text-xs font-medium capitalize">
                                {getExperienceText(worker.experience_level)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">
                                {t("admin.workerDetails.registrationDate")}
                              </p>
                              <p className="text-xs font-medium">
                                {new Date(worker.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Languages */}
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1">
                            {t("admin.workerDetails.languagesSpoken")}
                          </p>
                          <div className="flex flex-wrap gap-1">
                          {(worker.languages_spoken ?? []).map((lang, index) => (
                            <Badge key={index} variant="secondary" className="text-[10px]">
                              {lang}
                            </Badge>
                          ))}
                          </div>
                        </div>

                        {/* Work Preferences */}
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1">
                            {t("admin.workerDetails.workTypePreferences")}
                          </p>
                          <div className="flex flex-wrap gap-1">
                          {(worker.work_type_preferences ?? []).map((type, index) => (
                            <Badge key={index} variant="outline" className="text-[10px]">
                              {type.replace(/_/g, " ")}
                            </Badge>
                          ))}
                          </div>
                        </div>

                        {/* Insurance */}
                        {worker.has_insurance && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                            <div className="flex items-center gap-2 mb-1">
                              <Shield className="w-4 h-4 text-blue-600" />
                              <p className="text-xs font-medium text-blue-800 dark:text-blue-400">
                                {t("admin.workerDetails.insuranceInformation")}
                              </p>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-300">
                              {t("admin.workerDetails.provider")}: {worker.insurance_provider}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300">
                              {t("admin.workerDetails.number")}: {worker.insurance_number}
                            </p>
                          </div>
                        )}

                        {/* Company Info */}
                        {worker.company && (
                          <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                            <div className="flex items-center gap-2 mb-1">
                              <Building2 className="w-4 h-4 text-purple-600" />
                              <p className="text-xs font-medium text-purple-800 dark:text-purple-400">
                                {t("admin.workerDetails.companyAffiliation")}
                              </p>
                            </div>
                            <p className="text-xs text-purple-600 dark:text-purple-300">
                              {worker.company.business_name}
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-300">
                              {t("admin.workerDetails.tin")}: {worker.company.tin}
                            </p>
                          </div>
                        )}

                        {/* Current Employment */}
                        {worker.current_employment && (
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                            <div className="flex items-center gap-2 mb-1">
                              <Briefcase className="w-4 h-4 text-green-600" />
                              <p className="text-xs font-medium text-green-800 dark:text-green-400">
                                {t("admin.workerDetails.currentlyEmployed")}
                              </p>
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-300">
                              {t("admin.workerDetails.employer")}: {worker.current_employment.employer?.user?.name}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-300">
                              {t("admin.workerDetails.salary")}: {formatCurrency(worker.current_employment.agreed_salary)}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-300">
                              {t("admin.workerDetails.started")}: {new Date(worker.current_employment.start_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">{t("admin.workerDetails.quickActions")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {!worker.nida_verified && (
                            <Button
                              size="sm"
                              className="w-40 justify-start gap-2 h-9 text-xs hover:scale-105 transition-transform duration-200" 
                              onClick={() => handleAction("verify")}
                              disabled={verifyNida.isPending}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {verifyNida.isPending ? t("admin.workerDetails.verifying") : t("admin.workerDetails.verifyNIDA")}
                            </Button>
                          )}
                          {worker.user.status === "active" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="w-40 justify-start gap-2 h-9 text-xs hover:scale-105 transition-transform duration-200" 
                              onClick={() => handleAction("suspend")}
                              disabled={suspendWorker.isPending}
                            >
                              <Ban className="w-3 h-3" />
                              {suspendWorker.isPending
                                ? t("admin.workerDetails.suspending")
                                : t("admin.workerDetails.suspendWorker")}
                            </Button>
                          )}
                          {worker.user.status === "suspended" && (
                            <Button
                              size="sm"
                              className="w-40 justify-start gap-2 h-9 text-xs hover:scale-105 transition-transform duration-200"
                              onClick={() => handleAction("reactivate")}
                              disabled={reactivateWorker.isPending}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {reactivateWorker.isPending
                                ? t("admin.workerDetails.reactivating")
                                : t("admin.workerDetails.reactivateWorker")}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Referees */}
                    {(worker.referee_1_name || worker.referee_2_name) && (
                      <Card className="mt-3">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">{t("admin.workerDetails.referees")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {worker.referee_1_name && (
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs font-medium">
                                {worker.referee_1_name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {worker.referee_1_phone}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {worker.referee_1_relationship}
                              </p>
                            </div>
                          )}
                          {worker.referee_2_name && (
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs font-medium">
                                {worker.referee_2_name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {worker.referee_2_phone}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {worker.referee_2_relationship}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Employment History Tab */}
              <TabsContent value="employment" className="mt-3">
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">{t("admin.workerDetails.employerHeader")}</TableHead>
                            <TableHead className="text-xs">{t("admin.workerDetails.salaryHeader")}</TableHead>
                            <TableHead className="text-xs">{t("admin.workerDetails.startDate")}</TableHead>
                            <TableHead className="text-xs">{t("admin.workerDetails.endDate")}</TableHead>
                            <TableHead className="text-xs">{t("admin.workerDetails.duration")}</TableHead>
                            <TableHead className="text-xs">{t("admin.workerDetails.statusHeader")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {worker.employments?.map((employment, index) => (
                            <TableRow
                              key={employment.id}
                              className="animate-in fade-in slide-in-from-left-4"
                              style={{
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: "backwards",
                              }}
                            >
                              <TableCell className="text-xs">
                                {employment.employer?.user?.name || t("admin.workerDetails.notAvailable")}
                              </TableCell>
                              <TableCell className="text-xs font-medium">
                                {formatCurrency(employment.agreed_salary)}
                              </TableCell>
                              <TableCell className="text-xs">
                                {new Date(employment.start_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-xs">
                                {employment.end_date
                                  ? new Date(employment.end_date).toLocaleDateString()
                                  : t("admin.workerDetails.ongoing")}
                              </TableCell>
                              <TableCell className="text-xs">
                                {employment.duration_days
                                  ? `${employment.duration_days} ${t("admin.workerDetails.days")}`
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`text-[10px] ${getStatusBadge(
                                    employment.status
                                  )}`}
                                >
                                  {getStatusText(employment.status)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Ratings Tab */}
              <TabsContent value="ratings" className="mt-3">
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">{t("admin.workerDetails.employerHeader")}</TableHead>
                            <TableHead className="text-xs">{t("admin.workerDetails.ratingHeader")}</TableHead>
                            <TableHead className="text-xs">{t("admin.workerDetails.review")}</TableHead>
                            <TableHead className="text-xs">{t("admin.workerDetails.date")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {worker.ratings?.map((rating, index) => (
                            <TableRow
                              key={rating.id}
                              className="animate-in fade-in slide-in-from-left-4"
                              style={{
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: "backwards",
                              }}
                            >
                              <TableCell className="text-xs">
                                {rating.employer?.user?.name || t("admin.workerDetails.notAvailable")}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-xs font-medium">
                                    {rating.rating}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs max-w-xs truncate">
                                {rating.review || "-"}
                              </TableCell>
                              <TableCell className="text-xs">
                                {new Date(rating.created_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
{/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-3">
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

                  {/* Report Button */}
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => setReportModalOpen(true)}
                    >
                      <FileDown className="w-3 h-3" />
                      Generate Report
                    </Button>
                  </div>

                  {/* Frequent Changer Alert */}
                  {analytics?.summary?.is_frequent_changer && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <p className="text-xs text-red-700 font-medium">
                        This worker is flagged as a frequent workplace changer — has worked with {analytics.summary.total_employers_count} employers.
                      </p>
                    </div>
                  )}

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-xl font-bold">{analytics?.summary?.total_days_employed || 0}</p>
                        <p className="text-[10px] text-muted-foreground">Total Days Employed</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-xl font-bold">{analytics?.summary?.total_employers_count || 0}</p>
                        <p className="text-[10px] text-muted-foreground">Total Employers</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-xl font-bold text-green-600">{analytics?.summary?.long_term_count || 0}</p>
                        <p className="text-[10px] text-muted-foreground">Long Term Jobs</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-xl font-bold text-orange-500">{analytics?.summary?.short_term_count || 0}</p>
                        <p className="text-[10px] text-muted-foreground">Short Term Jobs</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Category Breakdown */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Employment Duration Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[
                          { label: "Short Term (< 1 month)", count: analytics?.summary?.short_term_count || 0, color: "bg-red-400" },
                          { label: "Medium Term (1–6 months)", count: analytics?.summary?.medium_term_count || 0, color: "bg-yellow-400" },
                          { label: "Long Term (> 6 months)", count: analytics?.summary?.long_term_count || 0, color: "bg-green-400" },
                          { label: "Currently Active", count: analytics?.summary?.active_count || 0, color: "bg-blue-400" },
                        ].map((item) => {
                          const total = analytics?.summary?.total_employments || 1;
                          const pct = Math.round((item.count / total) * 100);
                          return (
                            <div key={item.label}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">{item.label}</span>
                                <span className="font-medium">{item.count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analytics Records Table */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Employment Analytics Records</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Employer</TableHead>
                              <TableHead className="text-xs">Start Date</TableHead>
                              <TableHead className="text-xs">End Date</TableHead>
                              <TableHead className="text-xs">Duration</TableHead>
                              <TableHead className="text-xs">Category</TableHead>
                              <TableHead className="text-xs">Ended Reason</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analytics?.analytics?.map((record, index) => (
                              <TableRow key={record.id}
                                className="animate-in fade-in slide-in-from-left-4"
                                style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
                              >
                                <TableCell className="text-xs">{record.employer?.user?.name || "N/A"}</TableCell>
                                <TableCell className="text-xs">{new Date(record.start_date).toLocaleDateString()}</TableCell>
                                <TableCell className="text-xs">{record.end_date ? new Date(record.end_date).toLocaleDateString() : "Ongoing"}</TableCell>
                                <TableCell className="text-xs">{record.duration_days ? `${record.duration_days} days` : "-"}</TableCell>
                                <TableCell>
                                  <Badge className={`text-[10px] ${
                                    record.duration_category === "long_term" ? "bg-green-100 text-green-800" :
                                    record.duration_category === "medium_term" ? "bg-yellow-100 text-yellow-800" :
                                    record.duration_category === "active" ? "bg-blue-100 text-blue-800" :
                                    "bg-red-100 text-red-800"
                                  }`}>
                                    {record.duration_category?.replace("_", " ")}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs capitalize">{record.ended_reason?.replace("_", " ") || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </TabsContent>
{/* Incidents Tab */}
              <TabsContent value="incidents" className="mt-3">
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">{t("admin.workerDetails.employerHeader")}</TableHead>
                            <TableHead className="text-xs">{t("admin.workerDetails.type")}</TableHead>
                            <TableHead className="text-xs">{t("admin.workerDetails.description")}</TableHead>
                            <TableHead className="text-xs">{t("admin.workerDetails.severity")}</TableHead>
                            <TableHead className="text-xs">{t("admin.workerDetails.statusHeader")}</TableHead>
                            <TableHead className="text-xs">{t("admin.workerDetails.date")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {worker.incidents?.map((incident, index) => (
                            <TableRow
                              key={incident.id}
                              className="animate-in fade-in slide-in-from-left-4"
                              style={{
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: "backwards",
                              }}
                            >
                              <TableCell className="text-xs">
                                {incident.employer?.user?.name || t("admin.workerDetails.notAvailable")}
                              </TableCell>
                              <TableCell className="text-xs capitalize">
                                {incident.incident_type.replace(/_/g, " ")}
                              </TableCell>
                              <TableCell className="text-xs max-w-xs truncate">
                                {incident.description}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    incident.severity === "high"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="text-[10px]"
                                >
                                  {getSeverityText(incident.severity)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`text-[10px] ${getStatusBadge(
                                    incident.status
                                  )}`}
                                >
                                  {getStatusText(incident.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs">
                                {new Date(incident.created_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Modal>

{/* Analytics Report Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen} modal={true}>
        <DialogContent className="w-[500px] max-w-[95vw] z-[9999]">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <FileDown className="w-4 h-4 text-blue-600" />
              Generate Analytics Report
            </DialogTitle>
            <DialogDescription className="text-xs">
              Download the employment analytics report for{" "}
              <strong>{worker?.first_name} {worker?.last_name}</strong> in your preferred format.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Worker summary inside modal */}
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <p className="text-xs font-medium">{worker?.first_name} {worker?.last_name}</p>
              <p className="text-[10px] text-muted-foreground">
                Total Employers: {analytics?.summary?.total_employers_count ?? 0} &nbsp;·&nbsp;
                Total Days: {analytics?.summary?.total_days_employed ?? 0}
              </p>
              {analytics?.summary?.is_frequent_changer && (
                <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Flagged as Frequent Changer
                </p>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground">Choose export format:</p>

<div className="grid grid-cols-2 gap-3">
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-2 text-xs border-green-200 hover:bg-green-50 hover:border-green-400 text-green-700"
                onClick={() => {
                  if (workerId) workerApi.exportWorkerAnalytics(workerId, 'csv');
                }}
              >
                <span>📊</span>
                <span className="font-semibold">Download CSV</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-2 text-xs border-red-200 hover:bg-red-50 hover:border-red-400 text-red-700"
                onClick={() => {
                  if (workerId) workerApi.exportWorkerAnalytics(workerId, 'pdf');
                }}
              >
                <span>📄</span>
                <span className="font-semibold">Download PDF</span>
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReportModalOpen(false)}
              className="h-8 text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} 
      onOpenChange={setActionDialogOpen} modal={true}>
        <DialogContent className="sm:max-w-md z-[9999]">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {actionType === "verify" && t("admin.workerDetails.verifyTitle")}
              {actionType === "suspend" && t("admin.workerDetails.suspendTitle")}
              {actionType === "reactivate" && t("admin.workerDetails.reactivateTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {actionType === "verify" &&
                t("admin.workerDetails.verifyDescription").replace("{workerName}", `${worker?.first_name} ${worker?.last_name}`)}
              {actionType === "suspend" &&
                t("admin.workerDetails.suspendDescription").replace("{workerName}", `${worker?.first_name} ${worker?.last_name}`)}
              {actionType === "reactivate" &&
                t("admin.workerDetails.reactivateDescription").replace("{workerName}", `${worker?.first_name} ${worker?.last_name}`)}
            </DialogDescription>
          </DialogHeader>

          {actionType === "suspend" && (
            <Textarea
              placeholder={t("admin.workerDetails.enterSuspensionReason")}
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
              className="mt-2 text-xs"
            />
          )}

          <DialogFooter className="gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={
                verifyNida.isPending ||
                suspendWorker.isPending ||
                reactivateWorker.isPending
              }
              className="h-9 w-24 text-xs"
            >
              {t("admin.workerDetails.cancel")}
            </Button>
            <Button
              size="sm"
              variant={actionType === "suspend" ? "destructive" : "default"}
              onClick={confirmAction}
              disabled={
                (actionType === "suspend" && !actionReason.trim()) ||
                verifyNida.isPending ||
                suspendWorker.isPending ||
                reactivateWorker.isPending
              }
              className="h-9 w-24 text-xs"
            >
              {verifyNida.isPending ||
              suspendWorker.isPending ||
              reactivateWorker.isPending
                ? t("admin.workerDetails.processing")
                : t("admin.workerDetails.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkerDetailsModal;