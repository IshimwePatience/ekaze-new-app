import { useState, useEffect, ReactNode } from "react";
import { DashboardNavbar } from "./DashboardNavbar";
import { DashboardSidebar } from "./DashboardSidebar";
import { AskEkazeRightSidebar } from "./AskEkazeRightSidebar";
import DashboardTopAlertBanner from "./DashboardTopAlertBanner";
import { SetInitialPasswordModal } from "@/components/common/SetInitialPasswordModal";
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
        const [showPasswordModal, setShowPasswordModal] = useState(Boolean(user?.must_change_password));

  useEffect(() => {
    setShowPasswordModal(Boolean(user?.must_change_password));
  }, [user?.must_change_password]);

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

  const [showPasswordModal, setShowPasswordModal] = useState(Boolean(user?.must_change_password));

  useEffect(() => {
    setShowPasswordModal(Boolean(user?.must_change_password));
  }, [user?.must_change_password]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f8fafd] text-slate-800 flex flex-col font-sans selection:bg-[#c2e7ff] dashboard-app-layout select-none">
      {/* Top Google Drive Navbar across the top */}
      <DashboardNavbar
        onToggleSidebar={toggleSidebar}
        onToggleAiSidebar={toggleAiSidebar}
        isAiSidebarOpen={isAiSidebarOpen}
        currentRole={role}
      />

      {/* Main Layout Row: Sidebar + White Content Card + Right Rail */}
      <div className="flex-1 flex min-w-0 overflow-hidden relative">
        {/* Left Google Drive Sidebar */}
        <DashboardSidebar
          role={role}
          activeTab={activeTab}
          onTabChange={onTabChange}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        {/* Center: Inset White Rounded Card Container (Material You Drive Design) */}
        <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-64px)] bg-white rounded-2xl shadow-[0_1px_3px_0_rgba(60,64,67,0.08)] border border-slate-200/60 my-1.5 mr-2 overflow-hidden transition-all">
          {/* Top Rotating Alert Ticker */}
          <DashboardTopAlertBanner role={role} onTabChange={onTabChange} />

          {/* Main View Area */}
          <main
            className={`flex-1 min-w-0 h-full overflow-y-auto overflow-x-auto bg-white transition-all duration-300 ${
              activeTab === "profile" || activeTab === "schedule" || activeTab === "calendar"
                ? ""
                : activeTab === "overview" || activeTab === "dashboard"
                ? "p-4 md:p-6 lg:p-8"
                : "px-4 md:px-6 lg:px-8 pt-2 pb-8"
            }`}
          >
            <div className="w-full min-w-0">{children}</div>
          </main>
        </div>

        {/* Docked Right AI Sidebar when toggled */}
        {isAiSidebarOpen && (
          <div className="w-full sm:w-[410px] shrink-0 h-[calc(100vh-64px)] my-1.5 mr-2 bg-white rounded-2xl shadow-sm border border-slate-200/60 z-30 transition-all duration-300 animate-in slide-in-from-right flex flex-col overflow-hidden">
            <AskEkazeRightSidebar
              isOpen={isAiSidebarOpen}
              onClose={handleCloseAiSidebar}
              isDocked={true}
            />
          </div>
        )}
      </div>

      {/* Force Set Initial Permanent Password Modal if temporary password was used */}
      <SetInitialPasswordModal
        isOpen={showPasswordModal}
        onSuccess={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default DashboardLayout;
