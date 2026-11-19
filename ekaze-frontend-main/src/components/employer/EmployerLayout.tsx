import { ReactNode } from "react";
import { EmployerTabType } from "@/types/employer.types";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface EmployerLayoutProps {
  children: React.ReactNode;
  activeTab: EmployerTabType;
  onTabChange: (tab: EmployerTabType) => void;
  sidebar?: ReactNode;
}

const EmployerLayout = ({ children, activeTab, onTabChange }: EmployerLayoutProps) => {
  return (
    <DashboardLayout
      role="employer"
      activeTab={activeTab}
      onTabChange={(tab) => onTabChange(tab as EmployerTabType)}
    >
      {children}
    </DashboardLayout>
  );
};

export default EmployerLayout;