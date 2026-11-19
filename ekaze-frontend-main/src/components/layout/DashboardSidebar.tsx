import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Menu,
  HelpCircle,
} from "lucide-react";
import {
  ConsoleGridIcon,
  ConsoleSlidersIcon,
  ConsoleBarChartIcon,
  ConsoleClockIcon,
  ConsoleBillingIcon,
  ConsoleShieldUserIcon,
  ConsoleCartIcon,
  ConsoleApiIcon,
  ConsoleSparkleIcon,
  ConsoleCpuIcon,
  ConsoleBuildingIcon,
  ConsoleUserCheckIcon,
  ConsoleUsersIcon,
  ConsoleLayersIcon,
  ConsoleAlertIcon,
  ConsoleBriefcaseIcon,
  ConsoleFileTextIcon,
  ConsoleCalendarIcon
} from "@/components/ui/ConsoleSidebarIcons";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, useCurrentUser } from "@/hooks/useAuth";
import logo from "@/assets/reallogo.png";

export interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  subItems?: Array<{ id: string; label: string }>;
}

export interface SidebarGroup {
  category: string;
  items: SidebarItem[];
}

interface DashboardSidebarProps {
  role?: string;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
}

export const DashboardSidebar = ({
  role = "admin",
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
}: DashboardSidebarProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { data: currentUserData } = useCurrentUser();
  const user = currentUserData?.data?.user || currentUserData?.user || authUser || {};

  const workerPrefs = (user as any)?.worker?.work_type_preferences
    || (user as any)?.work_type_preferences
    || (user as any)?.workerProfile?.work_type_preferences
    || [];
  const isPartialWorker = (Array.isArray(workerPrefs) && workerPrefs.some((p: string) => {
    const s = String(p).toLowerCase();
    return s.includes("part_time") || s.includes("partial") || s.includes("part-time");
  })) || (typeof workerPrefs === "string" && (
    workerPrefs.toLowerCase().includes("part_time") ||
    workerPrefs.toLowerCase().includes("partial") ||
    workerPrefs.toLowerCase().includes("part-time")
  ));

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({ overview: true });

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Build role-specific menu groups matching Google Cloud Console categories
  const getRoleMenuGroups = (): SidebarGroup[] => {
    switch (role.toLowerCase()) {
      case "employer":
        return [
          {
            category: "OVERVIEW",
            items: [
              {
                id: "overview",
                label: "Dashboard",
                icon: ConsoleGridIcon,
              },
            ],
          },
          {
            category: "WORKFORCE",
            items: [
              { id: "active", label: "Workers", icon: ConsoleUserCheckIcon },
            ],
          },
          {
            category: "FINANCE & SAFETY",
            items: [
              { id: "payments", label: "Payments & Ledger", icon: ConsoleBillingIcon },
              { id: "incidents", label: "Incident Reports", icon: ConsoleAlertIcon },
              { id: "calendar", label: "Worker Calendar", icon: ConsoleCalendarIcon },
            ],
          },
          {
            category: "ACCOUNT",
            items: [
              { id: "profile", label: "Employer Settings", icon: ConsoleSlidersIcon },
            ],
          },
        ];

      case "worker":
        return [
          {
            category: "OVERVIEW",
            items: [
              {
                id: "dashboard",
                label: "Dashboard",
                icon: ConsoleGridIcon,
              },
              {
                id: "wallet",
                label: "My Wallet",
                icon: ConsoleBillingIcon,
              },
              {
                id: "work-history",
                label: "Work History",
                icon: ConsoleBriefcaseIcon,
              },
              {
                id: "incidents",
                label: "Incident Reports",
                icon: ConsoleAlertIcon,
              },
            ],
          },
          {
            category: "CALENDAR & PROFILE",
            items: [
              {
                id: "schedule",
                label: "Calendar",
                icon: ConsoleCalendarIcon,
              },
              { id: "profile", label: "My Profile", icon: ConsoleSlidersIcon },
            ],
          },
        ];

      case "company":
        return [
          {
            category: "OVERVIEW",
            items: [
              { id: "overview", label: "Company Overview", icon: ConsoleGridIcon },
            ],
          },
          {
            category: "WORKFORCE MANAGEMENT",
            items: [
              { id: "workers", label: "Registered Drivers", icon: ConsoleUserCheckIcon },
            ],
          },
          {
            category: "FINANCIALS & SAFETY",
            items: [
              { id: "revenue", label: "Revenue & Earnings", icon: ConsoleBillingIcon },
              { id: "incidents", label: "Incident Management", icon: ConsoleAlertIcon },
            ],
          },
          {
            category: "CONFIGURE",
            items: [
              { id: "profile", label: "Company Profile", icon: ConsoleFileTextIcon },
            ],
          },
        ];

      case "police":
        return [
          {
            category: "OVERVIEW",
            items: [
              { id: "overview", label: "Inspectorate Overview", icon: ConsoleGridIcon },
            ],
          },
          {
            category: "SAFETY & DETECT",
            items: [
              { id: "incidents", label: "Incident Reports", icon: ConsoleAlertIcon },
              { id: "statistics", label: "Crime Statistics", icon: ConsoleBarChartIcon },
            ],
          },
          {
            category: "ACCOUNT",
            items: [
              { id: "profile", label: "Officer Profile", icon: ConsoleSlidersIcon },
            ],
          },
        ];

      case "supervisor":
        return [
          {
            category: "OVERVIEW",
            items: [
              { id: "overview", label: "Supervisor Overview", icon: ConsoleGridIcon },
            ],
          },
          {
            category: "DISTRICT JURISDICTION",
            items: [
              { id: "incidents", label: "District Incidents", icon: ConsoleAlertIcon },
              { id: "workforce", label: "District Workforce", icon: ConsoleUsersIcon },
            ],
          },
          {
            category: "ACCOUNT",
            items: [
              { id: "profile", label: "Supervisor Settings", icon: ConsoleSlidersIcon },
            ],
          },
        ];

      // Default: Admin Menu Groups
      default:
        return [
          {
            category: "OVERVIEW",
            items: [
              {
                id: "overview",
                label: "Dashboard",
                icon: ConsoleGridIcon,
              },
            ],
          },
          {
            category: "WORKFORCE & USERS",
            items: [
              { id: "companies", label: "Companies & Employers", icon: ConsoleBuildingIcon },
              { id: "users", label: "User Access & Roles", icon: ConsoleUsersIcon },
            ],
          },
          {
            category: "DETECT & MONITOR",
            items: [
              { id: "incidents", label: "Incident Reports", icon: ConsoleAlertIcon },
              { id: "payments", label: "Transactions & Revenue", icon: ConsoleBillingIcon },
              { id: "help-center", label: "Help & Feedback Center", icon: HelpCircle },
            ],
          },
          {
            category: "CONFIGURE",
            items: [
              { id: "settings", label: "System Configurations", icon: ConsoleSlidersIcon },
            ],
          },
        ];
    }
  };

  const menuGroups = getRoleMenuGroups();

  return (
    <aside
      className={cn(
        "bg-[#353a43] text-white flex flex-col h-full transition-all duration-300 z-30 select-none shrink-0",
        isCollapsed ? "w-16" : "w-64 min-w-[256px]"
      )}
    >
      {/* Top Sidebar Header: Burger Menu + Logo */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-white/10 bg-[#353a43] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-white hover:bg-white/15 transition-colors cursor-pointer outline-none shrink-0"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5 stroke-[2.5] text-white" />
          </button>

          {!isCollapsed && (
            <a href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
              <img src={logo} alt="Ekaze" className="h-7 w-auto brightness-0 invert" />
            </a>
          )}
        </div>
      </div>

      {/* Navigation Links List */}
      <nav className="flex-1 py-1 px-0 space-y-0.5 overflow-y-auto">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-0.5">
            {/* Group Items */}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || item.subItems?.some((sub) => sub.id === activeTab);
              const isExpanded = expandedItems[item.id];

              return (
                <div key={item.id} className="w-full">
                  <div
                    onClick={() => {
                      onTabChange(item.id);
                      if (item.subItems) toggleExpand(item.id);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-none transition-all cursor-pointer group",
                      isActive
                        ? "bg-[#2f2f31] text-white"
                        : "text-white hover:bg-[#2f2f31]",
                      isCollapsed && "justify-center px-0 py-3.5"
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Icon
                        className="w-5 h-5 shrink-0 transition-all group-hover:scale-105 text-white"
                      />
                      {!isCollapsed && (
                        <span
                          style={{ fontFamily: '"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
                          className="truncate text-[14px] leading-[20px] tracking-normal transition-colors text-white font-normal"
                        >
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && item.subItems && (
                      <div className="flex items-center gap-1 shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-colors text-white" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 shrink-0 transition-colors text-white" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Accordion Sub-items */}
                  {!isCollapsed && item.subItems && isExpanded && (
                    <div className="w-full space-y-0.5 bg-[#2f2f31]">
                      {item.subItems.map((sub) => {
                        const isSubActive = activeTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => onTabChange(sub.id)}
                            style={{ fontFamily: '"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
                            className={cn(
                              "w-full text-left text-[14px] leading-[20px] tracking-normal py-2.5 pl-12 pr-4 rounded-none transition-colors cursor-pointer",
                              isSubActive
                                ? "bg-[#1d1e1f] text-white font-medium"
                                : "text-white hover:bg-[#1d1e1f] font-normal"
                            )}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

    </aside>
  );
};
