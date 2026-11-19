import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import WorkerLayout from "@/components/worker/WorkerLayout";
import WorkerStats from "@/components/worker/WorkerStats";
import WorkerOverviewSidebar from "@/components/company/sidebars/WorkerOverviewSidebar";
import WorkerProfile from "@/components/worker/WorkerProfile";
import WorkerSchedule from "@/components/worker/WorkerSchedule";
import WorkerPaymentSchedules from "@/components/worker/WorkerPaymentSchedules";
import WorkerIncidentManagement from "@/components/worker/WorkerIncidentManagement";
import WorkHistory from "@/components/worker/WorkHistory";
import Wallet from "@/components/worker/Wallet";
import { useAuth, useCurrentUser } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { AlertOctagon, ShieldAlert, PhoneCall, LogOut } from "lucide-react";

type TabType = "dashboard" | "work-history" | "wallet" | "jobs" | "schedule" | "incidents" | "profile" | "schedules";

const WorkerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: authUser, logout } = useAuth();
  const { data: currentUserData } = useCurrentUser();
  const user = currentUserData?.data?.user || currentUserData?.user || authUser || {};

  const isSuspended = 
    (user as any)?.status === "suspended" ||
    (user as any)?.is_suspended === true ||
    (user as any)?.worker?.is_suspended === true ||
    (user as any)?.worker?.availability_status === "suspended";

  const companyName = 
    (user as any)?.suspended_by_company ||
    (user as any)?.worker?.suspended_by_company ||
    (user as any)?.worker?.suspended_by_company_name ||
    (user as any)?.worker?.company?.company_name ||
    (user as any)?.company?.company_name ||
    "your company";

  const workerPrefs = (user as any)?.worker?.work_type_preferences
    || (user as any)?.work_type_preferences
    || (user as any)?.workerProfile?.work_type_preferences
    || [];
  const isPartialWorker = (Array.isArray(workerPrefs) && workerPrefs.some((p: string) => {
    const s = String(p).toLowerCase();
    return s.includes("part_time") || s.includes("partial") || s.includes("part-time");
  })) || (typeof workerPrefs === "string" && (
    workerPrefs.toLowerCase().includes("part_time") ||
    workerPrefs.toLowerCase().includes("partial") ||
    workerPrefs.toLowerCase().includes("part-time")
  ));

  const getInitialTab = (): TabType => {
    const urlTab = searchParams.get("tab") as TabType;
    if (urlTab && urlTab !== ("payments" as any) && urlTab !== ("experience" as any)) return urlTab;
    const localTab = localStorage.getItem("worker_active_tab") as TabType;
    if (localTab && localTab !== ("payments" as any) && localTab !== ("experience" as any)) return localTab;
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab === "payments" || urlTab === "experience") {
      setActiveTab("dashboard");
      localStorage.setItem("worker_active_tab", "dashboard");
      setSearchParams({ tab: "dashboard" }, { replace: true });
    } else if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab as TabType);
      localStorage.setItem("worker_active_tab", urlTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem("worker_active_tab", tab);
    setSearchParams({ tab }, { replace: true });
  };

  useEffect(() => {
    const handleNavigate = (e: any) => {
      const tab = e?.detail || localStorage.getItem("worker_active_tab");
      if (tab && tab !== "payments" && tab !== "experience") {
        handleTabChange(tab as TabType);
      }
    };
    window.addEventListener("worker-navigate", handleNavigate as EventListener);
    window.addEventListener("dashboard-navigate", handleNavigate as EventListener);
    return () => {
      window.removeEventListener("worker-navigate", handleNavigate as EventListener);
      window.removeEventListener("dashboard-navigate", handleNavigate as EventListener);
    };
  }, []);

  const getSidebar = () => {
    switch (activeTab) {
      case "dashboard":
      case "jobs":
      case "schedule":
      case "profile":
      default:
        return <WorkerOverviewSidebar />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <WorkerStats />;
      case "work-history":
        return <WorkHistory />;
      case "wallet":
        return <Wallet />;
      case "incidents":
        return <WorkerIncidentManagement />;
      case "profile":
        return <WorkerProfile />;
      case "schedule":
        return <WorkerSchedule />;
      case "schedules":
        return <WorkerPaymentSchedules />;
      default:
        return <WorkerStats />;
    }
  };

  if (isSuspended) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-xl p-8 text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Account Suspended</h2>
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-red-900 leading-relaxed">
              Your account is suspended by <span className="font-bold underline text-red-950">{companyName}</span>.
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pt-1">
              Your account has been placed on suspension by <span className="font-semibold text-slate-700">{companyName}</span>. You cannot access your dashboard or accept new work placements. Please contact <span className="font-semibold text-slate-700">{companyName}</span> administration to bring your account back to current.
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={() => logout()}
              variant="outline"
              className="w-full text-xs font-semibold text-slate-700 border-slate-300 hover:bg-slate-100 h-10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WorkerLayout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      sidebar={getSidebar()}
    >
      {renderContent()}
    </WorkerLayout>
  );
};

export default WorkerDashboard;
