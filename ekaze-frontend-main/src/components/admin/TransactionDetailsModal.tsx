import { useState } from "react";
import { Modal } from "antd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
  Wallet,
  CreditCard,
  Calendar,
  User,
  Mail,
  Phone,
  Building2,
  Users,
  AlertTriangle,
  Clock,
  FileText,
  RefreshCw,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useTransactionDetails, useMarkForReview, useRefundTransaction } from "@/hooks/useTransactions";
import { useConfirmEmployerPayment } from "@/hooks/useUsers";
import { formatCurrency, getStatusColor, getTransactionTypeLabel, getPaymentMethodLabel } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface TransactionDetailsModalProps {
  transactionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetailsModal = ({
  transactionId,
  isOpen,
  onClose,
}: TransactionDetailsModalProps) => {
  const { t } = useLanguage();
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"review" | "refund">("review");
  const [reviewNotes, setReviewNotes] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  const { data, isLoading } = useTransactionDetails(transactionId);
  const markForReview = useMarkForReview();
  const refundTransaction = useRefundTransaction();
  const confirmPayment = useConfirmEmployerPayment();

  const transaction = data?.data;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleAction = (type: "review" | "refund") => {
    setActionType(type);
    setReviewNotes("");
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!transactionId) return;

    try {
      if (actionType === "review") {
        await markForReview.mutateAsync({
          transactionId,
          data: { review_notes: reviewNotes }
        });
      } else if (actionType === "refund") {
        await refundTransaction.mutateAsync(transactionId);
      }
      setActionDialogOpen(false);
      onClose();
    } catch (error) {
      // Error handled by mutation hooks
    }
  };

  const getStatusBadge = (status: string) => {
    const colorClass = getStatusColor(status);
    switch (colorClass) {
      case 'green': return t("admin.transactionDetails.statusGreen");
      case 'yellow': return t("admin.transactionDetails.statusYellow");
      case 'red': return t("admin.transactionDetails.statusRed");
      case 'orange': return t("admin.transactionDetails.statusOrange");
      case 'purple': return t("admin.transactionDetails.statusPurple");
      default: return t("admin.transactionDetails.statusGray");
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      completed: t("admin.transactionManagement.completed"),
      pending: t("admin.transactionManagement.pending"),
      failed: t("admin.transactionManagement.failed_status"),
      review: t("admin.transactionManagement.review"),
      refunded: t("admin.transactionManagement.refunded"),
    };
    return statusMap[status] || status;
  };

  const renderPayerInfo = () => {
    if (!transaction) return null;

    const company = transaction.relatedCompany || transaction.related_company;
    const employer = transaction.relatedEmployer || transaction.related_employer;

    if (company) {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 dark:bg-purple-950/20 dark:border-purple-900">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-medium text-purple-800 dark:text-purple-400">{t("admin.transactionDetails.company")}</p>
            </div>
            <p className="text-sm font-medium">{company.business_name || t("admin.transactionDetails.notAvailable")}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">{t("admin.transactionDetails.tin")}: {company.tin || t("admin.transactionDetails.notAvailable")}</p>
            {company.physical_address && (
              <p className="text-xs text-muted-foreground mt-1">{company.physical_address}</p>
            )}
          </div>
        </div>
      );
    }

    if (employer) {
      return (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-blue-800 dark:text-blue-400">{t("admin.transactionDetails.employer")}</p>
          </div>
          <p className="text-sm font-medium">{employer.user?.name || t("admin.transactionDetails.notAvailable")}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">{employer.user?.email || t("admin.transactionDetails.notAvailable")}</p>
        </div>
      );
    }

    return null;
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
            maxHeight: "85vh",
            overflowY: "auto",
            padding: "16px",
          },
          mask: {
            backdropFilter: "blur(4px)",
          },
        }}
        className="transaction-details-modal"
      >
        {isLoading || !transaction ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-3">
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
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {t("admin.transactionDetails.title")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.transactionDetails.transactionId")
                      .replace("{id}", transaction.transaction_id)
                      .replace("{reference}", transaction.payment_reference || t("admin.transactionDetails.noReference"))}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      className={`text-xs ${getStatusBadge(transaction.status)}`}
                    >
                      {getStatusText(transaction.status)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getTransactionTypeLabel(transaction.transaction_type)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <CreditCard className="w-3 h-3 mr-1" />
                      {getPaymentMethodLabel(transaction.payment_method)}
                    </Badge>
                  </div>
                </div>
              </div>
              {transaction.status === "pending" &&
                transaction.transaction_type === "employer_registration" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 h-8 text-xs text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/30"
                  onClick={() => transaction.user_id && confirmPayment.mutateAsync(transaction.user_id)}
                  disabled={confirmPayment.isPending}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {confirmPayment.isPending ? "Confirming..." : "Confirm Payment"}
                </Button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Wallet className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {formatCurrency(Number(transaction.amount))}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{t("admin.transactionDetails.amount")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-950/30">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{t("admin.transactionDetails.date")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg dark:bg-green-950/30">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(transaction.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{t("admin.transactionDetails.time")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-950/30">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        #{transaction.id}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{t("admin.transactionDetails.transactionIdLabel")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info" className="transition-all duration-200">
                  {t("admin.transactionDetails.transactionInfo")}
                </TabsTrigger>
                <TabsTrigger value="user" className="transition-all duration-200">
                  {t("admin.transactionDetails.userDetails")}
                </TabsTrigger>
              </TabsList>

              {/* Transaction Info Tab */}
              <TabsContent value="info" className="space-y-3 mt-3">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Transaction Information */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-primary" />
                          {t("admin.transactionDetails.transactionInformation")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-start gap-2">
                            <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">{t("admin.transactionDetails.transactionType")}</p>
                              <p className="text-xs font-medium">
                                {getTransactionTypeLabel(transaction.transaction_type)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Wallet className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">{t("admin.transactionDetails.paymentMethod")}</p>
                              <p className="text-xs font-medium">
                                {getPaymentMethodLabel(transaction.payment_method)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Wallet className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">{t("admin.transactionDetails.amount")}</p>
                              <p className="text-xs font-medium">
                                {formatCurrency(Number(transaction.amount))}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">{t("admin.transactionDetails.status")}</p>
                              <Badge className={`text-xs ${getStatusBadge(transaction.status)}`}>
                                {getStatusText(transaction.status)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">{t("admin.transactionDetails.createdDate")}</p>
                              <p className="text-xs font-medium">
                                {new Date(transaction.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">{t("admin.transactionDetails.updatedDate")}</p>
                              <p className="text-xs font-medium">
                                {new Date(transaction.updated_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {transaction.description && (
                          <div className="pt-3 border-t">
                            <p className="text-[10px] text-muted-foreground mb-1">{t("admin.transactionDetails.description")}</p>
                            <p className="text-xs">{transaction.description}</p>
                          </div>
                        )}

                        {transaction.failure_reason && (
                          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <p className="text-xs font-medium text-red-800 dark:text-red-400">{t("admin.transactionDetails.failureReason")}</p>
                            </div>
                            <p className="text-xs text-red-600 dark:text-red-300">{transaction.failure_reason}</p>
                          </div>
                        )}

                        {/* Metadata */}
                        {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                          <div className="pt-3 border-t">
                            <p className="text-[10px] text-muted-foreground mb-2">{t("admin.transactionDetails.additionalData")}</p>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                              <pre className="text-[10px] whitespace-pre-wrap overflow-x-auto">
                                {JSON.stringify(transaction.metadata, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payer Info & Actions */}
                  <div className="space-y-3">
                    {/* Payer Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">{t("admin.transactionDetails.payerInformation")}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {renderPayerInfo()}
                        
                        {transaction.user && (
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={transaction.user.profile_photo || undefined} />
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {transaction.user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium">{transaction.user.name}</p>
                                <p className="text-[10px] text-muted-foreground">{t("admin.transactionDetails.userId")}: {transaction.user_id}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px]">{transaction.user.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px]">{transaction.user.phone}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {(transaction.relatedWorker || transaction.related_worker) && (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200 dark:bg-green-950/20 dark:border-green-900">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4 text-green-600" />
                              <p className="text-xs font-medium text-green-800 dark:text-green-400">{t("admin.transactionDetails.relatedWorker")}</p>
                            </div>
                            <p className="text-xs">
                              {(transaction.relatedWorker || transaction.related_worker)?.first_name}{' '}
                              {(transaction.relatedWorker || transaction.related_worker)?.last_name}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">{t("admin.transactionDetails.transactionActions")}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {transaction.status === "failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full justify-start gap-2 h-9 text-xs hover:scale-105 transition-transform duration-200"
                            onClick={() => handleAction("review")}
                            disabled={markForReview.isPending}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {markForReview.isPending ? t("admin.transactionDetails.marking") : t("admin.transactionDetails.markForReview")}
                          </Button>
                        )}

                        {transaction.status === "completed" && transaction.transaction_type !== "refund" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-40 justify-start gap-2 h-9 text-xs hover:scale-105 transition-transform duration-200" 
                            onClick={() => handleAction("refund")}
                            disabled={refundTransaction.isPending}
                          >
                            <RefreshCw className="w-3 h-3" />
                            {refundTransaction.isPending ? t("admin.transactionDetails.processing") : t("admin.transactionDetails.issueRefund")}
                          </Button>
                        )}

{transaction.status === "pending" && (
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-yellow-600" />
                              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-400">
                                {t("admin.transactionDetails.transactionPending")}
                              </p>
                            </div>
                            <p className="text-[10px] text-yellow-600 dark:text-yellow-400 mt-1">
                              {t("admin.transactionDetails.pendingMessage")}
                            </p>
                          </div>
                        )}

                        {transaction.status === "pending" &&
                          transaction.transaction_type === "employer_registration" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full justify-start gap-2 h-9 text-xs text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/30"
                            onClick={() => transaction.user_id && confirmPayment.mutateAsync(transaction.user_id)}
                            disabled={confirmPayment.isPending}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {confirmPayment.isPending ? "Confirming..." : "Confirm Payment"}
                          </Button>
                        )}

                        {transaction.status !== "pending" && 
                         transaction.status !== "failed" && 
                         (transaction.status !== "completed" || transaction.transaction_type === "refund") && (
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                            <p className="text-[10px] text-muted-foreground text-center">
                              {t("admin.transactionDetails.noActionsAvailable")}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* User Details Tab */}
              <TabsContent value="user" className="mt-3">
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t("admin.transactionDetails.userDetails")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transaction.user ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={transaction.user.profile_photo || undefined} />
                            <AvatarFallback className="text-lg bg-primary/10 text-primary">
                              {transaction.user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold">{transaction.user.name}</h3>
                            <p className="text-xs text-muted-foreground">{transaction.user.email}</p>
                            {transaction.user.role && (
                              <Badge variant="outline" className="text-[10px] mt-1">
                                {transaction.user.role}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{t("admin.transactionDetails.phoneNumber")}</p>
                            <p className="text-xs font-medium">{transaction.user.phone}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{t("admin.transactionDetails.userId")}</p>
                            <p className="text-xs font-medium">#{transaction.user_id}</p>
                          </div>
                          {transaction.user.status && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground">{t("admin.transactionDetails.accountStatus")}</p>
                              <Badge className={`text-[10px] ${getStatusBadge(transaction.user.status)}`}>
                                {transaction.user.status}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <User className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">{t("admin.transactionDetails.noUserInfo")}</p>
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
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {actionType === "review" && t("admin.transactionDetails.markForReviewTitle")}
              {actionType === "refund" && t("admin.transactionDetails.issueRefundTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {actionType === "review" &&
                t("admin.transactionDetails.reviewDescription").replace("{id}", transaction?.transaction_id || "")}
              {actionType === "refund" &&
                t("admin.transactionDetails.refundDescription")
                  .replace("{amount}", formatCurrency(Number(transaction?.amount || 0)))
                  .replace("{user}", transaction?.user?.name || "")}
            </DialogDescription>
          </DialogHeader>

          {actionType === "review" && (
            <Textarea
              placeholder={t("admin.transactionDetails.reviewNotesPlaceholder")}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
              className="text-xs"
            />
          )}

          {actionType === "refund" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/20 dark:border-red-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-400">
                  {t("admin.transactionDetails.refundWarning")}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={markForReview.isPending || refundTransaction.isPending}
              className="h-9 w-24 text-xs"
            >
              {t("admin.transactionDetails.cancel")}
            </Button>
            <Button
              size="sm"
              variant={actionType === "refund" ? "destructive" : "default"}
              onClick={confirmAction}
              disabled={
                (actionType === "review" && !reviewNotes.trim()) ||
                markForReview.isPending ||
                refundTransaction.isPending
              }
              className="h-9 w-24 text-xs"
            >
              {markForReview.isPending || refundTransaction.isPending
                ? t("admin.transactionDetails.processing")
                : t("admin.transactionDetails.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionDetailsModal;