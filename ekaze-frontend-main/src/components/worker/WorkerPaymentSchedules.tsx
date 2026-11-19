import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  Loader2,
  User,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Flag,
} from "lucide-react";
import { format } from "date-fns";
import {
  useWorkerSchedules,
  useConfirmSchedulePayment,
  useRespondToExtension,
  useRaiseDispute,
} from "@/hooks/usePaymentSchedules";
import type { PaymentSchedule, ScheduleStatus } from "@/types/payment-schedule.types";

const getStatusBadge = (status: ScheduleStatus) => {
  return "bg-slate-100 text-slate-700 border-slate-200";
};

const WorkerPaymentSchedules = () => {
  const [statusFilter, setStatusFilter] = useState("all");

  const [confirmModal, setConfirmModal]   = useState(false);
  const [disputeModal, setDisputeModal]   = useState(false);
  const [extensionModal, setExtensionModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<PaymentSchedule | null>(null);

  const [confirmNotes, setConfirmNotes]   = useState("");
  const [disputeDesc, setDisputeDesc]     = useState("");
  const [extResponse, setExtResponse]     = useState<'approved' | 'rejected'>('approved');
  const [extNote, setExtNote]             = useState("");

  const confirmPayment   = useConfirmSchedulePayment();
  const respondExtension = useRespondToExtension();
  const raiseDispute     = useRaiseDispute();

  const { data, isLoading, refetch } = useWorkerSchedules({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const schedules = data?.data?.data || [];

  const handleConfirm = async () => {
    if (!selectedSchedule) return;
    await confirmPayment.mutateAsync({ id: selectedSchedule.id, data: { notes: confirmNotes || undefined } });
    setConfirmModal(false); setConfirmNotes("");
  };

  const handleRespondExtension = async () => {
    if (!selectedSchedule?.active_extension) return;
    await respondExtension.mutateAsync({
      extensionId: selectedSchedule.active_extension.id,
      data: { response: extResponse, response_note: extNote || undefined },
    });
    setExtensionModal(false); setExtNote("");
  };

  const handleRaiseDispute = async () => {
    if (!selectedSchedule || !disputeDesc.trim()) return;
    await raiseDispute.mutateAsync({ id: selectedSchedule.id, data: { description: disputeDesc } });
    setDisputeModal(false); setDisputeDesc("");
  };

  return (
    <div className="space-y-5">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base text-left font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Salary Payment Schedules</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Track your monthly salary payments expectations
          </p>
        </div>


        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all"       className="text-xs">All</SelectItem>
              <SelectItem value="pending"   className="text-xs">Pending</SelectItem>
              <SelectItem value="paid"      className="text-xs">Awaiting My Confirmation</SelectItem>
              <SelectItem value="overdue"   className="text-xs">Overdue</SelectItem>
              <SelectItem value="confirmed" className="text-xs">Confirmed</SelectItem>
              <SelectItem value="disputed"  className="text-xs">Disputed</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="h-8 text-xs">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

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
            <p className="text-xs text-muted-foreground mt-1">Your salary schedules will appear here.</p>
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
                        {schedule.employer?.user?.name ?? `Employer #${schedule.employer_id}`}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <p className="text-xs text-muted-foreground">
                          Due: <span className="font-medium text-foreground">{format(new Date(schedule.due_date), 'MMM dd, yyyy')}</span>
                        </p>
                        <p className="text-xs font-bold text-slate-900 font-mono">
                          {parseFloat(schedule.amount).toLocaleString()} RWF
                        </p>
                      </div>
                      {schedule.payment_reference && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Ref: <span className="font-mono">{schedule.payment_reference}</span>
                        </p>
                      )}
                      {/* Pending extension */}
                      {schedule.active_extension && (
                        <div className="mt-1.5 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <p className="text-[10px] text-purple-700 dark:text-purple-400 font-medium">
                            Extension requested — New date: {format(new Date(schedule.active_extension.requested_new_date), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-[10px] text-purple-600 mt-0.5">{schedule.active_extension.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge className={`text-[10px] ${getStatusBadge(schedule.status)}`}>
                      {schedule.status.replace('_', ' ')}
                    </Badge>

                    <div className="flex flex-col gap-1.5">
                      {/* Confirm payment received */}
                      {schedule.status === 'paid' && (
                        <Button
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => { setSelectedSchedule(schedule); setConfirmModal(true); }}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Confirm Received
                        </Button>
                      )}

                      {/* Respond to extension */}
                      {schedule.active_extension && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => { setSelectedSchedule(schedule); setExtensionModal(true); }}
                        >
                          <CalendarClock className="w-3 h-3 mr-1" />
                          Respond
                        </Button>
                      )}

                      {/* Raise dispute */}
                      {['paid', 'overdue'].includes(schedule.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => { setSelectedSchedule(schedule); setDisputeModal(true); }}
                        >
                          <Flag className="w-3 h-3 mr-1" />
                          Dispute
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

      {/* Confirm Payment Modal */}
      <Dialog open={confirmModal} onOpenChange={setConfirmModal}>
        <DialogContent className="sm:max-w-sm" style={{ borderRadius: "12px" }}>
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Confirm Payment Received
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirming will notify your employer and schedule next month's payment.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
              <p className="text-xs text-muted-foreground">Amount Received</p>
              <p className="text-lg font-bold text-green-600">
                {selectedSchedule ? parseFloat(selectedSchedule.amount).toLocaleString() : 0} RWF
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes (optional)</Label>
              <Textarea
                value={confirmNotes}
                onChange={(e) => setConfirmNotes(e.target.value)}
                placeholder="Any notes about this payment..."
                rows={2}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmModal(false)} disabled={confirmPayment.isPending} className="h-9 text-xs">Cancel</Button>
            <Button size="sm" onClick={handleConfirm} disabled={confirmPayment.isPending} className="h-9 text-xs">
              {confirmPayment.isPending ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Confirming...</> : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extension Response Modal */}
      <Dialog open={extensionModal} onOpenChange={setExtensionModal}>
        <DialogContent className="sm:max-w-sm" style={{ borderRadius: "12px" }}>
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-primary" />
              Respond to Extension Request
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            {selectedSchedule?.active_extension && (
              <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
                <p><span className="text-muted-foreground">New date requested:</span> <strong>{format(new Date(selectedSchedule.active_extension.requested_new_date), 'MMM dd, yyyy')}</strong></p>
                <p><span className="text-muted-foreground">Reason:</span> {selectedSchedule.active_extension.reason}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExtResponse('approved')}
                className={`h-10 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${extResponse === 'approved' ? 'bg-green-100 text-green-800 border-green-300' : 'border-border/50 hover:bg-muted/50'}`}
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                type="button"
                onClick={() => setExtResponse('rejected')}
                className={`h-10 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${extResponse === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' : 'border-border/50 hover:bg-muted/50'}`}
              >
                <ThumbsDown className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Note (optional)</Label>
              <Textarea value={extNote} onChange={(e) => setExtNote(e.target.value)} rows={2} className="text-xs" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setExtensionModal(false)} disabled={respondExtension.isPending} className="h-9 text-xs">Cancel</Button>
            <Button size="sm" onClick={handleRespondExtension} disabled={respondExtension.isPending} className="h-9 text-xs">
              {respondExtension.isPending ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Sending...</> : "Submit Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Modal */}
      <Dialog open={disputeModal} onOpenChange={setDisputeModal}>
        <DialogContent className="sm:max-w-sm" style={{ borderRadius: "12px" }}>
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Raise a Payment Dispute
            </DialogTitle>
            <DialogDescription className="text-xs">
              Admin will be notified and will investigate.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description <span className="text-red-500">*</span></Label>
              <Textarea
                value={disputeDesc}
                onChange={(e) => setDisputeDesc(e.target.value)}
                placeholder="Explain the issue in detail (min 20 characters)..."
                rows={4}
                className="text-xs"
              />
              <p className="text-[10px] text-muted-foreground text-right">{disputeDesc.length}/1000</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDisputeModal(false)} disabled={raiseDispute.isPending} className="h-9 text-xs">Cancel</Button>
            <Button size="sm" variant="destructive" onClick={handleRaiseDispute} disabled={raiseDispute.isPending || disputeDesc.length < 20} className="h-9 text-xs">
              {raiseDispute.isPending ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Submitting...</> : "Submit Dispute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerPaymentSchedules;