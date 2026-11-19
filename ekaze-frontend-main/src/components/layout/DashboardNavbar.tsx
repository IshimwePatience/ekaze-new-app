import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  Languages,
  Sparkles,
  Code2,
  HelpCircle,
  LogOut,
  X,
  Lock,
  FileText,
  Plus,
  ExternalLink,
  Check,
  ChevronDown,
  User,
  LayoutGrid,
  Target,
  UserCircle,
  ChevronRight,
  Power,
  MessageSquare,
  Bot,
  Camera,
  LifeBuoy,
  BookOpen
} from "lucide-react";
import { FeedbackModal } from "@/components/common/FeedbackModal";
import { helpFeedbackService } from "@/api/helpFeedbackService";
import {
  ConsoleGridIcon,
  ConsoleSparkleIcon,
  ConsoleClockIcon,
  ConsoleShieldUserIcon,
  ConsoleCpuIcon,
  ConsoleBillingIcon,
  ConsoleBuildingIcon,
  ConsoleUserCheckIcon,
  ConsoleAgentIcon,
  ConsoleAlertIcon
} from "@/components/ui/ConsoleSidebarIcons";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AskEkazeRightSidebar } from "./AskEkazeRightSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import logo from "@/assets/reallogo.png";
import { cn } from "@/lib/utils";
import { useAuth, useLogout, useCurrentUser } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useClearRead,
  useDeleteNotification
} from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import { NotificationPreferencesModal } from "@/components/common/NotificationPreferencesModal";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { GlobalSearchModal } from "@/components/common/GlobalSearchModal";
import {
  Calendar as CalendarIcon,
  CreditCard as CreditCardIcon,
  ShieldAlert as ShieldAlertIcon,
  PiggyBank as PiggyBankIcon,
  SlidersHorizontal as SlidersIcon,
  ArrowUpRight as ArrowUpRightIcon,
  ArrowDownLeft as ArrowDownLeftIcon,
  Clock as ClockIcon,
  MoreVertical,
  MoreHorizontal,
  Puzzle
} from "lucide-react";

// Cloned Jira Waving Flag Illustration with Yellow Pole from Picture 1
const JiraFlagIllustration = ({ className = "w-44 h-44" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Yellow Flagpole (Tilted slightly to the left) */}
    <line
      x1="76"
      y1="195"
      x2="90"
      y2="42"
      stroke="#FFAB00"
      strokeWidth="6.5"
      strokeLinecap="round"
    />
    {/* Golden finial sphere at top of flagpole */}
    <circle cx="90" cy="40" r="7" fill="#FF8B00" />
    <circle cx="89" cy="38.5" r="5" fill="#FFC400" />

    {/* Back fold / shadow of the waving flag */}
    <path
      d="M89 50L150 63C150 63 158 92 154 112L106 100C106 100 111 130 120 148L86 138C79 108 84 75 89 50Z"
      fill="#0052CC"
    />

    {/* Front dynamic wave of the flag */}
    <path
      d="M89 50C104 53 121 57 141 54C156 51 169 59 166 78C162 101 145 118 129 120C114 122 101 114 87 111L89 50Z"
      fill="#0C66E4"
    />

    {/* Tail fold flap hanging down */}
    <path
      d="M129 120C118 122 107 132 107 145C107 152 114 159 124 158C135 157 143 142 147 132L129 120Z"
      fill="#0052CC"
    />
    <path
      d="M124 158C140 156 156 139 159 118L143 114C140 127 131 138 121 144L124 158Z"
      fill="#0065FF"
    />

    {/* White Stylized Sail Emblem on Flag */}
    <g transform="translate(108, 68) scale(0.85)">
      {/* Top sail curve */}
      <path
        d="M14 0C14 0 24 12 24 22C24 28 20 32 14 32C10 32 6 28 8 22C10 16 14 0 14 0Z"
        fill="#FFFFFF"
      />
      {/* Bottom sail curve */}
      <path
        d="M10 14C10 14 2 24 0 32C-2 40 4 45 10 45C16 45 20 40 19 32C17 22 10 14 10 14Z"
        fill="#FFFFFF"
        opacity="0.9"
      />
    </g>
  </svg>
);

interface DashboardNavbarProps {
  onToggleSidebar?: () => void;
  onToggleAiSidebar?: () => void;
  isAiSidebarOpen?: boolean;
  currentRole?: string;
}

const languages = [
  { code: "kin" as const, label: "Kinyarwanda", short: "KIN" },
  { code: "eng" as const, label: "English", short: "EN" },
];

export const getRoleSearchPlaceholder = (role?: string, isRw?: boolean): string => {
  const normalizedRole = (role || "").toLowerCase();

  if (isRw) {
    switch (normalizedRole) {
      case "employer":
        return "Shakisha (/) abakozi, amasezerano, ubwishyu, n'ibindi";
      case "worker":
        return "Shakisha (/) akazi, amasaha, ikofi yawe, n'ibindi";
      case "company":
        return "Shakisha (/) abakozi, ibyifuzo, abakoresha, n'ibindi";
      case "police":
        return "Shakisha (/) ibibazo, dosiye, ubugenzacyaha, n'ibindi";
      case "supervisor":
        return "Shakisha (/) abakoresha, imari, imikorere, n'ibindi";
      case "admin":
        return "Shakisha (/) abakoresha, amasosiyete, tranzagisiyo, n'ibindi";
      default:
        return "Shakisha (/) serivisi, inyandiko, ubufasha, n'ibindi";
    }
  }

  switch (normalizedRole) {
    case "employer":
      return "Search (/) for workers, contracts, payments, and more";
    case "worker":
      return "Search (/) for jobs, shifts, wallet, and more";
    case "company":
      return "Search (/) for staff, client requests, revenue, and more";
    case "police":
      return "Search (/) for incidents, cases, statistics, and more";
    case "supervisor":
      return "Search (/) for district overview, settings, and more";
    case "admin":
      return "Search (/) for users, companies, transactions, and more";
    default:
      return "Search (/) for resources, docs, products, and more";
  }
};

interface NavbarNotification {
  id: number;
  title?: string;
  message?: string;
  type?: string;
  is_read?: boolean;
  created_at?: string;
  data?: {
    category?: string;
  };
}

export const DashboardNavbar = ({
  onToggleSidebar,
  onToggleAiSidebar,
  isAiSidebarOpen: externalIsAiOpen,
  currentRole = "admin"
}: DashboardNavbarProps) => {
  const { t, language, setLanguage } = useLanguage();
  const isRw = language === "kin" || (language as string) === "rw";
  const { user: authUser } = useAuth();
  const { data: currentUserData } = useCurrentUser();
  const queryClient = useQueryClient();
  const user = currentUserData?.data?.user || currentUserData?.user || authUser;
  const userRole = (user?.role || currentRole || "").toLowerCase();
  const isAdmin = userRole === "admin";
  const isEmployer = userRole === "employer";
  const searchPlaceholder = getRoleSearchPlaceholder(userRole, isRw);

  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const navigate = useNavigate();

  const { data: unreadCountData } = useUnreadCount();
  const unreadCount = unreadCountData?.data?.unread_count ?? unreadCountData?.data?.count ?? unreadCountData?.count ?? 0;
  const { data: notificationsData, isLoading: isNotifsLoading } = useNotifications();
  const rawNotifications = notificationsData?.data?.notifications || notificationsData?.data || notificationsData?.notifications || [];
  const notifications: NavbarNotification[] = Array.isArray(rawNotifications) ? rawNotifications : [];
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: clearRead } = useClearRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [notifCategory, setNotifCategory] = useState<'all' | 'payments' | 'reminders' | 'security' | 'system'>('all');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [notifSubTab, setNotifSubTab] = useState<'direct' | 'watching'>('direct');
  const [showPromoBanner, setShowPromoBanner] = useState(true);

  const displayedNotifications = notifications.filter((n) => {
    // 1. Only show unread switch from Picture 1
    if (onlyUnread && n.is_read) return false;

    // 2. Direct vs Watching sub-tabs from Picture 1
    const title = (n.title || '').toLowerCase();
    const type = (n.type || '').toLowerCase();
    const isSystemOrUpdate =
      type.includes('system') ||
      type.includes('announcement') ||
      title.includes('update') ||
      title.includes('system');

    if (notifSubTab === 'watching') {
      return isSystemOrUpdate;
    } else {
      return !isSystemOrUpdate;
    }
  });

  const filteredNotifications = notifications.filter((n) => {
    if (notifCategory === 'all') return true;
    const title = (n.title || '').toLowerCase();
    const type = (n.type || '').toLowerCase();
    const message = (n.message || '').toLowerCase();
    const category = (n.data?.category || '').toLowerCase();

    if (notifCategory === 'payments') {
      return (
        type.includes('payment') ||
        title.includes('payment') ||
        title.includes('salary') ||
        title.includes('momo') ||
        title.includes('withdrawal') ||
        title.includes('cash-out') ||
        title.includes('saving') ||
        category.includes('saving') ||
        message.includes('transferred') ||
        message.includes('withdrawn') ||
        message.includes('received')
      );
    }
    if (notifCategory === 'reminders') {
      return (
        type.includes('pending') ||
        title.includes('reminder') ||
        title.includes('due') ||
        category.includes('payroll_reminder') ||
        message.includes('due in')
      );
    }
    if (notifCategory === 'security') {
      return (
        type.includes('login') ||
        type.includes('session') ||
        title.includes('session') ||
        title.includes('login') ||
        title.includes('security')
      );
    }
    if (notifCategory === 'system') {
      return (
        type.includes('system') ||
        type.includes('announcement') ||
        title.includes('system') ||
        title.includes('update')
      );
    }
    return true;
  });

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [internalIsAiOpen, setInternalIsAiOpen] = useState(() => {
    return localStorage.getItem("ekaze_ai_sidebar_open") === "true";
  });
  const [showAiTooltip, setShowAiTooltip] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  const rawPhoto = user?.profile_photo || user?.avatar || user?.avatar_url || user?.picture;
  const userPhoto = (!avatarError && typeof rawPhoto === "string" && rawPhoto.trim() && rawPhoto !== "null" && rawPhoto !== "undefined") ? rawPhoto : null;

  // Reset avatar error whenever photo updates
  useEffect(() => {
    setAvatarError(false);
  }, [rawPhoto]);

  // Listen for global user update events
  useEffect(() => {
    const handleUserUpdate = () => {
      setAvatarError(false);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    };

    window.addEventListener('user_updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);
    return () => {
      window.removeEventListener('user_updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, [queryClient]);

  // Global Keyboard Listener for Search Shortcut (Press '/' or 'Ctrl+K')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.ctrlKey && e.key === "k") || (e.metaKey && e.key === "k")) &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const recentlyVisited = [
    { title: "Credentials & Auth", desc: "APIs & Services", icon: ConsoleClockIcon },
    { title: "Clients & Employers", desc: "Access & Authorization", icon: ConsoleClockIcon },
    { title: "NIDA & IAM Verification", desc: "Identity & Access Audit", icon: ConsoleClockIcon },
    { title: "Payments & Ledger", desc: "Transactions & Disbursements", icon: ConsoleClockIcon },
  ];

  const recommendedSearches = [
    { title: "Agent Platform", desc: "One platform to recruit, deploy, scale and optimize agents and workforce.", icon: ConsoleSparkleIcon },
    { title: "Compute Engine & Workforce", desc: "VMs, GPUs, verified worker nodes and active deployments", icon: ConsoleCpuIcon },
    { title: "NIDA & IAM Access", desc: "Resource access control & identity verification", icon: ConsoleShieldUserIcon },
    { title: "Revenue & Financial Storage", desc: "Enterprise-ready financial ledger and payroll transactions", icon: ConsoleBillingIcon },
  ];

  const aiPrompts = [
    "+ Ask Ekaze AI a question",
    "How to verify NIDA National ID?",
    "How does MoMo payment schedule work?",
    "What is live worker map tracking?",
    "How do incident reports get logged?"
  ];

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200/90 shadow-2xs flex items-center justify-between px-4 md:px-6 flex-shrink-0 select-none">

        {/* LEFT ALIGNED SEARCH BAR */}
        <div className="flex-1 max-w-xl md:max-w-2xl flex justify-start pl-2 md:pl-4 mr-auto">
          <div
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between h-9 px-3.5 rounded-xl border border-slate-300 bg-white hover:border-[#2478b8] hover:shadow-xs transition-all cursor-pointer group"
          >
            <span className="text-xs text-slate-500 group-hover:text-slate-700 truncate font-normal">
              {searchPlaceholder}
            </span>

            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <Search className="w-4 h-4 text-slate-500 group-hover:text-[#2478b8] transition-colors stroke-[2]" />
              <span className="text-xs font-semibold text-slate-600 group-hover:text-[#2478b8]">
                {isRw ? "Shakisha" : "Search"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Help, Notifications, Ask Ekaze Pill, Profile Avatar */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">

          {/* HELP ICON BUTTON: DIRECTLY OPENS FEEDBACK & SCREENSHOT MODAL */}
          {!isAdmin && (
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="p-2 rounded-full text-[#374151] hover:bg-slate-100 transition-colors cursor-pointer outline-none"
              title="Send Feedback & Take Screenshot"
            >
              <HelpCircle className="w-5 h-5 text-[#374151] stroke-[2]" />
            </button>
          )}

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-full text-[#374151] hover:bg-slate-100 transition-colors cursor-pointer outline-none">
                <Bell className="w-5 h-5 stroke-[2]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2478b8] rounded-full ring-2 ring-white" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] sm:w-[440px] max-w-[95vw] bg-white rounded-xl p-0 shadow-2xl border border-slate-200 z-[100] overflow-hidden text-left">
              {/* Header */}
              <div className="px-4 pt-4 pb-2 border-b border-slate-200/90">
                <div className="flex items-center justify-between">
                  <span className="text-[19px] font-bold text-slate-900 tracking-tight">Notifications</span>

                  <div className="flex items-center gap-2.5">
                    {/* Only show unread switch matching Picture 1 */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-medium text-slate-600 select-none">
                        Only show unread
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={onlyUnread}
                        onClick={() => setOnlyUnread(!onlyUnread)}
                        className={cn(
                          "relative inline-flex h-[18px] w-8 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none items-center",
                          onlyUnread ? "bg-[#0C66E4]" : "bg-slate-700"
                        )}
                        title={onlyUnread ? "Showing unread only" : "Showing all"}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-flex items-center justify-center h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out text-[9px] font-bold leading-none",
                            onlyUnread ? "translate-x-4 text-[#0C66E4]" : "translate-x-0.5 text-slate-700"
                          )}
                        >
                          {onlyUnread ? "✓" : "×"}
                        </span>
                      </button>
                    </div>

                    {/* Open Full Screen / Separate Page */}
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/${(user?.role || "employer").toLowerCase()}?tab=profile&sub=notifications`);
                      }}
                      className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      title="Open full notifications view"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    {/* Three Dots Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-white rounded-md shadow-lg border border-slate-200 p-1 text-xs z-[110]">
                        <DropdownMenuItem
                          onClick={() => markAllAsRead()}
                          className="cursor-pointer py-1.5 px-2 hover:bg-slate-50 rounded text-slate-700"
                        >
                          Mark all as read
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => clearRead()}
                          className="cursor-pointer py-1.5 px-2 hover:bg-slate-50 rounded text-slate-700"
                        >
                          Clear read items
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 border-slate-100" />
                        <DropdownMenuItem
                          onClick={() => {
                            navigate(`/${(user?.role || "employer").toLowerCase()}?tab=profile&sub=notifications`);
                          }}
                          className="cursor-pointer py-1.5 px-2 hover:bg-slate-50 rounded text-slate-700"
                        >
                          Notification settings
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Sub-tabs: Direct | Watching */}
                <div className="flex items-center gap-6 mt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setNotifSubTab('direct')}
                    className={cn(
                      "pb-2 font-semibold transition-colors cursor-pointer relative",
                      notifSubTab === 'direct'
                        ? "text-[#2478b8] border-b-2 border-[#2478b8]"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <span>Direct</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifSubTab('watching')}
                    className={cn(
                      "pb-2 font-semibold transition-colors cursor-pointer relative",
                      notifSubTab === 'watching'
                        ? "text-[#2478b8] border-b-2 border-[#2478b8]"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <span>Watching</span>
                  </button>
                </div>
              </div>

              {/* Body: Notifications List OR Blue Flag Empty Illustration (from Picture 1) */}
              {isNotifsLoading ? (
                <LoadingSpinner className="py-12 min-h-[160px]" size="md" />
              ) : displayedNotifications.length === 0 ? (
                <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
                  <JiraFlagIllustration className="w-44 h-44 drop-shadow-xs" />
                  <p className="text-xs font-semibold text-slate-700 mt-1">
                    {onlyUnread ? "No unread notifications" : "You're all caught up!"}
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[380px]">
                  <div className="divide-y divide-slate-100">
                    {displayedNotifications.map((n) => {
                      const isUnread = !n.is_read;
                      const titleLower = (n.title || '').toLowerCase();
                      const typeLower = (n.type || '').toLowerCase();
                      const category = (n.data?.category || '').toLowerCase();

                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (isUnread) markAsRead(n.id);
                          }}
                          className={cn(
                            "p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer group relative flex items-start gap-3 text-left",
                            isUnread && "bg-blue-50/20"
                          )}
                        >
                          {/* Purple Puzzle Badge Icon (Matching user request) */}
                          <div className="w-7 h-7 rounded-lg bg-[#F2EBFE] text-[#7C3AED] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Puzzle className="w-4 h-4 text-[#7C3AED] fill-[#7C3AED]" />
                          </div>

                          {/* Text Content */}
                          <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className={cn("text-xs tracking-tight truncate", isUnread ? "font-bold text-slate-900" : "font-medium text-slate-700")}>
                                {(n.title || '')
                                  .replace(/by Administrator/gi, 'by Ekaze')
                                  .replace(/by Admin/gi, 'by Ekaze')
                                  .replace(/Administrator/gi, 'Ekaze')}
                              </p>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-[#0C66E4] shrink-0" title="Unread" />
                              )}
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-600 break-words font-normal">
                              {(n.message || '')
                                .replace(/by Administrator/gi, 'by Ekaze')
                                .replace(/by Admin/gi, 'by Ekaze')
                                .replace(/Administrator/gi, 'Ekaze')
                                .replace(/Support response:/gi, 'Ekaze Response:')}
                            </p>
                            <span className="text-[10px] font-medium text-slate-400 mt-1.5 block">
                              {n.created_at && !isNaN(new Date(n.created_at).getTime())
                                ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true })
                                : "Just now"}
                            </span>
                          </div>

                          {/* Delete Item Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n.id);
                            }}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                            title="Delete notification"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ASK EKAZE PILL BUTTON WITH INTRO TOOLTIP CARD (Matching Image 1) */}
          <div
            className="relative flex items-center z-50"
            onMouseEnter={() => setShowAiTooltip(true)}
          >
            <button
              onClick={() => {
                setShowAiTooltip(false);
                if (onToggleAiSidebar) {
                  onToggleAiSidebar();
                } else {
                  setInternalIsAiOpen((prev) => !prev);
                }
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2478b8] text-white hover:bg-[#1b6296] transition-all shadow-sm cursor-pointer text-xs font-bold"
            >
              <Sparkles className="w-4 h-4 text-white fill-white" />
              <span>Ask Ekaze</span>
            </button>

            {/* Feature Description Tooltip Popover Card */}
            {showAiTooltip && (
              <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl p-4 shadow-xl border border-slate-200 z-[100] animate-in fade-in-0 zoom-in-95">
                {/* Top Pointer Arrow pointing to button */}
                <div className="absolute -top-1.5 right-8 w-3 h-3 bg-white border-t border-l border-slate-200 rotate-45" />

                <div className="relative space-y-2 text-left">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    Ask Ekaze: an AI assistant for your platform
                  </h4>
                  <p className="text-[11px] text-slate-600 font-normal leading-normal">
                    Try a new smart AI assistant to ask about workers, system analytics, NIDA verification, and payment ideas.
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAiTooltip(false);
                    }}
                    className="mt-3 ml-auto block px-4 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer outline-none"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* USER PROFILE AVATAR & DROPDOWN MENU */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center p-0.5 rounded-full hover:opacity-90 transition-opacity cursor-pointer outline-none">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-xs flex items-center justify-center bg-slate-100">
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt=""
                      onError={() => setAvatarError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <DefaultAvatarSVG className="w-full h-full" />
                  )}
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72 bg-white rounded border border-slate-300 shadow-md p-0 z-[110] overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-200 bg-white">
                <p className="text-[15px] font-bold text-[#1f2937] truncate leading-snug">
                  {user?.name || "No names available"}
                </p>
                <p className="text-[13px] font-normal text-[#4b5563] truncate mt-0.5">
                  {user?.email || "jeankubera0@gmail.com"}
                </p>
              </div>

              <div className="py-0">
                <button
                  onClick={() => {
                    const currentRole = user?.role || "admin";
                    const roleRoutes: Record<string, string> = {
                      admin: "/dashboard/admin",
                      employer: "/dashboard/employer",
                      worker: "/dashboard/worker",
                      police: "/dashboard/police",
                      company: "/dashboard/company",
                      supervisor: "/dashboard/supervisor",
                    };
                    const keyMap: Record<string, string> = {
                      admin: "admin_active_tab",
                      employer: "employer_active_tab",
                      worker: "worker_active_tab",
                      police: "police_active_tab",
                      company: "company_active_tab",
                      supervisor: "supervisor_active_tab",
                    };
                    const eventMap: Record<string, string> = {
                      admin: "admin-tab-change",
                      employer: "employer-navigate",
                      worker: "worker-navigate",
                      police: "police-navigate",
                      company: "company-navigate",
                      supervisor: "supervisor-navigate",
                    };

                    const tabKey = keyMap[currentRole] || "admin_active_tab";
                    const eventName = eventMap[currentRole] || "admin-tab-change";

                    localStorage.setItem(tabKey, "profile");
                    window.dispatchEvent(new CustomEvent(eventName, { detail: "profile" }));
                    window.dispatchEvent(new CustomEvent("dashboard-navigate", { detail: "profile" }));

                    navigate(roleRoutes[currentRole] || "/dashboard/admin");
                  }}
                  className="w-full flex items-center gap-3.5 px-4 py-2.5 bg-[#e9ecef] text-[#1f2937] text-[14px] font-semibold hover:bg-[#e2e6ea] transition-colors cursor-pointer"
                >
                  <UserCircle className="w-5 h-5 text-[#374151] stroke-[2] shrink-0" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => navigate("/auth/forgot-password")}
                  className="w-full flex items-center gap-3.5 px-4 py-2.5 text-[#1f2937] text-[14px] font-semibold hover:bg-[#f3f4f6] transition-colors cursor-pointer"
                >
                  <Lock className="w-5 h-5 text-[#374151] stroke-[2] shrink-0" />
                  <span>Change password</span>
                </button>

                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="w-full flex items-center gap-3.5 px-4 py-2.5 text-[#1f2937] text-[14px] font-semibold hover:bg-[#f3f4f6] transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-5 h-5 text-[#374151] stroke-[2] shrink-0" />
                  <span>Feedback</span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center gap-3.5 px-4 py-2.5 text-[#1f2937] text-[14px] font-semibold hover:bg-[#f3f4f6] transition-colors cursor-pointer outline-none">
                      <Languages className="w-5 h-5 text-[#374151] stroke-[2] shrink-0" />
                      <span>Change language</span>
                      <ChevronRight className="w-4 h-4 text-[#374151] stroke-[2.5] ml-auto shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 bg-white rounded border border-slate-300 p-1 shadow-md z-[120]">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onSelect={() => setLanguage(lang.code)}
                        onClick={() => setLanguage(lang.code)}
                        className={`flex items-center px-3 py-2 text-xs font-semibold cursor-pointer transition-colors ${language === lang.code ? "bg-slate-100 text-[#1677ff]" : "text-slate-800 hover:bg-slate-50"
                          }`}
                      >
                        <span>{lang.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3.5 px-4 py-2.5 text-[#1f2937] text-[14px] font-semibold hover:bg-[#f3f4f6] hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Power className="w-5 h-5 text-[#374151] stroke-[2] shrink-0" />
                  <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
                </button>
              </div>

            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      {/* Google Cloud Console Style Session-Based Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        userRole={user?.role}
        userId={user?.id}
        onOpenAiChat={(prompt) => {
          if (onToggleAiSidebar) {
            onToggleAiSidebar();
          } else {
            setInternalIsAiOpen(true);
          }
        }}
      />

      {/* Ask Ekaze Right Side AI Assistant Drawer (Fallback floating for standalone navbar) */}
      {!onToggleAiSidebar && (
        <AskEkazeRightSidebar
          isOpen={internalIsAiOpen}
          onClose={() => setInternalIsAiOpen(false)}
        />
      )}

      {/* Notification Preferences Modal */}
      <NotificationPreferencesModal
        open={isPreferencesOpen}
        onOpenChange={setIsPreferencesOpen}
        userRole={user?.role}
      />

      {/* Feedback & Screenshot Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        user={user}
      />
    </>
  );
};
