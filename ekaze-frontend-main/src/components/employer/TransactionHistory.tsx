import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import {
  MoreVertical,
  X,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  useEmployerTransactions,
  useAutoPaymentSettings,
  useSaveAutoPaymentSettings,
  useEmployerPaymentAwareness,
  usePayWorker,
} from "@/hooks/useEmployerTransactions";
import { toast } from "sonner";
import TransactionDetailsModal from "./TransactionDetailsModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { downloadInvoicePdf } from "@/utils/pdfGenerator";

const TransactionHistory = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [selectedTxIds, setSelectedTxIds] = useState<number[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Modal state for Set Payment Method
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);

  // Transaction history query
  const { data, isLoading } = useEmployerTransactions({
    status: statusFilter as any,
    payment_method: methodFilter as any,
    page: currentPage,
    per_page: perPage,
    ...(searchTerm && { search: searchTerm }),
  });

  // Auto-Payment / Payment Method settings query & mutation
  const { data: autoPayData, refetch: refetchAutoPay } = useAutoPaymentSettings();
  const saveAutoPaymentMutation = useSaveAutoPaymentSettings();
  const autoPayConfig = autoPayData?.data;
  const isPaymentMethodConfigured = Boolean(autoPayConfig?.is_configured);

  // Payment Awareness (Overdue & 5-day upcoming notices)
  const { data: awarenessRes, refetch: refetchAwareness } = useEmployerPaymentAwareness();
  const awareness = awarenessRes?.data;
  const workersSchedule: any[] = useMemo(
    () => (Array.isArray(awareness?.workers_schedule) ? awareness.workers_schedule : []),
    [awareness]
  );
  const unpaidWorkers = useMemo(
    () => workersSchedule.filter((w) => !w.has_recent_paid),
    [workersSchedule]
  );
  const payWorkerMutation = usePayWorker();

  // Payment Method / Auto-Pay Modal State
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [autoPayMethod, setAutoPayMethod] = useState("mtn_momo");
  const [momoPhone, setMomoPhone] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatusText, setVerificationStatusText] = useState("");
  const [paymentMethodStep, setPaymentMethodStep] = useState<"form" | "otp">("form");
  const [paymentMethodOtp, setPaymentMethodOtp] = useState("");
  const [paymentMethodOtpError, setPaymentMethodOtpError] = useState("");
  const [isRequestingMethodOtp, setIsRequestingMethodOtp] = useState(false);
  const [isRequestingPayOtp, setIsRequestingPayOtp] = useState(false);

  // Real MTN MoMo Salary Payment & Polling Modal State (Single or Full-Batch)
  const [payModalState, setPayModalState] = useState<{
    open: boolean;
    mode: "single" | "batch";
    worker: any | null;
    step: "confirm" | "otp" | "polling" | "done" | "failed";
    payerPhone: string;
    otpCode: string;
    referenceId: string;
    error: string;
  }>({
    open: false,
    mode: "single",
    worker: null,
    step: "confirm",
    payerPhone: "",
    otpCode: "",
    referenceId: "",
    error: "",
  });

  const openPaymentMethodModal = () => {
    setPaymentMethodStep("form");
    setPaymentMethodOtp("");
    setPaymentMethodOtpError("");
    setShowPaymentMethodModal(true);
  };

  useEffect(() => {
    if (autoPayConfig) {
      setAutoPayEnabled(autoPayConfig.enabled ?? true);
      setAutoPayMethod("mtn_momo");
      if (autoPayConfig.is_configured && autoPayConfig.phone_number) {
        setMomoPhone(autoPayConfig.phone_number);
      } else {
        setMomoPhone("");
      }
    }
  }, [autoPayConfig]);

  useEffect(() => {
    const handleOpenModal = () => openPaymentMethodModal();
    window.addEventListener("open-set-payment-method", handleOpenModal);
    return () => window.removeEventListener("open-set-payment-method", handleOpenModal);
  }, []);

  // Poll MTN MoMo status while step === 'polling'
  useEffect(() => {
    if (!payModalState.open || payModalState.step !== "polling" || !payModalState.referenceId) {
      return;
    }

    let cancelled = false;
    const poll = async () => {
      try {
        const { employerTransactionApi } = await import("@/api/employerTransactionService");
        const res = await employerTransactionApi.pollSalaryPayment(payModalState.referenceId);
        if (cancelled) return;

        if (res.payment_status === "SUCCESSFUL" || res.status === "successful") {
          setPayModalState((prev) => ({ ...prev, step: "done", error: "" }));
          toast.success(res.message || "MTN MoMo salary payment confirmed and settled!");
          queryClient.invalidateQueries({ queryKey: ["employerTransactions"] });
          queryClient.invalidateQueries({ queryKey: ["employer-payment-awareness"] });
          refetchAwareness();
        } else if (res.payment_status === "FAILED" || res.status === "failed") {
          const requiredFormatted =
            payModalState.worker?.salary_formatted ||
            awareness?.total_due_formatted ||
            "the full salary";
          const workerLabel = payModalState.worker?.worker_name || "your worker";
          const topUpMessage = `You do not have enough money on your MTN Mobile Money account (${payModalState.payerPhone}) to pay ${workerLabel}. Please dial *182# and top up at least ${requiredFormatted} to complete this payment.`;
          setPayModalState((prev) => ({
            ...prev,
            step: "failed",
            error: topUpMessage,
          }));
        }
      } catch (err: any) {
        if (!cancelled) {
          console.warn("MoMo salary poll check:", err?.message);
        }
      }
    };

    const intervalId = setInterval(poll, 3000);
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        const requiredFormatted =
          payModalState.worker?.salary_formatted ||
          awareness?.total_due_formatted ||
          "the full salary";
        const workerLabel = payModalState.worker?.worker_name || "your worker";
        const topUpTimeoutMessage = `You do not have enough money on your MTN Mobile Money account (${payModalState.payerPhone}) to pay ${workerLabel}, or your MoMo prompt was not approved in time. Please dial *182# and top up at least ${requiredFormatted} before retrying.`;
        setPayModalState((prev) =>
          prev.step === "polling"
            ? {
                ...prev,
                step: "failed",
                error: topUpTimeoutMessage,
              }
            : prev
        );
      }
    }, 120000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [payModalState.open, payModalState.step, payModalState.referenceId, queryClient, refetchAwareness]);

  const handleRequestPayWorkerOtp = async () => {
    const cleanPayer = payModalState.payerPhone.replace(/\D/g, "");
    if (cleanPayer.length < 9) {
      setPayModalState((prev) => ({
        ...prev,
        error: "Enter a valid MTN Rwanda MoMo number (078xxxxxxx or 079xxxxxxx).",
      }));
      return;
    }

    try {
      setIsRequestingPayOtp(true);
      setPayModalState((prev) => ({ ...prev, error: "" }));
      const { employerTransactionApi } = await import("@/api/employerTransactionService");
      const otpRes = await employerTransactionApi.requestPaymentOtp({
        phone_number: payModalState.payerPhone.trim(),
        purpose: "pay_worker",
      });
      toast.success(otpRes.message || `6-digit SMS OTP sent to ${payModalState.payerPhone}`);
      setPayModalState((prev) => ({
        ...prev,
        step: "otp",
        otpCode: "",
        error: "",
      }));
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send SMS OTP to your MTN number.";
      setPayModalState((prev) => ({ ...prev, error: msg }));
      toast.error(msg);
    } finally {
      setIsRequestingPayOtp(false);
    }
  };

  const handleConfirmMomoSalaryPayment = async () => {
    const cleanPayer = payModalState.payerPhone.replace(/\D/g, "");
    if (cleanPayer.length < 9) {
      setPayModalState((prev) => ({
        ...prev,
        error: "Enter a valid MTN Rwanda MoMo number (078xxxxxxx or 079xxxxxxx).",
      }));
      return;
    }

    const cleanOtp = payModalState.otpCode.replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setPayModalState((prev) => ({
        ...prev,
        error: "Please enter the 6-digit SMS OTP code sent to your MTN number.",
      }));
      return;
    }

    try {
      setPayModalState((prev) => ({ ...prev, error: "" }));
      const payload =
        payModalState.mode === "batch"
          ? {
              pay_all: true,
              payout_type: "auto_batch",
              payment_method: "mtn_momo",
              phone_number: payModalState.payerPhone.trim(),
              otp_code: cleanOtp,
              notes: `Full Payroll Batch Settlement (${unpaidWorkers.length} workers)`,
            }
          : {
              worker_id: payModalState.worker?.worker_id,
              amount: payModalState.worker?.salary_amount,
              payout_type: "manual_one_by_one",
              payment_method: "mtn_momo",
              phone_number: payModalState.payerPhone.trim(),
              otp_code: cleanOtp,
              notes: `Salary Payment for ${payModalState.worker?.worker_name} (${payModalState.worker?.due_date})`,
            };

      const res = await payWorkerMutation.mutateAsync(payload);
      if (res?.referenceId) {
        setPayModalState((prev) => ({
          ...prev,
          step: "polling",
          referenceId: res.referenceId!,
          error: "",
        }));
      } else {
        toast.success(res?.message || "Payment initiated.");
        setPayModalState((prev) => ({ ...prev, step: "done" }));
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to initiate MTN MoMo salary payment.";
      setPayModalState((prev) => ({ ...prev, error: msg }));
      toast.error(msg);
    }
  };

  const transactions = data?.data?.data || [];
  const pagination = data?.data
    ? {
        current_page: data.data.current_page,
        last_page: data.data.last_page,
        per_page: data.data.per_page,
        total: data.data.total,
      }
    : null;

  const handleDownloadReceipt = async (transactionId: number) => {
    const tx = transactions.find((t: any) => t.id === transactionId);
    downloadInvoicePdf({
      id: transactionId,
      reference_number: tx?.reference_number || tx?.reference_id || `IHIRWE-SAL-${transactionId}`,
      description: tx?.description || "Worker Salary Payout",
      amount: tx?.amount || tx?.total_amount || 0,
      phone: tx?.worker_phone || tx?.beneficiary?.phone || "",
      phone_number: tx?.worker_phone || tx?.beneficiary?.phone || "",
      employer_name: tx?.sender_name || tx?.sender?.name || "",
      employer_email: "",
      employer_address: "Rwanda",
      date: tx?.date || tx?.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
      status: tx?.status || "completed",
    });
    toast.success("Payment Receipt Downloaded Successfully");
  };

  const handleRequestPaymentMethodOtp = async () => {
    const cleanPhone = momoPhone.replace(/\D/g, "");
    if (cleanPhone.length < 9) {
      toast.error("Please enter a valid MTN Rwanda phone number (078xxxxxxx, 079xxxxxxx).");
      return;
    }

    try {
      setIsRequestingMethodOtp(true);
      setPaymentMethodOtpError("");
      const { employerTransactionApi } = await import("@/api/employerTransactionService");
      const otpRes = await employerTransactionApi.requestPaymentOtp({
        phone_number: momoPhone.trim(),
        purpose: isPaymentMethodConfigured ? "update_payment_method" : "set_payment_method",
      });
      toast.success(otpRes.message || `6-digit SMS OTP sent to ${momoPhone}.`);
      setPaymentMethodOtp("");
      setPaymentMethodStep("otp");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to send OTP SMS. Please check the MTN phone number.";
      setPaymentMethodOtpError(msg);
      toast.error(msg);
    } finally {
      setIsRequestingMethodOtp(false);
    }
  };

  const handleToggleAutoPayment = async () => {
    const nextEnabled = !autoPayEnabled;
    if (!isPaymentMethodConfigured || !momoPhone.trim()) {
      setAutoPayEnabled(nextEnabled);
      return;
    }

    try {
      setIsVerifying(true);
      setPaymentMethodOtpError("");
      setVerificationStatusText(nextEnabled ? "Resuming automatic payouts..." : "Stopping automatic payouts...");

      const res: any = await saveAutoPaymentMutation.mutateAsync({
        enabled: nextEnabled,
        payout_mode: nextEnabled ? "auto_all" : "manual_one_by_one",
        payment_method: "mtn_momo",
        phone_number: momoPhone.trim(),
        toggle_auto_pay: true,
        is_configured: true,
      });

      setAutoPayEnabled(nextEnabled);
      refetchAutoPay();
      refetchAwareness();
      queryClient.invalidateQueries({ queryKey: ["employer-auto-payment"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });

      if (nextEnabled && res?.auto_triggered_payment?.triggered && res?.auto_triggered_payment?.referenceId) {
        const autoTrig = res.auto_triggered_payment;
        setShowPaymentMethodModal(false);
        toast.info("Automatic payouts resumed — MTN MoMo prompt sent for overdue salary!");
        setPayModalState({
          open: true,
          mode: autoTrig.workers_count > 1 ? "batch" : "single",
          worker: autoTrig.worker || {
            worker_name: autoTrig.worker_name,
            worker_phone: autoTrig.worker_phone,
            salary_amount: autoTrig.amount,
            salary_formatted: formatCurrency(autoTrig.amount),
          },
          step: "polling",
          payerPhone: momoPhone.trim(),
          otpCode: "",
          referenceId: autoTrig.referenceId,
          error: "",
        });
      } else {
        toast.success(
          nextEnabled
            ? "Automatic payouts resumed successfully."
            : "Automatic payouts stopped. Workers can still be paid manually."
        );
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update automatic payout status.";
      setPaymentMethodOtpError(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
      setVerificationStatusText("");
    }
  };

  const handleSavePaymentMethod = async () => {
    try {
      const cleanPhone = momoPhone.replace(/\D/g, "");
      if (cleanPhone.length < 9) {
        toast.error("Please enter a valid MTN Rwanda phone number (078xxxxxxx, 079xxxxxxx).");
        return;
      }

      const cleanOtp = paymentMethodOtp.replace(/\D/g, "");
      if (cleanOtp.length !== 6) {
        setPaymentMethodOtpError("Please enter the 6-digit SMS OTP code sent to your MTN phone.");
        return;
      }

      setIsVerifying(true);
      setPaymentMethodOtpError("");
      setVerificationStatusText("Verifying OTP & saving MTN MoMo (*182#)...");

      const res: any = await saveAutoPaymentMutation.mutateAsync({
        enabled: autoPayEnabled,
        payout_mode: autoPayEnabled ? "auto_all" : "manual_one_by_one",
        payment_method: "mtn_momo",
        phone_number: momoPhone.trim(),
        otp_code: cleanOtp,
        billing_cycle: "monthly",
        is_configured: true,
      });

      setShowPaymentMethodModal(false);
      setPaymentMethodStep("form");
      setPaymentMethodOtp("");
      refetchAutoPay();
      refetchAwareness();
      queryClient.invalidateQueries({ queryKey: ["employer-auto-payment"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });

      if (res?.auto_triggered_payment?.triggered && res?.auto_triggered_payment?.referenceId) {
        const autoTrig = res.auto_triggered_payment;
        toast.info("Overdue worker salary detected — MTN MoMo prompt sent to settle payment immediately!");
        setPayModalState({
          open: true,
          mode: autoTrig.workers_count > 1 ? "batch" : "single",
          worker: autoTrig.worker || {
            worker_name: autoTrig.worker_name,
            worker_phone: autoTrig.worker_phone,
            salary_amount: autoTrig.amount,
            salary_formatted: formatCurrency(autoTrig.amount),
          },
          step: "polling",
          payerPhone: momoPhone.trim(),
          otpCode: "",
          referenceId: autoTrig.referenceId,
          error: "",
        });
      } else {
        toast.success(`MTN Mobile Money (${momoPhone}) verified via SMS OTP and saved for worker payouts.`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to verify OTP and save payment method.";
      setPaymentMethodOtpError(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
      setVerificationStatusText("");
    }
  };

  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(numAmount || 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTxIds(transactions.map((tx: any) => tx.id));
    } else {
      setSelectedTxIds([]);
    }
  };

  const handleToggleSelectTx = (id: number) => {
    setSelectedTxIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full bg-white space-y-0">
      {/* Top Header with Breadcrumb & Set/Update Payment Method Button */}
      <div className="pt-1 pb-3 px-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeaderBreadcrumb title={t("employer.transactionHistory.title")} />

        {/* Action Button: Set/Update Payment Method */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={openPaymentMethodModal}
            className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer h-9 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isPaymentMethodConfigured ? "Update Payment Method" : "Set Payment Method"}</span>
          </Button>
        </div>
      </div>

      {/* Main Studio Styled Content Layout */}
      <div className="w-full bg-white border-t border-slate-200">
        <StudioFilterBar
          categories={[
            {
              id: "status",
              label: "Status",
              options: [
                { value: "all", label: "All Status" },
                { value: "completed", label: "Paid on Time" },
                { value: "overdue", label: "Overdue" },
              ],
            },
            {
              id: "method",
              label: "Payment Method",
              options: [
                { value: "all", label: "All Methods" },
                { value: "mobile_money", label: "MTN Mobile Money" },
                { value: "airtel_money", label: "Airtel Money" },
                { value: "card", label: "Bank Card" },
              ],
            },
          ]}
          activeFilters={{
            status: statusFilter,
            method: methodFilter,
          }}
          onFilterChange={(catId, val) => {
            if (catId === "status") setStatusFilter(val);
            if (catId === "method") setMethodFilter(val);
            setCurrentPage(1);
          }}
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          onClearAll={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setMethodFilter("all");
            setCurrentPage(1);
          }}
        />

        {/* Table Content Section */}
        {isLoading ? (
          <div className="py-6 space-y-3">
            <Skeleton className="h-9 w-full rounded-none" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-none" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <CharacterIllustration
            type="transactions"
            title="No worker payout records found"
            description={
              searchTerm || statusFilter !== "all" || methodFilter !== "all"
                ? "No worker payment records match your filters."
                : "No worker salary payments recorded yet. Please set your payment method to ensure your contracted workers receive automated salary payouts on payday."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader className="bg-transparent border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="w-10 pl-2">
                    <Checkbox
                      checked={
                        transactions.length > 0 &&
                        selectedTxIds.length === transactions.length
                      }
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      className="border-slate-400 rounded-sm"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Time</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Type</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">
                    Worker / Beneficiary
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">
                    Phone Number
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">
                    Payment Method
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 text-right pr-2">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx: any) => {
                  const isSelected = selectedTxIds.includes(tx.id);
                  const workerName = tx.beneficiary?.name || tx.worker_name || "-";
                  const workerPhoto = tx.beneficiary?.photo || tx.worker_photo || null;
                  const workerPhone = tx.beneficiary?.phone || tx.worker_phone || tx.phone_number || "-";

                  return (
                    <TableRow
                      key={tx.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/50" : ""
                        }`}
                    >
                      {/* Checkbox */}
                      <TableCell className="pl-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelectTx(tx.id)}
                          className="border-slate-400 rounded-sm"
                        />
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-3 text-xs text-slate-700 whitespace-nowrap">
                        {tx.date || "-"}
                      </TableCell>

                      {/* Time */}
                      <TableCell className="py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                        {tx.time || "-"}
                      </TableCell>

                      {/* Type Badge - Arrow pointing up for Payment */}
                      <TableCell className="py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <ArrowUpRight className="w-3 h-3 text-slate-500" />
                          {tx.is_batch ? `Batch (${tx.workers_count})` : "Payment"}
                        </span>
                      </TableCell>

                      {/* Worker / Beneficiary Name & Photo */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5 min-w-[150px]">
                          <Avatar className="h-7 w-7 border border-slate-200 shrink-0">
                            {workerPhoto && (
                              <AvatarImage
                                src={workerPhoto}
                                alt={workerName}
                                referrerPolicy="no-referrer"
                                className="object-cover"
                              />
                            )}
                            <AvatarFallback className="p-0 bg-transparent border-none">
                              <DefaultAvatarSVG className="w-full h-full" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {workerName}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Phone Number */}
                      <TableCell className="py-3 text-xs text-slate-600 font-mono whitespace-nowrap">
                        {workerPhone}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="py-3 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {tx.status === "completed" ? "Paid " : ""}
                          {formatCurrency(tx.amount)}
                        </span>
                      </TableCell>

                      {/* Status: Overdue or Paid on Time */}
                      <TableCell className="py-3 whitespace-nowrap">
                        {tx.status === "completed" || tx.payment_timeliness === "Paid on Time" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Paid on Time
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Overdue
                          </span>
                        )}
                      </TableCell>

                      {/* Payment Method */}
                      <TableCell className="py-3 text-xs text-slate-700 font-medium whitespace-nowrap">
                        {tx.payment_method || "MTN Mobile Money"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-2 py-3">
                        <CustomDropdown
                          widthClass="w-44"
                          trigger={
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          }
                          items={
                            tx.status === "completed"
                              ? [
                                  {
                                    label: "Download Receipt",
                                    onClick: () => handleDownloadReceipt(tx.id),
                                  },
                                ]
                              : [
                                  {
                                    label: "Pay Worker",
                                    onClick: () => {
                                      const resolvedWorkerId =
                                        tx.worker_id ||
                                        tx.beneficiary?.id ||
                                        unpaidWorkers[0]?.worker_id ||
                                        awareness?.worker_id;
                                      setPayModalState({
                                        open: true,
                                        mode: "single",
                                        worker: {
                                          worker_id: resolvedWorkerId,
                                          worker_name: workerName,
                                          worker_phone: workerPhone,
                                          salary_amount: tx.amount,
                                          salary_formatted: formatCurrency(tx.amount),
                                          due_date: tx.date || "",
                                        },
                                        step: "confirm",
                                        payerPhone: momoPhone || "",
                                        otpCode: "",
                                        referenceId: "",
                                        error: "",
                                      });
                                    },
                                  },
                                ]
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {pagination && (
          <YouTubeStudioPagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            perPage={perPage}
            total={pagination.total}
            onPageChange={(page) => setCurrentPage(page)}
            onPerPageChange={(val) => {
              setPerPage(val);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* ================================================================= */}
      {/* REAL MTN MOMO SALARY PAYMENT & POLLING MODAL (1-by-1 or Batch All) */}
      {/* ================================================================= */}
      {payModalState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full p-0 overflow-hidden border-0 bg-[#226e9f] text-white shadow-2xl rounded-[4px] relative">
            <div className="bg-[#226e9f] text-white px-5 pt-4 pb-3 relative border-b border-white/15">
              <button
                type="button"
                onClick={() => setPayModalState((prev) => ({ ...prev, open: false }))}
                className="absolute top-4 right-4 p-1 text-white hover:opacity-80 bg-transparent border-0 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5 stroke-[2.5] text-white" />
              </button>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {payModalState.mode === "batch"
                  ? `Pay All Unpaid Workers (${unpaidWorkers.length})`
                  : `Pay ${payModalState.worker?.worker_name}`}
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                MTN Mobile Money Real Transfer — Strictly 100% Contracted Salary
              </p>
            </div>

            <div className="px-5 py-4 space-y-3.5 bg-[#226e9f] text-white text-left">
              {payModalState.step === "confirm" && (
                <>
                  <div className="p-3 rounded-[3px] bg-white/10 border border-white/20 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-white/80">Total Salary Amount (Full):</span>
                      <span className="font-bold text-white">
                        {payModalState.mode === "batch"
                          ? awareness?.total_due_formatted
                          : payModalState.worker?.salary_formatted}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Receiving Worker Number:</span>
                      <span className="font-mono font-semibold text-white">
                        {payModalState.mode === "batch"
                          ? `${unpaidWorkers.length} verified workers`
                          : payModalState.worker?.worker_phone}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white">
                      Your MTN Mobile Money Debit Number *
                    </label>
                    <input
                      type="tel"
                      value={payModalState.payerPhone}
                      onChange={(e) =>
                        setPayModalState((prev) => ({
                          ...prev,
                          payerPhone: e.target.value,
                          error: "",
                        }))
                      }
                      placeholder="078xxxxxxx"
                      maxLength={12}
                      className="w-full px-3 h-11 rounded-[3px] text-sm font-semibold border border-white/30 bg-white/10 text-white placeholder:text-white/50 focus:border-white outline-none"
                    />
                    <p className="text-[11px] text-white/80">
                      You will receive an MTN MoMo PIN prompt (*182*7*1#) on this phone. Full balance is verified automatically—half payments are never sent.
                    </p>
                  </div>

                  {payModalState.error && (
                    <div className="p-2.5 rounded bg-rose-500/20 border border-rose-300/40 text-xs text-white flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{payModalState.error}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleRequestPayWorkerOtp}
                    disabled={isRequestingPayOtp || payWorkerMutation.isPending}
                    className="w-full h-11 bg-[#689f38] hover:bg-[#588a2e] disabled:opacity-50 text-white font-bold text-sm rounded-[3px] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isRequestingPayOtp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>
                      {isRequestingPayOtp ? "Sending SMS OTP..." : "Send SMS OTP & Continue"}
                    </span>
                  </button>
                </>
              )}

              {payModalState.step === "otp" && (
                <>
                  <div className="p-3 rounded-[3px] bg-white/10 border border-white/20 text-xs space-y-1">
                    <p className="font-bold text-white">SMS OTP Verification Required</p>
                    <p className="text-white/85">
                      Enter the 6-digit SMS code sent to{" "}
                      <span className="font-mono font-bold text-white">{payModalState.payerPhone}</span>{" "}
                      before paying{" "}
                      <strong>
                        {payModalState.mode === "batch"
                          ? awareness?.total_due_formatted
                          : payModalState.worker?.salary_formatted}
                      </strong>.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white">
                      6-Digit SMS OTP Code *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={payModalState.otpCode}
                      onChange={(e) =>
                        setPayModalState((prev) => ({
                          ...prev,
                          otpCode: e.target.value.replace(/\D/g, "").slice(0, 6),
                          error: "",
                        }))
                      }
                      placeholder="••••••"
                      maxLength={6}
                      className="w-full px-3 h-12 rounded-[3px] text-center font-mono text-lg tracking-[0.4em] font-bold border border-white/30 bg-white/10 text-white placeholder:text-white/40 focus:border-white outline-none"
                    />
                  </div>

                  {payModalState.error && (
                    <div className="p-2.5 rounded bg-rose-500/20 border border-rose-300/40 text-xs text-white flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{payModalState.error}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirmMomoSalaryPayment}
                    disabled={payWorkerMutation.isPending || payModalState.otpCode.length !== 6}
                    className="w-full h-11 bg-[#689f38] hover:bg-[#588a2e] disabled:opacity-50 text-white font-bold text-sm rounded-[3px] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {payWorkerMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>
                      {payWorkerMutation.isPending ? "Verifying & Sending Prompt..." : "Verify OTP & Send MTN MoMo Prompt"}
                    </span>
                  </button>

                  <div className="flex items-center justify-between text-xs text-white/85 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setPayModalState((prev) => ({ ...prev, step: "confirm", otpCode: "", error: "" }))
                      }
                      className="underline hover:text-white bg-transparent border-0 cursor-pointer"
                    >
                      Change Phone
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestPayWorkerOtp}
                      disabled={isRequestingPayOtp}
                      className="underline hover:text-white bg-transparent border-0 cursor-pointer disabled:opacity-50"
                    >
                      {isRequestingPayOtp ? "Resending..." : "Resend SMS OTP"}
                    </button>
                  </div>
                </>
              )}

              {payModalState.step === "polling" && (
                <div className="py-5 text-center space-y-3">
                  <Loader2 className="w-10 h-10 animate-spin text-white mx-auto" />
                  <h4 className="text-sm font-bold">Waiting for MTN MoMo Approval...</h4>
                  <p className="text-xs text-white/85">
                    Dial <strong>*182*7*1#</strong> or enter your MoMo PIN on{" "}
                    <span className="font-mono font-bold">{payModalState.payerPhone}</span> to complete disbursement.
                  </p>
                </div>
              )}

              {payModalState.step === "done" && (
                <div className="py-4 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto" />
                  <h4 className="text-base font-bold">Salary Paid &amp; Disbursed!</h4>
                  <p className="text-xs text-white/85">
                    MTN MoMo transfer completed. Worker salary ledger and wallet have been updated.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPayModalState((prev) => ({ ...prev, open: false }))}
                    className="w-full h-10 bg-white text-[#226e9f] font-bold text-sm rounded-[3px] cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}

              {payModalState.step === "failed" && (
                <div className="py-4 text-center space-y-3">
                  <AlertCircle className="w-12 h-12 text-amber-300 mx-auto" />
                  <h4 className="text-base font-bold">Insufficient Balance — Please Top Up</h4>
                  <p className="text-xs text-white/90 leading-relaxed">{payModalState.error}</p>
                  <button
                    type="button"
                    onClick={() => setPayModalState((prev) => ({ ...prev, step: "confirm", error: "" }))}
                    className="w-full h-10 bg-white text-[#226e9f] font-bold text-sm rounded-[3px] cursor-pointer"
                  >
                    Try Again After Top-Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SET PAYMENT METHOD MODAL — Same Design as Wallet Popup (#226e9f)   */}
      {/* ================================================================= */}
      {showPaymentMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div
            className="max-w-md w-full p-0 overflow-hidden border-0 bg-[#226e9f] text-white shadow-2xl rounded-[4px] relative"
            style={{ borderRadius: "4px" }}
          >
            {/* Header styled with #226e9f Blue Theme */}
            <div className="bg-[#226e9f] text-white px-5 pt-3.5 pb-3 relative border-b border-white/15">
              <button
                type="button"
                onClick={() => setShowPaymentMethodModal(false)}
                className="absolute top-4 right-4 p-1 text-white hover:opacity-80 transition-opacity bg-transparent border-0 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5 stroke-[2.5] text-white" />
              </button>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {isPaymentMethodConfigured ? "Update Payment Method" : "Set Payment Method"}
              </h3>
              <p className="text-xs text-white/80 mt-1 font-normal">
                Automated salary payouts for your contracted workers
              </p>
            </div>

            <div className="px-5 py-4 space-y-3.5 bg-[#226e9f] text-white text-left">
              {paymentMethodStep === "form" ? (
                <>
                  {/* Payment Method Selector - Dedicated to MTN MoMo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white">
                      Select Payout Source *
                    </label>
                    <select
                      value={autoPayMethod}
                      onChange={(e) => setAutoPayMethod(e.target.value)}
                      className="w-full h-11 px-3 rounded-[3px] text-sm font-semibold border border-white/30 bg-white/10 text-white focus:border-white focus:bg-white/20 outline-none cursor-pointer"
                    >
                      <option value="mtn_momo" className="text-slate-900">
                        MTN Mobile Money Direct Debit (*182#)
                      </option>
                    </select>
                  </div>

                  {/* MTN Mobile Money Phone Input (empty by default until user enters) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white">
                      MTN Mobile Money Phone *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/80">
                        🇷🇼
                      </span>
                      <input
                        type="tel"
                        value={momoPhone}
                        onChange={(e) => setMomoPhone(e.target.value)}
                        placeholder="078xxxxxxx"
                        maxLength={12}
                        className="w-full pl-9 pr-3 h-11 rounded-[3px] text-sm font-semibold border border-white/30 bg-white/10 text-white placeholder:text-white/50 focus:border-white outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-white/80">
                      Automated worker payouts will be debited from this MTN Rwanda MoMo account via USSD prompt. SMS OTP verification is required to confirm number ownership.
                    </p>
                  </div>

                  {/* Auto-Pay Confirmation Box + Clickable Stop / Resume Link */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white">
                          Enable Automatic Payouts
                        </p>
                        {isPaymentMethodConfigured && (
                          <button
                            type="button"
                            onClick={handleToggleAutoPayment}
                            disabled={saveAutoPaymentMutation.isPending || isVerifying}
                            className="text-[11px] font-bold underline text-white/95 hover:text-white bg-transparent border-0 p-0 cursor-pointer disabled:opacity-50"
                          >
                            {isVerifying
                              ? (autoPayEnabled ? "Stopping..." : "Resuming...")
                              : autoPayEnabled
                                ? "Stop Auto Payment"
                                : "Resume Auto Payment"}
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-white/80 mt-0.5">
                        {autoPayEnabled
                          ? "Workers are paid according to their dedicated agreed salary on their scheduled pay day"
                          : "Automatic payouts are currently paused. Click Resume Auto Payment to re-enable."}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoPayEnabled}
                      onChange={(e) => setAutoPayEnabled(e.target.checked)}
                      className="w-5 h-5 accent-[#689f38] cursor-pointer rounded shrink-0"
                    />
                  </div>

                  {paymentMethodOtpError && (
                    <div className="p-2.5 rounded bg-rose-500/20 border border-rose-300/40 text-xs text-white flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{paymentMethodOtpError}</span>
                    </div>
                  )}

                  {/* Step 1 Submit Button -> Sends SMS OTP */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleRequestPaymentMethodOtp}
                      disabled={isRequestingMethodOtp}
                      className="w-full h-11 bg-[#689f38] hover:bg-[#588a2e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-[3px] transition-colors cursor-pointer border-0 shadow-xs flex items-center justify-center gap-2"
                    >
                      {isRequestingMethodOtp ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                      <span>
                        {isRequestingMethodOtp
                          ? "Sending SMS OTP..."
                          : isPaymentMethodConfigured
                          ? "Update Payment Method"
                          : "Save Payment Method"}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-[3px] bg-white/10 border border-white/20 text-xs space-y-1">
                    <p className="font-bold text-white">Verify Your MTN MoMo Number</p>
                    <p className="text-white/85">
                      Enter the 6-digit SMS OTP code sent to{" "}
                      <span className="font-mono font-bold text-white">{momoPhone}</span> to confirm{" "}
                      {isPaymentMethodConfigured ? "updating" : "setting"} this payout number.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white">
                      6-Digit SMS OTP Code *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={paymentMethodOtp}
                      onChange={(e) => {
                        setPaymentMethodOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setPaymentMethodOtpError("");
                      }}
                      placeholder="••••••"
                      maxLength={6}
                      className="w-full px-3 h-12 rounded-[3px] text-center font-mono text-lg tracking-[0.4em] font-bold border border-white/30 bg-white/10 text-white placeholder:text-white/40 focus:border-white outline-none"
                    />
                  </div>

                  {paymentMethodOtpError && (
                    <div className="p-2.5 rounded bg-rose-500/20 border border-rose-300/40 text-xs text-white flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{paymentMethodOtpError}</span>
                    </div>
                  )}

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleSavePaymentMethod}
                      disabled={saveAutoPaymentMutation.isPending || isVerifying || paymentMethodOtp.length !== 6}
                      className="w-full h-11 bg-[#689f38] hover:bg-[#588a2e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-[3px] transition-colors cursor-pointer border-0 shadow-xs flex items-center justify-center gap-2"
                    >
                      {isVerifying || saveAutoPaymentMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                      <span>
                        {isVerifying
                          ? verificationStatusText
                          : saveAutoPaymentMutation.isPending
                          ? isPaymentMethodConfigured
                            ? "Updating..."
                            : "Saving..."
                          : isPaymentMethodConfigured
                          ? "Verify OTP & Update Payment Method"
                          : "Verify OTP & Save Payment Method"}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/85 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethodStep("form");
                        setPaymentMethodOtp("");
                        setPaymentMethodOtpError("");
                      }}
                      className="underline hover:text-white bg-transparent border-0 cursor-pointer"
                    >
                      Change Number
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestPaymentMethodOtp}
                      disabled={isRequestingMethodOtp}
                      className="underline hover:text-white bg-transparent border-0 cursor-pointer disabled:opacity-50"
                    >
                      {isRequestingMethodOtp ? "Resending..." : "Resend SMS OTP"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <TransactionDetailsModal
        transactionId={selectedTransactionId}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
};

export default TransactionHistory;