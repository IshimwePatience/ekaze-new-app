import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Loader2, AlertCircle, X, Check } from "lucide-react";
import { useLogin, useGoogleLogin, useAuth, safeSetAuthStorage } from "@/hooks/useAuth";
import { useForgotPassword, useResetPassword } from "@/hooks/useForgotPassword";
import { ROUTES } from '@/constants/routes';
import { useNavigate } from "react-router-dom";
import { mfaService } from "@/api/mfaService";
import { authApi } from "@/api/authApi";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { SixDigitPinInput } from "@/components/common/SixDigitPinInput";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Integrations from "@/components/landing/Integrations";
import Footer from "@/components/landing/Footer";

type ViewMode = "login" | "mfa" | "forgot_phone" | "forgot_reset" | "momo_waiting";

const LoginPage = () => {
  const { language } = useLanguage();
  const isRw = language === "kin";
  const [showPassword, setShowPassword] = useState(false);

  // Restore any pending MFA challenge from session so MFA view stays open
  const [mfaChallenge, setMfaChallenge] = useState<{
    temp_token: string;
    mfa_method: 'authenticator' | 'sms' | 'email';
    user?: any;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem("pending_mfa_challenge");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = sessionStorage.getItem("pending_mfa_challenge");
      return saved ? "mfa" : "login";
    } catch (e) {
      return "login";
    }
  });

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  // Errors state
  const [loginError, setLoginError] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
  const [isResendingMfa, setIsResendingMfa] = useState(false);

  // Forgot password state
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotError, setForgotError] = useState("");

  // MoMo Subscription Payment States
  const [momoStatus, setMomoStatus] = useState<"idle" | "initiating" | "polling" | "SUCCESSFUL" | "FAILED" | "TIMEOUT">("idle");
  const [momoPayData, setMomoPayData] = useState<{
    transaction_id: string;
    amount: number;
    phone: string;
    cycle?: string;
  } | null>(null);
  const [momoPayPhone, setMomoPayPhone] = useState("");
  const [momoError, setMomoError] = useState("");

  const momoPollRef = useRef<any>(null);
  const momoTimeoutRef = useRef<any>(null);

  const stopMomoPolling = () => {
    if (momoPollRef.current) clearInterval(momoPollRef.current);
    if (momoTimeoutRef.current) clearTimeout(momoTimeoutRef.current);
    setMomoStatus("idle");
    setViewMode("login");
  };

  useEffect(() => {
    return () => {
      if (momoPollRef.current) clearInterval(momoPollRef.current);
      if (momoTimeoutRef.current) clearTimeout(momoTimeoutRef.current);
    };
  }, []);

  const triggerMomoPayment = async (phoneOverride?: string, txOverride?: string, amountOverride?: number, cycleOverride?: string) => {
    const txId = txOverride || momoPayData?.transaction_id;
    const phoneToUse = (phoneOverride || momoPayPhone || momoPayData?.phone || "").trim();
    if (!txId || !phoneToUse) return;

    if (momoPollRef.current) clearInterval(momoPollRef.current);
    if (momoTimeoutRef.current) clearTimeout(momoTimeoutRef.current);

    setMomoStatus("initiating");
    setMomoError("");
    setViewMode("momo_waiting");

    try {
      const res = await api.post("/payment/initiate", {
        phone: phoneToUse,
        transaction_id: txId,
      });

      if (res.data?.success) {
        setMomoStatus("polling");
        const refId = res.data?.reference_id || txId;

        // Set 2-minute timeout
        momoTimeoutRef.current = setTimeout(() => {
          if (momoPollRef.current) clearInterval(momoPollRef.current);
          setMomoStatus("TIMEOUT");
          setMomoError(isRw ? "Igihe cyo kwishyura cyarangiye. Ongera ugerageze." : "Payment timed out. Please try again.");
        }, 120000);

        // Poll every 3.5 seconds
        momoPollRef.current = setInterval(async () => {
          try {
            const statusRes = await api.get(`/payment/status/${refId}`);
            const ps = (
              statusRes.data?.payment_status ||
              statusRes.data?.status ||
              statusRes.data?.transaction?.status ||
              ""
            ).toUpperCase();

            if (ps === "SUCCESSFUL") {
              if (momoPollRef.current) clearInterval(momoPollRef.current);
              if (momoTimeoutRef.current) clearTimeout(momoTimeoutRef.current);
              setMomoStatus("SUCCESSFUL");
              sonnerToast.success(isRw ? "Kwishyura Byemejwe!" : "Subscription Payment Confirmed!");

              // Automatically complete login and enter company dashboard!
              try {
                const loginRes = await authApi.login({
                  login: formData.login.trim(),
                  password: formData.password,
                });
                const token = loginRes.token || loginRes.data?.token;
                const userObj = loginRes.user || loginRes.data?.user;
                if (token && userObj) {
                  safeSetAuthStorage(token, userObj);
                  queryClient.invalidateQueries({ queryKey: ["user"] });
                  setTimeout(() => {
                    handleRoleNavigation(userObj);
                  }, 1200);
                  return;
                }
              } catch (_) {
                setTimeout(() => {
                  navigate("/company", { replace: true });
                }, 1200);
              }
            } else if (ps === "FAILED") {
              if (momoPollRef.current) clearInterval(momoPollRef.current);
              if (momoTimeoutRef.current) clearTimeout(momoTimeoutRef.current);
              setMomoStatus("FAILED");
              setMomoError(statusRes.data?.reason || statusRes.data?.message || (isRw ? "Kwishyura byanze kuri MTN MoMo." : "Payment was declined by MTN MoMo."));
            }
          } catch (_) {
            // Keep polling
          }
        }, 3500);
      } else {
        setMomoStatus("FAILED");
        setMomoError(res.data?.message || res.data?.reason || "Failed to initiate MTN MoMo payment.");
      }
    } catch (e: any) {
      setMomoStatus("FAILED");
      setMomoError(e?.response?.data?.message || e?.response?.data?.reason || "Failed to initiate MTN MoMo payment.");
    }
  };

  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: login, isPending } = useLogin();
  const { mutate: googleLoginMutate, isPending: isGooglePending } = useGoogleLogin();
  const { mutate: sendForgotOtp, isPending: isSendingForgotOtp } = useForgotPassword();
  const { mutate: resetPassword, isPending: isResettingPassword } = useResetPassword();

  // Handle Google OAuth callback: READ HASH FIRST before modifying URL
  useEffect(() => {
    const hash = window.location.hash;
    let accessToken: string | null = null;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      accessToken = params.get("access_token");
    }

    // Keep URL clean on home while preserving worker and query parameters
    if (window.location.pathname.startsWith("/auth/login") || hash) {
      const currentQuery = window.location.search;
      window.history.replaceState(null, "", currentQuery ? `/${currentQuery}` : "/");
    }

    if (accessToken) {
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => res.json())
        .then((googleUser) => {
          if (googleUser.email) {
            googleLoginMutate(
              {
                google_id: googleUser.sub,
                google_email: googleUser.email,
                name: googleUser.name,
                profile_photo: googleUser.picture,
              },
              {
                onSuccess: (data: any) => {
                  if (data?.requires_mfa && data?.temp_token) {
                    const challenge = {
                      temp_token: data.temp_token,
                      mfa_method: data.mfa_method || 'authenticator',
                      user: data.user,
                    };
                    try {
                      sessionStorage.setItem("pending_mfa_challenge", JSON.stringify(challenge));
                    } catch (e) { }
                    setMfaChallenge(challenge);
                    setViewMode("mfa");
                    setMfaCode("");
                  } else if (data?.token && data?.user) {
                    sessionStorage.removeItem("pending_mfa_challenge");
                    safeSetAuthStorage(data.token, data.user);
                    queryClient.invalidateQueries({ queryKey: ["user"] });
                    sonnerToast.success(isRw ? "Kwinjira byagenze neza!" : "Login successful!");
                    handleRoleNavigation(data.user);
                  }
                },
                onError: (err: any) => {
                  setLoginError(err?.response?.data?.message || "Google sign-in failed");
                }
              }
            );
          }
        })
        .catch((err) => console.error("Google OAuth token verification failed:", err));
    }
  }, [googleLoginMutate, isRw]);

  const handleRoleNavigation = (userObj: any) => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlWorkerId = searchParams.get('workerId') || searchParams.get('autoOpenWorkerId') || searchParams.get('worker');
    const autoOpenId = urlWorkerId || sessionStorage.getItem('auto_open_worker_id');
    const roleRoutes: Record<string, string> = {
      admin: ROUTES.ADMIN_DASHBOARD,
      employer: ROUTES.EMPLOYER_DASHBOARD,
      worker: ROUTES.WORKER_DASHBOARD,
      police: ROUTES.POLICE_DASHBOARD,
      company: ROUTES.COMPANY_DASHBOARD,
      supervisor: ROUTES.SUPERVISOR_DASHBOARD,
    };

    if (autoOpenId && userObj?.role === 'employer') {
      sessionStorage.removeItem('auto_open_worker_id');
      navigate(`/employer?tab=search&workerId=${autoOpenId}`, { replace: true });
    } else {
      navigate(roleRoutes[userObj?.role] || ROUTES.HOME, { replace: true });
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && !mfaChallenge) {
      handleRoleNavigation(user);
    }
  }, [isAuthenticated, user, mfaChallenge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    login(
      {
        login: formData.login.trim(),
        password: formData.password,
      },
      {
        onSuccess: (data: any) => {
          if (data?.requires_mfa && data?.temp_token) {
            const challenge = {
              temp_token: data.temp_token,
              mfa_method: data.mfa_method || 'authenticator',
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
            sonnerToast.success(isRw ? "Kwinjira byagenze neza!" : "Login successful!");
            handleRoleNavigation(data?.user);
          }
        },
        onError: (err: any) => {
          if (err?.response?.status === 402 || err?.response?.data?.payment_required) {
            const payData = err?.response?.data?.data;
            const txId = payData?.transaction_id || '';
            const phone = payData?.phone || formData.login;
            const amount = Number(payData?.amount) || 50000;
            const cycle = payData?.cycle || 'monthly';

            setMomoPayData({
              transaction_id: txId,
              amount,
              phone,
              cycle,
            });
            setMomoPayPhone(phone);
            triggerMomoPayment(phone, txId, amount, cycle);
            return;
          }
          const errorMsg =
            err?.response?.data?.message ||
            err?.message ||
            (isRw ? "Nomero cyangwa ijambobanga ntabwo bihuye" : "Invalid email or password");
          setLoginError(errorMsg);
        },
      }
    );
  };

  const handleVerifyMfaLogin = async (e?: React.FormEvent) => {
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
      try {
        sessionStorage.removeItem('mfa_post_login_shown_' + verifiedUser.id);
      } catch (err) { }

      safeSetAuthStorage(token, verifiedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      sonnerToast.success(isRw ? "MFA yemejwe neza!" : "Two-factor verification successful!");
      handleRoleNavigation(verifiedUser);
    } catch (err: any) {
      if (err?.response?.status === 402 || err?.response?.data?.payment_required) {
        sessionStorage.removeItem("pending_mfa_challenge");
        setMfaChallenge(null);
        const payData = err?.response?.data?.data;
        const txId = payData?.transaction_id || '';
        const phone = payData?.phone || mfaChallenge?.user?.phone || formData.login;
        const amount = Number(payData?.amount) || 50000;
        const cycle = payData?.cycle || 'monthly';

        setMomoPayData({
          transaction_id: txId,
          amount,
          phone,
          cycle,
        });
        setMomoPayPhone(phone);
        triggerMomoPayment(phone, txId, amount, cycle);
        return;
      }
      const errorMsg =
        err?.response?.data?.message ||
        (isRw ? "Kode ntabwo ari yo. Ongera ugerageze." : "Invalid 6-digit verification code.");
      setMfaError(errorMsg);
    } finally {
      setIsVerifyingMfa(false);
    }
  };

  const handleResendMfaCode = async () => {
    if (!mfaChallenge?.temp_token) return;
    setIsResendingMfa(true);
    setMfaError("");
    try {
      await mfaService.resendLoginMfa(mfaChallenge.temp_token);
      sonnerToast.success(isRw ? "Kode nshya yoherejwe!" : "New verification code sent!");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || (isRw ? "Kwohereza byanze." : "Failed to resend code.");
      setMfaError(errorMsg);
    } finally {
      setIsResendingMfa(false);
    }
  };

  const handleGoogleClick = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const workerId = searchParams.get('workerId') || searchParams.get('autoOpenWorkerId') || sessionStorage.getItem('auto_open_worker_id');
    if (workerId) {
      sessionStorage.setItem('auto_open_worker_id', workerId);
    }
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '851412910623-p7ov04uca9tqtg20f3hg17i6upqjvkua.apps.googleusercontent.com';
    const redirectUri = window.location.origin + '/auth/login';
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20profile&prompt=select_account`;

    window.location.href = googleAuthUrl;
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
          sonnerToast.success(
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
          sonnerToast.success(isRw ? "Ijambobanga ryahinduwe neza! Injira ubu." : "Password reset successfully! Please login.");
          setViewMode("login");
          setFormData((prev) => ({ ...prev, password: "" }));
        },
        onError: (err: any) => {
          setForgotError(err?.response?.data?.message || (isRw ? "Guhindura byanze" : "Reset failed"));
        },
      }
    );
  };

  const activeMode = viewMode === "momo_waiting" ? "momo_waiting" : mfaChallenge ? "mfa" : viewMode;

  return (
    <div
      className="relative min-h-screen bg-white"
      style={{
        fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Background Home Page so user stays on home with zero movement */}
      <Header />
      <main>
        <Hero />
        <Features />
        <Integrations />
      </main>
      <Footer />

      {/* Modal Popup on top of Home */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        {/* Click backdrop to go home */}
        <div className="fixed inset-0" onClick={() => navigate("/")} />

        {/* ══════════════════════════════════════════════════════════════════════════
            POPUP MODAL: EXACT 1-TO-1 CLONE OF RWANDAIR / LOGIN DROPDOWN DESIGN
        ══════════════════════════════════════════════════════════════════════════ */}
        <div
          className="relative z-10 w-[95vw] sm:w-[720px] max-w-[95vw] bg-white text-[#222222] rounded-lg shadow-2xl border border-slate-200 overflow-hidden text-left my-auto animate-in fade-in zoom-in-95 duration-200"
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

              {/* VIEW 1: LOGIN FORM */}
              {activeMode === "login" && (
                <form onSubmit={handleSubmit} className="space-y-4">
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

                  {/* Member-ID / Email / Phone */}
                  <div>
                    <input
                      type="text"
                      value={formData.login}
                      onChange={(e) => {
                        setFormData({ ...formData, login: e.target.value });
                        if (loginError) setLoginError("");
                      }}
                      placeholder={isRw ? "Injiza imeri cyangwa numero ya telefoni" : "Enter your email or phone number"}
                      style={{ fontSize: "17px", fontFamily: "Arial, Helvetica, sans-serif", lineHeight: "24px", height: "50px" }}
                      className="login-dropdown-input w-full px-3.5 rounded-[4px] border border-[#a5b2c0] focus:border-[#005a9c] focus:outline-none transition-colors bg-white"
                      required
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (loginError) setLoginError("");
                      }}
                      placeholder={isRw ? "Ijambobanga" : "Password"}
                      style={{ fontSize: "17px", fontFamily: "Arial, Helvetica, sans-serif", lineHeight: "24px", height: "50px" }}
                      className="login-dropdown-input w-full px-3.5 pr-10 rounded-[4px] border border-[#a5b2c0] focus:border-[#005a9c] focus:outline-none transition-colors bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Login Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full h-11 bg-[#005a9c] hover:bg-[#004780] text-white font-semibold text-base rounded-[6px] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      {isPending ? (
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

              {/* VIEW 2: MFA CHALLENGE POPUP */}
              {activeMode === "mfa" && (
                <form onSubmit={handleVerifyMfaLogin} className="space-y-4">
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
                          setTimeout(() => handleVerifyMfaLogin(), 200);
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

                    {(mfaChallenge?.mfa_method === 'sms' || mfaChallenge?.mfa_method === 'email') && (
                      <button
                        type="button"
                        onClick={handleResendMfaCode}
                        disabled={isResendingMfa}
                        className="text-xs font-semibold text-[#005a9c] hover:underline cursor-pointer"
                      >
                        {isResendingMfa ? "Sending..." : (isRw ? "Ongera wohereze" : "Resend Code")}
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* VIEW 3: FORGOT PASSWORD (PHONE/EMAIL INPUT) */}
              {activeMode === "forgot_phone" && (
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
              {activeMode === "forgot_reset" && (
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

                  <p className="text-xs text-slate-500">
                    {isRw ? "Injiza kode ya OTP yakiriwe:" : "Enter the 6-digit code sent to you:"}
                  </p>

                  <div className="py-1 flex justify-center">
                    <SixDigitPinInput
                      value={forgotOtp}
                      onChange={(val) => setForgotOtp(val)}
                      hasError={!!forgotError}
                      autoFocus
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={isRw ? "Ijambobanga Rishya" : "New Password"}
                      style={{ fontSize: "17px", fontFamily: "Arial, Helvetica, sans-serif", lineHeight: "24px", height: "50px" }}
                      className="login-dropdown-input w-full px-3.5 pr-10 rounded-[4px] border border-[#a5b2c0] focus:border-[#005a9c] focus:outline-none transition-colors bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div>
                    <input
                      type="password"
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

              {/* VIEW 5: MOMO SUBSCRIPTION POPUP & POLLING VIEW */}
              {activeMode === "momo_waiting" && (
                <div className="space-y-4 text-center">
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-[#222222] tracking-tight">
                      {isRw ? "Kwishyura Ifatabuguzi" : "Subscription Payment"}
                    </h2>
                  </div>

                  <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-left text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold">{isRw ? "Amafaranga" : "Amount"}:</span>
                      <span className="text-base font-bold text-[#005a9c]">
                        {Number(momoPayData?.amount || 50000).toLocaleString()} RWF
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>{isRw ? "Igihe" : "Cycle"}:</span>
                      <span className="capitalize font-medium">{momoPayData?.cycle || "monthly"}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>{isRw ? "Telefoni ya MoMo" : "MoMo Number"}:</span>
                      <span className="font-mono font-medium">{momoPayPhone}</span>
                    </div>
                  </div>

                  {/* STATUS: INITIATING OR POLLING */}
                  {(momoStatus === "initiating" || momoStatus === "polling") && (
                    <div className="space-y-4 py-2">
                      <div
                        className="animate-spin mx-auto"
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          border: "5px solid #BFDFEF",
                          borderTopColor: "#0078B4",
                          borderLeftColor: "#0078B4",
                        }}
                      />

                      <div className="space-y-1 text-center">
                        <p className="text-sm font-semibold text-gray-800">
                          {isRw
                            ? "Reba kuri telefoni yawe wemeze kwishyura"
                            : "Check your phone for a pop-up and confirm"}
                        </p>
                        <p className="text-xs text-slate-600">
                          {isRw ? (
                            <>
                              Ntabwo ubonye pop-up? Kanda <strong className="text-gray-800">*182*7*1#</strong> wemeze kwishyura
                            </>
                          ) : (
                            <>
                              No pop-up? Dial <strong className="text-gray-800">*182*7*1#</strong> and confirm the payment
                            </>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground pt-1">
                          {isRw ? "Tegereza gato, ntufunge iyi paje..." : "Please wait, don't leave this page..."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={stopMomoPolling}
                        className="w-full h-10 border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-[6px] transition-colors cursor-pointer"
                      >
                        {isRw ? "Hagarika" : "Cancel"}
                      </button>
                    </div>
                  )}

                  {/* STATUS: SUCCESSFUL */}
                  {momoStatus === "SUCCESSFUL" && (
                    <div className="space-y-3 py-4 text-center animate-in zoom-in-95">
                      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Check className="w-9 h-9 stroke-[3]" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {isRw ? "Kwishyura Byemejwe!" : "Payment Confirmed!"}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {isRw
                          ? "Konti ya kompanyi yishyuwe neza. Turimo kwinjira muri dashboard..."
                          : "Your company subscription is active. Opening dashboard..."}
                      </p>
                    </div>
                  )}

                  {/* STATUS: FAILED OR TIMEOUT */}
                  {(momoStatus === "FAILED" || momoStatus === "TIMEOUT") && (
                    <div className="space-y-3 py-2 text-left">
                      <div className="flex items-center gap-2 p-2.5 rounded-[4px] bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{momoError || (isRw ? "Kwishyura byanze cyangwa igihe cyarangiye." : "Payment was declined or timed out.")}</span>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-700 mb-1 block">
                          {isRw ? "Nimero ya MTN MoMo yo kwishyuriraho" : "MTN MoMo phone number"}
                        </label>
                        <input
                          type="text"
                          value={momoPayPhone}
                          onChange={(e) => setMomoPayPhone(e.target.value)}
                          placeholder="078..."
                          className="w-full h-10 px-3 rounded border border-slate-300 text-sm outline-none focus:border-[#005a9c]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => triggerMomoPayment(momoPayPhone)}
                        className="w-full h-11 bg-[#005a9c] hover:bg-[#004780] text-white font-semibold text-sm rounded-[6px] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                      >
                        {isRw ? "Ongera Wohereze Pop-up ya MoMo" : "Resend MoMo Pop-up"}
                      </button>

                      <button
                        type="button"
                        onClick={stopMomoPolling}
                        className="w-full text-xs font-semibold text-slate-500 hover:text-slate-700 py-1"
                      >
                        {isRw ? "Subira ku Kwinjira" : "Back to Login"}
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* ──────────────────────────────────────────────────────────────────
              RIGHT COLUMN: EXACT RWANDAIR "REGISTER TO EKAZE AND ENJOY:"
          ────────────────────────────────────────────────────────────────── */}
            <div className="md:pl-8 pt-6 md:pt-0 relative flex flex-col justify-between">

              {/* Top Close '✕' Button */}
              <button
                type="button"
                onClick={() => navigate("/")}
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

                {/* Exact Checkmark Bullet Items with blue tick ✔ */}
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
                    onClick={() => navigate("/auth/register")}
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
              onClick={() => navigate("/auth/register")}
              className="h-10 px-6 bg-[#005a9c] hover:bg-[#004780] text-white font-semibold text-sm rounded-[6px] transition-colors cursor-pointer shadow-xs inline-flex items-center justify-center"
            >
              <span>{isRw ? "Fungura Konte" : "Create Account"}</span>
            </button>
          </div> */}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
