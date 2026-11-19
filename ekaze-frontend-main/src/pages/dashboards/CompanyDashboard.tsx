import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CompanyLayout from "@/components/company/CompanyLayout";
import CompanyStats from "@/components/company/CompanyStats";
import OverviewSidebar from "@/components/company/sidebars/OverviewSidebar";
import { TabType } from "@/types/company.types";
import WorkersContent from "@/components/company/WorkersContent";
import HiringRequests from "@/components/company/HiringRequests";
import Employers from "@/components/company/Employers";
import CompanyIncidents from "@/components/company/CompanyIncidents";
import CompanyTransactions from "@/components/company/CompanyTransactions";
import CompanyProfile from "@/components/company/CompanyProfile";
import CompanySettings from "@/components/company/CompanySettings";

const CompanyDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTab = (): TabType => {
    const urlTab = searchParams.get("tab") as TabType;
    if (urlTab) return urlTab;
    const localTab = localStorage.getItem("company_active_tab") as TabType;
    if (localTab) return localTab;
    return "overview";
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);

  useEffect(() => {
    const urlTab = searchParams.get("tab") as TabType;
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
      localStorage.setItem("company_active_tab", urlTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem("company_active_tab", tab);
    setSearchParams({ tab }, { replace: true });
  };

  useEffect(() => {
    const handleNavigate = (e: any) => {
      const tab = e?.detail || localStorage.getItem("company_active_tab");
      if (tab) {
        handleTabChange(tab as TabType);
      }
    };
    window.addEventListener("company-navigate", handleNavigate as EventListener);
    window.addEventListener("dashboard-navigate", handleNavigate as EventListener);
    return () => {
      window.removeEventListener("company-navigate", handleNavigate as EventListener);
      window.removeEventListener("dashboard-navigate", handleNavigate as EventListener);
    };
  }, []);

  const getSidebar = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewSidebar />;
      case "workers":
        return <OverviewSidebar />;
      case "requests":
        return <OverviewSidebar />;
      case "employers":
        return <OverviewSidebar />;
      case "incidents":
        return <OverviewSidebar />;
      case "revenue":
        return <OverviewSidebar />;
      case "profile":
        return <OverviewSidebar />;
      default:
        return <OverviewSidebar />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <CompanyStats />;
      case "workers":
        return <WorkersContent />;
      case "requests":
        return <HiringRequests />;
      case "employers":
        return <Employers />;
      case "incidents":
        return <CompanyIncidents />;
      case "revenue":
        return <CompanyTransactions />;
      case "profile":
        return <CompanyProfile />;
      case "settings":
        return <CompanySettings />;
      default:
        return <CompanyStats />;
    }
  };

  return (
    <CompanyLayout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      sidebar={getSidebar()}
    >
      {renderContent()}
    </CompanyLayout>
  );
};

export default CompanyDashboard;
