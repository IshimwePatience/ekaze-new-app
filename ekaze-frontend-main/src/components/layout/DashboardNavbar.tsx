import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Settings,
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
  SlidersHorizontal,
  Folder,
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  Cloud,
  Puzzle
} from "lucide-react";
import { FeedbackModal } from "@/components/common/FeedbackModal";
import {
  GoogleDriveLogo,
  GoogleGeminiIcon,
  GoogleAppsGridIcon
} from "./GoogleDriveIcons";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { formatDistanceToNow } from "date-fns";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import { NotificationPreferencesModal } from "@/components/common/NotificationPreferencesModal";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { GlobalSearchModal } from "@/components/common/GlobalSearchModal";

interface DashboardNavbarProps {
  onToggleSidebar?: () => void;
  onToggleAiSidebar?: () => void;
  isAiSidebarOpen?: boolean;
  currentRole?: string;
}

const getRoleSearchPlaceholder = (role: string, isRw: boolean) => {
  if (isRw) return "Shakisha muri Drive...";
  return "Search in Drive";
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
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [notifSubTab, setNotifSubTab] = useState<'direct' | 'watching'>('direct');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const rawPhoto = user?.profile_photo || user?.avatar || user?.avatar_url || user?.picture;
  const userPhoto = (!avatarError && typeof rawPhoto === "string" && rawPhoto.trim() && rawPhoto !== "null" && rawPhoto !== "undefined") ? rawPhoto : null;

  // Reset avatar error whenever photo updates
  useEffect(() => {
    setAvatarError(false);
  }, [rawPhoto]);

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

  const displayedNotifications = notifications.filter((n) => {
    if (onlyUnread && n.is_read) return false;
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

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-[#f8fafd] flex items-center justify-between px-3 md:px-5 flex-shrink-0 select-none transition-colors border-b border-transparent">
        {/* LEFT BRANDING: Menu button + Google Drive Triangle Logo + "Drive" */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-full text-[#444746] hover:bg-black/5 transition-colors cursor-pointer outline-none"
            title="Main menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
            title="Google Drive"
          >
            <GoogleDriveLogo className="w-9 h-8 shrink-0 drop-shadow-2xs" />
            <span className="text-[22px] font-normal tracking-tight text-[#444746] select-none font-sans">
              Drive
            </span>
          </div>
        </div>

        {/* CENTER SEARCH BAR: Pill-shaped Google Drive Search with Filter Icon */}
        <div className="flex-1 max-w-2xl mx-3 md:mx-6">
          <div
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between h-12 px-4 rounded-full bg-[#edf2fc] hover:bg-[#e9eef6] focus-within:bg-white focus-within:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Search className="w-5 h-5 text-[#444746] shrink-0" />
              <span className="text-[15px] text-[#444746] placeholder:text-[#444746] truncate font-normal">
                {searchPlaceholder}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchOpen(true);
              }}
              className="p-2 rounded-full hover:bg-black/5 text-[#444746] transition-colors cursor-pointer shrink-0"
              title="Search options"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#444746]" />
            </button>
          </div>
        </div>

        {/* RIGHT ACTION BAR: Help, Settings, Gemini, Upgrade, 9-dots, Avatar */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {/* Help Support */}
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="p-2 rounded-full text-[#444746] hover:bg-black/5 transition-colors cursor-pointer outline-none"
            title="Support & Feedback"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Settings / Configuration */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-full text-[#444746] hover:bg-black/5 transition-colors cursor-pointer outline-none"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-[110]">
              <DropdownMenuItem
                onClick={() => {
                  const role = userRole || "admin";
                  navigate(`/${role}?tab=settings`);
                }}
                className="cursor-pointer py-2 px-3 hover:bg-slate-50 rounded-lg text-sm text-slate-700 font-medium"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsPreferencesOpen(true)}
                className="cursor-pointer py-2 px-3 hover:bg-slate-50 rounded-lg text-sm text-slate-700 font-medium"
              >
                Notification settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 border-slate-100" />
              <DropdownMenuItem
                onClick={() => setLanguage(isRw ? "en" : "kin")}
                className="cursor-pointer py-2 px-3 hover:bg-slate-50 rounded-lg text-sm text-slate-700 font-medium flex items-center justify-between"
              >
                <span>Language</span>
                <span className="text-xs text-slate-500 uppercase font-bold">{language}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Gemini AI Sparkle Star Button */}
          <button
            onClick={() => onToggleAiSidebar?.()}
            className="p-2 rounded-full text-[#444746] hover:bg-black/5 transition-colors cursor-pointer outline-none relative group"
            title="Ask Ekaze / Gemini AI"
          >
            <GoogleGeminiIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>

          {/* Upgrade Pill Button */}
          <button
            onClick={() => {
              const role = userRole || "admin";
              navigate(`/${role}?tab=payments`);
            }}
            className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-[#c2e7ff]/50 text-[#001d35] hover:bg-[#c2e7ff] border border-[#7fcfff]/30 transition-all cursor-pointer whitespace-nowrap"
          >
            Upgrade
          </button>

          {/* Notifications Bell Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative p-2 rounded-full text-[#444746] hover:bg-black/5 transition-colors cursor-pointer outline-none"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0b57d0] rounded-full ring-2 ring-[#f8fafd]" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[360px] sm:w-[420px] max-w-[95vw] bg-white rounded-2xl p-0 shadow-2xl border border-slate-200 z-[110] overflow-hidden text-left">
              <div className="px-4 pt-4 pb-2 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900 tracking-tight">Notifications</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-slate-600 font-medium select-none">Unread only</span>
                    <button
                      type="button"
                      onClick={() => setOnlyUnread(!onlyUnread)}
                      className={cn(
                        "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200 items-center",
                        onlyUnread ? "bg-[#0b57d0]" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-3 w-3 transform rounded-full bg-white transition duration-200",
                          onlyUnread ? "translate-x-3.5" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setNotifSubTab('direct')}
                    className={cn(
                      "pb-2 font-semibold transition-colors cursor-pointer relative",
                      notifSubTab === 'direct'
                        ? "text-[#0b57d0] border-b-2 border-[#0b57d0]"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifSubTab('watching')}
                    className={cn(
                      "pb-2 font-semibold transition-colors cursor-pointer relative",
                      notifSubTab === 'watching'
                        ? "text-[#0b57d0] border-b-2 border-[#0b57d0]"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Updates
                  </button>
                </div>
              </div>

              {isNotifsLoading ? (
                <LoadingSpinner className="py-12 min-h-[160px]" size="md" />
              ) : displayedNotifications.length === 0 ? (
                <div className="py-10 px-4 flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-semibold text-slate-700">
                    {onlyUnread ? "No unread notifications" : "You're all caught up!"}
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[360px]">
                  <div className="divide-y divide-slate-100">
                    {displayedNotifications.map((n) => {
                      const isUnread = !n.is_read;
                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (isUnread) markAsRead(n.id);
                          }}
                          className={cn(
                            "p-3.5 hover:bg-slate-50 transition-colors cursor-pointer group relative flex items-start gap-3 text-left",
                            isUnread && "bg-blue-50/20"
                          )}
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#e8f0fe] text-[#0b57d0] flex items-center justify-center shrink-0 mt-0.5">
                            <Puzzle className="w-4 h-4 text-[#0b57d0]" />
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className={cn("text-xs truncate", isUnread ? "font-bold text-slate-900" : "font-medium text-slate-700")}>
                                {n.title || "Notification"}
                              </p>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-[#0b57d0] shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 font-normal leading-relaxed break-words">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {n.created_at && !isNaN(new Date(n.created_at).getTime())
                                ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true })
                                : "Just now"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n.id);
                            }}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="Delete"
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

          {/* Google 9-Dots Apps Launcher Grid */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-full text-[#444746] hover:bg-black/5 transition-colors cursor-pointer outline-none"
                title="Google apps"
              >
                <GoogleAppsGridIcon className="w-5 h-5 text-[#444746]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-[110]">
              <div className="grid grid-cols-3 gap-3 text-center">
                <button
                  onClick={() => navigate("/")}
                  className="p-2.5 rounded-xl hover:bg-slate-100 flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <GoogleDriveLogo className="w-8 h-8" />
                  <span className="text-xs text-slate-700 font-medium">Drive</span>
                </button>
                <button
                  onClick={() => {
                    const role = userRole || "admin";
                    navigate(`/${role}?tab=calendar`);
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-100 flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                    31
                  </div>
                  <span className="text-xs text-slate-700 font-medium">Calendar</span>
                </button>
                <button
                  onClick={() => onToggleAiSidebar?.()}
                  className="p-2.5 rounded-xl hover:bg-slate-100 flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <GoogleGeminiIcon className="w-8 h-8" />
                  <span className="text-xs text-slate-700 font-medium">Gemini</span>
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Avatar & Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center p-0.5 rounded-full hover:opacity-90 transition-opacity cursor-pointer outline-none ml-1">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-300 shadow-2xs flex items-center justify-center bg-slate-100">
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

            <DropdownMenuContent align="end" className="w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-0 z-[110] overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-100 bg-[#f8fafd]">
                <p className="text-sm font-bold text-[#1f2937] truncate leading-snug">
                  {user?.name || "Ekaze User"}
                </p>
                <p className="text-xs font-normal text-[#4b5563] truncate mt-0.5">
                  {user?.email || "user@ekaze.rw"}
                </p>
              </div>

              <div className="p-1.5">
                <DropdownMenuItem
                  onClick={() => {
                    const role = userRole || "admin";
                    navigate(`/${role}?tab=profile`);
                  }}
                  className="cursor-pointer py-2 px-3 hover:bg-slate-50 rounded-lg text-sm text-slate-700 font-medium"
                >
                  Profile & Account
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 border-slate-100" />

                <DropdownMenuItem
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="cursor-pointer py-2 px-3 hover:bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center justify-between"
                >
                  <span>Sign out</span>
                  <LogOut className="w-4 h-4" />
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* MODALS */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <NotificationPreferencesModal isOpen={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} currentRole={userRole} />
    </>
  );
};

export default DashboardNavbar;
