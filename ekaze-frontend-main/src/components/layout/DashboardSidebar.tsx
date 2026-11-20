import { useState } from "react";
import {
  Home,
  Folder,
  HardDrive,
  Laptop,
  Users,
  Clock,
  Star,
  AlertOctagon,
  Trash2,
  Cloud,
  ChevronRight,
  ChevronDown,
  Upload,
  FolderPlus,
  FileText,
  Building,
  CreditCard,
  AlertTriangle,
  HelpCircle,
  Sliders,
  Calendar,
  Briefcase
} from "lucide-react";
import { GooglePlusIcon } from "./GoogleDriveIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, useCurrentUser } from "@/hooks/useAuth";

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
}: DashboardSidebarProps) => {
  const { t } = useLanguage();
  const { user: authUser } = useAuth();
  const { data: currentUserData } = useCurrentUser();
  const user = currentUserData?.data?.user || currentUserData?.user || authUser || {};

  const [isMyDriveExpanded, setIsMyDriveExpanded] = useState(true);
  const [isComputersExpanded, setIsComputersExpanded] = useState(false);

  // Get primary role navigation items
  const getRoleItems = () => {
    switch (role.toLowerCase()) {
      case "employer":
        return [
          { id: "active", label: "Workers", icon: Users },
          { id: "payments", label: "Payments & Ledger", icon: CreditCard },
          { id: "incidents", label: "Incident Reports", icon: AlertTriangle },
          { id: "calendar", label: "Worker Calendar", icon: Calendar },
          { id: "profile", label: "Employer Settings", icon: Sliders },
        ];
      case "worker":
        return [
          { id: "wallet", label: "My Wallet", icon: CreditCard },
          { id: "work-history", label: "Work History", icon: Briefcase },
          { id: "incidents", label: "Incident Reports", icon: AlertTriangle },
          { id: "schedule", label: "Calendar", icon: Calendar },
          { id: "profile", label: "My Profile", icon: Sliders },
        ];
      case "company":
        return [
          { id: "workers", label: "Registered Drivers", icon: Users },
          { id: "revenue", label: "Revenue & Earnings", icon: CreditCard },
          { id: "incidents", label: "Incident Management", icon: AlertTriangle },
          { id: "profile", label: "Company Profile", icon: Building },
        ];
      case "police":
        return [
          { id: "incidents", label: "Incident Reports", icon: AlertTriangle },
          { id: "statistics", label: "Crime Statistics", icon: FileText },
          { id: "profile", label: "Officer Profile", icon: Sliders },
        ];
      case "supervisor":
        return [
          { id: "incidents", label: "District Incidents", icon: AlertTriangle },
          { id: "workforce", label: "District Workforce", icon: Users },
          { id: "profile", label: "Supervisor Settings", icon: Sliders },
        ];
      default: // Admin
        return [
          { id: "companies", label: "Companies & Employers", icon: Building },
          { id: "users", label: "User Access & Roles", icon: Users },
          { id: "incidents", label: "Incident Reports", icon: AlertTriangle },
          { id: "payments", label: "Transactions & Revenue", icon: CreditCard },
          { id: "help-center", label: "Help & Feedback", icon: HelpCircle },
          { id: "settings", label: "System Configurations", icon: Sliders },
        ];
    }
  };

  const roleItems = getRoleItems();
  const isHomeActive = activeTab === "overview" || activeTab === "dashboard";

  return (
    <aside
      className={cn(
        "bg-[#f8fafd] flex flex-col h-full select-none shrink-0 transition-all duration-300 py-3 overflow-y-auto overflow-x-hidden",
        isCollapsed ? "w-16 px-2" : "w-64 min-w-[256px] px-3.5"
      )}
    >
      {/* "+ New" Floating Pill Button */}
      <div className="mb-4 pt-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] hover:shadow-[0_2px_6px_2px_rgba(60,64,67,0.3),0_8px_12px_6px_rgba(60,64,67,0.15)] transition-all flex items-center justify-center cursor-pointer outline-none hover:bg-slate-50/90 active:scale-98",
                isCollapsed ? "w-12 h-12 p-0 mx-auto" : "px-5 py-4 gap-3.5"
              )}
              title="New"
            >
              <GooglePlusIcon className="w-6 h-6 shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium text-[#1f1f1f] tracking-tight">
                  New
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-[110]">
            <DropdownMenuItem
              onClick={() => onTabChange("overview")}
              className="cursor-pointer py-2.5 px-3 hover:bg-slate-100 rounded-xl text-xs md:text-sm text-slate-800 font-medium flex items-center gap-3"
            >
              <FolderPlus className="w-4 h-4 text-slate-600" />
              <span>New folder</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onTabChange(roleItems[0]?.id || "overview")}
              className="cursor-pointer py-2.5 px-3 hover:bg-slate-100 rounded-xl text-xs md:text-sm text-slate-800 font-medium flex items-center gap-3"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>File upload</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 border-slate-100" />
            <DropdownMenuItem
              onClick={() => onTabChange(role === "admin" ? "users" : "incidents")}
              className="cursor-pointer py-2.5 px-3 hover:bg-slate-100 rounded-xl text-xs md:text-sm text-slate-800 font-medium flex items-center gap-3"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Create record</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        {/* Home */}
        <button
          onClick={() => onTabChange(role === "worker" ? "dashboard" : "overview")}
          className={cn(
            "w-full flex items-center gap-3.5 rounded-full py-2 transition-all cursor-pointer text-left text-sm",
            isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "px-4",
            isHomeActive
              ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
              : "text-[#444746] hover:bg-[#e9eef6] hover:text-[#1f1f1f] font-normal"
          )}
          title="Home"
        >
          <Home className={cn("w-5 h-5 shrink-0", isHomeActive ? "text-[#001d35] fill-current" : "text-[#444746]")} />
          {!isCollapsed && <span className="truncate">Home</span>}
        </button>

        {/* My Drive with Chevron toggle */}
        <div className="w-full">
          <div
            className={cn(
              "w-full flex items-center justify-between rounded-full py-2 transition-all cursor-pointer text-sm text-[#444746] hover:bg-[#e9eef6] hover:text-[#1f1f1f]",
              isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "px-4"
            )}
            onClick={() => setIsMyDriveExpanded(!isMyDriveExpanded)}
            title="My Drive"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <HardDrive className="w-5 h-5 shrink-0 text-[#444746]" />
              {!isCollapsed && <span className="truncate font-normal">My Drive</span>}
            </div>
            {!isCollapsed && (
              <span className="p-0.5 rounded-full hover:bg-black/5">
                {isMyDriveExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[#444746]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#444746]" />
                )}
              </span>
            )}
          </div>

          {/* Sub-items when My Drive is expanded */}
          {!isCollapsed && isMyDriveExpanded && (
            <div className="ml-5 pl-2 border-l border-slate-200/80 space-y-0.5 my-1">
              {roleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-full px-3 py-1.5 transition-all cursor-pointer text-left text-xs md:text-sm",
                      isActive
                        ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                        : "text-[#444746] hover:bg-[#e9eef6] hover:text-[#1f1f1f] font-normal"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Computers */}
        <div
          className={cn(
            "w-full flex items-center justify-between rounded-full py-2 transition-all cursor-pointer text-sm text-[#444746] hover:bg-[#e9eef6] hover:text-[#1f1f1f]",
            isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "px-4"
          )}
          onClick={() => setIsComputersExpanded(!isComputersExpanded)}
          title="Computers"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <Laptop className="w-5 h-5 shrink-0 text-[#444746]" />
            {!isCollapsed && <span className="truncate font-normal">Computers</span>}
          </div>
          {!isCollapsed && (
            <span className="p-0.5 rounded-full hover:bg-black/5">
              {isComputersExpanded ? (
                <ChevronDown className="w-4 h-4 text-[#444746]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#444746]" />
              )}
            </span>
          )}
        </div>

        {/* Shared with me */}
        <button
          onClick={() => onTabChange(role === "admin" ? "companies" : roleItems[0]?.id || "overview")}
          className={cn(
            "w-full flex items-center gap-3.5 rounded-full py-2 transition-all cursor-pointer text-left text-sm",
            isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "px-4",
            activeTab === "companies" || activeTab === "workers"
              ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
              : "text-[#444746] hover:bg-[#e9eef6] hover:text-[#1f1f1f] font-normal"
          )}
          title="Shared with me"
        >
          <Users className="w-5 h-5 shrink-0 text-[#444746]" />
          {!isCollapsed && <span className="truncate">Shared with me</span>}
        </button>

        {/* Recent */}
        <button
          onClick={() => onTabChange(role === "admin" ? "incidents" : "recent")}
          className={cn(
            "w-full flex items-center gap-3.5 rounded-full py-2 transition-all cursor-pointer text-left text-sm",
            isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "px-4",
            activeTab === "recent"
              ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
              : "text-[#444746] hover:bg-[#e9eef6] hover:text-[#1f1f1f] font-normal"
          )}
          title="Recent"
        >
          <Clock className="w-5 h-5 shrink-0 text-[#444746]" />
          {!isCollapsed && <span className="truncate">Recent</span>}
        </button>

        {/* Starred */}
        <button
          onClick={() => onTabChange("starred")}
          className={cn(
            "w-full flex items-center gap-3.5 rounded-full py-2 transition-all cursor-pointer text-left text-sm",
            isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "px-4",
            activeTab === "starred"
              ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
              : "text-[#444746] hover:bg-[#e9eef6] hover:text-[#1f1f1f] font-normal"
          )}
          title="Starred"
        >
          <Star className="w-5 h-5 shrink-0 text-[#444746]" />
          {!isCollapsed && <span className="truncate">Starred</span>}
        </button>

        <div className="my-2 border-t border-slate-200/80" />

        {/* Spam */}
        <button
          onClick={() => onTabChange("spam")}
          className={cn(
            "w-full flex items-center gap-3.5 rounded-full py-2 transition-all cursor-pointer text-left text-sm",
            isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "px-4",
            activeTab === "spam"
              ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
              : "text-[#444746] hover:bg-[#e9eef6] hover:text-[#1f1f1f] font-normal"
          )}
          title="Spam"
        >
          <AlertOctagon className="w-5 h-5 shrink-0 text-[#444746]" />
          {!isCollapsed && <span className="truncate">Spam</span>}
        </button>

        {/* Trash */}
        <button
          onClick={() => onTabChange("trash")}
          className={cn(
            "w-full flex items-center gap-3.5 rounded-full py-2 transition-all cursor-pointer text-left text-sm",
            isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "px-4",
            activeTab === "trash"
              ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
              : "text-[#444746] hover:bg-[#e9eef6] hover:text-[#1f1f1f] font-normal"
          )}
          title="Trash"
        >
          <Trash2 className="w-5 h-5 shrink-0 text-[#444746]" />
          {!isCollapsed && <span className="truncate">Trash</span>}
        </button>

        {/* Storage */}
        <button
          onClick={() => onTabChange("payments")}
          className={cn(
            "w-full flex items-center gap-3.5 rounded-full py-2 transition-all cursor-pointer text-left text-sm",
            isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "px-4",
            activeTab === "payments" || activeTab === "storage"
              ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
              : "text-[#444746] hover:bg-[#e9eef6] hover:text-[#1f1f1f] font-normal"
          )}
          title="Storage"
        >
          <Cloud className="w-5 h-5 shrink-0 text-[#444746]" />
          {!isCollapsed && <span className="truncate">Storage</span>}
        </button>
      </nav>

      {/* Storage Meter & CTA (Matching Picture 1) */}
      {!isCollapsed && (
        <div className="mt-auto pt-4 px-3 border-t border-slate-200/60">
          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-[#0b57d0] rounded-full w-[15%]" />
          </div>
          <p className="text-xs text-[#444746] font-normal select-none">
            12.6 MB of 15 GB used
          </p>

          <button
            onClick={() => onTabChange("payments")}
            className="mt-3.5 inline-flex items-center justify-center rounded-full border border-slate-400 text-xs font-semibold text-[#0b57d0] hover:bg-[#0b57d0]/10 px-4 py-1.5 transition-colors cursor-pointer"
          >
            Get more storage
          </button>
        </div>
      )}
    </aside>
  );
};

export default DashboardSidebar;
