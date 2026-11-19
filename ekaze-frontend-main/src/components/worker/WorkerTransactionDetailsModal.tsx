import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkerTransactionDetails } from "@/hooks/useWorkerTransactions";
import { format } from "date-fns";
import { 
  CreditCardIcon, 
  Calendar, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Building,
} from "lucide-react";

interface WorkerTransactionDetailsModalProps {
  transactionId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const WorkerTransactionDetailsModal = ({ 
  transactionId, 
  isOpen, 
  onClose 
}: WorkerTransactionDetailsModalProps) => {
  const { data, isLoading } = useWorkerTransactionDetails(transactionId);

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return styles[status as keyof typeof styles] || "";
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      worker_registration: "Worker Registration",
      subscription_fee: "Monthly Subscription",
      salary_deduction: "Salary Deduction",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Transaction Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : data?.data ? (
          <div className="space-y-5">
            {/* Status Header */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(data.data.status)}
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction Status</p>
                      <Badge className={`text-xs mt-1 ${getStatusBadge(data.data.status)}`}>
                        {data.data.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(data.data.amount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Information */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Transaction Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                    <p className="text-sm font-mono font-semibold">{data.data.transaction_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <p className="text-sm font-medium">{getTypeLabel(data.data.transaction_type)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Date Created</p>
                    <p className="text-sm">{format(new Date(data.data.created_at), 'PPP p')}</p>
                  </div>
                  {data.data.paid_at && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Date Paid</p>
                      <p className="text-sm">{format(new Date(data.data.paid_at), 'PPP p')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            {data.data.payment_method && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                      <p className="text-sm font-medium">{data.data.payment_method}</p>
                    </div>
                    {data.data.payment_reference && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Reference Number</p>
                        <p className="text-sm font-mono">{data.data.payment_reference}</p>
                      </div>
                    )}
                    {data.data.payment_phone && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Payment Phone</p>
                        <p className="text-sm">{data.data.payment_phone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Entities */}
            {(data.data.employer || data.data.company) && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Related Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {data.data.employer && (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Employer Name</p>
                          <p className="text-sm font-medium">{data.data.employer.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Employer Phone</p>
                          <p className="text-sm">{data.data.employer.phone}</p>
                        </div>
                      </>
                    )}
                    {data.data.company && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Company</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {data.data.company.name}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {data.data.description && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{data.data.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Failure Reason */}
            {data.data.failure_reason && data.data.status === 'failed' && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-2 text-red-800 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Failure Reason
                  </h3>
                  <p className="text-sm text-red-700">{data.data.failure_reason}</p>
                </CardContent>
              </Card>
            )}

            {/* Receipt */}
            {data.data.receipt_url && (
              <div className="flex justify-center pt-2">
                <a
                  href={data.data.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" />
                  Download Receipt
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Transaction not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WorkerTransactionDetailsModal;