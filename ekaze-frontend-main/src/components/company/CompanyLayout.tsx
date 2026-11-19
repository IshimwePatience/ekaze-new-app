import { ReactNode } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

type TabType = "overview" | "workers" | "requests" | "employers" | "incidents" | "revenue" | "profile" | "settings" | "companyAgents";

interface CompanyLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  sidebar?: ReactNode;
}

const CompanyLayout = ({ children, activeTab, onTabChange }: CompanyLayoutProps) => {
  return (
    <DashboardLayout
      role="company"
      activeTab={activeTab}
      onTabChange={(tab) => onTabChange(tab as TabType)}
    >
      {children}
    </DashboardLayout>
  );
};

export default CompanyLayout;