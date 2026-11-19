import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Eye,
  EyeOff,
  Check,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useLogin, useGoogleLogin, safeSetAuthStorage } from "@/hooks/useAuth";
import { useForgotPassword, useResetPassword } from "@/hooks/useForgotPassword";
import { mfaService } from "@/api/mfaService";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import logo from "@/assets/reallogo.png";
import { ROUTES } from "@/constants/routes";
import { SixDigitPinInput } from "@/components/common/SixDigitPinInput";

interface LoginDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
}

type ViewMode = "login" | "mfa" | "forgot_phone" | "forgot_reset";

export const LoginDropdown: React.FC<LoginDropdownProps> = ({ isOpen, onClose, onOpenRegister }) => {
  const { language } = useLanguage();
  const isRw = language === "kin";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("login");

  // Login form state
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // MFA Challenge State
  const [mfaChallenge, setMfaChallenge] = useState<{
    temp_token: string;
    mfa_method: "authenticator" | "sms" | "email";
    user?: any;
  } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
  const [isResendingMfa, setIsResendingMfa] = useState(false);

  // Forgot password state
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const { mutate: login, isPending: isLoggingIn } = useLogin();
  const { mutate: googleLoginMutate, isPending: isGooglePending } = useGoogleLogin();
  const { mutate: sendForgotOtp, isPending: isSendingForgotOtp } = useForgotPassword();
  const { mutate: resetPassword, isPending: isResettingPassword } = useResetPassword();

  const handleGoogleClick = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const workerId =
      searchParams.get("workerId") ||
      searchParams.get("autoOpenWorkerId") ||
      sessionStorage.getItem("auto_open_worker_id");
    if (workerId) {
      sessionStorage.setItem("auto_open_worker_id", workerId);
    }
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "851412910623-p7ov04uca9tqtg20f3hg17i6upqjvkua.apps.googleusercontent.com";
    const redirectUri = window.location.origin + "/auth/login";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=email%20profile&prompt=select_account`;

    window.location.href = googleAuthUrl;
  };

  // Reset dropdown fields when opened, while preserving pending MFA challenge
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = sessionStorage.getItem("pending_mfa_challenge");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.temp_token) {
            setMfaChallenge(parsed);
            setViewMode("mfa");
            return;
          }
        }
      } catch (e) { }

      if (!mfaChallenge) {
        setViewMode("login");
      }
      setLoginError("");
      setMfaError("");
      setForgotError("");
      setMfaCode("");
    }
  }, [isOpen]);

  // Click outside to close listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleRoleNavigation = (userObj: any) => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlWorkerId =
      searchParams.get("workerId") ||
      searchParams.get("autoOpenWorkerId") ||
      searchParams.get("worker") ||
      sessionStorage.getItem("auto_open_worker_id");

    const roleRoutes: Record<string, string> = {
      admin: ROUTES.ADMIN_DASHBOARD,
      employer: ROUTES.EMPLOYER_DASHBOARD,
      worker: ROUTES.WORKER_DASHBOARD,
      police: ROUTES.POLICE_DASHBOARD,
      company: ROUTES.COMPANY_DASHBOARD,
      supervisor: ROUTES.SUPERVISOR_DASHBOARD,
    };

    if (urlWorkerId && userObj?.role === "employer") {
      sessionStorage.setItem("auto_open_worker_id", urlWorkerId);
      navigate(`/employer?workerId=${encodeURIComponent(urlWorkerId)}`, { replace: true });
      return;
    }

    onClose();
    navigate(roleRoutes[userObj?.role] || ROUTES.HOME, { replace: true });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginInput.trim() || !password) {
      setLoginError(isRw ? "Injiza Member-ID cyangwa imeri n'ijambobanga" : "Please enter your Member-ID/phone and password");
      return;
    }

    login(
      { login: loginInput.trim(), password },
      {
        onSuccess: (data: any) => {
          if (data?.requires_mfa && data?.temp_token) {
            const challenge = {
              temp_token: data.temp_token,
              mfa_method: data.mfa_method || "authenticator",
              user: data.user,
            };
            try {
              sessionStorage.setItem("pending_mfa_challenge", JSON.stringify(challenge));
            } catch (e) { }
            setMfaChallenge(challenge);
            setViewMode("mfa");
            setMfaCode("");
            setMfaError("");
          } else {
            sessionStorage.removeItem("pending_mfa_challenge");
            toast.success(isRw ? "Kwinjira byagenze neza!" : "Login successful!");
            handleRoleNavigation(data?.user);
          }
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            (isRw ? "Nomero cyangwa ijambobanga ntabwo bihuye" : "Invalid credentials");
          setLoginError(msg);
        },
      }
    );
  };

  const handleVerifyMfa = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mfaChallenge || mfaCode.length !== 6) return;

    setIsVerifyingMfa(true);
    setMfaError("");

    try {
      const res = await mfaService.verifyLoginMfa(mfaChallenge.temp_token, mfaCode);
      const token = res.token || res.data?.token;
      const verifiedUser = res.user || res.data?.user;

      if (!token || !verifiedUser) {
        setMfaError(isRw ? "Gusuzuma byanze, ongera ugerageze." : "Verification token missing.");
        return;
      }

      sessionStorage.removeItem("pending_mfa_challenge");
      safeSetAuthStorage(token, verifiedUser);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success(isRw ? "MFA yemejwe neza!" : "Two-factor verification successful!");
      handleRoleNavigation(verifiedUser);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        (isRw ? "Kode ntabwo ari yo. Ongera ugerageze." : "Invalid 6-digit verification code.");
      setMfaError(errorMsg);
    } finally {
      setIsVerifyingMfa(false);
    }
  };

  const handleResendMfa = async () => {
    if (!mfaChallenge?.temp_token) return;
    setIsResendingMfa(true);
    setMfaError("");
    try {
      await mfaService.resendLoginMfa(mfaChallenge.temp_token);
      toast.success(isRw ? "Kode nshya yoherejwe!" : "New verification code sent!");
    } catch (err: any) {
      setMfaError(err?.response?.data?.message || (isRw ? "Kwohereza byanze." : "Failed to resend code."));
    } finally {
      setIsResendingMfa(false);
    }
  };

  const handleForgotPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    const trimmed = forgotPhone.trim();

    if (!trimmed) {
      setForgotError(isRw ? "Injiza imeri cyangwa numero ya telefoni" : "Enter your email or phone number");
      return;
    }

    let loginVal = trimmed;
    if (!trimmed.includes("@")) {
      let phoneNum = trimmed.replace(/\D/g, "");
      if (phoneNum.startsWith("7") && phoneNum.length === 9) phoneNum = "0" + phoneNum;
      loginVal = phoneNum;
    }

    sendForgotOtp(
      { login: loginVal },
      {
        onSuccess: () => {
          setForgotPhone(loginVal);
          setViewMode("forgot_reset");
          toast.success(
            loginVal.includes("@")
              ? (isRw ? "Kode yoherejwe kuri imeri" : "Reset code sent to your email")
              : (isRw ? "Kode ya OTP yoherejwe kuri telefoni" : "Reset code sent to your phone")
          );
        },
        onError: (err: any) => {
          setForgotError(err?.response?.data?.message || (isRw ? "Konti ntabwo ibonetse" : "Account not found"));
        },
      }
    );
  };

  const handleForgotResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    if (!forgotOtp || forgotOtp.length !== 6) {
      setForgotError(isRw ? "Injiza kode ya OTP y'imibare 6" : "Enter the 6-digit OTP code");
      return;
    }

    if (newPassword.length < 6) {
      setForgotError(isRw ? "Ijambobanga rigomba kugira byibuze inyuguti 6" : "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError(isRw ? "Amagambobanga ntabwo ahuye" : "Passwords do not match");
      return;
    }

    resetPassword(
      {
        phone: forgotPhone,
        otp_code: forgotOtp,
        password: newPassword,
        password_confirmation: confirmPassword,
      },
      {
        onSuccess: () => {
          toast.success(isRw ? "Ijambobanga ryahinduwe neza! Injira ubu." : "Password reset successfully! Please login.");
          setViewMode("login");
          setPassword("");
        },
        onError: (err: any) => {
          setForgotError(err?.response?.data?.message || (isRw ? "Guhindura byanze" : "Reset failed"));
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Semi-transparent backdrop for mobile/desktop focus */}
      <div
        className="fixed inset-0 z-40 bg-black/10 md:bg-transparent"
        onClick={onClose}
      />

      {/* ══════════════════════════════════════════════════════════════════════════
          DROPDOWN CARD: EXACT 1-TO-1 CLONE OF RWANDAIR DESIGN
      ══════════════════════════════════════════════════════════════════════════ */}
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 z-50 w-[95vw] sm:w-[720px] max-w-[95vw] bg-white text-[#222222] rounded-lg shadow-2xl border border-slate-200 overflow-hidden text-left"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 p-8 sm:p-9 pb-6">

          {/* ──────────────────────────────────────────────────────────────────
              LEFT COLUMN: LOGIN FORM / MFA / FORGOT PASSWORD
          ────────────────────────────────────────────────────────────────── */}
          <div className="md:pr-8 pb-6 md:pb-0 flex flex-col justify-between">

            {/* VIEW 1: EXACT RWANDAIR LOGIN FORM */}
            {viewMode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <h2 className="text-3xl font-bold text-[#222222] tracking-tight mb-4">
                  {isRw ? "Injira" : "Login"}
                </h2>

                {/* Continue with Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={isGooglePending}
                  className="w-full h-11 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-[4px] transition-colors cursor-pointer flex items-center justify-center gap-2.5 shadow-2xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {isGooglePending
                      ? (isRw ? "Birimo kwinjira..." : "Signing in...")
                      : (isRw ? "Injira na Google" : "Continue with Google")}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-2.5 text-xs text-slate-400 font-medium lowercase">
                    {isRw ? "cyangwa" : "or"}
                  </span>
                  <div className="border-t border-slate-200 w-full" />
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-[4px] bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Email or Phone Input */}
                <div>
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder={isRw ? "Injiza imeri cyangwa numero ya telefoni" : "Enter your email or phone number"}
                    style={{ fontSize: "17px", fontFamily: "Arial, Helvetica, sans-serif", lineHeight: "24px", height: "50px" }}
                    className="login-dropdown-input w-full px-3.5 rounded-[4px] border border-[#a5b2c0] focus:border-[#005a9c] focus:outline-none transition-colors bg-white"
                    autoFocus
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRw ? "Ijambobanga" : "Password"}
                    style={{ fontSize: "17px", fontFamily: "Arial, Helvetica, sans-serif", lineHeight: "24px", height: "50px" }}
                    className="login-dropdown-input w-full px-3.5 pr-11 rounded-[4px] border border-[#a5b2c0] focus:border-[#005a9c] focus:outline-none transition-colors bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#556980] hover:text-slate-800 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Solid Dark Blue Login Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full h-11 bg-[#005a9c] hover:bg-[#004780] text-white font-semibold text-base rounded-[6px] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isRw ? "Birimo kwinjira..." : "Login"}</span>
                      </>
                    ) : (
                      <span>{isRw ? "Injira" : "Login"}</span>
                    )}
                  </button>
                </div>

                {/* Underlined Blue Forgot Password Link */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("forgot_phone");
                      setForgotError("");
                    }}
                    className="text-xs font-semibold text-[#005a9c] hover:underline cursor-pointer"
                  >
                    {isRw ? "Wibagiwe ijambobanga?" : "Forgot Password"}
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 2: MFA CHALLENGE (INSIDE DROPDOWN) */}
            {viewMode === "mfa" && (
              <form onSubmit={handleVerifyMfa} className="space-y-4">
                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-[#222222] tracking-tight">
                    {mfaChallenge?.mfa_method === 'email'
                      ? (isRw ? "Kwemeza Imeri yawe" : "Email Verification")
                      : mfaChallenge?.mfa_method === 'sms'
                        ? (isRw ? "Kwemeza Nimero ya Telefoni" : "Phone Verification")
                        : (isRw ? "Umutekano wa MFA" : "Security Verification")}
                  </h2>
                </div>

                <p className="text-xs text-slate-600">
                  {mfaChallenge?.mfa_method === 'authenticator'
                    ? (isRw
                      ? "Injiza kode y'imibare 6 yo muri Google Authenticator app yawe."
                      : "Enter the 6-digit code from your Google Authenticator app.")
                    : mfaChallenge?.mfa_method === 'email'
                      ? (isRw
                        ? `Twakwoherereje kode y'imibare 6 kuri imeri: ${mfaChallenge?.user?.email || 'imeri yawe'}. Injiza iyi kode kugira ngo wemeze imeri yawe.`
                        : `A 6-digit verification code has been sent to your email: ${mfaChallenge?.user?.email || 'your email'}. Enter it below to verify and complete login.`)
                      : (isRw
                        ? `Twakwoherereje kode y'imibare 6 kuri telefoni: ${mfaChallenge?.user?.phone || 'telefoni yawe'}. Injiza iyi kode kugira ngo wemeze nimero yawe.`
                        : `A 6-digit verification code has been sent to your phone: ${mfaChallenge?.user?.phone || 'your phone'}. Enter it below to verify and complete login.`)}
                </p>

                {mfaError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-[4px] bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{mfaError}</span>
                  </div>
                )}

                <div className="py-2 flex justify-center">
                  <SixDigitPinInput
                    value={mfaCode}
                    onChange={(val) => {
                      setMfaCode(val);
                      if (val.length === 6) {
                        setTimeout(() => handleVerifyMfa(), 200);
                      }
                    }}
                    hasError={!!mfaError}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingMfa || mfaCode.length !== 6}
                  className="w-full h-11 bg-[#005a9c] hover:bg-[#004780] disabled:opacity-50 text-white font-semibold text-base rounded-[6px] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  {isVerifyingMfa ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isRw ? "Birimo gusuzumwa..." : "Verifying..."}</span>
                    </>
                  ) : (
                    <span>{isRw ? "Emeza & Injira" : "Verify & Login"}</span>
                  )}
                </button>

                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem("pending_mfa_challenge");
                      setMfaChallenge(null);
                      setViewMode("login");
                      setMfaCode("");
                      setMfaError("");
                    }}
                    className="text-xs font-semibold text-[#005a9c] hover:underline cursor-pointer"
                  >
                    {isRw ? "Subira ku Kwinjira" : "Back to Login"}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendMfa}
                    disabled={isResendingMfa}
                    className="text-xs font-semibold text-[#005a9c] hover:underline cursor-pointer"
                  >
                    {isResendingMfa ? "Sending..." : (isRw ? "Ongera wohereze" : "Resend Code")}
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 3: FORGOT PASSWORD (PHONE INPUT) */}
            {viewMode === "forgot_phone" && (
              <form onSubmit={handleForgotPhoneSubmit} className="space-y-4">
                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-[#222222] tracking-tight">
                    {isRw ? "Hindura Ijambobanga" : "Reset Password"}
                  </h2>
                </div>

                <p className="text-xs text-slate-600">
                  {isRw
                    ? "Injiza imeri cyangwa numero ya telefoni yakoreshejwe wiyandikisha."
                    : "Enter your registered email or phone number to receive a reset code."}
                </p>

                {forgotError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-[4px] bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    placeholder={isRw ? "Injiza imeri cyangwa numero ya telefoni" : "Enter your email or phone number"}
                    style={{ fontSize: "17px", fontFamily: "Arial, Helvetica, sans-serif", lineHeight: "24px", height: "50px" }}
                    className="login-dropdown-input w-full px-3.5 rounded-[4px] border border-[#a5b2c0] focus:border-[#005a9c] focus:outline-none transition-colors bg-white"
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingForgotOtp}
                  className="w-full h-11 bg-[#005a9c] hover:bg-[#004780] text-white font-semibold text-base rounded-[6px] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  {isSendingForgotOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isRw ? "Birimo koherezwa..." : "Sending..."}</span>
                    </>
                  ) : (
                    <span>{isRw ? "Ohereza Kode" : "Send Reset Code"}</span>
                  )}
                </button>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("login")}
                    className="text-xs font-semibold text-[#005a9c] hover:underline cursor-pointer"
                  >
                    {isRw ? "Subira ku Kwinjira" : "Back to Login"}
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 4: FORGOT PASSWORD (OTP + NEW PASSWORD) */}
            {viewMode === "forgot_reset" && (
              <form onSubmit={handleForgotResetSubmit} className="space-y-3.5">
                <div className="mb-1">
                  <h2 className="text-xl font-bold text-[#222222] tracking-tight">
                    {isRw ? "Ijambobanga Rishya" : "Set New Password"}
                  </h2>
                </div>

                {forgotError && (
                  <div className="flex items-center gap-2 p-2 rounded-[4px] bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-Digit SMS Code"
                    style={{ fontSize: "17px", fontFamily: "Arial, Helvetica, sans-serif", lineHeight: "24px", height: "50px" }}
                    className="login-dropdown-input w-full px-3.5 rounded-[4px] border border-[#a5b2c0] focus:border-[#005a9c] focus:outline-none transition-colors tracking-widest font-mono bg-white"
                    autoFocus
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isRw ? "Ijambobanga Rishya" : "New Password"}
                    style={{ fontSize: "17px", fontFamily: "Arial, Helvetica, sans-serif", lineHeight: "24px", height: "50px" }}
                    className="login-dropdown-input w-full px-3.5 pr-11 rounded-[4px] border border-[#a5b2c0] focus:border-[#005a9c] focus:outline-none transition-colors bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3.5 text-[#556980] hover:text-slate-800 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isRw ? "Emeza Ijambobanga" : "Confirm Password"}
                    style={{ fontSize: "17px", fontFamily: "Arial, Helvetica, sans-serif", lineHeight: "24px", height: "50px" }}
                    className="login-dropdown-input w-full px-3.5 rounded-[4px] border border-[#a5b2c0] focus:border-[#005a9c] focus:outline-none transition-colors bg-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="w-full h-10 bg-[#005a9c] hover:bg-[#004780] text-white font-semibold text-sm rounded-[6px] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  {isResettingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isRw ? "Birimo guhindurwa..." : "Saving..."}</span>
                    </>
                  ) : (
                    <span>{isRw ? "Emeza Ijambobanga" : "Reset & Login"}</span>
                  )}
                </button>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("forgot_phone")}
                    className="text-xs font-semibold text-[#005a9c] hover:underline cursor-pointer"
                  >
                    {isRw ? "Subira Inyuma" : "Back"}
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* ──────────────────────────────────────────────────────────────────
              RIGHT COLUMN: EXACT RWANDAIR "REGISTER TO DREAMMILES AND ENJOY:"
          ────────────────────────────────────────────────────────────────── */}
          <div className="md:pl-8 pt-6 md:pt-0 relative flex flex-col justify-between">

            {/* Top Close '✕' Button (Thin crisp black cross like in screenshot) */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-0 right-0 text-slate-700 hover:text-black p-1 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>

            <div>
              {/* Header: Welcome to Ekaze */}
              <h3 className="text-[26px] font-bold text-[#222222] leading-tight mb-6 pr-8">
                {isRw ? (
                  <>
                    Ikaze kuri <br />
                    Ekaze:
                  </>
                ) : (
                  <>
                    Welcome to <br />
                    Ekaze:
                  </>
                )}
              </h3>

              {/* Exact Checkmark Bullet Items with blue tick ✔ (no circle) */}
              <ul className="space-y-3.5 mb-7">
                <li className="flex items-center gap-3 text-[#333333] text-[15px] font-normal">
                  <Check className="w-5 h-5 text-[#005a9c] stroke-[3.5] shrink-0" />
                  <span>{isRw ? "Abakozi b'umwuga bujuje ibyangombwa" : "Free tickets & verified workers"}</span>
                </li>

                <li className="flex items-center gap-3 text-[#333333] text-[15px] font-normal">
                  <Check className="w-5 h-5 text-[#005a9c] stroke-[3.5] shrink-0" />
                  <span>{isRw ? "Kwishyura imishahara kuri MoMo & Banki" : "Instant salary payments"}</span>
                </li>

                <li className="flex items-center gap-3 text-[#333333] text-[15px] font-normal">
                  <Check className="w-5 h-5 text-[#005a9c] stroke-[3.5] shrink-0" />
                  <span>{isRw ? "Amasezerano yemewe & RSSB" : "Extra protection & RSSB"}</span>
                </li>

                <li className="flex items-center gap-3 text-[#333333] text-[15px] font-normal">
                  <Check className="w-5 h-5 text-[#005a9c] stroke-[3.5] shrink-0" />
                  <span>{isRw ? "Ubufasha bwihuse bwa 24/7" : "Partners deals & 24/7 support"}</span>
                </li>
              </ul>

              {/* Preserved Not yet a member link */}
              {/* <div className="text-[13px] text-[#444444] mb-6">
                <span>{isRw ? "Ntabwo uriyandikisha? " : "Not yet a member? "}</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenRegister) {
                      onOpenRegister();
                    } else {
                      navigate("/auth/register");
                    }
                  }}
                  className="font-medium text-[#005a9c] underline hover:text-[#004780] cursor-pointer"
                >
                  {isRw ? "Iyandikishe Ubu" : "Join Now"}
                </button>
              </div> */}
            </div>

            {/* Stylized DreamMiles-like Script Branding for Ekaze */}
            <div className="pt-2 select-none">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="text-2xl font-bold italic tracking-tight text-[#005a9c]"
                  style={{ fontFamily: "'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive, sans-serif" }}
                >
                  Ekaze
                </span>
                <span className="text-[10px] text-slate-400 font-sans font-semibold">™</span>
              </div>
              <p className="text-[11px] text-[#005a9c] font-medium tracking-tight">
                {isRw ? "Genzura n'uhembe abakozi bo mu rugo igihe cyose" : "Earn trust whenever you manage with us"}
              </p>
            </div>

          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            PRESERVED BOTTOM BAR: "Don't have an account? [Create Account]"
        ══════════════════════════════════════════════════════════════════════ */}
        {/* <div className="border-t border-slate-200 px-8 py-4 bg-white flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <span className="text-[15px] text-[#333333] font-normal">
            {isRw ? "Ntabwo ufite konte?" : "Don't have an account?"}
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenRegister) {
                onOpenRegister();
              } else {
                navigate("/auth/register");
              }
            }}
            className="h-10 px-6 bg-[#005a9c] hover:bg-[#004780] text-white font-semibold text-sm rounded-[6px] transition-colors cursor-pointer shadow-xs inline-flex items-center justify-center"
          >
            <span>{isRw ? "Fungura Konte" : "Create Account"}</span>
          </button>
        </div> */}

      </div>
    </>
  );
};
