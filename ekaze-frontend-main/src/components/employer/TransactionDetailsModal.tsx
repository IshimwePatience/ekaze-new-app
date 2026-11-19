import { Modal } from "antd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Download,
  X,
  CreditCardIcon,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Phone,
  Hash,
} from "lucide-react";
import { useEmployerTransaction, useDownloadReceipt } from "@/hooks/useEmployerTransactions";
import { format } from "date-fns";
import { toast } from "sonner";

interface TransactionDetailsModalProps {
  transactionId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetailsModal = ({ transactionId, isOpen, onClose }: TransactionDetailsModalProps) => {
  const { data, isLoading } = useEmployerTransaction(transactionId);
  const downloadReceiptMutation = useDownloadReceipt();

  const transaction = data?.data;

  const handleDownloadReceipt = async () => {
    if (!transactionId) return;
    
    try {
      const blob = await downloadReceiptMutation.mutateAsync(transactionId) as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return styles[status as keyof typeof styles] || "";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <FileText className="w-6 h-6 text-gray-600" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels = {
      company_registration: "Company Registration",
      worker_registration: "Worker Registration",
      employer_registration: "Employer Registration",
      subscription_fee: "Subscription Fee",
      salary_deduction: "Salary Deduction",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      mobile_money: "Mobile Money",
      bank_transfer: "Bank Transfer",
      cash: "Cash Payment",
    };
    return labels[method as keyof typeof labels] || method;
  };

  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width="90vw"
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
    >
      {isLoading || !transaction ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
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
              <div className={`p-3 rounded-lg ${getStatusBadge(transaction.status)}`}>
                {getStatusIcon(transaction.status)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Transaction Details
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs ${getStatusBadge(transaction.status)}`}>
                    {transaction.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {transaction.transaction_id}
                  </span>
                </div>
              </div>
            </div>
            {transaction.status === 'completed' && (
              <Button
                size="sm"
                onClick={handleDownloadReceipt}
                disabled={downloadReceiptMutation.isPending}
                className="text-xs h-8"
              >
                <Download className="w-3 h-3 mr-1" />
                Download Receipt
              </Button>
            )}
          </div>

          {/* Transaction Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Payment Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CreditCardIcon className="w-4 h-4 text-primary" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(transaction.amount)}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Transaction Type</p>
                    <Badge variant="outline" className="text-xs">
                      {getTransactionTypeLabel(transaction.transaction_type)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Payment Method</p>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        {getPaymentMethodLabel(transaction.payment_method)}
                      </span>
                    </div>
                  </div>
                </div>

                {transaction.payment_phone && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Payment Phone
                      </p>
                      <p className="text-sm font-medium font-mono">{transaction.payment_phone}</p>
                    </div>
                  </>
                )}

                {transaction.payment_reference && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        Payment Reference
                      </p>
                      <p className="text-sm font-medium font-mono">{transaction.payment_reference}</p>
                    </div>
                  </>
                )}

                {transaction.description && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">Description</p>
                      <p className="text-xs">{transaction.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Timeline & Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  Timeline & Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">Created Date</p>
                  <p className="text-sm font-medium">
                    {format(new Date(transaction.created_at), 'PPP')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(transaction.created_at), 'HH:mm:ss')}
                  </p>
                </div>

                {transaction.paid_at && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">Payment Date</p>
                      <p className="text-sm font-medium">
                        {format(new Date(transaction.paid_at), 'PPP')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.paid_at), 'HH:mm:ss')}
                      </p>
                    </div>
                  </>
                )}

                {transaction.failure_reason && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground text-red-600">Failure Reason</p>
                      <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-800 dark:text-red-200">{transaction.failure_reason}</p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">Last Updated</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(transaction.updated_at), 'PPP HH:mm:ss')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Related Information */}
          {(transaction.related_worker || transaction.related_company) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-primary" />
                  Related Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {transaction.related_worker && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-[10px] text-muted-foreground mb-1">Related Worker</p>
                      <p className="text-sm font-medium">{transaction.related_worker.full_name}</p>
                      <p className="text-xs text-muted-foreground">ID: {transaction.related_worker.id}</p>
                    </div>
                  )}
                  {transaction.related_company && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-[10px] text-muted-foreground mb-1">Related Company</p>
                      <p className="text-sm font-medium">{transaction.related_company.business_name}</p>
                      <p className="text-xs text-muted-foreground">ID: {transaction.related_company.id}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </Modal>
  );
};

export default TransactionDetailsModal;