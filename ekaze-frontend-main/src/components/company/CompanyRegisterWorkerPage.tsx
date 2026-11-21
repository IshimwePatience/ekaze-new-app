import React, { useState, useEffect } from "react";
import {
  DedicatedFormPage,
  FormSection,
  FormField,
  FormInput,
  FormSelect,
} from "../common/DedicatedFormPage";
import { useToast } from "@/hooks/use-toast";
import type { NewWorkerRegistrationPayload } from "@/types/company.types";
import { Plus, Trash2, Check, Briefcase, GraduationCap, Award, User, ShieldCheck } from "lucide-react";
import { companyApi } from "@/api/companyService";

interface WorkExperienceItem {
  id: string;
  employer: string;
  role: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
}

interface CompanyRegisterWorkerPageProps {
  onBack: () => void;
  onSubmit?: (data: NewWorkerRegistrationPayload) => void;
  isLoading?: boolean;
  companyId?: number;
  initialWorker?: any;
  readOnly?: boolean;
}

// ── Comprehensive International Country Codes ──────────────────────────────
const COUNTRY_DIAL_CODES = [
  { code: "+250", country: "Rwanda", flag: "🇷🇼" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+256", country: "Uganda", flag: "🇺🇬" },
  { code: "+255", country: "Tanzania", flag: "🇹🇿" },
  { code: "+257", country: "Burundi", flag: "🇧🇮" },
  { code: "+243", country: "DR Congo", flag: "🇨🇩" },
  { code: "+211", country: "South Sudan", flag: "🇸🇸" },
  { code: "+251", country: "Ethiopia", flag: "🇪🇹" },
  { code: "+252", country: "Somalia", flag: "🇸🇴" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
  { code: "+260", country: "Zambia", flag: "🇿🇲" },
  { code: "+263", country: "Zimbabwe", flag: "🇿🇼" },
  { code: "+265", country: "Malawi", flag: "🇲🇼" },
  { code: "+258", country: "Mozambique", flag: "🇲🇿" },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+32", country: "Belgium", flag: "🇧🇪" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
];

const EDUCATION_LEVEL_OPTIONS = [
  { value: "none", label: "No formal education" },
  { value: "primary", label: "Primary School" },
  { value: "secondary", label: "Secondary / O-Level" },
  { value: "advanced", label: "Advanced / A-Level" },
  { value: "tvet", label: "TVET / Technical Vocational" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "masters", label: "Master's Degree" },
  { value: "phd", label: "PhD / Doctorate" },
];

const PERMIT_CATEGORIES = [
  { value: "A", label: "Category A - Motorcycle" },
  { value: "B", label: "Category B - Light Vehicle / Car" },
  { value: "C", label: "Category C - Commercial Truck / Heavy Vehicle" },
  { value: "D", label: "Category D - Bus / Passenger Transport" },
  { value: "E", label: "Category E - Trailer / Articulated Vehicle" },
  { value: "F", label: "Category F - Special / Agricultural Machine" },
];

export const CompanyRegisterWorkerPage: React.FC<CompanyRegisterWorkerPageProps> = ({
  onBack,
  onSubmit = () => {},
  isLoading = false,
  companyId,
  initialWorker,
  readOnly = false,
}) => {
  const { toast } = useToast();
  const isEditMode = Boolean(initialWorker);
  const userObj = initialWorker?.user || initialWorker || {};
  const ext = initialWorker?.extended_profile || initialWorker?.extendedProfile || {};

  // Active step: 1 (Personal & Identity), 2 (Education & Permit), 3 (Work Experience)
  const [currentStep, setCurrentStep] = useState(1);

  // 1. Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const rawPhoto = userObj.profile_photo || userObj.photo || userObj.avatar || initialWorker?.profile_photo || initialWorker?.photo || initialWorker?.business_card_path || null;
  const resolvePhotoUrl = (p: string | null) => {
    if (!p) return null;
    if (p.startsWith("http://") || p.startsWith("https://") || p.startsWith("data:")) return p;
    return `${window.location.origin}${p.startsWith("/") ? "" : "/"}${p}`;
  };
  const [photoPreview, setPhotoPreview] = useState<string | null>(resolvePhotoUrl(rawPhoto));

  // 2. ID or Passport (Typing only, no NIDA verification)
  const [documentType, setDocumentType] = useState<"nida" | "passport">(
    userObj.registration_document_type === "passport" || userObj.passport_number ? "passport" : "nida"
  );
  const [idNumber, setIdNumber] = useState(userObj.national_id || userObj.passport_number || initialWorker?.national_id || "");

  // 3. Personal Details
  const [firstName, setFirstName] = useState(userObj.first_name || (userObj.name ? userObj.name.split(" ")[0] : ""));
  const [lastName, setLastName] = useState(userObj.last_name || (userObj.name ? userObj.name.split(" ").slice(1).join(" ") : ""));

  // Extract country dial code and raw phone
  let detectedCode = "+250";
  let detectedPhone = "";
  if (userObj.phone) {
    const rawP = String(userObj.phone).trim();
    const matchedDial = COUNTRY_DIAL_CODES.find((c) => rawP.startsWith(c.code));
    if (matchedDial) {
      detectedCode = matchedDial.code;
      detectedPhone = rawP.slice(matchedDial.code.length);
    } else if (rawP.startsWith("+")) {
      const match = rawP.match(/^(\+\d{1,4})(.*)$/);
      if (match) {
        detectedCode = match[1];
        detectedPhone = match[2];
      }
    } else {
      detectedPhone = rawP;
    }
  }

  const [countryCode, setCountryCode] = useState(detectedCode);
  const [phoneRaw, setPhoneRaw] = useState(detectedPhone);
  const [email, setEmail] = useState(userObj.email || initialWorker?.email || ""); // Optional
  const [gender, setGender] = useState<"male" | "female">(
    ((userObj.gender || initialWorker?.gender)?.toLowerCase() === "female" ? "female" : "male")
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    userObj.date_of_birth ? String(userObj.date_of_birth).split("T")[0] : (initialWorker?.date_of_birth ? String(initialWorker.date_of_birth).split("T")[0] : "")
  );

  // 4. Education Background
  const [educationLevel, setEducationLevel] = useState(
    ext.education_level || initialWorker?.education_level || "secondary"
  );
  const [educationField, setEducationField] = useState(
    ext.education_option || ext.education_field || initialWorker?.education_option || initialWorker?.education_field || ""
  );

  // 5. Category Permit (Driving License)
  const [permitCategory, setPermitCategory] = useState(
    ext.driving_licence_type || initialWorker?.driving_licence_type || "C"
  );
  const [permitNumber, setPermitNumber] = useState(
    ext.driving_licence_number || initialWorker?.driving_licence_number || ""
  );
  const [permitExpiryDate, setPermitExpiryDate] = useState(
    ext.driving_licence_expiry || initialWorker?.driving_licence_expiry || ""
  );

  // 6. Working Experience Part (Dynamic past employers)
  let rawInitialExps: any[] = [];
  const rawCandidate =
    ext.past_experiences ||
    ext.work_experiences ||
    ext.previous_employers ||
    initialWorker?.past_experiences ||
    initialWorker?.work_experiences ||
    initialWorker?.previous_employers ||
    [];

  if (typeof rawCandidate === "string") {
    try {
      rawInitialExps = JSON.parse(rawCandidate);
    } catch {}
  } else if (Array.isArray(rawCandidate)) {
    rawInitialExps = rawCandidate;
  }

  const initialExperiences: WorkExperienceItem[] = rawInitialExps.length > 0
    ? rawInitialExps.map((item: any, idx: number) => ({
        id: item.id || `exp-${idx + 1}`,
        employer: item.employer || item.company_name || item.company || item.name || "",
        role: item.role || item.job_role || item.job_title || item.position || item.title || "",
        start_date: item.start_date ? String(item.start_date).split("T")[0] : (item.startDate ? String(item.startDate).split("T")[0] : ""),
        end_date: item.end_date ? String(item.end_date).split("T")[0] : (item.endDate ? String(item.endDate).split("T")[0] : ""),
        currently_working: Boolean(item.currently_working ?? item.is_current ?? item.current ?? (!item.end_date && !item.endDate && (item.start_date || item.startDate))),
      }))
    : [
        {
          id: "exp-1",
          employer: "",
          role: "",
          start_date: "",
          end_date: "",
          currently_working: false,
        },
      ];

  const [experiences, setExperiences] = useState<WorkExperienceItem[]>(initialExperiences);

  // Robust retriever: updates all fields whenever initialWorker is provided or loaded
  useEffect(() => {
    if (!initialWorker) return;

    const populate = (workerData: any) => {
      const u = workerData?.user || workerData || {};
      let e: any =
        workerData?.extended_profile ||
        workerData?.extendedProfile ||
        u?.extended_profile ||
        {};
      if (typeof e === "string") {
        try {
          e = JSON.parse(e);
        } catch {
          e = {};
        }
      }

      // Names
      if (u.first_name) setFirstName(u.first_name);
      else if (u.name) setFirstName(u.name.split(" ")[0]);
      if (u.last_name) setLastName(u.last_name);
      else if (u.name) setLastName(u.name.split(" ").slice(1).join(" "));

      // Document
      const docType = u.registration_document_type === "passport" || u.passport_number ? "passport" : "nida";
      setDocumentType(docType);
      const docNum = u.national_id || u.passport_number || workerData.national_id || "";
      if (docNum) setIdNumber(docNum);

      // Phone
      const phoneStr = String(u.phone || workerData.phone || "").trim();
      if (phoneStr) {
        const matched = COUNTRY_DIAL_CODES.find((c) => phoneStr.startsWith(c.code));
        if (matched) {
          setCountryCode(matched.code);
          setPhoneRaw(phoneStr.slice(matched.code.length));
        } else if (phoneStr.startsWith("+")) {
          const match = phoneStr.match(/^(\+\d{1,4})(.*)$/);
          if (match) {
            setCountryCode(match[1]);
            setPhoneRaw(match[2]);
          }
        } else {
          setPhoneRaw(phoneStr);
        }
      }

      // Email, Gender, DOB
      if (u.email || workerData.email) setEmail(u.email || workerData.email);
      if (u.gender || workerData.gender) {
        setGender((u.gender || workerData.gender).toLowerCase() === "female" ? "female" : "male");
      }
      if (u.date_of_birth || workerData.date_of_birth) {
        setDateOfBirth(String(u.date_of_birth || workerData.date_of_birth).split("T")[0]);
      }

      // Photo
      const photoPath = u.profile_photo || u.photo || workerData.profile_photo || workerData.photo || workerData.business_card_path;
      if (photoPath) {
        setPhotoPreview(resolvePhotoUrl(photoPath));
      }

      // Education & Permit (Step 2)
      const eduLevel = e.education_level || workerData.education_level;
      if (eduLevel) setEducationLevel(eduLevel);

      const eduField = e.education_option || e.education_field || workerData.education_option || workerData.education_field;
      if (eduField) setEducationField(eduField);

      const licType = e.driving_licence_type || workerData.driving_licence_type;
      if (licType) setPermitCategory(licType);

      const licNum = e.driving_licence_number || workerData.driving_licence_number;
      if (licNum) setPermitNumber(licNum);

      const licExp = e.driving_licence_expiry || workerData.driving_licence_expiry;
      if (licExp) setPermitExpiryDate(String(licExp).split("T")[0]);

      // Past Experiences (Step 3)
      let rawExps =
        e.past_experiences ||
        e.work_experiences ||
        e.previous_employers ||
        workerData.past_experiences ||
        workerData.work_experiences ||
        workerData.previous_employers ||
        u?.past_experiences ||
        [];

      if (typeof rawExps === "string") {
        try {
          rawExps = JSON.parse(rawExps);
        } catch {
          rawExps = [];
        }
      }

      if (Array.isArray(rawExps) && rawExps.length > 0) {
        const normalized: WorkExperienceItem[] = rawExps.map((item: any, idx: number) => ({
          id: item.id || `exp-${idx + 1}`,
          employer: item.employer || item.company_name || item.company || item.name || "",
          role: item.role || item.job_role || item.job_title || item.position || item.title || "",
          start_date: item.start_date ? String(item.start_date).split("T")[0] : (item.startDate ? String(item.startDate).split("T")[0] : ""),
          end_date: item.end_date ? String(item.end_date).split("T")[0] : (item.endDate ? String(item.endDate).split("T")[0] : ""),
          currently_working: Boolean(item.currently_working ?? item.is_current ?? item.current ?? (!item.end_date && !item.endDate && (item.start_date || item.startDate))),
        }));
        setExperiences(normalized);
      }
    };

    populate(initialWorker);

    // Also query backend for full worker profile in case list had partial data
    if (initialWorker?.id) {
      companyApi
        .getWorkerDetails(initialWorker.id)
        .then((res: any) => {
          const fresh = res?.data?.worker || res?.data || res;
          if (fresh) populate(fresh);
        })
        .catch(() => {});
    }
  }, [initialWorker]);

  const handleAddExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        employer: "",
        role: "",
        start_date: "",
        end_date: "",
        currently_working: false,
      },
    ]);
  };

  const handleRemoveExperience = (id: string) => {
    if (experiences.length === 1) {
      toast({
        title: "At least one experience required",
        description: "Please provide at least one past or current employer.",
        variant: "destructive",
      });
      return;
    }
    setExperiences((prev) => prev.filter((item) => item.id !== id));
  };

  const handleExperienceChange = (id: string, field: keyof WorkExperienceItem, value: any) => {
    setExperiences((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handlePhotoUpload = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Validation per Step ──────────────────────────────────────────────────
  const validateStep1 = () => {
    if (!photoPreview && !photoFile) {
      toast({
        title: "Profile Picture Required",
        description: "Please upload the driver's profile picture.",
        variant: "destructive",
      });
      return false;
    }
    if (!idNumber.trim()) {
      toast({
        title: "ID / Passport Required",
        description: `Please enter the driver's ${documentType === "nida" ? "National ID number" : "Passport number"}.`,
        variant: "destructive",
      });
      return false;
    }
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Names Required",
        description: "Please enter both first name and last name.",
        variant: "destructive",
      });
      return false;
    }
    if (!phoneRaw.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a valid contact phone number.",
        variant: "destructive",
      });
      return false;
    }
    if (!dateOfBirth) {
      toast({
        title: "Date of Birth Required",
        description: "Please enter the driver's date of birth.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!educationLevel) {
      toast({
        title: "Education Level Required",
        description: "Please select the driver's level of education.",
        variant: "destructive",
      });
      return false;
    }
    if (!educationField.trim()) {
      toast({
        title: "Education Field Required",
        description: "Please enter the field of study (e.g. Mathematics, Software, Mechanical, Automotive).",
        variant: "destructive",
      });
      return false;
    }
    if (!permitCategory) {
      toast({
        title: "Permit Category Required",
        description: "Please select the driver's permit category (e.g. Category C, B, D).",
        variant: "destructive",
      });
      return false;
    }
    if (!permitNumber.trim()) {
      toast({
        title: "Permit Number Required",
        description: "Please enter the driver's permit / license number.",
        variant: "destructive",
      });
      return false;
    }
    if (!permitExpiryDate) {
      toast({
        title: "Permit Expiration Date Required",
        description: "Please provide the expiration date of the driving permit.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];
      if (!exp.employer.trim()) {
        toast({
          title: "Employer Name Required",
          description: `Please enter employer name for experience #${i + 1}.`,
          variant: "destructive",
        });
        return false;
      }
      if (!exp.role.trim()) {
        toast({
          title: "Job Role Required",
          description: `Please enter the job role/title for experience #${i + 1}.`,
          variant: "destructive",
        });
        return false;
      }
      if (!exp.start_date) {
        toast({
          title: "Start Date Required",
          description: `Please provide start date for experience #${i + 1}.`,
          variant: "destructive",
        });
        return false;
      }
      if (!exp.currently_working && !exp.end_date) {
        toast({
          title: "End Date Required",
          description: `Please provide end date or mark currently working for experience #${i + 1}.`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!validateStep3()) return;
      handleSubmitFinal();
    }
  };

  const handleSubmitFinal = () => {
    const fullPhoneNumber = `${countryCode}${phoneRaw.replace(/^0+/, "")}`;

    const payload: NewWorkerRegistrationPayload = {
      national_id: idNumber.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: fullPhoneNumber,
      email: email.trim() ? email.trim() : undefined,
      gender: gender,
      date_of_birth: dateOfBirth,
      photo: photoFile,
      registration_mode: "full",
      experience_level: "expert",
      languages_spoken: ["Kinyarwanda", "English"],
      work_type_preferences: ["full_time"],
      professions: ["Driver"],
      preferred_districts: ["Kigali"],
      district: "Kigali",
      sector: "Gasabo",
      has_driving_licence: true,
      has_insurance: true,
    };

    // Attach all extended profile details
    (payload as any).passport_number = documentType === "passport" ? idNumber.trim() : undefined;
    (payload as any).registration_document_type = documentType;
    (payload as any).education_level = educationLevel;
    (payload as any).education_option = educationField.trim();
    (payload as any).education_field = educationField.trim();
    (payload as any).driving_licence_type = permitCategory;
    (payload as any).driving_licence_number = permitNumber.trim();
    (payload as any).driving_licence_expiry = permitExpiryDate;
    (payload as any).past_experiences = experiences;
    (payload as any).work_experiences = experiences;

    if (companyId) {
      (payload as any).company_id = companyId;
    }

    onSubmit(payload);
  };

  const STEPS = [
    {
      id: "1",
      stepNumber: "Step 01",
      title: "Identity & Personal Details",
      description: "Photo, ID/Passport, names & phone",
      completed: Boolean(photoPreview && idNumber && firstName && lastName && phoneRaw && dateOfBirth),
    },
    {
      id: "2",
      stepNumber: "Step 02",
      title: "Education & Permit Category",
      description: "Level, field & driving permit",
      completed: Boolean(educationLevel && educationField && permitCategory && permitNumber && permitExpiryDate),
    },
    {
      id: "3",
      stepNumber: "Step 03",
      title: "Working Experience",
      description: "Past employers, start & end dates",
      completed: experiences.every((e) => e.employer && e.role && e.start_date && (e.end_date || e.currently_working)),
    },
  ];

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <DedicatedFormPage
      onBack={onBack}
      backLabel={readOnly ? "Back to profile" : "Back to drivers"}
      title={readOnly ? (fullName ? `Driver Profile: ${fullName}` : "Driver Profile") : (isEditMode ? "Edit Driver Details" : "Driver Registration")}
      subtitle={
        readOnly
          ? "Driver profile and professional credentials verified by company."
          : isEditMode
          ? "Update driver profile and professional credentials."
          : "Register verified commercial fleet driver into company roster."
      }
      steps={STEPS}
      currentStep={currentStep - 1}
      onStepClick={(stepIndex) => {
        if (readOnly) {
          setCurrentStep(stepIndex + 1);
          return;
        }
        if (stepIndex === 1 && !validateStep1()) return;
        if (stepIndex === 2 && (!validateStep1() || !validateStep2())) return;
        setCurrentStep(stepIndex + 1);
      }}
      summaryTitle="Driver Summary"
      summaryItems={[
        { label: "Document", value: `${documentType === "nida" ? "National ID" : "Passport"}: ${idNumber || "Not entered"}` },
        { label: "Phone", value: phoneRaw ? `${countryCode} ${phoneRaw}` : "Not entered" },
        { label: "Permit Category", value: permitCategory ? `Category ${permitCategory}` : "Not selected" },
        { label: "Education", value: educationLevel ? `${educationLevel} (${educationField || "Field"})` : "Not specified" },
        { label: "Work History", value: `${experiences.length} employer(s)` },
      ]}
      profileAvatar={{
        src: photoPreview,
        name: fullName || "Driver Account",
        role: `Driver - Category ${permitCategory}`,
        onPhotoChange: readOnly ? undefined : handlePhotoUpload,
      }}
      primaryActionLabel={
        readOnly
          ? currentStep < 3
            ? "Next"
            : undefined
          : currentStep === 3
          ? isLoading
            ? isEditMode
              ? "Saving changes..."
              : "Registering driver..."
            : isEditMode
            ? "Save changes"
            : "Register Driver"
          : "Continue"
      }
      onPrimaryAction={
        readOnly
          ? currentStep < 3
            ? () => setCurrentStep(currentStep + 1)
            : undefined
          : handleNextStep
      }
      isLoading={isLoading}
      secondaryActionLabel={currentStep > 1 ? "Back" : undefined}
      onSecondaryAction={currentStep > 1 ? () => setCurrentStep(currentStep - 1) : undefined}
    >
      {/* ── STEP 1: IDENTITY & PERSONAL DETAILS ── */}
      {currentStep === 1 && (
        <div className="space-y-6 text-left animate-in fade-in duration-200">
          <FormSection id="section-identity" title="1. Identity & Document Verification">
            {/* Document Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Document Type <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-6 py-1">
                <button
                  type="button"
                  onClick={() => setDocumentType("nida")}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  {documentType === "nida" ? (
                    <div className="w-5 h-5 rounded bg-[#2478b8] text-white flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded border-2 border-slate-400 bg-transparent shrink-0" />
                  )}
                  <span className="font-bold text-sm text-slate-900">National ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDocumentType("passport")}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  {documentType === "passport" ? (
                    <div className="w-5 h-5 rounded bg-[#2478b8] text-white flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded border-2 border-slate-400 bg-transparent shrink-0" />
                  )}
                  <span className="font-bold text-sm text-slate-900">Passport</span>
                </button>
              </div>
            </div>

            {/* Direct Typing Input for ID or Passport (No NIDA checks) */}
            <div className="pt-2">
              <FormField
                label={`${documentType === "nida" ? "National ID Number" : "Passport Number"} *`}
                required
              >
                <FormInput
                  type="text"
                  placeholder={
                    documentType === "nida"
                      ? "Type National ID number (e.g. 1199...)"
                      : "Type Passport number (e.g. PC1234567)"
                  }
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection id="section-personal" title="2. Personal Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="First Name" required>
                <FormInput
                  type="text"
                  placeholder="Driver's first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Last Name" required>
                <FormInput
                  type="text"
                  placeholder="Driver's last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </FormField>
            </div>

            {/* Phone Number with International Country Codes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Contact Phone Number <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="flex gap-2">
                <div className="w-44 sm:w-52 shrink-0">
                  <FormSelect
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    {COUNTRY_DIAL_CODES.map((item) => (
                      <option key={`${item.code}-${item.country}`} value={item.code}>
                        {item.flag} {item.code} ({item.country})
                      </option>
                    ))}
                  </FormSelect>
                </div>
                <div className="flex-1">
                  <FormInput
                    type="tel"
                    placeholder="Enter phone number without leading 0"
                    value={phoneRaw}
                    onChange={(e) => setPhoneRaw(e.target.value.replace(/[^\d]/g, ""))}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Email Address (Optional)">
                <FormInput
                  type="email"
                  placeholder="driver@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>

              <FormField label="Gender" required>
                <FormSelect
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "male" | "female")}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </FormSelect>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Date of Birth" required>
                <FormInput
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </FormField>
            </div>
          </FormSection>
        </div>
      )}

      {/* ── STEP 2: EDUCATION & CATEGORY PERMIT ── */}
      {currentStep === 2 && (
        <div className="space-y-6 text-left animate-in fade-in duration-200">
          <FormSection id="section-education" title="3. Education Background">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Level of Education" required>
                <FormSelect
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                >
                  {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </option>
                  ))}
                </FormSelect>
              </FormField>

              <FormField label="Field of Study (e.g. Mathematics, Software, Mechanical, Automotive)" required>
                <FormInput
                  type="text"
                  placeholder="e.g. Mathematics, Software Engineering, Automotive"
                  value={educationField}
                  onChange={(e) => setEducationField(e.target.value)}
                  required
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection id="section-permit" title="4. Driving Permit & Category">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Permit Category" required>
                <FormSelect
                  value={permitCategory}
                  onChange={(e) => setPermitCategory(e.target.value)}
                >
                  {PERMIT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </FormSelect>
              </FormField>

              <FormField label="Driving Permit Number" required>
                <FormInput
                  type="text"
                  placeholder="e.g. DL-2024-9842"
                  value={permitNumber}
                  onChange={(e) => setPermitNumber(e.target.value.toUpperCase())}
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Permit Expiration Date" required>
                <FormInput
                  type="date"
                  value={permitExpiryDate}
                  onChange={(e) => setPermitExpiryDate(e.target.value)}
                  required
                />
              </FormField>
            </div>
          </FormSection>
        </div>
      )}

      {/* ── STEP 3: WORKING EXPERIENCE ── */}
      {currentStep === 3 && (
        <div className="space-y-6 text-left animate-in fade-in duration-200">
          <FormSection
            id="section-experience"
            title="5. Working Experience (Add where driver worked)"
          >
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <div
                  key={exp.id}
                  className={`space-y-4 relative ${index > 0 ? "pt-4 border-t border-slate-200" : ""}`}
                >
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Experience #{index + 1}
                    </span>
                    {!readOnly && experiences.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Employer / Company Name" required>
                      <FormInput
                        type="text"
                        placeholder="Company or employer name"
                        value={exp.employer}
                        disabled={readOnly}
                        onChange={(e) => handleExperienceChange(exp.id, "employer", e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Job Role / Responsibilities" required>
                      <FormInput
                        type="text"
                        placeholder="e.g. Heavy Truck Driver, Fleet Driver, Chauffeur"
                        value={exp.role}
                        disabled={readOnly}
                        onChange={(e) => handleExperienceChange(exp.id, "role", e.target.value)}
                        required
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Start Date" required>
                      <FormInput
                        type="date"
                        value={exp.start_date}
                        disabled={readOnly}
                        onChange={(e) => handleExperienceChange(exp.id, "start_date", e.target.value)}
                        required
                      />
                    </FormField>

                    <div>
                      <FormField label={exp.currently_working ? "End Date (Currently Working)" : "End Date"} required={!exp.currently_working}>
                        <FormInput
                          type="date"
                          value={exp.end_date}
                          disabled={readOnly || exp.currently_working}
                          onChange={(e) => handleExperienceChange(exp.id, "end_date", e.target.value)}
                          required={!exp.currently_working}
                        />
                      </FormField>
                      <label className={`flex items-center gap-2 mt-2 text-xs text-slate-700 ${readOnly ? "cursor-default" : "cursor-pointer"}`}>
                        <input
                          type="checkbox"
                          checked={exp.currently_working}
                          disabled={readOnly}
                          onChange={(e) => {
                            if (readOnly) return;
                            const checked = e.target.checked;
                            handleExperienceChange(exp.id, "currently_working", checked);
                            if (checked) {
                              handleExperienceChange(exp.id, "end_date", "");
                            }
                          }}
                          className="rounded border-slate-300 text-[#2478b8] focus:ring-[#2478b8]"
                        />
                        <span>Currently working here</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              {!readOnly && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-transparent border-0 p-0 font-normal outline-none"
                  >
                    add another work expirience
                  </button>
                </div>
              )}
            </div>
          </FormSection>
        </div>
      )}
    </DedicatedFormPage>
  );
};

export default CompanyRegisterWorkerPage;
