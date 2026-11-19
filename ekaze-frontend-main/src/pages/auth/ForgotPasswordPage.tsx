import { useState } from "react";
import { User, Key, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useForgotPassword, useResetPassword } from "@/hooks/useForgotPassword";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { AppStoreBadges } from "@/components/common/AppStoreBadges";
import { SixDigitPinInput } from "@/components/common/SixDigitPinInput";

type Step = "phone" | "reset" | "success";

const ForgotPasswordPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [loginInput, setLoginInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate: sendOtp, isPending: isSending } = useForgotPassword();
  const { mutate: resetPassword, isPending: isResetting } = useResetPassword();

  const normalisePhone = (raw: string): string => {
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("7") && digits.length === 9) digits = "0" + digits;
    return digits;
  };

  const passwordsMatch =
    password === passwordConfirmation && passwordConfirmation.length > 0;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const normalised = normalisePhone(loginInput);
    sendOtp(
      { login: normalised },
      {
        onSuccess: () => {
          setPhone(normalised);
          setStep("reset");
        },
      }
    );
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) return;

    resetPassword(
      {
        phone,
        otp_code: otpCode,
        password,
        password_confirmation: passwordConfirmation,
      },
      {
        onSuccess: () => setStep("success"),
      }
    );
  };

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-4 py-6">

        {/* Main Form Wrapper */}
        <div className="w-full bg-white text-left space-y-6">

          {/* Header Title */}
          <div className="text-center space-y-2 mb-2">
            <h1 className="text-2xl sm:text-[30px] font-normal text-slate-900 tracking-tight leading-tight">
              {step === "phone" ? "What's your email or phone?" : "Enter your code"}
            </h1>
            <p className="text-xs sm:text-sm font-normal text-slate-600 max-w-sm mx-auto">
              {step === "phone"
                ? "We'll send you a code to verify your account. You may need to check your spam email folder."
                : `We sent a one-time passcode to ${phone}. This code will expire in 10 minutes.`}
            </p>
          </div>

          {/* Step 1: Phone / Email Form */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login" className="block text-sm font-normal text-slate-800">
                  Email or Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="login"
                    name="login"
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Enter email or phone number"
                    className="w-full px-4 py-3.5 rounded-md border border-slate-300 focus:border-[#2478b8] focus:ring-1 focus:ring-[#2478b8] text-[15px] font-normal text-slate-900 placeholder:text-slate-400 bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-[#2478b8] hover:bg-[#1b6296] text-white font-bold text-base py-3.5 px-6 rounded-md transition-all cursor-pointer shadow-none border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: OTP & Reset Password Form */}
          {step === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              {/* 6-box PIN Code Field */}
              <div className="space-y-2">
                <SixDigitPinInput
                  value={otpCode}
                  onChange={(val) => setOtpCode(val)}
                />

                {/* Resend link matching clone design */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    disabled={isSending}
                    onClick={() => sendOtp({ login: phone }, { onSuccess: () => { } })}
                    className="text-[#2478b8] font-semibold text-sm hover:underline disabled:opacity-50 cursor-pointer border-0 bg-transparent p-0"
                  >
                    {isSending
                      ? "Sending..."
                      : phone.includes("@")
                        ? "Resend via email"
                        : "Resend via SMS"}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-normal text-slate-800">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 pr-10 py-3.5 rounded-md border border-slate-300 focus:border-[#2478b8] focus:ring-1 focus:ring-[#2478b8] text-[15px] font-normal text-slate-900 placeholder:text-slate-500 bg-white transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label htmlFor="password_confirmation" className="block text-sm font-normal text-slate-800">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showConfirm ? "text" : "password"}
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-4 pr-10 py-3.5 rounded-md border border-slate-300 focus:border-[#2478b8] focus:ring-1 focus:ring-[#2478b8] text-[15px] font-normal text-slate-900 placeholder:text-slate-500 bg-white transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordConfirmation.length > 0 && !passwordsMatch && (
                  <p className="text-xs font-semibold text-red-500 pt-0.5">
                    Passwords do not match
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isResetting || !passwordsMatch || otpCode.length < 6}
                  className="w-full bg-[#2478b8] hover:bg-[#1b6296] text-white font-bold text-base py-3.5 px-6 rounded-md transition-all cursor-pointer shadow-none border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? "Resetting Password..." : "Next"}
                </button>
              </div>

              {/* Sub Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Change number
                </button>
                <button
                  type="button"
                  disabled={isSending}
                  onClick={() => sendOtp({ login: phone }, { onSuccess: () => { } })}
                  className="text-xs font-bold text-[#2478b8] hover:underline disabled:opacity-50 cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success Screen */}
          {step === "success" && (
            <div className="space-y-5 py-2">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Password Reset Successfully!
                </h2>
                <p className="text-xs font-semibold text-slate-700">
                  You can now log in with your new password.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
                className="w-full bg-[#2478b8] hover:bg-[#1b6296] text-white font-bold text-base py-3.5 px-6 rounded-md transition-all cursor-pointer shadow-none border-0"
              >
                Log in Now
              </button>
            </div>
          )}

          {/* App Store Badges */}
          <AppStoreBadges />

          {/* Remember your password ? Log in */}
          <div className="pt-2 text-center text-xs sm:text-sm font-medium text-slate-700">
            Remember your password ?{" "}
            <a
              href="/auth/login"
              className="text-[#2478b8] font-bold hover:underline transition-all ml-1"
            >
              Log in
            </a>
          </div>

        </div>

      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;

