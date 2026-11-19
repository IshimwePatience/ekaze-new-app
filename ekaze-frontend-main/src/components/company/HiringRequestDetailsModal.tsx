import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { TranslationPath } from "@/contexts/LanguageContext";
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
  Star,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  X,
  AlertCircle,
  Home,
  Activity,
  History,
  Target,
  KeyRound,
  Info,
  Lock,
  Wallet,
} from "lucide-react";
import {
  useHiringRequestDetails,
  useAcceptHiringRequest,
  useRejectHiringRequest,
  useInitiatePayment,
  useConfirmPayment,
} from "@/hooks/useHiringRequests";
import { format } from "date-fns";
import type {
  AcceptHiringRequestPayload,
  RejectHiringRequestPayload,
  PaymentRequiredResponse,
  HiringRequestDetailsResponse,
} from "@/types/hiring-request.types";
import { useLanguage } from "@/contexts/LanguageContext";

interface HiringRequestDetailsModalProps {
  requestId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

interface OtpResultInfo {
  expires_in_minutes: number;
  worker_phone_preview: string;
  next_step?: string;
}

// ── tiny sub-components ───────────────────────────────────────────────────────
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-1.5">
    <span className="text-muted-foreground mt-0.5">{icon}</span>
    <div>
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className="text-xs font-medium">{value}</p>
    </div>
  </div>
);

const StatBox = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div
    className={`p-2 rounded-lg ${
      highlight ? "bg-green-50 dark:bg-green-950/30" : "bg-muted/30"
    }`}
  >
    <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
    <p className="text-xs font-semibold">{value}</p>
  </div>
);

const MsgCard = ({
  icon,
  title,
  text,
  highlight,
  footer,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  highlight?: boolean;
  footer?: string;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-xs flex items-center gap-1.5">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div
        className={`p-3 rounded-lg border ${
          highlight
            ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
            : "bg-muted/20 border-border/50"
        }`}
      >
        <div
        className="text-xs whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: text }}
      />
        {footer && (
          <p className="text-[10px] text-muted-foreground mt-2">{footer}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

// ── main component ────────────────────────────────────────────────────────────
const HiringRequestDetailsModal = ({
  requestId,
  isOpen,
  onClose,
}: HiringRequestDetailsModalProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"worker" | "employer" | "details">("worker");

  // Accept form state
  const [agreedSalary, setAgreedSalary] = useState("");
  const [subscriptionFee, setSubscriptionFee] = useState("");
  const [salaryDeductionPct, setSalaryDeductionPct] = useState("");
  const [workDesc, setWorkDesc] = useState("");
  const [responseMsg, setResponseMsg] = useState("");

  // Reject form state
  const [rejectReason, setRejectReason] = useState("");

  // Sub-dialog open states — deliberately distinct names from the main modal
  const [acceptPanelOpen, setAcceptPanelOpen] = useState(false);
  const [rejectPanelOpen, setRejectPanelOpen] = useState(false);
  const [otpPanelOpen, setOtpPanelOpen] = useState(false);
  const [otpPanelData, setOtpPanelData] = useState<OtpResultInfo | null>(null);


  const acceptMutation = useAcceptHiringRequest();
  const rejectMutation = useRejectHiringRequest();

  const initiatePaymentMutation = useInitiatePayment();
  const confirmPaymentMutation = useConfirmPayment();

 const { data, isLoading } = useHiringRequestDetails(requestId);

// Type guard to narrow the union
const isPaymentRequired = (data as PaymentRequiredResponse)?.payment_required === true;
const hiringData = isPaymentRequired ? null : (data as HiringRequestDetailsResponse);
const request = hiringData?.data;

  // ── helpers ──────────────────────────────────────────────────────────────
  const clearForms = () => {
    setAgreedSalary("");
    setSubscriptionFee("");
    setSalaryDeductionPct("");
    setWorkDesc("");
    setResponseMsg("");
    setRejectReason("");
  };

  const openAcceptPanel = () => {
    if (request) {
      setAgreedSalary(request.proposed_salary);
      setWorkDesc(request.work_description || "");
    }
    setAcceptPanelOpen(true);
  };

  const closeAcceptPanel = () => {
    setAcceptPanelOpen(false);
    clearForms();
  };

  const openRejectPanel = () => setRejectPanelOpen(true);

  const closeRejectPanel = () => {
    setRejectPanelOpen(false);
    clearForms();
  };

  const closeOtpPanel = () => {
    setOtpPanelOpen(false);
    setOtpPanelData(null);
    onClose();
  };
  
  // ADD after closeOtpPanel function
  const handlePay = async () => {
    if (!requestId) return;
    try {
      // Step 1: initiate
      const initiateRes = await initiatePaymentMutation.mutateAsync(requestId);
      const paymentId = initiateRes.data.payment_id;
      // Step 2: confirm (hardcoded simulated payment)
      await confirmPaymentMutation.mutateAsync({ id: requestId, paymentId });
      // The invalidateQueries in useConfirmPayment will refetch details automatically
    } catch {
      // handled by hook toasts
    }
  };

  const submitAccept = async () => {
    if (!requestId) return;
    const payload: AcceptHiringRequestPayload = {
      agreed_salary: parseFloat(agreedSalary),
      subscription_fee: subscriptionFee ? parseFloat(subscriptionFee) : undefined,
      salary_deduction_percentage: salaryDeductionPct
        ? parseFloat(salaryDeductionPct)
        : undefined,
      work_description: workDesc || undefined,
      response_message: responseMsg || undefined,
    };
    try {
      const res = await acceptMutation.mutateAsync({ id: requestId, data: payload });
      closeAcceptPanel();
      if (res?.data?.otp_info) {
        setOtpPanelData({
          expires_in_minutes: res.data.otp_info.expires_in_minutes,
          worker_phone_preview: res.data.otp_info.worker_phone_preview,
          next_step: res.data.next_step,
        });
        setOtpPanelOpen(true);
      } else {
        onClose();
      }
    } catch {
      // handled by hook toast
    }
  };

  const submitReject = async () => {
    if (!requestId) return;
    const payload: RejectHiringRequestPayload = { response_message: rejectReason };
    try {
      await rejectMutation.mutateAsync({ id: requestId, data: payload });
      closeRejectPanel();
      onClose();
    } catch {
      // handled by hook toast
    }
  };

  // ── format utils ─────────────────────────────────────────────────────────
  const statusStyle: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    accepted: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: t("company.hiringRequests.detailsModal.pending"),
      accepted: t("company.hiringRequests.detailsModal.accepted"),
      rejected: t("company.hiringRequests.detailsModal.rejected"),
      cancelled: t("company.hiringRequests.detailsModal.cancelled"),
    };
    return statusMap[status] || status;
  };

const getWorkTypeText = (type: string) => {
  const workTypeMap: Record<string, string> = {
    full_time: t("company.hiringRequests.full_time" as TranslationPath),
    part_time: t("company.hiringRequests.part_time" as TranslationPath),
    contract: t("company.hiringRequests.contract" as TranslationPath),
    temporary: t("company.hiringRequests.temporary" as TranslationPath),
  };
  return workTypeMap[type] || type;
};

  const fmtCurrency = (v: string | number) =>
    new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(typeof v === "string" ? parseFloat(v) : v);

  const fmtShort = (v: string | number) => {
    const n = typeof v === "string" ? parseFloat(v) : v;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  };

  const fmtDate = (s: string) => format(new Date(s), "MMM dd, yyyy");
  const fmtDateTime = (s: string) =>
    format(new Date(s), "MMM dd, yyyy 'at' HH:mm");

  // ── MAIN DETAILS DIALOG ───────────────────────────────────────────────────
  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto p-0 gap-0">
          {/* sticky header */}
          <div className="sticky top-0 z-10 bg-background border-b px-5 py-3 flex items-center justify-between">
            {isLoading || !request ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold leading-tight">
                    {t("company.hiringRequests.detailsModal.requestId").replace("{id}", request.id.toString().padStart(4, "0"))}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      className={`text-[10px] ${statusStyle[request.status] || ""}`}
                    >
                      {getStatusText(request.status)}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {fmtDate(request.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {!isLoading && request?.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={openRejectPanel}
                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                    className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    {t("company.hiringRequests.detailsModal.reject")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={openAcceptPanel}
                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                    className="h-8 text-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {t("company.hiringRequests.detailsModal.accept")}
                  </Button>
                </>
              )}
              <button
                onClick={onClose}
                className="ml-1 w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                title={t("company.hiringRequests.detailsModal.close")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* body */}
          <div className="p-5 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (data as PaymentRequiredResponse)?.payment_required ? (
              // ── PAYMENT GATE ────────────────────────────────────────────────────
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                {/* Lock icon */}
                <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-orange-500" />
                </div>

                {/* Message */}
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-bold">{t("company.hiringRequests.detailsModal.paymentRequired")}</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    {t("company.hiringRequests.detailsModal.paymentMessage")}
                  </p>
                </div>

                {/* Payment card */}
                <Card className="w-full max-w-sm border-orange-200 dark:border-orange-800">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-semibold">{t("company.hiringRequests.detailsModal.accessFee")}</span>
                      </div>
                      <span className="text-sm font-bold text-orange-600">
                        {new Intl.NumberFormat("en-RW", {
                          style: "currency",
                          currency: "RWF",
                          minimumFractionDigits: 0,
                        }).format((data as PaymentRequiredResponse).payment_amount)}
                      </span>
                    </div>

                    <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                      <p className="text-[10px] text-muted-foreground">{t("company.hiringRequests.detailsModal.whatYouGet")}</p>
                      {[
                        t("company.hiringRequests.detailsModal.benefit1"),
                        t("company.hiringRequests.detailsModal.benefit2"),
                        t("company.hiringRequests.detailsModal.benefit3"),
                        t("company.hiringRequests.detailsModal.benefit4"),
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="text-[10px]">{item}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full h-9 text-xs"
                      onClick={handlePay}
                      disabled={
                        initiatePaymentMutation.isPending || confirmPaymentMutation.isPending
                      }
                    >
                      {initiatePaymentMutation.isPending || confirmPaymentMutation.isPending ? (
                        <>
                          <Clock className="w-3 h-3 mr-1.5 animate-spin" />
                          {t("company.hiringRequests.detailsModal.processingPayment")}
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3 h-3 mr-1.5" />
                          {t("company.hiringRequests.detailsModal.payAndView")}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : !request ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <>
                {/* Quick stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      icon: <CreditCard className="w-3 h-3 text-blue-600" />,
                      bg: "bg-blue-50 dark:bg-blue-950/30",
                      label: t("company.hiringRequests.detailsModal.salary"),
                      value: fmtShort(request.proposed_salary),
                      sub: t("company.hiringRequests.detailsModal.proposed"),
                    },
                    {
                      icon: <User className="w-3 h-3 text-green-600" />,
                      bg: "bg-green-50 dark:bg-green-950/30",
                      label: t("company.hiringRequests.detailsModal.worker"),
                      value: `${request.worker?.first_name || ""} ${
                        request.worker?.last_name || ""
                      }`.trim(),
                      sub: t("company.hiringRequests.detailsModal.requested"),
                    },
                    {
                      icon: <Home className="w-3 h-3 text-purple-600" />,
                      bg: "bg-purple-50 dark:bg-purple-950/30",
                      label: t("company.hiringRequests.detailsModal.employer"),
                      value: request.employer?.user?.name || t("company.hiringRequests.detailsModal.notAvailable"),
                      sub: t("company.hiringRequests.detailsModal.requesting"),
                    },
                    {
                      icon: <Clock className="w-3 h-3 text-orange-600" />,
                      bg: "bg-orange-50 dark:bg-orange-950/30",
                      label: t("company.hiringRequests.detailsModal.date"),
                      value: fmtDate(request.created_at),
                      sub: t("company.hiringRequests.detailsModal.submitted"),
                    },
                  ].map((s, i) => (
                    <Card key={i} className="border-border/40 rounded-xl">
                      <CardContent className="p-3">
                        <div
                          className={`w-5 h-5 rounded-md ${s.bg} flex items-center justify-center mb-2`}
                        >
                          {s.icon}
                        </div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">
                          {s.label}
                        </p>
                        <p className="text-xs font-bold truncate">{s.value}</p>
                        <p className="text-[9px] text-muted-foreground">{s.sub}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Tabs */}
                <Tabs
                  value={activeTab}
                  onValueChange={(v) =>
                    setActiveTab(v as typeof activeTab)
                  }
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="worker" className="text-xs">
                      <User className="w-3 h-3 mr-1" />
                      {t("company.hiringRequests.detailsModal.workerTab")}
                    </TabsTrigger>
                    <TabsTrigger value="employer" className="text-xs">
                      <Home className="w-3 h-3 mr-1" />
                      {t("company.hiringRequests.detailsModal.employerTab")}
                    </TabsTrigger>
                    <TabsTrigger value="details" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      {t("company.hiringRequests.detailsModal.detailsTab")}
                    </TabsTrigger>
                  </TabsList>

                  {/* ── WORKER TAB ─────────────────────────────────────── */}
                  <TabsContent key={`worker-${activeTab}`} value="worker" className="mt-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      <div className="lg:col-span-2 space-y-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-primary" />
                              {t("company.hiringRequests.detailsModal.workerProfile")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-14 w-14">
                                <AvatarImage
                                  src={
                                    request.worker?.user?.profile_photo ||
                                    "/images/no-photo.jpg"
                                  }
                                />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {request.worker?.first_name?.[0]}
                                  {request.worker?.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-bold">
                                  {request.worker?.first_name}{" "}
                                  {request.worker?.last_name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {request.worker?.age} {t("company.hiringRequests.detailsModal.yrs")} •{" "}
                                  {request.worker?.experience_level}
                                </p>
                                {request.worker?.average_rating && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-medium">
                                      {parseFloat(
                                        request.worker.average_rating
                                      ).toFixed(1)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      ({request.worker.total_ratings})
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-2">
                              <InfoRow
                                icon={<Phone className="w-3 h-3" />}
                                label={t("company.hiringRequests.detailsModal.phone")}
                                value={request.worker?.user?.phone || t("company.hiringRequests.detailsModal.notAvailable")}
                              />
                              <InfoRow
                                icon={<Mail className="w-3 h-3" />}
                                label={t("company.hiringRequests.detailsModal.email")}
                                value={request.worker?.user?.email || t("company.hiringRequests.detailsModal.notAvailable")}
                              />
                              <InfoRow
                                icon={<MapPin className="w-3 h-3" />}
                                label={t("company.hiringRequests.detailsModal.location")}
                                value={`${request.worker?.user?.district}, ${request.worker?.user?.sector}`}
                              />
                              <InfoRow
                                icon={<Briefcase className="w-3 h-3" />}
                                label={t("company.hiringRequests.detailsModal.experience")}
                                value={request.worker?.experience_level || t("company.hiringRequests.detailsModal.notAvailable")}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {(request.worker?.work_type_preferences?.length ?? 0) > 0 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xs flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-primary" />
                                {t("company.hiringRequests.detailsModal.workPreferences")}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1.5">
                                {request.worker?.work_type_preferences?.map(
                                  (t: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="text-[10px] capitalize"
                                    >
                                      {getWorkTypeText(t)}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-primary" />
                              {t("company.hiringRequests.detailsModal.quickStats")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <StatBox
                              label={t("company.hiringRequests.detailsModal.workTypes")}
                              value={String(
                                request.worker?.work_type_preferences?.length || 0
                              )}
                            />
                            <StatBox
                              label={t("company.hiringRequests.detailsModal.experience")}
                              value={request.worker?.experience_level || t("company.hiringRequests.detailsModal.notAvailable")}
                            />
                            {request.worker?.average_rating && (
                              <StatBox
                                label={t("company.hiringRequests.detailsModal.rating")}
                                value={`${parseFloat(
                                  request.worker.average_rating
                                ).toFixed(1)} / 5.0`}
                              />
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* ── EMPLOYER TAB ────────────────────────────────────── */}
                  <TabsContent key={`employer-${activeTab}`} value="employer" className="mt-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      <div className="lg:col-span-2 space-y-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs flex items-center gap-1.5">
                              <Home className="w-3.5 h-3.5 text-primary" />
                              {t("company.hiringRequests.detailsModal.employerInformation")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-sm font-bold">
                                {request.employer?.user?.name || t("company.hiringRequests.detailsModal.notAvailable")}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                ID: #
                                {request.employer?.id
                                  ?.toString()
                                  .padStart(4, "0")}
                              </p>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-2">
                              <InfoRow
                                icon={<Phone className="w-3 h-3" />}
                                label={t("company.hiringRequests.detailsModal.phone")}
                                value={
                                  request.employer?.user?.phone || t("company.hiringRequests.detailsModal.notAvailable")
                                }
                              />
                              <InfoRow
                                icon={<MapPin className="w-3 h-3" />}
                                label={t("company.hiringRequests.detailsModal.location")}
                                value={`${request.employer?.user?.district}, ${request.employer?.user?.sector}`}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs flex items-center gap-1.5">
                              <History className="w-3.5 h-3.5 text-primary" />
                              {t("company.hiringRequests.detailsModal.employerHistory")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <StatBox
                              label={t("company.hiringRequests.detailsModal.activeWorkers")}
                              value={String(
                                request.employer?.active_workers || 0
                              )}
                            />
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-primary" />
                              {t("company.hiringRequests.detailsModal.requestContext")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <StatBox
                              label={t("company.hiringRequests.detailsModal.status")}
                              value={getStatusText(request.status)}
                            />
                            <StatBox
                              label={t("company.hiringRequests.detailsModal.submitted")}
                              value={fmtDateTime(request.created_at)}
                            />
                            {request.responded_at && (
                              <StatBox
                                label={t("company.hiringRequests.detailsModal.responded")}
                                value={fmtDateTime(request.responded_at)}
                                highlight
                              />
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* ── DETAILS TAB ─────────────────────────────────────── */}
                  <TabsContent key={`details-${activeTab}`} value="details" className="mt-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      <div className="lg:col-span-2 space-y-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-primary" />
                              {t("company.hiringRequests.detailsModal.financialDetails")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                                <p className="text-[10px] text-muted-foreground mb-1">
                                  {t("company.hiringRequests.detailsModal.proposedSalary")}
                                </p>
                                <p className="text-sm font-bold">
                                  {fmtCurrency(request.proposed_salary)}
                                </p>
                                <p className="text-[9px] text-muted-foreground">
                                  {t("company.hiringRequests.detailsModal.perMonth")}
                                </p>
                              </div>
                              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                                <p className="text-[10px] text-muted-foreground mb-1">
                                  {t("company.hiringRequests.detailsModal.requestDate")}
                                </p>
                                <p className="text-sm font-bold">
                                  {fmtDate(request.created_at)}
                                </p>
                                <p className="text-[9px] text-muted-foreground">
                                  {format(
                                    new Date(request.created_at),
                                    "HH:mm"
                                  )}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {request.message && (
                          <MsgCard
                            icon={
                              <FileText className="w-3.5 h-3.5 text-primary" />
                            }
                            title={t("company.hiringRequests.detailsModal.employerMessage")}
                            text={request.message}
                          />
                        )}
                        {request.work_description && (
                          <MsgCard
                            icon={
                              <Briefcase className="w-3.5 h-3.5 text-primary" />
                            }
                            title={t("company.hiringRequests.detailsModal.workDescription")}
                            text={request.work_description}
                          />
                        )}
                        {request.response_message && (
                          <MsgCard
                            icon={
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            }
                            title={t("company.hiringRequests.detailsModal.companyResponse")}
                            text={request.response_message}
                            highlight
                            footer={
                              request.responded_at
                                ? t("company.hiringRequests.detailsModal.respondedOn").replace("{date}", fmtDateTime(request.responded_at))
                                : undefined
                            }
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              {t("company.hiringRequests.detailsModal.timeline")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <StatBox
                              label={t("company.hiringRequests.detailsModal.submitted")}
                              value={fmtDateTime(request.created_at)}
                            />
                            {request.responded_at && (
                              <StatBox
                                label={t("company.hiringRequests.detailsModal.responded")}
                                value={fmtDateTime(request.responded_at)}
                                highlight
                              />
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-primary" />
                              {t("company.hiringRequests.detailsModal.statusInfo")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Badge
                              className={`w-full justify-center text-xs ${
                                statusStyle[request.status] || ""
                              }`}
                            >
                              {getStatusText(request.status)}
                            </Badge>
                            <p className="text-[9px] text-muted-foreground mt-2 text-center">
                              {request.status === "pending" &&
                                t("company.hiringRequests.detailsModal.pendingStatus")}
                              {request.status === "accepted" &&
                                t("company.hiringRequests.detailsModal.acceptedStatus")}
                              {request.status === "rejected" &&
                                t("company.hiringRequests.detailsModal.rejectedStatus")}
                              {request.status === "cancelled" &&
                                t("company.hiringRequests.detailsModal.cancelledStatus")}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── ACCEPT PANEL ─────────────────────────────────────────────────────── */}
      <Dialog
        open={acceptPanelOpen}
        onOpenChange={(o) => {
          if (!o) closeAcceptPanel();
        }}
      >
        <DialogContent className="sm:max-w-3xl z-[200]">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              {t("company.hiringRequests.detailsModal.acceptTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t("company.hiringRequests.detailsModal.acceptDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-green-800 dark:text-green-300">
                  {t("company.hiringRequests.detailsModal.workerInfo").replace("{name}", `${request?.worker?.first_name} ${request?.worker?.last_name}`)}
                </p>
                <p className="text-[10px] text-green-700 dark:text-green-400">
                  {t("company.hiringRequests.detailsModal.proposedInfo").replace("{salary}", request ? fmtCurrency(request.proposed_salary) : "—")}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ap_salary" className="text-xs">
                {t("company.hiringRequests.detailsModal.agreedSalary")}
              </Label>
              <Input
                id="ap_salary"
                type="number"
                placeholder={t("company.hiringRequests.detailsModal.agreedSalaryPlaceholder")}
                value={agreedSalary}
                onChange={(e) => setAgreedSalary(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ap_sub" className="text-xs">
                  {t("company.hiringRequests.detailsModal.subscriptionFee")}
                </Label>
                <Input
                  id="ap_sub"
                  type="number"
                  placeholder={t("company.hiringRequests.detailsModal.subscriptionFeePlaceholder")}
                  value={subscriptionFee}
                  onChange={(e) => setSubscriptionFee(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ap_ded" className="text-xs">
                  {t("company.hiringRequests.detailsModal.deduction")}
                </Label>
                <Input
                  id="ap_ded"
                  type="number"
                  placeholder={t("company.hiringRequests.detailsModal.deductionPlaceholder")}
                  value={salaryDeductionPct}
                  onChange={(e) => setSalaryDeductionPct(e.target.value)}
                  className="h-9 text-xs"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ap_wdesc" className="text-xs">
                {t("company.hiringRequests.detailsModal.workDescriptionLabel")}
              </Label>
              <Textarea
                id="ap_wdesc"
                placeholder={t("company.hiringRequests.detailsModal.workDescriptionPlaceholder")}
                value={workDesc}
                onChange={(e) => setWorkDesc(e.target.value)}
                className="text-xs min-h-[72px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ap_rmsg" className="text-xs">
                {t("company.hiringRequests.detailsModal.responseMessage")}
              </Label>
              <Textarea
                id="ap_rmsg"
                placeholder={t("company.hiringRequests.detailsModal.responseMessagePlaceholder")}
                value={responseMsg}
                onChange={(e) => setResponseMsg(e.target.value)}
                className="text-xs min-h-[56px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={closeAcceptPanel}
              disabled={acceptMutation.isPending}
              className="h-9 text-xs"
            >
              {t("company.hiringRequests.detailsModal.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={submitAccept}
              disabled={!agreedSalary || acceptMutation.isPending}
              className="h-9 text-xs min-w-[110px]"
            >
              {acceptMutation.isPending ? t("company.hiringRequests.detailsModal.processing") : t("company.hiringRequests.detailsModal.confirmAccept")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── REJECT PANEL ─────────────────────────────────────────────────────── */}
      <Dialog
        open={rejectPanelOpen}
        onOpenChange={(o) => {
          if (!o) closeRejectPanel();
        }}
      >
        <DialogContent className="sm:max-w-md z-[200]">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              {t("company.hiringRequests.detailsModal.rejectTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t("company.hiringRequests.detailsModal.rejectDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-red-800 dark:text-red-300">
                  {t("company.hiringRequests.detailsModal.from").replace("{name}", request?.employer?.user?.name || t("company.hiringRequests.detailsModal.notAvailable"))}
                </p>
                <p className="text-[10px] text-red-700 dark:text-red-400">
                  {t("company.hiringRequests.detailsModal.workerInfo").replace("{name}", `${request?.worker?.first_name} ${request?.worker?.last_name}`)}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rp_reason" className="text-xs">
                {t("company.hiringRequests.detailsModal.rejectionReason")}
              </Label>
              <Textarea
                id="rp_reason"
                placeholder={t("company.hiringRequests.detailsModal.rejectionReasonPlaceholder")}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="text-xs min-h-[96px]"
              />
              <p className="text-[10px] text-muted-foreground text-right">
                {rejectReason.length}/500
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={closeRejectPanel}
              disabled={rejectMutation.isPending}
              className="h-9 text-xs"
            >
              {t("company.hiringRequests.detailsModal.cancel")}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={submitReject}
              disabled={rejectReason.length < 10 || rejectMutation.isPending}
              className="h-9 text-xs min-w-[110px]"
            >
              {rejectMutation.isPending ? t("company.hiringRequests.detailsModal.processing") : t("company.hiringRequests.detailsModal.confirmReject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── OTP RESULT PANEL (after successful accept) ───────────────────────── */}
      <Dialog
        open={otpPanelOpen}
        onOpenChange={(o) => {
          if (!o) closeOtpPanel();
        }}
      >
        <DialogContent className="sm:max-w-md z-[200]">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              {t("company.hiringRequests.detailsModal.requestAccepted")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t("company.hiringRequests.detailsModal.otpDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                    {t("company.hiringRequests.detailsModal.otpSent")}
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400">
                    {t("company.hiringRequests.detailsModal.otpHint")}
                  </p>
                </div>
              </div>

              {otpPanelData && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900">
                    <span className="text-[10px] text-muted-foreground">
                      {t("company.hiringRequests.detailsModal.workerPhone")}
                    </span>
                    <span className="text-xs font-mono font-bold">
                      {otpPanelData.worker_phone_preview}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900">
                    <span className="text-[10px] text-muted-foreground">
                      {t("company.hiringRequests.detailsModal.otpExpiresIn")}
                    </span>
                    <span className="text-xs font-bold text-orange-600">
                      {otpPanelData.expires_in_minutes} {t("company.hiringRequests.detailsModal.minutes")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {otpPanelData?.next_step && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-amber-800 dark:text-amber-400">
                  {otpPanelData.next_step}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-foreground">
                {t("company.hiringRequests.detailsModal.nextSteps")}
              </p>
              <div className="space-y-1">
                {[
                  t("company.hiringRequests.detailsModal.step1"),
                  t("company.hiringRequests.detailsModal.step2"),
                  t("company.hiringRequests.detailsModal.step3"),
                  t("company.hiringRequests.detailsModal.step4"),
                  t("company.hiringRequests.detailsModal.step5"),
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[10px] text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              size="sm"
              onClick={closeOtpPanel}
              className="h-9 text-xs w-full"
            >
              {t("company.hiringRequests.detailsModal.gotIt")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HiringRequestDetailsModal;