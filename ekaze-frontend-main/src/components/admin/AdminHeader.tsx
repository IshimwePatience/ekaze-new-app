import { Bell, Search, Shield, Menu, Settings, User, LogOut, X, CheckCheck, Eye, Calendar, Filter, AlertTriangle, Ban, CheckCircle2, Wallet, LayoutDashboard, Building2, CreditCard, Users, BarChart3, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { NotificationItem } from "@/types/notification.types";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminHeaderProps {
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  setIsMobileOpen?: (open: boolean) => void;
}

// Notification badge variant helper
const getNotificationBadgeVariant = (type: string): "destructive" | "secondary" | "default" => {
  if (type.includes('incident') || type.includes('suspended') || type.includes('rejected')) return "destructive";
  if (type.includes('approved') || type.includes('verified') || type.includes('payment_received')) return "default";
  return "secondary";
};

// ─── Single Notification Modal ────────────────────────────────────────────────
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
    if (notificationId && !notification?.is_read) markAsRead(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('incident')) return <AlertTriangle className="w-5 h-5 text-destructive" />;
    if (type.includes('payment'))  return <Wallet className="w-5 h-5 text-green-600" />;
    if (type.includes('verified')) return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
    if (type.includes('suspended'))return <Ban className="w-5 h-5 text-orange-600" />;
    return <Bell className="w-5 h-5 text-primary" />;
  };

  const getBadgeLabel = (type: string) => {
    if (type.includes('incident'))  return t("admin.adminHeader.notifications.badgeAlert");
    if (type.includes('payment'))   return t("admin.adminHeader.notifications.badgePayment");
    if (type.includes('system'))    return t("admin.adminHeader.notifications.badgeSystem");
    if (type.includes('registered'))return t("admin.adminHeader.notifications.badgeNew");
    return t("admin.adminHeader.notifications.badgeInfo");
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
                  <Badge variant={getNotificationBadgeVariant(notification.type)} className="text-[10px] px-2 py-0.5">
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
                        {notification.creator?.name || t("admin.adminHeader.notifications.system")}
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

            {/* Mark as read */}
            {!notification.is_read && (
              <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={handleMarkAsRead}>
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

// ─── Notifications Modal ──────────────────────────────────────────────────────
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
      const timer = setTimeout(() => setIsChangingTab(false), 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, isOpen]);

  const filteredNotifications = notifications.filter(n =>
    filterType === 'all' ? true : n.type.includes(filterType)
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value as typeof activeTab);
    refetch();
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.is_read) markAsRead(notification.id);
    onNotificationClick(notification.id);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('incident')) return <AlertTriangle className="w-3 h-3 text-destructive" />;
    if (type.includes('payment'))  return <Wallet className="w-3 h-3 text-green-600" />;
    if (type.includes('verified')) return <CheckCircle2 className="w-3 h-3 text-blue-600" />;
    if (type.includes('suspended'))return <Ban className="w-3 h-3 text-orange-600" />;
    return <Bell className="w-3 h-3 text-primary" />;
  };

  const getBadgeLabel = (type: string) => {
    if (type.includes('incident'))  return t("admin.adminHeader.notifications.badgeAlert");
    if (type.includes('payment'))   return t("admin.adminHeader.notifications.badgePayment");
    if (type.includes('system'))    return t("admin.adminHeader.notifications.badgeSystem");
    if (type.includes('registered'))return t("admin.adminHeader.notifications.badgeNew");
    return t("admin.adminHeader.notifications.badgeInfo");
  };

  const getEmptyMessage = () => {
    if (activeTab === 'unread') return t("admin.adminHeader.notifications.noUnread");
    if (activeTab === 'read')   return t("admin.adminHeader.notifications.noRead");
    return t("admin.adminHeader.notifications.noNotifications");
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
                <p className="text-[10px] text-muted-foreground">{t("admin.adminHeader.notifications.statsTotal")}</p>
                <p className="text-sm font-bold">{statistics.total}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-2">
                <p className="text-[10px] text-muted-foreground">{t("admin.adminHeader.notifications.statsUnread")}</p>
                <p className="text-sm font-bold text-yellow-600">{statistics.unread}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-2">
                <p className="text-[10px] text-muted-foreground">{t("admin.adminHeader.notifications.statsRead")}</p>
                <p className="text-sm font-bold text-green-600">{statistics.read}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-2">
                <p className="text-[10px] text-muted-foreground">{t("admin.adminHeader.notifications.statsTypes")}</p>
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
              <SelectItem value="all"        className="text-xs">{t("admin.adminHeader.notifications.filterAll")}</SelectItem>
              <SelectItem value="incident"   className="text-xs">{t("admin.adminHeader.notifications.filterIncidents")}</SelectItem>
              <SelectItem value="payment"    className="text-xs">{t("admin.adminHeader.notifications.filterPayments")}</SelectItem>
              <SelectItem value="system"     className="text-xs">{t("admin.adminHeader.notifications.filterSystem")}</SelectItem>
              <SelectItem value="registered" className="text-xs">{t("admin.adminHeader.notifications.filterRegistrations")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[50vh] sm:h-[400px] border rounded-lg">
          {isLoading || isChangingTab ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="p-3 bg-muted/50 rounded-full mb-3">
                <Bell className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold mb-1">{t("admin.adminHeader.notifications.emptyTitle")}</h3>
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
                            <Badge variant={getNotificationBadgeVariant(notification.type)} className="text-[8px] px-1 py-0">
                              {getBadgeLabel(notification.type)}
                            </Badge>
                            {!notification.is_read && (
                              <span className="text-[8px] text-yellow-600 bg-yellow-50 px-1 py-0 rounded">
                                {t("admin.adminHeader.notifications.newLabel")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold line-clamp-1">{notification.title}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
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

// ─── AdminHeader ──────────────────────────────────────────────────────────────
const AdminHeader = ({ isCollapsed, setIsCollapsed, setIsMobileOpen }: AdminHeaderProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const adminNavItems = [
    { id: "overview",  label: t("admin.adminSidebar.items.dashboard"),  icon: LayoutDashboard },
    { id: "companies", label: t("admin.adminSidebar.items.companies"),  icon: Building2 },
    { id: "workers",   label: t("admin.adminSidebar.items.workers"),    icon: UserCheck },
    { id: "incidents", label: t("admin.adminSidebar.items.incidents"),  icon: AlertTriangle },
    { id: "users",     label: t("admin.adminSidebar.items.users"),      icon: Users },
    { id: "analytics", label: t("admin.adminSidebar.items.analytics"),  icon: BarChart3 },
    { id: "settings",  label: t("admin.adminSidebar.items.settings"),   icon: Settings },
  ];

  const searchResults = searchQuery.trim()
    ? adminNavItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : adminNavItems;

  const handleSearchNavigate = (id: string) => {
    localStorage.setItem('admin_active_tab', id);
    window.dispatchEvent(new Event('admin-tab-change'));
    setSearchQuery('');
    setSearchOpen(false);
  };

  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [singleNotificationModalOpen, setSingleNotificationModalOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);

  const { data: unreadCountData } = useUnreadCount();
  const { data: notificationsData, isLoading: isLoadingNotifications } = useNotifications({ 
    per_page: 5, filter: 'unread'
  });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const unreadCount = unreadCountData?.data?.unread_count || 0;
  const notifications = notificationsData?.data || [];
  const hasNotifications = notifications.length > 0;

  const getBadgeLabel = (type: string) => {
    if (type.includes('incident'))  return t("admin.adminHeader.notifications.badgeAlert");
    if (type.includes('payment'))   return t("admin.adminHeader.notifications.badgePayment");
    if (type.includes('system'))    return t("admin.adminHeader.notifications.badgeSystem");
    if (type.includes('registered'))return t("admin.adminHeader.notifications.badgeNew");
    return t("admin.adminHeader.notifications.badgeInfo");
  };

  const handleLogout = () => logout();

  const handleProfile = () => {
    localStorage.setItem('admin_active_tab', 'settings');
    window.dispatchEvent(new Event('admin-tab-change'));
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.is_read) markAsRead(notification.id);
    setSelectedNotificationId(notification.id);
    setSingleNotificationModalOpen(true);
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
      <header className="h-14 md:h-16 bg-card border-b border-border flex items-center justify-between px-3 md:px-6 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 flex-1">
          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen?.(true)} className="md:hidden h-8 w-8">
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed?.(!isCollapsed)}
            className="hidden md:flex h-8 w-8 hover:bg-accent transition-colors"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Title */}
          <div>
            <h1 className="font-display font-semibold text-lg text-foreground">
              {t("admin.adminHeader.title")}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Search Bar */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("common.searchPages")}
              className="pl-9 pr-4 h-9 w-56 rounded-md border-input bg-background"
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
                        onMouseDown={() => handleSearchNavigate(item.id)}
                      >
                        <Icon className="w-5 h-5 text-muted-foreground" />
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
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-secondary-foreground text-[10px] rounded-full flex items-center justify-center font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-72 md:w-96 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
              sideOffset={8}
            >
              <DropdownMenuLabel className="text-sm font-semibold py-3 px-4 flex items-center justify-between">
                <span>{t("admin.adminHeader.notifications.dropdownTitle")}</span>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => markAllAsRead()}>
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
                          className="mx-2 my-1 px-3 py-3 cursor-pointer focus:bg-accent rounded-md transition-colors"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex flex-col gap-1.5 w-full">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <Badge variant={getNotificationBadgeVariant(notification.type)} className="text-[10px] px-1.5 py-0.5">
                                  {getBadgeLabel(notification.type)}
                                </Badge>
                                <span className="text-xs font-semibold line-clamp-1">{notification.title}</span>
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
                            <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                            <span className="text-[10px] text-muted-foreground">
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
                    className="mx-2 my-1 p-2 justify-center cursor-pointer rounded-md hover:bg-primary/10 transition-colors"
                    onClick={() => setNotificationsModalOpen(true)}
                  >
                    <span className="text-xs text-primary font-medium">
                      {t("notifications.viewAll")}
                    </span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Admin Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-2 hover:bg-accent">
                <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-secondary" />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-semibold leading-tight">
                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : t("admin.adminHeader.profile.defaultName")}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {user?.email || 'admin@beno.rw'}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
              sideOffset={8}
            >
              <DropdownMenuLabel className="text-xs py-3 px-3">
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">
                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : t("admin.adminHeader.profile.defaultName")}
                  </p>
                  <p className="text-muted-foreground font-normal">{user?.email || 'admin@beno.rw'}</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <div className="py-1">
                <DropdownMenuItem
                  className="mx-2 my-1 text-xs cursor-pointer rounded-md transition-colors px-3 py-2"
                  onClick={handleProfile}
                >
                  <User className="w-4 h-4 mr-2" />
                  {t("admin.adminHeader.profile.settings")}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  className="mx-2 my-1 text-xs cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-md transition-colors px-3 py-2"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isLoggingOut ? t("auth.loggingOut") : t("auth.logout")}
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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

export default AdminHeader;