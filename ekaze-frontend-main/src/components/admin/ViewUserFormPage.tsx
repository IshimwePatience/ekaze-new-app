import React, { useState } from "react";
import {
  DedicatedFormPage,
  FormStaticField,
} from "../common/DedicatedFormPage";
import { useUserDetails } from "@/hooks/useUsers";
import type { User } from "@/types/user.types";
import { CheckCircle2, XCircle, Loader2, Pencil } from "lucide-react";

interface ViewUserFormPageProps {
  user?: User | any;
  userId?: number | string;
  onBack: () => void;
  onEdit?: () => void;
}

export const ViewUserFormPage: React.FC<ViewUserFormPageProps> = ({ user, userId, onBack, onEdit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const targetId = userId ? Number(userId) : user?.id;
  // Fetch fresh user record from DB
  const { data: dbUserResponse, isLoading: isFetchingUser } = useUserDetails(targetId || null);
  const fetchedUser = dbUserResponse?.data || user || {};

  if (isFetchingUser && !user) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center text-slate-900 gap-3 font-sans text-left">
        <Loader2 className="w-8 h-8 animate-spin text-[#0073bb]" />
        <p className="text-sm font-medium text-slate-600">Fetching user details from database...</p>
      </div>
    );
  }

  const isStep0Done = Boolean(fetchedUser.name && fetchedUser.phone && fetchedUser.email);
  const isStep1Done = Boolean(fetchedUser.province && fetchedUser.district && fetchedUser.sector);

  const STEPS = [
    { id: "info", stepNumber: "Step 01", title: "Personal Information", description: "User credentials & verification", completed: isStep0Done },
    { id: "location", stepNumber: "Step 02", title: "Address & Location", description: "Jurisdiction & location details", completed: isStep1Done },
  ];

  return (
    <DedicatedFormPage
      onBack={onBack}
      backLabel="Cancel"
      title={`User profile: ${fetchedUser.name}`}
      subtitle="Read-only user profile information from system database."
      steps={STEPS}
      currentStep={currentStep}
      onStepClick={setCurrentStep}
      completionPercentage={100}
      profileAvatar={{
        src: fetchedUser.profile_photo,
        name: fetchedUser.name,
        role: fetchedUser.role,
      }}
      primaryActionLabel={onEdit ? "Edit Profile" : undefined}
      primaryActionIcon={onEdit ? <Pencil className="w-4 h-4 mr-1.5" /> : undefined}
      onPrimaryAction={onEdit}
      secondaryActionLabel={currentStep === 0 ? "Next: Address & Location" : "Back: Personal Info"}
      onSecondaryAction={() => setCurrentStep(currentStep === 0 ? 1 : 0)}
    >
      {/* Step-by-Step Content */}
      <div className="max-w-2xl text-left">

        {/* Step 0: Profile details */}
        {currentStep === 0 && (
        <div className="space-y-4 text-left animate-in fade-in duration-200">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
            Profile details
          </h3>

          <FormStaticField label="Full name" value={fetchedUser.name} />

          {!["admin", "police", "supervisor"].includes((fetchedUser.role || user?.role || "").toLowerCase()) && (
            <FormStaticField
              label="ID Number (NIDA)"
              value={
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono">{fetchedUser.national_id || "N/A"}</span>
                  {fetchedUser.is_verified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                      <XCircle className="w-3.5 h-3.5 text-amber-600" />
                      Unverified
                    </span>
                  )}
                </div>
              }
            />
          )}

          <FormStaticField
            label="Account type"
            value={<span className="capitalize font-semibold text-slate-800">{fetchedUser.role}</span>}
          />

          <FormStaticField
            label="Gender"
            value={<span className="capitalize">{fetchedUser.gender || "Not specified"}</span>}
          />

          <FormStaticField label="Email" value={fetchedUser.email || "N/A"} />

          <FormStaticField
            label="Phone Number"
            value={
              <div className="flex items-center gap-2">
                <span className="text-sm">🇷🇼</span>
                <span>{fetchedUser.phone || "N/A"}</span>
              </div>
            }
          />

          <FormStaticField
            label="Account status"
            value={
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${fetchedUser.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : fetchedUser.status === 'suspended'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                {fetchedUser.status || "Pending"}
              </span>
            }
          />
        </div>
        )}

        {/* Step 1: Current location details */}
        {currentStep === 1 && (
        <div className="space-y-4 text-left animate-in fade-in duration-200">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
            Current location details
          </h3>

          <FormStaticField
            label="Country"
            value={
              <div className="flex items-center gap-2">
                <span className="text-sm">🇷🇼</span>
                <span>Rwanda</span>
              </div>
            }
          />

          <FormStaticField label="Province" value={fetchedUser.province || "N/A"} />
          <FormStaticField label="District" value={fetchedUser.district || "N/A"} />
          <FormStaticField label="Sector" value={fetchedUser.sector || "N/A"} />
          <FormStaticField label="Cell" value={fetchedUser.cell || "N/A"} />
          <FormStaticField label="Village" value={fetchedUser.village || "N/A"} />
        </div>
        )}

      </div>
    </DedicatedFormPage>
  );
};

export default ViewUserFormPage;
