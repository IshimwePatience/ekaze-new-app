import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SupervisorLayout from "@/components/supervisor/SupervisorLayout";
import SupervisorStats from "@/components/supervisor/SupervisorStats";
import { SupervisorTabType } from "@/types/supervisor.types";
import SupervisorProfilePage from "@/components/supervisor/SupervisorProfile";
import IncidentManagement from "@/components/admin/IncidentManagement";
import { DistrictWorkforce } from "@/components/supervisor/DistrictWorkforce";

const SupervisorDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTab = (): SupervisorTabType => {
    const urlTab = searchParams.get("tab") as SupervisorTabType;
    if (urlTab) return urlTab;
    const localTab = localStorage.getItem("supervisor_active_tab") as SupervisorTabType;
    if (localTab) return localTab;
    return "overview";
  };

  const [activeTab, setActiveTab] = useState<SupervisorTabType>(getInitialTab);

  useEffect(() => {
    const urlTab = searchParams.get("tab") as SupervisorTabType;
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
      localStorage.setItem("supervisor_active_tab", urlTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: SupervisorTabType) => {
    setActiveTab(tab);
    localStorage.setItem("supervisor_active_tab", tab);
    setSearchParams({ tab }, { replace: true });
  };

  useEffect(() => {
    const handleNavigate = (e: any) => {
      const tab = e?.detail || localStorage.getItem("supervisor_active_tab");
      if (tab) {
        handleTabChange(tab as SupervisorTabType);
      }
    };
    window.addEventListener("supervisor-navigate", handleNavigate as EventListener);
    window.addEventListener("dashboard-navigate", handleNavigate as EventListener);
    return () => {
      window.removeEventListener("supervisor-navigate", handleNavigate as EventListener);
      window.removeEventListener("dashboard-navigate", handleNavigate as EventListener);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <SupervisorStats />;
      case "incidents":
        return <IncidentManagement />;
      case "workforce":
        return <DistrictWorkforce />;
      case "profile":
        return <SupervisorProfilePage />;
      default:
        return <SupervisorStats />;
    }
  };

  return (
    <SupervisorLayout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
    >
      {renderContent()}
    </SupervisorLayout>
  );
};

export default SupervisorDashboard;
