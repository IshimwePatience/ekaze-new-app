import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  Home,
  UserCheck,
  AlertTriangle,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "@/assets/reallogo.png";
import favicon from "/favicon.png";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const ACTIVE_TAB_KEY = 'admin_active_tab';

const AdminSidebar = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}: AdminSidebarProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const menuItems = [
    {
      sectionKey: "admin.adminSidebar.sections.overview" as const,
      items: [
        { id: "overview", labelKey: "admin.adminSidebar.items.dashboard" as const, icon: LayoutDashboard },
      ]
    },
    {
      sectionKey: "admin.adminSidebar.sections.management" as const,
      items: [
        { id: "companies", labelKey: "admin.adminSidebar.items.companies" as const, icon: Building2 },
        { id: "workers", labelKey: "admin.adminSidebar.items.workers" as const, icon: UserCheck },
        { id: "incidents", labelKey: "admin.adminSidebar.items.incidents" as const, icon: AlertTriangle },
      ]
    },
    {
      sectionKey: "admin.adminSidebar.sections.operations" as const,
      items: [
        { id: "payments", labelKey: "admin.adminSidebar.items.payments" as const, icon: CreditCard },
        { id: "agents", labelKey: "Agents" as const, icon: Users },
        { id: "users", labelKey: "admin.adminSidebar.items.users" as const, icon: Users },
        { id: "map", labelKey: "Map" as const, icon: MapPin },
      ]
    },
    {
      sectionKey: "admin.adminSidebar.sections.system" as const,
      items: [
        { id: "analytics", labelKey: "admin.adminSidebar.items.analytics" as const, icon: BarChart3 },
        { id: "settings", labelKey: "admin.adminSidebar.items.settings" as const, icon: Settings },
      ]
    },
  ];

  // Load active tab from localStorage on mount
  // Load active tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem(ACTIVE_TAB_KEY);
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [setActiveTab]);

  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent<string>).detail;
      setActiveTab(tab);
    };
    window.addEventListener('admin-navigate', handler);
    return () => window.removeEventListener('admin-navigate', handler);
  }, [setActiveTab]);

  const handleMenuClick = (id: string) => {
    setActiveTab(id);
    localStorage.setItem(ACTIVE_TAB_KEY, id);
    setIsMobileOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className={cn(
        "p-4 border-b border-border flex-shrink-0 flex items-center",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <Link to="/" className="flex items-center gap-3">
          <img
            src={isCollapsed ? favicon : logo}
            alt="Ihirwe Pay"
            className={cn(
              "transition-all duration-300",
              isCollapsed ? "h-8 w-8" : "h-10 w-auto"
            )}
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-4 overflow-y-auto">
        <TooltipProvider delayDuration={0}>
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-2">
              {/* Section Separator Line */}
              {!isCollapsed && sectionIndex > 0 && (
                <div className="relative">
                  <div className="w-full border-t border-border/50 mb-2"></div>
                </div>
              )}

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const label = t(item.labelKey);

                  const buttonContent = (
                    <button
                      onClick={() => handleMenuClick(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 group",
                        "text-sm font-medium",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/80 hover:bg-accent/50 hover:text-foreground",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      <Icon className={cn(
                        "w-5 h-5 flex-shrink-0 transition-all duration-200",
                        isActive ? "text-primary-foreground" : "text-foreground/60"
                      )} />

                      {!isCollapsed && (
                        <span className="truncate text-left">{label}</span>
                      )}
                    </button>
                  );

                  return (
                    <div key={item.id}>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {buttonContent}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="font-medium">
                            {label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        buttonContent
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </TooltipProvider>
      </nav>

      {/* Footer - Fixed at Bottom */}
      <div className="p-4 border-t border-border flex-shrink-0 mt-auto">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full gap-3 px-4 py-3 transition-all duration-200 group rounded-lg",
                  "text-sm font-medium text-foreground/80 hover:bg-accent/50 hover:text-foreground",
                  isCollapsed ? "justify-center px-2" : "justify-start"
                )}
                onClick={() => {
                  localStorage.removeItem(ACTIVE_TAB_KEY);
                  navigate("/");
                }}
              >
                <Home className="w-5 h-5 flex-shrink-0 text-foreground/60" />
                {!isCollapsed && t("admin.adminSidebar.backToHome")}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="font-medium">
                {t("admin.adminSidebar.backToHome")}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col transition-all duration-300",
          "h-screen shadow-lg md:shadow-none",
          isCollapsed ? "md:w-16" : "md:w-64",
          isMobileOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:translate-x-0"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default AdminSidebar;