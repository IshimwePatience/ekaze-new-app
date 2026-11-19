import { useState } from "react";
import {
  X,
  CheckCheck,
  Trash2,
  ChevronDown,
  Puzzle
} from "lucide-react";
import { useAuth, useCurrentUser } from "@/hooks/useAuth";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useClearRead,
  useDeleteNotification
} from "@/hooks/useNotifications";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";
import { NotificationPreferencesModal } from "./NotificationPreferencesModal";

interface NotificationSettingsPageProps {
  initialTab?: string;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  onBack?: () => void;
}

export const NotificationSettingsPage = ({
  initialTab = "all",
  activeCategory,
  onCategoryChange,
  onBack,
}: NotificationSettingsPageProps) => {
  const { user: authUser } = useAuth();
  const { data: currentUserData } = useCurrentUser();
  const user = currentUserData?.data?.user || currentUserData?.user || authUser || {};

  const isEmployer = (user.role || authUser?.role || "").toLowerCase() === "employer";
  const userEmail = user.email || "user@ekaze.rw";
  const userPhone = user.phone || "+250 788 000 004";

  // Delivery Preferences Modal State
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  // Blue Alert Banners State (Dismissible)
  const [showBanner1, setShowBanner1] = useState(true);
  const [showBanner2, setShowBanner2] = useState(true);

  // Time Filter Dropdown (Latest, Today, Range)
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | '30days' | 'older'>('all');

  // Filter Tabs ("those tabs must go there sir")
  const [internalTab, setInternalTab] = useState<'all' | 'payments' | 'reminders' | 'security' | 'system'>(
    (initialTab as any) || 'all'
  );
  const activeTab = (activeCategory && activeCategory !== 'preferences' ? activeCategory : internalTab) as 'all' | 'payments' | 'reminders' | 'security' | 'system';

  const handleTabSelect = (tabId: string) => {
    setInternalTab(tabId as any);
    if (onCategoryChange) {
      onCategoryChange(tabId);
    }
  };

  // Notifications API hooks
  const { data: unreadCountData } = useUnreadCount();
  const unreadCount = unreadCountData?.data?.unread_count ?? unreadCountData?.data?.count ?? unreadCountData?.count ?? 0;
  const { data: notificationsData, isLoading } = useNotifications();
  const rawNotifications = notificationsData?.data?.notifications || notificationsData?.data || notificationsData?.notifications || [];
  const notifications: any[] = Array.isArray(rawNotifications) ? rawNotifications : [];

  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: clearRead } = useClearRead();
  const { mutate: deleteNotification } = useDeleteNotification();



  // Filter notifications by category and time range
  const filteredNotifications = notifications.filter((n) => {
    // 1. Time range filter
    if (timeFilter !== 'all') {
      const createdAt = n.created_at ? new Date(n.created_at).getTime() : 0;
      if (createdAt > 0) {
        const now = Date.now();
        const diffMs = now - createdAt;
        const oneDayMs = 24 * 60 * 60 * 1000;
        const diffDays = diffMs / oneDayMs;

        if (timeFilter === 'today') {
          const dateObj = new Date(createdAt);
          const nowDate = new Date(now);
          const isSameDay =
            dateObj.getDate() === nowDate.getDate() &&
            dateObj.getMonth() === nowDate.getMonth() &&
            dateObj.getFullYear() === nowDate.getFullYear();
          if (!isSameDay && diffMs > oneDayMs) return false;
        } else if (timeFilter === '7days') {
          if (diffDays > 7) return false;
        } else if (timeFilter === '30days') {
          if (diffDays > 30) return false;
        } else if (timeFilter === 'older') {
          if (diffDays <= 30) return false;
        }
      }
    }

    // 2. Category filter
    if (activeTab === 'all') return true;
    const title = (n.title || '').toLowerCase();
    const type = (n.type || '').toLowerCase();
    const message = (n.message || '').toLowerCase();
    const category = (n.data?.category || '').toLowerCase();

    if (activeTab === 'payments') {
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
    if (activeTab === 'reminders') {
      return (
        type.includes('pending') ||
        title.includes('reminder') ||
        title.includes('due') ||
        category.includes('payroll_reminder') ||
        message.includes('due in')
      );
    }
    if (activeTab === 'security') {
      return (
        type.includes('login') ||
        type.includes('session') ||
        title.includes('session') ||
        title.includes('login') ||
        title.includes('security')
      );
    }
    if (activeTab === 'system') {
      return (
        type.includes('system') ||
        type.includes('announcement') ||
        title.includes('system') ||
        title.includes('update')
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-left">
      {/* ── 1. Page Header / Scope Notice ───────────────────────────────── */}
      <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Notification Feed
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEmployer
              ? "Account-level notifications, 5-day payroll alerts, and telecom delivery logs."
              : "Account-level notifications, salary receipts, and telecom delivery logs."}
          </p>
        </div>
      </div>

      {/* ── 2. Cloned Blue Info Banners (Matching Picture 3) ─────────────── */}
      <div className="space-y-3">
        {showBanner1 && (
          <div className="flex items-stretch rounded-md overflow-hidden bg-[#2478b8] text-white shadow-2xs border border-[#1b6296]/30">
            <div className="w-12 bg-[#1b6296] flex items-center justify-center shrink-0">
              <span className="font-serif italic font-bold text-base text-white">i</span>
            </div>
            <div className="flex-1 px-4 py-3 text-xs leading-relaxed font-normal">
              Account-level notifications apply to all payments, payroll, and workers. Notifications for individual contracted workers can be modified within worker contracts and will override these defaults.
            </div>
            <button
              type="button"
              onClick={() => setShowBanner1(false)}
              className="px-3.5 text-white/80 hover:text-white hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {showBanner2 && (
          <div className="flex items-stretch rounded-md overflow-hidden bg-[#2478b8] text-white shadow-2xs border border-[#1b6296]/30">
            <div className="w-12 bg-[#1b6296] flex items-center justify-center shrink-0">
              <span className="font-serif italic font-bold text-base text-white">i</span>
            </div>
            <div className="flex-1 px-4 py-3 text-xs leading-relaxed font-normal">
              Daily MoMo notifications will be delivered instantly around 6pm. Weekly digest summaries will be delivered Saturday between 6am and 8am.
            </div>
            <button
              type="button"
              onClick={() => setShowBanner2(false)}
              className="px-3.5 text-white/80 hover:text-white hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── 3. Time Filter & Controls ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">
            Filter by time
          </label>
          <div className="relative inline-block min-w-[220px]">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="w-full h-9 pl-3 pr-8 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2076b8] appearance-none cursor-pointer"
            >
              <option value="all">Latest / All time</option>
              <option value="today">Today</option>
              <option value="7days">This week (Last 7 days)</option>
              <option value="30days">This month (Last 30 days)</option>
              <option value="older">Older</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 pt-4 sm:pt-0">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="px-3 py-1.5 text-xs font-bold text-[#2076b8] hover:bg-blue-50 border border-[#2076b8]/30 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => clearRead()}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
          >
            Clear read items
          </button>
        </div>
      </div>



      {/* ── 5. NOTIFICATIONS LIST (Clean Flat Design matching user reference) ─── */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between pb-1">
          <h3 className="text-sm font-semibold text-slate-900">
            Notifications ({filteredNotifications.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            Click any notification to mark as read
          </span>
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-14 min-h-[220px]" size="lg" />
        ) : filteredNotifications.length === 0 ? (
          <div className="py-10 text-center border-t border-b border-slate-200 text-xs text-slate-400">
            No notifications in this category
          </div>
        ) : (
          <div className="border-t border-b border-slate-200 divide-y divide-slate-100">
            {filteredNotifications.map((n) => {
              const isUnread = !n.is_read;

              let formattedDateTime = "";
              try {
                const dateObj = n.created_at ? new Date(n.created_at) : null;
                if (dateObj && !isNaN(dateObj.getTime())) {
                  formattedDateTime = format(dateObj, "dd/MM/yyyy • hh:mm a");
                }
              } catch {
                formattedDateTime = "";
              }

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (isUnread) markAsRead(n.id);
                  }}
                  className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 hover:bg-slate-50/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
                    {/* Purple Puzzle Badge Icon (Matching user request) */}
                    <div className="w-7 h-7 rounded-lg bg-[#F2EBFE] text-[#7C3AED] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Puzzle className="w-4 h-4 text-[#7C3AED] fill-[#7C3AED]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={cn("text-xs tracking-tight", isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-800")}>
                          {n.title}
                        </h4>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" title="Unread" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      {n.data?.tx_id && (
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          TxId: {n.data.tx_id}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 sm:text-right whitespace-nowrap pt-0.5">
                    <span className="text-[11px] text-slate-400">
                      {formattedDateTime}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 6. Delivery Preferences Modal ───────────────────────────────── */}
      <NotificationPreferencesModal
        open={isPreferencesModalOpen}
        onOpenChange={setIsPreferencesModalOpen}
        userRole={user.role || authUser?.role}
      />
    </div>
  );
};
