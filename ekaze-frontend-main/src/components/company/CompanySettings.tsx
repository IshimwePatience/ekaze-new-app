import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Plus,
  Pencil,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  ListChecks,
  XCircle,
  AlertCircle,
  Edit2,
  Save,
} from "lucide-react";
import { useMyFees, useCreateFee, useUpdateFee, useUpdateWalletAccount } from "@/hooks/useCompanyFees";
import { useAuth } from "@/hooks/useAuth";
import type { CompanyFee, FeeType, FeeCurrency, FeePayType } from "@/types/company-fee.types";
import { Wallet, ArrowDownToLine, TrendingUp, History } from "lucide-react";
import { useCompanyWallet, useRequestWithdrawal } from "@/hooks/useCompanyFees";
import type { RequestWithdrawalRequest } from "@/types/company-fee.types";

const FEE_TYPES: { value: FeeType; label: string; description: string }[] = [
  { value: "commission",   label: "Commission Fee",    description: "Percentage-based company commission on placed worker salary" },
];

const EMPTY_FORM = {
  type:     "commission" as FeeType | "",
  pay_type: "percentage" as FeePayType,
  value:    "10",
  currency: "RWF" as FeeCurrency,
};

const getFeeStatusBadge = (isActive: number) => {
  if (isActive === 1) return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400";
  if (isActive === 2) return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-400";
  return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400";
};

const getFeeStatusLabel = (isActive: number) => {
  if (isActive === 1) return { icon: <CheckCircle2 className="w-2.5 h-2.5 mr-1" />, text: "Active" };
  if (isActive === 2) return { icon: <XCircle className="w-2.5 h-2.5 mr-1" />,      text: "Rejected" };
  return             { icon: <Clock className="w-2.5 h-2.5 mr-1" />,                text: "Pending Approval" };
};

const JiraEditPencilIcon = ({ className = "shrink-0" }: { className?: string }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Eraser */}
    <path
      d="M2.5 4.6C2.1 4.2 2.1 3.6 2.5 3.2L3.2 2.5C3.6 2.1 4.2 2.1 4.6 2.5L5.6 3.5L3.5 5.6L2.5 4.6Z"
      fill="none"
      stroke="#172B4D"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Metal Ferrule Collar */}
    <line
      x1="3.3"
      y1="5.4"
      x2="5.4"
      y2="3.3"
      stroke="#172B4D"
      strokeWidth="1.2"
    />
    {/* Pencil Body Shaft (at 45 degree slant) */}
    <path
      d="M3.5 5.6L5.6 3.5L10.3 8.2L8.2 10.3L3.5 5.6Z"
      fill="none"
      stroke="#172B4D"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    {/* Center groove line along the shaft */}
    <line
      x1="4.55"
      y1="4.55"
      x2="9.25"
      y2="9.25"
      stroke="#172B4D"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Sharpened tip cone */}
    <path
      d="M8.2 10.3L10.3 8.2L13.5 13.5L8.2 10.3Z"
      fill="none"
      stroke="#172B4D"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    {/* Solid black lead tip */}
    <path
      d="M11.5 11.5L13.5 13.5L12.5 13.5L11.5 12.5Z"
      fill="#172B4D"
      stroke="#172B4D"
      strokeWidth="0.8"
    />
  </svg>
);

const CompanySettings = () => {
  const { user } = useAuth();
  const { data, isLoading } = useMyFees();
  const createFee = useCreateFee();
  const updateFee = useUpdateFee();

  const [activeTab, setActiveTab]     = useState("list");
  const [editingFee, setEditingFee]   = useState<CompanyFee | null>(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const updateWalletAccount = useUpdateWalletAccount();
  const [editingAccount, setEditingAccount] = useState(false);
  const [accountNo, setAccountNo] = useState("");

  const { data: walletData, isLoading: isLoadingWallet } = useCompanyWallet();

  const handleAutoSaveAccount = async (val?: string) => {
    const valueToSave = (val !== undefined ? val : accountNo).trim();
    if (!valueToSave || valueToSave === (walletData?.data?.wallet?.account_no ?? "")) {
      setEditingAccount(false);
      return;
    }
    await updateWalletAccount.mutateAsync(valueToSave);
    setEditingAccount(false);
  };
const requestWithdrawal = useRequestWithdrawal();
const [withdrawForm, setWithdrawForm] = useState({
  amount: "",
  payout_account: "",
  payout_channel: "momo" as "momo" | "bank" | "cash",
  notes: "",
});
const [showWithdrawForm, setShowWithdrawForm] = useState(false);

const wallet = walletData?.data?.wallet;
const withdrawals = walletData?.data?.withdrawals?.data || [];

const handleWithdraw = async () => {
  if (!withdrawForm.amount || !withdrawForm.payout_account) return;
  await requestWithdrawal.mutateAsync({
    amount:         parseFloat(withdrawForm.amount),
    payout_account: withdrawForm.payout_account,
    payout_channel: withdrawForm.payout_channel,
    notes:          withdrawForm.notes || undefined,
  });
  setWithdrawForm({ amount: "", payout_account: "", payout_channel: "momo", notes: "" });
  setShowWithdrawForm(false);
};

  // Companies only configure Commission (hiring & registration fees are strictly admin-managed)
  const rawFees       = data?.data?.data || [];
  const fees          = rawFees.filter(f => f.type === 'commission');
  const existingTypes = fees.map(f => f.type);
  const availableTypes = FEE_TYPES.filter(t => !existingTypes.includes(t.value));

  const openCreate = () => {
    setEditingFee(null);
    setForm({ ...EMPTY_FORM, type: "commission" });
    setActiveTab("form");
  };

  const openEdit = (fee: CompanyFee) => {
    setEditingFee(fee);
    setForm({
      type:     fee.type,
      pay_type: fee.pay_type,
      value:    fee.value,
      currency: fee.currency ?? "RWF",
    });
    setActiveTab("form");
  };

  const handleCancel = () => {
    setEditingFee(null);
    setForm(EMPTY_FORM);
    setActiveTab("list");
  };

  const handleSubmit = async () => {
    if (!form.value || !form.type) return;
    const companyId = user?.company?.id;
    if (!companyId) return;

    if (editingFee) {
    await updateFee.mutateAsync({
      id:   editingFee.id,
      data: {
        pay_type: form.pay_type,
        value:    parseFloat(form.value),
        currency: form.pay_type === "percentage" ? undefined : form.currency,
      },
    });
    } else {
      await createFee.mutateAsync({
        company_id: companyId,
        type:       form.type as FeeType,
        pay_type:   form.pay_type,
        value:      parseFloat(form.value),
        currency:   form.pay_type === "percentage" ? undefined : form.currency,
      });
    }
    setEditingFee(null);
    setForm(EMPTY_FORM);
    setActiveTab("list");
  };

  const isPending     = createFee.isPending || updateFee.isPending;
  const isPercentage  = form.pay_type === "percentage";
  const valueExceeds  = isPercentage && parseFloat(form.value) > 100;

  const companyTabs = [
    { id: "list", label: "Commission Rate" },
    { id: "form", label: editingFee ? "Edit Commission" : "Set Commission" },
    { id: "wallet", label: "Wallet & Payouts" },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white p-4 sm:p-8 font-sans text-slate-900 select-none space-y-6 max-w-7xl mx-auto">
      {/* ── 1. TOP HEADER & CLONED HORIZONTAL TAB BAR (Picture 1 Clone) ──── */}
      <div className="space-y-3.5 text-left">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight text-left">
          System Configurations - Manage company setup
        </h2>

        {/* Cloned Horizontal Joined Tab Bar from Picture 1 (Reduced compact size) */}
        <div className="flex items-center overflow-x-auto no-scrollbar pb-2.5">
          <div className="inline-flex items-stretch rounded-md bg-[#8d94a5] shadow-xs relative">
            {companyTabs.map((tab, idx) => {
              const isSelected = activeTab === tab.id;
              const isFirst = idx === 0;
              const isLast = idx === companyTabs.length - 1;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id === "form" && !editingFee) {
                      openCreate();
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`relative px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-[13px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-r border-white/40 last:border-r-0 outline-none select-none font-bold text-white whitespace-nowrap ${
                    isFirst ? "rounded-l-md" : ""
                  } ${isLast ? "rounded-r-md" : ""} ${
                    isSelected
                      ? "bg-[#208b3a] shadow-xs z-10"
                      : "bg-[#8d94a5] hover:bg-[#7e8596]"
                  }`}
                >
                  <span>{tab.label}</span>
                  {isSelected && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#208b3a] rotate-45 z-20 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. MAIN CONTENT AREA (Full width, Clean framing) ─────────────── */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-8 text-left shadow-2xs">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* ── LIST TAB ─────────────────────────────── */}
          <TabsContent value="list" className="mt-0 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Placement Commission</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure your company commission percentage on placed workers
                </p>
              </div>
              {availableTypes.length > 0 && (
                <Button size="sm" onClick={openCreate} className="h-9 text-xs gap-1.5 bg-[#2478b8] hover:bg-[#1b6296] text-white">
                  <Plus className="w-3.5 h-3.5" />
                  Set Commission
                </Button>
              )}
            </div>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {FEE_TYPES.map((feeType) => {
                    const existing = fees.find(f => f.type === feeType.value);
                    const statusInfo = existing ? getFeeStatusLabel(existing.is_active) : null;
                    return (
                      <div
                        key={feeType.value}
                        className="flex items-start justify-between py-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{feeType.label}</p>
                            <p className="text-xs text-muted-foreground">{feeType.description}</p>
                            {existing && (
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <p className="text-xs font-bold text-foreground">
                                  {parseFloat(existing.value).toLocaleString()}
                                  {existing.pay_type === "percentage" ? "%" : ` ${existing.currency}`}
                                </p>
                                <span className="text-[10px] capitalize px-1.5 py-0.5 border border-slate-200 text-slate-600">
                                  {existing.pay_type}
                                </span>
                              </div>
                            )}
                            {/* Show rejection reason */}
                            {existing?.is_active === 2 && existing.rejection_reason && (
                              <div className="flex items-start gap-1 mt-1.5">
                                <AlertCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-red-600 dark:text-red-400">
                                  {existing.rejection_reason}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {existing ? (
                            <button
                              type="button"
                              onClick={() => openEdit(existing)}
                              className="inline-flex items-center justify-center h-8 px-3 bg-[#EBECF0] hover:bg-[#DFE1E6] active:bg-[#D5D8DE] border border-[#DFE1E6] transition-colors cursor-pointer select-none"
                              style={{
                                backgroundColor: "#EBECF0",
                                borderColor: "#DFE1E6",
                                height: "32px",
                              }}
                            >
                              <span className="text-[13px] font-medium text-[#172B4D] leading-none">Edit</span>
                            </button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                setEditingFee(null);
                                setForm({ ...EMPTY_FORM, type: feeType.value });
                                setActiveTab("form");
                              }}
                              className="h-8 px-3 text-xs bg-[#2478b8] hover:bg-[#1b6296] text-white"
                            >
                              Set Fee
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── FORM TAB ─────────────────────────────── */}
            <TabsContent value="form" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {editingFee ? "Edit Company Fee" : "Add Company Fee"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure fee type, payment mode (percentage or fixed amount), and currency
                </p>
              </div>

              <div className="max-w-xl space-y-5 py-1">
                <div>
                  <p className="text-xs text-slate-500">
                    {editingFee
                      ? "Update the value or currency. This will require re-approval by an administrator."
                      : "Submit a new fee for admin approval. It will become active once approved."}
                  </p>
                </div>

                {/* Fee Type */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-medium text-slate-700 font-sans text-left">
                    Fee Type <span className="text-red-500 font-bold">*</span>
                  </label>
                  {editingFee ? (
                    <div className="h-11 px-3.5 flex items-center rounded-[6px] bg-[#EEF2F6] text-sm font-medium text-slate-800">
                      <span className="capitalize">{editingFee.type}</span>
                    </div>
                  ) : (
                    <Select
                      value={form.type}
                      onValueChange={(v) => setForm(prev => ({ ...prev, type: v as FeeType }))}
                    >
                      <SelectTrigger className="h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent focus:bg-white focus:ring-2 focus:ring-[#2478b8]/30 focus:border-[#2478b8] text-sm font-normal text-slate-800 outline-none transition-all">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FEE_TYPES.filter(t => !existingTypes.includes(t.value)).map(t => (
                          <SelectItem key={t.value} value={t.value} className="text-sm">
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Pay Type */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-medium text-slate-700 font-sans text-left">
                    Payment Type <span className="text-red-500 font-bold">*</span>
                  </label>
                  <Select
                    value={form.pay_type}
                    onValueChange={(v) => setForm(prev => ({ ...prev, pay_type: v as FeePayType }))}
                  >
                    <SelectTrigger className="h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent focus:bg-white focus:ring-2 focus:ring-[#2478b8]/30 focus:border-[#2478b8] text-sm font-normal text-slate-800 outline-none transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed" className="text-sm">Fixed Amount</SelectItem>
                      <SelectItem value="percentage" className="text-sm">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Value */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-medium text-slate-700 font-sans text-left">
                    {isPercentage ? "Percentage (%)" : "Amount"} <span className="text-red-500 font-bold">*</span>
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={isPercentage ? 100 : undefined}
                    value={form.value}
                    onChange={(e) => setForm(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={isPercentage ? "e.g. 10 (max 100)" : "e.g. 5000"}
                    className={`h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent focus:bg-white focus:ring-2 focus:ring-[#2478b8]/30 focus:border-[#2478b8] text-sm font-normal text-slate-800 outline-none transition-all ${valueExceeds ? "!border-red-500" : ""}`}
                  />
                  {valueExceeds && (
                    <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Percentage cannot exceed 100%
                    </p>
                  )}
                </div>

                {/* Currency — only for fixed */}
                {(editingFee ? editingFee.pay_type === "fixed" : form.pay_type === "fixed") && (
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-medium text-slate-700 font-sans text-left">
                      Currency <span className="text-red-500 font-bold">*</span>
                    </label>
                    <Select
                      value={form.currency}
                      onValueChange={(v) => setForm(prev => ({ ...prev, currency: v as FeeCurrency }))}
                    >
                      <SelectTrigger className="h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent focus:bg-white focus:ring-2 focus:ring-[#2478b8]/30 focus:border-[#2478b8] text-sm font-normal text-slate-800 outline-none transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RWF" className="text-sm">RWF — Rwandan Franc</SelectItem>
                        <SelectItem value="USD" className="text-sm">USD — US Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isPending}
                    className="flex-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium h-11 px-6 rounded-[6px] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending || !form.value || !form.type || valueExceeds}
                    className="flex-1 bg-[#2478b8] hover:bg-[#1b6296] active:bg-[#154d76] disabled:opacity-40 text-white text-sm font-semibold h-11 px-8 rounded-[6px] shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        {editingFee ? "Updating..." : "Submitting..."}
                      </>
                    ) : (
                      editingFee ? "Update Fee" : "Submit Fee"
                    )}
                  </button>
                </div>
              </div>
            </TabsContent>
            {/* ── WALLET TAB ─────────────────────────────── */}
            <TabsContent value="wallet" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Company Wallet & Payouts</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage payout credentials, withdraw earnings, and track transaction history
                </p>
              </div>
  {isLoadingWallet ? (
    <div className="space-y-3">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  ) : (
    <>
      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2">
        <div>
          <div className="mb-1">
            <p className="text-xs text-muted-foreground">Available Balance</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {parseFloat(wallet?.balance ?? '0').toLocaleString()} RWF
          </p>
          {/* Account number editable */}
          <div className="mt-2">
            {editingAccount ? (
              <div className="flex items-center gap-2 mt-1 max-w-[210px]">
                <Input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  onBlur={() => handleAutoSaveAccount()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAutoSaveAccount();
                    if (e.key === "Escape") setEditingAccount(false);
                  }}
                  placeholder="e.g. 0782179022"
                  className="h-7 text-xs flex-1"
                  autoFocus
                />
                {updateWalletAccount.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2478b8] shrink-0" />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-[10px] text-muted-foreground">
                  Account: <span className="font-mono font-medium text-foreground">{wallet?.account_no ?? '—'}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAccountNo(wallet?.account_no ?? "");
                    setEditingAccount(true);
                  }}
                  className="text-[11px] font-medium text-[#2478b8] hover:underline cursor-pointer ml-1.5"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-1">
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </div>
          <p className="text-xl font-bold text-green-600">
            {parseFloat(wallet?.total_earned ?? '0').toLocaleString()} RWF
          </p>
        </div>

        <div>
          <div className="mb-1">
            <p className="text-xs text-muted-foreground">Total Withdrawn</p>
          </div>
          <p className="text-xl font-bold text-orange-600">
            {parseFloat(wallet?.total_withdrawn ?? '0').toLocaleString()} RWF
          </p>
        </div>
      </div>

      {/* Withdraw Button / Form */}
      {!showWithdrawForm ? (
        <button
          type="button"
          onClick={() => setShowWithdrawForm(true)}
          disabled={parseFloat(wallet?.balance ?? '0') <= 0}
          className="h-11 px-8 rounded-[6px] bg-[#2478b8] hover:bg-[#1b6296] active:bg-[#154d76] disabled:opacity-40 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowDownToLine className="w-4 h-4" />
          Request Withdrawal
        </button>
      ) : (
        <div className="max-w-xl space-y-5 py-2 text-left">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Request Withdrawal</h2>
            <p className="text-xs text-slate-500 mt-0.5">Withdraw funds directly to mobile money or bank account</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium text-slate-700 font-sans text-left">
                Amount (RWF) <span className="text-red-500 font-bold">*</span>
              </label>
              <Input
                type="number"
                min={1}
                max={parseFloat(wallet?.balance ?? '0')}
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="e.g. 10000"
                className="h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent focus:bg-white focus:ring-2 focus:ring-[#2478b8]/30 focus:border-[#2478b8] text-sm font-normal text-slate-800 outline-none transition-all"
              />
              <p className="text-[11px] text-slate-500">
                Max available: {parseFloat(wallet?.balance ?? '0').toLocaleString()} RWF
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium text-slate-700 font-sans text-left">
                Payout Channel <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['momo', 'bank', 'cash'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setWithdrawForm(prev => ({ ...prev, payout_channel: ch }))}
                    className={`h-11 rounded-[6px] text-xs font-semibold capitalize transition-all cursor-pointer ${
                      withdrawForm.payout_channel === ch
                        ? 'bg-[#2478b8] text-white shadow-xs'
                        : 'bg-[#EEF2F6] text-slate-700 hover:bg-slate-200/70'
                    }`}
                  >
                    {ch === 'momo' ? 'MoMo' : ch === 'bank' ? 'Bank' : 'Cash'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium text-slate-700 font-sans text-left">
                {withdrawForm.payout_channel === 'momo' ? 'MoMo Number' : withdrawForm.payout_channel === 'bank' ? 'Bank Account' : 'Recipient'} <span className="text-red-500 font-bold">*</span>
              </label>
              <Input
                type="text"
                value={withdrawForm.payout_account}
                onChange={(e) => setWithdrawForm(prev => ({ ...prev, payout_account: e.target.value }))}
                placeholder={withdrawForm.payout_channel === 'momo' ? 'e.g. 0788123456' : 'Account details'}
                className="h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent focus:bg-white focus:ring-2 focus:ring-[#2478b8]/30 focus:border-[#2478b8] text-sm font-normal text-slate-800 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium text-slate-700 font-sans text-left">
                Notes (optional)
              </label>
              <Input
                type="text"
                value={withdrawForm.notes}
                onChange={(e) => setWithdrawForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes"
                className="h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent focus:bg-white focus:ring-2 focus:ring-[#2478b8]/30 focus:border-[#2478b8] text-sm font-normal text-slate-800 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWithdrawForm(false)}
                disabled={requestWithdrawal.isPending}
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium h-11 px-6 rounded-[6px] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={requestWithdrawal.isPending || !withdrawForm.amount || !withdrawForm.payout_account}
                className="flex-1 bg-[#2478b8] hover:bg-[#1b6296] active:bg-[#154d76] disabled:opacity-40 text-white text-sm font-semibold h-11 px-8 rounded-[6px] shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {requestWithdrawal.isPending ? (
                  <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />Submitting...</>
                ) : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <div className="space-y-2 pt-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-800">Withdrawal History</p>
          </div>
          <div className="divide-y divide-slate-100">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {parseFloat(w.amount).toLocaleString()} {w.currency || 'RWF'}
                  </p>
                  <p className="text-[11px] text-slate-500 capitalize">
                    {w.payout_channel} → {w.payout_account}
                  </p>
                  {w.rejection_reason && (
                    <p className="text-[10px] text-red-500 mt-0.5">{w.rejection_reason}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={`text-[10px] ${
                    w.status === 'paid' || w.status === 'completed' || w.status === 'successful' ? 'bg-green-100 text-green-800 border-green-200' :
                    w.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}>
                    {w.status}
                  </Badge>
                  <p className="text-[9px] text-slate-400">
                    {new Date(w.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )}
</TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompanySettings;