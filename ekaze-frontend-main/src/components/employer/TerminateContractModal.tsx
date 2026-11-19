import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Shield,
  Phone,
  FileText,
  Clock,
  User,
  MapPin,
  Star,
  X,
  Loader2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Building2,
  AlignLeft,
  ListOrdered,
  List,
  Link2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import type { ActiveWorker } from "@/types/active-workers.types";

interface TerminateContractModalProps {
  worker: ActiveWorker | null;
  isOpen: boolean;
  onClose: () => void;
  onTerminated?: (worker: ActiveWorker) => void;
}

const TerminateContractModal = ({
  worker,
  isOpen,
  onClose,
  onTerminated,
}: TerminateContractModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [step, setStep] = useState<"employer_id" | "worker_otp" | "feedback">("employer_id");
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  // Step 3 Feedback state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reason, setReason] = useState("Contract Term Completed");
  const [feedback, setFeedback] = useState("");
  const [paymentBlockedError, setPaymentBlockedError] = useState<string | null>(null);

  if (!isOpen || !worker) return null;

  const employerNid = user?.national_id || "1199000000000004";
  const employerName = user?.name || user?.company?.name || "Test Employer";
  const employerPhone = user?.phone || "250788000004";

  const workerName = worker.full_name || worker.name || "Test Worker";
  const workerNid = worker.national_id || "1199000000000005";
  const workerPhone = worker.phone || "250788000005";
  const agreedSalary = worker.current_employment?.agreed_salary
    ? `${Number(worker.current_employment.agreed_salary).toLocaleString()} RWF`
    : worker.salary_range || "75,000 RWF";

  const handleReset = () => {
    setStep("employer_id");
    setOtpCode("");
    setRating(5);
    setReason("Contract Term Completed");
    setFeedback("");
    setPaymentBlockedError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Step 1: Request Worker OTP for Termination
  const handleRequestWorkerOtp = async () => {
    setIsSendingOtp(true);
    setPaymentBlockedError(null);
    try {
      const res = await api.post("/employer/worker/termination/request-otp", {
        national_id: workerNid,
        worker_id: worker.id,
      });

      if (res.data?.success) {
        setStep("worker_otp");
        toast({
          title: "OTP Dispatched",
          description: `Authorization code sent via SMS to worker's phone (${res.data?.data?.phone || workerPhone})`,
        });
      }
    } catch (error: any) {
      console.error("Termination OTP error:", error);
      const msg = error?.response?.data?.message || "Failed to dispatch worker SMS OTP.";
      if (error?.response?.data?.is_payment_blocked) {
        setPaymentBlockedError(msg);
      }
      toast({
        title: "Request Blocked",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify Worker OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Validation Error",
        description: "Please enter the 6-digit OTP code provided by the worker.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await api.post("/employer/worker/termination/verify-otp", {
        national_id: workerNid,
        otp_code: otpCode.trim(),
      });

      if (res.data?.success) {
        setStep("feedback");
        toast({
          title: "Worker OTP Verified",
          description: "Worker authorization confirmed. Please provide feedback to complete termination.",
        });
      }
    } catch (error: any) {
      console.error("Verify termination OTP error:", error);
      toast({
        title: "Verification Failed",
        description: error?.response?.data?.message || "Invalid or expired OTP code.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Step 3: Complete Contract Termination
  const handleConfirmTermination = async () => {
    setIsTerminating(true);
    try {
      const res = await api.post("/employer/worker/termination/confirm", {
        national_id: workerNid,
        worker_id: worker.id,
        otp_code: otpCode.trim(),
        reason,
        feedback,
        rating,
      });

      if (res.data?.success) {
        toast({
          title: "Contract Terminated",
          description: `${workerName}'s contract has ended. Worker is now available and moved to History.`,
        });
        if (onTerminated) {
          onTerminated(worker);
        }
        handleClose();
      }
    } catch (error: any) {
      console.error("Termination confirm error:", error);
      toast({
        title: "Termination Failed",
        description: error?.response?.data?.message || "Failed to terminate contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTerminating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[460px] bg-white text-[#3c4043] rounded-[28px] p-6 font-['Roboto',_'Google_Sans',_sans-serif] tracking-[0.2px] text-left select-none relative shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
        {/* Top Header Bar: Drag Handle on Left + Close X on Right */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex flex-col gap-[3px] p-1 opacity-60 hover:opacity-100 transition-opacity cursor-grab">
            <span className="w-4 h-[2px] bg-[#444746] rounded-full" />
            <span className="w-4 h-[2px] bg-[#444746] rounded-full" />
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full text-[#444746] hover:text-[#1f1f1f] hover:bg-[#1f1f1f]/[0.08] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Main Title Input (Google Calendar style with blue / red underline) */}
        <div className="pt-1 pb-3">
          {step === "employer_id" && (
            <input
              type="text"
              readOnly
              value={employerNid}
              className="w-full bg-transparent text-[22px] font-normal font-mono tracking-wide text-[#1f1f1f] outline-none pb-1.5 border-b-2 border-[#2478b8] cursor-default select-text transition-colors"
            />
          )}

          {step === "worker_otp" && (
            <input
              type="text"
              placeholder="Enter 6-digit worker OTP"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              autoFocus
              className="w-full bg-transparent text-[22px] font-mono tracking-widest text-[#1f1f1f] placeholder:text-slate-400 outline-none pb-1.5 border-b-2 border-[#2478b8] transition-colors text-left"
            />
          )}

          {step === "feedback" && (
            <div className="w-full text-[22px] font-normal text-[#1f1f1f] pb-1.5 border-b-2 border-[#2478b8]">
              <span>{workerName}</span>
            </div>
          )}
        </div>

        {/* Pills Row (Google form pill tabs style) */}
        <div className="flex items-center gap-2 pt-2 pb-5 text-[14px] font-medium">
          <span
            className={`px-3.5 py-1.5 rounded-lg select-none cursor-pointer transition-colors ${step === "employer_id"
                ? "bg-[#c2e7ff] text-[#001d35] font-medium"
                : "text-[#444746] hover:bg-slate-100"
              }`}
          >
            Employer ID
          </span>

          <span
            className={`px-3.5 py-1.5 rounded-lg select-none cursor-pointer transition-colors ${step === "worker_otp"
                ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                : "text-[#444746] hover:bg-slate-100"
              }`}
          >
            Worker OTP
          </span>

          <span
            className={`px-3.5 py-1.5 rounded-lg select-none cursor-pointer transition-colors ${step === "feedback"
                ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                : "text-[#444746] hover:bg-slate-100"
              }`}
          >
            Termination
          </span>
        </div>

        {/* STEP 1: Employer ID Confirmation */}
        {step === "employer_id" && (
          <div className="space-y-4 pt-1 text-[14px] text-[#3c4043]">
            {/* Row 1: Employer Identification */}
            <div className="flex items-start gap-4">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                1
              </span>
              <div>
                <div className="text-[14px] font-normal text-[#1f1f1f]">
                  {employerName}
                </div>
                <div className="text-[12px] text-[#444746] mt-0.5">
                  Registered Employer Identity
                </div>
              </div>
            </div>

            {/* Row 2: Target Worker being terminated */}
            <div className="flex items-start gap-4">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                2
              </span>
              <div>
                <div className="text-[14px] font-normal text-[#1f1f1f]">
                  Worker: {workerName}
                </div>
                <div className="text-[12px] text-[#444746] mt-0.5">
                  National ID: <span className="font-mono">{workerNid}</span>
                </div>
              </div>
            </div>

            {/* Row 3: Notice */}
            <div className="flex items-start gap-4">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                3
              </span>
              <div>
                <div className="text-[13px] text-[#444746] leading-relaxed">
                  To initiate contract termination, confirm your Employer National ID. An SMS authorization code will be sent to the worker's phone to confirm the termination.
                </div>
              </div>
            </div>

            {/* Conflict Protection Unpaid Months Alert */}
            {paymentBlockedError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex gap-3 text-red-800 text-xs">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-red-900">Conflict Protection: Past Salary Unpaid</p>
                  <p className="text-red-700">{paymentBlockedError}</p>
                  <p className="text-red-600 text-[11px] font-medium">
                    All completed previous months must be paid to the worker before this contract can be terminated. Current month can be negotiated.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Worker SMS OTP Confirmation */}
        {step === "worker_otp" && (
          <div className="space-y-4 pt-1 text-[14px] text-[#3c4043]">
            {/* Row 1: OTP Expiry */}
            <div className="flex items-start gap-4">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                1
              </span>
              <div>
                <div className="text-[14px] font-normal text-[#1f1f1f]">
                  6-Digit Termination Code Sent
                </div>
                <div className="text-[12px] text-[#444746] mt-0.5">
                  Code sent to worker's phone ({workerPhone}) • Single use
                </div>
              </div>
            </div>

            {/* Row 2: Target Worker */}
            <div className="flex items-start gap-4">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                2
              </span>
              <div>
                <div className="text-[14px] font-normal text-[#1f1f1f]">
                  {workerName}
                </div>
                <div className="text-[12px] text-[#444746] mt-0.5 font-mono">
                  {workerNid}
                </div>
              </div>
            </div>

            {/* Row 3: Resend Helper */}
            <div className="flex items-start gap-4">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                3
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#444746]">Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleRequestWorkerOtp}
                  disabled={isSendingOtp}
                  className="text-[14px] font-semibold text-[#2478b8] hover:underline cursor-pointer"
                >
                  {isSendingOtp ? "Resending..." : "Resend OTP"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Feedback and Termination */}
        {step === "feedback" && (
          <div className="space-y-4 pt-1 text-[14px] text-[#3c4043]">
            {/* Row 1: Contract Remuneration */}
            <div className="flex items-start gap-4">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                1
              </span>
              <div>
                <div className="text-[14px] font-normal text-[#1f1f1f]">
                  Contract Remuneration: <span className="font-mono font-medium">{agreedSalary} Net</span>
                </div>
                <div className="text-[12px] text-[#444746] mt-0.5">
                  Final remuneration settlement upon termination
                </div>
              </div>
            </div>

            {/* Row 2: Worker Performance Evaluation */}
            <div className="flex items-start gap-4">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                2
              </span>
              <div className="w-full">
                <div className="text-[14px] font-normal text-[#1f1f1f] mb-1">
                  Worker Performance Evaluation
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 text-slate-300 hover:text-yellow-400 focus:outline-none transition-colors"
                    >
                      <Star
                        className={`w-5 h-5 ${(hoverRating || rating) >= star
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-slate-300"
                          }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-[#444746] font-medium ml-2">
                    {rating === 5 ? "Exceptional" : rating === 4 ? "Good" : rating === 3 ? "Satisfactory" : "Needs Improvement"}
                  </span>
                </div>
              </div>
            </div>

            {/* Row 3: Termination Reason */}
            <div className="flex items-start gap-4">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                3
              </span>
              <div className="w-full">
                <div className="text-[14px] font-normal text-[#1f1f1f] mb-1">
                  Termination Reason
                </div>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#2478b8] bg-white cursor-pointer text-slate-700"
                >
                  <option value="Contract Term Completed">Contract Term Completed</option>
                  <option value="Mutual Agreement">Mutual Agreement between Parties</option>
                  <option value="Performance / Quality">Performance / Quality of Work</option>
                  <option value="Relocation / Change of Residence">Relocation / Change of Residence</option>
                  <option value="Other Statutory Reason">Other Statutory Reason</option>
                </select>
              </div>
            </div>

            {/* Row 4: Description / Feedback */}
            <div className="flex items-start gap-4">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                4
              </span>
              <div className="w-full bg-[#eef2f6] rounded-t-md border-b-2 border-[#2478b8] px-3 pt-2.5 pb-2">
                {/* Formatting Toolbar */}
                <div className="flex items-center gap-2 pb-1.5 text-slate-700">
                  <button type="button" className="font-bold text-[13px] px-1 hover:text-black">
                    B
                  </button>
                  <button type="button" className="italic font-serif text-[13px] px-1 hover:text-black">
                    I
                  </button>
                  <button type="button" className="underline text-[13px] px-1 hover:text-black">
                    U
                  </button>
                  <span className="h-3.5 w-[1px] bg-slate-300 mx-0.5" />
                  <button type="button" className="p-0.5 hover:text-black">
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-0.5 hover:text-black">
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <span className="h-3.5 w-[1px] bg-slate-300 mx-0.5" />
                  <button type="button" className="p-0.5 hover:text-black">
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-0.5 hover:text-black text-xs font-semibold">
                    <span className="relative">T<span className="text-[10px] absolute -bottom-1 -right-1">x</span></span>
                  </button>
                </div>
                {/* Description Textarea */}
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Add description"
                  rows={2}
                  className="w-full bg-transparent text-[13px] text-slate-800 placeholder:text-slate-500 outline-none resize-none pt-0.5 leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions: Cancel/Back on left, Action pill on right */}
        <div className="flex items-center justify-end gap-3 pt-6 pb-1">
          {step === "employer_id" && (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="text-[14px] font-medium text-[#2478b8] hover:bg-blue-50/60 px-4 py-2 rounded-full cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestWorkerOtp}
                disabled={isSendingOtp}
                className="bg-[#2478b8] hover:bg-[#1b6296] disabled:opacity-50 text-white font-medium text-[14px] px-7 py-2.5 rounded-full shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                {isSendingOtp && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                <span>Request Worker OTP</span>
              </button>
            </>
          )}

          {step === "worker_otp" && (
            <>
              <button
                type="button"
                onClick={() => setStep("employer_id")}
                className="text-[14px] font-medium text-[#2478b8] hover:bg-blue-50/60 px-4 py-2 rounded-full cursor-pointer transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp || otpCode.length !== 6}
                className="bg-[#2478b8] hover:bg-[#1b6296] disabled:opacity-50 text-white font-medium text-[14px] px-7 py-2.5 rounded-full shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                {isVerifyingOtp && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                <span>Verify OTP</span>
              </button>
            </>
          )}

          {step === "feedback" && (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="text-[14px] font-medium text-[#2478b8] hover:bg-blue-50/60 px-4 py-2 rounded-full cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTermination}
                disabled={isTerminating}
                className="bg-[#2478b8] hover:bg-[#1b6296] disabled:opacity-50 text-white font-medium text-[14px] px-7 py-2.5 rounded-full shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                {isTerminating && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                <span>Terminate Contract</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminateContractModal;
