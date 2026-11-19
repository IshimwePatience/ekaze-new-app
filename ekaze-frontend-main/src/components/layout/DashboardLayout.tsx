import { useState, useEffect, ReactNode } from "react";
import { DashboardNavbar } from "./DashboardNavbar";
import { DashboardSidebar } from "./DashboardSidebar";
import { AskEkazeRightSidebar } from "./AskEkazeRightSidebar";
import DashboardTopAlertBanner from "./DashboardTopAlertBanner";
import { useAuth } from "@/hooks/useAuth";
import { useSocketNotifications } from "@/hooks/useSocketNotifications";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  role?: string;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export const DashboardLayout = ({
  role = "admin",
  activeTab,
  onTabChange,
  children,
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  // Listen for real-time notifications via WebSocket
  useSocketNotifications();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(() => {
    return localStorage.getItem("ekaze_ai_sidebar_open") === "true";
  });

  const { user } = useAuth();

  useEffect(() => {
    if (user && !user.mfa_enabled) {
      const skipped = sessionStorage.getItem("mfa_prompt_skipped");
      if (!skipped) {
        const timer = setTimeout(() => {
          navigate("/mfa-setup");
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [user, navigate]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleAiSidebar = () => {
    setIsAiSidebarOpen((prev) => {
      const nextState = !prev;
      localStorage.setItem("ekaze_ai_sidebar_open", String(nextState));
      return nextState;
    });
  };

  const handleCloseAiSidebar = () => {
    setIsAiSidebarOpen(false);
    localStorage.setItem("ekaze_ai_sidebar_open", "false");
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white text-slate-800 flex font-sans selection:bg-[#2478b8]/20 dashboard-app-layout">
      {/* Full-Height Left Navigation Sidebar (Extends to top-0) */}
      <DashboardSidebar
        role={role}
        activeTab={activeTab}
        onTabChange={onTabChange}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Center Column: Top Navbar + Page Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-white">
        {/* Top Rotating Alert Ticker (30s interval for shift requests & payment countdowns) */}
        <DashboardTopAlertBanner role={role} onTabChange={onTabChange} />

        {/* Top Navbar */}
        <DashboardNavbar
          onToggleSidebar={toggleSidebar}
          onToggleAiSidebar={toggleAiSidebar}
          isAiSidebarOpen={isAiSidebarOpen}
          currentRole={role}
        />

        {/* Content Row Under Navbar */}
        <div className="flex-1 flex min-w-0 overflow-hidden bg-white relative">
          {/* Main View Area (Pushed to left with horizontal & vertical scroll for tables/content) */}
          <main className={`flex-1 min-w-0 h-full overflow-y-auto overflow-x-auto bg-white transition-all duration-300 ${
            activeTab === "profile" || activeTab === "schedule" || activeTab === "calendar"
              ? ""
              : activeTab === "overview" || activeTab === "dashboard"
              ? "p-4 md:p-6 lg:p-8"
              : "px-4 md:px-6 lg:px-8 pt-1 md:pt-2 pb-8"
          }`}>
            <div className="w-full min-w-0">
              {children}
            </div>
          </main>

          {/* Docked YouTube Studio Style Right AI Sidebar (Standing side-by-side on right) */}
          {isAiSidebarOpen && (
            <div className="w-full sm:w-[410px] shrink-0 h-full p-2.5 pl-0 bg-white z-30 transition-all duration-300 animate-in slide-in-from-right border-l border-slate-100 flex flex-col overflow-hidden">
              <AskEkazeRightSidebar
                isOpen={isAiSidebarOpen}
                onClose={handleCloseAiSidebar}
                isDocked={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
