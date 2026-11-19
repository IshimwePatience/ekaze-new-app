import { 
  Bell, 
  LogOut, 
  UserCog,
  Menu,
  Search as SearchIcon,
  X,
  Check,
  Trash2,
  CheckCheck,
  Eye,
  Calendar,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Wallet,
  Filter,
  Users,
  TrendingUp,
  Settings,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { SupervisorTabType } from "@/types/supervisor.types";
import type { NotificationItem } from "@/types/notification.types";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface SupervisorHeaderProps {
  activeTab: SupervisorTabType;
  onTabChange: (tab: SupervisorTabType) => void;
}

const SUPERVISOR_ACTIVE_TAB_KEY = 'supervisor_active_tab';

// SVG Icons
const OverviewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const FinanceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 426.722 426.722" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <g>
      <g>
        <path d="M368.758,287.617c-21.18,1.309-49.047,22.476-75.924,34.649c-32.945,14.916-84.221,2.924-84.227,2.924 c7.911-3.712,40.055-11.369,46.529-14.208c34.411-15.146,31.491-46.688,15.103-46.423c-21.651,0.345-34.363,5.659-77.563,11.55 c-32.747,4.452-71.476,2.824-90.053,9.918c-26.224,10.016-68.456,77.409-68.456,77.409l65.301,63.285 c0,0,40.427-39.816,60.096-39.816c44.823,0,46.642-0.6,88.255-2.864c17.697-0.947,21.391-1.675,31.527-5.087 c53.943-18.242,111.875-66.819,112.938-72.662C394.748,292.757,379.947,286.941,368.758,287.617z" fill="currentColor"></path>
        <path d="M239.811,63.419c9.084-5.406,17.193-12.917,24.35-20.545c6.033-6.422,14.008-14.662,13.145-24.183 c-0.604-6.702-6.232-10.025-12.385-10.787c-1.979-0.248-3.969-0.312-5.967-0.283c-1.342,0.019-4.057-0.339-5.108,0.683 c-2.205,2.143-4.397,4.282-6.586,6.439c-0.47-1.463-0.929-2.929-1.394-4.413c-0.274-0.874-1.047-1.211-1.91-1.087 c-6.075,0.96-12.025,2.155-18.139,1.028c-7.507-1.385-14.895-3.486-22.312-5.223c-0.853-0.206-1.65,0.256-1.917,1.085 c-0.601,1.906-1.207,3.81-1.805,5.713c-2.621-2.594-5.255-5.158-7.9-7.73c-0.627-0.601-1.492-1.91-2.438-2.068 c-1.759-0.32-3.525-0.623-5.3-0.902c-2.766-0.431-5.544-0.753-8.336-0.97c-6.132-0.477-17.21-0.58-17.552,7.905 c-0.322,13.584,11.665,24.348,20.26,33.364c5.32,5.584,11.703,12.042,15.28,19.344c-37.986,12.278-70.376,58.399-70.376,108.015 c0,57.964,27.508,73.853,89.944,73.853c62.429,0,89.933-15.889,89.933-73.853C303.297,122.215,274.742,78.721,239.811,63.419z M239.783,177.332c-2.287,3.413-5.44,6.149-9.062,8.06c-1.91,0.986-3.917,1.771-5.97,2.378c-0.291,0.098-2.97,0.826-2.97,0.826 v7.489c0,3.484-0.666,7.175-3.787,9.245c-3.411,2.241-8.458,1.572-10.99-1.688c-1.855-2.38-1.961-5.511-1.961-8.401 c0-2.192,0-6.651,0-6.651s-1.709-0.519-2.075-0.612c-1.199-0.326-2.388-0.713-3.564-1.113c-0.697-0.246-1.379-0.504-2.069-0.775 c-0.494,0.331-1.013,0.634-1.547,0.899c-0.94,0.466-1.954,0.799-2.991,0.911c-4.103,0.388-7.709-2.053-8.775-6.011 c-0.668-2.516-0.479-5.211-0.479-7.803c0-2.581-0.196-5.305,0.479-7.841c1.134-4.183,4.997-6.56,9.256-5.954 c2.002,0.277,3.811,1.262,5.039,2.868c0.648,0.839,1.116,1.811,1.452,2.801c0.312,0.938,0.54,1.897,1.157,2.681 c1.217,1.532,3.426,2.325,5.212,2.896c2.373,0.767,4.868,1.144,7.36,1.144c3.994,0,8.934-0.856,11.828-3.886 c1.975-2.083,1.24-5.711-1.486-6.654c-2.598-0.881-4.812-1.328-7.344-1.791c-2.332-0.442-4.666-0.861-6.989-1.299 c-6.391-1.172-13.042-2.759-17.736-7.583c-6.001-6.15-7.173-15.882-2.713-23.269c2.193-3.631,5.48-6.573,9.261-8.482 c1.962-0.999,4.053-1.71,6.184-2.212c0.62-0.154,0.54-0.097,0.54-0.654c0-0.47,0-0.956,0-1.444c0-2.287-0.133-4.641,0.072-6.919 c0.345-4.042,2.537-7.679,6.807-8.375c4.174-0.662,8.068,1.586,9.291,5.665c0.762,2.526,0.568,5.257,0.568,7.879 c0,1.102,0,2.201,0,3.303c0,0.101,0,0.224,0,0.328c0,0.048,1.084,0.23,1.207,0.253c0.604,0.119,1.207,0.273,1.8,0.438 c0.487,0.128,1.294,0.584,1.694,0.261c3.438-2.789,8.961-2.683,11.879,0.784c2.176,2.611,2.121,6.77,2.121,9.979 c0,2.965,0.239,6.099-0.99,8.868c-1.742,3.902-6.379,5.55-10.303,4.101c-1.918-0.689-3.509-2.124-4.412-3.952 c-0.271-0.535-0.479-1.094-0.639-1.666c-0.072-0.26-0.139-0.524-0.195-0.788c-0.197-0.127-0.401-0.249-0.613-0.355 c-0.844-0.476-1.743-0.848-2.67-1.153c-2.168-0.686-4.447-0.903-6.708-0.87c-2.086,0.028-4.213,0.204-6.206,0.815 c-2.503,0.771-6.816,3.8-3.409,6.253c2.032,1.48,4.964,1.889,7.35,2.361c2.124,0.405,4.243,0.83,6.368,1.236 c6.312,1.244,13.182,2.531,18.23,6.815c-3.438-2.91,4.596,3.847,0,0C244.05,157.175,245.365,168.973,239.783,177.332z" fill="currentColor"></path>
      </g>
    </g>
  </svg>
);

const SystemIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
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
    if (type.includes('incident'))   return t("supervisor.supervisorHeader.notifications.badgeAlert");
    if (type.includes('payment'))    return t("supervisor.supervisorHeader.notifications.badgePayment");
    if (type.includes('system'))     return t("supervisor.supervisorHeader.notifications.badgeSystem");
    if (type.includes('registered')) return t("supervisor.supervisorHeader.notifications.badgeNew");
    if (type.includes('company'))    return t("supervisor.supervisorHeader.notifications.badgeCompany");
    if (type.includes('worker'))     return t("supervisor.supervisorHeader.notifications.badgeWorker");
    if (type.includes('employer'))   return t("supervisor.supervisorHeader.notifications.badgeEmployer");
    return t("supervisor.supervisorHeader.notifications.badgeInfo");
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('incident'))  return <AlertTriangle className="w-5 h-5 text-destructive" />;
    if (type.includes('payment'))   return <Wallet className="w-5 h-5 text-green-600" />;
    if (type.includes('verified'))  return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
    if (type.includes('suspended')) return <Ban className="w-5 h-5 text-orange-600" />;
    if (type.includes('company'))   return <Users className="w-5 h-5 text-purple-600" />;
    if (type.includes('system'))    return <Settings className="w-5 h-5 text-gray-600" />;
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
                    <UserCog className="w-3 h-3 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t("notifications.from")}</p>
                      <p className="text-xs font-medium">
                        {notification.creator?.name || t("supervisor.supervisorHeader.notifications.system")}
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
    if (type.includes('incident'))   return t("supervisor.supervisorHeader.notifications.badgeAlert");
    if (type.includes('payment'))    return t("supervisor.supervisorHeader.notifications.badgePayment");
    if (type.includes('system'))     return t("supervisor.supervisorHeader.notifications.badgeSystem");
    if (type.includes('registered')) return t("supervisor.supervisorHeader.notifications.badgeNew");
    if (type.includes('company'))    return t("supervisor.supervisorHeader.notifications.badgeCompany");
    if (type.includes('worker'))     return t("supervisor.supervisorHeader.notifications.badgeWorker");
    if (type.includes('employer'))   return t("supervisor.supervisorHeader.notifications.badgeEmployer");
    return t("supervisor.supervisorHeader.notifications.badgeInfo");
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('incident'))  return <AlertTriangle className="w-3 h-3 text-destructive" />;
    if (type.includes('payment'))   return <Wallet className="w-3 h-3 text-green-600" />;
    if (type.includes('verified'))  return <CheckCircle2 className="w-3 h-3 text-blue-600" />;
    if (type.includes('suspended')) return <Ban className="w-3 h-3 text-orange-600" />;
    if (type.includes('company'))   return <Users className="w-3 h-3 text-purple-600" />;
    if (type.includes('system'))    return <Settings className="w-3 h-3 text-gray-600" />;
    return <Bell className="w-3 h-3 text-primary" />;
  };

  const getEmptyMessage = () => {
    if (activeTab === 'unread') return t("supervisor.supervisorHeader.notifications.noUnread");
    if (activeTab === 'read')   return t("supervisor.supervisorHeader.notifications.noRead");
    return t("supervisor.supervisorHeader.notifications.noNotifications");
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
                <p className="text-[10px] text-muted-foreground">{t("supervisor.supervisorHeader.notifications.statsTotal")}</p>
                <p className="text-sm font-bold">{statistics.total}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-2">
                <p className="text-[10px] text-muted-foreground">{t("supervisor.supervisorHeader.notifications.statsUnread")}</p>
                <p className="text-sm font-bold text-yellow-600">{statistics.unread}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-2">
                <p className="text-[10px] text-muted-foreground">{t("supervisor.supervisorHeader.notifications.statsRead")}</p>
                <p className="text-sm font-bold text-green-600">{statistics.read}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-2">
                <p className="text-[10px] text-muted-foreground">{t("supervisor.supervisorHeader.notifications.statsTypes")}</p>
                <p className="text-sm font-bold text-blue-600">{statistics.by_type.length}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 w-full">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 sm:flex-none">
            <TabsList className="grid w-full sm:w-[300px] grid-cols-3">
              <TabsTrigger value="all"    className="text-xs">{t("supervisor.supervisorHeader.notifications.tabAll")}</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">{t("supervisor.supervisorHeader.notifications.tabUnread")} ({unreadCount})</TabsTrigger>
              <TabsTrigger value="read"   className="text-xs">{t("supervisor.supervisorHeader.notifications.tabRead")}</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[130px] sm:w-[150px] h-8 text-xs flex-shrink-0">
              <SelectValue placeholder={t("supervisor.supervisorHeader.notifications.filterPlaceholder")} />
            </SelectTrigger>
            <SelectContent className="z-[99999]">
              <SelectItem value="all"        className="text-xs">{t("supervisor.supervisorHeader.notifications.filterAll")}</SelectItem>
              <SelectItem value="incident"   className="text-xs">{t("supervisor.supervisorHeader.notifications.filterIncidents")}</SelectItem>
              <SelectItem value="payment"    className="text-xs">{t("supervisor.supervisorHeader.notifications.filterPayments")}</SelectItem>
              <SelectItem value="system"     className="text-xs">{t("supervisor.supervisorHeader.notifications.filterSystem")}</SelectItem>
              <SelectItem value="company"    className="text-xs">{t("supervisor.supervisorHeader.notifications.filterCompanies")}</SelectItem>
              <SelectItem value="worker"     className="text-xs">{t("supervisor.supervisorHeader.notifications.filterWorkers")}</SelectItem>
              <SelectItem value="employer"   className="text-xs">{t("supervisor.supervisorHeader.notifications.filterEmployers")}</SelectItem>
              <SelectItem value="registered" className="text-xs">{t("supervisor.supervisorHeader.notifications.filterRegistrations")}</SelectItem>
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
              <h3 className="text-sm font-semibold mb-1">{t("supervisor.supervisorHeader.notifications.emptyTitle")}</h3>
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
                                {t("supervisor.supervisorHeader.notifications.newLabel")}
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

const SupervisorHeader = ({ activeTab, onTabChange }: SupervisorHeaderProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // navItems defined inside component so labels are reactive to language changes
  const navItems = [
    { id: "overview"   as SupervisorTabType, label: t("tabs.overview"),                              icon: OverviewIcon },
    { id: "users"      as SupervisorTabType, label: t("supervisor.supervisorHeader.totalUsers"),      icon: UsersIcon },
    { id: "finance"    as SupervisorTabType, label: t("supervisor.supervisorHeader.finance"),         icon: FinanceIcon },
    { id: "system"     as SupervisorTabType, label: t("supervisor.supervisorHeader.systemUsage"),     icon: SystemIcon },
    { id: "analytics"  as SupervisorTabType, label: "Analytics",                                     icon: TrendingUp },
  ];

  const searchResults = searchQuery.trim()
    ? navItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : navItems;

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

  useEffect(() => {
    const savedTab = localStorage.getItem(SUPERVISOR_ACTIVE_TAB_KEY);
    if (savedTab && savedTab !== activeTab) {
      onTabChange(savedTab as SupervisorTabType);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(SUPERVISOR_ACTIVE_TAB_KEY);
    logout();
  };

  const handleTabChange = (tab: SupervisorTabType) => {
    onTabChange(tab);
    localStorage.setItem(SUPERVISOR_ACTIVE_TAB_KEY, tab);
  };

  const handleMobileTabChange = (tab: SupervisorTabType) => {
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
        <div className="flex items-center justify-between w-full overflow-hidden">
          <div className="flex items-center h-full flex-1 min-w-0">
            <div className="hidden lg:flex items-center justify-center w-72 flex-shrink-0 px-4 h-full">
              <img src={logo} alt="BENO" className="h-8 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 px-4 md:px-6 h-full overflow-x-auto flex-1 min-w-0 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {navItems.map((item) => {
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
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] bg-[#208b3a] w-[150%] rounded-full" />
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
                      {t("supervisor.supervisorHeader.navigation")}
                    </h2>
                    <nav className="space-y-1">
                      {navItems.map((item) => {
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

          {/* Right Section */}
          <div className="flex items-center gap-3 px-4 md:px-6 flex-shrink-0">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                    {(() => {
                                      const type = notification.type;
                                      if (type.includes('incident'))   return t("supervisor.supervisorHeader.notifications.badgeAlert");
                                      if (type.includes('payment'))    return t("supervisor.supervisorHeader.notifications.badgePayment");
                                      if (type.includes('system'))     return t("supervisor.supervisorHeader.notifications.badgeSystem");
                                      if (type.includes('registered')) return t("supervisor.supervisorHeader.notifications.badgeNew");
                                      if (type.includes('company'))    return t("supervisor.supervisorHeader.notifications.badgeCompany");
                                      if (type.includes('worker'))     return t("supervisor.supervisorHeader.notifications.badgeWorker");
                                      if (type.includes('employer'))   return t("supervisor.supervisorHeader.notifications.badgeEmployer");
                                      return t("supervisor.supervisorHeader.notifications.badgeInfo");
                                    })()}
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

            {/* Supervisor Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-9 gap-2 px-2 hover:bg-accent rounded-lg"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UserCog className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold leading-tight">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : t("supervisor.supervisorHeader.defaultName")}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {t("supervisor.supervisorHeader.roleLabel")}
                    </p>
                  </div>
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
                        : t("supervisor.supervisorHeader.defaultName")}
                    </p>
                    <p className="text-muted-foreground font-normal">
                      {user?.email || 'supervisor@beno.rw'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <div className="py-1">
                  <DropdownMenuItem 
                    className="mx-2 my-1 text-[11px] cursor-pointer rounded-md transition-colors px-2.5 py-1.5"
                    onClick={() => handleTabChange("profile")}
                  >
                    <User className="w-3.5 h-3.5 mr-2" />
                    {t("supervisor.supervisorHeader.supervisorProfile")}
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

export default SupervisorHeader;