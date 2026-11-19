import { PoliceTabType } from "@/types/police.types";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface PoliceLayoutProps {
  children: React.ReactNode;
  activeTab: PoliceTabType;
  onTabChange: (tab: PoliceTabType) => void;
}

const PoliceLayout = ({ children, activeTab, onTabChange }: PoliceLayoutProps) => {
  return (
    <DashboardLayout
      role="police"
      activeTab={activeTab}
      onTabChange={(tab) => onTabChange(tab as PoliceTabType)}
    >
      {children}
    </DashboardLayout>
  );
};

export default PoliceLayout;