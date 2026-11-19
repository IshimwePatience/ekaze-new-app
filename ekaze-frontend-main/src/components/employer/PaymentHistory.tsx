import { CreditCard, Download, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Payment {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  method: string;
  reference: string;
}

const payments: Payment[] = [
  {
    id: "1",
    date: "2024-12-15",
    description: "Monthly Subscription - HomeStaff Solutions",
    amount: "15,000 RWF",
    status: "completed",
    method: "MTN Mobile Money",
    reference: "TXN-2024121500123",
  },
  {
    id: "2",
    date: "2024-11-15",
    description: "Monthly Subscription - HomeStaff Solutions",
    amount: "15,000 RWF",
    status: "completed",
    method: "MTN Mobile Money",
    reference: "TXN-2024111500456",
  },
  {
    id: "3",
    date: "2024-10-15",
    description: "Monthly Subscription - HomeStaff Solutions",
    amount: "15,000 RWF",
    status: "completed",
    method: "MTN Mobile Money",
    reference: "TXN-2024101500789",
  },
  {
    id: "4",
    date: "2024-10-01",
    description: "Worker Registration Fee - Emmanuel Habimana",
    amount: "500 RWF",
    status: "completed",
    method: "Airtel Money",
    reference: "TXN-2024100100321",
  },
  {
    id: "5",
    date: "2024-01-05",
    description: "Platform Registration (One-time)",
    amount: "1,000 RWF",
    status: "completed",
    method: "MTN Mobile Money",
    reference: "TXN-2024010500001",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-slate-600" />;
    case "pending":
      return <Clock className="h-4 w-4 text-slate-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-slate-400" />;
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-slate-100 text-slate-700 border-slate-200">
          Completed
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-slate-100 text-slate-700 border-slate-200">
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-slate-100 text-slate-700 border-slate-200">Failed</Badge>
      );
    default:
      return null;
  }
};

const PaymentHistory = () => {
  const totalPaid = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + parseInt(p.amount.replace(/[^\d]/g, "")), 0);

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalPaid.toLocaleString()} RWF
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-foreground">
                  {payments.filter((p) => p.status === "completed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">
                  {payments.filter((p) => p.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment History</CardTitle>
          <Button
            size="sm"
            className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Export</span>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {new Date(payment.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {payment.description}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {payment.amount}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.method}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-mono">
                    {payment.reference}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
