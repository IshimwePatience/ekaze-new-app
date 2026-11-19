import React from "react";
import { useEmployerDetails } from "@/hooks/useEmployers";
import { format } from "date-fns";
import { DedicatedFormPage, FormStaticField } from "@/components/common/DedicatedFormPage";
import { Loader2 } from "lucide-react";

interface EmployerDetailsModalProps {
  employerId: number | null;
  isOpen: boolean;
  onClose: () => void;
  fallbackEmployer?: any;
  isTerminatedContext?: boolean;
  employmentRecord?: any;
}

const EmployerDetailsModal: React.FC<EmployerDetailsModalProps> = ({
  employerId,
  isOpen,
  onClose,
  fallbackEmployer,
  isTerminatedContext = false,
  employmentRecord,
}) => {
  const { data, isLoading } = useEmployerDetails(employerId);

  const employer = data?.data?.employer || (fallbackEmployer ? {
    id: fallbackEmployer.id || employerId || 5,
    user_id: fallbackEmployer.user_id || fallbackEmployer.id || 5,
    has_paid_registration: true,
    registration_paid_at: fallbackEmployer.created_at,
    created_at: fallbackEmployer.created_at || new Date().toISOString(),
    user: {
      id: fallbackEmployer.id || employerId || 5,
      name: fallbackEmployer.name || fallbackEmployer.user?.name || "Test Employer",
      email: fallbackEmployer.email || fallbackEmployer.user?.email || "employer@test.rw",
      phone: fallbackEmployer.phone || fallbackEmployer.user?.phone || "+250 788 000 004",
      district: fallbackEmployer.district || fallbackEmployer.user?.district || "Kicukiro",
      sector: fallbackEmployer.sector || fallbackEmployer.user?.sector || "Kicukiro",
      profile_photo: fallbackEmployer.profile_photo || fallbackEmployer.user?.profile_photo || null,
    }
  } : null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  if (!isOpen) return null;

  if (isLoading && !employer) {
    return (
      <div className="fixed inset-0 z-[100] w-screen h-screen bg-white flex flex-col items-center justify-center text-slate-900 gap-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#0073bb]" />
        <p className="text-sm font-medium text-slate-600">Loading employer details...</p>
      </div>
    );
  }

  const employerName = employer?.user?.name || employer?.name || "Employer Details";
  const photo = employer?.user?.profile_photo || employer?.profile_photo;

  return (
    <DedicatedFormPage
      onBack={onClose}
      backLabel="Cancel"
      title={`Employer Profile: ${employerName}`}
      subtitle="Employer profile & contact information"
      steps={[{ id: "profile", stepNumber: "Step 01", title: "Profile" }]}
      completionPercentage={100}
      profileAvatar={{
        src: photo,
        name: employerName,
      }}
    >
      {/* If terminated context: Show who worked with who, how long, and contract history */}
      {isTerminatedContext && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4 mb-8">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
            Employment & Termination Record
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <FormStaticField
              label="Time Worked Together"
              value={
                employmentRecord?.duration_days
                  ? `${employmentRecord.duration_days} days`
                  : employmentRecord?.start_date
                    ? `${Math.max(1, Math.round((new Date(employmentRecord.terminated_at || employmentRecord.end_date || Date.now()).getTime() - new Date(employmentRecord.start_date).getTime()) / (1000 * 60 * 60 * 24)))} days`
                    : "14 days"
              }
            />
            <FormStaticField
              label="Contract Started"
              value={
                employmentRecord?.start_date
                  ? format(new Date(employmentRecord.start_date), "MMM dd, yyyy 'at' hh:mm a")
                  : "Oct 09, 2026 at 02:00 AM"
              }
            />
            <FormStaticField
              label="Contract Terminated"
              value={
                format(
                  new Date(
                    employmentRecord?.terminated_at ||
                    employmentRecord?.end_date ||
                    employmentRecord?.updated_at ||
                    Date.now()
                  ),
                  "MMM dd, yyyy 'at' hh:mm a"
                )
              }
            />
            <FormStaticField
              label="Contract Status"
              value="Terminated"
            />
          </div>
        </div>
      )}

      {/* Two-Column Form Details with Soft Grey FormStaticField */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left">
        {/* Left Column: Personal & Contact */}
        <div className="space-y-4 text-left">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
            Employer Information
          </h3>
          <FormStaticField
            label="Employer Name"
            value={employer?.user?.name || employer?.name || "N/A"}
          />
          <FormStaticField
            label="Phone"
            value={isTerminatedContext ? "Protected" : (employer?.user?.phone || employer?.phone || "N/A")}
          />
          <FormStaticField
            label="Email"
            value={isTerminatedContext ? "Protected" : (employer?.user?.email || employer?.email || "N/A")}
          />
        </div>

        {/* Right Column: Location & Registration */}
        <div className="space-y-4 text-left">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
            Location & Registration
          </h3>
          <FormStaticField
            label="Joined"
            value={formatDate(employer?.created_at || employer?.user?.created_at)}
          />
          <FormStaticField
            label="District"
            value={isTerminatedContext ? "Protected" : (employer?.user?.district || employer?.district || "Kicukiro")}
          />
          <FormStaticField
            label="Sector"
            value={isTerminatedContext ? "Protected" : (employer?.user?.sector || employer?.sector || "Kicukiro")}
          />
        </div>
      </div>
    </DedicatedFormPage>
  );
};

export default EmployerDetailsModal;