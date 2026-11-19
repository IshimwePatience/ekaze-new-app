import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import SetWorkerLocationModal from "./SetWorkerLocationModal";
import { useEmployerWorkerLocations } from "@/hooks/useWorkerLocations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import {
  Phone,
  MapPin,
  Star,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  Banknote,
  History,
  Shield,
  MoreVertical,
  FileText,
  UserX,
  Building2,
  Briefcase,
  Clock,
} from "lucide-react";
import {
  useActiveWorkers,
  activeWorkersKeys,
} from "@/hooks/useActiveWorkers";
import {
  useBulkCreatePayments,
  useEndEmployment,
  useBulkEndEmployments,
} from "@/hooks/useEmployerWorker";

import { format } from "date-fns";
import { toast as sonnerToast } from "sonner";
import type { ActiveWorkersFilters, ActiveWorker } from "@/types/active-workers.types";
import type { BulkCreatePaymentItem } from "@/types/employer-worker.types";
import WorkerDetailsModal from "./WorkerDetailsModal";
import VerifyWorker from "./VerifyWorker";
import TerminateContractModal from "./TerminateContractModal";
import { downloadEmploymentContractPdf } from "@/utils/contractPdfGenerator";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const ActiveWorkers = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<ActiveWorkersFilters['sort_by']>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [groupBy, setGroupBy] = useState<"none" | "district" | "sector" | "cell" | "province">("none");
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationModalWorker, setLocationModalWorker] = useState<{ id: number; name: string } | null>(null);

  // NIDA Modal State
  const [isNidaModalOpen, setIsNidaModalOpen] = useState(false);
  const [selectedWorkerNationalId, setSelectedWorkerNationalId] = useState("");

  const { data: locationsData } = useEmployerWorkerLocations();
  const locationMap = Object.fromEntries(
    (locationsData?.data?.workers || [])
      .filter(w => w.has_location)
      .map(w => [w.worker_id, {
        ...w,
        latitude: w.location?.latitude,
        longitude: w.location?.longitude,
        address: w.location?.address,
        district: w.location?.district,
        sector: w.location?.sector,
        last_updated_diff: w.location?.updated_at ?? 'just now',
      }])
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Modals
  const [detailsWorkerId, setDetailsWorkerId] = useState<number | null>(null);
  const [detailsWorkerRecord, setDetailsWorkerRecord] = useState<ActiveWorker | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [paymentWorkers, setPaymentWorkers] = useState<ActiveWorker[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [endWorkers, setEndWorkers] = useState<ActiveWorker[]>([]);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);

  const [historyWorker, setHistoryWorker] = useState<ActiveWorker | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Contract Termination Modal State
  const [terminateWorker, setTerminateWorker] = useState<ActiveWorker | null>(null);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

  useEffect(() => {
    const openWorkerFromStorage = () => {
      const workerId = localStorage.getItem("employer_open_worker_id");
      if (workerId) {
        setDetailsWorkerId(Number(workerId));
        setIsDetailsModalOpen(true);
        localStorage.removeItem("employer_open_worker_id");
      }
    };

    const timer = setTimeout(openWorkerFromStorage, 100);
    window.addEventListener("employer-switch-to-active", openWorkerFromStorage);
    window.addEventListener("employer-open-worker", openWorkerFromStorage);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("employer-switch-to-active", openWorkerFromStorage);
      window.removeEventListener("employer-open-worker", openWorkerFromStorage);
    };
  }, []);

  const filters: Partial<ActiveWorkersFilters> = {
    search: searchTerm || undefined,
    sort_by: sortBy,
    page: currentPage,
    per_page: perPage,
  };

  const { data, isLoading } = useActiveWorkers(filters);
  const bulkPayMutation = useBulkCreatePayments();
  const endEmploymentMutation = useEndEmployment();
  const bulkEndMutation = useBulkEndEmployments();

  const workers: ActiveWorker[] = data?.data?.data || [];
  const pagination = data?.data ? {
    current_page: data.data.current_page,
    last_page: data.data.last_page,
    per_page: data.data.per_page,
    total: data.data.total,
  } : null;

  const [workerTab, setWorkerTab] = useState<"not_signed" | "hired" | "history">("not_signed");

  const notSignedWorkers = workers.filter(w => 
    w.status !== 'Hired' && 
    w.status !== 'terminated' && 
    w.status !== 'completed' && 
    w.current_employment?.status !== 'active' && 
    w.current_employment?.status !== 'terminated'
  );

  const hiredWorkers = workers.filter(w => 
    (w.status === 'Hired' || w.current_employment?.status === 'active') && 
    w.status !== 'terminated' && 
    w.status !== 'completed' && 
    w.current_employment?.status !== 'terminated'
  );

  const historyWorkers = workers.filter(w => 
    w.status === 'terminated' || 
    w.status === 'completed' || 
    w.current_employment?.status === 'terminated'
  );

  useEffect(() => {
    if (notSignedWorkers.length > 0 && hiredWorkers.length === 0 && workerTab !== "history") {
      setWorkerTab("not_signed");
    }
  }, [workers.length, notSignedWorkers.length, hiredWorkers.length]);

  const displayedWorkers = workerTab === "not_signed"
    ? notSignedWorkers
    : workerTab === "history"
    ? historyWorkers
    : hiredWorkers;

  const [affiliationFilter, setAffiliationFilter] = useState<"all" | "company" | "freelance">("all");

  const filteredWorkers = useMemo(() => {
    let list = [...displayedWorkers];

    if (affiliationFilter !== "all") {
      list = list.filter((w) => {
        const isCompany = Boolean(
          (w as any).company_id ||
          (w as any).company ||
          (w as any).company_name ||
          (w as any).worker_type === "company" ||
          (w as any).registration_type === "company" ||
          (w as any).affiliation === "company"
        );
        return affiliationFilter === "company" ? isCompany : !isCompany;
      });
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((w) =>
        w.full_name?.toLowerCase().includes(q) ||
        w.phone?.toLowerCase().includes(q) ||
        (w as any).company_name?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "name") {
      list.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
    } else if (sortBy === "rating") {
      list.sort((a, b) => ((b as any).rating || 0) - ((a as any).rating || 0));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date((a as any).created_at || 0).getTime() - new Date((b as any).created_at || 0).getTime());
    }

    return list;
  }, [displayedWorkers, affiliationFilter, searchTerm, sortBy]);

  const allActiveIds = filteredWorkers.map((w) => w.id);
  const allSelected =
    allActiveIds.length > 0 && allActiveIds.every((id) => selectedIds.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allActiveIds));
    }
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatCurrency = (amount: number): string => {
    if (!amount || isNaN(amount)) return `RWF 0`;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleOpenNidaVerification = (nationalId?: string) => {
    setSelectedWorkerNationalId(nationalId || "");
    setIsNidaModalOpen(true);
  };

  const handleDownloadContract = (worker: ActiveWorker) => {
    const currentEmployer = user || {};
    const employerName = currentEmployer.name || (currentEmployer as any).company?.name || "Registered Employer";
    const employerId = (currentEmployer as any).national_id || (currentEmployer as any).company?.tin_number || "1198000000000001";
    const employerPhone = (currentEmployer as any).phone || "0788000000";
    const employerLocation = (currentEmployer as any).district || (currentEmployer as any).address || (currentEmployer as any).company?.address || "Kigali, Rwanda";

    const agreedSalary = worker.current_employment?.agreed_salary 
      || (worker as any).agreed_salary 
      || (worker as any).monthly_salary
      || 75000;

    const isTerminated = worker.status === 'terminated' || worker.current_employment?.status === 'terminated' || workerTab === 'history';
    const termDate = worker.current_employment?.terminated_at || worker.current_employment?.end_date || worker.current_employment?.updated_at || (worker as any).terminated_at;
    const formattedTermDate = termDate ? format(new Date(termDate), "MMM dd, yyyy 'at' hh:mm a") : format(new Date(), "MMM dd, yyyy 'at' hh:mm a");

    downloadEmploymentContractPdf({
      is_terminated: isTerminated,
      status: isTerminated ? "TERMINATED" : "ACTIVE / BINDING",
      terminated_at: isTerminated ? `Terminated on ${formattedTermDate}` : undefined,
      employer: {
        name: employerName,
        national_id: employerId,
        phone: isTerminated ? "Protected (Terminated)" : employerPhone,
        location: employerLocation,
        role: "Employer",
      },
      worker: {
        name: worker.full_name || worker.name || "Worker",
        national_id: worker.national_id || "1199000000000005",
        phone: isTerminated ? "Protected (Terminated)" : (worker.phone || "0788000005"),
        location: worker.district || worker.address || "Kigali, Rwanda",
        role: "Worker",
      },
      agreed_net_salary: typeof agreedSalary === 'number' ? agreedSalary.toLocaleString() : agreedSalary,
      start_time: worker.current_employment?.start_date
        ? new Date(worker.current_employment.start_date).toLocaleString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      payment_day: (() => {
        const emp: any = worker.current_employment;
        if (emp?.payment_day) return Number(emp.payment_day);
        if (emp?.start_date) return new Date(emp.start_date).getDate();
        return new Date().getDate();
      })(),
      payment_cycle_days: (worker.current_employment as any)?.payment_cycle_days || 30,
      next_payment_date: (() => {
        const emp: any = worker.current_employment;
        if (emp?.next_payment_date) return emp.next_payment_date;
        if (emp?.due_date) return emp.due_date;
        const start = emp?.start_date ? new Date(emp.start_date) : new Date();
        const payDay = emp?.payment_day ? Number(emp.payment_day) : start.getDate();
        const targetYear = start.getMonth() === 11 ? start.getFullYear() + 1 : start.getFullYear();
        const targetMonth = start.getMonth() === 11 ? 0 : start.getMonth() + 1;
        const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
        const nextDue = new Date(targetYear, targetMonth, Math.min(payDay, lastDay));
        return nextDue.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      })(),
      days_until_payment: (worker.current_employment as any)?.days_until_payment ?? 30,
      otp_code: (worker as any).otp_code || "705231",
      otp_timestamp: worker.current_employment?.start_date
        ? new Date(worker.current_employment.start_date).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      work_title: (worker as any).experience_level ? `${(worker as any).experience_level} Worker` : "Employee",
    });

    toast({
      title: isTerminated ? "Terminated Contract Downloaded" : "Contract Downloaded",
      description: isTerminated
        ? `Downloaded official terminated contract agreement for ${worker.full_name || worker.name}.`
        : `Downloaded 2-page employment contract for ${worker.full_name || worker.name}.`,
    });
  };

  const getWorkerPhotoUrl = (raw?: string | null) => {
    if (!raw) return undefined;
    if (raw.startsWith('data:') || raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    return `${baseUrl}${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white space-y-0">
      {/* Top Header */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb title="Workers" />

        {/* ── Underline Tabs (Matching Incident Management Style) ── */}
        <div className="border-b border-slate-200 flex items-center gap-8">
          <button
            type="button"
            onClick={() => setWorkerTab("not_signed")}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 bg-transparent cursor-pointer flex items-center gap-2 border-0 ${
              workerTab === "not_signed"
                ? "border-b-2 border-[#2478b8] text-[#2478b8] font-bold"
                : "border-b-2 border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Not Yet Signed</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              workerTab === "not_signed" ? "bg-[#2478b8]/10 text-[#2478b8]" : "bg-slate-100 text-slate-600"
            }`}>
              {notSignedWorkers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setWorkerTab("hired")}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 bg-transparent cursor-pointer flex items-center gap-2 border-0 ${
              workerTab === "hired"
                ? "border-b-2 border-[#2478b8] text-[#2478b8] font-bold"
                : "border-b-2 border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Hired</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              workerTab === "hired" ? "bg-[#2478b8]/10 text-[#2478b8]" : "bg-slate-100 text-slate-600"
            }`}>
              {hiredWorkers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setWorkerTab("history")}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 bg-transparent cursor-pointer flex items-center gap-2 border-0 ${
              workerTab === "history"
                ? "border-b-2 border-[#2478b8] text-[#2478b8] font-bold"
                : "border-b-2 border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>History</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              workerTab === "history" ? "bg-[#2478b8]/10 text-[#2478b8]" : "bg-slate-100 text-slate-600"
            }`}>
              {historyWorkers.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Studio Content Layout */}
      <div className="w-full bg-white border-t border-slate-200">
        <StudioFilterBar
          categories={[
            {
              id: "affiliation",
              label: "Affiliation",
              options: [
                { value: "all", label: "All Affiliations" },
                { value: "company", label: "Company Workers" },
                { value: "freelance", label: "Freelancers" },
              ],
            },
            {
              id: "sortBy",
              label: "Sort By",
              options: [
                { value: "recent", label: "Most Recent" },
                { value: "oldest", label: "Oldest First" },
                { value: "name", label: "Name (A-Z)" },
                { value: "rating", label: "Highest Rated" },
              ],
            },
            {
              id: "groupBy",
              label: "Group By",
              options: [
                { value: "none", label: "No Grouping" },
                { value: "province", label: "By Province" },
                { value: "district", label: "By District" },
                { value: "sector", label: "By Sector" },
                { value: "cell", label: "By Cell" },
              ],
            },
          ]}
          activeFilters={{
            sortBy: sortBy || "recent",
            groupBy: groupBy || "none",
            affiliation: affiliationFilter || "all",
          }}
          onFilterChange={(catId, val) => {
            if (catId === "sortBy") setSortBy(val as any);
            if (catId === "groupBy") setGroupBy(val as any);
            if (catId === "affiliation") setAffiliationFilter(val as any);
            setCurrentPage(1);
          }}
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          onClearAll={() => {
            setSearchTerm("");
            setSortBy("recent");
            setGroupBy("none");
            setAffiliationFilter("all");
            setCurrentPage(1);
          }}
        />

        {/* Table Content Section */}
        {filteredWorkers.length === 0 ? (
          <CharacterIllustration
            type="users"
            title="No active workers found"
            description="No active workers registered under your account match your filter criteria."
          />
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[850px] border-collapse">
              <TableHeader className="bg-transparent border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="w-10 pl-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      className="border-slate-400 rounded-sm"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">{t("employer.activeWorkers.worker")}</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Affiliation</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">{t("employer.activeWorkers.employment")}</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Due (Payment)</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">{t("employer.activeWorkers.contact")}</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">{t("employer.activeWorkers.salary")}</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">{t("employer.activeWorkers.rating")}</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">NIDA Verification</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">{t("employer.activeWorkers.status")}</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 text-right pr-2">{t("employer.activeWorkers.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => {
                  const isSelected = selectedIds.has(worker.id);
                  const isVerified = (worker as any).is_verified || (worker as any).national_id_verified;
                  const isCompany = Boolean(
                    (worker as any).company_id ||
                    (worker as any).company ||
                    (worker as any).company_name ||
                    (worker as any).worker_type === "company" ||
                    (worker as any).registration_type === "company" ||
                    (worker as any).affiliation === "company"
                  );
                  const compName = (worker as any).company_name || (worker as any).company?.company_name || (worker as any).company?.name || null;

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
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200">
                            <AvatarImage 
                              src={getWorkerPhotoUrl(worker.profile_photo || (worker as any).photo || (worker as any).avatar || (worker as any).user?.profile_photo)} 
                              alt={worker.full_name}
                              className="object-cover"
                            />
                            <AvatarFallback className="p-0 bg-transparent border-none">
                              <DefaultAvatarSVG className="w-full h-full" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{worker.full_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-medium text-slate-800 whitespace-nowrap">
                          {isCompany ? (compName ? `Company (${compName})` : "Company Worker") : "Freelancer"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        {worker.current_employment ? (
                          <div>
                            <p className="text-xs font-normal text-slate-700">
                              {format(new Date(worker.current_employment.start_date), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {Math.floor(worker.current_employment.days_employed) <= 1
                                ? "1 day"
                                : `${Math.floor(worker.current_employment.days_employed)} days`}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-normal">Not Hired Yet</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        {worker.current_employment ? (
                          <span className="text-xs font-normal text-slate-700 whitespace-nowrap">
                            {(() => {
                              const explicitDay = (worker.current_employment as any)?.payment_day;
                              if (explicitDay) return explicitDay;
                              const nextPay = (worker.current_employment as any)?.next_payment_date;
                              if (nextPay) {
                                try {
                                  const parsed = new Date(nextPay);
                                  if (!isNaN(parsed.getTime())) {
                                    return parsed.getDate();
                                  }
                                } catch (_) {}
                              }
                              return new Date(worker.current_employment.start_date || Date.now()).getDate();
                            })()}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-normal text-slate-700">
                          {worker.status === 'terminated' || worker.current_employment?.status === 'terminated' || workerTab === 'history'
                            ? "Protected"
                            : worker.phone}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        {workerTab === "not_signed" || !isVerified ? (
                          <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                            {(worker as any).salary_range || "50,000 - 100,000 RWF"}
                          </span>
                        ) : worker.current_employment ? (
                          <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                            {formatCurrency(worker.current_employment.agreed_salary)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-semibold text-slate-800">
                          {parseFloat(String(worker.average_rating || 0)).toFixed(1)}
                        </span>
                      </TableCell>

                      {/* Clean NIDA Verification Column */}
                      <TableCell className="py-3">
                        {workerTab !== "not_signed" && isVerified ? (
                          <span className="text-xs font-normal text-slate-700">Verified</span>
                        ) : (
                          <button
                            onClick={() => handleOpenNidaVerification(worker.national_id)}
                            className="text-xs font-normal text-slate-700 hover:text-slate-900 hover:underline cursor-pointer"
                          >
                            Verify NIDA
                          </button>
                        )}
                      </TableCell>

                      <TableCell className="py-3 whitespace-nowrap">
                        <span className="text-xs font-normal text-slate-700 font-sans">
                          {worker.status === 'Hired' || (isVerified && worker.current_employment?.status === 'active')
                            ? `Active since ${format(new Date(worker.current_employment?.start_date || worker.hired_date || Date.now()), "MMM dd, yyyy")}`
                            : worker.status === 'terminated' || worker.current_employment?.status === 'terminated'
                            ? `Terminated on ${format(
                                new Date(
                                  worker.current_employment?.terminated_at ||
                                  worker.current_employment?.end_date ||
                                  worker.current_employment?.updated_at ||
                                  worker.updated_at ||
                                  Date.now()
                                ),
                                "MMM dd, yyyy 'at' hh:mm a"
                              )}`
                            : workerTab === "not_signed" || !isVerified
                            ? "Not Yet Negotiating"
                            : (worker.current_employment?.status || 'active')}
                        </span>
                      </TableCell>

                      <TableCell className="text-right pr-2 py-3">
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
                              label: "View Worker Details",
                              onClick: () => {
                                setDetailsWorkerId(worker.id);
                                setDetailsWorkerRecord(worker);
                                setIsDetailsModalOpen(true);
                              },
                            },
                            ...((worker.status === 'Hired' || (isVerified && worker.current_employment?.status === 'active'))
                              ? [
                                  {
                                    label: "Download Contract",
                                    onClick: () => handleDownloadContract(worker),
                                  },
                                  {
                                    label: "Terminate Contract",
                                    danger: true,
                                    onClick: () => { setTerminateWorker(worker); setIsTerminateModalOpen(true); },
                                  },
                                ]
                              : (worker.status === 'terminated' || worker.current_employment?.status === 'terminated' || workerTab === 'history')
                              ? [
                                  {
                                    label: "Download Contract",
                                    onClick: () => handleDownloadContract(worker),
                                  },
                                ]
                              : []),
                            ...(worker.status !== 'Hired' && worker.status !== 'terminated' && (!isVerified || !worker.current_employment)
                              ? [
                                  {
                                    label: "Verify NIDA Identity",
                                    onClick: () => handleOpenNidaVerification(worker.national_id),
                                  },
                                ]
                              : []),
                            ...(worker.current_employment?.status === 'active'
                              ? [
                                  "separator",
                                  {
                                    label: "Payment History",
                                    onClick: () => { setHistoryWorker(worker); setIsHistoryModalOpen(true); },
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {pagination && (
          <YouTubeStudioPagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            perPage={perPage}
            total={pagination.total}
            onPageChange={(page) => setCurrentPage(page)}
            onPerPageChange={(val) => {
              setPerPage(val);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* NIDA Verification Dialog Modal */}
      <Dialog open={isNidaModalOpen} onOpenChange={setIsNidaModalOpen}>
        <DialogContent 
          hideCloseButton
          className="max-w-[580px] sm:max-w-[580px] w-full p-0 overflow-hidden rounded-[28px] border-none shadow-[0_12px_40px_rgba(0,0,0,0.18)] bg-white text-slate-800"
        >
          <DialogTitle className="sr-only">Worker Verification</DialogTitle>
          <DialogDescription className="sr-only">NIDA worker verification modal</DialogDescription>
          <VerifyWorker 
            initialNationalId={selectedWorkerNationalId} 
            onClose={() => setIsNidaModalOpen(false)}
            onHired={() => {
              queryClient.invalidateQueries({ queryKey: activeWorkersKeys.all });
              queryClient.refetchQueries({ queryKey: activeWorkersKeys.all });
              setWorkerTab("hired");
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Contract Termination Modal */}
      <TerminateContractModal
        worker={terminateWorker}
        isOpen={isTerminateModalOpen}
        onClose={() => {
          setIsTerminateModalOpen(false);
          setTerminateWorker(null);
        }}
        onTerminated={() => {
          queryClient.invalidateQueries({ queryKey: activeWorkersKeys.all });
          queryClient.refetchQueries({ queryKey: activeWorkersKeys.all });
          setWorkerTab("history");
        }}
      />

      {/* Details & Location Modals */}
      <WorkerDetailsModal
        workerId={detailsWorkerId}
        isOpen={isDetailsModalOpen}
        hasPaidContact={true}
        canRate={workerTab !== "not_signed"}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDetailsWorkerId(null);
          setDetailsWorkerRecord(null);
        }}
        isTerminatedContext={
          detailsWorkerRecord?.status === 'terminated' ||
          detailsWorkerRecord?.current_employment?.status === 'terminated' ||
          workerTab === 'history'
        }
        employmentRecord={detailsWorkerRecord?.current_employment}
      />

      {locationModalWorker && (
        <SetWorkerLocationModal
          workerId={locationModalWorker.id}
          workerName={locationModalWorker.name}
          currentLocation={locationMap[locationModalWorker.id] ?? null}
          isOpen={locationModalOpen}
          onClose={() => { setLocationModalOpen(false); setLocationModalWorker(null); }}
        />
      )}
    </div>
  );
};

export default ActiveWorkers;