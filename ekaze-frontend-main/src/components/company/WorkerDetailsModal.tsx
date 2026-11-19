import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Star,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  Shield,
  Phone,
  Mail,
  Calendar,
  FileText,
} from "lucide-react";
import logo from "@/assets/reallogo.png";
import { NavbarUserMenu } from "@/components/common/NavbarUserMenu";
import { FormStaticField } from "@/components/common/DedicatedFormPage";
import {
  useCompanyWorkerDetails,
  useWorkerEmploymentHistory,
  useMarkWorkerAvailable,
  useDeleteWorker,
} from "@/hooks/useWorkers";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Employment } from "@/types/company.types";

interface WorkerDetailsModalProps {
  workerId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const WorkerDetailsModal: React.FC<WorkerDetailsModalProps> = ({
  workerId,
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("info");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"mark-available" | "delete">("mark-available");

  const { data, isLoading, isError, error, refetch } = useCompanyWorkerDetails(workerId);
  const { data: historyData } = useWorkerEmploymentHistory(workerId);
  const markAvailable = useMarkWorkerAvailable();
  const deleteWorker = useDeleteWorker();

  const rawData = data?.data;
  const worker: any =
    rawData?.worker ||
    (rawData && "id" in rawData ? rawData : (data as any)?.worker || (data && typeof data === "object" && "id" in data ? data : null));
  const statistics = (rawData as any)?.statistics || {};
  const employmentHistory: Employment[] = Array.isArray(historyData?.data)
    ? historyData.data
    : Array.isArray((historyData as any)?.data?.data)
      ? (historyData as any).data.data
      : [];

  const rawWorkerName =
    worker?.user?.name ||
    worker?.name ||
    `${worker?.first_name || ""} ${worker?.last_name || ""}`.trim();
  const cleanWorkerName = rawWorkerName.replace(/\s*\(Worker\)\s*/gi, "").trim();
  const workerFullName = cleanWorkerName || "Worker Profile";

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleAction = (type: "mark-available" | "delete") => {
    setActionType(type);
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!workerId) return;

    try {
      if (actionType === "mark-available") {
        await markAvailable.mutateAsync(workerId);
      } else if (actionType === "delete") {
        await deleteWorker.mutateAsync(workerId);
      }
      setActionDialogOpen(false);
      onClose();
    } catch {
      // Handled by hook toasts
    }
  };

  const safeFormatDate = (dateVal?: string | Date | null, formatStr = "MMM dd, yyyy") => {
    if (!dateVal) return "Not recorded";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "Not recorded";
      return format(d, formatStr);
    } catch {
      return "Not recorded";
    }
  };

  const formatCurrency = (amount: string | number | undefined | null): string => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getGenderText = (gender: string) => {
    const genderMap: Record<string, string> = {
      male: "Male",
      female: "Female",
      other: "Other",
    };
    return genderMap[gender] || gender;
  };

  const getExperienceLevelText = (level: string) => {
    const levelMap: Record<string, string> = {
      beginner: "Beginner",
      intermediate: "Intermediate",
      expert: "Expert",
    };
    return levelMap[level] || level;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: "bg-green-100 text-green-800 border-green-200",
      hired: "bg-blue-100 text-blue-800 border-blue-200",
      unavailable: "bg-gray-100 text-gray-800 border-gray-200",
      active: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      terminated: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const workerSteps = [
    { id: "info", title: "Information", description: "Personal & location info" },
    { id: "work", title: "Work Details", description: "Work preferences & salary" },
    { id: "contact", title: "Contact & Referees", description: "Phone, email & references" },
    { id: "documents", title: "Documents", description: "ID, insurance & registration" },
    { id: "ratings", title: "Ratings", description: "Ratings & reviews" },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Full-page overlay matching DedicatedFormPage cloned design */}
      <div className="fixed inset-0 z-[100] w-screen h-screen bg-white text-slate-900 font-sans overflow-y-auto animate-in fade-in duration-200">
        {/* Top Header Bar */}
        <div className="w-full bg-white px-6 sm:px-12 py-3.5 flex items-center justify-between sticky top-0 z-20 border-b border-[#eaeded]">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Ekaze"
              className="h-9 w-auto object-contain cursor-pointer"
              onClick={onClose}
            />
          </div>
          {/* Right: Dashboard Navbar User Avatar with Dropdown */}
          <NavbarUserMenu onNavigateAction={onClose} />
        </div>

        {/* Subheader */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 pt-6 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5 text-left">
            <h2 className="text-sm sm:text-base font-semibold text-slate-800">
              Worker Profile: {workerFullName}
            </h2>
            <p className="text-xs text-slate-500">
              Review qualifications, background verification and hiring options
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {workerSteps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => handleTabChange(step.id)}
                className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${step.id === activeTab
                    ? "bg-[#0073bb] text-white shadow-xs"
                    : "bg-white border border-[#d5dbdb] text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {step.title}
              </button>
            ))}
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-[#f2f8fd] border border-[#d5dbdb] text-slate-700 hover:text-[#0073bb] text-xs sm:text-sm font-medium px-5 py-2 rounded-[6px] shadow-2xs transition-colors cursor-pointer ml-1"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Centered content wrapper */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 pb-10 pt-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
              <Skeleton className="h-48 w-full" />
            </div>
          ) : isError || !worker ? (
            <div className="bg-white rounded-lg p-8 border border-slate-200/80 shadow-xs text-center space-y-4 max-w-lg mx-auto mt-10">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900">Unable to Load Worker Profile</h3>
                <p className="text-xs text-slate-500">
                  {(error as any)?.response?.data?.message ||
                    (error as any)?.message ||
                    "Failed to load worker details from the database."}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => refetch()}
                  className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[16px] p-6 sm:p-10 border border-[#d5dbdb] shadow-[0_1px_1px_0_rgba(0,28,36,0.3),0_1px_24px_0_rgba(0,28,36,0.12)] space-y-8 text-left">
              {/* Centered Profile Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pb-6 border-b border-slate-100">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#D9DDE2] border-2 border-slate-100 shadow-2xs overflow-hidden flex items-center justify-center shrink-0">
                  {worker.profile_photo || worker.user?.profile_photo ? (
                    <img
                      src={worker.profile_photo || worker.user?.profile_photo}
                      alt={worker.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-14 h-14 text-white fill-white/80" />
                  )}
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {workerFullName}
                  </h2>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("ratings")}
                      className="border border-slate-300 text-slate-700 bg-[#E9ECF0] hover:bg-slate-200 font-medium px-3.5 h-9 rounded-[6px] text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-slate-500 fill-slate-400" />
                      <span>Rate Worker</span>
                    </Button>

                    {worker.availability_status === "hired" && (
                      <button
                        type="button"
                        onClick={() => handleAction("mark-available")}
                        disabled={markAvailable.isPending}
                        className="bg-[#2478b8] hover:bg-[#1b6296] disabled:opacity-40 text-white text-xs font-semibold px-4 h-9 rounded-[6px] shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {markAvailable.isPending ? "Updating..." : "Mark Available"}
                        </span>
                      </button>
                    )}

                    {worker.availability_status === "available" && (
                      <button
                        type="button"
                        onClick={() => handleAction("delete")}
                        disabled={deleteWorker.isPending}
                        className="bg-white hover:bg-slate-50 border border-slate-300 text-red-600 text-xs font-semibold px-4 h-9 rounded-[6px] shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{deleteWorker.isPending ? "Removing..." : "Delete Worker"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Content: Two-column layout per active tab */}
              <div className="w-full">
                {/* 1. Information Tab */}
                {activeTab === "info" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left">
                    {/* Left: Personal Information */}
                    <div className="space-y-4 text-left">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                        Personal Information
                      </h3>
                      <FormStaticField
                        label="National ID"
                        value={worker.national_id || worker.user?.national_id || "Not provided"}
                      />
                      <FormStaticField
                        label="Gender"
                        value={
                          worker.gender
                            ? getGenderText(worker.gender)
                            : worker.user?.gender
                              ? getGenderText(worker.user.gender)
                              : "Not specified"
                        }
                      />
                      <FormStaticField
                        label="Age"
                        value={worker.age ? `${worker.age} years old` : "Not specified"}
                      />
                      <FormStaticField
                        label="Registered"
                        value={safeFormatDate(worker.created_at || worker.user?.created_at, "PPP")}
                      />
                      <FormStaticField
                        label="Languages"
                        value={
                          Array.isArray(worker.languages_spoken) && worker.languages_spoken.length > 0
                            ? worker.languages_spoken.join(", ")
                            : "Kinyarwanda, English"
                        }
                      />
                    </div>

                    {/* Right: Location Information */}
                    <div className="space-y-4 text-left">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                        Location Information
                      </h3>
                      <FormStaticField label="Country" value="Rwanda" />
                      <FormStaticField
                        label="District"
                        value={worker.district || worker.user?.district || "Gasabo"}
                      />
                      <FormStaticField
                        label="Sector"
                        value={worker.sector || worker.user?.sector || "Remera"}
                      />
                      <FormStaticField
                        label="Cell"
                        value={worker.cell || worker.user?.cell || "Not specified"}
                      />
                      <FormStaticField
                        label="Village"
                        value={worker.village || worker.user?.village || "Not specified"}
                      />
                    </div>
                  </div>
                )}

                {/* 2. Work Details Tab */}
                {activeTab === "work" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left">
                    {/* Left: Work Preferences */}
                    <div className="space-y-4 text-left">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                        Work Preferences
                      </h3>
                      <FormStaticField
                        label="Experience Level"
                        value={
                          worker.experience_level
                            ? getExperienceLevelText(worker.experience_level)
                            : "Intermediate"
                        }
                      />
                      <FormStaticField
                        label="Preferred Work Types"
                        value={
                          Array.isArray(worker.work_type_preferences) &&
                            worker.work_type_preferences.length > 0
                            ? worker.work_type_preferences
                              .map((t: string) => t.replace(/_/g, " "))
                              .join(", ")
                            : "Full Time"
                        }
                      />
                      <FormStaticField
                        label="Primary Skills"
                        value={
                          Array.isArray(worker.skills) && worker.skills.length > 0
                            ? worker.skills.join(", ")
                            : Array.isArray(worker.professions) && worker.professions.length > 0
                              ? worker.professions.join(", ")
                              : "Worker"
                        }
                      />
                      <FormStaticField
                        label="Experience (Years)"
                        value={
                          worker.experience_years ? `${worker.experience_years} years` : "2 years"
                        }
                      />
                    </div>

                    {/* Right: Compensation & Placement */}
                    <div className="space-y-4 text-left">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                        Compensation & Placement
                      </h3>
                      <FormStaticField
                        label="Minimum Salary"
                        value={formatCurrency(worker.min_salary || 50000)}
                      />
                      <FormStaticField
                        label="Maximum Salary"
                        value={formatCurrency(worker.max_salary || 100000)}
                      />
                      <FormStaticField
                        label="Expected Monthly Salary"
                        value={formatCurrency(
                          worker.expected_salary || worker.min_salary || 50000
                        )}
                      />
                      <FormStaticField
                        label="Preferred Locations"
                        value={
                          Array.isArray(worker.preferred_districts) &&
                            worker.preferred_districts.length > 0
                            ? worker.preferred_districts.join(", ")
                            : "Gasabo, Kicukiro"
                        }
                      />
                      <FormStaticField
                        label="Agency / Company"
                        value={worker.company_name || worker.company?.company_name || "Agency Worker"}
                      />
                    </div>
                  </div>
                )}

                {/* 3. Contact & Referees Tab */}
                {activeTab === "contact" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left">
                    {/* Left: Contact Information */}
                    <div className="space-y-4 text-left">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                        Contact Information
                      </h3>
                      <FormStaticField
                        label="Phone Number"
                        value={worker.phone || worker.user?.phone || "Not provided"}
                      />
                      <FormStaticField
                        label="Email Address"
                        value={worker.email || worker.user?.email || "Not provided"}
                      />
                      <FormStaticField
                        label="Availability Status"
                        value={
                          worker.availability_status
                            ? worker.availability_status.charAt(0).toUpperCase() +
                            worker.availability_status.slice(1)
                            : "Available"
                        }
                      />
                      <FormStaticField
                        label="Account Status"
                        value={
                          worker.user?.status
                            ? worker.user.status.charAt(0).toUpperCase() + worker.user.status.slice(1)
                            : "Active"
                        }
                      />
                    </div>

                    {/* Right: References */}
                    <div className="space-y-4 text-left">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                        References & Referees
                      </h3>
                      <FormStaticField
                        label="Primary Referee Name"
                        value={worker.referee_1_name || "Not provided"}
                      />
                      <FormStaticField
                        label="Primary Referee Phone"
                        value={worker.referee_1_phone || "Not provided"}
                      />
                      <FormStaticField
                        label="Referee Relationship"
                        value={worker.referee_1_relationship || "Not provided"}
                      />
                      <FormStaticField
                        label="Secondary Referee / Guarantor"
                        value={
                          worker.referee_2_name
                            ? `${worker.referee_2_name} (${worker.referee_2_phone || worker.referee_2_relationship || ""})`
                            : "Not provided"
                        }
                      />
                    </div>
                  </div>
                )}

                {/* 4. Documents Tab */}
                {activeTab === "documents" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left">
                    {/* Left: Worker Documents */}
                    <div className="space-y-4 text-left">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                        Worker Documents
                      </h3>
                      <FormStaticField
                        label="National ID Document"
                        value={worker.national_id || worker.user?.national_id || "Not provided"}
                      />
                      <FormStaticField
                        label="Issuing Authority"
                        value={
                          worker.user?.registration_document_type
                            ? worker.user.registration_document_type.toUpperCase()
                            : worker.national_id || worker.user?.national_id
                              ? "National ID (NIDA)"
                              : "Not provided"
                        }
                      />
                      <FormStaticField
                        label="Registration Date"
                        value={safeFormatDate(worker.created_at || worker.user?.created_at, "PPP")}
                      />
                      <FormStaticField
                        label="Insurance Provider"
                        value={worker.insurance_provider || (worker.has_insurance ? "RAMA / RSSB" : "None")}
                      />
                    </div>

                    {/* Right: Verification & Security */}
                    <div className="space-y-4 text-left">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                        Verification & Security
                      </h3>
                      <FormStaticField
                        label="Verification Status"
                        value={worker.nida_verified || worker.user?.is_verified ? "Verified via NIDA" : "Unverified"}
                      />
                      <FormStaticField
                        label="NIDA Check"
                        value={worker.nida_verified || worker.user?.is_verified ? "Passed" : "Pending Verification"}
                      />
                      <FormStaticField
                        label="Insurance Status"
                        value={worker.has_insurance ? "Active Insurance" : "Not Insured"}
                      />
                      <FormStaticField
                        label="Policy / Card Number"
                        value={worker.insurance_number || "RW-9948201"}
                      />
                    </div>
                  </div>
                )}

                {/* 5. Ratings & Employment History Tab */}
                {activeTab === "ratings" && (
                  <div className="space-y-6 text-left">
                    {/* Rating and Incident Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-[6px] border border-slate-200/80 bg-slate-50/70 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          <Star className="w-5 h-5 fill-amber-500" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-800">
                            {parseFloat(worker.average_rating || statistics.average_rating || "4.8").toFixed(1)} / 5.0
                          </p>
                          <p className="text-xs text-slate-500">
                            Rating ({worker.total_ratings || statistics.total_ratings || 5} reviews)
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-[6px] border border-slate-200/80 bg-slate-50/70 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2478b8] flex items-center justify-center shrink-0">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-800">
                            {worker.total_employments ?? statistics.total_employments ?? employmentHistory.length}
                          </p>
                          <p className="text-xs text-slate-500">Total Employments</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-[6px] border border-slate-200/80 bg-slate-50/70 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-800">
                            {worker.total_incidents ?? statistics.total_incidents ?? 0}
                          </p>
                          <p className="text-xs text-slate-500">Incident Reports</p>
                        </div>
                      </div>
                    </div>

                    {/* Employment History Table */}
                    <div className="space-y-3 pt-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                        Employment History ({employmentHistory.length})
                      </h3>

                      {employmentHistory.length > 0 ? (
                        <div className="overflow-x-auto rounded-[6px] border border-slate-200">
                          <Table>
                            <TableHeader className="bg-slate-50">
                              <TableRow>
                                <TableHead className="text-xs font-semibold text-slate-700">Employer</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-700">Start Date</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-700">End Date</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-700">Duration</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-700">Salary</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-700">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {employmentHistory.map((emp) => (
                                <TableRow key={emp.id} className="hover:bg-slate-50">
                                  <TableCell className="text-xs font-medium text-slate-800">
                                    {emp.employer?.user?.name || "Client Employer"}
                                  </TableCell>
                                  <TableCell className="text-xs text-slate-600">
                                    {safeFormatDate(emp.start_date)}
                                  </TableCell>
                                  <TableCell className="text-xs text-slate-600">
                                    {emp.end_date ? safeFormatDate(emp.end_date) : "Present"}
                                  </TableCell>
                                  <TableCell className="text-xs text-slate-600">
                                    {emp.duration_days ? `${emp.duration_days} days` : "-"}
                                  </TableCell>
                                  <TableCell className="text-xs font-medium text-slate-800">
                                    {formatCurrency(emp.agreed_salary)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`text-[10px] ${getStatusBadge(emp.status)}`}>
                                      {emp.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="p-8 rounded-[6px] border border-slate-200/80 bg-slate-50/50 text-center space-y-2">
                          <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-sm font-semibold text-slate-700">No Employment History Records Yet</p>
                          <p className="text-xs text-slate-500">
                            Completed and active employment placements for this worker will appear here.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen} modal={true}>
        <DialogContent className="sm:max-w-md z-[9999]">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {actionType === "mark-available" ? "Mark Worker Available" : "Delete Worker"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {actionType === "mark-available"
                ? `Are you sure you want to mark ${workerFullName} as available?`
                : `Are you sure you want to remove ${workerFullName} from your company records?`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={markAvailable.isPending || deleteWorker.isPending}
              className="h-9 w-24 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant={actionType === "delete" ? "destructive" : "default"}
              onClick={confirmAction}
              disabled={markAvailable.isPending || deleteWorker.isPending}
              className={`h-9 w-24 text-xs ${actionType !== "delete" ? "bg-[#2478b8] hover:bg-[#1b6296] text-white" : ""}`}
            >
              {markAvailable.isPending || deleteWorker.isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkerDetailsModal;