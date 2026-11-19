import { useState } from "react";
import { Modal } from "antd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  X,
  User,
  Building2,
  Calendar,
  CreditCardIcon,
  FileText,
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Shield,
  Award,
  Users,
} from "lucide-react";
import { useEmployerHiringRequest, useCancelHiringRequest } from "@/hooks/useEmployerHiringRequests";
import { format } from "date-fns";
import { toast } from "sonner";
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
import { useLanguage } from "@/contexts/LanguageContext";

interface HiringRequestDetailsModalProps {
  requestId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const HiringRequestDetailsModal = ({ requestId, isOpen, onClose }: HiringRequestDetailsModalProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("worker");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data, isLoading } = useEmployerHiringRequest(requestId);
  const cancelMutation = useCancelHiringRequest();

  const request = data?.data;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      accepted: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[status as keyof typeof styles] || "";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Briefcase className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: t("employer.hiringRequestManagement.details.pending"),
      accepted: t("employer.hiringRequestManagement.details.accepted"),
      rejected: t("employer.hiringRequestManagement.details.rejected"),
      cancelled: t("employer.hiringRequestManagement.details.cancelled"),
    };
    return statusMap[status] || status.toUpperCase();
  };

  const getGenderText = (gender: string) => {
    const genderMap: Record<string, string> = {
      male: t("employer.hiringRequestManagement.details.male"),
      female: t("employer.hiringRequestManagement.details.female"),
    };
    return genderMap[gender] || gender;
  };

  const formatCurrency = (amount: number | string | null): string => {
    if (amount === null || amount === undefined) return t("employer.hiringRequestManagement.details.notSpecified");
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const handleCancel = async () => {
    if (!requestId) return;

    try {
      await cancelMutation.mutateAsync(requestId);
      toast.success(t("employer.hiringRequestManagement.details.cancelledSuccess"));
      setShowCancelDialog(false);
      onClose();
    } catch (error) {
      toast.error(t("employer.hiringRequestManagement.details.cancelFailed"));
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width="95vw"
        centered
        closeIcon={
          <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </div>
        }
        styles={{
          body: { 
            maxHeight: '85vh', 
            overflowY: 'auto',
            padding: '16px'
          },
          mask: {
            backdropFilter: 'blur(4px)'
          }
        }}
        className="hiring-request-details-modal"
      >
        {isLoading || !request ? (
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
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${getStatusBadge(request.status)}`}>
                  {getStatusIcon(request.status)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {t("employer.hiringRequestManagement.details.title")}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs ${getStatusBadge(request.status)}`}>
                      {getStatusText(request.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {t("employer.hiringRequestManagement.details.requestId").replace("{id}", request.id.toString())}
                    </span>
                  </div>
                </div>
              </div>
              {request.status === 'pending' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                  className="text-xs h-8"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  {t("employer.hiringRequestManagement.details.cancelRequest")}
                </Button>
              )}
            </div>

            {/* Quick Stats - Compact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="p-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 group-hover:scale-110 transition-transform duration-300">
                      <CreditCardIcon className="w-2.5 h-2.5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-foreground mb-0.5">
                        {formatCurrency(request.proposed_salary)}
                      </h3>
                      <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("employer.hiringRequestManagement.details.proposedSalary")}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-muted-foreground/80">{t("employer.hiringRequestManagement.details.amount")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="p-0.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 group-hover:scale-110 transition-transform duration-300">
                      <Star className="w-2.5 h-2.5 text-yellow-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-foreground mb-0.5">
                        {typeof request.worker.average_rating === 'string' 
                          ? parseFloat(request.worker.average_rating).toFixed(1)
                          : request.worker.average_rating.toFixed(1)}
                      </h3>
                      <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("employer.hiringRequestManagement.details.workerRating")}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-muted-foreground/80">{t("employer.hiringRequestManagement.details.averageScore")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="p-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 group-hover:scale-110 transition-transform duration-300">
                      <Award className="w-2.5 h-2.5 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-foreground mb-0.5 capitalize">
                        {request.worker.experience_level}
                      </h3>
                      <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("employer.hiringRequestManagement.details.experience")}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-muted-foreground/80">{t("employer.hiringRequestManagement.details.level")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="p-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-2.5 h-2.5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-foreground mb-0.5">
                        {format(new Date(request.created_at), 'MMM dd')}
                      </h3>
                      <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("employer.hiringRequestManagement.details.requestDate")}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-muted-foreground/80">{t("employer.hiringRequestManagement.details.sent")}</span>
                      <span className="text-muted-foreground/60 font-medium">
                        {format(new Date(request.created_at), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="worker" className="transition-all duration-200 text-xs">
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  {t("employer.hiringRequestManagement.details.workerInformation")}
                </TabsTrigger>
                <TabsTrigger value="company" className="transition-all duration-200 text-xs">
                  <Building2 className="w-3.5 h-3.5 mr-1.5" />
                  {t("employer.hiringRequestManagement.details.companyInformation")}
                </TabsTrigger>
                <TabsTrigger value="request" className="transition-all duration-200 text-xs">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  {t("employer.hiringRequestManagement.details.requestDetails")}
                </TabsTrigger>
                <TabsTrigger value="timeline" className="transition-all duration-200 text-xs">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  {t("employer.hiringRequestManagement.details.timelineResponse")}
                </TabsTrigger>
              </TabsList>

              {/* Worker Information Tab */}
              <TabsContent value="worker" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-primary" />
                      {t("employer.hiringRequestManagement.details.workerInformation")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={request.worker.profile_photo || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {request.worker.first_name[0]}{request.worker.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{request.worker.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("employer.hiringRequestManagement.details.yearsOld")
                            .replace("{age}", request.worker.age.toString())
                            .replace("{gender}", getGenderText(request.worker.gender))}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium">
                            {typeof request.worker.average_rating === 'string' 
                              ? parseFloat(request.worker.average_rating).toFixed(1)
                              : request.worker.average_rating.toFixed(1)} {t("employer.hiringRequestManagement.details.rating")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground">{t("employer.hiringRequestManagement.details.experienceLevel")}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {request.worker.experience_level}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground">{t("employer.hiringRequestManagement.details.availabilityStatus")}</p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {request.worker.availability_status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Company Information Tab */}
              <TabsContent value="company" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-primary" />
                      {t("employer.hiringRequestManagement.details.companyInformation")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">{t("employer.hiringRequestManagement.details.businessName")}</p>
                      <p className="text-sm font-semibold">{request.company.business_name}</p>
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">{t("employer.hiringRequestManagement.details.contactPerson")}</p>
                      <p className="text-sm font-medium">{request.company.owner_name}</p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-green-600" />
                        <p className="text-xs font-mono">{request.company.owner_phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-blue-600" />
                        <p className="text-xs">{request.company.owner_email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Request Details Tab */}
              <TabsContent value="request" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-primary" />
                      {t("employer.hiringRequestManagement.details.requestDetails")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <CreditCardIcon className="w-3 h-3" />
                        {t("employer.hiringRequestManagement.details.proposedSalary")}
                      </p>
                      <p className="text-lg font-bold">{formatCurrency(request.proposed_salary)}</p>
                    </div>

                    {request.work_description && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground">{t("employer.hiringRequestManagement.details.workDescription")}</p>
                          <p className="text-xs leading-relaxed">{request.work_description}</p>
                        </div>
                      </>
                    )}

                    {request.message && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground">{t("employer.hiringRequestManagement.details.messageToCompany")}</p>
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-xs">{request.message}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Timeline & Response Tab */}
              <TabsContent value="timeline" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      {t("employer.hiringRequestManagement.details.timelineResponse")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">{t("employer.hiringRequestManagement.details.requestSent")}</p>
                      <p className="text-sm font-medium">
                        {format(new Date(request.created_at), 'PPP')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(request.created_at), 'HH:mm:ss')}
                      </p>
                    </div>

                    {request.responded_at && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground">{t("employer.hiringRequestManagement.details.companyResponded")}</p>
                          <p className="text-sm font-medium">
                            {format(new Date(request.responded_at), 'PPP')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(request.responded_at), 'HH:mm:ss')}
                          </p>
                        </div>
                      </>
                    )}

                    {request.response_message && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground">{t("employer.hiringRequestManagement.details.companyResponse")}</p>
                          <div className={`p-2 rounded ${
                            request.status === 'accepted' 
                              ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
                              : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                          }`}>
                            <p className="text-xs">{request.response_message}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Employment Information (if accepted) */}
            {request.employment && (
              <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {t("employer.hiringRequestManagement.details.employmentDetails")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-[10px] text-muted-foreground mb-1">{t("employer.hiringRequestManagement.details.employmentId")}</p>
                      <p className="text-sm font-medium">#{request.employment.id}</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-[10px] text-muted-foreground mb-1">{t("employer.hiringRequestManagement.details.startDate")}</p>
                      <p className="text-sm font-medium">
                        {format(new Date(request.employment.start_date), 'PPP')}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <p className="text-[10px] text-muted-foreground mb-1">{t("employer.hiringRequestManagement.details.agreedSalary")}</p>
                      <p className="text-sm font-medium">
                        {formatCurrency(request.employment.agreed_salary)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="z-[9999]">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("employer.hiringRequestManagement.details.cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("employer.hiringRequestManagement.details.cancelDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("employer.hiringRequestManagement.details.cancelNo")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("employer.hiringRequestManagement.details.cancelYes")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HiringRequestDetailsModal;