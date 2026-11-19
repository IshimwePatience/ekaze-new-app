import { useState, useEffect } from "react";
import {
  X,
  User,
  Building2,
  Shield,
  Clock,
  RotateCcw,
  Star,
  AlertTriangle,
  Loader2,
  KeyRound,
  FileText,
  CheckCircle2,
  AlignLeft,
  ListOrdered,
  List,
  Link2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface WorkerTerminateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  employment: any;
  onTerminated?: () => void;
}

type Step = "worker_id" | "employer_otp" | "feedback";

const WorkerTerminateContractModal = ({
  isOpen,
  onClose,
  employment,
  onTerminated,
}: WorkerTerminateContractModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("worker_id");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  const [otpCode, setOtpCode] = useState("");
  const [reason, setReason] = useState("Contract Term Completed");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [paymentBlockedError, setPaymentBlockedError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep("worker_id");
      setOtpCode("");
      setReason("Contract Term Completed");
      setFeedback("");
      setRating(5);
      setHoverRating(0);
      setPaymentBlockedError(null);
    }
  }, [isOpen]);

  if (!isOpen || !employment) return null;

  const employer = employment.employer || {};
  const employerName = employer.name || "Test Employer";
  const employerPhone = employer.phone || "0788000004";
  const salary = employment.monthly_salary || employment.agreed_salary || 100000;
  const agreedSalary = `${Number(salary).toLocaleString()} RWF`;

  const workerNid = user?.national_id || user?.id_number || "1199000000000005";
  const workerName = user?.name || "Test Worker";

  const handleClose = () => {
    setStep("worker_id");
    setOtpCode("");
    setPaymentBlockedError(null);
    onClose();
  };

  // Step 1: Request Employer OTP
  const handleRequestEmployerOtp = async () => {
    setIsSendingOtp(true);
    setPaymentBlockedError(null);
    try {
      const res = await api.post("/worker/employment/termination/request-otp", {
        employment_id: employment.id,
      });

      if (res.data?.success) {
        setMaskedPhone(res.data.data?.employer_phone || employerPhone);
        setStep("employer_otp");

        toast({
          title: "Authorization OTP Sent",
          description: `An OTP code has been sent via SMS to your employer (${res.data.data?.employer_phone || employerPhone}).`,
        });
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to request employer authorization OTP.";
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

  // Step 2: Verify Employer OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      toast({
        title: "Validation Error",
        description: "Please enter the 6-digit OTP code provided by your employer.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await api.post("/worker/employment/termination/verify-otp", {
        employment_id: employment.id,
        otp_code: otpCode.trim(),
      });

      if (res.data?.success) {
        setStep("feedback");
        toast({
          title: "Employer OTP Verified",
          description: "Employer authorization confirmed. Please provide feedback to complete termination.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error?.response?.data?.message || "Invalid or expired OTP code. Ask your employer for the code.",
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
      const res = await api.post("/worker/employment/termination/confirm", {
        employment_id: employment.id,
        otp_code: otpCode.trim(),
        reason,
        feedback,
        rating,
      });

      if (res.data?.success) {
        toast({
          title: "Contract Terminated",
          description: "Your contract has been officially ended. It has been archived into your History.",
        });
        if (onTerminated) {
          onTerminated();
        }
        handleClose();
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to complete contract termination.";
      toast({
        title: "Termination Failed",
        description: msg,
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
          {step === "worker_id" && (
            <input
              type="text"
              readOnly
              value={workerNid}
              className="w-full bg-transparent text-[22px] font-normal font-mono tracking-wide text-[#1f1f1f] outline-none pb-1.5 border-b-2 border-[#2478b8] cursor-default select-text transition-colors"
            />
          )}

          {step === "employer_otp" && (
            <input
              type="text"
              placeholder="Enter 6-digit employer OTP"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              autoFocus
              className="w-full bg-transparent text-[22px] font-mono tracking-widest text-[#1f1f1f] placeholder:text-slate-400 outline-none pb-1.5 border-b-2 border-[#2478b8] transition-colors text-left"
            />
          )}

          {step === "feedback" && (
            <div className="w-full text-[22px] font-normal text-[#1f1f1f] pb-1.5 border-b-2 border-[#2478b8]">
              <span>{employerName}</span>
            </div>
          )}
        </div>

        {/* Pills Row (Google form pill tabs style) */}
        <div className="flex items-center gap-2 pt-2 pb-5 text-[14px] font-medium">
          <span
            className={`px-3.5 py-1.5 rounded-lg select-none cursor-pointer transition-colors ${step === "worker_id"
                ? "bg-[#c2e7ff] text-[#001d35] font-medium"
                : "text-[#444746] hover:bg-slate-100"
              }`}
          >
            Worker ID
          </span>

          <span
            className={`px-3.5 py-1.5 rounded-lg select-none cursor-pointer transition-colors ${step === "employer_otp"
                ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                : "text-[#444746] hover:bg-slate-100"
              }`}
          >
            Employer OTP
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

        {/* STEP 1: Worker ID Confirmation */}
        {step === "worker_id" && (
          <div className="space-y-4 pt-1 text-[14px] text-[#3c4043]">
            {/* Row 1: Worker Identification */}
            <div className="flex items-start gap-4">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                1
              </span>
              <div>
                <div className="text-[14px] font-normal text-[#1f1f1f]">
                  {workerName}
                </div>
                <div className="text-[12px] text-[#444746] mt-0.5">
                  Registered Worker Identity
                </div>
              </div>
            </div>

            {/* Row 2: Target Employer */}
            <div className="flex items-start gap-4">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                2
              </span>
              <div>
                <div className="text-[14px] font-normal text-[#1f1f1f]">
                  Employer: {employerName}
                </div>
                <div className="text-[12px] text-[#444746] mt-0.5 font-mono">
                  Phone: {employerPhone}
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
                  To initiate contract termination, confirm your Worker National ID. An SMS authorization code will be sent to the employer's phone to approve the contract release.
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

        {/* STEP 2: Employer SMS OTP Confirmation */}
        {step === "employer_otp" && (
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
                  Code sent to employer's phone ({maskedPhone || employerPhone}) • Single use
                </div>
              </div>
            </div>

            {/* Row 2: Target Employer */}
            <div className="flex items-start gap-4">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                2
              </span>
              <div>
                <div className="text-[14px] font-normal text-[#1f1f1f]">
                  {employerName}
                </div>
                <div className="text-[12px] text-[#444746] mt-0.5 font-mono">
                  {employerPhone}
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
                  onClick={handleRequestEmployerOtp}
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
                  Contract Remuneration: <span className="font-mono font-medium">{agreedSalary} / month</span>
                </div>
                <div className="text-[12px] text-[#444746] mt-0.5">
                  Final remuneration settlement upon termination
                </div>
              </div>
            </div>

            {/* Row 2: Employer Experience Evaluation */}
            <div className="flex items-start gap-4">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                2
              </span>
              <div className="w-full">
                <div className="text-[14px] font-normal text-[#1f1f1f] mb-1">
                  Employer Experience Evaluation
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
                  <option value="Better Job Offer / New Opportunity">Better Job Offer / New Opportunity</option>
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
          {step === "worker_id" && (
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
                onClick={handleRequestEmployerOtp}
                disabled={isSendingOtp}
                className="bg-[#2478b8] hover:bg-[#1b6296] disabled:opacity-50 text-white font-medium text-[14px] px-7 py-2.5 rounded-full shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                {isSendingOtp && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                <span>Request Employer OTP</span>
              </button>
            </>
          )}

          {step === "employer_otp" && (
            <>
              <button
                type="button"
                onClick={() => setStep("worker_id")}
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

export default WorkerTerminateContractModal;
