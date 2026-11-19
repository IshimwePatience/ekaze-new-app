import { Modal } from "antd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  CreditCardIcon,
  User,
  Building,
  Briefcase,
  Calendar,
  FileText,
  Copy,
  ExternalLink,
  X,
  TrendingUp,
  Activity,
  History,
  Target,
  Receipt,
  Info,
} from "lucide-react";
import { useCompanyTransactionDetails } from "@/hooks/useCompanyTransactions";
import { format } from "date-fns";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface CompanyTransactionDetailsModalProps {
  transactionId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const CompanyTransactionDetailsModal = ({
  transactionId,
  isOpen,
  onClose,
}: CompanyTransactionDetailsModalProps) => {
  const { t } = useLanguage();
  const { data, isLoading } = useCompanyTransactionDetails(transactionId);
  const transaction = data?.data;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("company.companyTransactions.detailsModal.copiedToClipboard"));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatShortCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: t("company.companyTransactions.detailsModal.completed"),
      pending: t("company.companyTransactions.detailsModal.pending"),
      failed: t("company.companyTransactions.detailsModal.failed"),
      refunded: t("company.companyTransactions.detailsModal.refunded"),
    };
    return statusMap[status] || status;
  };

  const getEntityTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      worker: t("company.companyTransactions.detailsModal.worker"),
      employer: t("company.companyTransactions.detailsModal.employer"),
      company: t("company.companyTransactions.detailsModal.company"),
    };
    return typeMap[type] || type;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return colors[status as keyof typeof colors] || "";
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mobile_money':
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      case 'bank_transfer':
        return <Building className="w-4 h-4 text-blue-600" />;
      case 'cash':
        return <CreditCardIcon className="w-4 h-4 text-green-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'salary':
        return <CreditCardIcon className="w-5 h-5 text-green-600" />;
      case 'registration':
        return <User className="w-5 h-5 text-purple-600" />;
      case 'refund':
        return <RefreshCw className="w-5 h-5 text-orange-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width="95vw"
      centered
      modalRender={(modal) => <div onClick={(e) => e.stopPropagation()}>{modal}</div>}
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
              <div className="h-16 w-16 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                {getTransactionTypeIcon(transaction.type)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {t("company.companyTransactions.detailsModal.transactionNumber").replace("{id}", transaction.transaction_id.slice(-8))}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                    {getStatusIcon(transaction.status)}
                    <span className="ml-1 capitalize">{getStatusText(transaction.status)}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(transaction.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(transaction.transaction_id)}
                className="h-8 text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                {t("company.companyTransactions.detailsModal.copyId")}
              </Button>
              {transaction.receipt_url && (
                <Button
                  size="sm"
                  onClick={() => window.open(transaction.receipt_url, '_blank')}
                  className="h-8 text-xs"
                >
                  <Receipt className="w-3 h-3 mr-1" />
                  {t("company.companyTransactions.detailsModal.receipt")}
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats - Compact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="p-0.5 rounded-lg bg-green-50 dark:bg-green-950/30 group-hover:scale-110 transition-transform duration-300">
                    <CreditCardIcon className="w-2.5 h-2.5 text-green-600" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground mb-0.5">
                      {formatShortCurrency(transaction.amount)}
                    </h3>
                    <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("company.companyTransactions.detailsModal.amount")}</p>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-muted-foreground/80">{formatCurrency(transaction.amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="p-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 group-hover:scale-110 transition-transform duration-300">
                    <CreditCard className="w-2.5 h-2.5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground mb-0.5">
                      {transaction.payment_method_label?.split(' ')[0] || t("company.companyTransactions.detailsModal.notAvailable")}
                    </h3>
                    <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("company.companyTransactions.detailsModal.method")}</p>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-muted-foreground/80">{t("company.companyTransactions.detailsModal.paymentMethod")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="p-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 group-hover:scale-110 transition-transform duration-300">
                    {transaction.related_entity.type === 'worker' ? (
                      <User className="w-2.5 h-2.5 text-purple-600" />
                    ) : transaction.related_entity.type === 'employer' ? (
                      <Briefcase className="w-2.5 h-2.5 text-purple-600" />
                    ) : (
                      <Building className="w-2.5 h-2.5 text-purple-600" />
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground mb-0.5">
                      {transaction.related_entity.name?.charAt(0) || 'N'}
                    </h3>
                    <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("company.companyTransactions.detailsModal.entity")}</p>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-muted-foreground/80 truncate">
                      {getEntityTypeText(transaction.related_entity.type)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="p-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-2.5 h-2.5 text-orange-600" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground mb-0.5">
                      {formatDate(transaction.created_at)}
                    </h3>
                    <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("company.companyTransactions.detailsModal.created")}</p>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-muted-foreground/80">{t("company.companyTransactions.detailsModal.transactionDate")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" className="transition-all duration-200 text-xs">
                <Info className="w-3.5 h-3.5 mr-1.5" />
                {t("company.companyTransactions.detailsModal.details")}
              </TabsTrigger>
              <TabsTrigger value="entity" className="transition-all duration-200 text-xs">
                {transaction.related_entity.type === 'worker' ? (
                  <User className="w-3.5 h-3.5 mr-1.5" />
                ) : (
                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                )}
                {t("company.companyTransactions.detailsModal.relatedEntity")}
              </TabsTrigger>
              <TabsTrigger value="actions" className="transition-all duration-200 text-xs">
                <Activity className="w-3.5 h-3.5 mr-1.5" />
                {t("company.companyTransactions.detailsModal.actions")}
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Left Column - Transaction Details */}
                <div className="lg:col-span-2 space-y-3">
                  {/* Transaction Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-primary" />
                        {t("company.companyTransactions.detailsModal.transactionInformation")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground">{t("company.companyTransactions.detailsModal.transactionType")}</p>
                          <p className="text-xs font-medium">{transaction.type_label}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground">{t("company.companyTransactions.detailsModal.amount")}</p>
                          <p className="text-sm font-bold text-foreground">
                            {transaction.formatted_amount}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground">{t("company.companyTransactions.detailsModal.paymentMethodLabel")}</p>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(transaction.payment_method)}
                            <p className="text-xs font-medium">{transaction.payment_method_label}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground">{t("company.companyTransactions.detailsModal.paymentReference")}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium">
                              {transaction.payment_reference || t("company.companyTransactions.detailsModal.notAvailable")}
                            </p>
                            {transaction.payment_reference && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(transaction.payment_reference!)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {transaction.payment_phone && (
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground">{t("company.companyTransactions.detailsModal.paymentPhone")}</p>
                          <p className="text-xs font-medium">{transaction.payment_phone}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Description */}
                  {transaction.description && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-primary" />
                          {t("company.companyTransactions.detailsModal.description")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs whitespace-pre-wrap">{transaction.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Failure Reason */}
                  {transaction.failure_reason && (
                    <Card className="border-red-200 bg-red-50/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm text-red-700">
                          <XCircle className="w-4 h-4" />
                          {t("company.companyTransactions.detailsModal.failureReason")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-red-700 whitespace-pre-wrap">{transaction.failure_reason}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Metadata */}
                  {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Info className="w-4 h-4 text-primary" />
                          {t("company.companyTransactions.detailsModal.additionalInformation")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(transaction.metadata).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                              <p className="text-[10px] text-muted-foreground capitalize">
                                {key.replace(/_/g, ' ')}
                              </p>
                              <p className="text-xs font-medium">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Column - Status & Timeline */}
                <div className="space-y-3">
                  {/* Status Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-primary" />
                        {t("company.companyTransactions.detailsModal.statusInformation")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <p className="text-[10px] text-muted-foreground mb-1">{t("company.companyTransactions.detailsModal.currentStatus")}</p>
                        <Badge className={`w-full justify-center text-xs ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">{getStatusText(transaction.status)}</span>
                        </Badge>
                      </div>
                      {transaction.failure_reason && (
                        <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
                          <p className="text-[10px] text-muted-foreground mb-1">{t("company.companyTransactions.detailsModal.failedReason")}</p>
                          <p className="text-xs font-medium">{transaction.failure_reason}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Transaction Timeline */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        {t("company.companyTransactions.detailsModal.timeline")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <p className="text-[10px] text-muted-foreground mb-1">{t("company.companyTransactions.detailsModal.createdAt")}</p>
                        <p className="text-xs font-medium">{formatDateTime(transaction.created_at)}</p>
                      </div>
                      {transaction.paid_at && (
                        <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                          <p className="text-[10px] text-muted-foreground mb-1">{t("company.companyTransactions.detailsModal.paidAt")}</p>
                          <p className="text-xs font-medium">{formatDateTime(transaction.paid_at)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Transaction ID */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-primary" />
                        {t("company.companyTransactions.detailsModal.transactionId")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border/50">
                        <code className="text-xs font-mono flex-1 truncate">
                          {transaction.transaction_id}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(transaction.transaction_id)}
                          className="h-7 w-7 p-0 flex-shrink-0"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Entity Tab */}
            <TabsContent value="entity" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {transaction.related_entity.type === 'worker' ? (
                      <>
                        <User className="w-4 h-4 text-primary" />
                        {t("company.companyTransactions.detailsModal.workerInformation")}
                      </>
                    ) : transaction.related_entity.type === 'employer' ? (
                      <>
                        <Briefcase className="w-4 h-4 text-primary" />
                        {t("company.companyTransactions.detailsModal.employerInformation")}
                      </>
                    ) : (
                      <>
                        <Building className="w-4 h-4 text-primary" />
                        {t("company.companyTransactions.detailsModal.companyInformation")}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {transaction.related_entity.type === 'worker' ? (
                          <User className="h-7 w-7 text-primary" />
                        ) : transaction.related_entity.type === 'employer' ? (
                          <Briefcase className="h-7 w-7 text-primary" />
                        ) : (
                          <Building className="h-7 w-7 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">{transaction.related_entity.name}</h3>
                        <p className="text-[10px] text-muted-foreground">
                          {getEntityTypeText(transaction.related_entity.type)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-primary" />
                    {t("company.companyTransactions.detailsModal.availableActions")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-4 gap-3">
                    {transaction.receipt_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start h-9 text-xs"
                        onClick={() => window.open(transaction.receipt_url, '_blank')}
                      >
                        <Receipt className="w-3.5 h-3.5 mr-2" />
                        {t("company.companyTransactions.detailsModal.viewReceipt")}
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start h-9 text-xs"
                      onClick={() => copyToClipboard(transaction.transaction_id)}
                    >
                      <Copy className="w-3.5 h-3.5 mr-2" />
                      {t("company.companyTransactions.detailsModal.copyTransactionId")}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start h-9 text-xs"
                      onClick={() => {
                        const details = `
                          Transaction ID: ${transaction.transaction_id}
                          Type: ${transaction.type_label}
                          Amount: ${transaction.formatted_amount}
                          Status: ${transaction.status}
                          Date: ${formatDateTime(transaction.created_at)}
                          Payment Method: ${transaction.payment_method_label}
                          ${transaction.payment_reference ? `Reference: ${transaction.payment_reference}` : ''}
                        `.trim();
                        copyToClipboard(details);
                      }}
                    >
                      <Copy className="w-3.5 h-3.5 mr-2" />
                      {t("company.companyTransactions.detailsModal.copyFullDetails")}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start h-9 text-xs"
                      onClick={() => {
                        const receipt = `Receipt for Transaction: ${transaction.transaction_id}
Amount: ${transaction.formatted_amount}
Date: ${formatDateTime(transaction.created_at)}
Status: ${transaction.status}
                        `.trim();
                        copyToClipboard(receipt);
                      }}
                    >
                      <Copy className="w-3.5 h-3.5 mr-2" />
                      {t("company.companyTransactions.detailsModal.copyReceiptText")}
                    </Button>
                  </div>  
                </CardContent>
              </Card>

              {/* Quick Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Info className="w-4 h-4 text-primary" />
                    {t("company.companyTransactions.detailsModal.quickInformation")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">{t("company.companyTransactions.detailsModal.transactionId")}</p>
                      <p className="text-xs font-medium font-mono truncate">{transaction.transaction_id}</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">{t("company.companyTransactions.detailsModal.amount")}</p>
                      <p className="text-xs font-bold">{transaction.formatted_amount}</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">{t("company.companyTransactions.detailsModal.status")}</p>
                      <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 capitalize">{getStatusText(transaction.status)}</span>
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Modal>
  );
};

export default CompanyTransactionDetailsModal;