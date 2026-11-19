import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
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
  PiggyBank,
  CheckCircle2,
  FileText,
  MoreVertical,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet as WalletIcon,
  Phone,
  Calendar,
  Clock,
  Plus,
  Banknote,
  Smartphone,
  X,
  Loader2,
  CreditCardIcon,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { downloadReceiptPdf } from "@/utils/pdfGenerator";

export type TransactionType = "payment" | "withdrawal" | "saving";

export interface WalletTransaction {
  id: string | number;
  reference_id: string;
  date: string; // ISO date string
  time?: string;
  type: TransactionType;
  sender_name: string;
  sender_phone?: string;
  sender_photo?: string | null;
  direction: "in" | "out"; // 'in' = received (+), 'out' = withdraw / saved (-)
  amount: number;
  balance: number; // Running wallet balance after this transaction
  payment_method: string;
  status: "successful" | "completed" | "pending";
  description: string;
}

export interface SavingsConfig {
  enabled: boolean;
  type: "fixed" | "percentage";
  amount: number;
  percentage: number;
  goal_name: string;
  total_accumulated: number;
  updated_at: string;
}

export interface MokashSavingsRecord {
  id: string;
  reference_id: string;
  date: string;
  time?: string;
  salary_cycle: string;
  employer_name: string;
  account: string;
  phone: string;
  goal: string;
  amount: number;
  balance_after: number;
  status: "Secured in MoKash" | "Pending Transfer";
}

const DEFAULT_SAVINGS_CONFIG: SavingsConfig = {
  enabled: false,
  type: "fixed",
  amount: 0,
  percentage: 0,
  goal_name: "Ekaze Wallet Savings",
  total_accumulated: 0,
  updated_at: new Date().toISOString(),
};

const Wallet = () => {
  const { user } = useAuth();
  const { data: paymentSettingsRes } = usePaymentSettings();
  const minWithdrawalLimit = Number(paymentSettingsRes?.data?.min_withdrawal_amount) || 500;
  const maxWithdrawalLimit = Number(paymentSettingsRes?.data?.max_withdrawal_amount) || 2000000;
  const minSavingLimit = Number(paymentSettingsRes?.data?.min_saving_amount) || 500;
  const maxSavingLimit = Number(paymentSettingsRes?.data?.max_saving_amount) || 1000000;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"payments" | "savings">("payments");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "amount">("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Withdrawal modal states
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawSource, setWithdrawSource] = useState<"account" | "savings">("account");
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
  const [withdrawPhone, setWithdrawPhone] = useState<string>(user?.phone || "");
  const [withdrawMethod, setWithdrawMethod] = useState<string>("MTN Mobile Money");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalStatus, setWithdrawalStatus] = useState<"idle" | "otp" | "polling" | "SUCCESSFUL" | "FAILED">("idle");
  const [withdrawOtpCode, setWithdrawOtpCode] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [isRequestingWithdrawOtp, setIsRequestingWithdrawOtp] = useState(false);
  const withdrawTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Custom added transactions stored in localStorage per user
  const [customTransactions, setCustomTransactions] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    try {
      localStorage.removeItem("worker_custom_transactions");
      localStorage.removeItem("worker_mokash_savings");
      if (user?.id) {
        localStorage.removeItem(`worker_custom_transactions_${user.id}`);
        const userStorageKey = `worker_mokash_savings_${user.id}`;
        const saved = localStorage.getItem(userStorageKey);
        if (saved && (saved.includes("Jean Claude") || saved.includes("MKS-2026-8819"))) {
          localStorage.removeItem(userStorageKey);
          setMokashRecords([]);
        }
      }
    } catch {
      // ignore
    }
    setCustomTransactions([]);
  }, [user?.id]);

  // Savings settings state
  const [savingsConfig, setSavingsConfig] = useState<SavingsConfig>(() => {
    try {
      const userKey = user?.id ? `worker_savings_config_${user.id}` : "worker_savings_config";
      const saved = localStorage.getItem(userKey);
      return saved ? JSON.parse(saved) : DEFAULT_SAVINGS_CONFIG;
    } catch {
      return DEFAULT_SAVINGS_CONFIG;
    }
  });

  // Editing form states
  const [savingsInputAmount, setSavingsInputAmount] = useState<number | "">("");
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [autoEnabled, setAutoEnabled] = useState<boolean>(savingsConfig.enabled);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // MoKash Savings Table & Filter states
  const [savingsSearchTerm, setSavingsSearchTerm] = useState("");
  const [savingsStatusFilter, setSavingsStatusFilter] = useState("all");
  const [savingsSortBy, setSavingsSortBy] = useState<"recent" | "oldest" | "amount">("recent");
  const [savingsCurrentPage, setSavingsCurrentPage] = useState(1);
  const [savingsPerPage, setSavingsPerPage] = useState(20);
  const [selectedSavingsIds, setSelectedSavingsIds] = useState<Set<string>>(new Set());

  // MoKash savings records stored in localStorage per user (defaults to empty, NO hardcode)
  const [mokashRecords, setMokashRecords] = useState<MokashSavingsRecord[]>(() => {
    try {
      const storageKey = user?.id ? `worker_mokash_savings_${user.id}` : "worker_mokash_savings";
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && !parsed.some((r: any) => r.employer_name?.includes("Jean Claude"))) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    return [];
  });

  // Fetch active job for base salary context (isolated per authenticated user)
  const { data: employmentsData } = useQuery({
    queryKey: ["worker", "wallet", "employments", user?.id],
    queryFn: async () => {
      try {
        const res = await api.get("/worker/employments");
        const list = res.data?.data?.data || res.data?.data || [];
        if (Array.isArray(list) && list.length > 0) return list;
      } catch {
        // ignore
      }
      try {
        const dashRes = await api.get("/worker/dashboard");
        const curEmp = dashRes?.data?.data?.current_employment;
        if (curEmp) {
          return [curEmp];
        }
      } catch {
        // ignore
      }
      return [];
    },
    staleTime: 5000,
  });

  // Fetch worker extended profile to get actual savings config (isolated per user)
  const { data: extProfileData } = useQuery({
    queryKey: ["worker", "wallet", "extended-profile", user?.id],
    queryFn: async () => {
      try {
        const res = await api.get("/worker/extended-profile");
        return res.data?.data || null;
      } catch {
        return null;
      }
    },
    staleTime: 5000,
  });

  // Fetch worker profile & balances directly from backend
  const { data: workerProfileData } = useQuery({
    queryKey: ["worker", "wallet", "profile", user?.id],
    queryFn: async () => {
      try {
        const res = await api.get("/worker/profile");
        return res.data?.data || null;
      } catch {
        return null;
      }
    },
    staleTime: 5000,
  });

  // Fetch real worker transactions from backend
  const { data: workerTxRes } = useQuery({
    queryKey: ["worker", "wallet", "transactions", user?.id],
    queryFn: async () => {
      try {
        const res = await api.get("/worker/transactions?per_page=100");
        return res.data || null;
      } catch {
        return null;
      }
    },
    staleTime: 5000,
  });

  useEffect(() => {
    if (extProfileData?.savings_config) {
      const cfg = extProfileData.savings_config;
      setSavingsConfig(cfg);
      setAutoEnabled(Boolean(cfg.enabled && Number(cfg.amount || 0) > 0));
    }
  }, [extProfileData]);

  const activeEmployment = Array.isArray(employmentsData)
    ? (employmentsData.find((e: any) => String(e.status || "").toLowerCase() === "active") || employmentsData[0] || null)
    : null;

  const employerName =
    activeEmployment?.employer?.name ||
    activeEmployment?.employer?.user?.name ||
    "";
  const employerPhone =
    activeEmployment?.employer?.phone ||
    activeEmployment?.employer?.user?.phone ||
    "";
  const employerPhoto =
    activeEmployment?.employer?.profile_photo ||
    activeEmployment?.employer?.user?.profile_photo ||
    null;

  const baseSalary = activeEmployment
    ? Number(activeEmployment.monthly_salary || activeEmployment.agreed_salary || 0)
    : Number(workerProfileData?.expected_salary || 0);

  const monthlySavingsAmount = Number(savingsConfig.amount || 0);
  const calculatedCut = Math.min(monthlySavingsAmount, baseSalary);
  const calculatedNetPayout = Math.max(0, baseSalary - calculatedCut);
  const effectiveMaxSaving = baseSalary > 0 ? baseSalary : maxSavingLimit;

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return `RF ${new Intl.NumberFormat("en-RW", { maximumFractionDigits: 0 }).format(num || 0)}`;
  };

  // 1. Payment History transactions from real backend ledger (salary payments & withdrawals)
  const allTransactions: WalletTransaction[] = useMemo(() => {
    const rawList: any[] = workerTxRes?.data?.data || [];
    const mapped: Omit<WalletTransaction, "balance">[] = rawList
      .filter((tx: any) => {
        const t = String(tx.transaction_type || "").toLowerCase();
        return t === "salary_received" || t === "salary_payment" || t === "withdrawal";
      })
      .map((tx: any) => {
        const t = String(tx.transaction_type || "").toLowerCase();
        const isWithdrawal = t === "withdrawal";
        const meta = tx.metadata || {};
        const creditedAmt = !isWithdrawal && meta.wallet_credited !== undefined
          ? Number(meta.wallet_credited)
          : Number(tx.amount || 0);
        return {
          id: tx.id,
          reference_id: tx.transaction_id || tx.payment_reference || `TXN-${tx.id}`,
          date: tx.created_at || new Date().toISOString(),
          type: isWithdrawal ? "withdrawal" : "payment",
          sender_name: isWithdrawal
            ? `MTN MoMo (${meta.source === "savings" ? "From Savings" : "Wallet"})`
            : (meta.employer_name || tx.employer?.name || employerName || "Employer"),
          sender_phone: tx.payment_phone || meta.phone || tx.employer?.phone || user?.phone || "",
          sender_photo: isWithdrawal ? null : employerPhoto,
          direction: isWithdrawal ? "out" : "in",
          amount: creditedAmt,
          payment_method: tx.payment_method === "mtn_momo" ? "MTN Mobile Money" : (tx.payment_method || "MTN Mobile Money"),
          status: tx.status === "completed" ? "completed" : "successful",
          description: tx.description || (isWithdrawal ? "MTN MoMo Cash-Out" : "Monthly Salary Payment"),
        };
      });

    const combined = [...mapped, ...customTransactions];

    // Sort chronologically ascending to calculate accurate running balance
    combined.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let running = 0;
    const computed: WalletTransaction[] = combined.map((tx) => {
      if (tx.direction === "in") {
        running += tx.amount;
      } else {
        running = Math.max(0, running - tx.amount);
      }
      return {
        ...tx,
        balance: running,
      };
    });

    return computed;
  }, [
    workerTxRes,
    employerName,
    employerPhoto,
    user?.phone,
    customTransactions,
  ]);

  // Populate backend-backed savings ledger records from salary transactions that included a savings deduction
  const backendSavingsRecords: MokashSavingsRecord[] = useMemo(() => {
    const rawList: any[] = workerTxRes?.data?.data || [];
    const list: MokashSavingsRecord[] = [];
    let runningSav = 0;
    const chrono = [...rawList]
      .filter((tx: any) => Number(tx.metadata?.savings_credited || 0) > 0)
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    for (const tx of chrono) {
      const amt = Number(tx.metadata?.savings_credited || 0);
      runningSav = tx.metadata?.savings_balance_after !== undefined
        ? Number(tx.metadata.savings_balance_after)
        : runningSav + amt;
      const d = new Date(tx.created_at || Date.now());
      list.push({
        id: `sav-${tx.id}`,
        reference_id: tx.transaction_id || `SAV-${tx.id}`,
        date: tx.created_at || new Date().toISOString(),
        time: isValid(d) ? format(d, "hh:mm a") : undefined,
        salary_cycle: isValid(d) ? format(d, "MMMM yyyy") : "Monthly",
        employer_name: tx.metadata?.employer_name || employerName || "Employer",
        account: "Ekaze Wallet Savings",
        phone: tx.payment_phone || user?.phone || "",
        goal: savingsConfig.goal_name || "Ekaze Wallet Savings",
        amount: amt,
        balance_after: runningSav,
        status: "Secured in Ekaze Wallet" as any,
      });
    }
    return list;
  }, [workerTxRes, employerName, user?.phone, savingsConfig.goal_name]);

  // Authoritative wallet & savings balances from backend DB, falling back cleanly to ledger sums
  const currentAvailableBalance = useMemo(() => {
    const dbWallet = workerProfileData?.wallet_balance ?? workerTxRes?.summary?.wallet_balance;
    if (dbWallet !== undefined && dbWallet !== null) {
      return Number(dbWallet);
    }
    if (allTransactions.length === 0) return 0;
    return allTransactions[allTransactions.length - 1].balance;
  }, [workerProfileData, workerTxRes, allTransactions]);

  const currentSavingsBalance = useMemo(() => {
    const dbSavings =
      workerProfileData?.savings_balance ??
      workerTxRes?.summary?.savings_balance ??
      extProfileData?.savings_balance ??
      savingsConfig.total_accumulated ??
      workerProfileData?.extended_profile?.savings_config?.total_accumulated;
    if (dbSavings !== undefined && dbSavings !== null) {
      return Number(dbSavings);
    }
    const records = backendSavingsRecords.length > 0 ? backendSavingsRecords : mokashRecords;
    if (records.length > 0) {
      return Number(records[records.length - 1].balance_after || 0);
    }
    return 0;
  }, [workerProfileData, workerTxRes, extProfileData, savingsConfig.total_accumulated, backendSavingsRecords, mokashRecords]);

  const activeWithdrawBalance =
    withdrawSource === "savings" ? currentSavingsBalance : currentAvailableBalance;

  useMemo(() => {
  }, [allTransactions]);

  // Filtered and sorted transactions for Payment History table display
  const displayedTransactions = useMemo(() => {
    let list = [...allTransactions];

    // Filter by Type: only payment or withdrawal
    if (typeFilter !== "all") {
      list = list.filter((t) => t.type === typeFilter);
    }

    // Filter by search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.reference_id.toLowerCase().includes(q) ||
          t.sender_name.toLowerCase().includes(q) ||
          (t.sender_phone && t.sender_phone.toLowerCase().includes(q)) ||
          t.payment_method.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q)
      );
    }

    // Sorting (default to Most Recent first)
    if (sortBy === "amount") {
      list.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "oldest") {
      list.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else {
      list.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    return list;
  }, [allTransactions, typeFilter, searchTerm, sortBy]);

  const paginatedPaymentTransactions = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return displayedTransactions.slice(start, start + perPage);
  }, [displayedTransactions, currentPage, perPage]);

  const paymentLastPage = Math.max(1, Math.ceil(displayedTransactions.length / perPage));

  const allActiveIds = displayedTransactions.map((item) => item.id);
  const allSelected =
    allActiveIds.length > 0 && allActiveIds.every((id) => selectedIds.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allActiveIds));
    }
  };

  const toggleOne = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered and sorted MoKash Savings Records
  const displayedSavingsRecords = useMemo(() => {
    const sourceRecords = backendSavingsRecords.length > 0 ? backendSavingsRecords : mokashRecords;
    let list = [...sourceRecords];

    if (savingsStatusFilter !== "all") {
      list = list.filter((r) => r.status === savingsStatusFilter);
    }

    if (savingsSearchTerm.trim()) {
      const q = savingsSearchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.reference_id.toLowerCase().includes(q) ||
          r.goal.toLowerCase().includes(q) ||
          r.employer_name.toLowerCase().includes(q) ||
          r.salary_cycle.toLowerCase().includes(q) ||
          r.account.toLowerCase().includes(q) ||
          (r.phone && r.phone.toLowerCase().includes(q))
      );
    }

    if (savingsSortBy === "amount") {
      list.sort((a, b) => b.amount - a.amount);
    } else if (savingsSortBy === "oldest") {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return list;
  }, [mokashRecords, savingsStatusFilter, savingsSearchTerm, savingsSortBy]);

  const paginatedSavings = useMemo(() => {
    const start = (savingsCurrentPage - 1) * savingsPerPage;
    return displayedSavingsRecords.slice(start, start + savingsPerPage);
  }, [displayedSavingsRecords, savingsCurrentPage, savingsPerPage]);

  const savingsLastPage = Math.max(1, Math.ceil(displayedSavingsRecords.length / savingsPerPage));

  const allActiveSavingsIds = displayedSavingsRecords.map((item) => item.id);
  const allSavingsSelected =
    allActiveSavingsIds.length > 0 &&
    allActiveSavingsIds.every((id) => selectedSavingsIds.has(id));

  const toggleAllSavings = () => {
    if (allSavingsSelected) {
      setSelectedSavingsIds(new Set());
    } else {
      setSelectedSavingsIds(new Set(allActiveSavingsIds));
    }
  };

  const toggleOneSavings = (id: string) => {
    setSelectedSavingsIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveMokashAmount = async () => {
    const num = Number(savingsInputAmount);
    const minLimit = minSavingLimit > 0 ? minSavingLimit : 100;
    if (!num || num < minLimit) {
      toast({
        title: "Invalid Amount",
        description: `Minimum savings amount is ${formatCurrency(minLimit)}.`,
        variant: "destructive",
      });
      return;
    }
    if (baseSalary > 0 && num > baseSalary) {
      toast({
        title: "Exceeds Salary",
        description: `Savings amount cannot exceed your monthly salary of ${formatCurrency(baseSalary)}.`,
        variant: "destructive",
      });
      return;
    }

    setIsSavingConfig(true);
    try {
      const updated: SavingsConfig = {
        enabled: true,
        type: "fixed",
        amount: num,
        percentage: baseSalary > 0 ? Math.round((num / baseSalary) * 100) : 0,
        goal_name: "Ekaze Wallet Savings",
        total_accumulated: Number(currentSavingsBalance || savingsConfig.total_accumulated || 0),
        updated_at: new Date().toISOString(),
      };

      await api.put("/worker/extended-profile", {
        savings_config: updated,
      });

      setSavingsConfig(updated);
      setAutoEnabled(true);
      localStorage.setItem("worker_savings_config", JSON.stringify(updated));
      if (user?.id) {
        localStorage.setItem(`worker_savings_config_${user.id}`, JSON.stringify(updated));
      }

      queryClient.invalidateQueries({ queryKey: ["worker", "wallet"] });
      setShowSavingsModal(false);
      toast({
        title: "Ekaze Wallet Savings Set",
        description: `Each month, ${formatCurrency(num)} will be automatically saved into your Ekaze Wallet savings account.`,
      });
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err?.response?.data?.message || "Failed to update Ekaze Wallet savings setting.",
        variant: "destructive",
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleStopSaving = async () => {
    setIsSavingConfig(true);
    try {
      const updated: SavingsConfig = {
        ...savingsConfig,
        enabled: false,
        amount: 0,
        updated_at: new Date().toISOString(),
      };

      await api.put("/worker/extended-profile", {
        savings_config: updated,
      });

      setSavingsConfig(updated);
      setAutoEnabled(false);
      setSavingsInputAmount("");
      localStorage.setItem("worker_savings_config", JSON.stringify(updated));
      if (user?.id) {
        localStorage.setItem(`worker_savings_config_${user.id}`, JSON.stringify(updated));
      }

      queryClient.invalidateQueries({ queryKey: ["worker", "wallet"] });
      setShowSavingsModal(false);
      toast({
        title: "Savings Stopped",
        description: "Automatic Ekaze Wallet savings deduction has been stopped.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to stop savings.",
        variant: "destructive",
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleDownloadMokashReceipt = (rec: MokashSavingsRecord) => {
    try {
      downloadReceiptPdf({
        reference_id: rec.reference_id,
        date: rec.date,
        type: "saving",
        transaction_type: "saving",
        description: `Automatic Salary Deduction deposited into Ekaze Wallet (${rec.goal})`,
        amount: rec.amount,
        direction: "out",
        payment_method: "Ekaze Wallet",
        sender_name: rec.employer_name || "Employer Salary",
        sender_phone: rec.phone || withdrawPhone,
        worker_name: user?.name,
        worker_phone: user?.phone,
        status: "successful",
      });

      toast({
        title: "MoKash Receipt Downloaded",
        description: `Receipt for MoKash reference ${rec.reference_id} downloaded successfully.`,
      });
    } catch {
      toast({
        title: "Download Failed",
        description: "Could not generate MoKash receipt.",
        variant: "destructive",
      });
    }
  };

  // Step 1: Validate withdrawal inputs and send SMS OTP before disbursement
  const handleInitiateWithdrawal = async () => {
    const numAmount = Number(withdrawAmount);
    const minLimit = minWithdrawalLimit > 0 ? minWithdrawalLimit : 100;
    if (!numAmount || numAmount < minLimit) {
      const msg = `Minimum withdrawal amount is ${formatCurrency(minLimit)}.`;
      setWithdrawError(msg);
      toast({ title: "Invalid Amount", description: msg, variant: "destructive" });
      return;
    }

    if (numAmount > activeWithdrawBalance) {
      const msg = `Maximum withdrawal amount from ${withdrawSource === "savings" ? "Savings" : "Your Account"} is ${formatCurrency(activeWithdrawBalance)}.`;
      setWithdrawError(msg);
      toast({ title: "Insufficient Balance", description: msg, variant: "destructive" });
      return;
    }

    try {
      setIsRequestingWithdrawOtp(true);
      setWithdrawError("");
      const res = await api.post("/worker/withdraw/request-otp", {
        phone_number: withdrawPhone.trim(),
        amount: numAmount,
        source: withdrawSource,
      });
      toast({
        title: "OTP Sent",
        description: res.data?.message || `6-digit SMS OTP sent to ${withdrawPhone}.`,
      });
      setWithdrawOtpCode("");
      setWithdrawalStatus("otp");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to send SMS OTP to your MTN number.";
      setWithdrawError(msg);
      toast({ title: "OTP Failed", description: msg, variant: "destructive" });
    } finally {
      setIsRequestingWithdrawOtp(false);
    }
  };

  // Step 2: Verify OTP & disburse withdrawal via MTN MoMo
  const handleConfirmWithdrawalWithOtp = async () => {
    const cleanOtp = withdrawOtpCode.replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setWithdrawError("Please enter the 6-digit SMS OTP code sent to your MTN phone.");
      return;
    }

    try {
      setIsWithdrawing(true);
      setWithdrawError("");
      setWithdrawalStatus("polling");
      const res = await api.post("/worker/withdraw", {
        amount: Number(withdrawAmount),
        phone_number: withdrawPhone.trim(),
        source: withdrawSource,
        otp_code: cleanOtp,
      });
      setWithdrawalStatus("SUCCESSFUL");
      queryClient.invalidateQueries({ queryKey: ["worker", "wallet"] });
      toast({
        title: "Withdrawal Successful",
        description: res.data?.message || `${formatCurrency(Number(withdrawAmount))} sent to ${withdrawPhone}.`,
      });
      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawalStatus("idle");
        setWithdrawOtpCode("");
      }, 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Withdrawal failed. Please try again.";
      setWithdrawError(msg);
      setWithdrawalStatus("otp");
      toast({ title: "Withdrawal Failed", description: msg, variant: "destructive" });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleCancelWithdrawal = () => {
    if (withdrawTimerRef.current) clearTimeout(withdrawTimerRef.current);
    setWithdrawalStatus("idle");
    setWithdrawOtpCode("");
    setWithdrawError("");
  };

  const handleDownloadReceipt = (tx: WalletTransaction) => {
    try {
      downloadReceiptPdf({
        reference_id: tx.reference_id,
        date: tx.date || tx.created_at,
        created_at: tx.created_at,
        type: tx.type,
        transaction_type: tx.type,
        description: tx.description,
        amount: tx.amount,
        direction: tx.direction,
        sender_name: tx.sender_name,
        sender_phone: tx.sender_phone,
        worker_name: user?.name,
        worker_phone: user?.phone,
        balance: tx.balance,
        payment_method: tx.payment_method,
      });

      toast({
        title: "Receipt Downloaded",
        description: `Official receipt for ${tx.reference_id} downloaded.`,
      });
    } catch {
      toast({
        title: "Download Failed",
        description: "Could not generate PDF receipt.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full bg-white space-y-0">
      {/* Top Header */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb title="Wallet" />

        {/* â”€â”€ Underline Tabs & Withdraw Action Button â”€â”€ */}
        <div className="border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => {
                setActiveTab("payments");
                setCurrentPage(1);
              }}
              className={`pb-3 text-sm font-semibold transition-all border-b-2 bg-transparent cursor-pointer flex items-center gap-2 border-0 ${activeTab === "payments"
                ? "border-b-2 border-[#2478b8] text-[#2478b8] font-bold"
                : "border-b-2 border-transparent text-slate-500 hover:text-slate-900"
                }`}
            >
              <span>Payment History</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "payments"
                  ? "bg-[#2478b8]/10 text-[#2478b8]"
                  : "bg-slate-100 text-slate-600"
                  }`}
              >
                {allTransactions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("savings");
                setCurrentPage(1);
              }}
              className={`pb-3 text-sm font-semibold transition-all border-b-2 bg-transparent cursor-pointer flex items-center gap-2 border-0 ${activeTab === "savings"
                ? "border-b-2 border-[#2478b8] text-[#2478b8] font-bold"
                : "border-b-2 border-transparent text-slate-500 hover:text-slate-900"
                }`}
            >
              <span>Savings</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${savingsConfig.enabled
                  ? "bg-slate-100 text-slate-700"
                  : "bg-slate-100 text-slate-600"
                  }`}
              >
                {savingsConfig.enabled ? "Active" : "Paused"}
              </span>
            </button>
          </div>

          {/* Quick Action Button */}
          <div className="pb-2">
            {activeTab === "savings" ? (
              <Button
                size="sm"
                onClick={() => {
                  if (savingsConfig.enabled && Number(savingsConfig.amount) > 0) {
                    setSavingsInputAmount(Number(savingsConfig.amount));
                  } else {
                    setSavingsInputAmount("");
                  }
                  setShowSavingsModal(true);
                }}
                className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <PiggyBank className="w-3.5 h-3.5" />
                <span>Set Ekaze Wallet Savings</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setWithdrawAmount("");
                  setWithdrawOtpCode("");
                  setWithdrawError("");
                  setWithdrawalStatus("idle");
                  if (!withdrawPhone && user?.phone) {
                    setWithdrawPhone(user.phone);
                  }
                  setShowWithdrawModal(true);
                }}
                className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Withdraw Funds</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: PAYMENT HISTORY */}
      {activeTab === "payments" ? (
        <div className="w-full bg-white border-t border-slate-200">
          <StudioFilterBar
            categories={[
              {
                id: "typeFilter",
                label: "Transaction Type",
                options: [
                  { value: "all", label: "All Transactions" },
                  { value: "payment", label: "Payment Received (Employer)" },
                  { value: "withdrawal", label: "Withdrawal (MoMo)" },
                ],
              },
              {
                id: "sortBy",
                label: "Sort By",
                options: [
                  { value: "recent", label: "Most Recent" },
                  { value: "oldest", label: "Oldest First" },
                  { value: "amount", label: "Highest Amount" },
                ],
              },
            ]}
            activeFilters={{
              typeFilter: typeFilter || "all",
              sortBy: sortBy || "recent",
            }}
            onFilterChange={(catId, val) => {
              if (catId === "typeFilter") setTypeFilter(val as any);
              if (catId === "sortBy") setSortBy(val as any);
              setCurrentPage(1);
            }}
            searchTerm={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            onClearAll={() => {
              setSearchTerm("");
              setTypeFilter("all");
              setSortBy("recent");
              setCurrentPage(1);
            }}
          />

          {displayedTransactions.length === 0 ? (
            <CharacterIllustration
              type="transactions"
              title="No transactions found"
              description="No salary payments or withdrawals recorded yet."
            />
          ) : (
            <div className="overflow-x-auto w-full">
              <Table className="w-full min-w-[950px] border-collapse">
                <TableHeader className="bg-transparent border-b border-slate-200">
                  <TableRow className="hover:bg-transparent border-b border-slate-200">
                    <TableHead className="w-10 pl-2">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleAll}
                        className="border-slate-400 rounded-sm"
                      />
                    </TableHead>

                    <TableHead className="text-xs font-semibold text-slate-600">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Time
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Type
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Sender / Beneficiary
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Phone Number
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Amount
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Balance
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Payment Method
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 text-right pr-2">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedPaymentTransactions.map((tx) => {
                    const isSelected = selectedIds.has(tx.id);
                    const txDate = new Date(tx.date);
                    const dateFormatted = isValid(txDate)
                      ? format(txDate, "MMM dd, yyyy")
                      : tx.date;
                    const timeFormatted = isValid(txDate)
                      ? format(txDate, "hh:mm a")
                      : tx.time || "12:00 PM";

                    return (
                      <TableRow
                        key={tx.id}
                        className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/50" : ""
                          }`}
                      >
                        {/* Checkbox */}
                        <TableCell className="w-10 pl-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleOne(tx.id)}
                            className="border-slate-400 rounded-sm"
                          />
                        </TableCell>

                        {/* Date column */}
                        <TableCell className="py-3 text-xs text-slate-700 font-medium whitespace-nowrap">
                          {dateFormatted}
                        </TableCell>

                        {/* Time column */}
                        <TableCell className="py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                          {timeFormatted}
                        </TableCell>

                        {/* Type badge (Payments received & Withdrawals ONLY) */}
                        <TableCell className="py-3">
                          {tx.type === "payment" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              <ArrowDownLeft className="w-3 h-3 text-slate-500" />
                              Payment
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              <ArrowUpRight className="w-3 h-3 text-slate-500" />
                              Withdraw
                            </span>
                          )}
                        </TableCell>

                        {/* Sender / Beneficiary Name */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2.5 min-w-[150px]">
                            {tx.type === "withdrawal" ? (
                              <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                                <ArrowUpRight className="w-4 h-4" />
                              </div>
                            ) : tx.sender_photo ? (
                              <img
                                src={tx.sender_photo}
                                alt={tx.sender_name}
                                className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <Avatar className="h-7 w-7 border border-slate-200 shrink-0">
                                <AvatarFallback className="p-0 bg-transparent border-none">
                                  <DefaultAvatarSVG className="w-full h-full" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {tx.sender_name}
                            </span>
                          </div>
                        </TableCell>

                        {/* Phone Number */}
                        <TableCell className="py-3 text-xs text-slate-600 font-mono whitespace-nowrap">
                          {tx.sender_phone || "N/A"}
                        </TableCell>

                        {/* Amount: Received / Withdrew */}
                        <TableCell className="py-3 whitespace-nowrap">
                          {tx.type === "payment" ? (
                            <span className="text-xs font-semibold text-slate-900 font-mono">
                              Received {formatCurrency(tx.amount)}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-900 font-mono">
                              Withdrew {formatCurrency(tx.amount)}
                            </span>
                          )}
                        </TableCell>

                        {/* Balance column */}
                        <TableCell className="py-3 font-mono whitespace-nowrap">
                          <span className="text-xs font-bold text-slate-900">
                            {formatCurrency(tx.balance)}
                          </span>
                        </TableCell>

                        {/* Payment Method column */}
                        <TableCell className="py-3 text-xs text-slate-700 font-medium whitespace-nowrap">
                          {tx.payment_method}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right pr-2 py-3">
                          <CustomDropdown
                            widthClass="w-48"
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
                                label: "Download Receipt",
                                onClick: () => handleDownloadReceipt(tx),
                              },
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <YouTubeStudioPagination
                currentPage={currentPage}
                lastPage={paymentLastPage}
                perPage={perPage}
                total={displayedTransactions.length}
                onPageChange={(p) => setCurrentPage(p)}
                onPerPageChange={(pp) => {
                  setPerPage(pp);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: SAVINGS (MTN MoKash) */
        <div className="w-full bg-white border-t border-slate-200">
          <StudioFilterBar
            categories={[
              {
                id: "statusFilter",
                label: "Status",
                options: [
                  { value: "all", label: "All Statuses" },
                  { value: "Secured in Ekaze Wallet", label: "Secured in Ekaze Wallet" },
                  { value: "Pending Transfer", label: "Pending Transfer" },
                ],
              },
              {
                id: "sortBy",
                label: "Sort By",
                options: [
                  { value: "recent", label: "Most Recent" },
                  { value: "oldest", label: "Oldest First" },
                  { value: "amount", label: "Highest Amount" },
                ],
              },
            ]}
            activeFilters={{
              statusFilter: savingsStatusFilter || "all",
              sortBy: savingsSortBy || "recent",
            }}
            onFilterChange={(catId, val) => {
              if (catId === "statusFilter") setSavingsStatusFilter(val as string);
              if (catId === "sortBy") setSavingsSortBy(val as any);
              setSavingsCurrentPage(1);
            }}
            searchTerm={savingsSearchTerm}
            onSearchChange={(val) => {
              setSavingsSearchTerm(val);
              setSavingsCurrentPage(1);
            }}
            onClearAll={() => {
              setSavingsSearchTerm("");
              setSavingsStatusFilter("all");
              setSavingsSortBy("recent");
              setSavingsCurrentPage(1);
            }}
          />

          {displayedSavingsRecords.length === 0 ? (
            <CharacterIllustration
              type="transactions"
              title="No Ekaze Wallet savings yet"
              description="No automatic deductions saved to your Ekaze Wallet account have been recorded yet."
            />
          ) : (
            <div className="overflow-x-auto w-full">
              <Table className="w-full min-w-[950px] border-collapse">
                <TableHeader className="bg-transparent border-b border-slate-200">
                  <TableRow className="hover:bg-transparent border-b border-slate-200">
                    <TableHead className="w-10 pl-2">
                      <Checkbox
                        checked={allSavingsSelected}
                        onCheckedChange={toggleAllSavings}
                        className="border-slate-400 rounded-sm"
                      />
                    </TableHead>

                    <TableHead className="text-xs font-semibold text-slate-600">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Time
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Deduction Ref
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Ekaze Wallet
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Savings Purpose
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Salary Cycle
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Amount Saved
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Savings Balance
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 text-right pr-2">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedSavings.map((item) => {
                    const isSelected = selectedSavingsIds.has(item.id);
                    const itemDate = new Date(item.date);
                    const dateFormatted = isValid(itemDate)
                      ? format(itemDate, "MMM dd, yyyy")
                      : item.date;
                    const timeFormatted = item.time || (isValid(itemDate) ? format(itemDate, "hh:mm a") : "09:16 AM");

                    return (
                      <TableRow
                        key={item.id}
                        className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${isSelected ? "bg-amber-50/40" : ""
                          }`}
                      >
                        {/* Checkbox */}
                        <TableCell className="w-10 pl-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleOneSavings(item.id)}
                            className="border-slate-400 rounded-sm"
                          />
                        </TableCell>

                        {/* Date */}
                        <TableCell className="py-3 text-xs text-slate-700 font-medium whitespace-nowrap">
                          {dateFormatted}
                        </TableCell>

                        {/* Time */}
                        <TableCell className="py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                          {timeFormatted}
                        </TableCell>

                        {/* Deduction Ref */}
                        <TableCell className="py-3 text-xs font-mono text-slate-900 font-semibold whitespace-nowrap">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                            {item.reference_id}
                          </span>
                        </TableCell>

                        {/* MoKash Account */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-800 font-black text-[10px] flex items-center justify-center border border-amber-300">
                              M
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-slate-900 block">
                                {item.account}
                              </span>
                              <span className="text-[11px] text-slate-500 block font-mono">
                                {item.phone}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* MoKash Purpose */}
                        <TableCell className="py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                            {item.goal}
                          </span>
                        </TableCell>

                        {/* Salary Cycle */}
                        <TableCell className="py-3 text-xs text-slate-700 whitespace-nowrap">
                          {item.salary_cycle}
                        </TableCell>

                        {/* Amount Saved */}
                        <TableCell className="py-3 whitespace-nowrap">
                          <span className="text-xs font-semibold text-slate-900 font-mono">
                            + {formatCurrency(item.amount)}
                          </span>
                        </TableCell>

                        {/* MoKash Balance */}
                        <TableCell className="py-3 font-mono whitespace-nowrap">
                          <span className="text-xs font-bold text-slate-900">
                            {formatCurrency(item.balance_after)}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            <CheckCircle2 className="w-3 h-3 text-slate-500" />
                            {item.status}
                          </span>
                        </TableCell>

                        {/* Actions */}
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
                                label: "Download Savings Receipt",
                                onClick: () => handleDownloadMokashReceipt(item),
                              },
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination matching YouTube Studio standard */}
              <YouTubeStudioPagination
                currentPage={savingsCurrentPage}
                lastPage={savingsLastPage}
                perPage={savingsPerPage}
                total={displayedSavingsRecords.length}
                onPageChange={(p) => setSavingsCurrentPage(p)}
                onPerPageChange={(pp) => {
                  setSavingsPerPage(pp);
                  setSavingsCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* WITHDRAW FUNDS MODAL â€” Matching Screenshot 1 (#226e9f Blue Theme) */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div
            className="max-w-md w-full p-0 overflow-hidden border-0 bg-[#226e9f] text-white shadow-2xl rounded-[4px] relative"
            style={{ borderRadius: '4px' }}
          >
            {/* Header styled with #226e9f Blue Theme */}
            <div className="bg-[#226e9f] text-white px-5 pt-3.5 pb-3 relative border-b border-white/15">
              <button
                type="button"
                onClick={() => {
                  handleCancelWithdrawal();
                  setShowWithdrawModal(false);
                }}
                className="absolute top-4 right-4 p-1 text-white hover:opacity-80 transition-opacity bg-transparent border-0 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5 stroke-[2.5] text-white" />
              </button>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Confirm Withdrawal
              </h3>
              <p className="text-xs text-white/80 mt-1 font-normal">
                {withdrawSource === "savings" ? "Savings Balance (Ekaze Wallet)" : "Account Balance (Ekaze Wallet)"} • {formatCurrency(activeWithdrawBalance)}
              </p>
            </div>

            {withdrawalStatus === 'otp' && (
              <div className="px-5 py-4 space-y-3.5 bg-[#226e9f] text-white">
                <div className="p-3 bg-white/10 rounded-[3px] border border-white/25 text-xs text-white/90">
                  We sent a 6-digit SMS OTP verification code to <strong className="text-white">{withdrawPhone}</strong> to authorize withdrawing <strong className="text-white">{formatCurrency(Number(withdrawAmount))}</strong> from {withdrawSource === "savings" ? "Savings" : "Your Account"}.
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Enter 6-Digit SMS OTP *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={withdrawOtpCode}
                    onChange={(e) => {
                      setWithdrawOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setWithdrawError("");
                    }}
                    placeholder="Enter 6-digit code"
                    className="w-full h-11 px-3 rounded-[3px] text-sm font-mono tracking-widest font-semibold border border-white/30 bg-white/10 text-white placeholder:text-white/50 focus:border-white focus:bg-white/20 outline-none"
                  />
                </div>
                {withdrawError && (
                  <p className="text-xs text-rose-200 font-semibold">{withdrawError}</p>
                )}
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawalStatus("idle");
                      setWithdrawError("");
                    }}
                    className="text-white/80 underline hover:text-white bg-transparent border-0 cursor-pointer p-0"
                  >
                    Change Number / Amount
                  </button>
                  <button
                    type="button"
                    onClick={handleInitiateWithdrawal}
                    disabled={isRequestingWithdrawOtp}
                    className="text-white underline hover:text-white/80 bg-transparent border-0 cursor-pointer p-0 disabled:opacity-50"
                  >
                    {isRequestingWithdrawOtp ? "Sending..." : "Resend OTP"}
                  </button>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmWithdrawalWithOtp}
                    disabled={withdrawOtpCode.length !== 6 || isWithdrawing}
                    className="w-full h-11 bg-[#689f38] hover:bg-[#588a2e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-[3px] transition-colors cursor-pointer border-0 shadow-xs flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Confirm Withdrawal ({formatCurrency(Number(withdrawAmount))})</span>
                  </button>
                </div>
              </div>
            )}

            {/* LOADING / SPINNER WAIT */}
            {withdrawalStatus === 'polling' && (
              <div className="flex flex-col items-center justify-center gap-6 p-8 bg-[#226e9f] text-white">
                <div
                  className="animate-spin"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    border: '5px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#ffffff',
                    borderLeftColor: '#ffffff',
                  }}
                />
                <div className="text-center space-y-1.5">
                  <p className="text-sm font-bold text-white">
                    Check your phone for a pop-up and confirm with your PIN
                  </p>
                  <p className="text-xs text-white/80 leading-relaxed font-normal">
                    No pop-up? Dial <strong className="text-white font-bold">*182*7*1#</strong> and approve the withdrawal
                  </p>
                  <p className="text-xs text-white/70 mt-1 font-light">
                    Please don't leave this page. Funds are not withdrawn until confirmed.
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full h-10 border border-white/30 text-white hover:bg-white/10 rounded-[3px] font-semibold text-xs transition-colors cursor-pointer bg-transparent"
                  onClick={handleCancelWithdrawal}
                >
                  Cancel Withdrawal
                </button>
              </div>
            )}

            {/* â”€â”€ SUCCESSFUL â”€â”€ */}
            {withdrawalStatus === 'SUCCESSFUL' && (
              <div className="flex flex-col items-center gap-3 p-8 text-center bg-[#226e9f] text-white">
                <CheckCircle2 className="h-12 w-12 text-[#689f38]" />
                <p className="font-bold text-base text-white">Withdrawal Successful!</p>
                <p className="text-xs text-white/80">{formatCurrency(withdrawAmount)} has been sent to {withdrawPhone || user?.phone || "your phone"}.</p>
              </div>
            )}

            {/* â”€â”€ IDLE INPUT STATE â”€â”€ */}
            {withdrawalStatus === 'idle' && (
              <div className="px-5 py-4 space-y-3.5 bg-[#226e9f] text-white">
                {/* Source Selector: Get Money from Account or Savings */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Get Money From (Ekaze Wallet) *</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawSource("account");
                        setWithdrawAmount("");
                      }}
                      className={`p-2.5 rounded-[3px] border text-left transition-all cursor-pointer ${
                        withdrawSource === "account"
                          ? "bg-white text-[#226e9f] border-white shadow-xs"
                          : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                      }`}
                    >
                      <span className="block text-xs font-bold">Your Account</span>
                      <span className={`block text-[11px] mt-0.5 font-semibold ${withdrawSource === "account" ? "text-[#226e9f]/80" : "text-white/80"}`}>
                        {formatCurrency(currentAvailableBalance)}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawSource("savings");
                        setWithdrawAmount("");
                      }}
                      className={`p-2.5 rounded-[3px] border text-left transition-all cursor-pointer ${
                        withdrawSource === "savings"
                          ? "bg-white text-[#226e9f] border-white shadow-xs"
                          : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                      }`}
                    >
                      <span className="block text-xs font-bold">From Savings</span>
                      <span className={`block text-[11px] mt-0.5 font-semibold ${withdrawSource === "savings" ? "text-[#226e9f]/80" : "text-white/80"}`}>
                        {formatCurrency(currentSavingsBalance)}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Amount to withdraw */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white">Withdrawal Amount (RWF) *</label>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(activeWithdrawBalance)}
                      className="text-xs font-medium text-white/90 underline hover:text-white cursor-pointer"
                    >
                      Withdraw All
                    </button>
                  </div>
                  <input
                    type="number"
                    min={minWithdrawalLimit > 0 ? minWithdrawalLimit : 100}
                    max={activeWithdrawBalance}
                    value={withdrawAmount}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setWithdrawError("");
                      if (val === "") {
                        setWithdrawAmount("");
                        return;
                      }
                      setWithdrawAmount(Number(val));
                    }}
                    placeholder="Type amount"
                    className="w-full h-11 px-3 rounded-[3px] text-sm font-semibold border border-white/30 bg-white/10 text-white placeholder:text-white/50 focus:border-white focus:bg-white/20 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-white/70">
                    <span>Min: {formatCurrency(minWithdrawalLimit > 0 ? minWithdrawalLimit : 100)}</span>
                    <span>Available: {formatCurrency(activeWithdrawBalance)}</span>
                  </div>
                </div>

                {/* MTN Phone Number (Screenshot 1 Exact Match) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Recipient Phone Number (Any Number) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/80">🇷🇼</span>
                    <input
                      type="tel"
                      value={withdrawPhone}
                      onChange={(e) => {
                        setWithdrawPhone(e.target.value);
                        setWithdrawError("");
                      }}
                      placeholder="Enter any phone number (e.g. 0788000005)"
                      className="w-full pl-9 pr-3 h-11 rounded-[3px] text-sm font-semibold border border-white/30 bg-white/10 text-white placeholder:text-white/50 focus:border-white focus:bg-white/20 outline-none"
                    />
                  </div>
                  <p className="text-xs text-white/80 font-normal">
                    Withdraw directly from {withdrawSource === "savings" ? "your Ekaze Wallet Savings" : "your Ekaze Wallet Account"} to any MTN number. An SMS OTP confirmation will be sent.
                  </p>
                  {withdrawError && (
                    <p className="text-xs text-rose-200 font-semibold">{withdrawError}</p>
                  )}
                </div>

                {/* Submit Button matching Worker Popup Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleInitiateWithdrawal}
                    disabled={
                      !withdrawAmount ||
                      Number(withdrawAmount) < (minWithdrawalLimit > 0 ? minWithdrawalLimit : 100) ||
                      Number(withdrawAmount) > activeWithdrawBalance ||
                      activeWithdrawBalance <= 0 ||
                      !withdrawPhone.trim() ||
                      isRequestingWithdrawOtp
                    }
                    className="w-full h-11 bg-[#689f38] hover:bg-[#588a2e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-[3px] transition-colors cursor-pointer border-0 shadow-xs flex items-center justify-center gap-2"
                  >
                    {isRequestingWithdrawOtp ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <CreditCardIcon className="w-4 h-4 text-white" />
                    )}
                    <span>
                      {isRequestingWithdrawOtp
                        ? "Sending OTP..."
                        : `Withdraw Funds${withdrawAmount ? ` (${formatCurrency(withdrawAmount)})` : ""}`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SET MOKASH SAVINGS MODAL â€” Same Design as Withdraw (#226e9f Blue Theme) */}
      {showSavingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div
            className="max-w-md w-full p-0 overflow-hidden border-0 bg-[#226e9f] text-white shadow-2xl rounded-[4px] relative"
            style={{ borderRadius: '4px' }}
          >
            {/* Header styled with #226e9f Blue Theme */}
            <div className="bg-[#226e9f] text-white px-5 pt-3.5 pb-3 relative border-b border-white/15">
              <button
                type="button"
                onClick={() => setShowSavingsModal(false)}
                className="absolute top-4 right-4 p-1 text-white hover:opacity-80 transition-opacity bg-transparent border-0 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5 stroke-[2.5] text-white" />
              </button>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Set Ekaze Wallet Savings
              </h3>
              <p className="text-xs text-white/80 mt-1 font-normal">
                Monthly Salary • {formatCurrency(baseSalary)}
              </p>
            </div>

            <div className="px-5 py-4 space-y-3.5 bg-[#226e9f] text-white">
              {/* Savings amount input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Monthly Savings Amount (RWF) *</label>
                  {savingsConfig.enabled && Number(savingsConfig.amount) > 0 ? (
                    <button
                      type="button"
                      onClick={handleStopSaving}
                      disabled={isSavingConfig}
                      className="text-xs font-medium text-rose-200 underline hover:text-white cursor-pointer transition-colors"
                    >
                      Stop Saving
                    </button>
                  ) : (
                    <span className="text-xs font-normal text-white/70">
                      No saving set yet
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min={minSavingLimit > 0 ? minSavingLimit : 100}
                  max={effectiveMaxSaving || undefined}
                  value={savingsInputAmount}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setSavingsInputAmount("");
                      return;
                    }
                    setSavingsInputAmount(Number(val));
                  }}
                  placeholder="Type amount"
                  className="w-full h-11 px-3 rounded-[3px] text-sm font-semibold border border-white/30 bg-white/10 text-white placeholder:text-white/50 focus:border-white focus:bg-white/20 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="flex items-center justify-between text-[11px] text-white/70">
                  <span>Min: {formatCurrency(minSavingLimit > 0 ? minSavingLimit : 100)}</span>
                  <span>Max: {formatCurrency(effectiveMaxSaving)}</span>
                </div>
                {Number(savingsInputAmount) > baseSalary && baseSalary > 0 && (
                  <p className="text-xs text-amber-300 font-semibold mt-1">
                    Savings cannot exceed your salary of {formatCurrency(baseSalary)}.
                  </p>
                )}
              </div>

              {/* MTN MoKash Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Ekaze Wallet Account *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/80">🇷🇼</span>
                  <input
                    type="tel"
                    readOnly
                    value={withdrawPhone || user?.phone || ""}
                    className="w-full pl-9 pr-3 h-11 rounded-[3px] text-sm font-semibold border border-white/30 bg-white/10 text-white placeholder:text-white/50 focus:border-white outline-none cursor-default select-text"
                  />
                </div>
                <p className="text-xs text-white/80 font-normal">
                  All salary transactions happen in your Ekaze Wallet. Funds are automatically deducted on salary payout and held in your Ekaze Wallet savings.
                </p>
              </div>

              {/* Submit Button matching original #689f38 green */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveMokashAmount}
                  disabled={
                    !savingsInputAmount ||
                    Number(savingsInputAmount) < (minSavingLimit > 0 ? minSavingLimit : 100) ||
                    (baseSalary > 0 && Number(savingsInputAmount) > baseSalary) ||
                    isSavingConfig
                  }
                  className="w-full h-11 bg-[#689f38] hover:bg-[#588a2e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-[3px] transition-colors cursor-pointer border-0 shadow-xs flex items-center justify-center gap-2"
                >
                  {isSavingConfig ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <PiggyBank className="w-4 h-4 text-white" />
                  )}
                  <span>
                    {isSavingConfig
                      ? "Saving..."
                      : `Save to Ekaze Wallet${savingsInputAmount ? ` (${formatCurrency(savingsInputAmount)})` : ""}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;

