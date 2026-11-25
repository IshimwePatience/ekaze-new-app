import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  MoreVertical,
  X,
  CreditCard,
  Loader2,
  AlertCircle,
  Edit,
  Trash2,
  RotateCcw,
  UserX,
  UserCheck,
  Clock,
  MessageSquare,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { useCompanyWorkers } from "@/hooks/useWorkers";
import { useGenerateBusinessCards, useCreateNewWorker } from "@/hooks/useWorkerRegistration";
import WorkerDetailsModal from "./WorkerDetailsModal";
import CompanyRegisterWorkerPage from "./CompanyRegisterWorkerPage";
import ImportWorkersModal from "./ImportWorkersModal";
import EditWorkerModal from "./EditWorkerModal";
import CompanyWorkerRatingsPage from "./CompanyWorkerRatingsPage";
import { companyApi } from "@/api/companyService";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { NewWorkerRegistrationPayload } from "@/types/company.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { CustomDropdown } from "@/components/ui/custom-dropdown";

// ── Types ──────────────────────────────────────────────────────────────────
interface WorkerUser {
  phone?: string;
  email?: string;
  profile_photo?: string;
  province?: string;
  district?: string;
  sector?: string;
  created_at?: string;
  updated_at?: string;
}

interface Worker {
  id: number;
  first_name: string;
  last_name: string;
  experience_level: string;
  availability_status: string;
  average_rating?: string | number;
  total_ratings?: number;
  total_employments?: number;
  nida_verified?: boolean;
  user?: WorkerUser;
  name?: string;
  full_name?: string;
  is_suspended?: boolean;
  status?: string;
  suspended_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ──────────────────────────────────────────────────────────────────────────
const WorkersContent = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Tabs: Current vs Suspended
  const [activeTab, setActiveTab] = useState<"current" | "suspended">("current");

  // Worker action modals & dialogs
  const [workerToEdit, setWorkerToEdit] = useState<any | null>(null);
  const [workerToRate, setWorkerToRate] = useState<any | null>(null);
  const [workerToSuspend, setWorkerToSuspend] = useState<any | null>(null);
  const [workerToReactivate, setWorkerToReactivate] = useState<any | null>(null);
  const [workerToDelete, setWorkerToDelete] = useState<any | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const createWorkerMutation = useCreateNewWorker();
  const generateCardsMutation = useGenerateBusinessCards();

  const { data, isLoading, isError, refetch } = useCompanyWorkers(currentPage, {
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(searchTerm && { search: searchTerm }),
    per_page: perPage,
  });

  const handleConfirmSuspend = async () => {
    if (!workerToSuspend) return;
    try {
      setIsActionPending(true);
      await companyApi.suspendCompanyWorker(workerToSuspend.id);
      toast({
        variant: "success",
        title: "Worker Suspended",
        description: `${workerToSuspend.user?.name || workerToSuspend.name || "Worker"} has been suspended and moved to Suspended tab.`,
      });
      setWorkerToSuspend(null);
      refetch();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Suspension Failed",
        description: err?.response?.data?.message || err?.message || "Failed to suspend worker",
      });
    } finally {
      setIsActionPending(false);
    }
  };

  const handleConfirmReactivate = async () => {
    if (!workerToReactivate) return;
    try {
      setIsActionPending(true);
      await companyApi.reactivateCompanyWorker(workerToReactivate.id);
      toast({
        variant: "success",
        title: "Worker Reactivated",
        description: `${workerToReactivate.user?.name || workerToReactivate.name || "Worker"} has been brought back to Current.`,
      });
      setWorkerToReactivate(null);
      refetch();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Reactivation Failed",
        description: err?.response?.data?.message || err?.message || "Failed to reactivate worker",
      });
    } finally {
      setIsActionPending(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!workerToDelete) return;
    try {
      setIsActionPending(true);
      await companyApi.deleteCompanyWorker(workerToDelete.id);
      toast({
        variant: "success",
        title: "Worker Removed",
        description: `${workerToDelete.user?.name || workerToDelete.name || "Worker"} has been deleted from your company roster.`,
      });
      setWorkerToDelete(null);
      refetch();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: err?.response?.data?.message || err?.message || "Failed to delete worker",
      });
    } finally {
      setIsActionPending(false);
    }
  };

  useEffect(() => {
    const openWorkerFromStorage = () => {
      const workerId = localStorage.getItem("company_open_worker_id");
      if (workerId) {
        setSelectedWorkerId(Number(workerId));
        setIsModalOpen(true);
        localStorage.removeItem("company_open_worker_id");
      }
    };

    const timer = setTimeout(openWorkerFromStorage, 100);
    window.addEventListener("company-switch-to-workers", openWorkerFromStorage);
    window.addEventListener("company-open-worker", openWorkerFromStorage);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("company-switch-to-workers", openWorkerFromStorage);
      window.removeEventListener("company-open-worker", openWorkerFromStorage);
    };
  }, []);

  const rawWorkers: Worker[] = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const isWorkerSuspended = (worker: Worker) => {
    return Boolean(
      (worker as any).is_suspended === true ||
      worker.availability_status === "suspended" ||
      (worker as any).status === "suspended" ||
      worker.user?.status === "suspended"
    );
  };

  const currentWorkersCount = rawWorkers.filter((w) => !isWorkerSuspended(w)).length;
  const suspendedWorkersCount = rawWorkers.filter((w) => isWorkerSuspended(w)).length;

  const tabWorkers = rawWorkers.filter((worker) => {
    if (activeTab === "current") {
      return !isWorkerSuspended(worker);
    } else {
      return isWorkerSuspended(worker);
    }
  });

  const filteredWorkers = tabWorkers.filter((worker) => {
    if (experienceFilter !== "all") {
      const exp = (worker.experience_level || "").toLowerCase();
      if (exp !== experienceFilter.toLowerCase()) return false;
    }
    return true;
  });

  const paginationData = data?.data;
  const pagination = paginationData && typeof paginationData === "object" && "total" in paginationData
    ? {
        current_page: paginationData.current_page || currentPage,
        last_page: paginationData.last_page || 1,
        per_page: paginationData.per_page || perPage,
        total: paginationData.total ?? filteredWorkers.length,
      }
    : {
        current_page: currentPage,
        last_page: 1,
        per_page: perPage,
        total: filteredWorkers.length,
      };

  // ── Selection helpers ──────────────────────────────────────────────
  const allFilteredIds = filteredWorkers.map((w) => w.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(allFilteredIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleOne = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Pagination handlers ────────────────────────────────────────────
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds(new Set());
  };

  const handlePerPageChange = (val: string) => {
    setPerPage(parseInt(val));
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  // ── Generate cards (MTN MoMo fee per person) ───────────────────────
  const [cardPayment, setCardPayment] = useState<{
    workerIds: number[];
    feePerCard: number;
    unpaidCount: number;
    totalAmount: number;
  } | null>(null);
  const [cardPayPhone, setCardPayPhone] = useState("");
  const [cardPayStatus, setCardPayStatus] = useState<"idle" | "sending" | "waiting" | "failed">("idle");
  const [cardPayMessage, setCardPayMessage] = useState("");

  const openPrintCards = (ids: number[], message?: string) => {
    toast({
      variant: "success",
      title: "Success!",
      description: message || t("company.workersContent.cardsGenerated").replace("{count}", `${ids.length}`),
    });
    window.open(`/company/workers/print-cards?ids=${ids.join(',')}`, "_blank");
  };

  const showCardError = (error: unknown) => {
    const err = error as { response?: { data?: { message?: string } } };
    toast({
      variant: "destructive",
      title: "Error",
      description: err?.response?.data?.message || t("company.workersContent.cardsGenerationFailed"),
    });
  };

  const requestCards = (ids: number[], clearSelection: boolean) => {
    if (ids.length === 0) return;
    generateCardsMutation.mutate(ids, {
      onSuccess: (response) => {
        if (response?.requires_payment) {
          setCardPayStatus("idle");
          setCardPayMessage("");
          setCardPayment({
            workerIds: ids,
            feePerCard: Number(response.data?.fee_per_card || 0),
            unpaidCount: Number(response.data?.unpaid_count || ids.length),
            totalAmount: Number(response.data?.total_amount || 0),
          });
          return;
        }
        if (response?.data?.pdf_url) {
          openPrintCards(ids, response.message);
          if (clearSelection) setSelectedIds(new Set());
        } else {
          toast({ variant: "destructive", title: "Error", description: t("company.workersContent.noPdfUrl") });
        }
      },
      onError: showCardError,
    });
  };

  const handleGenerateCards = () => requestCards(Array.from(selectedIds), true);
  const handleGenerateSingleCard = (id: number) => requestCards([id], false);

  const pollCardPayment = async (referenceId: string, ids: number[]) => {
    const maxAttempts = 40; // ~2 minutes
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const res = await companyApi.checkCardPaymentStatus(referenceId);
        const status = String(res?.payment_status || res?.status || "").toUpperCase();
        if (status === "SUCCESSFUL") {
          // Workers are now marked paid -> generate without a new charge
          const gen = await companyApi.generateBusinessCards({ worker_ids: ids });
          setCardPayment(null);
          setCardPayStatus("idle");
          setSelectedIds(new Set());
          refetch();
          if (gen?.data?.pdf_url) openPrintCards(ids, "Payment confirmed via MTN MoMo. Cards generated.");
          return;
        }
        if (status === "FAILED") {
          setCardPayStatus("failed");
          setCardPayMessage(res?.reason ? `MTN MoMo payment failed: ${res.reason}` : "MTN MoMo payment failed or was rejected.");
          return;
        }
      } catch {
        // keep polling on transient errors
      }
    }
    setCardPayStatus("failed");
    setCardPayMessage("Payment not confirmed in time. If you approved it, try generating again — you won't be charged twice for paid cards.");
  };

  const handlePayForCards = () => {
    if (!cardPayment) return;
    const phone = cardPayPhone.replace(/\s+/g, "");
    if (!/^(\+?250|0)?7[89]\d{7}$/.test(phone)) {
      setCardPayStatus("failed");
      setCardPayMessage("Enter a valid MTN Rwanda number (078 / 079).");
      return;
    }
    setCardPayStatus("sending");
    setCardPayMessage("");
    generateCardsMutation.mutate(
      { workerIds: cardPayment.workerIds, payPhone: phone },
      {
        onSuccess: (response) => {
          const ref = response?.data?.reference_id;
          if (response?.payment_pending && ref) {
            setCardPayStatus("waiting");
            setCardPayMessage(response.message || "Approve the MTN MoMo prompt on your phone (*182*7*1#).");
            pollCardPayment(ref, cardPayment.workerIds);
          } else if (response?.data?.pdf_url) {
            setCardPayment(null);
            openPrintCards(cardPayment.workerIds, response.message);
          } else {
            setCardPayStatus("failed");
            setCardPayMessage(response?.message || "Could not start MTN MoMo payment.");
          }
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          setCardPayStatus("failed");
          setCardPayMessage(err?.response?.data?.message || "Could not start MTN MoMo payment.");
        },
      }
    );
  };

  // ── Other handlers ─────────────────────────────────────────────────
  const handleViewWorker = (workerId: number) => {
    setSelectedWorkerId(workerId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedWorkerId(null);
    setIsModalOpen(false);
  };

  const [isUpdatingWorker, setIsUpdatingWorker] = useState(false);

  const handleUpdateWorkerSubmit = async (formData: NewWorkerRegistrationPayload) => {
    if (!workerToEdit?.id) return;
    setIsUpdatingWorker(true);
    try {
      const pastExperiencesRaw = (formData as any).past_experiences || (formData as any).work_experiences;
      const pastExperiencesStr = Array.isArray(pastExperiencesRaw) ? JSON.stringify(pastExperiencesRaw) : pastExperiencesRaw;

      await companyApi.updateWorker(workerToEdit.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: formData.email,
        password: (formData as any).password,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        national_id: formData.national_id,
        passport_number: (formData as any).passport_number,
        registration_document_type: (formData as any).registration_document_type,
        photo: (formData as any).photo,
        profile_photo: (formData as any).photo,
        education_level: (formData as any).education_level,
        education_option: (formData as any).education_option,
        education_field: (formData as any).education_field,
        driving_licence_type: (formData as any).driving_licence_type,
        driving_licence_number: (formData as any).driving_licence_number,
        driving_licence_expiry: (formData as any).driving_licence_expiry,
        past_experiences: pastExperiencesStr,
        work_experiences: pastExperiencesStr,
        district: formData.district,
        sector: formData.sector,
        cell: formData.cell,
        village: formData.village,
        address: formData.address,
        province: (formData as any).province,
        experience_level: formData.experience_level,
        experience_years: formData.experience_years,
        min_salary: formData.min_salary,
        max_salary: formData.max_salary,
        has_insurance: formData.has_insurance,
        insurance_type: (formData as any).insurance_type,
        insurance_provider: formData.insurance_provider,
        insurance_number: formData.insurance_number,
        marital_status: (formData as any).marital_status,
        bio: (formData as any).bio,
        referee_name: (formData as any).referee_name,
        referee_phone: (formData as any).referee_phone,
        referee_relationship: (formData as any).referee_relationship,
        special_skills: (formData as any).special_skills,
      } as any);
      toast({ variant: "success", title: "Success!", description: "Driver details updated successfully." });
      setWorkerToEdit(null);
      refetch();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err?.response?.data?.message || "Failed to update driver details.",
      });
    } finally {
      setIsUpdatingWorker(false);
    }
  };

  const handleWorkerSubmit = (formData: NewWorkerRegistrationPayload) => {
    createWorkerMutation.mutate(formData, {
      onSuccess: (response) => {
        if (response.payment_required) {
          toast({ variant: "success", title: "Success!", description: response.message });
          toast({
            title: "Payment Required",
            description: t("company.workersContent.transactionInfo")
              .replace("{id}", response.data.transaction_id)
              .replace("{amount}", String(response.data.amount)),
          });
          setIsAddWorkerModalOpen(false);
        } else {
          toast({ variant: "success", title: "Success!", description: t("company.workersContent.workerRegistered") });
          setIsAddWorkerModalOpen(false);
          refetch();
        }
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]>; error?: string } } };
        const data = err?.response?.data;
        const errors = data?.errors;
        const message = data?.message || t("company.workersContent.workerRegistrationFailed");
        const detail = data?.error;

        const description = errors
          ? Object.entries(errors)
              .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
              .join("\n")
          : detail
          ? `${message}: ${detail}`
          : message;

        toast({ variant: "destructive", title: "Registration Failed", description });
      },
    });
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      available: t("company.workersContent.available_status") || "Available",
      hired: t("company.workersContent.hired_status") || "Hired",
      unavailable: t("company.workersContent.unavailable_status") || "Unavailable",
      active: "Active",
    };
    return statusMap[status] || status;
  };

  const isCardGenerated = (worker: any) => {
    return Boolean(worker.card_paid || worker.card_paid_at);
  };

  const getExperienceLevelText = (level: string) => {
    const levelMap: Record<string, string> = {
      beginner: t("company.workersContent.beginner") || "Beginner",
      intermediate: t("company.workersContent.intermediate") || "Intermediate",
      expert: t("company.workersContent.expert") || "Expert",
    };
    return levelMap[level] || level;
  };

  if (workerToEdit) {
    return (
      <CompanyRegisterWorkerPage
        initialWorker={workerToEdit}
        onBack={() => setWorkerToEdit(null)}
        onSubmit={handleUpdateWorkerSubmit}
        isLoading={isUpdatingWorker}
      />
    );
  }

  if (isAddWorkerModalOpen) {
    return (
      <CompanyRegisterWorkerPage
        onBack={() => setIsAddWorkerModalOpen(false)}
        onSubmit={handleWorkerSubmit}
        isLoading={createWorkerMutation.isPending}
      />
    );
  }

  if (workerToRate) {
    return (
      <CompanyWorkerRatingsPage
        worker={workerToRate}
        onBack={() => setWorkerToRate(null)}
        onRatingSubmitted={() => refetch()}
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-white space-y-0">
      {/* Top Header matching User Management */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb title="Drivers Management">
          <div className="flex items-center gap-2">
            {/* Import Excel */}
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-transparent border-0 px-2 py-1 font-medium"
              onClick={() => setIsImportModalOpen(true)}
            >
              Import Excel
            </button>

            {/* Add Driver */}
            <Button
              size="sm"
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
              onClick={() => setIsAddWorkerModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Driver</span>
            </Button>
          </div>
        </PageHeaderBreadcrumb>
      </div>

      {/* Two Tabs: Current & Suspended (matching Hiring Requests style) */}
      <div className="w-full bg-white border-b border-slate-200 flex items-center gap-8 px-2 sm:px-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab("current");
            setCurrentPage(1);
            setSelectedIds(new Set());
          }}
          className={`pb-3 pt-2.5 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 border-0 bg-transparent ${
            activeTab === "current"
              ? "!border-[#2478b8] text-[#2478b8]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Current</span>
          {currentWorkersCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
              {currentWorkersCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("suspended");
            setCurrentPage(1);
            setSelectedIds(new Set());
          }}
          className={`pb-3 pt-2.5 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 border-0 bg-transparent ${
            activeTab === "suspended"
              ? "!border-[#2478b8] text-[#2478b8]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Suspended</span>
          {suspendedWorkersCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
              {suspendedWorkersCount}
            </span>
          )}
        </button>
      </div>

      {/* Main YouTube Studio Styled Content Layout */}
      <div className="w-full bg-white">
        {/* Studio Filter Bar or Contextual Bulk Action Bar */}
        {selectedIds.size === 0 ? (
          <StudioFilterBar
            categories={[
              {
                id: "status",
                label: "Status",
                options: [
                  { value: "all", label: "All Status" },
                  { value: "available", label: "Available" },
                  { value: "hired", label: "Hired" },
                  { value: "unavailable", label: "Unavailable" },
                ],
              },
              {
                id: "experience",
                label: "Experience",
                options: [
                  { value: "all", label: "All Experience" },
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "expert", label: "Expert" },
                ],
              },
            ]}
            activeFilters={{
              status: statusFilter,
              experience: experienceFilter,
            }}
            onFilterChange={(catId, val) => {
              if (catId === "status") setStatusFilter(val);
              if (catId === "experience") setExperienceFilter(val);
              setCurrentPage(1);
            }}
            searchTerm={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            onClearAll={() => {
              setSearchTerm("");
              setStatusFilter("all");
              experienceFilter !== "all" && setExperienceFilter("all");
              setCurrentPage(1);
            }}
          />
        ) : (
          /* Contextual Bulk Action Bar */
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold">
                {selectedIds.size} selected
              </span>
              <button
                onClick={() => handleSelectAll(selectedIds.size < filteredWorkers.length)}
                className="text-xs text-[#38BDF8] hover:underline font-medium ml-1 cursor-pointer"
              >
                ({selectedIds.size === filteredWorkers.length ? "Deselect all" : "Select all"})
              </button>
            </div>

            <div className="flex items-center gap-2">
              {(() => {
                const selectedWorkers = filteredWorkers.filter((w) => selectedIds.has(w.id));
                const allSelectedCardsGenerated = selectedWorkers.length > 0 && selectedWorkers.every(isCardGenerated);
                return (
                  <Button
                    size="sm"
                    onClick={allSelectedCardsGenerated ? () => openPrintCards(Array.from(selectedIds)) : handleGenerateCards}
                    disabled={generateCardsMutation.isPending}
                    className="h-7 text-xs bg-[#2478b8] hover:bg-[#1b6296] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    {generateCardsMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {allSelectedCardsGenerated ? "Get Business Cards" : "Generate Business Cards"} ({selectedIds.size})
                    </span>
                  </Button>
                );
              })()}
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="py-6 space-y-3">
            <Skeleton className="h-9 w-full rounded-none" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-none" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900">{t("company.workersContent.loadError") || "Error loading workers"}</h3>
            <p className="text-xs text-slate-500 mt-1">{t("company.workersContent.loadErrorHint") || "Please try refreshing the page."}</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          /* Empty State matching User Management */
          <CharacterIllustration
            type="users"
            title={
              activeTab === "suspended"
                ? "No suspended drivers"
                : "No drivers found"
            }
            description={
              searchTerm || statusFilter !== "all" || experienceFilter !== "all"
                ? "No drivers match your search and filter criteria."
                : activeTab === "suspended"
                ? "There are currently no suspended drivers in your company directory."
                : "No registered drivers found in your company directory yet."
            }
            action={
              searchTerm || statusFilter !== "all" || experienceFilter !== "all" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setExperienceFilter("all");
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border-slate-300 font-medium text-xs h-9 cursor-pointer"
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          /* Table matching User Management */
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[750px] border-collapse">
              <TableHeader className="bg-transparent border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="w-10 pl-2">
                    <Checkbox
                      checked={filteredWorkers.length > 0 && selectedIds.size === filteredWorkers.length}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      className="border-slate-400 rounded-sm"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">
                    Driver
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">
                    Email
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">
                    {t("company.workersContent.contact") || "Contact"}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">
                    {t("company.workersContent.experience") || "Experience"}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">
                    Card Generated
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans whitespace-nowrap">
                    {activeTab === "suspended" ? "Date Suspended" : "Date Registered"}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">
                    Verified
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">
                    Location
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans text-right pr-2">
                    {t("company.workersContent.actions") || "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => {
                  const isSelected = selectedIds.has(worker.id);
                  const rawName = worker.user?.name || worker.name || `${worker.first_name || ""} ${worker.last_name || ""}`.trim();
                  const cleanName = rawName.replace(/\s*\(Worker\)\s*/gi, "").trim();
                  const fullName = cleanName || (worker.user?.email ? worker.user.email.split("@")[0] : "Worker");

                  return (
                    <TableRow
                      key={worker.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <TableCell className="pl-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(worker.id)}
                          className="border-slate-400 rounded-sm"
                        />
                      </TableCell>

                      {/* User Avatar + Name */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200">
                            <AvatarImage src={worker.user?.profile_photo || undefined} />
                            <AvatarFallback className="p-0 bg-transparent border-none">
                              <DefaultAvatarSVG className="w-full h-full" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 font-sans">{fullName}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="py-3">
                        <p className="text-xs font-normal text-slate-700 font-sans">
                          {worker.user?.email || "—"}
                        </p>
                      </TableCell>

                      {/* Contact */}
                      <TableCell className="py-3">
                        <p className="text-xs font-normal text-slate-700 font-sans">
                          {worker.user?.phone || "—"}
                        </p>
                      </TableCell>

                      {/* Experience */}
                      <TableCell className="py-3">
                        <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                          {getExperienceLevelText(worker.experience_level || "Worker")}
                        </span>
                      </TableCell>

                      {/* Card Generated */}
                      <TableCell className="py-3 whitespace-nowrap">
                        <span className="text-xs font-normal text-slate-700 font-sans">
                          {isCardGenerated(worker) ? "Yes" : "No"}
                        </span>
                      </TableCell>

                      {/* Date (Registered or Suspended) */}
                      <TableCell className="py-3 whitespace-nowrap">
                        <span className="text-xs font-normal text-slate-700 font-sans">
                          {isWorkerSuspended(worker)
                            ? format(new Date(worker.suspended_at || worker.updated_at || Date.now()), "MMM dd, yyyy 'at' hh:mm a")
                            : format(new Date(worker.created_at || Date.now()), "MMM dd, yyyy 'at' hh:mm a")}
                        </span>
                      </TableCell>

                      {/* Verified */}
                      <TableCell className="py-3">
                        {worker.nida_verified ? (
                          <div className="flex items-center gap-1 text-slate-900 font-semibold text-xs font-sans">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                            <span>Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-500 font-semibold text-xs font-sans">
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Unverified</span>
                          </div>
                        )}
                      </TableCell>

                      {/* Location */}
                      <TableCell className="text-xs text-slate-900 font-semibold font-sans py-3">
                        {worker.user?.district || worker.user?.province || worker.user?.sector || "N/A"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-2 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <CustomDropdown
                            widthClass="w-52"
                            trigger={
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            }
                            items={[
                              {
                                label: "Rate Worker",
                                onClick: () => setWorkerToRate(worker),
                              },
                              {
                                label: isCardGenerated(worker) ? "Get Card" : "Generate Card",
                                onClick: () => {
                                  if (isCardGenerated(worker)) {
                                    openPrintCards([worker.id]);
                                  } else {
                                    handleGenerateSingleCard(worker.id);
                                  }
                                },
                              },
                              {
                                label: "Edit Worker",
                                onClick: () => setWorkerToEdit(worker),
                              },
                              ...(activeTab === "current"
                                ? [
                                    {
                                      label: "Suspend Worker",
                                      onClick: () => setWorkerToSuspend(worker),
                                    },
                                  ]
                                : [
                                    {
                                      label: "Bring Back to Current",
                                      onClick: () => setWorkerToReactivate(worker),
                                    },
                                  ]),
                              {
                                label: "Delete Worker",
                                onClick: () => setWorkerToDelete(worker),
                              },
                            ]}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination matching User Management */}
        {pagination && pagination.total > 0 && (
          <YouTubeStudioPagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            perPage={perPage}
            total={pagination.total}
            onPageChange={handlePageChange}
            onPerPageChange={(val) => handlePerPageChange(val.toString())}
          />
        )}
      </div>

      {/* Worker Details Modal */}
      <WorkerDetailsModal
        workerId={selectedWorkerId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Import Workers Modal */}
      <ImportWorkersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          refetch();
          toast({
            variant: "success",
            title: "Import Successful",
            description: t("company.workersContent.workersImported") || "Workers imported successfully",
          });
        }}
      />

      {/* Edit Worker Modal */}
      <EditWorkerModal
        worker={workerToEdit}
        isOpen={!!workerToEdit}
        onClose={() => setWorkerToEdit(null)}
        onSuccess={() => refetch()}
      />

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={!!workerToSuspend} onOpenChange={(open) => !open && setWorkerToSuspend(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Suspend Worker?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to suspend{" "}
              <span className="font-semibold text-slate-800">
                {workerToSuspend?.user?.name || workerToSuspend?.name || `${workerToSuspend?.first_name || ""} ${workerToSuspend?.last_name || ""}`.trim() || "this worker"}
              </span>
              ? Their account will be restricted and moved to the Suspended tab. When logging in, they will see that their account is suspended by your company.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel disabled={isActionPending} className="h-8 text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isActionPending}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmSuspend();
              }}
              className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
            >
              {isActionPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Suspend Worker</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bring Back to Current Confirmation Dialog */}
      <AlertDialog open={!!workerToReactivate} onOpenChange={(open) => !open && setWorkerToReactivate(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Bring Back to Current?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              Reactivate{" "}
              <span className="font-semibold text-slate-800">
                {workerToReactivate?.user?.name || workerToReactivate?.name || `${workerToReactivate?.first_name || ""} ${workerToReactivate?.last_name || ""}`.trim() || "this worker"}
              </span>
              ? This will restore their account access, lift the suspension notice, and bring them back to your Current active workers roster.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel disabled={isActionPending} className="h-8 text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isActionPending}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmReactivate();
              }}
              className="h-8 text-xs bg-[#2478b8] hover:bg-[#1b6296] text-white flex items-center gap-1.5"
            >
              {isActionPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Bring Back to Current</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!workerToDelete} onOpenChange={(open) => !open && setWorkerToDelete(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-red-600">
              Delete Worker?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800">
                {workerToDelete?.user?.name || workerToDelete?.name || `${workerToDelete?.first_name || ""} ${workerToDelete?.last_name || ""}`.trim() || "this worker"}
              </span>{" "}
              from your company roster? This action will remove the worker from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel disabled={isActionPending} className="h-8 text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isActionPending}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
            >
              {isActionPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Delete Worker</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MTN MoMo payment for driver card generation - Contact Us Style Modal */}
      <Dialog
        open={!!cardPayment}
        onOpenChange={(open) => {
          if (!open && cardPayStatus !== "sending" && cardPayStatus !== "waiting") setCardPayment(null);
        }}
      >
        <DialogContent
          hideCloseButton={true}
          className="sm:max-w-[720px] w-[95vw] max-w-[95vw] bg-white text-[#222222] border border-slate-200 rounded-lg p-0 shadow-2xl overflow-hidden text-left"
          style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 p-8 sm:p-9 pb-6">

            {/* LEFT COLUMN: PAYMENT DETAILS & MOMO INPUT */}
            <div className="md:pr-8 pb-6 md:pb-0 flex flex-col justify-between space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-[#222222] tracking-tight mb-1">
                  Payment methods
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Enter your MTN MoMo phone number to complete payment.
                </p>
              </div>

              {/* Summary Breakdown */}
              {cardPayment && (
                <div className="rounded-[4px] bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>Fee per card</span>
                    <span className="font-semibold text-slate-800">{cardPayment.feePerCard.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cards to pay</span>
                    <span className="font-semibold text-slate-800">{cardPayment.unpaidCount}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-1.5 font-bold text-slate-900">
                    <span>Total</span>
                    <span className="text-[#2478b8] text-sm">{cardPayment.totalAmount.toLocaleString()} RWF</span>
                  </div>
                </div>
              )}

              {/* Phone Input Box matching reference design */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={cardPayPhone}
                    onChange={(e) => setCardPayPhone(e.target.value)}
                    placeholder="078xxxxxxx"
                    disabled={cardPayStatus === "sending" || cardPayStatus === "waiting"}
                    style={{ fontSize: "16px", height: "46px" }}
                    className="w-full px-3.5 pr-24 rounded-[4px] border border-[#a5b2c0] focus:border-[#2478b8] focus:outline-none transition-colors bg-white text-slate-900 placeholder:text-slate-400"
                    required
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ffcc00] text-black">
                      MTN
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2478b8] text-white">
                      MoMo
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms Disclaimer Text */}
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                By providing your phone number, you allow Ekaze to initiate an MTN MoMo prompt of{" "}
                <span className="font-semibold text-slate-700">{cardPayment?.totalAmount.toLocaleString() || 100} RWF</span> to
                your device to complete driver card generation.
              </p>

              {/* Status Banners */}
              {cardPayStatus === "waiting" && (
                <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 text-[#2478b8] rounded text-xs">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{cardPayMessage || "Waiting for MTN MoMo approval on your phone (*182*7*1#)..."}</span>
                </div>
              )}
              {cardPayStatus === "failed" && cardPayMessage && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded text-xs">
                  {cardPayMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (cardPayStatus !== "sending" && cardPayStatus !== "waiting") setCardPayment(null);
                  }}
                  disabled={cardPayStatus === "sending" || cardPayStatus === "waiting"}
                  className="w-1/3 h-11 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-[6px] transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePayForCards}
                  disabled={cardPayStatus === "sending" || cardPayStatus === "waiting"}
                  className="flex-1 h-11 bg-[#2478b8] hover:bg-[#1b6296] text-white font-bold text-sm sm:text-base rounded-[6px] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {(cardPayStatus === "sending" || cardPayStatus === "waiting") && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span>
                    {cardPayStatus === "failed"
                      ? "Retry Payment"
                      : `Pay ${cardPayment?.totalAmount.toLocaleString() || 100} RWF`}
                  </span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: CONTACT US, PHONE 0783202922 & BULLETS */}
            <div className="md:pl-8 pt-6 md:pt-0 relative flex flex-col justify-between">

              {/* Top Close '✕' Button: Exact same size and position as Login dropdown */}
              <button
                type="button"
                onClick={() => {
                  if (cardPayStatus !== "sending" && cardPayStatus !== "waiting") setCardPayment(null);
                }}
                className="absolute top-0 right-0 text-slate-700 hover:text-black p-1 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </button>

              <div>
                <h3 className="text-[26px] font-bold text-[#222222] leading-tight mb-6 pr-8">
                  If you have any <br />
                  question, contact us:
                </h3>

                {/* Bullet Points with Checkmarks */}
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-[#333333] text-[14px]">
                    <Check className="w-5 h-5 text-[#2478b8] stroke-[3.5] shrink-0" />
                    <span>Phone & WhatsApp: 0783202922</span>
                  </li>

                  <li className="flex items-center gap-3 text-[#333333] text-[14px]">
                    <Check className="w-5 h-5 text-[#2478b8] stroke-[3.5] shrink-0" />
                    <span>Quick response within 15 minutes</span>
                  </li>

                  <li className="flex items-center gap-3 text-[#333333] text-[14px]">
                    <Check className="w-5 h-5 text-[#2478b8] stroke-[3.5] shrink-0" />
                    <span>Worker verification & contracts</span>
                  </li>

                  <li className="flex items-center gap-3 text-[#333333] text-[14px]">
                    <Check className="w-5 h-5 text-[#2478b8] stroke-[3.5] shrink-0" />
                    <span>24/7 dedicated platform support</span>
                  </li>
                </ul>
              </div>

              {/* Branding Script Footer matching LoginDropdown */}
              <div className="pt-2 select-none">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-2xl font-bold italic tracking-tight text-[#2478b8]"
                    style={{ fontFamily: "'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive, sans-serif" }}
                  >
                    Ekaze
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans font-semibold">™</span>
                </div>
                <p className="text-[11px] text-[#2478b8] font-medium tracking-tight">
                  Earn trust whenever you manage with us
                </p>
              </div>

            </div>

          </div>

          {/* BOTTOM BAR: Direct WhatsApp Action */}
          <div className="border-t border-slate-200 px-8 py-3.5 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[14px] text-[#333333] font-normal">
              Need urgent assistance right away?
            </span>
            <a
              href="https://wa.me/250783202922"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-5 bg-[#2478b8] hover:bg-[#1b6296] text-white font-bold text-xs sm:text-sm rounded-[6px] transition-colors cursor-pointer shadow-xs inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.18-.544-1.898-.788-3.13-2.73-3.224-2.856-.095-.126-.774-1.031-.774-1.968 0-.936.491-1.396.666-1.587.175-.19.382-.238.509-.238.127 0 .254.002.366.007.119.006.277-.045.433.328.16.381.545 1.332.593 1.43.048.098.08.212.016.339-.064.127-.096.207-.191.318-.095.111-.2.248-.286.333-.095.096-.195.2-.084.391.111.191.494.814 1.059 1.318.729.648 1.343.85 1.534.945.191.096.302.08.414-.047.111-.127.476-.556.603-.746.127-.19.254-.159.429-.095.175.064 1.11.523 1.301.618.191.096.318.143.366.223.048.079.048.461-.096.866zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.174L2 22l4.981-1.306C8.423 21.532 10.15 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.273c-1.636 0-3.161-.489-4.439-1.328l-.318-.21-2.955.775.789-2.879-.231-.368C3.93 14.938 3.4 13.513 3.4 12c0-4.742 3.858-8.6 8.6-8.6 4.743 0 8.6 3.858 8.6 8.6 0 4.742-3.857 8.273-8.6 8.273z" />
              </svg>
              <span>WhatsApp 0783202922</span>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkersContent;