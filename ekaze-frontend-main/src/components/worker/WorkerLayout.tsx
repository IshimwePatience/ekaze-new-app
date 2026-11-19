import { ReactNode } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

type TabType = "dashboard" | "jobs" | "schedule" | "payments" | "incidents" | "agents" | "profile" | "experience" | "schedules"; 

interface WorkerLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  sidebar?: ReactNode;
}

const WorkerLayout = ({ children, activeTab, onTabChange }: WorkerLayoutProps) => {
  return (
    <DashboardLayout
      role="worker"
      activeTab={activeTab}
      onTabChange={(tab) => onTabChange(tab as TabType)}
    >
      {children}
    </DashboardLayout>
  );
};

export default WorkerLayout;