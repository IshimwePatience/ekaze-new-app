import React, { useState, useEffect } from "react";
import {
  DedicatedFormPage,
  FormField,
  FormInput,
  FormSelect,
} from "../common/DedicatedFormPage";
import { useUpdateUser, useUserDetails } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useProvinces, useDistricts, useSectors, useCells, useVillages } from "@/hooks/useLocations";
import { nidaApi } from "@/api/nidaService";
import { authApi } from "@/api/authApi";
import type { User } from "@/types/user.types";
import { Loader2, Check, X } from "lucide-react";

interface EditUserFormPageProps {
  user?: User | any;
  userId?: number | string;
  onBack: () => void;
}

const WORKER_PROFESSIONS = [
  "Housekeeper / Maid",
  "Nanny / Babysitter",
  "Cook / Chef",
  "Driver",
  "Security Guard",
  "Gardener",
  "Electrician",
  "Plumber",
  "Caregiver / Elderly Care",
  "Cleaner",
  "Construction Worker / Mason",
  "Carpenter",
  "Painter",
  "Waiter / Waitress",
  "Tailor",
  "Other Skills",
];

const SPOKEN_LANGUAGE_OPTIONS = [
  "Kinyarwanda",
  "English",
  "French",
  "Swahili",
];

const RWANDA_DISTRICTS = [
  "Gasabo",
  "Kicukiro",
  "Nyarugenge",
  "Bugesera",
  "Gatsibo",
  "Kayonza",
  "Kirehe",
  "Ngoma",
  "Nyagatare",
  "Rwamagana",
  "Burera",
  "Gakenke",
  "Gicumbi",
  "Musanze",
  "Rulindo",
  "Gisagara",
  "Huye",
  "Kamonyi",
  "Muhanga",
  "Nyamagabe",
  "Nyanza",
  "Nyaruguru",
  "Ruhango",
  "Karongi",
  "Ngororero",
  "Nyabihu",
  "Nyamasheke",
  "Rubavu",
  "Rusizi",
  "Rutsiro",
];

const HOUSEHOLD_DUTY_FIELDS = [
  { key: "accept_house_chores", label: "General House Chores & Cleaning" },
  { key: "accept_childcare", label: "Childcare / Babysitting" },
  { key: "accept_cooking", label: "Cooking & Meal Preparation" },
  { key: "accept_laundry", label: "Laundry & Washing" },
  { key: "accept_ironing", label: "Ironing & Wardrobe Care" },
  { key: "accept_gardening", label: "Gardening & Compound Care" },
  { key: "accept_elderly_care", label: "Elderly Care / Caregiving" },
  { key: "accept_pet_care", label: "Pet Care" },
  { key: "accept_shopping", label: "Grocery Shopping & Errands" },
  { key: "accept_car_washing", label: "Car Washing" },
  { key: "accept_driving", label: "Household Driving" },
];

export const EditUserFormPage: React.FC<EditUserFormPageProps> = ({ user, userId, onBack }) => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const updateUser = useUpdateUser();

  const targetId = userId ? Number(userId) : user?.id;
  // Fetch fresh user details live from DB endpoint
  const { data: dbUserResponse, isLoading: isFetchingUser } = useUserDetails(targetId || null);
  const rawFetched = (dbUserResponse as any)?.data?.user || (dbUserResponse as any)?.data || user || {};
  const fetchedUser = rawFetched;
  const workerObj = fetchedUser.worker || fetchedUser.role_profile || user?.worker || user?.role_profile || {};
  const extObj = workerObj.extended_profile || {};
  const compObj = fetchedUser.company || user?.company || {};
  const targetRole = String(fetchedUser.role || user?.role || "").toLowerCase();
  const editorRole = String(authUser?.role || fetchedUser.role || user?.role || "").toLowerCase();
  const isWorker = targetRole === "worker";
  const isCompany = targetRole === "company";

  // Companies are not allowed to edit their profile; only Super Admin can update
  if (editorRole === "company") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Company Profile Locked</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Company profiles are officially verified and can only be updated by the Super Administrator. Please contact support to request any changes.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold rounded-md shadow-xs cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isIdExempt = ["admin", "police", "supervisor", "company"].includes(targetRole);
  const isRegUserLocked =
    ["worker", "employer", "company"].includes(editorRole) &&
    ["worker", "employer", "company"].includes(targetRole);
  const isLocationLocked = isRegUserLocked && !isWorker;

  const [currentStep, setCurrentStep] = useState(0);

  const initialProfessions: string[] = Array.isArray(workerObj.professions) && workerObj.professions.length > 0
    ? workerObj.professions
    : Array.isArray(workerObj.skills) && workerObj.skills.length > 0
      ? workerObj.skills
      : [];

  const initialLanguages: string[] = Array.isArray(workerObj.languages_spoken) && workerObj.languages_spoken.length > 0
    ? workerObj.languages_spoken
    : [];

  const initialWorkType: string = Array.isArray(workerObj.work_type_preferences) && workerObj.work_type_preferences.length > 0
    ? workerObj.work_type_preferences[0]
    : (extObj.preferred_work_type || "full_time");

  const initialPreferredDistricts: string = Array.isArray(workerObj.preferred_districts) && workerObj.preferred_districts.length > 0
    ? workerObj.preferred_districts.join(", ")
    : (fetchedUser.district || "");

  const [formData, setFormData] = useState({
    name: fetchedUser.name || compObj.company_name || "",
    email: fetchedUser.email || "",
    phone: fetchedUser.phone || "",
    national_id: fetchedUser.national_id || "",
    passport_number: fetchedUser.passport_number || "",
    registration_document_type: fetchedUser.registration_document_type || "nida",
    gender: fetchedUser.gender || "",
    date_of_birth: fetchedUser.date_of_birth ? String(fetchedUser.date_of_birth).split("T")[0] : "",
    province: fetchedUser.province || compObj.province || "",
    district: fetchedUser.district || compObj.district || "",
    sector: fetchedUser.sector || compObj.sector || "",
    cell: fetchedUser.cell || compObj.cell || "",
    village: fetchedUser.village || compObj.village || "",
    address: fetchedUser.address || compObj.address || "",
    profile_photo: fetchedUser.profile_photo || "",
    // Company specific fields
    company_name: compObj.company_name || fetchedUser.company_name || fetchedUser.name || "",
    tin_number: compObj.tin_number || compObj.registration_number || fetchedUser.tin_number || fetchedUser.registration_number || "",
    billing_plan: compObj.billing_plan || fetchedUser.billing_plan || "free_trial",
    trial_days: (compObj.trial_ends_at || fetchedUser.trial_ends_at)
      ? Math.max(1, Math.ceil((new Date(compObj.trial_ends_at || fetchedUser.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 14,
    subscription_amount: compObj.subscription_amount != null ? String(compObj.subscription_amount) : (fetchedUser.subscription_amount != null ? String(fetchedUser.subscription_amount) : "50000"),
    subscription_cycle: compObj.subscription_cycle || fetchedUser.subscription_cycle || "monthly",
    subscription_period_days: compObj.subscription_period_days != null ? String(compObj.subscription_period_days) : "30",
    status: fetchedUser.status || "active",
    // Worker preferences & profile fields
    profession: initialProfessions[0] || "",
    professions: initialProfessions,
    experience_level: workerObj.experience_level || "",
    experience_years: workerObj.experience_years != null ? String(workerObj.experience_years) : (extObj.years_of_experience != null ? String(extObj.years_of_experience) : ""),
    work_type: initialWorkType,
    languages_spoken: initialLanguages,
    preferred_districts: initialPreferredDistricts,
    min_salary: workerObj.min_salary != null
      ? String(workerObj.min_salary)
      : workerObj.expected_salary != null
        ? String(workerObj.expected_salary)
        : "",
    max_salary: workerObj.max_salary != null
      ? String(workerObj.max_salary)
      : "",
    has_insurance: Boolean(workerObj.has_insurance),
    insurance_type: workerObj.insurance_type || "MITUELLE_DE_SANTE",
    insurance_provider: workerObj.insurance_provider || "RSSB",
    insurance_number: workerObj.insurance_number || fetchedUser.national_id || "",
    availability_status: workerObj.availability_status === "unavailable" ? "unavailable" : "available",
    // Extended profile & qualifications
    marital_status: extObj.marital_status || "",
    education_level: extObj.education_level || "",
    available_from: extObj.available_from || "08:00",
    available_to: extObj.available_to || "17:00",
    available_weekends: Boolean(extObj.available_weekends),
    available_holidays: Boolean(extObj.available_holidays),
    is_physically_fit: Boolean(extObj.is_physically_fit),
    has_driving_licence: Boolean(extObj.has_driving_licence),
    has_cooking_certificate: Boolean(extObj.has_cooking_certificate),
    has_first_aid_certificate: Boolean(extObj.has_first_aid_certificate),
    has_childcare_certificate: Boolean(extObj.has_childcare_certificate),
    accept_house_chores: Boolean(extObj.accept_house_chores),
    accept_childcare: Boolean(extObj.accept_childcare || extObj.is_baby_sitter),
    accept_cooking: Boolean(extObj.accept_cooking),
    accept_laundry: Boolean(extObj.accept_laundry),
    accept_ironing: Boolean(extObj.accept_ironing),
    accept_gardening: Boolean(extObj.accept_gardening),
    accept_elderly_care: Boolean(extObj.accept_elderly_care),
    accept_pet_care: Boolean(extObj.accept_pet_care),
    accept_shopping: Boolean(extObj.accept_shopping),
    accept_car_washing: Boolean(extObj.accept_car_washing),
    accept_driving: Boolean(extObj.accept_driving),
    referee_name: extObj.referee_3_name || extObj.referee_1_name || "",
    referee_phone: extObj.referee_3_phone || extObj.referee_1_phone || "",
    referee_relationship: extObj.referee_3_relationship || "",
    bio: extObj.bio || "",
    special_skills: extObj.special_skills || "",
  });

  const [isVerifyingNida, setIsVerifyingNida] = useState(false);
  const [nidaVerified, setNidaVerified] = useState(fetchedUser.is_verified || false);

  // Phone & Email OTP Verification States
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(Boolean(fetchedUser.phone));
  const [showPhoneOtpModal, setShowPhoneOtpModal] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState(false);

  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(Boolean(fetchedUser.email));
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);

  // Sync state when DB data arrives
  useEffect(() => {
    const u = (dbUserResponse as any)?.data?.user || (dbUserResponse as any)?.data;
    if (u) {
      const w = u.worker || u.role_profile || user?.worker || user?.role_profile || {};
      const ext = w.extended_profile || {};
      const profs: string[] = Array.isArray(w.professions) && w.professions.length > 0
        ? w.professions
        : Array.isArray(w.skills) && w.skills.length > 0
          ? w.skills
          : [];
      const langs: string[] = Array.isArray(w.languages_spoken) && w.languages_spoken.length > 0
        ? w.languages_spoken
        : [];
      const wt: string = Array.isArray(w.work_type_preferences) && w.work_type_preferences.length > 0
        ? w.work_type_preferences[0]
        : (ext.preferred_work_type || "full_time");
      const prefDists: string = Array.isArray(w.preferred_districts) && w.preferred_districts.length > 0
        ? w.preferred_districts.join(", ")
        : (u.district || "");

      const comp = u.company || user?.company || {};
      const trialDaysCalc = comp.trial_ends_at
        ? Math.max(1, Math.ceil((new Date(comp.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 14;

      setFormData({
        name: u.name || comp.company_name || "",
        email: u.email || "",
        phone: u.phone || "",
        national_id: u.national_id || "",
        passport_number: u.passport_number || "",
        registration_document_type: u.registration_document_type || "nida",
        gender: u.gender || "",
        date_of_birth: u.date_of_birth ? String(u.date_of_birth).split("T")[0] : "",
        province: u.province || comp.province || "",
        district: u.district || comp.district || "",
        sector: u.sector || comp.sector || "",
        cell: u.cell || comp.cell || "",
        village: u.village || comp.village || "",
        address: u.address || comp.address || "",
        profile_photo: u.profile_photo || comp.logo || "",
        company_name: comp.company_name || u.company_name || u.name || "",
        tin_number: comp.tin_number || comp.registration_number || u.tin_number || u.registration_number || "",
        billing_plan: comp.billing_plan || u.billing_plan || "free_trial",
        trial_days: trialDaysCalc,
        subscription_amount: comp.subscription_amount != null ? String(comp.subscription_amount) : (u.subscription_amount != null ? String(u.subscription_amount) : "50000"),
        subscription_cycle: comp.subscription_cycle || u.subscription_cycle || "monthly",
        subscription_period_days: comp.subscription_period_days != null ? String(comp.subscription_period_days) : "30",
        status: u.status || "active",
        profession: profs[0] || "",
        professions: profs,
        experience_level: w.experience_level || "",
        experience_years: w.experience_years != null ? String(w.experience_years) : (ext.years_of_experience != null ? String(ext.years_of_experience) : ""),
        work_type: wt,
        languages_spoken: langs,
        preferred_districts: prefDists,
        min_salary: w.min_salary != null
          ? String(w.min_salary)
          : w.expected_salary != null
            ? String(w.expected_salary)
            : "",
        max_salary: w.max_salary != null
          ? String(w.max_salary)
          : "",
        has_insurance: Boolean(w.has_insurance),
        insurance_type: w.insurance_type || "MITUELLE_DE_SANTE",
        insurance_provider: w.insurance_provider || "RSSB",
        insurance_number: w.insurance_number || u.national_id || "",
        availability_status: w.availability_status === "unavailable" ? "unavailable" : "available",
        marital_status: ext.marital_status || "",
        education_level: ext.education_level || "",
        available_from: ext.available_from || "08:00",
        available_to: ext.available_to || "17:00",
        available_weekends: Boolean(ext.available_weekends),
        available_holidays: Boolean(ext.available_holidays),
        is_physically_fit: Boolean(ext.is_physically_fit),
        has_driving_licence: Boolean(ext.has_driving_licence),
        has_cooking_certificate: Boolean(ext.has_cooking_certificate),
        has_first_aid_certificate: Boolean(ext.has_first_aid_certificate),
        has_childcare_certificate: Boolean(ext.has_childcare_certificate),
        accept_house_chores: Boolean(ext.accept_house_chores),
        accept_childcare: Boolean(ext.accept_childcare || ext.is_baby_sitter),
        accept_cooking: Boolean(ext.accept_cooking),
        accept_laundry: Boolean(ext.accept_laundry),
        accept_ironing: Boolean(ext.accept_ironing),
        accept_gardening: Boolean(ext.accept_gardening),
        accept_elderly_care: Boolean(ext.accept_elderly_care),
        accept_pet_care: Boolean(ext.accept_pet_care),
        accept_shopping: Boolean(ext.accept_shopping),
        accept_car_washing: Boolean(ext.accept_car_washing),
        accept_driving: Boolean(ext.accept_driving),
        referee_name: ext.referee_3_name || ext.referee_1_name || "",
        referee_phone: ext.referee_3_phone || ext.referee_1_phone || "",
        referee_relationship: ext.referee_3_relationship || "",
        bio: ext.bio || "",
        special_skills: ext.special_skills || "",
      });
      setNidaVerified(u.is_verified || false);
    }
  }, [dbUserResponse]);

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

  const toggleLanguage = (lang: string) => {
    setFormData((prev) => {
      const exists = prev.languages_spoken.includes(lang);
      const next = exists
        ? prev.languages_spoken.filter((l) => l !== lang)
        : [...prev.languages_spoken, lang];
      return { ...prev, languages_spoken: next.length > 0 ? next : [lang] };
    });
  };

  const toggleProfessionSkill = (prof: string) => {
    setFormData((prev) => {
      const exists = prev.professions.includes(prof);
      const next = exists
        ? prev.professions.filter((p) => p !== prof)
        : [...prev.professions, prof];
      const finalProfs = next.length > 0 ? next : [prof];
      return {
        ...prev,
        professions: finalProfs,
        profession: finalProfs[0],
      };
    });
  };

  const selectedDistrictsList: string[] = String(formData.preferred_districts || "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

  const isAllDistrictsSelected =
    RWANDA_DISTRICTS.every((d) => selectedDistrictsList.includes(d));

  const togglePreferredDistrict = (dist: string) => {
    const exists = selectedDistrictsList.includes(dist);
    const next = exists
      ? selectedDistrictsList.filter((d) => d !== dist)
      : [...selectedDistrictsList, dist];
    handleChange("preferred_districts", next.join(", "));
  };

  const toggleAllDistricts = () => {
    if (isAllDistrictsSelected) {
      const fallback = formData.district ? [formData.district] : ["Nyarugenge"];
      handleChange("preferred_districts", fallback.join(", "));
    } else {
      handleChange("preferred_districts", RWANDA_DISTRICTS.join(", "));
    }
  };

  const handlePhotoChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({ ...prev, profile_photo: reader.result as string }));
        toast({
          title: "Profile photo selected",
          description: "New profile avatar will be saved when you submit.",
          variant: "success",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyNida = async () => {
    if (!formData.national_id || formData.national_id.trim().length !== 16) {
      toast({
        title: "Invalid ID",
        description: "National ID must be exactly 16 digits.",
        variant: "destructive",
      });
      return;
    }
    setIsVerifyingNida(true);
    try {
      const res = await nidaApi.verify({
        nid: formData.national_id.trim(),
        fullname: formData.name || undefined,
      });

      if (res.success && res.verified) {
        setNidaVerified(true);
        if (res.data?.fullname && !formData.name) {
          setFormData((prev) => ({
            ...prev,
            name: res.data.fullname,
            province: res.data.province || prev.province,
            district: res.data.district || prev.district,
            sector: res.data.sector || prev.sector,
            cell: res.data.cell || prev.cell,
            village: res.data.village || prev.village,
          }));
        }
        toast({
          title: "NIDA Verified",
          description: "Citizen identity verified successfully.",
          variant: "success",
        });
      } else {
        toast({
          title: "Verification failed",
          description: res.message || "Record not found in NIDA database.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Verification error",
        description: err?.response?.data?.message || "Failed to reach NIDA verification service.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingNida(false);
    }
  };

  const handleVerifyPhoneClick = async () => {
    if (!formData.phone || formData.phone.trim().length < 8) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number before verifying.",
        variant: "destructive"
      });
      return;
    }
    setIsSendingPhoneOtp(true);
    try {
      const res = await authApi.sendVerificationCode({
        type: 'phone',
        target: formData.phone.trim()
      });
      if (res.success) {
        toast({
          title: "OTP Sent via SMS",
          description: `Verification code sent to ${formData.phone}.`
        });
        setShowPhoneOtpModal(true);
      }
    } catch (err: any) {
      toast({
        title: "Failed to Send OTP",
        description: err?.response?.data?.message || "Could not dispatch verification SMS.",
        variant: "destructive"
      });
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const handleConfirmPhoneOtp = async () => {
    if (!phoneOtpCode || phoneOtpCode.trim().length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit OTP code received via SMS.",
        variant: "destructive"
      });
      return;
    }
    setIsVerifyingPhoneOtp(true);
    try {
      const res = await authApi.verifyVerificationCode({
        type: 'phone',
        target: formData.phone.trim(),
        code: phoneOtpCode.trim()
      });
      if (res.success && res.verified) {
        setPhoneVerified(true);
        setShowPhoneOtpModal(false);
        setPhoneOtpCode("");
        toast({
          title: "Phone Verified",
          description: "Phone number successfully verified!"
        });
      }
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err?.response?.data?.message || "Invalid or expired verification code.",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingPhoneOtp(false);
    }
  };

  const handleVerifyEmailClick = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address before verifying.",
        variant: "destructive"
      });
      return;
    }
    setIsSendingEmailOtp(true);
    try {
      const res = await authApi.sendVerificationCode({
        type: 'email',
        target: formData.email.trim()
      });
      if (res.success) {
        toast({
          title: "OTP Sent to Email",
          description: `Verification code sent to ${formData.email}.`
        });
        setShowEmailOtpModal(true);
      }
    } catch (err: any) {
      toast({
        title: "Failed to Send Email OTP",
        description: err?.response?.data?.message || "Could not dispatch verification email.",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleConfirmEmailOtp = async () => {
    if (!emailOtpCode || emailOtpCode.trim().length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit OTP code received in your email.",
        variant: "destructive"
      });
      return;
    }
    setIsVerifyingEmailOtp(true);
    try {
      const res = await authApi.verifyVerificationCode({
        type: 'email',
        target: formData.email.trim(),
        code: emailOtpCode.trim()
      });
      if (res.success && res.verified) {
        setEmailVerified(true);
        setShowEmailOtpModal(false);
        setEmailOtpCode("");
        toast({
          title: "Email Verified",
          description: "Email address successfully verified!"
        });
      }
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err?.response?.data?.message || "Invalid or expired verification code.",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingEmailOtp(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields for the active step when worker is completing their profile
    if (isWorker && isRegUserLocked) {
      if (currentStep === 0) {
        if (!formData.gender?.trim() || !formData.date_of_birth?.trim() || !formData.marital_status?.trim()) {
          toast({ title: "Required Fields Missing", description: "Please fill in Gender, Date of Birth, and Marital Status.", variant: "destructive" });
          return;
        }
      } else if (currentStep === 1) {
        if (!formData.province?.trim() || !formData.district?.trim() || !formData.sector?.trim() || !formData.cell?.trim() || !formData.village?.trim() || !formData.address?.trim()) {
          toast({ title: "Address Incomplete", description: "Please fill in Province, District, Sector, Cell, Village, and Street / Landmark.", variant: "destructive" });
          return;
        }
      } else if (currentStep === 2) {
        const hasDuty = HOUSEHOLD_DUTY_FIELDS.some((d) => Boolean((formData as any)[d.key]));
        if (!formData.profession?.trim() || !formData.professions?.length || !formData.work_type?.trim() || !formData.experience_level?.trim() || formData.experience_years === "" || !formData.languages_spoken?.length || selectedDistrictsList.length === 0 || !hasDuty || !formData.available_from?.trim() || !formData.available_to?.trim() || !formData.special_skills?.trim()) {
          toast({ title: "Preferences Incomplete", description: "Please complete all required (*) fields in Preferences & Skills before saving.", variant: "destructive" });
          return;
        }
      } else if (currentStep === 3) {
        const insValid = !formData.has_insurance || (Boolean(formData.insurance_type?.trim()) && Boolean(formData.insurance_provider?.trim()) && Boolean(formData.insurance_number?.trim()));
        if (!(Number(formData.min_salary) > 0) || !(Number(formData.max_salary) > 0) || !insValid || !formData.bio?.trim() || !formData.education_level?.trim() || !formData.referee_name?.trim() || !formData.referee_phone?.trim() || !formData.referee_relationship?.trim()) {
          toast({ title: "Qualifications Incomplete", description: "Please complete all required (*) fields in Salary & Qualifications before saving.", variant: "destructive" });
          return;
        }
      }
    }

    try {
      const mergedProfessions = Array.from(
        new Set([formData.profession, ...(formData.professions || [])].filter(Boolean))
      );
      const preferredDistrictsArr = String(formData.preferred_districts || "")
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);

      const extendedProfilePayload = isWorker
        ? {
            ...(extObj || {}),
            marital_status: formData.marital_status,
            education_level: formData.education_level,
            years_of_experience: Number(formData.experience_years) || 0,
            preferred_work_type: formData.work_type,
            available_from: formData.available_from,
            available_to: formData.available_to,
            available_weekends: formData.available_weekends,
            available_holidays: formData.available_holidays,
            is_physically_fit: formData.is_physically_fit,
            has_driving_licence: formData.has_driving_licence,
            has_cooking_certificate: formData.has_cooking_certificate,
            has_first_aid_certificate: formData.has_first_aid_certificate,
            has_childcare_certificate: formData.has_childcare_certificate,
            is_baby_sitter: formData.accept_childcare,
            accept_house_chores: formData.accept_house_chores,
            accept_childcare: formData.accept_childcare,
            accept_cooking: formData.accept_cooking,
            accept_laundry: formData.accept_laundry,
            accept_ironing: formData.accept_ironing,
            accept_gardening: formData.accept_gardening,
            accept_elderly_care: formData.accept_elderly_care,
            accept_pet_care: formData.accept_pet_care,
            accept_shopping: formData.accept_shopping,
            accept_car_washing: formData.accept_car_washing,
            accept_driving: formData.accept_driving,
            referee_3_name: formData.referee_name,
            referee_3_phone: formData.referee_phone,
            referee_3_relationship: formData.referee_relationship,
            bio: formData.bio,
            special_skills: formData.special_skills,
          }
        : undefined;

      const payload: any = isCompany
        ? {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            status: formData.status,
            tin_number: formData.tin_number,
            billing_plan: formData.billing_plan,
            trial_days: Number(formData.trial_days) || 14,
            subscription_amount: Number(formData.subscription_amount) || 0,
            subscription_cycle: formData.subscription_cycle,
            subscription_period_days: Number(formData.subscription_period_days) || 30,
            province: formData.province,
            district: formData.district,
            sector: formData.sector,
            cell: formData.cell,
            village: formData.village,
            address: formData.address,
            profile_photo: formData.profile_photo,
          }
        : {
            ...formData,
            national_id: isIdExempt ? "" : formData.national_id,
        ...(isWorker
          ? {
              professions: mergedProfessions,
              skills: mergedProfessions,
              experience_level: formData.experience_level,
              experience_years: Number(formData.experience_years) || 0,
              languages_spoken: formData.languages_spoken,
              work_type_preferences: [formData.work_type],
              preferred_districts:
                preferredDistrictsArr.length > 0
                  ? preferredDistrictsArr
                  : formData.district
                    ? [formData.district]
                    : [],
              min_salary: Number(formData.min_salary) || 0,
              max_salary: Number(formData.max_salary) || 0,
              expected_salary: Number(formData.min_salary) || 0,
              has_insurance: Boolean(formData.has_insurance),
              insurance_type: formData.has_insurance ? formData.insurance_type : null,
              insurance_provider: formData.has_insurance ? formData.insurance_provider : null,
              insurance_number: formData.has_insurance ? formData.insurance_number : null,
              availability_status: formData.availability_status,
              extended_profile: extendedProfilePayload,
            }
          : {}),
      };

      const res: any = await updateUser.mutateAsync({ id: fetchedUser.id || targetId, data: payload });
      const updatedFromServer = res?.data;

      const cachedUserStr = localStorage.getItem("user");
      if (cachedUserStr) {
        try {
          const cachedUser = JSON.parse(cachedUserStr);
          if (cachedUser.id === fetchedUser.id || !fetchedUser.id) {
            cachedUser.name = formData.name;
            cachedUser.email = formData.email;
            cachedUser.phone = formData.phone;
            cachedUser.gender = formData.gender;
            cachedUser.date_of_birth = formData.date_of_birth;
            cachedUser.address = formData.address;
            if (formData.profile_photo) cachedUser.profile_photo = formData.profile_photo;
            if (formData.province) cachedUser.province = formData.province;
            if (formData.district) cachedUser.district = formData.district;
            if (formData.sector) cachedUser.sector = formData.sector;
            if (formData.cell) cachedUser.cell = formData.cell;
            if (formData.village) cachedUser.village = formData.village;
            if (isWorker) {
              const updatedWorker = updatedFromServer?.worker || {
                ...(cachedUser.worker || {}),
                professions: mergedProfessions,
                skills: mergedProfessions,
                experience_level: formData.experience_level,
                experience_years: Number(formData.experience_years) || 0,
                languages_spoken: formData.languages_spoken,
                work_type_preferences: [formData.work_type],
                preferred_districts:
                  preferredDistrictsArr.length > 0
                    ? preferredDistrictsArr
                    : formData.district
                      ? [formData.district]
                      : [],
                min_salary: Number(formData.min_salary) || 0,
                max_salary: Number(formData.max_salary) || 0,
                expected_salary: Number(formData.min_salary) || 0,
                has_insurance: Boolean(formData.has_insurance),
                insurance_type: formData.has_insurance ? formData.insurance_type : null,
                insurance_provider: formData.has_insurance ? formData.insurance_provider : null,
                insurance_number: formData.has_insurance ? formData.insurance_number : null,
                availability_status: formData.availability_status,
                extended_profile: extendedProfilePayload,
              };
              cachedUser.worker = updatedWorker;
              cachedUser.role_profile = updatedWorker;
            }
            localStorage.setItem("user", JSON.stringify(cachedUser));
          }
        } catch (_) {}
      }
      window.dispatchEvent(new Event("user_updated"));
      toast({
        title: "Profile updated successfully",
        description: `All profile & preference details for ${formData.name} have been saved.`,
        variant: "success",
      });
      onBack();
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.response?.data?.message || "Failed to update user profile.",
        variant: "destructive",
      });
    }
  };

  if (isFetchingUser) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center text-slate-900 gap-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#0073bb]" />
        <p className="text-sm font-medium text-slate-600">Fetching user profile from database...</p>
      </div>
    );
  }

  const isStep0Done = Boolean(
    (formData.profile_photo || fetchedUser.profile_photo) &&
    formData.name?.trim() &&
    formData.phone?.trim() &&
    formData.email?.trim() &&
    (isIdExempt ||
      (formData.registration_document_type === "passport"
        ? formData.passport_number?.trim()
        : formData.national_id?.trim())) &&
    (!isWorker || (formData.gender?.trim() && formData.date_of_birth?.trim() && formData.marital_status?.trim()))
  );

  const isStep1Done = isCompany
    ? Boolean(formData.province?.trim() && formData.district?.trim())
    : Boolean(
        formData.province?.trim() &&
        formData.district?.trim() &&
        formData.sector?.trim() &&
        formData.cell?.trim() &&
        formData.village?.trim() &&
        (!isWorker || formData.address?.trim())
      );

  const isStep2Done = Boolean(
    formData.profession?.trim() &&
    Array.isArray(formData.professions) &&
    formData.professions.length > 0 &&
    formData.work_type?.trim() &&
    formData.availability_status?.trim() &&
    formData.experience_level?.trim() &&
    formData.experience_years !== "" &&
    Array.isArray(formData.languages_spoken) &&
    formData.languages_spoken.length > 0 &&
    selectedDistrictsList.length > 0 &&
    HOUSEHOLD_DUTY_FIELDS.some((d) => Boolean((formData as any)[d.key])) &&
    formData.available_from?.trim() &&
    formData.available_to?.trim() &&
    formData.special_skills?.trim()
  );

  const isStep3Done = Boolean(
    Number(formData.min_salary) > 0 &&
    Number(formData.max_salary) > 0 &&
    (!formData.has_insurance ||
      (formData.insurance_type?.trim() &&
        formData.insurance_provider?.trim() &&
        formData.insurance_number?.trim())) &&
    formData.bio?.trim() &&
    formData.education_level?.trim() &&
    formData.referee_name?.trim() &&
    formData.referee_phone?.trim() &&
    formData.referee_relationship?.trim()
  );

  const STEPS = isWorker
    ? [
        { id: "info", stepNumber: "Step 01", title: "Personal Information", description: "Name, ID & contact details", completed: isStep0Done },
        { id: "location", stepNumber: "Step 02", title: "Address & Location", description: "Residential jurisdiction", completed: isStep1Done },
        { id: "preferences", stepNumber: "Step 03", title: "Preferences & Skills", description: "Professions, chores & schedule", completed: isStep2Done },
        { id: "qualifications", stepNumber: "Step 04", title: "Salary & Qualifications", description: "Salary, insurance, certificates & bio", completed: isStep3Done },
      ]
    : isCompany
    ? [
        { id: "company_info", stepNumber: "Step 01", title: "Company Information", description: "Company name, TIN & contact details", completed: Boolean(formData.name && formData.phone) },
        { id: "billing_location", stepNumber: "Step 02", title: "Billing & Address", description: "Free trial, subscription & jurisdiction", completed: Boolean(formData.province && formData.district) },
      ]
    : [
        { id: "info", stepNumber: "Step 01", title: "Personal Information", description: "Name, credentials and profile photo", completed: isStep0Done },
        { id: "location", stepNumber: "Step 02", title: "Address & Location", description: "Residential jurisdiction details", completed: isStep1Done },
      ];

  const handleStepNavigation = (idx: number) => {
    setCurrentStep(idx);
  };

  return (
    <DedicatedFormPage
      onBack={onBack}
      backLabel="Cancel"
      title={isCompany ? `Edit Company: ${formData.name || fetchedUser.name || "Company"}` : `Edit profile: ${fetchedUser.name || user?.name || "Worker"}`}
      subtitle="All fields with a red asterisk * are mandatory to complete your profile"
      steps={STEPS}
      currentStep={currentStep}
      onStepClick={handleStepNavigation}
      completionPercentage={95}
      profileAvatar={{
        src: formData.profile_photo || fetchedUser.profile_photo,
        name: formData.name || fetchedUser.name,
        role: fetchedUser.role,
        onPhotoChange: handlePhotoChange,
        disabled: isRegUserLocked && Boolean(fetchedUser.profile_photo),
      }}
      primaryActionLabel={updateUser.isPending ? "Saving..." : "Save Profile"}
      onPrimaryAction={handleSubmit}
      secondaryActionLabel={currentStep < STEPS.length - 1 ? "Next Step" : currentStep > 0 ? "Previous Step" : undefined}
      onSecondaryAction={
        currentStep < STEPS.length - 1
          ? () => setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1))
          : currentStep > 0
            ? () => setCurrentStep((prev) => Math.max(0, prev - 1))
            : undefined
      }
      isLoading={updateUser.isPending}
    >
      <div className="space-y-8 text-left">
        {/* ── STEP 0: COMPANY INFORMATION ── */}
        {currentStep === 0 && isCompany && (
          <div id="edit-section-company-info" className="space-y-4 text-left animate-in fade-in duration-200 max-w-2xl">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
              Company details
            </h3>

            <FormField label="Company Name" required>
              <FormInput
                type="text"
                placeholder="Enter company / business name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </FormField>

            <FormField label="Company Email" required>
              <FormInput
                type="email"
                placeholder="company@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </FormField>

            <FormField label="Company Phone Number" required>
              <div className="flex rounded-[6px] overflow-hidden bg-[#E9ECF0] focus-within:ring-2 focus-within:ring-[#0073bb]/30">
                <div className="flex items-center gap-1.5 px-3 bg-[#E9ECF0] border-r border-slate-300/80 text-xs font-medium text-slate-700 shrink-0 select-none">
                  <span className="text-sm">🇷🇼</span>
                  <span>+250</span>
                </div>
                <input
                  type="text"
                  placeholder="788 000 000"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="flex-1 bg-transparent px-3.5 h-11 text-sm outline-none text-slate-800 placeholder-slate-400"
                />
              </div>
            </FormField>

            <FormField label="TIN / Commercial Registration Number">
              <FormInput
                type="text"
                placeholder="e.g. 102938475"
                value={formData.tin_number}
                onChange={(e) => handleChange("tin_number", e.target.value)}
              />
            </FormField>

            <FormField label="Account Status" required>
              <FormSelect
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </FormSelect>
            </FormField>
          </div>
        )}

        {/* ── STEP 0: PERSONAL INFORMATION (NON-COMPANY) ── */}
        {currentStep === 0 && !isCompany && (
          <div id="edit-section-info" className="space-y-4 text-left animate-in fade-in duration-200 max-w-2xl">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
              Profile details
            </h3>

            {!isIdExempt && (
              <>
                <FormField label="Verify account using" required>
                  <FormSelect
                    value={formData.registration_document_type || "nida"}
                    disabled={isRegUserLocked && Boolean(fetchedUser.national_id || fetchedUser.passport_number)}
                    className={isRegUserLocked && Boolean(fetchedUser.national_id || fetchedUser.passport_number) ? "opacity-80 cursor-not-allowed" : ""}
                    onChange={(e) => handleChange("registration_document_type", e.target.value)}
                  >
                    <option value="nida">Identification number (NIDA)</option>
                    <option value="passport">Passport number</option>
                  </FormSelect>
                </FormField>

                {formData.registration_document_type === "passport" ? (
                  <FormField label="Passport Number" required>
                    <FormInput
                      type="text"
                      placeholder="Enter passport number"
                      value={formData.passport_number}
                      disabled={isRegUserLocked && Boolean(fetchedUser.passport_number)}
                      className={isRegUserLocked && Boolean(fetchedUser.passport_number) ? "opacity-80 cursor-not-allowed" : ""}
                      onChange={(e) => handleChange("passport_number", e.target.value.toUpperCase())}
                    />
                  </FormField>
                ) : (
                  <FormField label="ID Number" required>
                    <div className="flex rounded-[6px] overflow-hidden bg-[#E9ECF0] focus-within:ring-2 focus-within:ring-[#0073bb]/30">
                      <input
                        type="text"
                        placeholder="ID number"
                        value={formData.national_id}
                        disabled={isRegUserLocked && Boolean(fetchedUser.national_id)}
                        onChange={(e) => {
                          handleChange("national_id", e.target.value);
                          setNidaVerified(false);
                        }}
                        maxLength={16}
                        className={`flex-1 bg-transparent px-3.5 h-11 text-sm outline-none text-slate-800 placeholder-slate-400 font-mono ${isRegUserLocked && Boolean(fetchedUser.national_id) ? "opacity-80 cursor-not-allowed" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyNida}
                        disabled={(isRegUserLocked && Boolean(fetchedUser.national_id)) || isVerifyingNida || !formData.national_id}
                        className="bg-[#0073bb] hover:bg-[#005f9e] disabled:opacity-50 text-white text-xs font-semibold px-4 h-11 flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isVerifyingNida ? "verifying..." : nidaVerified ? "verified" : "verify"}
                      </button>
                    </div>
                  </FormField>
                )}
              </>
            )}

            <FormField label="Names" required>
              <FormInput
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                disabled={isRegUserLocked && Boolean(fetchedUser.name)}
                className={isRegUserLocked && Boolean(fetchedUser.name) ? "opacity-80 cursor-not-allowed" : ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Account type" required>
                <FormSelect
                  value={fetchedUser.role || user?.role}
                  disabled
                  className="opacity-90 capitalize cursor-not-allowed"
                >
                  <option value={fetchedUser.role || user?.role}>{fetchedUser.role || user?.role}</option>
                </FormSelect>
              </FormField>

              <FormField label="Gender" required={isWorker}>
                <FormSelect
                  value={formData.gender}
                  disabled={isRegUserLocked && Boolean(fetchedUser.gender)}
                  className={isRegUserLocked && Boolean(fetchedUser.gender) ? "opacity-80 cursor-not-allowed" : ""}
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </FormSelect>
              </FormField>
            </div>

            {isWorker && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Date of Birth" required>
                  <FormInput
                    type="date"
                    value={formData.date_of_birth}
                    disabled={isRegUserLocked && Boolean(fetchedUser.date_of_birth)}
                    className={isRegUserLocked && Boolean(fetchedUser.date_of_birth) ? "opacity-80 cursor-not-allowed" : ""}
                    onChange={(e) => handleChange("date_of_birth", e.target.value)}
                  />
                </FormField>

                <FormField label="Marital Status" required>
                  <FormSelect
                    value={formData.marital_status}
                    onChange={(e) => handleChange("marital_status", e.target.value)}
                  >
                    <option value="">Select Marital Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </FormSelect>
                </FormField>
              </div>
            )}

            <FormField label="Email" required>
              <div className="flex rounded-[6px] overflow-hidden bg-[#E9ECF0] focus-within:ring-2 focus-within:ring-[#0073bb]/30">
                <input
                  type="email"
                  placeholder="jeankubera0@gmail.com"
                  value={formData.email}
                  disabled={isRegUserLocked && Boolean(fetchedUser.email)}
                  onChange={(e) => {
                    handleChange("email", e.target.value);
                    setEmailVerified(false);
                  }}
                  className={`flex-1 bg-transparent px-3.5 h-11 text-sm outline-none text-slate-800 placeholder-slate-400 ${isRegUserLocked && Boolean(fetchedUser.email) ? "opacity-80 cursor-not-allowed" : ""}`}
                />
                <button
                  type="button"
                  onClick={handleVerifyEmailClick}
                  disabled={(isRegUserLocked && Boolean(fetchedUser.email)) || isSendingEmailOtp || !formData.email}
                  className={`${emailVerified ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#0073bb] hover:bg-[#005f9e]"} disabled:opacity-50 text-white text-xs font-semibold px-4 h-11 flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed gap-1`}
                >
                  {isSendingEmailOtp ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : emailVerified ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Verified</span>
                    </>
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            </FormField>

            <FormField label="Phone Number" required>
              <div className="flex rounded-[6px] overflow-hidden bg-[#E9ECF0] focus-within:ring-2 focus-within:ring-[#0073bb]/30">
                <div className="flex items-center gap-1.5 px-3 bg-[#E9ECF0] border-r border-slate-300/80 text-xs font-medium text-slate-700 shrink-0 select-none">
                  <span className="text-sm">🇷🇼</span>
                  <span>+250</span>
                </div>
                <input
                  type="text"
                  placeholder="783 202 922"
                  value={formData.phone}
                  disabled={isRegUserLocked && Boolean(fetchedUser.phone)}
                  onChange={(e) => {
                    handleChange("phone", e.target.value);
                    setPhoneVerified(false);
                  }}
                  className={`flex-1 bg-transparent px-3.5 h-11 text-sm outline-none text-slate-800 placeholder-slate-400 ${isRegUserLocked && Boolean(fetchedUser.phone) ? "opacity-80 cursor-not-allowed" : ""}`}
                />
                <button
                  type="button"
                  onClick={handleVerifyPhoneClick}
                  disabled={(isRegUserLocked && Boolean(fetchedUser.phone)) || isSendingPhoneOtp || !formData.phone}
                  className={`${phoneVerified ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#0073bb] hover:bg-[#005f9e]"} disabled:opacity-50 text-white text-xs font-semibold px-4 h-11 flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed gap-1`}
                >
                  {isSendingPhoneOtp ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : phoneVerified ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Verified</span>
                    </>
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            </FormField>
          </div>
        )}

        {/* ── STEP 1: BILLING & JURISDICTION (COMPANY) ── */}
        {currentStep === 1 && isCompany && (
          <div id="edit-section-billing-location" className="space-y-6 text-left animate-in fade-in duration-200 max-w-2xl">
            {/* Billing Configuration */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-blue-100 flex items-center justify-between">
                <span>Billing & Subscription Plan</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">Company Billing</span>
              </h3>

              <FormField label="Billing Model" required>
                <FormSelect
                  value={formData.billing_plan}
                  onChange={(e) => handleChange("billing_plan", e.target.value)}
                >
                  <option value="free_trial">Free Trial (Access Granted Free for Agreed Days)</option>
                  <option value="subscription">Subscription Fee (Requires Payment)</option>
                </FormSelect>
              </FormField>

              {formData.billing_plan === "free_trial" ? (
                <FormField label="Free Trial Days Remaining / Granted" required>
                  <FormInput
                    type="number"
                    min="1"
                    placeholder="14"
                    value={formData.trial_days}
                    onChange={(e) => handleChange("trial_days", e.target.value)}
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Company can log in and use full features until trial expiration.
                  </span>
                </FormField>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="Subscription Fee (RWF)" required>
                      <FormInput
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="50000"
                        value={formData.subscription_amount}
                        onChange={(e) => handleChange("subscription_amount", e.target.value)}
                      />
                    </FormField>

                    <FormField label="Billing Cycle" required>
                      <FormSelect
                        value={formData.subscription_cycle}
                        onChange={(e) => handleChange("subscription_cycle", e.target.value)}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly (3 Months)</option>
                        <option value="semi_annual">Semi-Annual (6 Months)</option>
                        <option value="annual">Annual (1 Year)</option>
                        <option value="custom">Agreed Period (Custom Days)</option>
                      </FormSelect>
                    </FormField>
                  </div>

                  {formData.subscription_cycle === "custom" && (
                    <FormField label="Custom Period Length (Days)" required>
                      <FormInput
                        type="number"
                        min="1"
                        placeholder="30"
                        value={formData.subscription_period_days}
                        onChange={(e) => handleChange("subscription_period_days", e.target.value)}
                      />
                    </FormField>
                  )}
                </div>
              )}
            </div>

            {/* Location & Jurisdiction */}
            <div className="space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                Company Head Office / Location
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Province" required>
                  <FormSelect
                    value={formData.province}
                    onChange={(e) => {
                      handleLocationChange("province", e.target.value);
                      handleChange("district", "");
                      handleChange("sector", "");
                    }}
                  >
                    <option value="">Select Province</option>
                    {(Array.isArray(provinces) ? provinces : []).map((p: any) => (
                      <option key={p.id || p.name} value={p.name}>{p.name}</option>
                    ))}
                  </FormSelect>
                </FormField>

                <FormField label="District" required>
                  <FormSelect
                    value={formData.district}
                    disabled={!formData.province}
                    onChange={(e) => {
                      handleLocationChange("district", e.target.value);
                      handleChange("sector", "");
                    }}
                  >
                    <option value="">Select District</option>
                    {(Array.isArray(districts) ? districts : []).map((d: any) => (
                      <option key={d.id || d.name} value={d.name}>{d.name}</option>
                    ))}
                  </FormSelect>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="Sector">
                  <FormSelect
                    value={formData.sector}
                    disabled={!formData.district}
                    onChange={(e) => handleLocationChange("sector", e.target.value)}
                  >
                    <option value="">Select Sector</option>
                    {(Array.isArray(sectors) ? sectors : []).map((s: any) => (
                      <option key={s.id || s.name} value={s.name}>{s.name}</option>
                    ))}
                  </FormSelect>
                </FormField>

                <FormField label="Cell">
                  <FormInput
                    type="text"
                    placeholder="Enter Cell"
                    value={formData.cell}
                    onChange={(e) => handleChange("cell", e.target.value)}
                  />
                </FormField>

                <FormField label="Village">
                  <FormInput
                    type="text"
                    placeholder="Enter Village"
                    value={formData.village}
                    onChange={(e) => handleChange("village", e.target.value)}
                  />
                </FormField>
              </div>

              <FormField label="Street Address / Office Building">
                <FormInput
                  type="text"
                  placeholder="e.g. KN 4 Ave, Building 12, Floor 3"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </FormField>
            </div>
          </div>
        )}

        {/* ── STEP 1: ADDRESS & LOCATION (NON-COMPANY) ── */}
        {currentStep === 1 && !isCompany && (
          <div id="edit-section-location" className="space-y-4 text-left animate-in fade-in duration-200 max-w-2xl">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
              Current location details
            </h3>

            <FormField label="Country" required>
              <FormSelect value="Rwanda" disabled className="opacity-90">
                <option value="Rwanda">Rwanda</option>
              </FormSelect>
            </FormField>

            <FormField label="Province" required={isWorker}>
              <FormSelect
                value={formData.province}
                disabled={isLocationLocked && Boolean(fetchedUser.province)}
                className={isLocationLocked && Boolean(fetchedUser.province) ? "opacity-80 cursor-not-allowed" : ""}
                onChange={(e) => handleLocationChange("province", e.target.value)}
              >
                <option value="">Province</option>
                {(Array.isArray(provinces) ? provinces : []).map((p: any) => (
                  <option key={p.id || p.name} value={p.name}>{p.name}</option>
                ))}
              </FormSelect>
            </FormField>

            <FormField label="District" required={isWorker}>
              <FormSelect
                value={formData.district}
                onChange={(e) => handleLocationChange("district", e.target.value)}
                disabled={!formData.province || (isLocationLocked && Boolean(fetchedUser.district))}
                className={isLocationLocked && Boolean(fetchedUser.district) ? "opacity-80 cursor-not-allowed" : ""}
              >
                <option value="">District</option>
                {(Array.isArray(districts) ? districts : []).map((d: any) => (
                  <option key={d.id || d.name} value={d.name}>{d.name}</option>
                ))}
              </FormSelect>
            </FormField>

            <FormField label="Sector" required={isWorker}>
              <FormSelect
                value={formData.sector}
                onChange={(e) => handleLocationChange("sector", e.target.value)}
                disabled={!formData.district || (isLocationLocked && Boolean(fetchedUser.sector))}
                className={isLocationLocked && Boolean(fetchedUser.sector) ? "opacity-80 cursor-not-allowed" : ""}
              >
                <option value="">Sector</option>
                {(Array.isArray(sectors) ? sectors : []).map((s: any) => (
                  <option key={s.id || s.name} value={s.name}>{s.name}</option>
                ))}
              </FormSelect>
            </FormField>

            <FormField label="Cell" required={isWorker}>
              <FormSelect
                value={formData.cell}
                onChange={(e) => handleLocationChange("cell", e.target.value)}
                disabled={!formData.sector || (isLocationLocked && Boolean(fetchedUser.cell))}
                className={isLocationLocked && Boolean(fetchedUser.cell) ? "opacity-80 cursor-not-allowed" : ""}
              >
                <option value="">Cell</option>
                {(Array.isArray(cells) ? cells : []).map((c: any) => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </FormSelect>
            </FormField>

            <FormField label="Village" required={isWorker}>
              <FormSelect
                value={formData.village}
                onChange={(e) => handleLocationChange("village", e.target.value)}
                disabled={!formData.cell || (isLocationLocked && Boolean(fetchedUser.village))}
                className={isLocationLocked && Boolean(fetchedUser.village) ? "opacity-80 cursor-not-allowed" : ""}
              >
                <option value="">Village</option>
                {(Array.isArray(villages) ? villages : []).map((v: any) => (
                  <option key={v.id || v.name} value={v.name}>{v.name}</option>
                ))}
              </FormSelect>
            </FormField>

            <FormField label={isWorker ? "Street / Residential Landmark" : "Street / Residential Landmark (Optional)"} required={isWorker}>
              <FormInput
                type="text"
                placeholder="e.g. KG 15 Ave, Near Remera Sector Office"
                value={formData.address}
                disabled={isLocationLocked && Boolean(fetchedUser.address)}
                className={isLocationLocked && Boolean(fetchedUser.address) ? "opacity-80 cursor-not-allowed" : ""}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </FormField>
          </div>
        )}

        {/* ── STEP 2: WORKER PREFERENCES, SKILLSET & HOUSEHOLD DUTIES (WORKER ONLY) ── */}
        {isWorker && (
          <>
            {currentStep === 2 && (
              <div id="edit-section-preferences" className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left">
                {/* Left Column: Work Preferences & Skillset */}
                <div className="space-y-4 text-left">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                    Work preferences & skillset
                  </h3>

                  <FormField label="Primary Profession / Job Category" required>
                    <FormSelect
                      value={formData.profession}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleChange("profession", val);
                        if (val && !formData.professions.includes(val)) {
                          handleChange("professions", [val, ...formData.professions]);
                        }
                      }}
                    >
                      <option value="">Select Primary Profession</option>
                      {WORKER_PROFESSIONS.map((prof) => (
                        <option key={prof} value={prof}>
                          {prof}
                        </option>
                      ))}
                    </FormSelect>
                  </FormField>

                  <FormField label="Additional Skills & Roles (Select all that apply)" required>
                    <div className="flex flex-wrap gap-2 p-3 rounded-[6px] bg-[#E9ECF0]/60 border border-slate-200/80">
                      {WORKER_PROFESSIONS.slice(0, 10).map((prof) => {
                        const active = formData.professions.includes(prof);
                        return (
                          <button
                            key={prof}
                            type="button"
                            onClick={() => toggleProfessionSkill(prof)}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                              active
                                ? "bg-[#0073bb] text-white shadow-2xs"
                                : "bg-white text-slate-700 border border-slate-200 hover:border-[#0073bb]"
                            }`}
                          >
                            {active && <Check className="w-3 h-3 stroke-[3]" />}
                            <span>{prof}</span>
                          </button>
                        );
                      })}
                    </div>
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="Preferred Work Type" required>
                      <FormSelect
                        value={formData.work_type}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleChange("work_type", val);
                          if (val === "part_time" || val === "partial") {
                            // If user previously had default monthly salaries, switch them to shift rate defaults
                            if (!formData.min_salary || Number(formData.min_salary) >= 30000) {
                              handleChange("min_salary", "5000");
                            }
                            if (!formData.max_salary || Number(formData.max_salary) >= 50000) {
                              handleChange("max_salary", "15000");
                            }
                          } else if (formData.work_type === "part_time" || formData.work_type === "partial") {
                            // If switching back from part-time to full-time / other
                            if (Number(formData.min_salary) <= 25000) {
                              handleChange("min_salary", "60000");
                            }
                            if (Number(formData.max_salary) <= 30000) {
                              handleChange("max_salary", "120000");
                            }
                          }
                        }}
                      >
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time / Partial Shifts</option>
                        <option value="live_in">Live-in (Stay at Employer)</option>
                        <option value="live_out">Live-out (Commute Daily)</option>
                        <option value="contract">Fixed Contract</option>
                        <option value="temporary">Temporary / Relief</option>
                      </FormSelect>
                    </FormField>

                    <FormField label="Availability Status" required>
                      <FormSelect
                        value={formData.availability_status}
                        onChange={(e) => handleChange("availability_status", e.target.value)}
                      >
                        <option value="available">Available for Hire</option>
                        <option value="unavailable">Currently Unavailable</option>
                      </FormSelect>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="Experience Level" required>
                      <FormSelect
                        value={formData.experience_level}
                        onChange={(e) => handleChange("experience_level", e.target.value)}
                      >
                        <option value="">Select Experience Level</option>
                        <option value="beginner">Beginner (&lt; 1 year)</option>
                        <option value="intermediate">Intermediate (1-3 years)</option>
                        <option value="expert">Expert (3+ years)</option>
                      </FormSelect>
                    </FormField>

                    <FormField label="Years of Experience" required>
                      <FormInput
                        type="number"
                        min={0}
                        max={40}
                        placeholder="e.g. 2"
                        value={formData.experience_years}
                        onChange={(e) => handleChange("experience_years", e.target.value)}
                      />
                    </FormField>
                  </div>

                  <FormField label="Languages Spoken" required>
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {SPOKEN_LANGUAGE_OPTIONS.map((lang) => {
                        const checked = formData.languages_spoken.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className={`px-3 py-2 rounded-[6px] text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              checked
                                ? "bg-[#0073bb] text-white border-[#0073bb]"
                                : "bg-[#E9ECF0] text-slate-700 border-transparent hover:border-slate-300"
                            }`}
                          >
                            {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            <span>{lang}</span>
                          </button>
                        );
                      })}
                    </div>
                  </FormField>

                  <FormField label="Preferred Working Districts" required>
                    <div className="rounded-[6px] bg-[#E9ECF0]/60 border border-slate-200/80 p-3.5 space-y-3">
                      {/* Select All / Counter Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
                        <label
                          className="flex items-center gap-2 text-xs font-bold text-[#0073bb] cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isAllDistrictsSelected}
                            onChange={toggleAllDistricts}
                            className="h-4 w-4 rounded border-slate-300 text-[#0073bb] focus:ring-[#0073bb] cursor-pointer"
                          />
                          <span>Select All Districts ({RWANDA_DISTRICTS.length})</span>
                        </label>

                        <span className="text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                          {selectedDistrictsList.length} selected
                        </span>
                      </div>

                      {/* Tickable Grid of Districts */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                        {RWANDA_DISTRICTS.map((dist) => {
                          const checked = selectedDistrictsList.includes(dist);
                          return (
                            <label
                              key={dist}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer select-none border transition-all ${
                                checked
                                  ? "bg-[#0073bb]/10 border-[#0073bb] text-[#0073bb] font-semibold"
                                  : "bg-white border-slate-200/80 text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => togglePreferredDistrict(dist)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-[#0073bb] focus:ring-[#0073bb] cursor-pointer shrink-0"
                              />
                              <span className="truncate">{dist}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </FormField>
                </div>

                {/* Right Column: Household Duties & Schedule Preferences */}
                <div className="space-y-4 text-left">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                    Household duties & schedule preferences
                  </h3>

                  <FormField label="Household Tasks & Duties You Accept" required>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-[6px] bg-[#E9ECF0]/60 border border-slate-200/80">
                      {HOUSEHOLD_DUTY_FIELDS.map((duty) => {
                        const isChecked = Boolean((formData as any)[duty.key]);
                        return (
                          <label
                            key={duty.key}
                            className="flex items-center gap-2.5 text-xs font-medium text-slate-800 cursor-pointer select-none py-1"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleChange(duty.key, e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-[#0073bb] focus:ring-[#0073bb] cursor-pointer"
                            />
                            <span>{duty.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Preferred Start Time" required>
                      <FormInput
                        type="time"
                        value={formData.available_from}
                        onChange={(e) => handleChange("available_from", e.target.value)}
                      />
                    </FormField>

                    <FormField label="Preferred End Time" required>
                      <FormInput
                        type="time"
                        value={formData.available_to}
                        onChange={(e) => handleChange("available_to", e.target.value)}
                      />
                    </FormField>
                  </div>

                  <FormField label="Work Schedule & Readiness Preferences">
                    <div className="space-y-2.5 p-3.5 rounded-[6px] bg-[#E9ECF0]/60 border border-slate-200/80">
                      <label className="flex items-center gap-2.5 text-xs font-medium text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.available_weekends}
                          onChange={(e) => handleChange("available_weekends", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0073bb] focus:ring-[#0073bb]"
                        />
                        <span>Available to work on Weekends (Saturday / Sunday)</span>
                      </label>

                      <label className="flex items-center gap-2.5 text-xs font-medium text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.available_holidays}
                          onChange={(e) => handleChange("available_holidays", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0073bb] focus:ring-[#0073bb]"
                        />
                        <span>Available to work on Public Holidays</span>
                      </label>

                      <label className="flex items-center gap-2.5 text-xs font-medium text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_physically_fit}
                          onChange={(e) => handleChange("is_physically_fit", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0073bb] focus:ring-[#0073bb]"
                        />
                        <span>Physically fit for active domestic work</span>
                      </label>
                    </div>
                  </FormField>

                  <FormField label="Special Skills / Strengths" required>
                    <FormInput
                      type="text"
                      placeholder="e.g. Newborn care, International cuisine, Dog training, Baking"
                      value={formData.special_skills}
                      onChange={(e) => handleChange("special_skills", e.target.value)}
                    />
                  </FormField>
                </div>
              </div>
            </div>
            )}

            {/* ── STEP 3: SALARY, INSURANCE, QUALIFICATIONS, CERTIFICATES & BIO ── */}
            {currentStep === 3 && (
            <div id="edit-section-qualifications" className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left">
                {/* Left Column: Salary Expectations & Health Insurance */}
                <div className="space-y-4 text-left">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                    {formData.work_type === "part_time" || formData.work_type === "partial"
                      ? "Shift rate expectations & health insurance"
                      : "Salary expectations & health insurance"}
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      label={
                        formData.work_type === "part_time" || formData.work_type === "partial"
                          ? "Min Salary per Shift (RWF)"
                          : "Min Monthly Salary (RWF)"
                      }
                      required
                    >
                      <FormInput
                        type="number"
                        placeholder={
                          formData.work_type === "part_time" || formData.work_type === "partial"
                            ? "5000"
                            : "60000"
                        }
                        value={formData.min_salary}
                        onChange={(e) => handleChange("min_salary", e.target.value)}
                      />
                    </FormField>

                    <FormField
                      label={
                        formData.work_type === "part_time" || formData.work_type === "partial"
                          ? "Max Salary per Shift (RWF)"
                          : "Max Monthly Salary (RWF)"
                      }
                      required
                    >
                      <FormInput
                        type="number"
                        placeholder={
                          formData.work_type === "part_time" || formData.work_type === "partial"
                            ? "15000"
                            : "120000"
                        }
                        value={formData.max_salary}
                        onChange={(e) => handleChange("max_salary", e.target.value)}
                      />
                    </FormField>
                  </div>

                  <FormField label="Health Insurance Type" required>
                    <FormSelect
                      value={formData.has_insurance ? formData.insurance_type : "none"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "none") {
                          handleChange("has_insurance", false);
                        } else {
                          handleChange("has_insurance", true);
                          handleChange("insurance_type", val);
                          if (val === "MITUELLE_DE_SANTE" && !formData.insurance_provider) {
                            handleChange("insurance_provider", "RSSB / Mutuelle");
                          }
                        }
                      }}
                    >
                      <option value="MITUELLE_DE_SANTE">Mutuelle de Santé (Community Health)</option>
                      <option value="RSSB">RSSB / RAMA Medical Insurance</option>
                      <option value="MMI">MMI Insurance</option>
                      <option value="RADIANT">Radiant Health Insurance</option>
                      <option value="OTHERS">Other Private Insurance</option>
                      <option value="none">No Health Insurance</option>
                    </FormSelect>
                  </FormField>

                  {formData.has_insurance && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField label="Insurance Provider" required>
                        <FormInput
                          type="text"
                          placeholder="e.g. RSSB / Radiant"
                          value={formData.insurance_provider}
                          onChange={(e) => handleChange("insurance_provider", e.target.value)}
                        />
                      </FormField>

                      <FormField label="Insurance / Member Number" required>
                        <FormInput
                          type="text"
                          placeholder="Insurance or NIDA number"
                          value={formData.insurance_number}
                          onChange={(e) => handleChange("insurance_number", e.target.value)}
                        />
                      </FormField>
                    </div>
                  )}

                  <FormField label="Professional Bio / About Me" required>
                    <textarea
                      rows={4}
                      placeholder="Write a brief summary about your work ethic, domestic experience, and why employers can trust you..."
                      value={formData.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      className="w-full rounded-[6px] bg-[#E9ECF0] px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#0073bb]/30 resize-y"
                    />
                  </FormField>
                </div>

                {/* Right Column: Education, Certificates & Emergency Referee */}
                <div className="space-y-4 text-left">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                    Qualifications, certificates & emergency referee
                  </h3>

                  <FormField label="Highest Education Level" required>
                    <FormSelect
                      value={formData.education_level}
                      onChange={(e) => handleChange("education_level", e.target.value)}
                    >
                      <option value="">Select Education Level</option>
                      <option value="primary">Primary School</option>
                      <option value="secondary">Secondary School (O-Level / A-Level)</option>
                      <option value="tvet">TVET / Vocational Hospitality Training</option>
                      <option value="university">University / Diploma</option>
                      <option value="none">Informal / Practical Experience</option>
                    </FormSelect>
                  </FormField>

                  <FormField label="Verified Certificates & Licences">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-[6px] bg-[#E9ECF0]/60 border border-slate-200/80">
                      <label className="flex items-center gap-2.5 text-xs font-medium text-slate-800 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={formData.has_driving_licence}
                          onChange={(e) => handleChange("has_driving_licence", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0073bb] focus:ring-[#0073bb]"
                        />
                        <span>Valid Driving Licence</span>
                      </label>

                      <label className="flex items-center gap-2.5 text-xs font-medium text-slate-800 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={formData.has_cooking_certificate}
                          onChange={(e) => handleChange("has_cooking_certificate", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0073bb] focus:ring-[#0073bb]"
                        />
                        <span>Cooking / Culinary Certificate</span>
                      </label>

                      <label className="flex items-center gap-2.5 text-xs font-medium text-slate-800 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={formData.has_first_aid_certificate}
                          onChange={(e) => handleChange("has_first_aid_certificate", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0073bb] focus:ring-[#0073bb]"
                        />
                        <span>First Aid & Safety Certificate</span>
                      </label>

                      <label className="flex items-center gap-2.5 text-xs font-medium text-slate-800 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={formData.has_childcare_certificate}
                          onChange={(e) => handleChange("has_childcare_certificate", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0073bb] focus:ring-[#0073bb]"
                        />
                        <span>Childcare / Nanny Training</span>
                      </label>
                    </div>
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="Referee / Emergency Contact Name" required>
                      <FormInput
                        type="text"
                        placeholder="e.g. Jean Paul Habimana"
                        value={formData.referee_name}
                        onChange={(e) => handleChange("referee_name", e.target.value)}
                      />
                    </FormField>

                    <FormField label="Referee Phone Number" required>
                      <FormInput
                        type="text"
                        placeholder="e.g. 0788 123 456"
                        value={formData.referee_phone}
                        onChange={(e) => handleChange("referee_phone", e.target.value)}
                      />
                    </FormField>
                  </div>

                  <FormField label="Referee Relationship" required>
                    <FormInput
                      type="text"
                      placeholder="e.g. Former Employer, Local Leader, Family Member"
                      value={formData.referee_relationship}
                      onChange={(e) => handleChange("referee_relationship", e.target.value)}
                    />
                  </FormField>
                </div>
              </div>
            </div>
            )}
          </>
        )}
      </div>

      {/* ── Phone OTP Verification Modal ── */}
      {showPhoneOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">Verify Phone Number</h4>
              <button
                type="button"
                onClick={() => setShowPhoneOtpModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              We sent a 6-digit code via SMS to <strong className="text-slate-800">{formData.phone}</strong>. Enter it below to verify.
            </p>
            <input
              type="text"
              maxLength={6}
              value={phoneOtpCode}
              onChange={(e) => setPhoneOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full text-center text-xl tracking-widest h-11 border border-slate-300 rounded-[6px] outline-none focus:border-[#0073bb] font-mono"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPhoneOtpModal(false)}
                className="flex-1 h-9 rounded-[5px] border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoneOtp}
                disabled={isVerifyingPhoneOtp || phoneOtpCode.length !== 6}
                className="flex-1 h-9 rounded-[5px] bg-[#0073bb] hover:bg-[#005f9e] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                {isVerifyingPhoneOtp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Email OTP Verification Modal ── */}
      {showEmailOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">Verify Email Address</h4>
              <button
                type="button"
                onClick={() => setShowEmailOtpModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              We sent a 6-digit code to <strong className="text-slate-800">{formData.email}</strong>. Enter it below to verify.
            </p>
            <input
              type="text"
              maxLength={6}
              value={emailOtpCode}
              onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full text-center text-xl tracking-widest h-11 border border-slate-300 rounded-[6px] outline-none focus:border-[#0073bb] font-mono"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowEmailOtpModal(false)}
                className="flex-1 h-9 rounded-[5px] border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEmailOtp}
                disabled={isVerifyingEmailOtp || emailOtpCode.length !== 6}
                className="flex-1 h-9 rounded-[5px] bg-[#0073bb] hover:bg-[#005f9e] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                {isVerifyingEmailOtp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DedicatedFormPage>
  );
};

export default EditUserFormPage;
