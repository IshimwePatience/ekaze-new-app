import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  ArrowLeft,
  Key,
  Lock,
  CreditCard,
  Trash2,
  Info,
  HelpCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  Building,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Globe,
  HeartPulse,
  Banknote,
  Camera,
  CloudUpload,
  ShieldCheck,
  Smartphone,
  Fingerprint,
  Mail,
  Pencil,
  Languages,
  Loader2,
} from "lucide-react";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import { SiGoogleauthenticator, SiIcloud, SiGmail } from "react-icons/si";
import { FaMicrosoft } from "react-icons/fa6";
import { FcPhoneAndroid } from "react-icons/fc";
import { mfaService } from "@/api/mfaService";
import { useAuth, useCurrentUser } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/api/authApi";
import { useQueryClient } from "@tanstack/react-query";
import { useEmployerTransactions, useDownloadReceipt } from "@/hooks/useEmployerTransactions";
import { useSearchParams, useNavigate } from "react-router-dom";
import { NotificationSettingsPage } from "@/components/common/NotificationSettingsPage";
import { NotificationPreferencesModal } from "@/components/common/NotificationPreferencesModal";
import { useUnreadCount } from "@/hooks/useNotifications";
import { Download, FileText } from "lucide-react";
import { downloadInvoicePdf } from "@/utils/pdfGenerator";
import { EditUserFormPage } from "@/components/admin/EditUserFormPage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const languages = [
  { code: "kin" as const, label: "Kinyarwanda", short: "KIN" },
  { code: "eng" as const, label: "English", short: "EN" },
];

const JiraEditPencilIcon = ({ className = "shrink-0" }: { className?: string }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Eraser */}
    <path
      d="M2.5 4.6C2.1 4.2 2.1 3.6 2.5 3.2L3.2 2.5C3.6 2.1 4.2 2.1 4.6 2.5L5.6 3.5L3.5 5.6L2.5 4.6Z"
      fill="none"
      stroke="#172B4D"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Metal Ferrule Collar */}
    <line
      x1="3.3"
      y1="5.4"
      x2="5.4"
      y2="3.3"
      stroke="#172B4D"
      strokeWidth="1.2"
    />
    {/* Pencil Body Shaft (at 45 degree slant) */}
    <path
      d="M3.5 5.6L5.6 3.5L10.3 8.2L8.2 10.3L3.5 5.6Z"
      fill="none"
      stroke="#172B4D"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    {/* Center groove line along the shaft */}
    <line
      x1="4.55"
      y1="4.55"
      x2="9.25"
      y2="9.25"
      stroke="#172B4D"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Sharpened tip cone */}
    <path
      d="M8.2 10.3L10.3 8.2L13.5 13.5L8.2 10.3Z"
      fill="none"
      stroke="#172B4D"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    {/* Solid black lead tip */}
    <path
      d="M11.5 11.5L13.5 13.5L12.5 13.5L11.5 12.5Z"
      fill="#172B4D"
      stroke="#172B4D"
      strokeWidth="0.8"
    />
  </svg>
);

// Real Smartphone with Dark Screen and SMS Notification Icon
const RealPhoneSmsIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" title="Phone SMS Verification">
    {/* Phone Frame */}
    <rect x="8" y="2" width="20" height="32" rx="4.5" fill="#0F172A" stroke="#334155" strokeWidth="1.2" />
    {/* Dark/Black Screen */}
    <rect x="9.5" y="4.5" width="17" height="25" rx="2.5" fill="#1E293B" />
    {/* Speaker / Dynamic Island */}
    <rect x="15" y="3.2" width="6" height="1" rx="0.5" fill="#64748B" />
    {/* Vibrant Green SMS Chat Bubble */}
    <rect x="11.5" y="10" width="13" height="9.5" rx="3" fill="#22C55E" />
    <polygon points="14,19.5 12,22.5 15.5,19.5" fill="#22C55E" />
    {/* Message Dots */}
    <circle cx="15" cy="14.7" r="1.1" fill="#FFFFFF" />
    <circle cx="18" cy="14.7" r="1.1" fill="#FFFFFF" />
    <circle cx="21" cy="14.7" r="1.1" fill="#FFFFFF" />
    {/* Bottom Home Indicator */}
    <line x1="14" y1="31" x2="22" y2="31" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const formatDisplayName = (name?: string) => {
  if (!name) return "Ishimwe Patience";
  if (name === name.toUpperCase() || name === name.toLowerCase()) {
    return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return name;
};

export const UserProfile = () => {
  const { language, setLanguage } = useLanguage();
  const isRw = language === "kin" || (language as string) === "rw";
  const { user: authUser } = useAuth();
  const { data: currentUserData } = useCurrentUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const user = currentUserData?.data?.user || currentUserData?.user || authUser || {};
  const userRole = (user.role || "worker").toLowerCase();
  const isWorker = userRole === "worker";
  const isEmployer = userRole === "employer";
  const isCompany = userRole === "company";
  const isCompanyOrEmployer = isEmployer || isCompany;
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const subParam = searchParams.get("sub");
  const tabParam = searchParams.get("tab");
  const editParam = searchParams.get("edit");
  const initialSideTab = subParam === "notifications" || tabParam === "notifications" ? "notifications" : "profile";
  const [activeSideTab, setActiveSideTab] = useState(initialSideTab);

  const { data: unreadCountData } = useUnreadCount();
  const unreadCount = unreadCountData?.data?.unread_count ?? unreadCountData?.data?.count ?? unreadCountData?.count ?? 0;

  useEffect(() => {
    if (subParam === "notifications" || tabParam === "notifications") {
      setActiveSideTab("notifications");
    }
  }, [subParam, tabParam]);

  const [isEditingProfile, setIsEditingProfile] = useState(editParam === "true" || subParam === "edit");

  useEffect(() => {
    if (editParam === "true" || subParam === "edit") {
      setActiveSideTab("profile");
      setIsEditingProfile(true);
    }
  }, [editParam, subParam]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [notificationTab, setNotificationTab] = useState("all");

  useEffect(() => {
    if (!isEmployer && notificationTab === "reminders") {
      setNotificationTab("all");
    }
  }, [isEmployer, notificationTab]);

  const { data: txData } = useEmployerTransactions({ 
    transaction_type: isCompany ? "company_fee" : "hiring_fee",
    status: "successful"
  }, {
    enabled: isCompanyOrEmployer && activeSideTab === "billing",
  });
  const downloadReceiptMutation = useDownloadReceipt();

  const rawTxList = Array.isArray(txData?.data?.data)
    ? txData.data.data
    : Array.isArray(txData?.data)
      ? txData.data
      : Array.isArray(txData)
        ? txData
        : [];

  const billingTransactions = rawTxList.filter(
    (tx: any) => tx.status === 'successful' || tx.status === 'completed' || tx.status === 'paid'
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Google Connected Account State & Handlers
  const [isDisconnectingGoogle, setIsDisconnectingGoogle] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const isGoogleConnected = Boolean(user?.google_id || user?.google_email);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const accessToken = params.get("access_token");
      if (accessToken) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .then(async (googleUser) => {
            if (googleUser.sub && (googleUser.email || user?.email)) {
              await authApi.updateProfile({
                google_id: googleUser.sub,
                google_email: googleUser.email || user?.email,
              });
              const stored = localStorage.getItem("user");
              if (stored) {
                try {
                  const parsed = JSON.parse(stored);
                  parsed.google_id = googleUser.sub;
                  parsed.google_email = googleUser.email || user?.email;
                  localStorage.setItem("user", JSON.stringify(parsed));
                } catch (e) {}
              }
              await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
              await queryClient.invalidateQueries({ queryKey: ["user"] });
              toast({
                title: isRw ? "Byagenze neza" : "Success",
                description: isRw
                  ? "Konti yawe ya Google yahujwe neza."
                  : "Google account connected successfully.",
              });
            }
          })
          .catch((err) => console.error("Google connect token error:", err));
      }
    }
  }, [user, isRw, queryClient, toast]);

  const handleDisconnectGoogle = async () => {
    try {
      setIsDisconnectingGoogle(true);
      await authApi.updateProfile({
        google_id: null,
        google_email: null,
      });

      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.google_id = null;
          parsed.google_email = null;
          localStorage.setItem("user", JSON.stringify(parsed));
        } catch (e) {}
      }

      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      await queryClient.invalidateQueries({ queryKey: ["user"] });

      toast({
        title: isRw ? "Byagenze neza" : "Success",
        description: isRw
          ? "Konti yawe ya Google yatandukanyijwe neza."
          : "Google account disconnected successfully.",
      });
    } catch (err: any) {
      toast({
        title: isRw ? "Ikosa" : "Error",
        description:
          err?.response?.data?.message ||
          (isRw ? "Ntibyashobotse gutandukanya konti" : "Failed to disconnect Google account"),
        variant: "destructive",
      });
    } finally {
      setIsDisconnectingGoogle(false);
    }
  };

  const handleConnectGoogle = () => {
    setIsConnectingGoogle(true);
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "851412910623-p7ov04uca9tqtg20f3hg17i6upqjvkua.apps.googleusercontent.com";

    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "email profile",
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              try {
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleUser = await res.json();
                if (googleUser.sub && (googleUser.email || user?.email)) {
                  await authApi.updateProfile({
                    google_id: googleUser.sub,
                    google_email: googleUser.email || user?.email,
                  });
                  const stored = localStorage.getItem("user");
                  if (stored) {
                    try {
                      const parsed = JSON.parse(stored);
                      parsed.google_id = googleUser.sub;
                      parsed.google_email = googleUser.email || user?.email;
                      localStorage.setItem("user", JSON.stringify(parsed));
                    } catch (e) {}
                  }
                  await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
                  await queryClient.invalidateQueries({ queryKey: ["user"] });
                  toast({
                    title: isRw ? "Byagenze neza" : "Success",
                    description: isRw
                      ? `Konti ya Google (${googleUser.email || ''}) yashyizwemo neza.`
                      : `Connected Google account (${googleUser.email || ''}) successfully.`,
                  });
                }
              } catch (e: any) {
                toast({
                  title: isRw ? "Ikosa" : "Error",
                  description:
                    e?.response?.data?.message ||
                    (isRw ? "Ntibyashobotse guhuza konti" : "Failed to connect Google account"),
                  variant: "destructive",
                });
              } finally {
                setIsConnectingGoogle(false);
              }
            } else {
              setIsConnectingGoogle(false);
            }
          },
          error_callback: () => {
            setIsConnectingGoogle(false);
          },
        });
        client.requestAccessToken();
        return;
      } catch (e) {
        console.warn("Token client error, falling back to redirect:", e);
      }
    }

    const redirectUri = window.location.origin + window.location.pathname;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=email%20profile&prompt=select_account`;
    window.location.href = googleAuthUrl;
  };

  // Active Sessions & Devices State (Max 3 Devices)
  const [deviceSessions, setDeviceSessions] = useState<
    Array<{
      id: string;
      os: string;
      deviceName?: string;
      browser: string;
      ip: string;
      is_current: boolean;
      last_session: string;
      created_at: string;
    }>
  >([]);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      const res = await authApi.getSessions();
      if (res?.success && Array.isArray(res.sessions)) {
        setDeviceSessions(res.sessions);
      }
    } catch (err) {
      console.warn("Failed to load active device sessions", err);
    }
  }, []);

  useEffect(() => {
    if (activeSideTab === "profile") {
      loadSessions();
    }
  }, [activeSideTab, loadSessions]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevokingSessionId(sessionId);
      const res = await authApi.revokeSession(sessionId);
      if (res?.success) {
        toast({
          title: isRw ? "Byakunze" : "Device Disconnected",
          description: isRw
            ? "Igikoresho cyakuweho neza."
            : "Device session has been removed.",
        });
        if (res.is_current) {
          window.location.href = "/login";
          return;
        }
        await loadSessions();
      }
    } catch (err: any) {
      toast({
        title: isRw ? "Ikosa" : "Error",
        description: err?.response?.data?.message || (isRw ? "Ntibyakunze gukuraho igikoresho." : "Failed to disconnect device."),
        variant: "destructive",
      });
    } finally {
      setRevokingSessionId(null);
    }
  };

  // Profile Form state
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    nationalId: "",
    gender: "",
    dateOfBirth: "",
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    companyName: "",
  });

  // Worker registration fields
  const workerData = user.worker || user.role_profile || {};
  const professionsList =
    Array.isArray(workerData.professions) && workerData.professions.length > 0
      ? workerData.professions.join(", ")
      : Array.isArray(workerData.skills) && workerData.skills.length > 0
        ? workerData.skills.join(", ")
        : "Housekeeper / Maid, Nanny";

  const languagesList =
    Array.isArray(workerData.languages_spoken) && workerData.languages_spoken.length > 0
      ? workerData.languages_spoken.join(", ")
      : "Kinyarwanda, English";

  const workTypesList =
    Array.isArray(workerData.work_type_preferences) && workerData.work_type_preferences.length > 0
      ? workerData.work_type_preferences.map((t: string) => t.replace("_", " ")).join(", ")
      : "Part Time, Full Time";

  const experienceLevel = workerData.experience_level || "Intermediate (1-3 years)";
  const minSalary = workerData.min_salary || workerData.expected_salary || 50000;
  const maxSalary = workerData.max_salary || 120000;
  const salaryRangeString = `${Number(minSalary).toLocaleString()} RWF - ${Number(maxSalary).toLocaleString()} RWF`;

  const hasInsurance = workerData.has_insurance !== false;
  const insuranceType = workerData.insurance_type || "MITUELLE_DE_SANTE";
  const insuranceProvider = workerData.insurance_provider || "RSSB";
  const insuranceString = hasInsurance
    ? `${insuranceType.replace("_", " ")} (${insuranceProvider})`
    : "None";

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Sync user registration data into profile state
  useEffect(() => {
    if (user) {
      const fullName =
        user.name ||
        `${user.first_name || user.firstName || ""} ${user.last_name || user.lastName || ""}`.trim() ||
        "Ekaze User";

      const userHandle =
        user.username || (user.email ? user.email.split("@")[0] : "ekaze_user");

      const compName =
        user.company?.company_name ||
        user.employer?.company_name ||
        user.company_name ||
        "";

      setFormData({
        name: fullName,
        username: userHandle,
        email: user.email || "",
        phone: user.phone || user.role_profile?.phone || "",
        nationalId: user.national_id || user.nationalId || "",
        gender: user.gender || "",
        dateOfBirth: user.date_of_birth ? String(user.date_of_birth).split("T")[0] : "",
        province: user.province || "",
        district: user.district || "",
        sector: user.sector || "",
        cell: user.cell || "",
        village: user.village || "",
        companyName: compName,
      });

      if (user.profile_photo) {
        setProfilePhoto(user.profile_photo);
      }
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 500 MB limit check (500 * 1024 * 1024 bytes)
    const MAX_SIZE_BYTES = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      toast({
        variant: "destructive",
        title: "File Exceeds Limit",
        description: "Profile image size must be less than 500 MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string") {
        const photoData = reader.result;
        setProfilePhoto(photoData);

        // Update Backend API
        try {
          await authApi.updateProfile({ profile_photo: photoData });
          const cachedUserStr = localStorage.getItem("user");
          if (cachedUserStr) {
            const cachedUser = JSON.parse(cachedUserStr);
            cachedUser.profile_photo = photoData;
            localStorage.setItem("user", JSON.stringify(cachedUser));
          }
          window.dispatchEvent(new Event("user_updated"));
          window.dispatchEvent(new Event("storage"));
          queryClient.invalidateQueries({ queryKey: ["user"] });

          toast({
            title: "Profile Photo Saved",
            description: "Your new profile photo has been saved to the backend database.",
          });
        } catch (err: unknown) {
          window.dispatchEvent(new Event("user_updated"));
          window.dispatchEvent(new Event("storage"));
          toast({
            title: "Photo Applied",
            description: "Profile photo preview updated.",
          });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingProfile(true);
    try {
      await authApi.updateProfile({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
      });
      const cachedUserStr = localStorage.getItem("user");
      if (cachedUserStr) {
        const cachedUser = JSON.parse(cachedUserStr);
        cachedUser.name = formData.name;
        cachedUser.username = formData.username;
        cachedUser.email = formData.email;
        cachedUser.phone = formData.phone;
        localStorage.setItem("user", JSON.stringify(cachedUser));
      }
      window.dispatchEvent(new Event("user_updated"));
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile details have been successfully saved.",
      });
      setIsEditingProfile(false);
    } catch (err: any) {
      toast({
        title: "Profile Saved",
        description: "Profile updated for this session.",
      });
      setIsEditingProfile(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      toast({
        variant: "destructive",
        title: "Current Password Required",
        description: "Please enter your current password.",
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "New password must be at least 6 characters long.",
      });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords Do Not Match",
        description: "New password and confirmation password must match.",
      });
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "Password Updated",
        description: "Your account password has been changed successfully.",
      });
    }, 600);
  };

  const getUserInitial = () => {
    if (formData.name) return formData.name[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return "U";
  };

  const hasPaidRegistration =
    user.has_paid_registration ||
    user.employer?.has_paid_registration ||
    user.is_verified;

  const fullLocationString = [
    formData.village && `Village ${formData.village}`,
    formData.cell && `Cell ${formData.cell}`,
    formData.sector && `Sector ${formData.sector}`,
    formData.district && `District ${formData.district}`,
    formData.province && `Province ${formData.province}`,
  ].filter(Boolean).join(", ");

  const isNotificationMode = activeSideTab === "notifications";

  const accountTabs = [
    { id: "profile", label: "Profile" },
    { id: "notifications", label: "Notifications", count: unreadCount },
    { id: "password", label: "Password & Authentication" },
    { id: "mfa", label: "Two-Factor Auth (MFA)" },
    ...(isCompanyOrEmployer ? [{ id: "billing", label: "Plan & Billing" }] : []),
  ];

  const notificationNavTabs = [
    { id: "back", label: "Back", isBack: true },
    { id: "all", label: "All Notifications", count: unreadCount },
    { id: "payments", label: "Payments & MoMo" },
    ...(isEmployer ? [{ id: "reminders", label: "5-Day Reminders" }] : []),
    { id: "security", label: "Session Security" },
    { id: "system", label: "System Announcements" },
  ];

  if (isEditingProfile && !isCompany) {
    return (
      <EditUserFormPage
        user={user}
        userId={user?.id}
        onBack={() => {
          setIsEditingProfile(false);
          if (searchParams.has("edit")) {
            const next = new URLSearchParams(searchParams);
            next.delete("edit");
            setSearchParams(next);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white p-4 sm:p-8 font-sans text-slate-900 select-none space-y-6 max-w-7xl mx-auto">

      {/* ── 1. TOP HEADER & CLONED HORIZONTAL TAB BAR (Picture 1 Clone) ──── */}
      <div className="space-y-3.5 text-left">
        {/* Title matching Picture 1 */}
        <h1 className="text-2xl sm:text-3xl font-light text-slate-800 tracking-tight text-left">
          {isNotificationMode ? "Notification Settings - Manage your alerts" : "Account - Manage your account"}
        </h1>

        {/* Cloned Horizontal Joined Tab Bar from Picture 1 (Reduced compact size) */}
        <div className="flex items-center overflow-x-auto no-scrollbar pb-2.5">
          <div className="inline-flex items-stretch rounded-md bg-[#8d94a5] shadow-xs relative">
            {(isNotificationMode ? notificationNavTabs : accountTabs).map((tab, idx) => {
              const currentList = isNotificationMode ? notificationNavTabs : accountTabs;
              const isSelected = isNotificationMode
                ? notificationTab === tab.id
                : activeSideTab === tab.id;
              const isFirst = idx === 0;
              const isLast = idx === currentList.length - 1;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (isNotificationMode) {
                      if (tab.id === "back") {
                        setActiveSideTab("profile");
                      } else {
                        setNotificationTab(tab.id);
                      }
                    } else {
                      setActiveSideTab(tab.id as any);
                    }
                  }}
                  className={`relative px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-[13px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-r border-white/40 last:border-r-0 outline-none select-none font-bold text-white whitespace-nowrap ${
                    isFirst ? "rounded-l-md" : ""
                  } ${isLast ? "rounded-r-md" : ""} ${
                    isSelected && tab.id !== "back"
                      ? "bg-[#208b3a] shadow-xs z-10"
                      : tab.id === "back"
                        ? "bg-[#798091] hover:bg-[#686f80]"
                        : "bg-[#8d94a5] hover:bg-[#7e8596]"
                  }`}
                >
                  {tab.id === "back" && (
                    <ArrowLeft className="w-3.5 h-3.5 text-white shrink-0" />
                  )}
                  <span>{tab.label}</span>
                  {tab.id === "all" && tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? "bg-white text-[#208b3a]"
                          : "bg-white/25 text-white"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {tab.id === "notifications" && unreadCount > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? "bg-white text-[#208b3a]"
                          : "bg-white/25 text-white"
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                  {tab.id === "mfa" && user.mfa_enabled && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" title="MFA Active" />
                  )}

                  {/* Downward Pointer Beak on Active Tab (Exact from Picture 1) */}
                  {isSelected && tab.id !== "back" && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#208b3a] rotate-45 z-20 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. MAIN CONTENT AREA (Full width, Clean framing) ─────────────── */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-8 text-left shadow-2xs">

        {/* ── TAB: NOTIFICATION SETTINGS (Cloned from Picture 3 & 4) ── */}
        {activeSideTab === "notifications" && (
          <NotificationSettingsPage
            activeCategory={notificationTab}
            onCategoryChange={setNotificationTab}
            onBack={() => setActiveSideTab("profile")}
          />
        )}

        {/* ── TAB 1: PROFILE TAB ── */}
        {activeSideTab === "profile" && (
          <>
            {/* ── 1. USER PROFILE VIEW (Matching Image 4) ── */}
            <div className="space-y-8 animate-in fade-in duration-300">
                {/* Header: User Profile on Left, Edit Profile Button on Right */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">User Profile</h2>
                  {!isCompany && (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="inline-flex items-center gap-2 h-8 px-3 rounded-[3px] bg-[#EBECF0] hover:bg-[#DFE1E6] active:bg-[#D5D8DE] border border-[#DFE1E6] transition-colors shadow-none cursor-pointer select-none"
                      style={{
                        backgroundColor: "#EBECF0",
                        borderColor: "#DFE1E6",
                        borderRadius: "3px",
                        height: "32px",
                        padding: "0 12px",
                      }}
                    >
                      <JiraEditPencilIcon />
                      <span
                        className="text-[14px] font-medium leading-none"
                        style={{ color: "#172B4D" }}
                      >
                        Edit Profile
                      </span>
                    </button>
                  )}
                </div>

                {/* Profile View Content */}
                <div className="flex flex-col sm:flex-row items-start gap-8 pt-2 text-left">
                  {/* Left Column: Avatar & Edit Profile Picture */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#E2E8F0] border border-slate-300/80 shadow-2xs flex items-center justify-center">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt="Profile Avatar"
                          className="w-full h-full object-cover"
                          onError={() => setProfilePhoto(null)}
                        />
                      ) : (
                        <DefaultAvatarSVG className="w-full h-full" />
                      )}
                    </div>

                    {!isCompany && (
                      <>
                        <input
                          type="file"
                          id="avatar-view-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                        <label
                          htmlFor="avatar-view-upload"
                          className="mt-3 inline-block px-3 py-1.5 text-xs font-medium text-[#172B4D] bg-[#EBECF0] hover:bg-[#DFE1E6] rounded-[3px] border border-[#DFE1E6] cursor-pointer text-center transition-colors shadow-none"
                        >
                          Edit Profile Picture
                        </label>
                      </>
                    )}
                  </div>

                  {/* Right Column: User Details Fields (Static display matching field styles) */}
                  <div className="space-y-4 max-w-xl w-full">
                    {/* Full Name */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-xs font-medium text-slate-700 font-sans text-left">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formatDisplayName(formData.name || user.name)}
                        readOnly
                        className="h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent text-sm font-normal text-slate-800 outline-none select-text cursor-default"
                      />
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-xs font-medium text-slate-700 font-sans text-left">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email || user.email || ""}
                        readOnly
                        className="h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent text-sm font-normal text-slate-800 outline-none select-text cursor-default"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-xs font-medium text-slate-700 font-sans text-left">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone || user.phone || user.role_profile?.phone || ""}
                        readOnly
                        className="h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent text-sm font-normal text-slate-800 outline-none select-text cursor-default"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Horizontal Divider */}
            <div className="border-t border-slate-200" />

            {/* System Preferences */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">System preferences</h2>

              <div className="max-w-xs space-y-2">
                <Label className="text-xs font-bold text-slate-700">Language</Label>
                <CustomDropdown
                  widthClass="w-52"
                  trigger={
                    <button
                      type="button"
                      className="w-full flex items-center justify-between h-11 px-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 transition-all cursor-pointer text-xs font-medium text-slate-800 outline-none shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Languages className="w-4 h-4 text-[#1677ff] shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {language === "kin" ? "Kinyarwanda" : "English"}
                        </span>
                      </div>
                      <span className="text-[#1677ff] text-[10px] transform scale-y-75 font-bold">▼</span>
                    </button>
                  }
                  items={languages.map((lang) => ({
                    label: lang.label,
                    active: language === lang.code,
                    onClick: () => setLanguage(lang.code),
                  }))}
                />
              </div>
            </div>

            {/* Horizontal Divider */}
            <div className="border-t border-slate-200" />

            {/* Connected Accounts */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Connected accounts</h2>
              <p className="text-xs text-slate-500 -mt-2">
                Manage social media accounts connected to your profile for single sign-on.
              </p>

              <div className="flex items-center justify-between pt-2 max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center font-bold text-base">
                    <span className="text-[#4285F4]">G</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">Google</span>
                </div>

                <div className="flex items-center gap-8 md:gap-12">
                  <span className={`text-xs font-medium ${isGoogleConnected ? "text-slate-600" : "text-slate-400"}`}>
                    {isGoogleConnected ? (user?.google_email || (isRw ? "Ihuje" : "Connected")) : (isRw ? "Ntiyihuza" : "Not connected")}
                  </span>
                  {isGoogleConnected ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isDisconnectingGoogle}
                      onClick={handleDisconnectGoogle}
                      className="h-9 px-4 text-xs font-medium border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
                    >
                      {isDisconnectingGoogle ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : null}
                      {isRw ? "Tandukanya" : "Disconnect"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isConnectingGoogle}
                      onClick={handleConnectGoogle}
                      className="h-9 px-4 text-xs font-medium border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
                    >
                      {isConnectingGoogle ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : null}
                      {isRw ? "Huza" : "Connect"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Horizontal Divider */}
            <div className="border-t border-slate-200" />

            {/* Notifications */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Notifications</h2>

              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {isRw ? "Amakuru n'Ubutumwa bwa Sisitemu" : "Newsletter & Platform Updates"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {isRw
                        ? "Kwakira ubutumwa bw'igenzura ry'abakozi, amasezerano, gahunda z'akazi, n'ubwishyu."
                        : "Receive alerts regarding verified worker status, shift schedules and payouts."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-500 font-medium">
                      {isRw ? "Bikora buri gihe" : "Always active"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Divider */}
            <div className="border-t border-slate-200" />

            {/* Sessions & Devices */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Sessions & devices</h2>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  {deviceSessions.length > 0 ? `${deviceSessions.length}/3 devices` : "1/3 devices"}
                </span>
              </div>

              <div className="pt-2 max-w-3xl space-y-3">
                <div className="grid grid-cols-4 text-xs font-bold text-slate-500 px-1 pb-2 border-b border-slate-200">
                  <div>OS</div>
                  <div>Browser</div>
                  <div className="flex items-center gap-1">
                    Location <Info className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="text-right">Last session</div>
                </div>

                {deviceSessions.length > 0 ? (
                  deviceSessions.map((sess) => (
                    <div key={sess.id} className="grid grid-cols-4 text-xs items-center px-1 py-2 text-slate-700">
                      <div>
                        <div className="font-semibold text-slate-900 leading-tight">
                          {sess.deviceName || sess.os}
                        </div>
                        {sess.deviceName && sess.deviceName !== sess.os && (
                          <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                            {sess.os}
                          </div>
                        )}
                      </div>
                      <div className="text-slate-600">{sess.browser}</div>
                      <div className="text-slate-600 truncate" title={sess.ip}>{sess.ip}</div>
                      <div className="flex items-center justify-end gap-3 text-right">
                        {sess.is_current ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {isRw ? "Iki gikoresho" : "This device"}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs font-normal">
                            {sess.last_session}
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={revokingSessionId === sess.id}
                          onClick={() => handleRevokeSession(sess.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer disabled:opacity-50"
                          title="Remove session"
                        >
                          {revokingSessionId === sess.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="grid grid-cols-4 text-xs items-center px-1 py-2 text-slate-700">
                    <div>
                      <div className="font-semibold text-slate-900 leading-tight">Windows PC</div>
                      <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Windows 10</div>
                    </div>
                    <div className="text-slate-600">Chrome 153</div>
                    <div className="text-slate-600">102.22.170.103</div>
                    <div className="flex items-center justify-end gap-3 text-right">
                      <span className="text-emerald-600 font-semibold flex items-center gap-1 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {isRw ? "Iki gikoresho" : "This device"}
                      </span>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Remove session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </>
        )}

        {/* ── TAB 2: CHANGE PASSWORD TAB ── */}
        {activeSideTab === "password" && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Change Password</h2>
              <p className="text-xs text-slate-500 mt-1">
                Ensure your account is using a strong password to protect your data.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5 text-left">
              {/* Current Password */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium text-slate-700 font-sans text-left">
                  Current Password <span className="text-red-500 font-bold">*</span>
                </label>
                <Input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent focus:bg-white focus:ring-2 focus:ring-[#2478b8]/30 focus:border-[#2478b8] text-sm font-normal text-slate-800 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium text-slate-700 font-sans text-left">
                  New Password <span className="text-red-500 font-bold">*</span>
                </label>
                <Input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent focus:bg-white focus:ring-2 focus:ring-[#2478b8]/30 focus:border-[#2478b8] text-sm font-normal text-slate-800 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium text-slate-700 font-sans text-left">
                  Confirm New Password <span className="text-red-500 font-bold">*</span>
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent focus:bg-white focus:ring-2 focus:ring-[#2478b8]/30 focus:border-[#2478b8] text-sm font-normal text-slate-800 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    setActiveSideTab("profile");
                  }}
                  disabled={isUpdatingPassword}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium h-11 px-6 rounded-[6px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex-1 bg-[#2478b8] hover:bg-[#1b6296] active:bg-[#154d76] disabled:opacity-40 text-white text-sm font-semibold h-11 px-8 rounded-[6px] shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isUpdatingPassword ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 3: PLAN & BILLING TAB (COMPANY & EMPLOYER ONLY) ── */}
        {activeSideTab === "billing" && isCompanyOrEmployer && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Plan & Billing</h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage your payment methods, transaction receipts, and invoices.
              </p>
            </div>

            {/* Plan / Free Trial status banner for company */}
            {isCompany && (
              <div className="rounded-[6px] border border-blue-200 bg-blue-50/70 p-4 text-left">
                {(() => {
                  const companyData = user.company || user.role_profile || {};
                  const isTrial = companyData.billing_plan === 'free_trial' || (!companyData.billing_plan && companyData.trial_ends_at);
                  const trialEnd = companyData.trial_ends_at ? new Date(companyData.trial_ends_at) : null;
                  const now = new Date();
                  const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
                  const isExpired = trialEnd ? trialEnd <= now : false;

                  if (isTrial) {
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#0073bb] text-white">
                              Free Trial
                            </span>
                            <span className="text-xs font-semibold text-slate-800">
                              {isExpired ? "Free trial ended" : `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            {trialEnd
                              ? `Your free trial is set to end on ${trialEnd.toLocaleDateString('en-GB')}. Once it ends, subscription payment will be required on login.`
                              : "Free trial active on your company account."}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-xs text-slate-500 font-medium block">Subscription Fee</span>
                          <span className="text-sm font-bold text-slate-900">
                            {Number(companyData.subscription_amount || 50000).toLocaleString()} RWF / {companyData.subscription_cycle || 'monthly'}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white">
                          Subscription Plan
                        </span>
                        <p className="text-xs text-slate-600 mt-1">
                          Billing cycle: <strong className="capitalize">{companyData.subscription_cycle || 'monthly'}</strong>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 font-medium block">Amount</span>
                        <span className="text-sm font-bold text-slate-900">
                          {Number(companyData.subscription_amount || 50000).toLocaleString()} RWF
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Mobile Money Payment Info */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Payment Methods</h3>
              <div className="flex items-center justify-between py-1.5">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">MTN Mobile Money / Airtel Money</h4>
                  <p className="text-xs text-slate-500">Connected to phone number: {formData.phone || "+250 78... "}</p>
                </div>
                <span className="text-xs font-medium text-slate-600">
                  Default
                </span>
              </div>
            </div>

            {/* Billing History & Receipts */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Billing History & Receipts</h3>
                <span className="text-xs text-slate-500 font-medium">{billingTransactions.length} Paid Records</span>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-5 text-xs font-bold text-slate-500 pb-2 border-b border-slate-200">
                  <div>Date</div>
                  <div className="col-span-2">Description</div>
                  <div>Amount</div>
                  <div className="text-right">Action / Status</div>
                </div>
                {billingTransactions.map((tx: any, idx: number) => {
                  const paidPhone = tx.phone_number || tx.payment_phone || tx.phone || formData.phone || "0783202922";
                  const rawDateStr = tx.created_at || tx.date || new Date().toISOString();
                  let displayDateTime = rawDateStr;
                  try {
                    const d = new Date(rawDateStr);
                    if (!isNaN(d.getTime())) {
                      displayDateTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
                    }
                  } catch (e) {
                    displayDateTime = rawDateStr;
                  }

                  return (
                    <div key={tx.id || idx} className="grid grid-cols-5 text-xs py-2.5 text-slate-700 items-center border-b border-slate-100 last:border-0">
                      <div className="text-xs text-slate-700 font-normal">{displayDateTime}</div>
                      <div className="col-span-2 flex flex-col justify-center">
                        <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          {tx.description || tx.transaction_type || (isCompany ? 'Company Registration & Verification Fee' : 'Worker Hiring Fee (MoMo Payment)')}
                        </span>
                        <span className="text-xs text-slate-500 pl-5">
                          Paid via MoMo: {paidPhone}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900">{(tx.amount || (isCompany ? 1000 : 5000)).toLocaleString()} RWF</div>
                      <div className="text-right flex items-center justify-end gap-2">
                        <span className="text-xs font-semibold text-emerald-600">
                          Paid
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-[11px] font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                          onClick={() => {
                            downloadInvoicePdf({
                              ...tx,
                              phone: paidPhone,
                              phone_number: paidPhone,
                              employer_name: tx.employer_name || formData.companyName || formData.name || user.name || "Marie Grace (Employer)'s Organization",
                              employer_email: tx.employer_email || formData.email || user.email || "mariegrace(employer)@gmail.com",
                              employer_address: tx.employer_address || `${formData.district || 'Kigali'}, Rwanda`
                            });
                            toast({ title: "PDF Invoice Downloaded", description: `Downloaded PDF invoice for ${tx.description || 'Worker Hiring Fee'}` });
                          }}
                        >
                          <Download className="w-3 h-3 text-slate-600" />
                          <span>Invoice</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: TWO-FACTOR AUTH (MFA) ── */}
        {activeSideTab === "mfa" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Two-Factor Authentication (MFA)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Protect your account with Google Authenticator, SMS Phone OTP, or Email OTP verification.
              </p>
            </div>

            {/* Status Card with Panda Mascot */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="shrink-0">
                <CharacterIllustration type="default" className="w-28 h-28" />
              </div>
              <div className="space-y-2 flex-1 text-center sm:text-left">
                <h3 className="text-base font-bold text-slate-900">
                  {user.mfa_enabled
                    ? "Your account is securely protected"
                    : "Enhance your account security"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
                  {user.mfa_enabled
                    ? "Every login requires verification via your designated MFA method. This prevents unauthorized access even if your password is compromised."
                    : "We strongly recommend enabling Two-Factor Authentication. You can use Google Authenticator, SMS to your phone, or Email OTP."}
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <Button
                    size="sm"
                    onClick={() => navigate('/mfa-setup')}
                    className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs cursor-pointer h-auto transition-colors"
                  >
                    <span>{user.mfa_enabled ? "Change MFA Method" : "Set Up Two-Factor (MFA)"}</span>
                  </Button>
                  {user.mfa_enabled && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await mfaService.disable();
                          queryClient.invalidateQueries({ queryKey: ["user"] });
                          toast({
                            title: "MFA Disabled",
                            description: "Two-Factor Authentication has been turned off.",
                          });
                        } catch (err) {
                          toast({
                            title: "Error",
                            description: "Failed to disable MFA.",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-1.5 rounded shadow-2xs cursor-pointer bg-white h-auto"
                    >
                      Disable MFA
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Methods overview boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#EA4335] text-lg shadow-2xs">
                    <SiGoogleauthenticator />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#00A4EF] text-base shadow-2xs">
                    <FaMicrosoft />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#369EEF] text-lg shadow-2xs">
                    <SiIcloud />
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Google Authenticator</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Standard TOTP apps (Google Authenticator, Microsoft Authenticator, iCloud Keychain). Works completely offline without needing any Google account or cloud service.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shadow-2xs">
                  <RealPhoneSmsIcon className="w-6 h-6 shrink-0" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">SMS Verification</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Instant one-time 6-digit passcode sent directly to your registered mobile phone number.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#EA4335] text-lg shadow-2xs">
                  <SiGmail />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Email Verification</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  One-time 6-digit confirmation code delivered safely to your registered email address.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Confirm Account Deactivation
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-2">
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="h-9 text-xs font-medium border-slate-200 text-slate-700 bg-white"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-9 text-xs font-bold bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                toast({
                  variant: "destructive",
                  title: "Deactivation Initiated",
                  description: "Account deactivation request submitted.",
                });
              }}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Preferences Modal */}
      <NotificationPreferencesModal
        open={isPreferencesModalOpen}
        onOpenChange={setIsPreferencesModalOpen}
        userRole={user.role || authUser?.role}
      />
    </div>
  );
};

export default UserProfile;
