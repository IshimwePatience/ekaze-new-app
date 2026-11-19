import React, { useState, useEffect, useRef } from "react";
import {
  DedicatedFormPage,
  FormSection,
  FormField,
  FormInput,
  FormSelect,
} from "../common/DedicatedFormPage";
import { useNidaCheck, useNidaVerify } from "@/hooks/useNida";
import { useToast } from "@/hooks/use-toast";
import type { NewWorkerRegistrationPayload } from "@/types/company.types";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";

interface CompanyRegisterWorkerPageProps {
  onBack: () => void;
  onSubmit: (data: NewWorkerRegistrationPayload) => void;
  isLoading?: boolean;
  companyId?: number;
  initialWorker?: any;
}

export const CompanyRegisterWorkerPage: React.FC<CompanyRegisterWorkerPageProps> = ({
  onBack,
  onSubmit,
  isLoading = false,
  companyId,
  initialWorker,
}) => {
  const { toast } = useToast();

  const isEditMode = Boolean(initialWorker);
  const userObj = initialWorker?.user || initialWorker || {};

  // Active step: 1 (Identity & Verification), 2 (Personal & Account Details)
  const [currentStep, setCurrentStep] = useState(isEditMode ? 2 : 1);

  // Document type: 'nida' | 'passport'
  const [documentType, setDocumentType] = useState<"nida" | "passport">(
    userObj.registration_document_type === "passport" || userObj.passport_number ? "passport" : "nida"
  );
  const [passportNumber, setPassportNumber] = useState(userObj.passport_number || "");

  // ── Form State ─────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    national_id: userObj.national_id || "",
    first_name: userObj.first_name || (userObj.name ? userObj.name.split(" ")[0] : ""),
    last_name: userObj.last_name || (userObj.name ? userObj.name.split(" ").slice(1).join(" ") : ""),
    phone: userObj.phone || "",
    email: userObj.email || "",
    password: "",
    password_confirmation: "",
    gender: (userObj.gender?.toLowerCase() === "male" ? "male" : "female") as "male" | "female",
    date_of_birth: userObj.date_of_birth ? String(userObj.date_of_birth).split("T")[0] : "",
    province: userObj.province || "",
    district: userObj.district || "",
    sector: userObj.sector || "",
    cell: userObj.cell || "",
    village: userObj.village || "",
    address: userObj.address || "",
    experience_level: initialWorker?.experience_level || "intermediate",
    min_salary: initialWorker?.min_salary ? String(initialWorker.min_salary) : "60000",
    max_salary: initialWorker?.max_salary ? String(initialWorker.max_salary) : "120000",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(userObj.profile_photo || null);

  // ── NIDA Verification State ─────────────────────────────────────────────
  const [nidCheckPassed, setNidCheckPassed] = useState(false);
  const [nidaVerified, setNidaVerified] = useState(Boolean(isEditMode && userObj.national_id));
  const [nidaVerifyField, setNidaVerifyField] = useState<"fullname" | "date_of_birth">("fullname");
  const [nidaVerifyValue, setNidaVerifyValue] = useState("");
  const [nidaVerifyDob, setNidaVerifyDob] = useState("");
  const [nidaError, setNidaError] = useState("");
  const prevNidRef = useRef(userObj.national_id || "");

  const { mutateAsync: nidaCheck, isPending: nidaCheckLoading } = useNidaCheck();
  const { mutateAsync: nidaVerify, isPending: nidaVerifyLoading } = useNidaVerify();

  // Auto NIDA trigger when 16 digits entered
  useEffect(() => {
    if (documentType !== "nida" || isEditMode) return;
    const cleanNid = formData.national_id.trim();

    if (cleanNid.length === 16 && cleanNid !== prevNidRef.current && !nidaVerified) {
      prevNidRef.current = cleanNid;
      setNidaError("");

      nidaCheck(cleanNid)
        .then((res: any) => {
          // nidaApi.check returns r.data directly (no extra .data wrapper)
          const passed = res?.passed ?? res?.data?.passed;
          if (passed) {
            setNidCheckPassed(true);
            const verificationField = res?.verification_field ?? res?.data?.verification_field;
            const reqField = verificationField === "dob" ? "date_of_birth" : "fullname";
            setNidaVerifyField(reqField);
          } else {
            setNidCheckPassed(false);
            setNidaError(res?.message ?? res?.data?.message ?? "National ID not recognized by NIDA database.");
          }
        })
        .catch((err: any) => {
          setNidCheckPassed(false);
          setNidaError(err?.response?.data?.message || err?.message || "Failed to query NIDA service.");
        });
    } else if (cleanNid.length < 16) {
      prevNidRef.current = "";
      setNidCheckPassed(false);
      setNidaVerified(false);
      setNidaError("");
    }
  }, [formData.national_id, documentType, isEditMode, nidaCheck, nidaVerified]);

  const handleNidaVerify = async () => {
    setNidaError("");
    try {
      if (nidaVerifyField === "fullname" && !nidaVerifyValue.trim()) {
        setNidaError("Please enter the driver's full name.");
        return;
      }
      if (nidaVerifyField === "date_of_birth" && !nidaVerifyDob) {
        setNidaError("Please select the driver's date of birth.");
        return;
      }

      // Build payload matching nidaApi.verify: { nid, fullname?, date_of_birth? }
      const verifyPayload: { nid: string; fullname?: string; date_of_birth?: string } = {
        nid: formData.national_id,
      };
      if (nidaVerifyField === "fullname") {
        verifyPayload.fullname = nidaVerifyValue.trim();
      } else {
        verifyPayload.date_of_birth = nidaVerifyDob;
      }

      const res = await nidaVerify(verifyPayload);

      // nidaApi.verify returns r.data directly (no extra .data wrapper)
      const verified = res?.verified ?? res?.data?.verified;
      const citizenData = res?.citizen_data ?? res?.data?.citizen_data ?? {};

      if (verified) {
        setNidaVerified(true);
        const parsedDob = citizenData.date_of_birth
          ? String(citizenData.date_of_birth).split("T")[0]
          : "";

        setFormData((prev) => ({
          ...prev,
          first_name: citizenData.first_name || prev.first_name,
          last_name: citizenData.last_name || prev.last_name,
          date_of_birth: parsedDob || prev.date_of_birth,
          gender:
            citizenData.gender?.toLowerCase() === "male"
              ? "male"
              : citizenData.gender?.toLowerCase() === "female"
              ? "female"
              : prev.gender,
          photo: citizenData.photo_url || prev.photo,
        }));

        if (citizenData.photo_url) {
          setPhotoPreview(citizenData.photo_url);
        }

        toast({
          title: "Identity Verified",
          description: `Identity confirmed for ${citizenData.first_name || "driver"} ${citizenData.last_name || ""}.`,
        });

        // Automatically move to Step 2
        setCurrentStep(2);
      } else {
        setNidaError(res?.message ?? res?.data?.message ?? "Verification mismatch. Please check spelling.");
      }
    } catch (err: any) {
      setNidaError(err?.response?.data?.message || err?.message || "Failed to confirm identity.");
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Step Navigation & Validation ───────────────────────────────────────
  const canProceedIdentity = isEditMode || (documentType === "nida" ? nidaVerified : Boolean(passportNumber.trim()));

  const validateStep1 = () => {
    if (!canProceedIdentity) {
      toast({
        title: "Identity Verification Required",
        description:
          documentType === "nida"
            ? "Please enter your 16-digit Rwandan NIDA number and verify identity."
            : "Please enter a valid passport number.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.first_name?.trim() || !formData.last_name?.trim()) {
      toast({
        title: "Name Required",
        description: "Driver first and last name are required.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.phone?.trim()) {
      toast({
        title: "Contact Phone Required",
        description: "Please enter driver contact phone number.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      handleSubmitFinal();
    }
  };

  const handleSubmitFinal = () => {
    const payload: NewWorkerRegistrationPayload = {
      national_id: formData.national_id || passportNumber,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      email: formData.email || undefined,
      password: formData.password || undefined,
      gender: formData.gender,
      date_of_birth: formData.date_of_birth,
      photo: photoFile,
      registration_mode: "quick",
      province: formData.province || undefined,
      district: formData.district || "Kigali",
      sector: formData.sector || "Remera",
      cell: formData.cell || undefined,
      village: formData.village || undefined,
      address: formData.address || undefined,
      experience_level: formData.experience_level as any,
      languages_spoken: ["Kinyarwanda"],
      work_type_preferences: ["full_time"],
      professions: ["Driver"],
      preferred_districts: formData.district ? [formData.district] : ["Gasabo"],
      has_driving_licence: true,
      min_salary: formData.min_salary,
      max_salary: formData.max_salary,
    };

    if (companyId) {
      (payload as any).company_id = companyId;
    }

    onSubmit(payload);
  };

  const STEPS = [
    {
      id: "1",
      stepNumber: "Step 01",
      title: "Identity & Verification",
      description: "Verify Rwandan NIDA or Passport",
      completed: canProceedIdentity,
    },
    {
      id: "2",
      stepNumber: "Step 02",
      title: "Personal & Account Details",
      description: "Names, contact phone & password",
      completed: Boolean(formData.phone?.trim() && formData.first_name?.trim()),
    },
  ];

  const fullName = `${formData.first_name} ${formData.last_name}`.trim();

  return (
    <DedicatedFormPage
      onBack={onBack}
      backLabel="Back to drivers"
      title={isEditMode ? "Edit Driver Details" : "Driver Registration"}
      subtitle={
        isEditMode
          ? "Update driver profile and account information."
          : "Register verified driver into company workforce roster."
      }
      steps={STEPS}
      currentStep={currentStep - 1}
      onStepClick={(stepIndex) => {
        if (!isEditMode && stepIndex > 0 && !canProceedIdentity) {
          toast({
            title: "Identity Verification Required",
            description: "Please verify identity on Step 1 first.",
            variant: "destructive",
          });
          return;
        }
        setCurrentStep(stepIndex + 1);
      }}
      summaryTitle="Driver profile"
      profileAvatar={{
        src: photoPreview,
        name: fullName || "New driver account",
        role: "Driver",
        onPhotoChange: handlePhotoUpload,
      }}
      primaryActionLabel={
        currentStep === 2
          ? isLoading
            ? isEditMode
              ? "Saving changes..."
              : "Registering driver..."
            : isEditMode
            ? "Save changes"
            : "Register driver"
          : "Continue"
      }
      onPrimaryAction={handleNextStep}
      isLoading={isLoading}
      secondaryActionLabel={currentStep > 1 && !isEditMode ? "Back" : undefined}
      onSecondaryAction={currentStep > 1 && !isEditMode ? () => setCurrentStep(1) : undefined}
    >
      {/* ── STEP 1: IDENTITY & VERIFICATION ── */}
      {currentStep === 1 && (
        <div className="space-y-6 text-left animate-in fade-in duration-200">
          <FormSection id="section-identity" title="1. Identity Verification">
            {/* Identity Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Document Type *
              </label>
              <div className="flex flex-wrap items-center gap-6 py-1">
                <button
                  type="button"
                  disabled={isEditMode}
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
                  <span className="font-bold text-sm text-slate-900">Rwandan Citizen (National ID)</span>
                </button>

                <button
                  type="button"
                  disabled={isEditMode}
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
                  <span className="font-bold text-sm text-slate-900">Foreign Worker (Passport)</span>
                </button>
              </div>
            </div>

            {/* NIDA Verification Box */}
            {documentType === "nida" && (
              <div className="space-y-4 pt-2">
                <FormField label="National ID Number *" required>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <FormInput
                        type="text"
                        maxLength={16}
                        placeholder="Enter 16-digit Rwandan NIDA number"
                        value={formData.national_id}
                        disabled={nidaVerified || isEditMode}
                        onChange={(e) => {
                          const cleanDigits = e.target.value.replace(/\D/g, "");
                          handleFieldChange("national_id", cleanDigits);
                          if (cleanDigits.length !== 16) {
                            setNidCheckPassed(false);
                            setNidaVerified(false);
                          }
                        }}
                        className={`${formData.national_id.length > 0 && formData.national_id.length < 16 ? "border-red-500" : ""} ${
                          nidaVerified ? "bg-slate-100 cursor-not-allowed border-emerald-400" : ""
                        }`}
                      />
                    </div>
                    {nidaVerified && (
                      <div className="px-3.5 py-3 rounded-xl gap-1.5 shrink-0 bg-[#2478b8] text-white font-bold text-xs shadow-xs flex items-center">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Verified</span>
                      </div>
                    )}
                    {nidaCheckLoading && (
                      <div className="mt-2 shrink-0">
                        <Loader2 className="h-5 w-5 animate-spin text-[#2478b8]" />
                      </div>
                    )}
                  </div>
                </FormField>

                {/* Inline NIDA confirmation box */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    nidCheckPassed && formData.national_id.length === 16 ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
                  }`}
                >
                  <div className="border-t border-slate-200/80 pt-4 space-y-4">
                    <div className="flex items-start gap-2.5 p-3.5 bg-[#f4f6f8] border border-slate-200 rounded-xl">
                      <p className="text-xs sm:text-sm font-semibold text-[#4f687a] leading-relaxed">
                        {nidaVerifyField === "fullname"
                          ? "Please enter the driver's full name as it appears on their National ID card to confirm ownership."
                          : "Please select the driver's date of birth as it appears on their National ID card."}
                      </p>
                    </div>

                    {nidaVerifyField === "fullname" ? (
                      <FormField label="Full Name *" required>
                        <FormInput
                          type="text"
                          placeholder="Worker full name as on ID"
                          value={nidaVerifyValue}
                          onChange={(e) => setNidaVerifyValue(e.target.value)}
                        />
                      </FormField>
                    ) : (
                      <FormField label="Date of Birth *" required>
                        <FormInput
                          type="date"
                          value={nidaVerifyDob}
                          onChange={(e) => setNidaVerifyDob(e.target.value)}
                        />
                      </FormField>
                    )}

                    {nidaError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                        <p className="text-xs font-semibold text-red-600">{nidaError}</p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleNidaVerify}
                        disabled={nidaVerifyLoading || (nidaVerifyField === "fullname" ? !nidaVerifyValue.trim() : !nidaVerifyDob)}
                        className="px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-[#2478b8] hover:bg-[#1b6296] text-white disabled:opacity-50 cursor-pointer"
                      >
                        {nidaVerifyLoading ? "Verifying with NIDA..." : "Verify Identity"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {documentType === "passport" && (
              <div className="space-y-4 pt-2">
                <FormField label="Passport Number *" required>
                  <FormInput
                    type="text"
                    maxLength={20}
                    placeholder="Enter passport number"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                  />
                </FormField>
              </div>
            )}
          </FormSection>
        </div>
      )}

      {/* ── STEP 2: PERSONAL & ACCOUNT DETAILS ── */}
      {currentStep === 2 && (
        <div className="space-y-6 text-left animate-in fade-in duration-200">
          <FormSection id="section-personal-account" title="2. Personal & Account Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="First name *" required>
                <FormInput
                  type="text"
                  placeholder="First name"
                  value={formData.first_name}
                  onChange={(e) => handleFieldChange("first_name", e.target.value)}
                />
              </FormField>
              <FormField label="Last name *" required>
                <FormInput
                  type="text"
                  placeholder="Last name"
                  value={formData.last_name}
                  onChange={(e) => handleFieldChange("last_name", e.target.value)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Gender *" required>
                <FormSelect
                  value={formData.gender}
                  onChange={(e) => handleFieldChange("gender", e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </FormSelect>
              </FormField>

              <FormField label="Date of birth *" required>
                <FormInput
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleFieldChange("date_of_birth", e.target.value)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Contact phone *" required>
                <FormInput
                  type="tel"
                  maxLength={10}
                  placeholder="078XXXXXXX"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                />
              </FormField>

              <FormField label="Email address (optional)">
                <FormInput
                  type="email"
                  placeholder="driver@example.com"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                />
              </FormField>
            </div>

            {!isEditMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Account password (optional)">
                  <FormInput
                    type="password"
                    placeholder="Leave blank for auto password"
                    value={formData.password}
                    onChange={(e) => handleFieldChange("password", e.target.value)}
                  />
                </FormField>
                <FormField label="Confirm password">
                  <FormInput
                    type="password"
                    placeholder="Confirm password"
                    value={formData.password_confirmation}
                    onChange={(e) => handleFieldChange("password_confirmation", e.target.value)}
                  />
                </FormField>
              </div>
            )}
          </FormSection>
        </div>
      )}
    </DedicatedFormPage>
  );
};

export default CompanyRegisterWorkerPage;
