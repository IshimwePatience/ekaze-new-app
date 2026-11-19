import { 
  Bell, 
  LogOut, 
  User,
  Menu,
  Search as SearchIcon,
  X,
  CheckCheck,
  Eye,
  Calendar,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Wallet,
  Filter,
  Briefcase,
  Users
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
import { EmployerTabType } from "@/types/employer.types";
import type { NotificationItem } from "@/types/notification.types";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmployerHeaderProps {
  activeTab: EmployerTabType;
  onTabChange: (tab: EmployerTabType) => void;
}

const EMPLOYER_ACTIVE_TAB_KEY = 'employer_active_tab';

// SVG Icons
const OverviewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const SearchIcon2 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const ActiveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const VerifyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

const RequestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const IncidentsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const PaymentsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

const SchedulesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
  </svg>
);

const MapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
    <line x1="9" y1="3" x2="9" y2="18"></line>
    <line x1="15" y1="6" x2="15" y2="21"></line>
  </svg>
);

const AgentsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
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
    if (type.includes('overdue'))      return "Payment Overdue";
    if (type.includes('upcoming'))     return "Payday Reminder";
    if (type.includes('escalation'))   return "Agency Escalation";
    if (type.includes('admin'))        return "Admin Alert";
    if (type.includes('incident'))     return t("employer.employerHeader.notifications.badgeAlert");
    if (type.includes('payment'))      return t("employer.employerHeader.notifications.badgePayment");
    if (type.includes('system'))       return t("employer.employerHeader.notifications.badgeSystem");
    if (type.includes('registered'))   return t("employer.employerHeader.notifications.badgeNew");
    if (type.includes('hiring_request')) return t("employer.employerHeader.notifications.badgeRequest");
    if (type.includes('worker'))       return t("employer.employerHeader.notifications.badgeWorker");
    if (type.includes('approved'))     return t("employer.employerHeader.notifications.badgeApproved");
    if (type.includes('rejected'))     return t("employer.employerHeader.notifications.badgeRejected");
    return t("employer.employerHeader.notifications.badgeInfo");
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('overdue'))      return <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />;
    if (type.includes('upcoming'))     return <Wallet className="w-5 h-5 text-[#2478b8]" />;
    if (type.includes('incident'))     return <AlertTriangle className="w-5 h-5 text-destructive" />;
    if (type.includes('payment'))      return <Wallet className="w-5 h-5 text-green-600" />;
    if (type.includes('verified'))     return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
    if (type.includes('suspended'))    return <Ban className="w-5 h-5 text-orange-600" />;
    if (type.includes('hiring_request')) return <Briefcase className="w-5 h-5 text-purple-600" />;
    if (type.includes('worker'))       return <Users className="w-5 h-5 text-indigo-600" />;
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
                    <User className="w-3 h-3 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t("notifications.from")}</p>
                      <p className="text-xs font-medium">
                        {notification.creator?.name || t("employer.employerHeader.notifications.system")}
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

            {/* Action Button */}
            {/* {notification.data?.action_url && (
              <Button 
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => window.location.href = notification.data?.action_url || '#'}
              >
                <Eye className="w-3 h-3 mr-1" />
                View Related
              </Button>
            )} */}

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
    if (type.includes('overdue'))      return "Payment Overdue";
    if (type.includes('upcoming'))     return "Payday Reminder";
    if (type.includes('escalation'))   return "Agency Escalation";
    if (type.includes('admin'))        return "Admin Alert";
    if (type.includes('incident'))     return t("employer.employerHeader.notifications.badgeAlert");
    if (type.includes('payment'))      return t("employer.employerHeader.notifications.badgePayment");
    if (type.includes('system'))       return t("employer.employerHeader.notifications.badgeSystem");
    if (type.includes('registered'))   return t("employer.employerHeader.notifications.badgeNew");
    if (type.includes('hiring_request')) return t("employer.employerHeader.notifications.badgeRequest");
    if (type.includes('worker'))       return t("employer.employerHeader.notifications.badgeWorker");
    if (type.includes('approved'))     return t("employer.employerHeader.notifications.badgeApproved");
    if (type.includes('rejected'))     return t("employer.employerHeader.notifications.badgeRejected");
    return t("employer.employerHeader.notifications.badgeInfo");
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('overdue'))      return <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />;
    if (type.includes('upcoming'))     return <Wallet className="w-3.5 h-3.5 text-[#2478b8]" />;
    if (type.includes('incident'))     return <AlertTriangle className="w-3 h-3 text-destructive" />;
    if (type.includes('payment'))      return <Wallet className="w-3 h-3 text-green-600" />;
    if (type.includes('verified'))     return <CheckCircle2 className="w-3 h-3 text-blue-600" />;
    if (type.includes('suspended'))    return <Ban className="w-3 h-3 text-orange-600" />;
    if (type.includes('hiring_request')) return <Briefcase className="w-3 h-3 text-purple-600" />;
    if (type.includes('worker'))       return <Users className="w-3 h-3 text-indigo-600" />;
    return <Bell className="w-3 h-3 text-primary" />;
  };

  const getEmptyMessage = () => {
    if (activeTab === 'unread') return t("employer.employerHeader.notifications.noUnread");
    if (activeTab === 'read')   return t("employer.employerHeader.notifications.noRead");
    return t("employer.employerHeader.notifications.noNotifications");
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
                <p className="text-[10px] text-muted-foreground">{t("employer.employerHeader.notifications.statsTotal")}</p>
                <p className="text-sm font-bold">{statistics.total}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-2">
                <p className="text-[10px] text-muted-foreground">{t("employer.employerHeader.notifications.statsUnread")}</p>
                <p className="text-sm font-bold text-yellow-600">{statistics.unread}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-2">
                <p className="text-[10px] text-muted-foreground">{t("employer.employerHeader.notifications.statsRead")}</p>
                <p className="text-sm font-bold text-green-600">{statistics.read}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-2">
                <p className="text-[10px] text-muted-foreground">{t("employer.employerHeader.notifications.statsTypes")}</p>
                <p className="text-sm font-bold text-blue-600">{statistics.by_type.length}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-[300px] grid-cols-3">
              <TabsTrigger value="all"    className="text-xs">{t("employer.employerHeader.notifications.tabAll")}</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">{t("employer.employerHeader.notifications.tabUnread")} ({unreadCount})</TabsTrigger>
              <TabsTrigger value="read"   className="text-xs">{t("employer.employerHeader.notifications.tabRead")}</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder={t("employer.employerHeader.notifications.filterPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all"           className="text-xs">{t("employer.employerHeader.notifications.filterAll")}</SelectItem>
              <SelectItem value="incident"      className="text-xs">{t("employer.employerHeader.notifications.filterIncidents")}</SelectItem>
              <SelectItem value="payment"       className="text-xs">{t("employer.employerHeader.notifications.filterPayments")}</SelectItem>
              <SelectItem value="system"        className="text-xs">{t("employer.employerHeader.notifications.filterSystem")}</SelectItem>
              <SelectItem value="hiring_request"className="text-xs">{t("employer.employerHeader.notifications.filterHiringRequests")}</SelectItem>
              <SelectItem value="worker"        className="text-xs">{t("employer.employerHeader.notifications.filterWorkers")}</SelectItem>
              <SelectItem value="approved"      className="text-xs">{t("employer.employerHeader.notifications.filterApproved")}</SelectItem>
              <SelectItem value="rejected"      className="text-xs">{t("employer.employerHeader.notifications.filterRejected")}</SelectItem>
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
              <h3 className="text-sm font-semibold mb-1">{t("employer.employerHeader.notifications.emptyTitle")}</h3>
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
                                {t("employer.employerHeader.notifications.newLabel")}
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

const EmployerHeader = ({ activeTab, onTabChange }: EmployerHeaderProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // navItems defined inside component so labels are reactive to language changes
  const navItems = [
    { id: "overview"  as EmployerTabType, label: t("tabs.overview"),      icon: OverviewIcon },
    { id: "search"    as EmployerTabType, label: t("tabs.findWorkers"),   icon: SearchIcon2 },
    { id: "active"    as EmployerTabType, label: t("tabs.activeWorkers"), icon: ActiveIcon },
    { id: "verify"    as EmployerTabType, label: t("tabs.verify"),        icon: VerifyIcon },
    { id: "incidents" as EmployerTabType, label: t("tabs.incidents"),     icon: IncidentsIcon },
    { id: "payments"  as EmployerTabType, label: t("tabs.payments"),      icon: PaymentsIcon },
    { id: "schedules"  as EmployerTabType, label: "Salary Schedules",   icon: SchedulesIcon },
    { id: "map" as EmployerTabType, label: "Worker Map", icon: MapIcon },
    { id: "agents" as EmployerTabType, label: "Agents", icon: AgentsIcon },
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

  const getBadgeLabel = (type: string) => {
    if (type.includes('incident'))     return t("employer.employerHeader.notifications.badgeAlert");
    if (type.includes('payment'))      return t("employer.employerHeader.notifications.badgePayment");
    if (type.includes('system'))       return t("employer.employerHeader.notifications.badgeSystem");
    if (type.includes('registered'))   return t("employer.employerHeader.notifications.badgeNew");
    if (type.includes('hiring_request')) return t("employer.employerHeader.notifications.badgeRequest");
    if (type.includes('worker'))       return t("employer.employerHeader.notifications.badgeWorker");
    if (type.includes('approved'))     return t("employer.employerHeader.notifications.badgeApproved");
    if (type.includes('rejected'))     return t("employer.employerHeader.notifications.badgeRejected");
    return t("employer.employerHeader.notifications.badgeInfo");
  };

  useEffect(() => {
    const savedTab = localStorage.getItem(EMPLOYER_ACTIVE_TAB_KEY);
    if (savedTab && savedTab !== activeTab) {
      onTabChange(savedTab as EmployerTabType);
    }
  }, []);

useEffect(() => {
    const handleSwitchToActive = () => {
      handleTabChange("active");
    };
    const handleNavigate = (e: Event) => {
      const tab = (e as CustomEvent<string>).detail;
      handleTabChange(tab as EmployerTabType);
    };
    window.addEventListener("employer-switch-to-active", handleSwitchToActive);
    window.addEventListener("employer-navigate", handleNavigate);
    return () => {
      window.removeEventListener("employer-switch-to-active", handleSwitchToActive);
      window.removeEventListener("employer-navigate", handleNavigate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(EMPLOYER_ACTIVE_TAB_KEY);
    logout();
  };

  const handleTabChange = (tab: EmployerTabType) => {
    onTabChange(tab);
    localStorage.setItem(EMPLOYER_ACTIVE_TAB_KEY, tab);
  };

  const handleMobileTabChange = (tab: EmployerTabType) => {
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
                      {t("employer.employerHeader.navigation")}
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

          <div className="flex items-center gap-3 px-4 md:px-6 flex-shrink-0">
            <div className="relative hidden md:block">
              {/* <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("common.searchPages")}
                className="pl-9 pr-4 h-9 w-32 rounded-md border-input bg-background"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              /> */}
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

                {/* Only show View All button if there are notifications */}
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 hover:bg-accent rounded-lg"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
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
                        : user?.firstName || t("employer.employerHeader.defaultName")}
                    </p>
                    <p className="text-muted-foreground font-normal">
                      {user?.email || 'employer@test.rw'}
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
                    {t("auth.employerProfile")}
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

export default EmployerHeader;