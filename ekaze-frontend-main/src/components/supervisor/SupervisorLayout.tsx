import { SupervisorTabType } from "@/types/supervisor.types";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface SupervisorLayoutProps {
  children: React.ReactNode;
  activeTab: SupervisorTabType;
  onTabChange: (tab: SupervisorTabType) => void;
}

const SupervisorLayout = ({ children, activeTab, onTabChange }: SupervisorLayoutProps) => {
  return (
    <DashboardLayout
      role="supervisor"
      activeTab={activeTab}
      onTabChange={(tab) => onTabChange(tab as SupervisorTabType)}
    >
      {children}
    </DashboardLayout>
  );
};

export default SupervisorLayout;