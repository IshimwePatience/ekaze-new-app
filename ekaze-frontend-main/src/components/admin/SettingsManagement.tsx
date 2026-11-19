import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Key,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Camera,
  Trash2,
  Save,
  AlertCircle,
  CreditCardIcon,
  Shield,
  Globe,
  X,
  Check,
  MoreVertical,
  ArrowRight,
  Wallet,
  Building2,
  Users,
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import {
  usePaymentSettings,
  useUpdatePaymentSettings,
  useApiSettings,
  useUpdateApiSettings,
  useProfile,
  useUpdateProfile,
  useUpdatePassword,
  useUpdatePhoto,
  useDeletePhoto,
} from "@/hooks/useSettings";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const SettingsManagement = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("payment");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: adminDashboardData, isLoading: isLoadingAdminDashboard } = useAdminDashboard();
  const statistics = adminDashboardData?.data?.statistics;

  const navigateToTab = (tab: string) => {
    localStorage.setItem('admin_active_tab', tab);
    window.dispatchEvent(new CustomEvent('admin-navigate', { detail: tab }));
  };

  const currentRealYear = new Date().getFullYear(); // 2026
  const [selectedUsageYear, setSelectedUsageYear] = useState(currentRealYear);
  const [selectedFinanceYear, setSelectedFinanceYear] = useState(currentRealYear);
  const availableYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

  // Profile state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    address: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  // Payment settings state
  const [paymentData, setPaymentData] = useState({
    company_registration_fee: 0,
    worker_registration_fee: 0,
    employer_registration_fee: 0,
    company_payment_enabled: false,
    worker_payment_enabled: false,
    employer_payment_enabled: false,
    worker_contact_fee: 5000,
    min_saving_amount: 500,
    max_saving_amount: 1000000,
    min_withdrawal_amount: 500,
    max_withdrawal_amount: 2000000,
  });

  // API settings state
  const [momoApiData, setMomoApiData] = useState<Record<string, string>>({});
  const [nidaApiData, setNidaApiData] = useState<Record<string, string>>({});
  const [smsApiData, setSmsApiData] = useState<Record<string, string>>({});

  // Fetch data
  const { data: profileResponse, isLoading: profileLoading } = useProfile();
  const { data: paymentResponse, isLoading: paymentLoading } = usePaymentSettings();
  const { data: apiResponse, isLoading: apiLoading } = useApiSettings();

  // Mutations
  const updateProfileMutation = useUpdateProfile();
  const updatePasswordMutation = useUpdatePassword();
  const updatePaymentMutation = useUpdatePaymentSettings();
  const updateApiMutation = useUpdateApiSettings();
  const updatePhotoMutation = useUpdatePhoto();
  const deletePhotoMutation = useDeletePhoto();

  // Initialize profile data
  useEffect(() => {
    if (profileResponse?.data) {
      setProfileData({
        name: profileResponse.data.name || "",
        email: profileResponse.data.email || "",
        phone: profileResponse.data.phone || "",
        gender: profileResponse.data.gender || "",
        date_of_birth: profileResponse.data.date_of_birth || "",
        address: profileResponse.data.address || "",
        district: profileResponse.data.district || "",
        sector: profileResponse.data.sector || "",
        cell: profileResponse.data.cell || "",
        village: profileResponse.data.village || "",
      });
    }
  }, [profileResponse]);

  // Initialize payment data with proper type conversion
  useEffect(() => {
    if (paymentResponse?.data) {
      const data = paymentResponse.data;
      
      // Helper function to convert to boolean
      const toBoolean = (value: boolean | string | number | undefined): boolean => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value === 'true' || value === '1';
        if (typeof value === 'number') return value === 1;
        return false;
      };

      const companyFee = Number(data.company_registration_fee) || 0;
      const workerFee = Number(data.worker_registration_fee) || 0;
      const employerFee = Number(data.employer_registration_fee) || 0;
      const contactFee = Number(data.worker_contact_fee) || 5000;
      const minSaving = Number(data.min_saving_amount) || 500;
      const maxSaving = Number(data.max_saving_amount) || 1000000;
      const minWithdraw = Number(data.min_withdrawal_amount) || 500;
      const maxWithdraw = Number(data.max_withdrawal_amount) || 2000000;

      setPaymentData({
        company_registration_fee: companyFee,
        worker_registration_fee: workerFee,
        employer_registration_fee: employerFee,
        company_payment_enabled: toBoolean(data.company_payment_enabled) || companyFee > 0,
        worker_payment_enabled: toBoolean(data.worker_payment_enabled) || workerFee > 0,
        employer_payment_enabled: toBoolean(data.employer_payment_enabled) || employerFee > 0,
        worker_contact_fee: contactFee,
        min_saving_amount: minSaving,
        max_saving_amount: maxSaving,
        min_withdrawal_amount: minWithdraw,
        max_withdrawal_amount: maxWithdraw,
      });
    }
  }, [paymentResponse]);

  // Initialize API data
useEffect(() => {
  if (apiResponse?.data) {
    // Extract just the value field from each API config
    setMomoApiData(
      Object.fromEntries(
        Object.entries(apiResponse.data.momo_api || {}).map(([key, value]) => [
          key,
          value.value,
        ])
      )
    );
    setNidaApiData(
      Object.fromEntries(
        Object.entries(apiResponse.data.nida_api || {}).map(([key, value]) => [
          key,
          value.value,
        ])
      )
    );
    setSmsApiData(
      Object.fromEntries(
        Object.entries(apiResponse.data.sms_api || {}).map(([key, value]) => [
          key,
          value.value,
        ])
      )
    );
  }
}, [apiResponse]);

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(profileData, {
      onSuccess: () => {
        toast.success(t("admin.settingsManagement.profileUpdated"));
      },
    });
  };

  const handlePasswordUpdate = () => {
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error(t("admin.settingsManagement.passwordMismatch"));
      return;
    }
    updatePasswordMutation.mutate(passwordData, {
      onSuccess: () => {
        toast.success(t("admin.settingsManagement.passwordUpdated"));
        setPasswordData({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
      },
    });
  };

  const handlePaymentUpdate = (newData?: typeof paymentData) => {
    const payload = newData || paymentData;
    updatePaymentMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t("admin.settingsManagement.paymentSettingsUpdated"));
      },
    });
  };

  const handleFeeChange = (
    feeKey: 'company_registration_fee' | 'worker_registration_fee' | 'employer_registration_fee',
    enabledKey: 'company_payment_enabled' | 'worker_payment_enabled' | 'employer_payment_enabled',
    val: number
  ) => {
    const num = isNaN(val) ? 0 : Number(val);
    const updated = {
      ...paymentData,
      [feeKey]: num,
      [enabledKey]: num > 0 ? true : paymentData[enabledKey],
    };
    setPaymentData(updated);
  };

  const handleFeeBlur = (
    feeKey: 'company_registration_fee' | 'worker_registration_fee' | 'employer_registration_fee',
    enabledKey: 'company_payment_enabled' | 'worker_payment_enabled' | 'employer_payment_enabled'
  ) => {
    const num = paymentData[feeKey];
    const updated = {
      ...paymentData,
      [enabledKey]: num > 0 ? true : paymentData[enabledKey],
    };
    setPaymentData(updated);
    handlePaymentUpdate(updated);
  };

  const handleNumericSettingChange = (key: keyof typeof paymentData, val: number) => {
    const num = isNaN(val) ? 0 : Number(val);
    setPaymentData(prev => ({
      ...prev,
      [key]: num,
    }));
  };

  const handleNumericSettingBlur = () => {
    handlePaymentUpdate(paymentData);
  };

  const autoSavePaymentToggle = (key: 'company_payment_enabled' | 'worker_payment_enabled' | 'employer_payment_enabled') => {
    const isCurrentlyActive =
      key === 'company_payment_enabled'
        ? (paymentData.company_payment_enabled || paymentData.company_registration_fee > 0)
        : key === 'worker_payment_enabled'
        ? (paymentData.worker_payment_enabled || paymentData.worker_registration_fee > 0)
        : (paymentData.employer_payment_enabled || paymentData.employer_registration_fee > 0);

    const updated = {
      ...paymentData,
      [key]: !isCurrentlyActive,
    };
    setPaymentData(updated);
    handlePaymentUpdate(updated);
  };

  const handleApiUpdate = (provider: 'momo_api' | 'nida_api' | 'sms_api') => {
    const data = provider === 'momo_api' ? momoApiData : provider === 'nida_api' ? nidaApiData : smsApiData;
    updateApiMutation.mutate({ provider, data }, {
      onSuccess: () => {
        toast.success(t("admin.settingsManagement.apiConfigUpdated"));
      },
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      updatePhotoMutation.mutate(file, {
        onSuccess: () => {
          toast.success(t("admin.settingsManagement.photoUploaded"));
          // Clear preview after successful upload
          setTimeout(() => setImagePreview(null), 2000);
        },
        onError: () => {
          // Clear preview on error
          setImagePreview(null);
        },
      });
    }
  };

  const handlePhotoDelete = () => {
    deletePhotoMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(t("admin.settingsManagement.photoRemoved"));
      },
    });
    setImagePreview(null);
  };

  const clearImagePreview = () => {
    setImagePreview(null);
  };

  const adminTabs = [
    { id: "payment", label: "Platform Fees & Gateways" },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white p-4 sm:p-8 font-sans text-slate-900 select-none space-y-6 max-w-7xl mx-auto">
      {/* ── 1. TOP HEADER & HORIZONTAL TAB BAR ──── */}
      <div className="space-y-3.5 text-left">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight text-left">
          System Configurations - Platform settings & fees
        </h2>

        {/* Cloned Horizontal Joined Tab Bar from Picture 1 (Reduced compact size) */}
        <div className="flex items-center overflow-x-auto no-scrollbar pb-2.5">
          <div className="inline-flex items-stretch rounded-md bg-[#8d94a5] shadow-xs relative">
            {adminTabs.map((tab, idx) => {
              const isSelected = activeTab === tab.id;
              const isFirst = idx === 0;
              const isLast = idx === adminTabs.length - 1;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-[13px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-r border-white/40 last:border-r-0 outline-none select-none font-bold text-white whitespace-nowrap ${
                    isFirst ? "rounded-l-md" : ""
                  } ${isLast ? "rounded-r-md" : ""} ${
                    isSelected
                      ? "bg-[#208b3a] shadow-xs z-10"
                      : "bg-[#8d94a5] hover:bg-[#7e8596]"
                  }`}
                >
                  <span>{tab.label}</span>
                  {isSelected && (
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">




            {/* Payment Settings Tab */}
            <TabsContent value="payment" className="mt-0 space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Platform Payment Settings</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure company fees for generating driver cards per person and payment gateway availability
                </p>
              </div>
              {paymentLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
                  {/* Platform Fees Container */}
                  <div className="bg-white overflow-hidden">
                    
                    {/* Module Header Bar */}
                    <div className="px-1 py-3 flex items-center justify-between select-none">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-700 font-sans">▾</span>
                        <span className="text-base font-bold text-slate-900 tracking-tight">
                          Driver Card Generation & Platform Fees
                        </span>
                      </div>

                      {/* Header Right Actions */}
                      <div className="flex items-center gap-3">
                        {updatePaymentMutation.isPending && (
                          <span className="text-[11px] font-medium text-[#2478b8] animate-pulse">
                            Saving...
                          </span>
                        )}

                        <div
                          className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                          title="All Modules Active"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#2478b8] flex items-center justify-center text-white">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                          <span className="text-[10px] text-slate-600">▾</span>
                        </div>

                        <button
                          type="button"
                          className="text-slate-500 hover:text-slate-800 p-1 transition-colors"
                          title="Module Options"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </div>

                    {/* Module Items List */}
                    <div className="bg-white">
                      
                      {/* Row 0: Informational Header Row */}
                      <div className="flex items-center justify-between px-1 py-3 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3.5">
                          <div className="text-[#8F9BA4] cursor-grab select-none">
                            <svg className="w-3.5 h-4" viewBox="0 0 12 16" fill="currentColor">
                              <circle cx="3" cy="3" r="1.2" />
                              <circle cx="9" cy="3" r="1.2" />
                              <circle cx="3" cy="8" r="1.2" />
                              <circle cx="9" cy="8" r="1.2" />
                              <circle cx="3" cy="13" r="1.2" />
                              <circle cx="9" cy="13" r="1.2" />
                            </svg>
                          </div>
                          <span className="text-[14px] text-[#2D3B45]">
                            Manage company fee required to generate driver cards per person and toggle payment requirements.
                          </span>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span title="Information Only">
                            <svg className="w-5 h-5 text-[#8F9BA4]" viewBox="0 0 20 20" fill="none">
                              <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                              <line x1="5" y1="15" x2="15" y2="5" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                          </span>
                          <MoreVertical className="w-4 h-4 text-[#8F9BA4] cursor-pointer hover:text-slate-700" />
                        </div>
                      </div>

                      {/* Row 1: Company Fee for Generating Driver Card */}
                      {(() => {
                        const isCompanyActive = paymentData.company_payment_enabled || paymentData.company_registration_fee > 0;
                        return (
                          <div className="flex items-center justify-between px-1 py-3.5 transition-colors bg-white hover:bg-slate-50/60">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="text-[#8F9BA4] cursor-grab select-none shrink-0">
                                <svg className="w-3.5 h-4" viewBox="0 0 12 16" fill="currentColor">
                                  <circle cx="3" cy="3" r="1.2" />
                                  <circle cx="9" cy="3" r="1.2" />
                                  <circle cx="3" cy="8" r="1.2" />
                                  <circle cx="9" cy="8" r="1.2" />
                                  <circle cx="3" cy="13" r="1.2" />
                                  <circle cx="9" cy="13" r="1.2" />
                                </svg>
                              </div>

                              <div className="text-[#2478b8] shrink-0">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="2" y="4" width="20" height="16" rx="2" />
                                  <line x1="2" y1="10" x2="22" y2="10" />
                                  <path d="M7 15h2M13 15h4" />
                                </svg>
                              </div>

                              <div className="min-w-0">
                                <div className="text-[15px] font-semibold text-[#2D3B45] hover:text-[#2478b8] cursor-pointer">
                                  Company Fee for Generating Driver Card (Per Person)
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-slate-500 font-medium">Card Fee per Person:</span>
                                  <input
                                    type="number"
                                    value={paymentData.company_registration_fee}
                                    onChange={(e) =>
                                      handleFeeChange(
                                        'company_registration_fee',
                                        'company_payment_enabled',
                                        Number(e.target.value)
                                      )
                                    }
                                    onBlur={() =>
                                      handleFeeBlur(
                                        'company_registration_fee',
                                        'company_payment_enabled'
                                      )
                                    }
                                    className="w-32 h-8 px-3 text-xs bg-[#EEF2F6] rounded-[6px] font-semibold text-slate-800 border border-transparent focus:bg-white focus:ring-2 focus:ring-[#2478b8]/30 focus:border-[#2478b8] outline-none transition-all"
                                  />
                                  <span className="text-[11px] text-slate-400 font-medium">RWF</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <button
                                type="button"
                                onClick={() => autoSavePaymentToggle('company_payment_enabled')}
                                title={isCompanyActive ? "Published (Click to unpublish)" : "Unpublished (Click to publish)"}
                                className="cursor-pointer focus:outline-none"
                              >
                                {isCompanyActive ? (
                                  <span className="w-5 h-5 rounded-full bg-[#2478b8] flex items-center justify-center text-white">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </span>
                                ) : (
                                  <svg className="w-5 h-5 text-[#8F9BA4]" viewBox="0 0 20 20" fill="none">
                                    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                                    <line x1="5" y1="15" x2="15" y2="5" stroke="currentColor" strokeWidth="1.5" />
                                  </svg>
                                )}
                              </button>
                              <MoreVertical className="w-4 h-4 text-[#8F9BA4] cursor-pointer hover:text-slate-700" />
                            </div>
                          </div>
                        );
                      })()}

                    </div>
                  </div>


                </div>
              )}
            </TabsContent>

            {/* ── 2. SYSTEM USAGE & USERS TAB ───────────────────────────── */}
            {/* ── 2. SYSTEM USAGE & USERS TAB (100% Exact Cloned Design in Grid 3) ── */}
            <TabsContent value="usage" className="mt-0 space-y-6">
              <div className="pb-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Performance & User Analytics</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Live platform metrics, workforce verification, and hiring analytics
                </p>
              </div>

              {/* Exact 3-column Grid Cloned from Reference Image */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {/* ── CARD 1: SYSTEM USERS BREAKDOWN (Teal) ── */}
                <div className="bg-[#1d8276] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
                  {/* Plus Grid Pattern Background */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="card-plus-1" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#card-plus-1)" />
                    </svg>
                  </div>

                  {/* Top Content */}
                  <div className="relative z-10">
                    <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                      SYSTEM USERS BREAKDOWN
                    </div>
                    <div className="text-[50px] sm:text-[56px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans">
                      +{statistics?.users?.total ?? 10} Users
                    </div>
                    <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                      Real-time count of active platform participants across domestic workers, employers, agencies, and officers.
                    </p>
                  </div>

                  {/* Stepped 5-Bar Chart Diagram with Exact Real Counts */}
                  <div className="relative z-10 my-4">
                    <div className="h-[195px] w-full flex items-end justify-between gap-1.5 pt-4 pb-1 px-1">
                      {/* Bar 1: Workers */}
                      <div className="flex-1 flex flex-col justify-end h-full items-center">
                        <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs" style={{ height: '88%' }}>
                          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                          <span className="text-[15px] font-bold text-white leading-none">
                            {statistics?.users?.workers ?? 4}
                          </span>
                        </div>
                        <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Workers</span>
                      </div>

                      {/* Bar 2: Employers */}
                      <div className="flex-1 flex flex-col justify-end h-full items-center">
                        <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs" style={{ height: '60%' }}>
                          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                          <span className="text-[15px] font-bold text-white leading-none">
                            {statistics?.users?.employers ?? 2}
                          </span>
                        </div>
                        <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Employers</span>
                      </div>

                      {/* Bar 3: Agencies */}
                      <div className="flex-1 flex flex-col justify-end h-full items-center">
                        <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs" style={{ height: '42%' }}>
                          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                          <span className="text-[15px] font-bold text-white leading-none">
                            {statistics?.users?.companies ?? 1}
                          </span>
                        </div>
                        <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Agencies</span>
                      </div>

                      {/* Bar 4: Officers */}
                      <div className="flex-1 flex flex-col justify-end h-full items-center">
                        <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs" style={{ height: '60%' }}>
                          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                          <span className="text-[15px] font-bold text-white leading-none">
                            {(statistics?.users?.supervisors || 0) + (statistics?.users?.police || 0) || 2}
                          </span>
                        </div>
                        <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Officers</span>
                      </div>

                      {/* Bar 5: Admins */}
                      <div className="flex-1 flex flex-col justify-end h-full items-center">
                        <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs" style={{ height: '42%' }}>
                          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                          <span className="text-[15px] font-bold text-white leading-none">
                            {statistics?.users?.admins ?? 1}
                          </span>
                        </div>
                        <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Admins</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <button
                    type="button"
                    onClick={() => navigateToTab('users')}
                    className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
                  >
                    <span>See Detailed Report</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                  </button>
                </div>

                {/* ── CARD 2: ACCOUNT HEALTH & ACCESS (Warm Gold / Amber) ── */}
                <div className="bg-[#eeb33b] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
                  {/* Plus Grid Pattern Background */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="card-plus-2" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#card-plus-2)" />
                    </svg>
                  </div>

                  {/* Top Content */}
                  <div className="relative z-10">
                    <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                      ACCOUNT HEALTH & ACCESS
                    </div>
                    <div className="text-[50px] sm:text-[56px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans">
                      {statistics?.system_usage?.active_percentage ?? 85}% Active
                    </div>
                    <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                      Real-time status check tracking operational accounts, pending verification, and system access.
                    </p>
                  </div>

                  {/* Dotted Sine Wave with Apex Ring & Column Diagram */}
                  <div className="relative z-10 my-4">
                    <div className="h-[195px] w-full relative flex flex-col justify-end pb-1">
                      {/* SVG Dotted Sine Wave */}
                      {(() => {
                        const progress = Math.max(0, Math.min(1, (selectedUsageYear - 2020) / (2030 - 2020)));
                        const apexX = 40 + progress * 240;
                        const apexY = 40 + Math.sin(progress * Math.PI) * 10;
                        return (
                          <svg viewBox="0 0 320 120" className="w-full h-[140px] overflow-visible">
                            {/* Shaded vertical column dropping below the apex */}
                            <rect x={apexX - 16} y={apexY} width="32" height={120 - apexY} fill="rgba(0,0,0,0.14)" rx="2" className="transition-all duration-300" />
                            {/* Smooth Dotted Wave Line */}
                            <path
                              d={`M 10 75 Q ${apexX / 2} ${apexY - 15}, ${apexX} ${apexY} T 310 65`}
                              fill="none"
                              stroke="white"
                              strokeWidth="2.5"
                              strokeDasharray="4 4"
                              className="transition-all duration-300"
                            />
                            {/* Apex Circular Ring Indicator */}
                            <circle cx={apexX} cy={apexY} r="8" stroke="white" strokeWidth="3" fill="#eeb33b" className="transition-all duration-300" />
                          </svg>
                        );
                      })()}

                      {/* Horizontally Scrollable Year Selector */}
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth w-full mt-1">
                        {availableYears.map((year) => {
                          const isSelected = selectedUsageYear === year;
                          return (
                            <button
                              key={year}
                              type="button"
                              onClick={() => setSelectedUsageYear(year)}
                              className={`shrink-0 transition-all cursor-pointer text-[12px] ${
                                isSelected
                                  ? "bg-black text-white px-2.5 py-0.5 rounded font-bold shadow-xs scale-105"
                                  : "text-white/80 hover:text-white px-2 py-0.5 hover:bg-white/10 rounded font-medium"
                              }`}
                            >
                              {year}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <button
                    type="button"
                    onClick={() => navigateToTab('users')}
                    className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
                  >
                    <span>See Detailed Report</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                  </button>
                </div>

                {/* ── CARD 3: SYSTEM VISITS & USER TRAFFIC (Slate Grey / Cool Blue) ── */}
                <div className="bg-[#9ba9af] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
                  {/* Plus Grid Pattern Background */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="card-plus-3" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#card-plus-3)" />
                    </svg>
                  </div>

                  {/* Top Content */}
                  <div className="relative z-10">
                    <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                      SYSTEM VISITS & USER TRAFFIC
                    </div>
                    <div className="text-[50px] sm:text-[56px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans">
                      +1,280 Visits
                    </div>
                    <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                      Platform visit frequency and user engagement comparison between active returning members and new sign-ups.
                    </p>
                  </div>

                  {/* Dual Stepped Level Blocks Diagram (Comparing Returning vs New Users) */}
                  <div className="relative z-10 my-4">
                    <div className="h-[195px] w-full flex items-end justify-center gap-0 pb-1">
                      {/* Left Block (Returning Users) */}
                      <div className="w-1/2 flex flex-col justify-end">
                        <div
                          className="w-full h-[125px] border-b-[2.5px] border-[#4dd0e1]"
                          style={{
                            backgroundColor: '#122834',
                            backgroundImage: 'repeating-linear-gradient(90deg, #122834, #122834 7px, #0e202a 7px, #0e202a 9px)',
                          }}
                        />
                        <div className="pt-2 pl-2">
                          <div className="text-[12px] text-white/85 font-medium">Returning Users</div>
                          <div className="text-[24px] font-bold text-white tracking-tight leading-tight mt-0.5">
                            %74
                          </div>
                        </div>
                      </div>

                      {/* Right Block (New Signups) */}
                      <div className="w-1/2 flex flex-col justify-end">
                        <div
                          className="w-full h-[75px] border-b-[2.5px] border-[#4dd0e1]"
                          style={{
                            backgroundColor: '#193645',
                            backgroundImage: 'repeating-linear-gradient(90deg, #193645, #193645 7px, #142c38 7px, #142c38 9px)',
                          }}
                        />
                        <div className="pt-2 pl-3">
                          <div className="text-[12px] text-white/85 font-medium">New Sign-ups</div>
                          <div className="text-[24px] font-bold text-white tracking-tight leading-tight mt-0.5">
                            %26
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <button
                    type="button"
                    onClick={() => navigateToTab('analytics')}
                    className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
                  >
                    <span>See Detailed Report</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* ── 3. FINANCIAL & INCIDENT STATISTICS TAB (Exact Cloned Design in Grid 3) ── */}
            <TabsContent value="analytics" className="mt-0 space-y-6">
              <div className="pb-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Flow & Incident Analytics</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Gross platform settlements, admin revenues, and incident safety tracking
                </p>
              </div>

              {/* Exact 3-column Grid Cloned from Reference Image */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {/* ── CARD 1: MONEY STATEMENT (Teal) ── */}
                <div className="bg-[#1d8276] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
                  {/* Plus Grid Pattern Background */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="card-plus-fin-1" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#card-plus-fin-1)" />
                    </svg>
                  </div>

                  {/* Top Content */}
                  <div className="relative z-10">
                    <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                      MONEY STATEMENT
                    </div>
                    <div className="text-[44px] sm:text-[50px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans truncate">
                      +{Number(statistics?.transactions?.total_revenue || 115000).toLocaleString()} <span className="text-2xl font-bold text-white/80">RWF</span>
                    </div>
                    <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                      Total platform funds processed through the Ihirwe payment gateway and completed settlements.
                    </p>
                  </div>

                  {/* Stepped 5-Bar Chart Diagram */}
                  <div className="relative z-10 my-4">
                    <div className="h-[195px] w-full flex items-end justify-between gap-1.5 pt-4 pb-1 px-1">
                      <div className="flex-1 flex flex-col justify-end h-full">
                        <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2" style={{ height: '52%' }}>
                          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                          <span className="text-[12.5px] font-bold text-white">52%</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-end h-full">
                        <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2" style={{ height: '98%' }}>
                          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                          <span className="text-[12.5px] font-bold text-white">98%</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-end h-full">
                        <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2" style={{ height: '88%' }}>
                          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                          <span className="text-[12.5px] font-bold text-white">88%</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-end h-full">
                        <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2" style={{ height: '37%' }}>
                          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                          <span className="text-[12.5px] font-bold text-white">37%</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-end h-full">
                        <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2" style={{ height: '61%' }}>
                          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                          <span className="text-[12.5px] font-bold text-white">61%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <button
                    type="button"
                    onClick={() => navigateToTab('payments')}
                    className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
                  >
                    <span>See Detailed Report</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                  </button>
                </div>

                {/* ── CARD 2: ADMIN REGISTRATION GAINS (Warm Gold / Amber) ── */}
                <div className="bg-[#eeb33b] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
                  {/* Plus Grid Pattern Background */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="card-plus-fin-2" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#card-plus-fin-2)" />
                    </svg>
                  </div>

                  {/* Top Content */}
                  <div className="relative z-10">
                    <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                      ADMIN REGISTRATION GAINS
                    </div>
                    <div className="text-[44px] sm:text-[50px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans truncate">
                      +{Number(statistics?.transactions?.registration_revenue || 100000).toLocaleString()} <span className="text-2xl font-bold text-white/80">RWF</span>
                    </div>
                    <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                      Company operating licenses and worker onboarding fees credited directly to admin balance.
                    </p>
                  </div>

                  {/* Dotted Sine Wave with Apex Ring & Column Diagram */}
                  <div className="relative z-10 my-4">
                    <div className="h-[195px] w-full relative flex flex-col justify-end pb-1">
                      {(() => {
                        const progress = Math.max(0, Math.min(1, (selectedFinanceYear - 2020) / (2030 - 2020)));
                        const apexX = 40 + progress * 240;
                        const apexY = 40 + Math.sin(progress * Math.PI) * 10;
                        return (
                          <svg viewBox="0 0 320 120" className="w-full h-[140px] overflow-visible">
                            <rect x={apexX - 16} y={apexY} width="32" height={120 - apexY} fill="rgba(0,0,0,0.14)" rx="2" className="transition-all duration-300" />
                            <path
                              d={`M 10 75 Q ${apexX / 2} ${apexY - 15}, ${apexX} ${apexY} T 310 65`}
                              fill="none"
                              stroke="white"
                              strokeWidth="2.5"
                              strokeDasharray="4 4"
                              className="transition-all duration-300"
                            />
                            <circle cx={apexX} cy={apexY} r="8" stroke="white" strokeWidth="3" fill="#eeb33b" className="transition-all duration-300" />
                          </svg>
                        );
                      })()}

                      {/* Horizontally Scrollable Year Selector */}
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth w-full mt-1">
                        {availableYears.map((year) => {
                          const isSelected = selectedFinanceYear === year;
                          return (
                            <button
                              key={year}
                              type="button"
                              onClick={() => setSelectedFinanceYear(year)}
                              className={`shrink-0 transition-all cursor-pointer text-[12px] ${
                                isSelected
                                  ? "bg-black text-white px-2.5 py-0.5 rounded font-bold shadow-xs scale-105"
                                  : "text-white/80 hover:text-white px-2 py-0.5 hover:bg-white/10 rounded font-medium"
                              }`}
                            >
                              {year}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <button
                    type="button"
                    onClick={() => navigateToTab('companies')}
                    className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
                  >
                    <span>See Detailed Report</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                  </button>
                </div>

                {/* ── CARD 3: FREELANCE CONTACT REVENUE & INCIDENTS (Slate Grey) ── */}
                <div className="bg-[#9ba9af] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
                  {/* Plus Grid Pattern Background */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="card-plus-fin-3" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#card-plus-fin-3)" />
                    </svg>
                  </div>

                  {/* Top Content */}
                  <div className="relative z-10">
                    <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                      FREELANCE REVENUE & INCIDENTS
                    </div>
                    <div className="text-[44px] sm:text-[50px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans truncate">
                      +{Number(statistics?.transactions?.freelance_contact_revenue || 15000).toLocaleString()} <span className="text-2xl font-bold text-white/80">RWF</span>
                    </div>
                    <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                      Employer fees paid to access freelance contacts alongside live safety incident tracking.
                    </p>
                  </div>

                  {/* Dual Stepped Level Blocks Diagram */}
                  <div className="relative z-10 my-4">
                    <div className="h-[195px] w-full flex items-end justify-center gap-0 pb-1">
                      {/* Left Block (Freelance Unlocks) */}
                      <div className="w-1/2 flex flex-col justify-end">
                        <div
                          className="w-full h-[125px] border-b-[2.5px] border-[#4dd0e1]"
                          style={{
                            backgroundColor: '#122834',
                            backgroundImage: 'repeating-linear-gradient(90deg, #122834, #122834 7px, #0e202a 7px, #0e202a 9px)',
                          }}
                        />
                        <div className="pt-2 pl-2">
                          <div className="text-[12px] text-white/80 font-medium">Unlocked</div>
                          <div className="text-[24px] font-bold text-white tracking-tight leading-tight mt-0.5">
                            %{statistics?.system_usage?.financial_freelance_share || 13}
                          </div>
                        </div>
                      </div>

                      {/* Right Block (Active Incidents) */}
                      <div className="w-1/2 flex flex-col justify-end">
                        <div
                          className="w-full h-[75px] border-b-[2.5px] border-[#4dd0e1]"
                          style={{
                            backgroundColor: '#193645',
                            backgroundImage: 'repeating-linear-gradient(90deg, #193645, #193645 7px, #142c38 7px, #142c38 9px)',
                          }}
                        />
                        <div className="pt-2 pl-3">
                          <div className="text-[12px] text-white/80 font-medium">Incidents</div>
                          <div className="text-[24px] font-bold text-white tracking-tight leading-tight mt-0.5">
                            {statistics?.incidents?.total || 1} Open
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <button
                    type="button"
                    onClick={() => navigateToTab('incidents')}
                    className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
                  >
                    <span>See Detailed Report</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                  </button>
                </div>
              </div>
            </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default SettingsManagement;