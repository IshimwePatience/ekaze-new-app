import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Calendar,
  Briefcase,
  Star,
  Shield,
  X,
  ArrowLeft,
  Languages,
  FileText,
  Users,
  Award,
  Building,
  ArrowUpRight,
  CreditCardIcon,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  LayoutGrid,
  Target,
} from "lucide-react";
import logo from "@/assets/reallogo.png";
import { useWorkerDetails } from "@/hooks/useWorkerSearch";
import { useCreateHiringRequest, useEmployerHiringRequests, useRateWorker, useWorkerRatings } from "@/hooks/useEmployerWorker";
import { format } from "date-fns";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type { WorkerPaid } from "@/types/worker-search.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConfirmPayment } from "@/hooks/useEmployerWorker";
import { Smartphone, Loader2 } from "lucide-react";
import { DedicatedFormPage, FormStaticField } from "@/components/common/DedicatedFormPage";
import { NavbarUserMenu } from "@/components/common/NavbarUserMenu";

interface WorkerDetailsModalProps {
  workerId: number | null;
  isOpen: boolean;
  onClose: () => void;
  hasPaidContact?: boolean;
  unlockedContact?: { phone: string | null; email: string | null } | null;
  onUnlockContact?: () => void;
  isTerminatedContext?: boolean;
  employmentRecord?: any;
  canRate?: boolean;
}

interface HiringFormData {
  message: string;
  proposed_salary: string;
  work_description: string;
}

interface HiringRequestItem {
  worker_id: number;
  status: string;
}

const WorkerDetailsModal = ({
  workerId,
  isOpen,
  onClose,
  hasPaidContact = false,
  unlockedContact = null,
  onUnlockContact,
  isTerminatedContext = false,
  employmentRecord,
  canRate = true,
}: WorkerDetailsModalProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("info");
  const [isHiringDialogOpen, setIsHiringDialogOpen] = useState(false);
  const [contactDisclaimerAccepted, setContactDisclaimerAccepted] = useState(false);
  const [hasReadConsent, setHasReadConsent] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [hiringFormData, setHiringFormData] = useState<HiringFormData>({
    message: "",
    proposed_salary: "",
    work_description: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof HiringFormData, string>>>({});


  const { data, isLoading } = useWorkerDetails(workerId);

  // Properly extract worker data with type safety — must come before any hook/handler that references `worker`
  const workerData = data?.data;
  const worker: WorkerPaid | undefined = workerData
    ? ('worker' in workerData ? workerData.worker : workerData)
    : undefined;

  const createHiringRequest = useCreateHiringRequest();

  const { data: hiringRequestsData } = useEmployerHiringRequests(1);
  const confirmPayment = useConfirmPayment();

  const rateWorker = useRateWorker();

  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingReview, setRatingReview] = useState('');

  const { data: ratingsData, isLoading: isRatingsLoading } = useWorkerRatings(worker?.id ?? null);

  const handleRateWorkerSubmit = () => {
    if (!worker || ratingValue === 0) return;
    const hasCategoryRatings = Object.values(categoryRatings).some((v) => v > 0);
    const resolvedCategories = hasCategoryRatings
      ? {
          punctuality: categoryRatings.punctuality || ratingValue,
          work_quality: categoryRatings.work_quality || ratingValue,
          communication: categoryRatings.communication || ratingValue,
          professionalism: categoryRatings.professionalism || ratingValue,
        }
      : undefined;

    rateWorker.mutate(
      {
        workerId: worker.id,
        data: {
          rating: ratingValue,
          review: ratingReview || undefined,
          rating_categories: resolvedCategories,
        },
      },
      {
        onSuccess: () => {
          setIsRatingDialogOpen(false);
          setRatingValue(0);
          setHoverRating(0);
          setRatingReview('');
          setCategoryRatings({ punctuality: 0, work_quality: 0, communication: 0, professionalism: 0 });
        },
      }
    );
  };

  type HiringStep = 'form' | 'payment' | 'polling' | 'done';
  const [hiringStep, setHiringStep] = useState<HiringStep>('form');
  const [paymentData, setPaymentData] = useState<{
    paymentId: number;
    requestId: number;
    amount: number;
    currency: string;
    note: string;
  } | null>(null);
  const [mtnPhone, setMtnPhone] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [payError, setPayError] = useState('');
  const [isInitiating, setIsInitiating] = useState(false);

  const [categoryRatings, setCategoryRatings] = useState({
    punctuality: 0,
    work_quality: 0,
    communication: 0,
    professionalism: 0,
  });

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };


  const hasPendingRequest = hiringRequestsData?.data?.data?.some(
    (req: HiringRequestItem) => req.worker_id === worker?.id && req.status === 'pending'
  ) ?? false;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    setContactDisclaimerAccepted(false);
    setHasReadConsent(false);
  }, [workerId, isOpen]);

  const formatCurrency = (amount: number | string | undefined): string => {
    if (amount === undefined || amount === null) return t("employer.workerSearch.workerDetails.notAvailable");
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return t("employer.workerSearch.workerDetails.notAvailable");
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: "bg-green-100 text-green-800 border-green-200",
      hired: "bg-blue-100 text-blue-800 border-blue-200",
      unavailable: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[status as keyof typeof styles] || "";
  };

  const getExperienceBadge = (level: string) => {
    const styles = {
      beginner: "bg-blue-100 text-blue-800 border-blue-200",
      intermediate: "bg-purple-100 text-purple-800 border-purple-200",
      expert: "bg-amber-100 text-amber-800 border-amber-200",
    };
    return styles[level as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const getExperienceLevelText = (level: string) => {
    const levelMap: Record<string, string> = {
      beginner: t("employer.workerSearch.workerDetails.beginner"),
      intermediate: t("employer.workerSearch.workerDetails.intermediate"),
      expert: t("employer.workerSearch.workerDetails.expert"),
    };
    return levelMap[level] || level;
  };

  const getGenderText = (gender: string) => {
    const genderMap: Record<string, string> = {
      male: t("employer.workerSearch.workerDetails.male"),
      female: t("employer.workerSearch.workerDetails.female"),
      other: t("employer.workerSearch.workerDetails.other"),
    };
    return genderMap[gender] || gender;
  };

  const validateHiringForm = (): boolean => {
    const errors: Partial<Record<keyof HiringFormData, string>> = {};

    if (!hiringFormData.proposed_salary) {
      errors.proposed_salary = t("employer.workerSearch.workerDetails.salaryRequired");
    } else if (isNaN(Number(hiringFormData.proposed_salary)) || Number(hiringFormData.proposed_salary) <= 0) {
      errors.proposed_salary = t("employer.workerSearch.workerDetails.salaryInvalid");
    }

    if (!hiringFormData.work_description || hiringFormData.work_description.replace(/<[^>]*>/g, '').trim() === '') {
      errors.work_description = t("employer.workerSearch.workerDetails.descriptionRequired");
    } else if (hiringFormData.work_description.replace(/<[^>]*>/g, '').length < 20) {
      errors.work_description = t("employer.workerSearch.workerDetails.descriptionMinLength");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleHiringSubmit = async () => {
    if (!worker) return;
    if (!validateHiringForm()) {
      toast.error(t("employer.workerSearch.workerDetails.formErrors"));
      return;
    }

    try {
      const response = await createHiringRequest.mutateAsync({
        worker_id: worker.id,
        message: hiringFormData.message || undefined,
        proposed_salary: hiringFormData.proposed_salary ? Number(hiringFormData.proposed_salary) : undefined,
        work_description: hiringFormData.work_description,
      } as any);

      setPaymentData({
        paymentId: response.data.payment.id,
        requestId: response.data.request.id,
        amount: Number(response.data.payment.amount),
        currency: response.data.payment.currency,
        note: response.data.payment.note,
      });
      setHiringStep('payment');
    } catch (error) {
      console.error('Hiring request failed:', error);
    }
  };

  const handleInitiateMtnPayment = async () => {
    if (!mtnPhone || mtnPhone.length < 10 || !paymentData) return;
    setIsInitiating(true);
    setPayError('');

    try {
      const res = await import('@/lib/api').then(m => m.default.post(
        `/employer/hiring-requests/${paymentData.requestId}/payment/initiate`,
        { phone: mtnPhone, payment_id: paymentData.paymentId }
      ));

      if (res.data?.success) {
        setReferenceId(res.data.reference_id);
        setHiringStep('polling');
        startHiringPaymentPolling(res.data.reference_id, paymentData.requestId);
      } else {
        setPayError(res.data?.message || 'Failed to initiate payment.');
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setPayError(err?.response?.data?.message || 'Failed to initiate payment.');
    } finally {
      setIsInitiating(false);
    }
  };

  const startHiringPaymentPolling = (refId: string, requestId: number) => {
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setHiringStep('payment');
      setPayError('Payment timed out. Please try again.');
    }, 2 * 60 * 1000);

    pollRef.current = setInterval(async () => {
      try {
        const res = await import('@/lib/api').then(m =>
          m.default.get(`/employer/hiring-requests/${requestId}/payment/status/${refId}`)
        );
        const ps = res.data?.payment_status;

        if (ps === 'SUCCESSFUL') {
          stopPolling();
          setHiringStep('done');
        } else if (ps === 'FAILED') {
          stopPolling();
          setHiringStep('payment');
          setPayError(res.data?.reason || 'Payment was declined. Try again.');
        }
      } catch {
        console.log('something went wrong!');
      }
    }, 5000);
  };

  const handleConfirmPayment = async () => {
    if (!paymentData) return;

    try {
      await confirmPayment.mutateAsync({
        id: paymentData.requestId,
        data: {
          payment_id: paymentData.paymentId,
        },
      });

      setIsHiringDialogOpen(false);
      setHiringStep('form');
      setPaymentData(null);
      setHiringFormData({ message: "", proposed_salary: "", work_description: "" });
      setFormErrors({});
    } catch (error) {
      console.error("Payment confirmation failed:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setHiringFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof HiringFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRichTextChange = (value: string) => {
    setHiringFormData(prev => ({ ...prev, work_description: value }));
    if (formErrors.work_description) {
      setFormErrors(prev => ({ ...prev, work_description: undefined }));
    }
  };

  const openHiringDialog = () => {
    if (!worker) return;

    if (worker.registration_type !== 'company') {
      toast.info(
        t("employer.workerSearch.workerDetails.freelanceContactInfo"),
        { duration: 5000 }
      );
    }

    if (worker.availability_status !== 'available') {
      toast.error(t("employer.workerSearch.workerDetails.workerNotAvailableMsg"));
    }

    setHiringFormData({
      message: "",
      proposed_salary: worker.min_salary ? worker.min_salary.toString() : "",
      work_description: "",
    });

    setIsHiringDialogOpen(true);
  };

  const handleHiringDialogClose = (open: boolean) => {
    setIsHiringDialogOpen(open);
    if (!open) {
      stopPolling();
      setHiringStep('form');
      setPaymentData(null);
      setMtnPhone('');
      setReferenceId('');
      setPayError('');
    }
  };

  const getPlainTextLength = (html: string): number => {
    const plainText = html.replace(/<[^>]*>/g, '');
    return plainText.length;
  };

  const isInfoDone = Boolean(
    worker &&
    (worker.national_id || worker.user?.national_id) &&
    (worker.gender || worker.user?.gender) &&
    (worker.district || worker.user?.district) &&
    (worker.sector || worker.user?.sector)
  );
  const isWorkDone = Boolean(
    worker &&
    worker.experience_level &&
    ((Array.isArray(worker.skills) && worker.skills.length > 0) ||
      (Array.isArray(worker.professions) && worker.professions.length > 0)) &&
    Number(worker.min_salary) > 0
  );
  const isContactDone = Boolean(
    worker &&
    (worker.phone || worker.user?.phone) &&
    (worker.email || worker.user?.email) &&
    worker.referee_1_name
  );
  const isDocsDone = Boolean(
    worker &&
    (worker.national_id || worker.user?.national_id) &&
    worker.created_at
  );
  const isRatingsDone = Boolean(
    worker &&
    ((worker.ratings_count && worker.ratings_count > 0) ||
      (ratingsData?.data && ratingsData.data.length > 0))
  );

  const workerSteps = [
    { id: "info", title: t("employer.workerSearch.workerDetails.information"), description: "Personal & location info", completed: isInfoDone },
    { id: "work", title: t("employer.workerSearch.workerDetails.workDetails"), description: "Work preferences & salary", completed: isWorkDone },
    { id: "contact", title: t("employer.workerSearch.workerDetails.contactReferees"), description: "Phone, email & references", completed: isContactDone },
    { id: "documents", title: t("employer.workerSearch.workerDetails.documents"), description: "ID, insurance & registration", completed: isDocsDone },
    { id: "ratings", title: t("employer.workerSearch.workerDetails.ratings"), description: "Ratings & reviews", completed: isRatingsDone },
  ];

  if (!isOpen) return null;

  const currentStepIdx = Math.max(0, workerSteps.findIndex((s) => s.id === activeTab));

  return (
    <>
      <DedicatedFormPage
        onBack={onClose}
        backLabel="Cancel"
        title={`Worker Profile: ${worker ? `${worker.first_name} ${worker.last_name}` : "Worker Profile"}`}
        subtitle="Review qualifications, background verification and hiring options"
        steps={workerSteps}
        currentStep={currentStepIdx}
        onStepClick={(idx) => handleTabChange(workerSteps[idx].id)}
        secondaryActionLabel={currentStepIdx > 0 ? "Previous" : undefined}
        onSecondaryAction={
          currentStepIdx > 0
            ? () => handleTabChange(workerSteps[currentStepIdx - 1].id)
            : undefined
        }
        primaryActionLabel={currentStepIdx < workerSteps.length - 1 ? "Next Step" : "Close"}
        onPrimaryAction={
          currentStepIdx < workerSteps.length - 1
            ? () => handleTabChange(workerSteps[currentStepIdx + 1].id)
            : onClose
        }
      >
        {isLoading || !worker ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="space-y-8 text-left">

              {/* Centered Profile Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pb-6 border-b border-slate-100">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#D9DDE2] border-2 border-slate-100 shadow-2xs overflow-hidden flex items-center justify-center shrink-0">
                  {worker.profile_photo ? (
                    <img src={worker.profile_photo} alt={worker.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-14 h-14 text-white fill-white/80" />
                  )}
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {worker.first_name} {worker.last_name}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-sm font-medium text-slate-600">
                      {worker.availability_status === 'available'
                        ? t("employer.workerSearch.workerDetails.available")
                        : worker.availability_status === 'hired'
                          ? t("employer.workerSearch.workerDetails.hired")
                          : t("employer.workerSearch.workerDetails.unavailable")}
                      ,{' '}
                      {worker.registration_type === 'company'
                        ? t("employer.workerSearch.workerDetails.companyRegistered")
                        : t("employer.workerSearch.workerDetails.freelance")}
                    </span>
                    {worker.nida_verified && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    {canRate && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRatingDialogOpen(true)}
                        className="border border-slate-300 text-slate-700 bg-[#E9ECF0] hover:bg-slate-200 font-medium px-3.5 h-9 rounded-[6px] text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-slate-500 fill-slate-400" />
                        <span>{t("employer.workerSearch.workerDetails.rateWorker")}</span>
                      </Button>
                    )}

                    {!isTerminatedContext && !hasPaidContact && (
                      <>
                        {hasPendingRequest ? (
                          <button
                            disabled
                            className="border border-emerald-200 text-emerald-700 bg-emerald-50 font-semibold px-4 h-9 rounded-[6px] text-xs opacity-70 cursor-default flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{t("employer.workerSearch.workerDetails.requestSent")}</span>
                          </button>
                        ) : (
                          <>
                            {worker.availability_status === 'available' && worker.registration_type === 'company' && (
                              <button
                                type="button"
                                onClick={openHiringDialog}
                                disabled={createHiringRequest.isPending}
                                className="bg-[#0073bb] hover:bg-[#005f9e] disabled:opacity-40 text-white text-xs font-semibold px-4 h-9 rounded-[6px] shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <Briefcase className="w-3.5 h-3.5" />
                                <span>{t("employer.workerSearch.workerDetails.hireNow")}</span>
                              </button>
                            )}
                            {worker.availability_status === 'available' && worker.registration_type !== 'company' && (
                              <button
                                type="button"
                                onClick={openHiringDialog}
                                className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-4 h-9 rounded-[6px] shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{t("employer.workerSearch.workerDetails.contactDirectly")}</span>
                              </button>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* If terminated context: Show who worked with who, how long, and contract history */}
              {isTerminatedContext && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
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

              {/* Form Content: Two-column layout per active tab */}
              <div className="w-full">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">

                  <TabsContent value="info" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left">
                      {/* Left: Personal Information */}
                      <div className="space-y-4 text-left">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">{t("employer.workerSearch.workerDetails.personalInformation")}</h3>
                        <FormStaticField label={t("employer.workerSearch.workerDetails.nationalId")} value={worker.national_id || worker.user?.national_id || "Not provided"} />
                        <FormStaticField label={t("employer.workerSearch.workerDetails.gender")} value={worker.gender ? getGenderText(worker.gender) : (worker.user?.gender ? getGenderText(worker.user.gender) : "Not specified")} />
                        <FormStaticField label="Age" value={worker.age ? `${worker.age} years old` : "Not specified"} />
                        <FormStaticField label={t("employer.workerSearch.workerDetails.registered")} value={worker.created_at ? format(new Date(worker.created_at), 'PPP') : "Not recorded"} />
                        <FormStaticField label="Languages" value={worker.languages_spoken && worker.languages_spoken.length > 0 ? worker.languages_spoken.join(', ') : "Not specified"} />
                      </div>

                      {/* Right: Location Information */}
                      <div className="space-y-4 text-left">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">{t("employer.workerSearch.workerDetails.locationInformation")}</h3>
                        <FormStaticField label="Country" value="Rwanda" />
                        <FormStaticField label={t("employer.workerSearch.workerDetails.district")} value={isTerminatedContext ? "Protected" : (worker.district || worker.user?.district || "Not specified")} />
                        <FormStaticField label={t("employer.workerSearch.workerDetails.sector")} value={isTerminatedContext ? "Protected" : (worker.sector || worker.user?.sector || "Not specified")} />
                        <FormStaticField label={t("employer.workerSearch.workerDetails.cell")} value={isTerminatedContext ? "Protected" : (worker.cell || worker.user?.cell || "Not specified")} />
                        <FormStaticField label={t("employer.workerSearch.workerDetails.village")} value={isTerminatedContext ? "Protected" : (worker.village || worker.user?.village || "Not specified")} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="work" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left">
                      {/* Left: Work Details */}
                      <div className="space-y-4 text-left">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">{t("employer.workerSearch.workerDetails.workPreferences")}</h3>
                        <FormStaticField
                          label={t("employer.workerSearch.workerDetails.experienceLevel")}
                          value={worker.experience_level ? getExperienceLevelText(worker.experience_level) : t("employer.workerSearch.workerDetails.notAvailable")}
                        />
                        <FormStaticField
                          label={t("employer.workerSearch.workerDetails.preferredWorkTypes")}
                          value={worker.work_type_preferences && worker.work_type_preferences.length > 0
                            ? worker.work_type_preferences.map((t: string) => t.replace(/_/g, ' ')).join(', ')
                            : t("employer.workerSearch.workerDetails.noPreferences")}
                        />
                        <FormStaticField
                          label="Primary Skills"
                          value={Array.isArray(worker.skills) && worker.skills.length > 0 ? worker.skills.join(', ') : (Array.isArray(worker.professions) && worker.professions.length > 0 ? worker.professions.join(', ') : "Not specified")}
                        />
                      </div>

                      {/* Right: Compensation & Placement */}
                      <div className="space-y-4 text-left">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">Compensation & Placement</h3>
                        <FormStaticField
                          label={t("employer.workerSearch.workerDetails.minimumSalary")}
                          value={formatCurrency(worker.min_salary || 0)}
                        />
                        <FormStaticField
                          label={t("employer.workerSearch.workerDetails.maximumSalary")}
                          value={formatCurrency(worker.max_salary || 0)}
                        />
                        <FormStaticField
                          label={t("employer.workerSearch.workerDetails.preferredLocations")}
                          value={worker.preferred_districts && worker.preferred_districts.length > 0
                            ? worker.preferred_districts.join(', ')
                            : t("employer.workerSearch.workerDetails.noLocations")}
                        />
                        {worker.company && (
                          <>
                            <FormStaticField
                              label={t("employer.workerSearch.workerDetails.companyName")}
                              value={worker.company.business_name || t("employer.workerSearch.workerDetails.notAvailable")}
                            />
                            <FormStaticField
                              label={t("employer.workerSearch.workerDetails.companyId")}
                              value={String(worker.company.id || t("employer.workerSearch.workerDetails.notAvailable"))}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Contact & Referees Tab */}
                  <TabsContent value="contact" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left">
                      {/* Left: Contact Info */}
                      <div className="space-y-4 text-left">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">{t("employer.workerSearch.workerDetails.contactInformation")}</h3>
                        <FormStaticField
                          label={t("employer.workerSearch.workerDetails.phoneNumber")}
                          value={isTerminatedContext ? "Protected" : (worker.phone || worker.user?.phone || "Not provided")}
                        />
                        <FormStaticField
                          label={t("employer.workerSearch.workerDetails.emailAddress")}
                          value={isTerminatedContext ? "Protected" : (worker.email || worker.user?.email || "Not provided")}
                        />
                        <FormStaticField
                          label="Availability Status"
                          value={worker.availability_status ? (worker.availability_status.charAt(0).toUpperCase() + worker.availability_status.slice(1)) : "Available"}
                        />
                      </div>

                      {/* Right: References */}
                      <div className="space-y-4 text-left">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">{t("employer.workerSearch.workerDetails.references")}</h3>
                        <FormStaticField
                          label="Primary Referee Name"
                          value={worker.referee_1_name || (worker as any).extended_profile?.referee_1_name || (worker as any).extended_profile?.referee_3_name || (worker as any).referee_3_name || "Not provided"}
                        />
                        <FormStaticField
                          label="Primary Referee Phone"
                          value={worker.referee_1_phone || (worker as any).extended_profile?.referee_1_phone || (worker as any).extended_profile?.referee_3_phone || (worker as any).referee_3_phone || "Not provided"}
                        />
                        <FormStaticField
                          label="Referee Relationship"
                          value={worker.referee_1_relationship || (worker as any).extended_profile?.referee_1_relationship || (worker as any).extended_profile?.referee_3_relationship || (worker as any).referee_3_relationship || "Not provided"}
                        />
                        <FormStaticField
                          label="Secondary Referee / Guarantor"
                          value={
                            (worker.referee_2_name || (worker as any).extended_profile?.referee_2_name)
                              ? `${worker.referee_2_name || (worker as any).extended_profile?.referee_2_name} (${worker.referee_2_phone || (worker as any).extended_profile?.referee_2_phone || worker.referee_2_relationship || (worker as any).extended_profile?.referee_2_relationship || ''})`
                              : ((worker as any).extended_profile?.referee_3_name && worker.referee_1_name && worker.referee_1_name !== (worker as any).extended_profile?.referee_3_name)
                              ? `${(worker as any).extended_profile?.referee_3_name} (${(worker as any).extended_profile?.referee_3_phone || (worker as any).extended_profile?.referee_3_relationship || ''})`
                              : "Not provided"
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left">
                      {/* Left: Verification & ID */}
                      <div className="space-y-4 text-left">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">{t("employer.workerSearch.workerDetails.workerDocuments")}</h3>
                        <FormStaticField
                          label={t("employer.workerSearch.workerDetails.nationalIdDoc")}
                          value={worker.national_id || worker.user?.national_id || "Not provided"}
                        />
                        <FormStaticField
                          label="Issuing Authority"
                          value={worker.user?.registration_document_type ? worker.user.registration_document_type.toUpperCase() : (worker.national_id || worker.user?.national_id ? "National ID (NIDA)" : "Not provided")}
                        />
                        <FormStaticField
                          label={t("employer.workerSearch.workerDetails.registration")}
                          value={worker.created_at ? format(new Date(worker.created_at), 'PPP') : "Not recorded"}
                        />
                      </div>

                      {/* Right: Security & Insurance */}
                      <div className="space-y-4 text-left">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">Verification & Security</h3>
                        <FormStaticField
                          label="Verification Status"
                          value={worker.user?.is_verified ? "Identity Verified" : (worker.user?.status ? worker.user.status.toUpperCase() : "Pending Verification")}
                        />
                        <FormStaticField
                          label={t("employer.workerSearch.workerDetails.insuranceDetails")}
                          value={worker.has_insurance && (worker.insurance_provider || worker.insurance_type) ? `${worker.insurance_provider || worker.insurance_type} ${worker.insurance_number ? `(${worker.insurance_number})` : ''}` : "Uninsured / Not provided"}
                        />
                        <FormStaticField
                          label="Background & Criminal Record Check"
                          value={worker.user?.is_verified ? "NIDA Identity Verified" : "Pending Verification"}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Ratings Tab */}
                  <TabsContent value="ratings" className="mt-4 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-left">
                      {/* Left: Overall Rating Metrics */}
                      <div className="space-y-4 text-left">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">Worker Performance & Metrics</h3>
                        <FormStaticField
                          label="Overall Rating"
                          value={worker.rating != null ? `${parseFloat(String(worker.rating)).toFixed(1)} / 5.0` : "No ratings yet"}
                        />
                        <FormStaticField
                          label="Total Verified Reviews"
                          value={`${worker.rating_count ?? (ratingsData?.data ? ratingsData.data.length : 0)} Reviews`}
                        />
                        <FormStaticField
                          label="Experience"
                          value={worker.experience_years ? `${worker.experience_years} years` : (worker.experience_level ? getExperienceLevelText(worker.experience_level) : "Not specified")}
                        />
                      </div>

                      {/* Right: Salary & Placement */}
                      <div className="space-y-4 text-left">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-2 border-b border-slate-100">Placement & Preferences</h3>
                        <FormStaticField
                          label="Expected Salary"
                          value={worker.expected_salary ? formatCurrency(worker.expected_salary) : (worker.min_salary ? formatCurrency(worker.min_salary) : "Negotiable")}
                        />
                        <FormStaticField
                          label="Primary Skills"
                          value={Array.isArray(worker.skills) && worker.skills.length > 0 ? worker.skills.join(', ') : (Array.isArray(worker.professions) && worker.professions.length > 0 ? worker.professions.join(', ') : "Not specified")}
                        />
                        <FormStaticField
                          label="Preferred Locations"
                          value={
                            Array.isArray(worker.preferred_districts) && worker.preferred_districts.length > 0
                              ? worker.preferred_districts.length >= 20
                                ? `All Districts (Countrywide - ${worker.preferred_districts.length} districts)`
                                : worker.preferred_districts.join(', ')
                              : (worker.district || worker.user?.district || "Any Location")
                          }
                        />
                      </div>
                    </div>

                    {/* Verified Reviews List */}
                    <div className="space-y-4 text-left pt-2 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 font-sans text-left">Verified Employer Feedback</h3>

                      {isRatingsLoading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-20 w-full rounded-[6px]" />
                          <Skeleton className="h-20 w-full rounded-[6px]" />
                        </div>
                      ) : ratingsData?.data && ratingsData.data.length > 0 ? (
                        <div className="space-y-3">
                          {ratingsData.data.map((r) => (
                            <div key={r.id} className="p-4 rounded-[6px] border border-slate-200/80 bg-slate-50/70 space-y-2 text-left">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-3.5 h-3.5 ${star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                        }`}
                                    />
                                  ))}
                                  <span className="text-xs font-bold text-slate-800 ml-1.5">{r.rating}.0</span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium">
                                  {r.created_at ? format(new Date(r.created_at), 'PPP') : 'Recent'}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-800">{r.reviewer_name || 'Employer'}</p>
                              {r.review && <p className="text-xs text-slate-600 leading-relaxed">{r.review}</p>}
                              {r.rating_categories && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {(Object.entries(r.rating_categories) as [string, number | undefined][]).map(([key, val]) =>
                                    val ? (
                                      <Badge key={key} variant="outline" className="text-[10px] capitalize bg-white">
                                        {key.replace(/_/g, ' ')}: {val}/5
                                      </Badge>
                                    ) : null
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 rounded-[6px] border border-slate-200/80 bg-slate-50/50 text-center space-y-2">
                          <Star className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-sm font-semibold text-slate-700">No Employer Reviews Recorded Yet</p>
                          <p className="text-xs text-slate-500">This worker has not received any reviews yet in the database. Click 'Rate Worker' above to leave feedback.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
      </DedicatedFormPage>

      {/* Hiring Dialog */}
      {isHiringDialogOpen && (
        <Dialog open={isHiringDialogOpen} onOpenChange={handleHiringDialogClose}>
          <DialogContent
            className="max-w-xl max-h-[80vh] overflow-y-auto p-0 z-[9999]"
            style={{ borderRadius: "12px" }}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="sticky top-0 bg-background z-10 border-b border-border/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-lg">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {t("employer.workerSearch.workerDetails.hireTitle")
                        .replace("{firstName}", worker?.first_name || "")
                        .replace("{lastName}", worker?.last_name || "")}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {worker?.registration_type === 'company'
                        ? t("employer.workerSearch.workerDetails.companyHireHint")
                        : t("employer.workerSearch.workerDetails.freelanceHireHint")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHiringDialogOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {worker?.registration_type === 'company' && worker?.availability_status === 'available' ? (
                <div className="space-y-6">

                  {/* STEP: FORM */}
                  {hiringStep === 'form' && (
                    <>
                      {/* Salary Card */}
                      <Card style={{ borderRadius: "12px" }}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCardIcon className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold">{t("employer.workerSearch.workerDetails.proposedSalary")}</h3>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="proposed_salary" className="text-xs flex items-center gap-1">
                              {t("employer.workerSearch.workerDetails.proposedSalaryLabel")}
                            </Label>
                            <Input
                              id="proposed_salary"
                              name="proposed_salary"
                              type="number"
                              min="0"
                              step="1000"
                              placeholder={t("employer.workerSearch.workerDetails.proposedSalaryPlaceholder")}
                              value={hiringFormData.proposed_salary}
                              onChange={handleInputChange}
                              className={`h-10 text-sm ${formErrors.proposed_salary ? 'border-red-500' : ''}`}
                            />
                            {formErrors.proposed_salary && (
                              <p className="text-xs text-red-500">{formErrors.proposed_salary}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {t("employer.workerSearch.workerDetails.expectedRange")
                                .replace("{min}", formatCurrency(worker?.min_salary))
                                .replace("{max}", formatCurrency(worker?.max_salary))}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Work Description Card */}
                      <Card style={{ borderRadius: "12px" }}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold">{t("employer.workerSearch.workerDetails.workDescription")}</h3>
                          </div>
                          <div className="space-y-2">
                            <RichTextEditor
                              value={hiringFormData.work_description}
                              onChange={handleRichTextChange}
                              placeholder={t("employer.workerSearch.workerDetails.workDescriptionPlaceholder")}
                              minHeight={200}
                            />
                            {formErrors.work_description && (
                              <p className="text-xs text-red-500">{formErrors.work_description}</p>
                            )}
                            <p className="text-xs text-muted-foreground text-right">
                              {getPlainTextLength(hiringFormData.work_description)}/1000 {t("employer.workerSearch.workerDetails.characters")}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Message Card */}
                      <Card style={{ borderRadius: "12px" }}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold">{t("employer.workerSearch.workerDetails.additionalMessage")}</h3>
                          </div>
                          <div className="space-y-2">
                            <RichTextEditor
                              value={hiringFormData.message}
                              onChange={(value) => setHiringFormData(prev => ({ ...prev, message: value }))}
                              placeholder={t("employer.workerSearch.workerDetails.messagePlaceholder")}
                              minHeight={100}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                              {hiringFormData.message.replace(/<[^>]*>/g, '').length}/500 {t("employer.workerSearch.workerDetails.characters")}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Payment Details Card */}
                      {/* Actions */}
                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsHiringDialogOpen(false)}
                          disabled={createHiringRequest.isPending}
                          className="w-32 h-10 text-sm"
                        >
                          {t("employer.workerSearch.workerDetails.cancel")}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleHiringSubmit}
                          disabled={createHiringRequest.isPending}
                          className="w-40 h-10 text-sm bg-[#FFCC00] hover:bg-[#f0bf00] text-gray-900 font-semibold"
                        >
                          {createHiringRequest.isPending ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Processing...</span>
                            </div>
                          ) : (
                            'Proceed & Pay'
                          )}
                        </Button>
                      </div>


                    </>
                  )}

                  {/* STEP: PAYMENT — MTN phone input */}
                  {hiringStep === 'payment' && paymentData && (
                    <div className="space-y-5">
                      <div className="text-center space-y-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Hiring Fee</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {paymentData.amount.toLocaleString()}
                          <span className="text-base font-normal text-muted-foreground ml-1">{paymentData.currency}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{paymentData.note}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-800 text-left">
                          Enter your MTN Mobile Money number
                        </p>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">🇷🇼</span>
                          <Input
                            type="tel"
                            placeholder="078XXXXXXX"
                            value={mtnPhone}
                            onChange={e => { setMtnPhone(e.target.value.replace(/\D/g, '')); setPayError(''); }}
                            maxLength={10}
                            className="pl-9"
                          />
                        </div>
                        {payError && <p className="text-xs text-destructive">{payError}</p>}
                        <p className="text-xs text-muted-foreground">You will receive a payment prompt on this number</p>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setHiringStep('form')}
                          disabled={isInitiating}
                          className="w-32 h-10 text-sm"
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={handleInitiateMtnPayment}
                          disabled={isInitiating || !mtnPhone || mtnPhone.length < 10}
                          className="flex-1 h-10 text-sm bg-[#FFCC00] hover:bg-[#f0bf00] text-gray-900 font-semibold rounded-none"
                        >
                          {isInitiating
                            ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending...</>
                            : `Pay ${paymentData.amount.toLocaleString()} ${paymentData.currency}`}
                        </Button>
                      </div>

                      <p className="text-xs text-center text-muted-foreground">🔒 Secured by MTN Mobile Money</p>
                    </div>
                  )}

                  {/* STEP: POLLING — spinner */}
                  {hiringStep === 'polling' && (
                    <div className="flex flex-col items-center gap-6 py-8">
                      <div
                        className="animate-spin"
                        style={{
                          width: 80, height: 80,
                          borderRadius: '50%',
                          border: '6px solid #BFDFEF',
                          borderTopColor: '#0078B4',
                          borderLeftColor: '#0078B4',
                        }}
                      />
                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium text-gray-800">
                          Check your phone for a pop-up and confirm
                        </p>
                        <p className="text-xs text-muted-foreground">
                          No pop-up? Dial <strong className="text-gray-700">*182*7*1#</strong> and confirm the payment
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Please don't leave this page.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-none w-48 border-red-400 text-red-500 hover:bg-red-50"
                        onClick={() => { stopPolling(); setHiringStep('payment'); setPayError(''); }}
                      >
                        Cancel Payment
                      </Button>
                    </div>
                  )}

                  {/* STEP: DONE */}
                  {hiringStep === 'done' && (
                    <div className="flex flex-col items-center gap-4 py-8 text-center">
                      <CheckCircle className="h-14 w-14 text-green-500" />
                      <p className="font-semibold text-green-700">Payment Successful!</p>
                      <p className="text-xs text-muted-foreground">Your hiring request has been submitted to the company.</p>
                      <Button onClick={() => setIsHiringDialogOpen(false)} className="mt-2">Close</Button>
                    </div>
                  )}

                </div>
              ) : (
                // freelance / unavailable block — keep existing unchanged
                <div className="space-y-6">
                  <Card style={{ borderRadius: "12px" }}>
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-50 rounded-lg">
                          <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-amber-800 mb-2">
                            {worker?.registration_type !== 'company'
                              ? t("employer.workerSearch.workerDetails.freelanceTitle")
                              : worker?.availability_status !== 'available'
                                ? t("employer.workerSearch.workerDetails.workerNotAvailable")
                                : ""}
                          </h4>
                          <p className="text-sm text-amber-700 mb-4">
                            {worker?.registration_type !== 'company'
                              ? t("employer.workerSearch.workerDetails.freelanceMessage")
                              : worker?.availability_status !== 'available'
                                ? t("employer.workerSearch.workerDetails.unavailableMessage")
                                : ""}
                          </p>
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsHiringDialogOpen(false)}
                              className="h-10 text-sm"
                            >
                              {t("employer.workerSearch.workerDetails.close")}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                setIsHiringDialogOpen(false);
                                setActiveTab("contact");
                              }}
                              className="h-10 text-sm"
                            >
                              {t("employer.workerSearch.workerDetails.viewContact")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      {isRatingDialogOpen && worker && (
        <Dialog
          open={isRatingDialogOpen}
          onOpenChange={(open) => {
            setIsRatingDialogOpen(open);
            if (!open) {
              setRatingValue(0);
              setHoverRating(0);
              setRatingReview('');
              setCategoryRatings({ punctuality: 0, work_quality: 0, communication: 0, professionalism: 0 });
            }
          }}
        >
          <DialogContent className="max-w-md z-[9999]" style={{ borderRadius: "12px" }}>
            <DialogHeader>
              <DialogTitle>{t("employer.workerSearch.workerDetails.rateWorkerTitle")}</DialogTitle>
              <DialogDescription>
                {t("employer.workerSearch.workerDetails.rateWorkerDescription")
                  .replace("{firstName}", worker.first_name || "")
                  .replace("{lastName}", worker.last_name || "")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingValue(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${star <= (hoverRating || ratingValue)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  </button>
                ))}
              </div>

              <div className="space-y-2 border-t border-b py-3">
                {(['punctuality', 'work_quality', 'communication', 'professionalism'] as const).map((cat) => (
                  <div key={cat} className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {t(`employer.workerSearch.workerDetails.rateWorkerCategory.${cat}`)}
                    </p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="cursor-pointer"
                          onClick={() =>
                            setCategoryRatings((prev) => ({
                              ...prev,
                              [cat]: prev[cat] === star ? 0 : star,
                            }))
                          }
                        >
                          <Star
                            className={`w-4 h-4 transition-colors ${star <= categoryRatings[cat]
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating-review" className="text-xs">
                  {t("employer.workerSearch.workerDetails.rateWorkerReviewLabel")}
                </Label>
                <textarea
                  id="rating-review"
                  value={ratingReview}
                  onChange={(e) => setRatingReview(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder={t("employer.workerSearch.workerDetails.rateWorkerReviewPlaceholder")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsRatingDialogOpen(false)}
                disabled={rateWorker.isPending}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-[6px]"
              >
                {t("employer.workerSearch.workerDetails.cancel")}
              </Button>
              <Button
                onClick={handleRateWorkerSubmit}
                disabled={ratingValue === 0 || rateWorker.isPending}
                className="bg-[#0073bb] hover:bg-[#005f9e] disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium rounded-[6px] cursor-pointer"
              >
                {rateWorker.isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("employer.workerSearch.workerDetails.submitting")}</span>
                  </div>
                ) : (
                  t("employer.workerSearch.workerDetails.submitRating")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {isConsentModalOpen && (
        <Dialog
          open={isConsentModalOpen}
          onOpenChange={(open) => {
            setIsConsentModalOpen(open);
            if (!open) setHasReadConsent(true);
          }}
        >
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto z-[9999]" style={{ borderRadius: "6px" }}>
            <DialogHeader>
              <DialogTitle className="text-base">Ihirwe — Registration Consent & Disclaimer</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs text-gray-800 leading-relaxed">
              <p>
                <strong>Please read this carefully before completing your registration on the Ihirwe platform.</strong>
              </p>
              <p>
                By registering as a user of Ihirwe ("the Platform," "we," "us," "our"), whether as an Employer or as a
                House Helper / Restaurant Bar Worker ("Worker"), you acknowledge, consent to, and agree to the
                following terms.
              </p>

              <div>
                <p className="font-bold">1. Who This Applies To</p>
                <p>This disclaimer applies to all individuals registering on Ihirwe, including:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Employers seeking to source, allocate, and manage domestic or restaurant/bar workers</li>
                  <li>Workers (house helpers and restaurant/bar staff) creating a profile to be sourced by employers</li>
                  <li>Company registering their workers, under their management</li>
                </ul>
              </div>

              <div>
                <p className="font-bold">2. Information We Collect</p>
                <p>Depending on your role, we may collect:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li><strong>Identity information:</strong> full name, national ID number, phone number, address, photo</li>
                  <li><strong>Profile information:</strong> skills, work experience, availability, training/certifications</li>
                  <li><strong>Performance data:</strong> ratings, reviews, and feedback submitted by employers or workers</li>
                  <li><strong>Financial information:</strong> payment details, transaction history, savings plan and social security contributions, insurance enrollment</li>
                  <li><strong>Incident/conduct records:</strong> reports of misconduct, disputes, or violations connected to your account</li>
                  <li><strong>Referral information:</strong> for workers, the local government leader or Rwanda Youth Volunteer who supported your registration</li>
                </ul>
              </div>

              <div>
                <p className="font-bold">3. How We Use Your Information</p>
                <p>Your information is used to:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Verify your identity and create your profile on the Platform</li>
                  <li>Match Workers with Employers based on criteria such as skills, ratings, and availability</li>
                  <li>Process payments, savings contributions, insurance, and social security benefits</li>
                  <li>Enable performance tracking, ratings, and reviews between Employers and Workers</li>
                  <li>Maintain records for accountability, dispute resolution, and safety purposes</li>
                  <li>Support law enforcement and relevant authorities in tracking misconduct or legal violations connected to platform activity</li>
                </ul>
              </div>

              <div>
                <p className="font-bold">4. Sharing of Information</p>
                <p>
                  Because Ihirwe is built around trust, accountability, and safety for both parties, your
                  information may be shared with:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Employers or Workers, as relevant, to enable informed hiring and work decisions (e.g., profile, ratings, verified status)</li>
                  <li>Law enforcement and local authorities, specifically for tracking, investigating, or addressing misconduct or legal violations, as described in the Platform's security features</li>
                  <li>Payment, insurance, and social security partners, to process financial transactions and benefits</li>
                  <li>Other parties where required by Rwandan law</li>
                </ul>
                <p className="mt-1">We do not sell your personal information for marketing purposes.</p>
              </div>

              <div>
                <p className="font-bold">5. Worker-Specific Consent (Security & Oversight)</p>
                <p>By registering as a Worker, you specifically acknowledge and consent that:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Your profile, work history, and any misconduct or incident reports may be visible to prospective Employers</li>
                  <li>Records related to your conduct may be accessed by law enforcement or local authorities as part of the Platform's security and oversight function</li>
                  <li>Your registration may involve verification support from a local government leader or Rwanda Youth Volunteer, who may confirm or provide information about your identity or background</li>
                </ul>
              </div>

              <div>
                <p className="font-bold">6. Employer-Specific Consent</p>
                <p>By registering as an Employer, you specifically acknowledge and consent that:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Reviews and reports you submit about a Worker's performance or conduct may be visible to the Worker and other prospective Employers</li>
                  <li>Your payment activity and booking history may be recorded for transparency and dispute resolution</li>
                  <li>Misuse of the Platform (e.g., false reporting, non-payment) may itself be recorded and shared with authorities</li>
                </ul>
              </div>

              <div>
                <p className="font-bold">7. Data Storage & Security</p>
                <p>
                  We apply reasonable technical and organizational safeguards to protect your data from unauthorized
                  access, alteration, or loss. However, no digital platform can guarantee absolute security, and you
                  share information at your own informed discretion.
                </p>
              </div>

              <div>
                <p className="font-bold">8. Your Rights</p>
                <p>You have the right to:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your account and associated data, subject to legal record-keeping requirements (e.g., financial and security records that must be retained)</li>
                  <li>Withdraw consent, understanding this may limit or prevent your use of certain Platform features (e.g., payments, ratings, security tracking)</li>
                </ul>
                <p className="mt-1">
                  To exercise these rights, contact us at{" "}
                  <a href="mailto:info@benofinance.rw" className="text-blue-600 underline">
                    info@benofinance.rw
                  </a>
                </p>
              </div>

              <div>
                <p className="font-bold">9. Age & Eligibility</p>
                <p>
                  By registering, you confirm that you are at least <strong>18 years old</strong> (or the legal
                  working age in Rwanda) and legally eligible to work or engage employers, as applicable to your
                  role.
                </p>
              </div>

              <div>
                <p className="font-bold">10. Compliance with Rwandan Law</p>
                <p>
                  This Platform operates in accordance with Rwanda's applicable laws on data protection and privacy,
                  including Law N° 058/2021 of 13/10/2021 relating to the protection of personal data and privacy.
                  [Confirm this reference with legal counsel before publishing.]
                </p>
              </div>

              <div>
                <p className="font-bold">11. Changes to This Disclaimer</p>
                <p>
                  Ihirwe may update this consent notice periodically. Continued use of the Platform after changes
                  constitutes acceptance of the revised terms.
                </p>
              </div>

              <div>
                <p className="font-bold">12. Confirmation of Consent</p>
                <p>
                  By clicking <strong>"I Agree" / "Complete Registration,"</strong> you confirm that you:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Have read and understood this disclaimer in full</li>
                  <li>Consent to the collection, use, storage, and sharing of your information as described above</li>
                  <li>Understand the specific data-sharing implications relevant to your role (Employer or Worker)</li>
                </ul>
              </div>

              <hr className="my-4" />

              <div className="text-center">
                <p className="font-bold text-red-600 text-sm">
                  Disclaimer Before Viewing a Domestic Worker's Contact Information
                </p>
              </div>

              <div>
                <p><strong>Pop-up (</strong>Before You Continue)</p>
                <p className="mt-1">
                  The contact information of this worker is provided solely for recruitment and employment
                  purposes.
                </p>
                <p className="mt-1">By proceeding, you agree that you will <strong>not</strong>:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Use this contact information for any purpose unrelated to hiring or managing this worker</li>
                  <li>Harass, threaten, or send unsolicited communication to the worker</li>
                  <li>Share, forward, or resell this contact information to any third party</li>
                </ul>
                <p className="italic font-medium mt-2">
                  Misuse of this information is prohibited and may result in account suspension, removal from the
                  platform, and legal action in accordance with the laws of Rwanda.
                </p>
              </div>

              <div>
                <p className="font-bold text-red-600">A few implementation notes worth considering:</p>
                <ol className="list-decimal pl-5 space-y-2 mt-1">
                  <li>
                    <strong>Log the consent event</strong> — record employer ID, worker ID, timestamp, and consent
                    acknowledgment each time contact info is viewed. This creates an audit trail if misuse is ever
                    reported, and directly supports the "security tracking" feature in your concept note.
                  </li>
                  <li>
                    <strong>Re-trigger per worker, not just once</strong> — since this gates access to a specific
                    worker's contact info, consider showing it the first time an employer views each worker's
                    number, not just once globally. Otherwise it becomes a one-time formality that's easy to forget.
                  </li>
                  <li>
                    <strong>Tie it to your law enforcement records</strong> — since misconduct reports feed into your
                    security tracking feature, this consent log becomes evidence if a worker later reports
                    harassment or misuse tied to a specific contact reveal.
                  </li>
                </ol>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  setHasReadConsent(true);
                  setIsConsentModalOpen(false);
                }}
                className="bg-[#FFCC00] hover:bg-[#f0bf00] text-gray-900 font-semibold"
              >
                I've Read This
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default WorkerDetailsModal;