import { 
  Bell, 
  User as UserIcon,
  LogOut, 
  Settings, 
  Menu,
  Search,
  X,
  CheckCheck,
  Eye,
  Calendar,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Wallet,
  Filter,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useAuth";
import { 
  useNotifications, 
  useUnreadCount, 
  useMarkAsRead, 
  useMarkAllAsRead,
  useDeleteNotification,
  useNotification,
  useNotificationStatistics
} from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import logo from "@/assets/reallogo.png";
import { useState, useEffect } from "react";
import type { NotificationItem } from "@/types/notification.types";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

type TabType = "dashboard" | "jobs" | "schedule" | "payments" | "incidents" | "schedules" | "agents" | "profile" | "experience";


interface WorkerHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const WORKER_ACTIVE_TAB_KEY = 'worker_active_tab';

// SVG Icons
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const PaymentsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const IncidentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const ScheduleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const SalaryScheduleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
  </svg>
);

const ExperienceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7h20L12 2z"></path>
    <path d="M2 17l10 5 10-5"></path>
    <path d="M2 12l10 5 10-5"></path>
  </svg>
);

const AgentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

// Notification badge variant helper
const getNotificationBadgeVariant = (type: string): "destructive" | "secondary" | "default" => {
  if (type.includes('incident') || type.includes('suspended') || type.includes('rejected')) {
    return "destructive";
  }
  if (type.includes('approved') || type.includes('verified') || type.includes('payment_received')) {
    return "default";
  }
  return "secondary";
};

// Single Notification View Modal
const SingleNotificationModal = ({ 
  notificationId, 
  isOpen, 
  onClose 
}: { 
  notificationId: number | null; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const { t } = useLanguage();
  const { data: notificationData, isLoading } = useNotification(notificationId || 0);
  const { mutate: markAsRead } = useMarkAsRead();
  const notification = notificationData?.data;

  const handleMarkAsRead = () => {
    if (notificationId && !notification?.is_read) {
      markAsRead(notificationId);
    }
  };

  const getBadgeLabel = (type: string) => {
    if (type.includes('overdue'))   return "Overdue Salary";
    if (type.includes('incident'))  return t("worker.workerHeader.notifications.badgeAlert");
    if (type.includes('payment'))   return t("worker.workerHeader.notifications.badgePayment");
    if (type.includes('system'))    return t("worker.workerHeader.notifications.badgeSystem");
    if (type.includes('registered'))return t("worker.workerHeader.notifications.badgeNew");
    if (type.includes('hired'))     return t("worker.workerHeader.notifications.badgeHired");
    if (type.includes('rated'))     return t("worker.workerHeader.notifications.badgeRating");
    if (type.includes('job') || type.includes('assignment')) return t("worker.workerHeader.notifications.badgeJob");
    return t("worker.workerHeader.notifications.badgeInfo");
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('overdue'))   return <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />;
    if (type.includes('incident'))  return <AlertTriangle className="w-5 h-5 text-destructive" />;
    if (type.includes('payment'))   return <Wallet className="w-5 h-5 text-green-600" />;
    if (type.includes('verified'))  return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
    if (type.includes('suspended')) return <Ban className="w-5 h-5 text-orange-600" />;
    if (type.includes('hired') || type.includes('job')) return <Briefcase className="w-5 h-5 text-purple-600" />;
    if (type.includes('rated'))     return <UserIcon className="w-5 h-5 text-yellow-600" />;
    return <Bell className="w-5 h-5 text-primary" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {t("notifications.details")}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("notifications.viewComplete")}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !notification ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant={getNotificationBadgeVariant(notification.type)} 
                    className="text-[10px] px-2 py-0.5"
                  >
                    {getBadgeLabel(notification.type)}
                  </Badge>
                  {!notification.is_read && (
                    <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200">
                      {t("notifications.unread")}
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm font-semibold">{notification.title}</h3>
              </div>
            </div>

            {/* Message */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-foreground">{notification.message}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t("notifications.received")}</p>
                      <p className="text-xs font-medium">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-3 h-3 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t("notifications.from")}</p>
                      <p className="text-xs font-medium">
                        {notification.creator?.name || t("worker.workerHeader.notifications.system")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Metadata */}
            {notification.data && Object.keys(notification.data).length > 0 && (
              <Card>
                <CardContent className="p-3">
                  <p className="text-[10px] text-muted-foreground mb-2">{t("notifications.additionalInfo")}</p>
                  <div className="space-y-1">
                    {Object.entries(notification.data).map(([key, value]) => {
                      if (key === 'action_url' || !value) return null;
                      return (
                        <div key={key} className="flex items-start gap-2 text-[10px]">
                          <span className="text-muted-foreground capitalize min-w-[80px]">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="text-foreground font-medium">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mark as read button if unread */}
            {!notification.is_read && (
              <Button 
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs"
                onClick={handleMarkAsRead}
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                {t("notifications.markAsRead")}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Notifications Modal
const NotificationsModal = ({ 
  isOpen, 
  onClose,
  onNotificationClick 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onNotificationClick: (id: number) => void;
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isChangingTab, setIsChangingTab] = useState(false);
  
  const { data: unreadCountData } = useUnreadCount();
  const { data: notificationsData, isLoading, refetch } = useNotifications({ 
    per_page: 50,
    filter: activeTab === 'all' ? undefined : activeTab
  });
  const { data: statisticsData } = useNotificationStatistics();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const unreadCount = unreadCountData?.data?.unread_count || 0;
  const notifications = notificationsData?.data || [];
  const statistics = statisticsData?.data;

  // Handle tab change with animation
  useEffect(() => {
    if (isOpen) {
      setIsChangingTab(true);
      const timer = setTimeout(() => {
        setIsChangingTab(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, isOpen]);

  const filteredNotifications = notifications.filter(notification => {
    if (filterType === 'all') return true;
    return notification.type.includes(filterType);
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as typeof activeTab);
    refetch();
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    onNotificationClick(notification.id);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const getBadgeLabel = (type: string) => {
    if (type.includes('overdue'))   return "Overdue Salary";
    if (type.includes('incident'))  return t("worker.workerHeader.notifications.badgeAlert");
    if (type.includes('payment'))   return t("worker.workerHeader.notifications.badgePayment");
    if (type.includes('system'))    return t("worker.workerHeader.notifications.badgeSystem");
    if (type.includes('registered'))return t("worker.workerHeader.notifications.badgeNew");
    if (type.includes('hired'))     return t("worker.workerHeader.notifications.badgeHired");
    if (type.includes('rated'))     return t("worker.workerHeader.notifications.badgeRating");
    if (type.includes('job') || type.includes('assignment')) return t("worker.workerHeader.notifications.badgeJob");
    return t("worker.workerHeader.notifications.badgeInfo");
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('overdue'))   return <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />;
    if (type.includes('incident'))  return <AlertTriangle className="w-3 h-3 text-destructive" />;
    if (type.includes('payment'))   return <Wallet className="w-3 h-3 text-green-600" />;
    if (type.includes('verified'))  return <CheckCircle2 className="w-3 h-3 text-blue-600" />;
    if (type.includes('suspended')) return <Ban className="w-3 h-3 text-orange-600" />;
    if (type.includes('hired') || type.includes('job')) return <Briefcase className="w-3 h-3 text-purple-600" />;
    if (type.includes('rated'))     return <UserIcon className="w-3 h-3 text-yellow-600" />;
    return <Bell className="w-3 h-3 text-primary" />;
  };

  const getEmptyMessage = () => {
    if (activeTab === 'unread') return t("worker.workerHeader.notifications.noUnread");
    if (activeTab === 'read')   return t("worker.workerHeader.notifications.noRead");
    return t("worker.workerHeader.notifications.noNotifications");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl z-[9999] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {t("notifications.center")}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("notifications.manage")}
          </DialogDescription>
        </DialogHeader>

        {/* Stats Cards */}
        {statistics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-2">
                <p className="text-[10px] text-muted-foreground">{t("worker.workerHeader.notifications.statsTotal")}</p>
                <p className="text-sm font-bold">{statistics.total}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-2">
                <p className="text-[10px] text-muted-foreground">{t("worker.workerHeader.notifications.statsUnread")}</p>
                <p className="text-sm font-bold text-yellow-600">{statistics.unread}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-2">
                <p className="text-[10px] text-muted-foreground">{t("worker.workerHeader.notifications.statsRead")}</p>
                <p className="text-sm font-bold text-green-600">{statistics.read}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-2">
                <p className="text-[10px] text-muted-foreground">{t("worker.workerHeader.notifications.statsTypes")}</p>
                <p className="text-sm font-bold text-blue-600">{statistics.by_type.length}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 w-full">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 sm:flex-none">
            <TabsList className="grid w-full sm:w-[300px] grid-cols-3">
              <TabsTrigger value="all"    className="text-xs">{t("company.companyHeader.notifications.tabAll")}</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">{t("company.companyHeader.notifications.tabUnread")} ({unreadCount})</TabsTrigger>
              <TabsTrigger value="read"   className="text-xs">{t("company.companyHeader.notifications.tabRead")}</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[130px] sm:w-[150px] h-8 text-xs flex-shrink-0">
              <SelectValue placeholder={t("company.companyHeader.notifications.filterPlaceholder")} />
            </SelectTrigger>
            <SelectContent className="z-[99999]">
              <SelectItem value="all"      className="text-xs">{t("worker.workerHeader.notifications.filterAll")}</SelectItem>
              <SelectItem value="incident" className="text-xs">{t("worker.workerHeader.notifications.filterIncidents")}</SelectItem>
              <SelectItem value="payment"  className="text-xs">{t("worker.workerHeader.notifications.filterPayments")}</SelectItem>
              <SelectItem value="system"   className="text-xs">{t("worker.workerHeader.notifications.filterSystem")}</SelectItem>
              <SelectItem value="hired"    className="text-xs">{t("worker.workerHeader.notifications.filterHiring")}</SelectItem>
              <SelectItem value="rated"    className="text-xs">{t("worker.workerHeader.notifications.filterRatings")}</SelectItem>
              <SelectItem value="job"      className="text-xs">{t("worker.workerHeader.notifications.filterJobs")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[50vh] sm:h-[400px] border rounded-lg">
          {isLoading || isChangingTab ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="p-3 bg-muted/50 rounded-full mb-3">
                <Bell className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold mb-1">{t("worker.workerHeader.notifications.emptyTitle")}</h3>
              <p className="text-[10px] text-muted-foreground">{getEmptyMessage()}</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className="p-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 30}ms` }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg ${!notification.is_read ? 'bg-primary/10' : 'bg-muted'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge 
                              variant={getNotificationBadgeVariant(notification.type)} 
                              className="text-[8px] px-1 py-0"
                            >
                              {getBadgeLabel(notification.type)}
                            </Badge>
                            {!notification.is_read && (
                              <span className="text-[8px] text-yellow-600 bg-yellow-50 px-1 py-0 rounded">
                                {t("worker.workerHeader.notifications.newLabel")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-[8px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => handleDelete(e, notification.id)}
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const WorkerHeader = ({ activeTab, onTabChange }: WorkerHeaderProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isFreelancer = user?.worker?.registration_type === "freelance";
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // navItems defined inside component so labels are reactive to language changes
  const navItems = [
    { id: "dashboard"  as TabType, label: t("tabs.dashboard"),  icon: DashboardIcon },
    { id: "schedule"   as TabType, label: t("tabs.schedule"),   icon: ScheduleIcon },
    { id: "payments"   as TabType, label: t("tabs.payments"),   icon: PaymentsIcon },
    { id: "agents" as TabType, label: "Agent Wallet", icon: AgentIcon },
    { id: "incidents" as TabType, label: "Incidents", icon: IncidentIcon },
    { id: "schedules"  as TabType, label: "Salary Schedules",   icon: SalaryScheduleIcon },  // ADD
    { id: "profile"    as TabType, label: t("tabs.profile") ?? "Profile",  icon: ProfileIcon },
  ];

  const visibleNavItems = navItems;

  const searchResults = searchQuery.trim()
    ? visibleNavItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : visibleNavItems;

  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [singleNotificationModalOpen, setSingleNotificationModalOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);

  // Notification hooks
  const { data: unreadCountData } = useUnreadCount();
  const { data: notificationsData, isLoading: isLoadingNotifications } = useNotifications({ 
    per_page: 5,
    filter: 'unread'
  });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const unreadCount = unreadCountData?.data?.unread_count || 0;
  const notifications = notificationsData?.data || [];
  const hasNotifications = notifications.length > 0;

  const getBadgeLabel = (type: string) => {
    if (type.includes('incident'))  return t("worker.workerHeader.notifications.badgeAlert");
    if (type.includes('payment'))   return t("worker.workerHeader.notifications.badgePayment");
    if (type.includes('system'))    return t("worker.workerHeader.notifications.badgeSystem");
    if (type.includes('registered'))return t("worker.workerHeader.notifications.badgeNew");
    if (type.includes('hired'))     return t("worker.workerHeader.notifications.badgeHired");
    if (type.includes('rated'))     return t("worker.workerHeader.notifications.badgeRating");
    if (type.includes('job') || type.includes('assignment')) return t("worker.workerHeader.notifications.badgeJob");
    return t("worker.workerHeader.notifications.badgeInfo");
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'W';
  };

  // Load active tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem(WORKER_ACTIVE_TAB_KEY);
    if (savedTab && savedTab !== activeTab) {
      onTabChange(savedTab as TabType);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(WORKER_ACTIVE_TAB_KEY);
    logout();
  };

  const handleTabChange = (tab: TabType) => {
    onTabChange(tab);
    localStorage.setItem(WORKER_ACTIVE_TAB_KEY, tab);
  };

  const handleMobileTabChange = (tab: TabType) => {
    handleTabChange(tab);
    setMobileMenuOpen(false);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setSelectedNotificationId(notification.id);
    setSingleNotificationModalOpen(true);
  };

  const handleViewAllNotifications = () => {
    setNotificationsModalOpen(true);
  };

  const handleDeleteNotification = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const handleSingleNotificationClose = () => {
    setSingleNotificationModalOpen(false);
    setSelectedNotificationId(null);
  };

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center w-full">
        <div className="flex items-center justify-between w-full h-full overflow-hidden">
          {/* Left Section: Logo + Navigation */}
          <div className="flex items-center h-full flex-1 min-w-0">
            {/* Logo - takes sidebar width on desktop */}
            <div className="hidden lg:flex items-center justify-center w-72 flex-shrink-0 px-4 h-full">
              <img src={logo} alt="BENO" className="h-8 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 px-4 md:px-6 h-full overflow-x-auto flex-1 min-w-0 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all duration-200 group flex-shrink-0",
                      activeTab === item.id
                        ? "text-[#208b3a]"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon />
                    <span className="text-[11px] font-medium whitespace-nowrap">{item.label}</span>
                    
                    {activeTab === item.id && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] bg-[#208b3a] w-[120%] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile: Logo & Menu */}
            <div className="flex lg:hidden items-center gap-3 px-4">
              <img src={logo} alt="BENO" className="h-7 w-auto" />
              
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="py-6 px-4">
                    <h2 className="text-base font-semibold mb-4">
                      {t("worker.workerHeader.navigation")}
                    </h2>
                    <nav className="space-y-1">
                      {visibleNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleMobileTabChange(item.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                              activeTab === item.id
                                ? "bg-[#208b3a] text-white"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                          >
                            <Icon />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Right Section: Search + Notifications + Profile */}
          <div className="flex items-center gap-3 px-4 md:px-6 flex-shrink-0">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("common.searchPages")}
                className="pl-9 pr-4 h-9 w-64 rounded-md border-input bg-background"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              />
              {searchOpen && (
                <div className="absolute top-full mt-1 left-0 w-full bg-popover border border-border rounded-lg shadow-md z-50 overflow-hidden">
                  {searchResults.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-3 py-2">{t("common.noResults")}</p>
                  ) : (
                    searchResults.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent transition-colors text-left"
                          onMouseDown={() => {
                            handleTabChange(item.id);
                            setSearchQuery("");
                            setSearchOpen(false);
                          }}
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center font-semibold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-96 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
                sideOffset={8}
              >
                <DropdownMenuLabel className="text-xs font-semibold py-2.5 px-3 flex items-center justify-between">
                  <span>{t("notifications.title")}</span>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[10px] px-2"
                      onClick={() => markAllAsRead()}
                    >
                      <CheckCheck className="w-3 h-3 mr-1" />
                      {t("notifications.markAllRead")}
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {isLoadingNotifications ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    {t("common.loading")}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    {t("notifications.noNotifications")}
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="py-1">
                      {notifications.map((notification) => (
                        <div key={notification.id}>
                          <DropdownMenuItem 
                            className="mx-2 my-1 px-2.5 py-2.5 cursor-pointer focus:bg-accent rounded-md transition-colors"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex flex-col gap-1.5 w-full">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1">
                                  <Badge 
                                    variant={getNotificationBadgeVariant(notification.type)} 
                                    className="text-[9px] px-1.5 py-0.5"
                                  >
                                    {getBadgeLabel(notification.type)}
                                  </Badge>
                                  <span className="text-[11px] font-semibold line-clamp-1">
                                    {notification.title}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={(e) => handleDeleteNotification(e, notification.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-[10px] text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <span className="text-[9px] text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                {hasNotifications && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="mx-2 my-1 p-1.5 justify-center cursor-pointer rounded-md hover:bg-primary/10 transition-colors"
                      onClick={handleViewAllNotifications}
                    >
                      <span className="text-[11px] text-primary font-medium">
                        {t("notifications.viewAll")}
                      </span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-9 gap-2 px-2 hover:bg-accent rounded-lg"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={user?.avatar || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-52 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
                sideOffset={8}
              >
                <DropdownMenuLabel className="text-[11px] py-2.5 px-2.5">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.firstName || t("worker.workerHeader.defaultName")}
                    </p>
                    <p className="text-muted-foreground font-normal">
                      {user?.email || 'worker@test.rw'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <div className="py-1">
                  <DropdownMenuItem 
                    className="mx-2 my-1 text-[11px] cursor-pointer rounded-md transition-colors px-2.5 py-1.5"
                    onClick={() => handleTabChange("profile")}
                  >
                    <UserIcon className="w-3.5 h-3.5 mr-2" />
                    {t("worker.workerHeader.myProfile")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem 
                    className="mx-2 my-1 text-[11px] cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-md transition-colors px-2.5 py-1.5"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    {isLoggingOut ? t("auth.loggingOut") : t("auth.logout")}
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Notifications Modal */}
      <NotificationsModal 
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        onNotificationClick={(id) => {
          setSelectedNotificationId(id);
          setSingleNotificationModalOpen(true);
        }}
      />

      {/* Single Notification Modal */}
      <SingleNotificationModal 
        notificationId={selectedNotificationId}
        isOpen={singleNotificationModalOpen}
        onClose={handleSingleNotificationClose}
      />
    </>
  );
};

export default WorkerHeader;