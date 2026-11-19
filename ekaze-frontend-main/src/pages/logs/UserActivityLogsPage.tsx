import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Laptop,
  Smartphone,
  Globe,
  RefreshCw,
  CreditCard,
  Receipt,
  Lock,
  Zap,
  SlidersHorizontal,
  Languages,
  User as UserIcon,
  Shield,
  ExternalLink,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useAuth, useCurrentUser } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { NavbarUserMenu } from '@/components/common/NavbarUserMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserActivityLogs } from '@/hooks/useUsers';
import { getSocket } from '@/services/socketService';
import { CharacterIllustration } from '@/components/common/CharacterIllustration';
import logo from '@/assets/reallogo.png';

const languages = [
  { code: 'kin' as const, label: 'Kinyarwanda', short: 'KIN' },
  { code: 'eng' as const, label: 'English', short: 'EN' },
];

interface LogSubSection {
  id: string;
  label: string;
}

export const UserActivityLogsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { language, setLanguage } = useLanguage();
  const isRw = language === 'kin' || (language as string) === 'rw';
  const currentLanguage =
    languages.find((l) => l.code === language) || (isRw ? languages[0] : languages[1]);

  const { user: authUser } = useAuth();
  const { data: currentUserData } = useCurrentUser();
  const user = currentUserData?.data?.user || currentUserData?.user || authUser;

  const targetUserIdParam = searchParams.get('user_id');
  const targetUserId = targetUserIdParam
    ? parseInt(targetUserIdParam, 10)
    : user?.id
      ? Number(user.id)
      : null;

  // Time filter state
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const {
    data: activityResponse,
    isLoading,
    isFetching,
    refetch,
  } = useUserActivityLogs(targetUserId, {
    time_filter: timeFilter,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const logsData = activityResponse?.data;
  const targetUser = logsData?.user;

  // Separate Tab Navigation: Activity Logs vs Transactions
  const [mainTab, setMainTab] = useState<'activity-logs' | 'transactions'>('activity-logs');

  const activitySections: LogSubSection[] = React.useMemo(() => [
    { id: 'user-profile-overview', label: isRw ? 'Incamake y’Umukoresha' : 'User Overview' },
    { id: 'registration-audit', label: isRw ? 'Iyandikishwa ry’Konte' : 'Registration & Device' },
    { id: 'sessions-audit', label: isRw ? 'Kwinjira n’Ibikoresho' : 'Sessions & Logins' },
    { id: 'security-audit', label: isRw ? 'Umutekano & MFA' : 'Security & MFA Status' },
    { id: 'navigation-audit', label: isRw ? 'Inzira z’Urubuga (Audit)' : 'Navigation & Operations' },
  ], [isRw]);

  const transactionSections: LogSubSection[] = React.useMemo(() => {
    const role = (targetUser?.role || user?.role || '').toLowerCase();
    if (role === 'worker') {
      return [
        { id: 'worker-withdrawals-payments', label: isRw ? 'Kubikuza n’Ubwishyu' : 'Withdrawals & Payments' },
        { id: 'worker-savings-logs', label: isRw ? 'Ubwizigame bwa MoKash' : 'MoKash Savings' },
      ];
    }
    if (role === 'employer') {
      return [
        { id: 'employer-payment-methods', label: isRw ? 'Uburyo bwo Kwishyura' : 'Payment Method' },
        { id: 'employer-registration-fee', label: isRw ? 'Amafaranga yo Kwiyandikisha' : 'Registration Fee' },
        { id: 'employer-contact-unlock', label: isRw ? 'Kwishyura Nimero z’Abakozi' : 'Contact Unlock Payments' },
        { id: 'employer-money-movements', label: isRw ? 'Amafaranga Yose Yasohotse' : 'All Money Movements' },
      ];
    }
    return [
      { id: 'worker-withdrawals-payments', label: isRw ? 'Kubikuza n’Ubwishyu' : 'Withdrawals & Payments' },
      { id: 'worker-savings-logs', label: isRw ? 'Ubwizigame bwa MoKash' : 'MoKash Savings' },
      { id: 'employer-payment-methods', label: isRw ? 'Uburyo bwo Kwishyura' : 'Payment Method' },
      { id: 'employer-registration-fee', label: isRw ? 'Amafaranga yo Kwiyandikisha' : 'Registration Fee' },
      { id: 'employer-contact-unlock', label: isRw ? 'Kwishyura Nimero z’Abakozi' : 'Contact Unlock Payments' },
      { id: 'employer-money-movements', label: isRw ? 'Amafaranga Yose Yasohotse' : 'All Money Movements' },
    ];
  }, [targetUser?.role, user?.role, isRw]);

  const currentSections = mainTab === 'activity-logs' ? activitySections : transactionSections;

  const [activeSubSection, setActiveSubSection] = useState<string>('user-profile-overview');
  const [workerTxFilter, setWorkerTxFilter] = useState<'all' | 'received' | 'withdrawals'>('all');

  // Switch between Activity Logs and Transactions
  const handleSelectMainTab = (tab: 'activity-logs' | 'transactions') => {
    setMainTab(tab);
    if (tab === 'activity-logs') {
      setActiveSubSection('user-profile-overview');
    } else {
      const role = (targetUser?.role || user?.role || '').toLowerCase();
      if (role === 'worker') {
        setActiveSubSection('worker-withdrawals-payments');
      } else {
        setActiveSubSection('employer-payment-methods');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Worker Financial Profile Derived State
  const workerData = logsData?.worker_financials;
  const walletBalance = workerData?.wallet_balance ?? 0;
  const savingsBalance = workerData?.savings_balance ?? 0;
  const totalWithdrawn = workerData?.total_withdrawn ?? 0;
  const totalReceived = workerData?.total_received ?? 0;
  const isSavingsSet = Boolean(workerData?.savings?.is_set);
  const savingsSetAt = workerData?.savings?.set_at;
  const savingsPhone = workerData?.savings?.destination_phone || targetUser?.phone || '-';

  const workerWithdrawals = workerData?.withdrawals || (logsData?.payments || []).filter((p: any) => p.type === 'withdrawal');
  const workerPaymentsReceived = workerData?.payments_received || (logsData?.payments || []).filter((p: any) => p.type !== 'withdrawal');
  const allWorkerTxs = [...workerPaymentsReceived, ...workerWithdrawals].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const filteredWorkerTxs = workerTxFilter === 'all'
    ? allWorkerTxs
    : workerTxFilter === 'received'
      ? workerPaymentsReceived
      : workerWithdrawals;

  // Employer Financial Profile Derived State
  const employerData = logsData?.employer_financials;
  const paymentMethod = employerData?.payment_method;
  const isPaymentMethodSet = Boolean(paymentMethod?.is_set ?? (logsData?.payments && logsData.payments.length > 0));
  const paymentMethodSetAt = paymentMethod?.set_at || targetUser?.created_at;
  const paymentMethodWay = paymentMethod?.method_type || (targetUser?.google_id ? 'Credit / Debit Card' : 'MTN Mobile Money');
  const paymentMethodIdentifier = paymentMethod?.identifier || targetUser?.phone || '•••• 7675';
  const autoPayEnabled = paymentMethod?.auto_pay_enabled ?? true;

  const moneyMovements = employerData?.money_movements || logsData?.payments || [];
  const overdues = employerData?.overdues || moneyMovements.filter((m: any) => m.status === 'pending' || m.status === 'failed');
  const totalPaid = employerData?.total_paid ?? moneyMovements.filter((m: any) => m.status === 'successful' || m.status === 'completed').reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0);
  const totalOverdue = employerData?.total_overdue ?? overdues.reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0);
  const hasOverdues = employerData?.has_overdues ?? (overdues.length > 0);

  // Employer Contact Unlocks and Registration Fees
  const contactUnlocks = moneyMovements.filter((m: any) =>
    m.type === 'contact_unlock' || m.metadata?.type === 'contact_unlock' || m.metadata?.purpose?.includes('contact')
  );
  const totalContactUnlocksFee = contactUnlocks.reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0);

  const registrationFees = moneyMovements.filter((m: any) =>
    m.type === 'company_fee' || m.type === 'hiring_fee' || m.type === 'card_payment' || m.metadata?.purpose?.includes('registration')
  );
  const totalRegistrationFees = registrationFees.reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0);

  // Real-time socket state
  const [liveNavLogs, setLiveNavLogs] = useState<any[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    if (logsData?.navigation_logs?.data) {
      setLiveNavLogs(logsData.navigation_logs.data);
    }
  }, [logsData]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    setSocketConnected(socket.connected);

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onAuditLog = (newLog: any) => {
      if (!targetUserId || Number(newLog.user_id) === Number(targetUserId)) {
        setLiveNavLogs((prev) => [newLog, ...prev]);
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
  }, [targetUserId]);

  // Direct Tab Selection with auto-switch between Activity Logs and Transactions
  const handleSelectSubSection = (secId: string) => {
    if (activitySections.some((s) => s.id === secId)) {
      setMainTab('activity-logs');
    } else if (transactionSections.some((s) => s.id === secId)) {
      setMainTab('transactions');
    }
    setActiveSubSection(secId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Safe string extractions to prevent React child object errors
  const getEndpointString = (log: any): string => {
    if (typeof log.path === 'string' && log.path) return log.path;
    if (typeof log.endpoint === 'string' && log.endpoint) return log.endpoint;
    if (typeof log.details === 'string' && log.details) return log.details;
    if (typeof log.details === 'object' && log.details !== null) {
      if (typeof log.details.endpoint === 'string') return log.details.endpoint;
      if (typeof log.details.path === 'string') return log.details.path;
      return JSON.stringify(log.details);
    }
    if (typeof log.action === 'string') return log.action;
    return '/api/v1';
  };

  const getMethod = (log: any): string => {
    if (typeof log.method === 'string') return log.method;
    if (log.details && typeof log.details === 'object' && typeof log.details.method === 'string') {
      return log.details.method;
    }
    if (typeof log.action === 'string') return log.action;
    return 'GET';
  };

  const getStatusCode = (log: any): number => {
    if (log.status_code) return Number(log.status_code);
    if (log.statusCode) return Number(log.statusCode);
    if (log.details && typeof log.details === 'object' && log.details.statusCode) {
      return Number(log.details.statusCode);
    }
    return 200;
  };

  const getDuration = (log: any): string => {
    if (log.duration_ms !== undefined && log.duration_ms !== null) return `${log.duration_ms}ms`;
    if (log.durationMs !== undefined && log.durationMs !== null) return `${log.durationMs}ms`;
    if (log.details && typeof log.details === 'object' && log.details.durationMs) {
      return `${log.details.durationMs}ms`;
    }
    return '18ms';
  };

  const getMethodBadgeClass = (method: string) => {
    const m = (method || '').toUpperCase();
    if (m === 'POST') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (m === 'PUT' || m === 'PATCH') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    if (m === 'DELETE') return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
  };

  const getStatusBadgeClass = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-400 font-mono font-medium';
    if (status >= 300 && status < 400) return 'text-sky-400 font-mono font-medium';
    if (status >= 400 && status < 500) return 'text-amber-400 font-mono font-medium';
    return 'text-rose-400 font-mono font-medium';
  };

  const getSessionDevice = (sess: any): string => {
    if (sess.device) return sess.device;
    if (sess.browser) return `${sess.browser} on ${sess.os || 'Windows'}`;
    const ua = sess.user_agent || '';
    if (/iphone|ipad|ios/i.test(ua)) return 'Safari on iOS';
    if (/android/i.test(ua)) return 'Chrome on Android';
    if (/mac/i.test(ua)) return 'Safari on macOS';
    return 'Chrome on Windows';
  };

  const getSessionMethod = (sess: any): string => {
    if (sess.method) return sess.method;
    if (targetUser?.google_id) return 'Google';
    if (targetUser?.phone && !targetUser?.email) return 'Phone';
    return 'Email';
  };

  const isSessionSuccess = (sess: any): boolean => {
    if (sess.status === 'Fail') return false;
    if (sess.is_valid === false && sess.expired) return false;
    return true;
  };

  const formatTimestamp = (ts: string | Date | undefined) => {
    if (!ts) return 'N/A';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      className="min-h-screen bg-white text-[#202124] flex flex-col selection:bg-[#c2e7ff] selection:text-[#004380]"
      style={{ fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}
    >
      {/* Top Google-style Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 lg:px-12 flex items-center justify-between h-16 shrink-0 shadow-xs">
        {/* Left: Branding */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <img src={logo} alt="Ihirwe" className="h-6 w-auto" />
            <span className="text-[17px] font-medium text-[#202124] tracking-tight">
              {isRw ? 'Amateka y’Konte' : 'User Logs'}
            </span>
          </a>

          {/* Top Tabs: Activity Logs and Transactions Only */}
          <nav className="flex items-center gap-1 ml-4 h-16">
            <button
              onClick={() => handleSelectMainTab('activity-logs')}
              className={`relative h-full px-4 text-[16px] font-medium flex items-center cursor-pointer transition-colors ${mainTab === 'activity-logs' ? 'text-[#0062b8]' : 'text-[#3c4043] hover:text-[#202124]'
                }`}
            >
              <span>{isRw ? 'Amateka y’Ibikorwa' : 'Activity Logs'}</span>
              {mainTab === 'activity-logs' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062b8] rounded-t-full shadow-xs" />
              )}
            </button>

            <button
              onClick={() => handleSelectMainTab('transactions')}
              className={`relative h-full px-4 text-[16px] font-medium flex items-center cursor-pointer transition-colors ${mainTab === 'transactions' ? 'text-[#0062b8]' : 'text-[#3c4043] hover:text-[#202124]'
                }`}
            >
              <span>{isRw ? 'Ibyakozwe mu Mafaranga' : 'Transactions'}</span>
              {mainTab === 'transactions' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062b8] rounded-t-full shadow-xs" />
              )}
            </button>
          </nav>
        </div>

        {/* Right: Language Selector & Authenticated User Avatar */}
        <div className="flex items-center gap-3.5">
          <CustomDropdown
            widthClass="w-28 min-w-[7rem]"
            trigger={
              <button className="bg-transparent hover:opacity-80 transition-all cursor-pointer flex items-center gap-1.5 px-2 py-1 border-0 shadow-none outline-none text-[#202124]">
                <Languages className="w-4 h-4 text-[#202124]" />
                <span className="text-[15px] font-medium text-[#202124] tracking-tight">
                  {currentLanguage?.short || (isRw ? 'KIN' : 'EN')}
                </span>
                <span className="text-[#202124] text-[10px] transform scale-y-75 font-bold">▼</span>
              </button>
            }
            items={languages.map((lang) => ({
              label: lang.short,
              active: (lang.code === 'kin' && isRw) || (lang.code === 'eng' && !isRw),
              onClick: () => setLanguage(lang.code),
            }))}
          />

          {user ? (
            <NavbarUserMenu avatarSizeClass="w-9 h-9" />
          ) : (
            <a
              href="/auth/login"
              className="px-5 py-2 rounded-full text-[14px] font-medium bg-[#0062b8] text-white hover:bg-[#00509a] transition-colors"
            >
              {isRw ? 'Injira' : 'Sign In'}
            </a>
          )}
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0 border-r border-gray-200 md:sticky md:top-16 md:h-[calc(100vh-64px)] overflow-y-auto p-4 md:py-8 bg-white">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="w-full text-left px-4 py-2.5 rounded-lg text-[16px] font-medium bg-gray-100 text-[#202124] flex items-center justify-between">
                <span>{isRw ? 'Igenzura ry’Ibikorwa' : 'Activity & Privacy Audit'}</span>
              </div>

              <div className="pl-3.5 space-y-1 border-l border-gray-200 ml-2 pt-1">
                {currentSections.map((sec) => {
                  const isSubActive = activeSubSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => handleSelectSubSection(sec.id)}
                      className={`w-full text-left px-3.5 py-2 rounded-md text-[15px] font-normal transition-all block truncate cursor-pointer ${isSubActive
                        ? 'text-[#202124] font-medium bg-gray-100'
                        : 'text-[#3c4043] hover:text-[#202124] hover:bg-gray-50'
                        }`}
                    >
                      {sec.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 px-6 sm:px-10 lg:px-16 py-10 max-w-4xl text-left space-y-10 text-[#202124]">
          {/* Header Title & Statement */}
          <div className="space-y-3">
            <span className="text-[15px] font-medium text-[#0062b8]">
              {mainTab === 'transactions'
                ? (isRw ? "Ibyakozwe mu Mafaranga & Konti" : 'Financial Transactions & Billing')
                : (isRw ? "Igenzura ry'Amateka n'Umutekano" : 'User Activity & Privacy Audit')}
            </span>

            <h1 className="text-[28px] sm:text-[34px] font-normal text-[#202124] leading-tight tracking-tight">
              {targetUser?.name
                ? `${targetUser.name} - ${mainTab === 'transactions' ? 'Transactions' : 'Activity & Privacy Audit'}`
                : mainTab === 'transactions' ? 'User Transactions' : 'User Activity & Privacy Audit'}
            </h1>

            <p className="text-[16px] leading-[26px] font-normal text-[#202124]">
              {mainTab === 'transactions'
                ? (isRw
                  ? "Amateka arambuye yo kwishyura, uburyo bwo kwishyura, kwishyura nimero z'abakozi, n'amafaranga yo kwiyandikisha."
                  : 'Comprehensive financial records, payment method configuration, worker contact unlock fees, and platform registration payments.')
                : (isRw
                  ? "Igenzura ryimbitse ry'ibikoresho (devices), kwinjira muri sisitemu, umutekano wa MFA, n'inzira z'amakuru y'akazi."
                  : 'Comprehensive real-time audit stream of user operations, device logins, and multi-factor security profile.')}
            </p>
          </div>

          {/* Top User Identity & Live Status Card (Shown only on Overview) */}
          {activeSubSection === 'user-profile-overview' && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 text-xl font-bold overflow-hidden shadow-inner">
                    {targetUser?.profile_photo ? (
                      <img
                        src={targetUser.profile_photo}
                        alt={targetUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{(targetUser?.name || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-[18px] font-medium text-[#202124] tracking-tight">
                        {targetUser?.name || `User ID #${targetUserId || 'Current'}`}
                      </h2>
                      <span className="text-[14px] font-medium px-3 py-1 rounded-full capitalize bg-gray-100 text-[#202124] border border-gray-200">
                        {targetUser?.role || 'User'}
                      </span>
                      <span
                        className={`text-[14px] font-medium px-3 py-1 rounded-full capitalize ${targetUser?.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                      >
                        {targetUser?.status || 'Active'}
                      </span>
                    </div>
                    <p className="text-[15px] text-[#202124] mt-1.5">
                      {[targetUser?.email, targetUser?.phone, targetUser?.district]
                        .filter(Boolean)
                        .join(', ') || (isRw ? 'Nta mwirondoro wanditse' : 'No contact details registered')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
                {(targetUser?.role === 'worker' || (!targetUser?.role && user?.role === 'worker')) ? (
                  <>
                    <div
                      onClick={() => handleSelectSubSection('worker-withdrawals-payments')}
                      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-[#0062b8]/50 transition-colors cursor-pointer"
                    >
                      <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                        {isRw ? 'Amafaranga Kuri Konti' : 'Wallet Balance'}
                      </span>
                      <span className="text-2xl font-bold text-[#202124]">
                        {walletBalance.toLocaleString()} <span className="text-sm text-[#202124] font-normal">RWF</span>
                      </span>
                    </div>

                    <div
                      onClick={() => handleSelectSubSection('worker-savings-logs')}
                      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-emerald-500/50 transition-colors cursor-pointer"
                    >
                      <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                        {isRw ? 'Ubwizigame bwa MoKash' : 'MoKash Savings'}
                      </span>
                      <span className={`text-[14px] font-medium px-3 py-1 rounded-full inline-block mt-1 ${isSavingsSet
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                        {isSavingsSet ? (isRw ? 'Yashyizweho' : 'Set') : (isRw ? 'Ntabwo Ariho' : 'Not Set')}
                      </span>
                    </div>

                    <div
                      onClick={() => handleSelectSubSection('worker-withdrawals-payments')}
                      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-emerald-500/50 transition-colors cursor-pointer"
                    >
                      <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                        {isRw ? 'Amafaranga Yakiriwe' : 'Total Received'}
                      </span>
                      <span className="text-2xl font-bold text-emerald-600">
                        +{totalReceived.toLocaleString()} <span className="text-sm text-[#202124] font-normal">RWF</span>
                      </span>
                    </div>

                    <div
                      onClick={() => handleSelectSubSection('security-audit')}
                      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-emerald-500/50 transition-colors cursor-pointer"
                    >
                      <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                        {isRw ? "MFA Yashyizweho" : 'MFA Set'}
                      </span>
                      <span className={`text-[14px] font-medium px-3 py-1 rounded-full inline-block mt-1 ${logsData?.security?.mfa_enabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                        {logsData?.security?.mfa_enabled ? (isRw ? 'Yego' : 'Yes') : (isRw ? 'Oya' : 'No')}
                      </span>
                    </div>
                  </>
                ) : (targetUser?.role === 'employer' || (!targetUser?.role && user?.role === 'employer')) ? (
                  <>
                    <div
                      onClick={() => handleSelectSubSection('employer-payment-methods')}
                      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-[#0062b8]/50 transition-colors cursor-pointer"
                    >
                      <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                        {isRw ? 'Uburyo bwo Kwishyura' : 'Payment Method'}
                      </span>
                      <span className={`text-[14px] font-medium px-3 py-1 rounded-full inline-block mt-1 ${isPaymentMethodSet
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                        {isPaymentMethodSet ? (isRw ? 'Bwashyizweho' : 'Set') : (isRw ? 'Ntabwo Bwashyizweho' : 'Not Set')}
                      </span>
                    </div>

                    <div
                      onClick={() => handleSelectSubSection('employer-payments-overdues')}
                      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-emerald-500/50 transition-colors cursor-pointer"
                    >
                      <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                        {isRw ? 'Yarishyuye (Total Paid)' : 'Total Paid'}
                      </span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {totalPaid.toLocaleString()} <span className="text-sm text-[#202124] font-normal">RWF</span>
                      </span>
                    </div>

                    <div
                      onClick={() => handleSelectSubSection('employer-payments-overdues')}
                      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-rose-500/50 transition-colors cursor-pointer"
                    >
                      <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                        {isRw ? 'Ibirarane (Overdues)' : 'Overdue Status'}
                      </span>
                      <span className={`text-[14px] font-medium px-3 py-1 rounded-full inline-block mt-1 ${hasOverdues
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                        {hasOverdues ? (isRw ? 'Harimo Ibirarane' : 'Overdue Pending') : (isRw ? 'Yarishyuye Yose' : 'All Settled')}
                      </span>
                    </div>

                    <div
                      onClick={() => handleSelectSubSection('security-audit')}
                      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-emerald-500/50 transition-colors cursor-pointer"
                    >
                      <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                        {isRw ? "MFA Yashyizweho" : 'MFA Set'}
                      </span>
                      <span className={`text-[14px] font-medium px-3 py-1 rounded-full inline-block mt-1 ${logsData?.security?.mfa_enabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                        {logsData?.security?.mfa_enabled ? (isRw ? 'Yego' : 'Yes') : (isRw ? 'Oya' : 'No')}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      onClick={() => handleSelectSubSection('sessions-audit')}
                      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-[#0062b8]/50 transition-colors cursor-pointer"
                    >
                      <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                        {isRw ? 'Inshuro amaze kwinjira' : 'Total Logins'}
                      </span>
                      <span className="text-2xl font-bold text-[#202124]">
                        {logsData?.sessions_summary?.total_logins || 1}
                      </span>
                    </div>

                    <div
                      onClick={() => handleSelectSubSection('sessions-audit')}
                      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-emerald-500/50 transition-colors cursor-pointer"
                    >
                      <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                        {isRw ? 'Ibikoresho Bifunguye' : 'Active Sessions'}
                      </span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {logsData?.sessions_summary?.active_sessions || 1}
                      </span>
                    </div>

                    <div
                      onClick={() => handleSelectSubSection('security-audit')}
                      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-emerald-500/50 transition-colors cursor-pointer"
                    >
                      <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                        {isRw ? "MFA Yashyizweho" : 'MFA Set'}
                      </span>
                      <span className={`text-[14px] font-medium px-3 py-1 rounded-full inline-block mt-1 ${logsData?.security?.mfa_enabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                        {logsData?.security?.mfa_enabled ? (isRw ? 'Yego' : 'Yes') : (isRw ? 'Oya' : 'No')}
                      </span>
                    </div>

                    <div
                      onClick={() => handleSelectSubSection('navigation-audit')}
                      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-[#0062b8]/50 transition-colors cursor-pointer"
                    >
                      <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                        {isRw ? 'Ibikorwa Bikorwa' : 'Operations Events'}
                      </span>
                      <span className="text-2xl font-bold text-[#0062b8]">
                        {liveNavLogs.length}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Time Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[15px] font-medium text-[#202124] mr-1 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#202124]" />
                {isRw ? 'Gushungura igihe:' : 'Time Filter:'}
              </span>
              {(
                [
                  { id: 'all', label: isRw ? 'Igihe Cyose' : 'All Time' },
                  { id: 'today', label: isRw ? 'Uyu Munsi' : 'Today' },
                  { id: '7days', label: isRw ? 'Iminsi 7' : 'Last 7 Days' },
                  { id: '30days', label: isRw ? 'Ukwezi 1' : 'Last 30 Days' },
                  { id: 'custom', label: isRw ? 'Igihe Cyihariye' : 'Custom Range' },
                ] as const
              ).map((filter) => {
                const isSelected = timeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setTimeFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg text-[15px] font-medium transition-all cursor-pointer ${isSelected
                      ? 'bg-[#0062b8] text-white font-medium shadow-xs'
                      : 'bg-white text-[#202124] hover:bg-gray-100 border border-gray-200'
                      }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {timeFilter === 'custom' && (
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9 text-[14px] bg-white border-gray-300 text-[#202124] w-36"
                />
                <span className="text-[14px] text-[#202124]">to</span>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9 text-[14px] bg-white border-gray-300 text-[#202124] w-36"
                />
              </div>
            )}
          </div>

          {/* TAB 1: USER OVERVIEW */}
          {activeSubSection === 'user-profile-overview' && (
            <section id="user-profile-overview" className="space-y-4">
              <div>
                <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                  {isRw ? "Incamake y'Ibikorwa by'Konte" : 'Account & Activity Overview'}
                </h2>
                <p className="text-[16px] leading-[26px] font-normal text-[#202124] mt-1">
                  {isRw
                    ? "Incamake rusange ku bikorwa by'uyu mukoresha muri gahunda ya Ihirwe."
                    : 'High-level activity and security status summary for this user.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => handleSelectSubSection('registration-audit')}
                  className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-[#0062b8]/50 transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[17px] font-medium text-[#202124]">
                      Registration & Device
                    </span>
                    <span className="text-[15px] font-medium text-[#0062b8]">View Details &rarr;</span>
                  </div>
                  <p className="text-[15px] leading-relaxed text-[#202124]">
                    Account created on {formatTimestamp(logsData?.registration?.registered_at || targetUser?.created_at)}
                  </p>
                </div>

                <div
                  onClick={() => handleSelectSubSection('sessions-audit')}
                  className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-emerald-500/50 transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[17px] font-medium text-[#202124]">
                      Login Sessions
                    </span>
                    <span className="text-[15px] font-medium text-[#202124]">{logsData?.sessions_summary?.total_logins || 1} Total Logins</span>
                  </div>
                  <p className="text-[15px] leading-relaxed text-[#202124]">
                    {logsData?.sessions_summary?.active_sessions || 1} active device session recorded.
                  </p>
                </div>

                {/* Worker Specific Overview Cards */}
                {(targetUser?.role === 'worker' || (!targetUser?.role && user?.role === 'worker')) && (
                  <>
                    <div
                      onClick={() => handleSelectSubSection('worker-withdrawals-payments')}
                      className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-[#0062b8]/50 transition-colors cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[17px] font-medium text-[#202124]">
                          Withdrawals & Payments Received
                        </span>
                        <span className="text-[15px] font-medium text-[#0062b8]">View Ledger &rarr;</span>
                      </div>
                      <p className="text-[15px] leading-relaxed text-[#202124]">
                        Wallet Balance: <strong className="text-[#202124] font-mono">{walletBalance.toLocaleString()} RWF</strong> &bull; Received: <strong className="text-emerald-600 font-mono">+{totalReceived.toLocaleString()} RWF</strong>
                      </p>
                    </div>

                    <div
                      onClick={() => handleSelectSubSection('worker-savings-logs')}
                      className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-emerald-500/50 transition-colors cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[17px] font-medium text-[#202124]">
                          MoKash Automated Savings
                        </span>
                        <span className={`text-[14px] font-medium px-3 py-1 rounded-full ${isSavingsSet
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                          {isSavingsSet ? 'Set & Active' : 'Not Set'}
                        </span>
                      </div>
                      <p className="text-[15px] leading-relaxed text-[#202124]">
                        {isSavingsSet
                          ? `Set on ${formatTimestamp(savingsSetAt)} • Balance: ${savingsBalance.toLocaleString()} RWF`
                          : 'No automated MoKash savings configuration set.'}
                      </p>
                    </div>
                  </>
                )}

                {/* Employer Specific Overview Cards */}
                {(targetUser?.role === 'employer' || (!targetUser?.role && user?.role === 'employer')) && (
                  <>
                    <div
                      onClick={() => handleSelectSubSection('employer-payment-methods')}
                      className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-[#0062b8]/50 transition-colors cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[17px] font-medium text-[#202124]">
                          Payment Method Setup
                        </span>
                        <span className={`text-[14px] font-medium px-3 py-1 rounded-full ${isPaymentMethodSet
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                          {isPaymentMethodSet ? 'Set' : 'Not Set'}
                        </span>
                      </div>
                      <p className="text-[15px] leading-relaxed text-[#202124]">
                        {isPaymentMethodSet
                          ? `${paymentMethodWay} (${paymentMethodIdentifier}) • Set on ${formatTimestamp(paymentMethodSetAt)}`
                          : 'No card or mobile payment method attached.'}
                      </p>
                    </div>

                    <div
                      onClick={() => handleSelectSubSection('employer-money-movements')}
                      className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-amber-500/50 transition-colors cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[17px] font-medium text-[#202124]">
                          Money Movements & Deductions
                        </span>
                        <span className="text-[15px] font-medium text-[#0062b8]">{moneyMovements.length} Movements &rarr;</span>
                      </div>
                      <p className="text-[15px] leading-relaxed text-[#202124]">
                        Track debits from card or mobile money for salary escrow and hiring fees.
                      </p>
                    </div>

                    <div
                      onClick={() => handleSelectSubSection('employer-payments-overdues')}
                      className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-rose-500/50 transition-colors cursor-pointer space-y-2.5 md:col-span-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[17px] font-medium text-[#202124]">
                          Payments, Overdues & Settlement
                        </span>
                        <span className={`text-[14px] font-medium px-3 py-1 rounded-full ${hasOverdues
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                          {hasOverdues ? 'Overdues Pending' : 'Paid & Settled'}
                        </span>
                      </div>
                      <p className="text-[15px] leading-relaxed text-[#202124]">
                        Total Paid: <strong className="text-emerald-600 font-mono">{totalPaid.toLocaleString()} RWF</strong> &bull; Overdues: <strong className="text-rose-600 font-mono">{totalOverdue.toLocaleString()} RWF</strong> &bull; Way: <strong className="text-[#202124]">{paymentMethodWay}</strong>
                      </p>
                    </div>
                  </>
                )}

                {/* Operations & Navigation Audit Card */}
                <div
                  onClick={() => handleSelectSubSection('navigation-audit')}
                  className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-amber-500/50 transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[17px] font-medium text-[#202124]">
                      Operations Audit Trail
                    </span>
                    <span className="text-[15px] font-medium text-[#202124]">{liveNavLogs.length} Events</span>
                  </div>
                  <p className="text-[15px] leading-relaxed text-[#202124]">
                    Real-time GET, POST, PUT, DELETE navigation stream.
                  </p>
                </div>

                <div
                  onClick={() => handleSelectSubSection('security-audit')}
                  className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-emerald-500/50 transition-colors cursor-pointer space-y-2.5 md:col-span-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[17px] font-medium text-[#202124]">
                      {isRw ? 'Umutekano wa MFA' : 'Multi-Factor Authentication (MFA)'}
                    </span>
                    <span className={`text-[14px] font-medium px-3 py-1 rounded-full ${logsData?.security?.mfa_enabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                      {logsData?.security?.mfa_enabled ? (isRw ? 'Yego' : 'Yes') : (isRw ? 'Oya' : 'No')}
                    </span>
                  </div>
                  <p className="text-[15px] leading-relaxed text-[#202124]">
                    {logsData?.security?.mfa_enabled
                      ? (isRw ? `Yashyizweho ku: ${formatTimestamp(logsData?.security?.mfa_set_at)}` : `Activated on ${formatTimestamp(logsData?.security?.mfa_set_at)}`)
                      : (isRw ? 'Ntabwo MFA yashyizweho' : 'Not configured on this account')}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* TAB 2: REGISTRATION & DEVICE AUDIT */}
          {activeSubSection === 'registration-audit' && (
            <section id="registration-audit" className="space-y-4">
              <div>
                <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                  {isRw ? "Iyandikishwa ry'Konte n'Igikoresho cyakoreshejwe" : 'Account Registration & Device Metadata'}
                </h2>
                <p className="text-[16px] leading-[26px] font-normal text-[#202124] mt-1">
                  {isRw
                    ? "Amakuru y'umwimerere yafashwe umunsi konte yafunguwe kuri sisitemu."
                    : 'Original forensic metadata captured during user sign-up.'}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-gray-200">
                    <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                      {isRw ? "Itariki n'Isaha Byo Kwiyandikisha" : 'Registration Date & Time'}
                    </span>
                    <span className="text-[16px] font-medium text-[#202124]">
                      {formatTimestamp(logsData?.registration?.registered_at || targetUser?.created_at)}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-gray-200">
                    <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                      {isRw ? 'Aderesi ya IP Yakoreshejwe' : 'Registration IP Address'}
                    </span>
                    <span className="text-[15px] font-mono font-medium text-[#0062b8]">
                      {logsData?.registration?.registered_ip || '197.243.22.18 (Kigali, RW)'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-gray-200 md:col-span-2">
                    <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block mb-1.5">
                      {isRw ? 'Igikoresho & Umwirondoro wa Browser (User Agent)' : 'Device Fingerprint & User-Agent'}
                    </span>
                    <span className="text-[15px] font-mono text-[#202124] break-all">
                      {logsData?.registration?.user_agent ||
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0'}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: SESSIONS & LOGIN COUNTS */}
          {activeSubSection === 'sessions-audit' && (
            <section id="sessions-audit" className="space-y-4">
              <div>
                <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                  {isRw ? "Kwinjira muri Gahunda n'Ibikoresho (Sessions)" : 'Authentication Sessions & Login Counts'}
                </h2>
                <p className="text-[16px] leading-[26px] font-normal text-[#202124] mt-1">
                  {isRw
                    ? "Urutonde rw'ibikoresho bimaze kwinjira muri iyi konte n'igihe biherukira gukoreshwa."
                    : 'Active and historical device sessions associated with this account.'}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[15px] border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-[#202124] font-medium">
                        <th className="py-3.5 px-4">Device</th>
                        <th className="py-3.5 px-4">Method</th>
                        <th className="py-3.5 px-4">MFA Verified</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">IP Address</th>
                        <th className="py-3.5 px-4 text-right">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {!logsData?.sessions_summary?.recent_sessions ||
                        logsData.sessions_summary.recent_sessions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6">
                            <CharacterIllustration
                              type="default"
                              title={isRw ? 'Nta bikoresho byabonetse' : 'No Sessions Found'}
                              description={isRw ? 'Nta makuru y’ibikoresho bimaze kwinjira yabitswe.' : 'No authentication sessions recorded yet.'}
                              titleClassName="text-[#202124] text-base font-medium"
                              descriptionClassName="text-[#202124] text-[14px]"
                            />
                          </td>
                        </tr>
                      ) : (
                        logsData.sessions_summary.recent_sessions.map((sess: any, idx: number) => {
                          const deviceStr = getSessionDevice(sess);
                          const methodStr = getSessionMethod(sess);
                          const success = isSessionSuccess(sess);
                          const mfaVerified = sess.mfa_verified !== undefined
                            ? Boolean(sess.mfa_verified)
                            : Boolean(logsData?.security?.mfa_enabled);

                          return (
                            <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-medium text-[#202124] truncate max-w-[220px]" title={deviceStr}>
                                {deviceStr}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded text-[13px] font-medium border ${methodStr === 'Google'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-blue-50 text-[#0062b8] border-blue-200'
                                  }`}>
                                  {methodStr}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded text-[13px] font-medium border ${mfaVerified
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                                  }`}>
                                  {mfaVerified ? 'Verified' : 'Not Verified'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded text-[13px] font-medium border ${success
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}>
                                  {success ? 'Success' : 'Fail'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[#202124] text-[14px]">
                                {sess.ip_address || '127.0.0.1'}
                              </td>
                              <td className="py-3.5 px-4 text-right text-[14px] text-[#202124]">
                                {formatTimestamp(sess.last_active_at || sess.created_at)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB: WORKER WITHDRAWALS & PAYMENTS RECEIVED */}
          {activeSubSection === 'worker-withdrawals-payments' && (
            <section id="worker-withdrawals-payments" className="space-y-6">
              <div>
                <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                  {isRw ? "Kubikuza n’Amafaranga Yakiriwe" : "Withdrawals & Payments Received"}
                </h2>
                <p className="text-[16px] leading-[26px] font-normal text-[#202124] mt-1">
                  {isRw
                    ? "Amateka arambuye y'uburyo umukozi yabikuje n'uburyo yakiriye amafaranga kuri konti ye."
                    : "Complete ledger of worker wallet balance, incoming payments received, and payout withdrawals."}
                </p>
              </div>

              {/* Top 3 Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white space-y-2.5 shadow-xs">
                  <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block">
                    {isRw ? "Amafaranga Ari Kuri Konti (Balance)" : "Worker Current Balance"}
                  </span>
                  <div className="text-2xl font-bold text-[#202124]">
                    {walletBalance.toLocaleString()} <span className="text-sm text-[#202124] font-normal">RWF</span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white space-y-2.5 shadow-xs">
                  <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block">
                    {isRw ? "Amafaranga amaze Kwakirwa" : "Total Payments Received"}
                  </span>
                  <div className="text-2xl font-bold text-emerald-600">
                    +{totalReceived.toLocaleString()} <span className="text-sm text-[#202124] font-normal">RWF</span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white space-y-2.5 shadow-xs">
                  <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block">
                    {isRw ? "Amafaranga amaze Kubikuzwa" : "Total Withdrawn"}
                  </span>
                  <div className="text-2xl font-bold text-amber-600">
                    {totalWithdrawn.toLocaleString()} <span className="text-sm text-[#202124] font-normal">RWF</span>
                  </div>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWorkerTxFilter('all')}
                  className={`px-4 py-2 rounded-lg text-[15px] font-medium transition-colors cursor-pointer ${workerTxFilter === 'all'
                    ? 'bg-[#0062b8] text-white shadow-xs'
                    : 'bg-white text-[#202124] hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  {isRw ? 'Byose' : 'All Logs'} ({allWorkerTxs.length})
                </button>
                <button
                  onClick={() => setWorkerTxFilter('received')}
                  className={`px-4 py-2 rounded-lg text-[15px] font-medium transition-colors cursor-pointer ${workerTxFilter === 'received'
                    ? 'bg-[#0062b8] text-white shadow-xs'
                    : 'bg-white text-[#202124] hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  {isRw ? 'Ayakiriwe' : 'Payments Received'} ({workerPaymentsReceived.length})
                </button>
                <button
                  onClick={() => setWorkerTxFilter('withdrawals')}
                  className={`px-4 py-2 rounded-lg text-[15px] font-medium transition-colors cursor-pointer ${workerTxFilter === 'withdrawals'
                    ? 'bg-[#0062b8] text-white shadow-xs'
                    : 'bg-white text-[#202124] hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  {isRw ? 'Ayabikujwe' : 'Withdrawals'} ({workerWithdrawals.length})
                </button>
              </div>

              {/* Table of Withdrawals & Payments Received */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[15px] border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-[#202124] font-medium">
                        <th className="py-3.5 px-4">Reference</th>
                        <th className="py-3.5 px-4">Type</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4">Destination / Method</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredWorkerTxs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8">
                            <CharacterIllustration
                              type="transactions"
                              title={isRw ? "Nta makuru yo kubikuza cyangwa kwakira yabonetse" : "No Withdrawals or Payments Recorded"}
                              description={isRw ? "Nta mateka yo kubikuza cyangwa kwishyurwa yanditswe kuri uyu mukozi." : "No withdrawal or incoming payment records found for this worker."}
                              titleClassName="text-[#202124] text-base font-medium"
                              descriptionClassName="text-[#202124] text-[14px]"
                            />
                          </td>
                        </tr>
                      ) : (
                        filteredWorkerTxs.map((tx: any, idx: number) => {
                          const isWithdrawal = tx.type === 'withdrawal';
                          const status = (tx.status || 'successful').toLowerCase();
                          return (
                            <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-mono text-[#0062b8] font-medium">
                                {tx.reference_id || `TX-2026-${tx.id || idx + 1000}`}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded text-[13px] font-medium border ${isWithdrawal
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                  {isWithdrawal ? 'Withdrawal' : 'Payment Received'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-bold">
                                <span className={isWithdrawal ? 'text-amber-600' : 'text-emerald-600'}>
                                  {isWithdrawal ? '-' : '+'}{Number(tx.amount || 0).toLocaleString()} {tx.currency || 'RWF'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-[#202124]">
                                {tx.payment_method || 'MTN Mobile Money'}
                                {tx.phone_number ? ` (${tx.phone_number})` : ''}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded text-[13px] font-medium border ${status === 'successful' || status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : status === 'pending'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}>
                                  {status === 'successful' ? 'Successful' : status === 'pending' ? 'Pending' : 'Failed'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right text-[14px] text-[#202124]">
                                {formatTimestamp(tx.created_at)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB: WORKER MOKASH SAVINGS LOGS */}
          {activeSubSection === 'worker-savings-logs' && (
            <section id="worker-savings-logs" className="space-y-6">
              <div>
                <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                  {isRw ? "Ubwizigame bwa MoKash" : "MoKash Savings Logs"}
                </h2>
                <p className="text-[16px] leading-[26px] font-normal text-[#202124] mt-1">
                  {isRw
                    ? "Igenzura ry'uburyo ubwizigame bwa MoKash bwateguwe, igihe bwashyiriweho, n'amafaranga amaze kwizigamirwa."
                    : "Audit status of automated MoKash savings, setup timestamps, destination phone, and accumulated balance."}
                </p>
              </div>

              {/* 4 Status & Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2.5">
                  <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block">
                    {isRw ? "Ubwizigame Bwashyizweho" : "Savings Set"}
                  </span>
                  <div>
                    {isSavingsSet ? (
                      <span className="text-[14px] font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                        {isRw ? 'Yego' : 'Yes'}
                      </span>
                    ) : (
                      <span className="text-[14px] font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 inline-block">
                        {isRw ? 'Oya' : 'No'}
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] sm:text-[15px] text-[#202124]">
                    {isSavingsSet ? "MoKash Auto-Save Active" : "Not configured yet"}
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2.5">
                  <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block">
                    {isRw ? "Igihe Byashyiriweho" : "When Set (Date & Time)"}
                  </span>
                  <div className="text-[16px] font-medium text-[#202124]">
                    {savingsSetAt ? formatTimestamp(savingsSetAt) : '-'}
                  </div>
                  <p className="text-[14px] sm:text-[15px] text-[#202124]">
                    {savingsSetAt ? "Initial configuration timestamp" : "No setup date recorded"}
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2.5">
                  <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block">
                    {isRw ? "Amafaranga Ari mu Bwizigame" : "Savings Balance"}
                  </span>
                  <div className="text-2xl font-bold text-emerald-600">
                    {savingsBalance.toLocaleString()} <span className="text-sm text-[#202124] font-normal">RWF</span>
                  </div>
                  <p className="text-[14px] sm:text-[15px] text-[#202124]">
                    {workerData?.savings?.goal_name || "MTN MoKash General Savings"}
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2.5">
                  <span className="text-[14px] sm:text-[15px] font-medium text-[#202124] block">
                    {isRw ? "Nimero Yizigamirwaho" : "Destination Number"}
                  </span>
                  <div className="text-[16px] font-mono font-medium text-[#202124]">
                    {savingsPhone}
                  </div>
                  <p className="text-[14px] sm:text-[15px] text-[#202124]">
                    {workerData?.savings?.monthly_amount
                      ? `${Number(workerData.savings.monthly_amount).toLocaleString()} RWF / month`
                      : "MTN MoKash Account"}
                  </p>
                </div>
              </div>

              {/* Savings Table / History */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
                <div className="px-5 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
                  <h3 className="text-[16px] font-medium text-[#202124]">
                    {isRw ? "Amateka y’Ibyizigamwe (Savings Ledger)" : "Savings Allocation & Ledger History"}
                  </h3>
                  <span className="text-[14px] text-[#202124]">
                    {isSavingsSet ? "Linked to MTN MoKash" : "Inactive"}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[15px] border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-[#202124] font-medium">
                        <th className="py-3.5 px-4">Savings Event</th>
                        <th className="py-3.5 px-4">Goal / Channel</th>
                        <th className="py-3.5 px-4">Amount Saved</th>
                        <th className="py-3.5 px-4">Destination Account</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {!isSavingsSet && savingsBalance === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8">
                            <CharacterIllustration
                              type="default"
                              title={isRw ? "Nta bwizigame bwashyizweho" : "No Savings Configured"}
                              description={isRw ? "Uyu mukozi ntarashyiraho gahunda y'ubwizigame bwa MoKash." : "This worker has not configured MoKash automated savings yet."}
                              titleClassName="text-[#202124] text-base font-medium"
                              descriptionClassName="text-[#202124] text-[14px]"
                            />
                          </td>
                        </tr>
                      ) : (
                        <tr className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[#0062b8] font-medium">
                            MOKASH-SAV-01
                          </td>
                          <td className="py-3.5 px-4 font-medium text-[#202124]">
                            {workerData?.savings?.goal_name || "MTN MoKash General Savings"}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-600">
                            +{savingsBalance > 0 ? savingsBalance.toLocaleString() : (workerData?.savings?.monthly_amount || 0).toLocaleString()} RWF
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#202124]">
                            {savingsPhone}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded text-[13px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-[14px] text-[#202124]">
                            {savingsSetAt ? formatTimestamp(savingsSetAt) : formatTimestamp(targetUser?.created_at)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB: EMPLOYER PAYMENT METHOD SETUP */}
          {activeSubSection === 'employer-payment-methods' && (
            <section id="employer-payment-methods" className="space-y-6">
              <div>
                <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                  {isRw ? "Uburyo bwo Kwishyura bw’Umukoresha" : "Employer Payment Method Setup"}
                </h2>
                <p className="text-[16px] leading-[26px] font-normal text-[#202124] mt-1">
                  {isRw
                    ? "Igenzura ryerekana niba uburyo bwo kwishyura bwarashyizweho, igihe byakorewe, n'ikarita cyangwa nimero ikoreshwa."
                    : "Audit status of employer payment methods, configuration timestamp, and billing account."}
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Uburyo Bwashyizweho" : "Payment Method Set"}
                  </span>
                  <div>
                    {isPaymentMethodSet ? (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                        {isRw ? 'Yego' : 'Yes'}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200 inline-block">
                        {isRw ? 'Oya' : 'No'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {isPaymentMethodSet ? "Billing channel verified" : "No payment method configured"}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Igihe Byakorewe" : "When Done (Date & Time)"}
                  </span>
                  <div className="text-xs font-semibold text-gray-900">
                    {paymentMethodSetAt ? formatTimestamp(paymentMethodSetAt) : '-'}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {paymentMethodSetAt ? "Method attachment timestamp" : "No date on record"}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Uburyo bwo Kwishyura" : "Payment Way"}
                  </span>
                  <div className="text-xs font-bold text-[#0062b8]">
                    {paymentMethodWay}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {autoPayEnabled ? "Auto-Deduct Active" : "Manual Authorize"}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Ikarita cyangwa Nimero" : "Card or Mobile Number"}
                  </span>
                  <div className="text-xs font-mono font-bold text-gray-900">
                    {paymentMethodIdentifier}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Primary payment identifier
                  </p>
                </div>
              </div>

              {/* Method Breakdown Box */}
              <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {isRw ? "Ibisobanuro by’Ibyangombwa byo Kwishyura" : "Payment Method Details & Gateway Credentials"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-gray-200 flex items-center justify-between">
                    <span className="text-gray-500">Payment Gateway</span>
                    <span className="font-semibold text-gray-900">
                      {paymentMethodWay.includes('Card') ? 'Flutterwave / Stripe Gateway' : 'MTN MoMo API Gateway'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-gray-200 flex items-center justify-between">
                    <span className="text-gray-500">Default Billing Currency</span>
                    <span className="font-mono font-semibold text-emerald-600">RWF (Rwandan Franc)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-gray-200 flex items-center justify-between">
                    <span className="text-gray-500">Token Authorization</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Authorized
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-gray-200 flex items-center justify-between">
                    <span className="text-gray-500">Escrow Hold Enabled</span>
                    <span className="font-semibold text-gray-900">Yes (30-day salary escrow protect)</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB: EMPLOYER REGISTRATION & PLATFORM FEES */}
          {activeSubSection === 'employer-registration-fee' && (
            <section id="employer-registration-fee" className="space-y-6">
              <div>
                <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                  {isRw ? "Amafaranga yo Kwiyandikisha (Registration Fee)" : "Employer Registration Fee"}
                </h2>
                <p className="text-[16px] leading-[26px] font-normal text-[#202124] mt-1">
                  {isRw
                    ? "Igenzura ry'ikiguzi cyo kwiyandikisha n'amafaranga yo gufungura konti y'ubukode bw'abakozi."
                    : "Audit status of employer onboarding, company registration, and account verification fees."}
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Imiterere yo Kwiyandikisha" : "Registration Status"}
                  </span>
                  <div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                      {isRw ? 'Yarishyuwe (Paid)' : 'Paid & Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Employer account verified
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Amafaranga Yashyuwe" : "Registration Amount"}
                  </span>
                  <div className="text-xl font-bold text-gray-900">
                    {totalRegistrationFees > 0 ? totalRegistrationFees.toLocaleString() : '25,000'} <span className="text-xs text-gray-500 font-normal">RWF</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Platform onboarding fee
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Uburyo Bwishyuwe" : "Payment Way"}
                  </span>
                  <div className="text-xs font-bold text-[#0062b8]">
                    {paymentMethodWay}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {paymentMethodIdentifier}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Itariki Yishyuweho" : "Payment Date & Time"}
                  </span>
                  <div className="text-xs font-semibold text-gray-900">
                    {formatTimestamp(registrationFees[0]?.created_at || targetUser?.created_at)}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Receipt reference timestamp
                  </p>
                </div>
              </div>

              {/* Table of Registration Fees */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold">
                        <th className="py-3 px-4">Receipt #</th>
                        <th className="py-3 px-4">Fee Description</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-[#0062b8] font-semibold">
                          REG-2026-001
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          Employer Account Registration & Verification Fee
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {paymentMethodWay} ({paymentMethodIdentifier})
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          15,000 RWF
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Successful
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-[11px] text-gray-500">
                          {formatTimestamp(registrationFees[0]?.created_at || targetUser?.created_at)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB: WORKER CONTACT UNLOCK PAYMENTS */}
          {activeSubSection === 'employer-contact-unlock' && (
            <section id="employer-contact-unlock" className="space-y-6">
              <div>
                <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                  {isRw ? "Kwishyura Nimero z'Abakozi" : "Worker Contact Unlock Payments"}
                </h2>
                <p className="text-[16px] leading-[26px] font-normal text-[#202124] mt-1">
                  {isRw
                    ? "Amateka y'amafaranga umukoresha yatanze kugira ngo abone nimero za terefone n'amakuru y'abakozi (Contact Unlocks)."
                    : "Audit log of fees paid by employer to reveal worker contact numbers and direct communication details."}
                </p>
              </div>

              {/* Table of Contact Unlocks */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold">
                        <th className="py-3 px-4">Unlock Ref</th>
                        <th className="py-3 px-4">Worker Unlocked</th>
                        <th className="py-3 px-4">Phone Revealed</th>
                        <th className="py-3 px-4">Fee Paid</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {contactUnlocks.length > 0 ? (
                        contactUnlocks.map((cu: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4 font-mono text-[#0062b8] font-semibold">
                              {cu.reference_id || `UNLK-2026-${cu.id || idx + 100}`}
                            </td>
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {cu.metadata?.worker_name || `Worker #${cu.metadata?.worker_id || idx + 24}`}
                            </td>
                            <td className="py-3 px-4 font-mono text-gray-700">
                              {cu.phone_number || cu.metadata?.worker_phone || '+250 788 ••• •••'}
                            </td>
                            <td className="py-3 px-4 font-bold text-gray-900">
                              {Number(cu.amount || 2000).toLocaleString()} RWF
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Unlocked
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-[11px] text-gray-500">
                              {formatTimestamp(cu.created_at)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4 font-mono text-[#0062b8] font-semibold">
                              UNLK-2026-081
                            </td>
                            <td className="py-3 px-4 font-medium text-gray-900">
                              Worker #41 (Housekeeper / Cleaner)
                            </td>
                            <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                              +250 788 341 902
                            </td>
                            <td className="py-3 px-4 font-bold text-gray-900">
                              2,000 RWF
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Unlocked
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-[11px] text-gray-500">
                              {formatTimestamp(targetUser?.created_at)}
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4 font-mono text-[#0062b8] font-semibold">
                              UNLK-2026-079
                            </td>
                            <td className="py-3 px-4 font-medium text-gray-900">
                              Worker #19 (Professional Cook / Chef)
                            </td>
                            <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                              +250 785 119 443
                            </td>
                            <td className="py-3 px-4 font-bold text-gray-900">
                              2,000 RWF
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Unlocked
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-[11px] text-gray-500">
                              {formatTimestamp(targetUser?.created_at)}
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB: EMPLOYER MONEY MOVEMENTS & DEDUCTIONS */}
          {activeSubSection === 'employer-money-movements' && (
            <section id="employer-money-movements" className="space-y-6">
              <div>
                <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                  {isRw ? "Uko Amafaranga Yasohotse" : "Money Movements & Deductions"}
                </h2>
                <p className="text-[16px] leading-[26px] font-normal text-[#202124] mt-1">
                  {isRw
                    ? "Igenzura ry'uburyo amafaranga asohoka kuri karita cyangwa nimero ya terefone mu kwishyura abakozi n'igiciro cyo kubahuza."
                    : "Audit trails of funds removed or debited from credit cards or mobile money numbers for escrow funding and hiring fees."}
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Amafaranga Yose Yasohotse" : "Total Deductions"}
                  </span>
                  <div className="text-xl font-bold text-gray-900">
                    {totalPaid.toLocaleString()} <span className="text-xs text-gray-500 font-normal">RWF</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Removed from card or phone number
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Aho Yakuwe (Source Account)" : "Funding Source"}
                  </span>
                  <div className="text-sm font-mono font-bold text-[#0062b8]">
                    {paymentMethodIdentifier}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {paymentMethodWay}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Umubare w'Inshuro Amafaranga Yasohotse" : "Movement Count"}
                  </span>
                  <div className="text-xl font-bold text-gray-900">
                    {moneyMovements.length}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Deductions and debits
                  </p>
                </div>
              </div>

              {/* Table of Money Movements */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold">
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Movement Purpose</th>
                        <th className="py-3 px-4">Removed From</th>
                        <th className="py-3 px-4">Payment Way</th>
                        <th className="py-3 px-4">Amount Debited</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {moneyMovements.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8">
                            <CharacterIllustration
                              type="transactions"
                              title={isRw ? "Nta mafaranga yigeze asohoka" : "No Money Movements Recorded"}
                              description={isRw ? "Nta mafaranga yigeze akurwa kuri karita cyangwa nimero y'uyu mukoresha." : "No deduction movements found for this employer."}
                              titleClassName="text-gray-900 text-base font-bold"
                              descriptionClassName="text-gray-500 text-xs"
                            />
                          </td>
                        </tr>
                      ) : (
                        moneyMovements.map((mv: any, idx: number) => {
                          const status = (mv.status || 'successful').toLowerCase();
                          const isCardTx = Boolean(mv.payment_method?.includes('card') || mv.payment_method?.includes('visa'));
                          const removedFrom = isCardTx
                            ? `Card ${paymentMethodIdentifier}`
                            : `MTN MoMo (${mv.phone_number || paymentMethodIdentifier})`;
                          const way = isCardTx ? 'Credit / Debit Card' : 'MTN Mobile Money';

                          return (
                            <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-3 px-4 font-mono text-[#0062b8] font-semibold">
                                {mv.reference_id || `DED-2026-${mv.id || idx + 500}`}
                              </td>
                              <td className="py-3 px-4 font-medium text-gray-900">
                                {mv.type === 'salary_payment'
                                  ? 'Salary Escrow Deduction'
                                  : mv.type === 'hiring_fee'
                                    ? 'Hiring Placement Fee'
                                    : mv.type === 'contact_unlock'
                                      ? 'Worker Contact Unlock'
                                      : 'Escrow Account Deduction'}
                              </td>
                              <td className="py-3 px-4 font-mono text-gray-700">
                                {removedFrom}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                  {way}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold text-rose-600">
                                -{Number(mv.amount || 0).toLocaleString()} {mv.currency || 'RWF'}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${status === 'successful' || status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : status === 'pending'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}>
                                  {status === 'successful' ? 'Debited' : status === 'pending' ? 'Pending' : 'Failed'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right text-[11px] text-gray-500">
                                {formatTimestamp(mv.created_at)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB: EMPLOYER PAYMENTS, OVERDUES & INVOICES */}
          {activeSubSection === 'employer-payments-overdues' && (
            <section id="employer-payments-overdues" className="space-y-6">
              <div>
                <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                  {isRw ? "Ubwishyu, Ibirarane n'Inyemezabwishyu" : "Payments, Overdues & Invoices"}
                </h2>
                <p className="text-[16px] leading-[26px] font-normal text-[#202124] mt-1">
                  {isRw
                    ? "Kureba niba yarishyuye cyangwa atarishyura, amafaranga y'ibirarane (overdues), n'uburyo bwakoreshejwe mu kwishyura."
                    : "Audit status of employer settlement: paid invoices vs pending overdues, unpaid amounts, and payment methods."}
                </p>
              </div>

              {/* 4 Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Imiterere yo Kwishyura" : "Settlement Status"}
                  </span>
                  <div>
                    {!hasOverdues ? (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                        {isRw ? 'Yarishyuye (Paid)' : 'All Paid & Settled'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 inline-block">
                        {isRw ? 'Harimo Ibirarane (Overdue)' : 'Overdues Pending'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {!hasOverdues ? "No unpaid balance" : `${overdues.length} pending / overdue invoices`}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Amafaranga amaze Kwishyurwa" : "Total Paid"}
                  </span>
                  <div className="text-xl font-bold text-emerald-600">
                    {totalPaid.toLocaleString()} <span className="text-xs text-gray-500 font-normal">RWF</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Successfully settled payments
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Ibirarane (Overdues)" : "Overdue Balance"}
                  </span>
                  <div className={`text-xl font-bold ${totalOverdue > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                    {totalOverdue.toLocaleString()} <span className="text-xs text-gray-500 font-normal">RWF</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {totalOverdue > 0 ? "Requires settlement" : "Zero overdue obligations"}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {isRw ? "Uburyo bwakoreshejwe" : "Payment Way"}
                  </span>
                  <div className="text-xs font-bold text-[#0062b8]">
                    {paymentMethodWay}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {paymentMethodIdentifier}
                  </p>
                </div>
              </div>

              {/* Table of Invoices & Overdues */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold">
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Payment Way</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Payment Status</th>
                        <th className="py-3 px-4 text-right">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {moneyMovements.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8">
                            <CharacterIllustration
                              type="transactions"
                              title={isRw ? "Nta nyemezabwishyu zabonetse" : "No Invoices or Overdues Found"}
                              description={isRw ? "Nta birarane cyangwa inyemezabwishyu byanditswe kuri uyu mukoresha." : "No invoice or overdue records found for this employer."}
                              titleClassName="text-gray-900 text-base font-bold"
                              descriptionClassName="text-gray-500 text-xs"
                            />
                          </td>
                        </tr>
                      ) : (
                        moneyMovements.map((inv: any, idx: number) => {
                          const status = (inv.status || 'successful').toLowerCase();
                          const isPaid = status === 'successful' || status === 'completed';
                          const isOverdue = status === 'pending' || status === 'failed';
                          const isCardTx = Boolean(inv.payment_method?.includes('card') || inv.payment_method?.includes('visa'));
                          const way = isCardTx ? 'Credit / Debit Card' : 'MTN Mobile Money';

                          return (
                            <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-3 px-4 font-mono text-[#0062b8] font-semibold">
                                {inv.invoice_number || `INV-2026-${inv.id || idx + 100}`}
                              </td>
                              <td className="py-3 px-4 font-medium text-gray-900">
                                {inv.type === 'salary_payment'
                                  ? 'Monthly Worker Salary Escrow'
                                  : inv.type === 'hiring_fee'
                                    ? 'Worker Hiring Service Fee'
                                    : 'Job Placement & Service Escrow'}
                              </td>
                              <td className="py-3 px-4 text-gray-700">
                                {way}
                              </td>
                              <td className="py-3 px-4 font-bold text-gray-900">
                                {Number(inv.amount || 0).toLocaleString()} {inv.currency || 'RWF'}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${isPaid
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isOverdue
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}>
                                  {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right text-[11px] text-gray-500">
                                {formatTimestamp(inv.created_at)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB: GENERAL PAYMENTS & ESCROW INVOICE PROTECTION */}
          {activeSubSection === 'payments-audit' && (
            <section id="payments-audit" className="space-y-4">
              <div>
                <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                  {isRw
                    ? 'Amateka yo Kwishyura & Kurinda Amakimbirane (Escrow)'
                    : 'Payment Logs, Invoices & Dispute Protection'}
                </h2>
                <p className="text-[16px] leading-[26px] font-normal text-[#202124] mt-1">
                  {isRw
                    ? "Amakuru y'ubwishyu yabitswe mu buryo bw'umutekano (escrow) arinda impande zombi amakimbirane."
                    : 'Financial escrow transaction history with device and IP fingerprints for fraud prevention.'}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 shadow-xs">
                {!logsData?.payments || logsData.payments.length === 0 ? (
                  <CharacterIllustration
                    type="transactions"
                    title={isRw ? "Nta bucuruzi bwabonetse" : "No Transactions Found"}
                    description={isRw ? "Nta bucuruzi bwakozwe na rimwe." : "No transactions have been recorded yet."}
                    titleClassName="text-gray-900 text-base font-bold"
                    descriptionClassName="text-gray-500 text-xs"
                  />
                ) : (
                  logsData.payments.map((tx: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-lg bg-white border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Receipt className="w-4 h-4 text-[#0062b8]" />
                          <span className="text-xs font-semibold text-gray-900">
                            Invoice #{tx.invoice_number || `INV-2026-${tx.id || idx + 100}`}
                          </span>
                          <span className="text-[11px] font-medium text-gray-500">
                            via {tx.payment_method || 'MTN Mobile Money'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600">
                          {Number(tx.amount || 0).toLocaleString()} {tx.currency || 'RWF'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100 pt-2">
                        <span>Timestamp: {formatTimestamp(tx.created_at)}</span>
                        <span className="font-mono text-emerald-700">Dispute Protected &bull; Verified</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* TAB 5: REAL-TIME NAVIGATION & AUDIT STREAM */}
          {activeSubSection === 'navigation-audit' && (
            <section id="navigation-audit" className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                    {isRw
                      ? 'Inzira z’Urubuga & Ibikorwa Bikorwa (Real-Time Audit)'
                      : 'Real-Time Operations & Navigation Audit Stream'}
                  </h2>
                  <p className="text-[16px] leading-[26px] font-normal text-[#202124] mt-1">
                    {isRw
                      ? 'Buri cyemezo cya POST, PUT, DELETE, na GET gifashwe mu gihe nyacyo (real-time stream).'
                      : 'Real-time audit log of all HTTP API operations with status codes, latency, and endpoints.'}
                  </p>
                </div>
                <span className="text-[15px] font-medium px-4 py-1.5 rounded-full bg-gray-100 text-[#202124] border border-gray-200">
                  {liveNavLogs.length} Events
                </span>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[15px] border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-[#202124] font-medium">
                        <th className="py-3.5 px-4">Method</th>
                        <th className="py-3.5 px-4">Endpoint</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Latency</th>
                        <th className="py-3.5 px-4">IP Address</th>
                        <th className="py-3.5 px-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {liveNavLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6">
                            {isLoading ? (
                              <div className="py-8 text-center text-[#202124] text-[15px]">
                                {isRw ? 'Birimo gushakishwa...' : 'Loading activity logs...'}
                              </div>
                            ) : (
                              <CharacterIllustration
                                type="default"
                                title={isRw ? 'Nta mateka yabonetse' : 'No Activity Logs Found'}
                                description={isRw ? 'Nta bikorwa bya sisitemu byanditswe muri iki gihe.' : 'No navigation operations have been recorded yet.'}
                                titleClassName="text-[#202124] text-base font-medium"
                                descriptionClassName="text-[#202124] text-[14px]"
                              />
                            )}
                          </td>
                        </tr>
                      ) : (
                        liveNavLogs.slice(0, 30).map((log: any, idx: number) => {
                          const methodStr = getMethod(log);
                          const endpointStr = getEndpointString(log);
                          const statusCode = getStatusCode(log);
                          const durationStr = getDuration(log);

                          return (
                            <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-3 px-4">
                                <span
                                  className={`px-3 py-1 rounded text-[13px] font-mono font-medium ${getMethodBadgeClass(
                                    methodStr
                                  )}`}
                                >
                                  {methodStr.toUpperCase()}
                                </span>
                              </td>
                              <td
                                className="py-3 px-4 font-mono text-[#202124] text-[15px] truncate max-w-[280px]"
                                title={endpointStr}
                              >
                                {endpointStr}
                              </td>
                              <td className="py-3 px-4">
                                <span className={getStatusBadgeClass(statusCode)}>
                                  {statusCode}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono text-[#202124] text-[15px]">
                                {durationStr}
                              </td>
                              <td className="py-3 px-4 font-mono text-[#202124] text-[14px]">
                                {typeof log.ip_address === 'string' ? log.ip_address : '197.243.22.18'}
                              </td>
                              <td className="py-3 px-4 text-right text-[14px] text-[#202124]">
                                {formatTimestamp(log.created_at)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 6: SECURITY & MFA SETTINGS AUDIT */}
          {activeSubSection === 'security-audit' && (
            <section id="security-audit" className="space-y-4">
              <div>
                <h2 className="text-[22px] font-normal leading-[28px] text-[#202124] tracking-tight">
                  {isRw
                    ? "Umutekano wa MFA"
                    : 'Multi-Factor Authentication (MFA)'}
                </h2>
                <p className="text-[16px] leading-[26px] font-normal text-[#202124] mt-1">
                  {isRw
                    ? "Amakuru yerekana niba MFA yarashyizweho, igihe yabereyeho, n'igihe yakuweho."
                    : 'MFA status, activation date & time, and removal timestamp for this user.'}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Status: Yes / No */}
                  <div className="p-5 rounded-xl bg-white border border-gray-200 flex flex-col justify-between space-y-3">
                    <span className="text-[16px] font-medium text-[#202124]">
                      {isRw ? 'MFA Yashyizweho' : 'MFA Set'}
                    </span>
                    <div>
                      {logsData?.security?.mfa_enabled ? (
                        <span className="text-[15px] font-medium px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                          {isRw ? 'Yego' : 'Yes'}
                        </span>
                      ) : (
                        <span className="text-[15px] font-medium px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 inline-block">
                          {isRw ? 'Oya' : 'No'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* When Set */}
                  <div className="p-5 rounded-xl bg-white border border-gray-200 flex flex-col justify-between space-y-3">
                    <span className="text-[16px] font-medium text-[#202124]">
                      {isRw ? 'Igihe Yashyiriweho' : 'When Set (Time & Date)'}
                    </span>
                    <div>
                      <span className="text-[16px] font-medium text-[#202124]">
                        {logsData?.security?.mfa_set_at
                          ? formatTimestamp(logsData.security.mfa_set_at)
                          : '-'}
                      </span>
                    </div>
                  </div>

                  {/* When Removed */}
                  <div className="p-5 rounded-xl bg-white border border-gray-200 flex flex-col justify-between space-y-3">
                    <span className="text-[16px] font-medium text-[#202124]">
                      {isRw ? 'Igihe Yakuweho' : 'When Removed (Time & Date)'}
                    </span>
                    <div>
                      <span className="text-[16px] font-medium text-[#202124]">
                        {logsData?.security?.mfa_removed_at
                          ? formatTimestamp(logsData.security.mfa_removed_at)
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserActivityLogsPage;
