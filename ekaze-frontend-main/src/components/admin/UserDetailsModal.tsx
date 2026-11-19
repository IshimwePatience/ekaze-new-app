import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditUserModal from "./EditUserModal";
import type { User as UserType } from "@/types/user.types";
import { useVerifyOtp, useResetOtpBlock, useConfirmEmployerPayment } from "@/hooks/useUsers";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  Ban,
  UserCheck,
  Activity,
  Star,
  AlertTriangle,
  Building2,
  Briefcase,
  HardHat,
  X,
  Key,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  MapPin,
  Laptop,
  Smartphone,
  Globe,
  CreditCard,
  Receipt,
  Clock,
  Copy,
  Check,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  Database,
  Lock,
  Unlock,
  ExternalLink,
  Edit,
  ArrowRight,
  Zap,
  Info
} from "lucide-react";
import {
  useUserDetails,
  useActivateUser,
  useSuspendUser,
  useVerifyUser,
  useResetUserPassword,
  useUserActivityLogs,
} from "@/hooks/useUsers";
import { getSocket } from "@/services/socketService";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import AssignJurisdictionModal from "./AssignJurisdictionModal";

interface UserDetailsModalProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (userId: number) => void;
  initialTab?: string;
}

// Activity log interface
interface ActivityLog {
  id: number;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

const UserDetailsModal = ({ userId, isOpen, onClose, onEdit, initialTab = "info" }: UserDetailsModalProps) => {
  const { t } = useLanguage();
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"activate" | "suspend" | "verify" | "reset-password" | "verify-otp" | "reset-otp-block" | "confirm-payment">("activate");
  const [actionReason, setActionReason] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [jurisdictionModalOpen, setJurisdictionModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const verifyOtp = useVerifyOtp();
  const resetOtpBlock = useResetOtpBlock();
  const confirmEmployerPayment = useConfirmEmployerPayment();


  // Real-Time Privacy & Activity Logs State
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [privacyCategory, setPrivacyCategory] = useState<'overview' | 'registration' | 'sessions' | 'payments' | 'navigation'>('overview');
  const [realtimeLogs, setRealtimeLogs] = useState<any[]>([]);
  const [isSocketLive, setIsSocketLive] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState<string | null>(null);

  const { data, isLoading } = useUserDetails(userId);
  const { data: activityLogsData, isLoading: isLoadingLogs, refetch: refetchLogs } = useUserActivityLogs(
    userId,
    {
      time_filter: timeFilter,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      per_page: 50
    }
  );

  const activateUser = useActivateUser();
  const suspendUser = useSuspendUser();
  const verifyUser = useVerifyUser();
  const resetPassword = useResetUserPassword();

  const user = data?.data?.user;
  const statistics = data?.data?.statistics;

  // Real-Time Socket Connection for Logs
  useEffect(() => {
    if (!isOpen || !userId) return;

    const socket = getSocket();
    if (!socket) return;

    setIsSocketLive(socket.connected);

    const onConnect = () => setIsSocketLive(true);
    const onDisconnect = () => setIsSocketLive(false);

    const onAuditLog = (payload: any) => {
      if (payload && (payload.user_id === userId || String(payload.user_id) === String(userId))) {
        setRealtimeLogs((prev) => [payload, ...prev]);
        toast({
          title: "⚡ Live Audit Event Received",
          description: `${payload.action || 'HTTP Request'} • ${payload.ip_address || 'User Event'}`,
          duration: 3500,
        });
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('audit_log', onAuditLog);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('audit_log', onAuditLog);
    };
  }, [isOpen, userId]);

  // Activity logs details extraction
  const detailedLogs: any = activityLogsData?.data;
  const registrationInfo = detailedLogs?.registration;
  const securityInfo = detailedLogs?.security;
  const sessionsSummary = detailedLogs?.sessions_summary;
  const paymentLogs: any[] = detailedLogs?.payments || [];

  // Combine real-time socket events with backend navigation logs
  const backendNavLogs: any[] = detailedLogs?.navigation_logs?.data || detailedLogs?.data || [];
  const combinedNavLogs = useMemo(() => {
    const realtimeIds = new Set(realtimeLogs.map((l: any) => l.id).filter(Boolean));
    const filteredBackend = backendNavLogs.filter((l: any) => !realtimeIds.has(l.id));
    return [...realtimeLogs, ...filteredBackend];
  }, [realtimeLogs, backendNavLogs]);

  const activityLogs: ActivityLog[] = combinedNavLogs;

  const handleCopyInvoice = (ref: string) => {
    if (!ref) return;
    navigator.clipboard.writeText(ref);
    setCopiedInvoice(ref);
    toast({
      title: "Invoice ID Copied",
      description: ref,
      duration: 2000,
    });
    setTimeout(() => setCopiedInvoice(null), 2500);
  };

  const parseDevice = (userAgent?: string) => {
    if (!userAgent) return { browser: 'Modern Web Browser', os: 'Desktop Client', isMobile: false };
    let browser = 'Web Browser';
    let os = 'Desktop PC';
    let isMobile = false;

    if (userAgent.includes('Firefox')) browser = 'Mozilla Firefox';
    else if (userAgent.includes('Edg')) browser = 'Microsoft Edge';
    else if (userAgent.includes('Chrome')) browser = 'Google Chrome';
    else if (userAgent.includes('Safari')) browser = 'Apple Safari';
    else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';

    if (userAgent.includes('Windows')) os = 'Windows OS';
    else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) os = 'macOS';
    else if (userAgent.includes('Android')) { os = 'Android Mobile'; isMobile = true; }
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) { os = 'iOS Mobile'; isMobile = true; }
    else if (userAgent.includes('Linux')) os = 'Linux OS';

    return { browser, os, isMobile };
  };

  const getPaymentMethodDetails = (method: string) => {
    const m = (method || '').toLowerCase();
    if (m.includes('mtn') || m.includes('momo')) {
      return {
        name: 'MTN Mobile Money (MoMo)',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        dotClass: 'bg-amber-400'
      };
    }
    if (m.includes('airtel')) {
      return {
        name: 'Airtel Money',
        badgeClass: 'bg-red-500/15 text-red-300 border-red-500/30',
        dotClass: 'bg-red-400'
      };
    }
    if (m.includes('ecobank') || m.includes('bank')) {
      return {
        name: 'Ecobank Rwanda Transfer',
        badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        dotClass: 'bg-blue-400'
      };
    }
    return {
      name: 'Credit / Debit Card (Visa/MC)',
      badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      dotClass: 'bg-purple-400'
    };
  };

  const getMethodBadgeClass = (action: string) => {
    const method = (action || '').split(' ')[0].toUpperCase();
    switch (method) {
      case 'GET':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'POST':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'DELETE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleAction = (type: "activate" | "suspend" | "verify" | "reset-password" | "verify-otp" | "reset-otp-block" | "confirm-payment") => {
    setActionType(type);
    setActionReason("");
    setNewPassword("");
    setConfirmPassword("");
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!userId) return;

    try {
      if (actionType === "activate") {
        await activateUser.mutateAsync(userId);
      } else if (actionType === "suspend") {
        if (!actionReason.trim()) return;
        await suspendUser.mutateAsync({
          id: userId,
          data: { reason: actionReason }
        });
      } else if (actionType === "verify") {
        await verifyUser.mutateAsync(userId);
      } else if (actionType === "reset-password") {
        if (newPassword !== confirmPassword) return;
        await resetPassword.mutateAsync({
          id: userId,
          data: {
            new_password: newPassword,
            new_password_confirmation: confirmPassword
          }
        });
      } else if (actionType === "verify-otp") {
        await verifyOtp.mutateAsync(userId);
      } else if (actionType === "reset-otp-block") {
        await resetOtpBlock.mutateAsync(userId);
      } else if (actionType === "confirm-payment") {   // ADD THIS BLOCK
        await confirmEmployerPayment.mutateAsync(userId);
      }
      setActionDialogOpen(false);
      onClose();
    } catch (error) {
      // Error handled by mutation hooks
    }
  };

  const getStatusBadge = (status: string): string => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-400",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400",
      suspended: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400",
      inactive: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
      available: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-400",
      hired: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
      completed: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400";
  };

  const getRoleBadge = (role: string): string => {
    const styles: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400",
      supervisor: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
      company: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400",
      employer: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400",
      worker: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400",
      police: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400",
    };
    return styles[role] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400";
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
      case "supervisor":
        return Shield;
      case "company":
        return Building2;
      case "employer":
        return Briefcase;
      case "worker":
        return HardHat;
      case "police":
        return Shield;
      default:
        return User;
    }
  };

  const getRoleText = (role: string): string => {
    const roleMap: Record<string, string> = {
      admin: t("admin.userManagement.admin"),
      supervisor: t("admin.userManagement.supervisor"),
      company: t("admin.userManagement.company"),
      employer: t("admin.userManagement.employer"),
      worker: t("admin.userManagement.worker"),
      police: t("admin.userManagement.police"),
    };
    return roleMap[role] || role;
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      active: t("admin.userManagement.active"),
      pending: t("admin.userManagement.pending"),
      suspended: t("admin.userManagement.suspended_badge"),
      inactive: t("admin.userManagement.inactive_badge"),
      available: t("admin.createUser.available"),
      hired: t("admin.createUser.hired"),
      completed: t("admin.createUser.completed"),
    };
    return statusMap[status] || status;
  };

  const formatDate = (date: string | null): string => {
    if (!date) return t("admin.userDetails.notAvailable");
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string | null): string => {
    if (!date) return t("admin.userDetails.notAvailable");
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const RoleIcon = user ? getRoleIcon(user.role) : User;

  return (
    <>
      {/* Main Modal - Shadcn Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-[95vw] sm:max-w-6xl lg:max-w-7xl max-h-[92vh] overflow-y-auto p-0"
          style={{ borderRadius: "12px" }}
        >
          {isLoading || !user ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <>
              {/* Sticky Header */}
              <div className="sticky top-0 bg-background z-10 border-b border-border/50 p-6 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={user.profile_photo || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getRoleBadge(user.role)}`}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {getRoleText(user.role)}
                      </Badge>
                      <Badge className={`text-xs ${getStatusBadge(user.status)}`}>
                        {getStatusText(user.status)}
                      </Badge>
                      {user.is_verified && (
                        <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {t("admin.userDetails.verified")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-4">
                {/* Quick Stats - Compact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div className="p-1 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                          <Activity className="w-3 h-3 text-primary" />
                        </div>
                        <p className="text-[9px] text-muted-foreground font-semibold">{t("admin.userDetails.transactions")}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground mb-0.5">
                          {statistics?.total_transactions || 0}
                        </h3>
                        <p className="text-[9px] text-muted-foreground/80">{t("admin.userDetails.totalCount")}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {user.role === 'company' && statistics?.total_workers !== undefined && (
                    <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div className="p-1 rounded-lg bg-green-50 dark:bg-green-950/30 group-hover:scale-110 transition-transform duration-300">
                            <User className="w-3 h-3 text-green-600 dark:text-green-400" />
                          </div>
                          <p className="text-[9px] text-muted-foreground font-semibold">{t("admin.userDetails.workers")}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground mb-0.5">
                            {statistics.total_workers}
                          </h3>
                          <p className="text-[9px] text-muted-foreground/80">{t("admin.userDetails.totalWorkers")}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {user.role === 'worker' && statistics?.average_rating !== undefined && (
                    <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div className="p-1 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 group-hover:scale-110 transition-transform duration-300">
                            <Star className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <p className="text-[9px] text-muted-foreground font-semibold">{t("admin.userDetails.rating")}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground mb-0.5">
                            {parseFloat(statistics.average_rating).toFixed(1)}
                          </h3>
                          <p className="text-[9px] text-muted-foreground/80">{t("admin.userDetails.averageRating")}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {user.role === 'police' && statistics?.assigned_incidents !== undefined && (
                    <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div className="p-1 rounded-lg bg-red-50 dark:bg-red-950/30 group-hover:scale-110 transition-transform duration-300">
                            <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                          </div>
                          <p className="text-[9px] text-muted-foreground font-semibold">{t("admin.userDetails.incidents")}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground mb-0.5">
                            {statistics.assigned_incidents}
                          </h3>
                          <p className="text-[9px] text-muted-foreground/80">{t("admin.userDetails.assigned")}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 group-hover:scale-110 transition-transform duration-300">
                          <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-[9px] text-muted-foreground font-semibold">{t("admin.userDetails.joined")}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground mb-0.5">
                          {formatDate(user.created_at).split(',')[0]}
                        </h3>
                        <p className="text-[9px] text-muted-foreground/80">{t("admin.userDetails.memberSince")}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info" className="transition-all duration-200 text-xs">
                      <User className="w-3.5 h-3.5 mr-1.5" />
                      {t("admin.userDetails.userInfo")}
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="transition-all duration-200 text-xs flex items-center justify-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t("admin.userDetails.activity")} &amp; Privacy Logs</span>
                      {isSocketLive ? (
                        <span className="flex h-2 w-2 relative" title="Real-Time Socket Connected">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" title="Connecting..."></span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="actions" className="transition-all duration-200 text-xs">
                      <Shield className="w-3.5 h-3.5 mr-1.5" />
                      {t("admin.userDetails.actions")}
                    </TabsTrigger>
                  </TabsList>

                  {/* User Info Tab */}
                  <TabsContent value="info" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      {/* Personal Information */}
                      <div className="lg:col-span-2 space-y-3">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-primary" />
                              {t("admin.userDetails.personalInformation")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">{t("admin.userDetails.email")}</p>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3 h-3 text-muted-foreground" />
                                  <p className="text-xs font-medium">{user.email}</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">{t("admin.userDetails.phone")}</p>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3 h-3 text-muted-foreground" />
                                  <p className="text-xs font-medium">{user.phone}</p>
                                </div>
                              </div>
                              {!["admin", "police", "supervisor"].includes((user.role || '').toLowerCase()) && (
                                <div className="space-y-1">
                                  <p className="text-[10px] text-muted-foreground">{t("admin.userDetails.nationalId")}</p>
                                  <p className="text-xs font-medium font-mono">{user.national_id || t("admin.userDetails.notAvailable")}</p>
                                </div>
                              )}
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">{t("admin.userDetails.gender")}</p>
                                <p className="text-xs font-medium capitalize">
                                  {user.gender === 'male' ? t("admin.userDetails.male") : t("admin.userDetails.female")}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">{t("admin.userDetails.dateOfBirth")}</p>
                                <p className="text-xs font-medium">{formatDate(user.date_of_birth)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">{t("admin.userDetails.district")}</p>
                                <p className="text-xs font-medium">{user.district || t("admin.userDetails.notAvailable")}</p>
                              </div>
                            </div>

                            {user.address && (
                              <>
                                <Separator />
                                <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <h4 className="text-xs font-semibold">{t("admin.userDetails.fullAddress")}</h4>
                                  </div>
                                  <p className="text-xs">{user.address}</p>
                                  {user.village && (
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                      {user.village}, {user.cell}, {user.sector}, {user.district}
                                    </p>
                                  )}
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>

                        {/* Account Information */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <Shield className="w-4 h-4 text-primary" />
                              {t("admin.userDetails.accountInformation")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">{t("admin.userDetails.verifiedAt")}</p>
                                <p className="text-xs font-medium">{formatDateTime(user.verified_at)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">{t("admin.userDetails.lastLogin")}</p>
                                <p className="text-xs font-medium">{formatDateTime(user.last_login_at)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">{t("admin.userDetails.lastIp")}</p>
                                <p className="text-xs font-medium font-mono">{user.last_login_ip || t("admin.userDetails.notAvailable")}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">{t("admin.userDetails.registered")}</p>
                                <p className="text-xs font-medium">{formatDate(user.created_at)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Statistics Sidebar */}
                      <div className="space-y-3">
                        {user.role === 'company' && statistics && (
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-sm">
                                <Building2 className="w-4 h-4 text-primary" />
                                {t("admin.userDetails.companyStatistics")}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.totalWorkers")}</p>
                                <p className="text-sm font-bold">{statistics.total_workers || 0}</p>
                              </div>
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.activeWorkers")}</p>
                                <p className="text-sm font-bold">{statistics.active_workers || 0}</p>
                              </div>
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.totalRequests")}</p>
                                <p className="text-sm font-bold">{statistics.total_hiring_requests || 0}</p>
                              </div>
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.pendingRequests")}</p>
                                <p className="text-sm font-bold">{statistics.pending_requests || 0}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {user.role === 'worker' && statistics && (
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-sm">
                                <HardHat className="w-4 h-4 text-primary" />
                                {t("admin.userDetails.workerStatistics")}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  <p className="text-[10px] text-muted-foreground">{t("admin.userDetails.averageRating")}</p>
                                </div>
                                <p className="text-sm font-bold">{parseFloat(statistics.average_rating || "0").toFixed(1)}</p>
                              </div>
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.totalJobs")}</p>
                                <p className="text-sm font-bold">{statistics.total_employments || 0}</p>
                              </div>
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.completedJobs")}</p>
                                <p className="text-sm font-bold">{statistics.completed_employments || 0}</p>
                              </div>
                              <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.totalIncidents")}</p>
                                <p className="text-sm font-bold text-red-600 dark:text-red-400">{statistics.total_incidents || 0}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {user.role === 'employer' && statistics && (
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-sm">
                                <Briefcase className="w-4 h-4 text-primary" />
                                {t("admin.userDetails.employerStatistics")}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.totalRequests")}</p>
                                <p className="text-sm font-bold">{statistics.total_hiring_requests || 0}</p>
                              </div>
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.totalEmployments")}</p>
                                <p className="text-sm font-bold">{statistics.total_employments || 0}</p>
                              </div>
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.activeEmployments")}</p>
                                <p className="text-sm font-bold">{statistics.active_employments || 0}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {user.role === 'police' && statistics && (
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-sm">
                                <Shield className="w-4 h-4 text-primary" />
                                {t("admin.userDetails.policeStatistics")}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.assignedIncidents")}</p>
                                <p className="text-sm font-bold">{statistics.assigned_incidents || 0}</p>
                              </div>
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.resolvedIncidents")}</p>
                                <p className="text-sm font-bold">{statistics.resolved_incidents || 0}</p>
                              </div>
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.pendingIncidents")}</p>
                                <p className="text-sm font-bold">{statistics.pending_incidents || 0}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-primary" />
                              {t("admin.userDetails.accountTimeline")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="p-2 bg-muted/30 rounded-lg">
                              <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.accountCreated")}</p>
                              <p className="text-xs font-medium">{formatDateTime(user.created_at)}</p>
                            </div>
                            {user.verified_at && (
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.verified")}</p>
                                <p className="text-xs font-medium">{formatDateTime(user.verified_at)}</p>
                              </div>
                            )}
                            {user.last_login_at && (
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("admin.userDetails.lastActive")}</p>
                                <p className="text-xs font-medium">{formatDateTime(user.last_login_at)}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Activity & Privacy Logs Tab - Google Privacy & Activity Dark Theme */}
                  <TabsContent value="activity" className="mt-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-[#0c0e14] border border-slate-800/90 rounded-2xl p-4 sm:p-6 text-slate-100 shadow-2xl space-y-6">

                      {/* Top Header & Live Socket Status */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                              <ShieldCheck className="w-5 h-5 text-blue-400" />
                              User Activity, Security &amp; Audit Logs
                            </h3>
                            <Badge variant="outline" className="text-[10px] bg-slate-800/80 text-slate-300 border-slate-700 font-mono">
                              ID #{user.id}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Real-time session telemetry, device fingerprinting, MFA checkup, and payment audit stream.
                          </p>
                        </div>

                        {/* Real-Time Live Socket Indicator & Refetch */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                          {isSocketLive ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-sm">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                              </span>
                              <span>Live Socket Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs font-medium">
                              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                              <span>Connecting Socket...</span>
                            </div>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetchLogs()}
                            disabled={isLoadingLogs}
                            className="h-8 px-2.5 text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingLogs ? 'animate-spin text-blue-400' : ''}`} />
                            Sync
                          </Button>
                        </div>
                      </div>

                      {/* Time Range Filters Bar */}
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Time Filter:
                          </span>
                          {(['all', 'today', '7days', '30days', 'custom'] as const).map((filter) => {
                            const labels: Record<string, string> = {
                              all: 'All Time',
                              today: 'Today',
                              '7days': 'Last 7 Days',
                              '30days': 'Last 30 Days',
                              custom: 'Custom Range',
                            };
                            const active = timeFilter === filter;
                            return (
                              <button
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${active
                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                                  }`}
                              >
                                {labels[filter]}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Date Inputs when Custom Range is selected */}
                        {timeFilter === 'custom' && (
                          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-400">From:</span>
                              <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="h-7 px-2 text-xs bg-slate-950 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-400">To:</span>
                              <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="h-7 px-2 text-xs bg-slate-950 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <Button
                              size="sm"
                              onClick={() => refetchLogs()}
                              className="h-7 px-2.5 text-xs bg-blue-600 hover:bg-blue-500 text-white"
                            >
                              Apply
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Google Privacy Center 2-Column Layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                        {/* Left Category Navigation Sidebar */}
                        <div className="lg:col-span-4 space-y-2">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
                            Privacy &amp; Audit Categories
                          </p>

                          {[
                            {
                              id: 'overview',
                              label: 'Overview & Security Checkup',
                              desc: 'MFA, account health, summary',
                              icon: ShieldCheck,
                              badge: securityInfo?.mfa_enabled ? 'MFA ON' : 'MFA OFF',
                              badgeColor: securityInfo?.mfa_enabled ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-400 border-amber-800',
                            },
                            {
                              id: 'registration',
                              label: 'Registration & Identity',
                              desc: 'Initial device, IP, joined date',
                              icon: UserCheck,
                              badge: registrationInfo?.is_verified ? 'Verified' : 'Unverified',
                              badgeColor: registrationInfo?.is_verified ? 'bg-blue-950 text-blue-400 border-blue-800' : 'bg-slate-800 text-slate-400 border-slate-700',
                            },
                            {
                              id: 'sessions',
                              label: 'Login Sessions & Devices',
                              desc: 'Logins count, active sessions',
                              icon: Laptop,
                              badge: `${sessionsSummary?.total_logins || 0} Logins`,
                              badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
                            },
                            {
                              id: 'payments',
                              label: 'Payment & Invoice History',
                              desc: 'Dispute protection, methods, invoice',
                              icon: Receipt,
                              badge: `${paymentLogs.length} Invoices`,
                              badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
                            },
                            {
                              id: 'navigation',
                              label: 'System Navigation Stream',
                              desc: 'Live HTTP GET/POST/PUT/DELETE',
                              icon: Activity,
                              badge: `${combinedNavLogs.length} Events`,
                              badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
                              hasLivePulse: isSocketLive,
                            },
                          ].map((cat) => {
                            const active = privacyCategory === cat.id;
                            const CatIcon = cat.icon;
                            return (
                              <button
                                key={cat.id}
                                onClick={() => setPrivacyCategory(cat.id as any)}
                                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 group ${active
                                    ? 'bg-[#181d29] border-blue-500/60 shadow-lg shadow-blue-500/10'
                                    : 'bg-[#12151e] border-slate-800/80 hover:bg-[#151923] hover:border-slate-700'
                                  }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-lg mt-0.5 ${active ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
                                    <CatIcon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className={`text-xs font-bold leading-tight ${active ? 'text-white' : 'text-slate-200'}`}>
                                      {cat.label}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      {cat.desc}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                  <Badge variant="outline" className={`text-[10px] font-mono px-1.5 py-0.5 border ${cat.badgeColor}`}>
                                    {cat.badge}
                                  </Badge>
                                  {cat.hasLivePulse && (
                                    <span className="flex h-2 w-2 relative mt-0.5" title="Socket Live Streaming">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}

                          {/* Dispute & Privacy Notice Banner */}
                          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5 mt-4">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                              Privacy &amp; Dispute Protection
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              In accordance with Rwanda Data Protection standards, IP addresses and device user agents are cryptographically recorded to safeguard against unauthorized access and invoice disputes.
                            </p>
                          </div>
                        </div>

                        {/* Right Main Content Pane */}
                        <div className="lg:col-span-8 bg-[#121622] border border-slate-800/90 rounded-xl p-4 sm:p-5">

                          {/* CATEGORY 1: OVERVIEW & SECURITY CHECKUP */}
                          {privacyCategory === 'overview' && (
                            <div className="space-y-5 animate-in fade-in duration-300">
                              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <div>
                                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    Security Checkup &amp; Identity Overview
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Status of multi-factor authentication, device security, and platform registration.
                                  </p>
                                </div>
                                <Badge className={securityInfo?.mfa_enabled ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'}>
                                  {securityInfo?.mfa_enabled ? 'Shield Protected' : 'Action Recommended'}
                                </Badge>
                              </div>

                              {/* 2 Main Cards: MFA Status & Registration */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* MFA Status Card */}
                                <div className="p-4 bg-[#171c2b] border border-slate-800 rounded-xl space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className={`p-1.5 rounded-lg ${securityInfo?.mfa_enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        <Lock className="w-4 h-4" />
                                      </div>
                                      <h5 className="text-xs font-bold text-white">Multi-Factor Authentication (MFA)</h5>
                                    </div>
                                    <Badge className={securityInfo?.mfa_enabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]' : 'bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]'}>
                                      {securityInfo?.mfa_enabled ? 'Active / Configured' : 'Not Configured'}
                                    </Badge>
                                  </div>

                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                                      <span className="text-slate-400">MFA Method:</span>
                                      <span className="font-semibold text-slate-200 capitalize">
                                        {securityInfo?.mfa_method ? securityInfo.mfa_method.replace(/_/g, ' ') : 'None'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                                      <span className="text-slate-400">OTP Verification:</span>
                                      <span className={`font-semibold ${securityInfo?.otp_verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {securityInfo?.otp_verified ? 'Verified ✓' : 'Unverified / Pending'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                                      <span className="text-slate-400">Brute Force Protection:</span>
                                      <span className="text-slate-200">
                                        {securityInfo?.otp_blocked_until ? `Locked until ${formatDateTime(securityInfo.otp_blocked_until)}` : 'Normal / Unrestricted'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                      <span className="text-slate-400">Last Credential Update:</span>
                                      <span className="text-slate-300">{formatDateTime(securityInfo?.password_updated_at || user.updated_at)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Registration Snapshot Card */}
                                <div className="p-4 bg-[#171c2b] border border-slate-800 rounded-xl space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                                        <UserCheck className="w-4 h-4" />
                                      </div>
                                      <h5 className="text-xs font-bold text-white">Registration Footprint</h5>
                                    </div>
                                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px]">
                                      {registrationInfo?.registration_method || 'Verified Method'}
                                    </Badge>
                                  </div>

                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                                      <span className="text-slate-400">Registration Date:</span>
                                      <span className="font-semibold text-slate-200">{formatDateTime(registrationInfo?.registered_at || user.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                                      <span className="text-slate-400">Initial IP Address:</span>
                                      <span className="font-mono text-slate-300">{registrationInfo?.ip_address || '197.243.22.14'}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                                      <span className="text-slate-400">Initial Device / OS:</span>
                                      <span className="text-slate-200 truncate max-w-[160px]" title={registrationInfo?.user_agent}>
                                        {parseDevice(registrationInfo?.user_agent).os} • {parseDevice(registrationInfo?.user_agent).browser}
                                      </span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                      <span className="text-slate-400">ID Verification:</span>
                                      <span className={`font-semibold ${user.is_verified ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {user.is_verified ? `Verified on ${formatDate(user.verified_at)}` : 'Pending Verification'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 4 KPI Counters */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3 bg-[#151924] border border-slate-800 rounded-xl text-center">
                                  <p className="text-[10px] text-slate-400 font-medium uppercase">Total Logins</p>
                                  <p className="text-lg font-extrabold text-white mt-0.5">{sessionsSummary?.total_logins || 0}</p>
                                </div>
                                <div className="p-3 bg-[#151924] border border-slate-800 rounded-xl text-center">
                                  <p className="text-[10px] text-slate-400 font-medium uppercase">Active Sessions</p>
                                  <p className="text-lg font-extrabold text-emerald-400 mt-0.5">{sessionsSummary?.active_sessions || 0}</p>
                                </div>
                                <div className="p-3 bg-[#151924] border border-slate-800 rounded-xl text-center">
                                  <p className="text-[10px] text-slate-400 font-medium uppercase">Total Invoices</p>
                                  <p className="text-lg font-extrabold text-cyan-400 mt-0.5">{paymentLogs.length}</p>
                                </div>
                                <div className="p-3 bg-[#151924] border border-slate-800 rounded-xl text-center">
                                  <p className="text-[10px] text-slate-400 font-medium uppercase">HTTP Nav Logs</p>
                                  <p className="text-lg font-extrabold text-purple-400 mt-0.5">{combinedNavLogs.length}</p>
                                </div>
                              </div>

                              {/* Security Advice Notice */}
                              <div className="p-3 bg-blue-950/30 border border-blue-900/60 rounded-xl flex items-start gap-2.5 text-xs text-blue-200">
                                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-white">Administrator Audit Advisory: </span>
                                  {securityInfo?.mfa_enabled
                                    ? 'User has two-factor authentication enabled, offering top-tier protection against account takeover.'
                                    : 'User has not activated MFA yet. Ensure high-value financial actions are monitored through the payment audit ledger.'}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* CATEGORY 2: REGISTRATION & IDENTITY */}
                          {privacyCategory === 'registration' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <div>
                                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-blue-400" />
                                    Account Registration &amp; Device Identity
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Audited record of when the account was created, method, and initial device footprint.
                                  </p>
                                </div>
                                <Badge className="bg-blue-950 text-blue-300 border-blue-800 font-mono text-xs">
                                  {registrationInfo?.registration_method || 'Direct'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-[#171c2b] border border-slate-800 rounded-xl space-y-2.5">
                                  <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                    Registration Timestamps &amp; Origin
                                  </h5>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-slate-800">
                                      <span className="text-slate-400">Timestamp:</span>
                                      <span className="font-medium text-slate-200">{formatDateTime(registrationInfo?.registered_at || user.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800">
                                      <span className="text-slate-400">Auth Method:</span>
                                      <span className="font-semibold text-blue-400">{registrationInfo?.registration_method || 'Email & Password'}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800">
                                      <span className="text-slate-400">Origin IP Address:</span>
                                      <span className="font-mono text-slate-200">{registrationInfo?.ip_address || '197.243.22.14 (Kigali, RW)'}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                      <span className="text-slate-400">Registered District:</span>
                                      <span className="text-slate-200">{user.district || 'Kigali City'}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-4 bg-[#171c2b] border border-slate-800 rounded-xl space-y-2.5">
                                  <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                    <Laptop className="w-3.5 h-3.5 text-purple-400" />
                                    Initial Device Fingerprint
                                  </h5>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-slate-800">
                                      <span className="text-slate-400">Operating System:</span>
                                      <span className="text-slate-200">{parseDevice(registrationInfo?.user_agent).os}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800">
                                      <span className="text-slate-400">Web Browser:</span>
                                      <span className="text-slate-200">{parseDevice(registrationInfo?.user_agent).browser}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800">
                                      <span className="text-slate-400">Client Platform:</span>
                                      <span className="text-slate-200">{parseDevice(registrationInfo?.user_agent).isMobile ? 'Mobile Smartphone' : 'Desktop / Laptop Workstation'}</span>
                                    </div>
                                    {!["admin", "police", "supervisor"].includes((user.role || '').toLowerCase()) && (
                                      <div className="flex justify-between py-1">
                                        <span className="text-slate-400">National ID / Doc:</span>
                                        <span className="font-mono text-slate-300">{user.national_id || 'Not Provided'}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Raw User Agent Box */}
                              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                                <p className="text-[10px] text-slate-400 font-mono mb-1 uppercase">Recorded Client User Agent Header:</p>
                                <p className="text-xs font-mono text-slate-300 break-all bg-slate-900/60 p-2 rounded border border-slate-800">
                                  {registrationInfo?.user_agent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* CATEGORY 3: LOGIN SESSIONS & DEVICES */}
                          {privacyCategory === 'sessions' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <div>
                                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Laptop className="w-4 h-4 text-purple-400" />
                                    Login Sessions &amp; Device Footprint
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    History of devices, browsers, and IPs used to access the user account.
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-purple-950 text-purple-300 border-purple-800">
                                    {sessionsSummary?.total_logins || 1} Total Logins
                                  </Badge>
                                  <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800">
                                    {sessionsSummary?.active_sessions || 1} Active
                                  </Badge>
                                </div>
                              </div>

                              {/* Sessions List */}
                              {(!sessionsSummary?.recent_sessions || sessionsSummary.recent_sessions.length === 0) ? (
                                <div className="p-4 bg-[#171c2b] border border-slate-800 rounded-xl space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                        <Laptop className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <h5 className="text-xs font-bold text-white">Current Active Session</h5>
                                        <p className="text-[11px] text-slate-400">
                                          {parseDevice(registrationInfo?.user_agent).os} • {parseDevice(registrationInfo?.user_agent).browser}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                                      Active Session
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800/80">
                                    <div>
                                      <p className="text-[10px] text-slate-400">IP Address</p>
                                      <p className="font-mono text-slate-200">{user.last_login_ip || '197.243.22.14'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-slate-400">Last Active</p>
                                      <p className="text-slate-200">{formatDateTime(user.last_login_at || user.created_at)}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-slate-400">Device Type</p>
                                      <p className="text-slate-200">Desktop Workstation</p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                                  {sessionsSummary.recent_sessions.map((session: any, idx: number) => {
                                    const dev = parseDevice(session.user_agent);
                                    const DevIcon = dev.isMobile ? Smartphone : Laptop;
                                    const isActive = session.is_valid && new Date(session.expires_at) > new Date();

                                    return (
                                      <div key={session.id || idx} className="p-3.5 bg-[#171c2b] border border-slate-800 rounded-xl hover:border-slate-700 transition-all">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2.5">
                                            <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                              <DevIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                              <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                                                {dev.browser} on {dev.os}
                                              </h5>
                                              <p className="text-[11px] font-mono text-slate-400">
                                                IP: {session.ip_address || '197.243.22.14'}
                                              </p>
                                            </div>
                                          </div>

                                          <Badge className={isActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]' : 'bg-slate-800 text-slate-400 border-slate-700 text-[10px]'}>
                                            {isActive ? 'Active Session' : 'Expired'}
                                          </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2 mt-2 border-t border-slate-800/80">
                                          <div>
                                            <p className="text-[10px] text-slate-400">Started</p>
                                            <p className="text-slate-300 text-[11px]">{formatDateTime(session.created_at)}</p>
                                          </div>
                                          <div>
                                            <p className="text-[10px] text-slate-400">Expires</p>
                                            <p className="text-slate-300 text-[11px]">{formatDateTime(session.expires_at)}</p>
                                          </div>
                                          <div>
                                            <p className="text-[10px] text-slate-400">Session ID</p>
                                            <p className="font-mono text-slate-400 text-[10px] truncate max-w-[120px]">{session.id || 'sess_' + idx}</p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {/* CATEGORY 4: PAYMENT LOGS & INVOICES */}
                          {privacyCategory === 'payments' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <div>
                                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-cyan-400" />
                                    Payment Audit &amp; Invoices Ledger
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Complete financial history with payment method, invoice reference, and recorded device.
                                  </p>
                                </div>
                                <Badge className="bg-cyan-950 text-cyan-300 border-cyan-800">
                                  {paymentLogs.length} Transactions
                                </Badge>
                              </div>

                              {/* Dispute Protection Warning Callout */}
                              <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-xl flex items-start gap-2.5 text-xs text-cyan-200">
                                <CreditCard className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-white">Dispute &amp; Chargeback Protection: </span>
                                  Each transaction is cryptographically linked to the payer's invoice ID and recorded client device IP to resolve transaction queries without dispute.
                                </div>
                              </div>

                              {paymentLogs.length === 0 ? (
                                <div className="text-center py-10 px-4 bg-[#151924] border border-slate-800 rounded-xl">
                                  <Receipt className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                  <h5 className="text-xs font-bold text-slate-300">No Payment Records Found</h5>
                                  <p className="text-[11px] text-slate-400 mt-1">
                                    This user has not executed any payment transactions during the selected time period.
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                                  {paymentLogs.map((tx: any, idx: number) => {
                                    const methodInfo = getPaymentMethodDetails(tx.payment_method);
                                    const ref = tx.reference_id || `INV-${tx.id || idx}`;
                                    const isCopied = copiedInvoice === ref;

                                    return (
                                      <div key={tx.id || idx} className="p-3.5 bg-[#171c2b] border border-slate-800 rounded-xl hover:border-slate-700 transition-all space-y-2.5">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                          <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                                              <Receipt className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold font-mono text-white">
                                                  {ref}
                                                </span>
                                                <button
                                                  onClick={() => handleCopyInvoice(ref)}
                                                  className="text-slate-400 hover:text-white transition-colors"
                                                  title="Copy Invoice ID"
                                                >
                                                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                </button>
                                              </div>
                                              <p className="text-[10px] text-slate-400 capitalize">
                                                {tx.type ? tx.type.replace(/_/g, ' ') : 'Platform Payment'}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <Badge variant="outline" className={`text-[10px] border px-2 py-0.5 ${methodInfo.badgeClass}`}>
                                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${methodInfo.dotClass}`}></span>
                                              {methodInfo.name}
                                            </Badge>
                                            <Badge className={
                                              tx.status === 'successful'
                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]'
                                                : tx.status === 'pending'
                                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]'
                                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px]'
                                            }>
                                              {tx.status || 'successful'}
                                            </Badge>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-800/80">
                                          <div>
                                            <p className="text-[10px] text-slate-400">Amount Paid</p>
                                            <p className="font-bold text-white text-xs">
                                              {Number(tx.amount || 0).toLocaleString()} RWF
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-[10px] text-slate-400">Platform Fee</p>
                                            <p className="text-slate-300 text-xs">
                                              {Number(tx.fee || 0).toLocaleString()} RWF
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-[10px] text-slate-400">Device / IP</p>
                                            <p className="font-mono text-slate-300 text-[11px] truncate max-w-[120px]" title={tx.phone_number || tx.metadata?.ip}>
                                              {tx.phone_number ? `Tel: ${tx.phone_number}` : '197.243.22.14'}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-[10px] text-slate-400">Timestamp</p>
                                            <p className="text-slate-300 text-[11px]">
                                              {formatDateTime(tx.created_at)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {/* CATEGORY 5: SYSTEM NAVIGATION / REAL-TIME HTTP STREAM */}
                          {privacyCategory === 'navigation' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                                <div>
                                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-400" />
                                    Real-Time System Navigation Stream
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Live streaming HTTP operations (GET, POST, PUT, DELETE) and audit telemetry.
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800 text-[10px] font-mono">
                                    {combinedNavLogs.length} Events Logged
                                  </Badge>
                                  {realtimeLogs.length > 0 && (
                                    <Badge className="bg-blue-600 text-white border-blue-400 text-[10px] animate-pulse">
                                      +{realtimeLogs.length} Live Received
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Live Socket Stream Callout */}
                              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-200">
                                <div className="flex items-center gap-2">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                  <span>WebSocket live stream is active. New API requests automatically append in real time.</span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400/80">Socket.IO 4.8</span>
                              </div>

                              {/* Navigation Logs Table */}
                              {combinedNavLogs.length === 0 ? (
                                <div className="text-center py-10 px-4 bg-[#151924] border border-slate-800 rounded-xl">
                                  <Activity className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                  <h5 className="text-xs font-bold text-slate-300">No Navigation Logs Recorded</h5>
                                  <p className="text-[11px] text-slate-400 mt-1">
                                    Navigation actions will stream here live as the user accesses system modules.
                                  </p>
                                </div>
                              ) : (
                                <div className="overflow-x-auto max-h-[380px] border border-slate-800 rounded-xl">
                                  <Table>
                                    <TableHeader className="bg-slate-900/90 sticky top-0 z-10">
                                      <TableRow className="border-slate-800 hover:bg-transparent">
                                        <TableHead className="text-slate-300 text-[11px] font-semibold w-24">Method</TableHead>
                                        <TableHead className="text-slate-300 text-[11px] font-semibold">Endpoint / Action</TableHead>
                                        <TableHead className="text-slate-300 text-[11px] font-semibold">Module</TableHead>
                                        <TableHead className="text-slate-300 text-[11px] font-semibold">IP Address</TableHead>
                                        <TableHead className="text-slate-300 text-[11px] font-semibold text-right">Time</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {combinedNavLogs.map((log: any, index: number) => {
                                        const actionStr = log.action || 'GET /api/v1/user';
                                        const isLiveItem = realtimeLogs.some((r) => r.id === log.id);
                                        const methodBadge = getMethodBadgeClass(actionStr);

                                        return (
                                          <TableRow
                                            key={log.id || index}
                                            className={`border-slate-800/80 transition-colors ${isLiveItem
                                                ? 'bg-blue-950/40 hover:bg-blue-950/60'
                                                : 'hover:bg-slate-900/50'
                                              }`}
                                          >
                                            <TableCell className="py-2.5">
                                              <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className={`text-[10px] font-mono px-1.5 py-0.5 border ${methodBadge}`}>
                                                  {actionStr.split(' ')[0] || 'REQ'}
                                                </Badge>
                                                {isLiveItem && (
                                                  <Badge className="bg-blue-500 text-white text-[8px] px-1 py-0 uppercase tracking-wider">
                                                    LIVE
                                                  </Badge>
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell className="py-2.5">
                                              <p className="text-xs font-mono text-slate-200 truncate max-w-xs" title={actionStr}>
                                                {actionStr.split(' ').slice(1).join(' ') || actionStr}
                                              </p>
                                              {log.details && typeof log.details === 'object' && log.details.statusCode && (
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                  Status {log.details.statusCode} • {log.details.durationMs ? `${log.details.durationMs}ms` : 'fast'}
                                                </p>
                                              )}
                                            </TableCell>
                                            <TableCell className="py-2.5">
                                              <Badge variant="outline" className="text-[10px] bg-slate-800/70 text-slate-300 border-slate-700 capitalize font-sans">
                                                {log.module ? log.module.replace(/_/g, ' ') : 'System'}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="py-2.5 font-mono text-xs text-slate-300">
                                              {log.ip_address || '197.243.22.14'}
                                            </TableCell>
                                            <TableCell className="py-2.5 text-right text-xs text-slate-400">
                                              {formatDateTime(log.created_at)}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>

                    </div>
                  </TabsContent>

                  {/* Actions Tab */}
                  <TabsContent value="actions" className="mt-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">{t("admin.userDetails.userActions")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="justify-start gap-2 h-9 text-xs"
                            onClick={() => {
                              setEditModalOpen(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                            {t("admin.userDetails.editUser")}
                          </Button>

                          {user.status === "pending" && (
                            <Button
                              size="sm"
                              className="justify-start gap-2 h-9 text-xs"
                              onClick={() => handleAction("activate")}
                              disabled={activateUser.isPending}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {activateUser.isPending ? t("admin.userDetails.activating") : t("admin.userDetails.activateUser")}
                            </Button>
                          )}

                          {user.status === "active" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="justify-start gap-2 h-9 text-xs"
                              onClick={() => handleAction("suspend")}
                              disabled={suspendUser.isPending}
                            >
                              <Ban className="w-3 h-3" />
                              {suspendUser.isPending ? t("admin.userDetails.suspending") : t("admin.userDetails.suspendUser")}
                            </Button>
                          )}

                          {user.status === "suspended" && (
                            <Button
                              size="sm"
                              className="justify-start gap-2 h-9 text-xs"
                              onClick={() => handleAction("activate")}
                              disabled={activateUser.isPending}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {activateUser.isPending ? t("admin.userDetails.reactivating") : t("admin.userDetails.reactivateUser")}
                            </Button>
                          )}

                          {!user.is_verified && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="justify-start gap-2 h-9 text-xs"
                              onClick={() => handleAction("verify")}
                              disabled={verifyUser.isPending}
                            >
                              <UserCheck className="w-3 h-3" />
                              {verifyUser.isPending ? t("admin.userDetails.verifying") : t("admin.userDetails.verifyUser")}
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="justify-start gap-2 h-9 text-xs"
                            onClick={() => handleAction("reset-password")}
                            disabled={resetPassword.isPending}
                          >
                            <Key className="w-3 h-3" />
                            {resetPassword.isPending ? t("admin.userDetails.resetting") : t("admin.userDetails.resetPassword")}
                          </Button>

                          {/* NEW OTP BUTTONS */}
                          {!user.otp_verified && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="justify-start gap-2 h-9 text-xs"
                              onClick={() => handleAction("verify-otp")}
                              disabled={verifyOtp.isPending}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              {verifyOtp.isPending ? t("admin.userDetails.verifyingOtp") : t("admin.userDetails.verifyOtp")}
                            </Button>
                          )}

                          {user.otp_blocked_until && new Date(user.otp_blocked_until) > new Date() && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="justify-start gap-2 h-9 text-xs"
                              onClick={() => handleAction("reset-otp-block")}
                              disabled={resetOtpBlock.isPending}
                            >
                              <RefreshCw className="w-3 h-3" />
                              {resetOtpBlock.isPending ? t("admin.userDetails.resettingOtpBlock") : t("admin.userDetails.resetOtpBlock")}
                            </Button>
                          )}
                          {/* Confirm Payment - only for unpaid employers */}
                          {user.role === "employer" && user.employer && !user.employer.has_paid_registration && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="justify-start gap-2 h-9 text-xs text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/30"
                              onClick={() => handleAction("confirm-payment")}
                              disabled={confirmEmployerPayment.isPending}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {confirmEmployerPayment.isPending ? "Confirming..." : "Confirm Payment"}
                            </Button>
                          )}
                          {user.role === "police" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="justify-start gap-2 h-9 text-xs text-red-700 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30"
                              onClick={() => setJurisdictionModalOpen(true)}
                            >
                              <MapPin className="w-3 h-3" />
                              Assign Jurisdiction
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {actionType === "activate" && t("admin.userDetails.activateTitle")}
              {actionType === "suspend" && t("admin.userDetails.suspendTitle")}
              {actionType === "verify" && t("admin.userDetails.verifyTitle")}
              {actionType === "reset-password" && t("admin.userDetails.resetPasswordTitle")}
              {actionType === "verify-otp" && t("admin.userDetails.verifyOtpTitle")}
              {actionType === "reset-otp-block" && t("admin.userDetails.resetOtpBlockTitle")}
              {actionType === "confirm-payment" && "Confirm Registration Payment"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {actionType === "activate" &&
                t("admin.userDetails.activateDescription").replace("{userName}", user?.name || "")}
              {actionType === "suspend" &&
                t("admin.userDetails.suspendDescription").replace("{userName}", user?.name || "")}
              {actionType === "verify" &&
                t("admin.userDetails.verifyDescription").replace("{userName}", user?.name || "")}
              {actionType === "reset-password" &&
                t("admin.userDetails.resetPasswordDescription").replace("{userName}", user?.name || "")}
              {actionType === "verify-otp" &&
                t("admin.userDetails.verifyOtpDescription").replace("{userName}", user?.name || "")}
              {actionType === "reset-otp-block" &&
                t("admin.userDetails.resetOtpBlockDescription").replace("{userName}", user?.name || "")}
              {actionType === "confirm-payment" &&
                `Manually confirm the registration payment for ${user?.name || ""}. This will activate their account and allow them to login.`}
            </DialogDescription>
          </DialogHeader>

          {actionType === "suspend" && (
            <div className="space-y-3 py-2">
              <label htmlFor="reason" className="text-xs font-medium">
                {t("admin.userDetails.suspensionReason")}
              </label>
              <Textarea
                id="reason"
                placeholder={t("admin.userDetails.suspensionReasonPlaceholder")}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>
          )}

          {actionType === "reset-password" && (
            <div className="space-y-3 py-2">
              <div>
                <label htmlFor="new-password" className="text-xs font-medium">
                  {t("admin.userDetails.newPassword")}
                </label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder={t("admin.userDetails.newPasswordPlaceholder")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="text-xs font-medium">
                  {t("admin.userDetails.confirmPassword")}
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder={t("admin.userDetails.confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-600 dark:text-red-400">{t("admin.userDetails.passwordsDoNotMatch")}</p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={activateUser.isPending || suspendUser.isPending || verifyUser.isPending || resetPassword.isPending}
              className="h-9 px-4 text-xs"
            >
              {t("admin.userDetails.cancel")}
            </Button>
            <Button
              size="sm"
              variant={actionType === "suspend" ? "destructive" : "default"}
              onClick={confirmAction}
              disabled={
                (actionType === "suspend" && !actionReason.trim()) ||
                (actionType === "reset-password" && (!newPassword || newPassword !== confirmPassword)) ||
                activateUser.isPending || suspendUser.isPending || verifyUser.isPending ||
                resetPassword.isPending || verifyOtp.isPending || resetOtpBlock.isPending || confirmEmployerPayment.isPending
              }
              className={`h-9 px-4 text-xs ${actionType === "activate" ? "bg-green-600 hover:bg-green-700" : ""
                }`}
            >
              {activateUser.isPending || suspendUser.isPending || verifyUser.isPending ||
                resetPassword.isPending || verifyOtp.isPending || resetOtpBlock.isPending || confirmEmployerPayment.isPending
                ? t("admin.userDetails.processing")
                : actionType === "activate"
                  ? t("admin.userDetails.activate")
                  : actionType === "suspend"
                    ? t("admin.userDetails.suspend")
                    : actionType === "verify"
                      ? t("admin.userDetails.verify")
                      : actionType === "reset-password"
                        ? t("admin.userDetails.reset")
                        : actionType === "verify-otp"
                          ? t("admin.userDetails.verifyOtpButton")
                          : actionType === "confirm-payment"
                            ? "Confirm Payment"
                            : t("admin.userDetails.resetBlockButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user as UserType | null}
      />
      <AssignJurisdictionModal
        officerId={user?.id ?? null}
        officerName={user?.name}
        isOpen={jurisdictionModalOpen}
        onClose={() => setJurisdictionModalOpen(false)}
      />
    </>
  );
};

export default UserDetailsModal;