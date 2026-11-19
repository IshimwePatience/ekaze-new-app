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
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Wallet,
  Star,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Ban,
  TrendingUp,
  X,
  Loader2,
} from "lucide-react";
import { XCircle as XCircleIcon, AlertCircle } from "lucide-react";



import { useCompanyDetails, useApproveCompany, useRejectCompany, useSuspendCompany, useReactivateCompany } from "@/hooks/useCompanies";
import { useLanguage } from "@/contexts/LanguageContext";

import { useCompanyFeesByCompany, useApproveFee, useRejectCompanyFee } from "@/hooks/useCompanies";
import { companyApi } from "@/api/companyService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CreditCard, CheckCircle } from "lucide-react";
import { CompanyFee } from "@/types/company-fee.types";

interface CompanyDetailsModalProps {
  companyId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const CompanyDetailsModal = ({ companyId, isOpen, onClose }: CompanyDetailsModalProps) => {
  const { t } = useLanguage();
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "suspend">("approve");
  const [actionReason, setActionReason] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  const queryClient = useQueryClient();
  const [isAdjustingTrial, setIsAdjustingTrial] = useState(false);
  const [trialDaysDelta, setTrialDaysDelta] = useState("7");

  const handleAdjustTrial = async (days: number) => {
    if (!companyId) return;
    setIsAdjustingTrial(true);
    try {
      const res = await companyApi.adjustCompanyTrial(companyId, { days_to_add: days });
      toast.success(res?.message || `Trial adjusted by ${days > 0 ? `+${days}` : days} days.`);
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to adjust trial");
    } finally {
      setIsAdjustingTrial(false);
    }
  };

  const { data, isLoading } = useCompanyDetails(companyId);
const approveCompany = useApproveCompany();
const rejectCompany = useRejectCompany();
const suspendCompany = useSuspendCompany();
const reactivateCompany = useReactivateCompany();

  const { data: feesData, isLoading: isLoadingFees } = useCompanyFeesByCompany(companyId);
  const approveFee = useApproveFee();
  const rejectFee = useRejectCompanyFee();
const [rejectingFeeId, setRejectingFeeId] = useState<number | null>(null);
const [rejectReason, setRejectReason] = useState("");
  const fees = feesData?.data?.data || [];

  const company = data?.data?.company;
  const statistics = data?.data?.statistics;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleAction = (type: "approve" | "reject" | "suspend") => {
    setActionType(type);
    setActionReason("");
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!companyId) return;

    try {
      if (actionType === "approve") {
        await approveCompany.mutateAsync(companyId);
      } else if (actionType === "reject") {
        await rejectCompany.mutateAsync({ 
          id: companyId, 
          data: { rejection_reason: actionReason } 
        });
      } else if (actionType === "suspend") {
        await suspendCompany.mutateAsync({ 
          id: companyId, 
          data: { suspension_reason: actionReason } 
        });
      }
      setActionDialogOpen(false);
      onClose();
    } catch (error) {
      // Error handled by mutation hooks
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: t("admin.companyDetails.pending_badge"),
      approved: t("admin.companyDetails.approved_badge"),
      rejected: t("admin.companyDetails.rejected_badge"),
      suspended: t("admin.companyDetails.suspended_badge"),
      active: t("admin.companyDetails.active_badge"),
      hired: t("admin.companyDetails.hired_badge"),
      available: t("admin.companyDetails.available_badge"),
      completed: t("admin.companyDetails.completed_badge"),
    };
    return statusMap[status] || status;
  };

  const getExperienceText = (level: string): string => {
    const experienceMap: Record<string, string> = {
      entry: t("admin.companyDetails.entry"),
      intermediate: t("admin.companyDetails.intermediate"),
      advanced: t("admin.companyDetails.advanced"),
      expert: t("admin.companyDetails.expert"),
    };
    return experienceMap[level] || level;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      suspended: "bg-orange-100 text-orange-800 border-orange-200",
      active: "bg-green-100 text-green-800 border-green-200",
      hired: "bg-blue-100 text-blue-800 border-blue-200",
      available: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[status as keyof typeof styles] || "";
  };

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
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
        zIndex={1000}
        className="company-details-modal"
      >
        {isLoading || !company ? (
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
              <div>
                <h2 className="text-lg font-bold text-foreground">{company.business_name}</h2>
                <p className="text-xs text-muted-foreground">{t("admin.companyDetails.tin")}: {company.tin}</p>
              </div>
              <Badge className={`text-xs ${getStatusBadge(company.status)}`}>
                {getStatusText(company.status)}
              </Badge>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{statistics?.total_workers || 0}</p>
                    <p className="text-[10px] text-muted-foreground">{t("admin.companyDetails.workers")}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Wallet className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{formatCurrency(statistics?.total_revenue || 0)}</p>
                    <p className="text-[10px] text-muted-foreground">{t("admin.companyDetails.revenue")}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{parseFloat(statistics?.average_worker_rating || "0").toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground">{t("admin.companyDetails.avgRating")}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{statistics?.pending_requests || 0}</p>
                    <p className="text-[10px] text-muted-foreground">{t("admin.companyDetails.pending")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="info" className="transition-all duration-200">
                {t("admin.companyDetails.companyInfo")}
              </TabsTrigger>
              <TabsTrigger value="workers" className="transition-all duration-200">
                {t("admin.companyDetails.workers_tab")} ({company.workers?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="requests" className="transition-all duration-200">
                {t("admin.companyDetails.requests")} ({company.hiring_requests?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="transactions" className="transition-all duration-200">
                {t("admin.companyDetails.transactions")} ({company.transactions?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="fees" className="transition-all duration-200">
                Fees ({fees.length})
              </TabsTrigger>
            </TabsList>

              {/* Company Info Tab */}
              <TabsContent value="info" className="space-y-3 mt-3">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Company Information */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Building2 className="w-4 h-4 text-primary" />
                          {t("admin.companyDetails.companyInformation")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">{t("admin.companyDetails.ownerEmail")}</p>
                              <p className="text-xs font-medium">{company.owner_email}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">{t("admin.companyDetails.ownerPhone")}</p>
                              <p className="text-xs font-medium">{company.owner_phone}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">{t("admin.companyDetails.ownerName")}</p>
                              <p className="text-xs font-medium">{company.owner_name}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">{t("admin.companyDetails.location")}</p>
                              <p className="text-xs font-medium">{company.physical_address}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">{t("admin.companyDetails.registrationDate")}</p>
                              <p className="text-xs font-medium">{new Date(company.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Wallet className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">{t("admin.companyDetails.subscriptionFee")}</p>
                              <p className="text-xs font-medium">
                                {formatCurrency(company.subscription_amount || company.subscription_fee || 50000)}
                                <span className="text-[10px] text-slate-500 ml-1">({company.subscription_cycle || 'monthly'})</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Free Trial / Subscription Management */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-800">
                              Billing Plan: <span className="capitalize text-[#2478b8]">{company.billing_plan === 'subscription' ? 'Direct Subscription' : 'Free Trial'}</span>
                            </span>
                            {company.trial_ends_at && (
                              <span className="text-[11px] font-medium text-slate-600">
                                Ends: {new Date(company.trial_ends_at).toLocaleDateString('en-GB')}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200">
                            <span className="text-[11px] font-medium text-slate-600">Adjust Trial:</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2"
                              disabled={isAdjustingTrial}
                              onClick={() => handleAdjustTrial(7)}
                            >
                              +7 Days
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2"
                              disabled={isAdjustingTrial}
                              onClick={() => handleAdjustTrial(30)}
                            >
                              +30 Days
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2 text-red-600 hover:text-red-700"
                              disabled={isAdjustingTrial}
                              onClick={() => handleAdjustTrial(-7)}
                            >
                              -7 Days
                            </Button>
                            <div className="flex items-center gap-1 ml-auto">
                              <input
                                type="number"
                                className="w-14 h-7 text-xs px-1.5 rounded border border-slate-300"
                                placeholder="Days"
                                value={trialDaysDelta}
                                onChange={(e) => setTrialDaysDelta(e.target.value)}
                              />
                              <Button
                                size="sm"
                                className="h-7 text-xs px-2 bg-[#2478b8] hover:bg-[#1f669c] text-white"
                                disabled={isAdjustingTrial || !trialDaysDelta}
                                onClick={() => handleAdjustTrial(Number(trialDaysDelta) || 0)}
                              >
                                Set
                              </Button>
                            </div>
                          </div>
                        </div>

                        {company.rejection_reason && (
                          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900 animate-in fade-in slide-in-from-top-2 duration-300">
                            <p className="text-xs font-medium text-red-800 dark:text-red-400">{t("admin.companyDetails.rejectionReason")}</p>
                            <p className="text-xs text-red-600 dark:text-red-300 mt-1">{company.rejection_reason}</p>
                          </div>
                        )}

                        {company.suspension_reason && (
                          <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900 animate-in fade-in slide-in-from-top-2 duration-300">
                            <p className="text-xs font-medium text-orange-800 dark:text-orange-400">{t("admin.companyDetails.suspensionReason")}</p>
                            <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">{company.suspension_reason}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

            {(company.status === "pending" || company.status === "approved" || company.status === "suspended") && (
              <div>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t("admin.companyDetails.quickActions")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {company.status === "pending" && (
                      <>
                        <Button 
                          size="sm"
                          className="w-full justify-center gap-2 h-9 text-xs hover:scale-105 transition-transform duration-200" 
                          onClick={() => handleAction("approve")}
                          disabled={approveCompany.isPending}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {approveCompany.isPending ? t("admin.companyDetails.approving") : t("admin.companyDetails.approveCompany")}
                        </Button>
                        <Button 
                          size="sm"
                          variant="destructive" 
                          className="w-full justify-center gap-2 h-9 text-xs hover:scale-105 transition-transform duration-200" 
                          onClick={() => handleAction("reject")}
                          disabled={rejectCompany.isPending}
                        >
                          <XCircle className="w-3 h-3" />
                          {rejectCompany.isPending ? t("admin.companyDetails.rejecting") : t("admin.companyDetails.rejectRegistration")}
                        </Button>
                      </>
                    )}
                    {company.status === "approved" && (
                      <Button 
                        size="sm"
                        variant="destructive" 
                        className="w-full justify-center gap-2 h-9 text-xs hover:scale-105 transition-transform duration-200" 
                        onClick={() => handleAction("suspend")}
                        disabled={suspendCompany.isPending}
                      >
                        <Ban className="w-3 h-3" />
                        {suspendCompany.isPending ? t("admin.companyDetails.suspending") : t("admin.companyDetails.suspendCompany")}
                      </Button>
                    )}
                    {company.status === "suspended" && (
                      <Button 
                        size="sm"
                        className="w-full justify-center gap-2 h-9 text-xs hover:scale-105 transition-transform duration-200 bg-green-600 hover:bg-green-700" 
                        onClick={() => reactivateCompany.mutate(companyId!)}
                        disabled={reactivateCompany.isPending}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {reactivateCompany.isPending ? "Reactivating..." : "Reactivate Company"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
                </div>
              </TabsContent>

              {/* Workers Tab */}
              <TabsContent value="workers" className="mt-3">
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">{t("admin.companyDetails.worker")}</TableHead>
                            <TableHead className="text-xs">{t("admin.companyDetails.experience")}</TableHead>
                            <TableHead className="text-xs">{t("admin.companyDetails.status")}</TableHead>
                            <TableHead className="text-xs">{t("admin.companyDetails.rating")}</TableHead>
                            <TableHead className="text-xs">{t("admin.companyDetails.employments")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {company.workers?.map((worker, index) => (
                            <TableRow 
                              key={worker.id}
                              className="animate-in fade-in slide-in-from-left-4"
                              style={{ 
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: 'backwards'
                              }}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-7 w-7">
                                    <AvatarImage src={worker.user?.profile_photo || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                      {worker.first_name[0]}{worker.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-xs font-medium">{worker.first_name} {worker.last_name}</p>
                                    <p className="text-[10px] text-muted-foreground">{t("admin.companyDetails.id")}: {worker.id}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs capitalize">{getExperienceText(worker.experience_level)}</TableCell>
                              <TableCell>
                                <Badge className={`text-[10px] ${getStatusBadge(worker.availability_status)}`}>
                                  {getStatusText(worker.availability_status)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {parseFloat(worker.average_rating) > 0 ? (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs">{parseFloat(worker.average_rating).toFixed(1)}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-xs">{worker.total_employments}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Hiring Requests Tab */}
              <TabsContent value="requests" className="mt-3">
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">{t("admin.companyDetails.requestId")}</TableHead>
                            <TableHead className="text-xs">{t("admin.companyDetails.employer")}</TableHead>
                            <TableHead className="text-xs">{t("admin.companyDetails.proposedSalary")}</TableHead>
                            <TableHead className="text-xs">{t("admin.companyDetails.status")}</TableHead>
                            <TableHead className="text-xs">{t("admin.companyDetails.date")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {company.hiring_requests?.map((request, index) => (
                            <TableRow 
                              key={request.id}
                              className="animate-in fade-in slide-in-from-left-4"
                              style={{ 
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: 'backwards'
                              }}
                            >
                              <TableCell className="font-mono text-xs">#{request.id}</TableCell>
                              <TableCell className="text-xs">{request.employer?.user?.name || t("admin.companyDetails.notAvailable")}</TableCell>
                              <TableCell className="text-xs font-medium">{formatCurrency(request.proposed_salary)}</TableCell>
                              <TableCell>
                                <Badge className={`text-[10px] ${getStatusBadge(request.status)}`}>
                                  {getStatusText(request.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs">{new Date(request.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="mt-3">
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">{t("admin.companyDetails.transactionId")}</TableHead>
                            <TableHead className="text-xs">{t("admin.companyDetails.type")}</TableHead>
                            <TableHead className="text-xs">{t("admin.companyDetails.amount")}</TableHead>
                            <TableHead className="text-xs">{t("admin.companyDetails.status")}</TableHead>
                            <TableHead className="text-xs">{t("admin.companyDetails.date")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {company.transactions?.map((transaction, index) => (
                            <TableRow 
                              key={transaction.id}
                              className="animate-in fade-in slide-in-from-left-4"
                              style={{ 
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: 'backwards'
                              }}
                            >
                              <TableCell className="font-mono text-xs">{transaction.transaction_id}</TableCell>
                              <TableCell className="text-xs capitalize">{transaction.transaction_type.replace(/_/g, ' ')}</TableCell>
                              <TableCell className="text-xs font-medium">{formatCurrency(transaction.amount)}</TableCell>
                              <TableCell>
                                <Badge className={`text-[10px] ${getStatusBadge(transaction.status)}`}>
                                  {getStatusText(transaction.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs">{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
{/* Fees Tab */}
<TabsContent value="fees" className="mt-3">
  <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <CardContent className="p-0">
      {isLoadingFees ? (
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : fees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 bg-muted/50 rounded-full mb-3">
            <CreditCard className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No fees configured</p>
          <p className="text-xs text-muted-foreground mt-1">
            This company has not set up any fees yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Pay Type</TableHead>
                <TableHead className="text-xs">Value</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Created By</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee: CompanyFee, index: number) => (
                <TableRow
                  key={fee.id}
                  className="animate-in fade-in slide-in-from-left-4"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <CreditCard className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-xs font-medium capitalize">{fee.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {fee.pay_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold">
                    {parseFloat(fee.value).toLocaleString()}
                    {fee.pay_type === "percentage" ? "%" : ` ${fee.currency ?? ""}`}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge
                        className={`text-[10px] ${
                          fee.is_active === 1
                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400'
                            : fee.is_active === 2
                            ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400'
                        }`}
                      >
                        {fee.is_active === 1 ? (
                          <><CheckCircle2 className="w-2.5 h-2.5 mr-1" />Active</>
                        ) : fee.is_active === 2 ? (
                          <><XCircleIcon className="w-2.5 h-2.5 mr-1" />Rejected</>
                        ) : (
                          'Pending'
                        )}
                      </Badge>
                      {fee.is_active === 2 && fee.rejection_reason && (
                        <p className="text-[10px] text-red-500 flex items-start gap-1 max-w-[140px]">
                          <AlertCircle className="w-2.5 h-2.5 shrink-0 mt-0.5" />
                          {fee.rejection_reason}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {fee.created_by_user?.name ?? '—'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(fee.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {fee.is_active === 0 && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => approveFee.mutate(fee.id)}
                          disabled={approveFee.isPending}
                          className="h-7 px-2 text-xs text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-800"
                        >
                          {approveFee.isPending ? "..." : (
                            <><CheckCircle className="w-3 h-3 mr-1" />Approve</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setRejectingFeeId(fee.id); setRejectReason(""); }}
                          className="h-7 px-2 text-xs text-red-700 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800"
                        >
                          <XCircleIcon className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
            </Tabs>
          </div>
        )}
      </Modal>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen} modal={true}>
        <DialogContent className="sm:max-w-md z-[9999]">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {actionType === "approve" && t("admin.companyDetails.approveTitle")}
              {actionType === "reject" && t("admin.companyDetails.rejectTitle")}
              {actionType === "suspend" && t("admin.companyDetails.suspendTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {actionType === "approve" &&
                t("admin.companyDetails.approveDescription").replace("{companyName}", company?.business_name || "")}
              {actionType === "reject" &&
                t("admin.companyDetails.rejectDescription").replace("{companyName}", company?.business_name || "")}
              {actionType === "suspend" &&
                t("admin.companyDetails.suspendDescription").replace("{companyName}", company?.business_name || "")}
            </DialogDescription>
          </DialogHeader>

          {(actionType === "reject" || actionType === "suspend") && (
            <Textarea
              placeholder={t("admin.companyDetails.enterReason")}
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
              disabled={approveCompany.isPending || rejectCompany.isPending || suspendCompany.isPending}
              className="h-9 w-24 text-xs"
            >
              {t("admin.companyDetails.cancel")}
            </Button>
            <Button
              size="sm"
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={confirmAction}
              disabled={
                (actionType === "reject" || actionType === "suspend") && !actionReason.trim() ||
                approveCompany.isPending || rejectCompany.isPending || suspendCompany.isPending
              }
              className="h-9 w-24 text-xs"
            >
              {(approveCompany.isPending || rejectCompany.isPending || suspendCompany.isPending) 
                ? t("admin.companyDetails.processing") 
                : t("admin.companyDetails.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Reject Fee Dialog */}
<Dialog
  open={!!rejectingFeeId}
  onOpenChange={() => { setRejectingFeeId(null); setRejectReason(""); }}
  modal={true}
>
  <DialogContent className="sm:max-w-sm z-[9999]">
    <DialogHeader>
      <DialogTitle className="text-sm flex items-center gap-2">
        <XCircleIcon className="w-4 h-4 text-red-500" />
        Reject Fee
      </DialogTitle>
      <DialogDescription className="text-xs">
        Optionally provide a reason. The company will see this reason.
      </DialogDescription>
    </DialogHeader>
    <Textarea
      placeholder="Rejection reason (optional)"
      value={rejectReason}
      onChange={(e) => setRejectReason(e.target.value)}
      rows={3}
      className="text-xs"
    />
    <DialogFooter className="gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setRejectingFeeId(null)}
        disabled={rejectFee.isPending}
        className="h-9 text-xs"
      >
        Cancel
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="h-9 text-xs"
        disabled={rejectFee.isPending}
        onClick={async () => {
          if (!rejectingFeeId) return;
          await rejectFee.mutateAsync({ id: rejectingFeeId, reason: rejectReason || undefined });
          setRejectingFeeId(null);
          setRejectReason("");
        }}
      >
        {rejectFee.isPending ? (
          <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Rejecting...</>
        ) : "Confirm Reject"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </>
  );
};

export default CompanyDetailsModal;