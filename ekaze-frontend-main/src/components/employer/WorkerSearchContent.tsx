import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useFreelanceContactStatus, useFreelanceContactInitiate, useFreelanceContactConfirm } from "@/hooks/useEmployerWorker";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import WorkerDetailsModal from "./WorkerDetailsModal";
import { WorkerDetailModal } from "./employerFilter/employer/WorkerDetailModal";
import { useLanguage } from "@/contexts/LanguageContext";
import api from '@/lib/api';
import { useRef } from 'react';

import {
  Search,
  Filter,
  Eye,
  Star,
  Users,
  CheckCircle2,
  Clock,
  Shield,
  MapPin,
  Languages,
  X,
  CreditCardIcon,
  FileText,
  Phone,
  Mail,
  Download,
  Building2,
  AlertCircle,
  Building,
  Briefcase,
} from "lucide-react";
import { 
  useAuthenticatedWorkerSearch,
  usePublicWorkerSearch,
  useGenerateIdCard 
} from "@/hooks/useWorkerSearch";
import { useCompanyList } from "@/hooks/useCompanies";
import type { WorkerSearchFilters, WorkerPaid, WorkerPublic } from "@/types/worker-search.types";
import { format } from "date-fns";




const WorkerSearchContent = () => {
    const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<"public" | "authenticated">("public");
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filters, setFilters] = useState<Partial<WorkerSearchFilters>>({
    period: 'all_time',
    gender: 'all',
    experience_level: 'all',
    availability: 'all',
    sort_by: 'recent',
    registration_type: 'all',
  });
  const [customFromDate, setCustomFromDate] = useState<Date | undefined>();
  const [customToDate, setCustomToDate] = useState<Date | undefined>();
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState<'all' | 'company' | 'freelance'>('all');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | undefined>();


const { data: companies = [], isLoading: companiesLoading } = useCompanyList();

  const publicSearch = usePublicWorkerSearch({
    ...filters,
    page: currentPage,
    per_page: 20,
    ...(searchTerm && { search: searchTerm }),
  });

  const authenticatedSearch = useAuthenticatedWorkerSearch({
    ...filters,
    page: currentPage,
    per_page: 20,
    ...(searchTerm && { search: searchTerm }),
  });

  const generateIdCardMutation = useGenerateIdCard();

  // Freelance contact payment state
  const [isFreelancePayModalOpen, setIsFreelancePayModalOpen] = useState(false);
  const [freelanceTargetWorkerId, setFreelanceTargetWorkerId] = useState<number | null>(null);
  type FreelanceStep = 'checking' | 'payment' | 'polling' | 'info';
  const [freelanceStep, setFreelanceStep] = useState<FreelanceStep>('checking');
  const [freelancePayAccount, setFreelancePayAccount] = useState('');
  const [freelancePaymentData, setFreelancePaymentData] = useState<{
    paymentId: number; amount: number; currency: string; note: string;
  } | null>(null);
  const freelancePollRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const freelanceTimeoutRef    = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const freelanceWorkerIdRef   = useRef<number | null>(null);
  const freelancePaymentIdRef  = useRef<number | null>(null);

  const [unlockedContact, setUnlockedContact] = useState<{ phone: string | null; email: string | null } | null>(null);
  const [freelanceFee, setFreelanceFee] = useState<number | null>(null);


  const freelanceStatus   = useFreelanceContactStatus(freelanceTargetWorkerId);
  const selectedWorkerContactStatus = useFreelanceContactStatus(selectedWorkerId);
  const hasPaidContact = selectedWorkerContactStatus.data?.data?.has_paid === true || unlockedContact !== null;
  const freelanceInitiate = useFreelanceContactInitiate();
  const freelanceConfirm  = useFreelanceContactConfirm();

  // When freelance modal opens, wait for status check then set step
  useEffect(() => {
    if (!isFreelancePayModalOpen || !freelanceTargetWorkerId) return;
if (!freelanceStatus.isSuccess) {
      setFreelanceStep('checking');
      return;
    }

    if (freelanceStatus.data?.data?.fee) {
      setFreelanceFee(freelanceStatus.data.data.fee);
    }
    console.log('freelance status data:', freelanceStatus.data);
    if (freelanceStatus.data?.data?.has_paid) {
      setFreelanceStep('info');
    } else {
      setFreelanceStep('payment');
    }
  }, [isFreelancePayModalOpen, freelanceTargetWorkerId, freelanceStatus.isLoading, freelanceStatus.data]);

  // Auto-open worker details modal if workerId URL param or sessionStorage item exists (Coursera style)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const workerId = searchParams.get('workerId') || searchParams.get('autoOpenWorkerId') || sessionStorage.getItem('auto_open_worker_id');
    if (workerId) {
      setSelectedWorkerId(Number(workerId));
      setIsDetailsModalOpen(true);
      sessionStorage.removeItem('auto_open_worker_id');
    }
  }, []);

  // Update filters when custom dates change
  useEffect(() => {
    if (filters.period === 'custom' && customFromDate && customToDate) {
      setFilters(prev => ({
        ...prev,
        from_date: format(customFromDate, 'yyyy-MM-dd'),
        to_date: format(customToDate, 'yyyy-MM-dd'),
      }));
    }
  }, [customFromDate, customToDate, filters.period]);

  const handleFilterChange = <K extends keyof WorkerSearchFilters>(
    key: K,
    value: WorkerSearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    
    if (key === 'period') {
      setShowCustomDates(value === 'custom');
      if (value !== 'custom') {
        setCustomFromDate(undefined);
        setCustomToDate(undefined);
      }
    }
  };

  const handleClearCustomDates = () => {
    setCustomFromDate(undefined);
    setCustomToDate(undefined);
    setFilters(prev => ({
      ...prev,
      period: 'all_time',
      from_date: undefined,
      to_date: undefined,
    }));
    setShowCustomDates(false);
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
    }));
  }, [selectedLanguages]);

  const handleClearFilters = () => {
    setFilters({
      period: 'all_time',
      gender: 'all',
      experience_level: 'all',
      availability: 'all',
      sort_by: 'recent',
      registration_type: 'all',
    });
    setCustomFromDate(undefined);
    setCustomToDate(undefined);
    setShowCustomDates(false);
    setSelectedLanguages([]);
    setSearchTerm("");
    setCompanyFilter('all');
    setSelectedCompanyId(undefined);
    setCurrentPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "public" | "authenticated");
    setCurrentPage(1);
  };

// const handleViewWorker = (workerId: number, registrationType?: string) => {
//     if (registrationType && registrationType !== 'company') {
//       setFreelanceTargetWorkerId(workerId);
//       setIsFreelancePayModalOpen(true);
//       return;
//     }
//     setSelectedWorkerId(workerId);
//     setIsDetailsModalOpen(true);
//   };

const handleViewWorker = (workerId: number) => {
    setSelectedWorkerId(workerId);
    setIsDetailsModalOpen(true);
  };


const stopFreelancePolling = () => {
  if (freelancePollRef.current)    clearInterval(freelancePollRef.current);
  if (freelanceTimeoutRef.current) clearTimeout(freelanceTimeoutRef.current);
};

const startFreelancePolling = (refId: string) => {
  freelanceTimeoutRef.current = setTimeout(() => {
    stopFreelancePolling();
    setFreelanceStep('payment');
    toast.error("Payment timed out. Please try again.");
  }, 2 * 60 * 1000);

  freelancePollRef.current = setInterval(async () => {
    try {
      const wId = freelanceWorkerIdRef.current;
      const res = await api.get(`/employer/freelance-contact/${wId}/payment-status/${refId}`);
      const ps  = res.data?.payment_status;

      if (ps === 'SUCCESSFUL') {
        stopFreelancePolling();
        const wId = freelanceWorkerIdRef.current;
        const pId = freelancePaymentIdRef.current;
        if (wId && pId) {
          try {
            const confirmRes = await freelanceConfirm.mutateAsync({
              workerId: wId,
              data: { payment_id: pId, transaction_ref: refId },
            });
            setUnlockedContact(confirmRes.data);
          } catch (_) {
            console.log('Something went wrong!');
          }
        }
        setFreelanceStep('info');
      } else if (ps === 'FAILED') {
        stopFreelancePolling();
        setFreelanceStep('payment');
        toast.error(res.data?.reason || 'Payment was declined. Please try again.');
      }
    } catch (_) {
      console.log('Something went wrong!');
    }
  }, 5000);
};

const handleFreelanceInitiate = async () => {
  if (!freelanceTargetWorkerId) return;
  if (!freelancePayAccount.trim() || freelancePayAccount.length < 10) {
    toast.error("Please enter a valid MoMo number.");
    return;
  }
  try {
    const res = await freelanceInitiate.mutateAsync({
      workerId: freelanceTargetWorkerId,
      data: { pay_account: freelancePayAccount, channel: 'momo' },
    });
    if (res.data.already_paid) {
      setFreelanceStep('info');
      return;
    }
    const resData = res.data as typeof res.data & { reference_id?: string };
    if (!resData.reference_id) {
      toast.error("Payment initiation failed. Please try again.");
      return;
    }
    setFreelancePaymentData({
      paymentId: resData.payment_id!,
      amount:    resData.amount!,
      currency:  resData.currency!,
      note:      resData.note!,
    });
    freelanceWorkerIdRef.current  = freelanceTargetWorkerId;
    freelancePaymentIdRef.current = resData.payment_id!;
    setFreelanceStep('polling');
    startFreelancePolling(resData.reference_id);
  } catch (_) { /* handled by hook */ }
};




const handleFreelanceModalClose = () => {
  stopFreelancePolling();
  freelanceWorkerIdRef.current  = null;
  freelancePaymentIdRef.current = null;
  setIsFreelancePayModalOpen(false);
  setFreelanceTargetWorkerId(null);
  setFreelanceStep('checking');
  setFreelancePayAccount('');
  setFreelancePaymentData(null);
  setUnlockedContact(null);
  setFreelanceFee(null);
};

const handleUnlockContact = () => {
    setFreelanceTargetWorkerId(selectedWorkerId);
    setIsFreelancePayModalOpen(true);
  };

const handleOpenDetailsAfterPayment = () => {
    setIsFreelancePayModalOpen(false);
    setFreelanceTargetWorkerId(null);
    setFreelanceStep('checking');
    setFreelancePayAccount('');
    setFreelancePaymentData(null);
    // unlockedContact stays set so details modal can show it
  };


  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      hired: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
      unavailable: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
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

  const getRegistrationTypeBadge = (type?: string) => {
    if (type === 'company') {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    return "bg-amber-100 text-amber-800 border-amber-200";
  };

  const isLoading = activeTab === 'public' ? publicSearch.isLoading : authenticatedSearch.isLoading;
  const data = activeTab === 'public' ? publicSearch.data : authenticatedSearch.data;
  const workers = data?.data?.data || [];
  const pagination = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-3 w-80 mt-1.5" />
          </div>
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const languageOptions = [
    t("employer.workerSearch.kinyarwanda"),
    t("employer.workerSearch.english"),
    t("employer.workerSearch.french"),
    t("employer.workerSearch.swahili"),
    t("employer.workerSearch.other")
  ];

  const stats = [
    {
      title: t("employer.workerSearch.totalWorkers"),
      value: pagination?.total || 0,
      subtitle: t("employer.workerSearch.found"),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      darkBgColor: "dark:bg-blue-950/30",
    },
    {
      title: t("employer.workerSearch.availableStats"),
      value: workers.filter(w => w.availability_status === 'available').length,
      subtitle: t("employer.workerSearch.readyToHire"),
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      darkBgColor: "dark:bg-green-950/30",
    },
    {
      title: t("employer.workerSearch.companyWorkers"),
      value: workers.filter(w => 'registration_type' in w && w.registration_type === 'company').length,
      subtitle: t("employer.workerSearch.companyRegistered"),
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      darkBgColor: "dark:bg-purple-950/30",
    },
    {
      title: t("employer.workerSearch.freelanceStats"),
      value: workers.filter(w => !('registration_type' in w) || w.registration_type !== 'company').length,
      subtitle: t("employer.workerSearch.independentWorkers"),
      icon: Briefcase,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      darkBgColor: "dark:bg-amber-950/30",
    },
  ];

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base text-left font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {t("employer.workerSearch.title")}
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {t("employer.workerSearch.subtitle")}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] font-medium">
            <Clock className="w-2.5 h-2.5 mr-1" />
            {new Date().toLocaleTimeString()}
          </Badge>
        </div>

        {/* Filters Section */}
        <Card className="border-border/40 shadow-sm" style={{ borderRadius: '10px' }}>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* First Row: Period Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground">{t("employer.workerSearch.period")}</span>
                  <Select
                    value={filters.period || 'all_time'}
                    onValueChange={(value) => handleFilterChange('period', value as WorkerSearchFilters['period'])}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder={t("employer.workerSearch.selectPeriod")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_time">{t("employer.workerSearch.allTime")}</SelectItem>
                      <SelectItem value="last_7_days">{t("employer.workerSearch.last7Days")}</SelectItem>
                      <SelectItem value="last_30_days">{t("employer.workerSearch.last30Days")}</SelectItem>
                      <SelectItem value="last_90_days">{t("employer.workerSearch.last90Days")}</SelectItem>
                      <SelectItem value="this_month">{t("employer.workerSearch.thisMonth")}</SelectItem>
                      <SelectItem value="last_month">{t("employer.workerSearch.lastMonth")}</SelectItem>
                      <SelectItem value="custom">{t("employer.workerSearch.customRange")}</SelectItem>
                    </SelectContent>
                  </Select>

                  {showCustomDates && (
                    <>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                        <span className="text-[10px] text-muted-foreground">{t("employer.workerSearch.from")}</span>
                        <DatePicker
                          date={customFromDate}
                          onDateChange={setCustomFromDate}
                          placeholder={t("employer.workerSearch.startDate")}
                        />
                      </div>

                      <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                        <span className="text-[10px] text-muted-foreground">{t("employer.workerSearch.to")}</span>
                        <DatePicker
                          date={customToDate}
                          onDateChange={setCustomToDate}
                          placeholder={t("employer.workerSearch.endDate")}
                          disabled={!customFromDate}
                        />
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleClearCustomDates}
                        className="h-8 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        {t("employer.workerSearch.clear")}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="h-8 text-xs"
                >
                  {t("employer.workerSearch.clearAll")}
                </Button>
              </div>

              {/* Date Range Info */}
              {showCustomDates && customFromDate && customToDate && (
                <div className="text-[10px] text-muted-foreground px-3 py-1.5 bg-muted/50 rounded-md">
                  📅 {t("employer.workerSearch.showingWorkersFrom")}{' '}
                  <span className="font-semibold text-foreground">
                    {format(customFromDate, 'PPP')}
                  </span>
                  {' '}{t("employer.workerSearch.to")}{' '}
                  <span className="font-semibold text-foreground">
                    {format(customToDate, 'PPP')}
                  </span>
                </div>
              )}

              {/* Second Row: Main Filters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Gender Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground">{t("employer.workerSearch.gender")}</label>
                  <Select
                    value={filters.gender || 'all'}
                    onValueChange={(value) => handleFilterChange('gender', value as WorkerSearchFilters['gender'])}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={t("employer.workerSearch.gender")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">{t("employer.workerSearch.allGenders")}</SelectItem>
                      <SelectItem value="male" className="text-xs">{t("employer.workerSearch.male")}</SelectItem>
                      <SelectItem value="female" className="text-xs">{t("employer.workerSearch.female")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Level Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground">{t("employer.workerSearch.experience")}</label>
                  <Select
                    value={filters.experience_level || 'all'}
                    onValueChange={(value) => handleFilterChange('experience_level', value as WorkerSearchFilters['experience_level'])}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={t("employer.workerSearch.experience")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">{t("employer.workerSearch.allLevels")}</SelectItem>
                      <SelectItem value="beginner" className="text-xs">{t("employer.workerSearch.beginner")}</SelectItem>
                      <SelectItem value="intermediate" className="text-xs">{t("employer.workerSearch.intermediate")}</SelectItem>
                      <SelectItem value="expert" className="text-xs">{t("employer.workerSearch.expert")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground">{t("employer.workerSearch.availability")}</label>
                  <Select
                    value={filters.availability || 'all'}
                    onValueChange={(value) => handleFilterChange('availability', value as WorkerSearchFilters['availability'])}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={t("employer.workerSearch.availability")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">{t("employer.workerSearch.all")}</SelectItem>
                      <SelectItem value="available" className="text-xs">{t("employer.workerSearch.available")}</SelectItem>
                      <SelectItem value="hired" className="text-xs">{t("employer.workerSearch.hired")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground">{t("employer.workerSearch.sortBy")}</label>
                  <Select
                    value={filters.sort_by || 'recent'}
                    onValueChange={(value) => handleFilterChange('sort_by', value as WorkerSearchFilters['sort_by'])}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={t("employer.workerSearch.sortBy")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent" className="text-xs">{t("employer.workerSearch.mostRecent")}</SelectItem>
                      <SelectItem value="oldest" className="text-xs">{t("employer.workerSearch.oldestFirst")}</SelectItem>
                      <SelectItem value="name" className="text-xs">{t("employer.workerSearch.nameAZ")}</SelectItem>
                      <SelectItem value="rating" className="text-xs">{t("employer.workerSearch.highestRating")}</SelectItem>
                      <SelectItem value="salary_low" className="text-xs">{t("employer.workerSearch.salaryLowToHigh")}</SelectItem>
                      <SelectItem value="salary_high" className="text-xs">{t("employer.workerSearch.salaryHighToLow")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Third Row: Salary Range & Age Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Salary Range */}
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-muted-foreground">{t("employer.workerSearch.salaryRange")}</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder={t("employer.workerSearch.min")}
                      value={filters.min_salary || ''}
                      onChange={(e) => handleFilterChange('min_salary', e.target.value ? Number(e.target.value) : undefined)}
                      className="h-8 text-xs"
                    />
                    <span className="text-[10px] text-muted-foreground">{t("employer.workerSearch.to")}</span>
                    <Input
                      type="number"
                      placeholder={t("employer.workerSearch.max")}
                      value={filters.max_salary || ''}
                      onChange={(e) => handleFilterChange('max_salary', e.target.value ? Number(e.target.value) : undefined)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Age Range */}
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-muted-foreground">{t("employer.workerSearch.ageRange")}</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder={t("employer.workerSearch.minAge")}
                      value={filters.min_age || ''}
                      onChange={(e) => handleFilterChange('min_age', e.target.value ? Number(e.target.value) : undefined)}
                      className="h-8 text-xs"
                      min={18}
                      max={70}
                    />
                    <span className="text-[10px] text-muted-foreground">{t("employer.workerSearch.to")}</span>
                    <Input
                      type="number"
                      placeholder={t("employer.workerSearch.maxAge")}
                      value={filters.max_age || ''}
                      onChange={(e) => handleFilterChange('max_age', e.target.value ? Number(e.target.value) : undefined)}
                      className="h-8 text-xs"
                      min={18}
                      max={70}
                    />
                  </div>
                </div>
              </div>

              {/* Fourth Row: Languages */}
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-muted-foreground">{t("employer.workerSearch.languagesSpoken")}</label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${language}`}
                        checked={selectedLanguages.includes(language)}
                        onCheckedChange={() => handleLanguageToggle(language)}
                        className="h-3.5 w-3.5"
                      />
                      <label
                        htmlFor={`lang-${language}`}
                        className="text-[10px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {language}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Registration Type Filter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-muted-foreground">{t("employer.workerSearch.workerType")}</label>
                  <Select
                    value={companyFilter}
                    onValueChange={(value: 'all' | 'company' | 'freelance') => {
                      setCompanyFilter(value);
                      handleFilterChange('registration_type', value === 'all' ? undefined : value);
                      if (value !== 'company') {
                        setSelectedCompanyId(undefined);
                        handleFilterChange('company_id', undefined);
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={t("employer.workerSearch.workerType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">{t("employer.workerSearch.allWorkers")}</SelectItem>
                      <SelectItem value="company" className="text-xs">{t("employer.workerSearch.companyRegistered")}</SelectItem>
                      <SelectItem value="freelance" className="text-xs">{t("employer.workerSearch.freelance")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Company Selection (only shown when company type selected) */}
                {companyFilter === 'company' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium text-muted-foreground">{t("employer.workerSearch.selectCompany")}</label>
                    <Select
                      value={selectedCompanyId?.toString() || ''}
                      onValueChange={(value) => {
                        const companyId = parseInt(value);
                        setSelectedCompanyId(companyId);
                        handleFilterChange('company_id', companyId);
                      }}
                      disabled={companiesLoading}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder={companiesLoading ? t("employer.workerSearch.loadingCompanies") : t("employer.workerSearch.chooseCompany")} />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()} className="text-xs">
                            <div className="flex items-center gap-2">
                              {company.logo ? (
                                <img src={company.logo} alt="" className="w-4 h-4 rounded-full" />
                              ) : (
                                <Building className="w-3 h-3 text-muted-foreground" />
                              )}
                              <span>{company.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Fifth Row: Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={t("employer.workerSearch.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-[11px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group"
                style={{ borderRadius: "10px" }}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className={`p-0.5 rounded-lg ${stat.bgColor} ${stat.darkBgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-2.5 h-2.5 ${stat.color}`} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-foreground mb-0.5">{stat.value}</h3>
                      <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{stat.title}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-muted-foreground/80">{stat.subtitle}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Workers Table with Tabs */}
        <Card className="border-border/40 shadow-sm" style={{ borderRadius: "10px" }}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <CardHeader className="pb-0 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-transparent p-0">
                  <TabsTrigger value="public" className="text-[10px]">
                    <Users className="w-3.5 h-3.5 mr-0 sm:mr-1.5" />
                    <span className="hidden sm:inline">{t("employer.workerSearch.publicSearch")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="authenticated" className="text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-0 sm:mr-1.5" />
                    <span className="hidden sm:inline">{t("employer.workerSearch.mySearch")}</span>
                  </TabsTrigger>
                </TabsList>

                <Badge variant="secondary" className="text-[10px]">
                  {workers.length} {t("employer.workerSearch.worker")}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {/* Public Tab */}
              <TabsContent value="public" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">{t("employer.workerSearch.publicWorkers")}</h3>
                    <Badge variant="outline" className="text-[10px]">
                      {t("employer.workerSearch.registerToView")}
                    </Badge>
                  </div>

                  {/* Workers Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.worker")}
                          </th>
                          <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.experienceHeader")}
                          </th>
                          <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.location")}
                          </th>
                          <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.salaryRangeHeader")}
                          </th>
                          <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.languagesHeader")}
                          </th>
                          <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.rating")}
                          </th>
                          <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.status")}
                          </th>
                          <th className="text-right py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.actions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {workers.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-8">
                              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">{t("employer.workerSearch.noWorkersFound")}</p>
                            </td>
                          </tr>
                        ) : (
                          workers.map((worker) => (
                            <tr
                              key={worker.id}
                              className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                            >
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={worker.profile_photo || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                      {worker.first_name?.[0] || 'W'}{worker.last_name?.[0] || 'W'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-[10px] font-semibold text-foreground">
                                      {worker.first_name} {worker.last_name}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground">
                                      {t("employer.workerSearch.age")}: {worker.age} • {worker.gender === 'male' ? t("employer.workerSearch.male") : t("employer.workerSearch.female")}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <Badge variant="outline" className={`text-[9px] ${getExperienceBadge(worker.experience_level)}`}>
                                  {worker.experience_level === 'beginner' ? t("employer.workerSearch.beginner") :
                                   worker.experience_level === 'intermediate' ? t("employer.workerSearch.intermediate") :
                                   t("employer.workerSearch.expert")}
                                </Badge>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[10px] text-foreground">{worker.district || 'N/A'}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1">
                                  <CreditCardIcon className="w-3 h-3 text-green-600" />
                                  <div>
                                    <p className="text-[10px] font-medium">
                                      {formatCurrency(worker.min_salary)} - {formatCurrency(worker.max_salary)}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {worker.languages_spoken?.slice(0, 2).map((lang, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-[9px]">
                                      {lang}
                                    </Badge>
                                  ))}
                                  {worker.languages_spoken && worker.languages_spoken.length > 2 && (
                                    <span className="text-[9px] text-muted-foreground">
                                      +{worker.languages_spoken.length - 2}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-[10px] font-medium">{(Number(worker.average_rating) || 0).toFixed(1)}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex justify-center">
                                  <Badge className={`text-[9px] ${getStatusBadge(worker.availability_status)}`}>
                                    {worker.availability_status === 'available' ? t("employer.workerSearch.available") :
                                     worker.availability_status === 'hired' ? t("employer.workerSearch.hired") :
                                     worker.availability_status}
                                  </Badge>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleViewWorker(worker.id, (worker as WorkerPaid).registration_type)}
                                      className="h-8 w-8 p-0 hover:bg-muted/50"
                                      title={t("employer.workerSearch.viewWorker")}
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        {t("employer.workerSearch.showing")} {pagination.from} {t("employer.workerSearch.to")} {pagination.to} {t("employer.workerSearch.of")} {pagination.total} {t("employer.workerSearch.results")}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="h-8 text-xs"
                        >
                          {t("employer.workerSearch.previous")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))}
                          disabled={currentPage === pagination.last_page}
                          className="h-8 text-xs"
                        >
                          {t("employer.workerSearch.next")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Authenticated Tab - Similar changes, but I'll show the key parts */}
              <TabsContent value="authenticated" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">{t("employer.workerSearch.myWorkers")}</h3>
                    <Badge variant="outline" className="text-[10px]">
                      {t("employer.workerSearch.fullAccess")}
                    </Badge>
                  </div>

                  {/* Workers Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.worker")}
                          </th>
                          <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.type")}
                          </th>
                          <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.experienceHeader")}
                          </th>
                          <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.contact")}
                          </th>
                          <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.salaryRangeHeader")}
                          </th>
                          <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.languagesHeader")}
                          </th>
                          <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.rating")}
                          </th>
                          <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.status")}
                          </th>
                          <th className="text-right py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("employer.workerSearch.actions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {workers.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center py-8">
                              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">{t("employer.workerSearch.noWorkersFound")}</p>
                            </td>
                          </tr>
                        ) : (
                          workers.map((worker) => {
                            // Check if worker has the authenticated properties
                            const hasAuthFields = 'registration_type' in worker && worker.registration_type !== undefined;
                            const isCompanyWorker = hasAuthFields && worker.registration_type === 'company';
                            const hasCompany = hasAuthFields && 'company' in worker && worker.company !== null;
                            
                            return (
                              <tr
                                key={worker.id}
                                className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                              >
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={worker.profile_photo || undefined} />
                                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                        {worker.first_name?.[0] || 'W'}{worker.last_name?.[0] || 'W'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-[10px] font-semibold text-foreground">
                                        {worker.first_name} {worker.last_name}
                                      </p>
                                      <p className="text-[9px] text-muted-foreground">
                                        {t("employer.workerSearch.age")}: {worker.age} • {worker.gender === 'male' ? t("employer.workerSearch.male") : t("employer.workerSearch.female")}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  {hasAuthFields && worker.registration_type && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-[9px] ${getRegistrationTypeBadge(worker.registration_type)}`}
                                    >
                                      {worker.registration_type === 'company' ? (
                                        <div className="flex items-center gap-1">
                                          <Building2 className="w-2.5 h-2.5" />
                                          <span>{t("employer.workerSearch.company")}</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <AlertCircle className="w-2.5 h-2.5" />
                                          <span>{t("employer.workerSearch.freelance")}</span>
                                        </div>
                                      )}
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  <Badge variant="outline" className={`text-[9px] ${getExperienceBadge(worker.experience_level)}`}>
                                    {worker.experience_level === 'beginner' ? t("employer.workerSearch.beginner") :
                                     worker.experience_level === 'intermediate' ? t("employer.workerSearch.intermediate") :
                                     t("employer.workerSearch.expert")}
                                  </Badge>
                                </td>
                                <td className="py-3 px-3">
                                  {hasAuthFields ? (
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-green-600" />
                                        <span className="text-[10px] font-medium">{worker.phone}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Mail className="w-3 h-3 text-blue-600" />
                                        <span className="text-[10px] font-medium truncate max-w-[120px]">
                                          {worker.email}
                                        </span>
                                      </div>
                                      {isCompanyWorker && hasCompany && (
                                        <div className="flex items-center gap-1 mt-1">
                                          <Building2 className="w-3 h-3 text-purple-600" />
                                          <span className="text-[9px] text-purple-600 font-medium">
                                            {worker.company?.business_name}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-amber-600">{t("employer.workerSearch.paymentRequired")}</span>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-1">
                                    <CreditCardIcon className="w-3 h-3 text-green-600" />
                                    <div>
                                      <p className="text-[10px] font-medium">
                                        {formatCurrency(worker.min_salary)} - {formatCurrency(worker.max_salary)}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex flex-wrap gap-1">
                                    {worker.languages_spoken?.slice(0, 2).map((lang, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-[9px]">
                                        {lang}
                                      </Badge>
                                    ))}
                                    {worker.languages_spoken && worker.languages_spoken.length > 2 && (
                                      <span className="text-[9px] text-muted-foreground">
                                        +{worker.languages_spoken.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center justify-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-[10px] font-medium">{(Number(worker.average_rating) || 0).toFixed(1)}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex justify-center">
                                    <Badge className={`text-[9px] ${getStatusBadge(worker.availability_status)}`}>
                                      {worker.availability_status === 'available' ? t("employer.workerSearch.available") :
                                       worker.availability_status === 'hired' ? t("employer.workerSearch.hired") :
                                       worker.availability_status}
                                    </Badge>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleViewWorker(worker.id, (worker as WorkerPaid).registration_type)}
                                      className="h-8 w-8 p-0 hover:bg-muted/50"
                                      title={t("employer.workerSearch.viewWorker")}
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination - same as public tab */}
                  {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        {t("employer.workerSearch.showing")} {pagination.from} {t("employer.workerSearch.to")} {pagination.to} {t("employer.workerSearch.of")} {pagination.total} {t("employer.workerSearch.results")}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="h-8 text-xs"
                        >
                          {t("employer.workerSearch.previous")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))}
                          disabled={currentPage === pagination.last_page}
                          className="h-8 text-xs"
                        >
                          {t("employer.workerSearch.next")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Freelance Contact Payment Modal */}
      {isFreelancePayModalOpen && (
        <Dialog open={isFreelancePayModalOpen} onOpenChange={(open) => { if (!open) handleFreelanceModalClose(); }}>
          <DialogContent className="max-w-xl p-0 z-[9999]" style={{ borderRadius: "12px" }}>
            <div className="sticky top-0 bg-background border-b border-border/50 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">
                      {freelanceStep === 'info' ? 'Contact Details' : 'Unlock Contact'}
                    </h2>
                    <p className="text-xs text-muted-foreground">Freelance worker</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">

              {/* Checking status */}
              {freelanceStep === 'checking' && (
                <div className="flex items-center justify-center py-8 gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Checking payment status...</span>
                </div>
              )}

              {/* Already paid — show contact */}
              {freelanceStep === 'info' && (
                <div className="space-y-3">
                  {unlockedContact ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Phone className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium">{unlockedContact.phone ?? '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">Email</p>
                          <p className="text-sm font-medium">{unlockedContact.email ?? '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <p className="text-xs text-green-700">Contact unlocked successfully.</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      <p className="text-xs text-green-700">You have already paid to view this worker's contact.</p>
                    </div>
                  )}
                  <Button className="w-full h-10 text-sm" onClick={handleOpenDetailsAfterPayment}>
                    View Full Worker Details
                  </Button>
                </div>
              )}

              {freelanceStep === 'payment' && (
                <div className="space-y-5">


                  <h3 className="text-sm font-medium text-gray-800">
                    Please enter your Mobile Money number
                  </h3>


                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">🇷🇼</span>
                    <input
                      id="fl_pay_account"
                      type="tel"
                      placeholder="078XXXXXXX"
                      value={freelancePayAccount}
                      onChange={(e) => setFreelancePayAccount(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    You will receive a payment prompt on this number
                  </p>

                  {freelancePaymentData && (
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">Amount</p>
                      <p className="text-lg font-bold">
                        {freelancePaymentData.amount.toLocaleString()} {freelancePaymentData.currency}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleFreelanceInitiate}
                    disabled={freelanceInitiate.isPending || !freelancePayAccount || freelancePayAccount.length < 10}
                    className="w-full bg-[#FFCC00] hover:bg-[#f0bf00] text-gray-900 font-semibold rounded-none"
                    style={{ fontSize: '13px' }}
                  >
                    {freelanceInitiate.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Pay {freelanceFee != null
                      ? Math.round(freelancePaymentData?.amount ?? freelanceFee).toLocaleString()
                      : '…'} RWF
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    🔒 Secured by MTN Mobile Money
                  </p>
                </div>
              )}


              {freelanceStep === 'polling' && (
                <div className="flex flex-col items-center justify-center gap-5 py-6">
                  <div
                    className="animate-spin"
                    style={{
                      width: 72,
                      height: 72,
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
                    <div className="mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <span className="text-xs text-amber-700 font-medium">⚠️ Please wait and do not close this panel</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 text-sm"
                    onClick={() => { stopFreelancePolling(); setFreelanceStep('payment'); }}
                  >
                    Cancel
                  </Button>
                </div>
              )}

            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Worker Details Modal (Split Photo + Blue Panel Design with Pay with MoMo & Cancel) */}
      {(() => {
        const extractArray = (res: any): any[] => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (Array.isArray(res.data)) return res.data;
          if (Array.isArray(res.data?.data)) return res.data.data;
          return [];
        };

        const currentWorkers = activeTab === 'public' ? extractArray(publicSearch.data) : extractArray(authenticatedSearch.data);
        const fallbackWorkers = extractArray(workers);
        const allWorkers = [...currentWorkers, ...fallbackWorkers];
        const rawWorker = allWorkers.find((w: any) => Number(w.id) === Number(selectedWorkerId));

        const modalWorker: any = rawWorker ? {
          id: rawWorker.id,
          firstName: rawWorker.first_name || rawWorker.user?.name || rawWorker.firstName || 'Worker',
          lastName: rawWorker.last_name || '',
          photo: rawWorker.profile_photo || rawWorker.user?.avatar || rawWorker.photo,
          rating: parseFloat(String(rawWorker.average_rating || rawWorker.rating || 5.0)),
          reviewCount: rawWorker.review_count || rawWorker.reviewCount || 12,
          salaryMin: rawWorker.salary_min || rawWorker.expected_salary || 80000,
          salaryMax: rawWorker.salary_max || (rawWorker.expected_salary ? Math.round(rawWorker.expected_salary * 1.5) : 120000),
          experienceLevel: rawWorker.experience_level || 'Experienced',
          location: rawWorker.district || rawWorker.location || 'Kigali',
          languages: rawWorker.languages || ['Kinyarwanda', 'English'],
          availability: rawWorker.availability_status || 'available',
          age: rawWorker.age || 25,
          fee: rawWorker.contact_unlock_fee || 5000,
        } : null;

        return (
          <WorkerDetailModal
            worker={modalWorker}
            isOpen={isDetailsModalOpen}
            onClose={() => { setIsDetailsModalOpen(false); setUnlockedContact(null); }}
            isAuthenticated={true}
          />
        );
      })()}
    </>
  );
};

export default WorkerSearchContent;