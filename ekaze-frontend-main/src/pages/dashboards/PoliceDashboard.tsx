import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PoliceLayout from "@/components/police/PoliceLayout";
import PoliceStats from "@/components/police/PoliceStats";
import PoliceStatistics from "@/components/police/PoliceStatistics";
import { PoliceTabType } from "@/types/police.types";
import IncidentManagement from "@/components/admin/IncidentManagement";
import PoliceProfilePage from "@/components/police/PoliceProfile";

const PoliceDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTab = (): PoliceTabType => {
    const urlTab = searchParams.get("tab") as PoliceTabType;
    if (urlTab) return urlTab;
    const localTab = localStorage.getItem("police_active_tab") as PoliceTabType;
    if (localTab) return localTab;
    return "overview";
  };

  const [activeTab, setActiveTab] = useState<PoliceTabType>(getInitialTab);

  useEffect(() => {
    const urlTab = searchParams.get("tab") as PoliceTabType;
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
      localStorage.setItem("police_active_tab", urlTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: PoliceTabType) => {
    setActiveTab(tab);
    localStorage.setItem("police_active_tab", tab);
    setSearchParams({ tab }, { replace: true });
  };

  useEffect(() => {
    const handleNavigate = (e: any) => {
      const tab = e?.detail || localStorage.getItem("police_active_tab");
      if (tab) {
        handleTabChange(tab as PoliceTabType);
      }
    };
    window.addEventListener("police-navigate", handleNavigate as EventListener);
    window.addEventListener("dashboard-navigate", handleNavigate as EventListener);
    return () => {
      window.removeEventListener("police-navigate", handleNavigate as EventListener);
      window.removeEventListener("dashboard-navigate", handleNavigate as EventListener);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <PoliceStats />;
      case "incidents":
        return <IncidentManagement />;
      case "statistics":
        return <PoliceStatistics />;
      case "profile":
        return <PoliceProfilePage />;
      default:
        return <PoliceStats />;
    }
  };

  return (
    <PoliceLayout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
    >
      {renderContent()}
    </PoliceLayout>
  );
};

export default PoliceDashboard;
