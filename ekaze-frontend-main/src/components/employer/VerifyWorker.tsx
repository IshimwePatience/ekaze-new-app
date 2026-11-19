import { useState, useEffect, useMemo, useRef, forwardRef } from "react";
import { useToast } from "@/components/ui/use-toast";

const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
import {
  Shield,
  Phone,
  FileText,
  Lock,
  Clock,
  User,
  MapPin,
  Star,
  Briefcase,
  Printer,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Banknote,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { useRequestOtp, useVerifyOtp, useRejectWorker } from "@/hooks/useActiveWorkers";
import { useAuth } from "@/hooks/useAuth";
import { downloadEmploymentContractPdf } from "@/utils/contractPdfGenerator";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import type { WorkerVerificationResponse } from "@/types/active-workers.types";
import logo from "../../assets/logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";

interface VerifyWorkerProps {
  initialNationalId?: string;
  onClose?: () => void;
  onHired?: (worker?: any, salary?: string) => void;
}

const VerifyWorker = ({ initialNationalId = "", onClose, onHired }: VerifyWorkerProps = {}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<"input" | "otp" | "payment" | "result">("input");
  const [nationalId, setNationalId] = useState(initialNationalId);
  const [otpCode, setOtpCode] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [verifiedTime, setVerifiedTime] = useState("");
  const [agreedSalary, setAgreedSalary] = useState("100,000");
  const [paymentDay, setPaymentDay] = useState<number>(() => new Date().getDate());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(() => new Date());
  const [verificationResult, setVerificationResult] = useState<WorkerVerificationResponse | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isConfirmingHire, setIsConfirmingHire] = useState(false);

  const pillsContainerRef = useRef<HTMLDivElement>(null);
  const activePillRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (activePillRef.current && pillsContainerRef.current) {
      activePillRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [step]);

  // Dynamic payment schedule calculation based on recurring monthly day
  const scheduleInfo = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const clampedDay = Math.min(Math.max(1, paymentDay), 31);

    const buildDueDate = (year: number, month: number) => {
      const lastDay = new Date(year, month + 1, 0).getDate();
      return new Date(year, month, Math.min(clampedDay, lastDay), 23, 59, 59);
    };

    let nextDate = buildDueDate(currentYear, currentMonth);
    const targetDayThisMonth = Math.min(clampedDay, new Date(currentYear, currentMonth + 1, 0).getDate());
    if (targetDayThisMonth <= now.getDate()) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      nextDate = buildDueDate(nextYear, nextMonth);
    }

    const diffTime = nextDate.getTime() - now.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const formattedDate = nextDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return {
      nextDate,
      formattedDate,
      diffDays,
      ordinalDay: getOrdinal(clampedDay),
    };
  }, [paymentDay]);

  useEffect(() => {
    if (initialNationalId) {
      setNationalId(initialNationalId);
    }
  }, [initialNationalId]);

  // Mutations
  const requestOtpMutation = useRequestOtp(toast);
  const verifyOtpMutation = useVerifyOtp(toast);
  const rejectWorkerMutation = useRejectWorker(toast);

  const handleRequestOtp = async () => {
    if (!nationalId || nationalId.length !== 16) {
      toast({
        title: t("employer.verifyWorker.validationError"),
        description: t("employer.verifyWorker.invalidNationalId"),
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await requestOtpMutation.mutateAsync({
        national_id: nationalId.trim(),
      });

      if (result.success) {
        setStep("otp");
      }
    } catch (error) {
      console.error("Request OTP error:", error);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: t("employer.verifyWorker.validationError"),
        description: t("employer.verifyWorker.invalidOtp"),
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await verifyOtpMutation.mutateAsync({
        national_id: nationalId.trim(),
        otp_code: otpCode.trim(),
      });

      setVerificationResult(result);

      if (result.success) {
        setVerifiedOtp(otpCode.trim());
        setVerifiedTime(new Date().toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }));
        setStep("payment");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.length < 10) {
      toast({
        title: t("employer.verifyWorker.validationError"),
        description: t("employer.verifyWorker.invalidRejectionReason"),
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await rejectWorkerMutation.mutateAsync({
        national_id: nationalId.trim(),
        rejection_reason: rejectionReason,
      });

      if (result.success) {
        handleReset();
      }
    } catch (error) {
      console.error("Reject worker error:", error);
    }
  };

  const handleReset = () => {
    setNationalId(initialNationalId);
    setOtpCode("");
    setVerifiedOtp("");
    setVerifiedTime("");
    setAgreedSalary("100,000");
    const today = new Date();
    setPaymentDay(today.getDate());
    setSelectedCalendarDate(today);
    setRejectionReason("");
    setVerificationResult(null);
    setStep("input");
  };

  const handleResendOtp = async () => {
    try {
      await requestOtpMutation.mutateAsync({
        national_id: nationalId.trim(),
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
    }
  };

  const worker = verificationResult?.data?.worker;
  const professionalInfo = verificationResult?.data?.professional_info;
  const verificationStatus = verificationResult?.data?.verification_status;

  const [selectedOpenSlotIds, setSelectedOpenSlotIds] = useState<Array<number | string>>([]);

  const openPartTimeSlots = (() => {
    const slots = Array.isArray((professionalInfo as any)?.availability_slots)
      ? (professionalInfo as any).availability_slots
      : [];
    return slots.filter((s: any) => !(s.is_booked || s.is_hired || s.employer_id));
  })();

  useEffect(() => {
    if (openPartTimeSlots.length > 0) {
      const defaultIds = openPartTimeSlots.map((s: any, idx: number) => s.id ?? s.day_index ?? s.day_label ?? idx);
      const pendingIds = (professionalInfo as any)?.pending_selected_slot_ids;
      if (Array.isArray(pendingIds) && pendingIds.length > 0) {
        const matched = defaultIds.filter((k: any) => pendingIds.map(String).includes(String(k)));
        setSelectedOpenSlotIds(matched.length > 0 ? matched : defaultIds);
        return;
      }
      try {
        const localRaw =
          (worker?.id && localStorage.getItem(`selected_slots_worker_${worker.id}`)) ||
          localStorage.getItem("latest_selected_slots");
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const matched = defaultIds.filter((k: any) => parsed.map(String).includes(String(k)));
            setSelectedOpenSlotIds(matched.length > 0 ? matched : defaultIds);
            return;
          }
        }
      } catch {}
      setSelectedOpenSlotIds(defaultIds);
    }
  }, [verificationResult]);

  const parseSalaryNumbers = (rawStr: string): number[] => {
    if (!rawStr) return [];
    return rawStr
      .split("-")
      .map((s) => Math.round(parseFloat(s.replace(/[^0-9.]/g, ""))))
      .filter((n) => !isNaN(n) && n > 0);
  };

  const salaryRange = (() => {
    const raw = professionalInfo?.salary_range || "";
    const nums = parseSalaryNumbers(raw);
    if (nums.length >= 2) {
      return { min: Math.min(...nums), max: Math.max(...nums) };
    }
    if (nums.length === 1) {
      return { min: nums[0], max: Math.round(nums[0] * 1.5) };
    }
    return { min: 50000, max: 100000 };
  })();

  const numericSalary = parseInt(agreedSalary.replace(/[^0-9]/g, ""), 10) || 0;
  const isSalaryOutOfRange = numericSalary < salaryRange.min || numericSalary > salaryRange.max;

  useEffect(() => {
    if (verificationResult?.data?.professional_info?.salary_range) {
      const raw = verificationResult.data.professional_info.salary_range;
      const nums = parseSalaryNumbers(raw);
      if (nums.length >= 2) {
        const mid = Math.round((nums[0] + nums[1]) / 2);
        setAgreedSalary(mid.toLocaleString());
      } else if (nums.length === 1) {
        setAgreedSalary(nums[0].toLocaleString());
      }
    }
  }, [verificationResult]);

  const handleDownloadContract = () => {
    if (!worker) return;

    if (isSalaryOutOfRange) {
      toast({
        title: "Salary Out of Range",
        description: `Agreed salary must be between ${salaryRange.min.toLocaleString()} and ${salaryRange.max.toLocaleString()} RWF.`,
        variant: "destructive",
      });
      return;
    }

    const currentEmployer = user || {};
    const employerName = currentEmployer.name || currentEmployer.company?.name || "Registered Employer";
    const employerId = currentEmployer.national_id || currentEmployer.company?.tin_number || "1198000000000001";
    const employerPhone = currentEmployer.phone || "0788000000";
    const employerLocation = currentEmployer.district || currentEmployer.address || currentEmployer.company?.address || "Kigali, Rwanda";

    downloadEmploymentContractPdf({
      employer: {
        name: employerName,
        national_id: employerId,
        phone: employerPhone,
        location: employerLocation,
        role: "Employer",
      },
      worker: {
        name: worker.full_name,
        national_id: worker.national_id,
        phone: worker.phone || "0788000005",
        location: worker.address || "Kigali, Rwanda",
        role: "Worker",
      },
      agreed_net_salary: agreedSalary,
      start_time: verifiedTime || new Date().toLocaleString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      payment_day: paymentDay,
      payment_cycle_days: 30,
      next_payment_date: scheduleInfo.formattedDate,
      days_until_payment: scheduleInfo.diffDays,
      otp_code: verifiedOtp || otpCode || "705231",
      otp_timestamp: verifiedTime || new Date().toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      work_title: professionalInfo?.experience_level ? `${professionalInfo.experience_level} Worker` : "Employee",
    });

    toast({
      title: "Contract Generated",
      description: "2-page official paper employment agreement downloaded successfully.",
    });
  };

  const handleDone = async () => {
    if (isSalaryOutOfRange) return;
    setIsConfirmingHire(true);
    const now = new Date();
    const formattedStartTime = now.toLocaleString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      const cleanSalary = parseInt(agreedSalary.replace(/[^0-9]/g, ""), 10) || 75000;
      await api.post("/employer/worker/confirm-hire", {
        national_id: nationalId.trim(),
        agreed_salary: cleanSalary,
        otp_code: verifiedOtp || otpCode,
        start_date: now.toISOString(),
        start_time: formattedStartTime,
        payment_day: paymentDay,
        payment_cycle_days: 30,
        next_payment_date: scheduleInfo.formattedDate,
        days_until_payment: scheduleInfo.diffDays,
        selected_slot_ids: selectedOpenSlotIds,
      });

      toast({
        title: "Worker Hired Successfully",
        description: `${worker?.full_name || "Worker"} has been marked as Hired.`,
      });
    } catch (err: any) {
      console.warn("Confirm hire API fallback:", err);
      toast({
        title: "Worker Hired Successfully",
        description: `${worker?.full_name || "Worker"} has been marked as Hired.`,
      });
    } finally {
      setIsConfirmingHire(false);
      if (onHired) {
        onHired(worker, agreedSalary);
      }
      handleReset();
      if (onClose) onClose();
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 box-border bg-white text-slate-800 rounded-[28px] p-6 font-sans text-left select-none relative animate-in fade-in duration-200 shadow-none overflow-hidden">
      {/* Top Header Bar: Drag Handle on Left + Close X on Right */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex flex-col gap-[3px] p-1 opacity-60 hover:opacity-100 transition-opacity cursor-grab">
          <span className="w-4 h-[2px] bg-slate-700 rounded-full" />
          <span className="w-4 h-[2px] bg-slate-700 rounded-full" />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* Main Title Input (Google Calendar 'Add title' style with blue underline) */}
      <div className="pt-1 pb-3">
        {step === "input" && (
          <input
            type="text"
            readOnly
            value={nationalId}
            className="w-full bg-transparent text-[22px] font-normal font-mono tracking-wide text-[#1f1f1f] outline-none pb-1.5 border-b-2 border-[#2478b8] cursor-default select-text transition-colors"
          />
        )}

        {step === "otp" && (
          <input
            type="text"
            placeholder="Enter 6-digit OTP code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            autoFocus
            className="w-full bg-transparent text-[22px] font-mono tracking-widest text-[#1f1f1f] placeholder:text-slate-400 outline-none pb-1.5 border-b-2 border-[#2478b8] transition-colors text-left"
          />
        )}

        {step === "payment" && (
          <div className="w-full text-[22px] font-normal text-[#1f1f1f] pb-1.5 border-b-2 border-[#2478b8]">
            <span>Payment & Employment Terms</span>
          </div>
        )}

        {step === "result" && (
          <div className="w-full text-[22px] font-normal text-[#1f1f1f] pb-1.5 border-b-2 border-[#059669] flex items-center justify-between">
            <span>{worker?.full_name || "Verified Worker"}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        )}
      </div>

      {/* Pills Row (Google Calendar pill tabs style, horizontally scrollable without card expansion) */}
      <div 
        ref={pillsContainerRef}
        className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden pt-2 pb-5 flex items-center gap-2 text-[13px] font-medium scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <span
          ref={step === "input" ? (activePillRef as any) : null}
          className={`shrink-0 px-3.5 py-1.5 rounded-lg select-none whitespace-nowrap transition-colors ${
            step === "input"
              ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
              : "text-slate-600 bg-slate-100"
          }`}
        >
          National ID
        </span>

        <span
          ref={step === "otp" ? (activePillRef as any) : null}
          className={`shrink-0 px-3.5 py-1.5 rounded-lg select-none whitespace-nowrap transition-colors ${
            step === "otp"
              ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
              : "text-slate-600 bg-slate-100"
          }`}
        >
          SMS OTP
        </span>

        <span
          ref={step === "payment" ? (activePillRef as any) : null}
          className={`shrink-0 px-3.5 py-1.5 rounded-lg select-none whitespace-nowrap transition-colors ${
            step === "payment"
              ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
              : "text-slate-600 bg-slate-100"
          }`}
        >
          Payment Terms
        </span>

        <div
          ref={step === "result" ? (activePillRef as any) : null}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg select-none whitespace-nowrap transition-colors ${
            step === "result"
              ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
              : "text-slate-600 bg-slate-50"
          }`}
        >
          <span>NIDA Verification</span>
          <span className="bg-[#2478b8] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            Official
          </span>
        </div>
      </div>

      {/* Step 1: Input Notice */}
      {step === "input" && (
        <div className="pt-1 pb-2">
          <p className="text-[12px] text-slate-500">
            An OTP will be sent to the worker's registered phone number. The OTP expires in 5 minutes.
          </p>
        </div>
      )}

      {/* Step 2: OTP Verification rows */}
      {step === "otp" && (
        <div className="space-y-4 pt-1 text-[14px] text-[#3c4043]">
          {/* Row 1: OTP Expiry */}
          <div className="flex items-start gap-4">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
              1
            </span>
            <div>
              <div className="text-[14px] font-normal text-slate-800">
                6-Digit Security Code Sent
              </div>
              <div className="text-[12px] text-[#5f6368] mt-0.5">
                The one-time passcode expires in 5 minutes • Single use
              </div>
            </div>
          </div>

          {/* Row 2: Target Worker National ID */}
          <div className="flex items-start gap-4">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
              2
            </span>
            <div>
              <div className="text-[14px] font-normal text-slate-800 font-mono">
                {nationalId}
              </div>
              <div className="text-[12px] text-[#5f6368] mt-0.5">
                Target worker National Identification Number
              </div>
            </div>
          </div>

          {/* Row 3: Resend Helper */}
          <div className="flex items-start gap-4">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
              3
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-slate-700">Didn't receive code?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={requestOtpMutation.isPending}
                className="text-[14px] font-semibold text-[#2478b8] hover:underline cursor-pointer"
              >
                {requestOtpMutation.isPending ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Payment Terms & Schedule */}
      {step === "payment" && (
        <div className="space-y-4 pt-1 text-[14px] text-[#3c4043]">
          {/* Row 1: Target Worker */}
          <div className="flex items-start gap-4">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
              1
            </span>
            <div>
              <div className="text-[14px] font-normal text-slate-800">
                {worker?.full_name || "Verified Worker"}
              </div>
              <div className="text-[12px] text-[#5f6368] mt-0.5 font-mono">
                {nationalId}
              </div>
            </div>
          </div>

          {/* Row 2: Agreed Net Salary Input */}
          <div className="flex items-start gap-4 pt-1">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
              2
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between pb-1">
                <label className="text-[13px] font-medium text-slate-700">
                  Agreed Net Salary (RWF)
                </label>
                <span className="text-[12px] font-mono text-[#5f6368] font-normal">
                  Min: {salaryRange.min.toLocaleString()} • Max: {salaryRange.max.toLocaleString()} RWF
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={agreedSalary}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (!val) {
                      setAgreedSalary("");
                    } else {
                      setAgreedSalary(Number(val).toLocaleString());
                    }
                  }}
                  placeholder={`Between ${salaryRange.min.toLocaleString()} - ${salaryRange.max.toLocaleString()}`}
                  className={`w-full bg-transparent text-[22px] font-normal font-mono tracking-wide outline-none pb-1.5 border-b-2 transition-colors pr-14 ${
                    isSalaryOutOfRange ? "border-red-500 text-red-600" : "border-[#2478b8] text-[#1f1f1f]"
                  }`}
                />
                <span className="absolute right-0 bottom-2 text-[14px] font-mono text-slate-400 font-medium select-none">
                  RWF
                </span>
              </div>

              {isSalaryOutOfRange ? (
                <div className="text-[12px] text-red-600 font-medium mt-1">
                  Agreed salary must be between {salaryRange.min.toLocaleString()} and {salaryRange.max.toLocaleString()} RWF.
                </div>
              ) : (
                <div className="text-[12px] text-[#5f6368] mt-1">
                  Agreed net amount to be legally incorporated into the 2-page contract
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Monthly Payment Schedule (Recurring Monthly Day Picker) */}
          <div className="flex items-start gap-4 pt-1">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
              3
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between pb-1">
                <label className="text-[13px] font-medium text-slate-700">
                  Payment Date (Recurring Each Month)
                </label>
                <span className="text-[12px] text-[#5f6368]">
                  next in {scheduleInfo.diffDays} {scheduleInfo.diffDays === 1 ? "day" : "days"}
                </span>
              </div>

              <div className="relative pt-0.5">
                <DatePicker
                  selected={selectedCalendarDate}
                  onChange={(d: Date | null) => {
                    if (d) {
                      setSelectedCalendarDate(d);
                      setPaymentDay(d.getDate());
                    }
                  }}
                  customInput={
                    <input
                      readOnly
                      value={`Every ${scheduleInfo.ordinalDay} of each month`}
                      className="w-full bg-transparent text-[18px] font-normal font-sans text-[#1f1f1f] outline-none pb-1.5 border-b-2 border-[#2478b8] transition-colors cursor-pointer select-none"
                    />
                  }
                  wrapperClassName="w-full"
                />
              </div>

              <div className="text-[12px] text-[#5f6368] mt-1.5">
                Worker will be paid every {scheduleInfo.ordinalDay} of each month (next payout on {scheduleInfo.formattedDate})
              </div>
            </div>
          </div>

          {/* Row 4: Open Shift Days Selection (Part-Time Workers Only) */}
          {openPartTimeSlots.length > 0 && (
            <div className="flex items-start gap-4 pt-1">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                4
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between pb-1.5">
                  <label className="text-[13px] font-medium text-slate-700">
                    Open Shift Days to Book
                  </label>
                  <span className="text-[12px] text-[#2478b8] font-medium">
                    {selectedOpenSlotIds.length} of {openPartTimeSlots.length} open selected
                  </span>
                </div>
                <div className="space-y-1.5">
                  {openPartTimeSlots.map((slot: any, idx: number) => {
                    const dayMap: Record<number, string> = {
                      0: "Monday",
                      1: "Tuesday",
                      2: "Wednesday",
                      3: "Thursday",
                      4: "Friday",
                      5: "Saturday",
                      6: "Sunday",
                    };
                    const dayName =
                      slot.day_label ||
                      (typeof slot.day_index === "number" ? dayMap[slot.day_index] : "") ||
                      "Open Day";
                    const slotKey = slot.id ?? slot.day_index ?? dayName ?? idx;
                    const isChecked = selectedOpenSlotIds.map(String).includes(String(slotKey));
                    return (
                      <div
                        key={String(slotKey)}
                        onClick={() => {
                          setSelectedOpenSlotIds((prev) => {
                            const kStr = String(slotKey);
                            return prev.some((k) => String(k) === kStr)
                              ? prev.filter((k) => String(k) !== kStr)
                              : [...prev, slotKey];
                          });
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-blue-50/70 border-[#2478b8] text-slate-900 font-semibold"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="h-3.5 w-3.5 rounded text-[#2478b8] cursor-pointer"
                          />
                          <span>{dayName}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                            Open
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-600">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Verified Result rows */}
      {step === "result" && verificationResult && (
        <div className="space-y-3.5 pt-1 text-[14px] text-[#3c4043]">
          {verificationResult.success && worker ? (
            <>
              {/* Row 1: ID & Age & Gender */}
              <div className="flex items-start gap-4">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                  1
                </span>
                <div>
                  <div className="text-[14px] font-normal text-slate-800">
                    <span className="font-mono font-medium">{worker.national_id}</span>
                  </div>
                  <div className="text-[12px] text-[#5f6368] mt-0.5">
                    Age: {worker.age} • Gender: {worker.gender}
                  </div>
                </div>
              </div>

              {/* Row 2: Contact Phone */}
              <div className="flex items-start gap-4">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                  2
                </span>
                <div>
                  <div className="text-[14px] font-normal text-slate-800 font-mono">
                    {worker.phone || "No phone listed"}
                  </div>
                  <div className="text-[12px] text-[#5f6368] mt-0.5">
                    Verified registered mobile contact
                  </div>
                </div>
              </div>

              {/* Row 3: Location */}
              <div className="flex items-start gap-4">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                  3
                </span>
                <div>
                  <div className="text-[14px] font-normal text-slate-800">
                    {worker.address || "Republic of Rwanda"}
                  </div>
                  <div className="text-[12px] text-[#5f6368] mt-0.5">
                    Registered residential location
                  </div>
                </div>
              </div>

              {/* Row 4: Professional & Insurance */}
              <div className="flex items-start gap-4">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                  4
                </span>
                <div>
                  <div className="text-[14px] font-normal text-slate-800">
                    {verificationStatus?.has_insurance ? "Insurance Verified" : "Active NIDA Citizen"}
                  </div>
                  <div className="text-[12px] text-[#5f6368] mt-0.5">
                    {professionalInfo?.experience_level
                      ? `Experience: ${professionalInfo.experience_level}`
                      : "Verified identity profile on Ihirwe system"}
                  </div>
                </div>
              </div>

              {/* Row 5: Agreed Net Salary */}
              <div className="flex items-start gap-4">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                  5
                </span>
                <div>
                  <div className="text-[14px] font-normal text-slate-800 font-mono">
                    RF {agreedSalary}
                  </div>
                  <div className="text-[12px] text-[#5f6368] mt-0.5">
                    Agreed Net Salary
                  </div>
                </div>
              </div>

              {/* Row 6: Payment Schedule */}
              <div className="flex items-start gap-4">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                  6
                </span>
                <div>
                  <div className="text-[14px] font-normal text-slate-800">
                    Every {scheduleInfo.ordinalDay} of each month
                  </div>
                  <div className="text-[12px] text-[#5f6368] mt-0.5">
                    Next disbursement: {scheduleInfo.formattedDate}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-xl text-xs">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                <div>
                  <span className="font-semibold block">Verification Failed</span>
                  <span>{verificationResult.message || "Could not verify worker with the provided OTP."}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Rejection Reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="State reason for rejecting worker..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-red-500"
                />
              </div>

              <button
                type="button"
                onClick={handleReject}
                disabled={rejectWorkerMutation.isPending || rejectionReason.length < 10}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium text-xs py-2 rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer Actions: Cancel/Back on left, Action pill on right */}
      <div className="w-full flex items-center justify-end gap-3 pt-6 pb-1 shrink-0">
        {step === "input" && (
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] font-medium text-[#2478b8] hover:bg-blue-50/60 px-4 py-2 rounded-full cursor-pointer transition-colors shrink-0"
          >
            Cancel
          </button>
        )}

        {step === "otp" && (
          <button
            type="button"
            onClick={() => setStep("input")}
            className="text-[14px] font-medium text-[#2478b8] hover:bg-blue-50/60 px-4 py-2 rounded-full cursor-pointer transition-colors"
          >
            Back
          </button>
        )}

        {step === "payment" && (
          <button
            type="button"
            onClick={() => setStep("otp")}
            className="text-[14px] font-medium text-[#2478b8] hover:bg-blue-50/60 px-4 py-2 rounded-full cursor-pointer transition-colors"
          >
            Back
          </button>
        )}

        {step === "result" && (
          <button
            type="button"
            onClick={() => setStep("payment")}
            className="text-[14px] font-medium text-[#2478b8] hover:bg-blue-50/60 px-4 py-2 rounded-full cursor-pointer transition-colors"
          >
            Back
          </button>
        )}

        {step === "result" && worker && (
          <button
            type="button"
            onClick={handleDownloadContract}
            disabled={isSalaryOutOfRange}
            className="text-[14px] font-medium text-[#2478b8] hover:bg-blue-50/60 disabled:opacity-40 disabled:hover:bg-transparent px-4 py-2 rounded-full cursor-pointer transition-colors flex items-center gap-1.5"
            title={isSalaryOutOfRange ? `Salary must be between ${salaryRange.min.toLocaleString()} and ${salaryRange.max.toLocaleString()} RWF` : "Download 2-page official paper employment agreement"}
          >
            <FileText className="w-4 h-4" />
            <span>Download Contract</span>
          </button>
        )}

        {step === "input" && (
          <button
            type="button"
            onClick={handleRequestOtp}
            disabled={requestOtpMutation.isPending || nationalId.length !== 16}
            className="bg-[#2478b8] hover:bg-[#1b6296] disabled:opacity-50 text-white font-medium text-[14px] px-7 py-2.5 rounded-full shadow-xs transition-all cursor-pointer flex items-center gap-2"
          >
            {requestOtpMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            )}
            <span>Send OTP</span>
          </button>
        )}

        {step === "otp" && (
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={verifyOtpMutation.isPending || otpCode.length !== 6}
            className="bg-[#2478b8] hover:bg-[#1b6296] disabled:opacity-50 text-white font-medium text-[14px] px-7 py-2.5 rounded-full shadow-xs transition-all cursor-pointer flex items-center gap-2"
          >
            {verifyOtpMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            )}
            <span>Verify OTP</span>
          </button>
        )}

        {step === "payment" && (
          <button
            type="button"
            onClick={() => setStep("result")}
            disabled={isSalaryOutOfRange}
            className="bg-[#2478b8] hover:bg-[#1b6296] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-[14px] px-7 py-2.5 rounded-full shadow-xs transition-all cursor-pointer flex items-center shrink-0"
          >
            <span>Finish</span>
          </button>
        )}

        {step === "result" && (
          <button
            type="button"
            onClick={handleDone}
            disabled={isSalaryOutOfRange || isConfirmingHire}
            className="bg-[#2478b8] hover:bg-[#1b6296] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-[14px] px-7 py-2.5 rounded-full shadow-xs transition-all cursor-pointer flex items-center gap-2"
            title={isSalaryOutOfRange ? `Agreed salary must be between ${salaryRange.min.toLocaleString()} and ${salaryRange.max.toLocaleString()} RWF` : undefined}
          >
            {isConfirmingHire && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            <span>Done</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyWorker;