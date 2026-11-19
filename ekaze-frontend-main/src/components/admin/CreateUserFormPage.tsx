import React, { useState } from "react";
import {
  DedicatedFormPage,
  FormField,
  FormInput,
  FormSelect,
} from "../common/DedicatedFormPage";
import { useCreateUser } from "@/hooks/useUsers";
import { useToast } from "@/hooks/use-toast";
import { useProvinces, useDistricts, useSectors, useCells, useVillages } from "@/hooks/useLocations";
import { nidaApi } from "@/api/nidaService";
import { Check } from "lucide-react";

interface CreateUserFormPageProps {
  onBack: () => void;
  defaultRole?: string;
}

export const CreateUserFormPage: React.FC<CreateUserFormPageProps> = ({
  onBack,
  defaultRole = "company",
}) => {
  const { toast } = useToast();
  const createUser = useCreateUser();

  const [role, setRole] = useState(defaultRole);
  const [currentStep, setCurrentStep] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [verifyUsing, setVerifyUsing] = useState("id");
  const [isVerifyingNida, setIsVerifyingNida] = useState(false);
  const [nidaVerified, setNidaVerified] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    national_id: "",
    tin_number: "",
    owner_name: "",
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    // Billing & Trial options for companies
    billing_plan: "free_trial", // 'free_trial' | 'subscription'
    trial_days: "14",
    subscription_amount: "50000",
    subscription_cycle: "monthly", // 'monthly' | 'annual' | 'custom'
    subscription_period_days: "30",
  });

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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setProfilePhoto(reader.result);
        toast({
          title: "Profile photo selected",
          description: "New picture ready.",
          variant: "success",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // NIDA Verification function (preserving exact functionality)
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
        title: "Verification service error",
        description: err?.response?.data?.message || "Failed to query NIDA service.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingNida(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: "Validation error",
        description: "Full name and phone number are required.",
        variant: "destructive",
      });
      return;
    }

    const isIdExempt = ["admin", "company"].includes((role || "").toLowerCase());

    try {
      await createUser.mutateAsync({
        role: role as any,
        ...formData,
        national_id: isIdExempt ? undefined : formData.national_id,
        cell: role === "company" ? undefined : formData.cell,
        village: role === "company" ? undefined : formData.village,
        profile_photo: profilePhoto || undefined,
        // Include billing configuration for company creation
        billing_plan: role === "company" ? formData.billing_plan : undefined,
        trial_days: role === "company" && formData.billing_plan === "free_trial" ? Number(formData.trial_days) || 14 : undefined,
        subscription_amount: role === "company" ? Number(formData.subscription_amount) || 0 : undefined,
        subscription_cycle: role === "company" ? formData.subscription_cycle : undefined,
        subscription_period_days: role === "company" && formData.subscription_cycle === "custom" ? Number(formData.subscription_period_days) || 30 : undefined,
      });

      toast({
        title: "User created successfully",
        description: `New ${role} account has been created.`,
        variant: "success",
      });
      onBack();
    } catch (err: any) {
      toast({
        title: "Creation failed",
        description: err?.response?.data?.message || "Failed to create user account.",
        variant: "destructive",
      });
    }
  };

  const isIdExempt = ["admin", "company"].includes((role || "").toLowerCase());

  const isStep0Done = Boolean(
    formData.name?.trim() &&
    formData.phone?.trim() &&
    (isIdExempt || (formData.national_id?.trim() && nidaVerified))
  );

  const isStep1Done = Boolean(
    formData.province?.trim() &&
    formData.district?.trim() &&
    formData.sector?.trim()
  );

  const STEPS = [
    {
      id: "info",
      stepNumber: "Step 01",
      title: role === "company" ? "Company Information" : "Account Information",
      description: role === "company" ? "Company & contact details" : "Personal & contact details",
      completed: isStep0Done,
    },
    {
      id: "location",
      stepNumber: "Step 02",
      title: role === "company" ? "Company Location" : "Address & Location",
      description: role === "company" ? "Business jurisdiction details" : "Residential jurisdiction details",
      completed: isStep1Done,
    },
  ];

  return (
    <DedicatedFormPage
      onBack={onBack}
      backLabel="Cancel"
      title={role === "company" ? "Create Company Account" : "Create Admin Account"}
      subtitle="All fields with a red asterisk * are mandatory to complete the profile"
      steps={STEPS}
      currentStep={currentStep}
      onStepClick={setCurrentStep}
      completionPercentage={
        formData.name && formData.phone ? 80 : 30
      }
      profileAvatar={{
        src: profilePhoto,
        name: formData.name || (role === "company" ? "New Company" : "New Admin"),
        role: role,
        onPhotoChange: handlePhotoChange,
      }}
      primaryActionLabel={
        currentStep === 0
          ? "Continue"
          : createUser.isPending
            ? "Saving..."
            : "Save"
      }
      onPrimaryAction={currentStep === 0 ? () => setCurrentStep(1) : handleSubmit}
      secondaryActionLabel={currentStep > 0 ? "Previous" : undefined}
      onSecondaryAction={currentStep > 0 ? () => setCurrentStep(0) : undefined}
      isLoading={createUser.isPending}
      isPrimaryDisabled={currentStep === 1 && (!formData.name || !formData.phone)}
    >
      {/* ── Step-by-Step Content ── */}
      <div className="max-w-2xl text-left">
        
        {/* Step 0: Profile details */}
        {currentStep === 0 && (
        <div className="space-y-4 text-left animate-in fade-in duration-200">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
            {role === "company" ? "Company details" : "Admin details"}
          </h3>

          <FormField label="Account type" required>
            <FormSelect
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="company">Company</option>
              <option value="admin">Admin</option>
            </FormSelect>
          </FormField>

          <FormField label={role === "company" ? "Company Name" : "Full Name"} required>
            <FormInput
              type="text"
              placeholder={role === "company" ? "Enter company name" : "Enter full name"}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </FormField>

          {role === "company" && (
            <FormField label="TIN Number (Optional)">
              <FormInput
                type="text"
                placeholder="Enter 9-digit TIN number"
                value={formData.tin_number}
                onChange={(e) => handleChange("tin_number", e.target.value)}
              />
            </FormField>
          )}

          {role === "company" && (
            <FormField label="Owner / Representative Name (Optional)">
              <FormInput
                type="text"
                placeholder="Enter owner or representative name"
                value={formData.owner_name}
                onChange={(e) => handleChange("owner_name", e.target.value)}
              />
            </FormField>
          )}

          <FormField label={role === "company" ? "Company Email" : "Email"}>
            <div className="relative">
              <FormInput
                type="email"
                placeholder={role === "company" ? "info@company.rw" : "admin@ihirwe.rw"}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={formData.email && formData.email.includes("@") ? "pr-10" : ""}
              />
              {formData.email && formData.email.includes("@") && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                </span>
              )}
            </div>
          </FormField>

          <FormField label={role === "company" ? "Company Phone Number" : "Phone Number"} required>
            <div className="flex rounded-[6px] overflow-hidden bg-[#E9ECF0] focus-within:ring-2 focus-within:ring-[#0073bb]/30">
              <div className="flex items-center gap-1.5 px-3 bg-[#E9ECF0] border-r border-slate-300/80 text-xs font-medium text-slate-700 shrink-0 select-none">
                <span className="text-sm">🇷🇼</span>
                <span>+250</span>
              </div>
              <input
                type="text"
                placeholder="783 202 922"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="flex-1 bg-transparent px-3.5 h-11 text-sm outline-none text-slate-800 placeholder-slate-400"
              />
            </div>
          </FormField>

          <FormField label="Account password (optional)">
            <FormInput
              type="password"
              placeholder="Leave blank for auto-generated password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
          </FormField>

          {role === "company" && (
            <div className="pt-4 mt-2 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Company Plan & Billing Configuration
              </h4>

              <FormField label="Billing Option" required>
                <FormSelect
                  value={formData.billing_plan}
                  onChange={(e) => handleChange("billing_plan", e.target.value)}
                >
                  <option value="free_trial">Free Trial (Access before payment)</option>
                  <option value="subscription">Direct Subscription (Payment required)</option>
                </FormSelect>
              </FormField>

              {formData.billing_plan === "free_trial" && (
                <FormField label="Free Trial Duration (Days)" required>
                  <FormInput
                    type="number"
                    min="1"
                    placeholder="e.g. 14 or 30 days"
                    value={formData.trial_days}
                    onChange={(e) => handleChange("trial_days", e.target.value)}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Company can log in and use the platform freely for this period. Once ended, they must pay to log in.
                  </p>
                </FormField>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormField label={formData.billing_plan === "free_trial" ? "Subscription Fee After Trial (RWF)" : "Subscription Fee (RWF)"} required>
                  <FormInput
                    type="number"
                    min="0"
                    placeholder="e.g. 50000"
                    value={formData.subscription_amount}
                    onChange={(e) => handleChange("subscription_amount", e.target.value)}
                  />
                </FormField>

                <FormField label="Subscription Cycle" required>
                  <FormSelect
                    value={formData.subscription_cycle}
                    onChange={(e) => handleChange("subscription_cycle", e.target.value)}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                    <option value="custom">Agreed Period (Custom Days)</option>
                  </FormSelect>
                </FormField>
              </div>

              {formData.subscription_cycle === "custom" && (
                <FormField label="Agreed Period Duration (Days)" required>
                  <FormInput
                    type="number"
                    min="1"
                    placeholder="e.g. 90 days"
                    value={formData.subscription_period_days}
                    onChange={(e) => handleChange("subscription_period_days", e.target.value)}
                  />
                </FormField>
              )}
            </div>
          )}
        </div>
        )}

        {/* Step 1: Current location details */}
        {currentStep === 1 && (
        <div className="space-y-4 text-left animate-in fade-in duration-200">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
            Current location details
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
              <option value="">Province</option>
              {(Array.isArray(provinces) ? provinces : []).map((p: any) => (
                <option key={p.id || p.name} value={p.name}>{p.name}</option>
              ))}
            </FormSelect>
          </FormField>

          <FormField label="District">
            <FormSelect
              value={formData.district}
              onChange={(e) => handleLocationChange("district", e.target.value)}
              disabled={!formData.province}
            >
              <option value="">District</option>
              {(Array.isArray(districts) ? districts : []).map((d: any) => (
                <option key={d.id || d.name} value={d.name}>{d.name}</option>
              ))}
            </FormSelect>
          </FormField>

          <FormField label="Sector">
            <FormSelect
              value={formData.sector}
              onChange={(e) => handleLocationChange("sector", e.target.value)}
              disabled={!formData.district}
            >
              <option value="">Sector</option>
              {(Array.isArray(sectors) ? sectors : []).map((s: any) => (
                <option key={s.id || s.name} value={s.name}>{s.name}</option>
              ))}
            </FormSelect>
          </FormField>

          {role !== "company" && (
            <>
              <FormField label="Cell">
                <FormSelect
                  value={formData.cell}
                  onChange={(e) => handleLocationChange("cell", e.target.value)}
                  disabled={!formData.sector}
                >
                  <option value="">Cell</option>
                  {(Array.isArray(cells) ? cells : []).map((c: any) => (
                    <option key={c.id || c.name} value={c.name}>{c.name}</option>
                  ))}
                </FormSelect>
              </FormField>

              <FormField label="Village">
                <FormSelect
                  value={formData.village}
                  onChange={(e) => handleLocationChange("village", e.target.value)}
                  disabled={!formData.cell}
                >
                  <option value="">Village</option>
                  {(Array.isArray(villages) ? villages : []).map((v: any) => (
                    <option key={v.id || v.name} value={v.name}>{v.name}</option>
                  ))}
                </FormSelect>
              </FormField>
            </>
          )}
        </div>
        )}

      </div>
    </DedicatedFormPage>
  );
};

export default CreateUserFormPage;
