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

  // Real platform role-specific menu groups for ALL users
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
              { id: "revenue", label: "Card Payments", icon: ConsoleBillingIcon },
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
              { id: "companies", label: "Companies", icon: ConsoleBuildingIcon },
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
        "bg-[#f8fafd] text-[#444746] flex flex-col h-full transition-all duration-300 z-30 select-none shrink-0 border-r-0",
        isCollapsed ? "w-16 px-1.5" : "w-64 min-w-[256px] px-3"
      )}
    >
      {/* Navigation Links List */}
      <nav className="flex-1 py-3 space-y-1 overflow-y-auto">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!isCollapsed && group.category && (
              <div className="px-4 pt-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {group.category}
              </div>
            )}

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
                      "w-full flex items-center justify-between rounded-full py-2.5 transition-all cursor-pointer group",
                      isActive
                        ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                        : "text-[#444746] hover:bg-[#e9eef6] hover:text-[#1f1f1f]",
                      isCollapsed ? "justify-center px-0 h-11 w-11 mx-auto" : "px-4"
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Icon
                        className={cn(
                          "w-5 h-5 shrink-0 transition-transform group-hover:scale-105",
                          isActive ? "text-[#001d35]" : "text-[#444746]"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate text-[14px] leading-snug">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && item.subItems && (
                      <div className="flex items-center gap-1 shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[#444746]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#444746]" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Accordion Sub-items */}
                  {!isCollapsed && item.subItems && isExpanded && (
                    <div className="w-full space-y-0.5 ml-4 pl-3 border-l border-slate-200/80 my-1">
                      {item.subItems.map((sub) => {
                        const isSubActive = activeTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => onTabChange(sub.id)}
                            className={cn(
                              "w-full text-left text-[13px] py-1.5 px-3 rounded-full transition-colors cursor-pointer",
                              isSubActive
                                ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                                : "text-[#444746] hover:bg-[#e9eef6] hover:text-[#1f1f1f] font-normal"
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

export default DashboardSidebar;
