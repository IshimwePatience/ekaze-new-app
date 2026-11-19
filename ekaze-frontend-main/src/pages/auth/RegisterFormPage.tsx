import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DedicatedFormPage,
  FormField,
  FormInput,
  FormSelect,
} from "@/components/common/DedicatedFormPage";
import {
  useProvinces,
  useDistricts,
  useSectors,
  useCells,
  useVillages,
} from "@/hooks/useLocations";
import { useNidaCheck, useNidaVerify } from "@/hooks/useNida";
import { useRegistrationPrefill } from "@/hooks/useRegistration";
import { useToast } from "@/hooks/use-toast";
import {
  useRegisterWorker,
  useRegisterEmployer,
  useRegisterCompany,
} from "@/hooks/useRegistration";
import {
  Languages,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import api from "@/lib/api";

const languages = [
  { code: "kin" as const, label: "Kinyarwanda", short: "KIN" },
  { code: "eng" as const, label: "English", short: "EN" },
];

const WORKER_PROFESSIONS = [
  "Housekeeper / Maid",
  "Nanny / Babysitter",
  "Cook / Chef",
  "Driver",
  "Security Guard",
  "Gardener",
  "Electrician",
  "Plumber",
  "Construction Worker / Mason",
  "Carpenter",
  "Painter",
  "Cleaner",
  "Waiter / Waitress",
  "Caregiver / Elderly Care",
  "Tailor",
  "Other Skills",
];

export const RegisterFormPage: React.FC = () => {
  const { type = "worker" } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const currentLanguage = languages.find((l) => l.code === language);

  const registerWorker = useRegisterWorker();
  const registerEmployer = useRegisterEmployer();
  const registerCompany = useRegisterCompany();

  const isSubmitting =
    registerWorker.isPending || registerEmployer.isPending || registerCompany.isPending;

  // Step index: 0: Identity Verification, 1: Personal & Account, 2: Address & Location, 3: Preferences (Worker only)
  const [currentStep, setCurrentStep] = useState(0);

  // Document type: 'nida' | 'passport'
  const [documentType, setDocumentType] = useState<"nida" | "passport">("nida");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportReady, setPassportReady] = useState(false);

  // Profile photo (MANDATORY)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Phone OTP Verification (6 digits)
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [phoneSendingOtp, setPhoneSendingOtp] = useState(false);
  const [phoneVerifyingOtp, setPhoneVerifyingOtp] = useState(false);

  // Email OTP Verification (6 digits)
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [emailSendingOtp, setEmailSendingOtp] = useState(false);
  const [emailVerifyingOtp, setEmailVerifyingOtp] = useState(false);

  // NIDA verification state (same exact logic as all original forms)
  const [nidCheckPassed, setNidCheckPassed] = useState(false);
  const [nidaVerified, setNidaVerified] = useState(false);
  const [nidaVerifyField, setNidaVerifyField] = useState<"fullname" | "date_of_birth">("fullname");
  const [nidaVerifyValue, setNidaVerifyValue] = useState("");
  const [nidaVerifyDob, setNidaVerifyDob] = useState("");
  const [nidaError, setNidaError] = useState("");
  const prevNidRef = useRef("");

  const { mutateAsync: nidaCheck, isPending: nidaCheckLoading } = useNidaCheck();
  const { mutate: nidaVerifyMutate, isPending: nidaVerifyLoading } = useNidaVerify();
  const { mutate: fetchPrefill } = useRegistrationPrefill();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    national_id: "",
    gender: "female" as "male" | "female",
    date_of_birth: "2000-01-01",
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    // Worker specific
    profession: "Housekeeper / Maid",
    experience_level: "intermediate" as "beginner" | "intermediate" | "expert",
    work_type: "full_time",
    min_salary: "60000",
    max_salary: "120000",
    languages_spoken: ["Kinyarwanda"],
    has_insurance: false,
    insurance_type: "MITUELLE_DE_SANTE",
    insurance_provider: "",
    insurance_number: "",
    // Company specific
    business_name: "",
    tin: "",
    rdb_registration_number: "",
    // Employer specific
    disclaimer_accepted: true,
  });

  // Cascading locations
  const { data: provinces = [] } = useProvinces();
  const { data: districts = [] } = useDistricts(formData.province);
  const { data: sectors = [] } = useSectors(formData.district);
  const { data: cells = [] } = useCells(formData.sector, formData.district);
  const { data: villages = [] } = useVillages(formData.cell, formData.sector);

  const handleLocationChange = (level: "province" | "district" | "sector" | "cell" | "village", value: string) => {
    if (level === "province") {
      setFormData((prev) => ({
        ...prev,
        province: value,
        district: "",
        sector: "",
        cell: "",
        village: "",
      }));
    } else if (level === "district") {
      setFormData((prev) => ({
        ...prev,
        district: value,
        sector: "",
        cell: "",
        village: "",
      }));
    } else if (level === "sector") {
      setFormData((prev) => ({
        ...prev,
        sector: value,
        cell: "",
        village: "",
      }));
    } else if (level === "cell") {
      setFormData((prev) => ({
        ...prev,
        cell: value,
        village: "",
      }));
    } else if (level === "village") {
      setFormData((prev) => ({
        ...prev,
        village: value,
      }));
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setProfilePhoto(reader.result);
        toast({
          title: "Profile photo uploaded",
          description: "Picture successfully attached to your profile.",
          variant: "success",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-check NID at 16 digits
  useEffect(() => {
    if (documentType !== "nida") return;
    const current = formData.national_id;
    const prev = prevNidRef.current;
    if (current === prev) return;
    prevNidRef.current = current;

    if (nidCheckPassed || nidaVerified) {
      setNidCheckPassed(false);
      setNidaVerified(false);
      setNidaVerifyValue("");
      setNidaVerifyDob("");
      setNidaError("");
    }

    if (current.length === 16) {
      triggerNidaCheck(current);
    }
  }, [formData.national_id, documentType]);

  const triggerNidaCheck = async (nid: string) => {
    setNidaError("");
    try {
      const json = await nidaCheck(nid);
      if (json.success && json.exists) {
        const field = Math.random() < 0.5 ? "fullname" : "date_of_birth";
        setNidaVerifyField(field);
        setNidaVerifyValue("");
        setNidaVerifyDob("");
        setNidaError("");
        setNidCheckPassed(true);
      } else {
        setNidaError(json.message || "NID not found in registry. Please check the 16 digits.");
      }
    } catch (e: any) {
      setNidaError(e?.response?.data?.message || "Failed to check NID. Please try again.");
    }
  };

  // Helper to normalize Rwandan phone to full 10-digit format starting with 07
  const normalizeRwandaPhone10 = (raw: string) => {
    const clean = String(raw || "").replace(/\D/g, "");
    if (clean.startsWith("250") && clean.length >= 11) {
      return "0" + clean.slice(3);
    }
    if (clean.startsWith("7") && clean.length >= 9) {
      return "0" + clean;
    }
    if (clean.startsWith("0") && clean.length >= 10) {
      return clean;
    }
    return clean.startsWith("7") ? "0" + clean : clean;
  };

  const toInternationalPhone250 = (raw: string) => {
    const clean = String(raw || "").replace(/\D/g, "");
    if (clean.startsWith("250")) return clean;
    if (clean.startsWith("0")) return "250" + clean.slice(1);
    if (clean.startsWith("7")) return "250" + clean;
    return clean;
  };

  // Send 6-digit SMS OTP to Phone
  const handleSendPhoneCode = async () => {
    const rawPhone = formData.phone.trim();
    if (!rawPhone || rawPhone.length < 8) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a valid phone number before verifying.",
        variant: "destructive",
      });
      return;
    }

    const local10Digits = normalizeRwandaPhone10(rawPhone);
    const international = toInternationalPhone250(local10Digits);

    // Automatically normalize the state to full 10-digit phone starting with 07
    handleChange("phone", local10Digits);

    setPhoneSendingOtp(true);
    try {
      const res = await api.post("/auth/send-verification-code", {
        type: "phone",
        target: international,
      });
      if (res.data?.success) {
        setPhoneOtpSent(true);
        setPhoneOtpCode("");
        if (res.data?.warning) {
          toast({
            title: "SMS Gateway Notice",
            description: res.data.message || res.data.warning,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Verification Code Sent",
            description: `A 6-digit code has been sent via SMS to ${local10Digits}.`,
            variant: "success",
          });
        }
      } else {
        toast({
          title: "Error Sending Code",
          description: res.data?.message || "Could not dispatch SMS. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Phone Verification Error",
        description: err?.response?.data?.message || "This phone number is already registered or invalid.",
        variant: "destructive",
      });
    } finally {
      setPhoneSendingOtp(false);
    }
  };

  // Confirm 6-digit SMS OTP
  const handleVerifyPhoneCode = async () => {
    if (phoneOtpCode.trim().length !== 6) {
      toast({
        title: "6-Digit Code Required",
        description: "Please enter the complete 6-digit code sent to your phone.",
        variant: "destructive",
      });
      return;
    }

    const rawPhone = formData.phone.trim();
    const local10Digits = normalizeRwandaPhone10(rawPhone);
    const international = toInternationalPhone250(local10Digits);

    setPhoneVerifyingOtp(true);
    try {
      const res = await api.post("/auth/verify-verification-code", {
        type: "phone",
        target: international,
        code: phoneOtpCode.trim(),
      });
      if (res.data?.success && res.data?.verified) {
        setPhoneVerified(true);
        setPhoneOtpSent(false);
        handleChange("phone", local10Digits);
        toast({
          title: "Phone Verified",
          description: `Phone ${local10Digits} has been verified successfully.`,
          variant: "success",
        });
      } else {
        toast({
          title: "Invalid Code",
          description: res.data?.message || "Invalid 6-digit verification code.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err?.response?.data?.message || "Invalid code.",
        variant: "destructive",
      });
    } finally {
      setPhoneVerifyingOtp(false);
    }
  };

  // Send 6-digit Email OTP
  const handleSendEmailCode = async () => {
    const rawEmail = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rawEmail || !emailRegex.test(rawEmail)) {
      toast({
        title: "Valid Email Required",
        description: "Please enter a valid email address before verifying.",
        variant: "destructive",
      });
      return;
    }

    setEmailSendingOtp(true);
    try {
      const res = await api.post("/auth/send-verification-code", {
        type: "email",
        target: rawEmail,
      });
      if (res.data?.success) {
        setEmailOtpSent(true);
        setEmailOtpCode("");
        toast({
          title: "Verification Code Sent",
          description: `A 6-digit code has been sent to ${rawEmail}. Please check your inbox.`,
          variant: "success",
        });
      } else {
        toast({
          title: "Error Sending Code",
          description: res.data?.message || "Could not dispatch email.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Email Verification Error",
        description: err?.response?.data?.message || "This email is already registered or invalid.",
        variant: "destructive",
      });
    } finally {
      setEmailSendingOtp(false);
    }
  };

  // Confirm 6-digit Email OTP
  const handleVerifyEmailCode = async () => {
    if (emailOtpCode.trim().length !== 6) {
      toast({
        title: "6-Digit Code Required",
        description: "Please enter the complete 6-digit code sent to your email.",
        variant: "destructive",
      });
      return;
    }

    setEmailVerifyingOtp(true);
    try {
      const res = await api.post("/auth/verify-verification-code", {
        type: "email",
        target: formData.email.trim(),
        code: emailOtpCode.trim(),
      });
      if (res.data?.success && res.data?.verified) {
        setEmailVerified(true);
        setEmailOtpSent(false);
        toast({
          title: "Email Verified",
          description: "Your email address has been verified successfully.",
          variant: "success",
        });
      } else {
        toast({
          title: "Invalid Code",
          description: res.data?.message || "Invalid 6-digit verification code.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err?.response?.data?.message || "Invalid code.",
        variant: "destructive",
      });
    } finally {
      setEmailVerifyingOtp(false);
    }
  };

  const handleNidaVerify = () => {
    const nid = formData.national_id;
    setNidaError("");

    const payload: { nid: string; fullname?: string; date_of_birth?: string } = { nid };
    if (nidaVerifyField === "fullname") {
      payload.fullname = nidaVerifyValue;
    } else {
      payload.date_of_birth = nidaVerifyDob;
    }

    nidaVerifyMutate(payload, {
      onSuccess: (json) => {
        if (json.success && json.verified) {
          const d = json.data;
          const names = (d.fullname || "").trim().split(" ");
          const firstName = names[0] || "";
          const lastName = names.slice(1).join(" ") || "";
          const fullName = d.fullname || `${firstName} ${lastName}`.trim();

          setFormData((prev) => ({
            ...prev,
            name: fullName,
            first_name: firstName,
            last_name: lastName,
            national_id: nid,
            province: type === "worker" ? "" : (d.province || prev.province),
            district: type === "worker" ? "" : (d.district || prev.district),
            sector: type === "worker" ? "" : (d.sector || prev.sector),
            cell: type === "worker" ? "" : (d.cell || prev.cell),
            village: type === "worker" ? "" : (d.village || prev.village),
            gender: (d.gender?.toLowerCase() === "male" ? "male" : "female") as "male" | "female",
            date_of_birth: d.dob || prev.date_of_birth,
            insurance_number: prev.insurance_type === "MITUELLE_DE_SANTE" ? nid : prev.insurance_number,
          }));

          setNidCheckPassed(false);
          setNidaVerified(true);
          setNidaError("");

          toast({
            title: "NIDA Verified",
            description: `Identity for ${fullName} verified successfully.`,
            variant: "success",
          });

          // Prefill existing data if available
          fetchPrefill(nid, {
            onSuccess: (res) => {
              if (!res.success || !res.has_existing) return;
              const pd = res.data;
              if (pd.phone) handleChange("phone", pd.phone);
              if (pd.email && !pd.email.endsWith("@ihirwe.rw")) handleChange("email", pd.email);
            },
          });
        } else {
          setNidaError(json.message || "Verification failed. Please double check identity details.");
        }
      },
      onError: (e: any) => {
        setNidaError(e?.response?.data?.message || "Verification service error. Please try again.");
      },
    });
  };

  const handleDocumentTypeChange = (dType: "nida" | "passport") => {
    setDocumentType(dType);
    setNidCheckPassed(false);
    setNidaVerified(false);
    setNidaVerifyValue("");
    setNidaVerifyDob("");
    setNidaError("");
    setPassportReady(false);
    setPassportNumber("");
    handleChange("national_id", "");
  };

  const identityVerified = documentType === "nida" ? nidaVerified : passportReady;

  const isStep1Done = Boolean(
    (profilePhoto || photoFile) &&
    formData.name?.trim() &&
    formData.phone?.trim() &&
    formData.email?.trim() &&
    formData.password?.trim() &&
    (type !== "company" || formData.company_name?.trim())
  );

  const isStep2Done = Boolean(
    formData.province?.trim() &&
    formData.district?.trim() &&
    formData.sector?.trim()
  );

  const STEPS = type === "worker"
    ? [
      { id: "identity", stepNumber: "Step 01", title: "Identity Verification", description: "Verify National ID / Passport", completed: identityVerified },
      { id: "info", stepNumber: "Step 02", title: "Personal & Account", description: "Personal & contact details", completed: isStep1Done },
    ]
    : [
      { id: "identity", stepNumber: "Step 01", title: "Identity Verification", description: "Verify National ID / Passport", completed: identityVerified },
      { id: "info", stepNumber: "Step 02", title: "Personal & Account", description: "Personal & contact details", completed: isStep1Done },
      { id: "location", stepNumber: "Step 03", title: "Address & Location", description: "Residential location", completed: isStep2Done },
    ];

  const totalSteps = STEPS.length;

  const handleNextStep = () => {
    if (currentStep === 0) {
      if (!identityVerified) {
        toast({
          title: "Identity Verification Required",
          description: "Please check and verify your identity on Step 1 first.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // 1. Mandatory Profile Picture Check
      if (!profilePhoto && !photoFile) {
        toast({
          title: "Profile Picture Required *",
          description: "Please upload your profile picture before continuing.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.name) {
        toast({ title: "Name required", description: "Please enter your name.", variant: "destructive" });
        return;
      }

      // 2. Mandatory Phone Verification
      if (!formData.phone || formData.phone.length < 8) {
        toast({ title: "Phone number required", description: "Please enter your phone number.", variant: "destructive" });
        return;
      }
      if (!phoneVerified) {
        toast({
          title: "Phone Verification Required *",
          description: "Please click 'Verify' next to your phone number and enter the 6-digit SMS code.",
          variant: "destructive",
        });
        return;
      }

      // 3. Mandatory Email Verification
      if (!formData.email) {
        toast({ title: "Email required *", description: "Please enter your email address.", variant: "destructive" });
        return;
      }
      if (!emailVerified) {
        toast({
          title: "Email Verification Required *",
          description: "Please click 'Verify' next to your email and enter the 6-digit code.",
          variant: "destructive",
        });
        return;
      }

      if (formData.password && formData.password.length < 8) {
        toast({ title: "Password required", description: "Password must be at least 8 characters.", variant: "destructive" });
        return;
      }
      if (formData.password_confirmation && formData.password !== formData.password_confirmation) {
        toast({ title: "Passwords Mismatch", description: "Password confirmation does not match.", variant: "destructive" });
        return;
      }

      if (type === "worker") {
        handleSubmit();
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const cleanPhone = formData.phone.startsWith("0") ? formData.phone.slice(1) : formData.phone;
    const formattedPhone = cleanPhone.startsWith("250") ? cleanPhone : `250${cleanPhone}`;

    if (type === "worker") {
      const nameParts = formData.name.trim().split(" ");
      const firstName = formData.first_name || nameParts[0] || formData.name;
      const lastName = formData.last_name || nameParts.slice(1).join(" ") || nameParts[0];

      registerWorker.mutate(
        {
          registration_document_type: documentType,
          national_id: documentType === "nida" ? formData.national_id : undefined,
          passport_number: documentType === "passport" ? passportNumber : undefined,
          first_name: firstName,
          last_name: lastName,
          name: formData.name || `${firstName} ${lastName}`.trim(),
          phone: formattedPhone,
          email: formData.email || undefined,
          password: formData.password || "Password123!",
          password_confirmation: formData.password_confirmation || formData.password || "Password123!",
          gender: formData.gender,
          photo: photoFile || undefined,
        },
        {
          onSuccess: (res: any) => {
            const amount = Number(res?.data?.amount || 0);
            const transactionId = res?.data?.transaction_id;
            if (amount > 0 && transactionId) {
              navigate("/auth/payment", {
                state: {
                  phone: res?.data?.phone || formattedPhone,
                  amount: amount,
                  transaction_id: transactionId,
                  role: "worker",
                },
              });
            } else {
              toast({
                title: "Registration Successful",
                description: "Your account has been created successfully. Please login to continue.",
              });
              navigate("/auth/login", {
                state: {
                  phone: formattedPhone,
                  email: formData.email,
                },
              });
            }
          },
        }
      );
    } else if (type === "employer") {
      registerEmployer.mutate(
        {
          name: formData.name,
          phone: formattedPhone,
          email: formData.email || undefined,
          national_id: formData.national_id,
          password: formData.password || "Password123!",
          password_confirmation: formData.password_confirmation || formData.password || "Password123!",
          gender: formData.gender,
          province: formData.province || undefined,
          district: formData.district || "Kicukiro",
          sector: formData.sector || "Kicukiro",
          cell: formData.cell || undefined,
          village: formData.village || undefined,
          disclaimer_accepted: true,
          photo: photoFile || undefined,
          profile_photo: photoFile || profilePhoto || undefined,
        },
        {
          onSuccess: (res: any) => {
            const isFree = res?.data?.is_free === true || res?.is_free === true;
            const amount = Number(res?.data?.amount ?? res?.amount ?? (isFree ? 0 : 5000));
            const transactionId = res?.data?.transaction_id || res?.transaction_id || `REG-EMP-${Date.now()}`;
            if (!isFree && amount > 0) {
              navigate("/auth/payment", {
                state: {
                  phone: res?.data?.phone || formattedPhone,
                  amount: amount,
                  transaction_id: transactionId,
                  role: "employer",
                  auto_pay: true,
                },
              });
            } else {
              toast({
                title: "Registration Successful",
                description: "Your account has been created successfully. Please login to continue.",
              });
              navigate("/auth/login", {
                state: {
                  phone: formattedPhone,
                  email: formData.email,
                },
              });
            }
          },
        }
      );
    } else if (type === "company") {
      registerCompany.mutate(
        {
          business_name: formData.business_name || formData.name,
          tin: formData.tin || "100000000",
          physical_address: `${formData.district || "Kicukiro"}, ${formData.sector || "Kicukiro"}`,
          province: formData.province || undefined,
          district: formData.district || "Kicukiro",
          sector: formData.sector || "Kicukiro",
          cell: formData.cell || undefined,
          village: formData.village || undefined,
          owner_name: formData.name,
          national_id: formData.national_id,
          owner_phone: formattedPhone,
          owner_email: formData.email || `${formattedPhone}@company.rw`,
          password: formData.password || "Password123!",
          password_confirmation: formData.password_confirmation || formData.password || "Password123!",
          logo: photoFile || undefined,
          photo: photoFile || undefined,
          profile_photo: photoFile || profilePhoto || undefined,
        },
        {
          onSuccess: (res: any) => {
            const isFree = res?.data?.is_free === true || res?.is_free === true;
            const amount = Number(res?.data?.amount ?? res?.amount ?? (isFree ? 0 : 1000));
            const transactionId = res?.data?.transaction_id || res?.transaction_id || `REG-COMP-${Date.now()}`;
            if (!isFree && amount > 0) {
              navigate("/auth/payment", {
                state: {
                  phone: res?.data?.phone || formattedPhone,
                  amount: amount,
                  transaction_id: transactionId,
                  role: "company",
                  auto_pay: true,
                },
              });
            } else {
              toast({
                title: "Registration Successful",
                description: "Your account has been created successfully. Please login to continue.",
              });
              navigate("/auth/login", {
                state: {
                  phone: formattedPhone,
                  email: formData.email,
                },
              });
            }
          },
        }
      );
    }
  };

  const headerRight = (
    <CustomDropdown
      widthClass="w-28 min-w-[7rem]"
      trigger={
        <button className="bg-transparent hover:opacity-80 transition-all cursor-pointer flex items-center gap-1.5 px-2 py-1 border-0 shadow-none outline-none">
          <Languages className="w-4 h-4 text-[#0073bb]" />
          <span className="text-sm font-semibold text-slate-700 tracking-tight">
            {currentLanguage?.short || (language === "kin" ? "KIN" : "EN")}
          </span>
          <span className="text-[#0073bb] text-[10px] transform scale-y-75 font-bold">▼</span>
        </button>
      }
      items={languages.map((lang) => ({
        label: lang.short,
        active: language === lang.code,
        onClick: () => setLanguage(lang.code),
      }))}
    />
  );

  const roleTitle = type === "worker" ? "worker" : type === "employer" ? "employer" : "company";

  return (
    <DedicatedFormPage
      onBack={() => navigate("/?join=true", { state: { openRegister: true } })}
      backLabel="Cancel"
      title={`Create ${roleTitle} account`}
      subtitle="All fields with a red asterisk * are mandatory to complete your profile"
      steps={STEPS}
      currentStep={currentStep}
      onStepClick={(idx) => {
        if (idx > 0 && !identityVerified) {
          toast({
            title: "Identity Verification Required",
            description: "Please verify your ID on Step 1 first.",
            variant: "destructive",
          });
          return;
        }
        setCurrentStep(idx);
      }}
      completionPercentage={
        identityVerified
          ? currentStep === totalSteps - 1
            ? 100
            : 50 + currentStep * 20
          : 20
      }
      headerRight={headerRight}
      profileAvatar={{
        src: profilePhoto,
        name: formData.name || "New user account",
        role: roleTitle,
        onPhotoChange: handlePhotoChange,
      }}
      primaryActionLabel={
        currentStep === totalSteps - 1
          ? isSubmitting
            ? "Registering..."
            : "Register"
          : "Continue"
      }
      onPrimaryAction={handleNextStep}
      isLoading={isSubmitting}
      isPrimaryDisabled={currentStep === 0 && !identityVerified}
      secondaryActionLabel={currentStep > 0 ? "Previous" : undefined}
      onSecondaryAction={currentStep > 0 ? () => setCurrentStep((prev) => prev - 1) : undefined}
      rightCardExtra={
        <div className="pt-2 text-center text-xs sm:text-sm font-medium text-slate-700">
          Already registered ?{" "}
          <a
            href="/auth/login"
            className="text-[#0073bb] font-bold hover:underline transition-all ml-1"
          >
            Signin
          </a>
        </div>
      }
    >
      {/* ── STEP 0: IDENTITY VERIFICATION FIRST (EXACT ORIGINAL NIDA CHECK FLOW) ── */}
      {currentStep === 0 && (
        <div className="space-y-6 text-left animate-in fade-in duration-200">
          {/* Nationality / Document Type Selector: Workers only. Employers and Companies are strictly Rwandan Citizen (NIDA) */}
          {type === "worker" && (
            <div>
              <label className="block text-xs font-normal text-slate-700 mb-2">
                Select Nationality / Document Type
              </label>
              <div className="flex flex-wrap items-center gap-6 py-1">
                <button
                  type="button"
                  onClick={() => handleDocumentTypeChange("nida")}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  {documentType === "nida" ? (
                    <div className="w-5 h-5 rounded bg-[#0073bb] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded border-2 border-slate-400 bg-transparent shrink-0 group-hover:border-slate-700" />
                  )}
                  <span className="font-normal text-sm text-slate-900">Rwandan Citizen (National ID)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDocumentTypeChange("passport")}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  {documentType === "passport" ? (
                    <div className="w-5 h-5 rounded bg-[#0073bb] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded border-2 border-slate-400 bg-transparent shrink-0 group-hover:border-slate-700" />
                  )}
                  <span className="font-normal text-sm text-slate-900">Foreign Worker (Passport)</span>
                </button>
              </div>
            </div>
          )}

          {(documentType === "nida" || type !== "worker") ? (
            <div className="space-y-4 pt-1">
              <FormField label="National ID Number" required>
                <div className="flex rounded-[6px] overflow-hidden bg-[#E9ECF0] focus-within:ring-2 focus-within:ring-[#0073bb]/30">
                  <input
                    type="text"
                    placeholder="Enter 16-digit Rwandan NIDA number"
                    value={formData.national_id}
                    disabled={nidaVerified}
                    maxLength={16}
                    onChange={(e) => {
                      const cleanDigits = e.target.value.replace(/\D/g, "");
                      handleChange("national_id", cleanDigits);
                      if (cleanDigits.length !== 16) {
                        setNidCheckPassed(false);
                        setNidaVerified(false);
                      }
                    }}
                    className="flex-1 bg-transparent px-3.5 h-11 text-sm outline-none text-slate-800 placeholder-slate-400"
                  />
                  {nidaVerified ? (
                    <div className="bg-emerald-600 text-white text-xs font-semibold px-4 h-11 flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => triggerNidaCheck(formData.national_id)}
                      disabled={nidaCheckLoading || formData.national_id.length !== 16}
                      className="bg-[#0073bb] hover:bg-[#005f9e] disabled:opacity-50 text-white text-xs font-semibold px-4 h-11 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    >
                      {nidaCheckLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check ID"}
                    </button>
                  )}
                </div>
              </FormField>

              {nidaError && !nidCheckPassed && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{nidaError}</span>
                </div>
              )}

              {/* NIDA Verify Expand (Opens when 16 digits are checked) */}
              {nidCheckPassed && !nidaVerified && (
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl space-y-4 animate-in fade-in duration-200">
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                    {nidaVerifyField === "fullname"
                      ? "Please enter your full name as it appears on your National ID to confirm identity:"
                      : "Please enter your Date of Birth as on your National ID to confirm identity:"}
                  </p>

                  {nidaVerifyField === "fullname" ? (
                    <FormField label="Full Name as on ID" required>
                      <FormInput
                        type="text"
                        placeholder="e.g. UWASE Marie"
                        value={nidaVerifyValue}
                        onChange={(e) => setNidaVerifyValue(e.target.value)}
                        autoFocus
                      />
                    </FormField>
                  ) : (
                    <FormField label="Date of Birth" required>
                      <FormInput
                        type="date"
                        value={nidaVerifyDob}
                        onChange={(e) => setNidaVerifyDob(e.target.value)}
                        autoFocus
                      />
                    </FormField>
                  )}

                  {nidaError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{nidaError}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleNidaVerify}
                      disabled={
                        nidaVerifyLoading ||
                        (nidaVerifyField === "fullname" ? !nidaVerifyValue.trim() : !nidaVerifyDob)
                      }
                      className="bg-[#0073bb] hover:bg-[#005f9e] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-[6px] transition-colors cursor-pointer shadow-xs"
                    >
                      {nidaVerifyLoading ? "Verifying..." : "Verify Identity"}
                    </button>
                  </div>
                </div>
              )}

              {nidaVerified && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setNidaVerified(false);
                      setNidCheckPassed(false);
                      handleChange("national_id", "");
                    }}
                    className="text-xs text-[#0073bb] hover:underline font-semibold cursor-pointer"
                  >
                    Change ID
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <FormField label="Passport Number" required>
                <FormInput
                  type="text"
                  placeholder="Enter passport number"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                />
              </FormField>

              <FormField label="Full Name as on Passport" required>
                <FormInput
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </FormField>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!passportNumber.trim() || !formData.name.trim()) {
                      toast({
                        title: "Incomplete details",
                        description: "Please enter passport number and name.",
                        variant: "destructive",
                      });
                      return;
                    }
                    try {
                      const res = await api.post("/auth/check-unique", { passport_number: passportNumber.trim() });
                      if (res.data?.is_unique === false) {
                        toast({
                          title: "Passport Already Registered",
                          description: res.data.message || `Passport ${passportNumber} is already registered. Please login instead.`,
                          variant: "destructive",
                        });
                        return;
                      }
                    } catch (e: any) { }
                    setPassportReady(true);
                  }}
                  className="bg-[#0073bb] hover:bg-[#005f9e] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-[6px] transition-colors cursor-pointer"
                >
                  Confirm Passport Details
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 1: PERSONAL & ACCOUNT DETAILS (TWO-COLUMN FORMAT) ── */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left animate-in fade-in duration-200">
          <div className="space-y-4 text-left">
            <h3 className="text-sm sm:text-base font-normal text-slate-800 pb-2 border-b border-slate-100">
              Personal details
            </h3>

            <FormField label="Names" required>
              <FormInput
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                disabled={nidaVerified}
                onChange={(e) => handleChange("name", e.target.value)}
                className={nidaVerified ? "bg-slate-100 cursor-not-allowed opacity-90" : ""}
              />
            </FormField>

            <FormField label="Account type" required>
              <FormSelect value={roleTitle} disabled className="opacity-90 capitalize">
                <option value="worker">Worker</option>
                <option value="employer">Employer</option>
                <option value="company">Company</option>
              </FormSelect>
            </FormField>

            <FormField label="Phone Number" required>
              <div className="flex rounded-[6px] overflow-hidden bg-[#E9ECF0] focus-within:ring-2 focus-within:ring-[#0073bb]/30">
                <div className="flex items-center gap-1.5 px-3 bg-[#E9ECF0] border-r border-slate-300/80 text-xs font-medium text-slate-700 shrink-0 select-none">
                  <span className="text-sm">🇷🇼</span>
                  <span>+250</span>
                </div>
                <input
                  type="text"
                  placeholder="078 320 2922"
                  value={formData.phone}
                  disabled={phoneVerified}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.startsWith("250") && val.length >= 11) {
                      val = "0" + val.slice(3);
                    } else if (val.startsWith("7")) {
                      val = "0" + val;
                    }
                    if (val.length > 10) val = val.slice(0, 10);
                    handleChange("phone", val);
                    setPhoneVerified(false);
                    setPhoneOtpSent(false);
                  }}
                  className={`flex-1 bg-transparent px-3.5 h-11 text-sm outline-none text-slate-800 placeholder-slate-400 ${phoneVerified ? "bg-slate-50 cursor-not-allowed opacity-90" : ""
                    }`}
                />
                {phoneVerified ? (
                  <div className="bg-emerald-600 text-white text-xs font-semibold px-4 h-11 flex items-center gap-1.5 shrink-0 select-none">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendPhoneCode}
                    disabled={phoneSendingOtp || !formData.phone || formData.phone.length < 8}
                    className="bg-[#0073bb] hover:bg-[#005f9e] disabled:opacity-50 text-white text-xs font-semibold px-4 h-11 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  >
                    {phoneSendingOtp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : phoneOtpSent ? (
                      "Resend"
                    ) : (
                      "Verify"
                    )}
                  </button>
                )}
              </div>

              {/* Phone 6-digit verification code expand */}
              {phoneOtpSent && !phoneVerified && (
                <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 animate-in fade-in">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit SMS code"
                    value={phoneOtpCode}
                    onChange={(e) => setPhoneOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 bg-white border border-slate-300 rounded-[6px] px-3 h-9 text-xs sm:text-sm font-sans outline-none focus:border-[#0073bb] text-slate-800 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPhoneCode}
                    disabled={phoneVerifyingOtp || phoneOtpCode.length !== 6}
                    className="bg-[#0073bb] hover:bg-[#005f9e] disabled:opacity-50 text-white text-xs font-semibold px-4 h-9 rounded-[6px] transition-colors cursor-pointer shrink-0"
                  >
                    {phoneVerifyingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm"}
                  </button>
                </div>
              )}
            </FormField>

            <FormField label="Email Address" required>
              <div className="flex rounded-[6px] overflow-hidden bg-[#E9ECF0] focus-within:ring-2 focus-within:ring-[#0073bb]/30">
                <input
                  type="email"
                  placeholder="example@mail.rw"
                  value={formData.email}
                  disabled={emailVerified}
                  onChange={(e) => {
                    handleChange("email", e.target.value);
                    setEmailVerified(false);
                    setEmailOtpSent(false);
                  }}
                  className={`flex-1 bg-transparent px-3.5 h-11 text-sm outline-none text-slate-800 placeholder-slate-400 ${emailVerified ? "bg-slate-50 cursor-not-allowed opacity-90" : ""
                    }`}
                />
                {emailVerified ? (
                  <div className="bg-emerald-600 text-white text-xs font-semibold px-4 h-11 flex items-center gap-1.5 shrink-0 select-none">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    disabled={emailSendingOtp || !formData.email || !formData.email.includes("@")}
                    className="bg-[#0073bb] hover:bg-[#005f9e] disabled:opacity-50 text-white text-xs font-semibold px-4 h-11 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  >
                    {emailSendingOtp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : emailOtpSent ? (
                      "Resend"
                    ) : (
                      "Verify"
                    )}
                  </button>
                )}
              </div>

              {/* Email 6-digit verification code expand */}
              {emailOtpSent && !emailVerified && (
                <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 animate-in fade-in">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit email code"
                    value={emailOtpCode}
                    onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 bg-white border border-slate-300 rounded-[6px] px-3 h-9 text-xs sm:text-sm font-sans outline-none focus:border-[#0073bb] text-slate-800 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailCode}
                    disabled={emailVerifyingOtp || emailOtpCode.length !== 6}
                    className="bg-[#0073bb] hover:bg-[#005f9e] disabled:opacity-50 text-white text-xs font-semibold px-4 h-9 rounded-[6px] transition-colors cursor-pointer shrink-0"
                  >
                    {emailVerifyingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm"}
                  </button>
                </div>
              )}
            </FormField>
          </div>

          <div className="space-y-4 text-left">
            <h3 className="text-sm sm:text-base font-normal text-slate-800 pb-2 border-b border-slate-100">
              Account Security
            </h3>

            {type === "company" && (
              <>
                <FormField label="Company Name" required>
                  <FormInput
                    type="text"
                    placeholder="Enter business / company name"
                    value={formData.business_name}
                    onChange={(e) => handleChange("business_name", e.target.value)}
                  />
                </FormField>

                <FormField label="TIN Number" required>
                  <FormInput
                    type="text"
                    placeholder="Enter company TIN"
                    value={formData.tin}
                    onChange={(e) => handleChange("tin", e.target.value)}
                  />
                </FormField>

                <FormField label="RDB Registration Number (Optional)">
                  <FormInput
                    type="text"
                    placeholder="e.g. 102938475"
                    value={formData.rdb_registration_number}
                    onChange={(e) => handleChange("rdb_registration_number", e.target.value)}
                  />
                </FormField>
              </>
            )}

            <FormField label="Account password" required>
              <FormInput
                type="password"
                placeholder="Enter at least 8 characters"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </FormField>

            <FormField label="Confirm password" required>
              <FormInput
                type="password"
                placeholder="Confirm your password"
                value={formData.password_confirmation}
                onChange={(e) => handleChange("password_confirmation", e.target.value)}
              />
            </FormField>
          </div>
        </div>
      )}

      {/* ── STEP 2: ADDRESS & LOCATION (TWO-COLUMN FORMAT) ── */}
      {currentStep === 2 && type !== "worker" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left animate-in fade-in duration-200">
          <div className="space-y-4 text-left">
            <h3 className="text-sm sm:text-base font-normal text-slate-800 pb-2 border-b border-slate-100">
              Jurisdiction & Province
            </h3>

            <FormField label="Country" required>
              <FormSelect value="Rwanda" disabled className="opacity-90">
                <option value="Rwanda">Rwanda</option>
              </FormSelect>
            </FormField>

            <FormField label="Province">
              <FormSelect
                value={formData.province}
                onChange={(e) => handleLocationChange("province", e.target.value)}
              >
                <option value="">Select Province</option>
                {(Array.isArray(provinces) ? provinces : []).map((p: any) => (
                  <option key={p.id || p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </FormSelect>
            </FormField>

            <FormField label="District">
              <FormSelect
                value={formData.district}
                onChange={(e) => handleLocationChange("district", e.target.value)}
                disabled={!formData.province}
              >
                <option value="">Select District</option>
                {(Array.isArray(districts) ? districts : []).map((d: any) => (
                  <option key={d.id || d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </FormSelect>
            </FormField>
          </div>

          <div className="space-y-4 text-left">
            <h3 className="text-sm sm:text-base font-normal text-slate-800 pb-2 border-b border-slate-100">
              Local Administrative Area
            </h3>

            <FormField label="Sector">
              <FormSelect
                value={formData.sector}
                onChange={(e) => handleLocationChange("sector", e.target.value)}
                disabled={!formData.district}
              >
                <option value="">Select Sector</option>
                {(Array.isArray(sectors) ? sectors : []).map((s: any) => (
                  <option key={s.id || s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </FormSelect>
            </FormField>

            <FormField label="Cell">
              <FormSelect
                value={formData.cell}
                onChange={(e) => handleLocationChange("cell", e.target.value)}
                disabled={!formData.sector}
              >
                <option value="">Select Cell</option>
                {(Array.isArray(cells) ? cells : []).map((c: any) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </FormSelect>
            </FormField>

            <FormField label="Village">
              <FormSelect
                value={formData.village}
                onChange={(e) => handleLocationChange("village", e.target.value)}
                disabled={!formData.cell}
              >
                <option value="">Select Village</option>
                {(Array.isArray(villages) ? villages : []).map((v: any) => (
                  <option key={v.id || v.name} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </FormSelect>
            </FormField>

            {type === "employer" && (
              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.disclaimer_accepted}
                    onChange={(e) => handleChange("disclaimer_accepted", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0073bb] focus:ring-[#0073bb]"
                  />
                  <span className="text-xs font-semibold text-slate-700 leading-relaxed">
                    I agree to use worker information solely for lawful domestic employment purposes
                    and abide by Ihirwe terms of service.
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 3: WORKER PREFERENCES & SKILLS (WORKER ONLY) ── */}
      {currentStep === 3 && type === "worker" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left animate-in fade-in duration-200">
          <div className="space-y-4 text-left">
            <h3 className="text-sm sm:text-base font-normal text-slate-800 pb-2 border-b border-slate-100">
              Work Profile & Skillset
            </h3>

            <FormField label="Profession" required>
              <FormSelect
                value={formData.profession}
                onChange={(e) => handleChange("profession", e.target.value)}
              >
                {WORKER_PROFESSIONS.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </FormSelect>
            </FormField>

            <FormField label="Experience Level" required>
              <FormSelect
                value={formData.experience_level}
                onChange={(e) => handleChange("experience_level", e.target.value)}
              >
                <option value="beginner">Beginner (&lt; 1 year)</option>
                <option value="intermediate">Intermediate (1-3 years)</option>
                <option value="expert">Expert (3+ years)</option>
              </FormSelect>
            </FormField>

            <FormField label="Preferred Work Type" required>
              <FormSelect
                value={formData.work_type}
                onChange={(e) => handleChange("work_type", e.target.value)}
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
              </FormSelect>
            </FormField>
          </div>

          <div className="space-y-4 text-left">
            <h3 className="text-sm sm:text-base font-normal text-slate-800 pb-2 border-b border-slate-100">
              Salary Expectation & Insurance
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Min Salary (RWF)" required>
                <FormInput
                  type="number"
                  value={formData.min_salary}
                  onChange={(e) => handleChange("min_salary", e.target.value)}
                />
              </FormField>
              <FormField label="Max Salary (RWF)" required>
                <FormInput
                  type="number"
                  value={formData.max_salary}
                  onChange={(e) => handleChange("max_salary", e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Health Insurance">
              <FormSelect
                value={formData.has_insurance ? formData.insurance_type : "none"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "none") {
                    handleChange("has_insurance", false);
                  } else {
                    handleChange("has_insurance", true);
                    handleChange("insurance_type", val);
                  }
                }}
              >
                <option value="none">No Health Insurance</option>
                <option value="MITUELLE_DE_SANTE">Mutuelle de Santé</option>
                <option value="OTHERS">Other Insurance Provider</option>
              </FormSelect>
            </FormField>

            {formData.has_insurance && formData.insurance_type === "OTHERS" && (
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Provider Name" required>
                  <FormInput
                    type="text"
                    placeholder="e.g. RSSB / Radiant"
                    value={formData.insurance_provider}
                    onChange={(e) => handleChange("insurance_provider", e.target.value)}
                  />
                </FormField>
                <FormField label="Card Number" required>
                  <FormInput
                    type="text"
                    placeholder="Card Number"
                    value={formData.insurance_number}
                    onChange={(e) => handleChange("insurance_number", e.target.value)}
                  />
                </FormField>
              </div>
            )}
          </div>
        </div>
      )}
    </DedicatedFormPage>
  );
};

export default RegisterFormPage;
