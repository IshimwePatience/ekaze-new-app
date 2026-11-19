import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  Loader2,
  User,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { useEmployerSchedules, useMarkPaid, useRequestExtension } from "@/hooks/usePaymentSchedules";
import type { PaymentSchedule, ScheduleStatus } from "@/types/payment-schedule.types";

const getStatusBadge = (status: ScheduleStatus) => {
  const map = {
    pending:   "bg-yellow-100 text-yellow-800 border-yellow-200",
    paid:      "bg-blue-100 text-blue-800 border-blue-200",
    overdue:   "bg-red-100 text-red-800 border-red-200",
    extended:  "bg-purple-100 text-purple-800 border-purple-200",
    disputed:  "bg-orange-100 text-orange-800 border-orange-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
  };
  return map[status] || "";
};

const getStatusIcon = (status: ScheduleStatus) => {
  if (status === 'confirmed') return <CheckCircle2 className="w-2.5 h-2.5 mr-1" />;
  if (status === 'overdue')   return <AlertTriangle className="w-2.5 h-2.5 mr-1" />;
  if (status === 'extended')  return <CalendarClock className="w-2.5 h-2.5 mr-1" />;
  if (status === 'paid')      return <Clock className="w-2.5 h-2.5 mr-1" />;
  return null;
};

const EmployerPaymentSchedules = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mark paid modal
  const [markPaidModal, setMarkPaidModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<PaymentSchedule | null>(null);
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");

  // Extension modal
  const [extensionModal, setExtensionModal] = useState(false);
  const [extDate, setExtDate] = useState("");
  const [extReason, setExtReason] = useState("");

  const markPaid       = useMarkPaid();
  const reqExtension   = useRequestExtension();

  const { data, isLoading, refetch } = useEmployerSchedules({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const schedules = data?.data?.data || [];

  const handleMarkPaid = async () => {
    if (!selectedSchedule || !payRef.trim()) return;
    await markPaid.mutateAsync({ id: selectedSchedule.id, data: { payment_reference: payRef, notes: payNotes || undefined } });
    setMarkPaidModal(false);
    setPayRef(""); setPayNotes("");
  };

  const handleRequestExtension = async () => {
    if (!selectedSchedule || !extDate || !extReason.trim()) return;
    await reqExtension.mutateAsync({ id: selectedSchedule.id, data: { requested_new_date: extDate, reason: extReason } });
    setExtensionModal(false);
    setExtDate(""); setExtReason("");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeaderBreadcrumb title="Salary Payment Schedules">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All</SelectItem>
              <SelectItem value="pending" className="text-xs">Pending</SelectItem>
              <SelectItem value="overdue" className="text-xs">Overdue</SelectItem>
              <SelectItem value="paid" className="text-xs">Paid</SelectItem>
              <SelectItem value="extended" className="text-xs">Extended</SelectItem>
              <SelectItem value="confirmed" className="text-xs">Confirmed</SelectItem>
              <SelectItem value="disputed" className="text-xs">Disputed</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="h-8 text-xs">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </PageHeaderBreadcrumb>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : schedules.length === 0 ? (
        <Card style={{ borderRadius: "12px" }} className="border-border/40">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-3 bg-muted/50 rounded-full mb-3">
              <CreditCard className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No payment schedules</p>
            <p className="text-xs text-muted-foreground mt-1">
              Schedules are created automatically when an employment starts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <Card key={schedule.id} style={{ borderRadius: "12px" }} className="border-border/40 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {schedule.worker?.full_name ?? `Worker #${schedule.worker_id}`}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <p className="text-xs text-muted-foreground">
                          Due: <span className="font-medium text-foreground">{format(new Date(schedule.due_date), 'MMM dd, yyyy')}</span>
                        </p>
                        <p className="text-xs font-bold text-foreground">
                          {parseFloat(schedule.amount).toLocaleString()} RWF
                        </p>
                      </div>
                      {schedule.payment_reference && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Ref: <span className="font-mono">{schedule.payment_reference}</span>
                        </p>
                      )}
                      {schedule.active_extension && (
                        <p className="text-[10px] text-purple-600 mt-0.5">
                          Extension pending — New date: {format(new Date(schedule.active_extension.requested_new_date), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge className={`text-[10px] ${getStatusBadge(schedule.status)}`}>
                      {getStatusIcon(schedule.status)}
                      {schedule.status.replace('_', ' ')}
                    </Badge>

                    <div className="flex gap-1.5">
                      {/* Mark Paid */}
                      {['pending', 'overdue', 'extended'].includes(schedule.status) && (
                        <Button
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => { setSelectedSchedule(schedule); setMarkPaidModal(true); }}
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          Mark Paid
                        </Button>
                      )}

                      {/* Request Extension */}
                      {['pending', 'overdue'].includes(schedule.status) && !schedule.active_extension && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => { setSelectedSchedule(schedule); setExtensionModal(true); }}
                        >
                          <CalendarClock className="w-3 h-3 mr-1" />
                          Extend
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mark Paid Modal */}
      <Dialog open={markPaidModal} onOpenChange={setMarkPaidModal}>
        <DialogContent className="sm:max-w-md" style={{ borderRadius: "12px" }}>
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Mark Payment as Paid
            </DialogTitle>
            <DialogDescription className="text-xs">
              Worker will receive a notification to confirm receipt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-lg font-bold">
                {selectedSchedule ? parseFloat(selectedSchedule.amount).toLocaleString() : 0} RWF
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Transaction Reference <span className="text-red-500">*</span></Label>
              <Input
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. MP250320001234"
                className="h-9 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Notes (optional)</Label>
              <Textarea
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="Any additional notes"
                rows={2}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setMarkPaidModal(false)} disabled={markPaid.isPending} className="h-9 text-xs">Cancel</Button>
            <Button size="sm" onClick={handleMarkPaid} disabled={markPaid.isPending || !payRef.trim()} className="h-9 text-xs">
              {markPaid.isPending ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Saving...</> : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extension Modal */}
      <Dialog open={extensionModal} onOpenChange={setExtensionModal}>
        <DialogContent className="sm:max-w-md" style={{ borderRadius: "12px" }}>
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-primary" />
              Request Payment Extension
            </DialogTitle>
            <DialogDescription className="text-xs">
              Worker must approve this extension request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">New Due Date <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={extDate}
                onChange={(e) => setExtDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Reason <span className="text-red-500">*</span></Label>
              <Textarea
                value={extReason}
                onChange={(e) => setExtReason(e.target.value)}
                placeholder="Explain why you need an extension..."
                rows={3}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setExtensionModal(false)} disabled={reqExtension.isPending} className="h-9 text-xs">Cancel</Button>
            <Button size="sm" onClick={handleRequestExtension} disabled={reqExtension.isPending || !extDate || !extReason.trim()} className="h-9 text-xs">
              {reqExtension.isPending ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Sending...</> : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployerPaymentSchedules;