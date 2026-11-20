import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminStats from "@/components/admin/AdminStats";
import SystemSettings from "@/components/admin/SettingsManagement";
import CompanyVerification from "@/components/admin/CompanyManagement";
import WorkerManagement from "@/components/admin/WorkerManagement";
import IncidentManagement from "@/components/admin/IncidentManagement";
import PaymentManagement from "@/components/admin/TransactionManagement";
import UserRoleControls from "@/components/admin/UserManagement";
import PlatformAnalytics from "@/components/admin/PlatformAnalytics";
import AdminAgentAnalytics from "@/components/admin/AdminAgentAnalytics";
import AdminHelpCenter from "@/components/admin/AdminHelpCenter";

import UserProfile from "@/components/common/UserProfile";

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTab = () => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== "payments") return urlTab;
    const localTab = localStorage.getItem("admin_active_tab");
    if (localTab && localTab !== "payments") return localTab;
    return "overview";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
      localStorage.setItem("admin_active_tab", urlTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem("admin_active_tab", tab);
    setSearchParams({ tab }, { replace: true });
  };

  useEffect(() => {
    const sync = (e: any) => {
      const tab = e?.detail || localStorage.getItem("admin_active_tab");
      if (tab) {
        handleTabChange(tab);
      }
    };

    window.addEventListener("admin-tab-change", sync as EventListener);
    window.addEventListener("dashboard-navigate", sync as EventListener);
    return () => {
      window.removeEventListener("admin-tab-change", sync as EventListener);
      window.removeEventListener("dashboard-navigate", sync as EventListener);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminStats />;
      case "companies":
        return <CompanyVerification />;
      case "incidents":
        return <IncidentManagement />;
      case "payments":
        return <PaymentManagement />;
      case "agents":
        return <AdminAgentAnalytics />;
      case "users":
        return <UserRoleControls />;
      case "analytics":
        return <PlatformAnalytics />;
      case "settings":
        return <SystemSettings />;
      case "help-center":
        return <AdminHelpCenter />;
      case "profile":
        return <UserProfile />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <DashboardLayout
      role="admin"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default AdminDashboard;
